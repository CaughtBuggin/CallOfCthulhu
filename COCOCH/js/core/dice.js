// Core dice utilities for Call of Cthulhu 7th edition.

export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

// Rolls `count` dice of `sides` sides. Returns { total, dice }.
export function rollDice(count, sides) {
  const dice = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const d = rollDie(sides);
    dice.push(d);
    total += d;
  }
  return { total, dice };
}

// Roll a d100 (units + tens).
export function rollD100() {
  const units = rollDie(10);
  const tens = rollDie(10) - 1; // 0-9 for tens
  // A roll of 0 on both dice is 100.
  let result = tens * 10 + units;
  if (result === 0) result = 100;
  return result;
}

// Bonus/penalty dice (7e): roll an extra tens die, take best (bonus) or worst (penalty).
export function rollD100WithPenalty(bonusDice) {
  // bonusDice > 0 => bonus (take lowest tens), < 0 => penalty (take highest tens)
  const count = Math.abs(bonusDice);
  const units = rollDie(10);
  const tensOptions = [];
  for (let i = 0; i <= count; i++) {
    tensOptions.push(rollDie(10) - 1);
  }
  let tens;
  if (bonusDice > 0) {
    tens = Math.min(...tensOptions);
  } else if (bonusDice < 0) {
    tens = Math.max(...tensOptions);
  } else {
    tens = tensOptions[0];
  }
  let result = tens * 10 + units;
  if (result === 0) result = 100;
  return { result, tensOptions, units };
}

// Grade a d100 result against a target (7e success grades).
// Returns { grade, label, color }
export function gradeResult(result, target) {
  if (target === null || target === undefined) {
    return { grade: 'roll', label: 'Roll', color: 'var(--text-dim)' };
  }
  if (result === 1) return { grade: 'critical', label: 'Critical Success', color: 'var(--gold)' };
  if (result === 100) return { grade: 'fumble', label: 'Fumble', color: 'var(--red)' };
  const fumbleThreshold = target < 50 ? 96 : 100;
  if (result >= fumbleThreshold) {
    return { grade: 'fumble', label: 'Fumble', color: 'var(--red)' };
  }
  if (result <= Math.floor(target / 5)) return { grade: 'extreme', label: 'Extreme Success', color: 'var(--purple)' };
  if (result <= Math.floor(target / 2)) return { grade: 'hard', label: 'Hard Success', color: 'var(--blue)' };
  if (result <= target) return { grade: 'success', label: 'Regular Success', color: 'var(--green)' };
  return { grade: 'fail', label: 'Failure', color: 'var(--text-faint)' };
}

// Random integer in [min, max] inclusive.
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
