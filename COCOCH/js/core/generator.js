// Full character generator for Call of Cthulhu 7th edition.
import { rollDice, randInt, pick } from './dice.js';
import { SKILLS, resolveBase } from '../data/skills.js';
import { OCCUPATIONS } from '../data/occupations.js';
import {
  FIRST_NAMES_MALE, FIRST_NAMES_FEMALE, LAST_NAMES, SEXES, PLACES, ORIGINS,
} from '../data/names.js';

export function newId() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Roll characteristics. Returns { STR, CON, SIZ, DEX, APP, INT, POW, EDU, LUCK }.
export function rollCharacteristics() {
  const roll3d6 = () => rollDice(3, 6).total * 5;
  const roll2d6p6 = () => (rollDice(2, 6).total + 6) * 5;
  return {
    STR: roll3d6(),
    CON: roll3d6(),
    SIZ: roll2d6p6(),
    DEX: roll3d6(),
    APP: roll3d6(),
    INT: roll2d6p6(),
    POW: roll3d6(),
    EDU: roll2d6p6(),
    LUCK: roll3d6(),
  };
}

// Damage bonus / build from STR + SIZ.
export function damageBonusBuild(strSiz) {
  const t = strSiz;
  if (t <= 64) return { damageBonus: '-2', build: -2 };
  if (t <= 84) return { damageBonus: '-1', build: -1 };
  if (t <= 124) return { damageBonus: '0', build: 0 };
  if (t <= 164) return { damageBonus: '+1D4', build: 1 };
  if (t <= 204) return { damageBonus: '+1D6', build: 2 };
  if (t <= 284) return { damageBonus: '+2D6', build: 3 };
  if (t <= 364) return { damageBonus: '+3D6', build: 4 };
  if (t <= 444) return { damageBonus: '+4D6', build: 5 };
  return { damageBonus: '+5D6', build: 6 };
}

export function moveRate(str, siz, dex) {
  if (str < siz && dex < siz) return 7;
  if (str > siz && dex > siz) return 9;
  return 8;
}

// Derive all secondary values from characteristics.
export function deriveFromCharacteristics(c) {
  const hp = Math.floor((c.CON + c.SIZ) / 10);
  const mp = Math.floor(c.POW / 5);
  const san = c.POW;
  const dodge = Math.floor(c.DEX / 2);
  const { damageBonus, build } = damageBonusBuild(c.STR + c.SIZ);
  const move = moveRate(c.STR, c.SIZ, c.DEX);
  return {
    hp, mp, san, luck: c.LUCK, dodge, damageBonus, build, move,
  };
}

// Build the skill map with occupation + personal interest points distributed.
export function buildSkills(characteristics, occupation) {
  const skills = {};
  for (const s of SKILLS) skills[s.id] = resolveBase(s.base, characteristics);

  const occ = OCCUPATIONS.find((o) => o.name === occupation) || pick(OCCUPATIONS);
  const occSkills = occ.skills.filter((id) => id in skills);
  const otherSkills = SKILLS.map((s) => s.id).filter(
    (id) => !occ.skills.includes(id) && id !== 'cthulhu_mythos' && id !== 'credit_rating',
  );

  const occPoints = characteristics.EDU * 4;
  const personalPoints = characteristics.INT * 2;

  const bump = {};
  const occPool = occSkills;
  // Occupation skills
  let remaining = occPoints;
  const per = Math.floor(remaining / occPool.length);
  for (const id of occPool) {
    const add = Math.min(per, remaining);
    bump[id] = (bump[id] || 0) + add;
    remaining -= add;
  }
  while (remaining > 0) {
    const id = pick(occPool);
    bump[id] = (bump[id] || 0) + 1;
    remaining -= 1;
  }

  // Personal interest: pick ~4 random skills
  const interestCount = 4;
  const chosen = [];
  const shuffled = [...otherSkills].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(interestCount, shuffled.length); i++) chosen.push(shuffled[i]);
  remaining = personalPoints;
  const per2 = Math.floor(remaining / chosen.length);
  for (const id of chosen) {
    const add = Math.min(per2, remaining);
    bump[id] = (bump[id] || 0) + add;
    remaining -= add;
  }
  while (remaining > 0) {
    const id = pick(chosen);
    bump[id] = (bump[id] || 0) + 1;
    remaining -= 1;
  }

  for (const id in bump) skills[id] += bump[id];

  // Credit rating within occupation range
  const credit = randInt(occ.credit[0], occ.credit[1]);
  skills.credit_rating = Math.max(skills.credit_rating, credit);

  return { skills, occupation: occ.name };
}

// Generate a complete character object.
export function generateCharacter(opts = {}) {
  const sex = opts.sex || pick(SEXES);
  const firstName = pick(sex === 'Female' ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
  const lastName = pick(LAST_NAMES);
  const age = opts.age || randInt(20, 39);

  const characteristics = rollCharacteristics();
  const derived = deriveFromCharacteristics(characteristics);
  const occupation = opts.occupation || pick(OCCUPATIONS).name;
  const { skills } = buildSkills(characteristics, occupation);

  return {
    id: newId(),
    name: `${firstName} ${lastName}`,
    player: opts.player || '',
    occupation,
    age,
    sex,
    birthplace: pick(PLACES),
    residence: pick(PLACES),
    origin: pick(ORIGINS),
    characteristics,
    derived,
    current: {
      hp: derived.hp,
      mp: derived.mp,
      san: derived.san,
      luck: derived.luck,
    },
    skills,
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Recompute derived values and current-value clamping after manual edits.
export function recalcDerived(character) {
  const derived = deriveFromCharacteristics(character.characteristics);
  const prev = character.derived || {};
  // Preserve lost HP/MP/SAN proportionally when max changes.
  const cur = character.current || {};
  const keepDelta = (key, prevMax, newMax) => {
    if (!cur || cur[key] === undefined) return newMax;
    if (prevMax === undefined || prevMax === newMax) return cur[key];
    const lost = prevMax - cur[key];
    return Math.max(0, newMax - lost);
  };
  const hpDelta = keepDelta('hp', prev.hp, derived.hp);
  const mpDelta = keepDelta('mp', prev.mp, derived.mp);
  const sanDelta = keepDelta('san', prev.san, derived.san);
  const luckDelta = keepDelta('luck', prev.luck, derived.luck);

  return {
    derived,
    current: {
      hp: Math.min(derived.hp, hpDelta),
      mp: Math.min(derived.mp, mpDelta),
      san: Math.min(derived.san, sanDelta),
      luck: Math.min(derived.luck, luckDelta),
    },
  };
}
