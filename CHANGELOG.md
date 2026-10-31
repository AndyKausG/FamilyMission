# Changelog

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
