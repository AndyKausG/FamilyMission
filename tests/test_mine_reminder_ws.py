"""'My tasks' commands for own devices (participant from the websocket user) and task reminders."""

from datetime import datetime, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.task_organizer import _async_check_reminders
from custom_components.task_organizer.const import DOMAIN

BEN = "person.ben"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)        # 11:00 local (PDT)
EVENING = datetime(2026, 10, 30, 0, 5, tzinfo=timezone.utc)      # 17:05 local


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
async def env(hass):
    anna = await _token(hass, "Anna")       # kid with profile and own device
    sam = await _token(hass, "Sam")         # adult without kid profile
    nobody = await _token(hass, "Guest")    # no person linked
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set("person.sam", "home", {"friendly_name": "Sam", "user_id": sam[0].id})
    hass.states.async_set(BEN, "home", {"friendly_name": "Ben"})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"overdue_days": 5})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return {"anna": anna, "sam": sam, "nobody": nobody, "entry": entry}


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()

_call.n = 100


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def _setup_kid(admin, env):
    res = await _call(admin, "task_organizer/set_kid_profile", participant_id=env["anna"][0].id,
                      avatar="🦊", color="#ff8800", pin="1234", birth_year=2016)
    assert res["success"], res


async def _task(admin, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis"}
    payload.update(kw)
    res = await _call(admin, "task_organizer/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def test_my_complete_for_kid_and_adult(hass, hass_ws_client, env):
    admin = await hass_ws_client(hass)
    await _setup_kid(admin, env)
    anna_id, sam_id = env["anna"][0].id, env["sam"][0].id
    t_kid = await _task(admin, assignees=[anna_id], complexity=3)
    t_adult = await _task(admin, assignees=[sam_id], complexity=2)
    anna = await hass_ws_client(hass, env["anna"][1])
    res = (await _call(anna, "task_organizer/my_complete_task", task_id=t_kid))["result"]      # no PIN needed
    assert res["success"] and res["points"] == 3
    assert _data(hass)["points"][anna_id] == 3 and _data(hass)["wallet"][anna_id] == 3
    sam = await hass_ws_client(hass, env["sam"][1])
    res = (await _call(sam, "task_organizer/my_complete_task", task_id=t_adult))["result"]
    assert res["success"] and _data(hass)["points"][sam_id] == 2


async def test_my_commands_cannot_act_for_others(hass, hass_ws_client, env):
    admin = await hass_ws_client(hass)
    await _setup_kid(admin, env)
    anna_id, sam_id = env["anna"][0].id, env["sam"][0].id
    t_sam = await _task(admin, assignees=[sam_id])
    t_ben = await _task(admin, assignees=[BEN])
    anna = await hass_ws_client(hass, env["anna"][1])
    for tid in (t_sam, t_ben):
        assert (await _call(anna, "task_organizer/my_complete_task", task_id=tid))["result"]["error"] == "not_eligible"
        assert (await _call(anna, "task_organizer/my_claim_task", task_id=tid))["result"]["error"] == "not_eligible"
    # the participant can not be supplied in the payload
    res = await _call(anna, "task_organizer/my_complete_task", task_id=t_sam, kid_id=sam_id)
    assert res["success"] is False and res["error"]["code"] == "invalid_format"
    assert _data(hass)["points"] == {} and len(_data(hass)["tasks"]) == 2
    # a user without a linked person
    nobody = await hass_ws_client(hass, env["nobody"][1])
    t_free = await _task(admin, category="bonus")
    assert (await _call(nobody, "task_organizer/my_complete_task", task_id=t_free))["result"]["error"] == "unknown_kid"
    assert (await _call(nobody, "task_organizer/my_redeem", reward_id="x"))["result"]["error"] == "unknown_kid"
    assert (await _call(nobody, "task_organizer/my_set_goal", reward_id=None))["result"]["error"] == "unknown_kid"


async def test_my_complete_rules_window_steps_approval_age(hass, hass_ws_client, env, freezer):
    admin = await hass_ws_client(hass)
    anna = await hass_ws_client(hass, env["anna"][1])
    sam = await hass_ws_client(hass, env["sam"][1])
    freezer.move_to(NOON)
    await _setup_kid(admin, env)
    anna_id, sam_id = env["anna"][0].id, env["sam"][0].id
    late = await _task(admin, assignees=[anna_id], available_from="17:00")
    assert (await _call(anna, "task_organizer/my_complete_task", task_id=late))["result"]["error"] == "not_yet"
    steps = await _task(admin, assignees=[anna_id], subtasks=[{"title": "a", "done": False}])
    assert (await _call(anna, "task_organizer/my_complete_task", task_id=steps))["result"]["error"] == "steps_open"
    old = await _task(admin, category="bonus", min_age=12)
    assert (await _call(anna, "task_organizer/my_complete_task", task_id=old))["result"]["error"] == "too_young"
    appr_kid = await _task(admin, assignees=[anna_id], requires_approval=True)
    res = (await _call(anna, "task_organizer/my_complete_task", task_id=appr_kid))["result"]
    assert res["pending"] is True and len(_data(hass)["pending"]) == 1 and _data(hass)["points"] == {}
    appr_adult = await _task(admin, assignees=[sam_id], requires_approval=True)      # no kid profile: no approval
    res = (await _call(sam, "task_organizer/my_complete_task", task_id=appr_adult))["result"]
    assert res["success"] and "pending" not in res and _data(hass)["points"][sam_id] == 4


async def test_my_claim_redeem_and_goal(hass, hass_ws_client, env):
    admin = await hass_ws_client(hass)
    await _setup_kid(admin, env)
    anna_id = env["anna"][0].id
    await _call(admin, "task_organizer/set_rewards", rewards=[{"id": "r1", "name": "Medienzeit", "cost": 5}])
    bonus = await _task(admin, category="bonus", complexity=6)
    anna = await hass_ws_client(hass, env["anna"][1])
    sam = await hass_ws_client(hass, env["sam"][1])
    assert (await _call(anna, "task_organizer/my_claim_task", task_id=bonus))["result"]["success"]
    assert _data(hass)["tasks"][bonus]["claimed_by"] == anna_id
    assert (await _call(sam, "task_organizer/my_claim_task", task_id=bonus))["result"]["error"] == "claimed"
    assert (await _call(anna, "task_organizer/my_complete_task", task_id=bonus))["result"]["success"]
    assert (await _call(anna, "task_organizer/my_set_goal", reward_id="r1"))["result"]["success"]
    assert env["entry"].options["kids"][anna_id]["goal_reward"] == "r1"
    res = (await _call(anna, "task_organizer/my_redeem", reward_id="r1"))["result"]
    assert res["success"] and _data(hass)["wallet"][anna_id] == 1
    (rec,) = _data(hass)["redemptions"].values()
    assert rec["kid_id"] == anna_id
    # an adult without kid profile has no shop
    assert (await _call(sam, "task_organizer/my_redeem", reward_id="r1"))["result"]["error"] == "unknown_kid"


# ---------------------------------------------------------------------------
# reminders
# ---------------------------------------------------------------------------

async def test_reminder_fields_roundtrip(hass, hass_ws_client, env):
    admin = await hass_ws_client(hass)
    tid = await _task(admin, reminder_at="17:30", reminder_target="notify.mobile_app_phone")
    task = _data(hass)["tasks"][tid]
    assert task["reminder_at"] == "17:30" and task["reminder_target"] == "notify.mobile_app_phone"
    assert (await _call(admin, "task_organizer/edit_task", task_id=tid, reminder_at="", reminder_target="bad name!"))["success"]
    assert task["reminder_at"] is None and task["reminder_target"] == ""
    bad = await _call(admin, "task_organizer/add_task", name="x", interval=1, complexity=1, icon="mdi:x", reminder_at="25:00")
    assert bad["success"] is False
    res = await _call(admin, "task_organizer/add_template", name="Vorlage", complexity=2, icon="mdi:x",
                      reminder_at="08:15", reminder_target="mobile_app_phone")
    template = _data(hass)["templates"][res["result"]["template_id"]]
    assert template["reminder_at"] == "08:15" and template["reminder_target"] == "notify.mobile_app_phone"
    await hass.services.async_call(DOMAIN, "add_task", {"template": "Vorlage"}, blocking=True)
    copy = [t for t in _data(hass)["tasks"].values() if t["name"] == "Vorlage"][0]
    assert copy["reminder_at"] == "08:15"


async def test_reminder_fires_once_and_calls_notify(hass, hass_ws_client, env, freezer):
    admin = await hass_ws_client(hass)
    freezer.move_to(NOON)
    notified = async_mock_service(hass, "notify", "mobile_app_phone")
    events = []
    hass.bus.async_listen("task_organizer_task_reminder", lambda e: events.append(e.data))
    tid = await _task(admin, name="Müll rausbringen", assignees=[BEN], reminder_at="17:00",
                      reminder_target="notify.mobile_app_phone")
    assert await _async_check_reminders(hass) == 0              # 11:00: too early
    freezer.move_to(EVENING)
    assert await _async_check_reminders(hass) == 1
    await hass.async_block_till_done()
    assert events == [{"task_id": tid, "task_name": "Müll rausbringen", "assignees": [BEN], "assignee_names": ["Ben"]}]
    assert len(notified) == 1 and notified[0].data["title"] == "Reminder"
    assert notified[0].data["message"] == "Müll rausbringen is still open"
    assert _data(hass)["tasks"][tid]["reminded_on"] == "2026-10-29"
    assert await _async_check_reminders(hass) == 0              # once per day
    assert len(notified) == 1
    freezer.move_to(datetime(2026, 10, 31, 0, 5, tzinfo=timezone.utc))      # next local day, still open
    assert await _async_check_reminders(hass) == 1


async def test_reminder_skips_done_paused_not_due_expired_window(hass, hass_ws_client, env, freezer):
    admin = await hass_ws_client(hass)
    freezer.move_to(NOON)
    events = []
    hass.bus.async_listen("task_organizer_task_reminder", lambda e: events.append(e.data["task_id"]))
    done = await _task(admin, reminder_at="08:00", interval=0)
    await _call(admin, "task_organizer/complete_task", task_id=done, completed_by=[BEN])   # one-time: deleted
    paused = await _task(admin, reminder_at="08:00", paused_until="2026-10-31T00:00:00+00:00")
    future = await _task(admin, reminder_at="08:00", custom_due_date="2026-11-05T12:00:00+00:00")
    closed = await _task(admin, reminder_at="08:00", available_until="10:00")
    no_reminder = await _task(admin)
    assert await _async_check_reminders(hass) == 0
    # a recurring task that was completed is due again later, not reminded
    again = await _task(admin, reminder_at="08:00")
    await _call(admin, "task_organizer/complete_task", task_id=again, completed_by=[BEN])
    assert await _async_check_reminders(hass) == 0
    assert events == []
    assert "reminded_on" not in _data(hass)["tasks"][paused]


async def test_reminder_invalid_target_is_logged_not_fatal(hass, hass_ws_client, env, freezer, caplog):
    admin = await hass_ws_client(hass)
    freezer.move_to(NOON)
    tid = await _task(admin, reminder_at="08:00", reminder_target="notify.does_not_exist")
    second = await _task(admin, name="Zweite", reminder_at="08:00", reminder_target="")
    events = []
    hass.bus.async_listen("task_organizer_task_reminder", lambda e: events.append(e.data["task_id"]))
    assert await _async_check_reminders(hass) == 2
    await hass.async_block_till_done()
    assert set(events) == {tid, second}
    assert "could not be sent" in caplog.text


async def test_adult_cannot_take_kids_open_bonus(hass, hass_ws_client, env):
    admin = await hass_ws_client(hass)
    await _setup_kid(admin, env)
    bonus = await _task(admin, category="bonus", interval=365)
    sam = await hass_ws_client(hass, env["sam"][1])
    res = (await _call(sam, "task_organizer/my_complete_task", task_id=bonus))["result"]
    assert res == {"success": False, "error": "not_eligible"}
    anna = await hass_ws_client(hass, env["anna"][1])
    res = (await _call(anna, "task_organizer/my_complete_task", task_id=bonus))["result"]
    assert res["success"] is True
