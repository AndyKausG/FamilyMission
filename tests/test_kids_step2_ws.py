"""Integration tests for kids mode step 2: parent approval, penalties, birthday."""

from datetime import date, datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from homeassistant.components import persistent_notification
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.task_organizer import _async_handle_birthdays
from custom_components.task_organizer.const import DOMAIN

ANNA = "person.anna"          # no HA user
BEN = "person.ben"            # has HA user "user-ben"
BEN_ID = "user-ben"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)   # 11:00 local (US/Pacific)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


@pytest.fixture
async def setup(hass):
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    hass.states.async_set(BEN, "home", {"friendly_name": "Ben", "user_id": BEN_ID})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"overdue_days": 5})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()

_call.n = 5000


async def _make_kid(ws, pid=ANNA, pin="1234", **kw):
    kw.setdefault("birth_year", 2016)
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=pid, avatar="🦊",
                      color="#ff8800", pin=pin, **kw)
    assert res["success"], res
    return res


async def _add_task(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis"}
    payload.update(kw)
    res = await _call(ws, "task_organizer/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _kid_complete(ws, task_id, kid=ANNA, pin="1234"):
    return (await _call(ws, "task_organizer/kid_complete_task", task_id=task_id, kid_id=kid, pin=pin))["result"]


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _collect(hass, event):
    seen = []
    hass.bus.async_listen(event, lambda e: seen.append(e.data))
    return seen


# ---------------------------------------------------------------------------
# approval
# ---------------------------------------------------------------------------

async def test_task_flag_creates_pending_without_points(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    requested = _collect(hass, "task_organizer_approval_requested")
    task_id = await _add_task(ws, assignees=[ANNA], complexity=4, requires_approval=True, name="Tisch decken")

    res = await _kid_complete(ws, task_id)
    assert res["success"] and res["pending"] is True and res["points"] == 4.0
    data = _data(hass)
    assert data["points"].get(ANNA, 0) == 0 and data["history"] == []
    (pending,) = data["pending"].values()
    assert pending["task_id"] == task_id and pending["kid_id"] == ANNA and pending["points"] == 4.0
    assert pending["task_name"] == "Tisch decken" and pending["timestamp"]
    await hass.async_block_till_done()
    assert requested == [{"pending_id": pending["id"], "task_name": "Tisch decken",
                          "kid_id": ANNA, "kid_name": "Anna", "points": 4.0}]
    # the task was advanced: it cannot be completed twice
    assert (await _kid_complete(ws, task_id))["error"] == "not_eligible"
    # get_data exposes the pending list (no secrets)
    got = (await _call(ws, "task_organizer/get_data"))["result"]
    assert list(got["pending"]) == [pending["id"]] and "pin_hash" not in str(got)


async def test_requires_approval_field_roundtrip(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    t = await _add_task(ws)
    assert _data(hass)["tasks"][t]["requires_approval"] is False
    assert (await _call(ws, "task_organizer/edit_task", task_id=t, requires_approval=True))["success"]
    assert _data(hass)["tasks"][t]["requires_approval"] is True
    res = await _call(ws, "task_organizer/add_template", name="Tpl", complexity=3, icon="mdi:broom",
                      requires_approval=True)
    assert res["success"]
    await hass.services.async_call(DOMAIN, "add_task", {"template": "Tpl", "name": "FromTpl"}, blocking=True)
    created = next(x for x in _data(hass)["tasks"].values() if x["name"] == "FromTpl")
    assert created["requires_approval"] is True
    await hass.services.async_call(DOMAIN, "edit_task_by_name", {"task_name": "FromTpl", "requires_approval": False}, blocking=True)
    assert created["requires_approval"] is False
    tpl = next(x for x in _data(hass)["templates"].values() if x["name"] == "Tpl")
    assert (await _call(ws, "task_organizer/edit_template", template_id=tpl["id"], requires_approval=False))["success"]
    assert tpl["requires_approval"] is False


async def test_sample_rate_spot_checks(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws, approval_sample_rate=100)
    assert setup.options["kids"][ANNA]["approval_sample_rate"] == 100
    t1 = await _add_task(ws, assignees=[ANNA])
    assert (await _kid_complete(ws, t1))["pending"] is True

    await _make_kid(ws, approval_sample_rate=0)
    t2 = await _add_task(ws, assignees=[ANNA])
    with patch("random.random", return_value=0.0):          # 0 % never triggers, even for a 0.0 roll
        res = await _kid_complete(ws, t2)
    assert res["success"] and "pending" not in res
    assert _data(hass)["points"][ANNA] == 4.0

    await _make_kid(ws, approval_sample_rate=50)
    t3 = await _add_task(ws, assignees=[ANNA])
    with patch("random.random", return_value=0.49):
        assert (await _kid_complete(ws, t3))["pending"] is True
    t4 = await _add_task(ws, assignees=[ANNA])
    with patch("random.random", return_value=0.5):
        assert "pending" not in await _kid_complete(ws, t4)
    # rate is validated
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊", color="#ff8800",
                      birth_year=2016, approval_sample_rate=101)
    assert res["success"] is False


async def test_approve_awards_like_a_normal_completion(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    completed = _collect(hass, "task_organizer_task_completed")
    leaderboard = _collect(hass, "task_organizer_leaderboard_changed")
    _data(hass)["points"] = {BEN_ID: 2.0, ANNA: 0}              # Anna overtakes Ben -> leaderboard event
    normal = await _add_task(ws, assignees=[ANNA], complexity=4, name="Normal")
    flagged = await _add_task(ws, assignees=[ANNA], complexity=4, name="Flagged", requires_approval=True)

    await _kid_complete(ws, normal)
    ref_entry = dict(_data(hass)["history"][0])
    await hass.async_block_till_done()
    ref_event = completed[-1]
    ref_leaderboard = len(leaderboard)
    assert ref_leaderboard == 1

    # reset the points to compare the leaderboard event as well
    _data(hass)["points"] = {BEN_ID: 2.0, ANNA: 0}
    _data(hass)["history"].clear()
    await _kid_complete(ws, flagged)
    (pid,) = _data(hass)["pending"]
    assert (await _call(ws, "task_organizer/approve", pending_id=pid))["result"] == {"success": True, "points": 4.0}
    await hass.async_block_till_done()

    entry = _data(hass)["history"][0]
    assert set(entry) == set(ref_entry) and entry["type"] == "task"
    assert (entry["user_id"], entry["points"], entry["task_id"]) == (ANNA, 4.0, flagged)
    assert _data(hass)["points"][ANNA] == 4.0
    assert completed[-1] == {**ref_event, "task_id": flagged, "task_name": "Flagged"}
    assert len(leaderboard) == 2                                  # leaderboard event fired again
    assert _data(hass)["pending"] == {}
    # double approval (card + push) is harmless and awards nothing
    assert (await _call(ws, "task_organizer/approve", pending_id=pid))["result"] == {"success": False, "error": "not_found"}
    assert _data(hass)["points"][ANNA] == 4.0 and len(_data(hass)["history"]) == 1


async def test_reject_not_done_reopens_without_penalty(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    task_id = await _add_task(ws, assignees=[ANNA], requires_approval=True, interval=3)
    await _kid_complete(ws, task_id)
    task = _data(hass)["tasks"][task_id]
    assert dt_util.parse_datetime(task["due_date"]) > dt_util.utcnow() + timedelta(days=2)
    (pid,) = _data(hass)["pending"]
    assert (await _call(ws, "task_organizer/reject", pending_id=pid, mode="not_done"))["result"]["success"]
    assert dt_util.parse_datetime(task["due_date"]) <= dt_util.utcnow()      # due again, on the list
    data = _data(hass)
    assert data["pending"] == {} and data["points"].get(ANNA, 0) == 0 and data["history"] == []
    assert "strict_until" not in setup.options["kids"][ANNA]
    assert (await _call(ws, "task_organizer/reject", pending_id=pid, mode="not_done"))["result"]["success"] is False


async def test_reject_cheated_penalty_and_strict_mode(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    await _make_kid(ws)
    _data(hass)["points"][ANNA] = 10.0
    task_id = await _add_task(ws, assignees=[ANNA], complexity=4, requires_approval=True, name="Tisch decken")
    await _kid_complete(ws, task_id)
    (pid,) = _data(hass)["pending"]
    resolved = _collect(hass, "task_organizer_approval_resolved")

    assert (await _call(ws, "task_organizer/reject", pending_id=pid, mode="cheated"))["result"]["success"]
    data = _data(hass)
    assert data["points"][ANNA] == 6.0
    entry = data["history"][0]
    assert entry["type"] == "penalty" and entry["points"] == -4.0 and entry["user_id"] == ANNA
    assert entry["reason"] == "Geschummelt: Tisch decken" or entry["reason"] == "Cheated: Tisch decken"
    today = dt_util.now().date()
    assert setup.options["kids"][ANNA]["strict_until"] == (today + timedelta(days=7)).isoformat()
    await hass.async_block_till_done()
    assert resolved[-1]["result"] == "cheated" and resolved[-1]["penalty"] == 4

    # strict mode: even an unflagged task needs approval
    t2 = await _add_task(ws, assignees=[ANNA])
    assert (await _kid_complete(ws, t2))["pending"] is True
    # ... until the date has passed; then the sample rate (0) applies again
    freezer.move_to(NOON + timedelta(days=7))
    t3 = await _add_task(ws, assignees=[ANNA])
    res = await _kid_complete(ws, t3)
    assert res["success"] and "pending" not in res


async def test_cheat_settings_and_clamp_at_zero(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    await _call(ws, "task_organizer/update_settings", settings={"cheat_penalty_factor": 0.5, "cheat_strict_days": 0})
    await hass.async_block_till_done()
    _data(hass)["points"][ANNA] = 1.0
    task_id = await _add_task(ws, assignees=[ANNA], complexity=5, requires_approval=True)
    await _kid_complete(ws, task_id)
    (pid,) = _data(hass)["pending"]
    await _call(ws, "task_organizer/reject", pending_id=pid, mode="cheated")
    data = _data(hass)
    # 5 x 0.5 = 2.5 -> 3 (half up), but only 1 point was available
    assert data["points"][ANNA] == 0
    assert data["history"][0]["points"] == -1.0 and data["history"][0]["requested_points"] == -3
    assert "strict_until" not in setup.options["kids"][ANNA]       # 0 days = no strict mode


async def test_approval_commands_are_admin_only(hass, hass_ws_client, hass_read_only_access_token, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    task_id = await _add_task(ws, assignees=[ANNA], requires_approval=True)
    await _kid_complete(ws, task_id)
    (pid,) = _data(hass)["pending"]
    user_ws = await hass_ws_client(hass, hass_read_only_access_token)
    for type_, extra in (("approve", {}), ("reject", {"mode": "not_done"})):
        res = await _call(user_ws, f"task_organizer/{type_}", pending_id=pid, **extra)
        assert res["error"]["code"] == "unauthorized"
    res = await _call(user_ws, "task_organizer/adjust_points", kid_id=ANNA, points=5, reason="x")
    assert res["error"]["code"] == "unauthorized"
    assert pid in _data(hass)["pending"] and _data(hass)["points"].get(ANNA, 0) == 0


async def test_push_notification_actions(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    ids = []
    for name in ("A", "B", "C"):
        t = await _add_task(ws, assignees=[ANNA], name=name, requires_approval=True, complexity=3)
        await _kid_complete(ws, t)
    ids = {p["task_name"]: p["id"] for p in _data(hass)["pending"].values()}

    def fire(action):
        hass.bus.async_fire("mobile_app_notification_action", {"action": action})

    fire(f"TO_APPROVE_{ids['A']}")
    fire(f"TO_APPROVE_{ids['A']}")                      # duplicate tap
    fire("TO_APPROVE_does-not-exist")                   # unknown id
    fire("SOMETHING_ELSE")
    fire(None)
    await hass.async_block_till_done()
    assert _data(hass)["points"][ANNA] == 3.0 and len(_data(hass)["history"]) == 1

    fire(f"TO_NOTDONE_{ids['B']}")
    fire(f"TO_CHEAT_{ids['C']}")
    await hass.async_block_till_done()
    data = _data(hass)
    assert data["pending"] == {}
    assert data["points"][ANNA] == 0                    # 3 awarded - 3 penalty
    assert [h["type"] for h in data["history"]] == ["penalty", "task"]
    assert "strict_until" in setup.options["kids"][ANNA]


async def test_update_settings_cannot_touch_runtime_data(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    task_id = await _add_task(ws, assignees=[ANNA], requires_approval=True)
    await _kid_complete(ws, task_id)
    before = dict(_data(hass)["pending"])
    res = await _call(ws, "task_organizer/update_settings", settings={
        "pending": {}, "history": [{"id": "x"}], "points": {ANNA: 999}, "birthday_handled": {ANNA: "2020-01-01"},
        "kids": {ANNA: {"strict_until": "2000-01-01"}}, "cheat_strict_days": 3})
    assert res["success"]
    await hass.async_block_till_done()
    assert _data(hass)["pending"] == before and _data(hass)["history"] == []
    assert _data(hass)["points"].get(ANNA, 0) == 0 and _data(hass)["birthday_handled"] == {}
    for key in ("pending", "history", "points", "birthday_handled"):
        assert key not in setup.options
    assert setup.options["cheat_strict_days"] == 3 and "strict_until" not in setup.options["kids"][ANNA]
    # the import path is protected as well
    await _call(ws, "task_organizer/import_tasks", settings={"pending": {}, "history": [], "x": 1})
    assert "pending" not in setup.options and _data(hass)["pending"] == before


async def test_monthly_reset_keeps_pending(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _make_kid(ws)
    task_id = await _add_task(ws, assignees=[ANNA], requires_approval=True, complexity=3)
    await _kid_complete(ws, task_id)
    (pid,) = _data(hass)["pending"]
    await hass.services.async_call(DOMAIN, "reset_monthly_points", {}, blocking=True)
    assert pid in _data(hass)["pending"]
    # approved after the reset: the points count for the NEW period
    await _call(ws, "task_organizer/approve", pending_id=pid)
    assert _data(hass)["points"][ANNA] == 3.0
    got = (await _call(ws, "task_organizer/get_data"))["result"]
    assert got["family_points"] == 3.0 or got["family_points"] == 0.0   # kid profile exists -> counted
    assert got["family_points"] == 3.0


# ---------------------------------------------------------------------------
# penalties / manual adjustments
# ---------------------------------------------------------------------------

async def test_adjust_points_ws_and_service(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    res = await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=5, reason="Ungefragt geholfen")
    assert res["result"]["success"] and res["result"]["applied"] == 5
    entry = _data(hass)["history"][0]
    assert entry["type"] == "bonus" and entry["reason"] == "Ungefragt geholfen" and entry["points"] == 5
    assert _data(hass)["points"][ANNA] == 5

    res = await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=-8, reason="Absprache nicht eingehalten")
    assert res["result"]["applied"] == -5                    # clamped at 0
    assert _data(hass)["points"][ANNA] == 0
    entry = _data(hass)["history"][0]
    assert entry["type"] == "penalty" and entry["points"] == -5 and entry["requested_points"] == -8

    # validation
    for bad in (dict(points=0, reason="x"), dict(points=51, reason="x"), dict(points=-51, reason="x"),
                dict(points=3, reason=""), dict(points=3, reason="   "), dict(points=3, reason="x" * 81)):
        res = await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, **bad)
        assert res["success"] is False, bad
    res = await _call(ws, "task_organizer/adjust_points", kid_id="person.nobody", points=3, reason="x")
    assert res["error"]["code"] == "unknown_person"

    # service: person entity -> participant id (user id when linked)
    await hass.services.async_call(DOMAIN, "adjust_points",
                                   {"kid_id": BEN, "points": 3, "reason": "Danke"}, blocking=True)
    assert _data(hass)["points"][BEN_ID] == 3
    assert _data(hass)["history"][0]["user_id"] == BEN_ID

    # delete refunds a penalty
    penalty = next(h for h in _data(hass)["history"] if h["type"] == "penalty")
    await _call(ws, "task_organizer/delete_history_item", entry_id=penalty["id"])
    assert _data(hass)["points"][ANNA] == 5


async def test_adjust_points_service_rejects_non_admin_user(hass, hass_read_only_user, setup):
    from homeassistant.core import Context
    from homeassistant.exceptions import HomeAssistantError

    with pytest.raises(HomeAssistantError):
        await hass.services.async_call(
            DOMAIN, "adjust_points", {"kid_id": ANNA, "points": 3, "reason": "x"},
            blocking=True, context=Context(user_id=hass_read_only_user.id))
    assert _data(hass)["history"] == []


# ---------------------------------------------------------------------------
# family goal
# ---------------------------------------------------------------------------

async def test_family_points_count_only_approved_task_points(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    await _make_kid(ws, birthday="2016-10-29")
    t = await _add_task(ws, assignees=[ANNA], complexity=4)
    await _kid_complete(ws, t)
    await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=7, reason="Bonus")
    await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=-2, reason="Abzug")
    await _async_handle_birthdays(hass)                         # birthday bonus 10
    assert _data(hass)["points"][ANNA] == 4 + 7 - 2 + 10
    got = (await _call(ws, "task_organizer/get_data"))["result"]
    assert got["family_points"] == 4.0

    # entries from before the period do not count; legacy entries without type do
    _data(hass)["current_period_start"] = (dt_util.utcnow() + timedelta(days=1)).isoformat()
    assert (await _call(ws, "task_organizer/get_data"))["result"]["family_points"] == 0
    _data(hass)["current_period_start"] = (dt_util.utcnow() - timedelta(days=1)).isoformat()
    legacy = next(h for h in _data(hass)["history"] if h["type"] == "task")
    del legacy["type"]
    assert (await _call(ws, "task_organizer/get_data"))["result"]["family_points"] == 4.0
    # parents (no kid profile) never count
    await hass.services.async_call(DOMAIN, "complete_task_by_name", {"task_name": "Task", "user_id": BEN}, blocking=True)
    assert (await _call(ws, "task_organizer/get_data"))["result"]["family_points"] == 4.0


# ---------------------------------------------------------------------------
# birthday
# ---------------------------------------------------------------------------

async def test_set_kid_profile_birthday(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    await _make_kid(ws, birthday="2016-02-29", birth_year=1999)
    kid = setup.options["kids"][ANNA]
    assert kid["birthday"] == "2016-02-29" and kid["birth_year"] == 2016        # derived from the birthday
    pub = (await _call(ws, "task_organizer/get_data"))["result"]["settings"]["kids"][ANNA]
    assert pub["birthday"] == "2016-02-29" and "pin_hash" not in pub
    # year-only update keeps a matching birthday, a different year drops it
    await _make_kid(ws, pin="", birth_year=2016)
    assert setup.options["kids"][ANNA]["birthday"] == "2016-02-29"
    await _make_kid(ws, pin="", birth_year=2015)
    assert "birthday" not in setup.options["kids"][ANNA]
    await _make_kid(ws, pin="", birthday="2014-05-01")
    assert setup.options["kids"][ANNA]["birth_year"] == 2014
    await _make_kid(ws, pin="", birthday=None, birth_year=2014)
    assert "birthday" not in setup.options["kids"][ANNA]
    for bad in ("2016-13-40", "garbage", "2030-01-01", "20160101"):
        res = await _call(ws, "task_organizer/set_kid_profile", participant_id=ANNA, avatar="🦊",
                          color="#ff8800", birthday=bad)
        assert res["error"]["code"] == "invalid_birthday", bad


async def test_exact_age_in_eligibility(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)                                    # 2026-10-29
    t = await _add_task(ws, assignees=[ANNA], category="auftrag", min_age=10)
    await _make_kid(ws, birth_year=2016)                      # year only: counts as 10
    assert (await _kid_complete(ws, t))["success"]
    t2 = await _add_task(ws, assignees=[ANNA], category="auftrag", min_age=10)
    await _make_kid(ws, pin="", birthday="2016-10-30")       # birthday tomorrow: still 9
    assert (await _kid_complete(ws, t2))["error"] == "too_young"
    await _make_kid(ws, pin="", birthday="2016-10-29")       # today: 10
    assert (await _kid_complete(ws, t2))["success"]


async def test_birthday_flow(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    await _make_kid(ws, birthday="2016-10-29")
    await _make_kid(ws, BEN_ID, pin="", birthday="2014-03-01")
    events = _collect(hass, "task_organizer_kid_birthday")
    solo = await _add_task(ws, name="Solo", assignees=[ANNA], interval=2)
    shared = await _add_task(ws, name="Shared", assignees=[ANNA, BEN_ID])
    other = await _add_task(ws, name="Other kid", assignees=[BEN_ID])
    future = await _add_task(ws, name="Future", assignees=[ANNA],
                             custom_due_date=(dt_util.now() + timedelta(days=3)).isoformat())
    bonus = await _add_task(ws, name="Open bonus", assignees=[], category="bonus", interval=365)
    one_time = await _add_task(ws, name="One time", assignees=[ANNA], interval=0)
    unlock_task = await _add_task(ws, name="Rasen mähen", assignees=[], category="bonus", min_age=10)
    await _call(ws, "task_organizer/add_template", name="Auto waschen", complexity=3, icon="mdi:car",
                category="auftrag", min_age=10)
    tasks = _data(hass)["tasks"]
    future_due = tasks[future]["due_date"]

    await _async_handle_birthdays(hass)
    await hass.async_block_till_done()

    # duty-free: only Anna's own recurring basis tasks that were due
    assert dt_util.parse_datetime(tasks[solo]["due_date"]) > dt_util.utcnow() + timedelta(days=1)
    for tid in (shared, other, bonus, one_time):
        assert dt_util.parse_datetime(tasks[tid]["due_date"]) <= dt_util.utcnow(), tid
    assert tasks[future]["due_date"] == future_due
    assert one_time in tasks
    # bonus: one history entry of type birthday, no task history from the skip
    data = _data(hass)
    assert [h["type"] for h in data["history"]] == ["birthday"]
    assert data["history"][0]["points"] == 10 and data["points"][ANNA] == 10
    assert data["history"][0]["task_name"] in ("🎂 Geburtstags-Bonus", "🎂 Birthday bonus")
    assert data["points"].get(BEN_ID, 0) == 0
    assert data["birthday_handled"] == {ANNA: dt_util.now().date().isoformat()}
    # level-up
    info = data["birthday_levelup"][ANNA]
    names = [u["name"] for u in info["unlocked"]]
    assert info["age"] == 10 and info["skipped"] == 1
    assert "Rasen mähen" in names and "Auto waschen" in names
    assert any("Leergut" in n or "bottle" in n.lower() for n in names)         # catalog: min_age 10
    assert len(names) == len({n.lower() for n in names})
    assert len(events) == 1 and events[0]["kid_id"] == ANNA and events[0]["age"] == 10
    assert events[0]["name"] == "Anna" and "Rasen mähen" in events[0]["unlocked"]
    notes = persistent_notification._async_get_or_create_notifications(hass)
    assert any("Anna" in n["message"] and "10" in n["message"] for n in notes.values())

    # once per birthday: a second run (restart, timer) changes nothing
    due = tasks[solo]["due_date"]
    tasks[solo]["due_date"] = dt_util.utcnow().isoformat()
    await _async_handle_birthdays(hass)
    assert tasks[solo]["due_date"] != due and len(data["history"]) == 1 and len(events) == 1
    # kids card data
    got = (await _call(ws, "task_organizer/get_data"))["result"]
    assert got["birthday_levelup"][ANNA]["age"] == 10 and got["birthday_handled"][ANNA]

    # next day: the level-up info is gone, nothing new happens
    freezer.move_to(NOON + timedelta(days=1))
    await _async_handle_birthdays(hass)
    assert _data(hass)["birthday_levelup"] == {} and len(_data(hass)["history"]) == 1


async def test_birthday_settings_switch_features_off(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    await _make_kid(ws, birthday="2016-10-29")
    await _call(ws, "task_organizer/update_settings", settings={"birthday_bonus_points": 0, "birthday_duty_free": False})
    await hass.async_block_till_done()
    solo = await _add_task(ws, assignees=[ANNA])
    await _async_handle_birthdays(hass)
    assert _data(hass)["history"] == [] and _data(hass)["points"].get(ANNA, 0) == 0
    assert dt_util.parse_datetime(_data(hass)["tasks"][solo]["due_date"]) <= dt_util.utcnow()
    assert _data(hass)["birthday_levelup"][ANNA]["skipped"] == 0


async def test_no_birthday_without_birthday_date(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    await _make_kid(ws, birth_year=2016)
    await _async_handle_birthdays(hass)
    assert _data(hass)["history"] == [] and _data(hass)["birthday_handled"] == {}


async def test_birthday_runs_at_startup(hass, freezer):
    """A restart on the birthday handles it - once, with bonus and level-up info."""
    freezer.move_to(NOON)
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    kids = {ANNA: {"avatar": "🦊", "color": "#ff8800", "birth_year": 2016, "birthday": "2016-10-29"}}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"kids": kids})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert [h["type"] for h in _data(hass)["history"]] == ["birthday"]
    assert _data(hass)["points"][ANNA] == 10
    # the stored memory survives a restart: simulate with the saved data
    saved = _data(hass)
    assert saved["birthday_handled"][ANNA] == dt_util.now().date().isoformat()
    await _async_handle_birthdays(hass)
    assert len(_data(hass)["history"]) == 1


async def test_wizard_uses_exact_age(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    base = {"features": ["school"], "start_date": "2026-11-01", "phase": "start", "language": "de"}
    # turns 8 on 2026-12-01: still 7 at the start of the plan -> 5 minute blitz, not the 10 minute one
    res = await _call(ws, "task_organizer/wizard_preview",
                      kids=[{"id": ANNA, "birthday": "2018-12-01"}], **base)
    kid = res["result"]["kids"][0]
    assert kid["age"] == 7 and kid["birthday"] == "2018-12-01"
    assert any("5 Minuten" in t["name"] for t in kid["tasks"])
    res = await _call(ws, "task_organizer/wizard_preview",
                      kids=[{"id": ANNA, "birth_year": 2018}], **base)
    assert res["result"]["kids"][0]["age"] == 8                       # year fallback
    res = await _call(ws, "task_organizer/wizard_preview",
                      kids=[{"id": ANNA, "birthday": "2999-01-01"}], **base)
    assert res["error"]["code"] == "invalid_birthday"
    # apply stores the birthday and derives the birth year
    res = await _call(ws, "task_organizer/wizard_apply",
                      kids=[{"id": ANNA, "birthday": "2018-12-01"}], **base)
    assert res["success"], res
    assert setup.options["kids"][ANNA]["birthday"] == "2018-12-01"
    assert setup.options["kids"][ANNA]["birth_year"] == 2018


async def test_old_storage_without_new_keys(hass):
    """Old storage (no type/pending/requires_approval) keeps working."""
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    old = {
        "tasks": {"t1": {"id": "t1", "name": "Old", "interval": 1, "complexity": 2, "icon": "mdi:broom",
                         "assignees": [ANNA], "due_date": dt_util.utcnow().isoformat(), "subtasks": []}},
        "points": {ANNA: 7.0},
        "history": [{"id": "h1", "task_id": "t1", "task_name": "Old", "user_id": ANNA, "points": 7.0,
                     "timestamp": dt_util.utcnow().isoformat()}],
        "settings": {}, "monthly_history": {},
        "current_month": dt_util.now().strftime("%Y-%m"),
        "current_period_start": (dt_util.utcnow() - timedelta(days=1)).isoformat(), "templates": {},
    }
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"kids": {ANNA: {"avatar": "x", "color": "#fff000", "birth_year": 2016}}})
    entry.add_to_hass(hass)
    _fake_http(hass)
    with patch("homeassistant.helpers.storage.Store.async_load", return_value=old):
        assert await hass.config_entries.async_setup(entry.entry_id)
    data = _data(hass)
    assert data["pending"] == {} and data["tasks"]["t1"]["requires_approval"] is False
    from homeassistant.components.websocket_api import ActiveConnection  # noqa: F401
    assert data["points"][ANNA] == 7.0


# ---------------------------------------------------------------------------
# doing a task together (helpers)
# ---------------------------------------------------------------------------

CLARA = "person.clara"


async def _team(hass, ws, **task_kw):
    """Anna (PIN 1234), Ben (PIN 5555, has a user) and Clara (6 years, no PIN)."""
    hass.states.async_set(CLARA, "home", {"friendly_name": "Clara"})
    await _make_kid(ws)
    await _make_kid(ws, BEN_ID, pin="5555")
    await _make_kid(ws, CLARA, pin="", birth_year=2020)
    task_kw.setdefault("allow_together", True)
    return await _add_task(ws, complexity=5, **task_kw)


async def _together(ws, task_id, helpers, pin="1234"):
    res = await _call(ws, "task_organizer/kid_complete_task", task_id=task_id, kid_id=ANNA, pin=pin, helpers=helpers)
    return res["result"]


async def test_together_splits_points_and_adds_team_bonus(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws)
    res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "5555"}, {"kid_id": CLARA}])
    assert res == {"success": True, "points": 1.7, "task_name": "Task", "team_bonus": 1}
    points = _data(hass)["points"]
    assert points[ANNA] == points[BEN_ID] == points[CLARA] == 2.7          # 5 / 3 + 1 team bonus
    history = _data(hass)["history"]
    assert sorted(h["type"] for h in history) == ["bonus"] * 3 + ["task"] * 3
    bonus = [h for h in history if h["type"] == "bonus"]
    assert {h["reason"] for h in bonus} == {"Teamwork"} and all(h["points"] == 1 for h in bonus)
    assert len({h["completion_id"] for h in history}) == 1                 # one completion
    # undo takes everything back, bonus included
    task_entry = next(h for h in history if h["type"] == "task")
    assert (await _call(ws, "task_organizer/undo_completion", history_id=task_entry["id"]))["result"]["removed"] == 6
    assert all(v == 0 for v in _data(hass)["points"].values()) and _data(hass)["history"] == []


async def test_together_team_bonus_setting(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws)
    assert (await _call(ws, "task_organizer/update_settings", settings={"team_bonus": 0}))["success"]
    res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "5555"}])
    assert res["points"] == 2.5 and res["team_bonus"] == 0
    assert [h["type"] for h in _data(hass)["history"]] == ["task", "task"]
    # a solo completion never gets a team bonus
    assert (await _call(ws, "task_organizer/update_settings", settings={"team_bonus": 3}))["success"]
    solo = await _add_task(ws)
    assert (await _kid_complete(ws, solo))["success"]
    assert [h["type"] for h in _data(hass)["history"]].count("bonus") == 0


async def test_together_wrong_helper_pin_changes_nothing(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws)
    res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "0000"}])
    assert res["success"] is False and res["error"] == "wrong_pin"
    assert res["helper_id"] == BEN_ID and res["attempts_left"] == 4
    assert _data(hass)["points"].get(ANNA, 0) == 0 and _data(hass)["history"] == []
    assert task_id in _data(hass)["tasks"] and _data(hass)["tasks"][task_id]["due_date"] <= dt_util.utcnow().isoformat()


async def test_together_helper_pins_cannot_be_brute_forced(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws)
    # a wrong main PIN never reaches the helpers
    res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "5555"}], pin="0000")
    assert res["error"] == "wrong_pin" and "helper_id" not in res
    # several guesses for one kid in one request are rejected, one per request count against the kid's lockout
    many = [{"kid_id": BEN_ID, "pin": f"{i:04d}"} for i in range(1, 4)]
    assert (await _together(ws, task_id, many))["error"] == "duplicate_helper"
    for i in range(5):
        res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": f"{i + 1:04d}"}])
    assert res["error"] == "locked" and res["helper_id"] == BEN_ID
    # now even the right PIN is refused, directly and as helper
    assert (await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "5555"}]))["error"] == "locked"
    assert (await _call(ws, "task_organizer/kid_verify_pin", kid_id=BEN_ID, pin="5555"))["result"]["error"] == "locked"
    assert _data(hass)["history"] == []


async def test_together_rejects_duplicate_unknown_and_too_young_helpers(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws, min_age=8)
    ben = {"kid_id": BEN_ID, "pin": "5555"}
    res = await _together(ws, task_id, [ben, ben])
    assert res["error"] == "duplicate_helper" and res["helper_id"] == BEN_ID
    res = await _together(ws, task_id, [{"kid_id": ANNA, "pin": "1234"}])          # the main kid itself
    assert res["error"] == "duplicate_helper"
    res = await _together(ws, task_id, [ben, {"kid_id": CLARA}])                   # Clara is 6 years old
    assert res["error"] == "too_young" and res["helper_id"] == CLARA
    res = await _together(ws, task_id, [{"kid_id": "person.nobody"}])
    assert res["error"] == "unknown_kid" and res["helper_id"] == "person.nobody"
    assert _data(hass)["history"] == [] and _data(hass)["points"].get(BEN_ID, 0) == 0


async def test_together_open_steps_block_the_main_kid_only(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws, subtasks=[{"title": "Step", "done": False}])
    res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "5555"}])
    assert res["error"] == "steps_open"


async def test_together_with_approval_creates_one_pending_for_all(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws, requires_approval=True, name="Garden")
    requested = _collect(hass, "task_organizer_approval_requested")
    res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "5555"}, {"kid_id": CLARA}])
    assert res["success"] and res["pending"] is True
    (pending,) = _data(hass)["pending"].values()
    assert pending["kid_id"] == ANNA and pending["helpers"] == [BEN_ID, CLARA] and pending["team_bonus"] == 1
    assert _data(hass)["points"].get(ANNA, 0) == 0 and _data(hass)["history"] == []
    await hass.async_block_till_done()
    assert requested[0]["helpers"] == [BEN_ID, CLARA]
    res = await _call(ws, "task_organizer/approve", pending_id=pending["id"])
    assert res["result"]["success"]
    points = _data(hass)["points"]
    assert points[ANNA] == points[BEN_ID] == points[CLARA] == 2.7
    assert [h["type"] for h in _data(hass)["history"]].count("bonus") == 3
    # approving again awards nothing more
    assert (await _call(ws, "task_organizer/approve", pending_id=pending["id"]))["result"]["success"] is False
    assert _data(hass)["points"][ANNA] == 2.7


# ---------------------------------------------------------------------------
# "Together allowed" per task
# ---------------------------------------------------------------------------

async def test_together_not_allowed_costs_no_pin_attempt(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    task_id = await _team(hass, ws, allow_together=False)
    for _ in range(6):
        res = await _together(ws, task_id, [{"kid_id": BEN_ID, "pin": "0000"}])
        assert res == {"success": False, "error": "together_not_allowed"}
    # Ben's PIN limiter is untouched and nothing was booked
    assert (await _call(ws, "task_organizer/kid_verify_pin", kid_id=BEN_ID, pin="5555"))["result"]["success"]
    assert _data(hass)["history"] == [] and task_id in _data(hass)["tasks"]
    # alone it still works
    assert (await _kid_complete(ws, task_id))["success"]


async def test_allow_together_defaults_by_category_and_is_editable(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    basis = await _add_task(ws, category="basis")
    bonus = await _add_task(ws, category="bonus")
    auftrag = await _add_task(ws, category="auftrag")
    tasks = _data(hass)["tasks"]
    assert [tasks[t]["allow_together"] for t in (basis, bonus, auftrag)] == [False, True, True]
    assert (await _call(ws, "task_organizer/edit_task", task_id=basis, allow_together=True))["success"]
    assert tasks[basis]["allow_together"] is True
    # templates carry the flag, too
    res = await _call(ws, "task_organizer/add_template", name="T", complexity=3, icon="mdi:broom", category="bonus")
    tid = res["result"]["template_id"]
    assert _data(hass)["templates"][tid]["allow_together"] is True
    assert (await _call(ws, "task_organizer/edit_template", template_id=tid, allow_together=False))["success"]
    assert _data(hass)["templates"][tid]["allow_together"] is False


async def test_old_tasks_get_the_default_by_category(hass):
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    old = {
        "tasks": {
            "t1": {"id": "t1", "name": "A", "interval": 1, "complexity": 2, "icon": "mdi:broom", "assignees": [ANNA],
                   "due_date": dt_util.utcnow().isoformat(), "subtasks": [], "category": "basis"},
            "t2": {"id": "t2", "name": "B", "interval": 0, "complexity": 2, "icon": "mdi:broom", "assignees": [],
                   "due_date": dt_util.utcnow().isoformat(), "subtasks": [], "category": "bonus"},
        },
        "points": {}, "history": [], "settings": {}, "monthly_history": {},
        "current_month": dt_util.now().strftime("%Y-%m"),
        "current_period_start": (dt_util.utcnow() - timedelta(days=1)).isoformat(), "templates": {},
    }
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    _fake_http(hass)
    with patch("homeassistant.helpers.storage.Store.async_load", return_value=old):
        assert await hass.config_entries.async_setup(entry.entry_id)
    tasks = _data(hass)["tasks"]
    assert tasks["t1"]["allow_together"] is False and tasks["t2"]["allow_together"] is True
