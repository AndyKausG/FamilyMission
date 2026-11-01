"""FamilyMission 2.4: waste collection bonus (Waste Collection Schedule calendars) and voice announcements."""

from datetime import datetime, timezone

import pytest
from homeassistant.core import SupportsResponse
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import _async_check_waste, _async_open_bonus_task
from custom_components.family_mission.const import DOMAIN

# Local time is US/Pacific (PDT, UTC-7) in the HA test harness. Collection: Fri 2026-10-30.
THU_1730 = datetime(2026, 10, 30, 0, 30, tzinfo=timezone.utc)     # Thu 17:30 local
THU_1600 = datetime(2026, 10, 29, 23, 0, tzinfo=timezone.utc)     # Thu 16:00 local
FRI_1630 = datetime(2026, 10, 30, 23, 30, tzinfo=timezone.utc)    # Fri 16:30 local
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)         # Thu 11:00 local
NIGHT = datetime(2026, 10, 30, 6, 0, tzinfo=timezone.utc)         # Thu 23:00 local
CAL = "calendar.abfall"

WASTE = {
    "waste_enabled": True,
    "waste_types": {"Restmüll": {"kids": True}, "Gelber Sack": {"kids": True}, "Glas": {"kids": False}},
    "waste_points_per_bin": 2,
}
ANNOUNCE = {
    "announce_enabled": True,
    "announce_tts": "tts.google_de",
    "announce_players": ["media_player.kueche"],
}


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


def _wcs_calendar(hass, entity_id=CAL):
    reg = er.async_get(hass)
    entry = reg.async_get_or_create(
        "calendar", "waste_collection_schedule", entity_id.split(".", 1)[1],
        suggested_object_id=entity_id.split(".", 1)[1],
    )
    return entry.entity_id


def _calendar_service(hass, events):
    """Fake ``calendar.get_events``; returns ``events`` for every requested calendar."""
    calls = []

    async def _handler(call):
        calls.append(call)
        ids = call.data["entity_id"]
        ids = ids if isinstance(ids, list) else [ids]
        return {eid: {"events": list(events)} for eid in ids}

    hass.services.async_register("calendar", "get_events", _handler, supports_response=SupportsResponse.ONLY)
    return calls


def _events(*types, day="2026-10-30"):
    return [{"start": day, "end": "2026-10-31", "summary": t} for t in types]


async def _setup(hass, **options):
    hass.config.language = "de"
    _fake_http(hass)
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"overdue_days": 5, **options})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _waste_tasks(hass):
    return [t for t in _data(hass)["tasks"].values() if t.get("waste_key")]


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 700


# ---------------------------------------------------------------------------
# waste collection
# ---------------------------------------------------------------------------

async def test_out_task_created_once_with_announcement(hass, freezer):
    _wcs_calendar(hass)
    cal_calls = _calendar_service(hass, _events("Restmüll", "Glas", "Gelber Sack"))
    speak = async_mock_service(hass, "tts", "speak")
    await _setup(hass, **WASTE, **ANNOUNCE)

    freezer.move_to(THU_1600)
    assert await _async_check_waste(hass) == 0

    freezer.move_to(THU_1730)
    assert await _async_check_waste(hass) == 1
    await hass.async_block_till_done()
    [task] = _waste_tasks(hass)
    assert task["name"] == "Mülltonnen rausstellen" and task["category"] == "bonus" and task["adhoc"] is True
    assert task["complexity"] == 4 and task["min_age"] == 6 and task["requires_approval"] is True
    assert task["allow_together"] is True and task["waste_key"] == "waste:out:2026-10-30"
    assert [s["title"] for s in task["subtasks"]] == [
        "Mülleimer in der Wohnung leeren", "Restmüll rausstellen", "Gelber Sack rausstellen",
        "Prüfen, ob noch Platz in den Tonnen ist",
    ]
    # expires Fri 07:00 local = 14:00 UTC
    assert dt_util.parse_datetime(task["expires_at"]) == datetime(2026, 10, 30, 14, 0, tzinfo=timezone.utc)
    assert cal_calls[-1].data["entity_id"] == [CAL]

    assert len(speak) == 1
    assert speak[0].data["entity_id"] == "tts.google_de"
    assert speak[0].data["media_player_entity_id"] == ["media_player.kueche"]
    assert speak[0].data["message"] == (
        "Morgen wird Restmüll und Gelber Sack geleert. Wer stellt die Tonnen raus? 4 Punkte.")

    # no duplicate: same check, fresh cache (restart), task deleted after completion
    assert await _async_check_waste(hass) == 0
    hass.data[DOMAIN].pop("waste_cache", None)
    assert await _async_check_waste(hass) == 0
    del _data(hass)["tasks"][task["id"]]
    assert await _async_check_waste(hass) == 0
    assert _data(hass)["waste_done"] == ["waste:out:2026-10-30"]


async def test_in_task_on_collection_day_and_approval_switch(hass, freezer):
    _wcs_calendar(hass)
    _calendar_service(hass, _events("Restmüll"))
    await _setup(hass, **WASTE, waste_approval=False)
    freezer.move_to(FRI_1630)
    assert await _async_check_waste(hass) == 1
    [task] = _waste_tasks(hass)
    assert task["name"] == "Mülltonnen reinholen" and task["requires_approval"] is False
    assert task["complexity"] == 2
    assert [s["title"] for s in task["subtasks"]] == ["Restmüll reinholen"]


async def test_nothing_without_wcs_disabled_or_only_glass(hass, freezer):
    calls = _calendar_service(hass, _events("Restmüll"))
    entry = await _setup(hass, **WASTE)
    freezer.move_to(THU_1730)
    assert await _async_check_waste(hass) == 0          # no WCS calendar
    assert calls == []

    _wcs_calendar(hass)
    hass.config_entries.async_update_entry(entry, options={**entry.options, "waste_enabled": False})
    await hass.async_block_till_done()
    assert await _async_check_waste(hass) == 0          # switched off
    assert calls == []

    hass.services.async_remove("calendar", "get_events")
    _calendar_service(hass, _events("Glas"))
    hass.config_entries.async_update_entry(entry, options={**entry.options, "waste_enabled": True})
    await hass.async_block_till_done()
    assert await _async_check_waste(hass) == 0          # glass stays with the parents
    assert _waste_tasks(hass) == []


async def test_waste_sources_and_settings_sanitizing(hass, hass_ws_client, freezer):
    _wcs_calendar(hass)
    hass.states.async_set(CAL, "off", {"friendly_name": "Abfall Musterstadt"})
    _calendar_service(hass, _events("Restmüll", "Glas") + _events("Bio", day="2026-11-06"))
    entry = await _setup(hass)
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    res = await _call(ws, "family_mission/waste_sources")
    assert res["success"], res
    result = res["result"]
    assert result["available"] is True
    assert result["calendars"] == [{"entity_id": CAL, "name": "Abfall Musterstadt"}]
    assert result["types"] == ["Bio", "Glas", "Restmüll"]
    assert result["upcoming"][0] == {"date": "2026-10-30", "types": ["Restmüll", "Glas"]}

    res = await _call(ws, "family_mission/update_settings", settings={
        "waste_enabled": True, "waste_min_age": 40, "waste_out_time": "nope",
        "waste_types": {"Glas": {"kids": False}, "Restmüll": {"kids": True}},
        "announce_enabled": True, "announce_tts": "light.x", "announce_players": ["media_player.a", "switch.b"],
        "announce_events": ["adhoc", "bogus"], "announce_names": {"uid": " Papa "},
    })
    assert res["success"], res
    await hass.async_block_till_done()
    opts = entry.options
    assert opts["waste_enabled"] is True and opts["waste_min_age"] == 18 and opts["waste_out_time"] == "17:00"
    assert opts["waste_types"] == {"Glas": {"kids": False}, "Restmüll": {"kids": True}}
    assert opts["announce_tts"] == "" and opts["announce_players"] == ["media_player.a"]
    assert opts["announce_events"] == ["adhoc"] and opts["announce_names"] == {"uid": "Papa"}


# ---------------------------------------------------------------------------
# announcements
# ---------------------------------------------------------------------------

async def test_adhoc_announcement_with_own_name(hass, hass_ws_client, hass_admin_user, freezer):
    speak = async_mock_service(hass, "tts", "speak")
    await _setup(hass, **ANNOUNCE, announce_names={hass_admin_user.id: "Papa"})
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    res = await _call(ws, "family_mission/add_adhoc_bonus", name="Einkäufe hochtragen", icon="mdi:cart", points=3)
    assert res["success"], res
    await hass.async_block_till_done()
    assert [c.data["message"] for c in speak] == ["Papa hat eine Bonusaufgabe erstellt: Einkäufe hochtragen. 3 Punkte."]


async def test_adhoc_announcement_for_one_kid_and_switches(hass, hass_ws_client, hass_admin_user, freezer):
    hass.states.async_set("person.clara", "home", {"friendly_name": "Clara"})
    speak = async_mock_service(hass, "tts", "speak")
    entry = await _setup(hass, **ANNOUNCE)
    hass.states.async_set("person.admin", "home", {"friendly_name": "Andy", "user_id": hass_admin_user.id})
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    res = await _call(ws, "family_mission/add_adhoc_bonus", name="Brot holen", icon="mdi:bread-slice",
                      points=1, kid_id="person.clara")
    assert res["success"], res
    await hass.async_block_till_done()
    assert speak[-1].data["message"] == "Andy hat eine Bonusaufgabe für Clara erstellt: Brot holen. 1 Punkt."

    # event kind switched off
    hass.config_entries.async_update_entry(entry, options={**entry.options, "announce_events": ["waste"]})
    await hass.async_block_till_done()
    await _call(ws, "family_mission/add_adhoc_bonus", name="A", icon="mdi:cart", points=1)
    await hass.async_block_till_done()
    assert len(speak) == 1

    # at night silent, unless allowed
    hass.config_entries.async_update_entry(entry, options={**entry.options, "announce_events": ["adhoc"]})
    await hass.async_block_till_done()
    freezer.move_to(NIGHT)
    await _call(ws, "family_mission/add_adhoc_bonus", name="B", icon="mdi:cart", points=1)
    await hass.async_block_till_done()
    assert len(speak) == 1
    hass.config_entries.async_update_entry(entry, options={**entry.options, "announce_night": True})
    await hass.async_block_till_done()
    await _call(ws, "family_mission/add_adhoc_bonus", name="C", icon="mdi:cart", points=1)
    await hass.async_block_till_done()
    assert len(speak) == 2

    # switched off completely
    hass.config_entries.async_update_entry(entry, options={**entry.options, "announce_enabled": False})
    await hass.async_block_till_done()
    await _call(ws, "family_mission/add_adhoc_bonus", name="D", icon="mdi:cart", points=1)
    await hass.async_block_till_done()
    assert len(speak) == 2


async def test_broken_speaker_does_not_break_the_task(hass, hass_ws_client, freezer):
    async_mock_service(hass, "tts", "speak", raise_exception=RuntimeError("offline"))
    await _setup(hass, **ANNOUNCE)
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    res = await _call(ws, "family_mission/add_adhoc_bonus", name="Müll", icon="mdi:cart", points=2)
    assert res["success"], res
    await hass.async_block_till_done()
    assert res["result"]["task_id"] in _data(hass)["tasks"]


async def test_trigger_announcement(hass, freezer):
    speak = async_mock_service(hass, "tts", "speak")
    await _setup(hass, **ANNOUNCE)
    freezer.move_to(NOON)
    _data(hass)["tasks"]["t1"] = {
        "id": "t1", "name": "Spülmaschine ausräumen", "category": "bonus", "complexity": 2, "interval": 1,
        "assignees": [], "due_date": "2027-01-01T00:00:00+00:00", "subtasks": [],
    }
    await _async_open_bonus_task(hass, {"task_id": "t1", "entity_id": "sensor.x", "to_state": "done"})
    await hass.async_block_till_done()
    assert [c.data["message"] for c in speak] == ["Neue Bonusaufgabe: Spülmaschine ausräumen. 2 Punkte."]


async def test_test_announce(hass, hass_ws_client, freezer):
    speak = async_mock_service(hass, "tts", "speak")
    await _setup(hass)
    ws = await hass_ws_client(hass)
    res = await _call(ws, "family_mission/test_announce")
    assert res["success"] and res["result"] == {"success": False, "error": "not_configured"}
    res = await _call(ws, "family_mission/test_announce", tts="tts.piper", players=["media_player.bad"])
    assert res["result"] == {"success": True, "error": None}
    assert speak[0].data["message"] == "FamilyMission: Test der Durchsage."
    assert speak[0].data["media_player_entity_id"] == ["media_player.bad"]
