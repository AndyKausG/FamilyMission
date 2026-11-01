"""FamilyMission 2.0: parents' tasks (catalog, apply, done, undo, handover, rollover, reminders, summary)."""

from datetime import date, datetime, timedelta, timezone

import pytest
from homeassistant.core import callback
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import (
    _async_check_planning_reminders,
    _async_check_reminders,
    _async_check_weekly_summary,
    _async_expire_missed,
    _async_handle_push_action,
    _async_rollover_parent_tasks,
    _local_day_of,
    _skip_duties_for,
)
from custom_components.family_mission.const import DOMAIN

CLARA = "person.clara"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)                 # Thu 11:00 local (US/Pacific, PDT)
SUNDAY_1759 = datetime(2026, 11, 2, 1, 59, tzinfo=timezone.utc)           # Sun Nov 1, 17:59 local (PST)
SUNDAY_1800 = datetime(2026, 11, 2, 2, 0, tzinfo=timezone.utc)            # 18:00 local
SUNDAY_1905 = datetime(2026, 11, 2, 3, 5, tzinfo=timezone.utc)            # 19:05 local


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


async def _token(hass, name):
    user = await hass.auth.async_create_user(name, group_ids=[GROUP_ID_USER])
    refresh = await hass.auth.async_create_refresh_token(user, "https://example.com")
    return user, hass.auth.async_create_access_token(refresh)


@pytest.fixture
async def env(hass, freezer):
    """Anna (parent role, push via parent_notify), Ben (adult without a role, companion app), Clara (kid), Sam (nobody)."""
    anna = await _token(hass, "Anna")
    ben = await _token(hass, "Ben")
    sam = await _token(hass, "Sam")
    david = await _token(hass, "David")                  # a kid WITH a Home Assistant user
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set("person.ben", "home", {"friendly_name": "Ben", "user_id": ben[0].id})
    hass.states.async_set("person.david", "home", {"friendly_name": "David", "user_id": david[0].id})
    hass.states.async_set(CLARA, "home", {"friendly_name": "Clara"})
    MockConfigEntry(domain="mobile_app", data={"user_id": ben[0].id, "device_name": "Ben Phone"}).add_to_hass(hass)
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "overdue_days": 5,
        "parents": [anna[0].id],
        "parent_notify": {anna[0].id: "notify.anna_push"},
        "kids": {david[0].id: {"avatar": "🐯", "color": "#42A5F5", "birth_year": 2018}},
    })
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    calls = {
        "anna": async_mock_service(hass, "notify", "anna_push"),
        "ben": async_mock_service(hass, "notify", "mobile_app_ben_phone"),
    }
    return {"anna": anna, "ben": ben, "sam": sam, "david": david, "entry": entry, "calls": calls}


@pytest.fixture
async def clients(hass, hass_ws_client, env, freezer):
    """Websocket clients of all users. They connect first (tokens are issued at the real time), then the clock moves."""
    result = {
        "admin": await hass_ws_client(hass),
        "anna": await hass_ws_client(hass, env["anna"][1]),
        "ben": await hass_ws_client(hass, env["ben"][1]),
        "sam": await hass_ws_client(hass, env["sam"][1]),
    }
    freezer.move_to(NOON)
    return result


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 100


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _by_key(hass):
    return {t["parent_key"]: t for t in _data(hass)["tasks"].values() if t.get("parent_key")}


def _collect(hass, event):
    seen = []
    hass.bus.async_listen(event, callback(lambda e: seen.append(e.data)))   # @callback: delivered synchronously, no executor race
    return seen


async def _kid(admin, pid=CLARA):
    res = await _call(admin, "family_mission/set_kid_profile", participant_id=pid,
                      avatar="🦊", color="#ff8800", pin="1234", birth_year=2016)
    assert res["success"], res


async def _apply(ws, *items, **kw):
    res = await _call(ws, "family_mission/parents_apply",
                      items=[{"key": k, "mode": m} for k, m in items], **kw)
    assert res["success"], res
    return res["result"]


def _day_start(day: date) -> str:
    from homeassistant.util import dt as dt_util
    return dt_util.as_utc(dt_util.start_of_local_day(day)).isoformat()


# ---------------------------------------------------------------------------
# catalog and apply
# ---------------------------------------------------------------------------

async def test_catalog_lists_items_adults_and_existing(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    res = (await _call(anna, "family_mission/parents_catalog"))["result"]
    assert len(res["items"]) == 28 and res["existing"] == {}
    assert {i["key"] for i in res["items"] if i["preselected"]} >= {"dinner", "calendar"}
    # the kid with a Home Assistant user is not an adult
    assert [(a["name"], a["push"]) for a in res["adults"]] == [("Anna", True), ("Ben", True)]
    assert res["me"] == env["anna"][0].id and res["partner"] == env["ben"][0].id
    await _apply(anna, ("dinner", "me"), ("shopping", "you"), ("kitchen", "alternate"))
    existing = (await _call(anna, "family_mission/parents_catalog"))["result"]["existing"]
    assert {k: v["mode"] for k, v in existing.items()} == {"dinner": "me", "shopping": "you", "kitchen": "alternate"}
    assert existing["dinner"]["task_id"] == _by_key(hass)["dinner"]["id"]
    # an administrator without a person has no "me" (two adults)
    res = (await _call(admin, "family_mission/parents_catalog"))["result"]
    assert res["me"] is None and res["partner"] is None and len(res["adults"]) == 2


async def test_apply_creates_staggered_tasks_without_points(hass, clients, env):
    anna = clients["anna"]
    res = await _apply(anna, ("dinner", "me"), ("shopping", "you"), ("kitchen", "alternate"),
                       ("calendar", "me"), ("bathrooms", "me"), ("finances", "me"))
    assert res == {"success": True, "created": 6, "updated": 0}
    tasks = _by_key(hass)
    a, b = env["anna"][0].id, env["ben"][0].id
    dinner = tasks["dinner"]
    assert dinner["parent_task"] is True and dinner["generated_by"] == "parents"
    assert dinner["category"] == "basis" and dinner["complexity"] == 0
    assert dinner["minutes"] == 45 and dinner["planning"] is False and dinner["interval"] == 1
    assert dinner["assignees"] == [a] and dinner["parent_mode"] == "fixed"
    assert dinner["due_date"] == _day_start(date(2026, 10, 29)) and dinner["paused_until"] is None
    assert dinner["name"] == "Dinner"
    assert tasks["shopping"]["assignees"] == [b]
    kitchen = tasks["kitchen"]
    assert kitchen["parent_mode"] == "alternate" and kitchen["parent_pair"] == [a, b] and kitchen["assignees"] == [a]
    assert _local_day_of(tasks["calendar"]["due_date"]) == date(2026, 11, 1)           # next Sunday
    assert tasks["calendar"]["planning"] is True
    assert _local_day_of(tasks["shopping"]["due_date"]) == date(2026, 11, 2)           # weekly spread: Monday first
    assert _local_day_of(tasks["bathrooms"]["due_date"]) == date(2026, 11, 3)          # then Tuesday
    assert _local_day_of(tasks["finances"]["due_date"]) == date(2026, 10, 29)          # long interval: offset 0
    assert _data(hass)["points"] == {} and _data(hass)["wallet"] == {} and _data(hass)["history"] == []


async def test_apply_twice_updates_mode_without_duplicates(hass, clients, env):
    anna = clients["anna"]
    await _apply(anna, ("dinner", "me"), ("shopping", "you"))
    ids = {k: t["id"] for k, t in _by_key(hass).items()}
    res = await _apply(anna, ("dinner", "alternate"), ("shopping", "you"), ("kitchen", "me"))
    assert res == {"success": True, "created": 1, "updated": 1}                         # shopping unchanged
    tasks = _by_key(hass)
    assert len(_data(hass)["tasks"]) == 3
    assert tasks["dinner"]["id"] == ids["dinner"] and tasks["dinner"]["parent_mode"] == "alternate"
    assert tasks["dinner"]["parent_pair"] == [env["anna"][0].id, env["ben"][0].id]
    # nothing changes when the same selection is applied again (an alternating turn is kept)
    tasks["dinner"]["assignees"] = [env["ben"][0].id]
    assert (await _apply(anna, ("dinner", "alternate")))["updated"] == 0
    assert _by_key(hass)["dinner"]["assignees"] == [env["ben"][0].id]
    # back to "you" / "me"
    await _apply(anna, ("dinner", "you"))
    assert _by_key(hass)["dinner"]["assignees"] == [env["ben"][0].id]
    assert "parent_pair" not in _by_key(hass)["dinner"]


async def test_apply_without_partner_everything_is_me(hass, clients, env):
    hass.states.async_remove("person.ben")
    anna = clients["anna"]
    res = (await _call(anna, "family_mission/parents_catalog"))["result"]
    assert res["partner"] is None and len(res["adults"]) == 1
    await _apply(anna, ("dinner", "you"), ("kitchen", "alternate"))
    for task in _by_key(hass).values():
        assert task["assignees"] == [env["anna"][0].id] and task["parent_mode"] == "fixed"
        assert "parent_pair" not in task


async def test_apply_validation_and_explicit_me(hass, clients, env):
    admin = clients["admin"]
    res = await _call(admin, "family_mission/parents_apply", items=[{"key": "nope"}])
    assert res["error"]["code"] == "no_adult" or res["error"]["code"] == "unknown_key"
    res = await _call(admin, "family_mission/parents_apply", items=[{"key": "nope"}], me=env["anna"][0].id)
    assert res["error"]["code"] == "unknown_key" and _data(hass)["tasks"] == {}
    res = await _call(admin, "family_mission/parents_apply", items=[{"key": "dinner"}], me="somebody")
    assert res["error"]["code"] == "unknown_person"
    res = await _call(admin, "family_mission/parents_apply", items=[{"key": "dinner", "mode": "bad"}], me=env["anna"][0].id)
    assert res["error"]["code"] == "invalid_format"
    # explicit me / partner (an administrator without a person), person entity ids are accepted too
    res = await _call(admin, "family_mission/parents_apply", items=[{"key": "dinner", "mode": "you"}],
                      me="person.anna", partner=env["ben"][0].id)
    assert res["result"]["created"] == 1
    assert _by_key(hass)["dinner"]["assignees"] == [env["ben"][0].id]


async def test_parent_task_set_and_add(hass, clients, env):
    anna = clients["anna"]
    await _apply(anna, ("dinner", "me"))
    tid = _by_key(hass)["dinner"]["id"]
    res = await _call(anna, "family_mission/parent_task_set", task_id=tid, mode="you", planning=True, minutes=50)
    assert res["result"] == {"success": True}
    task = _data(hass)["tasks"][tid]
    assert task["assignees"] == [env["ben"][0].id] and task["planning"] is True and task["minutes"] == 50
    assert (await _call(anna, "family_mission/parent_task_set", task_id=tid, minutes=0))["error"]["code"] == "invalid_format"
    assert (await _call(anna, "family_mission/parent_task_set", task_id=tid, minutes=601))["error"]["code"] == "invalid_format"
    res = await _call(anna, "family_mission/parent_task_set", task_id="nope", minutes=5)
    assert res["result"] == {"success": False, "error": "not_found"}
    normal = await _call(anna, "family_mission/add_task", name="Plain", interval=1, complexity=1, icon="mdi:broom")
    res = await _call(anna, "family_mission/parent_task_set", task_id=normal["result"]["task_id"], minutes=5)
    assert res["result"]["success"] is False

    res = await _call(anna, "family_mission/parent_task_add", name="  Hausarzt anrufen ", minutes=10, planning=True,
                      interval=0, mode="alternate")
    own = _data(hass)["tasks"][res["result"]["task_id"]]
    assert own["name"] == "Hausarzt anrufen" and own["interval"] == 0 and own["planning"] is True
    assert own["parent_task"] and own["complexity"] == 0 and "parent_key" not in own
    assert own["parent_mode"] == "alternate" and own["due_date"] == _day_start(date(2026, 10, 29))
    res = await _call(anna, "family_mission/parent_task_add", name="Default")
    default = _data(hass)["tasks"][res["result"]["task_id"]]
    assert (default["interval"], default["minutes"], default["planning"]) == (7, 15, False)
    for bad in ({"name": "  "}, {"name": "x", "interval": 366}, {"name": "x", "minutes": 0}):
        assert (await _call(anna, "family_mission/parent_task_add", **bad))["success"] is False


# ---------------------------------------------------------------------------
# tick off, alternate, undo
# ---------------------------------------------------------------------------

async def test_done_writes_parent_history_without_points(hass, clients, env):
    anna = clients["anna"]
    ben = clients["ben"]                      # adult without a role
    await _apply(anna, ("dinner", "me"))
    tid = _by_key(hass)["dinner"]["id"]
    res = (await _call(ben, "family_mission/parent_task_done", task_id=tid))["result"]       # any adult may tick off
    assert res["success"] and res["history_id"]
    data = _data(hass)
    entry = data["history"][0]
    assert entry["id"] == res["history_id"] and entry["type"] == "parent" and entry["points"] == 0
    assert entry["minutes"] == 45 and entry["user_id"] == env["ben"][0].id
    assert entry["task_id"] == tid and entry["task_name"] == "Dinner" and entry["completion_id"]
    assert data["points"] == {} and data["wallet"] == {}
    assert hass.data[DOMAIN]["data"]["tasks"][tid]["due_date"] == _day_start(date(2026, 10, 30))
    from custom_components.family_mission import _family_points
    assert _family_points(hass) == 0
    # the daily dinner is a fixed task: still Anna's
    assert data["tasks"][tid]["assignees"] == [env["anna"][0].id]
    assert (await _call(anna, "family_mission/parent_task_done", task_id="nope"))["result"] == {
        "success": False, "error": "not_found"}


async def test_done_alternate_switches_relative_to_the_responsible(hass, clients, env):
    anna = clients["anna"]
    ben = clients["ben"]
    a, b = env["anna"][0].id, env["ben"][0].id
    await _apply(anna, ("kitchen", "alternate"))
    task = _by_key(hass)["kitchen"]
    assert task["assignees"] == [a]
    await _call(ben, "family_mission/parent_task_done", task_id=task["id"])        # Ben helps out: Anna's turn was done
    assert task["assignees"] == [b]
    await _call(ben, "family_mission/parent_task_done", task_id=task["id"])
    assert task["assignees"] == [a]
    assert [h["user_id"] for h in _data(hass)["history"]] == [b, b]


async def test_done_one_time_task_is_deleted_and_undo_restores_it(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    res = await _call(anna, "family_mission/parent_task_add", name="Hausarzt", interval=0, minutes=10)
    tid = res["result"]["task_id"]
    before = dict(_data(hass)["tasks"][tid])
    hid = (await _call(anna, "family_mission/parent_task_done", task_id=tid))["result"]["history_id"]
    assert tid not in _data(hass)["tasks"]
    res = (await _call(admin, "family_mission/undo_completion", history_id=hid))["result"]
    assert res["success"] and res["removed"] == 1 and res["task_id"] == tid
    assert _data(hass)["tasks"][tid] == before and _data(hass)["history"] == []
    assert _data(hass)["points"] == {} and _data(hass)["wallet"] == {}
    assert (await _call(admin, "family_mission/undo_completion", history_id=hid))["result"]["error"] == "not_found"


async def test_undo_restores_assignees_handover_and_carry(hass, clients, env, freezer):
    admin = clients["admin"]
    anna = clients["anna"]
    ben = clients["ben"]
    a, b = env["anna"][0].id, env["ben"][0].id
    await _apply(anna, ("kitchen", "alternate"))
    task = _by_key(hass)["kitchen"]
    tid = task["id"]
    freezer.move_to(NOON + timedelta(days=2))
    assert await _async_rollover_parent_tasks(hass) == 1
    assert task["carried_since"] == "2026-10-29"
    await _call(anna, "family_mission/handover_ask", task_id=tid)
    await _call(ben, "family_mission/handover_answer", task_id=tid, accept=True)
    snapshot = {k: task.get(k) for k in ("assignees", "handover", "handover_original", "carried_since", "due_date")}
    assert snapshot["assignees"] == [b] and snapshot["handover_original"] == [a]
    hid = (await _call(ben, "family_mission/parent_task_done", task_id=tid))["result"]["history_id"]
    assert task["assignees"] == [b] and "carried_since" not in task and "handover" not in task
    assert task["due_date"] != snapshot["due_date"]
    res = (await _call(admin, "family_mission/undo_completion", history_id=hid))["result"]
    assert res["success"] and res["removed"] == 1 and res["points"] == {}
    assert {k: task.get(k) for k in snapshot} == snapshot
    assert _data(hass)["history"] == [] and _data(hass)["points"] == {}


async def test_generic_completion_paths_never_award_points(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    ben = clients["ben"]
    await _kid(admin)
    await _apply(anna, ("dinner", "me"), ("kitchen", "me"), ("bins", "me"))
    tasks = _by_key(hass)
    # classic complete_task, my_complete_task and the service all end up as a "parent" entry
    assert (await _call(admin, "family_mission/complete_task", task_id=tasks["dinner"]["id"],
                        completed_by=[env["anna"][0].id]))["success"]
    res = (await _call(ben, "family_mission/my_complete_task", task_id=tasks["kitchen"]["id"]))["result"]
    assert res["success"] and res["points"] == 0
    await hass.services.async_call(DOMAIN, "complete_task_by_name", {"task_name": "Put the bins out"}, blocking=True)
    history = _data(hass)["history"]
    assert [h["type"] for h in history] == ["parent"] * 3
    assert history[0]["user_id"] == env["anna"][0].id                 # the service falls back to the assignee
    assert _data(hass)["points"] == {} and _data(hass)["wallet"] == {}
    # a kid can neither tick off nor claim a parents' task
    for cmd in ("kid_complete_task", "kid_claim_task"):
        res = (await _call(admin, f"family_mission/{cmd}", task_id=tasks["bins"]["id"], kid_id=CLARA, pin="1234"))["result"]
        assert res["success"] is False and res["error"] == "not_eligible"
    res = (await _call(admin, "family_mission/parent_complete_for", task_id=tasks["bins"]["id"], kid_id=CLARA))["result"]
    assert res["error"] == "not_eligible" and _data(hass)["points"] == {}
    # my_complete_task by somebody who is not an adult
    sam = clients["sam"]
    res = (await _call(sam, "family_mission/my_complete_task", task_id=tasks["bins"]["id"]))["result"]
    assert res["success"] is False


async def test_history_edit_and_delete_of_parent_entries_touch_no_points(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    await _apply(anna, ("dinner", "me"))
    tid = _by_key(hass)["dinner"]["id"]
    await _call(anna, "family_mission/parent_task_done", task_id=tid)
    entry = _data(hass)["history"][0]
    res = await _call(admin, "family_mission/edit_history_item", entry_id=entry["id"], points=9, user_id=env["ben"][0].id)
    assert res["success"] and entry["points"] == 0 and entry["user_id"] == env["ben"][0].id
    assert _data(hass)["points"] == {} and _data(hass)["wallet"] == {}
    await _call(admin, "family_mission/delete_history_item", entry_id=entry["id"])
    assert _data(hass)["history"] == [] and _data(hass)["points"] == {} and _data(hass)["wallet"] == {}


# ---------------------------------------------------------------------------
# handover
# ---------------------------------------------------------------------------

async def test_handover_ask_pushes_with_actions_and_fires_event(hass, clients, env):
    anna = clients["anna"]
    await _apply(anna, ("shopping", "me"))
    tid = _by_key(hass)["shopping"]["id"]
    requested = _collect(hass, "family_mission_handover_requested")
    res = (await _call(anna, "family_mission/handover_ask", task_id=tid))["result"]       # default: the partner
    assert res == {"success": True, "to": env["ben"][0].id, "pushed": True}
    task = _data(hass)["tasks"][tid]
    assert task["handover"]["state"] == "asked" and task["handover"]["to"] == env["ben"][0].id
    assert task["handover"]["from"] == env["anna"][0].id and task["handover"]["at"]
    assert task["assignees"] == [env["anna"][0].id]                  # nothing changes until the answer
    (call,) = env["calls"]["ben"]
    assert env["calls"]["anna"] == []
    assert "Anna" in call.data["message"] and "Grocery shopping" in call.data["message"]
    assert [a["action"] for a in call.data["data"]["actions"]] == [f"FM_TAKE_{tid}", f"FM_DECLINE_{tid}"]
    await hass.async_block_till_done()
    assert requested[-1]["task_id"] == tid and requested[-1]["to_name"] == "Ben"


async def test_handover_accept_applies_only_once(hass, clients, env):
    anna = clients["anna"]
    ben = clients["ben"]
    a, b = env["anna"][0].id, env["ben"][0].id
    await _apply(anna, ("shopping", "me"))
    task = _by_key(hass)["shopping"]
    tid = task["id"]
    resolved = _collect(hass, "family_mission_handover_resolved")
    await _call(anna, "family_mission/handover_ask", task_id=tid)
    res = (await _call(ben, "family_mission/handover_answer", task_id=tid, accept=True))["result"]
    assert res["success"] and res["accepted"] is True
    assert task["assignees"] == [b] and task["handover_original"] == [a] and task["handover"]["state"] == "accepted"
    await hass.async_block_till_done()
    assert resolved[-1]["accepted"] is True and resolved[-1]["to_name"] == "Ben"
    assert env["calls"]["anna"] == []                                 # an acceptance sends no extra push
    # answering again, or asking while it is handed over, does nothing
    assert (await _call(ben, "family_mission/handover_answer", task_id=tid, accept=False))["result"]["success"] is False
    assert (await _call(anna, "family_mission/handover_ask", task_id=tid))["result"]["error"] == "handover_active"
    # Ben does it: back to Anna for the next time (fixed task)
    await _call(ben, "family_mission/parent_task_done", task_id=tid)
    assert task["assignees"] == [a] and "handover" not in task and "handover_original" not in task


async def test_handover_decline_pushes_the_asker(hass, clients, env):
    anna = clients["anna"]
    ben = clients["ben"]
    await _apply(anna, ("shopping", "me"))
    tid = _by_key(hass)["shopping"]["id"]
    await _call(anna, "family_mission/handover_ask", task_id=tid)
    res = (await _call(ben, "family_mission/handover_answer", task_id=tid, accept=False))["result"]
    assert res["success"] and res["accepted"] is False
    task = _data(hass)["tasks"][tid]
    assert "handover" not in task and task["assignees"] == [env["anna"][0].id]
    (push,) = env["calls"]["anna"]
    assert push.data["message"] == "Ben can't right now: Grocery shopping"


async def test_handover_answer_only_by_the_asked_person_or_admin(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    sam = clients["sam"]
    await _apply(anna, ("shopping", "me"), ("bins", "me"))
    tid, bins = _by_key(hass)["shopping"]["id"], _by_key(hass)["bins"]["id"]
    await _call(anna, "family_mission/handover_ask", task_id=tid)
    for ws in (anna, sam):
        res = await _call(ws, "family_mission/handover_answer", task_id=tid, accept=True)
        assert res["error"]["code"] == "unauthorized"
    assert _data(hass)["tasks"][tid]["handover"]["state"] == "asked"
    assert (await _call(admin, "family_mission/handover_answer", task_id=tid, accept=True))["result"]["success"]
    # no open request / unknown task
    assert (await _call(admin, "family_mission/handover_answer", task_id=bins, accept=True))["result"]["success"] is False
    assert (await _call(admin, "family_mission/handover_answer", task_id="nope", accept=True))["result"]["success"] is False
    # asking: explicit target must be another adult; unknown task
    assert (await _call(anna, "family_mission/handover_ask", task_id=bins, to=env["anna"][0].id))["result"]["success"] is False
    assert (await _call(anna, "family_mission/handover_ask", task_id=bins, to="person.clara"))["result"]["success"] is False
    assert (await _call(anna, "family_mission/handover_ask", task_id="nope"))["result"]["error"] == "not_found"
    assert (await _call(anna, "family_mission/handover_ask", task_id=bins, to="person.ben"))["result"]["success"]


async def test_handover_via_push_actions(hass, clients, env):
    anna = clients["anna"]
    await _apply(anna, ("shopping", "me"), ("bins", "me"))
    shopping, bins = _by_key(hass)["shopping"], _by_key(hass)["bins"]
    for task in (shopping, bins):
        await _call(anna, "family_mission/handover_ask", task_id=task["id"])
    await _async_handle_push_action(hass, f"FM_TAKE_{shopping['id']}")
    assert shopping["assignees"] == [env["ben"][0].id] and shopping["handover"]["state"] == "accepted"
    await _async_handle_push_action(hass, f"FM_DECLINE_{bins['id']}")
    assert "handover" not in bins and len(env["calls"]["anna"]) == 1
    # repeating or unknown ids are harmless
    await _async_handle_push_action(hass, f"FM_TAKE_{shopping['id']}")
    await _async_handle_push_action(hass, "FM_TAKE_unknown")
    await _async_handle_push_action(hass, "FM_DECLINE_unknown")
    assert shopping["handover_original"] == [env["anna"][0].id]


async def test_alternate_handover_goes_to_the_other_of_the_pair(hass, clients, env):
    anna = clients["anna"]
    await _apply(anna, ("kitchen", "alternate"))
    task = _by_key(hass)["kitchen"]
    task["assignees"] = [env["ben"][0].id]                           # Ben's turn: asking goes to Anna
    res = (await _call(anna, "family_mission/handover_ask", task_id=task["id"]))["result"]
    assert res["to"] == env["anna"][0].id and task["handover"]["from"] == env["ben"][0].id
    assert len(env["calls"]["anna"]) == 1


# ---------------------------------------------------------------------------
# rollover, reminders, summary
# ---------------------------------------------------------------------------

async def test_rollover_carries_over_silently(hass, clients, env, freezer):
    anna = clients["anna"]
    admin = clients["admin"]
    await _kid(admin)
    await _apply(anna, ("dinner", "me"), ("shopping", "me"), ("bins", "me"), ("bathrooms", "me"))
    tasks = _by_key(hass)
    tasks["bins"]["paused_until"] = (NOON + timedelta(days=10)).isoformat()
    changes = _collect(hass, "family_mission_updated")
    freezer.move_to(NOON + timedelta(days=3))                                  # Sun Nov 1, 11:00 local
    assert await _async_rollover_parent_tasks(hass) == 1                       # only the dinner was due before today
    assert tasks["dinner"]["carried_since"] == "2026-10-29"
    assert _local_day_of(tasks["dinner"]["due_date"]) == date(2026, 11, 1)
    for key in ("shopping", "bins", "bathrooms"):                              # future / paused: untouched
        assert "carried_since" not in tasks[key]
    # running again is harmless; a task that stays open keeps its first missed day
    assert await _async_rollover_parent_tasks(hass) == 0
    freezer.move_to(NOON + timedelta(days=5))                                  # Tue Nov 3
    assert await _async_rollover_parent_tasks(hass) == 2                       # dinner again, shopping (due Nov 2) now
    assert tasks["dinner"]["carried_since"] == "2026-10-29"
    assert tasks["shopping"]["carried_since"] == "2026-11-02"
    assert "carried_since" not in tasks["bathrooms"] and "carried_since" not in tasks["bins"]
    assert _data(hass)["history"] == [] and _data(hass)["points"] == {}
    assert env["calls"]["anna"] == [] and env["calls"]["ben"] == []
    await hass.async_block_till_done()
    assert changes


async def test_rollover_runs_on_startup_and_expire_missed_ignores_parent_tasks(hass, clients, env, freezer):
    admin = clients["admin"]
    anna = clients["anna"]
    await _kid(admin)
    await _apply(anna, ("dinner", "me"))
    kid_task = (await _call(admin, "family_mission/add_task", name="Kid duty", interval=1, complexity=3,
                            icon="mdi:broom", assignees=[CLARA], category="basis"))["result"]["task_id"]
    dinner = _by_key(hass)["dinner"]["id"]
    _data(hass)["missed_checked"] = "2026-10-29"                                # the last check ran on the day the duty was created
    await hass.data[DOMAIN]["store"].async_save(_data(hass))                    # the reload reads the stored data
    freezer.move_to(NOON + timedelta(days=3))
    await hass.config_entries.async_reload(env["entry"].entry_id)               # "restart": catches up
    await hass.async_block_till_done()
    task = _data(hass)["tasks"][dinner]
    assert task["carried_since"] == "2026-10-29" and _local_day_of(task["due_date"]) == date(2026, 11, 1)
    # the kid's duty is missed (history), the parents' task is not
    types = [(h["type"], h["task_id"]) for h in _data(hass)["history"]]
    assert types == [("missed", kid_task)]
    _data(hass)["missed_checked"] = None
    assert await _async_expire_missed(hass) == 0


async def test_planning_reminder_only_for_planning_tasks_and_only_once(hass, clients, env, freezer):
    anna = clients["anna"]
    await _apply(anna, ("meal_plan", "you"), ("shopping", "me"), ("dinner", "me"))
    tasks = _by_key(hass)
    tasks["meal_plan"]["due_date"] = _day_start(date(2026, 11, 2))
    tasks["shopping"]["due_date"] = _day_start(date(2026, 11, 2))             # due tomorrow but not a planning task
    tasks["dinner"]["due_date"] = _day_start(date(2026, 11, 2))
    tasks["dinner"]["reminder_at"] = "00:01"                                  # even a normal reminder stays silent
    freezer.move_to(SUNDAY_1759)
    assert await _async_check_planning_reminders(hass) == 0
    assert await _async_check_reminders(hass) == 0
    freezer.move_to(SUNDAY_1800)
    assert await _async_check_planning_reminders(hass) == 1
    (call,) = env["calls"]["ben"]                                            # meal plan is Ben's ("you")
    assert call.data["message"] == "Due tomorrow: Meal plan (approx. 20 min.)"
    assert env["calls"]["anna"] == []
    assert tasks["meal_plan"]["planning_reminded_for"] == "2026-11-02"
    assert await _async_check_planning_reminders(hass) == 0                  # once per due date
    freezer.move_to(SUNDAY_1800 + timedelta(hours=2))
    assert await _async_check_planning_reminders(hass) == 0
    assert await _async_check_reminders(hass) == 0
    assert len(env["calls"]["ben"]) == 1 and env["calls"]["anna"] == []
    # done: next due date is a week away, the reminder comes again for that one
    await _call(anna, "family_mission/parent_task_done", task_id=tasks["meal_plan"]["id"])
    assert "planning_reminded_for" not in tasks["meal_plan"]


async def test_planning_reminder_settings(hass, clients, env, freezer):
    admin = clients["admin"]
    anna = clients["anna"]
    await _apply(anna, ("meal_plan", "me"))
    task = _by_key(hass)["meal_plan"]
    task["due_date"] = _day_start(date(2026, 11, 2))
    await _call(admin, "family_mission/update_settings", settings={"planning_reminders": False})
    freezer.move_to(SUNDAY_1800)
    assert await _async_check_planning_reminders(hass) == 0                  # switched off
    await _call(admin, "family_mission/update_settings",
                settings={"planning_reminders": True, "planning_reminder_time": "20:30"})
    assert await _async_check_planning_reminders(hass) == 0                  # not yet 20:30
    await hass.async_block_till_done()
    assert env["calls"]["anna"] == []
    freezer.move_to(SUNDAY_1800 + timedelta(hours=2, minutes=30))
    await _async_check_planning_reminders(hass)                              # (the minute timer may be first)
    await hass.async_block_till_done()
    assert len(env["calls"]["anna"]) == 1


async def test_weekly_summary_hours_carried_and_once_per_sunday(hass, clients, env, freezer):
    hass.config.language = "de"
    admin = clients["admin"]
    anna = clients["anna"]
    ben = clients["ben"]
    await _apply(anna, ("bathrooms", "me"))
    big = (await _call(anna, "family_mission/parent_task_add", name="Umzug", minutes=390, interval=0))["result"]["task_id"]
    other = (await _call(anna, "family_mission/parent_task_add", name="Steuer", minutes=240, interval=0))["result"]["task_id"]
    old = (await _call(anna, "family_mission/parent_task_add", name="Alt", minutes=100, interval=0))["result"]["task_id"]
    await _call(anna, "family_mission/parent_task_done", task_id=big)
    await _call(ben, "family_mission/parent_task_done", task_id=other)
    await _call(anna, "family_mission/parent_task_done", task_id=old)
    _data(hass)["history"][0]["timestamp"] = "2026-10-20T12:00:00+00:00"       # too long ago: not in the week
    # bathrooms was due on Nov 3, make it carried
    bathrooms = _by_key(hass)["bathrooms"]
    bathrooms["due_date"] = _day_start(date(2026, 10, 30))
    freezer.move_to(SUNDAY_1759 - timedelta(minutes=30))
    assert await _async_rollover_parent_tasks(hass) == 1
    seen = _collect(hass, "family_mission_weekly_summary")
    assert await _async_check_weekly_summary(hass) is False                   # before 19:00
    freezer.move_to(SUNDAY_1905)
    assert await _async_check_weekly_summary(hass) is True
    message = "Diese Woche: Anna 6,5 Std. · Ben 4 Std. Liegengeblieben: Bäder putzen."
    for who in ("anna", "ben"):
        (call,) = env["calls"][who]
        assert call.data["message"] == message and call.data["title"] == "Wochenrückblick"
    await hass.async_block_till_done()
    assert len(seen) == 1
    rows = {r["name"]: r for r in seen[0]["adults"]}
    assert (rows["Anna"]["minutes"], rows["Anna"]["hours"], rows["Ben"]["hours"]) == (390, 6.5, 4.0)
    assert seen[0]["carried"][0]["name"] == "Bäder putzen" and seen[0]["carried"][0]["carried_since"] == "2026-10-30"
    assert seen[0]["from"] == "2026-10-26" and seen[0]["to"] == "2026-11-01" and seen[0]["message"] == message
    # the same Sunday never twice (also not after a restart: the marker is stored)
    assert await _async_check_weekly_summary(hass) is False
    await hass.config_entries.async_reload(env["entry"].entry_id)
    await hass.async_block_till_done()
    assert await _async_check_weekly_summary(hass) is False
    assert len(env["calls"]["anna"]) == 1
    # websocket returns the same data
    res = (await _call(admin, "family_mission/weekly_summary"))["result"]
    assert res["message"] == message and [r["hours"] for r in res["adults"]] == [6.5, 4.0]


async def test_weekly_summary_nothing_left_over_and_switched_off(hass, clients, env, freezer):
    admin = clients["admin"]
    await _call(admin, "family_mission/update_settings", settings={"weekly_summary": False})
    freezer.move_to(SUNDAY_1905 - timedelta(days=1))
    assert await _async_check_weekly_summary(hass) is False                  # Saturday
    freezer.move_to(SUNDAY_1905)
    assert await _async_check_weekly_summary(hass) is False                  # switched off
    await _call(admin, "family_mission/update_settings", settings={"weekly_summary": True, "weekly_summary_time": "19:30"})
    assert await _async_check_weekly_summary(hass) is False                  # 19:05 < 19:30
    await hass.async_block_till_done()
    assert env["calls"]["anna"] == []
    freezer.move_to(SUNDAY_1905 + timedelta(minutes=30))
    await _async_check_weekly_summary(hass)                                  # (the minute timer may be first)
    await hass.async_block_till_done()
    assert [c.data["message"] for c in env["calls"]["anna"]] == ["This week: Anna 0 h · Ben 0 h Nothing left over."]


# ---------------------------------------------------------------------------
# get_data, settings, roles, push target
# ---------------------------------------------------------------------------

async def test_get_data_has_adults_me_and_partner(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    ben = clients["ben"]
    sam = clients["sam"]
    res = (await _call(anna, "family_mission/get_data"))["result"]
    assert res["me"] == env["anna"][0].id and res["partner"] == env["ben"][0].id
    assert res["adults"] == [
        {"id": env["anna"][0].id, "name": "Anna", "push": True},
        {"id": env["ben"][0].id, "name": "Ben", "push": True},
    ]
    res = (await _call(ben, "family_mission/get_data"))["result"]
    assert res["me"] == env["ben"][0].id and res["partner"] == env["anna"][0].id
    for ws in (admin, sam):
        res = (await _call(ws, "family_mission/get_data"))["result"]
        assert res["me"] is None and res["partner"] is None and len(res["adults"]) == 2
    assert res["settings"].get("parent_notify")


async def test_push_target_auto_and_missing(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    ben_id = env["ben"][0].id
    res = (await _call(admin, "family_mission/get_data"))["result"]
    assert {a["name"]: a["push"] for a in res["adults"]} == {"Anna": True, "Ben": True}
    # without a configured target and without a companion app: no push, no error
    await _call(admin, "family_mission/update_settings", settings={"parent_notify": {}})
    res = (await _call(admin, "family_mission/get_data"))["result"]
    assert {a["name"]: a["push"] for a in res["adults"]} == {"Anna": False, "Ben": True}
    await _apply(anna, ("shopping", "me"))
    tid = _by_key(hass)["shopping"]["id"]
    # a configured target wins over the companion app; an unknown service only logs
    await _call(admin, "family_mission/update_settings", settings={"parent_notify": {ben_id: "notify.nobody_home"}})
    res = (await _call(anna, "family_mission/handover_ask", task_id=tid))["result"]
    assert res == {"success": True, "to": ben_id, "pushed": False} and env["calls"]["ben"] == []


async def test_settings_are_sanitized(hass, clients, env):
    admin = clients["admin"]
    await _call(admin, "family_mission/update_settings", settings={
        "role_model_band": False, "role_model_label": "  Anna und Ben  ",
        "weekly_summary": "yes", "weekly_summary_time": "25:99", "planning_reminder_time": "07:15",
        "parent_notify": {"u1": "notify.phone", "u2": "not a service!", "u3": ""},
    })
    options = env["entry"].options
    assert options["role_model_band"] is False and options["role_model_label"] == "Anna und Ben"
    assert "weekly_summary" not in options and options["weekly_summary_time"] == "19:00"
    assert options["planning_reminder_time"] == "07:15"
    assert options["parent_notify"] == {"u1": "notify.phone"}


@pytest.mark.parametrize("command,payload,allowed", [
    ("parents_catalog", {}, ("admin", "anna")),
    ("parents_apply", {"items": []}, ("admin", "anna")),
    ("parent_task_set", {"task_id": "x", "minutes": 5}, ("admin", "anna")),
    ("parent_task_add", {"name": "Y"}, ("admin", "anna")),
    ("weekly_summary", {}, ("admin", "anna")),
    ("parent_task_done", {"task_id": "x"}, ("admin", "anna", "ben")),
    ("handover_ask", {"task_id": "x"}, ("admin", "anna", "ben")),
    ("handover_answer", {"task_id": "x", "accept": True}, ("admin", "anna", "ben")),
])
async def test_roles(hass, clients, env, command, payload, allowed):
    for who, ws in clients.items():
        extra = {"me": env["anna"][0].id} if who == "admin" and command in ("parent_task_add",) else {}
        res = await _call(ws, f"family_mission/{command}", **payload, **extra)
        denied = res.get("error", {}).get("code") == "unauthorized"
        assert denied == (who not in allowed), (command, who, res)


# ---------------------------------------------------------------------------
# kids' logic stays untouched
# ---------------------------------------------------------------------------

async def test_wizard_apply_keeps_parent_tasks_and_kids_logic_ignores_them(hass, clients, env):
    admin = clients["admin"]
    anna = clients["anna"]
    await _apply(anna, ("dinner", "me"), ("shopping", "you"))
    ids = {t["id"] for t in _data(hass)["tasks"].values()}
    payload = {"kids": [{"id": CLARA, "birth_year": 2016, "avatar": "🦊", "color": "#FF8800"}],
               "features": [], "start_date": "2026-11-01", "phase": "start", "language": "en"}
    assert (await _call(admin, "family_mission/wizard_apply", **payload))["success"]
    assert (await _call(admin, "family_mission/wizard_apply", replace_existing=True, **payload))["success"]
    assert ids <= set(_data(hass)["tasks"])
    assert len([t for t in _data(hass)["tasks"].values() if t.get("parent_task")]) == 2
    assert _data(hass)["history"] == [] and _data(hass)["points"] == {}
    # the wizard catalog still says "wizard tasks" only for its own
    res = (await _call(admin, "family_mission/wizard_catalog"))["result"]
    assert res["has_wizard_tasks"] is True
    # kids' points / goals stay untouched by a parents' tick
    dinner = _by_key(hass)["dinner"]["id"]
    await _call(anna, "family_mission/parent_task_done", task_id=dinner)
    assert _data(hass)["points"] == {} and (await _call(admin, "family_mission/get_data"))["result"]["family_points"] == 0


async def test_birthday_skip_reminders_and_overdue_sensor_ignore_parent_tasks(hass, clients, env, freezer):
    admin = clients["admin"]
    anna = clients["anna"]
    await _kid(admin)
    await _apply(anna, ("dinner", "me"))
    task = _by_key(hass)["dinner"]
    # even a parents' task wrongly assigned to the birthday kid is not skipped
    task["assignees"] = [CLARA]
    before = task["due_date"]
    settings = hass.config_entries.async_entries(DOMAIN)[0].options
    assert _skip_duties_for(hass, _data(hass), CLARA, settings, datetime.now(timezone.utc).astimezone()) == 0
    assert task["due_date"] == before
    task["assignees"] = [env["anna"][0].id]
    # a very old due date is never "overdue" for the sensor
    task["due_date"] = _day_start(date(2026, 9, 1))
    hass.bus.async_fire("family_mission_updated")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.family_mission_overdue_tasks").state == "0"
    normal = (await _call(admin, "family_mission/add_task", name="Normal", interval=1, complexity=1,
                          icon="mdi:broom", custom_due_date="2026-09-01T00:00:00+00:00"))
    assert normal["success"]
    hass.bus.async_fire("family_mission_updated")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.family_mission_overdue_tasks").state == "1"


async def test_orphaned_leaderboard_entity_is_removed(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    registry = er.async_get(hass)
    registry.async_get_or_create("sensor", DOMAIN, "family_mission_leaderboard", config_entry=entry)
    assert registry.async_get_entity_id("sensor", DOMAIN, "family_mission_leaderboard")
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert registry.async_get_entity_id("sensor", DOMAIN, "family_mission_leaderboard") is None
    assert registry.async_get_entity_id("sensor", DOMAIN, "family_mission_points")
