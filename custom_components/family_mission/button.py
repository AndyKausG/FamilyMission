"""Button platform for FamilyMission."""
from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, SERVICE_RESET_MONTHLY_POINTS, SERVICE_FACTORY_RESET


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up FamilyMission button entities."""
    async_add_entities([
        FamilyMissionResetMonthButton(hass),
        FamilyMissionFactoryResetButton(hass)
    ])


class FamilyMissionResetMonthButton(ButtonEntity):
    """Button to force monthly reset."""
    
    _attr_has_entity_name = True
    _attr_translation_key = "reset_month"

    def __init__(self, hass: HomeAssistant):
        self.hass = hass
        self._attr_unique_id = f"{DOMAIN}_button_reset_month"
        self.entity_id = f"button.{DOMAIN}_reset_month"
        self._attr_icon = "mdi:calendar-refresh"

    async def async_press(self) -> None:
        """Handle the button press."""
        await self.hass.services.async_call(DOMAIN, SERVICE_RESET_MONTHLY_POINTS)


class FamilyMissionFactoryResetButton(ButtonEntity):
    """Button to perform factory reset."""
    
    _attr_has_entity_name = True
    _attr_translation_key = "factory_reset"

    def __init__(self, hass: HomeAssistant):
        self.hass = hass
        self._attr_unique_id = f"{DOMAIN}_button_factory_reset"
        self.entity_id = f"button.{DOMAIN}_factory_reset"
        self._attr_icon = "mdi:delete-alert"

    async def async_press(self) -> None:
        """Handle the button press."""
        await self.hass.services.async_call(DOMAIN, SERVICE_FACTORY_RESET)