"""Sensors for the FamilyMission integration."""
import json
from datetime import timedelta

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from .const import DEFAULT_OVERDUE_DAYS, DOMAIN, EVENT_TASK_UPDATED
from .kids import resolve_participant_name, sanitize_settings

async def async_setup_entry(hass: HomeAssistant, entry, async_add_entities):
    """
    Initialize all sensors for the FamilyMission integration.
    
    :param hass: The Home Assistant instance.
    :param entry: The config entry.
    :param async_add_entities: Callback to add entities to HA.
    """
    sensors = [
        FamilyMissionAllTasksSensor(hass),
        FamilyMissionDueTasksSensor(hass),
        FamilyMissionOverdueTasksSensor(hass),
        FamilyMissionDueAndOverdueTasksSensor(hass),
        FamilyMissionSettingsSensor(hass),
        FamilyMissionPointsSensor(hass),
        FamilyMissionTemplatesSensor(hass),
    ]
    async_add_entities(sensors)
    _remove_orphaned_leaderboard(hass)


def _remove_orphaned_leaderboard(hass: HomeAssistant) -> None:
    """Drop the entity of the removed leaderboard sensor from the entity registry."""
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id("sensor", DOMAIN, "family_mission_leaderboard")
    if entity_id:
        registry.async_remove(entity_id)


class FamilyMissionBaseSensor(SensorEntity):
    """Base class representing a generic FamilyMission sensor."""
    
    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, unique_id: str, translation_key: str):
        """
        Initialize the base sensor.
        
        :param hass: The Home Assistant instance.
        :param unique_id: The unique identifier for this sensor.
        :param translation_key: The string key used for translations.
        """
        self.hass = hass
        self._attr_unique_id = unique_id
        self._attr_translation_key = translation_key
        # Stable, prefixed entity id (e.g. sensor.family_mission_all_tasks)
        # instead of one derived from the translated name.
        self.entity_id = f"sensor.{unique_id}"
        self._data = hass.data[DOMAIN]["data"]

    async def async_added_to_hass(self):
        """Hook called when the entity is added to Home Assistant."""
        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_TASK_UPDATED, self._handle_update)
        )

    async def _handle_update(self, event):
        """Callback to handle data updates from the event bus."""
        self._data = self.hass.data[DOMAIN]["data"]
        self.async_write_ha_state()


class FamilyMissionAllTasksSensor(FamilyMissionBaseSensor):
    """Sensor tracking the total number of tasks."""
    
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, hass: HomeAssistant):
        super().__init__(hass, "family_mission_all_tasks", "all_tasks")
        self._attr_icon = "mdi:calendar-check-outline"

    @property
    def native_value(self) -> int:
        """Return the total amount of tasks."""
        return len(self._data.get("tasks", {}))

    @property
    def extra_state_attributes(self) -> dict:
        """Return task array as state attributes."""
        tasks_list = list(self._data.get("tasks", {}).values())
        return {
            "json_string": json.dumps(tasks_list), 
            "data": tasks_list
        }


class FamilyMissionDueTasksSensor(FamilyMissionBaseSensor):
    """Sensor tracking the number of currently due tasks."""
    
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, hass: HomeAssistant):
        """Initialize the sensor for due tasks."""
        super().__init__(hass, "family_mission_due_tasks", "due_tasks")
        self._attr_icon = "mdi:calendar-check"

    def _get_due_tasks(self) -> list:
        """Helper to extract tasks that are due but not overdue."""
        now = dt_util.now().date()
        settings = self._data.get("settings", {})
        overdue_days = settings.get("overdue_days", DEFAULT_OVERDUE_DAYS)

        due_tasks = []
        for task in self._data.get("tasks", {}).values():
            if task.get("due_date"):
                paused_until_str = task.get("paused_until")
                is_paused = False
                if paused_until_str:
                    paused_date = dt_util.parse_datetime(paused_until_str).date()
                    if now <= paused_date:
                        is_paused = True

                due_date = dt_util.parse_datetime(task["due_date"]).date()
                task_overdue_days = task.get("override_overdue_days")
                if task_overdue_days is None:
                    task_overdue_days = overdue_days
                # A task is due if its due date is today or in the past, but not yet past the overdue threshold.
                if not is_paused and due_date <= now and due_date > (now - timedelta(days=task_overdue_days)):
                    due_tasks.append(task)
        return due_tasks

    @property
    def native_value(self) -> int:
        """Return the count of due tasks."""
        return len(self._get_due_tasks())

    @property
    def extra_state_attributes(self) -> dict:
        """Return due tasks array as state attributes."""
        due_tasks = self._get_due_tasks()
        return {
            "json_string": json.dumps(due_tasks), 
            "data": due_tasks
        }


class FamilyMissionOverdueTasksSensor(FamilyMissionBaseSensor):
    """Sensor tracking the number of overdue tasks."""

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, hass: HomeAssistant):
        """Initialize the sensor for overdue tasks."""
        super().__init__(hass, "family_mission_overdue_tasks", "overdue_tasks")
        self._attr_icon = "mdi:calendar-alert"

    def _get_overdue_tasks(self) -> list:
        """Helper to extract tasks that are overdue."""
        now = dt_util.now().date()
        settings = self._data.get("settings", {})
        overdue_days = settings.get("overdue_days", DEFAULT_OVERDUE_DAYS)

        overdue_tasks = []
        for task in self._data.get("tasks", {}).values():
            if task.get("due_date") and not task.get("parent_task"):  # parents' tasks are never overdue
                paused_until_str = task.get("paused_until")
                is_paused = False
                if paused_until_str:
                    paused_date = dt_util.parse_datetime(paused_until_str).date()
                    if now <= paused_date:
                        is_paused = True

                due_date = dt_util.parse_datetime(task["due_date"]).date()
                task_overdue_days = task.get("override_overdue_days")
                if task_overdue_days is None:
                    task_overdue_days = overdue_days
                # A task is overdue if its due date is past the overdue threshold.
                if not is_paused and due_date <= (now - timedelta(days=task_overdue_days)):
                    overdue_tasks.append(task)
        return overdue_tasks

    @property
    def native_value(self) -> int:
        """Return the count of overdue tasks."""
        return len(self._get_overdue_tasks())

    @property
    def extra_state_attributes(self) -> dict:
        """Return overdue tasks array as state attributes."""
        overdue_tasks = self._get_overdue_tasks()
        return {"json_string": json.dumps(overdue_tasks), "data": overdue_tasks}


class FamilyMissionDueAndOverdueTasksSensor(FamilyMissionBaseSensor):
    """Sensor tracking the number of due and overdue tasks combined."""

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, hass: HomeAssistant):
        """Initialize the sensor for due and overdue tasks."""
        super().__init__(
            hass, "family_mission_due_and_overdue_tasks", "due_and_overdue_tasks"
        )
        self._attr_icon = "mdi:calendar-multiple-check"

    def _get_due_and_overdue_tasks(self) -> list:
        """Helper to extract tasks that are due today or earlier."""
        now = dt_util.now().date()
        due_tasks = []
        for task in self._data.get("tasks", {}).values():
            if task.get("due_date"):
                paused_until_str = task.get("paused_until")
                is_paused = False
                if paused_until_str:
                    paused_date = dt_util.parse_datetime(paused_until_str).date()
                    if now <= paused_date:
                        is_paused = True

                due_date = dt_util.parse_datetime(task["due_date"]).date()
                if not is_paused and due_date <= now:
                    due_tasks.append(task)
        return due_tasks

    @property
    def native_value(self) -> int:
        """Return the count of due and overdue tasks."""
        return len(self._get_due_and_overdue_tasks())

    @property
    def extra_state_attributes(self) -> dict:
        """Return due and overdue tasks array as state attributes."""
        due_tasks = self._get_due_and_overdue_tasks()
        return {"json_string": json.dumps(due_tasks), "data": due_tasks}


class FamilyMissionSettingsSensor(FamilyMissionBaseSensor):
    """Sensor tracking the integration settings."""

    def __init__(self, hass: HomeAssistant):
        super().__init__(hass, "family_mission_settings", "settings")
        self._attr_icon = "mdi:cog"

    @property
    def native_value(self) -> str:
        """Return a generic OK state."""
        return "OK"

    @property
    def extra_state_attributes(self) -> dict:
        """Return the settings as state attributes."""
        # Never expose PIN hashes / salts of the kid profiles
        return sanitize_settings(self._data.get("settings", {}))


class FamilyMissionPointsSensor(FamilyMissionBaseSensor):
    """Sensor tracking the points of all users."""

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, hass: HomeAssistant):
        super().__init__(hass, "family_mission_points", "points")
        self._attr_icon = "mdi:star"

    @property
    def native_value(self) -> float:
        """Return the sum of all points."""
        return sum(self._data.get("points", {}).values())

    @property
    def extra_state_attributes(self) -> dict:
        """Return the points list as state attributes."""
        pts = self._data.get("points", {})
        point_goals = self._data.get("settings", {}).get("point_goals", {})

        person_states = self.hass.states.async_all("person")
        points_list = []
        for uid, p in pts.items():
            name = resolve_participant_name(person_states, uid)
            
            goal = point_goals.get(uid, 0)
            entry = {"user_id": uid, "name": name, "points": p, "goal": goal}
            if goal > 0:
                entry["goal_percent"] = round((p / goal) * 100, 1)
                
            points_list.append(entry)
        return {
            "json_string": json.dumps(points_list), 
            "data": points_list,
            "history": self._data.get("history", [])
        }


class FamilyMissionTemplatesSensor(FamilyMissionBaseSensor):
    """Sensor tracking the total number of templates."""

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, hass: HomeAssistant):
        """Initialize the sensor for templates."""
        super().__init__(hass, "family_mission_templates", "templates")
        self._attr_icon = "mdi:file-document-multiple-outline"

    @property
    def native_value(self) -> int:
        """Return the total amount of templates."""
        return len(self._data.get("templates", {}))

    @property
    def extra_state_attributes(self) -> dict:
        """Return template array as state attributes."""
        templates_list = list(self._data.get("templates", {}).values())
        return {
            "json_string": json.dumps(templates_list),
            "data": templates_list
        }