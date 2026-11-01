"""Takeover of the TaskOrganizer data (storage + config entry options), copy only."""

import copy
from datetime import timezone

import pytest
from homeassistant.auth.const import GROUP_ID_ADMIN, GROUP_ID_USER
from homeassistant.core import Context
from homeassistant.util import dt as dt_util
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.family_mission.const import DOMAIN
from custom_components.family_mission.migration import OLD_DOMAIN, OLD_STORAGE_KEY

NEW_KEY = f"{DOMAIN}.storage"

OLD_DATA = {
    "tasks": {"t1": {"id": "t1", "name": "Tidy room", "category": "basis", "points": 3, "assignees": ["person.anna"]}},
    "templates": {"tp1": {"id": "tp1", "name": "Dishes", "category": "bonus"}},
    "history": [{"type": "complete", "task_name": "Tidy room", "user_id": "person.anna", "points": 3}],
    "points": {"person.anna": 12.0, "person.ben": 4.0},
    "wallet": {"person.anna": 30.0, "person.ben": 8.0},
    "redemptions": {"r1": {"id": "r1", "kid_id": "person.anna", "status": "pending"}},
    "pending": {},
    "praise": [{"kid_id": "person.ben", "text": "Great job"}],
    "monthly_history": {"2026-09": {"person.anna": 40.0}},
    "custom_extra_key": {"keep": "me"},
    "settings": {},
}

OLD_OPTIONS = {
    "overdue_days": 7,
    "kids": {"person.anna": {"name": "Anna", "pin_hash": "abc", "pin_salt": "xyz"}},
    "parents": ["u-alex", "u-sam"],
    "rewards": [{"id": "rw1", "name": "Movie night", "cost": 20}],
    "point_goals": {"person.anna": 60},
}


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


def _put_old_storage(hass_storage, data=None):
    data = copy.deepcopy(OLD_DATA if data is None else data)
    # The old data belong to the running points period; a fixed month would be reset at
    # setup whenever the (frozen) start is in another month.
    now = dt_util.now()
    data.setdefault("current_month", now.strftime("%Y-%m"))
    data.setdefault("current_period_start", now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc).isoformat())
    hass_storage[OLD_STORAGE_KEY] = {
        "version": 1, "minor_version": 1, "key": OLD_STORAGE_KEY,
        "data": data,
    }


async def _setup(hass, options=None):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options or {})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _subset(small, big):
    """Every key of ``small`` is in ``big`` with the same value (setup adds defaults to tasks)."""
    return all(k in big and big[k] == v for k, v in small.items())


def _notifications(hass):
    return hass.data.get("persistent_notification", {})


async def test_migration_copies_data_and_options(hass, hass_storage):
    _put_old_storage(hass_storage)
    old_entry = MockConfigEntry(domain=OLD_DOMAIN, data={}, options=copy.deepcopy(OLD_OPTIONS))
    old_entry.add_to_hass(hass)

    entry = await _setup(hass)
    data = hass.data[DOMAIN]["data"]

    for key in ("tasks", "templates"):
        assert set(data[key]) == set(OLD_DATA[key])
        for tid, item in OLD_DATA[key].items():
            assert _subset(item, data[key][tid]), (key, tid)
    for key in ("history", "points", "wallet", "redemptions", "praise", "monthly_history", "custom_extra_key"):
        assert data[key] == OLD_DATA[key], key
    assert data["migrated_from"]["source"] == "task_organizer"
    assert data["migrated_from"]["at"]
    assert dict(entry.options) == OLD_OPTIONS
    assert data["settings"] == OLD_OPTIONS
    # persisted in the NEW storage
    saved = hass_storage[NEW_KEY]["data"]
    assert set(saved["tasks"]) == set(OLD_DATA["tasks"])
    assert saved["migrated_from"]["source"] == "task_organizer"
    # notification mentions the new names
    notes = _notifications(hass)
    assert notes
    text = " ".join(n["message"] for n in notes.values())
    assert "family-mission" in text and "FM_" in text


async def test_migration_runs_only_once(hass, hass_storage):
    _put_old_storage(hass_storage)
    entry = await _setup(hass)
    first = hass.data[DOMAIN]["data"]["migrated_from"]["at"]
    # the family continues in the new integration; later changes in the old storage must not leak in
    hass.data[DOMAIN]["data"]["points"] = {}
    hass.data[DOMAIN]["data"]["tasks"] = {}
    hass.data[DOMAIN]["data"]["history"] = []
    await hass.data[DOMAIN]["store"].async_save(hass.data[DOMAIN]["data"])
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    data = hass.data[DOMAIN]["data"]
    assert data["migrated_from"]["at"] == first
    assert data["tasks"] == {} and data["points"] == {}


async def test_no_migration_without_old_data(hass, hass_storage):
    await _setup(hass)
    data = hass.data[DOMAIN]["data"]
    assert "migrated_from" not in data
    assert data["tasks"] == {}
    assert not _notifications(hass)


async def test_no_migration_when_new_storage_has_data(hass, hass_storage):
    _put_old_storage(hass_storage)
    hass_storage[NEW_KEY] = {
        "version": 1, "minor_version": 1, "key": NEW_KEY,
        "data": {"tasks": {"x": {"id": "x", "name": "Own task"}}, "points": {}, "history": [], "settings": {}},
    }
    await _setup(hass)
    data = hass.data[DOMAIN]["data"]
    assert list(data["tasks"]) == ["x"]
    assert "migrated_from" not in data


async def test_existing_options_are_not_overwritten(hass, hass_storage):
    _put_old_storage(hass_storage)
    old_entry = MockConfigEntry(domain=OLD_DOMAIN, data={}, options=copy.deepcopy(OLD_OPTIONS))
    old_entry.add_to_hass(hass)
    entry = await _setup(hass, options={"overdue_days": 2})
    assert dict(entry.options) == {"overdue_days": 2}
    assert set(hass.data[DOMAIN]["data"]["tasks"]) == set(OLD_DATA["tasks"])


async def test_old_storage_and_entry_are_never_touched(hass, hass_storage):
    _put_old_storage(hass_storage)
    before = copy.deepcopy(hass_storage[OLD_STORAGE_KEY])
    old_entry = MockConfigEntry(domain=OLD_DOMAIN, data={}, options=copy.deepcopy(OLD_OPTIONS))
    old_entry.add_to_hass(hass)
    await _setup(hass)
    # mutate our copy: the old one must stay as it was
    hass.data[DOMAIN]["data"]["tasks"]["t1"]["name"] = "Changed"
    hass.data[DOMAIN]["data"]["points"]["person.anna"] = 999
    await hass.data[DOMAIN]["store"].async_save(hass.data[DOMAIN]["data"])
    await hass.async_block_till_done()
    assert hass_storage[OLD_STORAGE_KEY] == before
    assert dict(old_entry.options) == OLD_OPTIONS
    assert hass.config_entries.async_get_entry(old_entry.entry_id) is old_entry


# ---------------- service ----------------

async def _user(hass, name, admin):
    return await hass.auth.async_create_user(name, group_ids=[GROUP_ID_ADMIN if admin else GROUP_ID_USER])


async def _import(hass, user=None, **data):
    ctx = Context(user_id=user.id) if user else Context()
    return await hass.services.async_call(DOMAIN, "import_from_task_organizer", data, blocking=True, context=ctx)


async def test_service_requires_overwrite(hass, hass_storage):
    await _setup(hass)
    _put_old_storage(hass_storage)
    admin = await _user(hass, "Alex", True)
    with pytest.raises(ServiceValidationError):
        await _import(hass, admin, overwrite=False)
    assert hass.data[DOMAIN]["data"]["tasks"] == {}


async def test_service_requires_admin(hass, hass_storage):
    await _setup(hass)
    _put_old_storage(hass_storage)
    await _user(hass, "Owner", True)  # the first user of an auth store becomes the owner (admin)
    user = await _user(hass, "Ben", False)
    assert not user.is_admin
    with pytest.raises(HomeAssistantError):
        await _import(hass, user, overwrite=True)
    assert hass.data[DOMAIN]["data"]["tasks"] == {}


async def test_service_without_old_data(hass, hass_storage):
    await _setup(hass)
    admin = await _user(hass, "Alex", True)
    with pytest.raises(ServiceValidationError):
        await _import(hass, admin, overwrite=True)


async def test_service_repeats_import(hass, hass_storage):
    entry = await _setup(hass)
    hass.data[DOMAIN]["data"]["tasks"] = {"own": {"id": "own", "name": "Own"}}
    _put_old_storage(hass_storage)
    old_entry = MockConfigEntry(domain=OLD_DOMAIN, data={}, options=copy.deepcopy(OLD_OPTIONS))
    old_entry.add_to_hass(hass)
    before = copy.deepcopy(hass_storage[OLD_STORAGE_KEY])
    admin = await _user(hass, "Alex", True)
    await _import(hass, admin, overwrite=True)
    await hass.async_block_till_done()
    data = hass.data[DOMAIN]["data"]
    assert set(data["tasks"]) == set(OLD_DATA["tasks"])
    assert data["migrated_from"]["source"] == "task_organizer"
    assert dict(entry.options) == OLD_OPTIONS
    assert set(hass_storage[NEW_KEY]["data"]["tasks"]) == set(OLD_DATA["tasks"])
    assert hass_storage[OLD_STORAGE_KEY] == before
