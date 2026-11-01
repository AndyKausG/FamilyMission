"""Pytest configuration for the FamilyMission tests.

The websocket / integration tests need ``pytest-homeassistant-custom-component``.
The pure helper tests (``test_kids_helpers.py``) run without Home Assistant.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:  # Home Assistant test harness available?
    import pytest_homeassistant_custom_component  # noqa: F401

    pytest_plugins = "pytest_homeassistant_custom_component"
    HAS_HA = True
except ImportError:  # pragma: no cover - plain environment
    HAS_HA = False


def pytest_ignore_collect(collection_path, config):
    """Skip the HA based tests when the harness is not installed."""
    if not HAS_HA and collection_path.name in ("test_kids_ws.py", "test_wizard_ws.py", "test_kids_step2_ws.py", "test_parents_role.py", "test_parents_tasks_ws.py", "test_rocket_night_ws.py", "test_approval_push_ws.py", "test_push_safety_ws.py"):
        return True
    return None


if HAS_HA:
    import os
    import pytest
    from datetime import datetime, timezone

    # Fixed "real" start time for every Home Assistant test. Many tests set up the
    # integration first and then jump to fixed dates in late October 2026 with
    # ``freezer.move_to``; without a fixed start the setup ran at the real date and
    # the points period / local day of the setup depended on the calendar.
    # ``FM_TEST_START`` (ISO, UTC if no offset) overrides it to prove the suite is
    # independent of the start time.
    _DEFAULT_START = "2026-10-29T06:00:00+00:00"    # Wed 23:00 US/Pacific, before the tests' NOON
    TEST_START = datetime.fromisoformat(os.environ.get("FM_TEST_START") or _DEFAULT_START)
    if TEST_START.tzinfo is None:
        TEST_START = TEST_START.replace(tzinfo=timezone.utc)

    @pytest.fixture(autouse=True)
    def _fixed_test_start(request):
        """Freeze the clock at TEST_START *before* Home Assistant is set up."""
        if "hass" not in request.fixturenames:
            yield
            return
        freezer = request.getfixturevalue("freezer")
        freezer.move_to(TEST_START)
        yield

    @pytest.fixture(autouse=True)
    def _scheduler_independent_of_frozen_clock(request, _fixed_test_start):
        """Keep the event loop's timers (call_later / track_time_interval / websocket
        and token expiry) on the real monotonic clock.

        freezegun also freezes ``time.monotonic``, i.e. ``loop.time()``. Every
        ``freezer.move_to`` of the tests (hours or days) would then fire all due
        timers behind the test's back (ad-hoc expiry sweep, reminders, weekly
        summary, closing of the websocket connections ...). Timers are fired
        explicitly with ``async_fire_time_changed`` instead, exactly as the tests
        already do where they need a timer.
        """
        if "hass" not in request.fixturenames:
            yield
            return
        from freezegun import api as fg

        hass = request.getfixturevalue("hass")
        loop = hass.loop
        offset = loop.time() - fg.real_monotonic()
        loop.time = lambda: fg.real_monotonic() + offset
        yield
