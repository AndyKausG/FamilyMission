/**
 * Kids mode quick-start wizard and the bonus trigger picker.
 *
 * - <task-organizer-wizard>: full-screen dialog (opened by the settings card) that
 *   proposes a complete, age-appropriate setup and creates it in one click.
 * - <task-organizer-trigger-picker>: small entity + target-state picker that is
 *   used by the wizard (step 2) and by the "Bonus triggers" section of the settings card.
 *
 * The task catalog and all calculations live in the backend (kids_catalog.py);
 * this file only renders the proposal and sends the final selection back.
 */
const I18N_WIZARD = {
  en: {
    title: "Kids mode quick start", help: "Help", close: "Close", back: "Back", next: "Next", create: "Create setup", done: "Done",
    step_kids: "Kids", step_home: "Household", step_tasks: "Tasks", step_goals: "Goals", step_summary: "Summary",
    step_of: "Step {n} of {m}", loading: "Loading…", error: "Something went wrong: ",
    kids_intro: "Which persons are kids? Birth year, avatar and color are used for age-appropriate tasks and on the kids card.",
    kid_on: "Is a kid", birthday: "Birthday", birth_year: "Birth year (if birthday unknown)", age_years: "{age} years", avatar: "Avatar", color: "Color",
    parents_hint: "Persons with a Home Assistant user are treated as parents by default.",
    need_year: "Please enable at least one kid and enter a birthday (or at least a valid birth year, e.g. 2016) for every enabled kid.",
    no_persons: "No person entities found.",
    home_intro: "What does your household have? Only matching tasks are proposed.",
    f_school: "School", f_dishwasher: "Dishwasher", f_dryer: "Tumble dryer", f_washer: "Washing machine",
    f_robot_vacuum: "Robot vacuum", f_garden: "Garden", f_driveway: "Driveway", f_pets: "Pets",
    auto_title: "Open bonus tasks automatically", auto_open: "Open when…", auto_open_hint: "Optional: the bonus task appears on its own, e.g. when the program is finished.",
    start_date: "Start date", start_hint: "Rotations start on this day, one kid per day. Goals are prorated if it is not the 1st of a month.",
    household_day: "Household day", household_day_hint: "Weekly and bi-weekly duties (e.g. thorough room clean) are first due on this weekday instead of the start date.",
    full_goal_from: "from {d}: {g} pts",
    tasks_intro: "Proposal per kid: a gentle start with core routines that fits the recommended daily load. Switch more tasks on later, change points with − / +. The load bar shows minutes per day compared to the recommendation.",
    suggest_btn: "Apply recommendation",
    min_day: "~{n} min/day", recommended: "recommended max. {n}", over_load: "Too much for age {age}: {name} would need ~{n} min/day (recommended max. {r}). Switch off a few tasks.",
    nr_of: "no. {i} of {n}", from_date: "from {d}", points: "Points", age_short: "{age} years",
    rotation_title: "Rotation plan", rotation_desc: "Shared duties rotate: everybody has them in turn, the oldest kid starts.",
    bonus_title: "Bonus tasks (shared)", bonus_desc: "Open for all kids, unassigned. They appear only when needed (trigger or your automation).",
    template_title: "Orders (templates)", template_desc: "One-off jobs for extra points. Created as templates, you create the task when needed.",
    trigger_on: "trigger", no_tasks: "No tasks proposed for this kid.", total_pts: "max. {n} pts/month",
    goals_intro: "Monthly goals: a share of the points a kid can maximally earn with the selected tasks.",
    phase_start: "Start phase (60 %)", phase_start_d: "Recommended at the beginning: goals are easy to reach, so kids experience success.",
    phase_normal: "Normal (75 %)", phase_normal_d: "For a family that already has a routine: goals need regular effort.",
    goal_for: "Goal for {name}", of_max: "of max. {n} possible", family_goal: "Family goal", family_points: "Points per month (all kids together)",
    family_reward: "Reward", family_reward_ph: "e.g. Pizza night", prorate_note: "The month is already running ({d} of {m} days left): goals were reduced proportionally.",
    rewards: ["Pizza night", "Cinema", "Swimming pool", "Day trip"],
    summary_intro: "Everything is ready. Please check:", n_tasks: "{n} tasks", n_bonus: "{n} bonus tasks", n_templates: "{n} order templates",
    n_triggers: "{n} automatic triggers", replace: "Update earlier wizard tasks", replace_d: "Tasks created by this wizard are updated in place (name, points, icon, subtasks, time window): due dates, pauses and progress stay as they are. Tasks that are no longer selected are removed; rotations whose members changed start again tomorrow. Your own tasks, points and history stay untouched.", reschedule: "Redistribute due dates", reschedule_d: "Existing wizard tasks get fresh due dates like a new plan (household day for weekly tasks, staggered rotations, daily tasks today if their time window is still ahead, otherwise tomorrow). Points, history and progress stay. Only together with updating earlier tasks.",
    kid_goal_line: "{name}: goal {g} pts", family_line: "Family goal: {g} pts", reward_line: "Reward: {r}",
    ok_title: "Done! Your kids mode is ready.", ok_counts: "Created {created} tasks, {bonus} bonus tasks and {templates} templates.",
    ok_deleted: "{n} earlier wizard tasks were removed.", ok_updated: "{n} existing tasks were updated (due dates kept).", ok_skipped: "{n} tasks already existed and were skipped.",
    next_steps: "Next steps", ns_pin: "Set a PIN for every kid: Settings card, section \"Kids\".",
    ns_tablet: "Put the kids card on the tablet dashboard (see the README, \"Kids mode\").",
    ns_check: "Look through the first week and adjust points or tasks in the task card.",
    sel_kids: "Kids", sel_home: "Household"
  },
  de: {
    title: "Kindermodus-Schnellstart", help: "Hilfe", close: "Schließen", back: "Zurück", next: "Weiter", create: "Anlegen", done: "Fertig",
    step_kids: "Kinder", step_home: "Haushalt", step_tasks: "Aufgaben", step_goals: "Ziele", step_summary: "Zusammenfassung",
    step_of: "Schritt {n} von {m}", loading: "Lade…", error: "Es ist ein Fehler aufgetreten: ",
    kids_intro: "Welche Personen sind Kinder? Geburtsjahr, Avatar und Farbe bestimmen die altersgerechten Aufgaben und die Kinder-Karte.",
    kid_on: "Ist ein Kind", birthday: "Geburtstag", birth_year: "Geburtsjahr (falls Geburtstag unbekannt)", age_years: "{age} Jahre", avatar: "Avatar", color: "Farbe",
    parents_hint: "Personen mit Home-Assistant-Benutzer gelten standardmäßig als Eltern.",
    need_year: "Bitte mindestens ein Kind aktivieren und für jedes aktive Kind den Geburtstag (oder wenigstens ein gültiges Geburtsjahr, z.B. 2016) eintragen.",
    no_persons: "Keine Personen-Entitäten gefunden.",
    home_intro: "Was gibt es bei euch zu Hause? Es werden nur passende Aufgaben vorgeschlagen.",
    f_school: "Schule", f_dishwasher: "Spülmaschine", f_dryer: "Trockner", f_washer: "Waschmaschine",
    f_robot_vacuum: "Saugroboter", f_garden: "Garten", f_driveway: "Hofeinfahrt", f_pets: "Haustiere",
    auto_title: "Bonus-Aufgaben automatisch öffnen", auto_open: "Öffnen wenn…", auto_open_hint: "Optional: Die Bonus-Aufgabe erscheint von selbst, z.B. wenn das Programm fertig ist.",
    start_date: "Startdatum", start_hint: "Die Rotationen starten an diesem Tag, pro Tag ein Kind. Die Ziele werden anteilig gekürzt, wenn es nicht der 1. eines Monats ist.",
    household_day: "Haushaltstag", household_day_hint: "Wöchentliche und zweiwöchentliche Pflichten (z. B. Zimmer gründlich) sind zum ersten Mal an diesem Wochentag fällig statt am Startdatum.",
    full_goal_from: "ab {d}: {g} Pkt",
    tasks_intro: "Vorschlag pro Kind: sanfter Start mit Kern-Routinen, passend zur empfohlenen Tageslast. Weitere Aufgaben später zuschalten, Punkte mit − / + ändern. Der Balken zeigt die Minuten pro Tag im Vergleich zur Empfehlung.",
    suggest_btn: "Empfehlung übernehmen",
    min_day: "~{n} Min/Tag", recommended: "empfohlen max. {n}", over_load: "Zu viel für {age} Jahre: {name} bräuchte ~{n} Min/Tag (empfohlen max. {r}). Schalte einige Aufgaben ab.",
    nr_of: "Nr. {i} von {n}", from_date: "ab {d}", points: "Punkte", age_short: "{age} Jahre",
    rotation_title: "Rotationsplan", rotation_desc: "Gemeinsame Pflichten wechseln durch: alle sind der Reihe nach dran, das älteste Kind beginnt.",
    bonus_title: "Bonus-Aufgaben (gemeinsam)", bonus_desc: "Offen für alle Kinder, ohne feste Zuordnung. Sie erscheinen nur bei Bedarf (Auslöser oder eure Automation).",
    template_title: "Aufträge (Vorlagen)", template_desc: "Einmalige Jobs für Extra-Punkte. Werden als Vorlagen angelegt, die Aufgabe erstellt ihr bei Bedarf.",
    trigger_on: "Auslöser", no_tasks: "Für dieses Kind wurden keine Aufgaben vorgeschlagen.", total_pts: "max. {n} Pkt/Monat",
    goals_intro: "Monatsziele: ein Anteil der Punkte, die ein Kind mit den gewählten Aufgaben höchstens verdienen kann.",
    phase_start: "Startphase (60 %)", phase_start_d: "Empfohlen am Anfang: Die Ziele sind leicht erreichbar, so erleben Kinder Erfolg.",
    phase_normal: "Normal (75 %)", phase_normal_d: "Für Familien mit eingespielter Routine: Die Ziele brauchen regelmäßigen Einsatz.",
    goal_for: "Ziel für {name}", of_max: "von max. {n} möglich", family_goal: "Familienziel", family_points: "Punkte pro Monat (alle Kinder zusammen)",
    family_reward: "Belohnung", family_reward_ph: "z.B. Pizza-Abend", prorate_note: "Der Monat läuft schon (noch {d} von {m} Tagen): Die Ziele wurden anteilig gekürzt.",
    rewards: ["Pizza-Abend", "Kino", "Schwimmbad", "Ausflug"],
    summary_intro: "Alles bereit. Bitte kurz prüfen:", n_tasks: "{n} Aufgaben", n_bonus: "{n} Bonus-Aufgaben", n_templates: "{n} Auftrags-Vorlagen",
    n_triggers: "{n} automatische Auslöser", replace: "Bisherige Assistent-Aufgaben aktualisieren", replace_d: "Vom Assistenten angelegte Aufgaben werden an Ort und Stelle aktualisiert (Name, Punkte, Symbol, Teilaufgaben, Zeitfenster): Fälligkeit, Pause und Fortschritt bleiben erhalten. Nicht mehr gewählte Aufgaben werden entfernt; Rotationen mit geänderten Mitgliedern starten morgen neu. Eigene Aufgaben, Punkte und Verlauf bleiben unberührt.", reschedule: "Termine neu verteilen", reschedule_d: "Bisherige Assistent-Aufgaben bekommen neue Fälligkeiten wie bei einem neuen Plan (Haushaltstag für wöchentliche Aufgaben, versetzte Rotationen, tägliche Aufgaben heute, wenn ihr Zeitfenster noch bevorsteht, sonst morgen). Punkte, Verlauf und Fortschritt bleiben. Nur zusammen mit dem Aktualisieren bisheriger Aufgaben.",
    kid_goal_line: "{name}: Ziel {g} Pkt", family_line: "Familienziel: {g} Pkt", reward_line: "Belohnung: {r}",
    ok_title: "Geschafft! Der Kindermodus ist eingerichtet.", ok_counts: "{created} Aufgaben, {bonus} Bonus-Aufgaben und {templates} Vorlagen angelegt.",
    ok_deleted: "{n} Assistent-Aufgaben wurden entfernt.", ok_updated: "{n} bestehende Aufgaben wurden aktualisiert (Fälligkeit bleibt).", ok_skipped: "{n} Aufgaben gab es schon und wurden übersprungen.",
    next_steps: "Nächste Schritte", ns_pin: "PIN für jedes Kind setzen: Einstellungen-Karte, Bereich \"Kinder\".",
    ns_tablet: "Die Kinder-Karte auf das Tablet-Dashboard legen (siehe README, \"Kids mode\").",
    ns_check: "Die erste Woche beobachten und Punkte oder Aufgaben in der Aufgaben-Karte anpassen.",
    sel_kids: "Kinder", sel_home: "Haushalt"
  }
};

const I18N_TRIGGER = {
  en: { entity: "Entity", search: "Search entity…", pick: "— choose —", state: "Becomes state", state_ph: "e.g. finished / on", more: "More entities: use the search.", none: "No matching entity", change: "Change" },
  de: { entity: "Entität", search: "Entität suchen…", pick: "— auswählen —", state: "Wechselt auf Zustand", state_ph: "z.B. finished / on", more: "Weitere Entitäten: Suche benutzen.", none: "Keine passende Entität", change: "Ändern" }
};

const TRIGGER_DOMAINS = ['sensor', 'binary_sensor', 'vacuum', 'select', 'input_boolean', 'switch'];
const TRIGGER_MAX_LIST = 50;

const wzEsc = (v) => String(v === undefined || v === null ? '' : v)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wzLang = (hass) => ((hass && hass.language) || 'en').substring(0, 2) === 'de' ? 'de' : 'en';
const wzFormat = (text, vars = {}) => String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));

/**
 * Entity + target state picker. Fires "change" with {entity_id, to_state, filter}.
 * Self-contained search field with a result list (no Home Assistant internals,
 * no native <select>), so it works on every dashboard, browser and tablet.
 */
/**
 * Birthday input as three selects (day / month / year). Native date pickers
 * (e.g. Safari) offer no quick year selection. The ISO value lives in a hidden
 * input carrying the given attributes; it receives an "input" event on change.
 */
const wzBdayMonths = {
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};
function wzBdayHtml(value, attrs, lang, disabled, future = false) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  const [y, mo, d] = m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  const now = new Date().getFullYear();
  const months = wzBdayMonths[lang === 'de' ? 'de' : 'en'];
  const opt = (v, label, sel) => `<option value="${v}" ${sel ? 'selected' : ''}>${label}</option>`;
  const dis = disabled ? 'disabled' : '';
  let days = opt('', lang === 'de' ? 'Tag' : 'Day', !d);
  for (let i = 1; i <= 31; i++) days += opt(i, i, i === d);
  let mons = opt('', lang === 'de' ? 'Monat' : 'Month', !mo);
  months.forEach((n, i) => { mons += opt(i + 1, n, i + 1 === mo); });
  let years = opt('', lang === 'de' ? 'Jahr' : 'Year', !y);
  if (future) { for (let i = now; i <= now + 1; i++) years += opt(i, i, i === y); }
  else { for (let i = now; i >= now - 25; i--) years += opt(i, i, i === y); }
  if (y && y < now - 25) years += opt(y, y, true);
  return `<span class="bday-sel" style="display:flex;gap:6px">
      <select data-part="d" ${dis} style="flex:0.8;min-width:0;height:38px;padding:0 6px;font-size:15px;border:1px solid var(--divider-color,#ccc);border-radius:6px;background:var(--primary-background-color,#fff);color:var(--primary-text-color,#212121)">${days}</select>
      <select data-part="m" ${dis} style="flex:1;min-width:0;height:38px;padding:0 6px;font-size:15px;border:1px solid var(--divider-color,#ccc);border-radius:6px;background:var(--primary-background-color,#fff);color:var(--primary-text-color,#212121)">${mons}</select>
      <select data-part="y" ${dis} style="flex:1.1;min-width:0;height:38px;padding:0 6px;font-size:15px;border:1px solid var(--divider-color,#ccc);border-radius:6px;background:var(--primary-background-color,#fff);color:var(--primary-text-color,#212121)">${years}</select>
      <input type="hidden" ${attrs} value="${value || ''}"></span>`;
}
function wzBdayBind(root) {
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
      hidden.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });
  });
}

class TaskOrganizerTriggerPicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._value = { entity_id: '', to_state: '', filter: '' };
    this._open = false;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._render();
  }

  get value() { return this._value; }

  set value(v) {
    this._value = { entity_id: (v && v.entity_id) || '', to_state: (v && v.to_state) || '', filter: (v && v.filter) || '' };
    if (this._hass) this._render();
  }

  connectedCallback() { if (this._hass) this._render(); }

  _t(key) { return (I18N_TRIGGER[wzLang(this._hass)] || I18N_TRIGGER.en)[key]; }

  _name(id) {
    const st = this._hass && this._hass.states && this._hass.states[id];
    return (st && st.attributes && st.attributes.friendly_name) || id;
  }

  /** Entities of the allowed domains matching all words of the search text. */
  _matches() {
    const states = (this._hass && this._hass.states) || {};
    const words = (this._value.filter || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    return Object.keys(states)
      .filter(id => TRIGGER_DOMAINS.includes(id.split('.')[0]))
      .map(id => ({ id, name: this._name(id) }))
      .filter(e => {
        const hay = (e.id + ' ' + e.name).toLowerCase();
        return words.every(w => hay.includes(w));
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, TRIGGER_MAX_LIST);
  }

  /** Suggested target states: enum options, the current state, on/off. */
  _suggestions() {
    const st = this._hass && this._hass.states && this._hass.states[this._value.entity_id];
    if (!st) return [];
    const out = [];
    const add = (s) => { if (s !== undefined && s !== null && s !== '' && !out.includes(String(s))) out.push(String(s)); };
    const opts = st.attributes && st.attributes.options;
    if (Array.isArray(opts)) opts.forEach(add);
    const domain = this._value.entity_id.split('.')[0];
    if (['binary_sensor', 'input_boolean', 'switch'].includes(domain)) { add('on'); add('off'); }
    add(st.state);
    return out.slice(0, 12);
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('change', { detail: { ...this._value }, bubbles: false }));
  }

  _select(id) {
    this._value.entity_id = id;
    this._value.filter = '';
    this._open = false;
    this._render();
    this._emit();
  }

  _renderList() {
    const box = this.shadowRoot.querySelector('.res');
    if (!box) return;
    if (!this._open) { box.hidden = true; box.innerHTML = ''; return; }
    const list = this._matches();
    box.hidden = false;
    box.innerHTML = list.length
      ? list.map(e => `<button type="button" class="opt" data-id="${wzEsc(e.id)}"><b>${wzEsc(e.name)}</b><small>${wzEsc(e.id)}</small></button>`).join('')
      : `<div class="none">${wzEsc(this._t('none'))}</div>`;
    box.querySelectorAll('.opt').forEach(b => {
      b.addEventListener('mousedown', (ev) => ev.preventDefault());   // keep the list open until the choice is taken
      b.addEventListener('click', () => this._select(b.dataset.id));
    });
  }

  _render() {
    if (!this._hass) return;
    const v = this._value;
    const chips = this._suggestions();
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        * { box-sizing: border-box; }
        .box { display: flex; flex-direction: column; gap: 8px; }
        label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--secondary-text-color, #727272); }
        input { width: 100%; height: 40px; padding: 4px 10px; border: 1px solid var(--divider-color, #ccc); border-radius: 6px; background: var(--primary-background-color, #fff); color: var(--primary-text-color, #212121); font-size: 15px; font-family: inherit; }
        .sel { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid var(--primary-color, #03a9f4); border-radius: 6px; background: var(--secondary-background-color, #f5f5f5); }
        .sel .grow { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .sel b { font-size: 14px; color: var(--primary-text-color, #212121); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sel small, .opt small { font-size: 11px; color: var(--secondary-text-color, #727272); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sel button { border: none; background: transparent; color: var(--primary-color, #03a9f4); font-size: 13px; cursor: pointer; padding: 6px; font-family: inherit; }
        .res { max-height: 240px; overflow-y: auto; border: 1px solid var(--divider-color, #ccc); border-radius: 6px; background: var(--card-background-color, #fff); }
        .opt { display: flex; flex-direction: column; align-items: flex-start; width: 100%; padding: 8px 10px; border: none; border-bottom: 1px solid var(--divider-color, #eee); background: transparent; text-align: left; cursor: pointer; font-family: inherit; color: var(--primary-text-color, #212121); }
        .opt:hover, .opt:focus { background: var(--secondary-background-color, #f0f0f0); }
        .opt b { font-size: 14px; font-weight: 500; }
        .none { padding: 10px; font-size: 13px; color: var(--secondary-text-color, #727272); }
        .chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip { border: 1px solid var(--divider-color, #ccc); background: transparent; color: var(--primary-text-color, #212121); border-radius: 14px; padding: 6px 12px; font-size: 13px; cursor: pointer; font-family: inherit; }
        .chip.active { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
      </style>
      <div class="box">
        <label>${wzEsc(this._t('entity'))}
          ${v.entity_id ? `
            <div class="sel"><div class="grow"><b>${wzEsc(this._name(v.entity_id))}</b><small>${wzEsc(v.entity_id)}</small></div>
              <button type="button" class="chg">${wzEsc(this._t('change'))}</button></div>`
          : `<input type="search" class="flt" autocomplete="off" placeholder="${wzEsc(this._t('search'))}" value="${wzEsc(v.filter)}">`}
        </label>
        <div class="res" hidden></div>
        <label>${wzEsc(this._t('state'))}
          <input type="text" class="st" maxlength="255" placeholder="${wzEsc(this._t('state_ph'))}" value="${wzEsc(v.to_state)}">
        </label>
        ${chips.length ? `<div class="chips">${chips.map(c => `<button type="button" class="chip ${c === v.to_state ? 'active' : ''}" data-v="${wzEsc(c)}">${wzEsc(c)}</button>`).join('')}</div>` : ''}
      </div>`;
    const root = this.shadowRoot;
    const flt = root.querySelector('.flt');
    if (flt) {
      const openList = () => { this._open = true; this._renderList(); };
      flt.addEventListener('focus', openList);
      flt.addEventListener('click', openList);
      flt.addEventListener('input', (ev) => {
        this._value.filter = ev.target.value;
        // exact entity id typed or pasted
        const typed = ev.target.value.trim();
        if (this._hass.states[typed] && TRIGGER_DOMAINS.includes(typed.split('.')[0])) { this._select(typed); return; }
        openList();
      });
      flt.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          const first = this._matches()[0];
          if (first) { ev.preventDefault(); this._select(first.id); }
        } else if (ev.key === 'Escape') { this._open = false; this._renderList(); }
      });
      flt.addEventListener('blur', () => { setTimeout(() => { this._open = false; this._renderList(); }, 150); });
    }
    const chg = root.querySelector('.chg');
    if (chg) chg.addEventListener('click', () => {
      this._value.entity_id = '';
      this._open = true;
      this._render();
      const f = this.shadowRoot.querySelector('.flt');
      if (f) f.focus();
      this._emit();
    });
    root.querySelector('.st').addEventListener('input', (ev) => {
      this._value.to_state = ev.target.value;
      root.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.v === ev.target.value));
      this._emit();
    });
    root.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      this._value.to_state = c.dataset.v;
      this._render();
      this._emit();
    }));
    this._renderList();
  }
}

/**
 * The quick-start wizard dialog.
 */
class TaskOrganizerWizard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._step = 0;
    this._s = null;
    this._previewSeq = 0;
    this._refreshTimer = null;
  }

  set hass(hass) { this._hass = hass; }

  disconnectedCallback() {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
  }

  _t(key, vars) {
    const dict = I18N_WIZARD[this._lang] || I18N_WIZARD.en;
    const text = dict[key] !== undefined ? dict[key] : (I18N_WIZARD.en[key] !== undefined ? I18N_WIZARD.en[key] : key);
    return typeof text === 'string' ? wzFormat(text, vars) : text;
  }

  /**
   * Loads catalog, existing profiles and previous choices, then shows step 1.
   * @param {object} hass - The Home Assistant object.
   */
  async open(hass) {
    this._hass = hass;
    this._lang = wzLang(hass);
    this._step = 0;
    this._s = null;
    this._error = '';
    this._loading = true;
    this._render();
    try {
      const [catalog, data] = await Promise.all([
        hass.callWS({ type: 'task_organizer/wizard_catalog' }),
        hass.callWS({ type: 'task_organizer/get_data' })
      ]);
      this._init(catalog, data);
    } catch (err) {
      this._error = (err && err.message) || String(err);
    }
    this._loading = false;
    this._render();
  }

  static participantId(entityId, state) {
    return (state && state.attributes && state.attributes.user_id) || entityId;
  }

  _init(catalog, data) {
    const settings = data.settings || {};
    const stored = settings.kids || {};
    const memory = settings.wizard || {};
    const hasProfiles = Object.keys(stored).length > 0;
    const persons = [];
    for (const entityId in this._hass.states) {
      if (!entityId.startsWith('person.')) continue;
      const st = this._hass.states[entityId];
      persons.push({
        id: TaskOrganizerWizard.participantId(entityId, st),
        name: (st.attributes && st.attributes.friendly_name) || entityId,
        isParent: !!(st.attributes && st.attributes.user_id)
      });
    }
    persons.sort((a, b) => a.name.localeCompare(b.name));

    const kids = {};
    const takenAvatars = Object.values(stored).map(k => k.avatar);
    const takenColors = Object.values(stored).map(k => (k.color || '').toLowerCase());
    const freeAvatars = catalog.avatars.filter(a => !takenAvatars.includes(a));
    const freeColors = catalog.colors.filter(c => !takenColors.includes(c.toLowerCase()));
    let n = 0;
    for (const p of persons) {
      const prof = stored[p.id];
      const enabled = hasProfiles ? !!prof : !p.isParent;
      let avatar = prof && prof.avatar;
      let color = prof && prof.color;
      if (!prof && enabled) {
        avatar = freeAvatars[n % freeAvatars.length] || catalog.avatars[n % catalog.avatars.length];
        color = freeColors[n % freeColors.length] || catalog.colors[n % catalog.colors.length];
        n++;
      }
      kids[p.id] = {
        enabled,
        birth_year: prof && prof.birth_year ? String(prof.birth_year) : '',
        birthday: prof && prof.birthday ? String(prof.birthday) : '',
        avatar: avatar || '',
        color: color || ''
      };
    }

    // Open bonus tasks per household feature that can be opened automatically
    const triggerKeys = {};
    for (const e of catalog.catalog) {
      if (e.has_trigger && e.requires) (triggerKeys[e.requires] = triggerKeys[e.requires] || []).push(`${e.key}:open`);
    }
    const triggers = {};
    (settings.bonus_triggers || []).forEach(t => {
      if (t.wizard_key) triggers[t.wizard_key] = { entity_id: t.entity_id, to_state: t.to_state, filter: '' };
    });

    const wizardTasks = Object.values(data.tasks || {}).some(t => t.generated_by === 'wizard');
    this._s = {
      catalog,
      persons,
      kids,
      features: new Set(memory.features || []),
      triggerKeys,
      triggers,
      startDate: catalog.today,
      householdDay: Number.isInteger(memory.household_day) ? memory.household_day : 5,
      phase: memory.phase || 'start',
      excluded: new Set(memory.excluded || []),
      // First run: start from the recommended (gentle) selection
      useSuggestion: !Array.isArray(memory.excluded),
      points: { ...(memory.points || {}) },
      goalEdits: {},
      familyPoints: null,
      familyEdited: false,
      familyReward: (settings.family_goal && settings.family_goal.reward) || '',
      existingFamilyGoal: settings.family_goal || null,
      replace: wizardTasks,
      reschedule: false,
      hasWizardTasks: wizardTasks,
      preview: null,
      previewError: '',
      result: null,
      applying: false
    };
  }

  // ---------------------------------------------------------------------
  // Backend calls
  // ---------------------------------------------------------------------

  _enabledKids() {
    const s = this._s;
    return s.persons
      .filter(p => s.kids[p.id].enabled)
      .map(p => ({ id: p.id, name: p.name, ...s.kids[p.id] }));
  }

  _validYear(value) {
    const y = parseInt(value);
    return !isNaN(y) && y >= 1900 && y <= new Date().getFullYear();
  }

  /** A valid, not future YYYY-MM-DD date or null. */
  _validBirthday(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!m) return null;
    const dt = new Date(+m[1], +m[2] - 1, +m[3]);
    if (dt.getFullYear() !== +m[1] || dt.getMonth() !== +m[2] - 1 || dt.getDate() !== +m[3]) return null;
    return +m[1] >= 1900 && dt <= new Date() ? value : null;
  }

  /** Birth year of a kid: derived from a valid birthday, otherwise the entered year (or null). */
  _yearOf(k) {
    const b = this._validBirthday(k.birthday);
    if (b) return parseInt(b.slice(0, 4));
    return this._validYear(k.birth_year) ? parseInt(k.birth_year) : null;
  }

  /** Exact age today (by birthday when known, Feb 29 counts as Feb 28 in common years). */
  _ageOf(k) {
    const b = this._validBirthday(k.birthday);
    const now = new Date();
    if (b) {
      const [y, m, d] = b.split('-').map(Number);
      const leap = (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0;
      const day = (m === 2 && d === 29 && !leap) ? 28 : d;
      const had = (now.getMonth() + 1 > m) || (now.getMonth() + 1 === m && now.getDate() >= day);
      return now.getFullYear() - y - (had ? 0 : 1);
    }
    const year = this._yearOf(k);
    return year === null ? null : now.getFullYear() - year;
  }

  _kidsValid() {
    const kids = this._enabledKids();
    return kids.length > 0 && kids.every(k => this._yearOf(k) !== null && (!k.birthday || this._validBirthday(k.birthday)));
  }

  _payload() {
    const s = this._s;
    return {
      kids: this._enabledKids().map(k => {
        const birthday = this._validBirthday(k.birthday);
        return {
          id: k.id, birth_year: this._yearOf(k), ...(birthday ? { birthday } : {}),
          avatar: k.avatar || undefined, color: k.color || undefined
        };
      }),
      features: [...s.features],
      start_date: s.startDate,
      household_day: s.householdDay,
      phase: s.phase,
      language: this._lang,
      excluded: [...s.excluded],
      points: s.points
    };
  }

  /** Debounced recompute of the proposal (steps 3 and later). */
  _scheduleRefresh(delay = 150) {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(() => this._refreshPreview(), delay);
  }

  async _refreshPreview() {
    const s = this._s;
    if (!s || !this._kidsValid()) return;
    const seq = ++this._previewSeq;
    s.previewBusy = true;
    try {
      const preview = await this._hass.callWS({ type: 'task_organizer/wizard_preview', ...this._payload() });
      if (seq !== this._previewSeq) return;
      s.preview = preview;
      s.previewError = '';
      if (s.useSuggestion && Array.isArray(preview.suggested_excluded)) {
        s.useSuggestion = false;
        const next = new Set(preview.suggested_excluded);
        if (next.size !== s.excluded.size || [...next].some(k => !s.excluded.has(k))) {
          s.excluded = next;
          this._resetGoalEdits();
          s.previewBusy = false;
          this._refreshPreview();
          return;
        }
      }
      if (!s.familyEdited) s.familyPoints = this._calcFamily(preview);
    } catch (err) {
      if (seq !== this._previewSeq) return;
      s.previewError = (err && err.message) || String(err);
    }
    s.previewBusy = false;
    this._renderBody();
  }

  /** Manual goal edits are dropped when the tasks they are based on change. */
  _resetGoalEdits() {
    if (!this._s) return;
    this._s.goalEdits = {};
    this._s.familyEdited = false;
  }

  _effectiveGoal(kid) {
    const edit = this._s.goalEdits[kid.id];
    return edit !== undefined ? edit : kid.goal;
  }

  _calcFamily(preview) {
    const total = preview.kids.reduce((sum, k) => sum + this._effectiveGoal(k), 0);
    if (total <= 0) return 0;
    return Math.max(10, Math.floor(total * 0.8 / 10 + 0.5) * 10);
  }

  async _apply() {
    const s = this._s;
    if (s.applying || !s.preview) return;
    s.applying = true;
    s.error = '';
    this._renderBody();
    const p = s.preview;
    const selection = [];
    p.kids.forEach(k => k.tasks.forEach(t => { if (t.selected) selection.push(t.wizard_key); }));
    p.open_tasks.forEach(t => { if (t.selected) selection.push(t.wizard_key); });
    p.templates.forEach(t => { if (t.selected) selection.push(t.wizard_key); });
    const goals = {};
    p.kids.forEach(k => { goals[k.id] = this._effectiveGoal(k); });
    const device_triggers = [];
    for (const feat of s.features) {
      for (const wk of (s.triggerKeys[feat] || [])) {
        const tr = s.triggers[wk];
        const open = p.open_tasks.find(t => t.wizard_key === wk);
        if (tr && tr.entity_id && tr.to_state && open && open.selected) {
          device_triggers.push({ wizard_key: wk, entity_id: tr.entity_id, to_state: tr.to_state });
        }
      }
    }
    try {
      s.result = await this._hass.callWS({
        type: 'task_organizer/wizard_apply',
        ...this._payload(),
        selection,
        goals,
        family_goal: { points: Math.max(0, parseInt(s.familyPoints) || 0), reward: (s.familyReward || '').trim() },
        replace_existing: !!s.replace,
        reschedule: !!(s.replace && s.reschedule),
        device_triggers
      });
      this._step = 5;
    } catch (err) {
      s.error = (err && err.message) || String(err);
    }
    s.applying = false;
    this._render();
  }

  // ---------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------

  _canNext() {
    if (!this._s) return false;
    if (this._step === 0) return this._kidsValid();
    if (this._step >= 2 && this._step <= 4) return !!this._s.preview && !this._s.previewBusy;
    return true;
  }

  _go(step) {
    this._step = step;
    if (step >= 2 && step <= 4 && this._s) this._refreshPreview();
    this._render();
    const body = this.shadowRoot.querySelector('.body');
    if (body) body.scrollTop = 0;
  }

  close() {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
    this.dispatchEvent(new CustomEvent('wizard-closed', { detail: { done: this._step === 5 } }));
    this.remove();
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  _styles() {
    return `<style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      .overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center;
        font-family: var(--paper-font-body1_-_font-family, Roboto, "Segoe UI", sans-serif); color: var(--primary-text-color, #212121); }
      .wz { background: var(--card-background-color, #fff); width: min(1120px, 96vw); height: min(880px, 94vh); border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
      .head { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
      .head h2 { margin: 0; font-size: 18px; font-weight: 600; flex: 1; min-width: 0; }
      .help { flex: none; min-height: 36px; padding: 0 12px; border-radius: 18px; border: 1px solid var(--divider-color, #e0e0e0); background: var(--secondary-background-color, #f0f0f0); color: var(--primary-text-color, #212121); font-size: 13px; font-weight: 600; cursor: pointer; }
      .x { background: transparent; border: none; font-size: 22px; cursor: pointer; color: var(--secondary-text-color, #727272); width: 40px; height: 40px; border-radius: 50%; }
      .x:hover { background: var(--secondary-background-color, #f0f0f0); }
      .steps { display: flex; gap: 6px; padding: 10px 20px 0; flex-wrap: wrap; }
      .pill { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 16px; font-size: 13px; background: var(--secondary-background-color, #f0f0f0); color: var(--secondary-text-color, #727272); }
      .pill b { display: inline-flex; width: 20px; height: 20px; border-radius: 50%; align-items: center; justify-content: center; background: var(--divider-color, #ddd); color: var(--primary-text-color, #212121); font-size: 12px; }
      .pill.active { background: var(--primary-color, #03a9f4); color: #fff; } .pill.active b { background: rgba(255,255,255,0.3); color: #fff; }
      .pill.done b { background: var(--success-color, #4caf50); color: #fff; }
      .stepline { display: none; padding: 8px 16px 0; font-size: 13px; color: var(--secondary-text-color, #727272); }
      .bar { display: none; height: 4px; margin: 6px 16px 0; background: var(--divider-color, #e0e0e0); border-radius: 2px; overflow: hidden; }
      .bar i { display: block; height: 100%; background: var(--primary-color, #03a9f4); }
      .body { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
      .foot { display: flex; justify-content: space-between; gap: 10px; padding: 12px 20px; border-top: 1px solid var(--divider-color, #e0e0e0); }
      .btn { border: none; border-radius: 10px; padding: 0 22px; height: 46px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; }
      .btn.primary { background: var(--primary-color, #03a9f4); color: #fff; }
      .btn.secondary { background: var(--secondary-background-color, #f0f0f0); color: var(--primary-text-color, #212121); }
      .btn:disabled { opacity: 0.45; cursor: default; }
      p { margin: 0; } .muted { color: var(--secondary-text-color, #727272); font-size: 13px; }
      .card { border: 1px solid var(--divider-color, #e0e0e0); border-left-width: 6px; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: var(--card-background-color, #fff); }
      .card.off { opacity: 0.6; }
      .row { display: flex; align-items: center; gap: 10px; }
      .grow { flex: 1; min-width: 0; }
      .avatar { font-size: 28px; line-height: 1; }
      .name { font-weight: 600; font-size: 15px; }
      .sw { display: inline-block; width: 28px; height: 28px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; padding: 0; background-clip: padding-box; outline: 1px solid var(--divider-color, #ddd); }
      .sw.active { border-color: var(--primary-text-color, #212121); }
      .emo { font-size: 22px; width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--divider-color, #ddd); background: transparent; cursor: pointer; padding: 0; }
      .emo.active { border-color: var(--primary-color, #03a9f4); background: var(--secondary-background-color, #f0f0f0); box-shadow: 0 0 0 1px var(--primary-color, #03a9f4); }
      .wrap { display: flex; flex-wrap: wrap; gap: 6px; }
      label.f { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--secondary-text-color, #727272); }
      input[type=number], input[type=text], input[type=date], select { height: 40px; padding: 4px 10px; border: 1px solid var(--divider-color, #ccc); border-radius: 8px; background: var(--primary-background-color, #fff); color: var(--primary-text-color, #212121); font-size: 15px; font-family: inherit; width: 100%; }
      .year { width: 110px; }
      .bday { width: 150px; }
      .sw-switch { position: relative; width: 44px; height: 24px; flex: none; }
      .sw-switch input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; z-index: 1; }
      .sw-switch span { position: absolute; inset: 0; border-radius: 12px; background: var(--disabled-text-color, #bdbdbd); transition: background 0.15s; }
      .sw-switch span::after { content: ""; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform 0.15s; box-shadow: 0 1px 2px rgba(0,0,0,0.3); }
      .sw-switch input:checked + span { background: var(--primary-color, #03a9f4); }
      .sw-switch input:checked + span::after { transform: translateX(20px); }
      .tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .tile { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px; min-width: 0; cursor: pointer; }
      .tile.on { border-color: var(--primary-color, #03a9f4); background: color-mix(in srgb, var(--primary-color, #03a9f4) 6%, transparent); }
      .tile .top { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; min-width: 0; }
      .tile .top ha-icon { --mdc-icon-size: 26px; color: var(--primary-color, #03a9f4); }
      .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 14px; align-items: start; }
      .t { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: 8px; padding: 6px 0; border-top: 1px solid var(--divider-color, #eee); }
      .t:first-of-type { border-top: none; }
      .t.off .tn, .t.off .ti { opacity: 0.45; }
      .t ha-icon { --mdc-icon-size: 22px; color: var(--secondary-text-color, #727272); }
      .tn { font-size: 14px; line-height: 1.25; } .ti { font-size: 12px; color: var(--secondary-text-color, #727272); }
      .step { display: inline-flex; align-items: center; gap: 2px; }
      .step button { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--divider-color, #ccc); background: transparent; color: var(--primary-text-color, #212121); font-size: 16px; cursor: pointer; padding: 0; }
      .step span { min-width: 22px; text-align: center; font-weight: 600; font-size: 14px; }
      .load { display: flex; flex-direction: column; gap: 4px; }
      .lb { position: relative; height: 10px; border-radius: 5px; background: var(--divider-color, #e0e0e0); }
      .lb i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 5px; background: var(--success-color, #4caf50); }
      .lb.over i { background: var(--warning-color, #ffa000); }
      .lb u { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--primary-text-color, #212121); }
      .ltxt { font-size: 12px; color: var(--secondary-text-color, #727272); display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
      .ltxt.over { color: var(--warning-color, #e65100); font-weight: 600; }
      [hidden] { display: none !important; }
      .warn { background: color-mix(in srgb, var(--warning-color, #ffa000) 16%, transparent); border: 1px solid var(--warning-color, #ffa000); border-radius: 10px; padding: 10px 12px; font-size: 13px; display: flex; flex-direction: column; gap: 4px; }
      .err { background: color-mix(in srgb, var(--error-color, #f44336) 14%, transparent); border: 1px solid var(--error-color, #f44336); border-radius: 10px; padding: 10px 12px; font-size: 13px; }
      h3 { margin: 4px 0 0; font-size: 15px; font-weight: 600; }
      .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .opt { border: 2px solid var(--divider-color, #e0e0e0); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 4px; cursor: pointer; }
      .opt.on { border-color: var(--primary-color, #03a9f4); }
      .opt input { display: none; }
      .chip { border: 1px solid var(--divider-color, #ccc); background: transparent; color: var(--primary-text-color, #212121); border-radius: 16px; padding: 6px 12px; font-size: 13px; cursor: pointer; font-family: inherit; }
      .chip.on { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
      .goalrow { display: grid; grid-template-columns: auto 1fr 120px; align-items: center; gap: 10px; }
      .sum { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
      .big { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; padding: 12px; text-align: center; }
      .big b { display: block; font-size: 26px; }
      .rot { font-size: 13px; line-height: 1.6; }
      .order { display: inline-flex; align-items: center; gap: 4px; flex-wrap: wrap; }
      .ok { text-align: center; padding: 12px 0; font-size: 40px; }
      ol { margin: 6px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
      .busy { opacity: 0.55; transition: opacity 0.15s; }
      @media (max-width: 600px) {
        .overlay { align-items: stretch; }
        .wz { width: 100vw; height: 100vh; height: 100dvh; border-radius: 0; }
        .head { padding: 10px 12px; } .head h2 { font-size: 16px; }
        .steps { display: none; } .stepline { display: block; } .bar { display: block; }
        .body { padding: 12px; } .foot { padding: 10px 12px; } .foot .btn { flex: 1; padding: 0 10px; }
        .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .cols { grid-template-columns: minmax(0, 1fr); }
        .opts { grid-template-columns: 1fr; }
        .goalrow { grid-template-columns: auto 1fr 92px; }
        .emo { width: 36px; height: 36px; font-size: 20px; } .wrap { gap: 4px; }
      }
    </style>`;
  }

  _render() {
    const stepNames = ['step_kids', 'step_home', 'step_tasks', 'step_goals', 'step_summary'];
    const step = Math.min(this._step, 4);
    const finished = this._step === 5;
    this.shadowRoot.innerHTML = `${this._styles()}
      <div class="overlay"><div class="wz" role="dialog" aria-modal="true" aria-label="${wzEsc(this._t('title'))}">
        <div class="head"><h2>🚀 ${wzEsc(this._t('title'))}</h2>${window.TaskOrganizerHelp ? `<button class="help" data-act="help">❓ ${wzEsc(this._t('help'))}</button>` : ''}<button class="x" data-act="close" aria-label="${wzEsc(this._t('close'))}">✕</button></div>
        ${finished ? '' : `
        <div class="steps">${stepNames.map((n, i) => `<div class="pill ${i === step ? 'active' : i < step ? 'done' : ''}"><b>${i < step ? '✓' : i + 1}</b>${wzEsc(this._t(n))}</div>`).join('')}</div>
        <div class="stepline">${wzEsc(this._t('step_of', { n: step + 1, m: 5 }))} · ${wzEsc(this._t(stepNames[step]))}</div>
        <div class="bar"><i style="width:${(step + 1) * 20}%"></i></div>`}
        <div class="body"></div>
        <div class="foot"></div>
      </div></div>`;
    this._renderBody();
    const root = this.shadowRoot;
    root.querySelector('.overlay').addEventListener('click', (ev) => this._onClick(ev));
    root.querySelector('.overlay').addEventListener('change', (ev) => this._onChange(ev));
    root.querySelector('.overlay').addEventListener('input', (ev) => this._onInput(ev));
  }

  /** Re-renders body + footer, keeping the scroll position. */
  _renderBody() {
    const body = this.shadowRoot.querySelector('.body');
    if (!body) return;
    const scroll = body.scrollTop;
    const s = this._s;
    let html = '';
    if (this._loading) html = `<p class="muted">${wzEsc(this._t('loading'))}</p>`;
    else if (this._error || !s) html = `<div class="err">${wzEsc(this._t('error'))}${wzEsc(this._error)}</div>`;
    else if (this._step === 0) html = this._htmlKids();
    else if (this._step === 1) html = this._htmlHome();
    else if (this._step === 2) html = this._htmlTasks();
    else if (this._step === 3) html = this._htmlGoals();
    else if (this._step === 4) html = this._htmlSummary();
    else html = this._htmlSuccess();
    body.innerHTML = html;
    body.scrollTop = scroll;
    this._bindPickers();
    wzBdayBind(this.shadowRoot);
    this._renderFoot();
  }

  /** Renders the back / next buttons. */
  _renderFoot() {
    const foot = this.shadowRoot.querySelector('.foot');
    if (!foot) return;
    const s = this._s;
    if (this._step === 5) {
      foot.innerHTML = `<span></span><button class="btn primary" data-act="close">${wzEsc(this._t('done'))}</button>`;
    } else {
      const last = this._step === 4;
      foot.innerHTML = `
        <button class="btn secondary" data-act="back" ${this._step === 0 ? 'disabled' : ''}>${wzEsc(this._t('back'))}</button>
        <button class="btn primary" data-act="${last ? 'apply' : 'next'}" ${this._canNext() && !(s && s.applying) ? '' : 'disabled'}>${wzEsc(last ? this._t('create') : this._t('next'))}${s && s.applying ? ' …' : ''}</button>`;
    }
  }

  _bindPickers() {
    const s = this._s;
    this.shadowRoot.querySelectorAll('task-organizer-trigger-picker').forEach(el => {
      el.hass = this._hass;
      el.value = s.triggers[el.dataset.wk] || { entity_id: '', to_state: '', filter: '' };
      el.addEventListener('change', (ev) => { s.triggers[el.dataset.wk] = ev.detail; });
    });
  }

  _name(item) { return this._lang === 'de' ? item.name_de : item.name_en; }

  _htmlKids() {
    const s = this._s;
    const cat = s.catalog;
    if (!s.persons.length) return `<p class="muted">${wzEsc(this._t('no_persons'))}</p>`;
    const year = new Date().getFullYear();
    const cards = s.persons.map(p => {
      const k = s.kids[p.id];
      const age = this._ageOf(k);
      const colors = cat.colors.includes(k.color) || !k.color ? cat.colors : [...cat.colors, k.color];
      const avatars = cat.avatars.includes(k.avatar) || !k.avatar ? cat.avatars : [k.avatar, ...cat.avatars];
      return `
        <div class="card ${k.enabled ? '' : 'off'}" style="border-left-color:${k.enabled && k.color ? wzEsc(k.color) : 'var(--divider-color, #ddd)'}">
          <div class="row">
            ${k.enabled ? `<span class="avatar">${wzEsc(k.avatar)}</span>` : ''}
            <div class="grow"><div class="name">${wzEsc(p.name)}</div>
</div>
            <label class="sw-switch" title="${wzEsc(this._t('kid_on'))}"><input type="checkbox" data-act="kid-on" data-pid="${wzEsc(p.id)}" ${k.enabled ? 'checked' : ''}><span></span></label>
          </div>
          ${k.enabled ? `
            <div class="row">
              <label class="f" style="flex:1 1 100%">${wzEsc(this._t('birthday'))}
                ${wzBdayHtml(wzEsc(k.birthday), `class="bday" data-act="kid-birthday" data-pid="${wzEsc(p.id)}"`, this._lang, false)}</label>
            </div>
            <div class="row">
              <label class="f">${wzEsc(this._t('birth_year'))}
                <input class="year" type="number" inputmode="numeric" min="1900" max="${year}" placeholder="${year - 8}" data-act="kid-year" data-pid="${wzEsc(p.id)}"
                       value="${wzEsc(this._validBirthday(k.birthday) ? String(this._yearOf(k)) : k.birth_year)}" ${this._validBirthday(k.birthday) ? 'disabled' : ''}></label>
              <span class="muted agelbl" data-pid="${wzEsc(p.id)}">${age !== null ? wzEsc(this._t('age_years', { age })) : ''}</span>
            </div>
            <div class="f muted">${wzEsc(this._t('avatar'))}</div>
            <div class="wrap">${avatars.map(a => `<button class="emo ${a === k.avatar ? 'active' : ''}" data-act="kid-avatar" data-pid="${wzEsc(p.id)}" data-v="${wzEsc(a)}">${wzEsc(a)}</button>`).join('')}</div>
            <div class="f muted">${wzEsc(this._t('color'))}</div>
            <div class="wrap">${colors.map(c => `<button class="sw ${c.toLowerCase() === (k.color || '').toLowerCase() ? 'active' : ''}" style="background:${wzEsc(c)}" aria-label="${wzEsc(c)}" data-act="kid-color" data-pid="${wzEsc(p.id)}" data-v="${wzEsc(c)}"></button>`).join('')}</div>
          ` : ''}
        </div>`;
    }).join('');
    return `<p class="muted">${wzEsc(this._t('kids_intro'))}</p>
      ${s.persons.some(p => p.isParent) ? `<p class="muted">${wzEsc(this._t('parents_hint'))}</p>` : ''}
      <div class="cols">${cards}</div>
      <div class="warn" id="need-year" ${this._kidsValid() ? 'hidden' : ''}>${wzEsc(this._t('need_year'))}</div>`;
  }

  _htmlHome() {
    const s = this._s;
    const tiles = s.catalog.features.map(f => {
      const on = s.features.has(f.key);
      return `
        <label class="tile ${on ? 'on' : ''}">
          <span class="top"><span class="sw-switch"><input type="checkbox" data-act="feature" data-k="${wzEsc(f.key)}" ${on ? 'checked' : ''}><span></span></span>
            <ha-icon icon="${wzEsc(f.icon)}"></ha-icon>${wzEsc(this._lang === 'de' ? f.name_de : f.name_en)}</span>
        </label>`;
    }).join('');
    const autos = s.catalog.features.filter(f => s.features.has(f.key) && (s.triggerKeys[f.key] || []).length);
    const triggers = autos.map(f => (s.triggerKeys[f.key] || []).map(wk => {
      const entry = s.catalog.catalog.find(e => `${e.key}:open` === wk);
      return `
        <div class="card" style="border-left-color:var(--primary-color,#03a9f4)">
          <div class="row"><ha-icon icon="${wzEsc(f.icon)}"></ha-icon><div class="grow"><div class="name">${wzEsc(this._lang === 'de' ? f.name_de : f.name_en)}</div>
            <div class="muted">${wzEsc(this._t('auto_open'))} → ${wzEsc(entry ? this._name(entry) : wk)}</div></div></div>
          <task-organizer-trigger-picker data-wk="${wzEsc(wk)}"></task-organizer-trigger-picker>
        </div>`;
    }).join('')).join('');
    return `<p class="muted">${wzEsc(this._t('home_intro'))}</p>
      <div class="tiles">${tiles}</div>
      ${triggers ? `<h3>⚡ ${wzEsc(this._t('auto_title'))}</h3><p class="muted">${wzEsc(this._t('auto_open_hint'))}</p><div class="cols">${triggers}</div>` : ''}
      <div><label class="f" style="max-width:320px">${wzEsc(this._t('start_date'))}
        ${wzBdayHtml(wzEsc(s.startDate), 'data-act="start-date"', this._lang, false, true)}</label>
        <p class="muted" style="margin-top:6px">${wzEsc(this._t('start_hint'))}</p></div>
      <div><label class="f" style="max-width:240px">${wzEsc(this._t('household_day'))}
        <select data-act="household-day">${[0, 1, 2, 3, 4, 5, 6].map(d => `<option value="${d}" ${s.householdDay === d ? 'selected' : ''}>${wzEsc(this._weekday(d))}</option>`).join('')}</select></label>
        <p class="muted" style="margin-top:6px">${wzEsc(this._t('household_day_hint'))}</p></div>`;
  }

  /** Weekday name (0 = Monday) in the UI language. */
  _weekday(day) {
    try {
      return new Date(2024, 0, 1 + day).toLocaleDateString(this._lang, { weekday: 'long' });
    } catch (e) { return String(day); }
  }

  /** "1.11." style day.month of an ISO date (summary: the full goals apply from there). */
  _fmtDayMonth(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? `${parseInt(m[3])}.${parseInt(m[2])}.` : (iso || '');
  }

  /** The unprorated goal of a kid; an edited goal is scaled up like the backend does (rounded to 5). */
  _fullGoal(k) {
    const goal = this._effectiveGoal(k);
    const p = this._s.preview;
    if (goal === k.goal) return k.goal_full || goal;
    const factor = p && p.prorate > 0 ? p.prorate : 1;
    return Math.max(goal, Math.round(goal / factor / 5) * 5);
  }

  _fmtDate(iso) {
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString(this._lang, { day: '2-digit', month: '2-digit' });
    } catch (e) { return iso; }
  }

  _stepper(key, value) {
    return `<span class="step"><button data-act="pts-dec" data-k="${wzEsc(key)}" aria-label="−">−</button><span>${value}</span><button data-act="pts-inc" data-k="${wzEsc(key)}" aria-label="+">+</button></span>`;
  }

  _taskRow(t, extra = '') {
    return `
      <div class="t ${t.selected ? '' : 'off'}">
        <label class="sw-switch"><input type="checkbox" data-act="task" data-k="${wzEsc(t.wizard_key)}" ${t.selected ? 'checked' : ''}><span></span></label>
        <ha-icon icon="${wzEsc(t.icon)}"></ha-icon>
        <div><div class="tn">${wzEsc(this._name(t))}</div><div class="ti">${extra}</div></div>
        ${this._stepper(t.wizard_key, t.points)}
      </div>`;
  }

  _htmlTasks() {
    const s = this._s;
    const p = s.preview;
    if (s.previewError) return `<div class="err">${wzEsc(this._t('error'))}${wzEsc(s.previewError)}</div>`;
    if (!p) return `<p class="muted">${wzEsc(this._t('loading'))}</p>`;
    const warn = p.warnings.filter(w => w.type === 'load');
    const cards = p.kids.map(k => {
      const rec = k.recommended_minutes;
      const over = k.minutes_per_day > rec;
      const scale = Math.max(k.minutes_per_day, rec) * 1.15 || 1;
      const rows = k.tasks.map(t => {
        let info = wzEsc(t.interval_label);
        if (t.mode === 'rotation' && t.selected) {
          info += ` · ${wzEsc(this._t('nr_of', { i: t.rotation_index + 1, n: t.rotation_size }))} · ${wzEsc(this._t('from_date', { d: this._fmtDate(t.due_date) }))}`;
        }
        return this._taskRow(t, `${info} · ${t.minutes} min`);
      }).join('');
      return `
        <div class="card" style="border-left-color:${wzEsc(k.color || '#999')}">
          <div class="row"><span class="avatar">${wzEsc(k.avatar || '🙂')}</span>
            <div class="grow"><div class="name">${wzEsc(k.name)}</div><div class="muted">${wzEsc(this._t('age_short', { age: k.age }))} · ${wzEsc(this._t('total_pts', { n: Math.round(k.max_points) }))}</div></div></div>
          <div class="load"><div class="lb ${over ? 'over' : ''}"><i style="width:${Math.min(100, k.minutes_per_day / scale * 100)}%"></i><u style="left:${rec / scale * 100}%"></u></div>
            <div class="ltxt ${over ? 'over' : ''}"><span>${over ? '⚠ ' : ''}${wzEsc(this._t('min_day', { n: k.minutes_per_day }))}</span><span>${wzEsc(this._t('recommended', { n: rec }))}</span></div></div>
          <div>${rows || `<p class="muted">${wzEsc(this._t('no_tasks'))}</p>`}</div>
        </div>`;
    }).join('');

    const bonus = p.open_tasks.map(t => this._taskRow(t,
      `${wzEsc(this._t('age_short', { age: '≥' + t.min_age }))}${t.trigger_hint && this._hasTrigger(t) ? ' · ⚡ ' + wzEsc(t.trigger_hint) : ''}`)).join('');
    const templates = p.templates.map(t => this._taskRow(t, wzEsc(this._t('age_short', { age: '≥' + t.min_age })))).join('');
    const rotation = p.rotation.map(r => `
      <div class="rot"><b>${wzEsc(r.name)}</b> <span class="muted">· ${wzEsc(r.interval_label)}</span><br>
        <span class="order">${r.order.map((o, i) => `${i ? '→ ' : ''}${wzEsc(o.name)} <span class="muted">(${wzEsc(this._fmtDate(o.due_date))})</span>`).join(' ')}</span></div>`).join('');

    return `<p class="muted">${wzEsc(this._t('tasks_intro'))}</p>
      <p><button class="btn secondary" data-act="suggest">✨ ${wzEsc(this._t('suggest_btn'))}</button></p>
      ${warn.length ? `<div class="warn">${warn.map(w => `<div>⚠ ${wzEsc(this._t('over_load', { age: w.age, name: w.name, n: w.minutes, r: w.recommended }))}</div>`).join('')}</div>` : ''}
      <div class="cols ${s.previewBusy ? 'busy' : ''}">${cards}</div>
      ${rotation ? `<div class="card" style="border-left-color:var(--divider-color,#ddd)"><h3>🔄 ${wzEsc(this._t('rotation_title'))}</h3><p class="muted">${wzEsc(this._t('rotation_desc'))}</p>${rotation}</div>` : ''}
      <div class="cols ${s.previewBusy ? 'busy' : ''}">
        ${bonus ? `<div class="card" style="border-left-color:var(--primary-color,#03a9f4)"><h3>⭐ ${wzEsc(this._t('bonus_title'))}</h3><p class="muted">${wzEsc(this._t('bonus_desc'))}</p><div>${bonus}</div></div>` : ''}
        <div class="card" style="border-left-color:var(--warning-color,#ffa000)"><h3>📋 ${wzEsc(this._t('template_title'))}</h3><p class="muted">${wzEsc(this._t('template_desc'))}</p><div>${templates}</div></div>
      </div>`;
  }

  /** True when an automatic trigger is configured for this bonus task. */
  _hasTrigger(task) {
    const tr = this._s.triggers[task.wizard_key];
    return !!(tr && tr.entity_id && tr.to_state);
  }

  _htmlGoals() {
    const s = this._s;
    const p = s.preview;
    if (s.previewError) return `<div class="err">${wzEsc(this._t('error'))}${wzEsc(s.previewError)}</div>`;
    if (!p) return `<p class="muted">${wzEsc(this._t('loading'))}</p>`;
    const rows = p.kids.map(k => `
      <div class="goalrow"><span class="avatar">${wzEsc(k.avatar || '🙂')}</span>
        <div><div class="name">${wzEsc(this._t('goal_for', { name: k.name }))}</div><div class="muted">${wzEsc(this._t('of_max', { n: Math.round(k.max_points) }))}</div></div>
        <input type="number" min="0" inputmode="numeric" data-act="goal" data-pid="${wzEsc(k.id)}" value="${this._effectiveGoal(k)}"></div>`).join('');
    const date = new Date(s.startDate + 'T00:00:00');
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const left = days - date.getDate() + 1;
    return `<p class="muted">${wzEsc(this._t('goals_intro'))}</p>
      <div class="opts">
        ${['start', 'normal'].map(ph => `
          <label class="opt ${s.phase === ph ? 'on' : ''}"><input type="radio" name="phase" data-act="phase" value="${ph}" ${s.phase === ph ? 'checked' : ''}>
            <b>${wzEsc(this._t('phase_' + ph))}</b><span class="muted">${wzEsc(this._t('phase_' + ph + '_d'))}</span></label>`).join('')}
      </div>
      ${p.prorate < 1 ? `<div class="warn">${wzEsc(this._t('prorate_note', { d: left, m: days }))}</div>` : ''}
      <div class="card ${s.previewBusy ? 'busy' : ''}" style="border-left-color:var(--primary-color,#03a9f4)">${rows}</div>
      <div class="card" style="border-left-color:var(--success-color,#4caf50)"><h3>🏆 ${wzEsc(this._t('family_goal'))}</h3>
        <label class="f">${wzEsc(this._t('family_points'))}<input type="number" min="0" inputmode="numeric" data-act="fg-points" value="${s.familyPoints === null ? '' : s.familyPoints}"></label>
        <label class="f">${wzEsc(this._t('family_reward'))}<input type="text" maxlength="80" data-act="fg-reward" placeholder="${wzEsc(this._t('family_reward_ph'))}" value="${wzEsc(s.familyReward)}"></label>
        <div class="wrap">${this._t('rewards').map(r => `<button class="chip ${s.familyReward === r ? 'on' : ''}" data-act="fg-chip" data-v="${wzEsc(r)}">${wzEsc(r)}</button>`).join('')}</div>
      </div>`;
  }

  _htmlSummary() {
    const s = this._s;
    const p = s.preview;
    if (!p) return `<p class="muted">${wzEsc(this._t('loading'))}</p>`;
    const triggers = [...s.features].reduce((n, f) => n + (s.triggerKeys[f] || []).filter(wk => {
      const tr = s.triggers[wk];
      const open = p.open_tasks.find(t => t.wizard_key === wk);
      return tr && tr.entity_id && tr.to_state && open && open.selected;
    }).length, 0);
    return `<p class="muted">${wzEsc(this._t('summary_intro'))}</p>
      <div class="sum">
        <div class="big"><b>${p.counts.tasks}</b>${wzEsc(this._t('n_tasks', { n: '' }).trim())}</div>
        <div class="big"><b>${p.counts.bonus}</b>${wzEsc(this._t('n_bonus', { n: '' }).trim())}</div>
        <div class="big"><b>${p.counts.templates}</b>${wzEsc(this._t('n_templates', { n: '' }).trim())}</div>
        ${triggers ? `<div class="big"><b>${triggers}</b>${wzEsc(this._t('n_triggers', { n: '' }).trim())}</div>` : ''}
      </div>
      <div class="card" style="border-left-color:var(--primary-color,#03a9f4)">
        ${p.kids.map(k => `<div class="row"><span class="avatar">${wzEsc(k.avatar || '🙂')}</span><div class="grow">${wzEsc(this._t('kid_goal_line', { name: k.name, g: this._effectiveGoal(k) }))}${p.prorated && this._effectiveGoal(k) > 0 ? ` <span class="muted">(${wzEsc(this._t('full_goal_from', { d: this._fmtDayMonth(p.full_goals_from), g: this._fullGoal(k) }))})</span>` : ''}</div></div>`).join('')}
        <div class="row"><span class="avatar">🏆</span><div class="grow"><b>${wzEsc(this._t('family_line', { g: s.familyPoints || 0 }))}</b>${s.familyReward ? `<br><span class="muted">${wzEsc(this._t('reward_line', { r: s.familyReward }))}</span>` : ''}</div></div>
      </div>
      <label class="card" style="border-left-color:var(--warning-color,#ffa000); cursor:pointer">
        <div class="row"><span class="sw-switch"><input type="checkbox" data-act="replace" ${s.replace ? 'checked' : ''}><span></span></span><b>${wzEsc(this._t('replace'))}</b></div>
        <span class="muted">${wzEsc(this._t('replace_d'))}</span></label>
      ${s.hasWizardTasks ? `<label class="card" style="border-left-color:var(--warning-color,#ffa000); cursor:pointer; ${s.replace ? '' : 'opacity:.5'}">
        <div class="row"><span class="sw-switch"><input type="checkbox" data-act="reschedule" ${s.reschedule && s.replace ? 'checked' : ''} ${s.replace ? '' : 'disabled'}><span></span></span><b>${wzEsc(this._t('reschedule'))}</b></div>
        <span class="muted">${wzEsc(this._t('reschedule_d'))}</span></label>` : ''}
      ${s.error ? `<div class="err">${wzEsc(this._t('error'))}${wzEsc(s.error)}</div>` : ''}`;
  }

  _htmlSuccess() {
    const r = this._s.result.result || this._s.result;
    return `<div class="ok">🎉</div>
      <h3 style="text-align:center;font-size:18px">${wzEsc(this._t('ok_title'))}</h3>
      <p style="text-align:center">${wzEsc(this._t('ok_counts', { created: r.created, bonus: r.bonus, templates: r.templates }))}</p>
      ${r.deleted ? `<p class="muted" style="text-align:center">${wzEsc(this._t('ok_deleted', { n: r.deleted }))}</p>` : ''}
      ${r.updated ? `<p class="muted" style="text-align:center">${wzEsc(this._t('ok_updated', { n: r.updated }))}</p>` : ''}
      ${r.skipped ? `<p class="muted" style="text-align:center">${wzEsc(this._t('ok_skipped', { n: r.skipped }))}</p>` : ''}
      <div class="card" style="border-left-color:var(--success-color,#4caf50)"><h3>${wzEsc(this._t('next_steps'))}</h3>
        <ol><li>${wzEsc(this._t('ns_pin'))}</li><li>${wzEsc(this._t('ns_tablet'))}</li><li>${wzEsc(this._t('ns_check'))}</li></ol></div>`;
  }

  // ---------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------

  _onClick(ev) {
    const el = ev.composedPath().find(e => e.dataset && e.dataset.act);
    if (!el) {
      if (ev.target && ev.target.classList && ev.target.classList.contains('overlay') && this._step === 5) this.close();
      return;
    }
    const act = el.dataset.act;
    const s = this._s;
    if (act === 'close') this.close();
    else if (act === 'help') { if (window.TaskOrganizerHelp) window.TaskOrganizerHelp.open(this._hass, 'setup'); }
    else if (act === 'back' && this._step > 0) this._go(this._step - 1);
    else if (act === 'next' && this._canNext()) this._go(this._step + 1);
    else if (act === 'apply') this._apply();
    else if (act === 'kid-avatar') { s.kids[el.dataset.pid].avatar = el.dataset.v; this._renderBody(); }
    else if (act === 'kid-color') { s.kids[el.dataset.pid].color = el.dataset.v; this._renderBody(); }
    else if (act === 'pts-dec' || act === 'pts-inc') this._changePoints(el.dataset.k, act === 'pts-inc' ? 1 : -1);
    else if (act === 'suggest') { s.useSuggestion = true; this._scheduleRefresh(0); }
    else if (act === 'fg-chip') { s.familyReward = el.dataset.v; this._renderBody(); }
  }

  _changePoints(key, delta) {
    const s = this._s;
    const all = [...s.preview.kids.flatMap(k => k.tasks), ...s.preview.open_tasks, ...s.preview.templates];
    const task = all.find(t => t.wizard_key === key);
    if (!task) return;
    const value = Math.max(1, Math.min(10, task.points + delta));
    if (value === task.default_points) delete s.points[key]; else s.points[key] = value;
    task.points = value;
    this._resetGoalEdits();
    this._renderBody();
    this._scheduleRefresh(250);
  }

  _onChange(ev) {
    const el = ev.target;
    const act = el.dataset && el.dataset.act;
    if (!act) return;
    const s = this._s;
    if (act === 'kid-on') {
      s.kids[el.dataset.pid].enabled = el.checked;
      this._resetGoalEdits();
      this._renderBody();
    } else if (act === 'feature') {
      if (el.checked) s.features.add(el.dataset.k); else s.features.delete(el.dataset.k);
      this._resetGoalEdits();
      this._renderBody();
    } else if (act === 'start-date') {
      s.startDate = el.value || s.startDate;
    } else if (act === 'household-day') {
      const day = parseInt(el.value);
      if (day >= 0 && day <= 6) s.householdDay = day;
    } else if (act === 'task') {
      if (el.checked) s.excluded.delete(el.dataset.k); else s.excluded.add(el.dataset.k);
      this._markSelection(el.dataset.k, el.checked);
      this._resetGoalEdits();
      this._renderBody();
      this._scheduleRefresh();
    } else if (act === 'phase') {
      s.phase = el.value;
      s.goalEdits = {};
      s.familyEdited = false;
      this._renderBody();
      this._scheduleRefresh(0);
    } else if (act === 'replace') {
      s.replace = el.checked;
      this._renderBody();
    } else if (act === 'reschedule') {
      s.reschedule = el.checked;
    }
  }

  /** Optimistic update of the selected flag until the new preview arrives. */
  _markSelection(key, selected) {
    const p = this._s.preview;
    if (!p) return;
    [...p.kids.flatMap(k => k.tasks), ...p.open_tasks, ...p.templates]
      .filter(t => t.wizard_key === key).forEach(t => { t.selected = selected; });
  }

  /** Updates the age label, the validation hint and the footer after a birthday / year change. */
  _afterAgeInput(pid) {
    this._resetGoalEdits();
    const age = this._ageOf(this._s.kids[pid]);
    const lbl = this.shadowRoot.querySelector(`.agelbl[data-pid="${pid}"]`);
    if (lbl) lbl.textContent = age !== null ? this._t('age_years', { age }) : '';
    const warn = this.shadowRoot.getElementById('need-year');
    if (warn) warn.hidden = this._kidsValid();
    this._renderFoot();
  }

  _onInput(ev) {
    const el = ev.target;
    const act = el.dataset && el.dataset.act;
    const s = this._s;
    if (act === 'kid-year') {
      // No re-render while typing: it would steal the focus
      s.kids[el.dataset.pid].birth_year = el.value;
      this._afterAgeInput(el.dataset.pid);
    } else if (act === 'kid-birthday') {
      s.kids[el.dataset.pid].birthday = el.value;
      const yearEl = this.shadowRoot.querySelector(`input.year[data-pid="${el.dataset.pid}"]`);
      const valid = this._validBirthday(el.value);
      if (yearEl) {
        yearEl.disabled = !!valid;
        if (valid) yearEl.value = valid.slice(0, 4);
      }
      this._afterAgeInput(el.dataset.pid);
    } else if (act === 'goal') {
      const v = parseInt(el.value);
      s.goalEdits[el.dataset.pid] = isNaN(v) ? 0 : Math.max(0, v);
      if (!s.familyEdited) {
        s.familyPoints = this._calcFamily(s.preview);
        const fg = this.shadowRoot.querySelector('[data-act="fg-points"]');
        if (fg) fg.value = s.familyPoints;
      }
    } else if (act === 'fg-points') {
      s.familyEdited = true;
      s.familyPoints = Math.max(0, parseInt(el.value) || 0);
    } else if (act === 'fg-reward') {
      s.familyReward = el.value;
    }
  }
}

if (!customElements.get('task-organizer-trigger-picker')) customElements.define('task-organizer-trigger-picker', TaskOrganizerTriggerPicker);
if (!customElements.get('task-organizer-wizard')) customElements.define('task-organizer-wizard', TaskOrganizerWizard);
