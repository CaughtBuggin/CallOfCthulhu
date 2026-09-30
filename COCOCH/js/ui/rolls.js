// Roll resolution + session roll log + rendering of roll results.
import { rollD100, rollD100WithPenalty, rollDice, gradeResult } from '../core/dice.js';
import { el, escapeHtml } from '../utils.js';

const log = [];
let logId = 0;

export function getLog() {
  return log;
}

export function clearLog() {
  log.length = 0;
}

export function addRoll(result) {
  result.id = ++logId;
  log.unshift(result);
  if (log.length > 200) log.pop();
  return result;
}

// d100 skill/characteristic check.
export function rollCheck(label, target, bonusDice = 0) {
  let result, tensOptions, units;
  if (bonusDice === 0) {
    result = rollD100();
    units = result % 10;
    tensOptions = [Math.floor(result / 10)];
  } else {
    const r = rollD100WithPenalty(bonusDice);
    result = r.result;
    units = r.units;
    tensOptions = r.tensOptions;
  }
  const grade = gradeResult(result, target);
  const bonusLabel = bonusDice > 0 ? `+${bonusDice} bonus die` : bonusDice < 0 ? `${bonusDice} penalty die` : '';
  return addRoll({
    kind: 'check',
    label,
    result,
    target,
    bonusDice,
    bonusLabel,
    units,
    tensOptions,
    grade,
    detail: `d100 = ${result} vs ${target}${bonusLabel ? ` (${bonusLabel})` : ''}`,
    timestamp: Date.now(),
  });
}

// Generic dice roll (e.g. 1D3, 2D6).
export function rollDamage(label, count, sides, bonus = 0) {
  const { total, dice } = rollDice(count, sides);
  const grand = total + bonus;
  const parts = dice.join(' + ');
  const bonusStr = bonus > 0 ? ` + ${bonus}` : '';
  return addRoll({
    kind: 'dice',
    label,
    result: grand,
    target: null,
    grade: { grade: 'roll', label: 'Roll', color: 'var(--text-dim)' },
    diceDesc: `${count}D${sides}`,
    dice,
    bonus,
    detail: `${count}D${sides}${bonusStr}: ${parts}${bonusStr} = ${grand}`,
    timestamp: Date.now(),
  });
}

export function renderRollResult(result) {
  const box = el('div', 'roll-result ' + (result.grade.grade || 'roll'));
  const head = el('div', 'roll-result__head');
  head.appendChild(el('span', 'roll-result__label', result.label));
  head.appendChild(el('span', 'roll-result__grade', result.grade.label));
  head.style.setProperty('--grade-color', result.grade.color);
  head.querySelector('.roll-result__grade').style.color = result.grade.color;

  const detail = el('div', 'roll-result__detail');
  detail.innerHTML = escapeHtml(result.detail);

  box.appendChild(head);
  box.appendChild(detail);

  if (result.kind === 'check' && result.bonusDice !== 0 && result.tensOptions) {
    const diceLine = el('div', 'roll-result__dice');
    diceLine.innerHTML = `tens dice: [${result.tensOptions.map((t) => escapeHtml(String(t))).join(', ')}] units: ${result.units}`;
    box.appendChild(diceLine);
  }

  return box;
}

export function renderRollLog(container) {
  container.textContent = '';
  if (!log.length) {
    container.appendChild(el('div', 'text-dim', 'No rolls yet. Click any stat or skill to roll.'));
    return;
  }
  for (const r of log) {
    container.appendChild(renderRollResult(r));
  }
}
