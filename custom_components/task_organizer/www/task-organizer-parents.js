/**
 * TaskOrganizer Parents card.
 *
 * A dashboard for the parents (administrators and users with the parent role), made for phones:
 *  1. "Freigaben": completions by kids that wait for approval - approve, "not
 *     done" (task is due again) or "cheated" (penalty + strict mode),
 *  2. quick bonus / deduction per kid (+1 +5 -1 -5) with a reason,
 *  3. the last history entries per kid.
 *
 * Everything goes through the websocket commands approve, reject and adjust_points of
 * the integration, which check the role (admin / manager / parent) in the backend.
 * Other users only see a short note.
 */

const I18N_PARENTS = {
  en: {
    title: "Parents", only_parents: "Only for parents. Ask an administrator to add your user in the settings (Kids > Parents).",
    loading: "Loading...", approvals: "Approvals", no_approvals: "Nothing to approve right now.",
    approve: "Approve", not_done: "Not done", cheated: "Cheated",
    ago_now: "just now", points_unit: "pts",
    cheat_title: "Cheated?", cheat_text: "\"{task}\" earns no points.",
    cheat_penalty: "Deduction: −{n} points", cheat_strict: "Strict mode for {d} days: every task needs approval",
    cheat_confirm: "Yes, cheated", cancel: "Cancel",
    kids: "Points & bonus", no_kids: "No kids set up yet. Settings card -> Kids.",
    strict_until: "🔍 Strict mode until {date}", goal: "goal",
    adjust_bonus: "Bonus for {name}", adjust_penalty: "Deduction for {name}",
    reason_ph: "Reason (required)", reason_lbl: "Reason", confirm_bonus: "Give +{n}", confirm_penalty: "Deduct −{n}",
    chip_helped: "Helped without being asked", chip_great: "Especially well done",
    chip_cheated: "Cheated", chip_agreement: "Agreement not kept",
    history: "Latest entries", no_history: "No entries yet.",
    type_task: "Task", type_bonus: "Bonus", type_penalty: "Deduction", type_birthday: "Birthday",
    toast_approved: "Approved: +{n} for {name}", toast_not_done: "Back on the list", toast_cheated: "Deducted −{n} from {name}",
    toast_gone: "Already handled", toast_clamped: "Only −{n} deducted ({name} had no more points)",
    toast_adjusted: "Saved", err: "Could not save: ", title_lbl: "Title",
    type_missed: "Missed", type_skipped: "Skipped", undo: "Undo", undo_title: "Undo this entry?",
    undo_text: "Points are deducted, the task is open again - without a penalty.", undo_confirm: "Yes, undo",
    toast_undone: "Undone", toast_undo_gone: "Was already undone",
    adhoc: "Spontaneous bonus", adhoc_btn: "Spontaneous bonus", adhoc_name: "What needs to be done?",
    adhoc_name_ph: "e.g. Fetch bread", adhoc_icon: "Icon", adhoc_minutes: "About how long?", adhoc_min_unit: "min",
    adhoc_points: "Points", adhoc_for: "For", adhoc_all: "All kids", adhoc_min_age: "Minimum age",
    adhoc_age_any: "any", adhoc_expiry: "Valid until", adhoc_no_expiry: "No expiry", adhoc_today_until: "Today until",
    adhoc_past: "That time has already passed today.", adhoc_create: "Create bonus", toast_adhoc: "Bonus created",
    icon_cart: "Shopping", icon_bread: "Bread", icon_basket: "Laundry", icon_broom: "Sweeping", icon_package: "Parcel", icon_dog: "Dog", icon_star: "Star",
    type_redeem: "Reward", type_refund: "Refund", wallet: "Wallet",
    redemptions: "Redemptions", no_redemptions: "No reward is waiting.", rd_approve: "Redeem", rd_reject: "Decline",
    toast_rd_done: "Marked as redeemed", toast_rd_rejected: "Declined, {n} ⭐ refunded",
    rewards_edit: "Manage rewards", rewards_title: "Rewards", rewards_none: "No rewards yet.", rewards_add: "Add reward",
    rewards_suggest: "Load suggestions", rewards_name: "Name", rewards_cost: "Cost (⭐)", rewards_age: "From age",
    rewards_active: "Active", rewards_delete: "Delete", rewards_save: "Save", toast_rewards_saved: "Rewards saved",
    rewards_invalid: "Please give every reward a name and a cost from 1 to 1000.", rewards_max: "At most 30 rewards.",
    praise_btn: "Praise", praise_title: "Praise {name}", praise_sticker: "Sticker", praise_msg_ph: "Your own words (optional)", praise_msg_lbl: "Message",
    help_btn: "Help", praise_send: "Send praise", toast_praise: "Praise sent to {name}", type_praise: "Praise",
    praise_c1: "Thanks for helping!", praise_c2: "You did that really well!", praise_c3: "I am proud of you!", praise_c4: "Great how you stuck with it!"
  },
  de: {
    title: "Eltern", only_parents: "Nur für Eltern. Ein Administrator kann Ihren Benutzer in den Einstellungen eintragen (Kinder > Eltern).",
    loading: "Lade...", approvals: "Freigaben", no_approvals: "Gerade gibt es nichts freizugeben.",
    approve: "Freigeben", not_done: "Nicht fertig", cheated: "Geschummelt",
    ago_now: "gerade eben", points_unit: "Pkt.",
    cheat_title: "Geschummelt?", cheat_text: "„{task}“ gibt keine Punkte.",
    cheat_penalty: "Abzug: −{n} Punkte", cheat_strict: "Strenge Phase für {d} Tage: Jede Aufgabe braucht eine Freigabe",
    cheat_confirm: "Ja, geschummelt", cancel: "Abbrechen",
    kids: "Punkte & Bonus", no_kids: "Noch keine Kinder eingerichtet. Einstellungen-Karte -> Kinder.",
    strict_until: "🔍 Strenge Phase bis {date}", goal: "Ziel",
    adjust_bonus: "Bonus für {name}", adjust_penalty: "Abzug für {name}",
    reason_ph: "Begründung (Pflicht)", reason_lbl: "Begründung", confirm_bonus: "+{n} geben", confirm_penalty: "−{n} abziehen",
    chip_helped: "Ungefragt geholfen", chip_great: "Besonders gut gemacht",
    chip_cheated: "Geschummelt", chip_agreement: "Absprache nicht eingehalten",
    history: "Letzte Einträge", no_history: "Noch keine Einträge.",
    type_task: "Aufgabe", type_bonus: "Bonus", type_penalty: "Abzug", type_birthday: "Geburtstag",
    toast_approved: "Freigegeben: +{n} für {name}", toast_not_done: "Wieder auf der Liste", toast_cheated: "−{n} bei {name} abgezogen",
    toast_gone: "Wurde schon bearbeitet", toast_clamped: "Nur −{n} abgezogen ({name} hatte nicht mehr Punkte)",
    toast_adjusted: "Gespeichert", err: "Speichern fehlgeschlagen: ", title_lbl: "Titel",
    type_missed: "Verpasst", type_skipped: "Ausgesetzt", undo: "Rückgängig", undo_title: "Eintrag rückgängig machen?",
    undo_text: "Punkte werden abgezogen, Aufgabe ist wieder offen – ohne Abzug.", undo_confirm: "Ja, rückgängig",
    toast_undone: "Rückgängig gemacht", toast_undo_gone: "Wurde schon rückgängig gemacht",
    adhoc: "Spontan-Bonus", adhoc_btn: "Spontan-Bonus", adhoc_name: "Was ist zu tun?",
    adhoc_name_ph: "z. B. Brot holen", adhoc_icon: "Symbol", adhoc_minutes: "Etwa wie lange?", adhoc_min_unit: "Min.",
    adhoc_points: "Punkte", adhoc_for: "Für", adhoc_all: "Alle Kinder", adhoc_min_age: "Mindestalter",
    adhoc_age_any: "egal", adhoc_expiry: "Gültig bis", adhoc_no_expiry: "Kein Ablauf", adhoc_today_until: "Heute bis",
    adhoc_past: "Diese Uhrzeit ist heute schon vorbei.", adhoc_create: "Bonus anlegen", toast_adhoc: "Bonus angelegt",
    icon_cart: "Einkauf", icon_bread: "Brot", icon_basket: "Wäsche", icon_broom: "Fegen", icon_package: "Paket", icon_dog: "Hund", icon_star: "Stern",
    type_redeem: "Belohnung", type_refund: "Erstattung", wallet: "Guthaben",
    redemptions: "Einlösungen", no_redemptions: "Es wartet keine Belohnung.", rd_approve: "Einlösen", rd_reject: "Ablehnen",
    toast_rd_done: "Als eingelöst markiert", toast_rd_rejected: "Abgelehnt, {n} ⭐ zurückgebucht",
    rewards_edit: "Belohnungen verwalten", rewards_title: "Belohnungen", rewards_none: "Noch keine Belohnungen.", rewards_add: "Belohnung hinzufügen",
    rewards_suggest: "Vorschläge laden", rewards_name: "Name", rewards_cost: "Preis (⭐)", rewards_age: "Ab Alter",
    rewards_active: "Aktiv", rewards_delete: "Löschen", rewards_save: "Speichern", toast_rewards_saved: "Belohnungen gespeichert",
    rewards_invalid: "Bitte jeder Belohnung einen Namen und einen Preis von 1 bis 1000 geben.", rewards_max: "Höchstens 30 Belohnungen.",
    praise_btn: "Loben", praise_title: "{name} loben", praise_sticker: "Sticker", praise_msg_ph: "Eigene Worte (optional)", praise_msg_lbl: "Nachricht",
    help_btn: "Hilfe", praise_send: "Lob senden", toast_praise: "Lob an {name} gesendet", type_praise: "Lob",
    praise_c1: "Danke fürs Helfen!", praise_c2: "Das hast du super gemacht!", praise_c3: "Ich bin stolz auf dich!", praise_c4: "Toll, wie du drangeblieben bist!"
  }
};

const PARENTS_REWARD_EMOJIS = ['📺', '🍨', '🎲', '🌙', '🎟️', '🎮', '🍕', '🎁', '🚲', '📚', '🧸', '🎬', '🏊', '⚽'];
const PARENTS_REWARD_SUGGESTIONS = {
  de: [['📺', '15 Minuten Medienzeit', 15], ['🍨', 'Nachtisch aussuchen', 20], ['🎲', 'Spieleabend bestimmen', 60],
       ['🌙', '30 Minuten später ins Bett', 80], ['🎟️', 'Ausflug mit Mama oder Papa allein', 200]],
  en: [['📺', '15 minutes of screen time', 15], ['🍨', 'Pick the dessert', 20], ['🎲', 'Choose game night', 60],
       ['🌙', 'Stay up 30 minutes later', 80], ['🎟️', 'Outing alone with mom or dad', 200]]
};

window.customCards = window.customCards || [];
window.customCards.push({
  type: "task-organizer-parents",
  name: "Task Organizer: Parents",
  description: "Parent dashboard for phones: approve kids' tasks, give bonus points or deductions with a reason, see the latest history.",
  preview: false,
});

const PARENTS_TYPE_ICONS = { task: '✅', bonus: '⭐', penalty: '⚠️', birthday: '🎂', missed: '⏭️', skipped: '⏸️', redeem: '🛍️', refund: '↩️', praise: '❤️' };
const PARENTS_STICKERS = ['❤️', '⭐', '🌟', '👏', '🏆', '💪', '🦸', '🎉', '😊', '🙌'];

/** Icon chips of the spontaneous bonus sheet: emoji + the mdi icon stored in the task. */
const PARENTS_ADHOC_ICONS = [
  ['🛒', 'mdi:cart', 'icon_cart'], ['🍞', 'mdi:bread-slice', 'icon_bread'], ['🧺', 'mdi:basket', 'icon_basket'],
  ['🧹', 'mdi:broom', 'icon_broom'], ['📦', 'mdi:package-variant', 'icon_package'], ['🐕', 'mdi:dog', 'icon_dog'],
  ['⭐', 'mdi:star', 'icon_star']
];
/** Estimated minutes -> suggested points. */
const PARENTS_ADHOC_MINUTES = [[5, 2], [10, 3], [15, 4], [30, 6]];

/** Escapes text for safe use inside innerHTML templates. */
function escParents(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Formats a point value: at most one decimal, no trailing ".0". */
function fmtParents(value) {
  const n = Math.round((parseFloat(value) || 0) * 10) / 10;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Options for a time select ("HH:MM", 15-minute steps). Used instead of
 * <input type="time">, whose native picker crashes some browsers (Safari)
 * inside the dialogs. A value outside the steps is kept as its own option.
 */
function parTimeOptions(value, emptyLabel) {
  const v = /^\d{2}:\d{2}$/.test(value || '') ? value : '';
  const times = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  if (v && !times.includes(v)) { times.push(v); times.sort(); }
  return `<option value="" ${v ? '' : 'selected'}>${emptyLabel}</option>` +
    times.map(t => `<option value="${t}" ${t === v ? 'selected' : ''}>${t}</option>`).join('');
}

class TaskOrganizerParents extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.pending = {};
    this.history = [];
    this.points = {};
    this.settings = {};
    this._config = {};
    this._hass = null;
    this._fetched = false;
    this._dataLoaded = false;
    this._unsubEvents = null;
    this._busy = new Set();       // pending ids / actions in flight
    this._open = new Set();       // kids whose history is expanded
    this._sheet = null;           // { kidId, sign, amount, reason }
    this._confirm = null;         // pending id of the "cheated" dialog
    this._undo = null;            // history id of the "undo" dialog
    this._adhoc = null;           // state of the spontaneous bonus sheet
    this._rw = null;              // reward editor state { list }
    this._praise = null;          // praise sheet state { kidId, sticker, message }
    this.wallet = {};
    this.redemptions = {};
    this._toastTimer = null;
    this.shadowRoot.innerHTML = `<style>${this._styles()}</style><div id="app"></div><div id="layer"></div><div id="toast" role="status" aria-live="polite"></div>`;
    this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener('input', (ev) => this._onInput(ev));
    this.shadowRoot.addEventListener('toggle', (ev) => this._onToggle(ev), true);
  }

  // ---------------------------------------------------------------------------
  // Localization / card API
  // ---------------------------------------------------------------------------

  static _localize(hass, key, replace = null) {
    const lang = (hass && hass.language) ? hass.language.substring(0, 2) : 'en';
    let text = (I18N_PARENTS[lang] || I18N_PARENTS.en)[key] || I18N_PARENTS.en[key] || key;
    if (replace) {
      for (const [k, v] of Object.entries(replace)) text = text.split(`{${k}}`).join(v);
    }
    return text;
  }

  localize(key, replace = null) { return TaskOrganizerParents._localize(this._hass, key, replace); }

  static participantId(entityId, state) {
    return (state && state.attributes && state.attributes.user_id) || entityId;
  }

  static getLayoutOptions() { return { grid_columns: 12, grid_rows: "auto", grid_min_columns: 6 }; }

  getCardSize() { return 8; }

  static getStubConfig(hass) {
    return { type: "custom:task-organizer-parents", title: this._localize(hass, 'title') };
  }

  static getConfigElement() { return document.createElement("task-organizer-parents-editor"); }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    if (this._hass) this._render();
  }

  connectedCallback() {
    if (this._hass && !this._unsubEvents) this._subscribe();
  }

  disconnectedCallback() {
    if (this._unsubEvents) {
      this._unsubEvents.then(unsub => unsub());
      this._unsubEvents = null;
    }
    clearTimeout(this._toastTimer);
  }

  _subscribe() {
    if (!this._hass) return;
    this._unsubEvents = this._hass.connection.subscribeEvents(() => this._fetchData(), "task_organizer_updated");
  }

  set hass(hass) {
    this._hass = hass;
    if (!hass) return;
    if (!this._dataLoaded) {
      this._dataLoaded = true;
      this._fetchData();
      this._render();
    }
    if (!this._unsubEvents && this.isConnected) this._subscribe();
  }

  /** True for the roles admin, manager and parent (role comes from get_data, the backend enforces it). */
  _isParent() {
    if (this._hass && this._hass.user && this._hass.user.is_admin) return true;
    return ['admin', 'manager', 'parent'].includes(this._myRole);
  }

  _fetchData() {
    if (!this._hass) return;
    this._hass.callWS({ type: 'task_organizer/get_data' }).then((data) => {
      this._myRole = data.my_role || null;
      this.pending = data.pending || {};
      this.history = Array.isArray(data.history) ? data.history : [];
      this.points = data.points || {};
      this.settings = data.settings || {};
      this.wallet = data.wallet || {};
      this.redemptions = data.redemptions || {};
      this._fetched = true;
      this._render();
    }).catch((err) => console.error("TaskOrganizer Parents: could not load data", err));
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  _persons() {
    const map = {};
    const states = (this._hass && this._hass.states) || {};
    for (const entityId in states) {
      if (!entityId.startsWith('person.')) continue;
      const state = states[entityId];
      map[TaskOrganizerParents.participantId(entityId, state)] = {
        name: (state.attributes && state.attributes.friendly_name) || entityId
      };
    }
    return map;
  }

  /** Kids in a fixed alphabetical order, with points and goal. */
  _kids() {
    const persons = this._persons();
    const profiles = this.settings.kids || {};
    const goals = this.settings.point_goals || {};
    const kids = Object.entries(profiles).map(([id, p]) => ({
      id,
      name: (persons[id] && persons[id].name) || id,
      avatar: p.avatar || '🙂',
      color: /^#[0-9a-fA-F]{3,6}$/.test(p.color || '') ? p.color : '#4CAF50',
      points: parseFloat(this.points[id]) || 0,
      wallet: parseFloat((this.wallet || {})[id]) || 0,
      goal: parseFloat(goals[id]) || 0,
      strict_until: p.strict_until || null
    }));
    kids.sort((a, b) => a.name.localeCompare(b.name, (this._hass && this._hass.language) || undefined));
    return kids;
  }

  _kid(id) {
    return this._kids().find(k => k.id === id) || { id, name: (this._persons()[id] || {}).name || id, avatar: '🙂', color: '#4CAF50', points: 0, goal: 0 };
  }

  _canManage() {
    return (this._hass && this._hass.user && this._hass.user.is_admin) || ['admin', 'manager'].includes(this._myRole);
  }

  _pendingRedemptions() {
    return Object.values(this.redemptions || {}).filter(r => r.status === 'pending')
      .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }

  _pendingList() {
    return Object.values(this.pending || {}).sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }

  /** Deduction for cheating, same rule as the backend: round half up(points x factor). */
  _penalty(points) {
    let factor = parseFloat(this.settings.cheat_penalty_factor);
    if (isNaN(factor)) factor = 1;
    factor = Math.max(0, Math.min(2, factor));
    return Math.floor((parseFloat(points) || 0) * factor + 0.5);
  }

  _strictDays() {
    const d = parseInt(this.settings.cheat_strict_days);
    return isNaN(d) ? 7 : Math.max(0, Math.min(30, d));
  }

  _strictActive(kid) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(kid.strict_until || '');
    if (!m) return false;
    const now = new Date();
    const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    return today < (+m[1]) * 10000 + (+m[2]) * 100 + (+m[3]);
  }

  _formatDate(isoDate) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '');
    if (!m) return isoDate || '';
    return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString((this._hass && this._hass.language) || undefined, { day: 'numeric', month: 'numeric' });
  }

  _ago(timestamp) {
    const then = new Date(timestamp).getTime();
    if (isNaN(then)) return '';
    const minutes = Math.round((Date.now() - then) / 60000);
    if (minutes < 1) return this.localize('ago_now');
    const lang = (this._hass && this._hass.language) || 'en';
    try {
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
      if (minutes < 60) return rtf.format(-minutes, 'minute');
      if (minutes < 1440) return rtf.format(-Math.round(minutes / 60), 'hour');
      return rtf.format(-Math.round(minutes / 1440), 'day');
    } catch (err) {
      return new Date(timestamp).toLocaleString();
    }
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  _onToggle(ev) {
    const el = ev.target;
    if (!el || !el.dataset || el.dataset.kidHistory === undefined) return;
    if (el.open) this._open.add(el.dataset.kidHistory); else this._open.delete(el.dataset.kidHistory);
  }

  _onInput(ev) {
    const el = ev.target;
    if (el.dataset && el.dataset.rw !== undefined && this._rw) {
      const row = this._rw.list[parseInt(el.dataset.rw)];
      if (!row) return;
      const f = el.dataset.f;
      if (f === 'active') row.active = el.checked;
      else if (f === 'cost' || f === 'min_age') row[f] = el.value === '' ? '' : parseInt(el.value);
      else row[f] = el.value;
      return;
    }
    if (el.id === 'praise-input' && this._praise) {
      this._praise.message = el.value;
      this.shadowRoot.querySelectorAll('[data-action="praise-chip"]').forEach(c => c.classList.toggle('on', c.dataset.text === el.value));
    } else if (el.id === 'reason-input' && this._sheet) {
      this._sheet.reason = el.value;
      this._updateSheetState();
    } else if (el.id === 'adhoc-name' && this._adhoc) {
      this._adhoc.name = el.value;
      this._updateAdhocState();
    } else if (el.id === 'adhoc-time' && this._adhoc) {
      this._adhoc.time = el.value;
      this._updateAdhocState();
    }
  }

  _onClick(ev) {
    const el = ev.target.closest ? ev.target.closest('[data-action]') : null;
    if (!el || el.disabled) return;
    const action = el.dataset.action;
    if (action === 'approve') this._approve(el.dataset.id);
    else if (action === 'not-done') this._reject(el.dataset.id, 'not_done');
    else if (action === 'cheated') { this._confirm = el.dataset.id; this._renderLayer(); }
    else if (action === 'cheated-confirm') { const id = this._confirm; this._confirm = null; this._renderLayer(); this._reject(id, 'cheated'); }
    else if (action === 'dialog-close') { this._confirm = null; this._sheet = null; this._undo = null; this._adhoc = null; this._rw = null; this._praise = null; this._renderLayer(); }
    else if (action === 'undo') { this._undo = el.dataset.id; this._renderLayer(); }
    else if (action === 'undo-confirm') this._doUndo();
    else if (action === 'adhoc-open') this._openAdhoc();
    else if (action.startsWith('adhoc-')) this._adhocAction(action, el);
    else if (action === 'adjust') this._openSheet(el.dataset.kid, parseInt(el.dataset.amount));
    else if (action === 'chip') this._pickChip(el.dataset.text);
    else if (action === 'adjust-confirm') this._submitAdjust();
    else if (action === 'rd-approve') this._resolveRedemption(el.dataset.id, true);
    else if (action === 'rd-reject') this._resolveRedemption(el.dataset.id, false);
    else if (action === 'praise-open') { this._praise = { kidId: el.dataset.kid, sticker: '❤️', message: '' }; this._renderLayer(); const i = this.shadowRoot.getElementById('praise-input'); if (i) i.focus(); }
    else if (action === 'praise-sticker' && this._praise) { this._praise.sticker = el.dataset.sticker; this._renderLayer(); }
    else if (action === 'praise-chip' && this._praise) { this._praise.message = el.dataset.text; this._renderLayer(); }
    else if (action === 'praise-send') this._sendPraise();
    else if (action === 'help') { if (window.TaskOrganizerHelp) window.TaskOrganizerHelp.open(this._hass, el.dataset.anchor); }
    else if (action === 'rw-open') this._openRewards();
    else if (action === 'rw-add') this._rewardsAdd(false);
    else if (action === 'rw-suggest') this._rewardsAdd(true);
    else if (action === 'rw-del') { this._rw.list.splice(parseInt(el.dataset.idx), 1); this._renderLayer(); }
    else if (action === 'rw-save') this._saveRewards();
  }

  async _resolveRedemption(id, approve) {
    if (!id || this._busy.has(id)) return;
    const rec = (this.redemptions || {})[id];
    this._busy.add(id);
    this._render();
    try {
      const res = await this._hass.callWS({ type: 'task_organizer/redemption_resolve', redemption_id: id, approve });
      if (!res.success) this._toast(this.localize('toast_gone'));
      else this._toast(approve ? this.localize('toast_rd_done') : this.localize('toast_rd_rejected', { n: fmtParents(rec ? rec.cost : 0) }));
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete(id);
    this._fetchData();
  }

  _openRewards() {
    const list = ((this.settings && this.settings.rewards) || []).map(r => ({
      id: r.id, emoji: r.emoji || '🎁', name: r.name || '', cost: parseInt(r.cost) || 10, min_age: parseInt(r.min_age) || 0, active: r.active !== false
    }));
    this._rw = { list };
    this._renderLayer();
  }

  _rewardsAdd(suggestions) {
    if (!this._rw) return;
    const lang = ((this._hass && this._hass.language) || 'en').substring(0, 2);
    const items = suggestions
      ? (PARENTS_REWARD_SUGGESTIONS[lang] || PARENTS_REWARD_SUGGESTIONS.en).map(([emoji, name, cost]) => ({ emoji, name, cost, min_age: 0, active: true }))
      : [{ emoji: '🎁', name: '', cost: 10, min_age: 0, active: true }];
    for (const item of items) {
      if (suggestions && this._rw.list.some(r => r.name.trim().toLowerCase() === item.name.toLowerCase())) continue;
      if (this._rw.list.length >= 30) { this._toast(this.localize('rewards_max')); break; }
      this._rw.list.push(item);
    }
    this._renderLayer();
  }

  async _saveRewards() {
    if (!this._rw || this._busy.has('rewards')) return;
    const rewards = this._rw.list.map(r => ({ ...r, name: String(r.name || '').trim() }));
    if (rewards.some(r => !r.name || !(r.cost >= 1 && r.cost <= 1000) || !(r.min_age >= 0 && r.min_age <= 18))) {
      this._toast(this.localize('rewards_invalid'));
      return;
    }
    this._busy.add('rewards');
    try {
      await this._hass.callWS({ type: 'task_organizer/set_rewards', rewards: rewards.map(r => { const c = { ...r }; if (!c.id) delete c.id; return c; }) });
      this._rw = null;
      this._renderLayer();
      this._toast(this.localize('toast_rewards_saved'));
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete('rewards');
    this._fetchData();
  }

  _renderRewardsSheet() {
    const rows = this._rw.list.map((r, i) => {
      const emojis = PARENTS_REWARD_EMOJIS.includes(r.emoji) ? PARENTS_REWARD_EMOJIS : PARENTS_REWARD_EMOJIS.concat([r.emoji]);
      const ages = Array.from({ length: 19 }, (_, a) => `<option value="${a}" ${a === r.min_age ? 'selected' : ''}>${a === 0 ? '—' : a}</option>`).join('');
      return `
        <div class="rw-row">
          <select class="rw-emoji" data-rw="${i}" data-f="emoji" aria-label="Emoji">${emojis.map(e => `<option value="${escParents(e)}" ${e === r.emoji ? 'selected' : ''}>${escParents(e)}</option>`).join('')}</select>
          <input class="rw-name" type="text" maxlength="40" data-rw="${i}" data-f="name" value="${escParents(r.name)}" placeholder="${escParents(this.localize('rewards_name'))}" aria-label="${escParents(this.localize('rewards_name'))}">
          <button class="rw-del" data-action="rw-del" data-idx="${i}" aria-label="${escParents(this.localize('rewards_delete'))}" title="${escParents(this.localize('rewards_delete'))}">🗑️</button>
          <div class="rw-meta">
            <label class="rw-f">⭐ <input class="rw-cost" type="number" min="1" max="1000" inputmode="numeric" data-rw="${i}" data-f="cost" value="${r.cost === '' ? '' : r.cost}" aria-label="${escParents(this.localize('rewards_cost'))}"></label>
            <label class="rw-f"><span>${escParents(this.localize('rewards_age'))}</span><select data-rw="${i}" data-f="min_age">${ages}</select></label>
            <label class="rw-f"><input type="checkbox" data-rw="${i}" data-f="active" ${r.active ? 'checked' : ''}><span>${escParents(this.localize('rewards_active'))}</span></label>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="scrim" data-action="dialog-close"></div>
      <div class="sheet adhoc" role="dialog" aria-modal="true" aria-label="${escParents(this.localize('rewards_title'))}" style="--kc:#F9A825">
        <div class="grab"></div>
        <h3>🛍️ ${escParents(this.localize('rewards_title'))}</h3>
        <div class="rw-list">${rows || `<div class="empty small">${escParents(this.localize('rewards_none'))}</div>`}</div>
        <div class="chips">
          <button class="chip" data-action="rw-add">➕ ${escParents(this.localize('rewards_add'))}</button>
          <button class="chip" data-action="rw-suggest">💡 ${escParents(this.localize('rewards_suggest'))}</button>
        </div>
        <div class="dialog-actions">
          <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
          <button class="btn ok solid" data-action="rw-save">${escParents(this.localize('rewards_save'))}</button>
        </div>
      </div>`;
  }

  _renderRedemptions() {
    const list = this._pendingRedemptions();
    const hasRewards = ((this.settings && this.settings.rewards) || []).length > 0;
    if (!list.length && !hasRewards && !this._canManage()) return '';
    const items = list.map(r => {
      const kid = this._kid(r.kid_id);
      const busy = this._busy.has(r.id) ? 'disabled' : '';
      return `
        <article class="appr" style="--kc:${kid.color}">
          <div class="appr-top">
            ${this._avatar(kid)}
            <div class="appr-main">
              <div class="appr-task">${escParents(r.emoji || '')} ${escParents(r.name)}</div>
              <div class="appr-meta">${escParents(kid.name)} · ${escParents(this._ago(r.timestamp))}</div>
            </div>
            <div class="appr-pts">⭐ ${fmtParents(r.cost)}</div>
          </div>
          <div class="appr-actions two">
            <button class="btn ok" data-action="rd-approve" data-id="${escParents(r.id)}" ${busy}>✅ ${escParents(this.localize('rd_approve'))}</button>
            <button class="btn neutral" data-action="rd-reject" data-id="${escParents(r.id)}" ${busy}>↩️ ${escParents(this.localize('rd_reject'))}</button>
          </div>
        </article>`;
    }).join('');
    return `
      <section>
        <h2>🛍️ ${escParents(this.localize('redemptions'))} ${list.length ? `<span class="count">${list.length}</span>` : ''}</h2>
        ${items ? `<div class="appr-list">${items}</div>` : `<div class="empty">${escParents(this.localize('no_redemptions'))}</div>`}
        ${this._canManage() ? `<button class="adhoc-btn rw-btn" data-action="rw-open">✏️ ${escParents(this.localize('rewards_edit'))}</button>` : ''}
      </section>`;
  }

  async _approve(pendingId) {
    if (this._busy.has(pendingId)) return;
    const rec = this.pending[pendingId];
    this._busy.add(pendingId);
    this._render();
    try {
      const res = await this._hass.callWS({ type: 'task_organizer/approve', pending_id: pendingId });
      if (res.success) this._toast(this.localize('toast_approved', { n: fmtParents(res.points), name: rec ? this._kid(rec.kid_id).name : '' }));
      else this._toast(this.localize('toast_gone'));
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete(pendingId);
    this._fetchData();
  }

  async _reject(pendingId, mode) {
    if (!pendingId || this._busy.has(pendingId)) return;
    const rec = this.pending[pendingId];
    this._busy.add(pendingId);
    this._render();
    try {
      const res = await this._hass.callWS({ type: 'task_organizer/reject', pending_id: pendingId, mode });
      if (!res.success) this._toast(this.localize('toast_gone'));
      else if (mode === 'cheated') this._toast(this.localize('toast_cheated', { n: this._penalty(rec ? rec.points : 0), name: rec ? this._kid(rec.kid_id).name : '' }));
      else this._toast(this.localize('toast_not_done'));
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete(pendingId);
    this._fetchData();
  }

  _openSheet(kidId, amount) {
    if (!amount) return;
    this._sheet = { kidId, amount, reason: '' };
    this._renderLayer();
    const input = this.shadowRoot.getElementById('reason-input');
    if (input) input.focus();
  }

  _pickChip(text) {
    if (!this._sheet) return;
    this._sheet.reason = text;
    const input = this.shadowRoot.getElementById('reason-input');
    if (input) input.value = text;
    this._updateSheetState();
  }

  _updateSheetState() {
    const btn = this.shadowRoot.getElementById('adjust-confirm');
    if (btn) btn.disabled = !this._sheet || !this._sheet.reason.trim();
    this.shadowRoot.querySelectorAll('.chip').forEach(chip => {
      chip.classList.toggle('on', !!this._sheet && chip.dataset.text === this._sheet.reason);
    });
  }

  async _submitAdjust() {
    const sheet = this._sheet;
    if (!sheet || !sheet.reason.trim() || this._busy.has('adjust')) return;
    this._busy.add('adjust');
    const kid = this._kid(sheet.kidId);
    try {
      const res = await this._hass.callWS({
        type: 'task_organizer/adjust_points', kid_id: sheet.kidId, points: sheet.amount, reason: sheet.reason.trim().slice(0, 80)
      });
      this._sheet = null;
      this._renderLayer();
      if (res.success && sheet.amount < 0 && res.applied > sheet.amount) {
        this._toast(this.localize('toast_clamped', { n: fmtParents(Math.abs(res.applied)), name: kid.name }));
      } else {
        this._toast(this.localize('toast_adjusted'));
      }
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete('adjust');
    this._fetchData();
  }

  async _doUndo() {
    const id = this._undo;
    if (!id || this._busy.has('undo')) return;
    this._busy.add('undo');
    this._undo = null;
    this._renderLayer();
    try {
      const res = await this._hass.callWS({ type: 'task_organizer/undo_completion', history_id: id });
      this._toast(this.localize(res.success ? 'toast_undone' : 'toast_undo_gone'));
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete('undo');
    this._fetchData();
  }

  async _sendPraise() {
    const pr = this._praise;
    if (!pr || this._busy.has('praise')) return;
    this._busy.add('praise');
    const kid = this._kid(pr.kidId);
    try {
      await this._hass.callWS({ type: 'task_organizer/send_praise', kid_id: pr.kidId, sticker: pr.sticker, message: pr.message.trim().slice(0, 120) });
      this._praise = null;
      this._renderLayer();
      this._toast(this.localize('toast_praise', { name: kid.name }));
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete('praise');
    this._fetchData();
  }

  _renderPraiseSheet() {
    const pr = this._praise;
    const kid = this._kid(pr.kidId);
    const stickers = PARENTS_STICKERS.map(e =>
      `<button class="chip ico ${pr.sticker === e ? 'on' : ''}" data-action="praise-sticker" data-sticker="${e}" aria-pressed="${pr.sticker === e}" aria-label="${e}">${e}</button>`).join('');
    const chips = ['praise_c1', 'praise_c2', 'praise_c3', 'praise_c4'].map(k => {
      const text = this.localize(k);
      return `<button class="chip ${pr.message === text ? 'on' : ''}" data-action="praise-chip" data-text="${escParents(text)}">${escParents(text)}</button>`;
    }).join('');
    return `
      <div class="scrim" data-action="dialog-close"></div>
      <div class="sheet adhoc" role="dialog" aria-modal="true" aria-label="${escParents(this.localize('praise_title', { name: kid.name }))}" style="--kc:${kid.color}">
        <div class="grab"></div>
        <h3>${this._avatar(kid)} ${escParents(this.localize('praise_title', { name: kid.name }))}</h3>
        <div class="praise-big" aria-hidden="true">${pr.sticker}</div>
        <div class="lbl">${escParents(this.localize('praise_sticker'))}</div>
        <div class="chips">${stickers}</div>
        <div class="chips">${chips}</div>
        <input id="praise-input" type="text" maxlength="120" autocomplete="off" placeholder="${escParents(this.localize('praise_msg_ph'))}"
               aria-label="${escParents(this.localize('praise_msg_lbl'))}" value="${escParents(pr.message)}">
        <div class="dialog-actions">
          <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
          <button class="btn ok solid" data-action="praise-send">${escParents(this.localize('praise_send'))}</button>
        </div>
      </div>`;
  }

  // ---- spontaneous bonus ------------------------------------------------------

  _openAdhoc() {
    this._adhoc = { name: '', icon: 'mdi:cart', minutes: 10, points: 3, kid: null, minAge: 0, expiry: 'none', time: '18:00' };
    this._renderLayer();
    const input = this.shadowRoot.getElementById('adhoc-name');
    if (input) input.focus();
  }

  _adhocAction(action, el) {
    const a = this._adhoc;
    if (!a) return;
    if (action === 'adhoc-icon') a.icon = el.dataset.icon;
    else if (action === 'adhoc-minutes') {
      a.minutes = parseInt(el.dataset.min);
      const suggestion = PARENTS_ADHOC_MINUTES.find(m => m[0] === a.minutes);
      if (suggestion) a.points = suggestion[1];
    } else if (action === 'adhoc-points') a.points = Math.max(1, Math.min(10, a.points + parseInt(el.dataset.delta)));
    else if (action === 'adhoc-target') a.kid = el.dataset.kid || null;
    else if (action === 'adhoc-age') a.minAge = Math.max(0, Math.min(18, a.minAge + parseInt(el.dataset.delta)));
    else if (action === 'adhoc-expiry') a.expiry = el.dataset.mode;
    else if (action === 'adhoc-create') { this._submitAdhoc(); return; }
    this._renderLayer();
  }

  /** ISO timestamp of "today at HH:MM" (local time) or null when invalid. */
  _adhocExpiry() {
    const a = this._adhoc;
    if (!a || a.expiry !== 'today') return null;
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(a.time || '');
    if (!m) return null;
    const d = new Date();
    d.setHours(+m[1], +m[2], 0, 0);
    return d;
  }

  _adhocValid() {
    const a = this._adhoc;
    if (!a) return false;
    const name = a.name.trim();
    if (!name || name.length > 60) return false;
    if (a.expiry === 'today') {
      const d = this._adhocExpiry();
      if (!d || d.getTime() <= Date.now()) return false;
    }
    return true;
  }

  _updateAdhocState() {
    const btn = this.shadowRoot.getElementById('adhoc-create');
    if (btn) btn.disabled = !this._adhocValid();
    const warn = this.shadowRoot.getElementById('adhoc-past');
    if (warn) warn.hidden = !(this._adhoc && this._adhoc.expiry === 'today' && this._adhocExpiry() && this._adhocExpiry().getTime() <= Date.now());
  }

  async _submitAdhoc() {
    const a = this._adhoc;
    if (!a || !this._adhocValid() || this._busy.has('adhoc')) return;
    this._busy.add('adhoc');
    const payload = { type: 'task_organizer/add_adhoc_bonus', name: a.name.trim(), icon: a.icon, points: a.points, min_age: a.minAge };
    if (a.minutes) payload.minutes = a.minutes;
    if (a.kid) payload.kid_id = a.kid;
    const expiry = this._adhocExpiry();
    if (expiry) payload.expires_at = expiry.toISOString();
    try {
      await this._hass.callWS(payload);
      this._adhoc = null;
      this._renderLayer();
      this._toast(this.localize('toast_adhoc'));
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete('adhoc');
    this._fetchData();
  }

  _renderAdhocSheet() {
    const a = this._adhoc;
    const kids = this._kids();
    const icons = PARENTS_ADHOC_ICONS.map(([emoji, icon, key]) =>
      `<button class="chip ico ${a.icon === icon ? 'on' : ''}" data-action="adhoc-icon" data-icon="${icon}" title="${escParents(this.localize(key))}" aria-label="${escParents(this.localize(key))}" aria-pressed="${a.icon === icon}">${emoji}</button>`).join('');
    const minutes = PARENTS_ADHOC_MINUTES.map(([m]) =>
      `<button class="chip ${a.minutes === m ? 'on' : ''}" data-action="adhoc-minutes" data-min="${m}" aria-pressed="${a.minutes === m}">${m} ${escParents(this.localize('adhoc_min_unit'))}</button>`).join('');
    const targets = [`<button class="chip ${a.kid === null ? 'on' : ''}" data-action="adhoc-target" data-kid="" aria-pressed="${a.kid === null}">👨‍👩‍👧‍👦 ${escParents(this.localize('adhoc_all'))}</button>`]
      .concat(kids.map(k =>
        `<button class="chip kidchip ${a.kid === k.id ? 'on' : ''}" style="--kc:${k.color}" data-action="adhoc-target" data-kid="${escParents(k.id)}" aria-pressed="${a.kid === k.id}">${this._avatar(k)} ${escParents(k.name)}</button>`)).join('');
    return `
      <div class="scrim" data-action="dialog-close"></div>
      <div class="sheet adhoc" role="dialog" aria-modal="true" aria-label="${escParents(this.localize('adhoc'))}" style="--kc:#F9A825">
        <div class="grab"></div>
        <h3>➕ ${escParents(this.localize('adhoc'))}</h3>
        <label class="lbl" for="adhoc-name">${escParents(this.localize('adhoc_name'))}</label>
        <input id="adhoc-name" type="text" maxlength="60" autocomplete="off" placeholder="${escParents(this.localize('adhoc_name_ph'))}" value="${escParents(a.name)}">
        <div class="lbl">${escParents(this.localize('adhoc_icon'))}</div>
        <div class="chips">${icons}</div>
        <div class="lbl">${escParents(this.localize('adhoc_minutes'))}</div>
        <div class="chips">${minutes}</div>
        <div class="row">
          <div class="lbl inline">${escParents(this.localize('adhoc_points'))}</div>
          <div class="stepper"><button class="step" data-action="adhoc-points" data-delta="-1" aria-label="−" ${a.points <= 1 ? 'disabled' : ''}>−</button>
            <span class="val">⭐ ${a.points}</span>
            <button class="step" data-action="adhoc-points" data-delta="1" aria-label="+" ${a.points >= 10 ? 'disabled' : ''}>+</button></div>
        </div>
        <div class="lbl">${escParents(this.localize('adhoc_for'))}</div>
        <div class="chips">${targets}</div>
        <div class="row">
          <div class="lbl inline">${escParents(this.localize('adhoc_min_age'))}</div>
          <div class="stepper"><button class="step" data-action="adhoc-age" data-delta="-1" aria-label="−" ${a.minAge <= 0 ? 'disabled' : ''}>−</button>
            <span class="val">${a.minAge > 0 ? a.minAge : escParents(this.localize('adhoc_age_any'))}</span>
            <button class="step" data-action="adhoc-age" data-delta="1" aria-label="+" ${a.minAge >= 18 ? 'disabled' : ''}>+</button></div>
        </div>
        <div class="lbl">${escParents(this.localize('adhoc_expiry'))}</div>
        <div class="chips">
          <button class="chip ${a.expiry === 'none' ? 'on' : ''}" data-action="adhoc-expiry" data-mode="none" aria-pressed="${a.expiry === 'none'}">${escParents(this.localize('adhoc_no_expiry'))}</button>
          <button class="chip ${a.expiry === 'today' ? 'on' : ''}" data-action="adhoc-expiry" data-mode="today" aria-pressed="${a.expiry === 'today'}">${escParents(this.localize('adhoc_today_until'))}</button>
          ${a.expiry === 'today' ? `<select id="adhoc-time" class="time" aria-label="${escParents(this.localize('adhoc_today_until'))}">${parTimeOptions(a.time, '—')}</select>` : ''}
        </div>
        <div class="warn" id="adhoc-past" hidden>${escParents(this.localize('adhoc_past'))}</div>
        <div class="dialog-actions">
          <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
          <button class="btn ok solid" id="adhoc-create" data-action="adhoc-create" ${this._adhocValid() ? '' : 'disabled'}>${escParents(this.localize('adhoc_create'))}</button>
        </div>
      </div>`;
  }

  _toast(message) {
    const el = this.shadowRoot.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  _render() {
    if (!this._hass) return;
    const app = this.shadowRoot.getElementById('app');
    if (!app) return;
    const title = escParents(this._config.title || this.localize('title'));
    let body;
    if (!this._isParent() && this._fetched) {
      body = `<div class="note">🔒 ${escParents(this.localize('only_parents'))}</div>`;
    } else if (!this._fetched) {
      body = `<div class="note">${escParents(this.localize('loading'))}</div>`;
    } else {
      body = `${this._renderApprovals()}${this._renderRedemptions()}${this._renderKids()}`;
    }
    app.innerHTML = `<ha-card><div class="head"><span class="head-title">${title}</span>${window.TaskOrganizerHelp ? `<button class="help-btn" data-action="help" data-anchor="daily">❓ ${escParents(this.localize('help_btn'))}</button>` : ''}</div><div class="body">${body}</div></ha-card>`;
    // The dialog layer is not rebuilt on data refreshes (it would reset what is typed);
    // it only closes when its approval was handled elsewhere in the meantime.
    if (this._confirm && !this.pending[this._confirm]) {
      this._confirm = null;
      this._renderLayer();
    }
  }

  _avatar(kid) {
    return `<span class="avatar" style="--kc:${kid.color}" aria-hidden="true">${escParents(kid.avatar)}</span>`;
  }

  _renderApprovals() {
    const list = this._pendingList();
    const items = list.map(p => {
      const kid = this._kid(p.kid_id);
      const busy = this._busy.has(p.id) ? 'disabled' : '';
      return `
        <article class="appr" style="--kc:${kid.color}">
          <div class="appr-top">
            ${this._avatar(kid)}
            <div class="appr-main">
              <div class="appr-task">${escParents(p.task_name)}</div>
              <div class="appr-meta">${escParents([kid.name].concat((p.helpers || []).map(h => this._kid(h).name)).join(' & '))} · ${escParents(this._ago(p.timestamp))}</div>
            </div>
            <div class="appr-pts">⭐ ${fmtParents(p.points)}</div>
          </div>
          <div class="appr-actions">
            <button class="btn ok" data-action="approve" data-id="${escParents(p.id)}" ${busy}>✅ ${escParents(this.localize('approve'))}</button>
            <button class="btn neutral" data-action="not-done" data-id="${escParents(p.id)}" ${busy}>↩️ ${escParents(this.localize('not_done'))}</button>
            <button class="btn danger" data-action="cheated" data-id="${escParents(p.id)}" ${busy}>🚫 ${escParents(this.localize('cheated'))}</button>
          </div>
        </article>`;
    }).join('');
    return `
      <section>
        <h2>${escParents(this.localize('approvals'))} ${list.length ? `<span class="count">${list.length}</span>` : ''}</h2>
        ${items ? `<div class="appr-list">${items}</div>` : `<div class="empty">🎉 ${escParents(this.localize('no_approvals'))}</div>`}
      </section>`;
  }

  _renderKids() {
    const kids = this._kids();
    if (!kids.length) {
      return `<section><h2>${escParents(this.localize('kids'))}</h2><div class="empty">${escParents(this.localize('no_kids'))}</div></section>`;
    }
    const showWallet = ((this.settings && this.settings.rewards) || []).length > 0 || Object.keys(this.wallet || {}).length > 0;
    const cards = kids.map(kid => {
      const pct = kid.goal > 0 ? Math.min(100, Math.round(kid.points / kid.goal * 100)) : 0;
      const entries = this.history.filter(h => h.user_id === kid.id).slice(0, 10);
      const strict = this._strictActive(kid)
        ? `<div class="strict">${escParents(this.localize('strict_until', { date: this._formatDate(kid.strict_until) }))}</div>` : '';
      const quick = [-5, -1, 1, 5].map(n =>
        `<button class="qbtn ${n < 0 ? 'minus' : 'plus'}" data-action="adjust" data-kid="${escParents(kid.id)}" data-amount="${n}">${n > 0 ? '+' + n : '−' + Math.abs(n)}</button>`).join('');
      return `
        <article class="kid" style="--kc:${kid.color}">
          <div class="kid-top">
            ${this._avatar(kid)}
            <div class="kid-main">
              <div class="kid-name">${escParents(kid.name)}</div>
              <div class="kid-pts">⭐ ${fmtParents(kid.points)}${kid.goal > 0 ? ` <small>/ ${fmtParents(kid.goal)} ${escParents(this.localize('goal'))}</small>` : ''}${showWallet ? ` <small class="wal" title="${escParents(this.localize('wallet'))}">· 🛍️ ${fmtParents(kid.wallet)}</small>` : ''}</div>
            </div>
          </div>
          ${kid.goal > 0 ? `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="fill" style="width:${pct}%"></div></div>` : ''}
          ${strict}
          <div class="quick">${quick}</div>
          <button class="praise-btn" data-action="praise-open" data-kid="${escParents(kid.id)}">❤️ ${escParents(this.localize('praise_btn'))}</button>
          <details class="hist" data-kid-history="${escParents(kid.id)}" ${this._open.has(kid.id) ? 'open' : ''}>
            <summary>${escParents(this.localize('history'))}</summary>
            ${entries.length ? entries.map(h => this._renderEntry(h)).join('') : `<div class="empty small">${escParents(this.localize('no_history'))}</div>`}
          </details>
        </article>`;
    }).join('');
    return `<section><h2>${escParents(this.localize('kids'))}</h2>
      <button class="adhoc-btn" data-action="adhoc-open">➕ ${escParents(this.localize('adhoc_btn'))}</button>
      <div class="kid-grid">${cards}</div></section>`;
  }

  _renderEntry(h) {
    const type = PARENTS_TYPE_ICONS[h.type] ? h.type : 'task';
    const points = parseFloat(h.points) || 0;
    const name = (type === 'bonus' || type === 'penalty' || type === 'praise') ? (h.reason || h.task_name) : h.task_name;
    const when = new Date(h.timestamp).toLocaleString((this._hass && this._hass.language) || undefined, { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `
      <div class="entry">
        <span class="e-icon" title="${escParents(this.localize('type_' + type))}">${PARENTS_TYPE_ICONS[type]}</span>
        <span class="e-main"><span class="e-name">${escParents(name)}</span>
          ${(type === 'task' || type === 'birthday' || type === 'skipped') && h.reason ? `<span class="e-reason">${escParents(h.reason)}</span>` : ''}
          <span class="e-when">${escParents(when)}</span>
          ${type === 'task' ? `<button class="undo" data-action="undo" data-id="${escParents(h.id)}">↩️ ${escParents(this.localize('undo'))}</button>` : ''}</span>
        <span class="e-pts ${points < 0 ? 'neg' : ''}">${type === 'praise' ? escParents(h.sticker || '') : type === 'missed' || type === 'skipped' ? '0' : points < 0 ? '−' + fmtParents(Math.abs(points)) : '+' + fmtParents(points)}</span>
      </div>`;
  }

  /** Dialogs live in their own layer so that data refreshes do not reset what is typed. */
  _renderLayer() {
    const layer = this.shadowRoot.getElementById('layer');
    if (!layer) return;
    if (this._confirm) {
      const p = this.pending[this._confirm];
      if (!p) { this._confirm = null; layer.innerHTML = ''; return; }
      const kid = this._kid(p.kid_id);
      const penalty = this._penalty(p.points);
      const days = this._strictDays();
      layer.innerHTML = `
        <div class="scrim" data-action="dialog-close"></div>
        <div class="dialog" role="alertdialog" aria-modal="true" style="--kc:${kid.color}">
          <h3>🚫 ${escParents(this.localize('cheat_title'))}</h3>
          <p>${escParents(kid.name)}: ${escParents(this.localize('cheat_text', { task: p.task_name }))}</p>
          <ul>
            ${penalty > 0 ? `<li>${escParents(this.localize('cheat_penalty', { n: penalty }))}</li>` : ''}
            ${days > 0 ? `<li>${escParents(this.localize('cheat_strict', { d: days }))}</li>` : ''}
          </ul>
          <div class="dialog-actions">
            <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
            <button class="btn danger solid" data-action="cheated-confirm">${escParents(this.localize('cheat_confirm'))}</button>
          </div>
        </div>`;
      return;
    }
    if (this._undo) {
      const h = this.history.find(x => x.id === this._undo);
      if (!h) { this._undo = null; layer.innerHTML = ''; return; }
      const kid = this._kid(h.user_id);
      layer.innerHTML = `
        <div class="scrim" data-action="dialog-close"></div>
        <div class="dialog" role="alertdialog" aria-modal="true" style="--kc:${kid.color}">
          <h3>↩️ ${escParents(this.localize('undo_title'))}</h3>
          <p>${escParents(kid.name)}: ${escParents(h.task_name)} (+${fmtParents(h.points)})</p>
          <p>${escParents(this.localize('undo_text'))}</p>
          <div class="dialog-actions">
            <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
            <button class="btn danger solid" data-action="undo-confirm">${escParents(this.localize('undo_confirm'))}</button>
          </div>
        </div>`;
      return;
    }
    if (this._praise) {
      layer.innerHTML = this._renderPraiseSheet();
      return;
    }
    if (this._rw) {
      layer.innerHTML = this._renderRewardsSheet();
      return;
    }
    if (this._adhoc) {
      layer.innerHTML = this._renderAdhocSheet();
      this._updateAdhocState();
      return;
    }
    if (this._sheet) {
      const s = this._sheet;
      const kid = this._kid(s.kidId);
      const positive = s.amount > 0;
      const chips = positive
        ? ['chip_helped', 'chip_great'] : ['chip_cheated', 'chip_agreement'];
      const n = Math.abs(s.amount);
      layer.innerHTML = `
        <div class="scrim" data-action="dialog-close"></div>
        <div class="sheet" role="dialog" aria-modal="true" style="--kc:${kid.color}">
          <div class="grab"></div>
          <h3>${this._avatar(kid)} ${escParents(this.localize(positive ? 'adjust_bonus' : 'adjust_penalty', { name: kid.name }))}</h3>
          <div class="amount ${positive ? 'plus' : 'minus'}">${positive ? '+' : '−'}${n}</div>
          <div class="chips">${chips.map(k => {
            const text = this.localize(k);
            return `<button class="chip ${s.reason === text ? 'on' : ''}" data-action="chip" data-text="${escParents(text)}">${escParents(text)}</button>`;
          }).join('')}</div>
          <input id="reason-input" type="text" maxlength="80" autocomplete="off" placeholder="${escParents(this.localize('reason_ph'))}"
                 aria-label="${escParents(this.localize('reason_lbl'))}" value="${escParents(s.reason)}">
          <div class="dialog-actions">
            <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
            <button class="btn ${positive ? 'ok' : 'danger'} solid" id="adjust-confirm" data-action="adjust-confirm" ${s.reason.trim() ? '' : 'disabled'}>
              ${escParents(this.localize(positive ? 'confirm_bonus' : 'confirm_penalty', { n }))}</button>
          </div>
        </div>`;
      return;
    }
    layer.innerHTML = '';
  }

  _styles() {
    return `
      :host { display: block; --p-ok: #2E7D32; --p-danger: #C62828; --p-line: var(--divider-color, #d6d6d6); --p-sub: var(--secondary-text-color, #666); }
      * { box-sizing: border-box; }
      ha-card { display: block; padding: 16px; }
      .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 22px; font-weight: 700; margin-bottom: 12px; color: var(--primary-text-color); }
      .head-title { min-width: 0; overflow-wrap: anywhere; }
      .help-btn { flex: none; min-height: 40px; padding: 0 14px; border-radius: 20px; border: 2px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); font-size: 14px; font-weight: 700; }
      .body { display: flex; flex-direction: column; gap: 20px; color: var(--primary-text-color); }
      h2 { margin: 0 0 10px; font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
      h3 { margin: 0 0 8px; font-size: 18px; display: flex; align-items: center; gap: 10px; }
      .count { min-width: 24px; height: 24px; padding: 0 8px; border-radius: 12px; background: var(--p-danger); color: #fff; font-size: 14px; display: inline-grid; place-items: center; }
      .note, .empty { padding: 16px; border-radius: 12px; background: var(--secondary-background-color, #f0f0f0); color: var(--p-sub); font-size: 15px; text-align: center; }
      .empty.small { padding: 8px; font-size: 13px; background: transparent; }
      button { font-family: inherit; cursor: pointer; touch-action: manipulation; }
      button:disabled { opacity: 0.5; cursor: default; }
      .avatar { flex: none; width: 44px; height: 44px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 26px; line-height: 1; background: color-mix(in srgb, var(--kc) 24%, var(--card-background-color, #fff)); border: 3px solid var(--kc); }

      .appr-list, .kid-grid { display: grid; gap: 12px; grid-template-columns: 1fr; }
      .appr { padding: 12px; border-radius: 14px; border: 1px solid var(--p-line); border-left: 6px solid var(--kc); background: var(--card-background-color, #fff); display: flex; flex-direction: column; gap: 12px; }
      .appr-top { display: flex; align-items: center; gap: 12px; }
      .appr-main { flex: 1; min-width: 0; }
      .appr-task { font-size: 17px; font-weight: 700; overflow-wrap: anywhere; }
      .appr-meta { font-size: 13px; color: var(--p-sub); margin-top: 2px; }
      .appr-pts { flex: none; font-size: 18px; font-weight: 800; }
      .appr-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .appr-actions .ok { grid-column: 1 / -1; }
      .appr-actions.two .ok { grid-column: auto; }
      .kid-pts .wal { font-weight: 700; color: var(--primary-text-color); }
      .rw-btn { margin: 12px 0 0; }
      .rw-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
      .rw-row { display: grid; grid-template-columns: 64px minmax(0, 1fr) 44px; gap: 8px; align-items: center; padding: 10px; border-radius: 12px; border: 1px solid var(--p-line); }
      .rw-row select, .rw-row input[type=text], .rw-row input[type=number] { min-height: 44px; border-radius: 10px; border: 2px solid var(--p-line); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color); font-size: 16px; font-family: inherit; padding: 0 8px; min-width: 0; }
      .rw-emoji { font-size: 22px; }
      .rw-meta { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; }
      .rw-f { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--p-sub); font-weight: 600; white-space: nowrap; }
      .rw-f input[type=number] { width: 84px; flex: none; }
      .rw-f input[type=checkbox] { width: 22px; height: 22px; }
      .rw-del { min-width: 44px; min-height: 44px; border-radius: 10px; border: 1px solid var(--p-line); background: transparent; font-size: 18px; }
      .btn { min-height: 48px; padding: 0 8px; border-radius: 12px; font-size: 15px; white-space: nowrap; font-weight: 700; border: 2px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); }
      .btn.ok { border-color: var(--p-ok); background: var(--p-ok); color: #fff; font-size: 18px; min-height: 52px; }
      .btn.danger { border-color: var(--p-danger); color: var(--p-danger); }
      .btn.danger.solid { background: var(--p-danger); color: #fff; }
      .btn.ok.solid { background: var(--p-ok); }
      .btn.neutral { color: var(--primary-text-color); }
      .btn:active:not(:disabled) { transform: scale(0.98); }

      .kid { padding: 12px; border-radius: 14px; border: 1px solid var(--p-line); border-left: 6px solid var(--kc); background: var(--card-background-color, #fff); display: flex; flex-direction: column; gap: 10px; }
      .kid-top { display: flex; align-items: center; gap: 12px; }
      .kid-main { flex: 1; min-width: 0; }
      .kid-name { font-size: 18px; font-weight: 700; }
      .kid-pts { font-size: 16px; font-weight: 700; }
      .kid-pts small { font-size: 13px; font-weight: 500; color: var(--p-sub); }
      .bar { height: 10px; border-radius: 5px; background: color-mix(in srgb, var(--kc) 20%, transparent); overflow: hidden; }
      .fill { height: 100%; background: var(--kc); border-radius: 5px; }
      .strict { font-size: 13px; font-weight: 600; color: var(--p-sub); padding: 6px 10px; border-radius: 10px; background: var(--secondary-background-color, #f0f0f0); }
      .quick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .qbtn { min-height: 48px; border-radius: 12px; font-size: 18px; font-weight: 800; border: 2px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); }
      .qbtn.plus { border-color: var(--p-ok); color: var(--p-ok); }
      .qbtn.minus { border-color: var(--p-danger); color: var(--p-danger); }
      .qbtn:active { transform: scale(0.96); }
      .praise-btn { min-height: 48px; border-radius: 12px; font-size: 16px; font-weight: 700; border: 2px solid #E91E63; color: #C2185B; background: color-mix(in srgb, #E91E63 8%, var(--card-background-color, #fff)); }
      .praise-btn:active { transform: scale(0.98); }
      .praise-big { font-size: 56px; line-height: 1.1; text-align: center; margin: 0 0 4px; }
      #praise-input { width: 100%; height: 48px; padding: 0 14px; border-radius: 12px; border: 2px solid var(--p-line); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color); font-size: 16px; font-family: inherit; margin-bottom: 4px; }
      .hist summary { cursor: pointer; font-size: 14px; font-weight: 600; color: var(--p-sub); min-height: 32px; display: flex; align-items: center; }
      .entry { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-top: 1px solid var(--p-line); font-size: 14px; }
      .e-icon { flex: none; width: 24px; text-align: center; }
      .e-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .e-name { overflow-wrap: anywhere; }
      .e-reason { font-size: 12px; color: var(--p-sub); overflow-wrap: anywhere; }
      .e-when { font-size: 12px; color: var(--p-sub); }
      .e-pts { flex: none; font-weight: 700; }
      .e-pts.neg { color: var(--p-danger); }

      .adhoc-btn { width: 100%; min-height: 52px; margin-bottom: 12px; border-radius: 12px; border: 2px dashed #F9A825; background: color-mix(in srgb, #F9A825 12%, var(--card-background-color, #fff)); color: var(--primary-text-color); font-size: 16px; font-weight: 700; }
      .undo { align-self: flex-start; margin-top: 4px; min-height: 36px; padding: 0 12px; border-radius: 18px; border: 1px solid var(--p-line); background: transparent; color: var(--primary-text-color); font-size: 13px; font-weight: 600; }
      .sheet.adhoc { max-height: 92vh; }
      .lbl { font-size: 13px; font-weight: 700; color: var(--p-sub); margin: 10px 0 6px; }
      .lbl.inline { margin: 0; font-size: 14px; }
      .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
      .stepper { display: flex; align-items: center; gap: 4px; }
      .stepper .val { min-width: 72px; text-align: center; font-size: 18px; font-weight: 800; }
      .step { width: 48px; height: 48px; border-radius: 24px; border: 2px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); font-size: 24px; font-weight: 700; }
      .chip.ico { min-width: 44px; padding: 0; font-size: 22px; }
      .chip.kidchip { display: inline-flex; align-items: center; gap: 8px; padding: 0 14px 0 4px; }
      .chip.kidchip .avatar { width: 34px; height: 34px; font-size: 20px; border-width: 2px; }
      .chips input.time, #adhoc-name { height: 48px; padding: 0 12px; border-radius: 12px; border: 2px solid var(--p-line); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color); font-size: 16px; font-family: inherit; }
      #adhoc-name { width: 100%; }
      .warn { font-size: 13px; font-weight: 600; color: var(--p-danger); margin: 6px 0 0; }
      .warn[hidden] { display: none; }
      .sheet.adhoc .chips { gap: 6px; margin-bottom: 4px; }
      .sheet.adhoc .chip { padding: 0 12px; }
      .sheet.adhoc .chip.ico { min-width: 44px; padding: 0; }
      .sheet.adhoc .dialog-actions { position: sticky; bottom: -16px; margin: 12px -16px -16px; padding: 12px 16px 16px; background: var(--card-background-color, #fff); border-top: 1px solid var(--p-line); }
      .sheet .dialog-actions { margin-top: 16px; }
      #layer .scrim { position: fixed; inset: 0; z-index: 900; background: rgba(0,0,0,0.5); }
      .dialog, .sheet { position: fixed; z-index: 901; background: var(--card-background-color, #fff); color: var(--primary-text-color); padding: 20px 16px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
      .dialog { left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(420px, calc(100vw - 32px)); border-radius: 16px; border-top: 6px solid var(--kc); }
      .dialog p { margin: 0 0 8px; font-size: 15px; }
      .dialog ul { margin: 0 0 12px; padding-left: 20px; font-size: 15px; font-weight: 600; }
      .sheet { left: 0; right: 0; bottom: 0; border-radius: 20px 20px 0 0; border-top: 6px solid var(--kc); max-height: 90vh; overflow: auto; }
      .grab { width: 40px; height: 4px; border-radius: 2px; background: var(--p-line); margin: -8px auto 12px; }
      .amount { font-size: 44px; font-weight: 900; text-align: center; margin: 0 0 8px; }
      .amount.plus { color: var(--p-ok); } .amount.minus { color: var(--p-danger); }
      .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
      .chip { min-height: 44px; padding: 0 16px; border-radius: 22px; border: 2px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); font-size: 15px; font-weight: 600; }
      .chip.on { border-color: var(--primary-color, #03a9f4); background: color-mix(in srgb, var(--primary-color, #03a9f4) 16%, transparent); }
      #reason-input { width: 100%; height: 48px; padding: 0 14px; border-radius: 12px; border: 2px solid var(--p-line); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color); font-size: 16px; font-family: inherit; margin-bottom: 14px; }
      .dialog-actions { display: flex; gap: 10px; justify-content: flex-end; }
      .dialog-actions .btn { flex: 1; }
      #toast { position: fixed; left: 50%; top: 16px; transform: translate(-50%, -20px); z-index: 1000; max-width: calc(100vw - 32px); padding: 12px 20px; border-radius: 24px; background: #263238; color: #fff; font-size: 15px; font-weight: 600; opacity: 0; pointer-events: none; transition: opacity 0.2s, transform 0.2s; }
      #toast.show { opacity: 1; transform: translate(-50%, 0); }

      @media (min-width: 600px) {
        ha-card { padding: 20px; }
        .appr-list { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
        .kid-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); align-items: start; }
        .sheet { left: 50%; right: auto; bottom: auto; top: 50%; transform: translate(-50%, -50%); width: min(460px, calc(100vw - 32px)); border-radius: 16px; }
        .grab { display: none; }
      }
      @media (prefers-reduced-motion: reduce) { #toast { transition: none; } .btn:active, .qbtn:active { transform: none; } }
    `;
  }
}

/** Editor for the TaskOrganizerParents card. */
class TaskOrganizerParentsEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  localize(key) { return TaskOrganizerParents._localize(this._hass, key); }

  _render() {
    if (!this._config || !this._hass) return;
    if (this._rendered) { this._updateUI(); return; }
    this.innerHTML = `
      <div class="card-config">
        <ha-input label="${this.localize('title_lbl')}" value="${escParents(this._config.title || this.localize('title'))}" configValue="title"></ha-input>
      </div>
      <style>.card-config ha-input { display: block; margin-bottom: 8px; }</style>`;
    this._rendered = true;
    this.querySelectorAll('ha-input').forEach(el => el.addEventListener('input', ev => this._valueChanged(ev)));
    this._updateUI();
  }

  _updateUI() {
    this.querySelectorAll('[configValue]').forEach(el => {
      const val = this._config[el.getAttribute('configValue')];
      if (val !== undefined) el.value = val;
    });
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    const key = ev.target.getAttribute('configValue');
    if (this._config[key] === ev.target.value) return;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: { ...this._config, [key]: ev.target.value } }, bubbles: true, composed: true
    }));
  }
}

customElements.define('task-organizer-parents-editor', TaskOrganizerParentsEditor);
customElements.define('task-organizer-parents', TaskOrganizerParents);
