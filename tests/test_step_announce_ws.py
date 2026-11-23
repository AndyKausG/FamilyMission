"""FamilyMission 2.15: aids for young kids in the profile, read aloud on demand and the automatic "next step"."""

from datetime import datetime, timedelta, timezone

import pytest
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
)

from custom_components.family_mission.const import DOMAIN

ANNA = "person.anna"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)      # Thu 11:00 local (US/Pacific)
NIGHT = datetime(2026, 10, 30, 6, 0, tzinfo=timezone.utc)      # Thu 23:00 local
ANNOUNCE = {
    "announce_enabled": True,
    "announce_tts": "tts.piper",
    "announce_players": ["media_player.kueche"],
    "announce_events": [],          # the step announcement does not depend on the event kinds
}


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()


_call.n = 900


async def _setup(hass, hass_ws_client, freezer, options=None, aids=None):
    hass.config.language = "de"
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    speak = async_mock_service(hass, "tts", "speak")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"overdue_days": 5, **ANNOUNCE, **(options or {})})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    kw = {"aids": aids} if aids is not None else {}
    res = await _call(ws, "family_mission/set_kid_profile", participant_id=ANNA, avatar="🦊",
                      color="#ff8800", pin="1234", birth_year=2020, **kw)
    assert res["success"], res
    await hass.async_block_till_done()
    res = await _call(ws, "family_mission/add_task", name="Morgen-Mission", interval=1, complexity=3,
                      icon="mdi:weather-sunny", category="basis", assignees=[ANNA], subtasks=[
                          {"title": "🛏️ Bett machen", "done": False},
                          {"title": "Zähne putzen", "done": False},
                          {"title": "Anziehen", "done": False}])
    assert res["success"], res
    return ws, speak, res["result"]["task_id"]


async def _tick(hass, ws, task_id, index, done=True):
    res = await _call(ws, "family_mission/kid_toggle_step", task_id=task_id, kid_id=ANNA, pin="1234",
                      index=index, done=done)
    assert res["success"] and res["result"]["success"], res


async def _wait(hass, freezer, seconds=3):
    # async_call_later runs on the loop clock: fire the timers due within ``seconds`` from now
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=seconds))
    await hass.async_block_till_done()


async def test_profile_aids_validated_and_public(hass, hass_ws_client, freezer):
    ws, _speak, _tid = await _setup(hass, hass_ws_client, freezer,
                                    aids={"time_pie": True, "picture_steps": False, "evil": True})
    res = await _call(ws, "family_mission/get_data")
    assert res["result"]["settings"]["kids"][ANNA]["aids"] == {"time_pie": True}
    # a later save without "aids" keeps them, an empty dict clears them
    res = await _call(ws, "family_mission/set_kid_profile", participant_id=ANNA, avatar="🦊", color="#ff8800",
                      birth_year=2020)
    assert res["success"]
    await hass.async_block_till_done()
    res = await _call(ws, "family_mission/get_data")
    assert res["result"]["settings"]["kids"][ANNA]["aids"] == {"time_pie": True}
    await _call(ws, "family_mission/set_kid_profile", participant_id=ANNA, avatar="🦊", color="#ff8800",
                birth_year=2020, aids={})
    await hass.async_block_till_done()
    res = await _call(ws, "family_mission/get_data")
    assert res["result"]["settings"]["kids"][ANNA]["aids"] == {}


async def test_next_step_is_spoken_once_after_quick_ticks(hass, hass_ws_client, freezer):
    ws, speak, tid = await _setup(hass, hass_ws_client, freezer, aids={"speak_auto": True})
    await _tick(hass, ws, tid, 0)
    await _wait(hass, freezer, 1)
    assert speak == []                                  # still inside the delay
    await _tick(hass, ws, tid, 1)                       # restarts the delay
    await _wait(hass, freezer, 3)
    assert len(speak) == 1
    assert speak[0].data == {"entity_id": "tts.piper", "media_player_entity_id": ["media_player.kueche"],
                             "message": "Anna, Jetzt: Anziehen."}
    await _tick(hass, ws, tid, 2)
    await _wait(hass, freezer)
    assert speak[-1].data["message"] == "Anna, Alle Schritte geschafft! Jetzt auf Fertig drücken."


async def test_untick_and_completion_stay_silent(hass, hass_ws_client, freezer):
    ws, speak, tid = await _setup(hass, hass_ws_client, freezer, aids={"speak_auto": True})
    await _tick(hass, ws, tid, 0, done=False)
    await _wait(hass, freezer)
    assert speak == []
    for i in range(3):
        await _tick(hass, ws, tid, i)
    res = await _call(ws, "family_mission/kid_complete_task", task_id=tid, kid_id=ANNA, pin="1234")
    assert res["result"]["success"], res
    await _wait(hass, freezer)
    assert speak == []                                  # pending announcement dropped on completion


async def test_no_announcement_without_aid_or_voice_or_at_night(hass, hass_ws_client, freezer):
    ws, speak, tid = await _setup(hass, hass_ws_client, freezer)       # aid off
    await _tick(hass, ws, tid, 0)
    await _wait(hass, freezer)
    assert speak == []


async def test_no_announcement_when_voice_switched_off(hass, hass_ws_client, freezer):
    ws, speak, tid = await _setup(hass, hass_ws_client, freezer, options={"announce_enabled": False},
                                  aids={"speak_auto": True})
    await _tick(hass, ws, tid, 0)
    await _wait(hass, freezer)
    assert speak == []


async def test_no_announcement_at_night(hass, hass_ws_client, freezer):
    ws, speak, tid = await _setup(hass, hass_ws_client, freezer, aids={"speak_auto": True})
    freezer.move_to(NIGHT)
    await _tick(hass, ws, tid, 0)
    await _wait(hass, freezer)
    assert speak == []


async def _speak(ws, task_id, **kw):
    res = await _call(ws, "family_mission/kid_speak_step", task_id=task_id, kid_id=ANNA, pin="1234", **kw)
    assert res["success"], res
    return res["result"]


async def test_read_aloud_next_step_and_single_step(hass, hass_ws_client, freezer):
    ws, speak, tid = await _setup(hass, hass_ws_client, freezer, aids={"speak_steps": True})
    await _tick(hass, ws, tid, 0)
    await _wait(hass, freezer)
    assert speak == []                                  # no automatic announcement without speak_auto
    res = await _speak(ws, tid)
    await hass.async_block_till_done()
    assert res == {"success": True, "spoken": True, "reason": None, "text": "Anna, Jetzt: Zähne putzen.",
                   "title": "Zähne putzen", "all_done": False}
    assert speak[-1].data["message"] == "Anna, Jetzt: Zähne putzen."
    # a second request right away: shown on the tablet, but not spoken again
    res = await _speak(ws, tid, index=0)
    assert res["spoken"] is False and res["reason"] == "busy" and res["title"] == "🛏️ Bett machen"
    await _wait(hass, freezer)
    freezer.tick(timedelta(seconds=4))
    res = await _speak(ws, tid, index=0)
    await hass.async_block_till_done()
    assert res["spoken"] is True and res["text"] == "Bett machen."
    assert speak[-1].data["message"] == "Bett machen."
    assert len(speak) == 2


async def test_read_aloud_needs_aid_and_valid_step(hass, hass_ws_client, freezer):
    ws, _speak_calls, tid = await _setup(hass, hass_ws_client, freezer)
    res = await _speak(ws, tid)
    assert res == {"success": False, "error": "not_eligible"}
    await _call(ws, "family_mission/set_kid_profile", participant_id=ANNA, avatar="🦊", color="#ff8800",
                birth_year=2020, aids={"speak_steps": True})
    await hass.async_block_till_done()
    assert (await _speak(ws, tid, index=7))["error"] == "not_found"
    assert (await _speak(ws, tid, care_id="nope"))["error"] == "not_found"
    res = await _call(ws, "family_mission/kid_speak_step", task_id=tid, kid_id=ANNA, pin="0000")
    assert res["result"]["success"] is False             # wrong PIN


async def test_read_aloud_reports_night_and_voice_off(hass, hass_ws_client, freezer):
    ws, speak, tid = await _setup(hass, hass_ws_client, freezer, options={"announce_tts": ""},
                                  aids={"speak_steps": True})
    res = await _speak(ws, tid)
    assert res["spoken"] is False and res["reason"] == "off" and res["title"] == "🛏️ Bett machen"
    entry = hass.config_entries.async_entries("family_mission")[0]
    hass.config_entries.async_update_entry(entry, options={**entry.options, "announce_tts": "tts.piper"})
    await hass.async_block_till_done()
    freezer.move_to(NIGHT)
    res = await _speak(ws, tid)
    assert res["spoken"] is False and res["reason"] == "night"
    await hass.async_block_till_done()
    assert speak == []
