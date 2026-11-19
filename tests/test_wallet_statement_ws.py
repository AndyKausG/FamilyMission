"""Wallet statement ("Kontoauszug"): family_mission/wallet_statement."""

from datetime import datetime, timezone

import pytest
from homeassistant.core import callback
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission import _async_check_monthly_reset
from custom_components.family_mission.const import DOMAIN

ANNA, BEN, CLARA = "person.anna", "person.ben", "person.clara"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)


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
async def users(hass):
    return {"manager": await _token(hass, "Alex"), "parent": await _token(hass, "Sam"),
            "other": await _token(hass, "Tablet")}


@pytest.fixture
async def setup(hass, users):
    for pid, name in ((ANNA, "Anna"), (BEN, "Ben"), (CLARA, "Clara")):
        hass.states.async_set(pid, "home", {"friendly_name": name})
    options = {"overdue_days": 5, "parents": [users["parent"][0].id, users["manager"][0].id],
               "parents_manage": [users["manager"][0].id]}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options)
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()

_call.n = 100


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _wallet(hass, uid=ANNA):
    return _data(hass)["wallet"].get(uid, 0)


async def _kid(ws, pid=ANNA, pin="1234", birth_year=2016, **kw):
    res = await _call(ws, "family_mission/set_kid_profile", participant_id=pid, avatar="🦊",
                      color="#ff8800", pin=pin, birth_year=birth_year, **kw)
    assert res["success"], res


async def _task(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis",
               "assignees": [ANNA]}
    payload.update(kw)
    res = await _call(ws, "family_mission/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _complete(ws, tid, kid=ANNA, pin="1234", **kw):
    return (await _call(ws, "family_mission/kid_complete_task", task_id=tid, kid_id=kid, pin=pin, **kw))["result"]


async def _rewards(ws, rewards=None):
    rewards = rewards or [
        {"id": "r1", "name": "Medienzeit", "emoji": "📺", "cost": 15, "min_age": 0, "active": True},
        {"id": "r2", "name": "Ausflug", "emoji": "🎟️", "cost": 200, "min_age": 0, "active": True},
        {"id": "r3", "name": "Spaetes Bett", "emoji": "🌙", "cost": 5, "min_age": 12, "active": True},
        {"id": "r4", "name": "Alt", "emoji": "🎁", "cost": 5, "min_age": 0, "active": False},
    ]
    res = await _call(ws, "family_mission/set_rewards", rewards=rewards)
    assert res["success"], res


async def _redeem(ws, reward_id="r1", kid=ANNA, pin="1234"):
    return (await _call(ws, "family_mission/kid_redeem", kid_id=kid, pin=pin, reward_id=reward_id))["result"]


NOV = datetime(2026, 11, 2, 18, 0, tzinfo=timezone.utc)


async def _statement(ws, kid=ANNA, **kw):
    res = await _call(ws, "family_mission/wallet_statement", kid_id=kid, **kw)
    assert res["success"], res
    return res["result"]


async def test_wallet_statement_months(hass, hass_ws_client, setup, users, freezer):
    ws = await hass_ws_client(hass)
    tablet = await hass_ws_client(hass, users["other"][1])
    freezer.move_to(NOON)
    await _kid(ws)
    await _rewards(ws)
    for _ in range(2):
        assert (await _complete(ws, await _task(ws, complexity=10)))["success"]
    assert (await _redeem(ws, "r1"))["success"]
    assert _wallet(hass) == 5

    res = await _statement(tablet)   # read-only: any user may read it, like get_data
    assert res["balance"] == 5
    (octo,) = res["months"]
    assert octo["month"] == "2026-10" and octo["opening"] == 0 and octo["closing"] == 5
    assert octo["credits"] == [{"type": "task", "count": 2, "points": 20}]
    assert octo["debits"] == [{"type": "redeem", "name": "📺 Medienzeit", "date": "2026-10-29", "points": -15}]

    # New month: points reset, wallet carried over
    freezer.move_to(NOV)
    await _async_check_monthly_reset(hass)
    assert _data(hass)["points"].get(ANNA, 0) == 0 and _wallet(hass) == 5
    assert (await _complete(ws, await _task(ws, complexity=4)))["success"]
    res = await _statement(ws, months=2)
    nov, octo = res["months"]
    assert nov["month"] == "2026-11" and nov["opening"] == 5 and nov["closing"] == 9
    assert nov["credits"] == [{"type": "task", "count": 1, "points": 4}] and nov["debits"] == []
    assert octo["closing"] == 5
    # Only the current month asked for
    assert [m["month"] for m in (await _statement(ws, months=1))["months"]] == ["2026-11"]


async def test_wallet_statement_unknown_kid_and_limits(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    res = await _statement(ws, kid="person.nobody")
    assert res == {"kid_id": "person.nobody", "balance": 0, "months": []}
    for months in (0, 13):
        res = await _call(ws, "family_mission/wallet_statement", kid_id=ANNA, months=months)
        assert not res["success"]
