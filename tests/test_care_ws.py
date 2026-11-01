"""FamilyMission 2.6: care (medication) per kid - virtual mission step, answers, deadline push, night, decline alert."""

from datetime import datetime, timedelta, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import _async_check_care
from custom_components.family_mission.const import DOMAIN

MORNING = datetime(2026, 10, 29, 15, 0, tzinfo=timezone.utc)          # Thu 08:00 local (US/Pacific, PDT)
AFTER_DEADLINE = datetime(2026, 10, 29, 17, 30, tzinfo=timezone.utc)  # Thu 10:30 local
NIGHT = datetime(2026, 10, 30, 5, 30, tzinfo=timezone.utc)            # Thu 22:30 local (night mode)
LENA = "person.lena"          # kid without HA user (PIN)
MAX_ = "person.max"           # replaced by the user id below (kid with HA user)
PIN = "1234"


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


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 100


@pytest.fixture
async def env(hass, hass_ws_client, freezer):
    anna = await _token(hass, "Anna")      # parent
    sam = await _token(hass, "Sam")        # no role
    max_ = await _token(hass, "Max")       # kid with an HA user
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set(LENA, "home", {"friendly_name": "Lena"})
    hass.states.async_set("person.max", "home", {"friendly_name": "Max", "user_id": max_[0].id})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "parents": [anna[0].id], "parent_notify": {anna[0].id: "notify.anna_push"},
    })
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    push = async_mock_service(hass, "notify", "anna_push")
    admin = await hass_ws_client(hass)
    clients = {
        "admin": admin,
        "anna": await hass_ws_client(hass, anna[1]),
        "sam": await hass_ws_client(hass, sam[1]),
        "max": await hass_ws_client(hass, max_[1]),
    }
    for pid, pin in ((LENA, PIN), (max_[0].id, None)):
        res = await _call(admin, "family_mission/set_kid_profile", participant_id=pid, avatar="🦊",
                          color="#ff8800", birth_year=2016, pin=pin)
        assert res["success"], res
    freezer.move_to(MORNING)
    return {"entry": entry, "push": push, "max_id": max_[0].id, **clients}


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _care(**kw):
    return {"id": "pill", "label": "Tablette", "emoji": "💊", "anchor": "morning", **kw}


async def _set_care(env, entries, pid=LENA):
    res = await _call(env["admin"], "family_mission/set_kid_profile", participant_id=pid, avatar="🦊",
                      color="#ff8800", birth_year=2016, care=entries)
    assert res["success"], res
    return env["entry"].options["kids"][pid]["care"]


def _mission(hass, kid=LENA, key="morning", window=False):
    start = dt_util.as_utc(dt_util.start_of_local_day(dt_util.now().date())).isoformat()
    task = {
        "id": f"{key}-{kid}", "name": "Morgen-Mission", "description": "", "area": "", "interval": 1,
        "assignees": [kid], "complexity": 2, "category": "basis", "min_age": 0, "icon": "mdi:weather-sunny",
        "due_date": start, "paused_until": None, "override_overdue_days": None, "subtasks": [],
        "wizard_key": f"{key}:{kid}", "generated_by": "wizard",
    }
    _data(hass)["tasks"][task["id"]] = task
    return task["id"]


async def _answer(env, status, pin=PIN, care_id="pill", kid=LENA):
    res = await _call(env["admin"], "family_mission/kid_care_answer", kid_id=kid, pin=pin, care_id=care_id, status=status)
    return res["result"]


async def _complete(env, task_id, pin=PIN):
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=task_id, kid_id=LENA, pin=pin)
    return res["result"]


# -- profile / validation ---------------------------------------------------

async def test_profile_validation_falls_back_to_defaults(hass, env):
    stored = await _set_care(env, [
        {"label": "  ", "emoji": "", "anchor": "weird", "time": "99:99", "weekdays": [9, "x", 2, 2], "deadline": "nope",
         "notify_parents": "yes", "decline_alert": {"enabled": "yes", "count": 0, "days": 999}},
        "junk",
        {"id": "b", "label": "x" * 80, "anchor": "time", "time": "16:30", "weekdays": [0, 2, 4]},
    ])
    assert len(stored) == 2
    first, second = stored
    assert first["label"] == "Tablette" and first["emoji"] == "💊" and first["anchor"] == "morning"
    assert first["time"] == "08:00" and first["weekdays"] == [2] and first["deadline"] == "10:00"
    assert first["notify_parents"] is True
    assert first["decline_alert"] == {"enabled": False, "count": 3, "days": 7}
    assert first["id"]
    assert len(second["label"]) == 30 and second["time"] == "16:30" and second["weekdays"] == [0, 2, 4]
    assert second["deadline"] == "18:30"          # time anchor: two hours after the time
    # all weekdays when none is usable; more than 6 entries are cut
    many = await _set_care(env, [{"weekdays": []}] * 9)
    assert len(many) == 6 and all(e["weekdays"] == list(range(7)) for e in many)
    assert len({e["id"] for e in many}) == 6
    # not a list / empty list removes the feature again
    res = await _call(env["admin"], "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, care=[])
    assert res["success"] and "care" not in env["entry"].options["kids"][LENA]


async def test_set_kid_profile_with_care_needs_manager(hass, env):
    res = await _call(env["sam"], "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, care=[_care()])
    assert res["error"]["code"] == "unauthorized"
    assert "care" not in env["entry"].options["kids"][LENA]


async def test_get_data_exposes_care_without_secrets(hass, env):
    await _set_care(env, [_care()])
    data = (await _call(env["admin"], "family_mission/get_data"))["result"]
    assert data["settings"]["kids"][LENA]["care"][0]["label"] == "Tablette"
    assert [i["id"] for i in data["care_today"][LENA]] == ["pill"]
    assert "pin_hash" not in str(data)
    other = (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"]
    assert env["max_id"] not in other           # kids without entries are not listed


# -- the virtual step -------------------------------------------------------

async def test_morning_step_blocks_until_answered(hass, env):
    task = _mission(hass)
    await _set_care(env, [_care()])
    items = (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"][LENA]
    assert items[0]["mission_task_id"] == task and items[0]["answer"] is None
    # nothing stored as a normal subtask
    assert _data(hass)["tasks"][task]["subtasks"] == []

    res = await _complete(env, task)
    assert res == {"success": False, "error": "steps_open"}

    assert (await _answer(env, "taken", pin="0000"))["error"] == "wrong_pin"
    res = await _answer(env, "declined")                       # "not today" also counts as done
    assert res["success"]
    res = await _answer(env, "taken")                          # changeable until the mission is completed
    assert res["success"]
    assert _data(hass)["care_log"][0]["status"] == "taken"

    res = await _complete(env, task)
    assert res["success"], res
    assert res["points"] == 2                                  # the points do not depend on the answer
    # after the completion the kid can no longer change the answer ...
    assert (await _answer(env, "declined"))["error"] == "care_locked"
    # ... a parent can still confirm
    res = await _call(env["anna"], "family_mission/care_confirm", kid_id=LENA, care_id="pill")
    assert res["result"]["success"]
    entry = _data(hass)["care_log"][0]
    assert entry["status"] == "taken" and entry["confirmed_by"]


async def test_declined_unblocks_and_survives_wizard_style_subtask_reset(hass, env):
    task = _mission(hass)
    await _set_care(env, [_care()])
    await _answer(env, "declined")
    _data(hass)["tasks"][task]["subtasks"] = [{"title": "Zähne", "done": True}]
    res = await _complete(env, task)
    assert res["success"], res


async def test_weekday_filter_and_unknown_care(hass, env):
    task = _mission(hass)
    await _set_care(env, [_care(weekdays=[0])])               # Monday only; the frozen day is Thursday
    assert (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"] == {}
    assert (await _answer(env, "taken"))["error"] == "not_found"
    assert (await _complete(env, task))["success"]


async def test_time_anchor_is_a_standalone_item(hass, env):
    await _set_care(env, [_care(id="drops", label="Tropfen", anchor="time", time="16:30")])
    item = (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"][LENA][0]
    assert item["mission_task_id"] is None and item["visible_from"] == "16:30"
    res = await _answer(env, "taken", care_id="drops")
    assert res["success"]
    # a morning entry without matching mission is standalone, too
    await _set_care(env, [_care()])
    assert (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"][LENA][0]["mission_task_id"] is None


async def test_no_points_history_or_approval(hass, env):
    await _set_care(env, [_care(anchor="time", time="07:00")])
    before = (dict(_data(hass)["points"]), len(_data(hass)["history"]), dict(_data(hass).get("pending", {})))
    await _answer(env, "taken")
    await _answer(env, "declined")
    assert (dict(_data(hass)["points"]), len(_data(hass)["history"]), dict(_data(hass).get("pending", {}))) == before


async def test_my_care_answer_for_a_kid_with_ha_user(hass, env):
    await _set_care(env, [_care(anchor="time", time="07:00")], pid=env["max_id"])
    res = await _call(env["max"], "family_mission/my_care_answer", care_id="pill", status="taken")
    assert res["result"]["success"]
    assert _data(hass)["care_log"][0]["kid_id"] == env["max_id"]
    # a user without a kid profile is not a kid
    res = await _call(env["anna"], "family_mission/my_care_answer", care_id="pill", status="taken")
    assert res["result"] == {"success": False, "error": "unknown_kid"}


async def test_care_confirm_roles(hass, env):
    await _set_care(env, [_care(anchor="time", time="07:00")])
    res = await _call(env["sam"], "family_mission/care_confirm", kid_id=LENA, care_id="pill")
    assert res["error"]["code"] == "unauthorized"
    res = await _call(env["anna"], "family_mission/care_confirm", kid_id=LENA, care_id="pill")
    assert res["result"]["success"]
    assert _data(hass)["care_log"][0]["status"] == "taken"


# -- pushes -----------------------------------------------------------------

async def test_declined_push_immediately_and_only_once(hass, env, freezer):
    await _set_care(env, [_care(anchor="time", time="07:00")])
    await _answer(env, "declined")
    await hass.async_block_till_done()
    assert len(env["push"]) == 1
    assert "Lena" in env["push"][0].data["message"]
    await _check(hass)
    assert len(env["push"]) == 1                             # per-day dedupe
    await _answer(env, "declined")                           # same status again: no new push
    await _check(hass)
    assert len(env["push"]) == 1


async def _check(hass):
    await _async_check_care(hass)
    await hass.async_block_till_done()


async def test_notify_parents_off_stays_silent(hass, env):
    await _set_care(env, [_care(anchor="time", time="07:00", notify_parents=False)])
    await _answer(env, "declined")
    await _check(hass)
    assert env["push"] == []


async def test_unanswered_at_deadline_pushes_once_and_logs(hass, env, freezer):
    await _set_care(env, [_care(anchor="time", time="07:00", deadline="10:00")])
    await _check(hass)
    assert env["push"] == [] and _data(hass).get("care_log") == []
    freezer.move_to(AFTER_DEADLINE)
    await _check(hass)
    assert len(env["push"]) == 1
    entry = _data(hass)["care_log"][0]
    assert entry["status"] == "unanswered" and entry["pushed"] is True
    await _check(hass)
    assert len(env["push"]) == 1
    # a late answer replaces it; "taken" is silent
    assert (await _answer(env, "taken"))["success"]
    await _check(hass)
    assert _data(hass)["care_log"][0]["status"] == "taken" and len(env["push"]) == 1


async def test_answered_before_deadline_no_unanswered_push(hass, env, freezer):
    await _set_care(env, [_care(anchor="time", time="07:00", deadline="10:00")])
    await _answer(env, "taken")
    freezer.move_to(AFTER_DEADLINE)
    await _check(hass)
    assert env["push"] == []


async def test_night_defers_the_push_to_wake_time(hass, env, freezer):
    await _set_care(env, [_care(anchor="time", time="07:00")])
    freezer.move_to(NIGHT)
    await _answer(env, "declined")
    await _check(hass)
    assert env["push"] == []
    assert _data(hass)["care_log"][0]["pushed"] is False
    # next morning (wake time 06:00 local) the push comes, once
    freezer.move_to(datetime(2026, 10, 30, 13, 30, tzinfo=timezone.utc))      # Fri 06:30 local
    await _check(hass)
    assert len(env["push"]) == 1
    await _check(hass)
    assert len(env["push"]) == 1


async def test_decline_alert_threshold_once_then_restarts(hass, env, freezer):
    alert = {"enabled": True, "count": 2, "days": 7}
    await _set_care(env, [_care(anchor="time", time="07:00", notify_parents=False, decline_alert=alert)])
    await _answer(env, "declined")
    await _check(hass)
    assert env["push"] == []                                  # 1 of 2
    freezer.move_to(MORNING + timedelta(days=1, hours=3))
    await _answer(env, "declined")
    await _check(hass)
    assert len(env["push"]) == 1                              # threshold reached: one push
    assert "2" in env["push"][0].data["message"]
    await _check(hass)
    assert len(env["push"]) == 1
    freezer.move_to(MORNING + timedelta(days=2, hours=3))
    await _answer(env, "declined")
    await _check(hass)
    assert len(env["push"]) == 1                              # counter restarted: 1 of 2
    freezer.move_to(MORNING + timedelta(days=3, hours=3))
    await _answer(env, "declined")
    await _check(hass)
    assert len(env["push"]) == 2
    assert _data(hass)["care_alerts"][f"{LENA}:pill"]


async def test_decline_alert_off_by_default(hass, env, freezer):
    await _set_care(env, [_care(anchor="time", time="07:00", notify_parents=False)])
    for day in range(4):
        freezer.move_to(MORNING + timedelta(days=day, hours=3))
        await _answer(env, "declined")
        await _check(hass)
    assert env["push"] == []


async def test_no_care_no_work(hass, env):
    assert await _async_check_care(hass) == 0
    assert _data(hass).get("care_log") == []
