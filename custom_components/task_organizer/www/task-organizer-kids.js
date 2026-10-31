/**
 * TaskOrganizer Kids card.
 *
 * A big, touch friendly card for a wall/kiosk tablet (designed for 1280x800 landscape).
 * Kids are Home Assistant `person` entities that do NOT need a user account: their
 * participant ID is the person's `user_id` attribute or, if missing, the entity_id.
 *
 * Flow: home screen (one tile per kid, family goal, bonus board) -> PIN pad ->
 * kid view (own duties + unlocked bonus tasks) -> "Fertig!" -> confetti + sound.
 * All actions go through the PIN-checked websocket commands kid_verify_pin,
 * kid_claim_task and kid_complete_task of the integration.
 *
 * No external libraries, fonts or sound files are used.
 */

/**
 * Configuration for translations.
 * en: English translations.
 * de: German translations.
 */
const I18N_KIDS = {
  en: {
    title: "Family Tasks", loading: "Loading...",
    no_kids: "No kids set up yet. Parents: Settings card -> Kids.",
    hello: "Hi {name}!", enter_pin: "Enter your secret number", pin_cancel: "Cancel", pin_delete: "Delete",
    back: "Back", my_tasks: "My tasks", bonus: "Bonus", bonus_board: "Bonus board",
    no_bonus_board: "No bonus right now. Check again later!",
    no_bonus: "No bonus right now. Check again later!",
    no_tasks: "All done! You are awesome!",
    tasks_open_one: "1 task open", tasks_open: "{n} tasks open", all_done_badge: "All done!",
    family_rocket: "Family rocket", reward: "Reward", points_unit: "pts", goal_reached: "Goal reached!",
    claim: "Take it", done_btn: "Done!", locked_basis: "Your tasks first!", claimed_other: "{name} is on it",
    claimed_mine: "Reserved for you", min_age_badge: "age {age}+",
    plus_points: "+{n} points!", great: "Great job, {name}!",
    err_wrong_pin: "Hmm, that number is not right. Try again!",
    err_locked: "Stop! Too many tries. Please wait {s} seconds.",
    err_not_eligible: "That does not work right now. The task is already done or not for you.",
    err_too_young: "This task is still too big for you. Soon you can do it!",
    err_claimed: "Another kid already grabbed this task.",
    err_basis_open: "Your tasks first, then the bonus!",
    err_unknown_kid: "Your profile is not set up yet. Ask Mom or Dad.",
    err_generic: "Oops, something went wrong. Please try again.",
    title_lbl: "Title", timeout_lbl: "Return to home screen after (seconds)", sound_lbl: "Play sounds",
    show_family_goal_lbl: "Show family goal", show_bonus_board_lbl: "Show bonus board",
    return_home_lbl: "Return to home screen after \"Done!\"",
    bday_banner: "🎂 It's {name}'s birthday today! {name} turns {age}!",
    bday_title: "Happy birthday, {name}!", bday_age: "You are {age} now!", bday_go: "Let's go!",
    praise_title: "Someone is proud of you!", praise_from: "from {name}", praise_ok: "Yay!", praise_tag: "New praise for you!",
    free_today: "You are off duty today! 🎉",
    levelup_title: "Level-Up 🏆", levelup_new: "New - you are allowed to do this now:",
    levelup_none: "New adventures are waiting for you!",
    waiting_title: "Waiting for approval", waiting_hint: "Mom or Dad will take a look",
    pending_cheer: "Great! Mom or Dad will take a quick look.",
    strict_note: "🔍 This week Mom and Dad check everything",
    penalty_line: "−{n} points: {reason}", points_pending: "pending",
    from_time: "from {t}", countdown: "{n} min to go", window_over: "Over for today - new chance tomorrow",
    until_time: "until {t}",
    err_not_yet: "Not yet! This task starts a little later.",
    err_too_late: "Too late for today. New chance tomorrow!", err_steps_open: "Tick all steps first!", err_together_not_allowed: "This task is a solo job.",
    steps_left: "Still {n} step(s) to tick",
    pa_skip: "Skip today", pa_postpone: "Postpone", pa_complete: "Complete for {name}", pa_undo: "Undo",
    pa_cancel: "Cancel", pa_ok: "OK", pa_done_today: "Done today",
    pa_confirm_skip: "Skip \"{task}\" today? No points are given.",
    pa_confirm_complete: "Complete \"{task}\" for {name}? {n} points will be awarded.",
    pa_confirm_undo: "Undo \"{task}\"? The points are taken back.",
    pa_postpone_title: "Postpone \"{task}\"", pa_back_on: "Back on",
    pa_tomorrow: "Tomorrow", pa_day_after: "Day after tomorrow", pa_date: "Pick a date",
    pa_day: "Day", pa_month: "Month", pa_postpone_ok: "Postpone",
    together: "Together", together_title: "Doing \"{task}\" together", together_ask: "Who is helping?",
    together_each: "Everyone gets ⭐ {n}{bonus}", together_bonus: " + {b} team bonus", together_next: "Next",
    helper_pin_ask: "Please confirm that you helped", helper_none: "Nobody else can help with this one.",
    err_duplicate_helper: "Every helper can only be picked once.",
    err_helper_wrong_pin: "{name}: that number is not right.", err_helper_locked: "{name}: too many tries. Please wait {s} seconds.",
    err_helper_too_young: "{name} is too young for this task.", err_helper_unknown_kid: "{name} is not set up yet.",
    pa_skipped: "Skipped for today", pa_postponed: "Postponed", pa_completed: "Done for {name}: +{n}", pa_undone: "Undone",
    replaced_today: "Today: {a} instead of {b}",
    shop: "Shop", shop_title: "Reward shop", shop_balance: "You have", shop_empty: "No rewards available yet.",
    shop_redeem: "Redeem", shop_need: "{n} ⭐ to go", shop_goal: "Savings goal", shop_goal_on: "Savings goal ✓",
    shop_confirm: "Redeem {emoji} {name} for ⭐ {cost}?", shop_waiting: "waiting for mom or dad",
    shop_ready_hint: "Ready to redeem!", shop_done: "Great! Ask mom or dad for your reward.",
    goal_left: "{n} ⭐ to go for {emoji}", goal_ready: "{emoji} ready!",
    err_not_enough_points: "You do not have enough stars for this yet.", err_unknown_reward: "This reward does not exist any more.",
    err_reward_inactive: "This reward is not available right now.",
    mine_no_person: "Your Home Assistant user is not linked to a person yet. Ask an admin to link it in Settings > People.",
    mode_mine_lbl: "My tasks (own device, no PIN)"
  },
  de: {
    title: "Familien-Aufgaben", loading: "Lade...",
    no_kids: "Noch keine Kinder eingerichtet. Eltern: Einstellungen-Karte -> Kinder.",
    hello: "Hallo {name}!", enter_pin: "Gib deine Geheimzahl ein", pin_cancel: "Abbrechen", pin_delete: "Löschen",
    back: "Zurück", my_tasks: "Meine Aufgaben", bonus: "Bonus", bonus_board: "Bonus-Brett",
    no_bonus_board: "Gerade gibt es keinen Bonus. Schau später nochmal!",
    no_bonus: "Gerade gibt es keinen Bonus. Schau später nochmal!",
    no_tasks: "Alles erledigt! Du bist spitze!",
    tasks_open_one: "1 Aufgabe offen", tasks_open: "{n} Aufgaben offen", all_done_badge: "Alles geschafft!",
    family_rocket: "Familien-Rakete", reward: "Belohnung", points_unit: "Pkt.", goal_reached: "Ziel erreicht!",
    claim: "Übernehmen", done_btn: "Fertig!", locked_basis: "Erst deine Aufgaben!", claimed_other: "{name} macht das",
    claimed_mine: "Für dich reserviert", min_age_badge: "ab {age}",
    plus_points: "+{n} Punkte!", great: "Super gemacht, {name}!",
    err_wrong_pin: "Hmm, die Geheimzahl stimmt nicht. Versuch's nochmal!",
    err_locked: "Stopp! Zu viele Versuche. Bitte warte {s} Sekunden.",
    err_not_eligible: "Das geht gerade nicht. Die Aufgabe ist schon erledigt oder nicht für dich.",
    err_too_young: "Diese Aufgabe ist noch zu groß für dich. Bald darfst du sie machen!",
    err_claimed: "Ein anderes Kind hat sich diese Aufgabe schon geschnappt.",
    err_basis_open: "Erst deine Aufgaben, dann der Bonus!",
    err_unknown_kid: "Dein Profil ist noch nicht eingerichtet. Frag Mama oder Papa.",
    err_generic: "Hoppla, da hat etwas nicht geklappt. Versuch's gleich nochmal.",
    title_lbl: "Titel", timeout_lbl: "Zurück zum Startbildschirm nach (Sekunden)", sound_lbl: "Töne abspielen",
    show_family_goal_lbl: "Familienziel anzeigen", show_bonus_board_lbl: "Bonus-Brett anzeigen",
    return_home_lbl: "Nach \"Fertig!\" zum Startbildschirm",
    bday_banner: "🎂 Heute hat {name} Geburtstag! {name} wird {age}!",
    bday_title: "Alles Gute zum Geburtstag, {name}!", bday_age: "Du bist jetzt {age}!", bday_go: "Los geht's!",
    praise_title: "Jemand ist stolz auf dich!", praise_from: "von {name}", praise_ok: "Juhu!", praise_tag: "Neues Lob für dich!",
    free_today: "Heute hast du frei! 🎉",
    levelup_title: "Level-Up 🏆", levelup_new: "Neu – das darfst du jetzt:",
    levelup_none: "Neue Abenteuer warten auf dich!",
    waiting_title: "Wartet auf Freigabe", waiting_hint: "Mama oder Papa schauen noch drauf",
    pending_cheer: "Super! Mama oder Papa schauen noch drauf.",
    strict_note: "🔍 Diese Woche schauen Mama und Papa bei allem drüber",
    penalty_line: "−{n} Punkte: {reason}", points_pending: "offen",
    from_time: "ab {t}", countdown: "noch {n} min", window_over: "Heute vorbei – morgen neue Chance",
    until_time: "bis {t}",
    err_not_yet: "Noch nicht dran! Die Aufgabe startet etwas später.",
    err_too_late: "Heute zu spät. Morgen gibt es eine neue Chance!", err_steps_open: "Hake zuerst alle Schritte ab!", err_together_not_allowed: "Diese Aufgabe machst du allein.",
    steps_left: "Noch {n} Schritt(e) abhaken",
    pa_skip: "Heute aussetzen", pa_postpone: "Zurückstellen", pa_complete: "Für {name} erledigen", pa_undo: "Rückgängig",
    pa_cancel: "Abbrechen", pa_ok: "OK", pa_done_today: "Heute erledigt",
    pa_confirm_skip: "\"{task}\" heute aussetzen? Es gibt keine Punkte.",
    pa_confirm_complete: "\"{task}\" für {name} erledigen? {n} Punkte werden gutgeschrieben.",
    pa_confirm_undo: "\"{task}\" rückgängig machen? Die Punkte werden zurückgenommen.",
    pa_postpone_title: "\"{task}\" zurückstellen", pa_back_on: "Wieder da ab",
    pa_tomorrow: "Morgen", pa_day_after: "Übermorgen", pa_date: "Datum wählen",
    pa_day: "Tag", pa_month: "Monat", pa_postpone_ok: "Zurückstellen",
    together: "Zusammen", together_title: "\"{task}\" zusammen machen", together_ask: "Wer hilft mit?",
    together_each: "Alle bekommen ⭐ {n}{bonus}", together_bonus: " + {b} Team-Bonus", together_next: "Weiter",
    helper_pin_ask: "Bestätige bitte, dass du geholfen hast", helper_none: "Hier kann gerade niemand mithelfen.",
    err_duplicate_helper: "Jeder Helfer kann nur einmal ausgewählt werden.",
    err_helper_wrong_pin: "{name}: Die Geheimzahl stimmt nicht.", err_helper_locked: "{name}: Zu viele Versuche. Bitte warte {s} Sekunden.",
    err_helper_too_young: "{name} ist für diese Aufgabe noch zu jung.", err_helper_unknown_kid: "{name} ist noch nicht eingerichtet.",
    pa_skipped: "Für heute ausgesetzt", pa_postponed: "Zurückgestellt", pa_completed: "Für {name} erledigt: +{n}", pa_undone: "Rückgängig gemacht",
    replaced_today: "Heute: {a} statt {b}",
    shop: "Shop", shop_title: "Belohnungs-Shop", shop_balance: "Du hast", shop_empty: "Noch keine Belohnungen vorhanden.",
    shop_redeem: "Einlösen", shop_need: "noch {n} ⭐", shop_goal: "Sparziel", shop_goal_on: "Sparziel ✓",
    shop_confirm: "{emoji} {name} für ⭐ {cost} einlösen?", shop_waiting: "wartet auf Mama oder Papa",
    shop_ready_hint: "Bereit zum Einlösen!", shop_done: "Super! Frag Mama oder Papa nach deiner Belohnung.",
    goal_left: "noch {n} ⭐ bis {emoji}", goal_ready: "{emoji} bereit!",
    err_not_enough_points: "Dafür reichen deine Sterne noch nicht.", err_unknown_reward: "Diese Belohnung gibt es nicht mehr.",
    err_reward_inactive: "Diese Belohnung ist gerade nicht verfügbar.",
    mine_no_person: "Dein Benutzer ist noch keiner Person zugeordnet. Ein Administrator kann das unter Einstellungen > Personen einrichten.",
    mode_mine_lbl: "Meine Aufgaben (eigenes Gerät, ohne PIN)"
  }
};

/**
 * Make this card available in the Home Assistant Card Picker.
 */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "task-organizer-kids",
  name: "Task Organizer: Kids",
  description: "Touch friendly kids view with PIN pad, own tasks, bonus tasks, family goal, confetti and sound.",
  preview: false,
});

/** Escapes text for safe use inside innerHTML templates. */
function escKids(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Formats a point value: at most one decimal, no trailing ".0". */
function fmtKids(value) {
  const n = Math.round((parseFloat(value) || 0) * 10) / 10;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const KIDS_RING_RADIUS = 52;
const KIDS_RING_CIRCUMFERENCE = 2 * Math.PI * KIDS_RING_RADIUS;

class TaskOrganizerKids extends HTMLElement {
  /**
   * Initializes the card and its internal state.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.tasks = {};
    this.points = {};
    this.settings = {};
    this.pending = {};
    this.history = [];
    this.familyPoints = null;
    this.birthdayLevelup = {};
    this.wallet = {};
    this.redemptions = {};
    this.praise = [];
    this._praiseId = null;        // praise currently shown in the overlay
    this._praiseDone = new Set(); // praise ids already shown/marked this session
    this._shop = false;           // shop panel open inside the kid view
    this._config = {};
    this._hass = null;
    this._dataLoaded = false;
    this._fetched = false;
    this._unsubEvents = null;

    this._view = 'home';          // home | pin | kid
    this._pendingKid = null;      // kid whose PIN is being entered
    this._pin = '';
    this._pinMessage = '';
    this._shake = false;
    this._lockUntil = 0;
    this._session = null;         // { kidId, pin }
    this._busy = false;
    this._celebrating = false;
    this._lastActivity = Date.now();
    this._tickTimer = null;
    this._toastTimer = null;
    this._celebrationTimer = null;
    this._rafId = null;
    this._audio = null;
    this._bdayKid = null;         // kid whose birthday overlay is showing
    this._bdayNodes = [];
    this._narrow = false;
    this._resizeObserver = null;
    this._minuteKey = Math.floor(Date.now() / 60000);
    this._myRole = null;          // admin | manager | parent | null (viewing Home Assistant user)
    this._sheet = null;           // open confirm / postpone dialog of a parent action

    this.shadowRoot.innerHTML = `<style>${this._styles()}</style><div id="app"></div><div id="fx"></div>`;
    this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener('pointerdown', () => this._onPointerDown());
    this.shadowRoot.addEventListener('change', (ev) => this._onChange(ev));
    // scroll events do not bubble: capture them to keep the "more below" hints current
    this.shadowRoot.addEventListener('scroll', () => this._updateScrollHints(), true);
  }

  // ---------------------------------------------------------------------------
  // Localization / HA card API
  // ---------------------------------------------------------------------------

  /**
   * Statically translates a key.
   * @param {object} hass - The Home Assistant object.
   * @param {string} key - The translation key.
   * @param {object} replace - Object with parameters to replace in the string.
   * @returns {string} - The translated text.
   */
  static _localize(hass, key, replace = null) {
    const lang = (hass && hass.language) ? hass.language.substring(0, 2) : 'en';
    const dict = I18N_KIDS[lang] || I18N_KIDS['en'];
    let text = dict[key] || I18N_KIDS['en'][key] || key;
    if (replace) {
      for (const [k, v] of Object.entries(replace)) {
        text = text.split(`{${k}}`).join(v);
      }
    }
    return text;
  }

  /**
   * Translates a key based on the Home Assistant language.
   * @param {string} key - The translation key.
   * @param {object} replace - Object with parameters to replace in the string.
   * @returns {string} - The translated text.
   */
  localize(key, replace = null) {
    return TaskOrganizerKids._localize(this._hass, key, replace);
  }

  /**
   * Participant ID of a person entity: the linked HA user_id if present,
   * otherwise the person entity_id (persons without a user account, e.g. kids).
   * @param {string} entityId - The person entity_id.
   * @param {object} state - The person state object.
   * @returns {string} - The participant ID used for points/history/assignees.
   */
  static participantId(entityId, state) {
    return (state && state.attributes && state.attributes.user_id) || entityId;
  }

  static getLayoutOptions() {
    return { grid_columns: 12, grid_rows: "auto", grid_min_columns: 6 };
  }

  getCardSize() { return 10; }

  static getStubConfig(hass) {
    return {
      type: "custom:task-organizer-kids",
      title: this._localize(hass, 'title'),
      timeout: 90,
      sound: true,
      show_family_goal: true,
      show_bonus_board: true
    };
  }

  static getConfigElement() {
    return document.createElement("task-organizer-kids-editor");
  }

  /**
   * Sets the configuration from Home Assistant.
   * @param {object} config - The card configuration.
   */
  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    const timeout = parseInt(config.timeout);
    this._config = {
      ...config,
      timeout: (!isNaN(timeout) && timeout > 0) ? timeout : 90,
      sound: config.sound !== false,
      show_family_goal: config.show_family_goal !== false,
      show_bonus_board: config.show_bonus_board !== false,
      return_home_after_done: config.return_home_after_done !== false,
      mode: config.mode === 'mine' ? 'mine' : 'family'
    };
    if (this._hass) this._render();
  }

  connectedCallback() {
    if (this._hass && !this._unsubEvents) this._subscribeToUpdates();
    if (!this._tickTimer) this._tickTimer = setInterval(() => this._tick(), 1000);
    this._observeSize();
    if (!this._fitHandler) {
      this._fitHandler = () => this._fitHeight();
      window.addEventListener('resize', this._fitHandler);
    }
    requestAnimationFrame(() => this._fitHeight());
  }

  /**
   * Fills exactly the space below the Home Assistant toolbar. A fixed
   * "100vh - header" guess left a small page scrollbar when the real toolbar
   * (tabs, safe area, app frame) is higher than the assumed 56 px.
   */
  _fitHeight() {
    const top = this.getBoundingClientRect().top + (window.scrollY || 0);
    if (!(top >= 0)) return;
    const h = Math.max(0, Math.floor(window.innerHeight - top));
    if (h > 0) this.style.setProperty('--to-fit-height', `${h}px`);
    // Compact home screen when the height is tight (e.g. a 1280x800 tablet with
    // the HA toolbar): smaller rings and tiles so rocket and bonus board fit.
    this.toggleAttribute('short', h > 0 && h < 820);
  }

  /**
   * Switches the compact phone layout on below 700 px CARD width (not viewport
   * width: the card can be narrow on a wide screen, e.g. in a side-by-side view).
   */
  _observeSize() {
    this._applyWidth(this.clientWidth);
    if (this._resizeObserver || typeof ResizeObserver === 'undefined') return;
    this._resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      this._applyWidth(entry && entry.contentRect ? entry.contentRect.width : this.clientWidth);
    });
    this._resizeObserver.observe(this);
  }

  _applyWidth(width) {
    if (!width) return;
    const narrow = width < 700;
    if (narrow === this._narrow) return;
    this._narrow = narrow;
    this.toggleAttribute('narrow', narrow);
    this._updateScrollHints();
  }

  disconnectedCallback() {
    if (this._unsubEvents) {
      this._unsubEvents.then(unsub => unsub());
      this._unsubEvents = null;
    }
    clearInterval(this._tickTimer);
    this._tickTimer = null;
    if (this._fitHandler) {
      window.removeEventListener('resize', this._fitHandler);
      this._fitHandler = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    clearTimeout(this._toastTimer);
    clearTimeout(this._celebrationTimer);
    this._stopBirthday();
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  /**
   * Subscribes to backend updates via websockets (same event as the other cards).
   */
  async _subscribeToUpdates() {
    if (!this._hass) return;
    this._unsubEvents = this._hass.connection.subscribeEvents(
      () => this._fetchData(),
      "task_organizer_updated"
    );
  }

  /**
   * Sets the Home Assistant object. Data is only fetched once and then on events,
   * because HA calls this setter on every state change of the whole system.
   * @param {object} hass - The Home Assistant object.
   */
  set hass(hass) {
    this._hass = hass;
    if (!hass) return;
    if (!this._dataLoaded) {
      this._dataLoaded = true;
      this._fetchData();
      this._render();
    }
    if (!this._unsubEvents) this._subscribeToUpdates();
    if (!this._tickTimer && this.isConnected) this._tickTimer = setInterval(() => this._tick(), 1000);
  }

  /**
   * Fetches tasks, points and settings from the backend.
   */
  _fetchData() {
    if (!this._hass) return;
    this._hass.callWS({ type: 'task_organizer/get_data' }).then((data) => {
      this.tasks = data.tasks || {};
      this.points = data.points || {};
      this.settings = data.settings || {};
      this.pending = data.pending || {};
      this.history = Array.isArray(data.history) ? data.history : [];
      this._myRole = data.my_role || null;
      this.familyPoints = (data.family_points === undefined || data.family_points === null) ? null : parseFloat(data.family_points);
      this.birthdayLevelup = data.birthday_levelup || {};
      this.wallet = data.wallet || {};
      this.redemptions = data.redemptions || {};
      this.praise = Array.isArray(data.praise) ? data.praise : [];
      this._fetched = true;
      this._render();
    }).catch((err) => console.error("TaskOrganizer Kids: could not load data", err));
  }

  // ---------------------------------------------------------------------------
  // Derived data
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

  /** Task is due or overdue today and not paused (same rule as the backend). */
  _isOpen(task) {
    const todayKey = this._localToday();
    const pausedKey = this._dateKey(task.paused_until);
    if (pausedKey && todayKey <= pausedKey) return false;
    const dueKey = this._dateKey(task.due_date);
    return !!dueKey && dueKey <= todayKey;
  }

  _localToday() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** Valid category of a task; legacy values count as "basis". */
  _category(task) {
    return ['basis', 'bonus', 'auftrag'].includes(task.category) ? task.category : 'basis';
  }

  /** Minutes since local midnight of "HH:MM" (null if invalid). */
  _hhmm(value) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || '');
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }

  /**
   * Time window of a task, mirrors window_state() of the backend.
   * @returns {{state: string, from: string|null, until: string|null, minutes: number|null}}
   *   state open | not_yet | too_late; minutes = minutes until the window opens (not_yet only).
   */
  _window(task) {
    let from = this._hhmm(task.available_from);
    let until = this._hhmm(task.available_until);
    const info = (state, minutes = null) => ({ state, minutes, from: task.available_from || null, until: task.available_until || null });
    if (from === 0) from = null;
    if (until === 0 && from === null) until = null;
    if (from === null && until === null) return info('open');
    const now = new Date();
    const t = now.getHours() * 60 + now.getMinutes();
    if (from !== null && until !== null) {
      if (from === until) return info('open');
      if (from < until) {
        if (t < from) return info('not_yet', from - t);
        return t < until ? info('open') : info('too_late');
      }
      return (t >= from || t < until) ? info('open') : info('not_yet', from - t);
    }
    if (from !== null) return t >= from ? info('open') : info('not_yet', from - t);
    return t < until ? info('open') : info('too_late');
  }

  /** Ad-hoc bonus task whose expiry has passed (the backend removes it within a minute). */
  _expired(task) {
    if (!task.expires_at) return false;
    const t = new Date(task.expires_at).getTime();
    return !isNaN(t) && t <= Date.now();
  }

  _clockText(iso) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString((this._hass && this._hass.language) || [], { hour: '2-digit', minute: '2-digit' });
  }

  _assignees(task) {
    if (Array.isArray(task.assignees)) return task.assignees;
    return task.assignees ? [task.assignees] : [];
  }

  _claimActive(task) {
    return !!task.claimed_by && !!task.claimed_until && new Date(task.claimed_until) > new Date();
  }

  /** Parses YYYY-MM-DD to {y, m, d}; invalid dates -> null. */
  _ymd(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return { y, m: mo, d };
  }

  _todayYmd() {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  }

  _ymdNum(v) { return v.y * 10000 + v.m * 100 + v.d; }

  /** Day the birthday is celebrated in a year (Feb 29 -> Feb 28 in common years). */
  _birthdayIn(b, year) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (b.m === 2 && b.d === 29 && !leap) return { y: year, m: 2, d: 28 };
    return { y: year, m: b.m, d: b.d };
  }

  /**
   * Exact age of a kid in years: by birthday when known (changes on the
   * birthday, not on Jan 1), otherwise by birth year. null if neither is known.
   * Mirrors kid_age() of the backend.
   */
  _age(kid) {
    const b = this._ymd(kid.birthday);
    if (b) {
      const today = this._todayYmd();
      let age = today.y - b.y;
      if (this._ymdNum(today) < this._ymdNum(this._birthdayIn(b, today.y))) age--;
      return age;
    }
    const y = parseInt(kid.birth_year);
    return isNaN(y) ? null : new Date().getFullYear() - y;
  }

  /** True on the kid's birthday (local date). */
  _isBirthday(kid) {
    const b = this._ymd(kid.birthday);
    const today = this._todayYmd();
    return !!b && today.y > b.y && this._ymdNum(this._birthdayIn(b, today.y)) === this._ymdNum(today);
  }

  /** Strict mode of the backend: every task of the kid needs approval until strict_until. */
  _strictActive(kid) {
    const until = this._ymd(kid.strict_until);
    return !!until && this._ymdNum(this._todayYmd()) < this._ymdNum(until);
  }

  /** Pending (waiting for approval) completions of a kid, oldest first. */
  _pendingFor(kidId) {
    return Object.values(this.pending || {}).filter(p => p.kid_id === kidId || (Array.isArray(p.helpers) && p.helpers.includes(kidId)))
      .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }

  /** Recent penalties (last 7 days) of a kid for the neutral note in the kid's own view. */
  _recentPenalties(kidId) {
    const since = Date.now() - 7 * 86400000;
    return this.history
      .filter(h => h.type === 'penalty' && h.user_id === kidId && parseFloat(h.points) < 0 &&
        new Date(h.timestamp).getTime() >= since)
      .slice(0, 3);
  }

  _oldEnough(task, kid) {
    const minAge = parseInt(task.min_age) || 0;
    const age = this._age(kid);
    return minAge <= 0 || age === null || age >= minAge;
  }

  /** Person lookup: participant id -> { name, picture }. */
  _persons() {
    const map = {};
    const states = (this._hass && this._hass.states) || {};
    for (const entityId in states) {
      if (!entityId.startsWith('person.')) continue;
      const state = states[entityId];
      map[TaskOrganizerKids.participantId(entityId, state)] = {
        name: (state.attributes && state.attributes.friendly_name) || entityId,
        picture: (state.attributes && state.attributes.entity_picture) || ''
      };
    }
    return map;
  }

  /**
   * All configured kids in a FIXED order (alphabetical by name, never by points).
   * @returns {Array<object>} - Kid view models.
   */
  _kids() {
    const persons = this._persons();
    const profiles = (this.settings && this.settings.kids) || {};
    const goals = (this.settings && this.settings.point_goals) || {};
    const kids = Object.entries(profiles).map(([id, p]) => {
      const kid = {
        id,
        name: (persons[id] && persons[id].name) || id,
        avatar: p.avatar || '🙂',
        color: /^#[0-9a-fA-F]{3,6}$/.test(p.color || '') ? p.color : '#4CAF50',
        birth_year: p.birth_year,
        birthday: p.birthday || null,
        strict_until: p.strict_until || null,
        has_pin: !!p.has_pin,
        points: parseFloat(this.points[id]) || 0,
        goal: parseFloat(goals[id]) || 0,
        wallet: parseFloat((this.wallet || {})[id]) || 0,
        goal_reward: p.goal_reward || null
      };
      // pctRaw may exceed 100 (bonus points): the ring draws further laps on top
      kid.pctRaw = kid.goal > 0 ? Math.round((kid.points / kid.goal) * 100) : 0;
      kid.pct = Math.min(100, kid.pctRaw);
      kid.age = this._age(kid);
      kid.isBirthday = this._isBirthday(kid);
      kid.duties = this._duties(kid);
      kid.pendingCount = this._pendingFor(id).length;
      kid.unseenPraise = this._unseenPraise(id);
      return kid;
    });
    kids.sort((a, b) => a.name.localeCompare(b.name, (this._hass && this._hass.language) || undefined));
    return kids;
  }

  // ---------------------------------------------------------------------------
  // Praise from the parents (sticker + message, no points)
  // ---------------------------------------------------------------------------

  /** Unseen praise of ONE kid, oldest first (never shown on other kids' tiles). */
  _unseenPraise(kidId) {
    return (this.praise || [])
      .filter(p => p.kid_id === kidId && !p.seen && !this._praiseDone.has(p.id))
      .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }

  /** Shows the next unseen praise of the logged-in kid as a friendly overlay (once the view is open). */
  _maybeShowPraise() {
    if (this._praiseId || this._bdayKid || this._celebrating || !this._session || this._view !== 'kid') return;
    const next = this._unseenPraise(this._session.kidId)[0];
    const fx = this.shadowRoot.getElementById('fx');
    if (!next || !fx) return;
    const kid = this._kids().find(k => k.id === this._session.kidId);
    this._praiseId = next.id;
    const layer = document.createElement('div');
    layer.className = 'praise-layer';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.innerHTML = `
      <div class="praise-card" style="--kc:${kid ? kid.color : '#E91E63'}">
        <div class="praise-sticker" aria-hidden="true">${escKids(next.sticker || '❤️')}</div>
        <div class="praise-msg">${escKids(next.message || this.localize('praise_title'))}</div>
        ${next.from_name ? `<div class="praise-from">${escKids(this.localize('praise_from', { name: next.from_name }))}</div>` : ''}
        <button class="btn btn-done praise-go" data-action="praise-close">${escKids(this.localize('praise_ok'))} 🎉</button>
      </div>`;
    fx.appendChild(layer);
    this._playPraise();
  }

  _removePraiseLayer() {
    const layer = this.shadowRoot.querySelector('.praise-layer');
    if (layer) layer.remove();
    this._praiseId = null;
  }

  /** Closes the overlay, marks the praise as seen in the backend and shows the next one. */
  _closePraise() {
    const id = this._praiseId;
    const session = this._session;
    this._removePraiseLayer();
    if (id) this._praiseDone.add(id);
    if (id && session && this._hass) {
      const payload = session.mine
        ? { type: 'task_organizer/my_praise_seen', praise_id: id }
        : { type: 'task_organizer/kid_praise_seen', kid_id: session.kidId, praise_id: id };
      if (!session.mine && session.pin) payload.pin = session.pin;
      this._hass.callWS(payload).then(() => this._fetchData()).catch((err) => console.error("TaskOrganizer Kids: could not mark praise as seen", err));
    }
    this._maybeShowPraise();
  }

  // ---------------------------------------------------------------------------
  // "My tasks" mode (own device): the viewer is the person linked to the HA user
  // ---------------------------------------------------------------------------

  _isMine() { return this._config.mode === 'mine'; }

  /** The kid (or, for an adult without kid profile, a minimal view model) of the viewer; null if no person is linked. */
  _mineKid() {
    const uid = this._hass && this._hass.user && this._hass.user.id;
    if (!uid) return null;
    const kid = this._kids().find(k => k.id === uid);
    if (kid) return kid;
    const person = this._persons()[uid];
    if (!person) return null;
    const adult = { id: uid, name: person.name, avatar: '🙂', color: '#4CAF50', adult: true, points: 0, goal: 0, wallet: 0,
      pct: 0, pctRaw: 0, age: null, isBirthday: false, birth_year: null, birthday: null, strict_until: null,
      has_pin: false, goal_reward: null, pendingCount: 0 };
    adult.duties = this._duties(adult);
    return adult;
  }

  /** The kid of the open session (mine mode: the viewer). */
  _sessionKid() {
    if (!this._session) return null;
    if (this._session.mine) return this._mineKid();
    return this._kids().find(k => k.id === this._session.kidId) || null;
  }

  /** Websocket payload of a kid command: PIN-checked `kid_*` on the shared tablet, `my_*` (no kid_id, no PIN) in mine mode. */
  _kidCmd(cmd, extra) {
    if (this._session.mine) return { type: `task_organizer/my_${cmd}`, ...extra };
    const payload = { type: `task_organizer/kid_${cmd}`, kid_id: this._session.kidId, ...extra };
    if (this._session.pin) payload.pin = this._session.pin;
    return payload;
  }

  // ---------------------------------------------------------------------------
  // Reward shop
  // ---------------------------------------------------------------------------

  /** Active rewards (the shop button is hidden without any). */
  _activeRewards() {
    return ((this.settings && this.settings.rewards) || []).filter(r => r && r.active !== false);
  }

  /** Active rewards this kid is old enough for, cheapest first. */
  _rewardsFor(kid) {
    const age = this._age(kid);
    return this._activeRewards().filter(r => !(parseInt(r.min_age) > 0) || age === null || age >= parseInt(r.min_age))
      .sort((a, b) => (a.cost - b.cost) || String(a.name).localeCompare(String(b.name)));
  }

  /** The savings-goal reward of a kid (active and old enough) or null. */
  _goalReward(kid) {
    return this._rewardsFor(kid).find(r => r.id === kid.goal_reward) || null;
  }

  _redemptionsFor(kidId) {
    return Object.values(this.redemptions || {}).filter(r => r.kid_id === kidId && r.status === 'pending')
      .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }

  /** Small bar on the home tile: "noch 12 ⭐ bis 🎲" or "🎲 bereit!". */
  _renderGoalBar(kid) {
    const reward = this._goalReward(kid);
    if (!reward) return '';
    const left = Math.max(0, reward.cost - kid.wallet);
    const pct = Math.min(100, Math.round((kid.wallet / reward.cost) * 100));
    const text = left <= 0
      ? this.localize('goal_ready', { emoji: reward.emoji || '🎁' })
      : this.localize('goal_left', { n: fmtKids(left), emoji: reward.emoji || '🎁' });
    return `<div class="goalbar ${left <= 0 ? 'ready' : ''}"><div class="goal-track"><div class="goal-fill" style="width:${pct}%"></div></div><div class="goal-text">${escKids(text)}</div></div>`;
  }

  /** The shop panel (replaces the two task columns in the kid view). */
  _renderShop(kid) {
    const rewards = this._rewardsFor(kid);
    const waiting = this._redemptionsFor(kid.id);
    const cards = rewards.map(r => {
      const left = Math.max(0, r.cost - kid.wallet);
      const can = left <= 0;
      const pct = Math.min(100, Math.round((kid.wallet / r.cost) * 100));
      const goalOn = kid.goal_reward === r.id;
      return `
        <article class="reward ${can ? 'can' : 'cant'} ${goalOn ? 'goal' : ''}">
          <div class="r-emoji" aria-hidden="true">${escKids(r.emoji || '🎁')}</div>
          <div class="r-name">${escKids(r.name)}</div>
          <div class="r-cost">⭐ ${fmtKids(r.cost)}</div>
          ${can ? `<div class="r-hint ok">${escKids(this.localize('shop_ready_hint'))}</div>`
                : `<div class="r-track"><div class="r-fill" style="width:${pct}%"></div></div><div class="r-hint">${escKids(this.localize('shop_need', { n: fmtKids(left) }))}</div>`}
          <div class="r-actions">
            <button class="btn btn-done" data-action="shop-redeem" data-reward="${escKids(r.id)}" ${can && !this._busy ? '' : 'disabled'}>🛍️ ${escKids(this.localize('shop_redeem'))}</button>
            <button class="goal-btn ${goalOn ? 'on' : ''}" data-action="shop-goal" data-reward="${escKids(r.id)}" aria-pressed="${goalOn}" ${this._busy ? 'disabled' : ''}>${goalOn ? '' : '⭐ '}${escKids(this.localize(goalOn ? 'shop_goal_on' : 'shop_goal'))}</button>
          </div>
        </article>`;
    }).join('');
    const waitHtml = waiting.map(w => `<div class="shop-wait">⏳ ${escKids(w.emoji || '')} ${escKids(w.name)} <span>${escKids(this.localize('shop_waiting'))}</span></div>`).join('');
    return `
      <div class="kv-body shopview">
        <section class="col col-shop">
          <h2>🛍️ ${escKids(this.localize('shop_title'))}</h2>
          <div class="wallet-big"><span>${escKids(this.localize('shop_balance'))}</span> <b>⭐ ${fmtKids(kid.wallet)}</b></div>
          <div class="col-scroll">
            ${waitHtml}
            <div class="reward-grid">${cards || `<div class="empty-state small">${escKids(this.localize('shop_empty'))}</div>`}</div>
          </div>
        </section>
      </div>`;
  }

  _openRedeem(rewardId) {
    const reward = this._activeRewards().find(r => r.id === rewardId);
    if (!reward) return;
    this._sheet = { type: 'redeem', rewardId, reward };
    this._render();
  }

  /** Redeem the reward of the open confirm sheet (PIN of the session; deducts at once). */
  async _redeemOk() {
    const sheet = this._sheet;
    if (!sheet || this._busy || !this._session) return;
    this._busy = true;
    this._sheet = null;
    this._render();
    try {
      const payload = this._kidCmd('redeem', { reward_id: sheet.rewardId });
      const res = await this._hass.callWS(payload);
      if (res.success) {
        this._busy = false;
        this._celebrate(0, '', false, { emoji: res.emoji || sheet.reward.emoji || '🎁', text: this.localize('shop_done') });
        this._fetchData();
        return;
      }
      this._handleActionError(res);
    } catch (err) {
      console.error("TaskOrganizer Kids: could not redeem", err);
      this._showToast(this.localize('err_generic'));
    }
    this._busy = false;
    this._render();
  }

  async _toggleGoal(rewardId) {
    if (this._busy || !this._session) return;
    const kid = this._sessionKid();
    this._busy = true;
    try {
      const payload = this._kidCmd('set_goal', { reward_id: kid && kid.goal_reward === rewardId ? null : rewardId });
      const res = await this._hass.callWS(payload);
      if (!res.success) this._handleActionError(res);
    } catch (err) {
      this._showToast(this.localize('err_generic'));
    }
    this._busy = false;
    this._fetchData();
    this._render();
  }

  _sortTasks(list) {
    const order = { basis: 0, auftrag: 1, bonus: 2 };
    return list.sort((a, b) =>
      (order[this._category(a)] - order[this._category(b)]) ||
      String(a.due_date).localeCompare(String(b.due_date)) ||
      String(a.name).localeCompare(String(b.name)));
  }

  /**
   * The open task of the same kid that makes `task` obsolete today (e.g. the
   * thorough room clean replaces the room blitz), or null. Mirrors
   * is_replaced() of the backend: `replaced_by_key` is a wizard key prefix.
   */
  _replacedBy(task) {
    const key = task.replaced_by_key;
    if (!key || typeof key !== 'string') return null;
    const mine = this._assignees(task);
    return Object.values(this.tasks).find(o =>
      o !== task && String(o.wizard_key || '').startsWith(`${key}:`) &&
      this._assignees(o).some(a => mine.includes(a)) && this._isOpen(o)) || null;
  }

  /** Order of the time windows: open (0) before "from HH:MM" (1) before over for today (2). */
  _windowRank(task) {
    const state = this._window(task).state;
    return state === 'open' ? 0 : (state === 'not_yet' ? 1 : 2);
  }

  /**
   * Due/overdue basis + auftrag tasks assigned to the kid (and age appropriate).
   * Replaced tasks are left out; currently available duties come first, then
   * the ones that start later (by start time), then the ones over for today.
   */
  _duties(kid) {
    const list = this._sortTasks(Object.values(this.tasks).filter(t =>
      ['basis', 'auftrag'].includes(this._category(t)) &&
      this._assignees(t).includes(kid.id) &&
      this._isOpen(t) && !this._expired(t) && this._oldEnough(t, kid) && !this._replacedBy(t)));
    const start = (t) => this._hhmm(t.available_from) || 0;
    const rank = new Map(list.map(t => [t, this._windowRank(t)]));
    // stable sort: inside a group the category / due date / name order stays
    return list.sort((a, b) => (rank.get(a) - rank.get(b)) ||
      (rank.get(a) === 1 ? start(a) - start(b) : 0));
  }

  /** Muted lines for today's replaced duties: [{ text }] (kid view only). */
  _replacedLines(kid) {
    return Object.values(this.tasks).filter(t =>
      ['basis', 'auftrag'].includes(this._category(t)) &&
      this._assignees(t).includes(kid.id) && this._isOpen(t) && !this._expired(t)).map(t => {
      const by = this._replacedBy(t);
      if (!by) return null;
      const short = (task) => {
        const name = String(task.name || '');
        return name.endsWith(` ${kid.name}`) ? name.slice(0, -(kid.name.length + 1)) : name;
      };
      return this.localize('replaced_today', { a: short(by), b: short(t) });
    }).filter(Boolean);
  }

  /** Due bonus tasks the kid may do (unassigned or assigned to the kid, old enough). */
  _bonusFor(kid) {
    return this._sortTasks(Object.values(this.tasks).filter(t =>
      this._category(t) === 'bonus' && this._isOpen(t) &&
      (this._assignees(t).length === 0 || this._assignees(t).includes(kid.id)) &&
      !this._expired(t) && this._oldEnough(t, kid)));
  }

  /** All currently due bonus tasks (for the bonus board on the home screen). */
  _allBonus() {
    return this._sortTasks(Object.values(this.tasks).filter(t =>
      this._category(t) === 'bonus' && this._isOpen(t) && !this._expired(t)));
  }

  /** Duties that count as "open" right now: tasks outside their time window do not. */
  _openDuties(kid) {
    return kid.duties.filter(t => this._window(t).state === 'open');
  }

  _basisOpenCount(kid) {
    return this._openDuties(kid).filter(t => this._category(t) === 'basis').length;
  }

  /**
   * A bonus task is locked only when it opted in ("requires_routine"), it is
   * not a spontaneous (ad-hoc) bonus and the kid has due duties inside their
   * time window open. Same rule as the backend (kids.bonus_needs_routine).
   */
  _bonusLocked(task, kid) {
    return !!task.requires_routine && !task.adhoc && this._basisOpenCount(kid) > 0;
  }

  // ---------------------------------------------------------------------------
  // Navigation / idle handling
  // ---------------------------------------------------------------------------

  _onPointerDown() {
    this._lastActivity = Date.now();
    this._ensureAudio();
  }

  _goHome() {
    if (this._isMine()) {            // no home screen on the own device: just close dialogs / the shop
      this._sheet = null;
      this._shop = false;
      this._busy = false;
      this._render();
      return;
    }
    this._bdayKid = null;
    this._stopBirthday();
    this._removeBirthdayLayer();
    this._removePraiseLayer();
    this._view = 'home';
    this._pendingKid = null;
    this._pin = '';
    this._pinMessage = '';
    this._session = null;
    this._sheet = null;
    this._shop = false;
    this._busy = false;
    this._render();
  }

  /** 1 second ticker: clock, idle timeout and PIN lock countdown. */
  _tick() {
    const clock = this.shadowRoot.getElementById('clock');
    if (clock) clock.textContent = new Date().toLocaleTimeString((this._hass && this._hass.language) || [], { hour: '2-digit', minute: '2-digit' });

    if (!this._isMine() && this._view !== 'home' && !this._celebrating &&
        Date.now() - this._lastActivity > this._config.timeout * 1000) {
      this._goHome();
      return;
    }
    // Every full minute: time windows open/close, countdowns tick, ad-hoc bonus expires
    const minuteKey = Math.floor(Date.now() / 60000);
    if (minuteKey !== this._minuteKey) {
      this._minuteKey = minuteKey;
      if (this._fetched && !this._busy && !this._celebrating) this._render();
    }
    if ((this._view === 'pin' || this._helperMode()) && this._lockUntil) {
      if (Date.now() >= this._lockUntil) {
        this._lockUntil = 0;
        this._pinMessage = '';
        this._render();
      } else {
        this._pinMessage = this.localize('err_locked', { s: Math.ceil((this._lockUntil - Date.now()) / 1000) });
        const el = this.shadowRoot.getElementById('pin-msg');
        if (el) el.textContent = this._pinMessage;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  _onClick(ev) {
    const el = ev.target.closest ? ev.target.closest('[data-action]') : null;
    if (!el || el.disabled) return;
    this._lastActivity = Date.now();
    this._ensureAudio();
    const action = el.dataset.action;

    if (action === 'open-kid') this._openKid(el.dataset.kid);
    else if (action === 'pin-digit') this._pinPress(el.dataset.digit);
    else if (action === 'pin-delete') this._pinDelete();
    else if (action === 'pin-cancel' && this._helperMode()) this._helperCancel();
    else if (action === 'pin-cancel' || action === 'back') this._goHome();
    else if (action === 'toggle-sub') this._toggleSubtask(el.dataset.task, parseInt(el.dataset.idx));
    else if (action === 'claim') this._claim(el.dataset.task);
    else if (action === 'complete') this._complete(el.dataset.task);
    else if (action === 'bday-close') this._closeBirthday();
    else if (action === 'praise-close') this._closePraise();
    else if (action === 'pa-skip') this._openConfirm('skip', el.dataset.task);
    else if (action === 'pa-complete') this._openConfirm('complete', el.dataset.task);
    else if (action === 'pa-undo') this._openConfirm('undo', null, el.dataset.id);
    else if (action === 'pa-postpone') this._openPostpone(el.dataset.task);
    else if (action === 'pp-choice') { this._sheet.choice = el.dataset.choice; this._render(); }
    else if (action === 'together') this._openTogether(el.dataset.task);
    else if (action === 'tg-toggle') this._toggleHelper(el.dataset.kid);
    else if (action === 'tg-next') this._togetherNext();
    else if (action === 'sheet-cancel') { this._sheet = null; this._render(); }
    else if (action === 'sheet-ok') this._sheetOk();
    else if (action === 'shop-open') { this._shop = true; this._render(); }
    else if (action === 'shop-close') { this._shop = false; this._sheet = null; this._render(); }
    else if (action === 'shop-redeem') this._openRedeem(el.dataset.reward);
    else if (action === 'shop-goal') this._toggleGoal(el.dataset.reward);
  }

  // ---------------------------------------------------------------------------
  // Parent actions on the task cards (only for admin / manager / parent users)
  // ---------------------------------------------------------------------------

  _isParent() {
    return ['admin', 'manager', 'parent'].includes(this._myRole);
  }

  _onChange(ev) {
    const el = ev.target;
    if (!el || !el.dataset || !el.dataset.field || !this._sheet) return;
    this._sheet[el.dataset.field] = el.value;
    this._render();
  }

  /** Completions of this kid today (one per completion), for the parents' undo button. */
  _doneToday(kid) {
    const today = this._localToday();
    const seen = new Set();
    return this.history.filter(h => (h.type || 'task') === 'task' && h.user_id === kid.id &&
      this._dateKey(h.timestamp) === today).filter(h => {
      const key = h.completion_id || h.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  _openConfirm(kind, taskId, historyId = null) {
    const entry = historyId ? this.history.find(h => h.id === historyId) : null;
    const task = taskId ? this.tasks[taskId] : null;
    if (!entry && !task) return;
    this._sheet = {
      type: 'confirm', kind, taskId, historyId,
      name: entry ? entry.task_name : task.name,
      points: entry ? entry.points : task.complexity
    };
    this._render();
  }

  _openPostpone(taskId) {
    const task = this.tasks[taskId];
    if (!task) return;
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    this._sheet = { type: 'postpone', taskId, name: task.name, choice: 'tomorrow', day: String(soon.getDate()), month: String(soon.getMonth() + 1) };
    this._render();
  }

  /** YYYY-MM-DD of a date in local time. */
  _ymdOf(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** First day the postponed task is back: tomorrow, the day after, or the next occurrence of day/month. */
  _postponeUntil(sheet) {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (sheet.choice === 'tomorrow' || sheet.choice === 'day2') {
      return this._ymdOf(new Date(base.getFullYear(), base.getMonth(), base.getDate() + (sheet.choice === 'tomorrow' ? 1 : 2)));
    }
    const day = parseInt(sheet.day), month = parseInt(sheet.month);
    for (let year = base.getFullYear(); year <= base.getFullYear() + 4; year++) {
      const d = new Date(year, month - 1, day);
      if (d.getMonth() === month - 1 && d.getDate() === day && d > base) return this._ymdOf(d);
    }
    return null;
  }

  async _sheetOk() {
    const sheet = this._sheet;
    if (!sheet || this._busy || !this._session) return;
    if (sheet.type === 'redeem') return this._redeemOk();
    const kid = this._sessionKid();
    let payload;
    let message;
    if (sheet.type === 'postpone') {
      const until = this._postponeUntil(sheet);
      if (!until) return;
      payload = { type: 'task_organizer/parent_task_action', task_id: sheet.taskId, action: 'postpone', until };
      message = this.localize('pa_postponed');
    } else if (sheet.kind === 'skip') {
      payload = { type: 'task_organizer/parent_task_action', task_id: sheet.taskId, action: 'skip_today' };
      message = this.localize('pa_skipped');
    } else if (sheet.kind === 'complete') {
      payload = { type: 'task_organizer/parent_complete_for', task_id: sheet.taskId, kid_id: this._session.kidId };
    } else {
      payload = { type: 'task_organizer/undo_completion', history_id: sheet.historyId };
      message = this.localize('pa_undone');
    }
    this._busy = true;
    try {
      const res = await this._hass.callWS(payload);
      if (res && res.success) {
        if (sheet.kind === 'complete') message = this.localize('pa_completed', { name: kid ? kid.name : '', n: fmtKids(res.points) });
        this._showToast(message);
      } else {
        this._showToast(this._errorText(res));
      }
    } catch (err) {
      console.error("TaskOrganizer Kids: parent action failed", err);
      this._showToast(this.localize('err_generic'));
    }
    this._busy = false;
    this._sheet = null;
    this._fetchData();
    this._render();
  }

  /** Icon row below a task title (parents only): skip today, postpone, complete for the kid. */
  _renderParentRow(task, kid) {
    const id = escKids(task.id);
    const btn = (action, icon, label) =>
      `<button class="pbtn" data-action="${action}" data-task="${id}" title="${escKids(label)}" aria-label="${escKids(label)}" ${this._busy ? 'disabled' : ''}>${icon}</button>`;
    return `<div class="pact" role="group">
      ${btn('pa-skip', '⏭️', this.localize('pa_skip'))}
      ${btn('pa-postpone', '⏸️', this.localize('pa_postpone'))}
      ${btn('pa-complete', '✅', this.localize('pa_complete', { name: kid.name }))}
    </div>`;
  }

  /** "Done today" list with undo buttons (parents only). */
  _renderDoneToday(kid) {
    const list = this._doneToday(kid);
    if (!list.length) return '';
    return `<div class="done-today">
      <div class="wait-title">✅ ${escKids(this.localize('pa_done_today'))} <span class="count">${list.length}</span></div>
      ${list.map(h => `
        <div class="wait-item">
          <div class="wait-name">${escKids(h.task_name)}</div>
          <div class="wait-pts">⭐ ${fmtKids(h.points)}</div>
          <button class="pbtn" data-action="pa-undo" data-id="${escKids(h.id)}" title="${escKids(this.localize('pa_undo'))}" aria-label="${escKids(this.localize('pa_undo'))}" ${this._busy ? 'disabled' : ''}>↩️</button>
        </div>`).join('')}
    </div>`;
  }

  /** Confirm dialog / postpone sheet of a parent action. */
  _renderSheet() {
    const sheet = this._sheet;
    if (!sheet) return '';
    const kid = this._sessionKid();
    const cancel = `<button class="sbtn" data-action="sheet-cancel">${escKids(this.localize('pa_cancel'))}</button>`;
    let body;
    if (sheet.type === 'redeem') {
      const r = sheet.reward;
      body = `
        <div class="sheet-title">🛍️ ${escKids(this.localize('shop_confirm', { emoji: r.emoji || '🎁', name: r.name, cost: fmtKids(r.cost) }))}</div>
        <div class="sheet-btns">${cancel}<button class="sbtn ok" data-action="sheet-ok">${escKids(this.localize('shop_redeem'))}</button></div>`;
    } else if (sheet.type === 'postpone') {
      const until = this._postponeUntil(sheet);
      const lang = (this._hass && this._hass.language) || undefined;
      const choice = (id, key) => `<button class="schoice ${sheet.choice === id ? 'on' : ''}" data-action="pp-choice" data-choice="${id}" aria-pressed="${sheet.choice === id}">${escKids(this.localize(key))}</button>`;
      const days = Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}" ${String(i + 1) === String(sheet.day) ? 'selected' : ''}>${i + 1}</option>`).join('');
      const months = Array.from({ length: 12 }, (_, i) =>
        `<option value="${i + 1}" ${String(i + 1) === String(sheet.month) ? 'selected' : ''}>${escKids(new Date(2000, i, 1).toLocaleString(lang, { month: 'long' }))}</option>`).join('');
      const when = until ? new Date(until + 'T12:00:00').toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'long' }) : '';
      body = `
        <div class="sheet-title">⏸️ ${escKids(this.localize('pa_postpone_title', { task: sheet.name }))}</div>
        <div class="schoices">${choice('tomorrow', 'pa_tomorrow')}${choice('day2', 'pa_day_after')}${choice('date', 'pa_date')}</div>
        ${sheet.choice === 'date' ? `<div class="sdate">
          <label>${escKids(this.localize('pa_day'))}<select data-field="day">${days}</select></label>
          <label>${escKids(this.localize('pa_month'))}<select data-field="month">${months}</select></label></div>` : ''}
        <div class="sheet-hint">${until ? `${escKids(this.localize('pa_back_on'))}: ${escKids(when)}` : ''}</div>
        <div class="sheet-btns">${cancel}<button class="sbtn ok" data-action="sheet-ok" ${until ? '' : 'disabled'}>${escKids(this.localize('pa_postpone_ok'))}</button></div>`;
    } else {
      const key = { skip: 'pa_confirm_skip', complete: 'pa_confirm_complete', undo: 'pa_confirm_undo' }[sheet.kind];
      const icon = { skip: '⏭️', complete: '✅', undo: '↩️' }[sheet.kind];
      body = `
        <div class="sheet-title">${icon} ${escKids(this.localize(key, { task: sheet.name, name: kid ? kid.name : '', n: fmtKids(sheet.points) }))}</div>
        <div class="sheet-btns">${cancel}<button class="sbtn ok" data-action="sheet-ok">${escKids(this.localize('pa_ok'))}</button></div>`;
    }
    return `<div class="overlay" role="dialog" aria-modal="true"><div class="sheet" style="--kc:${kid ? kid.color : '#4CAF50'}">${body}</div></div>`;
  }

  // ---------------------------------------------------------------------------
  // Doing a task together: pick the helpers, each one confirms with the own PIN
  // ---------------------------------------------------------------------------

  /** Whether the task may be done together (field missing -> bonus/auftrag yes, basis no). */
  _allowTogether(task) {
    return task.allow_together === undefined || task.allow_together === null ? this._category(task) !== 'basis' : !!task.allow_together;
  }

  /** Other kids who may help with a task (old enough; the assignment does not matter). */
  _helperCandidates(task, kid) {
    return this._kids().filter(k => k.id !== kid.id && this._oldEnough(task, k));
  }

  _helperMode() {
    return !!(this._sheet && this._sheet.type === 'together' && this._sheet.step === 'pin');
  }

  _openTogether(taskId) {
    const task = this.tasks[taskId];
    if (!task || this._busy) return;
    this._sheet = { type: 'together', taskId, name: task.name, step: 'pick', selected: [], pins: {} };
    this._render();
  }

  _toggleHelper(kidId) {
    const sheet = this._sheet;
    if (!sheet || sheet.type !== 'together') return;
    const i = sheet.selected.indexOf(kidId);
    if (i >= 0) sheet.selected.splice(i, 1); else sheet.selected.push(kidId);
    delete sheet.pins[kidId];
    this._render();
  }

  /** Next helper that still has to confirm with a PIN (kids without PIN need only the tap). */
  _nextHelperPin() {
    const sheet = this._sheet;
    const kids = this._kids();
    return sheet.selected.find(id => !(id in sheet.pins) && (kids.find(k => k.id === id) || {}).has_pin) || null;
  }

  _togetherNext() {
    const sheet = this._sheet;
    if (!sheet || !sheet.selected.length) return;
    this._advanceTogether();
  }

  _advanceTogether() {
    const next = this._nextHelperPin();
    if (!next) {
      this._completeTogether();
      return;
    }
    this._sheet.step = 'pin';
    this._pendingKid = next;
    this._pin = '';
    this._pinMessage = '';
    this._lockUntil = 0;
    this._render();
  }

  _helperVerified(kidId, pin) {
    this._sheet.pins[kidId] = pin;
    this._pendingKid = null;
    this._pin = '';
    this._pinMessage = '';
    this._sheet.step = 'pick';
    this._advanceTogether();
  }

  _helperCancel() {
    this._sheet.step = 'pick';
    this._pendingKid = null;
    this._pin = '';
    this._pinMessage = '';
    this._render();
  }

  async _completeTogether() {
    const sheet = this._sheet;
    if (this._busy || !this._session) return;
    this._busy = true;
    sheet.step = 'pick';
    this._render();
    const kids = this._kids();
    const kid = kids.find(k => k.id === this._session.kidId);
    const helpers = sheet.selected.map(id => (sheet.pins[id] ? { kid_id: id, pin: sheet.pins[id] } : { kid_id: id }));
    try {
      const payload = { type: 'task_organizer/kid_complete_task', task_id: sheet.taskId, kid_id: this._session.kidId, helpers };
      if (this._session.pin) payload.pin = this._session.pin;
      const res = await this._hass.callWS(payload);
      if (res.success) {
        const names = [kid].concat(sheet.selected.map(id => kids.find(k => k.id === id))).filter(Boolean).map(k => k.name);
        this._busy = false;
        this._sheet = null;
        this._celebrate((parseFloat(res.points) || 0) + (parseFloat(res.team_bonus) || 0), names.join(' & '), !!res.pending);
        this._fetchData();
        return;
      }
      if (res.helper_id) {
        // A problem with one helper: stay in the sheet, that helper has to confirm again
        const helper = kids.find(k => k.id === res.helper_id);
        delete sheet.pins[res.helper_id];
        this._showToast(this._helperErrorText(res, helper ? helper.name : ''));
      } else {
        this._sheet = null;
        this._handleActionError(res);
      }
    } catch (err) {
      console.error("TaskOrganizer Kids: could not complete task together", err);
      this._showToast(this.localize('err_generic'));
    }
    this._busy = false;
    this._render();
  }

  _helperErrorText(res, name) {
    const key = `err_helper_${res.error}`;
    const text = this.localize(key, { name, s: res.locked_seconds || 60 });
    return text === key ? this._errorText(res) : text;
  }

  _renderTogether() {
    const sheet = this._sheet;
    const task = this.tasks[sheet.taskId];
    const kid = this._sessionKid();
    if (!task || !kid) return '';
    const candidates = this._helperCandidates(task, kid);
    const chips = candidates.map(k => {
      const on = sheet.selected.includes(k.id);
      return `<button class="hchip ${on ? 'on' : ''}" style="--kc:${k.color}" data-action="tg-toggle" data-kid="${escKids(k.id)}" aria-pressed="${on}">
        <span class="havatar">${escKids(k.avatar)}</span><span class="hname">${escKids(k.name)}</span>${on ? '<span class="hcheck">✓</span>' : ''}</button>`;
    }).join('');
    const n = sheet.selected.length + 1;
    const bonus = this.settings.team_bonus === undefined ? 1 : parseInt(this.settings.team_bonus) || 0;
    const share = Math.round((parseFloat(task.complexity) || 0) / n * 10) / 10;
    const hint = sheet.selected.length
      ? this.localize('together_each', { n: fmtKids(share), bonus: bonus > 0 ? this.localize('together_bonus', { b: bonus }) : '' }) : '';
    return `<div class="overlay" role="dialog" aria-modal="true"><div class="sheet" style="--kc:${kid.color}">
      <div class="sheet-title">👫 ${escKids(this.localize('together_title', { task: task.name }))}</div>
      <div class="sheet-hint ask">${escKids(this.localize('together_ask'))}</div>
      <div class="hchips">${chips || escKids(this.localize('helper_none'))}</div>
      <div class="sheet-hint">${escKids(hint)}</div>
      <div class="sheet-btns"><button class="sbtn" data-action="sheet-cancel">${escKids(this.localize('pa_cancel'))}</button>
        <button class="sbtn ok" data-action="tg-next" ${sheet.selected.length && !this._busy ? '' : 'disabled'}>${escKids(this.localize('together_next'))}</button></div>
    </div></div>`;
  }

  _openKid(kidId) {
    const kid = this._kids().find(k => k.id === kidId);
    if (!kid) return;
    this._pendingKid = kidId;
    this._pin = '';
    this._pinMessage = '';
    if (!kid.has_pin) {
      this._enterKid(kidId, null);
      return;
    }
    this._view = 'pin';
    this._render();
  }

  _enterKid(kidId, pin) {
    this._session = { kidId, pin };
    this._view = 'kid';
    this._pendingKid = null;
    this._pin = '';
    this._pinMessage = '';
    this._lastActivity = Date.now();
    const kid = this._kids().find(k => k.id === kidId);
    this._bdayKid = kid && kid.isBirthday ? kidId : null;
    this._render();
    if (this._bdayKid) this._startBirthday();
    else this._maybeShowPraise();
  }

  /**
   * Birthday overlay: confetti + "Happy Birthday" melody. It lives in the #fx
   * layer so that data refreshes (which re-render #app) do not interrupt it.
   */
  _startBirthday() {
    const fx = this.shadowRoot.getElementById('fx');
    const kid = this._kids().find(k => k.id === this._bdayKid);
    if (!fx || !kid) return;
    this._removeBirthdayLayer();
    const layer = document.createElement('div');
    layer.className = 'bday-layer';
    layer.setAttribute('role', 'dialog');
    layer.innerHTML = `
      <canvas id="bday-confetti"></canvas>
      <div class="bday-card" style="--kc:${kid.color}">
        <div class="bday-cake">🎂</div>
        <div class="bday-title">${escKids(this.localize('bday_title', { name: kid.name }))}</div>
        <div class="bday-age">${escKids(this.localize('bday_age', { age: kid.age === null ? '' : kid.age }))}</div>
        <button class="btn btn-done bday-go" data-action="bday-close">${escKids(this.localize('bday_go'))} 🎉</button>
      </div>`;
    fx.appendChild(layer);
    this._playBirthday();
    this._startConfetti(layer.querySelector('canvas'), 9000);
  }

  _removeBirthdayLayer() {
    const layer = this.shadowRoot.querySelector('.bday-layer');
    if (layer) layer.remove();
  }

  _closeBirthday() {
    this._bdayKid = null;
    this._stopBirthday();
    this._removeBirthdayLayer();
    this._maybeShowPraise();
  }

  _pinPress(digit) {
    if (this._busy || this._lockUntil > Date.now() || this._pin.length >= 4) return;
    this._pin += digit;
    this._pinMessage = '';
    this._render();
    if (this._pin.length === 4) this._submitPin();
  }

  _pinDelete() {
    if (this._busy || !this._pin.length) return;
    this._pin = this._pin.slice(0, -1);
    this._render();
  }

  async _submitPin() {
    const kidId = this._pendingKid;
    const pin = this._pin;
    this._busy = true;
    try {
      const res = await this._hass.callWS({ type: 'task_organizer/kid_verify_pin', kid_id: kidId, pin });
      this._busy = false;
      if (res.success) {
        if (this._helperMode()) this._helperVerified(kidId, pin);
        else this._enterKid(kidId, pin);
        return;
      }
      this._pin = '';
      if (res.error === 'locked') {
        this._lockUntil = Date.now() + (res.locked_seconds || 60) * 1000;
        this._pinMessage = this.localize('err_locked', { s: res.locked_seconds || 60 });
      } else {
        this._pinMessage = this._errorText(res);
      }
      this._shake = true;
      this._render();
      setTimeout(() => {
        this._shake = false;
        const dots = this.shadowRoot.querySelector('.dots');
        if (dots) dots.classList.remove('shake');
      }, 700);
    } catch (err) {
      this._busy = false;
      this._pin = '';
      this._pinMessage = this.localize('err_generic');
      this._render();
    }
  }

  /** Kid friendly text for an error result of the backend. */
  _errorText(res) {
    const code = res && res.error;
    if (code === 'locked') return this.localize('err_locked', { s: res.locked_seconds || 60 });
    if (code === 'not_found') return this.localize('err_not_eligible');
    if (code === 'not_yet' && res.available_from) {
      return `${this.localize('err_not_yet')} (${this.localize('from_time', { t: res.available_from })})`;
    }
    const key = `err_${code}`;
    const text = this.localize(key);
    return text === key ? this.localize('err_generic') : text;
  }

  _showToast(message) {
    const fx = this.shadowRoot.getElementById('fx');
    if (!fx) return;
    let toast = fx.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'alert');
      fx.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.remove(), 4500);
  }

  /** Handles a non-success result of kid_complete_task / kid_claim_task. */
  _handleActionError(res) {
    this._showToast(this._errorText(res));
    if (res && (res.error === 'wrong_pin' || res.error === 'locked' || res.error === 'unknown_kid')) {
      this._goHome();
    }
    this._fetchData();
  }

  /** Toggles a subtask (same mechanism as the main card: edit_task with the subtasks list). */
  async _toggleSubtask(taskId, index) {
    const task = this.tasks[taskId];
    if (!task || !Array.isArray(task.subtasks) || !task.subtasks[index]) return;
    const done = !task.subtasks[index].done;
    task.subtasks = task.subtasks.map((st, i) => i === index ? { ...st, done } : st);
    this._render();
    try {
      // Kid/own-device command: the tablet user has no role for edit_task
      const res = this._session
        ? await this._hass.callWS(this._kidCmd('toggle_step', { task_id: taskId, index, done }))
        : await this._hass.callWS({ type: 'task_organizer/edit_task', task_id: taskId, subtasks: task.subtasks });
      if (res && res.success === false) { this._handleActionError(res); this._fetchData(); }
    } catch (err) {
      console.error("TaskOrganizer Kids: could not save subtask", err);
      this._showToast(this.localize('err_generic'));
      this._fetchData();
    }
  }

  async _claim(taskId) {
    if (this._busy || !this._session) return;
    this._busy = true;
    this._render();
    try {
      const payload = this._kidCmd('claim_task', { task_id: taskId });
      const res = await this._hass.callWS(payload);
      if (res.success) {
        const task = this.tasks[taskId];
        if (task) { task.claimed_by = this._session.kidId; task.claimed_until = res.claimed_until; }
      } else {
        this._handleActionError(res);
      }
    } catch (err) {
      this._showToast(this.localize('err_generic'));
    }
    this._busy = false;
    this._render();
  }

  async _complete(taskId) {
    if (this._busy || !this._session) return;
    this._busy = true;
    this._render();
    const kid = this._sessionKid();
    try {
      const payload = this._kidCmd('complete_task', { task_id: taskId });
      const res = await this._hass.callWS(payload);
      if (res.success) {
        this._busy = false;
        this._celebrate(res.points, kid ? kid.name : '', !!res.pending);
        this._fetchData();
        return;
      }
      this._handleActionError(res);
    } catch (err) {
      console.error("TaskOrganizer Kids: could not complete task", err);
      this._showToast(this.localize('err_generic'));
    }
    this._busy = false;
    this._render();
  }

  // ---------------------------------------------------------------------------
  // Celebration: confetti (canvas) + sound (WebAudio) + "+N Punkte!"
  // ---------------------------------------------------------------------------

  /**
   * Shows the celebration and returns to the home screen afterwards.
   * @param {number} points - Awarded points.
   * @param {string} name - Name of the kid.
   */
  _celebrate(points, name, pending = false, reward = null) {
    const fx = this.shadowRoot.getElementById('fx');
    if (!fx) return;
    this._celebrating = true;
    const layer = document.createElement('div');
    layer.className = 'celebrate' + (pending || reward ? ' soft' : '');
    // A completion that waits for approval gets a softer celebration (no points yet)
    layer.innerHTML = reward ? `
      <canvas id="confetti"></canvas>
      <div class="celebrate-text">
        <div class="plus">${escKids(reward.emoji)}</div>
        <div class="great">${escKids(reward.text)}</div>
      </div>` : pending ? `
      <canvas id="confetti"></canvas>
      <div class="celebrate-text">
        <div class="plus wait">⏳</div>
        <div class="great">${escKids(this.localize('pending_cheer'))}</div>
      </div>` : `
      <canvas id="confetti"></canvas>
      <div class="celebrate-text">
        <div class="plus">${escKids(this.localize('plus_points', { n: fmtKids(points) }))}</div>
        <div class="great">${escKids(this.localize('great', { name }))}</div>
      </div>`;
    fx.appendChild(layer);
    if (pending) this._playSoft(); else this._playSuccess();
    this._startConfetti(layer.querySelector('canvas'), 2300, pending);

    clearTimeout(this._celebrationTimer);
    this._celebrationTimer = setTimeout(() => {
      layer.classList.add('fade');
      setTimeout(() => layer.remove(), 400);
      this._celebrating = false;
      this._lastActivity = Date.now();
      if (this._config.return_home_after_done && !reward && !this._isMine()) this._goHome();
      else this._render();
    }, 2300);
  }

  _startConfetti(canvas, duration = 2300, soft = false) {
    if (!canvas) return;
    const w = canvas.width = canvas.clientWidth || 1280;
    const h = canvas.height = canvas.clientHeight || 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const colors = soft
      ? ['#FFE082', '#B3E5FC', '#C8E6C9', '#F8BBD0', '#D1C4E9']
      : ['#FF5252', '#FFC107', '#4CAF50', '#2196F3', '#E040FB', '#FF9800', '#00BCD4', '#FFEB3B'];
    const particles = [];
    const count = soft ? 60 : (duration > 3000 ? 140 : 170);
    for (let i = 0; i < count; i++) {
      const fountain = i % 2 === 0;
      particles.push({
        x: fountain ? w / 2 + (Math.random() - 0.5) * 120 : Math.random() * w,
        y: fountain ? h * 0.62 : -Math.random() * h * 0.5,
        vx: fountain ? (Math.random() - 0.5) * 16 : (Math.random() - 0.5) * 4,
        vy: fountain ? -(8 + Math.random() * 12) : 2 + Math.random() * 4,
        size: 9 + Math.random() * 12,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        round: Math.random() < 0.3
      });
    }
    const start = performance.now();
    const frame = (now) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.vy += 0.28;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (duration > 3000 && p.y > h + 30 && elapsed < duration - 1500) {
          // birthday: keep it raining from the top for the whole song
          p.x = Math.random() * w; p.y = -20; p.vx = (Math.random() - 0.5) * 4; p.vy = 2 + Math.random() * 4;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, (duration - elapsed) / 600));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        }
        ctx.restore();
      }
      if (elapsed < duration && canvas.isConnected) this._rafId = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    };
    this._rafId = requestAnimationFrame(frame);
  }

  _ensureAudio() {
    if (this._config.sound === false) return;
    try {
      if (!this._audio) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) this._audio = new Ctx();
      }
      if (this._audio && this._audio.state === 'suspended') this._audio.resume();
    } catch (err) { /* sound is optional */ }
  }

  /** Cheerful rising arpeggio generated with WebAudio (no sound files). */
  _playSuccess() {
    if (this._config.sound === false) return;
    try {
      this._ensureAudio();
      const ctx = this._audio;
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      const t0 = ctx.currentTime + 0.02;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = t0 + i * 0.09;
        const len = i === notes.length - 1 ? 0.55 : 0.18;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + len + 0.05);
      });
    } catch (err) { /* sound is optional */ }
  }

  /** Two gentle notes for a completion that waits for approval. */
  _playSoft() {
    if (this._config.sound === false) return;
    try {
      this._ensureAudio();
      const ctx = this._audio;
      if (!ctx) return;
      const t0 = ctx.currentTime + 0.02;
      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = t0 + i * 0.16;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (err) { /* sound is optional */ }
  }

  /** Three soft rising notes for a new praise (sine, quiet). */
  _playPraise() {
    if (this._config.sound === false) return;
    try {
      this._ensureAudio();
      const ctx = this._audio;
      if (!ctx) return;
      const t0 = ctx.currentTime + 0.05;
      [659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = t0 + i * 0.16;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    } catch (err) { /* sound is optional */ }
  }

  /** "Happy Birthday to You" (public domain melody) generated with WebAudio. */
  _playBirthday() {
    this._stopBirthday();
    if (this._config.sound === false) return;
    try {
      this._ensureAudio();
      const ctx = this._audio;
      if (!ctx) return;
      const G4 = 392.0, A4 = 440.0, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
      const song = [
        [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
        [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
        [G4, 0.75], [G4, 0.25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 1],
        [F5, 0.75], [F5, 0.25], [E5, 1], [C5, 1], [D5, 1], [C5, 2]
      ];
      const beat = 0.4;
      let t = ctx.currentTime + 0.1;
      for (const [freq, beats] of song) {
        const len = beats * beat;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.24, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.12, len * 0.96));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + len + 0.05);
        this._bdayNodes.push(osc);
        t += len;
      }
    } catch (err) { /* sound is optional */ }
  }

  _stopBirthday() {
    for (const osc of this._bdayNodes) {
      try { osc.stop(); } catch (err) { /* already stopped */ }
    }
    this._bdayNodes = [];
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  _render() {
    if (!this._hass) return;
    const app = this.shadowRoot.getElementById('app');
    if (!app) return;

    // Keep scroll positions across re-renders (data refresh events)
    const scrolls = Array.from(app.querySelectorAll('.col-scroll, .board-list')).map(e => [e.scrollTop, e.scrollLeft]);

    let html;
    if (!this._fetched) {
      html = `<div class="root"><div class="empty-state">${escKids(this.localize('loading'))}</div></div>`;
    } else if (this._isMine()) {
      const me = this._mineKid();
      if (!me) {
        this._session = null;
        html = `<div class="root"><div class="empty-state">🙋 ${escKids(this.localize('mine_no_person'))}</div></div>`;
      } else {
        this._session = { kidId: me.id, pin: null, mine: true };
        this._view = 'kid';
        html = this._renderKidView();
      }
    } else if (this._view === 'kid' && this._session) {
      html = this._renderKidView();
    } else {
      html = this._renderHome();
      if (this._view === 'pin') html += this._renderPin();
    }
    app.innerHTML = html;

    app.querySelectorAll('.col-scroll, .board-list').forEach((e, i) => {
      if (scrolls[i]) { e.scrollTop = scrolls[i][0]; e.scrollLeft = scrolls[i][1]; }
    });
    if (this._shake) {
      const dots = app.querySelector('.dots');
      if (dots) dots.classList.add('shake');
    }
    this._updateScrollHints();
    if (this._fetched && this._isMine() && this._session) this._maybeShowPraise();
  }

  /** Marks columns that have more content below (shows a fade + bouncing arrow). */
  _updateScrollHints() {
    this.shadowRoot.querySelectorAll('.col').forEach(col => {
      const sc = col.querySelector('.col-scroll');
      if (!sc) return;
      col.classList.toggle('has-more', sc.scrollHeight - sc.scrollTop - sc.clientHeight > 12);
    });
  }

  /**
   * SVG progress ring around the avatar. Above 100 % further laps are drawn on
   * top of the full ring in darker shades (like Apple's activity rings) with a
   * soft shadow at the round end so the overlap stays visible; a third lap is
   * darker still, further laps stay full.
   */
  _ring(kid, size, stroke) {
    const r = KIDS_RING_RADIUS;
    const dash = KIDS_RING_CIRCUMFERENCE;
    const arc = (fraction, color) => `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
          stroke-linecap="round" stroke-dasharray="${dash}" stroke-dashoffset="${dash * (1 - fraction)}" transform="rotate(-90 60 60)"/>`;
    const shadow = (fraction) => {
      const a = 2 * Math.PI * fraction - Math.PI / 2;
      return `<circle cx="${(60 + r * Math.cos(a)).toFixed(2)}" cy="${(60 + r * Math.sin(a)).toFixed(2)}" r="${stroke / 2}" fill="#000" fill-opacity="0.45" filter="url(#kring-shadow)"/>`;
    };
    let laps = '';
    if (kid.goal > 0) {
      const raw = Math.max(0, kid.pctRaw === undefined ? kid.pct : kid.pctRaw) / 100;
      // Dark theme: further laps get lighter (dark shades vanish on a dark background)
      const dark = !!(this._hass && this._hass.themes && this._hass.themes.darkMode);
      const shades = dark
        ? ['var(--kc)', 'color-mix(in srgb, var(--kc) 55%, #fff)', 'color-mix(in srgb, var(--kc) 25%, #fff)']
        : ['var(--kc)', 'color-mix(in srgb, var(--kc) 68%, #000)', 'color-mix(in srgb, var(--kc) 42%, #000)'];
      laps = arc(Math.min(1, raw), shades[0]);
      for (let lap = 1; lap < 3 && raw > lap; lap++) {
        const fraction = Math.min(1, raw - lap);
        laps += shadow(fraction) + arc(fraction, shades[lap]);
      }
    }
    return `
      <svg class="ring" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
        <defs><filter id="kring-shadow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${(stroke / 5).toFixed(1)}"/></filter></defs>
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="color-mix(in srgb, var(--kc) 22%, transparent)" stroke-width="${stroke}"/>
        ${laps}
      </svg>`;
  }

  _pointsLabel(kid) {
    const over = kid.goal > 0 && kid.pctRaw > 100 ? `<span class="pct-over">${kid.pctRaw} %</span>` : '';
    return kid.goal > 0
      ? `⭐ ${fmtKids(kid.points)} <small>/ ${fmtKids(kid.goal)}</small>${over}`
      : `⭐ ${fmtKids(kid.points)}`;
  }

  _renderHome() {
    const kids = this._kids();
    const title = this._config.title || this.localize('title');
    const now = new Date().toLocaleTimeString((this._hass && this._hass.language) || [], { hour: '2-digit', minute: '2-digit' });

    const tiles = kids.map(kid => {
      const open = this._openDuties(kid).length;
      const badge = open > 0
        ? `<div class="badge open">${escKids(open === 1 ? this.localize('tasks_open_one') : this.localize('tasks_open', { n: open }))}</div>`
        : `<div class="badge ok">${escKids(this.localize('all_done_badge'))}</div>`;
      const waiting = kid.pendingCount > 0 ? `<div class="badge wait" title="${escKids(this.localize('waiting_title'))}">⏳ ${kid.pendingCount}</div>` : '';
      const balloons = kid.isBirthday
        ? '<span class="balloon b1" aria-hidden="true">🎈</span><span class="balloon b2" aria-hidden="true">🎈</span><span class="balloon b3" aria-hidden="true">🎈</span>'
        : '';
      return `
        <button class="tile ${kid.isBirthday ? 'bday' : ''}" style="--kc:${kid.color}" data-action="open-kid" data-kid="${escKids(kid.id)}">
          ${balloons}
          <div class="ring-wrap">
            ${kid.isBirthday ? '<div class="crown" aria-hidden="true">👑</div>' : ''}
            ${this._ring(kid, 168, 11)}
            <div class="avatar">${escKids(kid.avatar)}</div>
            ${kid.goal > 0 && kid.pct >= 100 ? '<div class="trophy">🏆</div>' : ''}
          </div>
          <div class="name">${escKids(kid.name)}</div>
          <div class="pts">${this._pointsLabel(kid)}</div>
          ${this._renderGoalBar(kid)}
          <div class="badges">${badge}${waiting}</div>
          ${kid.unseenPraise.length ? `<span class="praise-tag" role="img" aria-label="${escKids(this.localize('praise_tag'))}">${escKids(kid.unseenPraise[0].sticker || '❤️')}</span>` : ''}
        </button>`
    }).join('');
    const banners = kids.filter(k => k.isBirthday).map(k =>
      `<div class="bday-banner" style="--kc:${k.color}">${escKids(this.localize('bday_banner', { name: k.name, age: k.age === null ? '' : k.age }))}</div>`).join('');

    return `
      <div class="root home">
        <header class="top">
          <div class="title">${escKids(title)}</div>
          <div class="clock" id="clock">${escKids(now)}</div>
        </header>
        ${banners}
        <section class="tiles">${tiles || `<div class="empty-state">${escKids(this.localize('no_kids'))}</div>`}</section>
        ${this._config.show_family_goal ? this._renderFamily(kids) : ''}
        ${this._config.show_bonus_board ? this._renderBoard(kids) : ''}
      </div>`;
  }

  _renderFamily(kids) {
    const goal = this.settings.family_goal || {};
    const target = parseFloat(goal.points) || 0;
    if (target <= 0) return '';
    // Approved task points of the period, computed by the backend (birthday bonus,
    // manual bonus and penalties do not count); fall back to the kids' sum for old backends
    const total = this.familyPoints !== null && !isNaN(this.familyPoints)
      ? this.familyPoints : kids.reduce((sum, k) => sum + k.points, 0);
    const pct = Math.min(100, Math.round((total / target) * 100));
    const reached = total >= target;
    return `
      <section class="family ${reached ? 'reached' : ''}">
        <div class="fam-label">
          <div class="fam-title">🚀 ${escKids(this.localize('family_rocket'))}</div>
          ${goal.reward ? `<div class="fam-reward">🎁 ${escKids(this.localize('reward'))}: <b>${escKids(goal.reward)}</b></div>` : ''}
        </div>
        <div class="fam-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="fam-fill" style="width:${pct}%"></div>
          <div class="fam-rocket" style="left:${pct}%">🚀</div>
        </div>
        <div class="fam-num">${reached ? '🎉 ' + escKids(this.localize('goal_reached')) : `⭐ ${fmtKids(total)} <small>/ ${fmtKids(target)}</small>`}</div>
      </section>`;
  }

  _renderBoard(kids) {
    const persons = {};
    kids.forEach(k => { persons[k.id] = k; });
    const chips = this._allBonus().map(task => {
      const claimer = this._claimActive(task) ? persons[task.claimed_by] : null;
      const minAge = parseInt(task.min_age) || 0;
      return `
        <div class="chip ${claimer ? 'claimed' : ''}">
          <div class="chip-icon"><ha-icon icon="${escKids(task.icon || 'mdi:star')}"></ha-icon></div>
          <div class="chip-text">
            <div class="chip-name">${escKids(task.name)}</div>
            <div class="chip-meta">⭐ ${fmtKids(task.complexity)}${minAge > 0 ? ` · ${escKids(this.localize('min_age_badge', { age: minAge }))}` : ''}${task.expires_at ? ` · ⏳ ${escKids(this.localize('until_time', { t: this._clockText(task.expires_at) }))}` : ''}</div>
          </div>
          ${claimer ? `<div class="chip-claim" style="--kc:${claimer.color}" title="${escKids(claimer.name)}">${escKids(claimer.avatar)}</div>` : ''}
        </div>`;
    }).join('');
    return `
      <section class="board">
        <div class="board-title">🎁 ${escKids(this.localize('bonus_board'))}</div>
        <div class="board-list">${chips || `<div class="board-empty">${escKids(this.localize('no_bonus_board'))}</div>`}</div>
      </section>`;
  }

  _renderPin() {
    const kid = this._kids().find(k => k.id === this._pendingKid);
    if (!kid) return '';
    const locked = this._lockUntil > Date.now();
    const dots = [0, 1, 2, 3].map(i => `<span class="dot ${i < this._pin.length ? 'on' : ''}"></span>`).join('');
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d =>
      `<button class="key" data-action="pin-digit" data-digit="${d}" ${locked ? 'disabled' : ''} aria-label="${d}">${d}</button>`).join('');
    return `
      <div class="overlay" role="dialog" aria-modal="true">
        <div class="pin-dialog" style="--kc:${kid.color}">
          <div class="pin-left">
            <div class="pin-avatar">${escKids(kid.avatar)}</div>
            <div class="pin-hello">${escKids(this.localize('hello', { name: kid.name }))}</div>
            <div class="pin-ask">${escKids(this.localize(this._helperMode() ? 'helper_pin_ask' : 'enter_pin'))}</div>
            <div class="dots">${dots}</div>
            <div class="pin-msg" id="pin-msg" role="alert">${escKids(this._pinMessage)}</div>
          </div>
          <div class="pad">
            ${keys}
            <button class="key key-aux" data-action="pin-cancel" aria-label="${escKids(this.localize('pin_cancel'))}">✖</button>
            <button class="key" data-action="pin-digit" data-digit="0" ${locked ? 'disabled' : ''} aria-label="0">0</button>
            <button class="key key-aux" data-action="pin-delete" aria-label="${escKids(this.localize('pin_delete'))}">⌫</button>
          </div>
        </div>
      </div>`;
  }

  _renderKidView() {
    const kid = this._sessionKid();
    if (!kid) return this._renderHome();
    const adult = !!kid.adult;
    const mine = this._isMine();
    const duties = kid.duties;
    const bonus = adult ? [] : this._bonusFor(kid);
    const persons = {};
    this._kids().forEach(k => { persons[k.id] = k; });

    const waiting = this._pendingFor(kid.id);
    const dutyHtml = (duties.length
      ? duties.map(t => this._renderTask(t, kid, 'duty', persons)).join('')
      : `<div class="empty-state small">🎉 ${escKids(this.localize('no_tasks'))}</div>`)
      + this._renderReplaced(kid) + this._renderWaiting(waiting) + this._renderPrivate(kid)
      + (this._isParent() ? this._renderDoneToday(kid) : '');
    const bonusHtml = bonus.length
      ? bonus.map(t => this._renderTask(t, kid, this._bonusLocked(t, kid) ? 'locked' : 'bonus', persons)).join('')
      : `<div class="empty-state small">😴 ${escKids(this.localize('no_bonus'))}</div>`;

    return `
      <div class="root kidview ${kid.isBirthday ? 'bday' : ''} ${adult ? 'adult' : ''}" style="--kc:${kid.color}">
        <header class="kv-head">
          ${!mine || this._shop ? `<button class="back" data-action="${this._shop ? 'shop-close' : 'back'}" aria-label="${escKids(this.localize('back'))}"><span class="back-arrow">⬅</span><span class="back-label"> ${escKids(this.localize('back'))}</span></button>` : ''}
          <div class="kv-who">
            <div class="ring-wrap small">
              ${kid.isBirthday ? '<div class="crown" aria-hidden="true">👑</div>' : ''}
              ${adult ? '' : this._ring(kid, 104, 11)}
              <div class="avatar">${escKids(kid.avatar)}</div>
            </div>
            <div>
              <div class="kv-name">${escKids(kid.name)}</div>
              ${adult ? '' : `<div class="kv-pts">${this._pointsLabel(kid)}</div>`}
            </div>
          </div>
          ${!adult && this._activeRewards().length && !this._shop ? `<button class="shop-btn" data-action="shop-open">🛍️<span class="shop-label"> ${escKids(this.localize('shop'))}</span><span class="shop-bal">⭐ ${fmtKids(kid.wallet)}</span></button>` : ''}
        </header>
        ${kid.isBirthday && !this._shop ? this._renderParty(kid) : ''}
        ${this._shop ? this._renderShop(kid) : `<div class="kv-body">
          <section class="col">
            <h2>📋 ${escKids(this.localize('my_tasks'))} <span class="count">${duties.length}</span></h2>
            <div class="col-scroll">${dutyHtml}</div>
          </section>
          ${adult ? '' : `<section class="col col-bonus">
            <h2>🎁 ${escKids(this.localize('bonus'))} <span class="count">${bonus.length}</span></h2>
            <div class="col-scroll">${bonusHtml}</div>
          </section>`}
        </div>`}
        ${this._helperMode() ? this._renderPin() : (this._sheet && this._sheet.type === 'together' ? this._renderTogether() : this._renderSheet())}
      </div>`;
  }

  /** Small muted lines for duties that are replaced today ("Today: thorough room clean instead of room blitz"). */
  _renderReplaced(kid) {
    return this._replacedLines(kid).map(text => `<div class="replaced-note">${escKids(text)}</div>`).join('');
  }

  /** Birthday strip of the kid view: level-up card and "off duty today" note. */
  _renderParty(kid) {
    const today = this._localToday();
    const info = (this.birthdayLevelup || {})[kid.id];
    const levelup = info && info.date === today ? info : null;
    const unlocked = levelup && Array.isArray(levelup.unlocked) ? levelup.unlocked : [];
    const age = kid.age === null ? '' : kid.age;
    const dutyFree = this.settings.birthday_duty_free !== false &&
      !this._openDuties(kid).some(t => this._category(t) === 'basis');
    const chips = unlocked.map(u =>
      `<span class="unlock">🔓 ${escKids(u.name)}</span>`).join('');
    return `
      <section class="party">
        <div class="levelup">
          <div class="lv-head"><span class="lv-title">${escKids(this.localize('levelup_title'))}</span>
            <span class="lv-age">${escKids(this.localize('bday_age', { age }))}</span></div>
          ${unlocked.length
            ? `<div class="lv-new">${escKids(this.localize('levelup_new'))}</div><div class="unlocks">${chips}</div>`
            : `<div class="lv-new">${escKids(this.localize('levelup_none'))}</div>`}
        </div>
        ${dutyFree ? `<div class="freeday">${escKids(this.localize('free_today'))}</div>` : ''}
      </section>`;
  }

  /** "Waiting for approval" list in the kid's own view (points greyed out). */
  _renderWaiting(list) {
    if (!list.length) return '';
    return `
      <div class="waiting">
        <div class="wait-title">⏳ ${escKids(this.localize('waiting_title'))} <span class="count">${list.length}</span></div>
        ${list.map(p => `
          <div class="wait-item">
            <div class="wait-name">${escKids(p.task_name)}</div>
            <div class="wait-pts">⭐ ${fmtKids(p.points)}</div>
          </div>`).join('')}
        <div class="wait-hint">${escKids(this.localize('waiting_hint'))}</div>
      </div>`;
  }

  /**
   * Private notes, only visible in the kid's own view (after the PIN): recent
   * deductions as a neutral line and a note while strict mode is active.
   * Never shown on the home screen.
   */
  _renderPrivate(kid) {
    const lines = this._recentPenalties(kid.id).filter(h => Math.abs(parseFloat(h.points)) > 0).map(h =>
      `<div class="priv-line">${escKids(this.localize('penalty_line', { n: fmtKids(Math.abs(parseFloat(h.points))), reason: h.reason || h.task_name || '' }))}</div>`).join('');
    const strict = this._strictActive(kid) ? `<div class="priv-note">${escKids(this.localize('strict_note'))}</div>` : '';
    if (!lines && !strict) return '';
    return `<div class="private">${lines}${strict}</div>`;
  }

  /**
   * Renders one task card.
   * @param {object} task - The task.
   * @param {object} kid - The kid view model.
   * @param {string} mode - duty | bonus | locked.
   * @param {object} persons - Map of kid id -> kid view model.
   */
  _renderTask(task, kid, mode, persons) {
    const minAge = parseInt(task.min_age) || 0;
    const claimActive = this._claimActive(task);
    const claimedByMe = claimActive && task.claimed_by === kid.id;
    const claimedByOther = claimActive && task.claimed_by !== kid.id;
    const busy = this._busy ? 'disabled' : '';

    let action;
    let note = '';
    const win = this._window(task);
    if (win.state !== 'open') {
      // Outside the time window: shown, but without any button
      mode = 'window';
      if (win.state === 'not_yet') {
        const early = (this._hhmm(win.from) || 0) < 12 * 60;
        const icon = early ? '☀️' : '🌙';
        const soon = win.minutes !== null && win.minutes <= 30;
        action = `<div class="state-chip locked" aria-hidden="true">${icon}</div>`;
        note = `<div class="t-note window">${icon} ${escKids(this.localize('from_time', { t: win.from }))}` +
          `${soon ? ` · <span class="countdown">${escKids(this.localize('countdown', { n: Math.max(1, win.minutes) }))}</span>` : ''}</div>`;
      } else {
        action = `<div class="state-chip locked" aria-hidden="true">⏰</div>`;
        note = `<div class="t-note window">${escKids(this.localize('window_over'))}</div>`;
      }
    } else if (mode === 'locked') {
      action = `<div class="state-chip locked" aria-hidden="true">🔒</div>`;
      note = `<div class="t-note locked">${escKids(this.localize('locked_basis'))}</div>`;
    } else if (mode === 'bonus' && claimedByOther) {
      const other = persons[task.claimed_by];
      action = `<div class="state-chip taken" aria-hidden="true">${escKids(other ? other.avatar : '🙂')}</div>`;
      note = `<div class="t-note">${escKids(this.localize('claimed_other', { name: other ? other.name : '?' }))}</div>`;
    } else if (mode === 'bonus' && !claimedByMe) {
      action = `<button class="btn btn-claim" data-action="claim" data-task="${escKids(task.id)}" ${busy}>${escKids(this.localize('claim'))}</button>`;
    } else {
      // "Fertig!" only once every required step is ticked (optional steps never block)
      const open = (Array.isArray(task.subtasks) ? task.subtasks : []).filter(st => st && !st.done && !st.optional).length;
      action = `<button class="btn btn-done" data-action="complete" data-task="${escKids(task.id)}" ${busy} ${open ? 'disabled' : ''}>${escKids(this.localize('done_btn'))} ✅</button>`;
      if (!this._isMine() && this._allowTogether(task) && this._helperCandidates(task, kid).length) {
        action += `<button class="btn btn-together" data-action="together" data-task="${escKids(task.id)}" ${busy} ${open ? 'disabled' : ''}>👫 ${escKids(this.localize('together'))}</button>`;
      }
      if (open) note = `<div class="t-note">${escKids(this.localize('steps_left', { n: open }))}</div>`;
    }

    const subs = mode !== 'window' && Array.isArray(task.subtasks) && task.subtasks.length
      ? `<div class="subs">${task.subtasks.map((st, i) => `
          <button class="sub ${st.done ? 'done' : ''}" data-action="toggle-sub" data-task="${escKids(task.id)}" data-idx="${i}"
                  ${mode === 'locked' || mode === 'window' ? 'disabled' : ''} aria-pressed="${st.done ? 'true' : 'false'}">
            <span class="box">${st.done ? '✓' : ''}</span><span class="sub-title">${escKids(st.title)}</span>
          </button>`).join('')}</div>`
      : '';

    const cat = this._category(task);
    return `
      <article class="task ${mode} cat-${cat} ${claimedByMe ? 'mine' : ''}">
        <div class="t-top">
          <div class="t-icon"><ha-icon icon="${escKids(task.icon || 'mdi:star')}"></ha-icon></div>
          <div class="t-main">
            <div class="t-name">${escKids(task.name)}</div>
            <div class="t-meta">
              <span class="stars">⭐ ${fmtKids(task.complexity)}</span>
              ${minAge > 0 ? `<span class="age">${escKids(this.localize('min_age_badge', { age: minAge }))}</span>` : ''}
              ${task.expires_at ? `<span class="age">⏳ ${escKids(this.localize('until_time', { t: this._clockText(task.expires_at) }))}</span>` : ''}
              ${claimedByMe ? `<span class="mine-tag">${escKids(this.localize('claimed_mine'))}</span>` : ''}
            </div>
            ${note}
          </div>
          <div class="t-action">${action}</div>
        </div>
        ${subs}
        ${this._isParent() ? this._renderParentRow(task, kid) : ''}
      </article>`;
  }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  _styles() {
    return `
      :host {
        display: block;
        /* exactly the space below the HA toolbar (measured in _fitHeight) */
        height: var(--to-fit-height, 100%);
        min-height: var(--to-fit-height, calc(100dvh - var(--header-height, 56px)));
        box-sizing: border-box;
        background: var(--primary-background-color, #f4f4f6);
        color: var(--primary-text-color, #212121);
        font-family: var(--paper-font-body1_-_font-family, Roboto, "Segoe UI", system-ui, -apple-system, sans-serif);
        -webkit-tap-highlight-color: transparent;
        user-select: none; -webkit-user-select: none;
        touch-action: manipulation;
        --k-card: var(--card-background-color, #ffffff);
        --k-text: var(--primary-text-color, #212121);
        --k-sub: var(--secondary-text-color, #5f6368);
        --k-line: var(--divider-color, #d0d0d0);
        --k-good: #2E7D32;
        --k-blue: #1565C0;
      }
      * { box-sizing: border-box; }
      #app { display: block; height: 100%; min-height: inherit; }
      button { font-family: inherit; color: inherit; cursor: pointer; border: 0; margin: 0; touch-action: manipulation; }
      button:disabled { cursor: default; }
      .root { box-sizing: border-box; min-height: inherit; height: 100%; overflow-x: hidden; overflow-y: auto; scrollbar-width: none; display: flex; flex-direction: column; gap: 16px; padding: 16px 24px 20px; }
      .root::-webkit-scrollbar { display: none; }
      .empty-state { grid-column: 1 / -1; align-self: center; justify-self: center; text-align: center; font-size: 30px; font-weight: 700; color: var(--k-sub); padding: 32px; }
      .empty-state.small { font-size: 26px; padding: 24px 8px; }

      /* ---------- home ---------- */
      .top { display: flex; align-items: center; justify-content: space-between; min-height: 56px; }
      .title { font-size: 38px; font-weight: 800; letter-spacing: 0.2px; }
      .clock { font-size: 30px; font-weight: 700; color: var(--k-sub); }
      .tiles { flex: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); grid-auto-rows: minmax(240px, 380px); align-content: start; gap: 20px; }
      .tile {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px 12px;
        background: color-mix(in srgb, var(--kc) 16%, var(--k-card));
        border: 5px solid var(--kc); border-radius: 36px; min-height: 72px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.14); transition: transform 0.12s;
      }
      .tile:active { transform: scale(0.97); }
      .tile { position: relative; }
      .tile.bday > .praise-tag { position: absolute; z-index: 2; }
      .praise-tag { position: absolute; top: 8px; right: 12px; font-size: 44px; line-height: 1; animation: kids-bounce 1.4s ease-in-out infinite; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.25)); pointer-events: none; }
      .ring-wrap { position: relative; width: 168px; height: 168px; display: grid; place-items: center; flex: none; }
      .ring-wrap .ring { position: absolute; inset: 0; width: 100%; height: 100%; }
      .ring-wrap .avatar { font-size: 82px; line-height: 1; }
      .ring-wrap .trophy { position: absolute; right: -6px; top: -6px; font-size: 44px; }
      .ring-wrap.small { width: 104px; height: 104px; }
      .ring-wrap.small .avatar { font-size: 52px; }
      .name { font-size: 36px; font-weight: 800; line-height: 1.1; text-align: center; max-width: 100%; overflow-wrap: anywhere; }
      .pts { font-size: 30px; font-weight: 800; }
      .pct-over { display: block; font-size: 0.55em; font-weight: 800; color: var(--k-sub); line-height: 1.1; }
      .pts small, .fam-num small, .kv-pts small { font-size: 0.7em; font-weight: 700; color: var(--k-sub); }
      .badge { min-height: 48px; padding: 8px 18px; border-radius: 28px; font-size: 23px; text-align: center; font-weight: 800; display: flex; align-items: center; }
      .badge.open { background: #C62828; color: #fff; }
      .badge.ok { background: #2E7D32; color: #fff; }

      .family { display: flex; align-items: center; gap: 24px; padding: 12px 28px; min-height: 96px; border-radius: 28px; background: var(--k-card); border: 3px solid var(--k-line); box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
      .family.reached { border-color: #F9A825; }
      .fam-label { flex: none; min-width: 270px; }
      .fam-title { font-size: 30px; font-weight: 800; }
      .fam-reward { font-size: 22px; font-weight: 600; color: var(--k-sub); margin-top: 2px; }
      .fam-reward b { color: var(--k-text); }
      .fam-track { position: relative; flex: 1; height: 30px; border-radius: 15px; background: color-mix(in srgb, var(--k-sub) 22%, transparent); }
      .fam-fill { height: 100%; border-radius: 15px; background: linear-gradient(90deg, #FFB300, #FF6D00); min-width: 30px; transition: width 0.6s; }
      .fam-rocket { position: absolute; top: -17px; transform: translateX(-50%) rotate(45deg); font-size: 50px; line-height: 1; min-width: 50px; text-align: center; }
      .fam-num { flex: none; min-width: 190px; text-align: right; font-size: 30px; font-weight: 800; }

      .board { display: flex; flex-direction: column; gap: 6px; }
      .board-title { font-size: 26px; font-weight: 800; }
      .board-list { display: flex; gap: 14px; overflow-x: auto; padding: 2px 2px 8px; }
      .board-empty { font-size: 22px; font-weight: 600; color: var(--k-sub); padding: 14px 4px; }
      .chip { flex: none; display: flex; align-items: center; gap: 12px; min-height: 80px; max-width: 360px; padding: 8px 16px 8px 10px; border-radius: 40px; background: var(--k-card); border: 3px solid #F9A825; }
      .chip.claimed { opacity: 0.8; border-style: dashed; }
      .chip-icon { width: 56px; height: 56px; border-radius: 50%; background: color-mix(in srgb, #F9A825 28%, var(--k-card)); display: grid; place-items: center; --mdc-icon-size: 34px; flex: none; }
      .chip-name { font-size: 22px; font-weight: 800; line-height: 1.15; }
      .chip-meta { font-size: 20px; font-weight: 700; color: var(--k-sub); }
      .chip-claim { width: 48px; height: 48px; border-radius: 50%; background: color-mix(in srgb, var(--kc) 30%, var(--k-card)); border: 3px solid var(--kc); display: grid; place-items: center; font-size: 28px; flex: none; }

      /* compact home screen for low heights (set in _fitHeight) */
      :host([short]) .root { gap: 10px; padding: 10px 20px 12px; }
      :host([short]) .top { min-height: 40px; }
      :host([short]) .title { font-size: 30px; }
      :host([short]) .clock { font-size: 24px; }
      :host([short]) .tiles { grid-auto-rows: minmax(200px, 300px); gap: 14px; }
      :host([short]) .tile { gap: 4px; padding: 10px; }
      :host([short]) .tile .ring-wrap { width: 120px; height: 120px; }
      :host([short]) .tile .ring-wrap .avatar { font-size: 58px; }
      :host([short]) .tile .ring-wrap .trophy { font-size: 34px; }
      :host([short]) .name { font-size: 28px; }
      :host([short]) .pts { font-size: 24px; }
      :host([short]) .badge { min-height: 38px; padding: 4px 14px; font-size: 19px; }
      :host([short]) .family { min-height: 70px; padding: 8px 22px; }
      :host([short]) .fam-title { font-size: 24px; }
      :host([short]) .fam-reward { font-size: 18px; }
      :host([short]) .fam-num { font-size: 24px; }
      :host([short]) .board-title { font-size: 22px; }
      :host([short]) .chip { min-height: 64px; }
      :host([short]) .chip-icon { width: 44px; height: 44px; }

      /* ---------- kid view ---------- */
      .kv-head { display: flex; align-items: center; gap: 28px; min-height: 108px; }
      .back { min-width: 168px; min-height: 88px; padding: 0 28px; border-radius: 44px; background: var(--k-card); border: 4px solid var(--kc); font-size: 30px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.12); }
      .back:active { transform: scale(0.97); }
      .kv-who { display: flex; align-items: center; gap: 20px; }
      .kv-name { font-size: 44px; font-weight: 800; line-height: 1.05; }
      .kv-pts { font-size: 30px; font-weight: 800; }
      .kv-body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
      .col { position: relative; min-height: 0; display: flex; flex-direction: column; padding: 14px 16px 16px; border-radius: 32px; background: color-mix(in srgb, var(--kc) 12%, var(--k-card)); border: 3px solid color-mix(in srgb, var(--kc) 55%, transparent); }
      .col h2 { margin: 0 0 10px; font-size: 32px; font-weight: 800; display: flex; align-items: center; gap: 12px; }
      .col h2 .count { min-width: 44px; height: 44px; padding: 0 12px; border-radius: 22px; display: inline-grid; place-items: center; font-size: 26px; color: #000; background: color-mix(in srgb, var(--kc) 70%, #fff); }
      .col-scroll { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding-right: 4px; -webkit-overflow-scrolling: touch; }

      .col.has-more .col-scroll { -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 56px), transparent); mask-image: linear-gradient(to bottom, #000 calc(100% - 56px), transparent); }
      .col.has-more::after { content: '▼'; position: absolute; left: 50%; bottom: 12px; width: 60px; height: 60px; margin-left: -30px; border-radius: 50%; background: #263238; color: #fff; display: grid; place-items: center; font-size: 28px; pointer-events: none; box-shadow: 0 4px 10px rgba(0,0,0,0.35); animation: kids-bounce 1.3s ease-in-out infinite; }
      @keyframes kids-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

      .task { flex: none; background: var(--k-card); border: 4px solid color-mix(in srgb, var(--kc) 70%, transparent); border-radius: 28px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); }
      .task.window { opacity: 0.8; filter: grayscale(0.55); border-style: dashed; }
      .t-note.window { color: var(--k-text); }
      .countdown { color: #E65100; }
      .task.locked { opacity: 0.78; filter: grayscale(0.55); border-style: dashed; }
      .task.mine { border-color: var(--k-blue); }
      .t-top { display: flex; align-items: center; gap: 14px; }
      .t-icon { width: 68px; height: 68px; flex: none; border-radius: 22px; display: grid; place-items: center; --mdc-icon-size: 42px; background: color-mix(in srgb, var(--kc) 28%, var(--k-card)); }
      .t-main { flex: 1; min-width: 0; }
      .t-name { font-size: 27px; font-weight: 800; line-height: 1.15; overflow-wrap: break-word; hyphens: auto; -webkit-hyphens: auto; }
      .t-meta { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 6px; font-size: 22px; font-weight: 800; align-items: center; }
      .age { padding: 2px 12px; border-radius: 16px; background: color-mix(in srgb, var(--k-sub) 22%, var(--k-card)); font-size: 20px; }
      .mine-tag { padding: 2px 12px; border-radius: 16px; background: #1565C0; color: #fff; font-size: 20px; }
      .t-action { flex: none; display: flex; }
      .btn { min-height: 76px; min-width: 150px; padding: 0 22px; border-radius: 38px; font-size: 28px; font-weight: 800; color: #fff; box-shadow: 0 4px 0 rgba(0,0,0,0.25); transition: transform 0.1s; }
      .btn:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,0.25); }
      .btn:disabled { opacity: 0.55; }
      .btn-done:disabled { background: #9E9E9E; box-shadow: none; }
      .btn-done { background: var(--k-good); }
      .btn-claim { background: var(--k-blue); }
      .state-chip { width: 76px; height: 76px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; line-height: 1; }
      .replaced-note { margin: 4px 4px 10px; font-size: 18px; font-weight: 700; color: var(--k-sub); opacity: 0.85; }
      .t-note { margin-top: 4px; font-size: 22px; font-weight: 800; color: var(--k-sub); }
      .t-note.locked { color: var(--k-text); }
      .state-chip.locked { background: #455A64; color: #fff; }
      .state-chip.taken { background: color-mix(in srgb, var(--k-sub) 25%, var(--k-card)); }
      .subs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .sub { min-height: 72px; display: flex; align-items: center; gap: 12px; padding: 8px 14px; text-align: left; font-size: 23px; font-weight: 700; line-height: 1.15; border-radius: 22px; background: transparent; border: 3px solid var(--k-line); }
      .sub:active:not(:disabled) { transform: scale(0.97); }
      .sub .box { width: 44px; height: 44px; flex: none; border-radius: 13px; border: 4px solid var(--k-sub); display: grid; place-items: center; font-size: 30px; font-weight: 900; color: #fff; }
      .sub.done { background: color-mix(in srgb, var(--k-good) 16%, var(--k-card)); border-color: var(--k-good); }
      .sub.done .box { background: var(--k-good); border-color: var(--k-good); }
      .sub.done .sub-title { text-decoration: line-through; text-decoration-thickness: 3px; }
      .sub-title { overflow-wrap: anywhere; }

      /* ---------- parent actions (parent role only) ---------- */
      .pact { display: flex; gap: 12px; justify-content: flex-end; padding-top: 10px; border-top: 3px dashed var(--k-line); }
      .pbtn { width: 60px; height: 60px; flex: none; border-radius: 50%; font-size: 28px; line-height: 1; background: color-mix(in srgb, var(--k-sub) 16%, var(--k-card)); border: 3px solid var(--k-line); }
      .pbtn:active:not(:disabled) { transform: scale(0.92); }
      .pbtn:disabled { opacity: 0.5; }
      .done-today { margin-top: 10px; padding: 10px 14px; border-radius: 22px; border: 3px dashed var(--k-line); display: flex; flex-direction: column; gap: 8px; }
      .done-today .wait-item { align-items: center; }
      .sheet { width: min(560px, 100%); display: flex; flex-direction: column; gap: 18px; padding: 26px 30px; border-radius: 36px; background: var(--k-card); border: 6px solid var(--kc); box-shadow: 0 16px 48px rgba(0,0,0,0.5); }
      .sheet-title { font-size: 28px; font-weight: 800; line-height: 1.25; overflow-wrap: anywhere; }
      .sheet-hint { min-height: 28px; font-size: 22px; font-weight: 700; color: var(--k-sub); }
      .schoices { display: flex; flex-wrap: wrap; gap: 10px; }
      .schoice { min-height: 64px; padding: 0 22px; border-radius: 32px; font-size: 24px; font-weight: 800; background: var(--k-card); border: 4px solid var(--k-line); }
      .schoice.on { background: color-mix(in srgb, var(--kc) 28%, var(--k-card)); border-color: var(--kc); }
      .sdate { display: flex; gap: 14px; }
      .sdate label { flex: 1; display: flex; flex-direction: column; gap: 4px; font-size: 20px; font-weight: 700; color: var(--k-sub); }
      .sdate select { min-height: 64px; font-size: 26px; font-family: inherit; padding: 0 10px; border-radius: 18px; border: 3px solid var(--k-line); background: var(--k-card); color: var(--k-text); }
      .t-action { flex-direction: column; gap: 8px; align-items: stretch; }
      .btn-together { min-height: 56px; font-size: 22px; background: var(--k-blue); }
      .btn-together:disabled { background: #9E9E9E; box-shadow: none; }
      .hchips { display: flex; flex-wrap: wrap; gap: 12px; }
      .hchip { position: relative; min-width: 120px; padding: 12px 16px 8px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; gap: 2px; background: var(--k-card); border: 4px solid var(--k-line); }
      .hchip.on { border-color: var(--kc); background: color-mix(in srgb, var(--kc) 22%, var(--k-card)); }
      .havatar { font-size: 52px; line-height: 1; }
      .hname { font-size: 22px; font-weight: 800; }
      .hcheck { position: absolute; top: -8px; right: -8px; width: 34px; height: 34px; border-radius: 50%; background: var(--k-good); color: #fff; display: grid; place-items: center; font-size: 22px; font-weight: 900; }
      .sheet-hint.ask { color: var(--k-text); }
      .sheet-btns { display: flex; gap: 14px; justify-content: flex-end; }
      .sbtn { min-height: 68px; min-width: 150px; padding: 0 26px; border-radius: 34px; font-size: 26px; font-weight: 800; background: color-mix(in srgb, var(--k-sub) 18%, var(--k-card)); border: 3px solid var(--k-line); }
      .sbtn.ok { background: var(--k-good); border-color: var(--k-good); color: #fff; }
      .sbtn:disabled { opacity: 0.5; }

      /* ---------- reward shop ---------- */
      .goalbar { width: 100%; max-width: 280px; display: flex; flex-direction: column; gap: 4px; align-items: center; }
      .goal-track { width: 100%; height: 14px; border-radius: 7px; background: color-mix(in srgb, var(--k-sub) 25%, transparent); overflow: hidden; }
      .goal-fill { height: 100%; border-radius: 7px; background: linear-gradient(90deg, #FFB300, #FF6D00); min-width: 6px; }
      .goalbar.ready .goal-fill { background: var(--k-good); }
      .goal-text { font-size: 19px; font-weight: 800; color: var(--k-sub); text-align: center; }
      .goalbar.ready .goal-text { color: var(--k-good); }
      /* compact tiles (low height): tiles grow with their content instead of
         squeezing it; percent inline; savings bar and its text in one row */
      :host([short]) .tiles { grid-auto-rows: auto; }
      :host([short]) .tile { justify-content: flex-start; padding: 14px 12px 12px; }
      :host([short]) .pts .pct-over { display: inline; margin-left: 6px; font-size: 0.6em; }
      :host([short]) .goalbar { flex-direction: row; gap: 8px; max-width: 340px; }
      :host([short]) .goal-track { flex: 1; height: 10px; }
      :host([short]) .goal-text { font-size: 15px; white-space: nowrap; }
      :host([short]) .praise-tag { font-size: 32px; top: 6px; right: 8px; }
      .shop-btn { margin-left: auto; min-height: 88px; padding: 0 28px; border-radius: 44px; background: #F9A825; color: #1b1b1b; border: 4px solid #F57F17; font-size: 32px; font-weight: 800; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 0 rgba(0,0,0,0.22); }
      .shop-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,0.22); }
      .shop-bal { font-size: 26px; padding: 4px 14px; border-radius: 22px; background: rgba(255,255,255,0.6); }
      .kidview.adult .kv-body { grid-template-columns: minmax(0, 1fr); }
      .shopview .col-shop { grid-column: 1 / -1; }
      .wallet-big { font-size: 28px; font-weight: 700; color: var(--k-sub); margin: -4px 0 12px; }
      .wallet-big b { font-size: 56px; color: var(--k-text); font-weight: 900; vertical-align: middle; margin-left: 8px; }
      .reward-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
      .reward { background: var(--k-card); border: 4px solid var(--k-line); border-radius: 28px; padding: 14px 16px 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
      .reward.can { border-color: var(--k-good); background: color-mix(in srgb, var(--k-good) 12%, var(--k-card)); box-shadow: 0 0 0 4px color-mix(in srgb, var(--k-good) 25%, transparent); }
      .reward.cant { opacity: 0.8; }
      .reward.cant .r-emoji { filter: grayscale(0.7); }
      .reward.goal { border-color: #F9A825; }
      .r-emoji { font-size: 64px; line-height: 1.1; }
      .r-name { font-size: 26px; font-weight: 800; line-height: 1.15; overflow-wrap: anywhere; }
      .r-cost { font-size: 28px; font-weight: 900; }
      .r-track { width: 100%; height: 14px; border-radius: 7px; background: color-mix(in srgb, var(--k-sub) 25%, transparent); overflow: hidden; }
      .r-fill { height: 100%; border-radius: 7px; background: linear-gradient(90deg, #FFB300, #FF6D00); min-width: 6px; }
      .r-hint { font-size: 21px; font-weight: 800; color: var(--k-sub); }
      .r-hint.ok { color: var(--k-good); }
      .r-actions { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
      .r-actions .btn { width: 100%; min-height: 64px; font-size: 24px; }
      .goal-btn { min-height: 52px; border-radius: 26px; font-size: 20px; font-weight: 800; background: color-mix(in srgb, var(--k-sub) 14%, var(--k-card)); border: 3px solid var(--k-line); }
      .goal-btn.on { background: #FFF3CD; border-color: #F9A825; color: #1b1b1b; }
      .shop-wait { padding: 10px 16px; margin-bottom: 12px; border-radius: 22px; border: 3px dashed color-mix(in srgb, var(--k-sub) 70%, transparent); background: color-mix(in srgb, var(--k-sub) 10%, var(--k-card)); font-size: 24px; font-weight: 800; }
      .shop-wait span { color: var(--k-sub); font-weight: 700; font-size: 20px; }

      /* ---------- PIN pad ---------- */
      .overlay { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.62); display: grid; place-items: center; padding: 16px; }
      .pin-dialog { display: flex; align-items: center; gap: 44px; padding: 32px 44px; border-radius: 44px; background: var(--k-card); border: 6px solid var(--kc); box-shadow: 0 16px 48px rgba(0,0,0,0.5); max-width: 100%; }
      .pin-left { width: 330px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
      .pin-avatar { width: 150px; height: 150px; border-radius: 50%; display: grid; place-items: center; font-size: 92px; line-height: 1; background: color-mix(in srgb, var(--kc) 24%, var(--k-card)); border: 6px solid var(--kc); }
      .pin-hello { font-size: 38px; font-weight: 800; }
      .pin-ask { font-size: 24px; font-weight: 700; color: var(--k-sub); }
      .dots { display: flex; gap: 20px; margin: 12px 0 4px; }
      .dot { width: 34px; height: 34px; border-radius: 50%; border: 5px solid var(--k-sub); background: transparent; transition: background 0.1s, transform 0.1s; }
      .dot.on { background: var(--kc); border-color: var(--kc); transform: scale(1.12); }
      .pin-msg { min-height: 96px; font-size: 23px; font-weight: 800; color: #C62828; line-height: 1.2; }
      .pad { display: grid; grid-template-columns: repeat(3, 96px); gap: 14px; }
      .key { width: 96px; height: 96px; border-radius: 28px; background: color-mix(in srgb, var(--kc) 22%, var(--k-card)); border: 4px solid var(--kc); font-size: 46px; font-weight: 800; box-shadow: 0 5px 0 color-mix(in srgb, var(--kc) 55%, #000); transition: transform 0.08s; }
      .key:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 color-mix(in srgb, var(--kc) 55%, #000); }
      .key:disabled { opacity: 0.4; }
      .key-aux { background: var(--k-card); border-color: var(--k-line); box-shadow: 0 5px 0 var(--k-line); font-size: 40px; }
      @keyframes kids-shake { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-16px); } 35% { transform: translateX(14px); } 55% { transform: translateX(-10px); } 75% { transform: translateX(8px); } }
      .dots.shake { animation: kids-shake 0.55s; }

      /* ---------- birthday ---------- */
      .bday-banner { flex: none; text-align: center; padding: 10px 24px; border-radius: 28px; font-size: 30px; font-weight: 800; color: #fff; background: linear-gradient(90deg, #EC407A, #AB47BC, #5C6BC0); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
      .tile.bday { position: relative; overflow: hidden; background: linear-gradient(180deg, color-mix(in srgb, #FFD54F 28%, var(--k-card)), color-mix(in srgb, var(--kc) 18%, var(--k-card))); }
      .crown { position: absolute; left: 50%; top: -22px; transform: translateX(-50%) rotate(-8deg); font-size: 58px; line-height: 1; z-index: 2; filter: drop-shadow(0 3px 2px rgba(0,0,0,0.3)); }
      .ring-wrap.small .crown { top: -12px; font-size: 38px; }
      .tile.bday > *:not(.balloon) { position: relative; z-index: 1; }
      .balloon { z-index: 0; position: absolute; bottom: -50px; font-size: 44px; line-height: 1; pointer-events: none; opacity: 0.9; animation: kids-float 6s ease-in infinite; }
      .balloon.b1 { left: 10%; animation-delay: 0s; }
      .balloon.b2 { left: 82%; animation-delay: 2s; animation-duration: 7s; }
      .balloon.b3 { left: 46%; animation-delay: 4s; animation-duration: 8s; font-size: 34px; }
      @keyframes kids-float { 0% { transform: translateY(0) rotate(-6deg); opacity: 0; } 12% { opacity: 0.95; } 50% { transform: translateY(-190px) rotate(6deg); } 100% { transform: translateY(-420px) rotate(-6deg); opacity: 0; } }
      .badges { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .badge.wait { background: #546E7A; color: #fff; }
      .party { flex: none; display: flex; gap: 16px; align-items: stretch; max-height: 190px; }
      .levelup { flex: 1; min-width: 0; padding: 10px 18px; border-radius: 26px; background: linear-gradient(120deg, color-mix(in srgb, #FFD54F 40%, var(--k-card)), color-mix(in srgb, var(--kc) 22%, var(--k-card))); border: 4px solid #F9A825; overflow: auto; }
      .lv-head { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
      .lv-title { font-size: 32px; font-weight: 900; }
      .lv-age { font-size: 28px; font-weight: 800; }
      .lv-new { font-size: 22px; font-weight: 700; color: var(--k-text); margin-top: 2px; }
      .unlocks { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
      .unlock { padding: 6px 14px; border-radius: 20px; background: var(--k-card); border: 3px solid #F9A825; font-size: 22px; font-weight: 800; }
      .freeday { flex: none; display: flex; align-items: center; justify-content: center; text-align: center; max-width: 320px; padding: 10px 24px; border-radius: 26px; background: #2E7D32; color: #fff; font-size: 30px; font-weight: 900; line-height: 1.15; }
      #fx .bday-layer { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; background: rgba(40,10,60,0.55); }
      #fx .bday-layer canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .bday-card { position: relative; text-align: center; padding: 28px 56px 32px; border-radius: 48px; background: var(--k-card); border: 8px solid var(--kc); box-shadow: 0 16px 48px rgba(0,0,0,0.5); animation: kids-pop 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) both; max-width: 92vw; }
      .bday-cake { font-size: 120px; line-height: 1.1; }
      .bday-title { font-size: 52px; font-weight: 900; line-height: 1.1; }
      .bday-age { font-size: 40px; font-weight: 800; color: var(--k-sub); margin: 8px 0 20px; }
      .bday-go { min-height: 88px; min-width: 240px; font-size: 34px; }

      #fx .praise-layer { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 16px; background: rgba(60,20,40,0.5); }
      .praise-card { position: relative; text-align: center; padding: 28px 48px 32px; border-radius: 48px; background: var(--k-card); border: 8px solid var(--kc); box-shadow: 0 16px 48px rgba(0,0,0,0.5); animation: kids-pop 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) both; max-width: min(760px, 92vw); }
      .praise-sticker { font-size: 150px; line-height: 1.1; animation: kids-bounce 1.6s ease-in-out infinite; }
      .praise-msg { font-size: 44px; font-weight: 900; line-height: 1.2; overflow-wrap: anywhere; margin-top: 4px; }
      .praise-from { font-size: 32px; font-weight: 800; color: var(--k-sub); margin: 10px 0 22px; }
      .praise-go { min-height: 88px; min-width: 240px; font-size: 34px; }

      /* ---------- waiting for approval / private notes ---------- */
      .waiting { flex: none; padding: 10px 14px 12px; border-radius: 24px; border: 3px dashed color-mix(in srgb, var(--k-sub) 70%, transparent); background: color-mix(in srgb, var(--k-sub) 10%, var(--k-card)); }
      .wait-title { font-size: 26px; font-weight: 800; display: flex; align-items: center; gap: 10px; color: var(--k-sub); }
      .wait-title .count { min-width: 36px; height: 36px; padding: 0 10px; border-radius: 18px; display: inline-grid; place-items: center; font-size: 22px; background: color-mix(in srgb, var(--k-sub) 30%, var(--k-card)); }
      .wait-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 4px; font-size: 24px; font-weight: 700; color: var(--k-sub); border-top: 2px solid var(--k-line); margin-top: 6px; }
      .wait-name { overflow-wrap: anywhere; }
      .wait-pts { flex: none; opacity: 0.6; filter: grayscale(1); font-weight: 800; }
      .wait-hint { font-size: 20px; font-weight: 700; color: var(--k-sub); margin-top: 4px; }
      .private { flex: none; padding: 6px 8px 2px; font-size: 20px; font-weight: 700; color: var(--k-sub); }
      .priv-line, .priv-note { padding: 2px 0; }

      /* ---------- effects ---------- */
      #fx .celebrate { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; background: rgba(255,255,255,0.18); transition: opacity 0.4s; }
      #fx .celebrate.fade { opacity: 0; }
      #fx .celebrate canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .celebrate-text { position: relative; text-align: center; padding: 28px 56px; border-radius: 48px; background: rgba(0,0,0,0.58); color: #fff; animation: kids-pop 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) both; }
      #fx .celebrate.soft { background: rgba(255,255,255,0.1); }
      .celebrate.soft .celebrate-text { background: rgba(38,50,56,0.78); max-width: 82vw; }
      .celebrate-text .plus.wait { font-size: 96px; color: #fff; text-shadow: none; }
      .celebrate-text .plus { font-size: 104px; font-weight: 900; line-height: 1.05; color: #FFD54F; text-shadow: 0 4px 0 rgba(0,0,0,0.35); }
      .celebrate-text .great { font-size: 40px; font-weight: 800; margin-top: 6px; }
      @keyframes kids-pop { 0% { transform: scale(0.2); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      #fx .toast { position: fixed; left: 50%; bottom: 36px; transform: translateX(-50%); z-index: 120; max-width: min(900px, 92vw); padding: 20px 36px; border-radius: 40px; background: #263238; color: #fff; font-size: 28px; font-weight: 800; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.45); }


      /* ---------- phones / narrow cards (card width < 700 px, set by a ResizeObserver) ---------- */
      :host([narrow]) { min-height: 0; }
      :host([narrow]) .root { height: auto; min-height: 0; overflow: visible; gap: 12px; padding: 10px 12px 16px; }
      :host([narrow]) .empty-state { font-size: 22px; padding: 20px 8px; }
      :host([narrow]) .empty-state.small { font-size: 18px; padding: 14px 6px; }
      :host([narrow]) .top { min-height: 40px; }
      :host([narrow]) .title { font-size: 24px; }
      :host([narrow]) .clock { font-size: 20px; }
      :host([narrow]) .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: auto; gap: 10px; }
      :host([narrow]) .tile { min-height: 0; padding: 12px 6px 10px; border-width: 4px; border-radius: 26px; gap: 4px; }
      :host([narrow]) .ring-wrap { width: 116px; height: 116px; }
      :host([narrow]) .ring-wrap .avatar { font-size: 56px; }
      :host([narrow]) .ring-wrap .trophy { font-size: 30px; right: -4px; top: -4px; }
      :host([narrow]) .name { font-size: 22px; }
      :host([narrow]) .pts { font-size: 18px; }
      :host([narrow]) .badge { min-height: 32px; padding: 4px 10px; font-size: 14px; border-radius: 18px; }
      :host([narrow]) .crown { font-size: 36px; top: -14px; }
      :host([narrow]) .bday-banner { font-size: 16px; padding: 8px 12px; border-radius: 18px; }
      :host([narrow]) .family { flex-wrap: wrap; gap: 8px 12px; padding: 10px 14px; min-height: 0; border-radius: 22px; }
      :host([narrow]) .fam-label { min-width: 0; flex: 1 1 100%; }
      :host([narrow]) .fam-title { font-size: 20px; }
      :host([narrow]) .fam-reward { font-size: 15px; }
      :host([narrow]) .fam-track { flex: 1 1 100%; order: 3; height: 20px; margin: 10px 0 6px; }
      :host([narrow]) .fam-fill { min-width: 20px; }
      :host([narrow]) .fam-rocket { font-size: 32px; top: -12px; min-width: 32px; }
      :host([narrow]) .fam-num { min-width: 0; flex: 1 1 100%; text-align: left; font-size: 20px; }
      :host([narrow]) .board-title { font-size: 19px; }
      :host([narrow]) .board-empty { font-size: 15px; }
      :host([narrow]) .chip { min-height: 56px; gap: 8px; padding: 6px 12px 6px 8px; max-width: 78%; }
      :host([narrow]) .chip-icon { width: 38px; height: 38px; --mdc-icon-size: 24px; }
      :host([narrow]) .chip-name { font-size: 15px; }
      :host([narrow]) .chip-meta { font-size: 13px; }
      :host([narrow]) .chip-claim { width: 34px; height: 34px; font-size: 20px; }

      :host([narrow]) .kv-head { gap: 10px; min-height: 0; flex-wrap: nowrap; }
      :host([narrow]) .back { min-width: 48px; width: 48px; min-height: 48px; height: 48px; padding: 0; flex: none; border-width: 3px; }
      :host([narrow]) .back-label { display: none; }
      :host([narrow]) .kv-who { gap: 10px; min-width: 0; flex: 1; }
      :host([narrow]) .kv-who > div:last-child { min-width: 0; }
      :host([narrow]) .ring-wrap.small { width: 60px; height: 60px; }
      :host([narrow]) .ring-wrap.small .avatar { font-size: 30px; }
      :host([narrow]) .ring-wrap.small .crown { font-size: 22px; top: -9px; }
      :host([narrow]) .kv-name { font-size: 24px; overflow-wrap: anywhere; }
      :host([narrow]) .kv-pts { font-size: 17px; }
      :host([narrow]) .shop-btn { min-height: 48px; padding: 0 12px; border-width: 3px; font-size: 22px; gap: 6px; flex: none; }
      :host([narrow]) .shop-label { display: none; }
      :host([narrow]) .shop-bal { font-size: 16px; padding: 2px 8px; }
      :host([narrow]) .goal-text { font-size: 13px; }
      :host([narrow]) .goal-track { height: 10px; }
      :host([narrow]) .wallet-big { font-size: 18px; margin-bottom: 8px; }
      :host([narrow]) .wallet-big b { font-size: 34px; }
      :host([narrow]) .reward-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
      :host([narrow]) .reward { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 2px 12px; padding: 10px 12px; border-radius: 20px; border-width: 3px; text-align: left; align-items: center; }
      :host([narrow]) .r-emoji { font-size: 40px; grid-row: 1 / span 4; grid-column: 1; align-self: start; }
      :host([narrow]) .r-name, :host([narrow]) .r-cost, :host([narrow]) .r-track, :host([narrow]) .r-hint { grid-column: 2; }
      :host([narrow]) .r-name { font-size: 18px; }
      :host([narrow]) .r-cost { font-size: 18px; }
      :host([narrow]) .r-hint { font-size: 15px; }
      :host([narrow]) .r-track { height: 10px; }
      :host([narrow]) .r-actions { grid-column: 1 / -1; flex-direction: row; }
      :host([narrow]) .r-actions .btn { min-height: 48px; font-size: 18px; min-width: 0; }
      :host([narrow]) .goal-btn { min-height: 48px; font-size: 15px; padding: 0 8px; flex: none; }
      :host([narrow]) .shop-wait { font-size: 16px; padding: 8px 10px; }
      :host([narrow]) .kv-body { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
      :host([narrow]) .col { padding: 10px 10px 12px; border-radius: 22px; border-width: 2px; }
      :host([narrow]) .col h2 { font-size: 20px; margin-bottom: 8px; gap: 8px; }
      :host([narrow]) .col h2 .count { min-width: 28px; height: 28px; border-radius: 14px; font-size: 16px; padding: 0 8px; }
      :host([narrow]) .col-scroll { overflow: visible; gap: 10px; padding-right: 0; }
      :host([narrow]) .col.has-more .col-scroll { -webkit-mask-image: none; mask-image: none; }
      :host([narrow]) .col.has-more::after { display: none; }
      :host([narrow]) .task { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 8px 10px; padding: 10px 12px; border-width: 3px; border-radius: 20px; }
      :host([narrow]) .t-top { display: contents; }
      :host([narrow]) .t-icon { width: 44px; height: 44px; border-radius: 14px; --mdc-icon-size: 26px; order: 1; }
      :host([narrow]) .t-main { order: 1; min-width: 0; }
      :host([narrow]) .subs { order: 2; grid-column: 1 / -1; grid-template-columns: minmax(0, 1fr); gap: 6px; }
      :host([narrow]) .t-action { order: 3; grid-column: 1 / -1; }
      :host([narrow]) .t-action .btn { width: 100%; min-height: 52px; font-size: 21px; border-radius: 26px; }
      :host([narrow]) .t-action .state-chip { width: 100%; height: 40px; border-radius: 20px; font-size: 22px; }
      :host([narrow]) .t-name { font-size: 19px; overflow-wrap: break-word; word-break: normal; }
      :host([narrow]) .t-meta { font-size: 15px; gap: 4px 8px; margin-top: 3px; }
      :host([narrow]) .age, :host([narrow]) .mine-tag { font-size: 13px; padding: 1px 8px; }
      :host([narrow]) .t-note { font-size: 15px; }
      :host([narrow]) .replaced-note { font-size: 14px; margin: 2px 2px 8px; }
      :host([narrow]) .sub { min-height: 46px; padding: 6px 10px; font-size: 16px; border-width: 2px; border-radius: 16px; gap: 10px; }
      :host([narrow]) .sub .box { width: 30px; height: 30px; border-width: 3px; border-radius: 9px; font-size: 20px; }
      :host([narrow]) .party { flex-direction: column; max-height: none; gap: 8px; }
      :host([narrow]) .lv-title { font-size: 20px; }
      :host([narrow]) .lv-age { font-size: 17px; }
      :host([narrow]) .lv-new, :host([narrow]) .unlock { font-size: 14px; }
      :host([narrow]) .freeday { max-width: none; font-size: 18px; padding: 8px 14px; }
      :host([narrow]) .waiting { padding: 8px 10px; border-radius: 18px; }
      :host([narrow]) .wait-title { font-size: 17px; }
      :host([narrow]) .wait-item { font-size: 16px; }
      :host([narrow]) .wait-hint, :host([narrow]) .private { font-size: 14px; }
      /* PIN pad and overlays on phones */
      :host([narrow]) .pin-dialog { flex-direction: column; gap: 14px; padding: 16px 18px; border-radius: 28px; border-width: 4px; }
      :host([narrow]) .pin-left { width: auto; gap: 6px; }
      :host([narrow]) .pin-avatar { width: 80px; height: 80px; font-size: 48px; border-width: 4px; }
      :host([narrow]) .pin-hello { font-size: 24px; }
      :host([narrow]) .pin-ask { font-size: 16px; }
      :host([narrow]) .dots { gap: 14px; margin: 4px 0 0; }
      :host([narrow]) .dot { width: 24px; height: 24px; border-width: 4px; }
      :host([narrow]) .pin-msg { min-height: 40px; font-size: 16px; }
      :host([narrow]) .pad { grid-template-columns: repeat(3, 68px); gap: 10px; }
      :host([narrow]) .key { width: 68px; height: 68px; font-size: 32px; border-radius: 20px; }
      :host([narrow]) .t-action { flex-direction: column; gap: 6px; }
      :host([narrow]) .t-action .btn-together { min-height: 44px; font-size: 18px; }
      :host([narrow]) .hchips { gap: 8px; }
      :host([narrow]) .hchip { min-width: 84px; padding: 8px 10px 6px; border-radius: 18px; border-width: 3px; }
      :host([narrow]) .havatar { font-size: 36px; }
      :host([narrow]) .hname { font-size: 16px; }
      :host([narrow]) .hcheck { width: 26px; height: 26px; font-size: 17px; top: -6px; right: -6px; }
      :host([narrow]) .pact { order: 4; grid-column: 1 / -1; gap: 8px; padding-top: 8px; border-top-width: 2px; }
      :host([narrow]) .pbtn { width: 48px; height: 48px; font-size: 22px; border-width: 2px; }
      :host([narrow]) .done-today { padding: 8px 10px; border-radius: 18px; border-width: 2px; }
      :host([narrow]) .sheet { padding: 16px 18px; gap: 12px; border-radius: 26px; border-width: 4px; }
      :host([narrow]) .sheet-title { font-size: 19px; }
      :host([narrow]) .sheet-hint { font-size: 16px; min-height: 22px; }
      :host([narrow]) .schoice { min-height: 48px; padding: 0 14px; font-size: 17px; border-width: 3px; }
      :host([narrow]) .sdate label { font-size: 15px; }
      :host([narrow]) .sdate select { min-height: 48px; font-size: 18px; }
      :host([narrow]) .sbtn { min-height: 52px; min-width: 0; flex: 1; font-size: 19px; padding: 0 12px; }
      :host([narrow]) .celebrate-text { padding: 18px 28px; border-radius: 32px; }
      :host([narrow]) .celebrate-text .plus { font-size: 56px; }
      :host([narrow]) .celebrate-text .great { font-size: 24px; }
      :host([narrow]) .bday-card { padding: 18px 24px 22px; }
      :host([narrow]) .praise-card { padding: 18px 24px 22px; }
      :host([narrow]) .praise-sticker { font-size: 88px; }
      :host([narrow]) .praise-msg { font-size: 26px; }
      :host([narrow]) .praise-from { font-size: 20px; margin-bottom: 14px; }
      :host([narrow]) .praise-go { min-height: 64px; font-size: 24px; }
      :host([narrow]) .praise-tag { font-size: 32px; top: 4px; right: 6px; }
      :host([narrow]) .bday-cake { font-size: 72px; }
      :host([narrow]) .bday-title { font-size: 30px; }
      :host([narrow]) .bday-age { font-size: 24px; }
      :host([narrow]) #fx .toast { font-size: 17px; padding: 12px 20px; bottom: 16px; }

      @media (prefers-reduced-motion: reduce) {
        .dots.shake, .celebrate-text, .col.has-more::after, .balloon, .bday-card, .praise-card, .praise-sticker, .praise-tag { animation: none; }
        .balloon { display: none; }
        .tile, .btn, .key, .back, .sub { transition: none; }
      }
    `;
  }
}

/**
 * Editor for the TaskOrganizerKids card.
 */
class TaskOrganizerKidsEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  localize(key) {
    return TaskOrganizerKids._localize(this._hass, key);
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (this._rendered) {
      this._updateUI();
      return;
    }
    this.innerHTML = `
      <div class="card-config">
        <ha-input label="${this.localize('title_lbl')}" value="${escKids(this._config.title || this.localize('title'))}" configValue="title"></ha-input>
        <ha-input label="${this.localize('timeout_lbl')}" type="number" value="${this._config.timeout || 90}" configValue="timeout"></ha-input>
        <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 16px;">
          <ha-formfield label="${this.localize('sound_lbl')}">
            <ha-checkbox configValue="sound"></ha-checkbox>
          </ha-formfield>
          <ha-formfield label="${this.localize('show_family_goal_lbl')}">
            <ha-checkbox configValue="show_family_goal"></ha-checkbox>
          </ha-formfield>
          <ha-formfield label="${this.localize('show_bonus_board_lbl')}">
            <ha-checkbox configValue="show_bonus_board"></ha-checkbox>
          </ha-formfield>
          <ha-formfield label="${this.localize('return_home_lbl')}">
            <ha-checkbox configValue="return_home_after_done"></ha-checkbox>
          </ha-formfield>
          <ha-formfield label="${this.localize('mode_mine_lbl')}">
            <ha-checkbox configValue="mode_mine"></ha-checkbox>
          </ha-formfield>
        </div>
      </div>
      <style>
        .card-config ha-input { display: block; margin-bottom: 8px; }
        ha-formfield { display: flex; align-items: center; }
      </style>
    `;
    this._rendered = true;
    this.querySelectorAll('ha-input').forEach(el => el.addEventListener('input', ev => this._valueChanged(ev)));
    this.querySelectorAll('ha-checkbox').forEach(el => el.addEventListener('change', ev => this._valueChanged(ev)));
    this._updateUI();
  }

  _updateUI() {
    if (!this._rendered) return;
    this.querySelectorAll('[configValue]').forEach(el => {
      const key = el.getAttribute('configValue');
      const value = this._config[key];
      if (key === 'mode_mine') {
        el.checked = this._config.mode === 'mine';
      } else if (el.tagName === 'HA-CHECKBOX') {
        el.checked = value !== false;
      } else if (value !== undefined) {
        el.value = value;
      }
    });
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;
    ev.stopPropagation();
    const target = ev.target;
    const configValue = target.configValue || target.getAttribute('configValue');
    let newValue = target.value;

    if (configValue === 'mode_mine') {
      const mode = target.checked ? 'mine' : 'family';
      if ((this._config.mode || 'family') === mode) return;
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: { ...this._config, mode } }, bubbles: true, composed: true }));
      return;
    }
    if (target.tagName === 'HA-CHECKBOX') {
      newValue = target.checked;
    } else if (configValue === 'timeout') {
      newValue = newValue === "" ? undefined : parseInt(newValue);
    }

    if (this._config[configValue] === newValue) return;

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: { ...this._config, [configValue]: newValue } },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('task-organizer-kids-editor', TaskOrganizerKidsEditor);
customElements.define('task-organizer-kids', TaskOrganizerKids);
