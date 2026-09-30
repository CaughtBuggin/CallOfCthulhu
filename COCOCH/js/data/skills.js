// Call of Cthulhu 7th edition skill list.
// `base` is the default skill value. Special bases can be a function key
// like "dex/2" or "edu" resolved against character characteristics.

export const SKILL_TAGS = [
  { id: 'all', label: 'All' },
  { id: 'combat', label: 'Combat' },
  { id: 'social', label: 'Social' },
  { id: 'investigation', label: 'Investigation' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'science', label: 'Science' },
  { id: 'movement', label: 'Movement' },
];

export const SKILLS = [
  { id: 'accounting', name: 'Accounting', base: 5, tags: ['knowledge'] },
  { id: 'anthropology', name: 'Anthropology', base: 1, tags: ['knowledge'] },
  { id: 'appraise', name: 'Appraise', base: 5, tags: ['knowledge'] },
  { id: 'archaeology', name: 'Archaeology', base: 1, tags: ['knowledge'] },
  { id: 'art_craft', name: 'Art/Craft', base: 5, tags: ['knowledge'] },
  { id: 'charm', name: 'Charm', base: 15, tags: ['social'] },
  { id: 'climb', name: 'Climb', base: 20, tags: ['movement'] },
  { id: 'credit_rating', name: 'Credit Rating', base: 0, tags: ['social'] },
  { id: 'cthulhu_mythos', name: 'Cthulhu Mythos', base: 0, tags: ['knowledge'] },
  { id: 'disguise', name: 'Disguise', base: 5, tags: ['social'] },
  { id: 'dodge', name: 'Dodge', base: 'dex/2', tags: ['combat'] },
  { id: 'drive_auto', name: 'Drive Auto', base: 20, tags: ['movement'] },
  { id: 'electric_repair', name: 'Electric Repair', base: 10, tags: ['science'] },
  { id: 'fast_talk', name: 'Fast Talk', base: 5, tags: ['social'] },
  { id: 'fighting_brawl', name: 'Fighting (Brawl)', base: 25, tags: ['combat'] },
  { id: 'firearms_handgun', name: 'Firearms (Handgun)', base: 20, tags: ['combat'] },
  { id: 'firearms_rifle', name: 'Firearms (Rifle/Shotgun)', base: 25, tags: ['combat'] },
  { id: 'first_aid', name: 'First Aid', base: 30, tags: ['science'] },
  { id: 'history', name: 'History', base: 5, tags: ['knowledge'] },
  { id: 'intimidate', name: 'Intimidate', base: 15, tags: ['social'] },
  { id: 'jump', name: 'Jump', base: 20, tags: ['movement'] },
  { id: 'language_other', name: 'Language (Other)', base: 1, tags: ['knowledge'] },
  { id: 'language_own', name: 'Language (Own)', base: 'edu', tags: ['knowledge'] },
  { id: 'law', name: 'Law', base: 5, tags: ['knowledge'] },
  { id: 'library_use', name: 'Library Use', base: 20, tags: ['investigation'] },
  { id: 'listen', name: 'Listen', base: 20, tags: ['investigation'] },
  { id: 'locksmith', name: 'Locksmith', base: 1, tags: ['investigation'] },
  { id: 'mechanical_repair', name: 'Mechanical Repair', base: 10, tags: ['science'] },
  { id: 'medicine', name: 'Medicine', base: 1, tags: ['science'] },
  { id: 'natural_world', name: 'Natural World', base: 10, tags: ['science'] },
  { id: 'navigate', name: 'Navigate', base: 10, tags: ['knowledge'] },
  { id: 'occult', name: 'Occult', base: 5, tags: ['knowledge'] },
  { id: 'operate_heavy_machinery', name: 'Operate Heavy Machinery', base: 1, tags: ['movement'] },
  { id: 'persuade', name: 'Persuade', base: 10, tags: ['social'] },
  { id: 'pilot', name: 'Pilot', base: 1, tags: ['movement'] },
  { id: 'psychology', name: 'Psychology', base: 10, tags: ['investigation'] },
  { id: 'psychoanalysis', name: 'Psychoanalysis', base: 1, tags: ['investigation'] },
  { id: 'ride', name: 'Ride', base: 5, tags: ['movement'] },
  { id: 'science', name: 'Science', base: 1, tags: ['science'] },
  { id: 'sleight_of_hand', name: 'Sleight of Hand', base: 10, tags: ['investigation'] },
  { id: 'spot_hidden', name: 'Spot Hidden', base: 25, tags: ['investigation'] },
  { id: 'stealth', name: 'Stealth', base: 20, tags: ['investigation'] },
  { id: 'survival', name: 'Survival', base: 10, tags: ['knowledge'] },
  { id: 'swim', name: 'Swim', base: 20, tags: ['movement'] },
  { id: 'throw', name: 'Throw', base: 20, tags: ['combat'] },
  { id: 'track', name: 'Track', base: 10, tags: ['investigation'] },
];

// Resolve a skill's base value given a character's characteristics.
export function resolveBase(base, characteristics) {
  if (typeof base === 'number') return base;
  if (base === 'dex/2') return Math.floor((characteristics.DEX || 0) / 2);
  if (base === 'edu') return characteristics.EDU || 0;
  return 0;
}

export function getSkill(id) {
  return SKILLS.find((s) => s.id === id);
}
