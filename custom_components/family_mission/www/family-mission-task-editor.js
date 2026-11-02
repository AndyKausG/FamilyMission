/**
 * FamilyMission task editor: ONE shared form for tasks and templates.
 *
 * Used by the settings card (templates), the household card (tasks) and the parents card
 * ("New task" flow, step 2). It is a vanilla web component without any build step and it does
 * not depend on other Home Assistant elements (only `ha-icon` / `ha-icon-picker` for mdi icons).
 *
 *   const ed = document.createElement('family-mission-task-editor');
 *   ed.hass = hass;
 *   ed.config = { variant: 'modal', isNew: false, canDelete: true, ... };
 *   ed.value = { name, icon, category, interval, weekdays, ... };   // same fields as the websocket commands
 *   ed.setAttribute('open', '');                                   // modal variant only
 *   ed.addEventListener('fm-editor-save', e => e.detail.value);    // also: -cancel, -delete, -change, -template
 *
 * `variant: 'modal'` renders a dialog (about 600 px, a full-screen sheet on phones) with a sticky footer.
 * `variant: 'inline'` renders only the form (header with name / icon / summary chips and the sections);
 * the host supplies the surrounding sheet and its buttons. Loading the file twice is harmless.
 */
(() => {
  if (customElements.get('family-mission-task-editor')) return;

  const I18N = {
    en: {
      dialog_task: "Task", close: "Close", name_ph: "Task name", name_lbl: "Name", icon_btn: "Choose icon", mdi_pick: "Choose mdi icon", icon_grid: "Common icons",
      ch_points: "{n} points", ch_point1: "1 point", ch_steps: "{n} steps", ch_step1: "1 step", ch_age: "from {n}", ch_allday: "All day", ch_we: "Sat/Sun {t}",
      sec_kind: "Kind", cat_basis: "Duty", cat_bonus: "Bonus", cat_auftrag: "Errand",
      help_basis: "A fixed duty of the assigned kids; it counts for the daily routine.",
      help_bonus: "Optional for everyone; whoever is first earns the points.",
      help_auftrag: "A one-off errand with a due date.",
      locked_bonus: "A task for everyone is always a bonus.",
      sec_who: "For whom", rotation: "Take turns (one kid per occurrence)", rotation_hint: "Each occurrence belongs to one kid; the turn moves on after it is done or missed.",
      sec_when: "When", w_daily: "Daily", w_weekdays: "Weekdays", w_every: "Every N days", w_once: "Once",
      every_l: "Every", days_unit: "days", date_l: "On", date_hint: "Empty = due right away.", tpl_once_hint: "The date is chosen when a task is created from this template.",
      window: "Time window", from: "from", until: "until", window_hint: "Empty = the whole day.", clear_window: "Whole day",
      we_switch: "Different on the weekend", we_lbl: "Saturday / Sunday",
      sec_steps: "Steps", step_ph: "New step …", add: "Add", step_title: "Step {n}", move: "Move step", move_up: "Move up", move_down: "Move down", remove: "Remove step",
      badge_age: "from {n}", badge_school: "School day", care_row: "Medication appears here", care_after: "after \"{t}\"", care_end: "at the end",
      sec_reward: "Reward", points: "Points", approval: "Parents approve", approval_sub: "The kid reports it, a parent confirms it.",
      together: "Doing it together allowed", together_sub: "Several kids may do it as a team.", routine: "Bonus only after the kid's due duties",
      sec_rules: "Rules", min_age: "Minimum age", age_any: "any", where: "Where", home: "At home", personal: "Personal", where_sub: "At home pauses when you are away.",
      homework: "Only after homework", homework_sub: "Opens once the homework is done.",
      reminder: "Reminder", remind_at: "Remind at", notify_via: "Notify via", event_only: "Event only",
      note_add: "Add a note for parents", note_lbl: "Note for parents",
      advanced: "Advanced", set_due: "Set the due date", override_overdue: "Own overdue limit (days)", pause_until: "Pause until",
      del: "Delete", cancel: "Cancel", save: "Save",
      need_name: "Please enter a name.", need_days: "Please pick at least one weekday.", need_every: "Please enter 1 to 365 days.", need_date: "Please pick a date.",
      from_tpl: "From template", from_tpl_ph: "— choose a template (optional) —", suggest: "Create \"{name}\" from the template?",
      days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], days_long: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      icons: { broom: "Broom", bed: "Bed", dish: "Dishes", basket: "Laundry", trash: "Trash", plant: "Plants", dog: "Dog", cat: "Cat", cart: "Shopping", bread: "Bread", box: "Parcel", star: "Star", book: "Book", bag: "School bag", tooth: "Teeth", shower: "Shower", shirt: "Clothes", sun: "Morning", moon: "Evening", spray: "Cleaning", car: "Car", cook: "Cooking", toy: "Toys", music: "Music", pill: "Medication", lunch: "Lunch box", bike: "Bike", table: "Table", window: "Window" }
    },
    de: {
      dialog_task: "Aufgabe", close: "Schließen", name_ph: "Name der Aufgabe", name_lbl: "Name", icon_btn: "Symbol wählen", mdi_pick: "mdi-Icon wählen", icon_grid: "Häufige Symbole",
      ch_points: "{n} Punkte", ch_point1: "1 Punkt", ch_steps: "{n} Schritte", ch_step1: "1 Schritt", ch_age: "ab {n}", ch_allday: "Ganztägig", ch_we: "Sa/So {t}",
      sec_kind: "Art", cat_basis: "Pflicht", cat_bonus: "Bonus", cat_auftrag: "Auftrag",
      help_basis: "Feste Pflicht der zugewiesenen Kinder; zählt zur täglichen Routine.",
      help_bonus: "Freiwillig für alle; wer zuerst kommt, bekommt die Punkte.",
      help_auftrag: "Ein einmaliger Auftrag mit Fälligkeit.",
      locked_bonus: "Eine Aufgabe für alle ist immer ein Bonus.",
      sec_who: "Für wen", rotation: "Im Wechsel (ein Kind pro Termin)", rotation_hint: "Jeder Termin gehört einem Kind; nach Erledigen oder Verpassen ist das nächste dran.",
      sec_when: "Wann", w_daily: "Täglich", w_weekdays: "Wochentage", w_every: "Alle N Tage", w_once: "Einmalig",
      every_l: "Alle", days_unit: "Tage", date_l: "Am", date_hint: "Leer = sofort fällig.", tpl_once_hint: "Das Datum wählst du, wenn aus der Vorlage eine Aufgabe wird.",
      window: "Zeitfenster", from: "von", until: "bis", window_hint: "Leer = ganztägig.", clear_window: "Ganztägig",
      we_switch: "Am Wochenende anders", we_lbl: "Samstag / Sonntag",
      sec_steps: "Schritte", step_ph: "Neuer Schritt …", add: "Hinzufügen", step_title: "Schritt {n}", move: "Schritt verschieben", move_up: "Nach oben", move_down: "Nach unten", remove: "Schritt entfernen",
      badge_age: "ab {n}", badge_school: "Schultag", care_row: "Hier erscheint das Medikament", care_after: "nach „{t}“", care_end: "am Ende",
      sec_reward: "Belohnung", points: "Punkte", approval: "Eltern geben frei", approval_sub: "Das Kind meldet es, ein Elternteil bestätigt.",
      together: "Gemeinsam erledigen erlaubt", together_sub: "Mehrere Kinder dürfen es als Team machen.", routine: "Bonus erst nach den fälligen Pflichten",
      sec_rules: "Regeln", min_age: "Mindestalter", age_any: "alle", where: "Wo", home: "Zuhause", personal: "Persönlich", where_sub: "Zuhause ruht, wenn ihr verreist.",
      homework: "Erst nach den Hausaufgaben", homework_sub: "Öffnet, sobald die Hausaufgaben erledigt sind.",
      reminder: "Erinnerung", remind_at: "Erinnern um", notify_via: "Benachrichtigen über", event_only: "Nur Ereignis",
      note_add: "Notiz für Eltern hinzufügen", note_lbl: "Notiz für Eltern",
      advanced: "Erweitert", set_due: "Fälligkeit festlegen", override_overdue: "Eigene Überfällig-Grenze (Tage)", pause_until: "Pausieren bis",
      del: "Löschen", cancel: "Abbrechen", save: "Speichern",
      need_name: "Bitte einen Namen eingeben.", need_days: "Bitte mindestens einen Wochentag wählen.", need_every: "Bitte 1 bis 365 Tage eingeben.", need_date: "Bitte ein Datum wählen.",
      from_tpl: "Aus Vorlage", from_tpl_ph: "— Vorlage wählen (optional) —", suggest: "„{name}“ aus der Vorlage anlegen?",
      days: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], days_long: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
      icons: { broom: "Besen", bed: "Bett", dish: "Geschirr", basket: "Wäsche", trash: "Müll", plant: "Pflanzen", dog: "Hund", cat: "Katze", cart: "Einkaufen", bread: "Brot", box: "Paket", star: "Stern", book: "Buch", bag: "Schulranzen", tooth: "Zähne", shower: "Duschen", shirt: "Kleidung", sun: "Morgen", moon: "Abend", spray: "Putzen", car: "Auto", cook: "Kochen", toy: "Spielzeug", music: "Musik", pill: "Medikament", lunch: "Brotdose", bike: "Fahrrad", table: "Tisch", window: "Fenster" }
    }
  };

  /** Common icons: [emoji, mdi icon, i18n key]. */
  const ICONS = [
    ['🧹', 'mdi:broom', 'broom'], ['🛏️', 'mdi:bed', 'bed'], ['🍽️', 'mdi:silverware-fork-knife', 'dish'], ['🧺', 'mdi:basket', 'basket'],
    ['🗑️', 'mdi:trash-can', 'trash'], ['🪴', 'mdi:flower', 'plant'], ['🐕', 'mdi:dog', 'dog'], ['🐈', 'mdi:cat', 'cat'],
    ['🛒', 'mdi:cart', 'cart'], ['🍞', 'mdi:bread-slice', 'bread'], ['📦', 'mdi:package-variant', 'box'], ['⭐', 'mdi:star', 'star'],
    ['📚', 'mdi:book-open-variant', 'book'], ['🎒', 'mdi:bag-personal', 'bag'], ['🦷', 'mdi:tooth', 'tooth'], ['🚿', 'mdi:shower', 'shower'],
    ['👕', 'mdi:tshirt-crew', 'shirt'], ['🌅', 'mdi:weather-sunny', 'sun'], ['🌙', 'mdi:weather-night', 'moon'], ['🧽', 'mdi:spray-bottle', 'spray'],
    ['🚗', 'mdi:car', 'car'], ['🍳', 'mdi:chef-hat', 'cook'], ['🧸', 'mdi:teddy-bear', 'toy'], ['🎹', 'mdi:piano', 'music'],
    ['💊', 'mdi:pill', 'pill'], ['🥪', 'mdi:food', 'lunch'], ['🚲', 'mdi:bike', 'bike'], ['🍴', 'mdi:table-furniture', 'table'], ['🪟', 'mdi:window-closed-variant', 'window']
  ];

  const P = {
    close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
    down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
    up: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",
    grip: "M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z",
    arrowUp: "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z",
    arrowDown: "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z",
    plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
    minus: "M19,13H5V11H19V13Z"
  };
  const svg = (path, size = 20) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path d="${path}" fill="currentColor"/></svg>`;
  const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const time = (v) => (TIME_RE.test(v || '') ? v : '');
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const CATS = ['basis', 'bonus', 'auftrag'];

  const STYLE = `
    :host { display: block; box-sizing: border-box;
      --_primary: var(--primary-color, #0277BD); --_on-primary: var(--text-primary-color, #fff);
      --_bg: var(--card-background-color, #fff); --_text: var(--primary-text-color, #212121); --_sub: var(--secondary-text-color, #5f6368);
      --_line: var(--divider-color, #d0d4d9); --_soft: var(--secondary-background-color, #f2f3f5); --_danger: var(--error-color, #C62828);
      --_warn: var(--warning-color, #B26A00);
      color: var(--_text); font-family: var(--paper-font-body1_-_font-family, var(--ha-font-family-body, inherit)); font-size: 15px; line-height: 1.4; }
    @media (prefers-color-scheme: dark) { :host {
      --_primary: var(--primary-color, #4FC3F7); --_on-primary: var(--text-primary-color, #00253a); --_bg: var(--card-background-color, #1e2227); --_text: var(--primary-text-color, #e8eaed);
      --_sub: var(--secondary-text-color, #a0a6ad); --_line: var(--divider-color, #3a4048); --_soft: var(--secondary-background-color, #2a3037); --_danger: var(--error-color, #EF9A9A); --_warn: var(--warning-color, #FFB74D); } }
    :host([variant="modal"]:not([open])) { display: none; }
    * { box-sizing: border-box; }
    button, input, select, textarea { font: inherit; color: inherit; }
    button { cursor: pointer; }
    button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 3px solid var(--_primary); outline-offset: 2px; }
    [hidden] { display: none !important; }

    .overlay { position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; padding: 16px; }
    .dialog { background: var(--_bg); color: var(--_text); width: min(600px, 100%); max-height: min(92vh, 100%); display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,.45); }
    .dialog:focus { outline: none; }
    .topbar { display: none; align-items: center; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--_line); background: var(--_bg); }
    .topbar .ttl { flex: 1; min-width: 0; font-weight: 700; font-size: 17px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .body { padding: 16px 20px 8px; overflow-y: auto; overflow-x: hidden; flex: 1 1 auto; min-height: 0; -webkit-overflow-scrolling: touch; }
    .inline .body { overflow: visible; padding: 0; }
    .footer { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--_line); background: var(--_bg); flex: none; }
    .footer .sp { flex: 1; }

    .btn { min-height: 44px; padding: 0 18px; border-radius: 22px; border: 1px solid var(--_line); background: transparent; color: var(--_text); font-weight: 600; }
    .btn.primary { background: var(--_primary); border-color: var(--_primary); color: var(--_on-primary); }
    .btn.danger { color: var(--_danger); border-color: var(--_danger); }
    .ibtn { width: 44px; height: 44px; border-radius: 50%; border: none; background: transparent; display: inline-flex; align-items: center; justify-content: center; flex: none; }
    .ibtn:hover:not(:disabled) { background: var(--_soft); }
    .ibtn:disabled { opacity: .35; cursor: default; }

    .head { display: flex; gap: 14px; align-items: flex-start; }
    .bigicon { width: 64px; height: 64px; flex: none; border-radius: 18px; border: 2px solid var(--_line); background: var(--_soft); color: var(--_primary); display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 36px; }
    .bigicon[aria-expanded="true"] { border-color: var(--_primary); }
    .namewrap { flex: 1; min-width: 0; }
    .name { width: 100%; min-height: 48px; padding: 4px 4px; font-size: 22px; font-weight: 700; background: transparent; border: none; border-bottom: 2px solid var(--_line); border-radius: 0; color: var(--_text); }
    .name:focus, .name:focus-visible { outline: none; border-bottom-color: var(--_primary); box-shadow: 0 2px 0 0 var(--_primary); }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .pill { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 12px; background: var(--_soft); color: var(--_sub); font-size: 13px; font-weight: 600; line-height: 20px; white-space: nowrap; }
    .pill.main { background: color-mix(in srgb, var(--_primary) 16%, transparent); color: var(--_primary); }
    .err { margin: 6px 0 0; color: var(--_danger); font-weight: 600; font-size: 14px; }

    .iconpanel { margin: 12px 0 0; padding: 12px; border: 1px solid var(--_line); border-radius: 14px; background: var(--_soft); }
    .emojis { display: grid; grid-template-columns: repeat(auto-fill, minmax(48px, 1fr)); gap: 6px; }
    .emoji { height: 48px; border-radius: 12px; border: 2px solid transparent; background: var(--_bg); font-size: 24px; line-height: 1; }
    .emoji[aria-pressed="true"] { border-color: var(--_primary); }
    .iconpanel .btn { margin-top: 10px; }
    .mdi-pick { margin-top: 10px; display: block; }

    .tplrow { margin-top: 14px; }
    .tplrow .lbl { display: block; margin-bottom: 4px; }
    .sug { display: block; margin-top: 6px; padding: 8px 0; min-height: 44px; background: none; border: none; color: var(--_primary); text-align: left; font-weight: 600; }

    .sec { margin-top: 20px; }
    .sec-h { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--_sub); }
    .sec-t { width: 100%; display: none; align-items: center; gap: 10px; min-height: 52px; padding: 6px 12px; border: 1px solid var(--_line); border-radius: 12px; background: var(--_bg); text-align: left; }
    .sec-t .ti { font-weight: 700; }
    .sec-t .sm { flex: 1; min-width: 0; color: var(--_sub); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
    .sec-t svg { flex: none; }
    .help { margin: 8px 0 0; color: var(--_sub); font-size: 13px; }
    .sub { color: var(--_sub); font-size: 13px; }
    .stack { display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .row > .grow { flex: 1; min-width: 0; }
    .lbl { font-weight: 600; }

    .seg { display: flex; border: 1px solid var(--_line); border-radius: 12px; overflow: hidden; background: var(--_bg); }
    .seg button { flex: 1 1 0; min-width: 0; min-height: 44px; padding: 0 6px; border: none; border-right: 1px solid var(--_line); background: transparent; font-weight: 600; font-size: 14px; }
    .seg button:last-child { border-right: none; }
    .seg button[aria-pressed="true"] { background: var(--_primary); color: var(--_on-primary); }
    .seg button:disabled { opacity: .55; cursor: default; }
    .seg button:focus-visible { outline-offset: -3px; }

    .wds { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
    .wd { min-width: 44px; height: 44px; padding: 0 6px; border-radius: 22px; border: 1px solid var(--_line); background: transparent; font-weight: 600; flex: 1 1 0; }
    .wd[aria-pressed="true"] { background: var(--_primary); border-color: var(--_primary); color: var(--_on-primary); }
    .pchips { display: flex; flex-wrap: wrap; gap: 8px; }
    .pchips + .sw { margin-top: 10px; }
    .pchip { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 22px; border: 1px solid var(--_line); background: transparent; font-weight: 600; }
    .pchip[aria-pressed="true"] { background: var(--_primary); border-color: var(--_primary); color: var(--_on-primary); }

    .stepper { display: inline-flex; align-items: center; gap: 4px; }
    .stepper .b { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--_line); background: transparent; display: inline-flex; align-items: center; justify-content: center; }
    .stepper .b:disabled { opacity: .35; cursor: default; }
    .stepper .v { min-width: 64px; text-align: center; font-size: 18px; font-weight: 800; }
    .stepper input { width: 72px; text-align: center; font-size: 18px; font-weight: 800; padding: 0 4px; }

    .fld { min-height: 44px; padding: 0 12px; border: 1px solid var(--_line); border-radius: 10px; background: var(--_bg); color: var(--_text); min-width: 0; max-width: 100%; }
    textarea.fld { padding: 10px 12px; width: 100%; min-height: 80px; resize: vertical; }
    select.fld { width: 100%; }
    .times { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .times label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--_sub); font-weight: 600; }
    .times .fld { width: 130px; }
    .times select.fld[data-k="remindTarget"] { width: 100%; }
        .linkbtn { background: none; border: none; color: var(--_primary); font-weight: 600; min-height: 44px; padding: 0 4px; text-align: left; }

    .sw { display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 4px 0; cursor: pointer; position: relative; }
    .sw .tx { flex: 1; min-width: 0; }
    .sw .tx b { display: block; font-weight: 600; }
    .sw input { position: absolute; opacity: 0; width: 1px; height: 1px; }
    .sw .tr { flex: none; width: 48px; height: 28px; border-radius: 14px; background: var(--_line); position: relative; transition: background .15s; }
    .sw .tr::after { content: ""; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.35); transition: transform .15s; }
    .sw input:checked + .tr { background: var(--_primary); }
    .sw input:checked + .tr::after { transform: translateX(20px); }
    .sw input:focus-visible + .tr { outline: 3px solid var(--_primary); outline-offset: 2px; }
    .indent { margin-left: 4px; padding-left: 12px; border-left: 3px solid var(--_line); }

    .steps { list-style: none; margin: 0 0 10px; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .step { display: flex; align-items: center; gap: 4px; padding: 2px 4px; border: 1px solid var(--_line); border-radius: 12px; background: var(--_bg); position: relative; }
    .step.dragging { opacity: .5; }
    .step.drop-before::before, .step.drop-after::after { content: ""; position: absolute; left: 8px; right: 8px; height: 3px; border-radius: 2px; background: var(--_primary); }
    .step.drop-before::before { top: -5px; } .step.drop-after::after { bottom: -5px; }
    .grip { width: 40px; height: 44px; flex: none; border: none; background: transparent; color: var(--_sub); display: inline-flex; align-items: center; justify-content: center; cursor: grab; touch-action: none; }
    .step input.st { flex: 1; min-width: 0; height: 44px; border: none; background: transparent; padding: 0 6px; }
    .step input.st:focus { background: var(--_soft); border-radius: 8px; }
    .badge { flex: none; padding: 1px 8px; border-radius: 10px; background: color-mix(in srgb, var(--_warn) 18%, transparent); color: var(--_warn); font-size: 12px; font-weight: 700; white-space: nowrap; }
    .step .ibtn { width: 44px; height: 44px; }
    .care { display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 4px 14px; border: 2px dashed var(--_line); border-radius: 12px; color: var(--_sub); font-size: 14px; }
    .addrow { display: flex; gap: 8px; }
    .addrow .fld { flex: 1; }

    .adv-h { width: 100%; display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 4px; background: none; border: none; border-top: 1px solid var(--_line); font-weight: 600; color: var(--_sub); text-align: left; }
    .adv-h span { flex: 1; }

    /* phone: full-screen sheet, sections collapsed to rows */
    .phone .overlay { padding: 0; align-items: stretch; background: var(--_bg); }
    .phone .dialog { width: 100%; max-height: none; height: 100%; border-radius: 0; box-shadow: none; }
    .phone .topbar { display: flex; padding-top: max(6px, env(safe-area-inset-top, 0px)); }
    .phone .body { padding: 14px 16px 8px; }
    .phone .close-d { display: none; }
    .phone .footer { padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px)); }
    .phone .footer .btn.cancel, .phone .footer .btn.primary { display: none; }
    .phone .footer.only-actions { display: none; }
    .phone .sec.fold > .sec-h { display: none; }
    .phone .sec.fold > .sec-t { display: flex; }
    .phone .sec.fold:not(.open) > .sec-c { display: none; }
    .phone .sec.fold.open > .sec-t { margin-bottom: 12px; border-color: var(--_primary); }
    .phone .name { font-size: 20px; }
    .phone .head { gap: 10px; }
    .phone .bigicon { width: 56px; height: 56px; }
    .phone .times .fld { width: 120px; }
    .phone .stepper .v { min-width: 56px; }
    @media (prefers-reduced-motion: reduce) { .sw .tr, .sw .tr::after { transition: none; } }
  `;

  class FamilyMissionTaskEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass = null;
      this._cfg = { variant: 'modal' };
      this._rendered = false;
      this._s = this._blank();
      this._phone = false;
      this._open = { when: false, reward: false, rules: false };
      this._mq = null;
      this._mqHandler = () => { this._phone = !!this._mq.matches; this._render(); };
      this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
      this.shadowRoot.addEventListener('input', (ev) => this._onInput(ev));
      this.shadowRoot.addEventListener('change', (ev) => this._onChange(ev));
      this.shadowRoot.addEventListener('keydown', (ev) => this._onKey(ev));
      this.shadowRoot.addEventListener('pointerdown', (ev) => this._onPointerDown(ev));
    }

    // ---- public API ------------------------------------------------------------------------

    set hass(hass) {
      this._hass = hass;
      const pk = this.shadowRoot.querySelector('ha-icon-picker');
      if (pk) pk.hass = hass;
    }
    get hass() { return this._hass; }

    /** Host options, see the header of the file. Re-renders; the entered values stay. */
    set config(cfg) {
      this._cfg = Object.assign({ variant: 'modal' }, cfg || {});
      this.setAttribute('variant', this._cfg.variant === 'inline' ? 'inline' : 'modal');
      if (this._locked()) this._s.category = this._locked();
      this._render();
    }
    get config() { return this._cfg; }

    /** Loads a task / template (websocket field names). Unknown keys are ignored; `area` is passed through. */
    set value(v) {
      this._s = this._fromValue(v || {});
      this._open = { when: false, reward: false, rules: false };
      this._render();
    }

    get value() { return this._toValue(); }

    /** Selected mode: daily | weekdays | every | once. */
    get mode() { return this._s.mode; }

    /** Localized message why the form cannot be saved yet, or ''. */
    get problem() { const k = this._problemKey(); return k ? this._t(k) : ''; }
    get problemKey() { return this._problemKey(); }

    focusName() {
      const el = this.shadowRoot.querySelector('[data-k="name"]');
      if (el) el.focus();
    }

    connectedCallback() {
      if (window.matchMedia) {
        this._mq = window.matchMedia('(max-width: 600px)');
        this._phone = !!this._mq.matches;
        if (this._mq.addEventListener) this._mq.addEventListener('change', this._mqHandler);
        else if (this._mq.addListener) this._mq.addListener(this._mqHandler);
      }
      this._render();
    }

    disconnectedCallback() {
      if (this._mq) {
        if (this._mq.removeEventListener) this._mq.removeEventListener('change', this._mqHandler);
        else if (this._mq.removeListener) this._mq.removeListener(this._mqHandler);
      }
    }

    static get observedAttributes() { return ['open']; }
    attributeChangedCallback(name, oldV, newV) {
      if (name === 'open' && newV !== null && oldV === null) {
        this._s.error = '';
        this._render();
        setTimeout(() => {
          const el = this.shadowRoot.querySelector('[data-k="name"]');
          if (el && !this._s.name) el.focus();
          else { const d = this.shadowRoot.querySelector('.dialog'); if (d) d.focus(); }
        }, 30);
      }
    }

    // ---- state <-> value --------------------------------------------------------------------

    _blank() {
      return {
        name: '', icon: 'mdi:star', category: 'basis', mode: 'daily', wd: [], every: 2, interval0: 1, date: '', dateTouched: false,
        from: '', until: '', fromWe: '', untilWe: '', weOn: false, steps: [], newStep: '',
        points: 5, approval: false, together: false, routine: false, minAge: 0, scope: 'home', afterKey: null, afterHw: false,
        remindOn: false, remindAt: '18:00', remindTarget: '', desc: '', noteOpen: false, area: '', catalogKey: null,
        assignees: [], rotationOn: false,
        advOpen: false, advDueOn: false, advDue: '', pauseOn: false, pauseDate: '', overOn: false, overDays: '',
        iconOpen: false, mdiOpen: false, error: ''
      };
    }

    _fromValue(v) {
      const s = this._blank();
      s.name = String(v.name || '');
      s.icon = typeof v.icon === 'string' && v.icon ? v.icon : 'mdi:star';
      s.category = CATS.includes(v.category) ? v.category : 'basis';
      if (this._locked()) s.category = this._locked();
      const wd = Array.isArray(v.weekdays) ? v.weekdays.filter(d => Number.isInteger(d) && d >= 0 && d <= 6) : [];
      const ivRaw = parseInt(v.interval);
      const iv = Number.isFinite(ivRaw) ? ivRaw : null;
      s.wd = Array.from(new Set(wd)).sort((a, b) => a - b);
      s.interval0 = iv && iv > 0 ? iv : 1;
      if (s.wd.length) s.mode = 'weekdays';
      else if (iv === 0) s.mode = 'once';
      else if (iv === null || iv === 1) s.mode = 'daily';
      else { s.mode = 'every'; s.every = clamp(iv, 1, 365); }
      const d = String(v.custom_due_date || '').slice(0, 10);
      s.date = DATE_RE.test(d) ? d : '';
      s.from = time(v.available_from); s.until = time(v.available_until);
      s.fromWe = time(v.available_from_we); s.untilWe = time(v.available_until_we);
      s.weOn = !!(s.fromWe || s.untilWe);
      s.steps = (Array.isArray(v.subtasks) ? v.subtasks : [])
        .map(st => (typeof st === 'string' ? { title: st, done: false } : Object.assign({}, st, { title: String((st && st.title) || '') })))
        .filter(st => st.title !== '');
      const pts = parseInt(v.complexity);
      s.points = Number.isFinite(pts) ? clamp(pts, 1, 10) : 5;
      s.approval = !!v.requires_approval;
      s.routine = !!v.requires_routine;
      s.together = v.allow_together === undefined || v.allow_together === null ? s.category !== 'basis' : !!v.allow_together;
      const age = parseInt(v.min_age);
      s.minAge = Number.isFinite(age) ? clamp(age, 0, 18) : 0;
      s.scope = v.scope === 'personal' ? 'personal' : 'home';
      s.afterKey = typeof v.after_key === 'string' && v.after_key ? v.after_key : null;
      s.afterHw = s.afterKey === 'homework';
      s.remindOn = !!time(v.reminder_at);
      s.remindAt = time(v.reminder_at) || '18:00';
      s.remindTarget = typeof v.reminder_target === 'string' ? v.reminder_target : '';
      s.desc = String(v.description || '');
      s.noteOpen = !!s.desc;
      s.area = typeof v.area === 'string' ? v.area : '';
      s.catalogKey = typeof v.catalog_key === 'string' && v.catalog_key ? v.catalog_key : null;
      s.assignees = Array.isArray(v.assignees) ? v.assignees.slice() : [];
      s.rotationOn = !!(v.rotation && Array.isArray(v.rotation.members));
      if (v.paused_until) { s.pauseOn = true; s.pauseDate = String(v.paused_until).slice(0, 10); }
      if (v.override_overdue_days !== null && v.override_overdue_days !== undefined && v.override_overdue_days !== '') { s.overOn = true; s.overDays = String(v.override_overdue_days); }
      s.advOpen = s.pauseOn || s.overOn;
      return s;
    }

    _toValue() {
      const s = this._s;
      const c = this._cfg;
      const every = clamp(parseInt(s.every) || 2, 1, 365);
      const interval = s.mode === 'once' ? 0 : s.mode === 'daily' ? 1 : s.mode === 'every' ? every : (s.interval0 > 0 ? s.interval0 : 1);
      let due = null;
      if (s.mode === 'once') due = c.showDate !== false && s.date && (c.isNew !== false || s.dateTouched) ? s.date : null;
      else if (c.advanced && s.advDueOn) due = s.advDue || new Date().toISOString().split('T')[0];
      const afterKey = this._homeworkVisible() ? (s.afterHw ? 'homework' : (s.afterKey && s.afterKey !== 'homework' ? s.afterKey : null)) : (s.afterKey || null);
      const people = this._people();
      const picked = s.assignees.filter(id => people.some(p => p.id === id));
      const members = picked.filter(id => this._kidIds().includes(id));
      const value = {
        name: s.name.trim(),
        description: s.desc,
        area: s.area,
        interval,
        complexity: clamp(s.points, 1, 10),
        icon: s.icon || 'mdi:star',
        category: s.category,
        scope: s.scope,
        min_age: clamp(s.minAge, 0, 18),
        requires_approval: !!s.approval,
        requires_routine: !!s.routine,
        allow_together: !!s.together,
        available_from: s.from,
        available_until: s.until,
        available_from_we: s.weOn ? s.fromWe : '',
        available_until_we: s.weOn ? s.untilWe : '',
        after_key: afterKey,
        reminder_at: s.remindOn ? (s.remindAt || '18:00') : '',
        reminder_target: s.remindOn ? s.remindTarget : '',
        weekdays: s.mode === 'weekdays' ? s.wd.slice().sort((a, b) => a - b) : [],
        custom_due_date: due,
        subtasks: s.steps.map(st => Object.assign({}, st))
      };
      if (s.catalogKey) value.catalog_key = s.catalogKey;
      if (c.who) {
        value.assignees = picked;
        value.rotation = s.rotationOn && members.length >= 2 ? { members } : null;
      }
      if (c.advanced) {
        value.paused_until = s.pauseOn && s.pauseDate ? s.pauseDate : null;
        value.override_overdue_days = s.overOn && s.overDays !== '' ? (parseInt(s.overDays) || null) : null;
      }
      return value;
    }

    _problemKey() {
      const s = this._s;
      if (!s.name.trim()) return 'need_name';
      if (s.mode === 'weekdays' && !s.wd.length) return 'need_days';
      if (s.mode === 'every' && !(parseInt(s.every) >= 1 && parseInt(s.every) <= 365)) return 'need_every';
      if (s.mode === 'once' && this._cfg.showDate !== false && this._cfg.requireDate && !DATE_RE.test(s.date || '')) return 'need_date';
      return '';
    }

    // ---- helpers -----------------------------------------------------------------------------

    _lang() { return this._hass && this._hass.language && String(this._hass.language).toLowerCase().startsWith('de') ? 'de' : 'en'; }
    _t(key, r) {
      let v = (I18N[this._lang()] || I18N.en)[key];
      if (v === undefined) v = I18N.en[key];
      if (typeof v !== 'string') return v === undefined ? key : v;
      if (r) Object.keys(r).forEach(k => { v = v.split('{' + k + '}').join(r[k]); });
      return v;
    }
    _people() { return (this._cfg.who && Array.isArray(this._cfg.who.people)) ? this._cfg.who.people : []; }
    _kidIds() { return (this._cfg.who && Array.isArray(this._cfg.who.kids)) ? this._cfg.who.kids : []; }
    _homeworkVisible() { return !!this._cfg.homework || this._s.afterKey === 'homework'; }
    _locked() { return this._cfg.lockCategory && CATS.includes(this._cfg.lockCategory) ? this._cfg.lockCategory : null; }

    _fmtDate(d) {
      if (!DATE_RE.test(d || '')) return '';
      try { return new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)).toLocaleDateString(this._lang(), { day: 'numeric', month: 'numeric' }); } catch (e) { return d; }
    }
    _window(from, until) { return from || until ? `${from || '00:00'}–${until || '24:00'}` : ''; }

    _rhythm() {
      const s = this._s;
      if (s.mode === 'daily') return this._t('w_daily');
      if (s.mode === 'weekdays') {
        if (!s.wd.length) return this._t('w_weekdays');
        return s.wd.slice().sort((a, b) => a - b).map(d => this._t('days')[d]).join(', ');
      }
      if (s.mode === 'every') return this._lang() === 'de' ? `Alle ${s.every} Tage` : `Every ${s.every} days`;
      const d = this._cfg.showDate !== false ? this._fmtDate(s.date) : '';
      return d ? `${this._t('w_once')} ${d}` : this._t('w_once');
    }

    _windowText() { return this._window(this._s.from, this._s.until) || this._t('ch_allday'); }

    _pointsText() { return this._s.points === 1 ? this._t('ch_point1') : this._t('ch_points', { n: this._s.points }); }

    _chips() {
      const s = this._s;
      const out = [{ t: this._t('cat_' + s.category), main: true }, { t: this._rhythm() }];
      let win = this._windowText();
      if (s.weOn && (s.fromWe || s.untilWe)) win += ' · ' + this._t('ch_we', { t: this._window(s.fromWe, s.untilWe) });
      out.push({ t: win });
      out.push({ t: this._pointsText() });
      if (s.steps.length) out.push({ t: s.steps.length === 1 ? this._t('ch_step1') : this._t('ch_steps', { n: s.steps.length }) });
      if (s.minAge > 0) out.push({ t: this._t('ch_age', { n: s.minAge }) });
      return out;
    }

    _chipsHtml() { return this._chips().map(c => `<span class="pill${c.main ? ' main' : ''}">${esc(c.t)}</span>`).join(''); }

    _summary(sec) {
      const s = this._s;
      if (sec === 'when') return [this._rhythm(), this._windowText()].join(' · ');
      if (sec === 'reward') return [this._pointsText(), s.approval ? this._t('approval') : ''].filter(Boolean).join(' · ');
      const parts = [s.minAge > 0 ? this._t('ch_age', { n: s.minAge }) : this._t('age_any'), s.scope === 'personal' ? this._t('personal') : this._t('home')];
      if (s.remindOn) parts.push('⏰ ' + s.remindAt);
      return parts.join(' · ');
    }

    /** Index before which the medication appears in a morning / evening mission (null = not a mission). */
    _careIndex() {
      const s = this._s;
      const mission = this._cfg.mission || s.catalogKey;
      if (mission !== 'morning' && mission !== 'evening') return null;
      const names = s.steps.map(st => String(st.title || '').trim().toLowerCase());
      const i = mission === 'morning' ? names.findIndex(n => n === 'frühstücken' || n === 'have breakfast') : -1;
      return i >= 0 ? i + 1 : names.length;
    }

    // ---- rendering ----------------------------------------------------------------------------

    _focusKey() {
      const ae = this.shadowRoot.activeElement;
      if (!ae || !ae.dataset) return null;
      const id = ae.dataset.act ? 'a:' + ae.dataset.act : ae.dataset.k ? 'k:' + ae.dataset.k : null;
      if (!id) return null;
      let pos = null;
      try { if (typeof ae.selectionStart === 'number') pos = [ae.selectionStart, ae.selectionEnd]; } catch (e) { /* not a text field */ }
      return { id, v: ae.dataset.v !== undefined ? ae.dataset.v : (ae.dataset.i !== undefined ? ae.dataset.i : ''), pos };
    }

    _restoreFocus(fk) {
      if (!fk) return;
      const attr = fk.id.startsWith('a:') ? 'data-act' : 'data-k';
      const cands = Array.from(this.shadowRoot.querySelectorAll(`[${attr}="${fk.id.slice(2)}"]`));
      const el = cands.find(c => (c.dataset.v !== undefined ? c.dataset.v : (c.dataset.i !== undefined ? c.dataset.i : '')) === fk.v) || (cands.length === 1 ? cands[0] : null);
      if (!el) return;
      el.focus({ preventScroll: true });
      if (fk.pos) { try { el.setSelectionRange(fk.pos[0], fk.pos[1]); } catch (e) { /* ignore */ } }
    }

    _render() {
      if (!this.isConnected && !this._rendered) return;
      const fk = this._focusKey();
      const body = this.shadowRoot.querySelector('.body');
      const top = body ? body.scrollTop : 0;
      const modal = this._cfg.variant !== 'inline';
      const form = this._formHtml();
      const cls = `${this._phone ? 'phone' : ''} ${modal ? 'modal' : 'inline'}`;
      if (!modal) {
        this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="root ${cls}"><div class="body">${form}</div></div>`;
      } else {
        const title = this._cfg.title || this._t('dialog_task');
        const canDel = !!this._cfg.canDelete && this._cfg.isNew === false;
        const saveLabel = this._cfg.saveLabel || this._t('save');
        this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="root ${cls}"><div class="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1">
          <div class="topbar">
            <button type="button" class="ibtn" data-act="cancel" aria-label="${esc(this._t('close'))}">${svg(P.close, 24)}</button>
            <div class="ttl">${esc(title)}</div>
            <button type="button" class="btn primary" data-act="save">${esc(saveLabel)}</button>
          </div>
          <div class="body">${form}</div>
          <div class="footer ${canDel ? '' : 'only-actions'}">
            ${canDel ? `<button type="button" class="btn danger" data-act="delete">${esc(this._t('del'))}</button>` : ''}
            <span class="sp"></span>
            <button type="button" class="btn cancel" data-act="cancel">${esc(this._t('cancel'))}</button>
            <button type="button" class="btn primary" data-act="save">${esc(saveLabel)}</button>
          </div></div></div></div>`;
      }
      this._rendered = true;
      const nb = this.shadowRoot.querySelector('.body');
      if (nb) nb.scrollTop = top;
      const pk = this.shadowRoot.querySelector('ha-icon-picker');
      if (pk) {
        pk.hass = this._hass;
        pk.value = this._s.icon;
        pk.addEventListener('value-changed', (ev) => {
          const v = ev.detail && ev.detail.value;
          if (typeof v === 'string' && v) { this._s.icon = v; this._live(); const ic = this.shadowRoot.querySelector('.bigicon ha-icon'); if (ic) ic.setAttribute('icon', v); }
        });
      }
      this._restoreFocus(fk);
    }

    /** Refreshes the summary chips and the error line without re-rendering (used while typing). */
    _live() {
      const chips = this.shadowRoot.querySelector('.chips');
      if (chips) chips.innerHTML = this._chipsHtml();
      this._s.error = '';
      const err = this.shadowRoot.querySelector('.err');
      if (err) { err.textContent = ''; err.hidden = true; }
      this._emit('fm-editor-change', { value: this._toValue() });
    }

    _seg(label, items, current, act, disabled) {
      return `<div class="seg" role="group" aria-label="${esc(label)}">${items.map(([id, text]) =>
        `<button type="button" data-act="${act}" data-v="${esc(id)}" aria-pressed="${current === id}" ${disabled ? 'disabled' : ''}>${esc(text)}</button>`).join('')}</div>`;
    }

    _switch(k, checked, label, sub) {
      return `<label class="sw"><span class="tx"><b>${esc(label)}</b>${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</span>
        <input type="checkbox" role="switch" data-k="${k}" ${checked ? 'checked' : ''}><span class="tr" aria-hidden="true"></span></label>`;
    }

    _stepper(k, value, text, lo, hi, label) {
      return `<div class="stepper" role="group" aria-label="${esc(label)}">
        <button type="button" class="b" data-act="${k}-" aria-label="${esc(label)} −" ${value <= lo ? 'disabled' : ''}>${svg(P.minus, 20)}</button>
        <span class="v" aria-live="polite">${esc(text)}</span>
        <button type="button" class="b" data-act="${k}+" aria-label="${esc(label)} +" ${value >= hi ? 'disabled' : ''}>${svg(P.plus, 20)}</button></div>`;
    }

    _section(id, title, content, fold) {
      if (!fold) return `<section class="sec" data-sec="${id}"><h3 class="sec-h">${esc(title)}</h3><div class="sec-c">${content}</div></section>`;
      const open = !!this._open[id];
      return `<section class="sec fold ${open ? 'open' : ''}" data-sec="${id}">
        <h3 class="sec-h">${esc(title)}</h3>
        <button type="button" class="sec-t" data-act="sec" data-v="${id}" aria-expanded="${open}"><span class="ti">${esc(title)}</span><span class="sm">${open ? '' : esc(this._summary(id))}</span>${svg(open ? P.up : P.down, 22)}</button>
        <div class="sec-c">${content}</div></section>`;
    }

    _formHtml() {
      const s = this._s;
      const c = this._cfg;
      const locked = this._locked();
      const head = `
        <div class="head">
          <button type="button" class="bigicon" data-act="icon-toggle" aria-expanded="${s.iconOpen}" aria-label="${esc(this._t('icon_btn'))}" title="${esc(this._t('icon_btn'))}"><ha-icon icon="${esc(s.icon)}"></ha-icon></button>
          <div class="namewrap">
            <input class="name" data-k="name" type="text" maxlength="60" autocomplete="off" enterkeyhint="done" placeholder="${esc(this._t('name_ph'))}" aria-label="${esc(this._t('name_lbl'))}" value="${esc(s.name)}">
            <div class="chips" aria-live="polite">${this._chipsHtml()}</div>
            <p class="err" role="alert" ${s.error ? '' : 'hidden'}>${esc(s.error)}</p>
          </div>
          ${c.variant !== 'inline' ? `<button type="button" class="ibtn close-d" data-act="cancel" aria-label="${esc(this._t('close'))}">${svg(P.close, 24)}</button>` : ''}
        </div>
        ${s.iconOpen ? `<div class="iconpanel" role="group" aria-label="${esc(this._t('icon_grid'))}">
          <div class="emojis">${ICONS.map(([e, icon, key]) => `<button type="button" class="emoji" data-act="icon-pick" data-v="${esc(icon)}" aria-pressed="${s.icon === icon}" aria-label="${esc(this._t('icons')[key] || key)}" title="${esc(this._t('icons')[key] || key)}">${e}</button>`).join('')}</div>
          <button type="button" class="btn" data-act="mdi-toggle" aria-expanded="${s.mdiOpen}">${esc(this._t('mdi_pick'))}</button>
          ${s.mdiOpen ? `<ha-icon-picker class="mdi-pick"></ha-icon-picker>` : ''}
        </div>` : ''}
        ${this._templateHtml()}`;

      const kind = `
        ${this._seg(this._t('sec_kind'), CATS.map(k => [k, this._t('cat_' + k)]), s.category, 'cat', !!locked)}
        <p class="help">${esc(locked ? this._t('locked_bonus') : this._t('help_' + s.category))}</p>`;

      const who = c.who ? `
        <div class="pchips" role="group" aria-label="${esc(this._t('sec_who'))}">${this._people().map(p =>
          `<button type="button" class="pchip" data-act="who" data-v="${esc(p.id)}" aria-pressed="${s.assignees.includes(p.id)}">${esc(p.name)}</button>`).join('')}</div>
        ${s.assignees.filter(id => this._kidIds().includes(id)).length >= 2 ? this._switch('rotation', s.rotationOn, this._t('rotation'), this._t('rotation_hint')) : ''}` : '';

      const modeBlock = s.mode === 'weekdays'
        ? `<div class="wds" role="group" aria-label="${esc(this._t('w_weekdays'))}">${this._t('days').map((d, i) =>
          `<button type="button" class="wd" data-act="wd" data-v="${i}" aria-pressed="${s.wd.includes(i)}" aria-label="${esc(this._t('days_long')[i])}">${esc(d)}</button>`).join('')}</div>`
        : s.mode === 'every'
          ? `<div class="row" style="margin-top:10px"><span class="lbl">${esc(this._t('every_l'))}</span>
              <div class="stepper"><button type="button" class="b" data-act="every-" aria-label="−" ${s.every <= 1 ? 'disabled' : ''}>${svg(P.minus, 20)}</button>
              <input class="fld" data-k="every" type="number" min="1" max="365" inputmode="numeric" aria-label="${esc(this._t('w_every'))}" value="${esc(s.every)}">
              <button type="button" class="b" data-act="every+" aria-label="+" ${s.every >= 365 ? 'disabled' : ''}>${svg(P.plus, 20)}</button></div>
              <span class="lbl">${esc(this._t('days_unit'))}</span></div>`
          : s.mode === 'once'
            ? (c.showDate === false
              ? `<p class="help">${esc(this._t('tpl_once_hint'))}</p>`
              : `<div class="row" style="margin-top:10px"><label class="lbl" for="fme-date">${esc(this._t('date_l'))}</label>
                  <input id="fme-date" class="fld" data-k="date" type="date" ${c.dateMin ? `min="${esc(c.dateMin)}"` : ''} value="${esc(s.date)}"></div>
                 ${c.requireDate ? '' : `<p class="help">${esc(this._t('date_hint'))}</p>`}`)
            : '';

      const when = `
        ${this._seg(this._t('sec_when'), [['daily', this._t('w_daily')], ['weekdays', this._t('w_weekdays')], ['every', this._t('w_every')], ['once', this._t('w_once')]], s.mode, 'mode')}
        ${modeBlock}
        <div class="stack" style="margin-top:16px">
          <div><div class="lbl" style="margin-bottom:6px">${esc(this._t('window'))}</div>
            <div class="times">
              <label>${esc(this._t('from'))}${this._timeSelect('from', s.from, this._t('window') + ' ' + this._t('from'), true)}</label>
              <label>${esc(this._t('until'))}${this._timeSelect('until', s.until, this._t('window') + ' ' + this._t('until'), true)}</label>
              ${s.from || s.until ? `<button type="button" class="linkbtn" data-act="clear-window">${esc(this._t('clear_window'))}</button>` : ''}
            </div>
            <p class="help">${esc(this._t('window_hint'))}</p></div>
          ${this._switch('we', s.weOn, this._t('we_switch'))}
          ${s.weOn ? `<div class="indent"><div class="sub" style="margin-bottom:6px">${esc(this._t('we_lbl'))}</div><div class="times">
              <label>${esc(this._t('from'))}${this._timeSelect('fromWe', s.fromWe, this._t('we_lbl') + ' ' + this._t('from'), true)}</label>
              <label>${esc(this._t('until'))}${this._timeSelect('untilWe', s.untilWe, this._t('we_lbl') + ' ' + this._t('until'), true)}</label></div></div>` : ''}
        </div>`;

      const ci = this._careIndex();
      const careRow = () => {
        const where = ci >= s.steps.length || ci === 0 ? this._t('care_end') : this._t('care_after', { t: s.steps[ci - 1].title });
        return `<li class="care"><span aria-hidden="true">💊</span><span>${esc(this._t('care_row'))} (${esc(where)})</span></li>`;
      };
      const items = [];
      s.steps.forEach((st, i) => {
        if (ci === i) items.push(careRow());
        const badges = [];
        if (parseInt(st.min_age) > 0) badges.push(this._t('badge_age', { n: parseInt(st.min_age) }));
        if (st.requires === 'school') badges.push(this._t('badge_school'));
        items.push(`<li class="step" data-i="${i}">
          <button type="button" class="grip" data-grip="${i}" aria-label="${esc(this._t('move'))}" tabindex="-1">${svg(P.grip, 22)}</button>
          <input class="st" data-k="step" data-i="${i}" type="text" maxlength="100" autocomplete="off" aria-label="${esc(this._t('step_title', { n: i + 1 }))}" value="${esc(st.title)}">
          ${badges.map(b => `<span class="badge">${esc(b)}</span>`).join('')}
          <button type="button" class="ibtn" data-act="step-up" data-v="${i}" aria-label="${esc(this._t('move_up'))}" ${i === 0 ? 'disabled' : ''}>${svg(P.arrowUp, 20)}</button>
          <button type="button" class="ibtn" data-act="step-down" data-v="${i}" aria-label="${esc(this._t('move_down'))}" ${i === s.steps.length - 1 ? 'disabled' : ''}>${svg(P.arrowDown, 20)}</button>
          <button type="button" class="ibtn" data-act="step-del" data-v="${i}" aria-label="${esc(this._t('remove'))}">${svg(P.close, 20)}</button></li>`);
      });
      if (ci !== null && ci >= s.steps.length) items.push(careRow());
      const steps = `
        ${items.length ? `<ul class="steps">${items.join('')}</ul>` : ''}
        <div class="addrow"><input class="fld" data-k="newstep" type="text" maxlength="100" autocomplete="off" enterkeyhint="done" placeholder="${esc(this._t('step_ph'))}" aria-label="${esc(this._t('step_ph'))}" value="${esc(s.newStep)}">
          <button type="button" class="btn" data-act="step-add">${esc(this._t('add'))}</button></div>`;

      const reward = `
        <div class="row"><span class="lbl grow">${esc(this._t('points'))}</span>${this._stepper('pts', s.points, String(s.points), 1, 10, this._t('points'))}</div>
        ${this._switch('approval', s.approval, this._t('approval'), this._t('approval_sub'))}
        ${this._switch('together', s.together, this._t('together'), this._t('together_sub'))}
        ${s.category !== 'basis' ? this._switch('routine', s.routine, this._t('routine')) : ''}`;

      const rules = `
        <div class="stack">
          <div class="row"><span class="lbl grow">${esc(this._t('min_age'))}</span>${this._stepper('age', s.minAge, s.minAge > 0 ? String(s.minAge) : this._t('age_any'), 0, 18, this._t('min_age'))}</div>
          <div><div class="lbl" style="margin-bottom:6px">${esc(this._t('where'))}</div>
            ${this._seg(this._t('where'), [['home', this._t('home')], ['personal', this._t('personal')]], s.scope, 'scope')}
            <p class="help">${esc(this._t('where_sub'))}</p></div>
          ${this._homeworkVisible() ? this._switch('homework', s.afterHw, this._t('homework'), this._t('homework_sub')) : ''}
          <div>${this._switch('remind', s.remindOn, this._t('reminder'))}
            ${s.remindOn ? `<div class="indent times" style="margin-top:4px">
              <label>${esc(this._t('remind_at'))}${this._timeSelect('remindAt', s.remindAt, this._t('remind_at'), false)}</label>
              <label style="flex:1;min-width:160px">${esc(this._t('notify_via'))}<select class="fld" data-k="remindTarget">${this._notifyOptions()}</select></label></div>` : ''}</div>
          ${s.noteOpen ? `<div><label class="lbl" for="fme-desc">${esc(this._t('note_lbl'))}</label><textarea id="fme-desc" class="fld" data-k="desc" maxlength="300" rows="3">${esc(s.desc)}</textarea></div>`
            : `<button type="button" class="linkbtn" data-act="note-open">${esc(this._t('note_add'))}</button>`}
        </div>`;

      return `${head}
        ${this._section('kind', this._t('sec_kind'), kind)}
        ${c.who ? this._section('who', this._t('sec_who'), who) : ''}
        ${this._section('when', this._t('sec_when'), when, true)}
        ${this._section('steps', this._t('sec_steps'), steps)}
        ${this._section('reward', this._t('sec_reward'), reward, true)}
        ${this._section('rules', this._t('sec_rules'), rules, true)}
        ${c.advanced ? this._advancedHtml() : ''}`;
    }

    /**
     * "HH:MM" select in 15-minute steps (a stored value outside the steps stays selectable). A select is used on purpose:
     * the native time picker crashes some browsers (Safari) inside Home Assistant dialogs. Empty = "---" (no limit).
     */
    _timeSelect(k, value, label, allowEmpty) {
      const times = [];
      for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      if (value && !times.includes(value)) { times.push(value); times.sort(); }
      return `<select class="fld" data-k="${k}" aria-label="${esc(label)}">${allowEmpty ? `<option value="" ${value ? '' : 'selected'}>—</option>` : ''}${times.map(t => `<option value="${t}" ${t === value ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
    }

    _notifyOptions() {
      const s = this._s;
      const names = Object.keys((this._hass && this._hass.services && this._hass.services.notify) || {}).filter(n => n !== 'send_message').sort();
      const values = names.map(n => `notify.${n}`);
      if (s.remindTarget && !values.includes(s.remindTarget)) values.push(s.remindTarget);
      return `<option value="" ${s.remindTarget ? '' : 'selected'}>${esc(this._t('event_only'))}</option>` +
        values.map(v => `<option value="${esc(v)}" ${v === s.remindTarget ? 'selected' : ''}>${esc(v)}</option>`).join('');
    }

    _advancedHtml() {
      const s = this._s;
      return `<section class="sec" data-sec="adv">
        <button type="button" class="adv-h" data-act="adv-toggle" aria-expanded="${s.advOpen}"><span>${esc(this._t('advanced'))}</span>${svg(s.advOpen ? P.up : P.down, 22)}</button>
        ${s.advOpen ? `<div class="stack" style="margin-top:8px">
          ${s.mode !== 'once' ? `<div>${this._switch('advDueOn', s.advDueOn, this._t('set_due'))}${s.advDueOn ? `<input class="fld" data-k="advDue" type="date" aria-label="${esc(this._t('set_due'))}" value="${esc(s.advDue)}">` : ''}</div>` : ''}
          <div>${this._switch('overOn', s.overOn, this._t('override_overdue'))}${s.overOn ? `<input class="fld" data-k="overDays" type="number" min="0" max="9999" inputmode="numeric" aria-label="${esc(this._t('override_overdue'))}" value="${esc(s.overDays)}">` : ''}</div>
          <div>${this._switch('pauseOn', s.pauseOn, this._t('pause_until'))}${s.pauseOn ? `<input class="fld" data-k="pauseDate" type="date" aria-label="${esc(this._t('pause_until'))}" value="${esc(s.pauseDate)}">` : ''}</div>
        </div>` : ''}</section>`;
    }

    _templateHtml() {
      const c = this._cfg;
      const list = Array.isArray(c.templates) ? c.templates : [];
      if (!list.length || c.isNew === false) return '';
      return `<div class="tplrow"><label class="lbl" for="fme-tpl">${esc(this._t('from_tpl'))}</label>
        <select id="fme-tpl" class="fld" data-k="tpl"><option value="">${esc(this._t('from_tpl_ph'))}</option>${list.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select>
        <div data-sug>${this._suggestHtml()}</div></div>`;
    }

    _suggestHtml() {
      const list = Array.isArray(this._cfg.templates) ? this._cfg.templates : [];
      const q = this._s.name.trim().toLowerCase();
      const hits = q.length >= 3 ? list.filter(t => String(t.name).toLowerCase().includes(q)).slice(0, 5) : [];
      return hits.map(t => `<button type="button" class="sug" data-act="tpl" data-v="${esc(t.id)}">${esc(this._t('suggest', { name: t.name }))}</button>`).join('');
    }

    // ---- events -------------------------------------------------------------------------------

    _emit(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail: detail || {}, bubbles: true, composed: true }));
    }

    _trySave() {
      const key = this._problemKey();
      if (key) {
        this._s.error = this._t(key);
        if (key !== 'need_name') { this._open.when = true; this._render(); }
        const err = this.shadowRoot.querySelector('.err');
        if (err) { err.textContent = this._s.error; err.hidden = false; }
        const sel = key === 'need_name' ? '[data-k="name"]' : key === 'need_date' ? '[data-k="date"]' : key === 'need_every' ? '[data-k="every"]' : '[data-act="wd"]';
        const el = this.shadowRoot.querySelector(sel);
        if (el) el.focus();
        return false;
      }
      this._emit('fm-editor-save', { value: this._toValue() });
      return true;
    }

    _onClick(ev) {
      const el = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
      if (!el || el.disabled) return;
      const act = el.dataset.act;
      const v = el.dataset.v;
      const s = this._s;
      switch (act) {
        case 'save': this._trySave(); return;
        case 'cancel': this._emit('fm-editor-cancel'); return;
        case 'delete': this._emit('fm-editor-delete'); return;
        case 'icon-toggle': s.iconOpen = !s.iconOpen; if (!s.iconOpen) s.mdiOpen = false; break;
        case 'icon-pick': s.icon = v; s.iconOpen = false; s.mdiOpen = false; break;
        case 'mdi-toggle': s.mdiOpen = !s.mdiOpen; break;
        case 'cat':
          if (this._locked()) return;
          s.category = v; s.together = v !== 'basis';
          break;
        case 'mode':
          s.mode = v;
          if (v === 'every' && !(parseInt(s.every) >= 1)) s.every = 2;
          break;
        case 'wd': { const d = parseInt(v); const i = s.wd.indexOf(d); if (i >= 0) s.wd.splice(i, 1); else s.wd.push(d); s.wd.sort((a, b) => a - b); break; }
        case 'every-': s.every = clamp((parseInt(s.every) || 2) - 1, 1, 365); break;
        case 'every+': s.every = clamp((parseInt(s.every) || 2) + 1, 1, 365); break;
        case 'pts-': s.points = clamp(s.points - 1, 1, 10); break;
        case 'pts+': s.points = clamp(s.points + 1, 1, 10); break;
        case 'age-': s.minAge = clamp(s.minAge - 1, 0, 18); break;
        case 'age+': s.minAge = clamp(s.minAge + 1, 0, 18); break;
        case 'scope': s.scope = v; break;
        case 'clear-window': s.from = ''; s.until = ''; break;
        case 'who': { const i = s.assignees.indexOf(v); if (i >= 0) s.assignees.splice(i, 1); else s.assignees.push(v); break; }
        case 'sec': this._open[v] = !this._open[v]; break;
        case 'adv-toggle': s.advOpen = !s.advOpen; break;
        case 'note-open': s.noteOpen = true; break;
        case 'step-add': this._addStep(); break;
        case 'step-del': s.steps.splice(parseInt(v), 1); break;
        case 'step-up': this._moveStep(parseInt(v), parseInt(v) - 1); break;
        case 'step-down': this._moveStep(parseInt(v), parseInt(v) + 1); break;
        case 'tpl': this._emit('fm-editor-template', { id: v }); return;
        default: return;
      }
      this._render();
      this._live();
    }

    _moveStep(from, to) {
      const a = this._s.steps;
      if (to < 0 || to >= a.length || from === to) return;
      const [x] = a.splice(from, 1);
      a.splice(to, 0, x);
    }

    _addStep() {
      const s = this._s;
      const title = (s.newStep || '').trim().slice(0, 100);
      if (!title || s.steps.length >= 30) return;
      s.steps.push({ title, done: false });
      s.newStep = '';
    }

    _onInput(ev) {
      const el = ev.target;
      const k = el && el.dataset && el.dataset.k;
      if (!k) return;
      const s = this._s;
      switch (k) {
        case 'name': {
          s.name = el.value;
          const sug = this.shadowRoot.querySelector('[data-sug]');
          if (sug) sug.innerHTML = this._suggestHtml();
          break;
        }
        case 'step': { const st = s.steps[parseInt(el.dataset.i)]; if (st) st.title = el.value; return; }
        case 'newstep': s.newStep = el.value; return;
        case 'desc': s.desc = el.value; break;
        case 'every': s.every = el.value === '' ? '' : clamp(parseInt(el.value) || 1, 1, 365); break;
        case 'date': s.date = el.value; s.dateTouched = true; break;
        case 'from': s.from = time(el.value); break;
        case 'until': s.until = time(el.value); break;
        case 'fromWe': s.fromWe = time(el.value); break;
        case 'untilWe': s.untilWe = time(el.value); break;
        case 'remindAt': s.remindAt = time(el.value) || '18:00'; break;
        case 'advDue': s.advDue = el.value; break;
        case 'pauseDate': s.pauseDate = el.value; break;
        case 'overDays': s.overDays = el.value; break;
        default: return;
      }
      this._live();
    }

    _onChange(ev) {
      const el = ev.target;
      const k = el && el.dataset && el.dataset.k;
      if (!k) return;
      const s = this._s;
      let rerender = true;
      switch (k) {
        case 'we': s.weOn = el.checked; if (!el.checked) { s.fromWe = ''; s.untilWe = ''; } break;
        case 'approval': s.approval = el.checked; break;
        case 'together': s.together = el.checked; break;
        case 'routine': s.routine = el.checked; break;
        case 'homework': s.afterHw = el.checked; break;
        case 'remind': s.remindOn = el.checked; if (el.checked && !s.remindAt) s.remindAt = '18:00'; break;
        case 'remindTarget': s.remindTarget = el.value; rerender = false; break;
        case 'rotation': s.rotationOn = el.checked; break;
        case 'advDueOn': s.advDueOn = el.checked; if (el.checked && !s.advDue) s.advDue = new Date().toISOString().split('T')[0]; break;
        case 'pauseOn': s.pauseOn = el.checked; if (el.checked && !s.pauseDate) { const d = new Date(); d.setDate(d.getDate() + 1); s.pauseDate = d.toISOString().split('T')[0]; } if (!el.checked) s.pauseDate = ''; break;
        case 'overOn': s.overOn = el.checked; if (!el.checked) s.overDays = ''; break;
        case 'tpl': if (el.value) this._emit('fm-editor-template', { id: el.value }); return;
        case 'every': if (s.every === '') s.every = 1; rerender = false; break;
        default: return;
      }
      if (rerender) this._render();
      this._live();
    }

    _onKey(ev) {
      const el = ev.target;
      const k = el && el.dataset && el.dataset.k;
      if (ev.key === 'Enter' && k === 'newstep') {
        ev.preventDefault();
        this._addStep();
        this._render();
        this._live();
        const i = this.shadowRoot.querySelector('[data-k="newstep"]');
        if (i) i.focus();
      } else if (ev.key === 'Enter' && k === 'name') {
        ev.preventDefault();
        this._trySave();
      } else if (ev.key === 'Escape' && this._cfg.variant !== 'inline') {
        ev.stopPropagation();
        if (this._s.iconOpen) { this._s.iconOpen = false; this._s.mdiOpen = false; this._render(); }
        else this._emit('fm-editor-cancel');
      }
    }

    // ---- drag and drop of steps (pointer events: mouse, touch and pen) -------------------------

    _onPointerDown(ev) {
      const grip = ev.target && ev.target.closest ? ev.target.closest('[data-grip]') : null;
      if (!grip || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      const list = this.shadowRoot.querySelector('.steps');
      if (!list) return;
      ev.preventDefault();
      const from = parseInt(grip.dataset.grip);
      const items = Array.from(list.querySelectorAll('.step'));
      const item = items[from];
      if (!item) return;
      item.classList.add('dragging');
      let target = from;
      const clear = () => items.forEach(it => it.classList.remove('drop-before', 'drop-after'));
      const move = (e) => {
        clear();
        let idx = items.length - 1;
        for (let i = 0; i < items.length; i++) {
          const r = items[i].getBoundingClientRect();
          if (e.clientY < r.top + r.height / 2) { idx = i; break; }
        }
        target = idx;
        if (target !== from) items[target].classList.add(target < from ? 'drop-before' : 'drop-after');
      };
      const stop = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', stop);
        item.classList.remove('dragging');
        clear();
      };
      const finish = () => {
        stop();
        if (target !== from) { this._moveStep(from, target); this._render(); this._live(); }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', stop);
    }
  }

  customElements.define('family-mission-task-editor', FamilyMissionTaskEditor);
})();
