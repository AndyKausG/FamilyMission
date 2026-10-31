"""Pytest configuration for the TaskOrganizer tests.

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
    if not HAS_HA and collection_path.name in ("test_kids_ws.py", "test_wizard_ws.py", "test_kids_step2_ws.py", "test_parents_role.py"):
        return True
    return None
