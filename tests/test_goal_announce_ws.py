"""FamilyMission 2.5: voice announcement and event when a kid reaches the savings goal."""

from datetime import datetime, timezone

import pytest
from homeassistant.core import callback
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import _async_check_savings_goals
from custom_components.family_mission.const import DOMAIN

ANNA = "person.anna"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)      # Thu 11:00 local (US/Pacific)
NIGHT = datetime(2026, 10, 30, 6, 0, tzinfo=timezone.utc)      # Thu 23:00 local
MORNING = datetime(2026, 10, 30, 14, 0, tzinfo=timezone.utc)   # Fri 07:00 local
ANNOUNCE = {
    "announce_enabled": True,
    "announce_tts": "tts.piper",
    "announce_players": ["media_player.kueche"],
}
TEXT = "Anna hat das Sparziel erreicht: Kino. Jetzt kann eingelöst werden!"


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


def _data(hass):
    return hass.data[DOMAIN]["data"]


@pytest.fixture
async def env(hass, hass_ws_client, freezer):
    """Anna is a kid with the savings goal "Kino" (10 points) and 8 points in the wallet."""
    hass.config.language = "de"
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    speak = async_mock_service(hass, "tts", "speak")
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={"overdue_days": 5, **ANNOUNCE})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    res = await _call(ws, "family_mission/set_kid_profile", participant_id=ANNA, avatar="🦊",
                      color="#ff8800", pin="1234", birth_year=2016)
    assert res["success"], res
    res = await _call(ws, "family_mission/set_rewards", rewards=[
        {"id": "kino", "name": "Kino", "emoji": "🎬", "cost": 10, "min_age": 0, "active": True},
    ])
    assert res["success"], res
    await hass.async_block_till_done()
    _data(hass).setdefault("wallet", {})[ANNA] = 8.0
    res = await _call(ws, "family_mission/kid_set_goal", kid_id=ANNA, pin="1234", reward_id="kino")
    assert res["success"] and res["result"]["success"], res
    await hass.async_block_till_done()
    events = []
    hass.bus.async_listen("family_mission_savings_goal_reached", callback(lambda e: events.append(e.data)))
    return {"ws": ws, "entry": entry, "speak": speak, "events": events}


async def _credit(hass, ws, points):
    res = await _call(ws, "family_mission/adjust_points", kid_id=ANNA, points=points, reason="Test")
    assert res["success"], res
    await hass.async_block_till_done()


async def test_reaching_the_goal_is_announced_once(hass, env):
    ws, speak, events = env["ws"], env["speak"], env["events"]
    await _credit(hass, ws, 1)                       # 9 < 10
    assert speak == [] and events == []
    await _credit(hass, ws, 3)                       # 12 >= 10
    assert [c.data["message"] for c in speak] == [TEXT]
    assert speak[0].data["media_player_entity_id"] == ["media_player.kueche"]
    assert events == [{"kid_id": ANNA, "kid_name": "Anna", "reward_id": "kino", "name": "Kino",
                       "emoji": "🎬", "cost": 10.0, "balance": 12.0}]
    await _credit(hass, ws, 2)                       # still reached: nothing new
    assert len(speak) == 1 and len(events) == 1
    assert _data(hass)["goal_reached"] == {ANNA: "kino"}


async def test_redeem_resets_and_reaching_again_is_announced(hass, env):
    ws, speak = env["ws"], env["speak"]
    await _credit(hass, ws, 3)
    assert len(speak) == 1
    res = await _call(ws, "family_mission/kid_redeem", kid_id=ANNA, pin="1234", reward_id="kino")
    assert res["result"]["success"], res
    await hass.async_block_till_done()
    assert ANNA not in _data(hass)["goal_reached"]
    await _credit(hass, ws, 9)                       # 1 + 9 = 10
    assert [c.data["message"] for c in speak] == [TEXT, TEXT]


async def test_goals_reached_before_the_update_stay_silent(hass, env):
    speak = env["speak"]
    data = _data(hass)
    data.pop("goal_reached", None)
    data["wallet"][ANNA] = 50.0
    assert await _async_check_savings_goals(hass) == 0
    assert speak == [] and data["goal_reached"] == {ANNA: "kino"}


async def test_night_waits_for_the_morning(hass, env, freezer):
    ws, speak, events = env["ws"], env["speak"], env["events"]
    freezer.move_to(NIGHT)
    await _credit(hass, ws, 5)
    assert speak == [] and events == [] and ANNA not in _data(hass)["goal_reached"]
    freezer.move_to(MORNING)
    assert await _async_check_savings_goals(hass) == 1
    await hass.async_block_till_done()
    assert [c.data["message"] for c in speak] == [TEXT] and len(events) == 1


async def test_kind_switched_off_fires_only_the_event(hass, env, freezer):
    ws, entry, speak, events = env["ws"], env["entry"], env["speak"], env["events"]
    hass.config_entries.async_update_entry(entry, options={**entry.options, "announce_events": ["adhoc"]})
    await hass.async_block_till_done()
    freezer.move_to(NIGHT)                           # without voice the night does not delay the event
    await _credit(hass, ws, 5)
    assert speak == [] and len(events) == 1


async def test_settings_accept_the_goal_kind(hass, env):
    ws, entry = env["ws"], env["entry"]
    res = await _call(ws, "family_mission/update_settings", settings={"announce_events": ["goal", "x", "waste"]})
    assert res["success"], res
    await hass.async_block_till_done()
    assert entry.options["announce_events"] == ["waste", "goal"]
