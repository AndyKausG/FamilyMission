"""FamilyMission 2.6: weekday schedule and real rotation on one task."""

from datetime import datetime, timedelta, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission import _async_check_reminders, _async_expire_missed
from custom_components.family_mission.const import DOMAIN
from custom_components.family_mission.kids import is_open

ANNA, BEN, CLARA = "person.anna", "person.ben", "person.clara"
PIN = "1234"
THU = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)    # Thu 11:00 local (US/Pacific, PDT)
MWF = [0, 2, 4]


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


@pytest.fixture
async def setup(hass):
    for pid, name in ((ANNA, "Anna"), (BEN, "Ben"), (CLARA, "Clara")):
        hass.states.async_set(pid, "home", {"friendly_name": name})
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


_call.n = 500


async def _kids(ws, *pids):
    for pid in pids:
        res = await _call(ws, "family_mission/set_kid_profile", participant_id=pid, avatar="🦊",
                          color="#ff8800", pin=PIN, birth_year=2016)
        assert res["success"], res


async def _add(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis"}
    payload.update(kw)
    res = await _call(ws, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _kid_do(ws, task_id, kid):
    return (await _call(ws, "family_mission/kid_complete_task", task_id=task_id, kid_id=kid, pin=PIN))["result"]


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _day_start(day):
    return dt_util.as_utc(dt_util.start_of_local_day(day)).isoformat()


def _due_day(hass, tid):
    return dt_util.as_local(datetime.fromisoformat(_data(hass)["tasks"][tid]["due_date"])).date()


def _open(hass, tid):
    return is_open(_data(hass)["tasks"][tid], dt_util.now(), 5)


# ---------------------------------------------------------------------------
# weekdays
# ---------------------------------------------------------------------------

async def test_weekday_task_due_dates_across_a_week(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA)
    tid = await _add(ws, assignees=[ANNA], weekdays=MWF, interval=0)
    task = _data(hass)["tasks"][tid]
    assert task["weekdays"] == MWF and task["interval"] == 1          # interval stays stored (never 0 with weekdays)
    today = dt_util.now().date()
    assert today.weekday() == 3
    assert _due_day(hass, tid) == today + timedelta(days=1)           # Thu is not listed: first due Friday
    assert not _open(hass, tid)

    freezer.move_to(THU + timedelta(days=1))                          # Friday
    assert _open(hass, tid)
    assert (await _kid_do(ws, tid, ANNA))["success"]
    assert _due_day(hass, tid) == today + timedelta(days=4)           # Monday
    for offset, expected in ((1, False), (2, False), (3, True)):      # Sat, Sun, Mon
        freezer.move_to(THU + timedelta(days=1 + offset))
        assert _open(hass, tid) is expected

    assert (await _kid_do(ws, tid, ANNA))["success"]                  # Monday done
    assert _due_day(hass, tid) == today + timedelta(days=6)           # Wednesday
    assert _data(hass)["points"][ANNA] == 8


async def test_missed_weekday_occurrence_expires_and_next_is_listed_weekday(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA)
    tid = await _add(ws, assignees=[ANNA], weekdays=MWF, interval=7)
    today = dt_util.now().date()
    freezer.move_to(THU + timedelta(days=1))                           # Friday: due, not done
    assert _open(hass, tid)
    freezer.move_to(THU + timedelta(days=2))                           # Saturday: expires (no weekly grace)
    _data(hass).pop("missed_checked", None)
    assert await _async_expire_missed(hass) == 1
    assert _due_day(hass, tid) == today + timedelta(days=4)            # Monday
    (entry,) = _data(hass)["history"]
    assert entry["type"] == "missed" and entry["points"] == 0 and entry["user_id"] == ANNA

    # missed on Monday, Tuesday is not listed: next one is Wednesday
    freezer.move_to(THU + timedelta(days=5))
    _data(hass).pop("missed_checked", None)
    assert await _async_expire_missed(hass) == 1
    assert _due_day(hass, tid) == today + timedelta(days=6)


async def test_edit_task_weekdays_validation_and_alignment(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA)
    today = dt_util.now().date()
    tid = await _add(ws, assignees=[ANNA], interval=2)
    assert "weekdays" not in _data(hass)["tasks"][tid]                 # unchanged behaviour
    assert _open(hass, tid)

    assert (await _call(ws, "family_mission/edit_task", task_id=tid, weekdays=[1, 5]))["success"]
    task = _data(hass)["tasks"][tid]
    assert task["weekdays"] == [1, 5] and task["interval"] == 2
    assert _due_day(hass, tid) == today + timedelta(days=2)           # Thu due -> Saturday
    # invalid values fall back to "no weekdays"
    assert (await _call(ws, "family_mission/edit_task", task_id=tid, weekdays=[9, 1]))["success"]
    assert "weekdays" not in _data(hass)["tasks"][tid]
    assert (await _call(ws, "family_mission/edit_task", task_id=tid, weekdays=[2]))["success"]
    assert (await _call(ws, "family_mission/edit_task", task_id=tid, weekdays=[]))["success"]
    assert "weekdays" not in _data(hass)["tasks"][tid]
    bad = await _call(ws, "family_mission/add_task", name="x", interval=1, complexity=1, icon="mdi:x", weekdays="1")
    assert bad["success"] is False                                     # schema rejects a non-list


async def test_template_weekdays_and_rotation_roundtrip(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN)
    res = await _call(ws, "family_mission/add_template", name="Tisch", complexity=2, icon="mdi:x",
                      weekdays=[0, 3], rotation={"members": [ANNA, BEN]})
    template = _data(hass)["templates"][res["result"]["template_id"]]
    assert template["weekdays"] == [0, 3] and template["rotation"]["members"] == [ANNA, BEN]
    assert template["assignees"] == [ANNA, BEN]
    res = await _call(ws, "family_mission/edit_template", template_id=template["id"], weekdays=[], rotation=None)
    assert res["success"] and "weekdays" not in template and "rotation" not in template
    await _call(ws, "family_mission/edit_template", template_id=template["id"], weekdays=[3],
                rotation={"members": [BEN, ANNA]})
    await hass.services.async_call(DOMAIN, "add_task", {"template": "Tisch"}, blocking=True)
    copied = [t for t in _data(hass)["tasks"].values() if t["name"] == "Tisch"][0]
    assert copied["weekdays"] == [3] and copied["rotation"]["members"] == [BEN, ANNA]


# ---------------------------------------------------------------------------
# rotation
# ---------------------------------------------------------------------------

async def test_rotation_validation(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN)
    one = await _add(ws, rotation={"members": [ANNA]})
    unknown = await _add(ws, rotation={"members": [ANNA, "person.nobody"]})
    dup = await _add(ws, rotation={"members": [ANNA, ANNA]})
    for tid in (one, unknown, dup):
        assert "rotation" not in _data(hass)["tasks"][tid]
    tid = await _add(ws, rotation={"members": [ANNA, BEN], "index": 3}, assignees=[BEN])
    task = _data(hass)["tasks"][tid]
    assert task["rotation"] == {"members": [ANNA, BEN], "index": 1, "every": "occurrence"}
    assert task["assignees"] == [ANNA, BEN]                           # compatibility: assignees = members
    # an edit with the same members and no index keeps the turn; null removes the rotation
    assert (await _call(ws, "family_mission/edit_task", task_id=tid, rotation={"members": [BEN, ANNA]}))["success"]
    assert task["rotation"]["index"] == 1
    assert (await _call(ws, "family_mission/edit_task", task_id=tid, rotation=None))["success"]
    assert "rotation" not in task


async def test_rotation_only_current_member_and_advance_on_complete(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN)
    tid = await _add(ws, name="Tisch", rotation={"members": [ANNA, BEN]})
    bonus = await _add(ws, name="Bonus", category="bonus", requires_routine=True)
    task = _data(hass)["tasks"][tid]

    res = await _kid_do(ws, tid, BEN)                                  # not Ben's turn
    assert res == {"success": False, "error": "not_eligible"}
    # Ben has no open duty (bonus not locked), Anna has (bonus locked)
    assert (await _kid_do(ws, bonus, ANNA)) == {"success": False, "error": "basis_open"}
    assert (await _call(ws, "family_mission/kid_claim_task", task_id=bonus, kid_id=BEN, pin=PIN))["result"]["success"]

    assert (await _kid_do(ws, tid, ANNA))["success"]
    assert task["rotation"]["index"] == 1
    (entry,) = [h for h in _data(hass)["history"] if h["task_id"] == tid]
    assert entry["user_id"] == ANNA and entry["points"] == 4           # the current member gets the points
    assert _data(hass)["points"].get(BEN, 0) == 0

    freezer.move_to(THU + timedelta(days=1))                           # next day: Ben's turn
    assert (await _kid_do(ws, tid, ANNA)) == {"success": False, "error": "not_eligible"}
    assert (await _kid_do(ws, tid, BEN))["success"]
    assert task["rotation"]["index"] == 0

    # a parent completing for a kid advances the rotation too
    freezer.move_to(THU + timedelta(days=2))
    assert (await _call(ws, "family_mission/parent_complete_for", task_id=tid, kid_id=ANNA))["result"]["success"]
    assert task["rotation"]["index"] == 1


async def test_rotation_advances_on_expiry_and_reminder_targets_current(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN)
    tid = await _add(ws, name="Tisch", rotation={"members": [ANNA, BEN]}, reminder_at="08:00")
    task = _data(hass)["tasks"][tid]
    events = []
    hass.bus.async_listen("family_mission_task_reminder", lambda e: events.append(e.data))
    assert await _async_check_reminders(hass) == 1
    await hass.async_block_till_done()
    assert events[0]["assignees"] == [ANNA]

    freezer.move_to(THU + timedelta(days=1))
    _data(hass).pop("missed_checked", None)
    assert await _async_expire_missed(hass) == 1                       # Anna missed her turn
    (entry,) = _data(hass)["history"]
    assert entry["type"] == "missed" and entry["user_id"] == ANNA
    assert task["rotation"]["index"] == 1                              # now Ben's turn
    assert (await _kid_do(ws, tid, ANNA))["error"] == "not_eligible"
    assert (await _kid_do(ws, tid, BEN))["success"]


async def test_rotation_undo_and_reject_restore_the_turn(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN)
    tid = await _add(ws, name="Tisch", rotation={"members": [ANNA, BEN]})
    task = _data(hass)["tasks"][tid]
    assert (await _kid_do(ws, tid, ANNA))["success"]
    assert task["rotation"]["index"] == 1
    entry = [h for h in _data(hass)["history"] if h["task_id"] == tid][0]
    res = await _call(ws, "family_mission/undo_completion", history_id=entry["id"])
    assert res["result"]["success"]
    assert task["rotation"]["index"] == 0                              # Anna is in turn again
    assert (await _kid_do(ws, tid, ANNA))["success"]                   # and may redo it

    # approval: the turn moves with the request and comes back when it is not done
    assert (await _call(ws, "family_mission/edit_task", task_id=tid, requires_approval=True,
                        rotation={"members": [ANNA, BEN], "index": 0}))["success"]
    _data(hass)["tasks"][tid]["due_date"] = _day_start(dt_util.now().date())
    res = await _kid_do(ws, tid, ANNA)
    assert res["pending"] is True and task["rotation"]["index"] == 1
    (pid,) = list(_data(hass)["pending"])
    assert (await _call(ws, "family_mission/reject", pending_id=pid, mode="not_done"))["result"]["success"]
    assert task["rotation"]["index"] == 0


async def test_rotation_swap_and_skip(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN, CLARA)
    tid = await _add(ws, name="Tisch", rotation={"members": [ANNA, BEN, CLARA]})
    task = _data(hass)["tasks"][tid]

    res = await _call(ws, "family_mission/rotation_action", task_id=tid, action="swap", member=CLARA)
    assert res["result"] == {"success": True, "member": CLARA, "next": ANNA}      # Anna gave up: she is next
    assert (await _kid_do(ws, tid, ANNA))["error"] == "not_eligible"
    assert (await _kid_do(ws, tid, CLARA))["success"]
    assert kids_current(task) == ANNA and "return_to" not in task["rotation"]

    res = await _call(ws, "family_mission/rotation_action", task_id=tid, action="skip")
    assert res["result"] == {"success": True, "member": BEN, "next": CLARA}
    bad = await _call(ws, "family_mission/rotation_action", task_id=tid, action="swap", member="person.nobody")
    assert bad["result"] == {"success": False, "error": "unknown_kid"}
    plain = await _add(ws, name="Plain")
    res = await _call(ws, "family_mission/rotation_action", task_id=plain, action="skip")
    assert res["result"]["success"] is False
    res = await _call(ws, "family_mission/rotation_action", task_id="nope", action="skip")
    assert res["result"] == {"success": False, "error": "not_found"}


def kids_current(task):
    from custom_components.family_mission import kids as kidslib
    return kidslib.rotation_member(task["rotation"])


async def test_rotation_action_needs_parent_role(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN)
    tid = await _add(ws, rotation={"members": [ANNA, BEN]})
    user = await hass.auth.async_create_user("Nobody", group_ids=[GROUP_ID_USER])
    refresh = await hass.auth.async_create_refresh_token(user, "https://example.com")
    plain = await hass_ws_client(hass, hass.auth.async_create_access_token(refresh))
    res = await _call(plain, "family_mission/rotation_action", task_id=tid, action="skip")
    assert res["success"] is False and res["error"]["code"] == "unauthorized"
    assert _data(hass)["tasks"][tid]["rotation"]["index"] == 0


async def test_rotation_with_weekdays_and_parent_skip(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(THU)
    await _kids(ws, ANNA, BEN)
    tid = await _add(ws, name="Tisch", weekdays=[3, 5], rotation={"members": [ANNA, BEN]})
    task = _data(hass)["tasks"][tid]
    today = dt_util.now().date()
    assert (await _kid_do(ws, tid, ANNA))["success"]                   # Thursday
    assert _due_day(hass, tid) == today + timedelta(days=2)            # Saturday
    assert task["rotation"]["index"] == 1
    freezer.move_to(THU + timedelta(days=2))
    # skipping today by the parents moves on without points and leaves the turn with Ben
    res = await _call(ws, "family_mission/parent_task_action", task_id=tid, action="skip_today")
    assert res["result"]["success"]
    assert _due_day(hass, tid) == today + timedelta(days=7)
    assert task["rotation"]["index"] == 1
    (skipped,) = [h for h in _data(hass)["history"] if h["type"] == "skipped"]
    assert skipped["user_id"] == BEN
