import { generateCharacter, recalcDerived, deriveFromCharacteristics } from '../js/core/generator.js';
import { SKILLS } from '../js/data/skills.js';

let ok = true;
function check(cond, msg) {
  if (cond) console.log('  ✓', msg);
  else { console.error('  ✗', msg); ok = false; }
}

for (let i = 0; i < 500; i++) {
  const c = generateCharacter();
  const d = c.derived;
  check(c.characteristics.STR >= 15 && c.characteristics.STR <= 90, `STR in range (${c.characteristics.STR})`);
  check(d.hp === Math.floor((c.characteristics.CON + c.characteristics.SIZ) / 10), 'HP derived');
  check(d.mp === Math.floor(c.characteristics.POW / 5), 'MP derived');
  check(d.san === c.characteristics.POW, 'SAN = POW');
  check(d.dodge === Math.floor(c.characteristics.DEX / 2), 'Dodge derived');
  check(d.luck === c.characteristics.LUCK, 'Luck derived');
  check(c.current.hp >= 0 && c.current.hp <= d.hp, 'current HP in bounds');
  check(Object.keys(c.skills).length === SKILLS.length, 'all skills present');
  check(c.skills.credit_rating >= 0 && c.skills.credit_rating <= 99, 'credit rating in range');
  check(['-2', '-1', '0', '+1D4', '+1D6', '+2D6', '+3D6', '+4D6', '+5D6'].includes(d.damageBonus), 'damage bonus valid');
  check([-2, -1, 0, 1, 2, 3, 4, 5, 6].includes(d.build), 'build valid');
  check([7, 8, 9].includes(d.move), 'move rate valid');
}

// Recalc should preserve lost HP when max changes.
const sample = generateCharacter();
sample.characteristics.CON = 30; // lower CON to reduce HP max
const before = sample.derived.hp;
const lost = sample.derived.hp - sample.current.hp;
const { derived, current } = recalcDerived(sample);
check(derived.hp === Math.floor((30 + sample.characteristics.SIZ) / 10), 'recalc HP max');
check(current.hp === Math.max(0, derived.hp - lost), 'recalc preserves lost HP');

console.log(ok ? '\nALL GENERATOR TESTS PASSED' : '\nTESTS FAILED');
process.exit(ok ? 0 : 1);
