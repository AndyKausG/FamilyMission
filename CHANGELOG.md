# Changelog

## [1.8.0] - unreleased
### 🚀 New Features
- **Parents guide as in-app help:** new module `task-organizer-help.js` (card `custom:task-organizer-help` and full-screen overlay `window.TaskOrganizerHelp.open(hass, anchor)`) with ten chapters in German, French and English (table of contents, collapsible chapters, search, light/dark, offline). "❓ Hilfe" buttons in the parents card, the settings card (Kids) and the wizard open it at the matching chapter. The same text is available as `docs/parents-guide.<de|fr|en>.md`.
- **Praise:** social recognition without points. Parents card: "❤️ Loben" per kid (sticker + message chips + free text), websocket `send_praise` (stored in `praise`, last 50 per kid, history type `praise` with 0 points, event `task_organizer_praise` for TTS). Kids card: a bouncing sticker on the kid's own tile and a friendly overlay with a gentle sound when the kid opens their view, then `kid_praise_seen` / `my_praise_seen`.
- **Together allowed per task:** new field `allow_together` for tasks and templates (editor switch, websocket, services, wizard catalog). Default when missing: on for bonus/auftrag, off for basis duties (additive migration). `kid_complete_task` with helpers on a task without it answers `together_not_allowed` (no PIN attempt is consumed); the kids card hides "👫 Zusammen" there and greys it out while required steps are open.
- **My tasks on the own device:** kids card option `mode: mine`. The viewer is the person linked to the logged-in Home Assistant user: kids see their kid view directly (duties, bonus, ring, shop) without tiles and PIN, adults without kid profile a simple list of their due tasks, unlinked users a hint. New commands `my_complete_task`, `my_claim_task`, `my_redeem`, `my_set_goal` that derive the participant from the websocket user only (never from the payload) and apply the same eligibility rules as the kid commands.
- **Task reminders:** `reminder_at` / `reminder_target` for tasks and templates (editor switch, time select, `notify.*` select). Once per day the event `task_organizer_task_reminder` is fired (and the notify service called) for open tasks that are due and not past their window.
- **Reward shop:** a per-kid wallet that survives the monthly reset (every point award credits it, penalties/undo/history edits debit it, migrated from the current month points), configurable rewards (`set_rewards`, emoji, cost, minimum age, suggestions), `kid_redeem` / `kid_set_goal` for kids (PIN), `redemption_resolve` for parents (approve or refund), push actions `TO_RAPPROVE_` / `TO_RREJECT_`, events `task_organizer_reward_requested` / `task_organizer_reward_resolved`, history types `redeem` / `refund`. Shop view, savings goal bar and celebration on the kids card; redemptions list, wallet balance and rewards editor on the parents card. See "Reward shop" in the README.
- **Kids mode:** New card `task-organizer-kids` for a wall/kiosk tablet (designed for 1280x800 landscape): one big tile per kid with a progress ring, PIN pad, personal task and bonus view, "family rocket" (cooperative family goal), bonus board, confetti, WebAudio sounds and auto-return to the home screen after inactivity. See the new "Kids mode" section in the README and `examples/kids/dashboard.yaml`.
- **Kids without Home Assistant user:** The participant ID is the `user_id` of a person or, if there is none, the person entity id (`person.xyz`). All cards, the leaderboard/reset events and the sensors resolve names accordingly. Existing data keyed by user id keeps working.
- **Kid profiles:** Settings card section "Kids": avatar, colour, birth year and an optional 4-digit PIN (salted SHA-256, never exposed to the frontend or the settings sensor), monthly goals and the family goal.
- **Task categories and minimum age:** Tasks and templates have the new optional fields `category` (`basis` | `bonus` | `auftrag`, default `basis`) and `min_age` (0-18) in the editors, websocket API and services (`add_task`, `edit_task_by_name`, `add_template`, `edit_template_by_name`).
- **PIN-protected kid actions:** New websocket commands `kid_verify_pin`, `kid_claim_task`, `kid_complete_task` (with brute-force lockout: 5 wrong attempts lock a kid for 60 s) and the admin-only `set_kid_profile` / `delete_kid_profile`. "Duties first, then bonus" (`bonus_requires_basis`) and bonus reservations (`claim_minutes`).
- **All steps before "Fertig!":** on the kids card the done button stays disabled until every required subtask is ticked ("Still n step(s) to tick"); `kid_complete_task` answers `steps_open` otherwise. Subtasks with `optional: true` never block. Parents completing via the task card are not affected.
- **Bonus lock is opt-in:** bonus tasks are free by default; the per-task flag `requires_routine` (task/template editor, services) locks a bonus while the kid has due duties inside their time window open. Spontaneous bonus tasks are never locked. The global setting `bonus_requires_basis` is no longer used.
- **Classic commands role-gated in kids mode:** with at least one kid profile, task/template/history commands need a parent role, `update_settings` a manager, `import_tasks` and `factory_reset` an admin. Without kid profiles the original open behaviour stays. `delete_task` now answers `not_found` for unknown tasks instead of never responding.
- `examples/kids/vorlagen.yaml` now passes `category` and `min_age`.
- **Kids mode quick-start wizard:** Button "🚀 Kids mode quick start" in the settings card (Kids section, admins only, phone friendly). Five steps (kids, household, tasks, goals, summary) propose a complete age-appropriate setup from a built-in catalog (about 30 German/English tasks with points, estimated minutes, minimum age and age-filtered subtasks): one task per kid, rotating shared duties (oldest kid first, staggered due dates), unassigned bonus tasks that are not due yet, and "Auftrag" templates. A load bar compares the minutes per day with the recommendation for the age, monthly goals (start phase 60 % / normal 75 % of the maximum, prorated mid-month) and the family goal are computed and editable. Everything is created in one click and can be re-run (generated tasks carry `generated_by: "wizard"` and a `wizard_key`; "Replace earlier wizard tasks" never touches your own tasks, points or history). New admin-only websocket commands `wizard_catalog`, `wizard_preview`, `wizard_apply`; new modules `kids_catalog.py` (pure Python, fully unit-tested) and `www/task-organizer-wizard.js`.
- **Gentle default selection:** On the first run the wizard pre-selects a ramp-up package per kid. Start phase: three cards per day (morning mission, evening mission, table duty in rotation); the normal phase adds bigger chores. Small routines (school bag, shoes & jacket, dirty laundry) are bundled as subtasks of the new "Evening mission" instead of separate tasks. The suggestion is capped by the recommended daily load (minutes) and the average number of tasks per day for the age. "Apply recommendation" restores it at any time (`suggested_excluded` in the `wizard_preview` result, `TASK_PRIORITY` in `kids_catalog.py`).
- **Entity picker:** Bonus triggers use a self-contained search-as-you-type entity field (name or entity ID, touch friendly) instead of a native select list.
- **Avatars:** 🐧 added.
- **Bonus triggers:** A bonus task can open itself when an entity changes to a state (e.g. the dishwasher program is finished) and fires the new event `task_organizer_bonus_opened` (`task_id`, `task_name`, `points`), e.g. for a TTS announcement on the Fully Kiosk tablet. Configurable in the wizard and in the new settings section "Bonus-Auslöser / Bonus triggers" (admin command `set_bonus_triggers`, setting `bonus_triggers`).
- **Task editor:** New "From template" dropdown at the top of the new-task dialog (the name suggestions still work).
- **Birthday:** Optional `birthday` per kid (settings card, wizard) for an exact age used everywhere (eligibility, wizard proposal, kids card). On the birthday: party mode in the kids card (👑, balloons, banner, overlay with confetti and the "Happy Birthday" melody), duty-free day (`birthday_duty_free`), birthday bonus (`birthday_bonus_points`, own history type, not counted for the family goal), a level-up card with what the new age unlocks, the event `task_organizer_kid_birthday` and a persistent notification for the parents.
- **Parent approval:** `requires_approval` for tasks and templates, per-kid spot checks (`approval_sample_rate`) and strict mode. Completions that need approval advance the task but award points only when a parent approves (card or actionable push notification, `TO_APPROVE_/TO_NOTDONE_/TO_CHEAT_<id>`). New websocket commands `approve` / `reject`, events `task_organizer_approval_requested` / `task_organizer_approval_resolved`.
- **Deductions and manual points:** `adjust_points` (websocket command and service), history entries with `type` (`task`, `bonus`, `penalty`, `birthday`) and `reason`, shown with icons in the protocol card. Cheating costs `cheat_penalty_factor` x points and starts strict mode for `cheat_strict_days`. Deductions are only visible in the kid's own view.
- **New card `task-organizer-parents`** for approvals, quick bonus/deduction with reason and per-kid history.
- The family goal progress (`family_points`) is now computed by the backend from approved task points only.

- **Kids card on phones:** below 700 px card width (ResizeObserver, so it also works for a narrow card on a wide screen) the kid view is one column with a compact one-row header, wrapped task names and a full-width "Done!" button, the home screen shows two tiles per row; the tablet layout is unchanged. On tall panels the kid tiles keep their natural height (max. about 380 px) with the family rocket and bonus board directly below.
- **Time windows:** optional `available_from` / `available_until` (`HH:MM`) for tasks and templates (editors, websocket, services, import). The backend rejects `kid_complete_task` / `kid_claim_task` outside the window (`not_yet` with `available_from`, `too_late`). The kids card shows locked tasks ("🌙 ab 17:00", live countdown in the last 30 minutes, "Heute vorbei – morgen neue Chance"); they do not count as open for the duties-first rule or the home tile badge. The wizard sets 05:00-10:00 for the morning and 17:00-21:00 for the evening mission.
- **Undo for parents:** admin-only `undo_completion` removes all history entries of a completion (new `completion_id`), takes the points back (never below 0), restores the previous due date, resets subtasks and recreates deleted one-time tasks. Button "↩️ Rückgängig" in the parents card and the protocol card.
- **Prorated goals no longer stick:** the wizard stores the unprorated goals (`point_goals_full`, `point_goals_prorated_month`); they replace the prorated goals at the next monthly reset or startup. Manual goal edits overwrite both. The wizard summary shows "ab 1.11.: 150 Pkt".
- **Spontaneous bonus:** "➕ Spontan-Bonus" in the parents card and the admin-only `add_adhoc_bonus` command create a one-time bonus task for all kids or one kid, optionally expiring today at a given time; fires `task_organizer_task_created` and `task_organizer_bonus_opened`. Expired ad-hoc tasks are removed automatically.
- **Wizard re-run keeps the day:** with "Update earlier wizard tasks" tasks with the same `wizard_key` are updated in place (due date, pause, reservation and subtask progress are kept), only new keys are created and unselected ones removed; changed rotations are staggered again from tomorrow. New result field `updated`.
- **Household day:** weekly and bi-weekly wizard duties are first due on a chosen weekday (default Saturday, bi-weekly alternating by kid) instead of the start date (`household_day` in `wizard_preview` / `wizard_apply`).
- **Spread duties over the day and week:** default time windows for all wizard basis tasks (data in `kids_catalog.py`; new and in-place updated wizard tasks carry them); weekly duties of one kid are spread around the household day (room clean on it, own laundry the day before, bedding the day after); daily duties whose window is already over start tomorrow. The kids card lists duties by availability: available now, then "ab HH:MM" by start time, then "Heute vorbei".
- **Room blitz yields to the thorough room clean:** catalog `replaced_by` / task field `replaced_by_key`. On the day the same kid's thorough room clean is due or open, the blitz is hidden (muted line in the kid view), not counted as open duty, not completable (`not_eligible`) and skipped without points and without a `missed` entry (midnight expiry and when the room clean is completed). Pure decisions `is_replaced` / `skipped_by_completion` in `kids.py`.
- **Wizard "Redistribute due dates":** new option `reschedule` for `wizard_apply` (with the in-place update) gives existing wizard tasks fresh due dates like a new plan while keeping history and points.
- **Progress ring overfill:** above 100 % of the monthly goal the ring draws further laps in darker shades of the kid's colour with a shadow at the round end (like activity rings), the percentage is shown under the points, the trophy stays.
- **Missed duties expire:** with `expire_missed` (default on) kid duties that are still due from a previous day move on at midnight (daily at once, weekly after 2 days) without points or deduction; each leaves a history entry of type `missed`, visible only in the parents and protocol cards.
- **Parents role:** non-admin Home Assistant users can be parents (`parents`) or parents who may also manage (`parents_manage`), configured by an administrator in the settings card (Kids > Parents, admin-only command `set_parents`). Parents may approve, reject, give or deduct points, undo and create spontaneous bonuses; managers additionally kid profiles, wizard and bonus triggers. `get_data` returns `my_role` and `ha_users`; parents card, protocol undo and settings card follow the role. See "Parents role" in the README.
- **Parent actions on the kids card:** users with a parent role see an icon row on every task of the kid view: ⏭️ skip today (next occurrence without points, history type `skipped`, not counted as missed), ⏸️ postpone (tomorrow, the day after, or a date via day/month selects - no native date inputs) and ✅ complete for the kid (100 %, ignores PIN, window and steps), plus ↩️ undo for today's completions of the kid. New websocket commands `parent_task_action` and `parent_complete_for` (admin / manager / parent). The tablet user without a role sees no change.
- **Do it together:** a secondary button "👫 Zusammen" on completable tasks of the kids card opens a picker with the other kids who are old enough; every helper confirms with the own PIN (a kid without PIN with a tap). `kid_complete_task` takes the optional `helpers` (`[{kid_id, pin}]`): all helper PINs are verified with the normal lockout (`wrong_pin` / `locked` with `helper_id`; duplicate, unknown or too young helpers are rejected without an attempt), the points are split equally and the new setting `team_bonus` (0-3, default 1, settings card) adds extra points per participant as a `bonus` history entry "Teamarbeit" / "Teamwork" that is undone with the completion. Tasks that need approval create one pending entry for all participants.

### 🔧 Changes
- The wizard option "Replace earlier wizard tasks" now updates tasks in place instead of deleting and recreating them.
- Tasks created by the `add_task` service no longer get the placeholder category "General"; they get the category of the template (default `basis`). Legacy values are treated as `basis`.
- `update_settings` ignores the `kids` key (kid profiles are only changed through the admin-only commands); imports merge kid profiles for admins only and never take over PIN hashes.

## [1.7.0]
### ⚠️ Breaking Changes
- **Transparency Settings:** The transparency configuration scale has been inverted. 100% now represents full opacity (solid color), and 0% represents full transparency. The default value has been updated to 8% to match the previous highly transparent look.

### 🚀 New Features
- **Configurable Colors:** The settings card now allows for independent configuration of colors and transparency for Light and Dark Mode. 
- **Settings Redesign:** UI redesign of the settings card with collapsible section cards for better navigation.
- **Export & Import Settings:** The export function has been expanded so that all task organizer general settings can now be saved into backups. Additionally, a new Import Assistant with a dedicated modal and progress tracking has been added to safely guide you through restoring your backups.

## [1.6.3]
### 🐛 Bug Fixes
- Optimized and removed duplicated brand assets to significantly reduce the integration's installation size.
- Removed the unused `filename` key from `hacs.json`.

## [1.6.2]
### 🐛 Bug Fixes
- **Reports:** Fixed an issue where the report type selection dropdown was cut off on small screens.
- **Reports:** Tooltips now support mouse hover (desktop) and tap interactions (mobile) 

## [1.6.1]
### 🐛 Bug Fixes
- **Protocol Card:** Fixed an issue where assignees could not be changed in the edit dialog due to Home Assistant frontend component updates in 2026.6.x (replaced `ha-radio` with a native `select` dropdown).
- **Reports:** Added a blue dashed line representing the current day in the "Points per day" chart.
- **Sensors:** Set `state_class` to `MEASUREMENT` and replaced `state` with `native_value` for numeric sensors so they render as graphs instead of strings in the history.

## [1.6.0]
### ⚠️ Breaking Changes
- **New Protocol Card:** Separated the history log into its own dedicated card (`task-organizer-protocol`) for better organization.

### 🚀 New Features
- **Monthly Point Goals:** Settings-Cards user can now set monthly point goals in the settings. A flag icon appears in the leaderboard once a goal is reached. Target attributes are provided within the sensor entities.
- **Advanced Reporting:** The Stats card has been renamed to "Reports" and now offers two distinct views: "Completed Tasks" and "Goal Setting"
- **Reset Event:** Added `task_organizer_reset` event which is triggered when points are archived (end of month or manual). This enables automations for winner announcements.

## [1.5.2]
### 🐛 Bug Fixes
- **Frontend Component Migration:** Updated `ha-textfield` components to `ha-input` and adjusted icon slot names in all cards for compatibility with Home Assistant 2026.5.x

## [1.5.1]
### 🐛 Bug Fixes
- **Search Field Compatibility:** Fixed the search field and delete button display behavior in the Task Organizer Card for Home Assistant 2026.5.x and later.

## [1.5.0]
### 🚀 New Features
- **GUI Configuration Editor:** All Lovelace cards now support the Home Assistant Visual Editor. Parameters can be adjusted via the UI without manual YAML editing.
- **Flexible Point Distribution:** When completing a task with multiple assignees, users can now distribute points flexibly via a slider. If there are more than two assignees, a network diagram is also provided so that the tasks can be easily assigned.

### 🐛 Bug Fixes
- **Consistent Cancel Button Styling**: All "Cancel" buttons across the Lovelace cards now have a consistent style (blue text on a transparent background).

## [1.4.0]
### 🚀 New Features
- **Subtasks:** Tasks can now have subtasks. Added progress indicators, hover-text, and backend support for all relevant services and websocket commands.
- **UI Improvements:** Added a one-time task and subtask indicator icon next to the task name.
- **Area Filtering:** The `task-organizer-card` now supports filtering by area IDs using the `room:` prefix (e.g., `filter_by: "room:kitchen"`). Area filters also support negation (e.g., `!room:kitchen`).

### 🐛 Bug Fixes
- **Timestamps:** Fixed an issue where task completion timestamps in the history were stored as naive datetimes, causing an offset in the UI.
- **Sensors:** Updated due/overdue calculation to use Home Assistant's local time utilities for consistent task tracking.
- **Task-Card:** Changed cursor to help (question mark) when hovering over assignees for better UX.

## [1.3.0]
### ⚠️ Breaking Changes
- **task-organizer-card:** The `filter_by` configuration logic has been completely rewritten. It now supports multiple comma-separated filters and negations (e.g., `!due, !paused`). All applied filters are combined with a logical AND.
- The `active`, `due_and_overdue`, `inactive`, and `unassigned` filter options have been **removed**. If you used them in your Lovelace dashboard cards, you **must update** your configuration:
  - Replace `active` with `filter_by: "!paused"`.
  - Replace `due_and_overdue` with `filter_by: "!done, !paused"`.
  - Replace `inactive` with `filter_by: "paused"`.
  - Replace `unassigned` with `filter_by: "!assigned"`.

### 🚀 New Features
- New event `task_organizer_task_created` that is fired when a new task is created
- **task-organizer-card:** Added new `done`, `assigned`, `paused`, and `onetime` filter options.
- Added new services: `remove_task_by_name`, `edit_task_by_name`, `add_template`, `remove_template_by_name`, and `edit_template_by_name`.

### 🐛 Bug Fixes
- Dynamic and redesigned leaderboard

## [1.2.0]
### ⚠️ Breaking Changes
- Sensor `task_organizer_due_tasks` transfered into new sensor `task_organizer_due_and_overdue_tasks`

### 🚀 New Features
- Added yml configuration `show_add` and `show_edit` to `task-organizer-card`
- Possibility to set a specific due date
- Added area for task
- Task specific overdue threshold
- Added support for one-time tasks
- Added a template system to quickly create tasks
- service `task_organizer.create_task` now with template support
- New sensor `sensor.task_organizer_templates` to track available templates
- New sensors for differenciation  `task_organizer_due_tasks` and `task_organizer_overdue_tasks`
- New service `task_organizer.set_task_due_by_name` to set a task as due immediately.
- New service `task_organizer.pause_task_by_name` to pause a task until a specific date.

### 🐛 Bug Fixes
- All tooltips in the cards have been translated
- All cards now have a customizable title
- Design adapted to home assistant
- Replaced browser alerts with Home Assistant toast notifications for better user experience

## [1.1.0]
### 🚀 New Features
- Icon added
- Options flow (Integration Konfiguration) added
- Reset buttons added
- Reset services added
- Search for `task-organizer-card` added
- New events `task_organizer_task_completed` and `task_organizer_leaderboard_changed`

### 🐛 Bug Fixes
- Display options for task organizer card adjusted
