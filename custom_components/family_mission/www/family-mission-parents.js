/**
 * FamilyMission Parents card.
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
    praise_c1: "Thanks for helping!", praise_c2: "You did that really well!", praise_c3: "I am proud of you!", praise_c4: "Great how you stuck with it!",
    tab_today: "Today", tab_kids: "Kids", tab_more: "More", kids_today: "Kids today",
    own_tasks: "My tasks", pt_planning: "Planning", pt_minutes: "~{n} min.", pt_since: "since {day}",
    pt_done: "Done", pt_asked: "Asked: {name}", pt_ask: "Can you?", pt_none: "No parent tasks yet. Set them up once, then just tick them off.",
    pt_setup: "Set up parent tasks", pt_incoming: "{name} asks: Can you do \"{task}\"?", ho_yes: "I will", ho_no: "Can't",
    pt_all_done: "Nothing left for you today.", pt_partner: "With {name} today ({n})", pt_other: "the others", pt_done_today: "Done today ({n})",
    skip_btn: "Skip", skip_all: "Skip everything today", skip_title: "{name}: skip today", skip_none: "No open tasks today.",
    kid_today: "Today: {done} of {total} done", kid_no_tasks: "No tasks for today.",
    st_open: "open", st_waiting: "awaiting approval", st_done: "done", for_kid: "Do it for {name}",
    m_ptasks: "Parent tasks", m_ptasks_d: "Who does what, planning, duration", m_tasks: "Tasks", m_tasks_d: "Kids' tasks and templates",
    m_shop: "Shop", m_shop_d: "Redemptions and rewards", m_settings: "Settings", m_settings_d: "Kids, points, notifications",
    m_help: "Help", m_help_d: "How everything works", embed_missing: "This part is not available. Reload the page.",
    mode_me: "Me", mode_you: "You", mode_alt: "Alternating", pt_minutes_lbl: "Minutes", pt_from_templates: "From templates", pt_own: "Own task",
    pick_kid: "For whom?", picker_apply: "Apply", picker_missing: "The template list could not be loaded.",
    own_title: "Own parent task", own_name: "Name", own_name_ph: "e.g. Water the plants", own_interval: "Repeats", own_planning: "Planning task", own_who: "Who does it?", own_create: "Add",
    int_0: "once", int_1: "daily", int_2: "every 2 days", int_7: "weekly", int_14: "every 2 weeks", int_30: "monthly", int_91: "quarterly", int_182: "every 6 months", int_365: "yearly",
    toast_pt_done: "Done", toast_asked: "Asked", toast_ho_yes: "Great, it is yours", toast_ho_no: "Answered", toast_pt_saved: "Saved", toast_pt_deleted: "Deleted",
    toast_skipped: "Skipped for today", toast_applied: "Parent tasks saved", toast_kid_done: "Done",
    del_title: "Delete task?", del_text: "\"{task}\" is removed for good.", del_confirm: "Yes, delete",
    undo_text_parent: "The task is open again."
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
    praise_c1: "Danke fürs Helfen!", praise_c2: "Das hast du super gemacht!", praise_c3: "Ich bin stolz auf dich!", praise_c4: "Toll, wie du drangeblieben bist!",
    tab_today: "Heute", tab_kids: "Kinder", tab_more: "Mehr", kids_today: "Kinder heute",
    own_tasks: "Meine Aufgaben", pt_planning: "Planung", pt_minutes: "~{n} Min.", pt_since: "seit {day}",
    pt_done: "Erledigt", pt_asked: "Gefragt: {name}", pt_ask: "Kannst du?", pt_none: "Noch keine Eltern-Aufgaben. Einmal einrichten, danach nur abhaken.",
    pt_setup: "Eltern-Aufgaben einrichten", pt_incoming: "{name} fragt: Kannst du „{task}“?", ho_yes: "Mach ich", ho_no: "Geht nicht",
    pt_all_done: "Heute ist nichts mehr offen.", pt_partner: "Bei {name} heute ({n})", pt_other: "den anderen", pt_done_today: "Heute erledigt ({n})",
    skip_btn: "Aussetzen", skip_all: "Heute alles aussetzen", skip_title: "{name}: heute aussetzen", skip_none: "Heute ist nichts offen.",
    kid_today: "Heute: {done} von {total} erledigt", kid_no_tasks: "Keine Aufgaben für heute.",
    st_open: "offen", st_waiting: "wartet auf Freigabe", st_done: "erledigt", for_kid: "Für {name} erledigen",
    m_ptasks: "Eltern-Aufgaben", m_ptasks_d: "Wer macht was, Planung, Dauer", m_tasks: "Aufgaben", m_tasks_d: "Kinder-Aufgaben und Vorlagen",
    m_shop: "Shop", m_shop_d: "Einlösungen und Belohnungen", m_settings: "Einstellungen", m_settings_d: "Kinder, Punkte, Benachrichtigungen",
    m_help: "Hilfe", m_help_d: "So funktioniert alles", embed_missing: "Dieser Bereich ist nicht verfügbar. Bitte die Seite neu laden.",
    mode_me: "Ich", mode_you: "Du", mode_alt: "Abwechselnd", pt_minutes_lbl: "Minuten", pt_from_templates: "Aus Vorlagen", pt_own: "Eigene Aufgabe",
    pick_kid: "Für wen?", picker_apply: "Übernehmen", picker_missing: "Die Vorlagenliste konnte nicht geladen werden.",
    own_title: "Eigene Eltern-Aufgabe", own_name: "Name", own_name_ph: "z. B. Pflanzen gießen", own_interval: "Wiederholung", own_planning: "Planungsaufgabe", own_who: "Wer macht es?", own_create: "Hinzufügen",
    int_0: "einmalig", int_1: "täglich", int_2: "alle 2 Tage", int_7: "wöchentlich", int_14: "alle 2 Wochen", int_30: "monatlich", int_91: "vierteljährlich", int_182: "halbjährlich", int_365: "jährlich",
    toast_pt_done: "Erledigt", toast_asked: "Nachgefragt", toast_ho_yes: "Super, die Aufgabe gehört dir", toast_ho_no: "Antwort gesendet", toast_pt_saved: "Gespeichert", toast_pt_deleted: "Gelöscht",
    toast_skipped: "Für heute ausgesetzt", toast_applied: "Eltern-Aufgaben gespeichert", toast_kid_done: "Erledigt",
    del_title: "Aufgabe löschen?", del_text: "„{task}“ wird endgültig entfernt.", del_confirm: "Ja, löschen",
    undo_text_parent: "Die Aufgabe ist wieder offen."
  }
};

const PARENTS_TAB_KEY = 'family_mission_parents_tab';
const PARENTS_REWARD_EMOJIS = ['📺', '🍨', '🎲', '🌙', '🎟️', '🎮', '🍕', '🎁', '🚲', '📚', '🧸', '🎬', '🏊', '⚽'];
const PARENTS_REWARD_SUGGESTIONS = {
  de: [['📺', '15 Minuten Medienzeit', 15], ['🍨', 'Nachtisch aussuchen', 20], ['🎲', 'Spieleabend bestimmen', 60],
       ['🌙', '30 Minuten später ins Bett', 80], ['🎟️', 'Ausflug mit Mama oder Papa allein', 200]],
  en: [['📺', '15 minutes of screen time', 15], ['🍨', 'Pick the dessert', 20], ['🎲', 'Choose game night', 60],
       ['🌙', 'Stay up 30 minutes later', 80], ['🎟️', 'Outing alone with mom or dad', 200]]
};

window.customCards = window.customCards || [];
window.customCards.push({
  type: "family-mission-parents",
  name: "FamilyMission Parents",
  description: "Parents' hub for phones: today's tasks of both parents, kids at a glance, approvals, praise and bonus, parent task setup, shop and settings.",
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

class FamilyMissionParents extends HTMLElement {
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
    this.tasks = {};
    this.adults = [];
    this.me = null;
    this.partner = null;
    this._tab = 'today';
    try {
      const saved = localStorage.getItem(PARENTS_TAB_KEY);
      if (['today', 'kids', 'more'].includes(saved)) this._tab = saved;
    } catch (err) { /* storage may be unavailable */ }
    this._more = null;            // sub view of the tab "More"
    this._kidSel = null;          // kid shown in the tab "Kids"
    this._embeds = {};            // embedded cards { tasks, settings }
    this._pickKid = null;         // kid chooser purpose: 'praise' | 'skip'
    this._skip = null;            // skip sheet { kidId }
    this._own = null;             // own parent task sheet
    this._del = null;             // parent task id to delete
    this._picker = null;          // <family-mission-parents-picker> element while its sheet is open
    this._toastTimer = null;
    this.shadowRoot.innerHTML = `<style>${this._styles()}</style><div id="app"></div><div id="embed"><div id="embed-tasks" hidden></div><div id="embed-settings" hidden></div></div><div id="layer"></div><div id="toast" role="status" aria-live="polite"></div>`;
    this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener('input', (ev) => this._onInput(ev));
    this.shadowRoot.addEventListener('toggle', (ev) => this._onToggle(ev), true);
    this.shadowRoot.addEventListener('change', (ev) => this._onChange(ev));
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

  localize(key, replace = null) { return FamilyMissionParents._localize(this._hass, key, replace); }

  static participantId(entityId, state) {
    return (state && state.attributes && state.attributes.user_id) || entityId;
  }

  static getLayoutOptions() { return { grid_columns: 12, grid_rows: "auto", grid_min_columns: 6 }; }

  getCardSize() { return 8; }

  static getStubConfig(hass) {
    return { type: "custom:family-mission-parents", title: this._localize(hass, 'title') };
  }

  static getConfigElement() { return document.createElement("family-mission-parents-editor"); }

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
    const names = ["family_mission_updated", "family_mission_handover_requested", "family_mission_handover_resolved"];
    this._unsubEvents = Promise.all(names.map(name =>
      Promise.resolve(this._hass.connection.subscribeEvents(() => this._fetchData(), name)).catch((err) => { console.warn("FamilyMission Parents: subscribe failed", name, err); return null; })
    )).then(unsubs => () => unsubs.forEach(u => { if (typeof u === 'function') u(); }));
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
    for (const el of Object.values(this._embeds)) el.hass = hass;
  }

  /** True for the roles admin, manager and parent (role comes from get_data, the backend enforces it). */
  _isParent() {
    if (this._hass && this._hass.user && this._hass.user.is_admin) return true;
    return ['admin', 'manager', 'parent'].includes(this._myRole);
  }

  _fetchData() {
    if (!this._hass) return;
    this._hass.callWS({ type: 'family_mission/get_data' }).then((data) => {
      this._myRole = data.my_role || null;
      this.pending = data.pending || {};
      this.history = Array.isArray(data.history) ? data.history : [];
      this.points = data.points || {};
      this.settings = data.settings || {};
      this.wallet = data.wallet || {};
      this.redemptions = data.redemptions || {};
      this.tasks = data.tasks || {};
      this.adults = Array.isArray(data.adults) ? data.adults : [];
      this.me = data.me || null;
      this.partner = data.partner || null;
      this._fetched = true;
      this._render();
      if (this._skip || this._pickKid) this._renderLayer();
    }).catch((err) => console.error("FamilyMission Parents: could not load data", err));
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
      map[FamilyMissionParents.participantId(entityId, state)] = {
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
    if (!el || !el.dataset) return;
    if (el.dataset.det !== undefined) {
      if (el.open) this._open.add('det:' + el.dataset.det); else this._open.delete('det:' + el.dataset.det);
      return;
    }
    if (el.dataset.kidHistory === undefined) return;
    if (el.open) this._open.add(el.dataset.kidHistory); else this._open.delete(el.dataset.kidHistory);
  }

  _onChange(ev) {
    const el = ev.target;
    if (!el || !el.dataset) return;
    if (el.dataset.ptMin !== undefined) {
      const n = parseInt(el.value);
      if (n >= 1 && n <= 600) this._ptSet(el.dataset.ptMin, { minutes: n });
      else this._render();
    } else if (el.id === 'own-int' && this._own) this._own.interval = parseInt(el.value);
    else if (el.id === 'own-plan' && this._own) this._own.planning = el.checked;
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
    } else if (el.id === 'own-name' && this._own) {
      this._own.name = el.value;
      const btn = this.shadowRoot.getElementById('own-create');
      if (btn) btn.disabled = !el.value.trim();
    } else if (el.id === 'own-min' && this._own) {
      this._own.minutes = el.value;
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
    else if (action === 'dialog-close') { this._confirm = null; this._sheet = null; this._undo = null; this._adhoc = null; this._rw = null; this._praise = null; this._pickKid = null; this._skip = null; this._own = null; this._del = null; this._picker = null; this._renderLayer(); }
    else if (action === 'tab') this._setTab(el.dataset.tab);
    else if (action === 'goto-kid') { this._kidSel = el.dataset.kid; this._setTab('kids'); }
    else if (action === 'kid-select') { this._kidSel = el.dataset.kid; this._render(); }
    else if (action === 'more-open') { this._more = el.dataset.sub; this._render(); }
    else if (action === 'more-back') { this._more = null; this._render(); }
    else if (action === 'pt-done') this._ptDone(el.dataset.id);
    else if (action === 'pt-ask') this._ptAsk(el.dataset.id);
    else if (action === 'ho-yes') this._hoAnswer(el.dataset.id, true);
    else if (action === 'ho-no') this._hoAnswer(el.dataset.id, false);
    else if (action === 'pt-plan') { const t = this._task(el.dataset.id); if (t) this._ptSet(t.id, { planning: !t.planning }); }
    else if (action === 'pt-mode') { if (this._ptMode(this._task(el.dataset.id) || {}) !== el.dataset.mode) this._ptSet(el.dataset.id, { mode: el.dataset.mode }); }
    else if (action === 'pt-del') { this._del = el.dataset.id; this._renderLayer(); }
    else if (action === 'pt-del-confirm') this._ptDelete();
    else if (action === 'pt-picker') this._openPicker();
    else if (action === 'picker-apply') this._applyPicker();
    else if (action === 'pt-new') this._openOwn();
    else if (action === 'own-mode' && this._own) { this._own.mode = el.dataset.mode; this._renderLayer(); }
    else if (action === 'own-create') this._submitOwn();
    else if (action === 'kt-done') this._ktDone(el.dataset.id, el.dataset.kid);
    else if (action === 'kt-skip') this._ktSkip(el.dataset.id);
    else if (action === 'skip-all') this._skipAll(el.dataset.kid);
    else if (action === 'praise-pick') this._pickKidFor('praise');
    else if (action === 'skip-pick') this._pickKidFor('skip');
    else if (action === 'pick-kid') this._kidChosen(this._pickKid, el.dataset.kid);
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
    else if (action === 'help') { if (window.FamilyMissionHelp) window.FamilyMissionHelp.open(this._hass, el.dataset.anchor); }
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
      const res = await this._hass.callWS({ type: 'family_mission/redemption_resolve', redemption_id: id, approve });
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
      await this._hass.callWS({ type: 'family_mission/set_rewards', rewards: rewards.map(r => { const c = { ...r }; if (!c.id) delete c.id; return c; }) });
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

  async _approve(pendingId) {
    if (this._busy.has(pendingId)) return;
    const rec = this.pending[pendingId];
    this._busy.add(pendingId);
    this._render();
    try {
      const res = await this._hass.callWS({ type: 'family_mission/approve', pending_id: pendingId });
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
      const res = await this._hass.callWS({ type: 'family_mission/reject', pending_id: pendingId, mode });
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
        type: 'family_mission/adjust_points', kid_id: sheet.kidId, points: sheet.amount, reason: sheet.reason.trim().slice(0, 80)
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
      const res = await this._hass.callWS({ type: 'family_mission/undo_completion', history_id: id });
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
      await this._hass.callWS({ type: 'family_mission/send_praise', kid_id: pr.kidId, sticker: pr.sticker, message: pr.message.trim().slice(0, 120) });
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
    const payload = { type: 'family_mission/add_adhoc_bonus', name: a.name.trim(), icon: a.icon, points: a.points, min_age: a.minAge };
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

  // ---------------------------------------------------------------------------
  // Parent tasks / today's data
  // ---------------------------------------------------------------------------

  /** Local date key (YYYY-MM-DD) of a date/datetime string; date-only strings are kept. */
  _dateKey(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  _todayKey() { return this._dateKey(new Date().toISOString()); }

  /** Task is due or overdue today and not paused (same rule as the backend). */
  _isOpen(task) {
    const today = this._todayKey();
    const paused = this._dateKey(task.paused_until);
    if (paused && today <= paused) return false;
    const due = this._dateKey(task.due_date);
    return !!due && due <= today;
  }

  _taskList() {
    return Object.entries(this.tasks || {}).map(([id, t]) => ({ ...t, id: t.id || id }));
  }

  _parentTasksAll() {
    return this._taskList().filter(t => t.parent_task)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), (this._hass && this._hass.language) || undefined));
  }

  _parentTasksToday() {
    return this._parentTasksAll().filter(t => this._isOpen(t));
  }

  _parentDoneToday() {
    const today = this._todayKey();
    return this.history.filter(h => h.type === 'parent' && this._dateKey(h.timestamp) === today);
  }

  _incomingHandovers() {
    if (!this.me) return [];
    return this._parentTasksAll().filter(t => t.handover && t.handover.state === 'asked' && t.handover.to === this.me);
  }

  _adultName(uid) {
    const a = (this.adults || []).find(x => x.id === uid);
    if (a && a.name) return a.name;
    return (this._persons()[uid] || {}).name || uid || '';
  }

  /** Today's tasks of one kid: open ones, waiting for approval and done today. */
  _kidToday(kid) {
    const today = this._todayKey();
    const open = this._taskList().filter(t => !t.parent_task && (t.assignees || []).includes(kid.id) && this._isOpen(t))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const done = this.history.filter(h => h.type === 'task' && h.user_id === kid.id && this._dateKey(h.timestamp) === today);
    const waiting = this._pendingList().filter(p => p.kid_id === kid.id);
    return { open, done, waiting, total: open.length + done.length + waiting.length };
  }

  /** Runs one websocket call with busy handling and a toast; returns the result or null. */
  async _call(busyKey, payload, okMessage) {
    if (this._busy.has(busyKey)) return null;
    this._busy.add(busyKey);
    this._render();
    let res = null;
    try {
      res = await this._hass.callWS(payload);
      if (res && res.success === false) this._toast(this.localize('toast_gone'));
      else if (okMessage) this._toast(okMessage);
    } catch (err) {
      res = null;
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
    }
    this._busy.delete(busyKey);
    this._fetchData();
    return res;
  }

  _setTab(tab) {
    this._tab = tab;
    if (tab !== 'more') this._more = null;
    try { localStorage.setItem(PARENTS_TAB_KEY, tab); } catch (err) { /* storage may be unavailable */ }
    this._render();
  }

  _task(id) { return this._taskList().find(t => t.id === id) || null; }

  _ptDone(id) { return this._call('pt:' + id, { type: 'family_mission/parent_task_done', task_id: id }, this.localize('toast_pt_done')); }

  _ptAsk(id) { return this._call('pt:' + id, { type: 'family_mission/handover_ask', task_id: id }, this.localize('toast_asked')); }

  _hoAnswer(id, accept) {
    return this._call('ho:' + id, { type: 'family_mission/handover_answer', task_id: id, accept }, this.localize(accept ? 'toast_ho_yes' : 'toast_ho_no'));
  }

  _ptSet(id, fields, message) {
    const payload = { type: 'family_mission/parent_task_set', task_id: id, ...fields };
    if (fields.mode && this.me) payload.me = this.me;
    return this._call('pt:' + id, payload, message || this.localize('toast_pt_saved'));
  }

  async _ptDelete() {
    const id = this._del;
    this._del = null;
    this._renderLayer();
    if (!id) return;
    await this._call('pt:' + id, { type: 'family_mission/delete_task', task_id: id }, this.localize('toast_pt_deleted'));
  }

  _ktDone(taskId, kidId) {
    return this._call('kt:' + taskId, { type: 'family_mission/parent_complete_for', task_id: taskId, kid_id: kidId }, this.localize('toast_kid_done'));
  }

  _ktSkip(taskId) {
    return this._call('kt:' + taskId, { type: 'family_mission/parent_task_action', task_id: taskId, action: 'skip_today' }, this.localize('toast_skipped'));
  }

  /** Skips every open task of a kid for today, one call per task. */
  async _skipAll(kidId) {
    if (this._busy.has('skip-all')) return;
    const tasks = this._kidToday(this._kid(kidId)).open;
    if (!tasks.length) return;
    this._busy.add('skip-all');
    this._render();
    let failed = false;
    for (const task of tasks) {
      try {
        await this._hass.callWS({ type: 'family_mission/parent_task_action', task_id: task.id, action: 'skip_today' });
      } catch (err) {
        failed = true;
        this._toast(this.localize('err') + (err && err.message ? err.message : ''));
        break;
      }
    }
    if (!failed) this._toast(this.localize('toast_skipped'));
    this._busy.delete('skip-all');
    this._skip = null;
    this._renderLayer();
    this._fetchData();
  }

  /** Kid chooser for praise / skip: a single kid is picked directly. */
  _pickKidFor(purpose) {
    const kids = this._kids();
    if (kids.length === 1) { this._kidChosen(purpose, kids[0].id); return; }
    this._pickKid = purpose;
    this._renderLayer();
  }

  _kidChosen(purpose, kidId) {
    this._pickKid = null;
    if (purpose === 'praise') this._praise = { kidId, sticker: '❤️', message: '' };
    else this._skip = { kidId };
    this._renderLayer();
  }

  // ---- own parent task sheet ---------------------------------------------------

  _openOwn() {
    this._own = { name: '', minutes: 20, interval: 7, planning: false, mode: 'me' };
    this._renderLayer();
    const input = this.shadowRoot.getElementById('own-name');
    if (input) input.focus();
  }

  async _submitOwn() {
    const o = this._own;
    if (!o || !o.name.trim()) return;
    const payload = { type: 'family_mission/parent_task_add', name: o.name.trim().slice(0, 60), planning: !!o.planning, interval: o.interval, mode: this.partner ? o.mode : 'me' };
    const minutes = parseInt(o.minutes);
    if (minutes >= 1 && minutes <= 600) payload.minutes = minutes;
    if (this.me) payload.me = this.me;
    this._own = null;
    this._renderLayer();
    await this._call('own', payload, this.localize('toast_pt_saved'));
  }

  // ---- template picker (from family-mission-wizard.js) -------------------------

  async _openPicker() {
    if (this._busy.has('picker-load')) return;
    this._busy.add('picker-load');
    try {
      if (!customElements.get('family-mission-parents-picker')) await import('/family_mission_frontend/family-mission-wizard.js');
    } catch (err) {
      console.warn('FamilyMission Parents: picker could not be loaded', err);
    }
    this._busy.delete('picker-load');
    if (!customElements.get('family-mission-parents-picker')) { this._toast(this.localize('picker_missing')); return; }
    const el = document.createElement('family-mission-parents-picker');
    el.hass = this._hass;
    el.addEventListener('fm-parents-applied', () => {
      if (this._picker !== el) return;
      this._picker = null;
      this._renderLayer();
      this._fetchData();
    });
    this._picker = el;
    this._renderLayer();
  }

  async _applyPicker() {
    const el = this._picker;
    if (!el || this._busy.has('picker')) return;
    this._busy.add('picker');
    const btn = this.shadowRoot.getElementById('picker-apply');
    if (btn) btn.disabled = true;
    try {
      const res = await el.apply();
      if (res && res.success === false) this._toast(this.localize('toast_gone'));
      else this._toast(this.localize('toast_applied'));
      if (this._picker === el) { this._picker = null; this._renderLayer(); }
    } catch (err) {
      this._toast(this.localize('err') + (err && err.message ? err.message : ''));
      if (btn) btn.disabled = false;
    }
    this._busy.delete('picker');
    this._fetchData();
  }

  // ---- sheets of the layer -----------------------------------------------------

  _renderPickKidSheet() {
    const chips = this._kids().map(k =>
      `<button class="chip kidchip" style="--kc:${k.color}" data-action="pick-kid" data-kid="${escParents(k.id)}">${this._avatar(k)} ${escParents(k.name)}</button>`).join('');
    return `
      <div class="scrim" data-action="dialog-close"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${escParents(this.localize('pick_kid'))}" style="--kc:#F9A825">
        <div class="grab"></div>
        <h3>${escParents(this.localize('pick_kid'))}</h3>
        <div class="chips">${chips}</div>
        <div class="dialog-actions"><button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button></div>
      </div>`;
  }

  _renderSkipSheet() {
    const kid = this._kid(this._skip.kidId);
    const open = this._kidToday(kid).open;
    const rows = open.map(t => `
      <button class="skip-row" data-action="kt-skip" data-id="${escParents(t.id)}" ${this._busy.has('kt:' + t.id) ? 'disabled' : ''}>
        <span>${escParents(t.name)}</span><span class="skip-go">⏸️ ${escParents(this.localize('skip_btn'))}</span>
      </button>`).join('');
    return `
      <div class="scrim" data-action="dialog-close"></div>
      <div class="sheet adhoc" role="dialog" aria-modal="true" aria-label="${escParents(this.localize('skip_title', { name: kid.name }))}" style="--kc:${kid.color}">
        <div class="grab"></div>
        <h3>${this._avatar(kid)} ${escParents(this.localize('skip_title', { name: kid.name }))}</h3>
        ${rows || `<div class="empty small">${escParents(this.localize('skip_none'))}</div>`}
        <div class="dialog-actions">
          <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
          ${open.length ? `<button class="btn danger solid" data-action="skip-all" data-kid="${escParents(kid.id)}" ${this._busy.has('skip-all') ? 'disabled' : ''}>${escParents(this.localize('skip_all'))}</button>` : ''}
        </div>
      </div>`;
  }

  _renderOwnSheet() {
    const o = this._own;
    const intervals = [0, 1, 2, 7, 14, 30, 91, 182, 365].map(n =>
      `<option value="${n}" ${o.interval === n ? 'selected' : ''}>${escParents(this.localize('int_' + n))}</option>`).join('');
    return `
      <div class="scrim" data-action="dialog-close"></div>
      <div class="sheet adhoc" role="dialog" aria-modal="true" aria-label="${escParents(this.localize('own_title'))}" style="--kc:#7E57C2">
        <div class="grab"></div>
        <h3>➕ ${escParents(this.localize('own_title'))}</h3>
        <label class="lbl" for="own-name">${escParents(this.localize('own_name'))}</label>
        <input id="own-name" class="txt" type="text" maxlength="60" autocomplete="off" placeholder="${escParents(this.localize('own_name_ph'))}" value="${escParents(o.name)}">
        <div class="row">
          <label class="lbl inline" for="own-min">${escParents(this.localize('adhoc_minutes'))}</label>
          <span class="inl"><input id="own-min" class="txt num" type="number" min="1" max="600" inputmode="numeric" value="${escParents(o.minutes)}"> ${escParents(this.localize('adhoc_min_unit'))}</span>
        </div>
        <div class="row">
          <label class="lbl inline" for="own-int">${escParents(this.localize('own_interval'))}</label>
          <select id="own-int" class="txt">${intervals}</select>
        </div>
        <div class="row">
          <label class="lbl inline" for="own-plan">🧠 ${escParents(this.localize('own_planning'))}</label>
          <input id="own-plan" type="checkbox" class="chk" ${o.planning ? 'checked' : ''}>
        </div>
        ${this.partner ? `<div class="lbl">${escParents(this.localize('own_who'))}</div>${this._modeSegment(o.mode, 'data-action="own-mode"')}` : ''}
        <div class="dialog-actions">
          <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
          <button class="btn ok solid" id="own-create" data-action="own-create" ${o.name.trim() ? '' : 'disabled'}>${escParents(this.localize('own_create'))}</button>
        </div>
      </div>`;
  }

  _renderPickerSheet() {
    return `
      <div class="scrim" data-action="dialog-close"></div>
      <div class="sheet adhoc" role="dialog" aria-modal="true" aria-label="${escParents(this.localize('pt_from_templates'))}" style="--kc:#7E57C2">
        <div class="grab"></div>
        <h3>🧩 ${escParents(this.localize('pt_from_templates'))}</h3>
        <div id="picker-host"></div>
        <div class="dialog-actions">
          <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
          <button class="btn ok solid" id="picker-apply" data-action="picker-apply">${escParents(this.localize('picker_apply'))}</button>
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
    let tabs = '';
    let embedKey = null;
    if (!this._isParent() && this._fetched) {
      body = `<div class="note">🔒 ${escParents(this.localize('only_parents'))}</div>`;
    } else if (!this._fetched) {
      body = `<div class="note">${escParents(this.localize('loading'))}</div>`;
    } else {
      if (!this._canManage() && this._more === 'settings') this._more = null;
      const waiting = this._pendingList().length + this._pendingRedemptions().length;
      tabs = '<div class="tabs" role="tablist">' + [['today', 'tab_today'], ['kids', 'tab_kids'], ['more', 'tab_more']].map(([id, key]) =>
        `<button class="tab ${this._tab === id ? 'on' : ''}" role="tab" aria-selected="${this._tab === id}" data-action="tab" data-tab="${id}">${escParents(this.localize(key))}${id === 'today' && waiting ? ` <span class="count sm">${waiting}</span>` : ''}</button>`).join('') + '</div>';
      if (this._tab === 'kids') body = this._renderKidsTab();
      else if (this._tab === 'more') {
        body = this._renderMore();
        if (this._more === 'tasks' || this._more === 'settings') embedKey = this._more;
      } else body = this._renderToday();
    }
    app.innerHTML = `<ha-card><div class="head"><span class="head-title">${title}</span>${window.FamilyMissionHelp ? `<button class="help-btn" data-action="help" data-anchor="parents">❓ ${escParents(this.localize('help_btn'))}</button>` : ''}</div>${tabs}<div class="body">${body}</div></ha-card>`;
    this._syncEmbed(embedKey);
    // The dialog layer is not rebuilt on data refreshes (it would reset what is typed);
    // it only closes when its approval was handled elsewhere in the meantime.
    if (this._confirm && !this.pending[this._confirm]) {
      this._confirm = null;
      this._renderLayer();
    }
  }

  /** Shows one of the embedded cards (created once, kept alive between renders) or none. */
  _syncEmbed(key) {
    for (const k of ['tasks', 'settings']) {
      const host = this.shadowRoot.getElementById('embed-' + k);
      if (!host) continue;
      if (k === key && !this._embeds[k]) {
        const tag = k === 'tasks' ? 'family-mission-card' : 'family-mission-settings';
        if (customElements.get(tag)) {
          const el = document.createElement(tag);
          // Options of the embedded card come from `tasks_card:` / `settings_card:` of this card's config
          const extra = this._config[k === 'tasks' ? 'tasks_card' : 'settings_card'];
          const cfg = Object.assign({}, extra && typeof extra === 'object' ? extra : {}, { type: 'custom:' + tag });
          try { el.setConfig(cfg); } catch (err) { console.warn('FamilyMission Parents: embedded card config failed', err); }
          el.hass = this._hass;
          host.appendChild(el);
          this._embeds[k] = el;
        }
      }
      host.hidden = k !== key;
    }
  }

  /** Whether the embedded card for ``key`` can be created. */
  _embedAvailable(key) {
    return !!this._embeds[key] || !!customElements.get(key === 'tasks' ? 'family-mission-card' : 'family-mission-settings');
  }

  _avatar(kid) {
    return `<span class="avatar" style="--kc:${kid.color}" aria-hidden="true">${escParents(kid.avatar)}</span>`;
  }

  // ---- tab "Heute" -------------------------------------------------------------

  _renderToday() {
    return `${this._renderKidStatus()}${this._renderWaiting()}${this._renderOwnTasks()}${this._renderQuick()}`;
  }

  /** One compact row per kid: today's progress, wallet and open approvals. */
  _renderKidStatus() {
    const kids = this._kids();
    if (!kids.length) return '';
    const showWallet = this._showWallet();
    const rows = kids.map(kid => {
      const t = this._kidToday(kid);
      const pct = t.total ? Math.round(t.done.length / t.total * 100) : 0;
      const waiting = this._pendingList().filter(p => p.kid_id === kid.id).length;
      return `
        <button class="krow" style="--kc:${kid.color}" data-action="goto-kid" data-kid="${escParents(kid.id)}">
          ${this._avatar(kid)}
          <span class="krow-main">
            <span class="krow-name">${escParents(kid.name)}</span>
            <span class="krow-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span class="fill" style="width:${pct}%"></span></span>
          </span>
          <span class="krow-side">
            <span class="krow-cnt">${t.done.length}/${t.total}</span>
            <span class="krow-pts">⭐ ${fmtParents(showWallet ? kid.wallet : kid.points)}</span>
          </span>
          ${waiting ? `<span class="count sm" title="${escParents(this.localize('approvals'))}">${waiting}</span>` : ''}
        </button>`;
    }).join('');
    return `<section><h2>${escParents(this.localize('kids_today'))}</h2><div class="krows">${rows}</div></section>`;
  }

  _showWallet() {
    return ((this.settings && this.settings.rewards) || []).length > 0 || Object.keys(this.wallet || {}).length > 0;
  }

  /** Approvals of kids and reward redemptions - only rendered when something waits. */
  _renderWaiting() {
    const items = this._approvalItems() + this._redemptionItems();
    if (!items) return '';
    const n = this._pendingList().length + this._pendingRedemptions().length;
    return `<section><h2>${escParents(this.localize('approvals'))} <span class="count">${n}</span></h2><div class="appr-list">${items}</div></section>`;
  }

  _approvalItems() {
    return this._pendingList().map(p => {
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
  }

  _redemptionItems() {
    return this._pendingRedemptions().map(r => {
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
  }

  /** "~20 Min.", the planning badge and the quiet carried-over hint of a parent task. */
  _parentBadges(t) {
    const out = [];
    if (t.planning) out.push(`<span class="badge plan" title="${escParents(this.localize('pt_planning'))}">🧠 ${escParents(this.localize('pt_planning'))}</span>`);
    if (t.minutes) out.push(`<span class="badge">${escParents(this.localize('pt_minutes', { n: t.minutes }))}</span>`);
    if (t.carried_since) out.push(`<span class="badge carried">↷ ${escParents(this.localize('pt_since', { day: this._dayLabel(t.carried_since) }))}</span>`);
    return out.length ? `<div class="badges">${out.join('')}</div>` : '';
  }

  /** Short weekday for the last days, otherwise the date. */
  _dayLabel(isoDate) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate || '');
    if (!m) return isoDate || '';
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    const lang = (this._hass && this._hass.language) || undefined;
    const days = Math.round((new Date().setHours(0, 0, 0, 0) - d.getTime()) / 86400000);
    return days < 7 ? d.toLocaleDateString(lang, { weekday: 'short' }) : d.toLocaleDateString(lang, { day: 'numeric', month: 'numeric' });
  }

  /** A parent task with the big tick button; ``mine`` adds the "Kannst du?" button. */
  _renderParentTask(t, mine) {
    const busy = this._busy.has('pt:' + t.id) ? 'disabled' : '';
    const h = t.handover;
    const asked = !!(h && h.state === 'asked' && mine && h.from === this.me);
    const canAsk = mine && this.partner && this.me && !asked;
    return `
      <article class="ptask">
        <div class="pt-name">${escParents(t.name)}</div>
        ${this._parentBadges(t)}
        <div class="pt-actions">
          <button class="btn ok pt-done" data-action="pt-done" data-id="${escParents(t.id)}" ${busy}>✓ ${escParents(this.localize('pt_done'))}</button>
          ${asked ? `<span class="pt-asked">${escParents(this.localize('pt_asked', { name: this._adultName(h.to) }))}</span>` : ''}
          ${canAsk ? `<button class="btn neutral pt-ask" data-action="pt-ask" data-id="${escParents(t.id)}" ${busy}>🙋 ${escParents(this.localize('pt_ask'))}</button>` : ''}
        </div>
      </article>`;
  }

  _renderOwnTasks() {
    const all = this._parentTasksToday();
    const done = this._parentDoneToday();
    const hasAny = this._parentTasksAll().length > 0;
    const incoming = this._incomingHandovers();
    let inner = '';
    if (!hasAny) {
      inner = `<div class="empty">${escParents(this.localize('pt_none'))}</div>
        <button class="adhoc-btn" data-action="pt-picker">🧩 ${escParents(this.localize('pt_setup'))}</button>`;
    } else {
      inner += incoming.map(t => `
        <article class="ask">
          <div class="ask-text">🙋 ${escParents(this.localize('pt_incoming', { name: this._adultName(t.handover.from), task: t.name }))}</div>
          <div class="appr-actions two">
            <button class="btn ok" data-action="ho-yes" data-id="${escParents(t.id)}" ${this._busy.has('ho:' + t.id) ? 'disabled' : ''}>${escParents(this.localize('ho_yes'))}</button>
            <button class="btn neutral" data-action="ho-no" data-id="${escParents(t.id)}" ${this._busy.has('ho:' + t.id) ? 'disabled' : ''}>${escParents(this.localize('ho_no'))}</button>
          </div>
        </article>`).join('');
      if (this.me) {
        const mine = all.filter(t => (t.assignees || []).includes(this.me));
        const theirs = all.filter(t => !(t.assignees || []).includes(this.me));
        inner += mine.length ? mine.map(t => this._renderParentTask(t, true)).join('')
          : `<div class="empty">🎉 ${escParents(this.localize('pt_all_done'))}</div>`;
        if (theirs.length) {
          const label = this.localize('pt_partner', { name: this.partner ? this._adultName(this.partner) : this.localize('pt_other'), n: theirs.length });
          inner += `<details class="fold" data-det="partner" ${this._open.has('det:partner') ? 'open' : ''}><summary>${escParents(label)}</summary>${theirs.map(t => this._renderParentTask(t, false)).join('')}</details>`;
        }
      } else {
        // The caller is not an adult with a person: show everything grouped by the responsible adult.
        const groups = {};
        for (const t of all) {
          const key = (t.assignees || [])[0] || '';
          (groups[key] = groups[key] || []).push(t);
        }
        const keys = Object.keys(groups).sort((a, b) => this._adultName(a).localeCompare(this._adultName(b)));
        inner += keys.map(k => `<h3 class="sub">${escParents(k ? this._adultName(k) : '—')}</h3>${groups[k].map(t => this._renderParentTask(t, false)).join('')}`).join('');
        if (!all.length) inner += `<div class="empty">🎉 ${escParents(this.localize('pt_all_done'))}</div>`;
      }
      if (done.length) {
        inner += `<details class="fold" data-det="done" ${this._open.has('det:done') ? 'open' : ''}><summary>${escParents(this.localize('pt_done_today', { n: done.length }))}</summary>
          ${done.map(h => `<div class="entry"><span class="e-icon">✅</span><span class="e-main"><span class="e-name">${escParents(h.task_name)}</span></span>
            <button class="undo" data-action="undo" data-id="${escParents(h.id)}">↩️ ${escParents(this.localize('undo'))}</button></div>`).join('')}</details>`;
      }
    }
    return `<section><h2>${escParents(this.localize('own_tasks'))}</h2>${inner}</section>`;
  }

  _renderQuick() {
    if (!this._kids().length) return '';
    return `<section><div class="quickrow">
      <button class="qk" data-action="praise-pick">❤️<span>${escParents(this.localize('praise_btn'))}</span></button>
      <button class="qk" data-action="adhoc-open">⭐<span>${escParents(this.localize('adhoc_btn'))}</span></button>
      <button class="qk" data-action="skip-pick">⏸️<span>${escParents(this.localize('skip_btn'))}</span></button>
    </div></section>`;
  }

  // ---- tab "Kinder" ------------------------------------------------------------

  _renderKidsTab() {
    const kids = this._kids();
    if (!kids.length) {
      return `<section><div class="empty">${escParents(this.localize('no_kids'))}</div></section>`;
    }
    if (!kids.some(k => k.id === this._kidSel)) this._kidSel = kids[0].id;
    const chips = kids.map(k =>
      `<button class="chip kidchip ${this._kidSel === k.id ? 'on' : ''}" style="--kc:${k.color}" data-action="kid-select" data-kid="${escParents(k.id)}" aria-pressed="${this._kidSel === k.id}">${this._avatar(k)} ${escParents(k.name)}</button>`).join('');
    const kid = kids.find(k => k.id === this._kidSel);
    const t = this._kidToday(kid);
    const showWallet = this._showWallet();
    const pct = kid.goal > 0 ? Math.min(100, Math.round(kid.points / kid.goal * 100)) : 0;
    const entries = this.history.filter(h => h.user_id === kid.id && h.type !== 'parent').slice(0, 10);
    const strict = this._strictActive(kid)
      ? `<div class="strict">${escParents(this.localize('strict_until', { date: this._formatDate(kid.strict_until) }))}</div>` : '';
    const quick = [-5, -1, 1, 5].map(n =>
      `<button class="qbtn ${n < 0 ? 'minus' : 'plus'}" data-action="adjust" data-kid="${escParents(kid.id)}" data-amount="${n}">${n > 0 ? '+' + n : '−' + Math.abs(n)}</button>`).join('');
    const rows = t.open.map(task => {
      const busy = this._busy.has('kt:' + task.id) ? 'disabled' : '';
      return `
        <div class="trow">
          <div class="trow-top"><span class="trow-name">${escParents(task.name)}</span><span class="st open">${escParents(this.localize('st_open'))}</span></div>
          <div class="trow-actions">
            <button class="btn ok sm" data-action="kt-done" data-id="${escParents(task.id)}" data-kid="${escParents(kid.id)}" ${busy}>✓ ${escParents(this.localize('for_kid', { name: kid.name }))}</button>
            <button class="btn neutral sm" data-action="kt-skip" data-id="${escParents(task.id)}" ${busy}>⏸️ ${escParents(this.localize('skip_btn'))}</button>
          </div>
        </div>`;
    }).join('') + t.waiting.map(p => `
        <div class="trow"><div class="trow-top"><span class="trow-name">${escParents(p.task_name)}</span><span class="st wait">${escParents(this.localize('st_waiting'))}</span></div></div>`).join('')
      + t.done.map(h => `
        <div class="trow"><div class="trow-top"><span class="trow-name">${escParents(h.task_name)}</span><span class="st done">✓ ${escParents(this.localize('st_done'))}</span></div></div>`).join('');
    return `
      <section>
        <div class="chips">${chips}</div>
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
          <h3 class="sub">${escParents(this.localize('kid_today', { done: t.done.length, total: t.total }))}</h3>
          <div class="trows">${rows || `<div class="empty small">${escParents(this.localize('kid_no_tasks'))}</div>`}</div>
          ${t.open.length ? `<button class="btn neutral" data-action="skip-all" data-kid="${escParents(kid.id)}">⏸️ ${escParents(this.localize('skip_all'))}</button>` : ''}
          <div class="quick">${quick}</div>
          <button class="praise-btn" data-action="praise-open" data-kid="${escParents(kid.id)}">❤️ ${escParents(this.localize('praise_btn'))}</button>
          <details class="hist" data-kid-history="${escParents(kid.id)}" ${this._open.has(kid.id) ? 'open' : ''}>
            <summary>${escParents(this.localize('history'))}</summary>
            ${entries.length ? entries.map(h => this._renderEntry(h)).join('') : `<div class="empty small">${escParents(this.localize('no_history'))}</div>`}
          </details>
        </article>
      </section>`;
  }

  // ---- tab "Mehr" --------------------------------------------------------------

  _renderMore() {
    const sub = this._more;
    const back = (key) => `<button class="back" data-action="more-back">‹ ${escParents(this.localize('tab_more'))}</button><h2>${escParents(this.localize(key))}</h2>`;
    if (sub === 'ptasks') return `<section>${back('m_ptasks')}${this._renderParentTaskEditor()}</section>`;
    if (sub === 'shop') return `<section>${back('m_shop')}${this._renderShop()}</section>`;
    if (sub === 'tasks' || sub === 'settings') {
      const key = sub === 'tasks' ? 'm_tasks' : 'm_settings';
      return `<section>${back(key)}${this._embedAvailable(sub) ? '' : `<div class="note">${escParents(this.localize('embed_missing'))}</div>`}</section>`;
    }
    const rows = [['ptasks', '🧩', 'm_ptasks', 'm_ptasks_d'], ['tasks', '📋', 'm_tasks', 'm_tasks_d'], ['shop', '🛍️', 'm_shop', 'm_shop_d']];
    if (this._canManage()) rows.push(['settings', '⚙️', 'm_settings', 'm_settings_d']);
    const list = rows.map(([id, icon, key, desc]) => `
      <button class="mrow" data-action="more-open" data-sub="${id}">
        <span class="mrow-ico">${icon}</span>
        <span class="mrow-main"><span class="mrow-t">${escParents(this.localize(key))}</span><span class="mrow-d">${escParents(this.localize(desc))}</span></span>
        <span class="mrow-go">›</span>
      </button>`).join('');
    const help = window.FamilyMissionHelp ? `
      <button class="mrow" data-action="help" data-anchor="daily">
        <span class="mrow-ico">❓</span>
        <span class="mrow-main"><span class="mrow-t">${escParents(this.localize('m_help'))}</span><span class="mrow-d">${escParents(this.localize('m_help_d'))}</span></span>
        <span class="mrow-go">›</span>
      </button>` : '';
    return `<section><div class="mlist">${list}${help}</div></section>`;
  }

  /** Current mode of a parent task for the segment control. */
  _ptMode(t) {
    if (t.parent_mode === 'alternate') return 'alternate';
    return this.me && (t.assignees || []).includes(this.me) ? 'me' : 'you';
  }

  _modeSegment(mode, attrs) {
    const opts = [['me', 'mode_me']];
    if (this.partner) opts.push(['you', 'mode_you'], ['alternate', 'mode_alt']);
    return `<div class="seg" role="group">${opts.map(([id, key]) =>
      `<button class="${mode === id ? 'on' : ''}" aria-pressed="${mode === id}" ${attrs} data-mode="${id}">${escParents(this.localize(key))}</button>`).join('')}</div>`;
  }

  _renderParentTaskEditor() {
    const list = this._parentTasksAll();
    const rows = list.map(t => {
      const busy = this._busy.has('pt:' + t.id) ? 'disabled' : '';
      const who = (t.assignees || []).map(u => this._adultName(u)).join(', ');
      return `
        <article class="ptask edit">
          <div class="pt-head">
            <span class="pt-name">${escParents(t.name)}</span>
            <button class="plan-tg ${t.planning ? 'on' : ''}" data-action="pt-plan" data-id="${escParents(t.id)}" aria-pressed="${!!t.planning}" title="${escParents(this.localize('pt_planning'))}" ${busy}>🧠</button>
            <button class="rw-del" data-action="pt-del" data-id="${escParents(t.id)}" aria-label="${escParents(this.localize('rewards_delete'))}" title="${escParents(this.localize('rewards_delete'))}" ${busy}>🗑️</button>
          </div>
          <div class="pt-edit-row">
            ${this.me ? this._modeSegment(this._ptMode(t), `data-action="pt-mode" data-id="${escParents(t.id)}" ${busy}`) : `<span class="badge">${escParents(who)}</span>`}
            <label class="rw-f"><input type="number" min="1" max="600" inputmode="numeric" data-pt-min="${escParents(t.id)}" value="${parseInt(t.minutes) || ''}" aria-label="${escParents(this.localize('pt_minutes_lbl'))}"> ${escParents(this.localize('adhoc_min_unit'))}</label>
          </div>
        </article>`;
    }).join('');
    return `
      ${rows || `<div class="empty">${escParents(this.localize('pt_none'))}</div>`}
      <div class="chips">
        <button class="chip" data-action="pt-picker">➕ ${escParents(this.localize('pt_from_templates'))}</button>
        <button class="chip" data-action="pt-new">➕ ${escParents(this.localize('pt_own'))}</button>
      </div>`;
  }

  _renderShop() {
    const items = this._redemptionItems();
    const list = this._pendingRedemptions();
    return `
      <h3 class="sub">${escParents(this.localize('redemptions'))} ${list.length ? `<span class="count sm">${list.length}</span>` : ''}</h3>
      ${items ? `<div class="appr-list">${items}</div>` : `<div class="empty">${escParents(this.localize('no_redemptions'))}</div>`}
      ${this._canManage() ? `<button class="adhoc-btn rw-btn" data-action="rw-open">✏️ ${escParents(this.localize('rewards_edit'))}</button>` : ''}`;
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
    if (this._picker) {
      layer.innerHTML = this._renderPickerSheet();
      const host = layer.querySelector('#picker-host');
      if (host) host.appendChild(this._picker);
      return;
    }
    if (this._own) { layer.innerHTML = this._renderOwnSheet(); return; }
    if (this._pickKid) { layer.innerHTML = this._renderPickKidSheet(); return; }
    if (this._skip) { layer.innerHTML = this._renderSkipSheet(); return; }
    if (this._del) {
      const t = this._task(this._del);
      if (!t) { this._del = null; layer.innerHTML = ''; return; }
      layer.innerHTML = `
        <div class="scrim" data-action="dialog-close"></div>
        <div class="dialog" role="alertdialog" aria-modal="true" style="--kc:var(--p-danger)">
          <h3>🗑️ ${escParents(this.localize('del_title'))}</h3>
          <p>${escParents(this.localize('del_text', { task: t.name }))}</p>
          <div class="dialog-actions">
            <button class="btn neutral" data-action="dialog-close">${escParents(this.localize('cancel'))}</button>
            <button class="btn danger solid" data-action="pt-del-confirm">${escParents(this.localize('del_confirm'))}</button>
          </div>
        </div>`;
      return;
    }
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
      const isParent = h.type === 'parent';
      const kid = isParent ? { name: '', color: '#7E57C2' } : this._kid(h.user_id);
      layer.innerHTML = `
        <div class="scrim" data-action="dialog-close"></div>
        <div class="dialog" role="alertdialog" aria-modal="true" style="--kc:${kid.color}">
          <h3>↩️ ${escParents(this.localize('undo_title'))}</h3>
          <p>${isParent ? escParents(h.task_name) : `${escParents(kid.name)}: ${escParents(h.task_name)} (+${fmtParents(h.points)})`}</p>
          <p>${escParents(this.localize(isParent ? 'undo_text_parent' : 'undo_text'))}</p>
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
      .body { min-width: 0; display: flex; flex-direction: column; gap: 20px; color: var(--primary-text-color); }
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

      .tabs { display: flex; gap: 4px; padding: 4px; margin-bottom: 14px; border-radius: 14px; background: var(--secondary-background-color, #f0f0f0); }
      .tab { flex: 1; min-height: 44px; border: 0; border-radius: 11px; background: transparent; color: var(--p-sub); font-size: 15px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
      .tab.on { background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 1px 4px rgba(0,0,0,0.18); }
      .count.sm { min-width: 20px; height: 20px; padding: 0 6px; font-size: 12px; border-radius: 10px; }
      #embed { margin-top: 12px; }
      #embed[hidden], #embed > [hidden] { display: none; }
      .back { align-self: flex-start; min-height: 44px; padding: 0 14px 0 6px; border: 0; background: transparent; color: var(--primary-color, #03a9f4); font-size: 16px; font-weight: 700; }
      h3.sub { margin: 4px 0 8px; font-size: 14px; color: var(--p-sub); font-weight: 700; }
      section { display: flex; flex-direction: column; min-width: 0; }
      section > h2 { margin-bottom: 10px; }
      .krows { display: flex; flex-direction: column; gap: 8px; }
      .krow { position: relative; display: flex; align-items: center; gap: 12px; width: 100%; min-height: 64px; padding: 8px 12px; text-align: left; border-radius: 14px; border: 1px solid var(--p-line); border-left: 6px solid var(--kc); background: var(--card-background-color, #fff); color: var(--primary-text-color); }
      .krow .avatar { width: 40px; height: 40px; font-size: 22px; }
      .krow-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
      .krow-name { font-size: 16px; font-weight: 700; overflow-wrap: anywhere; }
      .krow-bar { display: block; height: 8px; border-radius: 4px; background: color-mix(in srgb, var(--kc) 20%, transparent); overflow: hidden; }
      .krow-bar .fill { display: block; }
      .krow-side { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 14px; font-weight: 700; }
      .krow-cnt { color: var(--p-sub); }
      .krow .count.sm { position: absolute; top: -6px; right: -4px; }
      .ptask, .ask { padding: 12px; border-radius: 14px; border: 1px solid var(--p-line); background: var(--card-background-color, #fff); display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; min-width: 0; }
      .ask { border-color: #7E57C2; background: color-mix(in srgb, #7E57C2 8%, var(--card-background-color, #fff)); }
      .ask-text, .pt-name { font-size: 17px; font-weight: 700; overflow-wrap: anywhere; }
      .badges { display: flex; flex-wrap: wrap; gap: 6px; }
      .badge { padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; background: var(--secondary-background-color, #f0f0f0); color: var(--p-sub); }
      .badge.plan { background: color-mix(in srgb, #7E57C2 16%, transparent); color: var(--primary-text-color); }
      .badge.carried { background: transparent; border: 1px solid var(--p-line); font-weight: 500; }
      .pt-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
      .pt-done { flex: 1 1 160px; min-height: 60px; font-size: 20px; }
      .pt-ask { flex: 0 1 auto; min-height: 60px; padding: 0 14px; }
      .pt-asked { font-size: 14px; font-weight: 600; color: var(--p-sub); padding: 0 6px; }
      .fold { margin-bottom: 10px; }
      .fold > summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; font-size: 15px; font-weight: 700; color: var(--p-sub); }
      .fold .ptask { margin-top: 8px; }
      .quickrow { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .qk { min-height: 72px; padding: 6px; border-radius: 14px; border: 2px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); font-size: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
      .qk span { font-size: 13px; font-weight: 700; overflow-wrap: anywhere; text-align: center; }
      .qk:active { transform: scale(0.97); }
      .trows { display: flex; flex-direction: column; gap: 8px; }
      .trow { padding: 8px 10px; border-radius: 12px; border: 1px solid var(--p-line); display: flex; flex-direction: column; gap: 8px; }
      .trow-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .trow-name { font-size: 15px; font-weight: 600; overflow-wrap: anywhere; min-width: 0; }
      .st { flex: none; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 10px; background: var(--secondary-background-color, #f0f0f0); color: var(--p-sub); }
      .st.done { color: var(--p-ok); }
      .trow-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .btn.sm { min-height: 44px; font-size: 14px; white-space: normal; line-height: 1.2; padding: 4px 8px; }
      .btn.ok.sm { font-size: 14px; min-height: 44px; }
      .mlist { display: flex; flex-direction: column; gap: 8px; }
      .mrow { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 64px; padding: 8px 14px; text-align: left; border-radius: 14px; border: 1px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); }
      .mrow-ico { flex: none; font-size: 24px; width: 32px; text-align: center; }
      .mrow-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .mrow-t { font-size: 16px; font-weight: 700; }
      .mrow-d { font-size: 13px; color: var(--p-sub); }
      .mrow-go { font-size: 24px; color: var(--p-sub); }
      .pt-head { display: flex; align-items: center; gap: 8px; }
      .pt-head .pt-name { flex: 1; min-width: 0; }
      .pt-edit-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
      .plan-tg { min-width: 44px; min-height: 44px; border-radius: 10px; border: 2px solid var(--p-line); background: transparent; font-size: 20px; filter: grayscale(1); opacity: 0.7; }
      .plan-tg.on { filter: none; opacity: 1; border-color: #7E57C2; background: color-mix(in srgb, #7E57C2 16%, transparent); }
      .seg { display: inline-flex; border-radius: 12px; border: 2px solid var(--p-line); overflow: hidden; max-width: 100%; }
      .seg button { min-height: 44px; padding: 0 12px; border: 0; background: transparent; color: var(--primary-text-color); font-size: 14px; font-weight: 700; }
      .seg button + button { border-left: 2px solid var(--p-line); }
      .seg button.on { background: var(--primary-color, #03a9f4); color: #fff; }
      .pt-edit-row input[type=number] { width: 72px; min-height: 44px; border-radius: 10px; border: 2px solid var(--p-line); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color); font-size: 16px; padding: 0 8px; }
      .txt { min-height: 48px; border-radius: 12px; border: 2px solid var(--p-line); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color); font-size: 16px; font-family: inherit; padding: 0 12px; min-width: 0; }
      input.txt:not(.num) { width: 100%; }
      .txt.num { width: 84px; }
      .inl { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
      .chk { width: 26px; height: 26px; }
      .skip-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; min-height: 52px; padding: 6px 12px; margin-bottom: 8px; border-radius: 12px; border: 2px solid var(--p-line); background: var(--card-background-color, #fff); color: var(--primary-text-color); font-size: 15px; font-weight: 600; text-align: left; }
      .skip-go { flex: none; font-size: 13px; color: var(--p-sub); }
      .entry .undo { margin: 0; flex: none; }

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

/** Editor for the FamilyMissionParents card. */
class FamilyMissionParentsEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  localize(key) { return FamilyMissionParents._localize(this._hass, key); }

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

customElements.define('family-mission-parents-editor', FamilyMissionParentsEditor);
customElements.define('family-mission-parents', FamilyMissionParents);
