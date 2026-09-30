// Home view: list of saved characters + quick create/import/export.
import { loadCharacters, upsertCharacter, deleteCharacter, duplicateCharacter, exportCharacters, importCharacters } from '../core/storage.js';
import { generateCharacter } from '../core/generator.js';
import { el, clear } from '../utils.js';

export function renderCharacterList(app, navigate) {
  clear(app);
  const root = el('div', 'view-list');
  const head = el('div', 'list-head');
  head.appendChild(el('h1', null, 'Characters'));

  const actions = el('div', 'actions');
  const newBtn = el('button', 'btn btn--primary', '＋ Quick Generate');
  newBtn.type = 'button';
  newBtn.addEventListener('click', () => {
    const c = generateCharacter();
    upsertCharacter(c);
    navigate('character', c.id);
  });
  const importBtn = el('button', 'btn', 'Import');
  const exportBtn = el('button', 'btn', 'Export');
  const importInput = el('input');
  importInput.type = 'file';
  importInput.accept = '.json,application/json';
  importInput.style.display = 'none';
  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      const res = await importCharacters(file);
      toast(`Imported ${res.added} character${res.added === 1 ? '' : 's'}${res.skipped ? ` (${res.skipped} skipped)` : ''}`);
      renderCharacterList(app, navigate);
    } catch (e) {
      toast('Import failed: ' + e.message, 'error');
    }
    importInput.value = '';
  });
  exportBtn.addEventListener('click', () => {
    exportCharacters();
    toast('Exported characters JSON');
  });

  actions.append(newBtn, importBtn, exportBtn, importInput);
  head.appendChild(actions);
  root.appendChild(head);

  const characters = loadCharacters();
  if (!characters.length) {
    const empty = el('div', 'empty-state');
    empty.appendChild(el('h2', null, 'No characters yet'));
    empty.appendChild(el('p', null, 'Quick-generate a fully rolled Call of Cthulhu 7e character in one click.'));
    const big = el('button', 'btn btn--primary', '＋ Quick Generate Character');
    big.type = 'button';
    big.addEventListener('click', () => {
      const c = generateCharacter();
      upsertCharacter(c);
      navigate('character', c.id);
    });
    empty.appendChild(big);
    root.appendChild(empty);
    app.appendChild(root);
    return;
  }

  const grid = el('div', 'grid-cards');
  for (const c of characters) {
    grid.appendChild(buildCard(c, app, navigate));
  }
  root.appendChild(grid);
  app.appendChild(root);
}

function buildCard(c, app, navigate) {
  const card = el('div', 'char-card');
  card.addEventListener('click', (e) => {
    if (e.target.closest('.icon-btn')) return;
    navigate('character', c.id);
  });

  const name = el('div', 'char-card__name', c.name);
  const meta = el('div', 'char-card__meta', `${c.occupation} · ${c.age} · ${c.sex}`);

  const stats = el('div', 'char-card__stats');
  stats.appendChild(statCell('HP', `${c.current.hp}/${c.derived.hp}`));
  stats.appendChild(statCell('SAN', `${c.current.san}/${c.derived.san}`));
  stats.appendChild(statCell('MP', `${c.current.mp}/${c.derived.mp}`));
  stats.appendChild(statCell('LUCK', `${c.current.luck}`));

  const actions = el('div', 'char-card__actions');
  const dup = iconBtn('⧉', 'Duplicate', () => {
    duplicateCharacter(c.id);
    renderCharacterList(app, navigate);
  });
  const del = iconBtn('✕', 'Delete', () => {
    confirmModal('Delete character', `Delete "${c.name}"? This cannot be undone.`, () => {
      deleteCharacter(c.id);
      renderCharacterList(app, navigate);
    });
  });
  actions.append(dup, del);

  card.append(name, meta, stats, actions);
  return card;
}

function statCell(label, value) {
  const cell = el('div', 'char-card__stat');
  cell.appendChild(el('b', null, value));
  cell.appendChild(el('span', null, label));
  return cell;
}

function iconBtn(glyph, title, onClick) {
  const b = el('button', 'icon-btn', glyph);
  b.type = 'button';
  b.title = title;
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  return b;
}

// Shared helpers (also used elsewhere).
export function toast(message, type = 'info') {
  const root = document.getElementById('toast-root');
  const t = el('div', 'toast ' + (type === 'error' ? 'error' : ''), message);
  root.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

export function confirmModal(title, message, onConfirm) {
  const root = document.getElementById('modal-root');
  const backdrop = el('div', 'modal-backdrop');
  const modal = el('div', 'modal');
  modal.appendChild(el('h2', null, title));
  modal.appendChild(el('p', null, message));
  const actions = el('div', 'actions');
  const cancel = el('button', 'btn', 'Cancel');
  cancel.type = 'button';
  cancel.addEventListener('click', () => backdrop.remove());
  const ok = el('button', 'btn btn--danger', 'Delete');
  ok.type = 'button';
  ok.addEventListener('click', () => {
    backdrop.remove();
    onConfirm();
  });
  actions.append(cancel, ok);
  modal.appendChild(actions);
  backdrop.appendChild(modal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });
  root.appendChild(backdrop);
}
