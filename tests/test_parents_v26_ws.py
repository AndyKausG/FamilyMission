"""FamilyMission 2.6, step 9: parents' tasks - bins from the waste calendar, medication stock, bed linen,
shopping list link, checklists, weekdays, new catalog templates (exclusive time per kid), battery tasks."""

from datetime import datetime, timedelta, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.core import SupportsResponse
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import (
    _async_check_batteries,
    _async_check_care_stock,
    _async_check_parent_bins,
    _async_check_parent_digest,
    _async_check_waste,
    _parent_list_state,
)
from custom_components.family_mission.const import DOMAIN

LENA = "person.lena"
PIN = "1234"
CAL = "calendar.abfall"
# Local time is US/Pacific (PDT until Nov 1). Collection: Fri 2026-10-30, the evening before is Thu 29th.
THU_NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)         # Thu 11:00 local
THU_0800 = datetime(2026, 10, 29, 15, 0, tzinfo=timezone.utc)         # Thu 08:00 local
THU_1730 = datetime(2026, 10, 30, 0, 30, tzinfo=timezone.utc)         # Thu 17:30 local
THU_1929 = datetime(2026, 10, 30, 2, 29, tzinfo=timezone.utc)         # Thu 19:29 local
THU_1930 = datetime(2026, 10, 30, 2, 30, tzinfo=timezone.utc)         # Thu 19:30 local
THU_2230 = datetime(2026, 10, 30, 5, 30, tzinfo=timezone.utc)         # Thu 22:30 local (night)
FRI_0700 = datetime(2026, 10, 30, 14, 0, tzinfo=timezone.utc)         # Fri 07:00 local
FRI_NOON = datetime(2026, 10, 30, 18, 0, tzinfo=timezone.utc)         # Fri 11:00 local
SAT_NOON = datetime(2026, 10, 31, 18, 0, tzinfo=timezone.utc)         # Sat 11:00 local
WASTE = {
    "waste_enabled": True,
    "waste_types": {"Restmüll": {"kids": True}},
    "waste_approval": False,
}


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


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _day_start(day) -> str:
    return dt_util.as_utc(dt_util.start_of_local_day(day)).isoformat()


def _wcs_calendar(hass, entity_id=CAL):
    reg = er.async_get(hass)
    reg.async_get_or_create(
        "calendar", "waste_collection_schedule", entity_id.split(".", 1)[1], suggested_object_id=entity_id.split(".", 1)[1],
    )


def _calendar_service(hass, days=("2026-10-30",)):
    async def _handler(call):
        events = [{"start": d, "end": d, "summary": "Restmüll"} for d in days]
        ids = call.data["entity_id"]
        ids = ids if isinstance(ids, list) else [ids]
        return {eid: {"events": events} for eid in ids}

    hass.services.async_register("calendar", "get_events", _handler, supports_response=SupportsResponse.ONLY)


@pytest.fixture
async def env(hass, hass_ws_client, freezer):
    """Anna (parent, push), Ben (second adult, push), Sam (nobody), the kids Lena (PIN) and Max (HA user)."""
    anna = await _token(hass, "Anna")
    ben = await _token(hass, "Ben")
    sam = await _token(hass, "Sam")
    max_ = await _token(hass, "Max")
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set("person.ben", "home", {"friendly_name": "Ben", "user_id": ben[0].id})
    hass.states.async_set(LENA, "home", {"friendly_name": "Lena"})
    hass.states.async_set("person.max", "home", {"friendly_name": "Max", "user_id": max_[0].id})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "overdue_days": 5,
        "parents": [anna[0].id],
        "parent_notify": {anna[0].id: "notify.anna_push", ben[0].id: "notify.ben_push"},
    })
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    push = {"anna": async_mock_service(hass, "notify", "anna_push"), "ben": async_mock_service(hass, "notify", "ben_push")}
    admin = await hass_ws_client(hass)
    result = {
        "admin": admin, "anna": await hass_ws_client(hass, anna[1]), "sam": await hass_ws_client(hass, sam[1]),
        "entry": entry, "hass": hass, "push": push, "anna_id": anna[0].id, "ben_id": ben[0].id, "max_id": max_[0].id,
    }
    for pid, pin in ((LENA, PIN), (max_[0].id, None)):
        res = await _call(admin, "family_mission/set_kid_profile", participant_id=pid, avatar="🦊",
                          color="#ff8800", birth_year=2016, pin=pin)
        assert res["success"], res
    freezer.move_to(THU_NOON)
    return result


async def _settings(env, **kw):
    res = await _call(env["admin"], "family_mission/update_settings", settings=kw)
    assert res["success"], res
    await env["hass"].async_block_till_done()


async def _apply(env, *items, who="anna", **kw):
    res = await _call(env[who], "family_mission/parents_apply", items=[{"key": k, "mode": m} for k, m in items], **kw)
    assert res["success"], res
    return res["result"]


def _by_key(hass, key=None):
    tasks = [t for t in _data(hass)["tasks"].values() if t.get("parent_key")]
    return {t["parent_key"]: t for t in tasks} if key is None else [t for t in tasks if t["parent_key"] == key]


def _auto(hass, prefix):
    return [t for t in _data(hass)["tasks"].values() if str(t.get("auto_key", "")).startswith(prefix)]


# ---------------------------------------------------------------------------
# 1. bins follow the waste calendar
# ---------------------------------------------------------------------------

async def test_bins_without_waste_module_keep_weekly_behaviour(hass, env):
    await _apply(env, ("bins", "me"))
    before = _by_key(hass)["bins"]["due_date"]
    assert await _async_check_parent_bins(hass) == 0
    assert _by_key(hass)["bins"]["due_date"] == before and "waste_target" not in _by_key(hass)["bins"]


async def test_bins_are_due_on_the_evening_before_and_push_once(hass, env, freezer):
    _wcs_calendar(hass)
    _calendar_service(hass, ("2026-10-30", "2026-11-06"))
    await _settings(env, **WASTE)
    await _apply(env, ("bins", "me"))
    freezer.move_to(THU_NOON)
    await _async_check_parent_bins(hass)
    task = _by_key(hass)["bins"]
    assert task["due_date"] == _day_start(dt_util.now().date())          # Thursday: the evening before the collection
    assert task["waste_target"] == "2026-10-30" and _parent_list_state(task, dt_util.now().date()) == "today"
    # before the check time: no push
    freezer.move_to(THU_1929)
    assert await _async_check_parent_bins(hass) == 0 and not env["push"]["anna"]
    freezer.move_to(THU_1930)
    assert await _async_check_parent_bins(hass) == 1
    assert len(env["push"]["anna"]) == 1 and env["push"]["anna"][0].data["title"]
    assert await _async_check_parent_bins(hass) == 0                      # once per collection
    assert len(env["push"]["anna"]) == 1


async def test_bins_push_text_and_custom_check_time(hass, env, freezer):
    hass.config.language = "de"
    _wcs_calendar(hass)
    _calendar_service(hass)
    await _settings(env, **WASTE, parent_bins_check_time="18:00")
    await _apply(env, ("bins", "me"))
    freezer.move_to(THU_1730)
    await _async_check_parent_bins(hass)
    assert not env["push"]["anna"]
    freezer.move_to(datetime(2026, 10, 30, 1, 0, tzinfo=timezone.utc))     # 18:00 local
    assert await _async_check_parent_bins(hass) == 1
    assert env["push"]["anna"][0].data["message"] == "Tonnen stehen noch nicht draußen"


async def test_bins_no_push_at_night(hass, env, freezer):
    _wcs_calendar(hass)
    _calendar_service(hass)
    await _settings(env, **WASTE, parent_bins_check_time="21:00")
    await _apply(env, ("bins", "me"))
    freezer.move_to(THU_2230)
    assert await _async_check_parent_bins(hass) == 0 and not env["push"]["anna"]


async def test_bins_close_silently_when_the_kids_did_it(hass, env, freezer):
    _wcs_calendar(hass)
    _calendar_service(hass)
    await _settings(env, **WASTE)
    await _apply(env, ("bins", "me"))
    freezer.move_to(THU_1730)
    assert await _async_check_waste(hass) == 1
    out = next(t for t in _data(hass)["tasks"].values() if t.get("waste_key"))
    for step in out["subtasks"]:
        step["done"] = True
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=out["id"], kid_id=LENA, pin=PIN)
    assert res["result"]["success"], res
    assert _data(hass)["waste_kids_done"] == ["waste:out:2026-10-30"]
    await _async_check_parent_bins(hass)
    task = _by_key(hass)["bins"]
    assert task["bins_done_for"] == "2026-10-30"
    assert task["due_date"] == _day_start(dt_util.now().date() + timedelta(days=7))     # done, next one later
    entry = next(h for h in _data(hass)["history"] if h.get("type") == "parent")
    assert entry["task_id"] == task["id"] and entry["user_id"] is None and entry["minutes"] == 0 and entry["auto"] == "kids"
    freezer.move_to(THU_1930)
    assert await _async_check_parent_bins(hass) == 0 and not env["push"]["anna"]       # no push, nothing to remind
    freezer.move_to(FRI_NOON)                                                         # collection day: still handled
    await _async_check_parent_bins(hass)
    assert _by_key(hass)["bins"]["bins_done_for"] == "2026-10-30" and not env["push"]["anna"]


async def test_bins_done_with_approval_counts_and_next_collection_is_scheduled(hass, env, freezer):
    _wcs_calendar(hass)
    _calendar_service(hass, ("2026-10-30", "2026-11-06"))
    await _settings(env, **{**WASTE, "waste_approval": True})
    await _apply(env, ("bins", "me"))
    freezer.move_to(THU_1730)
    await _async_check_waste(hass)
    out = next(t for t in _data(hass)["tasks"].values() if t.get("waste_key"))
    for step in out["subtasks"]:
        step["done"] = True
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id=out["id"], kid_id=LENA, pin=PIN)
    assert res["result"]["pending"] is True                      # waits for the approval, but the kids did it
    await _async_check_parent_bins(hass)
    assert _by_key(hass)["bins"]["bins_done_for"] == "2026-10-30"
    freezer.move_to(SAT_NOON)                                    # next target: Fri Nov 6 -> due Thu Nov 5
    await _async_check_parent_bins(hass)
    task = _by_key(hass)["bins"]
    assert task["waste_target"] == "2026-11-06"
    assert task["due_date"] == _day_start(dt_util.now().date() + timedelta(days=5))
    assert _parent_list_state(task, dt_util.now().date()) == "hidden"


async def test_bins_manual_tick_off_marks_the_collection_done(hass, env, freezer):
    _wcs_calendar(hass)
    _calendar_service(hass)
    await _settings(env, **WASTE)
    await _apply(env, ("bins", "me"))
    freezer.move_to(THU_1930)
    await _async_check_parent_bins(hass)
    task = _by_key(hass)["bins"]
    assert (await _call(env["anna"], "family_mission/parent_task_done", task_id=task["id"]))["success"]
    freezer.move_to(THU_1930 + timedelta(minutes=5))
    assert await _async_check_parent_bins(hass) == 0
    assert _by_key(hass)["bins"]["due_date"] == _day_start(dt_util.now().date() + timedelta(days=7))


# ---------------------------------------------------------------------------
# 2. medication stock
# ---------------------------------------------------------------------------

def _care(**kw):
    return {"id": "pill", "label": "Tablette", "emoji": "💊", "anchor": "time", "time": "08:00", **kw}


async def _set_care(env, entries):
    res = await _call(env["admin"], "family_mission/set_kid_profile", participant_id=LENA, avatar="🦊",
                      color="#ff8800", birth_year=2016, care=entries)
    assert res["success"], res
    await env["hass"].async_block_till_done()
    return env["entry"].options["kids"][LENA]["care"]


def _stock(env, care_id="pill"):
    """The LIVE (counted-down) stock from the data store; the profile keeps the entered value."""
    live = _data(env["hass"]).get("care_stock", {}).get(f"{LENA}:{care_id}")
    return live["remaining"] if live else None


async def _answer(env, status, care_id="pill"):
    res = await _call(env["admin"], "family_mission/kid_care_answer", kid_id=LENA, pin=PIN, care_id=care_id, status=status)
    assert res["result"]["success"], res
    await env["hass"].async_block_till_done()


async def test_stock_validation(hass, env):
    stored = await _set_care(env, [
        _care(id="a", stock=12), _care(id="b", stock=-1), _care(id="c", stock=12000), _care(id="d", stock="x"),
        _care(id="e", stock=True), _care(id="f", stock=3.5),
    ])
    by_id = {e["id"]: e for e in stored}
    assert by_id["a"]["stock"] == 12 and by_id["a"]["per_dose"] == 1
    assert all("stock" not in by_id[i] and "per_dose" not in by_id[i] for i in "bcdef")
    stored = await _set_care(env, [_care(id="a", stock=0, per_dose=0), _care(id="b", stock=5, per_dose=99), _care(id="c", stock=5, per_dose=3)])
    assert [(e["stock"], e["per_dose"]) for e in stored] == [(0, 1), (5, 1), (5, 3)]
    # no stock sent: tracking off again
    stored = await _set_care(env, [_care()])
    assert "stock" not in stored[0]
    # the card gets the stock with the profile
    await _set_care(env, [_care(stock=14, per_dose=2)])
    care = (await _call(env["admin"], "family_mission/get_data"))["result"]["settings"]["kids"][LENA]["care"][0]
    assert (care["stock"], care["per_dose"]) == (14, 2)


async def test_taken_decrements_and_a_changed_answer_gives_the_pills_back(hass, env, freezer):
    await _set_care(env, [_care(stock=30, per_dose=2)])
    freezer.move_to(THU_0800)
    await _answer(env, "taken")
    assert _stock(env) == 28
    await _answer(env, "taken")                       # the same answer again: nothing changes
    assert _stock(env) == 28
    await _answer(env, "declined")
    assert _stock(env) == 30
    res = await _call(env["anna"], "family_mission/care_confirm", kid_id=LENA, care_id="pill")
    assert res["result"]["success"] and _stock(env) == 28      # a parent confirms "given"
    assert not _auto(hass, "care_stock")


async def test_low_stock_creates_one_task_per_phase_and_a_restock_closes_it(hass, env, freezer):
    freezer.move_to(THU_0800)
    await _set_care(env, [_care(stock=9)])
    assert not _auto(hass, "care_stock")
    await _answer(env, "taken")                       # 8 left, from tomorrow on: 8 days
    assert _stock(env) == 8 and not _auto(hass, "care_stock")
    freezer.move_to(THU_0800 + timedelta(days=1))
    await _answer(env, "taken")                       # 7 left: 7 days from tomorrow
    tasks = _auto(hass, "care_stock")
    assert _stock(env) == 7 and len(tasks) == 1
    task = tasks[0]
    assert task["name"] == "💊 Prescription / refill Tablette Lena"
    assert task["interval"] == 0 and task["dated"] is True and task["parent_task"] is True
    assert task["due_date"] == _day_start(dt_util.now().date()) and task["assignees"] == [env["anna_id"]]
    freezer.move_to(THU_0800 + timedelta(days=2))
    await _answer(env, "taken")
    assert len(_auto(hass, "care_stock")) == 1          # not a second one in the same phase
    # the parent ticks it off; the phase is not over, so it does not come back
    assert (await _call(env["anna"], "family_mission/parent_task_done", task_id=task["id"]))["success"]
    assert not _auto(hass, "care_stock") and await _async_check_care_stock(hass) == 0
    # restocked: the phase is over
    await _set_care(env, [_care(stock=60)])
    assert not _data(hass)["care_stock_low"]
    await _set_care(env, [_care(stock=4)])
    assert len(_auto(hass, "care_stock")) == 1           # a new low phase, a new task


async def test_restocking_closes_the_open_task_even_when_still_low(hass, env, freezer):
    freezer.move_to(THU_0800)
    await _set_care(env, [_care(stock=2)])
    assert len(_auto(hass, "care_stock")) == 1
    await _set_care(env, [_care(stock=5)])
    assert not _auto(hass, "care_stock")
    assert await _async_check_care_stock(hass) == 0       # still low, but it was dealt with
    await _set_care(env, [_care()])                       # tracking off
    assert _data(hass)["care_stock_low"] == {}


async def test_stock_task_respects_weekdays_and_per_dose(hass, env, freezer):
    freezer.move_to(THU_0800)
    # Mon/Wed/Fri only: 6 pills last longer than 7 calendar days
    await _set_care(env, [_care(stock=6, weekdays=[0, 2, 4])])
    assert not _auto(hass, "care_stock")
    # 2 pills per dose, daily: 14 pills = 7 days
    await _set_care(env, [_care(stock=14, per_dose=2)])
    assert len(_auto(hass, "care_stock")) == 1


# ---------------------------------------------------------------------------
# 3. bed linen follows the kids' bedding
# ---------------------------------------------------------------------------

def _bedding(hass, **extra):
    task = {
        "id": "bed-1", "name": "Bettwäsche abziehen", "description": "", "area": "", "interval": 14,
        "assignees": [LENA], "complexity": 3, "category": "basis", "min_age": 0, "icon": "mdi:bed-empty",
        "due_date": _day_start(dt_util.now().date()), "paused_until": None, "override_overdue_days": None,
        "subtasks": [], "catalog_key": "bedding", **extra,
    }
    _data(hass)["tasks"]["bed-1"] = task


async def test_bedding_done_makes_the_bed_linen_task_due_today(hass, env):
    await _apply(env, ("bed_linen", "me"), ("dinner", "me"))
    linen = _by_key(hass)["bed_linen"]
    linen["due_date"] = _day_start(dt_util.now().date() + timedelta(days=9))
    _bedding(hass)
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id="bed-1", kid_id=LENA, pin=PIN)
    assert res["result"]["success"], res
    linen = _by_key(hass)["bed_linen"]
    assert linen["due_date"] == _day_start(dt_util.now().date()) and linen["hint"] == "bedding"
    assert _parent_list_state(linen, dt_util.now().date()) == "today"
    assert _by_key(hass)["dinner"]["due_date"] == _day_start(dt_util.now().date())      # other tasks untouched
    # ticking the parents' task off clears the hint
    assert (await _call(env["anna"], "family_mission/parent_task_done", task_id=linen["id"]))["success"]
    assert "hint" not in _by_key(hass)["bed_linen"]


async def test_bedding_via_wizard_key_and_approval_and_no_parent_task(hass, env):
    _bedding(hass)           # no bed_linen parent task: nothing happens, nothing breaks
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id="bed-1", kid_id=LENA, pin=PIN)
    assert res["result"]["success"] and not _by_key(hass)
    await _apply(env, ("bed_linen", "me"))
    _by_key(hass)["bed_linen"]["due_date"] = _day_start(dt_util.now().date() + timedelta(days=9))
    _bedding(hass, catalog_key=None, generated_by="wizard", wizard_key=f"bedding:{LENA}")
    _data(hass)["tasks"]["bed-1"].pop("catalog_key")
    kids = dict(env["entry"].options["kids"])
    kids[LENA] = {**kids[LENA], "approval_sample_rate": 100}
    hass.config_entries.async_update_entry(env["entry"], options={**env["entry"].options, "kids": kids})
    _data(hass)["tasks"]["bed-1"]["requires_approval"] = True
    res = await _call(env["admin"], "family_mission/kid_complete_task", task_id="bed-1", kid_id=LENA, pin=PIN)
    assert res["result"]["success"]
    assert _by_key(hass)["bed_linen"]["due_date"] == _day_start(dt_util.now().date())


# ---------------------------------------------------------------------------
# 4. shopping list link (todo entity)
# ---------------------------------------------------------------------------

async def test_todo_link_is_validated_and_never_required(hass, env):
    await _apply(env, ("shopping_list", "me"), ("fridge", "me"))
    tid = _by_key(hass)["fridge"]["id"]
    for bad in ("light.kitchen", "todo.missing", "todo"):
        res = await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, todo_entity=bad)
        assert res["error"]["code"] == "invalid_entity", bad
    assert "todo_entity" not in _by_key(hass)["fridge"]
    hass.states.async_set("todo.einkauf", "3", {"friendly_name": "Einkauf"})
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, todo_entity="todo.einkauf"))["success"]
    assert _by_key(hass)["fridge"]["todo_entity"] == "todo.einkauf"
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, todo_entity=None))["success"]
    assert "todo_entity" not in _by_key(hass)["fridge"]
    # a new own task can be linked right away
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Liste", todo_entity="todo.einkauf")
    assert _data(hass)["tasks"][res["result"]["task_id"]]["todo_entity"] == "todo.einkauf"
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Liste 2", todo_entity="todo.nope")
    assert res["error"]["code"] == "invalid_entity"


async def test_todo_add_item_calls_the_service_only_when_linked(hass, env):
    await _apply(env, ("fridge", "me"))
    tid = _by_key(hass)["fridge"]["id"]
    res = await _call(env["anna"], "family_mission/parent_todo_add", task_id=tid, item="Milch")
    assert res["result"] == {"success": False, "error": "no_todo"}
    hass.states.async_set("todo.einkauf", "3", {"friendly_name": "Einkauf"})
    await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, todo_entity="todo.einkauf")
    # the todo integration is optional: no service -> a clean answer
    res = await _call(env["anna"], "family_mission/parent_todo_add", task_id=tid, item="Milch")
    assert res["result"] == {"success": False, "error": "todo_unavailable"}
    calls = async_mock_service(hass, "todo", "add_item")
    res = await _call(env["anna"], "family_mission/parent_todo_add", task_id=tid, item="  Milch ")
    assert res["result"] == {"success": True}
    assert calls[0].data == {"entity_id": "todo.einkauf", "item": "Milch"}
    assert (await _call(env["anna"], "family_mission/parent_todo_add", task_id=tid, item="  "))["error"]["code"] == "invalid_item"
    assert (await _call(env["anna"], "family_mission/parent_todo_add", task_id=tid, item="x" * 101))["error"]["code"] == "invalid_item"
    assert (await _call(env["anna"], "family_mission/parent_todo_add", task_id="nope", item="Milch"))["result"]["success"] is False
    assert (await _call(env["sam"], "family_mission/parent_todo_add", task_id=tid, item="Milch"))["error"]["code"] == "unauthorized"
    assert len(calls) == 1


async def test_todo_service_error_does_not_break(hass, env):
    await _apply(env, ("fridge", "me"))
    tid = _by_key(hass)["fridge"]["id"]
    hass.states.async_set("todo.einkauf", "3")
    await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, todo_entity="todo.einkauf")

    async def _boom(call):
        raise RuntimeError("offline")

    hass.services.async_register("todo", "add_item", _boom)
    res = await _call(env["anna"], "family_mission/parent_todo_add", task_id=tid, item="Milch")
    assert res["result"] == {"success": False, "error": "todo_unavailable"}


# ---------------------------------------------------------------------------
# 5. checklists
# ---------------------------------------------------------------------------

async def test_catalog_steps_are_created_and_toggled_without_blocking(hass, env):
    hass.config.language = "de"
    await _apply(env, ("bathrooms", "me"), ("dinner", "me"))
    task = _by_key(hass)["bathrooms"]
    assert [s["title"] for s in task["subtasks"]] == ["WC", "Waschbecken & Spiegel", "Dusche/Wanne", "Boden", "Handtücher tauschen"]
    assert not _by_key(hass)["dinner"]["subtasks"]
    res = await _call(env["anna"], "family_mission/parent_toggle_step", task_id=task["id"], index=1)
    assert res["result"] == {"success": True, "done": True, "progress": [1, 5]}
    res = await _call(env["anna"], "family_mission/parent_toggle_step", task_id=task["id"], index=1)
    assert res["result"]["done"] is False and res["result"]["progress"] == [0, 5]
    await _call(env["anna"], "family_mission/parent_toggle_step", task_id=task["id"], index=0)
    # open steps never block the tick-off; the checklist starts afresh afterwards
    assert (await _call(env["anna"], "family_mission/parent_task_done", task_id=task["id"]))["success"]
    assert all(not s["done"] for s in _by_key(hass)["bathrooms"]["subtasks"])
    # bad input
    assert (await _call(env["anna"], "family_mission/parent_toggle_step", task_id=task["id"], index=9))["result"]["success"] is False
    assert (await _call(env["anna"], "family_mission/parent_toggle_step", task_id="nope", index=0))["result"]["success"] is False
    assert (await _call(env["sam"], "family_mission/parent_toggle_step", task_id=task["id"], index=0))["error"]["code"] == "unauthorized"
    assert (await _call(env["anna"], "family_mission/parent_toggle_step", task_id=task["id"], index=-1))["success"] is False


async def test_all_catalog_steps_exist_in_both_languages(hass, env):
    for lang in ("de", "en"):
        res = (await _call(env["anna"], "family_mission/parents_catalog"))["result"]
        steps = {i["key"]: i[f"steps_{lang}"] for i in res["items"]}
        for key in ("bathrooms", "meal_plan", "calendar", "finances", "fridge", "vacuum", "kids_clothes", "checkups", "holiday_care"):
            assert steps[key], (lang, key)
    de = {i["key"]: i["steps_de"] for i in res["items"]}
    en = {i["key"]: i["steps_en"] for i in res["items"]}
    assert all(len(de[k]) == len(en[k]) for k in de)
    assert len(de["bathrooms"]) == 5 and len(de["calendar"]) == 5 and len(de["finances"]) == 4


async def test_own_steps_in_add_and_set_keep_progress_and_are_limited(hass, env):
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Umzug", subtasks=["  Kartons ", "", "Strom ummelden", "x" * 90])
    tid = res["result"]["task_id"]
    steps = _data(hass)["tasks"][tid]["subtasks"]
    assert [s["title"] for s in steps] == ["Kartons", "Strom ummelden", "x" * 60] and not any(s["done"] for s in steps)
    await _call(env["anna"], "family_mission/parent_toggle_step", task_id=tid, index=1)
    res = await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, subtasks=["Strom ummelden", "Neu", "Kartons"])
    assert res["success"]
    steps = _data(hass)["tasks"][tid]["subtasks"]
    assert [(s["title"], s["done"]) for s in steps] == [("Strom ummelden", True), ("Neu", False), ("Kartons", False)]
    res = await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, subtasks=[f"S{i}" for i in range(20)])
    assert len(_data(hass)["tasks"][tid]["subtasks"]) == 12
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, subtasks=[]))["success"]
    assert _data(hass)["tasks"][tid]["subtasks"] == []


async def test_progress_of_a_one_time_task_checklist_survives_undo(hass, env):
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Packen", interval=0, subtasks=["A", "B"])
    tid = res["result"]["task_id"]
    await _call(env["anna"], "family_mission/parent_toggle_step", task_id=tid, index=0)
    done = await _call(env["anna"], "family_mission/parent_task_done", task_id=tid)
    assert tid not in _data(hass)["tasks"]
    undo = await _call(env["anna"], "family_mission/undo_completion", history_id=done["result"]["history_id"])
    assert undo["success"], undo
    assert [(s["title"], s["done"]) for s in _data(hass)["tasks"][tid]["subtasks"]] == [("A", True), ("B", False)]


# ---------------------------------------------------------------------------
# 6. weekdays
# ---------------------------------------------------------------------------

async def test_weekdays_on_add_set_and_done(hass, env, freezer):
    today = dt_util.now().date()                       # Thursday
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Müll", weekdays=[4, 0, 2, 0])
    task = _data(hass)["tasks"][res["result"]["task_id"]]
    assert task["weekdays"] == [0, 2, 4] and task["interval"] == 7
    assert task["due_date"] == _day_start(today + timedelta(days=1))     # Friday
    freezer.move_to(THU_NOON + timedelta(days=1))
    assert (await _call(env["anna"], "family_mission/parent_task_done", task_id=task["id"]))["success"]
    assert task["due_date"] == _day_start(today + timedelta(days=4))     # Monday, not "7 days later"
    # a one-time task with weekdays becomes a repeating one
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Sport", interval=0, weekdays=[1])
    sport = _data(hass)["tasks"][res["result"]["task_id"]]
    assert sport["interval"] == 7 and "dated" not in sport and sport["weekdays"] == [1]
    # set: a someday task gets a schedule; clearing it keeps the interval behaviour
    res = await _call(env["anna"], "family_mission/parent_task_add", name="Irgendwann", interval=0)
    someday = _data(hass)["tasks"][res["result"]["task_id"]]
    assert someday["due_date"] is None
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=someday["id"], weekdays=[5]))["success"]
    assert someday["interval"] == 7 and "someday" not in someday
    assert dt_util.parse_datetime(someday["due_date"]) and dt_util.as_local(dt_util.parse_datetime(someday["due_date"])).weekday() == 5
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=someday["id"], weekdays=[]))["success"]
    assert "weekdays" not in someday


async def test_weekdays_are_validated(hass, env):
    for bad in ([7], [-1], [1, 9]):
        res = await _call(env["anna"], "family_mission/parent_task_add", name="x", weekdays=bad)
        assert res["error"]["code"] == "invalid_weekdays", bad
    res = await _call(env["anna"], "family_mission/parent_task_add", name="x", weekdays=["a"])
    assert not res["success"]
    tid = (await _call(env["anna"], "family_mission/parent_task_add", name="ok", weekdays=[2]))["result"]["task_id"]
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, weekdays=[8]))["error"]["code"] == "invalid_weekdays"
    assert _data(hass)["tasks"][tid]["weekdays"] == [2]


async def test_digest_counts_only_the_scheduled_days(hass, env, freezer):
    await _settings(env, parent_digest_enabled=True)
    await _call(env["anna"], "family_mission/parent_task_add", name="Fr", weekdays=[4])
    freezer.move_to(THU_NOON)
    assert await _async_check_parent_digest(hass) == 0                # Friday only: nothing today
    freezer.move_to(FRI_0700 + timedelta(hours=1))
    assert await _async_check_parent_digest(hass) == 1


# ---------------------------------------------------------------------------
# 7. new templates, exclusive time per kid
# ---------------------------------------------------------------------------

async def test_new_catalog_entries(hass, env):
    res = (await _call(env["anna"], "family_mission/parents_catalog"))["result"]
    items = {i["key"]: i for i in res["items"]}
    assert "vet" not in items                                       # needs the pets feature
    assert items["exclusive_time"]["preselected"] and items["exclusive_time"]["per_kid"]
    assert items["exclusive_time"]["minutes"] == 30 and items["exclusive_time"]["interval"] == 7
    assert items["family_council"]["weekday"] == 6 and items["family_council"]["planning"]
    assert items["me_time"]["planning"] and items["me_time"]["interval"] == 7
    assert items["medicine_cabinet"]["interval"] == 182 and items["season_check"]["interval"] == 182
    for key in ("family_council", "me_time", "medicine_cabinet", "season_check"):
        assert not items[key]["preselected"]
    assert [k["name"] for k in res["kids"]] == ["Lena", "Max"]
    hass.config_entries.async_update_entry(env["entry"], options={**env["entry"].options, "wizard": {"features": ["pets"]}})
    res = (await _call(env["anna"], "family_mission/parents_catalog"))["result"]
    vet = next(i for i in res["items"] if i["key"] == "vet")
    assert vet["interval"] == 365 and vet["requires"] == "pets"
    # an existing vet task stays visible even if the feature is switched off later
    await _apply(env, ("vet", "me"))
    hass.config_entries.async_update_entry(env["entry"], options={**env["entry"].options, "wizard": {"features": []}})
    res = (await _call(env["anna"], "family_mission/parents_catalog"))["result"]
    assert "vet" in {i["key"] for i in res["items"]}


async def test_exclusive_time_is_one_task_per_kid_and_alternates(hass, env):
    hass.config.language = "de"
    res = await _apply(env, ("exclusive_time", "alternate"))
    assert res["created"] == 2
    tasks = _by_key(hass, "exclusive_time")
    assert sorted(t["name"] for t in tasks) == ["Exklusivzeit mit Lena", "Exklusivzeit mit Max"]
    assert {t["for_kid"] for t in tasks} == {LENA, env["max_id"]}
    assert all(t["interval"] == 7 and t["minutes"] == 30 and t["parent_mode"] == "alternate" for t in tasks)
    assert all(not t["planning"] and "points" not in t for t in tasks)
    firsts = {t["assignees"][0] for t in tasks}
    assert firsts == {env["anna_id"], env["ben_id"]}                # the turns start with different adults
    # again: nothing new
    assert (await _apply(env, ("exclusive_time", "alternate"))) == {"success": True, "created": 0, "updated": 0}
    assert len(_by_key(hass, "exclusive_time")) == 2
    # the catalog answer knows the entry exists
    res = (await _call(env["anna"], "family_mission/parents_catalog"))["result"]
    assert res["existing"]["exclusive_time"]["mode"] == "alternate"
    # a third kid gets one task on the next run
    hass.states.async_set("person.zoe", "home", {"friendly_name": "Zoe"})
    await _call(env["admin"], "family_mission/set_kid_profile", participant_id="person.zoe", avatar="🐯", color="#00aa00", birth_year=2018)
    assert (await _apply(env, ("exclusive_time", "alternate")))["created"] == 1
    assert sorted(t["name"] for t in _by_key(hass, "exclusive_time")) == [
        "Exklusivzeit mit Lena", "Exklusivzeit mit Max", "Exklusivzeit mit Zoe"]
    # a deleted kid profile: its task goes on the next run
    assert (await _call(env["admin"], "family_mission/delete_kid_profile", participant_id="person.zoe"))["success"]
    res = await _apply(env, ("exclusive_time", "alternate"))
    assert res["removed"] == 1 and len(_by_key(hass, "exclusive_time")) == 2


async def test_exclusive_time_english_and_single_adult_and_no_kids(hass, env):
    res = await _apply(env, ("exclusive_time", "me"))
    assert sorted(t["name"] for t in _by_key(hass, "exclusive_time")) == ["One-on-one time with Lena", "One-on-one time with Max"]
    assert {t["assignees"][0] for t in _by_key(hass, "exclusive_time")} == {env["anna_id"]}
    for pid in (LENA, env["max_id"]):
        await _call(env["admin"], "family_mission/delete_kid_profile", participant_id=pid)
    res = await _apply(env, ("exclusive_time", "me"), ("dinner", "me"))
    assert res["created"] == 1 and res["removed"] == 2 and not _by_key(hass, "exclusive_time")


async def test_reapply_does_not_overwrite_customized_parent_tasks(hass, env):
    hass.config.language = "de"
    await _apply(env, ("bathrooms", "me"), ("exclusive_time", "me"), ("dinner", "me"))
    bath = _by_key(hass)["bathrooms"]
    lena = next(t for t in _by_key(hass, "exclusive_time") if t["for_kid"] == LENA)
    assert "customized" not in bath
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=bath["id"], subtasks=["Alles in einem"], minutes=99))["success"]
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=lena["id"], name="Zeit mit Lena"))["success"]
    assert bath["customized"] == ["minutes", "subtasks"] and lena["customized"] == ["name"]
    res = await _apply(env, ("bathrooms", "me"), ("exclusive_time", "me"), ("dinner", "me"))
    assert res == {"success": True, "created": 0, "updated": 0}
    assert [s["title"] for s in bath["subtasks"]] == ["Alles in einem"] and bath["minutes"] == 99
    assert lena["name"] == "Zeit mit Lena"
    # explicit minutes in the request are skipped for customized fields as well, other fields still apply
    res = await _call(env["anna"], "family_mission/parents_apply", items=[{"key": "bathrooms", "mode": "me", "minutes": 10, "planning": True}])
    assert res["success"] and bath["minutes"] == 99 and bath["planning"] is True
    # an uncustomized task follows the catalog (a task created before the checklists existed gets its steps)
    dinner = _by_key(hass)["dinner"]
    dinner["subtasks"] = []
    # a kid that was renamed: the uncustomized name follows
    hass.states.async_set(LENA, "home", {"friendly_name": "Lenchen"})
    other = next(t for t in _by_key(hass, "exclusive_time") if t["for_kid"] != LENA)
    other["name"] = "alt"
    res = await _apply(env, ("exclusive_time", "me"))
    assert res["updated"] == 1 and other["name"] == "Exklusivzeit mit Max"
    assert lena["name"] == "Zeit mit Lena"                          # customized: stays


async def test_edits_of_non_catalog_tasks_do_not_track_customization(hass, env):
    tid = (await _call(env["anna"], "family_mission/parent_task_add", name="Eigene"))["result"]["task_id"]
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, name="Neu", minutes=5))["success"]
    task = _data(hass)["tasks"][tid]
    assert task["name"] == "Neu" and "customized" not in task
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, name="   "))["error"]["code"] == "invalid_name"
    assert (await _call(env["anna"], "family_mission/parent_task_set", task_id=tid, name="x" * 81))["error"]["code"] == "invalid_name"


async def test_apply_and_set_need_a_role(hass, env):
    res = await _call(env["sam"], "family_mission/parents_apply", items=[{"key": "bathrooms", "mode": "me"}])
    assert res["error"]["code"] == "unauthorized"
    tid = (await _call(env["anna"], "family_mission/parent_task_add", name="x"))["result"]["task_id"]
    for kw in ({"weekdays": [1]}, {"subtasks": ["a"]}, {"todo_entity": None}, {"name": "y"}):
        assert (await _call(env["sam"], "family_mission/parent_task_set", task_id=tid, **kw))["error"]["code"] == "unauthorized"


# ---------------------------------------------------------------------------
# 8. batteries
# ---------------------------------------------------------------------------

def _battery(hass, entity, value, name=None, device_class="battery"):
    hass.states.async_set(entity, str(value), {"device_class": device_class, "friendly_name": name or entity})


async def test_battery_setting_validation_and_default_off(hass, env):
    assert env["entry"].options.get("battery_tasks_enabled") is None
    _battery(hass, "sensor.rauchmelder_batterie", 9, "Rauchmelder Flur")
    assert await _async_check_batteries(hass, force=True) == 0 and not _auto(hass, "battery")
    await _settings(env, battery_tasks_enabled="yes", battery_threshold="abc")
    assert "battery_tasks_enabled" not in env["entry"].options and env["entry"].options["battery_threshold"] == 20
    for raw, expected in ((99, 50), (1, 5), (35.7, 35), (True, 20), (None, 20), ("15", 15)):
        await _settings(env, battery_threshold=raw)
        assert env["entry"].options["battery_threshold"] == expected, raw
    await _settings(env, battery_tasks_enabled=True, parent_bins_check_time="25:99")
    assert env["entry"].options["battery_tasks_enabled"] is True
    assert env["entry"].options["parent_bins_check_time"] == "19:30"
    await _settings(env, parent_bins_check_time="18:15")
    assert env["entry"].options["parent_bins_check_time"] == "18:15"


async def test_battery_task_dedupe_hysteresis_and_removal(hass, env, freezer):
    hass.config.language = "de"
    await _settings(env, battery_tasks_enabled=True)
    _battery(hass, "sensor.rauchmelder_batterie", 12, "Rauchmelder Flur")
    _battery(hass, "sensor.tuer_batterie", "unavailable", "Tür")
    _battery(hass, "sensor.fenster_batterie", 80, "Fenster")
    _battery(hass, "sensor.temperatur", 5, "Temperatur", device_class="temperature")
    _battery(hass, "sensor.text_batterie", "low", "Text")
    _battery(hass, "sensor.kaputt_batterie", 250, "Kaputt")
    assert await _async_check_batteries(hass) == 1
    tasks = _auto(hass, "battery")
    assert len(tasks) == 1 and tasks[0]["name"] == "🔋 Batterie Rauchmelder Flur"
    task = tasks[0]
    assert task["interval"] == 0 and task["dated"] and task["due_date"] == _day_start(dt_util.now().date())
    assert task["assignees"] == [env["anna_id"]] and task["auto_key"] == "battery:sensor.rauchmelder_batterie"
    assert len(env["push"]["anna"]) == 1 and "Rauchmelder Flur" in env["push"]["anna"][0].data["message"]
    # at most every 30 minutes
    _battery(hass, "sensor.fenster_batterie", 10, "Fenster")
    freezer.move_to(THU_NOON + timedelta(minutes=29))
    assert await _async_check_batteries(hass) == 0
    freezer.move_to(THU_NOON + timedelta(minutes=30))
    assert await _async_check_batteries(hass) == 1 and len(_auto(hass, "battery")) == 2
    # no duplicate while it stays low; a bit above the threshold (hysteresis) keeps it too
    _battery(hass, "sensor.rauchmelder_batterie", 24, "Rauchmelder Flur")
    freezer.move_to(THU_NOON + timedelta(minutes=61))
    assert await _async_check_batteries(hass) == 0 and len(_auto(hass, "battery")) == 2
    # the parent ticks the task off: it does not come back while the value stays low
    assert (await _call(env["anna"], "family_mission/parent_task_done", task_id=task["id"]))["success"]
    _battery(hass, "sensor.rauchmelder_batterie", 10, "Rauchmelder Flur")
    freezer.move_to(THU_NOON + timedelta(minutes=92))
    assert await _async_check_batteries(hass) == 0 and len(_auto(hass, "battery")) == 1
    # value rises above threshold + 5: the open task of the other sensor is removed, the marker is cleared
    _battery(hass, "sensor.fenster_batterie", 26, "Fenster")
    _battery(hass, "sensor.rauchmelder_batterie", 100, "Rauchmelder Flur")
    freezer.move_to(THU_NOON + timedelta(minutes=123))
    assert await _async_check_batteries(hass) == 0 and not _auto(hass, "battery")
    assert _data(hass)["battery_low"] == {}
    # low again later: a new task
    _battery(hass, "sensor.rauchmelder_batterie", 7, "Rauchmelder Flur")
    freezer.move_to(THU_NOON + timedelta(minutes=154))
    assert await _async_check_batteries(hass) == 1 and len(_auto(hass, "battery")) == 1


async def test_battery_skips_soc_limits_config_entities_and_the_exclusion_list(hass, env):
    await _settings(env, battery_tasks_enabled=True)
    _battery(hass, "sensor.rauchmelder", 5, "Rauchmelder Flur")
    for name in ("LB-AK-396E Generator SOC Limit", "Battery reserved SoC for backup", "Battery min SoC",
                 "Battery level (nominal)", "Batterie Ladezustand"):
        _battery(hass, "sensor.x_" + str(abs(hash(name))), 5, name)
    _battery(hass, "sensor.sungrow_sbh", 5, "Sungrow SBH")
    ent = er.async_get(hass).async_get_or_create(
        "sensor", "test", "einstellung", suggested_object_id="einstellung", entity_category=er.EntityCategory.CONFIG)
    _battery(hass, ent.entity_id, 5, "Wallbox Akku")
    await _settings(env, battery_ignore=["Sensor.Sungrow_SBH", "sensor.sungrow_sbh", "light.no", "junk", 5])
    assert env["entry"].options["battery_ignore"] == ["sensor.sungrow_sbh"]
    assert await _async_check_batteries(hass, force=True) == 1
    assert [t["auto_key"] for t in _auto(hass, "battery")] == ["battery:sensor.rauchmelder"]


async def test_battery_ignore_removes_the_open_task_and_the_button_adds_the_sensor(hass, env):
    await _settings(env, battery_tasks_enabled=True)
    _battery(hass, "sensor.sungrow_sbh", 5, "Sungrow SBH")
    _battery(hass, "sensor.rauchmelder", 5, "Rauchmelder")
    assert await _async_check_batteries(hass, force=True) == 2
    # the settings list removes the open task at the next check
    await _settings(env, battery_ignore="sensor.sungrow_sbh, sensor.nope")
    assert env["entry"].options["battery_ignore"] == ["sensor.sungrow_sbh", "sensor.nope"]
    await _async_check_batteries(hass, force=True)
    assert [t["auto_key"] for t in _auto(hass, "battery")] == ["battery:sensor.rauchmelder"]
    # "not a battery to replace" on the task: excluded for good, task gone
    task = _auto(hass, "battery")[0]
    res = await _call(env["anna"], "family_mission/battery_ignore", task_id=task["id"])
    assert res["result"]["success"] and res["result"]["entity_id"] == "sensor.rauchmelder"
    assert "sensor.rauchmelder" in env["entry"].options["battery_ignore"]
    assert not _auto(hass, "battery")
    await _async_check_batteries(hass, force=True)
    assert not _auto(hass, "battery")
    # only automatic battery tasks
    other = await _call(env["anna"], "family_mission/battery_ignore", task_id="nope")
    assert other["result"] == {"success": False, "error": "not_found"}


async def test_battery_threshold_is_used(hass, env):
    await _settings(env, battery_tasks_enabled=True, battery_threshold=10)
    _battery(hass, "sensor.a", 15, "A")
    _battery(hass, "sensor.b", 9, "B")
    assert await _async_check_batteries(hass, force=True) == 1
    assert [t["auto_key"] for t in _auto(hass, "battery")] == ["battery:sensor.b"]


async def test_battery_push_waits_for_the_end_of_the_night_but_the_task_is_created(hass, env, freezer):
    await _settings(env, battery_tasks_enabled=True)
    freezer.move_to(THU_2230)
    _battery(hass, "sensor.rauchmelder_batterie", 8, "Rauchmelder")
    assert await _async_check_batteries(hass) == 1
    assert len(_auto(hass, "battery")) == 1 and not env["push"]["anna"]
    freezer.move_to(THU_2230 + timedelta(minutes=10))
    await _async_check_batteries(hass)
    assert not env["push"]["anna"]
    freezer.move_to(FRI_0700)
    await _async_check_batteries(hass)
    assert len(env["push"]["anna"]) == 1
    freezer.move_to(FRI_0700 + timedelta(minutes=40))
    await _async_check_batteries(hass)
    assert len(env["push"]["anna"]) == 1                      # sent once


async def test_battery_without_an_adult_does_nothing(hass, env):
    for state in list(hass.states.async_all("person")):
        hass.states.async_remove(state.entity_id)
    await _settings(env, battery_tasks_enabled=True)
    _battery(hass, "sensor.rauchmelder_batterie", 8, "Rauchmelder")
    assert await _async_check_batteries(hass, force=True) == 0
    assert not _auto(hass, "battery") and not _data(hass).get("battery_low")
