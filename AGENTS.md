# AGENTS.md

Notes for AI agents and other contributors working on FamilyMission
(Home Assistant custom integration, installed via HACS). Read this first.

## Repository layout

| Path | Content |
|---|---|
| `custom_components/family_mission/__init__.py` | Setup, storage, websocket commands, services, timers (large, one file) |
| `custom_components/family_mission/kids.py`, `parents_catalog.py`, `waste.py` | Pure logic, **no Home Assistant imports** (tested standalone) |
| `custom_components/family_mission/kids_catalog.py` | Quick-start task catalog |
| `custom_components/family_mission/const.py` | Domain, event names, websocket command types |
| `custom_components/family_mission/www/*.js` | Lovelace cards (vanilla web components, no build step) |
| `custom_components/family_mission/manifest.json` | **Version source of truth** |
| `tests/` | pytest (pure tests + Home Assistant harness tests `*_ws.py`) |
| `docs/parents-guide.{de,en,fr}.md` | Parents' guide; same content as the in-app help |
| `.github/workflows/` | `validation.yml` (HACS + Hassfest), `release.yml` (automatic releases) |

Code, comments, commit messages, CHANGELOG and README are in **English**.
User-facing texts: backend messages de/en (`_lang(hass)`), settings card
strings de/en (`I18N_SETTINGS`), help and parents' guide de/en/fr.

## Tests

The HA harness needs a virtualenv (the system Python's setuptools breaks some builds):

```bash
python -m venv ~/venv
~/venv/bin/pip install "setuptools<70" wheel pytest-homeassistant-custom-component
~/venv/bin/python -m pytest -q
```

- All tests must pass before a push. New features get tests (pure module test + `*_ws.py`).
- Pure modules are loaded with `importlib` straight from the file (see `tests/test_waste.py`),
  so they must not use relative imports.
- The clock is frozen at a fixed start (`tests/conftest.py`, local time US/Pacific).
  Create websocket clients (`hass_ws_client`) **before** `freezer.move_to(...)`,
  otherwise the auth token is expired.
- Timers do not fire by themselves in tests; call the check functions directly
  (e.g. `_async_check_waste(hass)`) or use `async_fire_time_changed`.
- Without the harness only the pure tests are meant to run; HA-based test files are
  skipped via the ignore list in `tests/conftest.py` (not complete yet - add new files).
- JS: at least `node --check custom_components/family_mission/www/*.js`. For UI changes a
  headless render with Playwright and a fake `hass` object is worth it.

## Conventions

- **Settings** live in the config entry options. Every new key is validated in
  `ws_update_settings` (pattern: `_sanitize_tablet_settings`, `waste.sanitize_waste_input`,
  `_sanitize_announce`); invalid values fall back to the default. New features are
  **off by default**.
- **Optional integrations** (Waste Collection Schedule, TTS, notify) are never hard
  dependencies: detect them at runtime (entity registry / `hass.services.has_service`),
  catch and log errors, never let them break the main action.
- **Ad-hoc bonus tasks** are created via `_async_create_adhoc` (fires the events, saves).
- **Roles:** check with `_check_role(hass, connection, msg, _MANAGE_ROLES | _DAILY_ROLES)`.
- **Night mode:** nothing audible / no reminders inside `is_night_time(...)`.
- Keep README, CHANGELOG, help (`www/family-mission-help.js`) and the three parents'
  guides in sync when a feature is user-visible.

## Versioning and releases

The version lives in `custom_components/family_mission/manifest.json` (semver).
Releases are **automatic** (`.github/workflows/release.yml`):

1. Raise `"version"` in `manifest.json` (feature = minor, fix = patch).
2. Add `## [X.Y.Z] - YYYY-MM-DD` at the top of `CHANGELOG.md`.
3. Merge to `main`.

Changes without a user-visible effect (docs for contributors, CI) need no version bump.

On the push to `main` the workflow creates the GitHub release `vX.Y.Z` with that
CHANGELOG section as text. HACS shows the version number and offers the update.
An existing release is never changed; never create or move tags by hand.
Check the result under Actions → Release. Manual start: Actions → Release → Run workflow.

If `main` moved on meanwhile (another version released), merge `main` into the
branch, keep the **higher** version in `manifest.json` and keep all CHANGELOG
sections (newest first).

## Git and pull requests

- Work on a feature branch, never commit directly to `main`.
- Merge `main` into the branch rather than rebasing pushed branches.
- PRs are merged with a merge commit ("merge"), after the HACS and Hassfest checks are green.
- A merged branch is finished; follow-up work starts from the current `main` in a new PR.
