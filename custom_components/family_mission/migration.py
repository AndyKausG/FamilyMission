"""One-time takeover of the data of the TaskOrganizer integration.

FamilyMission is based on TaskOrganizer (MIT, Patrick von Wiegen) and can be
installed next to it. When FamilyMission starts without own data and finds the
storage ``task_organizer.storage`` of TaskOrganizer, everything is *copied*
into FamilyMission's own storage and the options of an existing
``task_organizer`` config entry are copied as well.

The old storage and the old config entry are only ever read, never written,
changed or deleted.
"""

from __future__ import annotations

import copy
import logging
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)

OLD_DOMAIN = "task_organizer"
OLD_STORAGE_KEY = f"{OLD_DOMAIN}.storage"
NOTIFICATION_ID = f"{DOMAIN}_migrated_from_{OLD_DOMAIN}"


def data_is_empty(data: Any) -> bool:
    """True when the storage holds no tasks, no history and no points."""
    if not isinstance(data, dict):
        return True
    return not (data.get("tasks") or data.get("history") or data.get("points"))


async def async_load_old_data(hass: HomeAssistant) -> dict | None:
    """Read (a deep copy of) the TaskOrganizer storage; ``None`` if there is none.

    Only ``async_load`` is used on the old store - it never writes.
    """
    try:
        old = await Store(hass, STORAGE_VERSION, OLD_STORAGE_KEY).async_load()
    except Exception:  # noqa: BLE001 - a broken old file must never break the setup
        _LOGGER.warning("Could not read the TaskOrganizer storage", exc_info=True)
        return None
    if not isinstance(old, dict) or not old:
        return None
    return copy.deepcopy(old)


def _old_entry(hass: HomeAssistant) -> ConfigEntry | None:
    entries = hass.config_entries.async_entries(OLD_DOMAIN)
    return entries[0] if entries else None


def _copy_options(hass: HomeAssistant, entry: ConfigEntry, *, force: bool) -> bool:
    """Copy the options of the TaskOrganizer entry (only if ours are empty, or ``force``)."""
    old_entry = _old_entry(hass)
    if old_entry is None or not old_entry.options:
        return False
    if entry.options and not force:
        return False
    hass.config_entries.async_update_entry(entry, options=copy.deepcopy(dict(old_entry.options)))
    return True


def build_migrated_data(old: dict) -> dict:
    """The new storage content: a full copy of the old one plus the marker."""
    data = copy.deepcopy(old)
    data["migrated_from"] = {"source": OLD_DOMAIN, "at": dt_util.utcnow().isoformat()}
    return data


async def async_auto_migrate(
    hass: HomeAssistant, entry: ConfigEntry, data: dict | None
) -> tuple[dict | None, bool]:
    """Setup hook: take over the TaskOrganizer data once.

    Returns ``(data, migrated)``. ``data`` is returned unchanged if nothing was
    migrated. The caller saves the result and calls :func:`notify_migrated`.
    """
    if isinstance(data, dict) and data.get("migrated_from"):
        return data, False
    if not data_is_empty(data):
        return data, False
    old = await async_load_old_data(hass)
    if old is None:
        return data, False
    new_data = build_migrated_data(old)
    _copy_options(hass, entry, force=False)
    _LOGGER.info("FamilyMission: data of TaskOrganizer taken over")
    return new_data, True


async def async_import_now(hass: HomeAssistant, entry: ConfigEntry) -> dict | None:
    """Service hook: build the migrated data (always, overwriting) and copy the options.

    Returns the new data, or ``None`` if there is no TaskOrganizer storage.
    """
    old = await async_load_old_data(hass)
    if old is None:
        return None
    _copy_options(hass, entry, force=True)
    return build_migrated_data(old)


def notify_migrated(hass: HomeAssistant) -> None:
    """Tell the user what to change in dashboards and automations."""
    if str(hass.config.language).lower().startswith("de"):
        title = "FamilyMission: Daten aus TaskOrganizer übernommen"
        message = (
            "Aufgaben, Vorlagen, Verlauf, Punkte, Wallet, Belohnungen, Kinderprofile (inkl. PINs) "
            "und Einstellungen wurden aus TaskOrganizer **kopiert**. TaskOrganizer selbst wurde nicht verändert.\n\n"
            "Bitte noch anpassen:\n"
            "- Dashboard-Karten: `custom:task-organizer-…` → `custom:family-mission-…`\n"
            "- Dienste, Ereignisse und Automationen: `task_organizer` → `family_mission`\n"
            "- Push-Aktionen: Präfix `TO_` → `FM_`\n\n"
            "Danach kann TaskOrganizer entfernt werden."
        )
    else:
        title = "FamilyMission: data taken over from TaskOrganizer"
        message = (
            "Tasks, templates, history, points, wallet, rewards, kid profiles (incl. PINs) and settings "
            "were **copied** from TaskOrganizer. TaskOrganizer itself was not changed.\n\n"
            "Please still adjust:\n"
            "- Dashboard cards: `custom:task-organizer-…` → `custom:family-mission-…`\n"
            "- Services, events and automations: `task_organizer` → `family_mission`\n"
            "- Push action prefixes: `TO_` → `FM_`\n\n"
            "Afterwards you can remove TaskOrganizer."
        )
    persistent_notification.async_create(hass, message, title=title, notification_id=NOTIFICATION_ID)
