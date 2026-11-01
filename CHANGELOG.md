# Changelog

## [2.4.0] - 2026-11-01

- **Waste collection bonus:** optional connector to the HACS integration *Waste Collection Schedule* (no hard dependency). Its calendar entities (entity registry platform `waste_collection_schedule`) are read with `calendar.get_events` (at most every 30 minutes). The evening before a collection an ad-hoc bonus "Mülltonnen rausstellen" / "Put the bins out" opens (subtasks: empty the bins in the flat, one per bin, check for room), on the evening of the collection day "Mülltonnen reinholen" / "Bring the bins in". Only waste types released for kids count (`waste_types`, new types are off). New settings `waste_enabled` (default off), `waste_calendars`, `waste_types`, `waste_min_age` (6), `waste_points_per_bin` (1, × bins, max. 10), `waste_approval` (on), `waste_out_time` / `waste_out_until` (17:00 / 07:00), `waste_in_time` / `waste_in_until` (16:00 / 21:00); all validated. Each task is created once (`waste_done`). New module `waste.py`, new websocket `family_mission/waste_sources`, settings card section "Müllabfuhr / Waste collection".
- **Voice announcement:** optional `tts.speak` on media players for a parent's ad-hoc bonus ("Papa hat eine Bonusaufgabe erstellt: Einkäufe hochtragen. 3 Punkte."), waste tasks and bonus-trigger tasks. New settings `announce_enabled` (default off), `announce_tts`, `announce_players`, `announce_events`, `announce_night` (default off = silent in the night mode times), `announce_names` (spoken name per adult). New websocket `family_mission/test_announce`, settings card section "Sprachdurchsage / Voice announcement" with a test button. Speaker errors are only logged.
- **Internal:** ad-hoc bonus creation moved to `_async_create_adhoc` (shared by the websocket and the waste check).
- **Docs:** README, help and parents' guide (de/en/fr).
- **Tests:** new `tests/test_waste.py` and `tests/test_waste_announce_ws.py`.
- **Releases:** new workflow `.github/workflows/release.yml` creates a GitHub release `vX.Y.Z` (text from this changelog) whenever the manifest version changes on `main`, so HACS shows version numbers.

## [2.3.3] - 2026-11-01

- **Family goal suggestion:** below "Points per month" in the settings card (Kids) a line shows a suggestion (80 % of the kids' monthly goals, rounded to 10, like the quick-start wizard) and the task points all kids reached last month (what the rocket counts), with a button to take the suggestion. It follows the monthly goals as they are typed.

## [2.3.2] - 2026-11-01

- **Automatic reload:** the kids card and the parents card reload their data after the websocket reconnected (`connection` event `ready`: tablet standby, Wi-Fi drop, Home Assistant restart), when the page becomes visible or the window gets focus (at most every 10 s) and as a safety net every 5 minutes (not while the tablet sleeps or the page is hidden; in the kids card counted by the existing 1 s ticker). Previously a missed `family_mission_updated` event (e.g. a new spontaneous bonus) stayed invisible until a manual page reload. The listeners are removed on disconnect and follow a replaced `hass.connection` (frontend reload). A background reload is skipped while an action, celebration or rocket launch is running or a field is being typed in; scroll positions are kept as before.
- **Tap the logo to reload:** the small rocket-in-ring icon in the header (kids card: home screen and `mode: mine`; parents card: the existing header logo) is now a button (44 px touch target, `aria-label` "Aktualisieren" / "Refresh"). A tap reloads the data, the icon turns once (not with `prefers-reduced-motion`) and a toast "Aktualisiert ✓" / "Updated ✓" appears, or "Keine Verbindung" / "No connection" on failure. `_fetchData()` now returns a promise. The logo is therefore also shown on the kids' tablet (home screen), not on the sleep screen or in the rocket overlay.
- **Docs:** README (kids and parents card), help chapter FAQ and parents' guide FAQ (de/en/fr): "A new bonus does not show up? Tap the logo."

## [2.3.1] - 2026-11-01

- **Icon set `fm:`:** `www/family-mission-icons.js` registers the custom icon set `fm` (`fm:rocket`, `fm:rocket-ring`, `fm:moon-buddy`, `fm:parents`) via `window.customIcons`, usable as view, sidebar and card icons and in the icon picker. The file is registered as a Lovelace resource and loaded as an extra module (`frontend.add_extra_js_url`, versioned; removed on unload), so the icons also work outside of dashboards. Loading it twice is harmless.
- **Logo in the UI:** the file also exports `window.FamilyMissionBrand.iconSvg(size)` / `logoSvg(width, dark)` (inline SVG, unique gradient ids). Used discreetly in the parents' hub (header), the help (header; logo with lettering and version in "About FamilyMission", light/dark), the quick-start wizard (header, large icon on the success page) and as a footer in the settings card. Not on the kids' tablet. Without the helper the cards keep their emoji.
- **Version:** `get_data` now returns `version` (from `manifest.json`).
- **Docs:** README section "Icons (fm:)".
- **Docs:** README: overview with screenshots, recommended dashboard.
- **Tests:** new `tests/test_frontend_assets.py`.

## [2.3.0] - 2026-11-01

- **Approval push:** when a task waits for parent approval, all adults get a push ("✅ Clara ist fertig" / "✅ Clara is done", for a task done together "Clara & David", text "<task> (<points> ⭐)") with the actions "Freigeben" / "Nicht fertig" (`FM_APPROVE_<id>` / `FM_NOTDONE_<id>`, tag per pending entry). "Cheated" stays app-only; a second tap is ignored. New setting `approval_push` (default on, validated as bool), switch in the settings card, section "Tablet".
- **Push safety:** approvals must not sit unseen. `get_data.adults[]` has `push_targets`, `get_data` has `push_warning` (`no_adults` | `no_targets`); new websocket `family_mission/test_push` `{user_id?}`; settings card "Tablet" lists the target per adult with a "Test push" button and the new setting `approval_reminder_hours` (default 2, 0 = off); parents' hub shows a yellow hint, the quick-start wizard a "Push to: Anna ✓, Ben ⚠" line. If no approval push can be delivered, a persistent notification `family_mission_no_push` is created (dismissed after the next successful push). One quiet reminder ("⏳ Freigabe wartet noch", same tag and actions) after `approval_reminder_hours`, not at night. A handled approval or redemption is removed from all adults' devices (Companion `clear_notification` by tag). "✅ N Freigaben warten" at the top of "My tasks" (parents' hub, kids card `mode: mine` with Approve / Not done). Help (de/en/fr), README and parents' guide updated.
- **Quick-start catalog:** `room_blitz`, `room_blitz_small` and `room_deep` are created with "Requires parent approval". Re-running the wizard sets the flag on earlier wizard tasks only if they never had the key; the parents' own choice is kept. The wizard preview returns `requires_approval` per task and the wizard shows a small "✅ Freigabe" badge.
- **Docs:** README, help and parents' guide (de/en/fr).
- **Tests:** new `tests/test_approval_push_ws.py` and `tests/test_push_safety_ws.py`; the rocket test counts only rocket pushes.
- **Fix:** the next due date after a completion / skip is now computed in calendar days (same local time); across a DST change it was off by an hour, so a daily task done in the first hour of the 25-hour day stayed due.
- **Tests:** the suite no longer depends on the real date or time (fixed start time, scheduler independent of the frozen clock, synchronous event listeners).
- **New logo and icon:** rocket in the progress ring (replaces the old TaskOrganizer logo); `brand/` now also has `icon@2x.png`, `logo@2x.png` and dark-mode logos.

## [2.2.0] - 2026-11-01

- **New sleep screen:** the night mode shows a sleeping moon buddy with a nightcap (slow breathing, rising "Z z z"; blinks in the last 30 minutes) and an analogue alarm clock (hands show the time, a coloured hand the wake-up time, an arc the remaining sleep). Texts: "Gute Nacht, Clara & David 💤" / "Psst … alle schlafen" / "Gleich ist Morgen!", plus "Ich schlafe noch 7 Std. 30 Min." and "Aufstehen um 06:00". Dimmed, updated once a minute, no animation loop, calm with `prefers-reduced-motion`; a tap brightens it for 5 seconds and the alarm clock wobbles. `kidsNightState` also returns `wakeDate`, `minutesLeft` and `phase`.
- **Fix:** Praise is no longer shown (and thus not marked as seen) on parents' devices; it stays open for the kid.
- **Tests:** tests no longer depend on the real calendar month (two test modules failed from the first day of a month on).
- **Fix:** A tablet whose timers were throttled in standby re-checks the night state as soon as the page becomes visible or the window gets focus, so it no longer shows "Gute Nacht" after the wake-up time.

## [2.1.2] - 2026-11-01

- **Fix:** Night mode also put the kids card to sleep on the parents' own devices. Now only users without a parent role (the shared tablet user) see the sleep screen; parents (admin / manager / parent) keep the normal view.

## [2.1.1] - 2026-11-01

- **Fix:** On phones with a notch the close button of the full-screen help was hidden under the status bar, so the help could not be closed. The help, the quick-start wizard and the parents hub sheets now keep clear of the status bar / home indicator (safe area), and the help has an additional "Close" button at the end.

## [2.1.0] - 2026-11-01

### Added
- **Rocket launch:** when the family goal is reached, the kids tablet shows a shared full-screen countdown ("Alle zur Rakete!", length `rocket_countdown`, default 60 s) with a call sound every 10 seconds, huge numbers in the last 10 seconds, a "Jetzt starten!" button, a liftoff with flames, smoke, stars, fireworks and fanfare, and a finishing picture. Once per period; the adults get a push. Afterwards the family bar reads "🚀 gestartet!". Calmer variant with `prefers-reduced-motion`.
- Websocket `family_mission/rocket_countdown` and `family_mission/rocket_launched`, events `family_mission_rocket_ready`, `family_mission_rocket_countdown` and `family_mission_rocket_launched`; `get_data` returns `rocket`.
- **Night mode:** the tablet sleeps from `night_sleep` until the wake-up time of the following day (`night_wake_weekday` Mon-Fri, `night_wake_weekend` Sat+Sun) with a dark sleep screen, a clock on tap and a "Guten Morgen" banner for 30 minutes after waking up; an open kid session runs out normally first. No reminders for kid tasks at night.
- **Redeem push:** adults get a push with the actions "Einlösen" / "Ablehnen" when a kid requests a reward (`reward_push`, default on).
- Settings card section "Tablet" (night mode, bedtime, wake-up times, rocket countdown); parents guide (in-app help and `docs/`) with a new chapter in German, French and English; example automation "announce the rocket countdown on a speaker".

## [2.0.1] - 2026-11-01

- **Parents hub:** new optional card options `tasks_card:` and `settings_card:` pass their options (e.g. `sort_by`, `filter_by`, `items_per_page`, `show_advanced`) to the task list and settings embedded under "More". The example dashboard no longer shows them twice.

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
