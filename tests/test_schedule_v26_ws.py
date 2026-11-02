"""FamilyMission 2.6, step 10: weekend windows, homework (Mon-Fri) with room blitz after homework, school holidays
(absence kind and calendar) and the live medication stock that a stale settings draft cannot overwrite."""

from datetime import date, datetime, timedelta, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.core import SupportsResponse
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission import (
    _async_apply_absences,
    _async_check_care_stock,
    _async_check_reminders,
    _async_check_school_holidays,
    _async_sync_care_stock,
)
from custom_components.family_mission.const import DOMAIN
from custom_components.family_mission.kids import is_open

LENA = "person.lena"
PIN = "1234"
CAL = "calendar.schulferien"


def local(day: date, hh: int, mm: int = 0) -> datetime:
    """A local (US/Pacific) wall clock time as the UTC datetime the freezer wants."""
    return dt_util.as_utc(datetime(day.year, day.month, day.day, hh, mm, tzinfo=dt_util.get_default_time_zone()))


THU = date(2026, 10, 29)
FRI = date(2026, 10, 30)
SAT = date(2026, 10, 31)
SUN = date(2026, 11, 1)
MON = date(2026, 11, 2)
TUE = date(2026, 11, 3)


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


_call.n = 5000


def _data(hass):
    return hass.data[DOMAIN]["data"]


@pytest.fixture
async def env(hass, hass_ws_client, freezer):
    anna = await _token(hass, "Anna")
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set(LENA, "home", {"friendly_name": "Lena"})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"parents": [anna[0].id]})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    admin = await hass_ws_client(hass)
    anna_ws = await hass_ws_client(hass, anna[1])
    res = await _call(admin, "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, pin=PIN)
    assert res["success"], res
    freezer.move_to(local(THU, 8))
    return {"entry": entry, "admin": admin, "anna": anna_ws, "hass": hass}


async def _add(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 3, "icon": "mdi:broom", "category": "basis", "assignees": [LENA]}
    payload.update(kw)
    res = await _call(ws, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _complete(env, task_id):
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=task_id, kid_id=LENA, pin=PIN)
    assert res["success"], res
    return res["result"]


def _due_day(hass, tid):
    return dt_util.as_local(datetime.fromisoformat(_data(hass)["tasks"][tid]["due_date"])).date()


async def _homework_and_blitz(env, **blitz):
    hw = await _add(env["admin"], name="Hausaufgaben", catalog_key="homework", weekdays=[0, 1, 2, 3, 4],
                    available_from="13:30", available_until="18:00")
    rb = await _add(env["admin"], name="Zimmer-Blitz", catalog_key="room_blitz", after_key="homework",
                    available_from="16:00", available_until="19:30", **blitz)
    return hw, rb


# ---------------------------------------------------------------------------
# after_key: room blitz after homework
# ---------------------------------------------------------------------------

async def test_blitz_after_pending_error_and_release(hass, env, freezer):
    hw, rb = await _homework_and_blitz(env)
    freezer.move_to(local(THU, 16, 30))
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=rb, kid_id=LENA, pin=PIN)
    assert res["result"] == {"success": False, "error": "after_pending"}
    # steps cannot be ticked either: not eligible yet
    assert _data(hass)["tasks"][rb]["after_key"] == "homework"
    # the homework is done -> the blitz is released
    await _complete(env, hw)
    assert _due_day(hass, hw) == FRI
    await _complete(env, rb)
    assert _due_day(hass, rb) == FRI


async def test_blitz_is_free_when_there_is_no_homework_today(hass, env, freezer):
    hw, rb = await _homework_and_blitz(env)
    # the homework was last done on Friday -> due Monday; on Saturday it is not due, so the blitz is free
    freezer.move_to(local(SAT, 11))
    _data(hass)["tasks"][hw]["due_date"] = dt_util.as_utc(dt_util.start_of_local_day(MON)).isoformat()
    _data(hass)["tasks"][rb]["due_date"] = dt_util.as_utc(dt_util.start_of_local_day(SAT)).isoformat()
    res = await _call(env["admin"], "family_mission/edit_task", task_id=rb, available_from_we="10:00", available_until_we="18:00")
    assert res["success"]
    await _complete(env, rb)            # Saturday 11:00: weekend window open (the weekday window starts at 16:00)
    assert _due_day(hass, rb) == SUN


async def test_school_holiday_and_absence_release_the_blitz(hass, env, freezer):
    hw, rb = await _homework_and_blitz(env)
    freezer.move_to(local(THU, 16, 30))
    res = await _call(env["anna"], "family_mission/absence_add", kind="school_holiday", **{"from": "2026-10-29", "to": "2026-11-06"})
    assert res["success"] and res["result"]["absence"]["kids"] == "all"
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=hw, kid_id=LENA, pin=PIN)
    assert res["result"] == {"success": False, "error": "not_eligible"}        # the homework itself is paused
    await _complete(env, rb)                                                   # the blitz does not wait for it


async def test_reminder_waits_until_the_task_is_released(hass, env, freezer):
    hw, rb = await _homework_and_blitz(env, reminder_at="16:00")
    freezer.move_to(local(THU, 16, 30))
    assert await _async_check_reminders(hass) == 0
    assert _data(hass)["tasks"][rb].get("reminded_on") is None
    await _complete(env, hw)
    assert await _async_check_reminders(hass) == 1


async def test_after_key_is_validated_and_editable(hass, env):
    rb = await _add(env["admin"], name="Blitz", after_key="homework")
    assert _data(hass)["tasks"][rb]["after_key"] == "homework"
    res = await _call(env["admin"], "family_mission/edit_task", task_id=rb, after_key="Not A Key!")
    assert res["success"] and "after_key" not in _data(hass)["tasks"][rb]
    res = await _call(env["admin"], "family_mission/edit_task", task_id=rb, after_key="homework")
    assert _data(hass)["tasks"][rb]["after_key"] == "homework"
    res = await _call(env["admin"], "family_mission/edit_task", task_id=rb, after_key=None)
    assert "after_key" not in _data(hass)["tasks"][rb]


# ---------------------------------------------------------------------------
# weekend windows
# ---------------------------------------------------------------------------

async def test_weekend_window_is_used_on_saturday(hass, env, freezer):
    tid = await _add(env["admin"], name="Morgen", available_from="05:00", available_until="10:00",
                     available_from_we="06:00", available_until_we="11:00")
    task = _data(hass)["tasks"][tid]
    assert (task["available_from_we"], task["available_until_we"]) == ("06:00", "11:00")
    # a weekday 05:30: open
    freezer.move_to(local(THU, 5, 30))
    assert (await _call(env["admin"], "family_mission/kid_complete_task", task_id=tid, kid_id=LENA, pin=PIN))["result"]["success"]
    # Saturday 05:30: not yet - and the error names the WEEKEND start
    _data(hass)["tasks"][tid]["due_date"] = dt_util.as_utc(dt_util.start_of_local_day(SAT)).isoformat()
    freezer.move_to(local(SAT, 5, 30))
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=tid, kid_id=LENA, pin=PIN)
    assert res["result"] == {"success": False, "error": "not_yet", "available_from": "06:00"}
    # Saturday 10:30: still open (weekday window would be over)
    freezer.move_to(local(SAT, 10, 30))
    assert (await _call(env["admin"], "family_mission/kid_complete_task", task_id=tid, kid_id=LENA, pin=PIN))["result"]["success"]
    # Sunday after the weekend window: too late
    _data(hass)["tasks"][tid]["due_date"] = dt_util.as_utc(dt_util.start_of_local_day(SUN)).isoformat()
    freezer.move_to(local(SUN, 11, 30))
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=tid, kid_id=LENA, pin=PIN)
    assert res["result"] == {"success": False, "error": "too_late", "available_until": "11:00"}


async def test_weekend_window_edit_validation_and_template(hass, env):
    # an invalid time is a schema error and stores nothing
    res = await _call(env["admin"], "family_mission/add_task", name="T", interval=1, complexity=2, icon="mdi:broom",
                      available_from_we="25:99")
    assert res["success"] is False
    tid = await _add(env["admin"], name="T")
    assert "available_from_we" not in _data(hass)["tasks"][tid]
    res = await _call(env["admin"], "family_mission/edit_task", task_id=tid, available_from_we="07:00", available_until_we="09:00")
    assert res["success"] and _data(hass)["tasks"][tid]["available_from_we"] == "07:00"
    res = await _call(env["admin"], "family_mission/edit_task", task_id=tid, available_from_we="", available_until_we=None)
    assert "available_from_we" not in _data(hass)["tasks"][tid] and "available_until_we" not in _data(hass)["tasks"][tid]
    res = await _call(env["admin"], "family_mission/add_template", name="Vorlage", description="", area="", complexity=2,
                      icon="mdi:broom", interval=1, available_from="14:00", available_from_we="09:00", after_key="homework")
    assert res["success"], res
    template = next(iter(_data(hass)["templates"].values()))
    assert template["available_from_we"] == "09:00" and template["after_key"] == "homework"
    res = await _call(env["admin"], "family_mission/edit_template", template_id=template["id"], available_from_we="")
    assert "available_from_we" not in _data(hass)["templates"][template["id"]]


# ---------------------------------------------------------------------------
# wizard: homework Mon-Fri, windows, protection of customizations
# ---------------------------------------------------------------------------

WIZ = {"kids": [{"id": LENA, "birth_year": 2016, "avatar": "🦊", "color": "#FF7043"}], "features": ["school"],
       "start_date": "2026-10-31", "phase": "normal", "language": "de"}


def _by_key(hass):
    return {t["wizard_key"]: t for t in _data(hass)["tasks"].values() if t.get("wizard_key")}


async def test_wizard_creates_homework_for_school_households_on_weekdays_only(hass, env, freezer):
    freezer.move_to(local(SAT, 12))
    res = await _call(env["admin"], "family_mission/wizard_apply", **WIZ)
    assert res["success"], res
    tasks = _by_key(hass)
    hw = tasks[f"homework:{LENA}"]
    assert hw["name"] == "Hausaufgaben / Lernzeit Lena" and hw["weekdays"] == [0, 1, 2, 3, 4]
    assert hw["complexity"] == 3 and hw["scope"] == "personal" and hw["requires_approval"] is False
    assert (hw["available_from"], hw["available_until"]) == ("13:30", "18:00")
    assert hw["subtasks"][0]["title"] == "Arbeitsplatz frei" and len(hw["subtasks"]) == 5
    assert _due_day(hass, hw["id"]) == MON                      # the start is a Saturday: first due Monday
    blitz = tasks[f"room_blitz:{LENA}"]
    assert blitz["after_key"] == "homework" and (blitz["available_from"], blitz["available_until"]) == ("16:00", "19:30")
    assert (blitz["available_from_we"], blitz["available_until_we"]) == ("10:00", "18:00")
    morning = tasks[f"morning:{LENA}"]
    assert (morning["available_from_we"], morning["available_until_we"]) == ("06:00", "11:00")
    # no school: no homework task
    _data(hass)["tasks"].clear()
    res = await _call(env["admin"], "family_mission/wizard_apply", **{**WIZ, "features": []})
    assert f"homework:{LENA}" not in _by_key(hass)


async def test_homework_is_only_due_monday_to_friday(hass, env, freezer):
    freezer.move_to(local(MON, 12))
    assert (await _call(env["admin"], "family_mission/wizard_apply", **{**WIZ, "start_date": "2026-11-02"}))["success"]
    hw = _by_key(hass)[f"homework:{LENA}"]
    assert _due_day(hass, hw["id"]) == MON
    freezer.move_to(local(MON, 14))
    for subtask in hw["subtasks"]:
        subtask["done"] = True
    await _complete(env, hw["id"])
    assert _due_day(hass, hw["id"]) == TUE
    # Friday's completion jumps over the weekend
    friday = date(2026, 11, 6)
    freezer.move_to(local(friday, 14))
    hw["due_date"] = dt_util.as_utc(dt_util.start_of_local_day(friday)).isoformat()
    for subtask in hw["subtasks"]:
        subtask["done"] = True
    await _complete(env, hw["id"])
    assert _due_day(hass, hw["id"]) == date(2026, 11, 9)
    freezer.move_to(local(date(2026, 11, 7), 14))                 # Saturday
    assert not is_open(hw, dt_util.now(), 5)


async def test_wizard_rerun_updates_old_windows_but_keeps_customized_ones(hass, env, freezer):
    freezer.move_to(local(MON, 12))
    assert (await _call(env["admin"], "family_mission/wizard_apply", **{**WIZ, "start_date": "2026-11-02"}))["success"]
    tasks = _by_key(hass)
    blitz, deep = tasks[f"room_blitz:{LENA}"], tasks[f"room_deep:{LENA}"]
    # a task as it was created before 2.6: old window, no weekend window, no after_key, uncustomized
    for key in ("available_from_we", "available_until_we", "after_key"):
        blitz.pop(key, None)
    blitz["available_from"], blitz["available_until"], blitz["customized"] = "14:00", "19:30", []
    deep["available_from"], deep["customized"] = "08:00", ["available_from"]
    assert (await _call(env["admin"], "family_mission/wizard_apply", replace_existing=True, **{**WIZ, "start_date": "2026-11-02"}))["success"]
    assert blitz["available_from"] == "16:00" and blitz["after_key"] == "homework" and blitz["available_from_we"] == "10:00"
    assert deep["available_from"] == "08:00" and deep["available_until"] == "19:00"      # customized start kept
    # the parent switches the dependency off: it is remembered and the wizard keeps it
    res = await _call(env["admin"], "family_mission/edit_task", task_id=blitz["id"], after_key=None, available_from_we="09:00")
    assert res["success"]
    assert set(blitz["customized"]) == {"after_key", "available_from_we"}
    assert (await _call(env["admin"], "family_mission/wizard_apply", replace_existing=True, **{**WIZ, "start_date": "2026-11-02"}))["success"]
    assert "after_key" not in blitz and blitz["available_from_we"] == "09:00"


async def test_migration_marks_old_uncustomized_wizard_tasks_as_uncustomized(hass, env):
    from custom_components.family_mission import _migrate_wizard_customized

    entry = {
        "id": "old", "wizard_key": f"room_blitz:{LENA}", "generated_by": "wizard", "name": "Zimmer-Blitz (10 Minuten) Lena",
        "complexity": 3, "icon": "mdi:timer-outline", "category": "basis", "min_age": 8, "allow_together": False,
        "interval": 1, "available_from": "14:00", "available_until": "19:30", "requires_approval": True,
        "subtasks": [{"title": t, "done": False} for t in (
            "Boden frei", "Spielzeug/Sachen in die Kisten", "Schreibtisch frei", "Kleidung in Schrank oder Wäschekorb")],
        "assignees": [LENA], "description": "",
    }
    _data(hass)["tasks"]["old"] = entry
    assert _migrate_wizard_customized(_data(hass), env["entry"].options) == 1
    assert entry["customized"] == []          # the old 14:00 window is not reported as a customization


async def test_flow_catalog_websocket_has_the_new_fields(hass, env):
    res = await _call(env["admin"], "family_mission/kids_catalog")
    entries = {e["key"]: e for e in res["result"]["entries"]}
    assert entries["homework"]["weekdays"] == [0, 1, 2, 3, 4] and entries["homework"]["scope"] == "personal"
    assert entries["room_blitz"]["after_key"] == "homework" and entries["room_blitz"]["available_from_we"] == "10:00"
    assert entries["morning"]["available_until_we"] == "11:00"


# ---------------------------------------------------------------------------
# school holidays
# ---------------------------------------------------------------------------

async def test_school_holiday_pauses_homework_and_school_steps_only(hass, env, freezer):
    freezer.move_to(local(MON, 12))
    assert (await _call(env["admin"], "family_mission/wizard_apply", **{**WIZ, "start_date": "2026-11-02"}))["success"]
    tasks = _by_key(hass)
    hw, morning, evening = tasks[f"homework:{LENA}"], tasks[f"morning:{LENA}"], tasks[f"evening:{LENA}"]
    freezer.move_to(local(MON, 7))
    morning["due_date"] = evening["due_date"] = dt_util.as_utc(dt_util.start_of_local_day(MON)).isoformat()
    titles = [s["title"] for s in morning["subtasks"]]
    assert "Brotdose & Trinkflasche einpacken" in titles
    # without a holiday the school step blocks the mission
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=morning["id"], kid_id=LENA, pin=PIN)
    assert res["result"] == {"success": False, "error": "steps_open"}
    for subtask in morning["subtasks"]:
        subtask["done"] = subtask["title"] != "Brotdose & Trinkflasche einpacken"
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=morning["id"], kid_id=LENA, pin=PIN)
    assert res["result"]["error"] == "steps_open"
    # school holiday for Lena (one week)
    res = await _call(env["anna"], "family_mission/absence_add", kind="school_holiday", kids=[LENA],
                      **{"from": "2026-11-02", "to": "2026-11-06", "note": "Herbstferien"})
    assert res["success"], res
    assert res["result"]["absence"]["care"] is True and res["result"]["absence"]["personal"] is False
    client_tasks = (await _call(env["admin"], "family_mission/get_data"))["result"]["tasks"]
    assert client_tasks[morning["id"]]["school_free_for"] == [LENA]
    assert "school_free_for" not in client_tasks[hw["id"]]
    # the homework is paused (moved behind the holiday); the morning mission is not paused
    assert _due_day(hass, hw["id"]) == date(2026, 11, 9)
    assert "absent_for" in client_tasks[hw["id"]] and "absent_for" not in client_tasks[morning["id"]]
    # the school step no longer blocks
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=morning["id"], kid_id=LENA, pin=PIN)
    assert res["result"]["success"], res
    # the evening mission (school bag) also does not need its school step
    freezer.move_to(local(MON, 18))
    for subtask in evening["subtasks"]:
        subtask["done"] = subtask["title"] != "Schulranzen packen"
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=evening["id"], kid_id=LENA, pin=PIN)
    assert res["result"]["success"], res
    # the holiday is over on the 9th: the homework is due again
    freezer.move_to(local(date(2026, 11, 9), 14))
    assert is_open(hw, dt_util.now(), 5)


async def test_school_holiday_can_be_ended_like_any_absence(hass, env, freezer):
    res = await _call(env["anna"], "family_mission/absence_add", kind="school_holiday", **{"from": "2026-11-02", "to": "2026-11-06"})
    absence_id = res["result"]["absence_id"]
    assert res["result"]["absence"]["kids"] == "all"
    # the sheet sends an empty kid list for "all kids"
    res2 = await _call(env["anna"], "family_mission/absence_add", kind="school_holiday", kids=[], **{"from": "2026-11-09", "to": "2026-11-10"})
    assert res2["result"]["absence"]["kids"] == "all"
    assert (await _call(env["anna"], "family_mission/absence_delete", absence_id=res2["result"]["absence_id"]))["result"]["success"]
    assert (await _call(env["anna"], "family_mission/absence_delete", absence_id=absence_id))["result"]["success"]
    assert _data(hass)["absences"] == []


def _calendar_service(hass, events, fail=False):
    calls = []

    async def _handler(call):
        calls.append(call.data)
        if fail:
            raise RuntimeError("calendar offline")
        ids = call.data["entity_id"]
        ids = ids if isinstance(ids, list) else [ids]
        return {eid: {"events": events} for eid in ids}

    hass.services.async_register("calendar", "get_events", _handler, supports_response=SupportsResponse.ONLY)
    return calls


async def _set_calendar(env, value):
    res = await _call(env["admin"], "family_mission/update_settings", settings={"school_holiday_calendar": value})
    assert res["success"], res
    await env["hass"].async_block_till_done()


async def test_calendar_driven_school_holiday(hass, env, freezer):
    hw, rb = await _homework_and_blitz(env)
    events = [
        {"start": "2026-10-29", "end": "2026-10-31", "summary": "Herbstferien"},                 # Thu + Fri (end exclusive)
        {"start": "2026-11-04T09:00:00-08:00", "end": "2026-11-04T10:00:00-08:00", "summary": "Elternabend"},
    ]
    calls = _calendar_service(hass, events)
    freezer.move_to(local(THU, 16, 30))
    # without the setting nothing is read
    assert await _async_check_school_holidays(hass) is False and calls == []
    await _set_calendar(env, CAL)
    assert len(calls) == 1 and calls[0]["entity_id"] == [CAL]
    assert env["entry"].options["school_holiday_calendar"] == CAL
    assert _data(hass)["school_holiday_cal"]["days"] == ["2026-10-29", "2026-10-30"]
    # read only: never stored as an absence, but listed (and marked) for the cards
    assert _data(hass)["absences"] == []
    listed = (await _call(env["admin"], "family_mission/get_data"))["result"]["absences"]
    assert [(a["kind"], a["from"], a["to"], a.get("calendar")) for a in listed] == [("school_holiday", "2026-10-29", "2026-10-30", True)]
    # homework is paused today, the blitz does not wait for it
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=hw, kid_id=LENA, pin=PIN)
    assert res["result"]["error"] == "not_eligible"
    await _complete(env, rb)
    # cached: a second check within the hour does not read again; forcing does
    assert await _async_check_school_holidays(hass) is False and len(calls) == 1
    assert await _async_check_school_holidays(hass, force=True) is False and len(calls) == 2
    # Saturday: a new day is read again; the days that are over are dropped
    freezer.move_to(local(SAT, 10))
    assert await _async_check_school_holidays(hass) is True
    assert len(calls) == 3 and _data(hass)["school_holiday_cal"]["days"] == []
    # a longer holiday: the days change, the paused homework moves behind them
    events[:] = [{"start": "2026-10-29", "end": "2026-11-04", "summary": "Herbstferien"}]
    assert await _async_check_school_holidays(hass, force=True) is True
    assert _data(hass)["school_holiday_cal"]["days"][-1] == "2026-11-03"
    assert _due_day(hass, hw) == MON                       # moved behind the first holiday check; Monday is paused now
    freezer.move_to(local(MON, 8))
    await _async_apply_absences(hass)                      # the midnight run: Monday and Tuesday are holidays too
    assert _due_day(hass, hw) == date(2026, 11, 4)
    # switching the setting off clears the days again
    await _set_calendar(env, "")
    assert "school_holiday_cal" not in _data(hass)
    assert (await _call(env["admin"], "family_mission/get_data"))["result"]["absences"] == []


async def test_calendar_errors_keep_the_last_days_and_the_setting_is_validated(hass, env, freezer):
    events = [{"start": "2026-10-29", "end": "2026-10-30", "summary": "Ferien"}]
    _calendar_service(hass, events)
    await _set_calendar(env, CAL)
    assert _data(hass)["school_holiday_cal"]["days"] == ["2026-10-29"]
    hass.services.async_remove("calendar", "get_events")
    _calendar_service(hass, events, fail=True)
    assert await _async_check_school_holidays(hass, force=True) is False
    assert _data(hass)["school_holiday_cal"]["days"] == ["2026-10-29"]        # the calendar is unreachable: nothing lost
    # never a hard dependency: without the calendar service nothing breaks
    hass.services.async_remove("calendar", "get_events")
    assert await _async_check_school_holidays(hass, force=True) is False
    # only calendar entities are accepted
    for bad in ("sensor.battery", "calendar.", "Calendar.Ferien", 12, None, "calendar.a b", "calendar.x;y"):
        await _set_calendar(env, bad)
        assert env["entry"].options["school_holiday_calendar"] == "", bad
    await _set_calendar(env, f"  {CAL} ")
    assert env["entry"].options["school_holiday_calendar"] == CAL


# ---------------------------------------------------------------------------
# medication stock: live counter in the data store
# ---------------------------------------------------------------------------

def _care(**kw):
    return {"id": "pill", "label": "Tablette", "emoji": "💊", "anchor": "time", "time": "08:00", **kw}


async def _save_profile(env, care):
    res = await _call(env["admin"], "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, care=care)
    assert res["success"], res
    await env["hass"].async_block_till_done()


def _live(hass):
    return (_data(hass).get("care_stock") or {}).get(f"{LENA}:pill")


def _profile_care(env):
    return env["entry"].options["kids"][LENA]["care"][0]


async def _taken(env, status="taken"):
    res = await _call(env["admin"], "family_mission/kid_care_answer", kid_id=LENA, pin=PIN, care_id="pill", status=status)
    assert res["result"]["success"], res
    await env["hass"].async_block_till_done()


async def test_live_stock_is_kept_in_the_data_store(hass, env, freezer):
    await _save_profile(env, [_care(stock=30, per_dose=2)])
    token = _profile_care(env)["stock_set_at"]
    assert token and _live(hass) == {"remaining": 30, "set_at": token}
    await _taken(env)
    assert _live(hass)["remaining"] == 28
    assert _profile_care(env)["stock"] == 30                       # the profile keeps what was ENTERED
    data = (await _call(env["admin"], "family_mission/get_data"))["result"]
    assert data["care_stock"][f"{LENA}:pill"]["remaining"] == 28
    assert data["settings"]["kids"][LENA]["care"][0]["stock"] == 30
    item = data["care_today"][LENA][0]
    assert item["stock_left"] == 28
    await _taken(env, "declined")
    assert _live(hass)["remaining"] == 30


async def test_stale_settings_draft_does_not_overwrite_the_counted_down_stock(hass, env, freezer):
    await _save_profile(env, [_care(stock=30)])
    draft = (await _call(env["admin"], "family_mission/get_data"))["result"]["settings"]["kids"][LENA]["care"]    # the card loads it
    await _taken(env)
    assert _live(hass)["remaining"] == 29
    # a later save of the OLD draft (same entered stock, same token)
    await _save_profile(env, draft)
    assert _live(hass)["remaining"] == 29
    # a draft without a token (older client) and the same value behaves the same
    await _save_profile(env, [_care(stock=30)])
    assert _live(hass)["remaining"] == 29
    # an edit of other fields (label) keeps the counter as well
    await _save_profile(env, [{**draft[0], "label": "Pille"}])
    assert _live(hass)["remaining"] == 29 and _profile_care(env)["label"] == "Pille"
    # restocking: a new value restarts it
    freezer.tick(timedelta(hours=1))
    await _save_profile(env, [{**draft[0], "stock": 60}])
    assert _live(hass)["remaining"] == 60 and _profile_care(env)["stock"] == 60
    new_token = _profile_care(env)["stock_set_at"]
    assert new_token != draft[0]["stock_set_at"]
    freezer.move_to(local(FRI, 8))                                  # the next day's dose
    await _taken(env)
    assert _live(hass)["remaining"] == 59
    # a draft from before the restock (old value, OLD token) must not bring the old stock back
    await _save_profile(env, draft)
    assert _live(hass)["remaining"] == 59 and _profile_care(env)["stock"] == 60
    assert _profile_care(env)["stock_set_at"] == new_token
    # entering the same number again with a fresh token is a deliberate restart
    await _save_profile(env, [{**draft[0], "stock": 60, "stock_set_at": "2999-01-01T00:00:00+00:00"}])
    assert _live(hass)["remaining"] == 60


async def test_removing_the_stock_drops_the_live_counter_and_the_follow_up(hass, env, freezer):
    await _save_profile(env, [_care(stock=2)])
    assert _live(hass)["remaining"] == 2
    assert [t for t in _data(hass)["tasks"].values() if t.get("auto_key", "").startswith("care_stock")]
    await _save_profile(env, [_care()])
    assert _live(hass) is None and _data(hass)["care_stock"] == {}
    assert not [t for t in _data(hass)["tasks"].values() if t.get("auto_key", "").startswith("care_stock")]


async def test_stock_migrates_from_the_profile_once(hass, env, freezer):
    # a profile of an older version: the counted-down stock sits in the profile, no live record, no token
    kids = {k: dict(v) for k, v in env["entry"].options["kids"].items()}
    kids[LENA]["care"] = [{"id": "pill", "label": "Tablette", "anchor": "time", "time": "08:00", "stock": 12, "per_dose": 1}]
    hass.config_entries.async_update_entry(env["entry"], options={**env["entry"].options, "kids": kids})
    _data(hass).pop("care_stock", None)
    assert await _async_sync_care_stock(hass) is True
    token = _profile_care(env)["stock_set_at"]
    assert token and _live(hass) == {"remaining": 12, "set_at": token}
    # counted down in the data store; a second run changes nothing
    _data(hass)["care_stock"][f"{LENA}:pill"]["remaining"] = 9
    assert await _async_sync_care_stock(hass) is False
    assert _live(hass)["remaining"] == 9 and _profile_care(env)["stock"] == 12
    # records of entries that no longer exist are dropped
    _data(hass)["care_stock"]["person.ghost:x"] = {"remaining": 1, "set_at": ""}
    assert await _async_sync_care_stock(hass) is True
    assert "person.ghost:x" not in _data(hass)["care_stock"]
    await _async_check_care_stock(hass)


async def test_setup_migrates_an_existing_profile_stock(hass, hass_ws_client):
    hass.states.async_set(LENA, "home", {"friendly_name": "Lena"})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"kids": {LENA: {
        "avatar": "🦊", "color": "#ff8800", "birth_year": 2016,
        "care": [{"id": "pill", "label": "Tablette", "anchor": "time", "time": "08:00", "stock": 14, "per_dose": 2}],
    }}})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    live = _data(hass)["care_stock"][f"{LENA}:pill"]
    assert live["remaining"] == 14 and live["set_at"] == entry.options["kids"][LENA]["care"][0]["stock_set_at"]
