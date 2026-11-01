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
    family_goal: "Family goal", family_goal_points: "Points per month (all kids together)", family_goal_reward: "Reward", family_goal_reward_ph: "e.g. Ice cream trip", fg_suggest: "Suggestion: {n} (80 % of the kids' monthly goals)", fg_last: "last month: {n} task points", fg_take: "Use {n}",
claim_minutes: "Bonus reservation (minutes)",
    category_lbl: "Category (kids mode)", cat_basis: "Basis (assigned duty)", cat_bonus: "Bonus (open for all)", cat_auftrag: "Order (one-time)",
    min_age_lbl: "Minimum age (0 = any)", min_age_short: "age {age}+", approval_lbl: "Requires parent approval", routine_lbl: "Bonus only after the kid's due duties", together_lbl: "Doing it together allowed",
    available_from_lbl: "Only from (time)", available_until_lbl: "Only until (time)",
    reminder_lbl: "Reminder", reminder_time_lbl: "Remind at", reminder_target_lbl: "Notify via", reminder_event_only: "Event only",
    expire_missed: "Missed duties expire at midnight (daily duties right away, weekly ones after 2 days) - no points, no deduction",
    help_btn: "Help", wizard_btn: "🚀 Kids mode quick start", wizard_hint: "Proposes an age-appropriate set of tasks, points and goals for your kids and creates everything in one click.",
    wizard_missing: "The wizard could not be loaded. Reload the page (Ctrl+F5) and try again.",
    triggers_title: "Bonus triggers", triggers_desc: "Open a bonus task automatically when an entity changes to a state, e.g. when the dishwasher is finished. Fires the event family_mission_bonus_opened.",
    trig_task: "Bonus task", trig_pick_task: "— choose a bonus task —", trig_add: "Add trigger", trig_remove: "Remove trigger", trig_none: "No triggers yet.", trig_no_bonus: "No bonus task yet. Create a task without assignee and category \"Bonus\" (or let the quick start create them).",
    trig_when: "when {entity} becomes \"{state}\"", trig_error: "Could not save the triggers: ",
    pe_title: "We parents", pe_desc: "Optional. Everything here has a sensible default; nothing is required.",
    pe_band: "Show role-model band on the tablet", pe_band_d: "Quiet line on the kids tablet: \"Mom and Dad also have N missions today\" (no points, no names).",
    pe_label: "Wording for the band (optional)", pe_label_ph: "Mom and Dad",
    pe_summary: "Sunday summary", pe_summary_d: "A neutral weekly note to each adult: hours per person and what is still open.", pe_time: "Time",
    pe_reminder: "Planning reminder", pe_reminder_d: "Evening before a 🧠 planning task (e.g. meal plan) is due. No other parent task sends reminders.",
    pe_push: "Push target per adult", pe_push_d: "Automatic uses the person's Companion app.", pe_auto: "Automatic", pe_no_adults: "No adults found.",
    tb_title: "Tablet", tb_desc: "Night mode and rocket launch for the wall tablet. Everything has a sensible default.",
    tb_reward_push: "Push to the parents when a kid wants to redeem a reward",
    tb_approval_push: "Push to the parents when a task waits for approval",
    tb_push_status: "Who gets the push?", tb_push_auto: "✓ Push to {t} (automatic)", tb_push_manual: "✓ Push to {t}",
    tb_push_none: "⚠ No push target - sign in to the Companion app with this user or choose a target here",
    tb_test: "Test push", tb_test_ok: "Test push sent to {t}", tb_test_none: "No push target for this person.", tb_test_fail: "Test push failed: {e}",
    tb_test_hint: "The test uses the saved settings - save first after choosing a target.",
    tb_reminder: "Remind after … hours (0 = off)", tb_reminder_d: "If nobody handled an approval, all adults get one quiet reminder after this time (not at night). 0 switches it off.",
    tb_night: "Night mode (tablet sleeps)", tb_night_d: "At bedtime the tablet shows a dim sleep screen with a sleeping buddy and an alarm clock showing how long it still sleeps. Only the tablet user sleeps, parents keep the normal view. Tapping shows the clock for 5 seconds. An open kid session runs out normally first. No reminders are sent at night.",
    tb_sleep: "Bedtime", tb_wake_wd: "Wake up Mon-Fri", tb_wake_we: "Wake up Sat + Sun",
    tb_rocket: "Rocket countdown (seconds)", tb_rocket_d: "How long the family counts down before the rocket launches (15-180, default 60).",
    ws_title: "Waste collection", ws_desc: "Uses the calendars of the HACS integration \"Waste Collection Schedule\". The evening before a collection a bonus task \"Put the bins out\" opens, on the evening of the collection day one for \"Bring the bins in\".",
    ws_missing: "Waste Collection Schedule was not found. Install it via HACS and set up your collection address - then this section offers the waste types.",
    ws_loading: "Reading the waste calendars …", ws_enabled: "Waste collection bonus on",
    ws_calendars: "Calendars (none ticked = all)", ws_types: "Which bins may the kids handle?", ws_types_none: "No collections found in the next weeks.",
    ws_types_d: "Untick bins that stay with the parents (e.g. glass). New waste types are off until you tick them.",
    ws_min_age: "Minimum age", ws_points: "Points per bin", ws_approval: "Parents approve before points are credited",
    ws_out: "\"Put out\" opens at (evening before)", ws_out_until: "… until (collection day)", ws_in: "\"Bring in\" opens at (collection day)", ws_in_until: "… until",
    ws_next: "Next collections", ws_reload: "Reload",
    an_title: "Voice announcement", an_desc: "Speaks new bonus tasks on speakers, e.g. \"Dad created a bonus task: carry up the shopping. 3 points.\"",
    an_enabled: "Announcements on", an_tts: "Text-to-speech engine", an_tts_none: "No TTS entity found (e.g. Google Translate, Piper, Home Assistant Cloud).",
    an_players: "Speakers", an_players_none: "No media players found.", an_events: "Announce", an_ev_adhoc: "Bonus task created by a parent",
    an_ev_waste: "Waste collection tasks", an_ev_trigger: "Bonus tasks opened by a device trigger", an_night: "Also at night (night mode)",
    an_names: "Spoken name per adult (e.g. \"Dad\")", an_test: "Test announcement", an_test_ok: "Announcement sent.",
    an_test_none: "Choose an engine and at least one speaker.", an_test_fail: "Announcement failed: {e}", an_choose: "- choose -"
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
    family_goal: "Familienziel", family_goal_points: "Punkte pro Monat (alle Kinder zusammen)", family_goal_reward: "Belohnung", family_goal_reward_ph: "z.B. Eis essen gehen", fg_suggest: "Vorschlag: {n} (80 % der Monatsziele der Kinder)", fg_last: "letzter Monat: {n} Aufgabenpunkte", fg_take: "{n} übernehmen",
claim_minutes: "Bonus-Reservierung (Minuten)",
    category_lbl: "Kategorie (Kindermodus)", cat_basis: "Basis (feste Pflicht)", cat_bonus: "Bonus (offen für alle)", cat_auftrag: "Auftrag (einmalig)",
    min_age_lbl: "Mindestalter (0 = egal)", min_age_short: "ab {age}", approval_lbl: "Freigabe durch Eltern nötig", routine_lbl: "Bonus erst nach den fälligen Pflichten", together_lbl: "Zusammen erledigen erlaubt",
    available_from_lbl: "Erst ab (Uhrzeit)", available_until_lbl: "Nur bis (Uhrzeit)",
    reminder_lbl: "Erinnerung", reminder_time_lbl: "Erinnern um", reminder_target_lbl: "Benachrichtigen über", reminder_event_only: "nur Ereignis",
    expire_missed: "Verpasste Pflichten verfallen um Mitternacht (tägliche sofort, wöchentliche nach 2 Tagen) – ohne Punkte, ohne Abzug",
    help_btn: "Hilfe", wizard_btn: "🚀 Kindermodus-Schnellstart", wizard_hint: "Schlägt altersgerechte Aufgaben, Punkte und Ziele für eure Kinder vor und legt alles mit einem Klick an.",
    wizard_missing: "Der Assistent konnte nicht geladen werden. Seite neu laden (Strg+F5) und erneut versuchen.",
    triggers_title: "Bonus-Auslöser / Bonus triggers", triggers_desc: "Öffnet eine Bonus-Aufgabe automatisch, wenn eine Entität einen Zustand annimmt, z.B. wenn die Spülmaschine fertig ist. Löst das Ereignis family_mission_bonus_opened aus.",
    trig_task: "Bonus-Aufgabe", trig_pick_task: "— Bonus-Aufgabe wählen —", trig_add: "Auslöser hinzufügen", trig_remove: "Auslöser entfernen", trig_none: "Noch keine Auslöser.", trig_no_bonus: "Noch keine Bonus-Aufgabe vorhanden. Lege eine Aufgabe ohne Bearbeiter mit Kategorie „Bonus“ an (oder lass sie vom Schnellstart anlegen).",
    trig_when: "wenn {entity} auf \"{state}\" wechselt", trig_error: "Auslöser konnten nicht gespeichert werden: ",
    pe_title: "Wir Eltern", pe_desc: "Optional. Alles hat einen sinnvollen Standard, nichts ist Pflicht.",
    pe_band: "Vorbild-Band auf dem Tablet zeigen", pe_band_d: "Ruhige Zeile auf dem Kinder-Tablet: \"Auch Mama und Papa haben heute N Missionen\" (ohne Punkte, ohne Namen).",
    pe_label: "Wortlaut für das Band (optional)", pe_label_ph: "Mama und Papa",
    pe_summary: "Sonntags-Zusammenfassung", pe_summary_d: "Eine neutrale Wochen-Notiz an jeden Erwachsenen: Stunden pro Person und was noch offen ist.", pe_time: "Uhrzeit",
    pe_reminder: "Planungs-Erinnerung", pe_reminder_d: "Am Vorabend einer 🧠 Planungs-Aufgabe (z. B. Essensplan). Andere Eltern-Aufgaben erinnern nie.",
    pe_push: "Push-Ziel je Erwachsenem", pe_push_d: "Automatisch nutzt die Companion-App der Person.", pe_auto: "Automatisch", pe_no_adults: "Keine Erwachsenen gefunden.",
    tb_title: "Tablet", tb_desc: "Nachtmodus und Raketenstart für das Wand-Tablet. Alles hat einen sinnvollen Standard.",
    tb_reward_push: "Push an die Eltern, wenn ein Kind eine Belohnung einlösen möchte",
    tb_approval_push: "Push an die Eltern, wenn eine Aufgabe auf Freigabe wartet",
    tb_push_status: "Wer bekommt den Push?", tb_push_auto: "✓ Push an {t} (automatisch)", tb_push_manual: "✓ Push an {t}",
    tb_push_none: "⚠ Kein Push-Ziel – Companion-App mit diesem Benutzer anmelden oder unten ein Ziel wählen",
    tb_test: "Test-Push", tb_test_ok: "Test-Push gesendet an {t}", tb_test_none: "Für diese Person gibt es kein Push-Ziel.", tb_test_fail: "Test-Push fehlgeschlagen: {e}",
    tb_test_hint: "Der Test nutzt die gespeicherten Einstellungen – nach der Zielwahl erst speichern.",
    tb_reminder: "Nachfassen nach … Stunden (0 = aus)", tb_reminder_d: "Hat niemand eine Freigabe bearbeitet, erhalten alle Erwachsenen nach dieser Zeit einen leisen Erinnerungs-Push (nicht nachts). 0 schaltet ab.",
    tb_night: "Nachtmodus (Tablet schläft)", tb_night_d: "Zur Schlafenszeit zeigt das Tablet einen gedimmten Schlafbildschirm mit schlafendem Buddy und Wecker, der zeigt, wie lange noch geschlafen wird. Nur der Tablet-Benutzer schläft, Eltern sehen weiter die normale Ansicht. Antippen zeigt 5 Sekunden die Uhr. Eine offene Kind-Sitzung läuft vorher normal aus. Nachts werden keine Erinnerungen gesendet.",
    tb_sleep: "Schlafenszeit", tb_wake_wd: "Aufstehen Mo-Fr", tb_wake_we: "Aufstehen Sa + So",
    tb_rocket: "Raketen-Countdown (Sekunden)", tb_rocket_d: "So lange zählt die Familie herunter, bevor die Rakete startet (15-180, Standard 60).",
    ws_title: "Müllabfuhr", ws_desc: "Nutzt die Kalender der HACS-Integration \"Waste Collection Schedule\". Am Abend vor der Leerung öffnet sich die Bonusaufgabe \"Mülltonnen rausstellen\", am Abend des Leerungstags \"Mülltonnen reinholen\".",
    ws_missing: "Waste Collection Schedule wurde nicht gefunden. Über HACS installieren und die Abholadresse einrichten - danach bietet dieser Bereich die Müllarten an.",
    ws_loading: "Müllkalender werden gelesen …", ws_enabled: "Müll-Bonus einschalten",
    ws_calendars: "Kalender (keiner angehakt = alle)", ws_types: "Welche Tonnen dürfen die Kinder übernehmen?", ws_types_none: "In den nächsten Wochen wurden keine Leerungen gefunden.",
    ws_types_d: "Tonnen, die bei den Eltern bleiben (z.B. Glas), nicht anhaken. Neue Müllarten sind aus, bis ihr sie anhakt.",
    ws_min_age: "Mindestalter", ws_points: "Punkte pro Tonne", ws_approval: "Eltern bestätigen, bevor Punkte gutgeschrieben werden",
    ws_out: "\"Rausstellen\" ab (Vorabend)", ws_out_until: "… bis (Leerungstag)", ws_in: "\"Reinholen\" ab (Leerungstag)", ws_in_until: "… bis",
    ws_next: "Nächste Leerungen", ws_reload: "Neu laden",
    an_title: "Sprachdurchsage", an_desc: "Sagt neue Bonusaufgaben über Lautsprecher an, z.B. \"Papa hat eine Bonusaufgabe erstellt: Einkäufe hochtragen. 3 Punkte.\"",
    an_enabled: "Durchsage einschalten", an_tts: "Sprachausgabe (TTS)", an_tts_none: "Keine TTS-Entität gefunden (z.B. Google Translate, Piper, Home Assistant Cloud).",
    an_players: "Lautsprecher", an_players_none: "Keine Mediaplayer gefunden.", an_events: "Ansagen bei", an_ev_adhoc: "Bonusaufgabe von Eltern erstellt",
    an_ev_waste: "Müll-Aufgaben", an_ev_trigger: "Bonusaufgabe durch Gerätetrigger geöffnet", an_night: "Auch nachts (Nachtmodus)",
    an_names: "Gesprochener Name je Erwachsenem (z.B. \"Papa\")", an_test: "Test-Durchsage", an_test_ok: "Durchsage gesendet.",
    an_test_none: "Sprachausgabe und mindestens einen Lautsprecher wählen.", an_test_fail: "Durchsage fehlgeschlagen: {e}", an_choose: "- wählen -"
  }
};

/**
 * Register card in the Home Assistant Card Picker.
 */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "family-mission-settings",
  name: "FamilyMission Settings",
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

class FamilyMissionSettings extends HTMLElement {
  /**
   * Initializes the FamilyMissionSettings element.
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
    this._peOpen = false;
    this._tbOpen = false;
    this._wsOpen = false;
    this._anOpen = false;
    this._wasteSrc = null;
    this._adults = [];
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
    return FamilyMissionSettings._localize(this._hass, key);
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
      type: "custom:family-mission-settings", 
      title: this._localize(hass, 'title'),
      show_advanced: false 
    }; 
  }

  /**
   * Returns the editor element for GUI configuration.
   * @returns {HTMLElement}
   */
  static getConfigElement() {
    return document.createElement("family-mission-settings-editor");
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
    }, "family_mission_updated"); 
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
            users[FamilyMissionSettings.participantId(entityId, state)] = state.attributes.friendly_name || entityId;
        }
    }
    this.users = users;
  }

  /** Small footer with the app icon and the installed version (version from the backend manifest). */
  _renderFooter() {
    if (!this._version) return '';
    const ico = window.FamilyMissionBrand ? window.FamilyMissionBrand.iconSvg(16) : '';
    return `<div class="fm-footer">${ico}<span>FamilyMission ${this._version}</span></div>`;
  }

  /**
   * Fetches the current settings and tasks from the backend.
   */
  _fetchData() { 
    this._hass.callWS({ type: 'family_mission/get_data' }).then((data) => { 
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
      this._version = data.version || '';
      this._haUsers = Array.isArray(data.ha_users) ? data.ha_users : [];
      this._adults = Array.isArray(data.adults) ? data.adults : [];
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
      calls.push({ type: 'family_mission/set_parents', parents: [...st.parents], parents_manage: [...st.manage] });
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
            type: 'family_mission/set_kid_profile',
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
        calls.push({ type: 'family_mission/delete_kid_profile', participant_id: uid });
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
    
    this._hass.callWS({ type: 'family_mission/update_settings', settings: newSettings }).then(() => { 
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
      this._hass.callService('family_mission', 'reset_monthly_points', {}).then(() => { 
        this._fetchData(); 
      }); 
    } 
  }

  /**
   * Triggers a full factory reset of the integration.
   */
  _factoryReset() { 
    if (confirm(this.localize('confirm_factory'))) { 
      this._hass.callWS({ type: 'family_mission/factory_reset' }).then(() => { 
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
    else if (id === 'pe-toggle') { this._peOpen = !this._peOpen; this._render(); }
    else if (id === 'tb-toggle') { this._tbOpen = !this._tbOpen; this._render(); }
    else if (id === 'ws-toggle') { this._wsOpen = !this._wsOpen; if (this._wsOpen && !this._wasteSrc) this._loadWasteSources(); this._render(); }
    else if (id === 'ws-reload') this._loadWasteSources();
    else if (id === 'an-toggle') { this._anOpen = !this._anOpen; this._render(); }
    else if (id === 'trig-toggle') { this._trigOpen = !this._trigOpen; this._render(); }
    else if (id === 'btn-wizard-open') this._openWizard();
    else if (id === 'btn-help-open') { if (window.FamilyMissionHelp) window.FamilyMissionHelp.open(this._hass, 'setup'); }
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

    const type = this._editingTemplateId ? 'family_mission/edit_template' : 'family_mission/add_template';
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
      this._hass.callWS({ type: 'family_mission/delete_template', template_id: id })
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
    downloadAnchorNode.setAttribute("download", "family_mission_export.json");
    
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
        
        let payload = { type: 'family_mission/import_tasks' };
        
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
        .fm-footer { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 16px; font-size: 12px; color: var(--secondary-text-color); opacity: 0.7; }
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
        .btn-fg-take { margin-left: 6px; padding: 4px 10px; border-radius: 14px; border: 1px solid var(--primary-color, #03a9f4); background: transparent; color: var(--primary-color, #03a9f4); font-size: 13px; cursor: pointer; }
        .kid-row { border: 1px solid var(--divider-color); border-left-width: 6px; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: var(--card-background-color); }
        .kid-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 500; font-size: 14px; color: var(--primary-text-color); }
        .kid-head .kid-avatar-preview { font-size: 24px; margin-right: 8px; }
        .kid-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; align-items: end; }
        .kid-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--secondary-text-color); }
        .kid-field input[type="text"], .kid-field input[type="password"], .kid-field input[type="number"], .kid-field input[type="time"] { width: 100%; height: 36px; padding: 4px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--primary-background-color); color: var(--primary-text-color); font-size: 14px; text-align: left; }
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
   * Suggestion for the family goal: 80 % of the kids' monthly goals (rounded to 10, like the
   * quick-start wizard) and the task points all kids reached last month (what the rocket counts).
   * @returns {{suggest: number|null, last: number|null}}
   */
  _familySuggestion() {
    const kidIds = Object.keys(this.users || {}).filter(uid => this._kidDraft(uid).enabled);
    const total = kidIds.reduce((sum, uid) => sum + (parseFloat(this._goalValue(uid)) || 0), 0);
    const suggest = total > 0 ? Math.max(10, Math.round(total * 0.8 / 10) * 10) : null;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 1);
    let last = 0;
    let seen = false;
    for (const h of this.history || []) {
      if (!h || h.type !== 'task' || !kidIds.includes(h.user_id)) continue;
      const t = new Date(h.timestamp);
      if (isNaN(t.getTime()) || t < from || t >= to) continue;
      last += parseFloat(h.points) || 0;
      seen = true;
    }
    return { suggest, last: seen ? Math.round(last) : null };
  }

  /** HTML of the suggestion line below the family goal points (empty without data). */
  _familySuggestionHtml() {
    const { suggest, last } = this._familySuggestion();
    const parts = [];
    if (suggest !== null) parts.push(this.localize('fg_suggest').replace('{n}', suggest));
    if (last !== null) parts.push(this.localize('fg_last').replace('{n}', last));
    if (!parts.length) return '';
    const take = suggest !== null ? suggest : last;
    return `<span>${parts.join(' · ')}</span> <button type="button" class="btn-fg-take" id="fg-take" data-val="${take}" ${this._canManage() ? '' : 'disabled'}>${this.localize('fg_take').replace('{n}', take)}</button>`;
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
            ${window.FamilyMissionHelp ? `<button class="btn btn-help" id="btn-help-open">❓ ${this.localize('help_btn')}</button>` : ''}
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
                <p class="kids-note fg-suggest" id="fg-suggest" style="grid-column:1 / -1">${this._familySuggestionHtml()}</p>
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
   * family-mission-wizard.js, which the integration registers as a resource;
   * the dynamic import is the fallback for manually managed resources.
   * @returns {Promise<boolean>} - True when the elements are available.
   */
  async _ensureWizardLoaded() {
    if (customElements.get('family-mission-wizard')) return true;
    try {
      await import('/family_mission_frontend/family-mission-wizard.js');
    } catch (err) {
      console.warn('FamilyMission: wizard could not be loaded', err);
    }
    return !!customElements.get('family-mission-wizard');
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
    const wizard = document.createElement('family-mission-wizard');
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
                <family-mission-trigger-picker id="trig-picker"></family-mission-trigger-picker>
                <button class="btn btn-save" id="btn-trig-add" style="margin-top: 0;" ${d.task && d.entity_id && d.to_state ? '' : 'disabled'}>${this.localize('trig_add')}</button>
              </div>` : ''}
          </div>
        </div>`;
  }

  /** Notify services (notify.xyz) offered as push targets; the current value is always included. */
  _notifyTargets(current) {
    const svc = (this._hass && this._hass.services && this._hass.services.notify) || {};
    const list = Object.keys(svc).filter(n => n !== 'send_message').map(n => `notify.${n}`);
    if (current && !list.includes(current)) list.push(current);
    return list.sort();
  }

  /**
   * Renders the "We parents" section: role-model band, Sunday summary,
   * planning reminder and the optional push target per adult.
   * @returns {string} - The HTML.
   */
  _renderParentsCentralSection() {
    const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const st = this.settings || {};
    const notify = st.parent_notify || {};
    const time = (v, def) => (/^\d{2}:\d{2}$/.test(v || '') ? v : def);
    const adults = (this._adults || []).map(a => `
      <label class="kid-field">${esc(a.name)}
        <select class="form-select pe-push" data-uid="${esc(a.id)}" style="height: 36px; font-size: 14px;">
          <option value="">${this.localize('pe_auto')}</option>
          ${this._notifyTargets(notify[a.id]).map(n => `<option value="${esc(n)}" ${notify[a.id] === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}
        </select>
      </label>`).join('');
    return `
        <div class="section-card">
          <div class="section-header" id="pe-toggle">
            <div class="section-title">
              <ha-icon icon="${this._peOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('pe_title')}</span>
            </div>
          </div>
          <div class="section-content ${this._peOpen ? 'open' : ''}" id="pe-content">
            <p class="kids-note">${this.localize('pe_desc')}</p>
            <div class="family-box">
              <label class="parent-check"><input type="checkbox" id="pe-band" ${st.role_model_band !== false ? 'checked' : ''}> ${this.localize('pe_band')}</label>
              <p class="kids-note">${this.localize('pe_band_d')}</p>
              <label class="kid-field">${this.localize('pe_label')}
                <input type="text" id="pe-label" maxlength="40" placeholder="${esc(this.localize('pe_label_ph'))}" value="${esc(st.role_model_label || '')}"></label>
            </div>
            <div class="family-box">
              <label class="parent-check"><input type="checkbox" id="pe-summary" ${st.weekly_summary !== false ? 'checked' : ''}> ${this.localize('pe_summary')}</label>
              <p class="kids-note">${this.localize('pe_summary_d')}</p>
              <label class="kid-field">${this.localize('pe_time')}
                <input type="time" id="pe-summary-time" value="${time(st.weekly_summary_time, '19:00')}"></label>
            </div>
            <div class="family-box">
              <label class="parent-check"><input type="checkbox" id="pe-reminder" ${st.planning_reminders !== false ? 'checked' : ''}> ${this.localize('pe_reminder')}</label>
              <p class="kids-note">${this.localize('pe_reminder_d')}</p>
              <label class="kid-field">${this.localize('pe_time')}
                <input type="time" id="pe-reminder-time" value="${time(st.planning_reminder_time, '18:00')}"></label>
            </div>
            <div class="family-box">
              <h4>${this.localize('pe_push')}</h4>
              <p class="kids-note">${this.localize('pe_push_d')}</p>
              ${adults || `<p class="kids-note">${this.localize('pe_no_adults')}</p>`}
            </div>
          </div>
        </div>`;
  }

  /** Keeps the "We parents" inputs in this.settings (saved with the normal save button). */
  _bindParentsCentralInputs() {
    const root = this.shadowRoot;
    const box = root.getElementById('pe-content');
    if (!box) return;
    const sync = () => {
      const val = (id) => root.getElementById(id);
      const time = (id, def) => (/^\d{2}:\d{2}$/.test(val(id).value) ? val(id).value : def);
      this.settings.role_model_band = !!val('pe-band').checked;
      this.settings.role_model_label = val('pe-label').value.trim();
      this.settings.weekly_summary = !!val('pe-summary').checked;
      this.settings.weekly_summary_time = time('pe-summary-time', '19:00');
      this.settings.planning_reminders = !!val('pe-reminder').checked;
      this.settings.planning_reminder_time = time('pe-reminder-time', '18:00');
      const notify = {};
      root.querySelectorAll('.pe-push').forEach(el => { if (el.value) notify[el.dataset.uid] = el.value; });
      this.settings.parent_notify = notify;
      root.querySelectorAll('.tb-push').forEach(el => { el.value = notify[el.dataset.uid] || ''; });
    };
    box.addEventListener('input', sync);
    box.addEventListener('change', sync);
  }

  /**
   * Renders the "Tablet" section: night mode (bedtime, wake-up times) and the
   * rocket countdown length. Saved with the normal save button.
   * @returns {string} - The HTML.
   */
  _renderTabletSection() {
    const st = this.settings || {};
    const valid = (v, def) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(v || '') ? v : def);
    // 15 minute steps; a stored value that is not on the grid stays selectable
    const timeSelect = (id, value) => {
      const opts = [];
      for (let m = 0; m < 1440; m += 15) {
        opts.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
      }
      if (!opts.includes(value)) { opts.push(value); opts.sort(); }
      return `<select class="form-select" id="${id}" style="height: 36px; font-size: 14px;">${opts.map(o => `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
    };
    const countdown = Math.max(15, Math.min(180, parseInt(st.rocket_countdown) || 60));
    const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const hours = st.approval_reminder_hours === undefined ? 2 : Math.max(0, Math.min(24, parseInt(st.approval_reminder_hours) || 0));
    const notify = st.parent_notify || {};
    const rows = (this._adults || []).map(a => {
      const manual = notify[a.id];
      const targets = manual ? [manual] : (a.push_targets || []);
      const text = targets.length
        ? this.localize(manual ? 'tb_push_manual' : 'tb_push_auto').replace('{t}', targets.join(', '))
        : this.localize('tb_push_none');
      return `<div class="tb-push-row" data-uid="${esc(a.id)}" style="margin:6px 0">
        <div><strong>${esc(a.name)}</strong>: <span class="tb-push-text" style="${targets.length ? '' : 'color: var(--warning-color, #b26a00);'}">${esc(text)}</span></div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:4px">
          <select class="form-select tb-push" data-uid="${esc(a.id)}" style="height: 36px; font-size: 14px;">
            <option value="">${this.localize('pe_auto')}</option>
            ${this._notifyTargets(manual).map(n => `<option value="${esc(n)}" ${manual === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}
          </select>
          <button type="button" class="tb-test-push" data-uid="${esc(a.id)}">${this.localize('tb_test')}</button>
          <span class="tb-test-result kids-note"></span>
        </div></div>`;
    }).join('');
    return `
        <div class="section-card">
          <div class="section-header" id="tb-toggle">
            <div class="section-title">
              <ha-icon icon="${this._tbOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('tb_title')}</span>
            </div>
          </div>
          <div class="section-content ${this._tbOpen ? 'open' : ''}" id="tb-content">
            <p class="kids-note">${this.localize('tb_desc')}</p>
            <div class="family-box">
              <label class="parent-check"><input type="checkbox" id="tb-night" ${st.night_mode !== false ? 'checked' : ''}> ${this.localize('tb_night')}</label>
              <p class="kids-note">${this.localize('tb_night_d')}</p>
              <div class="kid-fields">
                <label class="kid-field">${this.localize('tb_sleep')}${timeSelect('tb-sleep', valid(st.night_sleep, '20:30'))}</label>
                <label class="kid-field">${this.localize('tb_wake_wd')}${timeSelect('tb-wake-wd', valid(st.night_wake_weekday, '06:00'))}</label>
                <label class="kid-field">${this.localize('tb_wake_we')}${timeSelect('tb-wake-we', valid(st.night_wake_weekend, '08:00'))}</label>
              </div>
            </div>
            <div class="family-box">
              <label class="kid-field">${this.localize('tb_rocket')}
                <input type="number" id="tb-rocket" min="15" max="180" step="5" value="${countdown}"></label>
              <p class="kids-note">${this.localize('tb_rocket_d')}</p>
            </div>
            <div class="family-box">
              <label class="parent-check"><input type="checkbox" id="tb-reward-push" ${st.reward_push !== false ? 'checked' : ''}> ${this.localize('tb_reward_push')}</label>
              <label class="parent-check"><input type="checkbox" id="tb-approval-push" ${st.approval_push !== false ? 'checked' : ''}> ${this.localize('tb_approval_push')}</label>
              <h4>${this.localize('tb_push_status')}</h4>
              ${rows || `<p class="kids-note">${this.localize('pe_no_adults')}</p>`}
              <p class="kids-note">${this.localize('tb_test_hint')}</p>
              <label class="kid-field">${this.localize('tb_reminder')}
                <input type="number" id="tb-reminder-hours" min="0" max="24" step="1" value="${hours}"></label>
              <p class="kids-note">${this.localize('tb_reminder_d')}</p>
            </div>
          </div>
        </div>`;
  }

  /** 15 minute time select; a stored value that is not on the grid stays selectable. */
  _timeSel(id, value) {
    const opts = [];
    for (let m = 0; m < 1440; m += 15) {
      opts.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    if (!opts.includes(value)) { opts.push(value); opts.sort(); }
    return `<select class="form-select" id="${id}" style="height: 36px; font-size: 14px;">${opts.map(o => `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  }

  /** Reads the calendars / waste types of Waste Collection Schedule for the waste section. */
  async _loadWasteSources() {
    this._wasteSrc = { loading: true };
    this._render();
    try {
      this._wasteSrc = await this._hass.callWS({ type: 'family_mission/waste_sources' });
    } catch (err) {
      this._wasteSrc = { available: false, calendars: [], types: [], upcoming: [], error: (err && err.message) || String(err) };
    }
    this._render();
  }

  /**
   * Renders the "Waste collection" section (calendars of Waste Collection Schedule).
   * Saved with the normal save button.
   * @returns {string} - The HTML.
   */
  _renderWasteSection() {
    const st = this.settings || {};
    const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const valid = (v, def) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(v || '') ? v : def);
    const src = this._wasteSrc;
    let body;
    if (!src || src.loading) {
      body = `<p class="kids-note">${this.localize('ws_loading')}</p>`;
    } else if (!src.available) {
      body = `<p class="kids-note" style="color: var(--warning-color, #b26a00);">${this.localize('ws_missing')}</p>`;
    } else {
      const chosen = Array.isArray(st.waste_calendars) ? st.waste_calendars : [];
      const types = (st.waste_types && typeof st.waste_types === 'object') ? st.waste_types : {};
      const cals = src.calendars.length > 1 ? `
              <h4>${this.localize('ws_calendars')}</h4>
              ${src.calendars.map(c => `<label class="parent-check"><input type="checkbox" class="ws-cal" value="${esc(c.entity_id)}" ${chosen.includes(c.entity_id) ? 'checked' : ''}> ${esc(c.name)}</label>`).join('')}` : '';
      const typeRows = src.types.length
        ? src.types.map(t => `<label class="parent-check"><input type="checkbox" class="ws-type" value="${esc(t)}" ${types[t] && types[t].kids === true ? 'checked' : ''}> ${esc(t)}</label>`).join('')
        : `<p class="kids-note">${this.localize('ws_types_none')}</p>`;
      const next = (src.upcoming || []).map(u => `<li>${esc(u.date)}: ${esc(u.types.join(', '))}</li>`).join('');
      const minAge = Math.max(0, Math.min(18, parseInt(st.waste_min_age ?? 6)));
      const pts = Math.max(1, Math.min(5, parseInt(st.waste_points_per_bin) || 1));
      body = `
            <div class="family-box">
              <label class="parent-check"><input type="checkbox" id="ws-enabled" ${st.waste_enabled === true ? 'checked' : ''}> ${this.localize('ws_enabled')}</label>
              ${cals}
              <h4>${this.localize('ws_types')}</h4>
              ${typeRows}
              <p class="kids-note">${this.localize('ws_types_d')}</p>
              ${next ? `<h4>${this.localize('ws_next')}</h4><ul class="kids-note" style="margin:0; padding-left:18px">${next}</ul>` : ''}
              <button type="button" id="ws-reload">${this.localize('ws_reload')}</button>
            </div>
            <div class="family-box">
              <div class="kid-fields">
                <label class="kid-field">${this.localize('ws_min_age')}
                  <input type="number" id="ws-min-age" min="0" max="18" step="1" value="${isNaN(minAge) ? 6 : minAge}"></label>
                <label class="kid-field">${this.localize('ws_points')}
                  <input type="number" id="ws-points" min="1" max="5" step="1" value="${pts}"></label>
              </div>
              <label class="parent-check"><input type="checkbox" id="ws-approval" ${st.waste_approval !== false ? 'checked' : ''}> ${this.localize('ws_approval')}</label>
              <div class="kid-fields">
                <label class="kid-field">${this.localize('ws_out')}${this._timeSel('ws-out', valid(st.waste_out_time, '17:00'))}</label>
                <label class="kid-field">${this.localize('ws_out_until')}${this._timeSel('ws-out-until', valid(st.waste_out_until, '07:00'))}</label>
                <label class="kid-field">${this.localize('ws_in')}${this._timeSel('ws-in', valid(st.waste_in_time, '16:00'))}</label>
                <label class="kid-field">${this.localize('ws_in_until')}${this._timeSel('ws-in-until', valid(st.waste_in_until, '21:00'))}</label>
              </div>
            </div>`;
    }
    return `
        <div class="section-card">
          <div class="section-header" id="ws-toggle">
            <div class="section-title">
              <ha-icon icon="${this._wsOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('ws_title')}</span>
            </div>
          </div>
          <div class="section-content ${this._wsOpen ? 'open' : ''}" id="ws-content">
            <p class="kids-note">${this.localize('ws_desc')}</p>
            ${body}
          </div>
        </div>`;
  }

  /** Keeps the "Waste collection" inputs in this.settings (saved with the normal save button). */
  _bindWasteInputs() {
    const root = this.shadowRoot;
    const box = root.getElementById('ws-content');
    if (!box || !root.getElementById('ws-enabled')) return;
    const sync = () => {
      const val = (id) => root.getElementById(id);
      this.settings.waste_enabled = !!val('ws-enabled').checked;
      this.settings.waste_calendars = [...box.querySelectorAll('.ws-cal')].filter(el => el.checked).map(el => el.value);
      const types = {};
      box.querySelectorAll('.ws-type').forEach(el => { types[el.value] = { kids: !!el.checked }; });
      this.settings.waste_types = types;
      const age = parseInt(val('ws-min-age').value);
      this.settings.waste_min_age = Math.max(0, Math.min(18, isNaN(age) ? 6 : age));
      const pts = parseInt(val('ws-points').value);
      this.settings.waste_points_per_bin = Math.max(1, Math.min(5, isNaN(pts) ? 1 : pts));
      this.settings.waste_approval = !!val('ws-approval').checked;
      this.settings.waste_out_time = val('ws-out').value;
      this.settings.waste_out_until = val('ws-out-until').value;
      this.settings.waste_in_time = val('ws-in').value;
      this.settings.waste_in_until = val('ws-in-until').value;
    };
    box.addEventListener('input', sync);
    box.addEventListener('change', sync);
  }

  /**
   * Renders the "Voice announcement" section (tts.speak on media players).
   * Saved with the normal save button.
   * @returns {string} - The HTML.
   */
  _renderAnnounceSection() {
    const st = this.settings || {};
    const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const states = (this._hass && this._hass.states) || {};
    const label = (id) => (states[id] && states[id].attributes && states[id].attributes.friendly_name) || id;
    const ttsList = Object.keys(states).filter(id => id.startsWith('tts.')).sort();
    if (st.announce_tts && !ttsList.includes(st.announce_tts)) ttsList.push(st.announce_tts);
    const players = Object.keys(states).filter(id => id.startsWith('media_player.')).sort();
    const chosen = Array.isArray(st.announce_players) ? st.announce_players : [];
    chosen.forEach(p => { if (!players.includes(p)) players.push(p); });
    const events = Array.isArray(st.announce_events) ? st.announce_events : ['adhoc', 'waste', 'trigger'];
    const names = (st.announce_names && typeof st.announce_names === 'object') ? st.announce_names : {};
    const nameRows = (this._adults || []).map(a => `
              <label class="kid-field">${esc(a.name)}
                <input type="text" class="an-name" data-uid="${esc(a.id)}" maxlength="30" placeholder="${esc(a.name)}" value="${esc(names[a.id] || '')}"></label>`).join('');
    return `
        <div class="section-card">
          <div class="section-header" id="an-toggle">
            <div class="section-title">
              <ha-icon icon="${this._anOpen ? 'mdi:chevron-up' : 'mdi:chevron-right'}"></ha-icon>
              <span>${this.localize('an_title')}</span>
            </div>
          </div>
          <div class="section-content ${this._anOpen ? 'open' : ''}" id="an-content">
            <p class="kids-note">${this.localize('an_desc')}</p>
            <div class="family-box">
              <label class="parent-check"><input type="checkbox" id="an-enabled" ${st.announce_enabled === true ? 'checked' : ''}> ${this.localize('an_enabled')}</label>
              <label class="kid-field">${this.localize('an_tts')}
                <select class="form-select" id="an-tts" style="height: 36px; font-size: 14px;">
                  <option value="">${this.localize('an_choose')}</option>
                  ${ttsList.map(id => `<option value="${esc(id)}" ${st.announce_tts === id ? 'selected' : ''}>${esc(label(id))}</option>`).join('')}
                </select></label>
              ${ttsList.length ? '' : `<p class="kids-note">${this.localize('an_tts_none')}</p>`}
              <h4>${this.localize('an_players')}</h4>
              ${players.length
                ? players.map(id => `<label class="parent-check"><input type="checkbox" class="an-player" value="${esc(id)}" ${chosen.includes(id) ? 'checked' : ''}> ${esc(label(id))}</label>`).join('')
                : `<p class="kids-note">${this.localize('an_players_none')}</p>`}
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:6px">
                <button type="button" id="an-test">${this.localize('an_test')}</button>
                <span id="an-test-result" class="kids-note"></span>
              </div>
            </div>
            <div class="family-box">
              <h4>${this.localize('an_events')}</h4>
              ${['adhoc', 'waste', 'trigger'].map(k => `<label class="parent-check"><input type="checkbox" class="an-event" value="${k}" ${events.includes(k) ? 'checked' : ''}> ${this.localize('an_ev_' + k)}</label>`).join('')}
              <label class="parent-check"><input type="checkbox" id="an-night" ${st.announce_night === true ? 'checked' : ''}> ${this.localize('an_night')}</label>
            </div>
            ${nameRows ? `<div class="family-box"><h4>${this.localize('an_names')}</h4><div class="kid-fields">${nameRows}</div></div>` : ''}
          </div>
        </div>`;
  }

  /** Keeps the "Voice announcement" inputs in this.settings; the test uses the unsaved choice. */
  _bindAnnounceInputs() {
    const root = this.shadowRoot;
    const box = root.getElementById('an-content');
    if (!box) return;
    const sync = () => {
      this.settings.announce_enabled = !!root.getElementById('an-enabled').checked;
      this.settings.announce_tts = root.getElementById('an-tts').value;
      this.settings.announce_players = [...box.querySelectorAll('.an-player')].filter(el => el.checked).map(el => el.value);
      this.settings.announce_events = [...box.querySelectorAll('.an-event')].filter(el => el.checked).map(el => el.value);
      this.settings.announce_night = !!root.getElementById('an-night').checked;
      const names = {};
      box.querySelectorAll('.an-name').forEach(el => { if (el.value.trim()) names[el.dataset.uid] = el.value.trim(); });
      this.settings.announce_names = names;
    };
    box.addEventListener('input', sync);
    box.addEventListener('change', sync);
    const btn = root.getElementById('an-test');
    if (btn) btn.addEventListener('click', async () => {
      const out = root.getElementById('an-test-result');
      const tts = root.getElementById('an-tts').value;
      const players = [...box.querySelectorAll('.an-player')].filter(el => el.checked).map(el => el.value);
      let msg;
      try {
        const res = await this._hass.callWS({ type: 'family_mission/test_announce', tts, players });
        if (res && res.success) msg = this.localize('an_test_ok');
        else if (res && res.error === 'not_configured') msg = this.localize('an_test_none');
        else msg = this.localize('an_test_fail').replace('{e}', (res && res.error) || '?');
      } catch (err) {
        msg = this.localize('an_test_fail').replace('{e}', (err && err.message) || String(err));
      }
      if (out) out.textContent = msg;
      this._showToast(msg);
    });
  }

  /** Keeps the "Tablet" inputs in this.settings (saved with the normal save button). */
  _bindTabletInputs() {
    const root = this.shadowRoot;
    const box = root.getElementById('tb-content');
    if (!box) return;
    const sync = () => {
      const val = (id) => root.getElementById(id);
      this.settings.night_mode = !!val('tb-night').checked;
      this.settings.reward_push = !!val('tb-reward-push').checked;
      this.settings.approval_push = !!val('tb-approval-push').checked;
      this.settings.night_sleep = val('tb-sleep').value;
      this.settings.night_wake_weekday = val('tb-wake-wd').value;
      this.settings.night_wake_weekend = val('tb-wake-we').value;
      const n = parseInt(val('tb-rocket').value);
      this.settings.rocket_countdown = Math.max(15, Math.min(180, isNaN(n) ? 60 : n));
      const h = parseInt(val('tb-reminder-hours').value);
      this.settings.approval_reminder_hours = Math.max(0, Math.min(24, isNaN(h) ? 2 : h));
      const notify = {};
      root.querySelectorAll('.tb-push').forEach(el => { if (el.value) notify[el.dataset.uid] = el.value; });
      this.settings.parent_notify = notify;
      // keep the select of the "We parents" section in step
      root.querySelectorAll('.pe-push').forEach(el => { el.value = notify[el.dataset.uid] || ''; });
    };
    box.addEventListener('input', sync);
    box.addEventListener('change', sync);
    box.querySelectorAll('.tb-test-push').forEach(btn => btn.addEventListener('click', async () => {
      const out = btn.parentElement.querySelector('.tb-test-result');
      let msg;
      try {
        const res = await this._hass.callWS({ type: 'family_mission/test_push', user_id: btn.dataset.uid });
        if (res && res.success) msg = this.localize('tb_test_ok').replace('{t}', (res.targets || []).join(', '));
        else if (res && res.error === 'no_target') msg = this.localize('tb_test_none');
        else msg = this.localize('tb_test_fail').replace('{e}', ((res && res.errors) || []).join('; '));
      } catch (err) {
        msg = this.localize('tb_test_fail').replace('{e}', (err && err.message) || String(err));
      }
      if (out) out.textContent = msg;
      this._showToast(msg);
    }));
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
      await this._hass.callWS({ type: 'family_mission/set_bonus_triggers', triggers });
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
    const bindTake = () => {
      const take = root.getElementById('fg-take');
      if (take) take.addEventListener('click', () => {
        const input = root.getElementById('fg-points');
        if (input) input.value = take.dataset.val;
        this._familyDraft.points = take.dataset.val;
      });
    };
    bindTake();
    // Keep the suggestion in line with the monthly goals typed above
    root.querySelectorAll('.user-goal-input').forEach(el => el.addEventListener('input', () => {
      const box = root.getElementById('fg-suggest');
      if (box) { box.innerHTML = this._familySuggestionHtml(); bindTake(); }
    }));
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

        ${this._renderParentsCentralSection()}

        ${this._renderTabletSection()}

        ${this._canManage() ? this._renderWasteSection() : ''}

        ${this._canManage() ? this._renderAnnounceSection() : ''}

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

        ${this._renderFooter()}
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
    this._bindParentsCentralInputs();
    this._bindTabletInputs();
    this._bindWasteInputs();
    this._bindAnnounceInputs();

    if (this._templateModalOpen) {
      const iconPicker = this.shadowRoot.getElementById('tmpl-icon');
      if(iconPicker) iconPicker.hass = this._hass;

      const areaPicker = this.shadowRoot.getElementById('tmpl-area');
      if(areaPicker) areaPicker.hass = this._hass;
    }
  }
}

/**
 * Editor for FamilyMissionSettings.
 */
class FamilyMissionSettingsEditor extends HTMLElement {
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
    return FamilyMissionSettings._localize(this._hass, key);
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

customElements.define('family-mission-settings-editor', FamilyMissionSettingsEditor);
customElements.define('family-mission-settings', FamilyMissionSettings);