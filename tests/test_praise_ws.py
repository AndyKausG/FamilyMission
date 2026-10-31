"""Praise: parents send a sticker + message to a kid (no points), the kid marks it as seen."""

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.task_organizer.const import DOMAIN

ANNA, BEN = "person.anna", "person.ben"


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
    """Anna (own device) and Ben (tablet, PIN); Alex (parent, has a person), Sam (parent, no person), tablet user."""
    anna = await _token(hass, "Anna")
    alex = await _token(hass, "Alex")
    sam = await _token(hass, "Sam")
    tablet = await _token(hass, "Tablet")
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna[0].id})
    hass.states.async_set("person.alex", "home", {"friendly_name": "Alex (Mama)", "user_id": alex[0].id})
    hass.states.async_set(BEN, "home", {"friendly_name": "Ben"})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "overdue_days": 5, "parents": [alex[0].id, sam[0].id],
    })
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return {"anna": anna, "alex": alex, "sam": sam, "tablet": tablet}


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()

_call.n = 300


def _data(hass):
    return hass.data[DOMAIN]["data"]


async def _kids(hass, hass_ws_client, hass_access_token, env):
    admin = await hass_ws_client(hass, hass_access_token)
    for pid, pin in ((env["anna"][0].id, ""), (BEN, "2222")):
        res = await _call(admin, "task_organizer/set_kid_profile", participant_id=pid, avatar="🦊",
                          color="#ff8800", pin=pin, birth_year=2016)
        assert res["success"], res
    return admin


async def test_send_praise_roles_and_names(hass, hass_ws_client, hass_access_token, env):
    await _kids(hass, hass_ws_client, hass_access_token, env)
    events = []
    hass.bus.async_listen("task_organizer_praise", lambda e: events.append(e.data))
    # a user without a role is refused
    ws = await hass_ws_client(hass, env["tablet"][1])
    res = await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="Hi", sticker="⭐")
    assert res["error"]["code"] == "unauthorized" and _data(hass)["praise"] == []
    # the person name is preferred, else the user name
    ws = await hass_ws_client(hass, env["alex"][1])
    res = await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="Danke fürs Helfen!", sticker="❤️")
    assert res["success"] and res["result"]["praise_id"]
    ws = await hass_ws_client(hass, env["sam"][1])
    assert (await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="", sticker="🏆"))["success"]
    praise = _data(hass)["praise"]
    assert [p["from_name"] for p in praise] == ["Alex (Mama)", "Sam"]
    assert praise[0] | {"id": ""} == {
        "id": "", "kid_id": BEN, "from_name": "Alex (Mama)", "message": "Danke fürs Helfen!", "sticker": "❤️",
        "timestamp": praise[0]["timestamp"], "seen": False,
    }
    await hass.async_block_till_done()
    assert events[0] == {"kid_id": BEN, "kid_name": "Ben", "from_name": "Alex (Mama)",
                         "message": "Danke fürs Helfen!", "sticker": "❤️"}
    # no points anywhere, history entry with 0 points
    assert _data(hass)["points"].get(BEN, 0) == 0 and _data(hass).get("wallet", {}).get(BEN, 0) == 0
    entry = next(h for h in _data(hass)["history"] if h.get("type") == "praise")
    assert entry["points"] == 0 and entry["user_id"] == BEN
    assert entry["task_name"] == "🏆" and entry["from_name"] == "Sam"


async def test_send_praise_validation(hass, hass_ws_client, hass_access_token, env):
    ws = await _kids(hass, hass_ws_client, hass_access_token, env)
    bad_sticker = await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="x", sticker="💩")
    assert bad_sticker["success"] is False and bad_sticker["error"]["code"] == "invalid_format"
    too_long = await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="x" * 121, sticker="⭐")
    assert too_long["error"]["code"] == "invalid_format"
    unknown = await _call(ws, "task_organizer/send_praise", kid_id="person.nobody", message="x", sticker="⭐")
    assert unknown["error"]["code"] == "unknown_person"
    assert (await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="x" * 120, sticker="⭐"))["success"]
    assert len(_data(hass)["praise"]) == 1


async def test_praise_keeps_last_50_per_kid(hass, hass_ws_client, hass_access_token, env):
    ws = await _kids(hass, hass_ws_client, hass_access_token, env)
    anna = env["anna"][0].id
    assert (await _call(ws, "task_organizer/send_praise", kid_id=anna, message="for Anna", sticker="⭐"))["success"]
    for i in range(55):
        assert (await _call(ws, "task_organizer/send_praise", kid_id=BEN, message=f"n{i}", sticker="⭐"))["success"]
    praise = _data(hass)["praise"]
    ben = [p["message"] for p in praise if p["kid_id"] == BEN]
    assert len(ben) == 50 and ben[0] == "n5" and ben[-1] == "n54"
    assert [p["message"] for p in praise if p["kid_id"] == anna] == ["for Anna"]


async def test_kid_praise_seen_needs_pin_and_own_praise(hass, hass_ws_client, hass_access_token, env):
    ws = await _kids(hass, hass_ws_client, hass_access_token, env)
    anna = env["anna"][0].id
    pb = (await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="b", sticker="⭐"))["result"]["praise_id"]
    pa = (await _call(ws, "task_organizer/send_praise", kid_id=anna, message="a", sticker="🌟"))["result"]["praise_id"]
    tablet = await hass_ws_client(hass, env["tablet"][1])
    res = await _call(tablet, "task_organizer/kid_praise_seen", kid_id=BEN, pin="0000", praise_id=pb)
    assert res["result"]["error"] == "wrong_pin"
    assert not any(p["seen"] for p in _data(hass)["praise"])
    # a kid cannot mark the praise of another kid
    res = await _call(tablet, "task_organizer/kid_praise_seen", kid_id=BEN, pin="2222", praise_id=pa)
    assert res["result"] == {"success": False, "error": "not_found"}
    res = await _call(tablet, "task_organizer/kid_praise_seen", kid_id=BEN, pin="2222", praise_id=pb)
    assert res["result"] == {"success": True}
    seen = {p["id"]: p["seen"] for p in _data(hass)["praise"]}
    assert seen == {pb: True, pa: False}


async def test_my_praise_seen_uses_the_calling_user(hass, hass_ws_client, hass_access_token, env):
    ws = await _kids(hass, hass_ws_client, hass_access_token, env)
    anna = env["anna"][0].id
    pa = (await _call(ws, "task_organizer/send_praise", kid_id=anna, message="a", sticker="🌟"))["result"]["praise_id"]
    pb = (await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="b", sticker="⭐"))["result"]["praise_id"]
    own = await hass_ws_client(hass, env["anna"][1])
    assert (await _call(own, "task_organizer/my_praise_seen", praise_id=pb))["result"]["error"] == "not_found"
    assert (await _call(own, "task_organizer/my_praise_seen", praise_id=pa))["result"] == {"success": True}
    nobody = await hass_ws_client(hass, env["tablet"][1])
    assert (await _call(nobody, "task_organizer/my_praise_seen", praise_id=pb))["result"]["error"] == "unknown_kid"
    assert {p["id"]: p["seen"] for p in _data(hass)["praise"]} == {pa: True, pb: False}


async def test_get_data_exposes_praise(hass, hass_ws_client, hass_access_token, env):
    ws = await _kids(hass, hass_ws_client, hass_access_token, env)
    assert (await _call(ws, "task_organizer/send_praise", kid_id=BEN, message="b", sticker="⭐"))["success"]
    res = await _call(ws, "task_organizer/get_data")
    assert [p["message"] for p in res["result"]["praise"]] == ["b"]
