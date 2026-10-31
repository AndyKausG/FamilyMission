"""Konstanten für die TaskOrganizer Integration."""

# Domain of the integration
DOMAIN = "task_organizer"

# Configuration keys
CONF_NAME = "name"

# Storage Constants
STORAGE_KEY = f"{DOMAIN}.storage"
STORAGE_VERSION = 1

# Default colors for the frontend
DEFAULT_COLOR_DONE = "#4CAF50"     # Green
DEFAULT_COLOR_DUE = "#FFC107"      # Yellow/Orange
DEFAULT_COLOR_OVERDUE = "#F44336"  # Red
DEFAULT_OVERDUE_DAYS = 5

# Event names
EVENT_TASK_UPDATED = "task_organizer_updated"
EVENT_LEADERBOARD_CHANGED = "task_organizer_leaderboard_changed"
EVENT_TASK_COMPLETED = "task_organizer_task_completed"
EVENT_TASK_CREATED = "task_organizer_task_created"
EVENT_RESET = "task_organizer_reset"
EVENT_BONUS_OPENED = "task_organizer_bonus_opened"
EVENT_APPROVAL_REQUESTED = "task_organizer_approval_requested"
EVENT_APPROVAL_RESOLVED = "task_organizer_approval_resolved"
EVENT_KID_BIRTHDAY = "task_organizer_kid_birthday"
EVENT_TASK_REMINDER = "task_organizer_task_reminder"
EVENT_REWARD_REQUESTED = "task_organizer_reward_requested"
EVENT_REWARD_RESOLVED = "task_organizer_reward_resolved"
EVENT_PRAISE = "task_organizer_praise"

# Event fired by the Home Assistant companion app when a notification action is tapped
EVENT_MOBILE_APP_ACTION = "mobile_app_notification_action"
ACTION_APPROVE = "TO_APPROVE_"
ACTION_NOT_DONE = "TO_NOTDONE_"
ACTION_CHEAT = "TO_CHEAT_"
ACTION_REWARD_APPROVE = "TO_RAPPROVE_"
ACTION_REWARD_REJECT = "TO_RREJECT_"

# WebSocket Command Types
WS_TYPE_GET_DATA = "task_organizer/get_data"
WS_TYPE_COMPLETE_TASK = "task_organizer/complete_task"
WS_TYPE_ADD_TASK = "task_organizer/add_task"
WS_TYPE_EDIT_TASK = "task_organizer/edit_task"
WS_TYPE_DELETE_TASK = "task_organizer/delete_task"
WS_TYPE_PAUSE_TASK = "task_organizer/pause_task"
WS_TYPE_UPDATE_POINTS = "task_organizer/update_points"
WS_TYPE_FACTORY_RESET = "task_organizer/factory_reset"
WS_TYPE_UPDATE_SETTINGS = "task_organizer/update_settings"
WS_TYPE_DELETE_HISTORY_ITEM = "task_organizer/delete_history_item"
WS_TYPE_EDIT_HISTORY_ITEM = "task_organizer/edit_history_item"
WS_TYPE_IMPORT_TASKS = "task_organizer/import_tasks"
WS_TYPE_ADD_TEMPLATE = "task_organizer/add_template"
WS_TYPE_EDIT_TEMPLATE = "task_organizer/edit_template"
WS_TYPE_DELETE_TEMPLATE = "task_organizer/delete_template"
WS_TYPE_SET_KID_PROFILE = "task_organizer/set_kid_profile"
WS_TYPE_DELETE_KID_PROFILE = "task_organizer/delete_kid_profile"
WS_TYPE_KID_VERIFY_PIN = "task_organizer/kid_verify_pin"
WS_TYPE_KID_COMPLETE_TASK = "task_organizer/kid_complete_task"
WS_TYPE_KID_CLAIM_TASK = "task_organizer/kid_claim_task"
WS_TYPE_WIZARD_CATALOG = "task_organizer/wizard_catalog"
WS_TYPE_WIZARD_PREVIEW = "task_organizer/wizard_preview"
WS_TYPE_WIZARD_APPLY = "task_organizer/wizard_apply"
WS_TYPE_SET_BONUS_TRIGGERS = "task_organizer/set_bonus_triggers"
WS_TYPE_APPROVE = "task_organizer/approve"
WS_TYPE_REJECT = "task_organizer/reject"
WS_TYPE_ADJUST_POINTS = "task_organizer/adjust_points"
WS_TYPE_UNDO_COMPLETION = "task_organizer/undo_completion"
WS_TYPE_ADD_ADHOC_BONUS = "task_organizer/add_adhoc_bonus"
WS_TYPE_SET_PARENTS = "task_organizer/set_parents"
WS_TYPE_PARENT_TASK_ACTION = "task_organizer/parent_task_action"
WS_TYPE_PARENT_COMPLETE_FOR = "task_organizer/parent_complete_for"
WS_TYPE_MY_COMPLETE_TASK = "task_organizer/my_complete_task"
WS_TYPE_MY_CLAIM_TASK = "task_organizer/my_claim_task"
WS_TYPE_KID_TOGGLE_STEP = "task_organizer/kid_toggle_step"
WS_TYPE_MY_TOGGLE_STEP = "task_organizer/my_toggle_step"
WS_TYPE_MY_REDEEM = "task_organizer/my_redeem"
WS_TYPE_MY_SET_GOAL = "task_organizer/my_set_goal"
WS_TYPE_SET_REWARDS = "task_organizer/set_rewards"
WS_TYPE_KID_REDEEM = "task_organizer/kid_redeem"
WS_TYPE_KID_SET_GOAL = "task_organizer/kid_set_goal"
WS_TYPE_REDEMPTION_RESOLVE = "task_organizer/redemption_resolve"
WS_TYPE_SEND_PRAISE = "task_organizer/send_praise"
WS_TYPE_KID_PRAISE_SEEN = "task_organizer/kid_praise_seen"
WS_TYPE_MY_PRAISE_SEEN = "task_organizer/my_praise_seen"

# Service Names
SERVICE_RESET_MONTHLY_POINTS = "reset_monthly_points"
SERVICE_COMPLETE_TASK_BY_NAME = "complete_task_by_name"
SERVICE_ADD_TASK = "add_task"
SERVICE_FACTORY_RESET = "factory_reset"
SERVICE_SET_TASK_DUE_BY_NAME = "set_task_due_by_name"
SERVICE_PAUSE_TASK_BY_NAME = "pause_task_by_name"
SERVICE_REMOVE_TASK_BY_NAME = "remove_task_by_name"
SERVICE_EDIT_TASK_BY_NAME = "edit_task_by_name"
SERVICE_ADD_TEMPLATE = "add_template"
SERVICE_REMOVE_TEMPLATE_BY_NAME = "remove_template_by_name"
SERVICE_EDIT_TEMPLATE_BY_NAME = "edit_template_by_name"
SERVICE_ADJUST_POINTS = "adjust_points"
