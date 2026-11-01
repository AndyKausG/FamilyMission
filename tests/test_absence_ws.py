"""FamilyMission 2.6: absences (trip / away / sick) - crud, pausing, no "missed", rotation, waste, care, goal, suggestion."""

from datetime import date, datetime, timedelta, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.core import SupportsResponse
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import (
    _async_announce,
    _async_check_absence_suggest,
    _async_check_care,
    _async_check_reminders,
    _async_check_waste,
    _async_expire_missed,
    _async_open_bonus_task,
    _async_rollover_parent_tasks,
    _ensure_data_defaults,
)
from custom_components.family_mission.const import DOMAIN
from custom_components.family_mission.kids import is_open

THU = datetime(2026, 10, 29, 15, 0, tzinfo=timezone.utc)              # Thu 08:00 local (US/Pacific, PDT)
THU_1730 = datetime(2026, 10, 30, 0, 30, tzinfo=timezone.utc)         # Thu 17:30 local
AFTER_DEADLINE = datetime(2026, 10, 29, 17, 30, tzinfo=timezone.utc)  # Thu 10:30 local
LENA, TOM = "person.lena", "person.tom"
PIN = "1234"
DAY = {"thu": date(2026, 10, 29), "fri": date(2026, 10, 30), "sat": date(2026, 10, 31), "sun": date(2026, 11, 1),
       "mon": date(2026, 11, 2)}


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


_call.n = 3000


@pytest.fixture
async def env(hass, hass_ws_client, freezer):
    anna = await _token(hass, "Anna")      # parent
    sam = await _token(hass, "Sam")        # no role
    max_ = await _token(hass, "Max")       # kid with an HA user
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set(LENA, "home", {"friendly_name": "Lena"})
    hass.states.async_set(TOM, "home", {"friendly_name": "Tom"})
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
    }
    for pid in (LENA, TOM, max_[0].id):
        res = await _call(admin, "family_mission/set_kid_profile", participant_id=pid, avatar="🦊",
                          color="#ff8800", birth_year=2016, pin=PIN)
        assert res["success"], res
    freezer.move_to(THU)
    return {"entry": entry, "push": push, "max_id": max_[0].id, **clients}


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _iso(day):
    return day.isoformat()


async def _absence(ws, kind="away", kids=(LENA,), start="thu", end="fri", **kw):
    payload = {"kind": kind, "from": _iso(DAY[start]), "to": _iso(DAY[end]), **kw}
    if kind != "trip":
        payload["kids"] = list(kids)
    res = await _call(ws, "family_mission/absence_add", **payload)
    return res


async def _add(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis", "assignees": [LENA]}
    payload.update(kw)
    res = await _call(ws, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


def _due_day(hass, tid):
    return dt_util.as_local(datetime.fromisoformat(_data(hass)["tasks"][tid]["due_date"])).date()


def _open(hass, tid):
    return is_open(_data(hass)["tasks"][tid], dt_util.now(), 5)


# ---------------------------------------------------------------------------
# crud / validation / roles
# ---------------------------------------------------------------------------

async def test_add_end_delete_and_list_in_get_data(hass, env, freezer):
    res = await _absence(env["anna"], "away", [LENA], "thu", "sun", note="  Oma  ")
    assert res["success"], res
    absence = res["result"]["absence"]
    assert absence["kind"] == "away" and absence["kids"] == [LENA] and absence["note"] == "Oma"
    assert absence["from"] == "2026-10-29" and absence["to"] == "2026-11-01"
    assert absence["personal"] is False and absence["care"] is False
    listed = (await _call(env["admin"], "family_mission/get_data"))["result"]["absences"]
    assert [a["id"] for a in listed] == [absence["id"]]

    # ending a running absence: it lasted until yesterday
    freezer.move_to(THU + timedelta(days=1))
    res = await _call(env["anna"], "family_mission/absence_end", absence_id=absence["id"])
    assert res["success"] and res["result"] == {"success": True, "deleted": False}
    assert _data(hass)["absences"][0]["to"] == "2026-10-29"

    # one that has not started is deleted; delete removes a stored one; unknown ids are reported
    future = (await _absence(env["anna"], "sick", [LENA], "mon", "mon"))["result"]["absence_id"]
    res = await _call(env["anna"], "family_mission/absence_end", absence_id=future)
    assert res["result"] == {"success": True, "deleted": True}
    assert [a["id"] for a in _data(hass)["absences"]] == [absence["id"]]
    res = await _call(env["anna"], "family_mission/absence_delete", absence_id=absence["id"])
    assert res["result"] == {"success": True} and _data(hass)["absences"] == []
    assert (await _call(env["anna"], "family_mission/absence_delete", absence_id="nope"))["result"]["success"] is False
    assert (await _call(env["anna"], "family_mission/absence_end", absence_id="nope"))["result"]["success"] is False


async def test_validation_and_roles(hass, env):
    bad = [
        dict(kind="holiday", kids=[LENA], **{"from": "2026-10-29", "to": "2026-10-30"}),
        dict(kind="away", kids=[LENA], **{"from": "2026-10-30", "to": "2026-10-29"}),         # to before from
        dict(kind="away", kids=[LENA], **{"from": "2026-10-29", "to": "2027-04-01"}),         # more than 120 days
        dict(kind="away", kids=[], **{"from": "2026-10-29", "to": "2026-10-30"}),
        dict(kind="away", **{"from": "2026-10-29", "to": "2026-10-30"}),                      # no kids
        dict(kind="sick", kids=["person.ghost"], **{"from": "2026-10-29", "to": "2026-10-30"}),
        dict(kind="away", kids=[LENA], **{"from": "29.10.2026", "to": "2026-10-30"}),
    ]
    for payload in bad:
        res = await _call(env["anna"], "family_mission/absence_add", **payload)
        assert res["success"] is False and res["error"]["code"] == "invalid_absence", payload
    assert _data(hass)["absences"] == []
    # a trip covers everybody whatever kids says; exactly 120 days are fine
    res = await _call(env["anna"], "family_mission/absence_add", kind="trip", kids=[LENA],
                      **{"from": "2026-10-29", "to": "2027-02-25"})
    assert res["result"]["absence"]["kids"] == "all" and res["result"]["absence"]["care"] is True
    # no role -> unauthorized
    res = await _call(env["sam"], "family_mission/absence_add", kind="trip", **{"from": "2026-10-29", "to": "2026-10-30"})
    assert res["error"]["code"] == "unauthorized"
    absence_id = _data(hass)["absences"][0]["id"]
    for command in ("absence_end", "absence_delete"):
        assert (await _call(env["sam"], f"family_mission/{command}", absence_id=absence_id))["error"]["code"] == "unauthorized"
    assert len(_data(hass)["absences"]) == 1
    # the admin may
    assert (await _absence(env["admin"], "sick", [LENA], "thu", "thu"))["success"]


async def test_absences_cannot_be_written_through_settings(hass, env):
    res = await _call(env["admin"], "family_mission/update_settings", settings={"absences": [{"kind": "trip"}]})
    assert res["success"]
    assert _data(hass)["absences"] == [] and "absences" not in env["entry"].options


# ---------------------------------------------------------------------------
# scope
# ---------------------------------------------------------------------------

async def test_scope_validation_edit_template_and_migration(hass, env):
    admin = env["admin"]
    home = await _add(admin)
    assert _data(hass)["tasks"][home]["scope"] == "home"                  # hand-made = home
    personal = await _add(admin, scope="personal")
    assert _data(hass)["tasks"][personal]["scope"] == "personal"
    junk = await _add(admin, scope="weird")
    assert _data(hass)["tasks"][junk]["scope"] == "home"
    assert (await _call(admin, "family_mission/edit_task", task_id=home, scope="personal"))["success"]
    assert _data(hass)["tasks"][home]["scope"] == "personal"
    assert (await _call(admin, "family_mission/edit_task", task_id=home, scope="nonsense"))["success"]
    assert _data(hass)["tasks"][home]["scope"] == "personal"              # invalid edits keep the value
    assert (await _call(admin, "family_mission/edit_task", task_id=home, name="renamed"))["success"]
    assert _data(hass)["tasks"][home]["scope"] == "personal"

    res = await _call(admin, "family_mission/add_template", name="Lesen", complexity=2, icon="mdi:x", scope="personal")
    template = _data(hass)["templates"][res["result"]["template_id"]]
    assert template["scope"] == "personal"
    assert (await _call(admin, "family_mission/edit_template", template_id=template["id"], scope="home"))["success"]
    assert template["scope"] == "home"
    await _call(admin, "family_mission/edit_template", template_id=template["id"], scope="personal")
    await hass.services.async_call(DOMAIN, "add_task", {"template": "Lesen"}, blocking=True)
    copied = [t for t in _data(hass)["tasks"].values() if t["name"] == "Lesen"][0]
    assert copied["scope"] == "personal"

    # migration of stored tasks: derived from the catalog key
    data = _data(hass)
    data["tasks"]["m"] = {"id": "m", "name": "Morgen", "wizard_key": "morning:person.lena", "generated_by": "wizard"}
    data["tasks"]["t"] = {"id": "t", "name": "Tisch", "wizard_key": "table_set:person.lena", "generated_by": "wizard"}
    data["tasks"]["x"] = {"id": "x", "name": "Eigenes"}
    _ensure_data_defaults(data)
    assert [data["tasks"][k]["scope"] for k in ("m", "t", "x")] == ["personal", "home", "home"]


# ---------------------------------------------------------------------------
# pausing, "missed", due date
# ---------------------------------------------------------------------------

async def test_no_missed_entry_and_due_date_moves_behind_the_absence(hass, env, freezer):
    away = await _add(env["admin"], assignees=[LENA])
    other = await _add(env["admin"], assignees=[TOM])
    assert _open(hass, away)
    assert (await _absence(env["anna"], "away", [LENA], "thu", "fri"))["success"]
    # due today but paused: moved behind the absence, original date remembered
    assert _due_day(hass, away) == DAY["sat"]
    assert _data(hass)["tasks"][away]["absence_from_due"]
    assert _due_day(hass, other) == DAY["thu"] and _open(hass, other)     # Tom is not away

    # the midnight check on Friday: nothing expires as "missed"
    freezer.move_to(THU + timedelta(days=1))
    _data(hass).pop("missed_checked", None)
    await _async_expire_missed(hass)
    missed = [h for h in _data(hass)["history"] if h["type"] == "missed" and h["task_id"] == away]
    assert missed == [] and _due_day(hass, away) == DAY["sat"]
    # Tom's task from yesterday did expire normally (control)
    assert [h["user_id"] for h in _data(hass)["history"] if h["type"] == "missed"] == [TOM]

    # the absence is over on Saturday: the task is due again, fresh, no marker left
    freezer.move_to(THU + timedelta(days=2))
    await _async_expire_missed(hass)
    assert _open(hass, away) and "absence_from_due" not in _data(hass)["tasks"][away]


async def test_early_end_releases_moved_duties(hass, env, freezer):
    tid = await _add(env["admin"], assignees=[LENA])
    res = await _absence(env["anna"], "sick", [LENA], "thu", "mon")
    assert _due_day(hass, tid) == DAY["mon"] + timedelta(days=1)
    freezer.move_to(THU + timedelta(days=1))                              # Friday: better again
    assert (await _call(env["anna"], "family_mission/absence_end", absence_id=res["result"]["absence_id"]))["success"]
    assert _due_day(hass, tid) == DAY["fri"] and _open(hass, tid)
    assert "absence_from_due" not in _data(hass)["tasks"][tid]


async def test_paused_task_is_not_eligible_and_not_remindable(hass, env):
    tid = await _add(env["admin"], assignees=[LENA], reminder_at="00:00")
    assert (await _absence(env["anna"], "away", [LENA], "thu", "thu"))["success"]
    # not even a (hypothetically) still-due paused task can be done or reminded
    _data(hass)["tasks"][tid]["due_date"] = dt_util.utcnow().isoformat()
    _data(hass)["tasks"][tid].pop("absence_from_due", None)
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=tid, kid_id=LENA, pin=PIN)
    assert res["result"] == {"success": False, "error": "not_eligible"}
    assert await _async_check_reminders(hass) == 0
    # a paused personal vs. home task: a sick kid keeps personal tasks only with the option
    personal = await _add(env["admin"], assignees=[TOM], scope="personal")
    assert (await _absence(env["anna"], "sick", [TOM], "thu", "thu", personal=True))["success"]
    assert _open(hass, personal)
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=personal, kid_id=TOM, pin=PIN)
    assert res["result"]["success"]


async def test_trip_pauses_home_and_personal_unless_kept(hass, env):
    home = await _add(env["admin"], assignees=[LENA], scope="home")
    personal = await _add(env["admin"], assignees=[TOM], scope="personal")
    res = await _absence(env["anna"], "trip", start="thu", end="sat", personal=True)
    assert res["success"]
    assert _due_day(hass, home) == DAY["sun"]                              # moved behind the trip
    assert _due_day(hass, personal) == DAY["thu"]                          # kept by the option
    tasks = (await _call(env["admin"], "family_mission/get_data"))["result"]["tasks"]
    assert tasks[personal].get("absent_for") is None


async def test_parent_tasks_pause_during_a_trip_and_are_not_carried(hass, env, freezer):
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Wäsche", interval=1)
    tid = res["result"]["task_id"]
    assert (await _absence(env["anna"], "trip", start="thu", end="fri"))["success"]
    assert _due_day(hass, tid) == DAY["sat"]
    freezer.move_to(THU + timedelta(days=1))
    assert await _async_rollover_parent_tasks(hass) == 0
    assert "carried_since" not in _data(hass)["tasks"][tid]
    tasks = (await _call(env["admin"], "family_mission/get_data"))["result"]["tasks"]
    assert tasks[tid]["absent_all"] is True
    freezer.move_to(THU + timedelta(days=2))
    assert (await _call(env["admin"], "family_mission/get_data"))["result"]["tasks"][tid].get("absent_all") is None


# ---------------------------------------------------------------------------
# rotation
# ---------------------------------------------------------------------------

async def test_rotation_skips_absent_member_and_continues_after_the_one_who_did_it(hass, env):
    members = [LENA, TOM, env["max_id"]]
    tid = await _add(env["admin"], assignees=members, rotation={"members": members})
    assert _data(hass)["tasks"][tid]["rotation"]["index"] == 0
    assert (await _absence(env["anna"], "away", [LENA], "thu", "fri"))["success"]
    task = (await _call(env["admin"], "family_mission/get_data"))["result"]["tasks"][tid]
    assert task["rotation_current"] == TOM and task["absent_for"] == [LENA]
    assert _data(hass)["tasks"][tid]["rotation"]["index"] == 0            # stored turn untouched

    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=tid, kid_id=LENA, pin=PIN)
    assert res["result"]["error"] == "not_eligible"
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=tid, kid_id=TOM, pin=PIN)
    assert res["result"]["success"], res
    # Tom did Lena's turn; the turn goes on after Tom
    assert _data(hass)["tasks"][tid]["rotation"]["index"] == 2


# ---------------------------------------------------------------------------
# trip: waste, trigger, announcements
# ---------------------------------------------------------------------------

def _wcs_calendar(hass, entity_id="calendar.abfall"):
    reg = er.async_get(hass)
    return reg.async_get_or_create(
        "calendar", "waste_collection_schedule", entity_id.split(".", 1)[1],
        suggested_object_id=entity_id.split(".", 1)[1]).entity_id


def _calendar_service(hass, events):
    async def _handler(call):
        ids = call.data["entity_id"]
        ids = ids if isinstance(ids, list) else [ids]
        return {eid: {"events": list(events)} for eid in ids}

    hass.services.async_register("calendar", "get_events", _handler, supports_response=SupportsResponse.ONLY)


async def test_waste_trigger_and_announcement_are_silent_during_a_trip(hass, env, freezer):
    _wcs_calendar(hass)
    _calendar_service(hass, [{"start": "2026-10-30", "end": "2026-10-31", "summary": "Restmüll"}])
    hass.config_entries.async_update_entry(env["entry"], options={
        **env["entry"].options, "waste_enabled": True, "waste_types": {"Restmüll": {"kids": True}},
        "announce_enabled": True, "announce_tts": "tts.google_de", "announce_players": ["media_player.kueche"],
    })
    await hass.async_block_till_done()
    speak = async_mock_service(hass, "tts", "speak")
    bonus = await _add(env["admin"], category="bonus", assignees=[], custom_due_date=(dt_util.now() + timedelta(days=20)).isoformat())

    freezer.move_to(THU_1730)
    res = await _absence(env["anna"], "trip", start="thu", end="fri")
    trip_id = res["result"]["absence_id"]
    assert await _async_check_waste(hass) == 0
    assert [t for t in _data(hass)["tasks"].values() if t.get("waste_key")] == []
    await _async_open_bonus_task(hass, {"task_id": bonus, "entity_id": "sensor.x", "to_state": "done"})
    assert not _open(hass, bonus)
    assert await _async_announce(hass, "goal", "Hallo") is False
    await hass.async_block_till_done()
    assert speak == []

    # the trip ends: all three work again
    assert (await _call(env["anna"], "family_mission/absence_end", absence_id=trip_id))["success"]
    assert await _async_check_waste(hass) == 1
    await _async_open_bonus_task(hass, {"task_id": bonus, "entity_id": "sensor.x", "to_state": "done"})
    assert _open(hass, bonus)
    await hass.async_block_till_done()
    assert await _async_announce(hass, "goal", "Hallo") is True


# ---------------------------------------------------------------------------
# care
# ---------------------------------------------------------------------------

def _care_mission(hass, kid=LENA):
    start = dt_util.as_utc(dt_util.start_of_local_day(dt_util.now().date())).isoformat()
    task = {
        "id": f"morning-{kid}", "name": "Morgen-Mission", "description": "", "area": "", "interval": 1,
        "assignees": [kid], "complexity": 2, "category": "basis", "min_age": 0, "icon": "mdi:weather-sunny",
        "due_date": start, "paused_until": None, "override_overdue_days": None, "subtasks": [],
        "wizard_key": f"morning:{kid}", "generated_by": "wizard", "scope": "personal",
    }
    _data(hass)["tasks"][task["id"]] = task
    return task["id"]


async def _set_care(env):
    res = await _call(env["admin"], "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, pin=PIN, care=[{"id": "pill", "label": "Tablette", "anchor": "morning"}])
    assert res["success"], res


async def _care_today(env):
    return (await _call(env["admin"], "family_mission/get_data"))["result"]["care_today"]


async def test_care_continues_on_a_trip_and_follows_the_flag_when_away(hass, env, freezer):
    await _set_care(env)
    task = _care_mission(hass)
    items = (await _care_today(env))[LENA]
    assert items[0]["mission_task_id"] == task

    # trip: the personal mission is paused, the medication stands on its own and continues
    trip = (await _absence(env["anna"], "trip", start="thu", end="thu"))["result"]["absence_id"]
    items = (await _care_today(env))[LENA]
    assert [i["id"] for i in items] == ["pill"] and items[0]["mission_task_id"] is None
    freezer.move_to(AFTER_DEADLINE)
    await _async_check_care(hass)
    assert [e["status"] for e in _data(hass)["care_log"]] == ["unanswered"]
    assert len(env["push"]) == 1                                          # the parents still hear about it

    # away without the care flag: no entry, no deadline, no push
    _data(hass)["care_log"] = []
    env["push"].clear()
    await _call(env["anna"], "family_mission/absence_delete", absence_id=trip)
    away = (await _absence(env["anna"], "away", [LENA], "thu", "thu"))["result"]["absence_id"]
    assert await _care_today(env) == {}
    await _async_check_care(hass)
    assert _data(hass)["care_log"] == [] and env["push"] == []

    # away with the care flag: medication continues
    await _call(env["anna"], "family_mission/absence_delete", absence_id=away)
    assert (await _absence(env["anna"], "away", [LENA], "thu", "thu", care=True))["success"]
    assert [i["id"] for i in (await _care_today(env))[LENA]] == ["pill"]
    await _async_check_care(hass)
    assert [e["status"] for e in _data(hass)["care_log"]] == ["unanswered"]

    # sick: medication continues too
    _data(hass)["care_log"] = []
    _data(hass)["absences"] = []
    assert (await _absence(env["anna"], "sick", [LENA], "thu", "thu"))["success"]
    assert [i["id"] for i in (await _care_today(env))[LENA]] == ["pill"]


# ---------------------------------------------------------------------------
# family goal
# ---------------------------------------------------------------------------

async def test_absence_lowers_the_possible_points_of_the_family_goal(hass, env):
    await _add(env["admin"], assignees=[LENA], complexity=10)
    res = await _call(env["admin"], "family_mission/update_settings", settings={
        "family_goal": {"points": 0, "reward": "Zoo", "mode": "percent", "percent": 100}})
    assert res["success"]
    info = (await _call(env["admin"], "family_mission/get_data"))["result"]["family_goal_info"]
    assert info["snapshot"]["possible"] == 30 and info["target"] == 30    # Thu, Fri, Sat... (3 days of October left)
    assert (await _absence(env["anna"], "away", [LENA], "fri", "sat"))["success"]
    info = (await _call(env["admin"], "family_mission/get_data"))["result"]["family_goal_info"]
    assert info["snapshot"]["possible"] == 10 and info["target"] == 10    # only Thursday is left
    # the absence ends again: the target never goes up
    absences = _data(hass)["absences"]
    await _call(env["admin"], "family_mission/absence_delete", absence_id=absences[0]["id"])
    info = (await _call(env["admin"], "family_mission/get_data"))["result"]["family_goal_info"]
    assert info["target"] == 10


# ---------------------------------------------------------------------------
# suggestion push
# ---------------------------------------------------------------------------

def _everybody(hass, state):
    for pid, name in (("person.anna", "Anna"), (LENA, "Lena"), (TOM, "Tom"), ("person.max", "Max")):
        old = hass.states.get(pid)
        hass.states.async_set(pid, state, old.attributes if old else {"friendly_name": name})


async def test_suggestion_push_once_per_away_phase(hass, env, freezer):
    assert await _async_check_absence_suggest(hass) is False              # off by default
    res = await _call(env["admin"], "family_mission/update_settings", settings={
        "absence_suggest_enabled": True, "absence_suggest_hours": 24})
    assert res["success"] and env["entry"].options["absence_suggest_hours"] == 24
    _everybody(hass, "not_home")
    freezer.move_to(THU + timedelta(hours=23))
    assert await _async_check_absence_suggest(hass) is False              # not long enough
    freezer.move_to(THU + timedelta(hours=25))
    assert await _async_check_absence_suggest(hass) is True
    assert len(env["push"]) == 1 and "Are you on a trip" in env["push"][0].data["title"]
    assert await _async_check_absence_suggest(hass) is False              # once per phase
    assert len(env["push"]) == 1

    # somebody is home: a new phase later pushes again
    _everybody(hass, "home")
    assert await _async_check_absence_suggest(hass) is False
    freezer.move_to(THU + timedelta(hours=30))
    _everybody(hass, "not_home")
    freezer.move_to(THU + timedelta(hours=56))
    assert await _async_check_absence_suggest(hass) is True
    assert len(env["push"]) == 2

    # not while a trip is entered
    _everybody(hass, "home")
    freezer.move_to(THU + timedelta(hours=60))
    _everybody(hass, "not_home")
    assert (await _absence(env["anna"], "trip", start="thu", end="mon"))["success"]
    freezer.move_to(THU + timedelta(hours=90))
    assert await _async_check_absence_suggest(hass) is False
    assert len(env["push"]) == 2


async def test_suggestion_settings_are_validated(hass, env):
    res = await _call(env["admin"], "family_mission/update_settings", settings={
        "absence_suggest_enabled": "yes", "absence_suggest_hours": 2})
    assert res["success"]
    assert "absence_suggest_enabled" not in env["entry"].options
    assert env["entry"].options["absence_suggest_hours"] == 24
    await _call(env["admin"], "family_mission/update_settings", settings={"absence_suggest_hours": "abc"})
    assert env["entry"].options["absence_suggest_hours"] == 24
    await _call(env["admin"], "family_mission/update_settings", settings={"absence_suggest_hours": 48})
    assert env["entry"].options["absence_suggest_hours"] == 48
