// Character persistence via localStorage with JSON export/import.

const STORAGE_KEY = 'cococh.characters.v1';

export function loadCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load characters', e);
    return [];
  }
}

export function saveCharacters(characters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

export function getCharacter(id) {
  return loadCharacters().find((c) => c.id === id) || null;
}

export function upsertCharacter(character) {
  const list = loadCharacters();
  const idx = list.findIndex((c) => c.id === character.id);
  character.updatedAt = Date.now();
  if (idx === -1) {
    list.unshift(character);
  } else {
    list[idx] = character;
  }
  saveCharacters(list);
  return character;
}

export function deleteCharacter(id) {
  const list = loadCharacters().filter((c) => c.id !== id);
  saveCharacters(list);
  return list;
}

export function duplicateCharacter(id) {
  const list = loadCharacters();
  const src = list.find((c) => c.id === id);
  if (!src) return null;
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  copy.name = copy.name + ' (Copy)';
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  list.unshift(copy);
  saveCharacters(list);
  return copy;
}

// Export all characters to a JSON file.
export function exportCharacters() {
  const list = loadCharacters();
  const data = { app: 'COCOCH', version: 1, exportedAt: new Date().toISOString(), characters: list };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cococh-characters-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import characters from a JSON file. Returns { added, skipped }.
export async function importCharacters(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  let incoming = [];
  if (Array.isArray(data)) incoming = data;
  else if (data && Array.isArray(data.characters)) incoming = data.characters;
  else throw new Error('Unrecognized file format');

  const list = loadCharacters();
  let added = 0;
  let skipped = 0;
  for (const c of incoming) {
    if (!c || typeof c !== 'object' || !c.name || !c.characteristics) {
      skipped++;
      continue;
    }
    const id = c.id || 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    if (list.some((x) => x.id === id)) {
      // Remap id to avoid collisions.
      c.id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    } else {
      c.id = id;
    }
    c.updatedAt = Date.now();
    list.unshift(c);
    added++;
  }
  saveCharacters(list);
  return { added, skipped };
}
