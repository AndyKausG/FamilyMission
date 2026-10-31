"""Reward shop: wallet, rewards, redeem, savings goal and resolving redemptions."""

from datetime import datetime, timezone

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.task_organizer import (
    _async_check_monthly_reset,
    _async_handle_birthdays,
)
from custom_components.task_organizer.const import DOMAIN
from custom_components.task_organizer.kids import normalize_rewards

ANNA, BEN, CLARA = "person.anna", "person.ben", "person.clara"
NOON = datetime(2026, 10, 29, 18, 0, tzinfo=timezone.utc)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


def _fake_http(hass):
    async def _noop(paths):
        return None

    hass.http = type("FakeHttp", (), {"async_register_static_paths": staticmethod(_noop)})()


async def _token(hass, name):
    user = await hass.auth.async_create_user(name, group_ids=[GROUP_ID_USER])
    refresh = await hass.auth.async_create_refresh_token(user, "https://example.com")
    return user, hass.auth.async_create_access_token(refresh)


@pytest.fixture
async def users(hass):
    return {"manager": await _token(hass, "Alex"), "parent": await _token(hass, "Sam"),
            "other": await _token(hass, "Tablet")}


@pytest.fixture
async def setup(hass, users):
    for pid, name in ((ANNA, "Anna"), (BEN, "Ben"), (CLARA, "Clara")):
        hass.states.async_set(pid, "home", {"friendly_name": name})
    options = {"overdue_days": 5, "parents": [users["parent"][0].id, users["manager"][0].id],
               "parents_manage": [users["manager"][0].id]}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options)
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(ws, type_, **kw):
    await ws.send_json({"id": _call.n, "type": type_, **kw})
    _call.n += 1
    return await ws.receive_json()

_call.n = 100


def _data(hass):
    return hass.data[DOMAIN]["data"]


def _wallet(hass, uid=ANNA):
    return _data(hass)["wallet"].get(uid, 0)


async def _kid(ws, pid=ANNA, pin="1234", birth_year=2016, **kw):
    res = await _call(ws, "task_organizer/set_kid_profile", participant_id=pid, avatar="🦊",
                      color="#ff8800", pin=pin, birth_year=birth_year, **kw)
    assert res["success"], res


async def _task(ws, **kw):
    payload = {"name": "Task", "interval": 1, "complexity": 4, "icon": "mdi:broom", "category": "basis",
               "assignees": [ANNA]}
    payload.update(kw)
    res = await _call(ws, "task_organizer/add_task", **payload)
    assert res["success"], res
    return res["result"]["task_id"]


async def _complete(ws, tid, kid=ANNA, pin="1234", **kw):
    return (await _call(ws, "task_organizer/kid_complete_task", task_id=tid, kid_id=kid, pin=pin, **kw))["result"]


async def _rewards(ws, rewards=None):
    rewards = rewards or [
        {"id": "r1", "name": "Medienzeit", "emoji": "📺", "cost": 15, "min_age": 0, "active": True},
        {"id": "r2", "name": "Ausflug", "emoji": "🎟️", "cost": 200, "min_age": 0, "active": True},
        {"id": "r3", "name": "Spaetes Bett", "emoji": "🌙", "cost": 5, "min_age": 12, "active": True},
        {"id": "r4", "name": "Alt", "emoji": "🎁", "cost": 5, "min_age": 0, "active": False},
    ]
    res = await _call(ws, "task_organizer/set_rewards", rewards=rewards)
    assert res["success"], res


async def _redeem(ws, reward_id="r1", kid=ANNA, pin="1234"):
    return (await _call(ws, "task_organizer/kid_redeem", kid_id=kid, pin=pin, reward_id=reward_id))["result"]


async def _fund(hass, ws, points):
    await _kid(ws)
    tid = await _task(ws, complexity=points if points <= 10 else 10)
    await _complete(ws, tid)
    _data(hass)["wallet"][ANNA] = float(points)


# ---------------------------------------------------------------------------
# wallet
# ---------------------------------------------------------------------------

async def test_wallet_credit_paths(hass, hass_ws_client, setup, freezer):
    ws = await hass_ws_client(hass)
    freezer.move_to(NOON)
    await _kid(ws, birthday="2016-10-29")
    await _kid(ws, BEN, pin="2222")
    # normal kid completion
    await _complete(ws, await _task(ws, complexity=4))
    assert _wallet(hass) == 4
    # approval
    await _complete(ws, await _task(ws, complexity=3, requires_approval=True))
    assert _wallet(hass) == 4
    (pid,) = _data(hass)["pending"]
    assert (await _call(ws, "task_organizer/approve", pending_id=pid))["success"]
    assert _wallet(hass) == 7
    # team bonus: 4 points shared by two + 1 bonus each
    tid = await _task(ws, complexity=4, assignees=[], allow_together=True)
    res = await _complete(ws, tid, helpers=[{"kid_id": BEN, "pin": "2222"}])
    assert res["success"], res
    assert _wallet(hass) == 7 + 2 + 1 and _wallet(hass, BEN) == 3
    # manual bonus, parent completion, classic completion, service
    base = _wallet(hass)
    assert (await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=5, reason="Super"))["success"]
    t2 = await _task(ws, complexity=2)
    assert (await _call(ws, "task_organizer/parent_complete_for", task_id=t2, kid_id=ANNA))["success"]
    t3 = await _task(ws, complexity=3)
    assert (await _call(ws, "task_organizer/complete_task", task_id=t3, completed_by=[ANNA]))["success"]
    await _task(ws, name="Service", complexity=1)
    await hass.services.async_call(DOMAIN, "complete_task_by_name", {"task_name": "Service", "user_id": ANNA},
                                   blocking=True)
    assert _wallet(hass) == base + 5 + 2 + 3 + 1
    # birthday bonus (default 10)
    before = _wallet(hass)
    await _async_handle_birthdays(hass)
    assert _wallet(hass) == before + 10
    assert _wallet(hass) == _data(hass)["points"][ANNA]


async def test_wallet_penalty_undo_and_history_edit(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _kid(ws)
    tid = await _task(ws, complexity=6)
    await _complete(ws, tid)
    assert _wallet(hass) == 6
    assert (await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=-50, reason="x"))["success"]
    assert _wallet(hass) == 0 and _data(hass)["points"][ANNA] == 0     # clamped, never negative
    hist = _data(hass)["history"]
    task_entry = next(h for h in hist if h["type"] == "task")
    assert (await _call(ws, "task_organizer/undo_completion", history_id=task_entry["id"]))["success"]
    assert _wallet(hass) == 0
    # edit / delete of a history entry
    await _complete(ws, await _task(ws, complexity=5))
    entry = next(h for h in _data(hass)["history"] if h["type"] == "task")
    assert (await _call(ws, "task_organizer/edit_history_item", entry_id=entry["id"], points=2, user_id=BEN))["success"]
    assert _wallet(hass) == 0 and _wallet(hass, BEN) == 2
    assert (await _call(ws, "task_organizer/delete_history_item", entry_id=entry["id"]))["success"]
    assert _wallet(hass, BEN) == 0


async def test_undo_takes_wallet_back_after_monthly_reset(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _kid(ws)
    await _complete(ws, await _task(ws, complexity=6))
    entry = next(h for h in _data(hass)["history"] if h["type"] == "task")
    await _async_check_monthly_reset(hass, force=True)
    assert _data(hass)["points"][ANNA] == 0 and _wallet(hass) == 6      # wallet survives the reset
    assert (await _call(ws, "task_organizer/undo_completion", history_id=entry["id"]))["success"]
    assert _wallet(hass) == 0


async def test_wallet_migration_from_month_points(hass, hass_storage, users):
    hass_storage["task_organizer.storage"] = {"version": 1, "minor_version": 1, "key": "task_organizer.storage", "data": {
        "tasks": {}, "points": {ANNA: 12.5, BEN: 3}, "history": [], "settings": {}, "monthly_history": {},
        "current_month": datetime.now().strftime("%Y-%m"), "templates": {},
    }}
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna"})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    _fake_http(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert _data(hass)["wallet"] == {ANNA: 12.5, BEN: 3.0}
    await _async_check_monthly_reset(hass, force=True)
    assert _data(hass)["points"][ANNA] == 0 and _wallet(hass) == 12.5


# ---------------------------------------------------------------------------
# rewards
# ---------------------------------------------------------------------------

def test_normalize_rewards():
    ok = normalize_rewards([{"name": " A ", "cost": 5}])
    assert ok[0]["name"] == "A" and ok[0]["emoji"] == "🎁" and ok[0]["id"] and ok[0]["active"] is True
    for bad in ([{"name": "", "cost": 5}], [{"name": "A", "cost": 0}], [{"name": "A", "cost": 1001}],
                [{"name": "A", "cost": 5, "min_age": 19}], [{"name": "A", "cost": True}],
                [{"name": "A", "cost": 2.5}], [{"name": "A", "cost": 5}] * 31, "x",
                [{"id": "x", "name": "A", "cost": 5}, {"id": "x", "name": "B", "cost": 5}]):
        assert normalize_rewards(bad) is None


async def test_set_rewards_roles_and_protection(hass, hass_ws_client, setup, users):
    admin = await hass_ws_client(hass)
    await _rewards(admin)
    assert [r["id"] for r in setup.options["rewards"]] == ["r1", "r2", "r3", "r4"]
    manager = await hass_ws_client(hass, users["manager"][1])
    assert (await _call(manager, "task_organizer/set_rewards", rewards=[]))["success"]
    for who in ("parent", "other"):
        ws = await hass_ws_client(hass, users[who][1])
        res = await _call(ws, "task_organizer/set_rewards", rewards=[])
        assert res["error"]["code"] == "unauthorized"
    bad = await _call(admin, "task_organizer/set_rewards", rewards=[{"name": "A", "cost": 0}])
    assert bad["error"]["code"] == "invalid_rewards"
    await _rewards(admin)
    # update_settings / import cannot touch rewards, wallet, redemptions
    _data(hass)["wallet"][ANNA] = 9.0
    await _call(admin, "task_organizer/update_settings", settings={"rewards": [], "wallet": {ANNA: 999}, "overdue_days": 3})
    res = await _call(admin, "task_organizer/import_tasks",
                      settings={"rewards": [], "wallet": {ANNA: 999}, "redemptions": {"x": {}}})
    assert res["success"]
    assert len(setup.options["rewards"]) == 4 and setup.options["overdue_days"] == 3
    assert "wallet" not in setup.options and _wallet(hass) == 9.0


# ---------------------------------------------------------------------------
# redeem
# ---------------------------------------------------------------------------

async def test_redeem_flow_and_checks(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _rewards(ws)
    await _fund(hass, ws, 20)
    seen = []
    hass.bus.async_listen("task_organizer_reward_requested", lambda e: seen.append(e.data))
    month_before = _data(hass)["points"][ANNA]
    wrong = await _redeem(ws, pin="0000")
    assert wrong["error"] == "wrong_pin" and _wallet(hass) == 20
    assert (await _redeem(ws, "nope"))["error"] == "unknown_reward"
    assert (await _redeem(ws, "r4"))["error"] == "reward_inactive"
    assert (await _redeem(ws, "r3"))["error"] == "too_young"            # Anna is 10, min age 12
    assert (await _redeem(ws, "r2"))["error"] == "not_enough_points"
    res = await _redeem(ws, "r1")
    assert res["success"] and res["balance"] == 5
    assert _wallet(hass) == 5
    assert _data(hass)["points"][ANNA] == month_before                 # monthly points / goal untouched
    (rec,) = _data(hass)["redemptions"].values()
    assert rec["status"] == "pending" and rec["cost"] == 15 and rec["kid_id"] == ANNA and rec["name"] == "Medienzeit"
    hist = _data(hass)["history"][0]
    assert hist["type"] == "redeem" and hist["points"] == -15
    await hass.async_block_till_done()
    assert seen and seen[0]["redemption_id"] == rec["id"] and seen[0]["kid_name"] == "Anna"
    # double click: second one cannot be paid
    assert (await _redeem(ws, "r1"))["error"] == "not_enough_points"
    assert len(_data(hass)["redemptions"]) == 1 and _wallet(hass) == 5


async def test_redeem_concurrent_no_double_spend(hass, hass_ws_client, setup):
    import asyncio
    ws = await hass_ws_client(hass)
    await _rewards(ws)
    await _fund(hass, ws, 20)
    await asyncio.gather(*[ws.send_json({"id": 700 + i, "type": "task_organizer/kid_redeem", "kid_id": ANNA,
                                         "pin": "1234", "reward_id": "r1"}) for i in range(3)])
    results = [(await ws.receive_json())["result"] for _ in range(3)]
    assert sum(1 for r in results if r["success"]) == 1
    assert _wallet(hass) == 5 and len(_data(hass)["redemptions"]) == 1


async def test_family_goal_ignores_shop(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _rewards(ws)
    await _fund(hass, ws, 20)
    before = (await _call(ws, "task_organizer/get_data"))["result"]["family_points"]
    await _redeem(ws, "r1")
    after = (await _call(ws, "task_organizer/get_data"))["result"]
    assert after["family_points"] == before and after["wallet"][ANNA] == 5


async def test_resolve_approve_reject_and_idempotent(hass, hass_ws_client, setup, users):
    ws = await hass_ws_client(hass)
    await _rewards(ws)
    await _fund(hass, ws, 40)
    await _redeem(ws, "r1")
    await _redeem(ws, "r1")
    a, b = list(_data(hass)["redemptions"])
    resolved = []
    hass.bus.async_listen("task_organizer_reward_resolved", lambda e: resolved.append(e.data["result"]))
    other = await hass_ws_client(hass, users["other"][1])
    assert (await _call(other, "task_organizer/redemption_resolve", redemption_id=a, approve=True))["error"]["code"] == "unauthorized"
    parent = await hass_ws_client(hass, users["parent"][1])
    assert (await _call(parent, "task_organizer/redemption_resolve", redemption_id=a, approve=True))["result"]["status"] == "done"
    assert _wallet(hass) == 10
    again = await _call(parent, "task_organizer/redemption_resolve", redemption_id=a, approve=False)
    assert again["result"]["error"] == "not_found" and _wallet(hass) == 10
    assert (await _call(parent, "task_organizer/redemption_resolve", redemption_id=b, approve=False))["result"]["status"] == "rejected"
    assert _wallet(hass) == 25
    assert (await _call(parent, "task_organizer/redemption_resolve", redemption_id=b, approve=False))["result"]["error"] == "not_found"
    assert _wallet(hass) == 25
    assert [h["type"] for h in _data(hass)["history"][:1]] == ["refund"]
    assert _data(hass)["history"][0]["points"] == 15
    await hass.async_block_till_done()
    assert resolved == ["approved", "rejected"]
    # redeem/refund history entries only touch the wallet
    month = _data(hass)["points"][ANNA]
    refund = _data(hass)["history"][0]
    assert (await _call(ws, "task_organizer/delete_history_item", entry_id=refund["id"]))["success"]
    assert _wallet(hass) == 10 and _data(hass)["points"][ANNA] == month


async def test_push_actions_for_redemptions(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _rewards(ws)
    await _fund(hass, ws, 40)
    await _redeem(ws, "r1")
    await _redeem(ws, "r1")
    a, b = list(_data(hass)["redemptions"])

    def fire(action):
        hass.bus.async_fire("mobile_app_notification_action", {"action": action})

    fire(f"TO_RAPPROVE_{a}")
    fire(f"TO_RAPPROVE_{a}")
    fire(f"TO_RREJECT_{a}")                       # already handled
    fire(f"TO_RREJECT_{b}")
    fire(f"TO_RREJECT_{b}")
    fire("TO_RREJECT_unknown")
    await hass.async_block_till_done()
    data = _data(hass)
    assert data["redemptions"][a]["status"] == "done" and data["redemptions"][b]["status"] == "rejected"
    assert _wallet(hass) == 25


# ---------------------------------------------------------------------------
# savings goal
# ---------------------------------------------------------------------------

async def test_kid_set_goal(hass, hass_ws_client, setup):
    ws = await hass_ws_client(hass)
    await _rewards(ws)
    await _kid(ws)
    res = await _call(ws, "task_organizer/kid_set_goal", kid_id=ANNA, pin="1234", reward_id="r2")
    assert res["result"]["success"] and setup.options["kids"][ANNA]["goal_reward"] == "r2"
    data = (await _call(ws, "task_organizer/get_data"))["result"]
    assert data["settings"]["kids"][ANNA]["goal_reward"] == "r2"
    assert "pin_hash" not in data["settings"]["kids"][ANNA]
    assert (await _call(ws, "task_organizer/kid_set_goal", kid_id=ANNA, pin="9999", reward_id="r1"))["result"]["error"] == "wrong_pin"
    assert (await _call(ws, "task_organizer/kid_set_goal", kid_id=ANNA, pin="1234", reward_id="zzz"))["result"]["error"] == "unknown_reward"
    assert setup.options["kids"][ANNA]["goal_reward"] == "r2"
    # profile edits keep the goal
    await _kid(ws)
    assert setup.options["kids"][ANNA]["goal_reward"] == "r2"
    assert (await _call(ws, "task_organizer/kid_set_goal", kid_id=ANNA, pin="1234", reward_id=None))["result"]["success"]
    assert "goal_reward" not in setup.options["kids"][ANNA]


async def test_penalty_reduces_wallet_even_with_zero_monthly_points(hass, hass_ws_client, setup):
    """Start of a month: monthly points 0, the saved wallet must still pay the penalty."""
    ws = await hass_ws_client(hass)
    data = hass.data[DOMAIN]["data"]
    data["points"][ANNA] = 0.0
    data.setdefault("wallet", {})[ANNA] = 30.0
    res = await _call(ws, "task_organizer/adjust_points", kid_id=ANNA, points=-5, reason="Test")
    assert res["success"], res
    assert data["points"][ANNA] == 0.0
    assert data["wallet"][ANNA] == 25.0
    entry = data["history"][0]
    assert entry["points"] == 0 and entry["wallet_points"] == -5
    # deleting the entry refunds exactly the wallet amount
    res = await _call(ws, "task_organizer/delete_history_item", entry_id=entry["id"])
    assert data["wallet"][ANNA] == 30.0 and data["points"][ANNA] == 0.0
