"""FamilyMission 2.6: parents' task list (due date / time, someday, overdue, postpone, morning digest, due-time push)."""

from datetime import date, datetime, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import (
    _async_check_parent_digest,
    _async_check_parent_due_times,
    _async_rollover_parent_tasks,
)
from custom_components.family_mission.const import DOMAIN

NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)             # Thu 11:00 local (US/Pacific, PDT)
EARLY = datetime(2026, 10, 29, 13, 59, tzinfo=timezone.utc)           # 06:59 local
SEVEN = datetime(2026, 10, 29, 14, 0, tzinfo=timezone.utc)            # 07:00 local
NIGHT = datetime(2026, 10, 30, 5, 30, tzinfo=timezone.utc)            # Thu 22:30 local (night mode)
TOMORROW_NOON = datetime(2026, 10, 30, 18, 0, tzinfo=timezone.utc)


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
    anna = await _token(hass, "Anna")
    ben = await _token(hass, "Ben")
    sam = await _token(hass, "Sam")
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set("person.ben", "home", {"friendly_name": "Ben", "user_id": ben[0].id})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "parents": [anna[0].id],
        "parent_notify": {anna[0].id: "notify.anna_push", ben[0].id: "notify.ben_push"},
    })
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    calls = {
        "anna": async_mock_service(hass, "notify", "anna_push"),
        "ben": async_mock_service(hass, "notify", "ben_push"),
    }
    return {"anna": anna, "ben": ben, "sam": sam, "entry": entry, "calls": calls}


@pytest.fixture
async def clients(hass, hass_ws_client, env, freezer):
    result = {
        "admin": await hass_ws_client(hass),
        "anna": await hass_ws_client(hass, env["anna"][1]),
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


def _day_start(day: date) -> str:
    from homeassistant.util import dt as dt_util
    return dt_util.as_utc(dt_util.start_of_local_day(day)).isoformat()


async def _add(ws, **kw):
    res = await _call(ws, "family_mission/parent_task_add", **kw)
    assert res["success"], res
    return res["result"]["task_id"]


async def _settings(admin, **kw):
    assert (await _call(admin, "family_mission/update_settings", settings=kw))["success"]


# ---------------------------------------------------------------------------
# add / set: dates
# ---------------------------------------------------------------------------

async def test_add_without_date_is_someday_and_never_rolled_over(hass, clients, freezer):
    anna = clients["anna"]
    tid = await _add(anna, name="Garage aufräumen", interval=0)
    task = _data(hass)["tasks"][tid]
    assert task["due_date"] is None and task["someday"] is True and "dated" not in task and "due_time" not in task
    freezer.move_to(TOMORROW_NOON)
    assert await _async_rollover_parent_tasks(hass) == 0
    assert _data(hass)["tasks"][tid]["due_date"] is None


async def test_add_with_date_and_time_stays_overdue(hass, clients, freezer):
    anna = clients["anna"]
    tid = await _add(anna, name="Zahnarzt anrufen", interval=0, due_date="2026-10-28", due_time="09:30")
    task = _data(hass)["tasks"][tid]
    assert task["due_date"] == _day_start(date(2026, 10, 28)) and task["dated"] is True and task["due_time"] == "09:30"
    assert "someday" not in task
    # dated one-time tasks are not carried over: they stay overdue until done
    assert await _async_rollover_parent_tasks(hass) == 0
    assert _data(hass)["tasks"][tid]["due_date"] == _day_start(date(2026, 10, 28))
    assert "carried_since" not in _data(hass)["tasks"][tid]


async def test_recurring_with_first_date_and_default_today(hass, clients):
    anna = clients["anna"]
    tid = await _add(anna, name="Pflanzen", interval=7, due_date="2026-11-03")
    task = _data(hass)["tasks"][tid]
    assert task["due_date"] == _day_start(date(2026, 11, 3)) and "dated" not in task and "someday" not in task
    tid2 = await _add(anna, name="Pflanzen 2", interval=7)
    assert _data(hass)["tasks"][tid2]["due_date"] == _day_start(date(2026, 10, 29))


async def test_add_validation_and_roles(hass, clients):
    anna, sam = clients["anna"], clients["sam"]
    res = await _call(anna, "family_mission/parent_task_add", name="x", interval=0, due_date="29.10.2026")
    assert res["success"] is False and res["error"]["code"] == "invalid_date"
    res = await _call(anna, "family_mission/parent_task_add", name="x", interval=0, due_date="2026-10-29", due_time="25:00")
    assert res["success"] is False and res["error"]["code"] == "invalid_time"
    res = await _call(sam, "family_mission/parent_task_add", name="x", interval=0)
    assert res["success"] is False
    # a time without a date means nothing: dropped
    tid = await _add(anna, name="Ohne Datum", interval=0, due_time="08:00")
    assert "due_time" not in _data(hass)["tasks"][tid]


async def test_set_date_time_and_someday(hass, clients):
    anna = clients["anna"]
    tid = await _add(anna, name="Etwas", interval=0)
    res = await _call(anna, "family_mission/parent_task_set", task_id=tid, due_date="2026-11-05", due_time="18:00")
    assert res["result"] == {"success": True}
    task = _data(hass)["tasks"][tid]
    assert task["due_date"] == _day_start(date(2026, 11, 5)) and task["dated"] and task["due_time"] == "18:00"
    assert "someday" not in task
    await _call(anna, "family_mission/parent_task_set", task_id=tid, due_time=None)
    assert "due_time" not in _data(hass)["tasks"][tid]
    await _call(anna, "family_mission/parent_task_set", task_id=tid, due_date=None)
    task = _data(hass)["tasks"][tid]
    assert task["due_date"] is None and task["someday"] is True and "dated" not in task
    bad = await _call(anna, "family_mission/parent_task_set", task_id=tid, due_date="nope")
    assert bad["success"] is False and bad["error"]["code"] == "invalid_date"
    rec = await _add(anna, name="Wöchentlich", interval=7)
    bad = await _call(anna, "family_mission/parent_task_set", task_id=rec, due_date=None)
    assert bad["success"] is False


async def test_done_deletes_one_time_and_undo_keeps_someday(hass, clients):
    anna = clients["anna"]
    tid = await _add(anna, name="Irgendwann", interval=0)
    res = await _call(anna, "family_mission/parent_task_done", task_id=tid)
    assert res["result"]["success"] and tid not in _data(hass)["tasks"]
    res = await _call(anna, "family_mission/undo_completion", history_id=res["result"]["history_id"])
    assert res["success"], res
    assert _data(hass)["tasks"][tid]["due_date"] is None and _data(hass)["tasks"][tid]["someday"] is True


# ---------------------------------------------------------------------------
# postpone
# ---------------------------------------------------------------------------

async def test_postpone_to_tomorrow(hass, clients):
    anna, sam = clients["anna"], clients["sam"]
    overdue = await _add(anna, name="Alt", interval=0, due_date="2026-10-20", due_time="08:00")
    someday = await _add(anna, name="Irgendwann", interval=0)
    recurring = await _add(anna, name="Immer wieder", interval=7)
    _data(hass)["tasks"][recurring]["carried_since"] = "2026-10-27"
    for tid in (overdue, someday, recurring):
        res = await _call(anna, "family_mission/parent_task_postpone", task_id=tid)
        assert res["result"] == {"success": True, "due_date": "2026-10-30"}
        assert _data(hass)["tasks"][tid]["due_date"] == _day_start(date(2026, 10, 30))
    assert _data(hass)["tasks"][overdue]["due_time"] == "08:00" and _data(hass)["tasks"][overdue]["dated"]
    assert "someday" not in _data(hass)["tasks"][someday] and _data(hass)["tasks"][someday]["dated"]
    assert "carried_since" not in _data(hass)["tasks"][recurring] and "dated" not in _data(hass)["tasks"][recurring]
    res = await _call(anna, "family_mission/parent_task_postpone", task_id="nope")
    assert res["result"] == {"success": False, "error": "not_found"}
    res = await _call(sam, "family_mission/parent_task_postpone", task_id=overdue)
    assert res["success"] is False and res["error"]["code"] == "unauthorized"
    plain = await _call(anna, "family_mission/add_task", name="Plain", interval=1, complexity=1, icon="mdi:broom")
    res = await _call(anna, "family_mission/parent_task_postpone", task_id=plain["result"]["task_id"])
    assert res["result"]["success"] is False


# ---------------------------------------------------------------------------
# settings
# ---------------------------------------------------------------------------

async def test_digest_settings_validated_and_off_by_default(hass, clients, env):
    admin = clients["admin"]
    assert env["entry"].options.get("parent_digest_enabled") is None
    await _settings(admin, parent_digest_enabled="yes", parent_digest_time="25:99")
    options = env["entry"].options
    assert "parent_digest_enabled" not in options and options["parent_digest_time"] == "07:00"
    await _settings(admin, parent_digest_enabled=True, parent_digest_time="06:45")
    assert env["entry"].options["parent_digest_enabled"] is True and env["entry"].options["parent_digest_time"] == "06:45"


# ---------------------------------------------------------------------------
# morning digest
# ---------------------------------------------------------------------------

async def _tasks_for_digest(hass, anna):
    await _add(anna, name="Heute 1", interval=0, due_date="2026-10-29")
    await _add(anna, name="Heute 2", interval=0, due_date="2026-10-29")
    await _add(anna, name="Alt", interval=0, due_date="2026-10-25")
    await _add(anna, name="Später", interval=0, due_date="2026-11-10")
    await _add(anna, name="Irgendwann", interval=0)


async def test_digest_off_by_default(hass, clients, env, freezer):
    await _tasks_for_digest(hass, clients["anna"])
    freezer.move_to(SEVEN)
    assert await _async_check_parent_digest(hass) == 0
    assert env["calls"]["anna"] == []


async def test_digest_once_per_day_with_counts(hass, clients, env, freezer):
    admin, anna = clients["admin"], clients["anna"]
    await _settings(admin, parent_digest_enabled=True)
    await _tasks_for_digest(hass, anna)
    freezer.move_to(EARLY)
    assert await _async_check_parent_digest(hass) == 0
    freezer.move_to(SEVEN)
    assert await _async_check_parent_digest(hass) == 1                     # Anna has tasks, Ben has none
    (call,) = env["calls"]["anna"]
    assert call.data["message"] == "Today: 2 tasks, 1 overdue"
    assert env["calls"]["ben"] == []
    assert _data(hass)["parent_digest_sent"] == "2026-10-29"
    freezer.move_to(NOON)
    assert await _async_check_parent_digest(hass) == 0                     # once per day
    assert len(env["calls"]["anna"]) == 1
    freezer.move_to(TOMORROW_NOON)
    assert await _async_check_parent_digest(hass) == 1                     # next day again (all three are overdue now)
    assert env["calls"]["anna"][-1].data["message"] == "Today: 0 tasks, 3 overdue"


async def test_digest_silent_without_tasks_and_in_night_mode(hass, clients, env, freezer):
    admin, anna = clients["admin"], clients["anna"]
    await _settings(admin, parent_digest_enabled=True, parent_digest_time="22:00")
    await _add(anna, name="Heute", interval=0, due_date="2026-10-29")
    freezer.move_to(NIGHT)                                                # 22:30, night mode (sleep 20:30)
    assert await _async_check_parent_digest(hass) == 0
    assert "parent_digest_sent" not in _data(hass)                        # tried again later, not lost
    await _settings(admin, night_mode=False)
    assert await _async_check_parent_digest(hass) == 1
    # nothing to say: no push, but the day counts as handled
    freezer.move_to(datetime(2026, 11, 20, 6, 0, tzinfo=timezone.utc))   # 22:00 local the day before
    for t in list(_data(hass)["tasks"]):
        del _data(hass)["tasks"][t]
    before = len(env["calls"]["anna"])
    assert await _async_check_parent_digest(hass) == 0
    assert len(env["calls"]["anna"]) == before


# ---------------------------------------------------------------------------
# push at the due time
# ---------------------------------------------------------------------------

async def test_due_time_push_once(hass, clients, env, freezer):
    anna = clients["anna"]
    tid = await _add(anna, name="Arzt anrufen", interval=0, due_date="2026-10-29", due_time="12:00")
    await _add(anna, name="Ohne Zeit", interval=0, due_date="2026-10-29")
    await _add(anna, name="Anderer Tag", interval=0, due_date="2026-10-30", due_time="08:00")
    assert await _async_check_parent_due_times(hass) == 0                  # 11:00, not yet
    freezer.move_to(datetime(2026, 10, 29, 19, 0, tzinfo=timezone.utc))   # 12:00 local
    assert await _async_check_parent_due_times(hass) == 1
    (call,) = env["calls"]["anna"]
    assert "Arzt anrufen" in call.data["message"] and "12:00" in call.data["message"]
    assert _data(hass)["tasks"][tid]["due_reminded_for"] == "2026-10-29"
    assert await _async_check_parent_due_times(hass) == 0                  # once
    # postponed to tomorrow: reminded again on the new day
    await _call(anna, "family_mission/parent_task_postpone", task_id=tid)
    assert "due_reminded_for" not in _data(hass)["tasks"][tid]


async def test_due_time_push_waits_for_the_end_of_night_mode(hass, clients, env, freezer):
    anna = clients["anna"]
    await _add(anna, name="Spät", interval=0, due_date="2026-10-29", due_time="21:00")
    freezer.move_to(datetime(2026, 10, 30, 5, 0, tzinfo=timezone.utc))    # 22:00 local, night
    assert await _async_check_parent_due_times(hass) == 0
    assert env["calls"]["anna"] == []
    await _settings(clients["admin"], night_mode=False)
    assert await _async_check_parent_due_times(hass) == 1


async def test_done_task_gets_no_due_time_push(hass, clients, env, freezer):
    anna = clients["anna"]
    tid = await _add(anna, name="Erledigt", interval=0, due_date="2026-10-29", due_time="12:00")
    await _call(anna, "family_mission/parent_task_done", task_id=tid)
    freezer.move_to(datetime(2026, 10, 29, 19, 30, tzinfo=timezone.utc))
    assert await _async_check_parent_due_times(hass) == 0
