/**
 * Configuration for translations.
 */
const I18N_PROTOCOL = { 
  en: {
    title: "Household Protocol", empty: "No entries.", unknown: "Unknown",
    confirm_delete: "Really delete this entry?", edit: "Edit", points: "Points",
    user: "Assignee", cancel: "Cancel", save: "Save",
    prev: "Previous", next: "Next", page: "Page",
    edit_hover: "Edit entry", delete_hover: "Delete entry",
    entry_saved: "Entry saved!", entry_deleted: "Entry deleted!",
    height_lbl: "Height", width_lbl: "Width", title_lbl: "Title",
    items_per_page_lbl: "Items per Page", filter_by_lbl: "Filter By",
    type_task: "Task", type_bonus: "Bonus", type_penalty: "Deduction", type_birthday: "Birthday", type_missed: "Missed", type_skipped: "Skipped", type_redeem: "Reward", type_refund: "Refund", type_praise: "Praise",
    undo: "Undo", undo_hover: "Undo completion", confirm_undo: "Points are deducted, the task is open again - without a penalty.", entry_undone: "Entry undone!"
  },
  de: { 
    title: "Haushaltsprotokoll", empty: "Keine Einträge.", unknown: "Unbekannt", 
    confirm_delete: "Eintrag wirklich löschen?", edit: "Korrigieren", points: "Punkte", 
    user: "Bearbeiter", cancel: "Abbrechen", save: "Speichern",
    prev: "Zurück", next: "Weiter", page: "Seite",
    edit_hover: "Eintrag bearbeiten", delete_hover: "Eintrag löschen",
    entry_saved: "Eintrag gespeichert!", entry_deleted: "Eintrag gelöscht!",
    height_lbl: "Höhe", width_lbl: "Breite", title_lbl: "Titel",
    items_per_page_lbl: "Einträge pro Seite", filter_by_lbl: "Filtern nach",
    type_task: "Aufgabe", type_bonus: "Bonus", type_penalty: "Abzug", type_birthday: "Geburtstag", type_missed: "Verpasst", type_skipped: "Ausgesetzt", type_redeem: "Belohnung", type_refund: "Erstattung", type_praise: "Lob",
    undo: "Rückgängig", undo_hover: "Erledigung rückgängig machen", confirm_undo: "Punkte werden abgezogen, Aufgabe ist wieder offen – ohne Abzug.", entry_undone: "Eintrag rückgängig gemacht!"
  }
};

/** Icons of the history entry types (legacy entries without a type are tasks). */
const PROTOCOL_TYPE_ICONS = { task: '✅', bonus: '⭐', penalty: '⚠️', birthday: '🎂', missed: '⏭️', skipped: '⏸️', redeem: '🛍️', refund: '↩️', praise: '❤️' };

/** Escapes text for safe use inside innerHTML templates. */
function escProtocol(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Register card in the Home Assistant Card Picker.
 */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "task-organizer-protocol",
  name: "Task Organizer: Protocol",
  description: "A dedicated log for managing and editing completed tasks.",
  preview: true,
});

class TaskOrganizerProtocol extends HTMLElement {
  /**
   * Initializes the TaskOrganizerProtocol element.
   */
  constructor() {
    super(); 
    this.attachShadow({ mode: 'open' });
    this.history = []; 
    this.users = {}; 
    this.editingEntryId = null; 
    this._unsubEvents = null;
    this.dataLoaded = false;
    this.currentPage = 1;
    this.addEventListener('click', (ev) => this._handleClick(ev));
  }

  static _localize(hass, key) {
    const lang = (hass && hass.language) ? hass.language.substring(0, 2) : 'en';
    return (I18N_PROTOCOL[lang] || I18N_PROTOCOL['en'])[key] || key;
  }

  localize(key) { return TaskOrganizerProtocol._localize(this._hass, key); }

  static getStubConfig(hass) { 
    return { type: "custom:task-organizer-protocol", title: this._localize(hass, 'title'), items_per_page: 10, filter_by: "all" }; 
  }

  static getConfigElement() { return document.createElement("task-organizer-protocol-editor"); }

  setConfig(config) { this.config = config; if (this._hass) this.render(); }

  connectedCallback() { 
    if (this._hass && !this._unsubEvents) { 
      this._subscribeToUpdates(); 
    } 
  }

  disconnectedCallback() { 
    if (this._unsubEvents) { 
      this._unsubEvents.then(unsub => unsub()); 
      this._unsubEvents = null; 
    } 
  }

  async _subscribeToUpdates() { 
    if (!this._hass) return;
    this._unsubEvents = this._hass.connection.subscribeEvents(() => this._fetchData(), "task_organizer_updated"); 
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.dataLoaded && hass) { 
      this._mapUsers(); 
      this._fetchData(); 
      this.dataLoaded = true; 
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
   * Maps 'person' entities to the local users object (persons without an HA user use their entity_id).
   */
  _mapUsers() { 
    for (const entityId in this._hass.states) { 
      if (entityId.startsWith('person.')) { 
        const state = this._hass.states[entityId]; 
        this.users[TaskOrganizerProtocol.participantId(entityId, state)] = state.attributes.friendly_name || entityId; 
      } 
    } 
  }

  _fetchData() { 
    this._hass.callWS({ type: 'task_organizer/get_data' }).then((data) => { 
      this.history = data.history || [];
      this._myRole = data.my_role || null;
      this.render(); 
    }); 
  }

  _handleClick(ev) {
    const path = ev.composedPath();
    const target = path.find(el => el.classList?.contains('action-btn') || ['btn-edit-save', 'btn-edit-cancel', 'btn-prev-page', 'btn-next-page'].includes(el.id));
    if (!target) return;
    
    const entryId = target.dataset.id;
    if (target.classList.contains('btn-edit')) this._openEditModal(entryId);
    if (target.classList.contains('btn-delete')) this._deleteEntry(entryId);
    if (target.classList.contains('btn-undo')) this._undoEntry(entryId);
    if (target.id === 'btn-edit-cancel') this._closeModal();
    if (target.id === 'btn-edit-save') this._saveEdit();
    if (target.id === 'btn-prev-page') { this.currentPage = Math.max(1, this.currentPage - 1); this.render(); }
    if (target.id === 'btn-next-page') { this.currentPage++; this.render(); }
  }

  _openEditModal(entryId) { 
    const entry = this.history.find(h => h.id === entryId); 
    if (!entry) return;
    this.editingEntryId = entryId; 
    this.shadowRoot.getElementById('edit-points').value = entry.points; 
    const userSelect = this.shadowRoot.getElementById('edit-user-select');
    if (userSelect) userSelect.value = entry.user_id;
    this.shadowRoot.getElementById('edit-modal').classList.add('open'); 
  }

  _closeModal() { this.shadowRoot.getElementById('edit-modal').classList.remove('open'); this.editingEntryId = null; }

  _saveEdit() { 
    const points = parseFloat(this.shadowRoot.getElementById('edit-points').value); 
    const userSelect = this.shadowRoot.getElementById('edit-user-select');
    const userId = userSelect ? userSelect.value : null;
    this._hass.callWS({ type: 'task_organizer/edit_history_item', entry_id: this.editingEntryId, points: points, user_id: userId }).then(() => { this._closeModal(); this._fetchData(); }); 
  }

  /** Admins, managers and parents may undo (the backend checks the role). */
  _canUndo() {
    return !!(this._hass && this._hass.user && this._hass.user.is_admin) || ['admin', 'manager', 'parent'].includes(this._myRole);
  }

  /** Undo a task completion: points back, task open again, no penalty. */
  _undoEntry(entryId) {
    if (confirm(this.localize('confirm_undo'))) {
      this._hass.callWS({ type: 'task_organizer/undo_completion', history_id: entryId }).then(() => this._fetchData());
    }
  }

  _deleteEntry(entryId) { 
    if (confirm(this.localize('confirm_delete'))) { 
      this._hass.callWS({ type: 'task_organizer/delete_history_item', entry_id: entryId }).then(() => this._fetchData());
    } 
  }

  /** Renders one history entry: icon by type, name, reason, who and when, signed points. */
  _renderEntry(entry) {
    const type = PROTOCOL_TYPE_ICONS[entry.type] ? entry.type : 'task';
    const points = parseFloat(entry.points) || 0;
    // Bonus / deduction entries are named by their reason; tasks show the reason as an extra line
    const name = (type === 'bonus' || type === 'penalty' || type === 'praise') ? (entry.reason || entry.task_name) : entry.task_name;
    const extra = (type === 'task' || type === 'birthday' || type === 'skipped') && entry.reason ? entry.reason : '';
    const label = this.localize('type_' + type);
    return `
      <div class="hist-item type-${type}">
        <div class="type-icon" title="${escProtocol(label)}" aria-label="${escProtocol(label)}">${PROTOCOL_TYPE_ICONS[type]}</div>
        <div style="flex:1; min-width:0;">
          <span class="task-name">${escProtocol(name)}</span>
          ${extra ? `<span class="reason">${escProtocol(extra)}</span>` : ''}
          <span class="meta">${new Date(entry.timestamp).toLocaleString()} • ${escProtocol(this.users[entry.user_id] || this.localize('unknown'))}</span>
        </div>
        <div class="actions">
          <span class="points-badge ${points < 0 ? 'neg' : ''}">${type === 'praise' ? escProtocol(entry.sticker || '❤️') : type === 'missed' || type === 'skipped' ? '0' : points < 0 ? '−' + Math.abs(points) : '+' + points}</span>
          ${type === 'task' && this._canUndo() ? `<button class="action-btn btn-undo" data-id="${escProtocol(entry.id)}" title="${escProtocol(this.localize('undo_hover'))}" aria-label="${escProtocol(this.localize('undo'))}"><ha-icon icon="mdi:undo-variant"></ha-icon></button>` : ''}
          <button class="action-btn btn-edit" data-id="${escProtocol(entry.id)}" title="${this.localize('edit_hover')}"><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="action-btn btn-delete" data-id="${escProtocol(entry.id)}" title="${this.localize('delete_hover')}"><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
      </div>`;
  }

  render() {
    if (!this.config || !this._hass) return;
    const itemsPerPage = this.config.items_per_page || 10;
    let filtered = this.history;
    if (this.config.filter_by === 'mine') filtered = filtered.filter(h => h.user_id === this._hass.user.id);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice((this.currentPage - 1) * itemsPerPage, this.currentPage * itemsPerPage);

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { padding: 16px; display: flex; flex-direction: column; height: ${this.config.card_height || 'auto'}; overflow-y: auto; }
        .header { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .protocol-list { display: flex; flex-direction: column; gap: 10px; }
        .hist-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px; border-radius: 8px; border: 1px solid var(--divider-color); }
        .hist-item.type-penalty { border-color: var(--warning-color, #FFA000); }
        .type-icon { flex: none; width: 28px; text-align: center; font-size: 20px; line-height: 1; }
        .reason { display: block; font-size: 13px; color: var(--primary-text-color); }
        .points-badge.neg { color: var(--error-color, #F44336); }
        .task-name { font-weight: bold; display: block; }
        .meta { font-size: 12px; color: var(--secondary-text-color); }
        .actions { display: flex; align-items: center; gap: 4px; }
        .points-badge { font-weight: bold; color: var(--primary-color); margin-right: 8px; }
        .action-btn { background: transparent; border: none; cursor: pointer; color: var(--secondary-text-color); padding: 8px; border-radius: 50%; width: 40px; height: 40px; }
        .action-btn:hover { background: var(--secondary-background-color); color: var(--primary-text-color); }
        .btn-undo { color: var(--warning-color, #FFA000); }
        .btn-edit { color: var(--info-color, #2196F3); } 
        .btn-delete { color: var(--error-color, #F44336); }
        .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 5000; justify-content: center; align-items: center; }
        .modal.open { display: flex; }
        .modal-content { background: var(--card-background-color); padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; }
        select { width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font-family: inherit; font-size: 14px; }
        .form-label { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; display: block; }
      </style>
      <ha-card>
        <div class="header">${this.config.title || this.localize('title')}</div>
        <div class="protocol-list">
          ${paginated.map(entry => this._renderEntry(entry)).join('')}
        </div>
        <div class="pagination">
          <ha-button id="btn-prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>${this.localize('prev')}</ha-button>
          <span>${this.currentPage} / ${totalPages}</span>
          <ha-button id="btn-next-page" ${this.currentPage >= totalPages ? 'disabled' : ''}>${this.localize('next')}</ha-button>
        </div>
        <div id="edit-modal" class="modal">
          <div class="modal-content">
            <h2>${this.localize('edit')}</h2>
            <ha-input id="edit-points" type="number" label="${this.localize('points')}" step="0.1"></ha-input>
            <div>
              <label class="form-label">${this.localize('user')}</label>
              <select id="edit-user-select">
                ${Object.entries(this.users).map(([uid, name]) => `
                  <option value="${uid}">${name}</option>
                `).join('')}
              </select>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <ha-button id="btn-edit-cancel">${this.localize('cancel')}</ha-button>
              <ha-button raised id="btn-edit-save">${this.localize('save')}</ha-button>
            </div>
          </div>
        </div>
      </ha-card>`;
  }
}

class TaskOrganizerProtocolEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  localize(key) { return TaskOrganizerProtocol._localize(this._hass, key); }
  _render() {
    if (!this._config || !this._hass) return;
    if (this._rendered) { this._updateUI(); return; }
    this.innerHTML = `
      <div class="card-config">
        <ha-input label="${this.localize('title_lbl')}" value="${this._config.title || this.localize('title')}" configValue="title"></ha-input>
        <div style="display: flex; gap: 8px;">
          <ha-input label="${this.localize('height_lbl')}" placeholder="400px" value="${this._config.card_height || ''}" configValue="card_height" style="flex:1"></ha-input>
          <ha-input label="${this.localize('width_lbl')}" placeholder="100%" value="${this._config.card_width || ''}" configValue="card_width" style="flex:1"></ha-input>
        </div>
        <ha-input label="${this.localize('items_per_page_lbl')}" type="number" value="${this._config.items_per_page || 10}" configValue="items_per_page"></ha-input>
        <ha-input label="${this.localize('filter_by_lbl')}" placeholder="all, mine" value="${this._config.filter_by || 'all'}" configValue="filter_by"></ha-input>
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
    const cfg = ev.target.getAttribute('configValue');
    const val = ev.target.tagName === 'HA-INPUT' && ev.target.type === 'number' ? parseInt(ev.target.value) : ev.target.value;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: { ...this._config, [cfg]: val } }, bubbles: true, composed: true }));
  }
}

customElements.define('task-organizer-protocol-editor', TaskOrganizerProtocolEditor);
customElements.define('task-organizer-protocol', TaskOrganizerProtocol);