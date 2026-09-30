// Character sheet view: editable sheet + searchable roll panel.
import { getCharacter, upsertCharacter, deleteCharacter, duplicateCharacter } from '../core/storage.js';
import { recalcDerived } from '../core/generator.js';
import { SKILLS, SKILL_TAGS, resolveBase } from '../data/skills.js';
import { OCCUPATIONS } from '../data/occupations.js';
import { el, clear, halfFifth } from '../utils.js';
import {
  rollCheck, rollDamage, clearLog, renderRollLog,
} from './rolls.js';
import { toast, confirmModal } from './characterList.js';

const CHAR_ORDER = ['STR', 'CON', 'SIZ', 'DEX', 'APP', 'INT', 'POW', 'EDU', 'LUCK'];

const state = {
  character: null,
  search: '',
  tag: 'all',
  bonus: 0,
  refs: {},
};

export function renderCharacterSheet(app, navigate, id) {
  const character = getCharacter(id);
  if (!character) {
    navigate('home');
    return;
  }
  state.character = character;
  state.search = '';
  state.tag = 'all';
  state.bonus = 0;
  clearLog();
  clear(app);

  const root = el('div', 'view-sheet');
  root.appendChild(buildToolbar(app, navigate));
  const split = el('div', 'split');
  split.appendChild(buildLeftColumn());
  split.appendChild(buildRightColumn());
  root.appendChild(split);
  app.appendChild(root);
}

// ---------- Toolbar ----------
function buildToolbar(app, navigate) {
  const bar = el('div', 'sheet-toolbar');
  const back = el('button', 'btn btn--ghost back', '← Characters');
  back.type = 'button';
  back.addEventListener('click', () => navigate('home'));
  bar.appendChild(back);

  const nameInput = el('input', 'sheet-title');
  nameInput.value = state.character.name;
  nameInput.addEventListener('change', () => {
    state.character.name = nameInput.value.trim() || 'Unnamed';
    save();
  });
  state.refs.nameInput = nameInput;
  bar.appendChild(nameInput);

  const saveBadge = el('span', 'text-dim', '');
  state.refs.saveBadge = saveBadge;
  bar.appendChild(saveBadge);

  const dup = el('button', 'btn', 'Duplicate');
  dup.type = 'button';
  dup.addEventListener('click', () => {
    const copy = duplicateCharacter(state.character.id);
    if (copy) {
      toast('Duplicated character');
      navigate('character', copy.id);
    }
  });
  const del = el('button', 'btn btn--danger', 'Delete');
  del.type = 'button';
  del.addEventListener('click', () => {
    confirmModal('Delete character', `Delete "${state.character.name}"?`, () => {
      deleteCharacter(state.character.id);
      navigate('home');
    });
  });
  bar.append(dup, del);
  return bar;
}

// ---------- Left column ----------
function buildLeftColumn() {
  const col = el('div', 'col');
  col.appendChild(buildIdentityPanel());
  col.appendChild(buildCharacteristicsPanel());
  col.appendChild(buildDerivedPanel());
  col.appendChild(buildTrackingPanel());
  col.appendChild(buildNotesPanel());
  return col;
}

function buildIdentityPanel() {
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', 'sheet-section-title', 'Identity'));
  const grid = el('div', 'identity-grid');
  const c = state.character;

  grid.appendChild(field('Player', textInput(c.player, (v) => { c.player = v; save(); })));
  grid.appendChild(field('Occupation', selectInput(
    OCCUPATIONS.map((o) => o.name), c.occupation, (v) => { c.occupation = v; save(); },
  )));
  grid.appendChild(field('Age', numberInput(c.age, (v) => { c.age = v; save(); })));
  grid.appendChild(field('Sex', selectInput(['Male', 'Female', 'Other'], c.sex, (v) => { c.sex = v; save(); })));
  const origin = field('Origin', textInput(c.origin, (v) => { c.origin = v; save(); }));
  const residence = field('Residence', textInput(c.residence, (v) => { c.residence = v; save(); }));
  const birthplace = field('Birthplace', textInput(c.birthplace, (v) => { c.birthplace = v; save(); }));
  origin.classList.add('full');
  grid.append(origin, residence, birthplace);

  panel.appendChild(grid);
  return panel;
}

function buildCharacteristicsPanel() {
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', 'sheet-section-title', 'Characteristics'));
  const grid = el('div', 'stat-grid');
  state.refs.charGrid = grid;
  for (const key of CHAR_ORDER) {
    grid.appendChild(buildCharBox(key));
  }
  panel.appendChild(grid);
  return panel;
}

function buildCharBox(key) {
  const c = state.character;
  const val = c.characteristics[key];
  const box = el('div', 'stat-box');
  box.title = 'Click to roll ' + key;

  const label = el('div', 'stat-box__label', key);
  const input = el('input', 'stat-box__value-input');
  input.type = 'number';
  input.value = val;
  input.addEventListener('click', (e) => e.stopPropagation());
  input.addEventListener('change', () => {
    c.characteristics[key] = clampInt(input.value, 0, 999);
    applyRecalc();
  });

  const { half, fifth } = halfFifth(val);
  const sub = el('div', 'stat-box__half', `½ ${half} · ⅕ ${fifth}`);

  box.appendChild(label);
  box.appendChild(input);
  box.appendChild(sub);
  box.addEventListener('click', () => {
    rollCheck(key, c.characteristics[key], state.bonus);
    refreshRollLog();
  });
  return box;
}

function buildDerivedPanel() {
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', 'sheet-section-title', 'Derived Values'));
  const grid = el('div', 'derived-grid');
  state.refs.derivedGrid = grid;
  appendDerived(grid);
  panel.appendChild(grid);
  return panel;
}

function appendDerived(grid) {
  clear(grid);
  const c = state.character;
  const d = c.derived;
  const items = [
    { label: 'Hit Points', value: d.hp, sub: null, roll: false },
    { label: 'Magic Points', value: d.mp, sub: null, roll: false },
    { label: 'Sanity', value: d.san, sub: null, roll: false },
    { label: 'Luck', value: d.luck, sub: null, roll: 'luck' },
    { label: 'Dodge', value: d.dodge, sub: null, roll: 'dodge' },
    { label: 'Damage Bonus', value: d.damageBonus, sub: null, roll: false },
    { label: 'Build', value: d.build, sub: null, roll: false },
    { label: 'Move Rate', value: d.move, sub: 'yards', roll: false },
  ];
  for (const it of items) {
    const box = el('div', 'derived-box');
    box.appendChild(el('div', 'derived-box__label', it.label));
    const val = el('div', 'derived-box__value', String(it.value));
    if (it.sub) val.appendChild(el('span', 'derived-box__sub', ' ' + it.sub));
    box.appendChild(val);
    if (it.roll) {
      box.title = 'Click to roll ' + it.label;
      box.style.cursor = 'pointer';
      box.addEventListener('click', () => {
        const target = it.roll === 'luck' ? state.character.current.luck : d.dodge;
        rollCheck(it.label, target, state.bonus);
        refreshRollLog();
      });
    }
    grid.appendChild(box);
  }
}

function buildTrackingPanel() {
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', 'sheet-section-title', 'Tracking'));
  const rows = el('div');
  state.refs.trackRows = rows;
  appendTracking(rows);
  panel.appendChild(rows);
  return panel;
}

function appendTracking(rows) {
  clear(rows);
  const c = state.character;
  const resources = [
    { key: 'hp', label: 'Hit Points', max: c.derived.hp },
    { key: 'mp', label: 'Magic Points', max: c.derived.mp },
    { key: 'san', label: 'Sanity', max: c.derived.san },
    { key: 'luck', label: 'Luck', max: c.derived.luck },
  ];
  for (const r of resources) {
    const cur = c.current[r.key];
    const row = el('div', 'track-row');
    const label = el('div', 'track-row__label');
    label.textContent = r.label;
    label.appendChild(el('small', null, ` / ${r.max}`));
    row.appendChild(label);

    const controls = el('div', 'track-controls');
    const minus = el('button', 'icon-btn', '−');
    minus.type = 'button';
    minus.title = 'Decrease';
    minus.addEventListener('click', () => {
      c.current[r.key] = Math.max(0, c.current[r.key] - 1);
      updateTrackingValue(row, r.key);
      save();
    });
    const value = el('span', 'track-value', String(cur));
    value.classList.toggle('low', cur <= Math.floor(r.max / 4) && cur > 0);
    value.classList.toggle('zero', cur === 0);
    const plus = el('button', 'icon-btn', '＋');
    plus.type = 'button';
    plus.title = 'Increase';
    plus.addEventListener('click', () => {
      c.current[r.key] = Math.min(r.max, c.current[r.key] + 1);
      updateTrackingValue(row, r.key);
      save();
    });
    const reset = el('button', 'icon-btn', '↺');
    reset.type = 'button';
    reset.title = 'Reset to max';
    reset.addEventListener('click', () => {
      c.current[r.key] = r.max;
      updateTrackingValue(row, r.key);
      save();
    });
    controls.append(minus, value, plus, reset);
    row.appendChild(controls);
    rows.appendChild(row);
  }
}

function updateTrackingValue(row, key) {
  const c = state.character;
  const r = resourcesOf(c).find((x) => x.key === key);
  const value = row.querySelector('.track-value');
  value.textContent = String(c.current[key]);
  value.classList.toggle('low', c.current[key] <= Math.floor(r.max / 4) && c.current[key] > 0);
  value.classList.toggle('zero', c.current[key] === 0);
}

function resourcesOf(c) {
  return [
    { key: 'hp', label: 'Hit Points', max: c.derived.hp },
    { key: 'mp', label: 'Magic Points', max: c.derived.mp },
    { key: 'san', label: 'Sanity', max: c.derived.san },
    { key: 'luck', label: 'Luck', max: c.derived.luck },
  ];
}

function buildNotesPanel() {
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', 'sheet-section-title', 'Notes'));
  const ta = el('textarea');
  ta.rows = 4;
  ta.value = state.character.notes || '';
  ta.placeholder = 'Background, gear, injuries, story notes…';
  ta.addEventListener('change', () => {
    state.character.notes = ta.value;
    save();
  });
  panel.appendChild(ta);
  return panel;
}

// ---------- Right column: roll panel ----------
function buildRightColumn() {
  const col = el('div', 'col');
  const panel = el('div', 'panel roll-panel');
  panel.appendChild(el('h3', 'sheet-section-title', 'Roll Anything'));

  const search = el('input', 'search-input');
  search.type = 'text';
  search.placeholder = 'Search stats & skills…';
  search.addEventListener('input', () => {
    state.search = search.value.toLowerCase();
    refreshRollItems();
  });
  panel.appendChild(search);

  const tagRow = el('div', 'tag-row');
  const tags = [
    { id: 'all', label: 'All' },
    { id: 'characteristics', label: 'Characteristics' },
    { id: 'derived', label: 'Derived' },
    ...SKILL_TAGS.filter((t) => t.id !== 'all'),
  ];
  state.refs.tagRow = tagRow;
  for (const t of tags) {
    const tagBtn = el('button', 'tag' + (state.tag === t.id ? ' active' : ''), t.label);
    tagBtn.type = 'button';
    tagBtn.dataset.tag = t.id;
    tagBtn.addEventListener('click', () => {
      state.tag = t.id;
      refreshTagRow();
      refreshRollItems();
    });
    tagRow.appendChild(tagBtn);
  }
  panel.appendChild(tagRow);

  const bonusRow = el('div', 'row');
  bonusRow.appendChild(el('span', 'text-dim', 'Bonus/Penalty:'));
  const bonusSelect = el('select');
  bonusSelect.innerHTML = `
    <option value="0">None</option>
    <option value="1">+1 Bonus die</option>
    <option value="2">+2 Bonus dice</option>
    <option value="-1">-1 Penalty die</option>
    <option value="-2">-2 Penalty dice</option>`;
  bonusSelect.value = '0';
  bonusSelect.addEventListener('change', () => {
    state.bonus = parseInt(bonusSelect.value, 10);
  });
  bonusRow.appendChild(bonusSelect);
  panel.appendChild(bonusRow);

  const list = el('div', 'skill-list');
  state.refs.rollItems = list;
  panel.appendChild(list);

  panel.appendChild(buildDiceQuick());

  const logHead = el('div', 'row');
  logHead.appendChild(el('h4', 'sheet-section-title', 'Roll Log'));
  const clearBtn = el('button', 'btn btn--sm btn--ghost', 'Clear');
  clearBtn.type = 'button';
  clearBtn.addEventListener('click', () => {
    clearLog();
    refreshRollLog();
  });
  logHead.appendChild(clearBtn);
  panel.appendChild(logHead);

  const logBox = el('div', 'roll-results');
  state.refs.rollLog = logBox;
  panel.appendChild(logBox);

  col.appendChild(panel);
  refreshRollItems();
  refreshRollLog();
  return col;
}

function buildDiceQuick() {
  const wrap = el('div', 'panel');
  wrap.style.background = 'var(--bg-elev)';
  wrap.appendChild(el('div', 'text-dim', 'Quick Dice'));
  const quick = el('div', 'dice-quick');
  const presets = ['1D3', '1D4', '1D6', '1D8', '1D10', '1D20', '2D6', '3D6', '1D100'];
  for (const p of presets) {
    const b = el('button', 'btn btn--sm', p);
    b.type = 'button';
    b.addEventListener('click', () => {
      const [n, s] = p.split('D').map(Number);
      rollDamage(p, n, s);
      refreshRollLog();
    });
    quick.appendChild(b);
  }
  wrap.appendChild(quick);

  const custom = el('div', 'dice-quick mt');
  const count = el('input');
  count.type = 'number';
  count.min = 1;
  count.max = 100;
  count.value = 1;
  count.style.width = '52px';
  const sides = el('input');
  sides.type = 'number';
  sides.min = 2;
  sides.max = 1000;
  sides.value = 6;
  sides.style.width = '52px';
  const rollBtn = el('button', 'btn btn--sm btn--primary', 'Roll');
  rollBtn.type = 'button';
  rollBtn.addEventListener('click', () => {
    const n = clampInt(count.value, 1, 100);
    const s = clampInt(sides.value, 2, 1000);
    rollDamage(`${n}D${s}`, n, s);
    refreshRollLog();
  });
  custom.append(count, el('span', 'text-dim', 'D'), sides, rollBtn);
  wrap.appendChild(custom);
  return wrap;
}

// ---------- Roll items list ----------
function buildRollItems() {
  const c = state.character;
  const items = [];

  for (const key of CHAR_ORDER) {
    items.push({ type: 'char', id: key, name: key, value: c.characteristics[key], tags: ['characteristics'], base: null });
  }
  items.push({ type: 'derived', id: 'dodge', name: 'Dodge', value: c.derived.dodge, tags: ['derived'], base: null });
  items.push({ type: 'derived', id: 'luck', name: 'Luck', value: c.current.luck, tags: ['derived'], base: null });

  for (const s of SKILLS) {
    const base = resolveBase(s.base, c.characteristics);
    items.push({
      type: 'skill', id: s.id, name: s.name, value: c.skills[s.id] ?? base, tags: s.tags, base,
    });
  }

  const q = state.search.trim();
  const filtered = items.filter((it) => {
    if (state.tag !== 'all' && !it.tags.includes(state.tag)) return false;
    if (q && !it.name.toLowerCase().includes(q) && !it.type.includes(q)) return false;
    return true;
  });
  return { items, filtered };
}

function refreshRollItems() {
  const container = state.refs.rollItems;
  if (!container) return;
  clear(container);
  const { filtered } = buildRollItems();
  if (!filtered.length) {
    container.appendChild(el('div', 'text-dim', 'No matching stats or skills.'));
    return;
  }
  for (const it of filtered) {
    container.appendChild(renderRollItem(it));
  }
}

function renderRollItem(it) {
  const row = el('div', 'skill-row');
  row.title = 'Click to roll';

  const name = el('span', 'skill-row__name', it.name);
  name.addEventListener('click', (e) => {
    e.stopPropagation();
    doRollItem(it);
  });

  const base = el('span', 'skill-row__base', it.base !== null ? String(it.base) : '');
  base.style.minWidth = '34px';

  row.appendChild(name);
  row.appendChild(base);

  if (it.type === 'skill') {
    const input = el('input', 'skill-row__input');
    input.type = 'number';
    input.value = it.value;
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('change', () => {
      const c = state.character;
      c.skills[it.id] = clampInt(input.value, 0, 999);
      save();
      refreshRollItems();
    });
    row.appendChild(input);
  } else {
    const val = el('span', 'skill-row__value', String(it.value));
    val.style.color = 'var(--text)';
    row.appendChild(val);
  }

  row.addEventListener('click', () => doRollItem(it));
  return row;
}

function doRollItem(it) {
  const c = state.character;
  if (it.type === 'char') {
    rollCheck(it.name, c.characteristics[it.id], state.bonus);
  } else if (it.type === 'derived') {
    const target = it.id === 'luck' ? c.current.luck : c.derived.dodge;
    rollCheck(it.name, target, state.bonus);
  } else {
    rollCheck(it.name, it.value, state.bonus);
  }
  refreshRollLog();
}

function refreshRollLog() {
  const box = state.refs.rollLog;
  if (box) renderRollLog(box);
}

function refreshTagRow() {
  const row = state.refs.tagRow;
  if (!row) return;
  for (const b of row.querySelectorAll('.tag')) {
    b.classList.toggle('active', b.dataset.tag === state.tag);
  }
}

// ---------- Recalc / save ----------
function applyRecalc() {
  const c = state.character;
  const { derived, current } = recalcDerived(c);
  c.derived = derived;
  c.current = current;
  save();
  // Update derived panel + tracking + char grid halves + roll items (skills bases change).
  appendDerived(state.refs.derivedGrid);
  appendTracking(state.refs.trackRows);
  refreshCharGrid();
  refreshRollItems();
}

function refreshCharGrid() {
  const grid = state.refs.charGrid;
  if (!grid) return;
  clear(grid);
  for (const key of CHAR_ORDER) grid.appendChild(buildCharBox(key));
}

let saveTimer = null;
function save() {
  const c = state.character;
  if (state.refs.saveBadge) {
    state.refs.saveBadge.textContent = 'Saving…';
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    upsertCharacter(c);
    if (state.refs.saveBadge) {
      state.refs.saveBadge.textContent = 'Saved';
      setTimeout(() => {
        if (state.refs.saveBadge) state.refs.saveBadge.textContent = '';
      }, 1500);
    }
  }, 300);
}

// ---------- Helpers ----------
function field(label, input) {
  const f = el('div', 'field');
  f.appendChild(el('label', null, label));
  f.appendChild(input);
  return f;
}

function textInput(value, onChange) {
  const input = el('input');
  input.type = 'text';
  input.value = value || '';
  input.addEventListener('change', () => onChange(input.value));
  return input;
}

function numberInput(value, onChange) {
  const input = el('input');
  input.type = 'number';
  input.value = value;
  input.addEventListener('change', () => onChange(clampInt(input.value, 0, 999)));
  return input;
}

function selectInput(options, value, onChange) {
  const sel = el('select');
  for (const o of options) {
    const opt = el('option', null, o);
    opt.value = o;
    if (o === value) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => onChange(sel.value));
  return sel;
}

function clampInt(value, min, max) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
