# Changelog

## [2.0.0] - 2026-11-01

### Added
- **We parents (Wir Eltern):** the adults' household and planning work as quiet parent tasks with a catalog of 28 templates (daily, weekly, monthly, kids and family). No points, no ranking, no red display.
- **Parents hub** in the parents card with three tabs and the new element `family-mission-parents-picker` (also used by the quick-start wizard).
- **Quick-start wizard:** new optional step "Wir Eltern" between tasks/goals and the summary (now 6 steps).
- **Me / You / Take turns** per parent task; with "take turns" the responsibility passes to the other adult after each completion.
- **Quiet carry-over:** parent tasks that are left at midnight move to today without history, push or red display (`carried_since`).
- **🧠 Planning tasks** (mental load) with a reminder the evening before they are due (`planning_reminders`, `planning_reminder_time`, default 18:00). Parent tasks send no other reminders.
- **"Kannst du?" hand-over:** websocket `handover_ask` / `handover_answer`, push actions `FM_TAKE_<task_id>` and `FM_DECLINE_<task_id>`, event `family_mission_handover_requested`.
- **Sunday summary:** neutral weekly note per adult (hours and carried-over tasks), event `family_mission_weekly_summary`, websocket `family_mission/weekly_summary` (`weekly_summary`, `weekly_summary_time`).
- **Role-model band** on the kids tablet ("Auch Mama und Papa haben heute N Missionen", no points; `role_model_band`, `role_model_label`).
- **Own device (`mode: mine`):** adults see and tick their own parent tasks (no points, duration, 🧠 badge).
- **Push target per adult** (`parent_notify`, automatic via the Companion app when empty).
- New websocket commands `parents_catalog`, `parents_apply`, `parent_task_set`, `parent_task_add`, `parent_task_done`; `get_data` additionally returns `adults`, `me` and `partner`.
- History entries of type `parent` (0 points, `minutes`); undo works as for normal completions.
- Settings card section "Wir Eltern"; parents guide (in-app help and `docs/`) with a new chapter in German, French and English.

### Changed
- Parent tasks never count for points, wallet, family goal or monthly goal and never appear in kid lists or on the bonus board.
- Wording for kids and family: no more "roommate" / "Mitbewohner" wording.

### Removed
- **Breaking:** the leaderboard card `custom:family-mission-leaderboard` ("Roommate of the Month") including its resource registration. Remove it from your dashboards.
- **Breaking:** `sensor.family_mission_leaderboard` (the entity is removed from the registry).
- **Breaking:** the event `family_mission_leaderboard_changed`. Adapt automations that used it.
- The spider chart (point distribution for 3 or more users) in the task card; the sliders and presets remain.

## [1.0.2] - 2026-11-01

- **Fix:** "My tasks" for adults showed the open bonus tasks below the own tasks in a single column, out of view. Bonus tasks now get their own column next to the own tasks (single column only without open bonus).

## [1.0.1] - 2026-11-01

- **Adults close open bonus tasks:** in "My tasks" (`mode: mine`) adults without kid profile see the open bonus tasks with "✅ I did it". The task leaves the bonus board without points (0-point history entry, can be undone); websocket `family_mission/my_close_bonus`.

## [1.0.0] - 2026-10-31
First FamilyMission release, based on TaskOrganizer 1.7.0 (MIT, Patrick von Wiegen, https://github.com/patrickvonwiegen/TaskOrganizer).

### Project
- New domain `family_mission`, own storage (`family_mission.storage`), own services, events, websocket commands, entities, card names (`custom:family-mission-*`) and push action prefixes (`FM_`). Runs next to an installed TaskOrganizer without any conflict.
- **Automatic migration:** on the first start without own data the data and options of TaskOrganizer are copied (read only, once), with a persistent notification that lists what to adapt. Admin-only service `family_mission.import_from_task_organizer` (`overwrite: true`) repeats the import on purpose.

### Features
- **Family missions:** tasks and templates with intervals, points, subtasks, categories (`basis`, `bonus`, `auftrag`), minimum age, time windows, reminders and "together" mode.
- **Kids' wall tablet:** `family-mission-kids` with kid tiles, progress ring, PIN pad (brute-force lockout), bonus board, family rocket, confetti and sounds.
- **Own-device view:** `mode: mine` for the person linked to the logged-in Home Assistant user.
- **Parents card and roles:** approvals, "not done" / "cheated", bonus points and deductions, undo, parent roles (admin, manager, parent).
- **Reward shop:** per-kid wallet, configurable rewards, savings goal, redemptions with push approval.
- **Praise:** stickers and messages without points.
- **Quick-start wizard:** age-appropriate task packages, rotating duties and monthly goals from a built-in catalog.
- **Bonus triggers**, monthly goals, leaderboard, reports and a history protocol.
- **In-app help** (parents guide) in German, French and English, plus Markdown versions in `docs/`.
