"""FamilyMission 2.3.1: icon set registration (Lovelace resource + extra module) and get_data.version."""

import json
from pathlib import Path

import pytest
from homeassistant.components import frontend
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission.const import DOMAIN

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "family_mission"
ICONS = "/family_mission_frontend/family-mission-icons.js"
EDITOR = "/family_mission_frontend/family-mission-task-editor.js"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


class _Resources:
    loaded = True

    def __init__(self):
        self.items = []

    def async_items(self):
        return list(self.items)

    async def async_create_item(self, item):
        self.items.append({"id": f"r{len(self.items)}", **item})

    async def async_delete_item(self, res_id):
        self.items = [i for i in self.items if i["id"] != res_id]


class _Lovelace:
    def __init__(self):
        self.resources = _Resources()


async def _setup(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()
    hass.data["lovelace"] = _Lovelace()
    hass.data[frontend.DATA_EXTRA_MODULE_URL] = frontend.UrlManager(lambda *_: None, [])
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _manifest_version():
    return json.loads((ROOT / "manifest.json").read_text())["version"]


async def test_icon_set_registered_as_resource_and_extra_module(hass):
    entry = await _setup(hass)
    version = _manifest_version()
    urls = [i["url"] for i in hass.data["lovelace"].resources.items]
    assert any(u.startswith(ICONS + "?v=") for u in urls)
    assert f"{ICONS}?v={version}" in hass.data[frontend.DATA_EXTRA_MODULE_URL].urls
    assert (ROOT / "www" / "family-mission-icons.js").is_file()

    # unload removes the extra module, a reload registers it exactly once
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert not hass.data[frontend.DATA_EXTRA_MODULE_URL].urls
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert len(hass.data[frontend.DATA_EXTRA_MODULE_URL].urls) == 1


async def test_task_editor_registered_as_resource(hass):
    """2.7.0: the shared task editor is a Lovelace resource and ships as a file."""
    await _setup(hass)
    urls = [i["url"] for i in hass.data["lovelace"].resources.items]
    assert sum(1 for u in urls if u.startswith(EDITOR + "?v=")) == 1
    assert (ROOT / "www" / "family-mission-task-editor.js").is_file()


def test_task_editor_is_used_by_the_three_hosts():
    """Settings, household and parents card load the one shared editor (no private task forms any more)."""
    www = ROOT / "www"
    editor = (www / "family-mission-task-editor.js").read_text(encoding="utf-8")
    assert "customElements.define('family-mission-task-editor'" in editor
    assert editor.count("customElements.define(") == 1
    # the file guards itself against a second evaluation (resource + dynamic import)
    assert "if (customElements.get('family-mission-task-editor')) return;" in editor
    for name in ("family-mission-settings.js", "family-mission-card.js", "family-mission-parents.js"):
        text = (www / name).read_text(encoding="utf-8")
        assert "/family_mission_frontend/family-mission-task-editor.js" in text, name
        assert "family-mission-task-editor" in text, name
        assert "fm-editor-" in text, name
    # the old private forms are gone
    assert 'id="tmpl-name"' not in (www / "family-mission-settings.js").read_text(encoding="utf-8")
    assert 'id="f-name"' not in (www / "family-mission-card.js").read_text(encoding="utf-8")
    assert "nt-from-we" not in (www / "family-mission-parents.js").read_text(encoding="utf-8")


def test_task_editor_has_no_ha_form_elements():
    """One consistent control set: the editor renders plain buttons / inputs, no ha-input / ha-switch / ha-select."""
    text = (ROOT / "www" / "family-mission-task-editor.js").read_text(encoding="utf-8")
    for tag in ("<ha-input", "<ha-switch", "<ha-select", "<ha-formfield", "<ha-checkbox", "<ha-area-picker"):
        assert tag not in text, tag


async def test_setup_without_frontend_is_harmless(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)


async def test_get_data_returns_manifest_version(hass, hass_ws_client):
    await _setup(hass)
    ws = await hass_ws_client(hass)
    await ws.send_json({"id": 1, "type": "family_mission/get_data"})
    res = await ws.receive_json()
    assert res["success"]
    assert res["result"]["version"] == _manifest_version()
