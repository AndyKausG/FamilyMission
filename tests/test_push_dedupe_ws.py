"""A notify service reached by several adults (shared phone / same target) gets a push and a clear_notification once."""

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.family_mission import _async_clear_push, _async_push_all_adults
from custom_components.family_mission.const import DOMAIN


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
async def env(hass):
    anna = await hass.auth.async_create_user("Anna", group_ids=[GROUP_ID_USER])
    ben = await hass.auth.async_create_user("Ben", group_ids=[GROUP_ID_USER])
    hass.states.async_set("person.anna", "home", {"friendly_name": "Anna", "user_id": anna.id})
    hass.states.async_set("person.ben", "home", {"friendly_name": "Ben", "user_id": ben.id})
    MockConfigEntry(domain="mobile_app", data={"user_id": ben.id, "device_name": "Ben Phone"}).add_to_hass(hass)

    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={
        "overdue_days": 5,
        "parents": [anna.id],
        # Anna's target is Ben's phone: both adults reach notify.mobile_app_ben_phone
        "parent_notify": {anna.id: "notify.mobile_app_ben_phone"},
    })
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return {"phone": async_mock_service(hass, "notify", "mobile_app_ben_phone")}


async def test_shared_service_gets_push_once(hass, env):
    assert await _async_push_all_adults(hass, "Title", "Text", tag="t1")
    assert len(env["phone"]) == 1
    assert env["phone"][0].data["data"]["tag"] == "t1"


async def test_shared_service_is_cleared_once(hass, env):
    await _async_clear_push(hass, "t1")
    assert len(env["phone"]) == 1
    assert env["phone"][0].data["message"] == "clear_notification"
