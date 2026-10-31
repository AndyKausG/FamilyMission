/**
 * Configuration for translations.
 * en: English translations.
 * de: German translations.
 */
const I18N_SETTINGS = {
  en: { 
    title: "Settings", colors: "Colors (Done, Due, Overdue)", c_done: "Done", c_due: "Due", c_overdue: "Overdue", 
    days_overdue: "Overdue after (Days)", save: "Save Settings", advanced: "ADVANCED SETTINGS", cancel: "Cancel",
    archive_btn: "Archive and reset monthly points now", factory_btn: "🔥 Factory reset (Delete everything)", 
    success: "Settings saved!", confirm_reset: "Do you really want to reset all points? Data will be archived.", 
    confirm_factory: "WARNING: This permanently deletes ALL tasks, points, and history!",
    import_export: "Import & Export", export_btn: "Export Tasks", import_btn: "Import Tasks", 
    import_success: "Tasks successfully imported!", import_error: "Error reading file. Is it valid JSON?",
    templates: "Templates", templates_desc: "Manage templates for tasks here for quick reuse.", 
    add_template: "Add Template", edit_template: "Edit Template", template_name: "Template Name",
    confirm_delete_template: "Do you really want to delete this template? It cannot be recovered.",
    template_saved: "Template saved!", template_deleted: "Template deleted!", no_templates: "No templates found. Create a new one!",
    point_goals: "Monthly Point Goals",
    goal_lbl: "Goal for {user}",
    template_name_placeholder: "e.g. Take out trash",
    subtasks: "Subtasks", 
    add_subtask: "Add Subtask", 
    confirm: "Add", 
    subtask_placeholder: "Subtask title...",
    edit_template_hover: "Edit template", delete_template_hover: "Delete template",
    save_hover: "Saves the current color and day settings.",
    export_hover: "Downloads all current tasks as a JSON file.",
    import_hover: "Opens a dialog to select a JSON file for importing tasks.", 
    desc_lbl: "Description (optional)", area_lbl: "Area", points_lbl: "Points (1-10)", icon_lbl: "Icon",
    interval_lbl: "Days (Interval)", assignees_lbl: "Assignees",
    cancel: "Cancel", save: "Save",
    export_tasks_cb: "Tasks", export_templates_cb: "Templates", export_history_cb: "History & Points", export_settings_cb: "Settings",
    no_desc: "No description", onetime: "One-time",
    show_advanced_lbl: "Show Advanced Settings",
    height_lbl: "Height",
    width_lbl: "Width",
    title_lbl: "Title",
    color_done_lbl: "Color Done", color_due_lbl: "Color Due", color_overdue_lbl: "Color Overdue",
    transparency_lbl: "Transparency", color_adjustments: "Color Adjustments",
    set_default: "Set Default",
    import_tasks_title: "Import Tasks", metadata_title: "Import Overview", tasks_lbl: "Tasks", 
    templates_lbl: "Templates", history_lbl: "History Entries", settings_included: "Settings", 
    yes: "Yes", no: "No", start_import: "Start Import", confirm_reload: "Confirm & Reload",
    kids_title: "Kids", kids_desc: "Enable persons as kids for the kids card: avatar, color, birth year and an optional 4-digit PIN. Kids do not need a Home Assistant user.",
    kid_enable: "Is a kid", kid_avatar: "Avatar (emoji)", kid_color: "Color", kid_birth_year: "Birth year", kid_goal: "Monthly goal (points)",
    kid_pin: "PIN (4 digits)", kid_pin_set: "PIN set (empty = keep)", kid_pin_none: "No PIN", kid_pin_clear: "Remove PIN",
    kids_admin_only: "Only administrators and parents with management rights can change kid profiles and PINs.",
    parents_title: "Parents", parents_desc: "Home Assistant users who may approve, give points and undo without being administrators. \"May manage\" additionally allows kid profiles, the wizard and bonus triggers. Administrators are always parents.",
    parents_warn: "Do not enter the tablet user here.", parents_col_parent: "Parent", parents_col_manage: "May manage",
    parents_none: "No persons with a Home Assistant user found.", parents_admin_only: "Only administrators can change the parents.", invalid_pin: "The PIN must consist of exactly 4 digits.",
    kids_save_error: "Could not save the kid profiles: ",
    kid_birthday: "Birthday", kid_birth_year_fallback: "Birth year (if no birthday)", kid_sample: "Spot checks by parents: {n} %",
    kid_sample_hint: "Share of completions that a parent checks at random before points are awarded (0 = none).",
    invalid_birthday: "The birthday must be a valid date in the past.",
    approval_title: "Approval & consequences",
    cheat_penalty_factor: "Deduction when cheating (x task points)", cheat_strict_days: "Strict mode after cheating (days, 0 = off)",
    birthday_title: "Birthday", birthday_bonus_points: "Birthday bonus (points, 0 = off)",
    team_title: "Teamwork", team_bonus: "Team bonus per kid when doing a task together (points, 0 = off)",
    birthday_duty_free: "Duty-free birthday: skip the kid's own due tasks",
    family_goal: "Family goal", family_goal_points: "Points per month (all kids together)", family_goal_reward: "Reward", family_goal_reward_ph: "e.g. Ice cream trip",
claim_minutes: "Bonus reservation (minutes)",
    category_lbl: "Category (kids mode)", cat_basis: "Basis (assigned duty)", cat_bonus: "Bonus (open for all)", cat_auftrag: "Order (one-time)",
    min_age_lbl: "Minimum age (0 = any)", min_age_short: "age {age}+", approval_lbl: "Requires parent approval", routine_lbl: "Bonus only after the kid's due duties", together_lbl: "Doing it together allowed",
    available_from_lbl: "Only from (time)", available_until_lbl: "Only until (time)",
    reminder_lbl: "Reminder", reminder_time_lbl: "Remind at", reminder_target_lbl: "Notify via", reminder_event_only: "Event only",
    expire_missed: "Missed duties expire at midnight (daily duties right away, weekly ones after 2 days) - no points, no deduction",
    help_btn: "Help", wizard_btn: "🚀 Kids mode quick start", wizard_hint: "Proposes an age-appropriate set of tasks, points and goals for your kids and creates everything in one click.",
    wizard_missing: "The wizard could not be loaded. Reload the page (Ctrl+F5) and try again.",
    triggers_title: "Bonus triggers", triggers_desc: "Open a bonus task automatically when an entity changes to a state, e.g. when the dishwasher is finished. Fires the event task_organizer_bonus_opened.",
    trig_task: "Bonus task", trig_pick_task: "— choose a bonus task —", trig_add: "Add trigger", trig_remove: "Remove trigger", trig_none: "No triggers yet.", trig_no_bonus: "No bonus task yet. Create a task without assignee and category \"Bonus\" (or let the quick start create them).",
    trig_when: "when {entity} becomes \"{state}\"", trig_error: "Could not save the triggers: "
  },
  de: { 
    title: "Einstellungen", colors: "Farben (Erledigt, Fällig, Überfällig)", c_done: "Erledigt", c_due: "Fällig", c_overdue: "Überfällig", 
    days_overdue: "Überfällig nach (Tagen)", save: "Einstellungen speichern", advanced: "ERWEITERTE EINSTELLUNGEN", cancel: "Abbrechen",
    archive_btn: "Monats-Punkte archivieren und zurücksetzen", factory_btn: "🔥 Werkseinstellungen setzen (Alles löschen)", 
    success: "Einstellungen erfolgreich gespeichert!", confirm_reset: "Möchtest du alle monatlichen Punkte wirklich auf 0 setzen? Die Daten werden archiviert.", 
    confirm_factory: "ACHTUNG: Dies löscht unwiderruflich ALLE Aufgaben, Punkte und die Historie!", 
    import_export: "Import & Export", export_btn: "Aufgaben exportieren", import_btn: "Aufgaben importieren", 
    import_success: "Aufgaben erfolgreich importiert!", import_error: "Fehler beim Lesen der Datei. Ist es valides JSON?",
    templates: "Vorlagen", templates_desc: "Verwalte hier Vorlagen für Aufgaben, um sie schnell wiederverwenden zu können.", 
    add_template: "Vorlage hinzufügen", edit_template: "Vorlage bearbeiten", template_name: "Name der Vorlage",
    confirm_delete_template: "Möchtest du diese Vorlage wirklich löschen? Sie kann nicht wiederhergestellt werden.",
    template_saved: "Vorlage gespeichert!", template_deleted: "Vorlage gelöscht!", no_templates: "Keine Vorlagen vorhanden. Erstelle eine neue!",
    point_goals: "Monatliche Punktziele",
    goal_lbl: "Ziel für {user}",
    template_name_placeholder: "z.B. Müll rausbringen",
    subtasks: "Unteraufgaben", 
    add_subtask: "Unteraufgabe hinzufügen", 
    confirm: "Hinzufügen", 
    subtask_placeholder: "Titel der Unteraufgabe...",
    edit_template_hover: "Vorlage bearbeiten", delete_template_hover: "Vorlage löschen",
    save_hover: "Speichert die aktuellen Farb- und Tageseinstellungen.",
    export_hover: "Lädt alle aktuellen Aufgaben als JSON-Datei herunter.",
    import_hover: "Öffnet einen Dialog zur Auswahl einer JSON-Datei für den Import von Aufgaben.", 
    desc_lbl: "Beschreibung (optional)", area_lbl: "Bereich", points_lbl: "Punkte (1-10)", icon_lbl: "Icon",
    interval_lbl: "Tage (Intervall)", assignees_lbl: "Bearbeiter",
    cancel: "Abbrechen", save: "Speichern",
    export_tasks_cb: "Aufgaben", export_templates_cb: "Vorlagen", export_history_cb: "Protokoll & Historie", export_settings_cb: "Einstellungen",
    no_desc: "Keine Beschreibung", onetime: "Einmalig",
    show_advanced_lbl: "Erweiterte Einstellungen anzeigen",
    height_lbl: "Höhe",
    width_lbl: "Breite",
    title_lbl: "Titel",
    color_done_lbl: "Farbe Erledigt", color_due_lbl: "Farbe Fällig", color_overdue_lbl: "Farbe Überfällig",
    transparency_lbl: "Transparenz", color_adjustments: "Farbanpassungen",
    set_default: "Standard setzen",
    import_tasks_title: "Aufgaben importieren", metadata_title: "Import Übersicht", tasks_lbl: "Aufgaben", 
    templates_lbl: "Vorlagen", history_lbl: "Historien-Einträge", settings_included: "Einstellungen", 
    yes: "Ja", no: "Nein", start_import: "Import starten", confirm_reload: "Bestätigen & Neuladen",
    kids_title: "Kinder / Kids", kids_desc: "Personen als Kinder für die Kinder-Karte freischalten: Avatar, Farbe, Geburtsjahr und optional eine 4-stellige PIN. Kinder brauchen keinen Home-Assistant-Benutzer.",
    kid_enable: "Ist ein Kind", kid_avatar: "Avatar (Emoji)", kid_color: "Farbe", kid_birth_year: "Geburtsjahr", kid_goal: "Monatsziel (Punkte)",
    kid_pin: "PIN (4 Ziffern)", kid_pin_set: "PIN gesetzt (leer = behalten)", kid_pin_none: "Keine PIN", kid_pin_clear: "PIN entfernen",
    kids_admin_only: "Nur Administratoren und Eltern mit Verwaltungsrecht können Kinder-Profile und PINs ändern.",
    parents_title: "Eltern", parents_desc: "Home-Assistant-Benutzer, die ohne Administratorrechte freigeben, Punkte vergeben und rückgängig machen dürfen. \"Darf verwalten\" erlaubt zusätzlich Kinder-Profile, Assistent und Bonus-Auslöser. Administratoren sind immer Eltern.",
    parents_warn: "Den Tablet-Benutzer hier nicht eintragen.", parents_col_parent: "Eltern", parents_col_manage: "Darf verwalten",
    parents_none: "Keine Personen mit Home-Assistant-Benutzer gefunden.", parents_admin_only: "Nur Administratoren können die Eltern ändern.", invalid_pin: "Die PIN muss aus genau 4 Ziffern bestehen.",
    kids_save_error: "Kinder-Profile konnten nicht gespeichert werden: ",
    kid_birthday: "Geburtstag", kid_birth_year_fallback: "Geburtsjahr (falls kein Geburtstag)", kid_sample: "Stichproben durch Eltern: {n} %",
    kid_sample_hint: "Anteil der Erledigungen, die Mama oder Papa zufällig prüfen, bevor Punkte gutgeschrieben werden (0 = keine).",
    invalid_birthday: "Der Geburtstag muss ein gültiges Datum in der Vergangenheit sein.",
    approval_title: "Freigabe & Konsequenzen",
    cheat_penalty_factor: "Abzug bei Schummeln (x Aufgabenpunkte)", cheat_strict_days: "Strenge Phase nach Schummeln (Tage, 0 = aus)",
    birthday_title: "Geburtstag", birthday_bonus_points: "Geburtstags-Bonus (Punkte, 0 = aus)",
    team_title: "Teamarbeit", team_bonus: "Team-Bonus pro Kind bei gemeinsam erledigten Aufgaben (Punkte, 0 = aus)",
    birthday_duty_free: "Pflichtfreier Geburtstag: eigene fällige Aufgaben überspringen",
    family_goal: "Familienziel", family_goal_points: "Punkte pro Monat (alle Kinder zusammen)", family_goal_reward: "Belohnung", family_goal_reward_ph: "z.B. Eis essen gehen",
claim_minutes: "Bonus-Reservierung (Minuten)",
    category_lbl: "Kategorie (Kindermodus)", cat_basis: "Basis (feste Pflicht)", cat_bonus: "Bonus (offen für alle)", cat_auftrag: "Auftrag (einmalig)",
    min_age_lbl: "Mindestalter (0 = egal)", min_age_short: "ab {age}", approval_lbl: "Freigabe durch Eltern nötig", routine_lbl: "Bonus erst nach den fälligen Pflichten", together_lbl: "Zusammen erledigen erlaubt",
    available_from_lbl: "Erst ab (Uhrzeit)", available_until_lbl: "Nur bis (Uhrzeit)",
    reminder_lbl: "Erinnerung", reminder_time_lbl: "Erinnern um", reminder_target_lbl: "Benachrichtigen über", reminder_event_only: "nur Ereignis",
    expire_missed: "Verpasste Pflichten verfallen um Mitternacht (tägliche sofort, wöchentliche nach 2 Tagen) – ohne Punkte, ohne Abzug",
    help_btn: "Hilfe", wizard_btn: "🚀 Kindermodus-Schnellstart", wizard_hint: "Schlägt altersgerechte Aufgaben, Punkte und Ziele für eure Kinder vor und legt alles mit einem Klick an.",
    wizard_missing: "Der Assistent konnte nicht geladen werden. Seite neu laden (Strg+F5) und erneut versuchen.",
    triggers_title: "Bonus-Auslöser / Bonus triggers", triggers_desc: "Öffnet eine Bonus-Aufgabe automatisch, wenn eine Entität einen Zustand annimmt, z.B. wenn die Spülmaschine fertig ist. Löst das Ereignis task_organizer_bonus_opened aus.",
    trig_task: "Bonus-Aufgabe", trig_pick_task: "— Bonus-Aufgabe wählen —", trig_add: "Auslöser hinzufügen", trig_remove: "Auslöser entfernen", trig_none: "Noch keine Auslöser.", trig_no_bonus: "Noch keine Bonus-Aufgabe vorhanden. Lege eine Aufgabe ohne Bearbeiter mit Kategorie „Bonus“ an (oder lass sie vom Schnellstart anlegen).",
    trig_when: "wenn {entity} auf \"{state}\" wechselt", trig_error: "Auslöser konnten nicht gespeichert werden: "
  }
};

/**
 * Register card in the Home Assistant Card Picker.
 */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "task-organizer-settings",
  name: "Task Organizer: Settings",
  description: "Displays and manages integration settings, colors, and imports/exports.",
  preview: true,
});

/**
 * Birthday input as three selects (day / month / year). Native date pickers
 * (e.g. Safari) offer no quick year selection. The ISO value lives in a hidden
 * input carrying the given attributes; it receives an "input" event on change.
 */
const toSetBdayMonths = {
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};
function toSetBdayHtml(value, attrs, lang, disabled) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  const [y, mo, d] = m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  const now = new Date().getFullYear();
  const months = toSetBdayMonths[lang === 'de' ? 'de' : 'en'];
  const opt = (v, label, sel) => `<option value="${v}" ${sel ? 'selected' : ''}>${label}</option>`;
  const dis = disabled ? 'disabled' : '';
  let days = opt('', lang === 'de' ? 'Tag' : 'Day', !d);
  for (let i = 1; i <= 31; i++) days += opt(i, i, i === d);
  let mons = opt('', lang === 'de' ? 'Monat' : 'Month', !mo);
  months.forEach((n, i) => { mons += opt(i + 1, n, i + 1 === mo); });
  let years = opt('', lang === 'de' ? 'Jahr' : 'Year', !y);
  for (let i = now; i >= now - 25; i--) years += opt(i, i, i === y);
  if (y && y < now - 25) years += opt(y, y, true);
  return `<span class="bday-sel" style="display:flex;gap:6px">
      <select data-part="d" ${dis} style="flex:0.8;min-width:0;height:38px;padding:0 6px;font-size:15px;border:1px solid var(--divider-color,#ccc);border-radius:6px;background:var(--primary-background-color,#fff);color:var(--primary-text-color,#212121)">${days}</select>
      <select data-part="m" ${dis} style="flex:1;min-width:0;height:38px;padding:0 6px;font-size:15px;border:1px solid var(--divider-color,#ccc);border-radius:6px;background:var(--primary-background-color,#fff);color:var(--primary-text-color,#212121)">${mons}</select>
      <select data-part="y" ${dis} style="flex:1.1;min-width:0;height:38px;padding:0 6px;font-size:15px;border:1px solid var(--divider-color,#ccc);border-radius:6px;background:var(--primary-background-color,#fff);color:var(--primary-text-color,#212121)">${years}</select>
      <input type="hidden" ${attrs} value="${value || ''}"></span>`;
}
function toSetBdayBind(root) {
  root.querySelectorAll('.bday-sel').forEach(box => {
    if (box.dataset.bound) return;
    box.dataset.bound = '1';
    box.addEventListener('change', (ev) => {
      if (!ev.target.dataset || !ev.target.dataset.part) return;
      ev.stopPropagation();
      const get = (p) => parseInt(box.querySelector(`[data-part="${p}"]`).value) || 0;
      const d = get('d'), m = get('m'), y = get('y');
      let iso = '';
      if (d && m && y) {
        const last = new Date(y, m, 0).getDate();
        const day = Math.min(d, last);
        if (day !== d) box.querySelector('[data-part="d"]').value = String(day);
        iso = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      const hidden = box.querySelector('input[type="hidden"]');
      hidden.value = iso;
      hidden.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    });
  });
}

/**
 * Options for a time select ("HH:MM", 15-minute steps). Used instead of
 * <input type="time">, whose native picker crashes some browsers (Safari)
 * inside the dialogs. A value outside the steps is kept as its own option.
 */
function toSetTTimeOptions(value, emptyLabel) {
  const v = /^\d{2}:\d{2}$/.test(value || '') ? value : '';
  const times = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  if (v && !times.includes(v)) { times.push(v); times.sort(); }
  return `<option value="" ${v ? '' : 'selected'}>${emptyLabel}</option>` +
    times.map(t => `<option value="${t}" ${t === v ? 'selected' : ''}>${t}</option>`).join('');
}


/**
 * Options of the reminder target select: "event only" plus every `notify.*` service Home Assistant offers
 * (value `notify.<name>`). A saved target that is no longer offered is kept as its own option.
 */
function toSetNotifyOptions(hass, selected, eventOnlyLabel) {
  const names = Object.keys((hass && hass.services && hass.services.notify) || {}).filter(n => n !== 'send_message').sort();
  const values = names.map(n => `notify.${n}`);
  if (selected && !values.includes(selected)) values.push(selected);
  return `<option value="" ${selected ? '' : 'selected'}>${eventOnlyLabel}</option>` +
    values.map(v => `<option value="${v}" ${v === selected ? 'selected' : ''}>${v}</option>`).join('');
}

class TaskOrganizerSettings extends HTMLElement {
  /**
   * Initializes the TaskOrganizerSettings element.
   */
    constructor() {
    super(); 
    this.attachShadow({ mode: 'open' });
    this._themeView = 'light';
    
    // Global properties
    this.settings = { color_done: '#4CAF50', color_due: '#FFC107', color_overdue: '#F44336', overdue_days: 5 };
    this.tasks = {};
    this.users = {};
    this.templates = {};
    this.history = [];
    this.points = {};
    this.monthly_history = {};
    this.current_month = null;
    this.current_period_start = null;
    this._subtasks = [];
    this._dataLoaded = false; 
    this._advancedOpen = false; 
    this._ieOpen = false; 
    this._templatesOpen = false;
    this._templateModalOpen = false;
    this._importModalOpen = false;
    this._importState = 'initial';
    this._importData = null;
    this._importProgress = 0;
    this._editingTemplateId = null;
    this._kidDrafts = {};
    this._goalDrafts = {};
    this._familyDraft = {};
    this._kidsOpen = false;
    this._myRole = null;
    this._haUsers = [];
    this._parentsDraft = null;
    this._trigOpen = false;
    this._trigDraft = { task: '', entity_id: '', to_state: '', filter: '' };
    this._wizard = null;
    this._unsubEvents = null;
    this.addEventListener('click', (ev) => this._handleClick(ev));
  }

  /**
   * Statically translates a key. Helper for getStubConfig.
   * @param {object} hass - The Home Assistant object.
   * @param {string} key - The translation key.
   * @returns {string} - The translated text.
   */
  static _localize(hass, key) {
    const lang = (hass && hass.language) ? hass.language.substring(0, 2) : 'en';
    const dict = I18N_SETTINGS[lang] || I18N_SETTINGS['en'];
    return dict[key] || key;
  }

  /**
   * Translates a given key based on the Home Assistant language.
   * * @param {string} key - The translation key.
   * @returns {string} - The translated text.
   */
  localize(key) { 
    return TaskOrganizerSettings._localize(this._hass, key);
  }

  /**
   * Defines layout options for the Home Assistant grid.
   */
  static getLayoutOptions() { 
    return { grid_columns: 4, grid_rows: "auto", grid_min_columns: 1, grid_max_columns: 4 }; 
  }

  /**
   * Generates default configuration for the Card Picker.
   */
  static getStubConfig(hass) { 
    return { 
      type: "custom:task-organizer-settings", 
      title: this._localize(hass, 'title'),
      show_advanced: false 
    }; 
  }

  /**
   * Returns the editor element for GUI configuration.
   * @returns {HTMLElement}
   */
  static getConfigElement() {
    return document.createElement("task-organizer-settings-editor");
  }

  /**
   * Sets the configuration from Home Assistant.
   * * @param {object} config - The card configuration.
   */
  setConfig(config) { 
    if (!config) throw new Error("Invalid configuration");
    this._config = config; 
    if (this._hass) this._render();
  }

  connectedCallback() { 
    if (this._hass && !this._unsubEvents) { 
      this._subscribeToUpdates(); 
    } 
  }

  disconnectedCallback() { 
    if (this._wizard) { this._wizard.remove(); this._wizard = null; }
    if (this._unsubEvents) { 
      this._unsubEvents.then(unsub => unsub()); 
      this._unsubEvents = null; 
    } 
  }

  /**
   * Subscribes to backend updates via websockets.
   */
  async _subscribeToUpdates() { 
    if (!this._hass) {
      return; 
    }
    this._unsubEvents = this._hass.connection.subscribeEvents(() => {
      this._fetchData();
    }, "task_organizer_updated"); 
  }

  /**
   * Sets the Home Assistant object.
   */
  set hass(hass) {
    this._hass = hass;
    if (this._wizard) this._wizard.hass = hass;
    if (!this._dataLoaded && this._hass) {
      this._mapUsers();
      this._fetchData(); 
      this._dataLoaded = true; 
    }
    if (!this._unsubEvents) { 
      this._subscribeToUpdates(); 
    }
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

  /**
   * Role of the current user: 'admin' | 'manager' | 'parent' | null (from get_data, with a
   * fallback to the HA admin flag until the data is loaded).
   * @returns {string|null}
   */
  _role() {
    if (this._hass && this._hass.user && this._hass.user.is_admin) return 'admin';
    return this._myRole || null;
  }

  /** True for admins and parents with management rights (kids section, wizard, triggers). */
  _canManage() {
    const role = this._role();
    return role === 'admin' || role === 'manager';
  }

  /**
   * Rows of the "Parents" list: persons with an HA user plus already configured user ids.
   * @returns {Array<{uid: string, name: string}>}
   */
  _parentRows() {
    const rows = new Map();
    for (const u of this._haUsers) rows.set(u.user_id, u.name || u.user_id);
    for (const [uid, name] of Object.entries(this.users)) {
      if (!uid.startsWith('person.')) rows.set(uid, name);
    }
    const mine = this._hass && this._hass.user;
    if (mine && mine.id && mine.name && !rows.has(mine.id) && ((this.settings.parents || []).includes(mine.id))) {
      rows.set(mine.id, mine.name);
    }
    for (const uid of [...(this.settings.parents || []), ...(this.settings.parents_manage || [])]) {
      if (!rows.has(uid)) rows.set(uid, uid);
    }
    return [...rows.entries()].map(([uid, name]) => ({ uid, name })).sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Current parents lists: the draft if edited, otherwise the stored settings (read-only view). */
  _parentsState() {
    return this._parentsDraft || {
      parents: new Set(this.settings.parents || []),
      manage: new Set(this.settings.parents_manage || [])
    };
  }

  /** Draft of the parents lists, created from the stored settings on the first edit. */
  _parentsEdit() {
    if (!this._parentsDraft) this._parentsDraft = this._parentsState();
    return this._parentsDraft;
  }

  /**
   * Maps Home Assistant 'person' entities to the local users object.
   * Persons without an HA user are keyed by their entity_id.
   */
  _mapUsers() {
    const users = {};
    if (!this._hass) return;
    for (const entityId in this._hass.states) {
        if (entityId.startsWith('person.')) {
            const state = this._hass.states[entityId];
            users[TaskOrganizerSettings.participantId(entityId, state)] = state.attributes.friendly_name || entityId;
        }
    }
    this.users = users;
  }

  /**
   * Fetches the current settings and tasks from the backend.
   */
  _fetchData() { 
    this._hass.callWS({ type: 'task_organizer/get_data' }).then((data) => { 
      if (data.settings && Object.keys(data.settings).length > 0) { 
        this.settings = { ...this.settings, ...data.settings }; 
      } 
      this.tasks = data.tasks || {};
      this.templates = data.templates || {};
      this.history = data.history || [];
      this.points = data.points || {};
      this.monthly_history = data.monthly_history || {};
      this.current_month = data.current_month;
      this.current_period_start = data.current_period_start;
      this._myRole = data.my_role || null;
      this._haUsers = Array.isArray(data.ha_users) ? data.ha_users : [];
      this._settingsLoaded = true;
      this._render(); 
    }); 
  }
  
  /**
   * Returns the (lazily created) draft of the kid profile editor for a participant.
   * Drafts survive re-renders so unsaved input is not lost when sections are toggled.
   * @param {string} uid - Participant ID.
   * @returns {object} - The draft.
   */
  _kidDraft(uid) {
    if (!this._kidDrafts[uid]) {
      const k = (this.settings.kids || {})[uid];
      const draft = {
        enabled: !!k,
        avatar: (k && k.avatar) || '🙂',
        color: (k && k.color) || '#4CAF50',
        birth_year: (k && k.birth_year) || '',
        birthday: (k && k.birthday) || '',
        approval_sample_rate: (k && parseInt(k.approval_sample_rate)) || 0,
        pin: '',
        clear_pin: false
      };
      // Do not cache before the stored profiles have been loaded
      if (!this._settingsLoaded) return draft;
      this._kidDrafts[uid] = draft;
    }
    return this._kidDrafts[uid];
  }

  /**
   * Returns the date when it is a valid YYYY-MM-DD date that is not in the future, else null.
   * @param {string} value - The value of a date input.
   * @returns {string|null} - The valid date.
   */
  _validBirthday(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!m) return null;
    const dt = new Date(+m[1], +m[2] - 1, +m[3]);
    if (dt.getFullYear() !== +m[1] || dt.getMonth() !== +m[2] - 1 || dt.getDate() !== +m[3]) return null;
    if (+m[1] < 1900 || dt > new Date()) return null;
    return value;
  }

  /**
   * Builds the websocket calls needed to persist the kid profile drafts.
   * Only admins and managers may change profiles; only admins change the parents. Returns null when validation fails.
   * @returns {Array<object>|null} - List of websocket payloads.
   */
  _collectKidCalls() {
    const calls = [];
    if (this._role() === 'admin' && this._parentsDraft) {
      const st = this._parentsDraft;
      calls.push({ type: 'task_organizer/set_parents', parents: [...st.parents], parents_manage: [...st.manage] });
    }
    if (!this._canManage()) return calls;
    const stored = this.settings.kids || {};
    for (const uid of Object.keys(this.users)) {
      const d = this._kidDrafts[uid];
      if (!d) continue; // never touched
      if (d.enabled) {
        if (d.pin && !/^\d{4}$/.test(d.pin)) {
          alert(`${this.users[uid]}: ${this.localize('invalid_pin')}`);
          return null;
        }
        const birthday = this._validBirthday(d.birthday);
        if (d.birthday && !birthday) {
          alert(`${this.users[uid]}: ${this.localize('invalid_birthday')}`);
          return null;
        }
        const year = birthday ? parseInt(birthday.slice(0, 4)) : parseInt(d.birth_year);
        const birthYear = (!isNaN(year) && year >= 1900 && year <= 2100) ? year : null;
        const rate = Math.max(0, Math.min(100, parseInt(d.approval_sample_rate) || 0));
        const old = stored[uid];
        const changed = !old || old.avatar !== d.avatar || old.color !== d.color ||
          (old.birth_year || null) !== birthYear || (old.birthday || null) !== (birthday || null) ||
          (parseInt(old.approval_sample_rate) || 0) !== rate || !!d.pin || d.clear_pin;
        if (changed) {
          const payload = {
            type: 'task_organizer/set_kid_profile',
            participant_id: uid,
            avatar: (d.avatar || '🙂').trim() || '🙂',
            color: d.color,
            birth_year: birthYear,
            birthday: birthday || null,
            approval_sample_rate: rate
          };
          if (d.pin) payload.pin = d.pin;
          if (d.clear_pin) payload.clear_pin = true;
          calls.push(payload);
        }
      } else if (stored[uid]) {
        calls.push({ type: 'task_organizer/delete_kid_profile', participant_id: uid });
      }
    }
    return calls;
  }

  /**
   * Full (unprorated) monthly goals: changed or newly entered goals become their own full goal,
   * untouched ones keep the full goal the wizard stored; goals that were cleared are dropped.
   * @param {object} pointGoals - The goals as entered (participant ID -> points).
   * @returns {object} - The new point_goals_full map.
   */
  _fullGoals(pointGoals) {
    const stored = this.settings.point_goals || {};
    const full = { ...(this.settings.point_goals_full || {}) };
    for (const uid of Object.keys(full)) if (!(uid in pointGoals)) delete full[uid];
    for (const [uid, value] of Object.entries(pointGoals)) {
      if (stored[uid] !== value) full[uid] = value;
    }
    return full;
  }

  /**
   * Gathers modified settings from the UI and saves them via websocket.
   */
  async _saveSettings() { 
    const pointGoals = {};
    this.shadowRoot.querySelectorAll('.user-goal-input').forEach(input => {
      const val = parseInt(input.value);
      if (!isNaN(val) && val > 0) pointGoals[input.dataset.uid] = val;
    });

    // We merge the currently visible values into this.settings first
    ['done', 'due', 'overdue'].forEach(status => {
      const cInput = this.shadowRoot.getElementById(`c-${status}`);
      if (cInput) this.settings[`color_${status}_${this._themeView}`] = cInput.value;
      const tInput = this.shadowRoot.getElementById(`t-${status}`);
      if (tInput) this.settings[`transparency_${status}_${this._themeView}`] = parseInt(tInput.value);
    });

    // Read ALL form values before the first await: saving a kid profile fires an
    // update event which re-renders the card and would reset unsaved inputs.
    const newSettings = { 
      ...this.settings,
      overdue_days: parseInt(this.shadowRoot.getElementById('num-overdue').value),
      point_goals: pointGoals,
      // A manually entered goal replaces the prorated start-month goal: it is also the full goal
      point_goals_full: this._fullGoals(pointGoals)
    }; 
    delete newSettings.kids;
    // Triggers and the wizard memory are managed by dedicated admin-only commands
    delete newSettings.bonus_triggers;
    delete newSettings.wizard;
    // Roles are changed by the admin-only set_parents command
    delete newSettings.parents;
    delete newSettings.parents_manage;

    const fgPoints = this.shadowRoot.getElementById('fg-points');
    if (fgPoints) {
      newSettings.family_goal = {
        points: Math.max(0, parseInt(fgPoints.value) || 0),
        reward: (this.shadowRoot.getElementById('fg-reward')?.value || '').trim()
      };
      newSettings.claim_minutes = Math.max(1, parseInt(this.shadowRoot.getElementById('claim-minutes')?.value) || 10);
      const num = (id, lo, hi, def) => {
        const v = parseFloat(this.shadowRoot.getElementById(id)?.value);
        return isNaN(v) ? def : Math.max(lo, Math.min(hi, v));
      };
      newSettings.cheat_penalty_factor = num('cheat-factor', 0, 2, 1);
      newSettings.cheat_strict_days = Math.round(num('cheat-days', 0, 30, 7));
      newSettings.birthday_bonus_points = Math.round(num('bday-bonus', 0, 50, 10));
      newSettings.team_bonus = Math.round(num('team-bonus', 0, 3, 1));
      newSettings.birthday_duty_free = !!this.shadowRoot.getElementById('bday-free')?.checked;
      newSettings.expire_missed = !!this.shadowRoot.getElementById('expire-missed')?.checked;
    }

    // Kid profiles (incl. PINs) are stored by dedicated admin-only commands
    const kidCalls = this._collectKidCalls();
    if (kidCalls === null) return;
    try {
      for (const call of kidCalls) await this._hass.callWS(call);
    } catch (err) {
      alert(this.localize('kids_save_error') + (err && err.message ? err.message : ''));
      return;
    }
    
    this._hass.callWS({ type: 'task_organizer/update_settings', settings: newSettings }).then(() => { 
      this._kidDrafts = {};
      this._parentsDraft = null;
      this._goalDrafts = {};
      this._familyDraft = {};
      alert(this.localize('success')); 
      this._fetchData(); 
    }); 
  }
  
  /**
   * Triggers a manual reset of the monthly points.
   */
  _triggerReset() { 
    if (confirm(this.localize('confirm_reset'))) { 
      this._hass.callService('task_organizer', 'reset_monthly_points', {}).then(() => { 
        this._fetchData(); 
      }); 
    } 
  }

  /**
   * Triggers a full factory reset of the integration.
   */
  _factoryReset() { 
    if (confirm(this.localize('confirm_factory'))) { 
      this._hass.callWS({ type: 'task_organizer/factory_reset' }).then(() => { 
        location.reload(); 
      }); 
    } 
  }
  
  /**
   * Toggles the visibility of the advanced settings section.
   */
  _toggleAdvanced() { 
    this._advancedOpen = !this._advancedOpen; 
    this._render(); 
  }

  /**
   * Central click handler for the settings card.
   */
  _handleClick(ev) {
    const path = ev.composedPath();
    const target = path.find(el =>
        (el.id && (el.id.startsWith('btn-') || el.id.startsWith('toggle-') || el.id === 'theme-toggle' || el.id.endsWith('-toggle'))) ||
        (el.classList && (el.classList.contains('action-btn') || el.classList.contains('subtask-check') || el.classList.contains('kid-emoji-pick')))
    );

    if (!target) return;
    ev.stopPropagation();
    
    const id = target.id;
    if (id === 'btn-save') this._saveSettings();
    else if (id === 'theme-toggle') {
      this._themeView = target.checked ? 'dark' : 'light';
      this._render();
    }
    else if (id === 'btn-default-colors') {
      ['done', 'due', 'overdue'].forEach(status => {
        delete this.settings[`color_${status}_light`];
        delete this.settings[`transparency_${status}_light`];
        delete this.settings[`color_${status}_dark`];
        delete this.settings[`transparency_${status}_dark`];
        delete this.settings[`color_${status}`];
      });
      this._render();
    }
    else if (id === 'color-toggle') { this._colorOpen = !this._colorOpen; this._render(); }
    else if (id === 'overdue-toggle') { this._overdueOpen = !this._overdueOpen; this._render(); }
    else if (id === 'ie-toggle') { this._ieOpen = !this._ieOpen; this._render(); }
    else if (id === 'templates-toggle') { this._templatesOpen = !this._templatesOpen; this._render(); }
    else if (id === 'adv-toggle') { this._advancedOpen = !this._advancedOpen; this._render(); }
    else if (id === 'goals-toggle') { this._goalsOpen = !this._goalsOpen; this._render(); }
    else if (id === 'kids-toggle') { this._kidsOpen = !this._kidsOpen; this._render(); }
    else if (id === 'trig-toggle') { this._trigOpen = !this._trigOpen; this._render(); }
    else if (id === 'btn-wizard-open') this._openWizard();
    else if (id === 'btn-help-open') { if (window.TaskOrganizerHelp) window.TaskOrganizerHelp.open(this._hass, 'setup'); }
    else if (id === 'btn-trig-add') this._addTrigger();
    else if (target.classList.contains('btn-trig-del')) this._removeTrigger(parseInt(target.dataset.index));
    else if (target.classList.contains('kid-emoji-pick')) {
      if (this._canManage()) {
        this._kidDraft(target.dataset.uid).avatar = target.dataset.emoji;
        this._render();
      }
    }
    else if (id === 'btn-export') this._exportTasks();
    else if (id === 'btn-import-trigger') this._openImportModal();
    else if (id === 'btn-import-cancel') this._closeImportModal();
    else if (id === 'btn-import-start') this._startImport();
    else if (id === 'btn-import-reload') location.reload();
    else if (id === 'btn-add-template') this._openTemplateModal();
    else if (target.classList.contains('btn-edit-template')) this._openTemplateModal(target.dataset.id);
    else if (target.classList.contains('btn-delete-template')) this._deleteTemplate(target.dataset.id);
    else if (id === 'btn-reset') this._triggerReset();
    else if (id === 'btn-factory') this._factoryReset();
    // Modal Handlers
    else if (id === 'btn-modal-cancel') this._closeTemplateModal();
    else if (id === 'btn-modal-save') this._saveTemplate();
    else if (id === 'toggle-subtasks') this._toggleSection('subtasks-content');
    else if (id === 'btn-add-subtask') this._addSubtask();
    else if (target.classList.contains('btn-del-subtask')) this._removeSubtask(target.dataset.index);
    else if (target.classList.contains('subtask-check')) this._toggleSubtaskStatus(target.dataset.index);
  }

  /**
   * Toggles the visibility of a settings section.
   * @param {string} id - The ID of the content element.
   */
  _toggleSection(id) {
    const content = this.shadowRoot.getElementById(id);
    if (!content) return;
    const headerId = "toggle-" + id.replace("-content", "");
    const icon = this.shadowRoot.querySelector(`#${headerId} ha-icon`);
    const isHidden = content.style.display === 'none' || getComputedStyle(content).display === 'none';
    if (isHidden) {
        content.style.display = 'flex';
        if (icon) icon.setAttribute('icon', 'mdi:chevron-up');
    } else {
        content.style.display = 'none';
        if (icon) icon.setAttribute('icon', 'mdi:chevron-down');
    }
  }

  /**
   * Sets the visibility state of a specific section.
   * @param {string} id - The content element ID.
   * @param {boolean} open - Whether it should be visible.
   */
  _setSectionState(id, open) {
    const content = this.shadowRoot.getElementById(id);
    if (!content) return;
    const headerId = "toggle-" + id.replace("-content", "");
    const icon = this.shadowRoot.querySelector(`#${headerId} ha-icon`);
    if (open) {
        content.style.display = 'flex';
        if (icon) icon.setAttribute('icon', 'mdi:chevron-up');
    } else {
        content.style.display = 'none';
        if (icon) icon.setAttribute('icon', 'mdi:chevron-down');
    }
  }

  /**
   * Adds a subtask to the local template editor.
   */
  _addSubtask() {
    const input = this.shadowRoot.getElementById('new-subtask-title');
    const title = input.value.trim();
    if (!title) return;
    this._subtasks.push({ title: title, done: false });
    input.value = '';
    this._renderModalSubtasks();
  }

  /**
   * Removes a subtask from the template editor.
   * @param {number} index - Index of the subtask.
   */
  _removeSubtask(index) {
    this._subtasks.splice(index, 1);
    this._renderModalSubtasks();
  }

  /**
   * Toggles completion status of a subtask in the template editor.
   * @param {number} index - Index of the subtask.
   */
  _toggleSubtaskStatus(index) {
    this._subtasks[index].done = !this._subtasks[index].done;
    this._renderModalSubtasks();
  }

  /**
   * Toggles the visibility of the import/export section.
   */
  _toggleIE() { 
    this._ieOpen = !this._ieOpen; 
    this._render(); 
  }

  /**
   * Toggles the template management section.
   */
  _toggleTemplates() {
    this._templatesOpen = !this._templatesOpen;
    this._render();
  }

  /**
   * Opens the modal for adding or editing a task template.
   * @param {string|null} id - The template ID to edit, or null for new.
   */
  _openTemplateModal(id = null) {
    this._editingTemplateId = id;
    this._templateModalOpen = true;
    this._subtasks = [];
    if (id && this.templates[id]) {
        this._subtasks = this.templates[id].subtasks ? JSON.parse(JSON.stringify(this.templates[id].subtasks)) : [];
    }
    this._render();
    this._setSectionState('subtasks-content', this._subtasks.length > 0);
    this._renderModalSubtasks();
  }

  /**
   * Closes the template editor modal.
   */
  _closeTemplateModal() {
    this._templateModalOpen = false;
    this._editingTemplateId = null;
    this._subtasks = [];
    this._render();
  }

  /**
   * Saves the current template data to the backend via websocket.
   */
  _saveTemplate() {
    const assignees = [];
    this.shadowRoot.querySelectorAll('.tmpl-assignee-cb').forEach(cb => {
        if (cb.checked) assignees.push(cb.value);
    });

    const payload = {
      name: this.shadowRoot.getElementById('tmpl-name').value,
      description: this.shadowRoot.getElementById('tmpl-desc').value,
      area: this.shadowRoot.getElementById('tmpl-area').value,
      complexity: parseInt(this.shadowRoot.getElementById('tmpl-complexity').value),
      icon: this.shadowRoot.getElementById('tmpl-icon').value,
      interval: parseInt(this.shadowRoot.getElementById('tmpl-interval').value),
      category: this.shadowRoot.getElementById('tmpl-category').value || 'basis',
      min_age: Math.max(0, Math.min(18, parseInt(this.shadowRoot.getElementById('tmpl-min-age').value) || 0)),
      requires_approval: !!this.shadowRoot.getElementById('tmpl-approval')?.checked,
      requires_routine: !!this.shadowRoot.getElementById('tmpl-routine')?.checked,
      allow_together: !!this.shadowRoot.getElementById('tmpl-together')?.checked,
      available_from: this.shadowRoot.getElementById('tmpl-available-from')?.value || '',
      available_until: this.shadowRoot.getElementById('tmpl-available-until')?.value || '',
      reminder_at: this.shadowRoot.getElementById('tmpl-reminder')?.checked ? (this.shadowRoot.getElementById('tmpl-reminder-at')?.value || '18:00') : '',
      reminder_target: this.shadowRoot.getElementById('tmpl-reminder')?.checked ? (this.shadowRoot.getElementById('tmpl-reminder-target')?.value || '') : '',
      assignees: assignees,
      subtasks: this._subtasks
    };

    if (!payload.name || !payload.icon) {
        alert("Name and Icon are required.");
        return;
    }

    const type = this._editingTemplateId ? 'task_organizer/edit_template' : 'task_organizer/add_template';
    if (this._editingTemplateId) {
      payload.template_id = this._editingTemplateId;
    }

    this._hass.callWS({ type, ...payload }).then(() => {
      this._showToast(this.localize('template_saved'));
      this._closeTemplateModal();
      this._fetchData();
    });
  }

  /**
   * Renders the subtask list inside the template modal.
   */
  _renderModalSubtasks() {
    const container = this.shadowRoot.getElementById('subtask-list');
    if (!container) return;
    if (this._subtasks.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = this._subtasks.map((st, index) => `
        <div style="display: flex; align-items: center; gap: 8px; background: var(--secondary-background-color); padding: 4px 8px; border-radius: 4px;">
            <ha-checkbox class="subtask-check" data-index="${index}" ${st.done ? 'checked' : ''}></ha-checkbox>
            <span style="flex: 1; font-size: 14px; ${st.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${st.title}</span>
            <button class="action-btn btn-del-subtask" data-index="${index}" style="width: 30px; height: 30px;">
                <ha-icon icon="mdi:close" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
        </div>
    `).join('');
  }

  /**
   * Dispatches a notification to the Home Assistant toast system.
   * @param {string} message - Message to show.
   */
  _showToast(message) {
    const event = new CustomEvent("hass-notification", {
        detail: { message: message, duration: 3000 },
        bubbles: true,
        composed: true
    });
    this.dispatchEvent(event);
    
    const root = document.querySelector("home-assistant");
    if (root) { 
        root.dispatchEvent(new CustomEvent("hass-notification", { detail: { message: message, duration: 3000 } })); 
    }
  }

  /**
   * Deletes a template from the backend.
   * @param {string} id - The ID of the template.
   */
  _deleteTemplate(id) {
    if (confirm(this.localize('confirm_delete_template'))) {
      this._hass.callWS({ type: 'task_organizer/delete_template', template_id: id })
        .then(() => {
          alert(this.localize('template_deleted'));
          this._showToast(this.localize('template_deleted'));
        });
    }
  }

  /**
   * Generates a JSON file containing all tasks and prompts a download.
   */
  _exportTasks() {
    const exportTasks = this.shadowRoot.getElementById('cb-export-tasks').checked;
    const exportTemplates = this.shadowRoot.getElementById('cb-export-templates').checked;
    const exportHistory = this.shadowRoot.getElementById('cb-export-history').checked;
    const exportSettings = this.shadowRoot.getElementById('cb-export-settings').checked;
    
    let dataToExport = {};
    if (exportTasks) dataToExport.tasks = this.tasks;
    if (exportTemplates) dataToExport.templates = this.templates;
    if (exportHistory) {
      dataToExport.history = this.history;
      dataToExport.points = this.points;
      dataToExport.monthly_history = this.monthly_history;
      dataToExport.current_month = this.current_month;
      dataToExport.current_period_start = this.current_period_start;
    }
    if (exportSettings) dataToExport.settings = this.settings;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "task_organizer_export.json");
    
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  _openImportModal() {
    this._importModalOpen = true;
    this._importState = 'initial';
    this._importData = null;
    this._importProgress = 0;
    this._render();
  }

  _closeImportModal() {
    this._importModalOpen = false;
    this._importState = 'initial';
    this._importData = null;
    this._importProgress = 0;
    this._render();
  }

  _handleImportFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        let payload = { type: 'task_organizer/import_tasks' };
        
        if (importedData.tasks || importedData.templates || importedData.history || importedData.settings) {
            if (importedData.tasks) payload.tasks = importedData.tasks;
            if (importedData.templates) payload.templates = importedData.templates;
            if (importedData.settings) payload.settings = importedData.settings;
            if (importedData.history) {
                payload.history = importedData.history;
                if (importedData.points) payload.points = importedData.points;
                if (importedData.monthly_history) payload.monthly_history = importedData.monthly_history;
                if (importedData.current_month) payload.current_month = importedData.current_month;
                if (importedData.current_period_start) payload.current_period_start = importedData.current_period_start;
            }
        } else {
            payload.tasks = importedData;
        }

        this._importData = payload;
        this._importState = 'ready';
        this._render();
      } catch (err) {
        this._importState = 'error';
        this._render();
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  }

  _startImport() {
    if (!this._importData) return;
    this._importState = 'importing';
    this._importProgress = 0;
    this._render();

    // Simulate progress
    const progressInterval = setInterval(() => {
        if (this._importProgress < 90) {
            this._importProgress += 10;
            this._render();
        }
    }, 100);

    this._hass.callWS(this._importData).then(() => {
        clearInterval(progressInterval);
        this._importProgress = 100;
        this._importState = 'done';
        this._fetchData();
        this._render();
    }).catch(() => {
        clearInterval(progressInterval);
        this._importState = 'error';
        this._render();
    });
  }

  /**
   * Generates the custom CSS for the card view.
   */
  _getStyles() {
    const width = this._config.card_width || '100%';
    const height = this._config.card_height || 'auto';

    return `
      <style> 
        :host { display: block; width: ${width}; margin: 0 auto; } * { box-sizing: border-box; } 
        ha-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; height: ${height}; overflow-y: auto; } 
        .header { font-size: 20px; font-weight: bold; margin-bottom: 10px; } 
        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--card-background-color); border-radius: 8px; border: 1px solid var(--divider-color); box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0,0,0,0.1)); margin-bottom: 8px; } 
        .setting-label { font-weight: bold; font-size: 14px; color: var(--primary-text-color); } 
        .section-card { background: var(--card-background-color); border-radius: 8px; border: 1px solid var(--divider-color); box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0,0,0,0.1)); margin-bottom: 12px; padding: 12px; width: 100%; box-sizing: border-box; }
        .section-header { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .section-title { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 14px; color: var(--primary-text-color); }
        .section-content { display: none; margin-top: 16px; flex-direction: column; gap: 10px; }
        .section-content.open { display: flex; }
        .color-group { display: flex; gap: 8px; }
        input[type="color"] { width: 35px; height: 35px; border: none; border-radius: 6px; cursor: pointer; background: none; padding: 0; } 
        input[type="number"] { width: 60px; padding: 6px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--primary-background-color); color: var(--primary-text-color); text-align: center; } 
        .btn { padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: opacity 0.2s; font-size: 14px; width: 100%; } 
        .btn:active { opacity: 0.7; } 
        .collapsible-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 5px; cursor: pointer; margin-top: 5px; border-top: 1px solid var(--divider-color); color: var(--secondary-text-color); font-size: 13px; font-weight: bold; } 
        .collapsible-content { display: none; flex-direction: column; gap: 10px; padding-top: 5px; } 
        .collapsible-content.open { display: flex; }
        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 5000; justify-content: center; align-items: center; } 
        .modal.open { display: flex; } 
        .modal-content { background: var(--card-background-color); color: var(--primary-text-color); padding: 24px; border-radius: 12px; width: 90%; max-width: 450px; max-height: 90vh; overflow-y: auto; box-shadow: 0px 4px 16px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 16px; }
        .form-label { font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 4px; display: block; } 
        .form-row { display: flex; gap: 16px; }
        .form-row[hidden] { display: none; }
        .form-col { flex: 1; }
        .templates-header { display: flex; justify-content: space-between; align-items: center; }
        .template-card { display: flex; align-items: center; justify-content: space-between; background: var(--card-background-color); padding: 12px; border-radius: 8px; border: 1px solid var(--divider-color); }
        .template-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .template-text { flex: 1; min-width: 0; }
        .template-name { font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 4px; cursor: help; overflow: hidden; }
        .template-name span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .template-meta { font-size: 12px; color: var(--secondary-text-color); }
        .template-actions { display: flex; gap: 0; align-items: center; }
        .templates-desc { font-size: 14px; color: var(--secondary-text-color); margin: 0; }
        .no-templates-msg { text-align: center; color: var(--secondary-text-color); padding: 10px; }
        .icon-button { padding: 0; background: transparent; border: none; cursor: pointer; color: var(--primary-text-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; transition: background-color 0.2s, transform 0.1s; flex-shrink: 0; }
        .icon-button:hover { background-color: var(--secondary-background-color); }
        .add-button { background: var(--primary-color, #2196F3) !important; color: white !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .add-button:hover { background: var(--dark-primary-color, #1976D2) !important; transform: scale(1.05); }
        
        /* Ensure icons maintain aspect ratio and scale flexibly within their buttons */
        .icon-button ha-icon {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          font-size: 24px; /* Default size, will scale down if container shrinks */
          line-height: 1; /* Ensures proper vertical alignment for font icons */
          --mdc-icon-size: 24px; /* For consistency with Home Assistant's Material Design Icons */
        }
        .action-btn { background: transparent; border: none; padding: 8px; border-radius: 50%; cursor: pointer; color: var(--secondary-text-color); transition: background-color 0.2s, color 0.2s; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
        .action-btn:hover { background-color: var(--divider-color); color: var(--primary-text-color); }
        .btn-edit-template { color: var(--info-color, #2196F3); } 
        .btn-delete-template { color: var(--error-color, #F44336); } 
        /* Specific button colors */
        .collapsible-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; cursor: pointer; border-top: 1px solid var(--divider-color); margin-top: 8px; color: var(--primary-text-color); font-weight: 500; }
        .collapsible-content { display: none; flex-direction: column; gap: 16px; padding: 8px 0 16px 0; }
        .subtask-input-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
        .subtask-list { display: flex; flex-direction: column; gap: 6px; }
        .form-select { width: 100%; box-sizing: border-box; height: 56px; padding: 0 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); font-family: inherit; font-size: 16px; }
        .kids-note { font-size: 13px; color: var(--secondary-text-color); margin: 0; }
        .kid-row { border: 1px solid var(--divider-color); border-left-width: 6px; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: var(--card-background-color); }
        .kid-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 500; font-size: 14px; color: var(--primary-text-color); }
        .kid-head .kid-avatar-preview { font-size: 24px; margin-right: 8px; }
        .kid-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; align-items: end; }
        .kid-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--secondary-text-color); }
        .kid-field input[type="text"], .kid-field input[type="password"], .kid-field input[type="number"] { width: 100%; height: 36px; padding: 4px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--primary-background-color); color: var(--primary-text-color); font-size: 14px; text-align: left; }
        .kid-field input[type="color"] { width: 100%; height: 36px; }
        .kid-slider { gap: 6px; }
        .kid-slider input[type="range"] { width: 100%; accent-color: var(--primary-color); }
        .kid-slider b { color: var(--primary-text-color); }
        .kid-hint { font-size: 11px; opacity: 0.8; }
        .kid-field input[type="date"] { width: 100%; height: 36px; padding: 4px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--primary-background-color); color: var(--primary-text-color); font-size: 14px; box-sizing: border-box; }
        .kid-emojis { display: flex; flex-wrap: wrap; gap: 4px; }
        .kid-emoji-pick { background: transparent; border: 1px solid var(--divider-color); border-radius: 8px; font-size: 20px; width: 36px; height: 36px; cursor: pointer; padding: 0; }
        .kid-emoji-pick.active { border-color: var(--primary-color); background: var(--secondary-background-color); }
        .kid-emoji-pick:disabled { opacity: 0.5; cursor: default; }
        .family-box { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--divider-color); padding-top: 12px; }
        .family-box h4 { margin: 0; font-size: 14px; }
        .parent-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 16px; padding: 6px 0; border-bottom: 1px solid var(--divider-color); }
        .parent-name { flex: 1 1 140px; font-weight: 500; font-size: 14px; color: var(--primary-text-color); }
        .parent-check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--primary-text-color); }
        .wizard-box { display: flex; flex-direction: column; gap: 6px; }
        .btn-help { align-self: flex-start; background: var(--secondary-background-color, #f0f0f0); color: var(--primary-text-color); font-size: 14px; }
        .btn-wizard { background: linear-gradient(135deg, #7E57C2, #2196F3); color: white; font-size: 15px; }
        .trig-row { display: flex; align-items: center; gap: 8px; border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px 8px 8px 12px; background: var(--card-background-color); }
        .trig-text { flex: 1; min-width: 0; font-size: 13px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
        .trig-text b { color: var(--primary-text-color); font-size: 14px; display: block; }
        .trig-add { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--divider-color); padding-top: 12px; }
        .btn-save { background: #2196F3; color: white; margin-top: 8px; } 
        .btn-reset { background: #FF9800; color: white; } 
        .btn-factory { background: #F44336; color: white; } 
        .btn-export { background: #2196F3; color: white; }
        .btn-import { background: #2196F3; color: white; }
      </style>
    `;
  }

  /**
   * Current value of the monthly goal input of a person (draft first, then stored).
   * @param {string} uid - Participant ID.
   * @returns {string|number} - Value for the input.
   */
  _goalValue(uid) {
    if (this._goalDrafts[uid] !== undefined) return this._goalDrafts[uid];
    return this.settings.point_goals?.[uid] || '';
  }

  /**
   * Renders the collapsible "Kids" section (kid profiles + family goal).
   * @returns {string} - The HTML.
   */
  _renderKidsSection() {
    const isAdmin = this._canManage();
    const dis = isAdmin ? '' : 'disabled';
    const emojis = ['🦊', '🐼', '🦁', '🐯', '🐸', '🐵', '🦄', '🐶', '🐱', '🐰', '🐻', '🐧', '🚀'];
    const fg = this.settings.family_goal || {};
    const fd = this._familyDraft;
    const fgPointsVal = fd.points !== undefined ? fd.points : (fg.points || '');
    const fgRewardVal = fd.reward !== undefined ? fd.reward : (fg.reward || '');
    const claimVal = fd.claim !== undefined ? fd.claim : (this.settings.claim_minutes || 10);
    const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

    const rows = Object.entries(this.users).map(([uid, name]) => {
      const d = this._kidDraft(uid);
      const stored = (this.settings.kids || {})[uid];
      const hasPin = !!(stored && stored.has_pin);
      return `
        <div class="kid-row" style="${d.enabled ? `border-left-color: ${esc(d.color)};` : ''}">
          <div class="kid-head">
            <span>${d.enabled ? `<span class="kid-avatar-preview">${esc(d.avatar)}</span>` : ''}${esc(name)}</span>
            <ha-formfield label="${this.localize('kid_enable')}">
              <ha-switch class="kid-enabled" data-uid="${esc(uid)}" ${d.enabled ? 'checked' : ''} ${dis}></ha-switch>
            </ha-formfield>
          </div>
          ${d.enabled ? `
            <div class="kid-emojis">
              ${emojis.map(e => `<button class="kid-emoji-pick ${d.avatar === e ? 'active' : ''}" data-uid="${esc(uid)}" data-emoji="${e}" ${dis}>${e}</button>`).join('')}
            </div>
            <div class="kid-fields">
              <label class="kid-field">${this.localize('kid_avatar')}
                <input type="text" class="kid-avatar" data-uid="${esc(uid)}" maxlength="8" value="${esc(d.avatar)}" ${dis}>
              </label>
              <label class="kid-field">${this.localize('kid_color')}
                <input type="color" class="kid-color" data-uid="${esc(uid)}" value="${esc(d.color)}" ${dis}>
              </label>
              <label class="kid-field" style="grid-column:1 / -1">${this.localize('kid_birthday')}
                ${toSetBdayHtml(esc(d.birthday), `class="kid-birthday" data-uid="${esc(uid)}"`, (this._hass?.language || 'en').slice(0, 2), !!dis)}
              </label>
              <label class="kid-field">${this.localize('kid_birth_year_fallback')}
                <input type="number" class="kid-birth" data-uid="${esc(uid)}" min="1900" max="2100" placeholder="2015"
                       value="${esc(this._validBirthday(d.birthday) ? d.birthday.slice(0, 4) : d.birth_year)}" ${this._validBirthday(d.birthday) ? 'disabled' : dis}>
              </label>
              <label class="kid-field">${this.localize('kid_goal')}
                <input type="number" class="user-goal-input" data-uid="${esc(uid)}" min="0" placeholder="0" value="${esc(this._goalValue(uid))}">
              </label>
              <label class="kid-field">${this.localize('kid_pin')}
                <input type="password" inputmode="numeric" autocomplete="new-password" maxlength="4" class="kid-pin" data-uid="${esc(uid)}" value="${esc(d.pin)}"
                       placeholder="${hasPin ? this.localize('kid_pin_set') : this.localize('kid_pin_none')}" ${dis}>
              </label>
              ${hasPin ? `
                <ha-formfield label="${this.localize('kid_pin_clear')}">
                  <ha-checkbox class="kid-clear-pin" data-uid="${esc(uid)}" ${d.clear_pin ? 'checked' : ''} ${dis}></ha-checkbox>
                </ha-formfield>` : ''}
            </div>
            <label class="kid-field kid-slider" title="${esc(this.localize('kid_sample_hint'))}">
              <span class="kid-sample-label">${this.localize('kid_sample').replace('{n}', `<b>${d.approval_sample_rate}</b>`)}</span>
              <input type="range" class="kid-sample" data-uid="${esc(uid)}" min="0" max="100" step="5" value="${esc(d.approval_sample_rate)}" ${dis}>
              <span class="kid-hint">${this.localize('kid_sample_hint')}</span>
            </label>` : ''}
        </div>`;
    }).join('');

    return `
        <div class="section-card">
          <div class="section-header" id="kids-toggle">
            <div class="section-title">
              <ha-icon icon="${this._kidsOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('kids_title')}</span>
            </div>
          </div>
          <div class="section-content ${this._kidsOpen ? 'open' : ''}" id="kids-content">
            <p class="kids-note">${this.localize('kids_desc')}</p>
            ${window.TaskOrganizerHelp ? `<button class="btn btn-help" id="btn-help-open">❓ ${this.localize('help_btn')}</button>` : ''}
            ${isAdmin ? '' : `<p class="kids-note" style="color: var(--warning-color, #FFA000);">${this.localize('kids_admin_only')}</p>`}
            ${isAdmin ? `
              <div class="wizard-box">
                <button class="btn btn-wizard" id="btn-wizard-open">${this.localize('wizard_btn')}</button>
                <p class="kids-note">${this.localize('wizard_hint')}</p>
              </div>` : ''}
            ${rows}
            ${this._renderParentsSection()}
            <div class="family-box">
              <h4>${this.localize('family_goal')}</h4>
              <div class="kid-fields">
                <label class="kid-field">${this.localize('family_goal_points')}
                  <input type="number" id="fg-points" min="0" placeholder="0" value="${esc(fgPointsVal)}">
                </label>
                <label class="kid-field">${this.localize('family_goal_reward')}
                  <input type="text" id="fg-reward" maxlength="80" placeholder="${this.localize('family_goal_reward_ph')}" value="${esc(fgRewardVal)}">
                </label>
                <label class="kid-field">${this.localize('claim_minutes')}
                  <input type="number" id="claim-minutes" min="1" max="240" value="${esc(claimVal)}">
                </label>
              </div>
              <ha-formfield label="${this.localize('expire_missed')}">
                <ha-switch id="expire-missed" ${(fd.expire_missed !== undefined ? fd.expire_missed : this.settings.expire_missed !== false) ? 'checked' : ''}></ha-switch>
              </ha-formfield>
            </div>
            <div class="family-box">
              <h4>${this.localize('approval_title')}</h4>
              <div class="kid-fields">
                <label class="kid-field">${this.localize('cheat_penalty_factor')}
                  <input type="number" id="cheat-factor" min="0" max="2" step="0.5" value="${esc(fd.cheat_factor !== undefined ? fd.cheat_factor : (this.settings.cheat_penalty_factor !== undefined ? this.settings.cheat_penalty_factor : 1))}">
                </label>
                <label class="kid-field">${this.localize('cheat_strict_days')}
                  <input type="number" id="cheat-days" min="0" max="30" step="1" value="${esc(fd.cheat_days !== undefined ? fd.cheat_days : (this.settings.cheat_strict_days !== undefined ? this.settings.cheat_strict_days : 7))}">
                </label>
              </div>
            </div>
            <div class="family-box">
              <h4>👫 ${this.localize('team_title')}</h4>
              <div class="kid-fields">
                <label class="kid-field">${this.localize('team_bonus')}
                  <input type="number" id="team-bonus" min="0" max="3" step="1" value="${esc(fd.team_bonus !== undefined ? fd.team_bonus : (this.settings.team_bonus !== undefined ? this.settings.team_bonus : 1))}">
                </label>
              </div>
            </div>
            <div class="family-box">
              <h4>🎂 ${this.localize('birthday_title')}</h4>
              <div class="kid-fields">
                <label class="kid-field">${this.localize('birthday_bonus_points')}
                  <input type="number" id="bday-bonus" min="0" max="50" step="1" value="${esc(fd.bday_bonus !== undefined ? fd.bday_bonus : (this.settings.birthday_bonus_points !== undefined ? this.settings.birthday_bonus_points : 10))}">
                </label>
              </div>
              <ha-formfield label="${this.localize('birthday_duty_free')}">
                <ha-switch id="bday-free" ${(fd.bday_free !== undefined ? fd.bday_free : this.settings.birthday_duty_free !== false) ? 'checked' : ''}></ha-switch>
              </ha-formfield>
            </div>
          </div>
        </div>`;
  }

  /**
   * Renders the "Parents" subsection: who may approve (parent) and who may also manage.
   * Only administrators can change it.
   * @returns {string} - The HTML.
   */
  _renderParentsSection() {
    const canEdit = this._role() === 'admin';
    const st = this._parentsState();
    const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const rows = this._parentRows().map(({ uid, name }) => {
      const isManager = st.manage.has(uid);
      const isParent = st.parents.has(uid) || isManager;
      return `
        <div class="parent-row">
          <span class="parent-name">${esc(name)}</span>
          <label class="parent-check"><input type="checkbox" class="parent-parent" data-uid="${esc(uid)}" ${isParent ? 'checked' : ''} ${canEdit && !isManager ? '' : 'disabled'}> ${this.localize('parents_col_parent')}</label>
          <label class="parent-check"><input type="checkbox" class="parent-manage" data-uid="${esc(uid)}" ${isManager ? 'checked' : ''} ${canEdit ? '' : 'disabled'}> ${this.localize('parents_col_manage')}</label>
        </div>`;
    }).join('');
    return `
            <div class="family-box" id="parents-box">
              <h4>${this.localize('parents_title')}</h4>
              <p class="kids-note">${this.localize('parents_desc')}</p>
              <p class="kids-note" style="color: var(--warning-color, #FFA000);">⚠️ ${this.localize('parents_warn')}</p>
              ${canEdit ? '' : `<p class="kids-note">${this.localize('parents_admin_only')}</p>`}
              ${rows || `<p class="kids-note">${this.localize('parents_none')}</p>`}
            </div>`;
  }

  /**
   * Makes sure the wizard / trigger picker elements are defined. They live in
   * task-organizer-wizard.js, which the integration registers as a resource;
   * the dynamic import is the fallback for manually managed resources.
   * @returns {Promise<boolean>} - True when the elements are available.
   */
  async _ensureWizardLoaded() {
    if (customElements.get('task-organizer-wizard')) return true;
    try {
      await import('/task_organizer_frontend/task-organizer-wizard.js');
    } catch (err) {
      console.warn('TaskOrganizer: wizard could not be loaded', err);
    }
    return !!customElements.get('task-organizer-wizard');
  }

  /**
   * Opens the kids mode quick-start wizard (admins and managers).
   */
  async _openWizard() {
    if (!this._canManage()) return;
    if (!(await this._ensureWizardLoaded())) {
      alert(this.localize('wizard_missing'));
      return;
    }
    if (this._wizard) this._wizard.remove();
    const wizard = document.createElement('task-organizer-wizard');
    wizard.addEventListener('wizard-closed', () => {
      this._wizard = null;
      this._kidDrafts = {};
      this._goalDrafts = {};
      this._familyDraft = {};
      this._fetchData();
    });
    document.body.appendChild(wizard);
    this._wizard = wizard;
    wizard.open(this._hass);
  }

  /**
   * Open bonus tasks that a trigger can be attached to.
   * @returns {Array<object>} - The bonus tasks.
   */
  _bonusTasks() {
    return Object.values(this.tasks || {})
      // Bonus tasks; unassigned tasks qualify too (open for every kid)
      .filter(t => t.category === 'bonus' || !(Array.isArray(t.assignees) && t.assignees.length))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  /**
   * Resolves the task of a stored trigger (by task_id or wizard_key).
   * @param {object} trig - The trigger.
   * @returns {object|null} - The task.
   */
  _triggerTask(trig) {
    const tasks = Object.values(this.tasks || {});
    if (trig.task_id) return this.tasks[trig.task_id] || null;
    return tasks.find(t => t.wizard_key && t.wizard_key === trig.wizard_key) || null;
  }

  /**
   * Renders the collapsible "Bonus triggers" section.
   * @returns {string} - The HTML.
   */
  _renderTriggersSection() {
    const isAdmin = this._canManage();
    const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const triggers = this.settings.bonus_triggers || [];
    const entityName = (id) => {
      const st = this._hass && this._hass.states && this._hass.states[id];
      return (st && st.attributes && st.attributes.friendly_name) || id;
    };
    const rows = triggers.map((trig, i) => {
      const task = this._triggerTask(trig);
      return `
        <div class="trig-row">
          <div class="trig-text"><b>${esc(task ? task.name : (trig.wizard_key || trig.task_id))}</b>
            ${esc(this.localize('trig_when').replace('{entity}', entityName(trig.entity_id)).replace('{state}', trig.to_state))}</div>
          <button class="action-btn btn-trig-del" data-index="${i}" title="${this.localize('trig_remove')}" ${isAdmin ? '' : 'disabled'}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>`;
    }).join('');
    const d = this._trigDraft;
    return `
        <div class="section-card">
          <div class="section-header" id="trig-toggle">
            <div class="section-title">
              <ha-icon icon="${this._trigOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('triggers_title')}</span>
            </div>
          </div>
          <div class="section-content ${this._trigOpen ? 'open' : ''}" id="trig-content">
            <p class="kids-note">${this.localize('triggers_desc')}</p>
            ${rows || `<p class="kids-note">${this.localize('trig_none')}</p>`}
            ${isAdmin ? `
              <div class="trig-add">
                <label class="kid-field">${this.localize('trig_task')}
                  <select class="form-select" id="trig-task" style="height: 38px; font-size: 14px;">
                    <option value="">${this.localize('trig_pick_task')}</option>
                    ${this._bonusTasks().map(t => `<option value="${esc(t.id)}" ${d.task === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
                  </select>
                </label>
                ${this._bonusTasks().length ? '' : `<p class="kids-note">${this.localize('trig_no_bonus')}</p>`}
                <task-organizer-trigger-picker id="trig-picker"></task-organizer-trigger-picker>
                <button class="btn btn-save" id="btn-trig-add" style="margin-top: 0;" ${d.task && d.entity_id && d.to_state ? '' : 'disabled'}>${this.localize('trig_add')}</button>
              </div>` : ''}
          </div>
        </div>`;
  }

  /**
   * Wires the picker and the task select of the triggers section.
   */
  _bindTriggerInputs() {
    const root = this.shadowRoot;
    const picker = root.getElementById('trig-picker');
    if (!picker) return;
    const update = () => {
      const btn = root.getElementById('btn-trig-add');
      const d = this._trigDraft;
      if (btn) btn.disabled = !(d.task && d.entity_id && d.to_state);
    };
    this._ensureWizardLoaded().then((ok) => {
      if (!ok) return;
      picker.hass = this._hass;
      picker.value = this._trigDraft;
      picker.addEventListener('change', (ev) => {
        Object.assign(this._trigDraft, ev.detail);
        update();
      });
    });
    const sel = root.getElementById('trig-task');
    if (sel) sel.addEventListener('change', (ev) => { this._trigDraft.task = ev.target.value; update(); });
  }

  /**
   * Stores the list of bonus triggers via the admin-only websocket command.
   * @param {Array<object>} triggers - The complete new list.
   * @returns {Promise<boolean>} - True on success.
   */
  async _saveTriggers(triggers) {
    try {
      await this._hass.callWS({ type: 'task_organizer/set_bonus_triggers', triggers });
      return true;
    } catch (err) {
      alert(this.localize('trig_error') + (err && err.message ? err.message : ''));
      return false;
    }
  }

  /**
   * Adds the trigger of the draft form.
   */
  async _addTrigger() {
    const d = this._trigDraft;
    const task = this.tasks[d.task];
    if (!task || !d.entity_id || !d.to_state) return;
    const trig = { entity_id: d.entity_id, to_state: d.to_state };
    // Wizard tasks are referenced by their key: it survives re-creation by the wizard
    if (task.wizard_key) trig.wizard_key = task.wizard_key; else trig.task_id = task.id;
    const list = [...(this.settings.bonus_triggers || []), trig];
    if (await this._saveTriggers(list)) {
      this.settings.bonus_triggers = list;
      this._trigDraft = { task: '', entity_id: '', to_state: '', filter: '' };
      this._render();
    }
  }

  /**
   * Removes a trigger.
   * @param {number} index - Index in the trigger list.
   */
  async _removeTrigger(index) {
    const list = (this.settings.bonus_triggers || []).filter((_, i) => i !== index);
    if (await this._saveTriggers(list)) {
      this.settings.bonus_triggers = list;
      this._render();
    }
  }

  /**
   * Wires the inputs of the kids section to the drafts (no re-render while typing).
   */
  _bindKidInputs() {
    const root = this.shadowRoot;
    root.querySelectorAll('.kid-enabled').forEach(el => el.addEventListener('change', (ev) => {
      this._kidDraft(el.dataset.uid).enabled = !!ev.target.checked;
      this._render();
    }));
    root.querySelectorAll('.parent-parent').forEach(el => el.addEventListener('change', (ev) => {
      const st = this._parentsEdit();
      if (ev.target.checked) st.parents.add(el.dataset.uid); else { st.parents.delete(el.dataset.uid); st.manage.delete(el.dataset.uid); }
      this._render();
    }));
    root.querySelectorAll('.parent-manage').forEach(el => el.addEventListener('change', (ev) => {
      const st = this._parentsEdit();
      if (ev.target.checked) { st.manage.add(el.dataset.uid); st.parents.add(el.dataset.uid); } else st.manage.delete(el.dataset.uid);
      this._render();
    }));
    const bind = (selector, key, transform = (v) => v) => {
      root.querySelectorAll(selector).forEach(el => el.addEventListener('input', (ev) => {
        this._kidDraft(el.dataset.uid)[key] = transform(ev.target.value);
      }));
    };
    bind('.kid-avatar', 'avatar');
    bind('.kid-color', 'color');
    bind('.kid-birth', 'birth_year');
    toSetBdayBind(root);
    root.querySelectorAll('.kid-birthday').forEach(el => el.addEventListener('input', (ev) => {
      // A valid birthday determines the birth year (the year input is then read-only)
      const draft = this._kidDraft(el.dataset.uid);
      draft.birthday = ev.target.value;
      const valid = this._validBirthday(draft.birthday);
      const yearEl = root.querySelector(`.kid-birth[data-uid="${el.dataset.uid}"]`);
      if (yearEl) {
        yearEl.disabled = !!valid || !this._canManage();
        if (valid) yearEl.value = valid.slice(0, 4);
      }
    }));
    root.querySelectorAll('.kid-sample').forEach(el => el.addEventListener('input', (ev) => {
      const v = parseInt(ev.target.value) || 0;
      this._kidDraft(el.dataset.uid).approval_sample_rate = v;
      const label = el.parentElement.querySelector('.kid-sample-label');
      if (label) label.innerHTML = this.localize('kid_sample').replace('{n}', `<b>${v}</b>`);
    }));
    root.querySelectorAll('.kid-pin').forEach(el => el.addEventListener('input', (ev) => {
      const digits = ev.target.value.replace(/\D/g, '').slice(0, 4);
      if (digits !== ev.target.value) ev.target.value = digits;
      this._kidDraft(el.dataset.uid).pin = digits;
    }));
    root.querySelectorAll('.kid-clear-pin').forEach(el => el.addEventListener('change', (ev) => {
      this._kidDraft(el.dataset.uid).clear_pin = !!ev.target.checked;
    }));
    root.querySelectorAll('.user-goal-input').forEach(el => el.addEventListener('input', (ev) => {
      this._goalDrafts[el.dataset.uid] = ev.target.value;
    }));
    const fam = (id, key) => {
      const el = root.getElementById(id);
      if (el) el.addEventListener('input', (ev) => { this._familyDraft[key] = ev.target.value; });
    };
    fam('fg-points', 'points');
    fam('fg-reward', 'reward');
    fam('claim-minutes', 'claim');
    fam('cheat-factor', 'cheat_factor');
    fam('cheat-days', 'cheat_days');
    fam('bday-bonus', 'bday_bonus');
    fam('team-bonus', 'team_bonus');
    const bdayFree = root.getElementById('bday-free');
    if (bdayFree) bdayFree.addEventListener('change', (ev) => { this._familyDraft.bday_free = !!ev.target.checked; });
    const expire = root.getElementById('expire-missed');
    if (expire) expire.addEventListener('change', (ev) => { this._familyDraft.expire_missed = !!ev.target.checked; });
  }

  /**
   * Renders the HTML content.
   */
  _render() {
    if (!this._config || !this._hass) {
      return;
    }
    
    if (this._themeView === undefined) this._themeView = 'light';
    const displayTitle = this._config.title || this.localize('title');
    const showAdvanced = this._config.show_advanced === true;
    const template = this._editingTemplateId ? this.templates[this._editingTemplateId] : null;

    let html = this._getStyles();
    
    // Add Main Layout
    html += `
      <ha-card>
        <div class="header">${displayTitle}</div>
        
        <div class="section-card">
          <div class="section-header" id="color-toggle">
            <div class="section-title">
              <ha-icon icon="${this._colorOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('color_adjustments')}</span>
            </div>
            <div style="display: ${this._colorOpen ? 'flex' : 'none'}; align-items: center; gap: 8px;" @click="ev => ev.stopPropagation()">
              <ha-icon icon="mdi:weather-sunny" style="color: ${this._themeView === 'light' ? 'var(--primary-color)' : 'var(--disabled-text-color)'};"></ha-icon>
              <ha-switch id="theme-toggle" ${this._themeView === 'dark' ? 'checked' : ''}></ha-switch>
              <ha-icon icon="mdi:weather-night" style="color: ${this._themeView === 'dark' ? 'var(--primary-color)' : 'var(--disabled-text-color)'};"></ha-icon>
            </div>
          </div>
          
          <div class="section-content ${this._colorOpen ? 'open' : ''}">
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
              ${['done', 'due', 'overdue'].map(status => {
                const colorKey = `color_${status}_${this._themeView}`;
                const transpKey = `transparency_${status}_${this._themeView}`;
                
                const colorVal = this.settings[colorKey] || this.settings[`color_${status}`] || (status==='done'?'#4CAF50':status==='due'?'#FFC107':'#F44336');
                const transpVal = this.settings[transpKey] !== undefined ? this.settings[transpKey] : 8;
                
                return `
                <div style="display: grid; grid-template-columns: 35px 80px 1fr 35px; align-items: center; gap: 8px;">
                  <input type="color" id="c-${status}" value="${colorVal}" title="${this.localize(`color_${status}_lbl`)}" style="justify-self: center;">
                  <span style="font-size: 14px;">${this.localize(`c_${status}`)}</span>
                  <input type="range" min="0" max="100" value="${transpVal}" class="transparency-slider" id="t-${status}" style="width: 100%; cursor: pointer;">
                  <span style="font-size: 13px; color: var(--secondary-text-color); text-align: right;" id="tl-${status}">${transpVal}%</span>
                </div>
                `;
              }).join('')}
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: -8px;">
              <ha-button appearance="plain" id="btn-default-colors">${this.localize('set_default')}</ha-button>
            </div>
          </div>
        </div>
        
        <div class="section-card" style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 500; font-size: 14px; color: var(--primary-text-color);">${this.localize('days_overdue')}</span>
          <input type="number" id="num-overdue" min="1" value="${this.settings.overdue_days}">
        </div>
        
        <div class="section-card">
          <div class="section-header" id="ie-toggle">
            <div class="section-title">
              <ha-icon icon="${this._ieOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('import_export')}</span>
            </div>
          </div>
          <div class="section-content ${this._ieOpen ? 'open' : ''}">
            <div style="display: flex; gap: 16px; margin-bottom: 8px; flex-wrap: wrap;">
              <ha-formfield label="${this.localize('export_tasks_cb')}">
                <ha-checkbox id="cb-export-tasks" checked></ha-checkbox>
              </ha-formfield>
              <ha-formfield label="${this.localize('export_templates_cb')}">
                <ha-checkbox id="cb-export-templates" checked></ha-checkbox>
              </ha-formfield>
              <ha-formfield label="${this.localize('export_history_cb')}">
                <ha-checkbox id="cb-export-history"></ha-checkbox>
              </ha-formfield>
              <ha-formfield label="${this.localize('export_settings_cb')}">
                <ha-checkbox id="cb-export-settings" checked></ha-checkbox>
              </ha-formfield>
            </div>
            <div style="display: flex; gap: 10px; width: 100%;">
              <button class="btn btn-export" id="btn-export" title="${this.localize('export_hover')}">${this.localize('export_btn')}</button>
              <button class="btn btn-import" id="btn-import-trigger" title="${this.localize('import_hover')}">${this.localize('import_btn')}</button>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header" id="templates-toggle">
            <div class="section-title">
              <ha-icon icon="${this._templatesOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('templates')}</span>
            </div>
          </div>
          <div class="section-content ${this._templatesOpen ? 'open' : ''}" id="templates-content">
            <div class="templates-header">
              <p class="templates-desc">${this.localize('templates_desc')}</p>
              <button class="icon-button add-button" id="btn-add-template" title="${this.localize('add_template')}">
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
            <div id="template-list" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
              ${Object.values(this.templates).length > 0 ? Object.values(this.templates).map(t => {
                const descTooltip = t.description ? t.description.replace(/"/g, '&quot;') : "";
                let subtaskTooltip = "";
                if (t.subtasks && t.subtasks.length > 0) {
                    const subtaskList = t.subtasks.map(st => `${st.done ? '✓' : '○'} ${st.title}`).join('&#10;');
                    subtaskTooltip = `${this.localize('subtasks')}:&#10;${subtaskList}`;
                }
                return `
                <div class="template-card">
                  <div class="template-info">
                    <ha-icon icon="${t.icon || 'mdi:label-outline'}"></ha-icon>
                    <div class="template-text">
                      <div class="template-name">
                          <span ${descTooltip ? `title="${descTooltip}"` : 'style="cursor: default;"'}>${t.name}</span>
                          ${t.subtasks?.length > 0 ? `
                              <ha-icon icon="mdi:book-multiple-outline" style="--mdc-icon-size: 14px; opacity: 0.7; flex-shrink: 0;" title="${subtaskTooltip}"></ha-icon>
                          ` : ''}
                          ${t.interval === 0 ? `
                              <ha-icon icon="mdi:numeric-1-circle-outline" style="--mdc-icon-size: 14px; opacity: 0.7; flex-shrink: 0;" title="${this.localize('onetime')}"></ha-icon>
                          ` : ''}
                      </div>
                      <div class="template-meta">${t.area ? t.area + ' • ' : ''}${this.localize('cat_' + (['basis','bonus','auftrag'].includes(t.category) ? t.category : 'basis'))}${t.min_age > 0 ? ' • ' + this.localize('min_age_short').replace('{age}', t.min_age) : ''}${t.requires_approval ? ' • 🔍' : ''}</div>
                    </div>
                  </div>
                  <div class="template-actions">
                    <button class="action-btn btn-edit-template" data-id="${t.id}" title="${this.localize('edit_template_hover')}"><ha-icon icon="mdi:pencil"></ha-icon></button>
                    <button class="action-btn btn-delete-template" data-id="${t.id}" title="${this.localize('delete_template_hover')}"><ha-icon icon="mdi:delete"></ha-icon></button>
                  </div>
                </div>
              `}).join('') : `<div class="no-templates-msg">${this.localize('no_templates')}</div>`}
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header" id="goals-toggle">
            <div class="section-title">
              <ha-icon icon="${this._goalsOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('point_goals')}</span>
            </div>
          </div>
          <div class="section-content ${this._goalsOpen ? 'open' : ''}" id="goals-content">
            ${Object.entries(this.users).filter(([uid]) => !this._kidDraft(uid).enabled).map(([uid, name]) => `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 500; font-size: 14px; color: var(--primary-text-color);">${name}</span>
                <input type="number" class="user-goal-input" data-uid="${uid}" 
                       value="${this._goalValue(uid)}" placeholder="0">
              </div>
            `).join('')}
          </div>
        </div>

        ${this._renderKidsSection()}

        ${this._renderTriggersSection()}

        ${showAdvanced ? `
          <div class="section-card">
            <div class="section-header" id="adv-toggle">
              <div class="section-title">
                <ha-icon icon="${this._advancedOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
                <span>${this.localize('advanced')}</span>
              </div>
            </div>
            <div class="section-content ${this._advancedOpen ? 'open' : ''}">
              <button class="btn btn-reset" id="btn-reset" title="${this.localize('confirm_reset')}">${this.localize('archive_btn')}</button>
              <button class="btn btn-factory" id="btn-factory" title="${this.localize('confirm_factory')}">${this.localize('factory_btn')}</button>
            </div>
          </div>
        ` : ''}
        
        <button class="btn btn-save" id="btn-save" title="${this.localize('save_hover')}" style="margin-top: 12px;">${this.localize('save')}</button>
        
      </ha-card>

      <div id="template-modal" class="modal ${this._templateModalOpen ? 'open' : ''}">
        <div class="modal-content">
            <h2>${this._editingTemplateId ? this.localize('edit_template') : this.localize('add_template')}</h2>
            <div style="display:flex; flex-direction:column; gap:16px;">
              <ha-input id="tmpl-name" label="${this.localize('template_name')}" value="${template?.name || ''}" required></ha-input>
              <ha-input id="tmpl-desc" label="${this.localize('desc_lbl')}" value="${template?.description || ''}"></ha-input>
              
              <div class="form-row">
                  <ha-input id="tmpl-interval" type="number" label="${this.localize('interval_lbl')}" class="form-col" value="${template?.interval ?? 7}"></ha-input>
                  <ha-input id="tmpl-complexity" type="number" label="${this.localize('points_lbl')}" min="1" max="10" value="${template?.complexity || 5}" class="form-col"></ha-input>
              </div>

              <div class="form-row">
                  <div class="form-col">
                      <label class="form-label">${this.localize('icon_lbl')}</label>
                      <ha-icon-picker id="tmpl-icon" value="${template?.icon || 'mdi:label'}" required></ha-icon-picker>
                  </div>
                  <div class="form-col">
                      <label class="form-label">${this.localize('area_lbl')}</label>
                      <ha-area-picker id="tmpl-area" value="${template?.area || ''}"></ha-area-picker>
                  </div>
              </div>

              <div class="form-row">
                  <div class="form-col">
                      <label class="form-label" for="tmpl-category">${this.localize('category_lbl')}</label>
                      <select id="tmpl-category" class="form-select">
                          ${['basis', 'bonus', 'auftrag'].map(c => `<option value="${c}" ${(template?.category || 'basis') === c ? 'selected' : ''}>${this.localize('cat_' + c)}</option>`).join('')}
                      </select>
                  </div>
                  <ha-input id="tmpl-min-age" type="number" min="0" max="18" label="${this.localize('min_age_lbl')}" value="${template?.min_age || 0}" class="form-col"></ha-input>
              </div>
              <div class="form-row">
                  <div class="form-col">
                      <label class="form-label" for="tmpl-available-from">${this.localize('available_from_lbl')}</label>
                      <select id="tmpl-available-from" class="form-select">${toSetTTimeOptions(template?.available_from || '', '—')}</select>
                  </div>
                  <div class="form-col">
                      <label class="form-label" for="tmpl-available-until">${this.localize('available_until_lbl')}</label>
                      <select id="tmpl-available-until" class="form-select">${toSetTTimeOptions(template?.available_until || '', '—')}</select>
                  </div>
              </div>
              <ha-formfield label="${this.localize('approval_lbl')}">
                  <ha-switch id="tmpl-approval" ${template?.requires_approval ? 'checked' : ''}></ha-switch>
              </ha-formfield>
              <ha-formfield label="${this.localize('routine_lbl')}">
                  <ha-switch id="tmpl-routine" ${template?.requires_routine ? 'checked' : ''}></ha-switch>
              </ha-formfield>
              <ha-formfield label="${this.localize('together_lbl')}">
                  <ha-switch id="tmpl-together" ${(template?.allow_together ?? ['bonus', 'auftrag'].includes(template?.category)) ? 'checked' : ''}></ha-switch>
              </ha-formfield>
              <ha-formfield label="${this.localize('reminder_lbl')}">
                  <ha-switch id="tmpl-reminder" ${template?.reminder_at ? 'checked' : ''}></ha-switch>
              </ha-formfield>
              <div class="form-row" id="tmpl-reminder-row" ${template?.reminder_at ? '' : 'hidden'}>
                  <div class="form-col">
                      <label class="form-label" for="tmpl-reminder-at">${this.localize('reminder_time_lbl')}</label>
                      <select id="tmpl-reminder-at" class="form-select">${toSetTTimeOptions(template?.reminder_at || '18:00', '—')}</select>
                  </div>
                  <div class="form-col">
                      <label class="form-label" for="tmpl-reminder-target">${this.localize('reminder_target_lbl')}</label>
                      <select id="tmpl-reminder-target" class="form-select">${toSetNotifyOptions(this._hass, template?.reminder_target || '', this.localize('reminder_event_only'))}</select>
                  </div>
              </div>

              <div>
                  <label class="form-label">${this.localize('assignees_lbl')}</label>
                  <div style="display:flex; flex-direction:column; gap:8px; padding-top:8px;">
                      ${Object.entries(this.users).map(([uid, name]) => {
                          const isChecked = template?.assignees?.includes(uid) || false;
                          return `
                              <ha-formfield label="${name}">
                                  <ha-checkbox class="tmpl-assignee-cb" value="${uid}" ${isChecked ? 'checked' : ''}></ha-checkbox>
                              </ha-formfield>
                          `;
                      }).join('')}
                  </div>
              </div>

              <div id="toggle-subtasks" class="collapsible-header">
                  <span>${this.localize('subtasks')}</span>
                  <ha-icon icon="mdi:chevron-down"></ha-icon>
              </div>
              <div id="subtasks-content" class="collapsible-content">
                  <div class="subtask-input-row">
                      <ha-input id="new-subtask-title" placeholder="${this.localize('subtask_placeholder')}" style="flex: 1;"></ha-input>
                      <ha-button id="btn-add-subtask">${this.localize('confirm')}</ha-button>
                  </div>
                  <div id="subtask-list" class="subtask-list"></div>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:24px;">
                <ha-button appearance="plain" variant="brand" id="btn-modal-cancel">${this.localize('cancel')}</ha-button>
                <ha-button raised id="btn-modal-save">${this.localize('save')}</ha-button>
            </div>
        </div>
      </div>

      <div id="import-modal" class="modal ${this._importModalOpen ? 'open' : ''}">
        <div class="modal-content">
            <h2>${this.localize('import_tasks_title')}</h2>
            
            ${this._importState === 'initial' || this._importState === 'ready' || this._importState === 'error' ? `
              <input type="file" id="modal-file-import" accept=".json">
              ${this._importState === 'error' ? `<div style="color: var(--error-color, red); margin-top: 8px;">${this.localize('import_error')}</div>` : ''}
            ` : ''}
            
            ${this._importState === 'ready' && this._importData ? `
              <div style="background: var(--secondary-background-color); padding: 16px; border-radius: 8px; margin-top: 16px;">
                 <h4 style="margin: 0 0 8px 0;">${this.localize('metadata_title')}</h4>
                 <div style="display: flex; justify-content: space-between;"><span>${this.localize('tasks_lbl')}:</span> <span>${this._importData.tasks ? Object.keys(this._importData.tasks).length : 0}</span></div>
                 <div style="display: flex; justify-content: space-between;"><span>${this.localize('templates_lbl')}:</span> <span>${this._importData.templates ? Object.keys(this._importData.templates).length : 0}</span></div>
                 <div style="display: flex; justify-content: space-between;"><span>${this.localize('history_lbl')}:</span> <span>${this._importData.history ? this._importData.history.length : 0}</span></div>
                 <div style="display: flex; justify-content: space-between;"><span>${this.localize('settings_included')}:</span> <span>${this._importData.settings ? this.localize('yes') : this.localize('no')}</span></div>
              </div>
            ` : ''}
            
            ${this._importState === 'importing' || this._importState === 'done' ? `
               <div style="width: 100%; background: var(--divider-color); border-radius: 4px; height: 16px; overflow: hidden; margin: 16px 0;">
                  <div style="width: ${this._importProgress}%; height: 100%; background: var(--primary-color, #2196F3); transition: width 0.3s;"></div>
               </div>
               <div style="text-align: center; font-size: 14px; color: var(--secondary-text-color);">${this._importProgress}%</div>
               ${this._importState === 'done' ? `<div style="text-align: center; color: var(--success-color, green); font-weight: bold; margin-top: 8px;">${this.localize('import_success')}</div>` : ''}
            ` : ''}
            
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;">
              ${this._importState !== 'done' ? `<ha-button appearance="plain" variant="brand" id="btn-import-cancel">${this.localize('cancel')}</ha-button>` : ''}
              ${this._importState === 'ready' ? `<ha-button raised id="btn-import-start">${this.localize('start_import')}</ha-button>` : ''}
              ${this._importState === 'done' ? `<ha-button raised id="btn-import-reload">${this.localize('confirm_reload')}</ha-button>` : ''}
            </div>
        </div>
      </div>
    `;
    
    this.shadowRoot.innerHTML = html;
    
    // Bind click events
    this.shadowRoot.querySelector('ha-card').addEventListener('click', (ev) => this._handleClick(ev));
    this.shadowRoot.querySelector('#template-modal').addEventListener('click', (ev) => this._handleClick(ev));
    this.shadowRoot.querySelector('#template-modal').addEventListener('change', (ev) => {
      if (ev.target && ev.target.id === 'tmpl-reminder') {
        const row = this.shadowRoot.getElementById('tmpl-reminder-row');
        if (row) row.hidden = !ev.target.checked;
      }
      if (ev.target && ev.target.id === 'tmpl-category') {
        const together = this.shadowRoot.getElementById('tmpl-together');
        if (together) together.checked = ev.target.value !== 'basis';
      }
    });
    this.shadowRoot.querySelector('#import-modal').addEventListener('click', (ev) => this._handleClick(ev));

    // Bind File Import
    const importFileInput = this.shadowRoot.getElementById('modal-file-import');
    if (importFileInput) {
      importFileInput.addEventListener('change', (ev) => this._handleImportFileChange(ev));
    }

    // Bind slider events
    this.shadowRoot.querySelectorAll('.transparency-slider').forEach(el => {
      el.addEventListener('input', (ev) => {
        const status = ev.target.id.substring(2);
        this.shadowRoot.getElementById(`tl-${status}`).innerText = `${ev.target.value}%`;
        this.settings[`transparency_${status}_${this._themeView}`] = parseInt(ev.target.value);
      });
    });
    this.shadowRoot.querySelectorAll('input[type="color"]').forEach(el => {
      el.addEventListener('input', (ev) => {
        const status = ev.target.id.substring(2);
        this.settings[`color_${status}_${this._themeView}`] = ev.target.value;
      });
    });

    this._bindKidInputs();
    this._bindTriggerInputs();

    if (this._templateModalOpen) {
      const iconPicker = this.shadowRoot.getElementById('tmpl-icon');
      if(iconPicker) iconPicker.hass = this._hass;

      const areaPicker = this.shadowRoot.getElementById('tmpl-area');
      if(areaPicker) areaPicker.hass = this._hass;
    }
  }
}

/**
 * Editor for TaskOrganizerSettings.
 */
class TaskOrganizerSettingsEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  /**
   * Translates a key using the static helper of the card.
   * @param {string} key - The translation key.
   * @returns {string} - The translated text.
   */
  localize(key) {
    return TaskOrganizerSettings._localize(this._hass, key);
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (this._rendered) {
        this._updateUI();
        return;
    }
    this.innerHTML = `
      <div class="card-config">
        <ha-input label="${this.localize('title_lbl')}" value="${this._config.title || this.localize('title')}" configValue="title"></ha-input>
        <div style="display: flex; gap: 8px;">
          <ha-input label="${this.localize('height_lbl')}" placeholder="400px" value="${this._config.card_height || ''}" configValue="card_height" style="flex:1"></ha-input>
          <ha-input label="${this.localize('width_lbl')}" placeholder="100%" value="${this._config.card_width || ''}" configValue="card_width" style="flex:1"></ha-input>
        </div>
        <ha-formfield label="${this.localize('show_advanced_lbl')}">
          <ha-checkbox ${this._config.show_advanced === true ? 'checked' : ''} configValue="show_advanced"></ha-checkbox>
        </ha-formfield>
      </div>
      <style>
        .card-config ha-input { display: block; margin-bottom: 8px; }
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
        if (el.tagName === 'HA-CHECKBOX') {
            el.checked = value === true;
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

    if (target.tagName === 'HA-CHECKBOX') {
      newValue = target.checked;
    }

    if (this._config[configValue] === newValue) return;

    const event = new CustomEvent("config-changed", {
      detail: { config: { ...this._config, [configValue]: newValue } },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('task-organizer-settings-editor', TaskOrganizerSettingsEditor);
customElements.define('task-organizer-settings', TaskOrganizerSettings);