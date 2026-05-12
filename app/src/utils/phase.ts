import { Phase, PhaseKey } from '../theme/tokens';

const CYCLE_LENGTH = 28;
const PERIOD_LENGTH = 5;

export function phaseForDay(day: number, cycleLength = CYCLE_LENGTH): PhaseKey {
  if (day < 1) day = 1;
  if (day > cycleLength) day = ((day - 1) % cycleLength) + 1;
  if (day <= PERIOD_LENGTH) return 'menstrual';
  if (day <= 12) return 'follicular';
  if (day <= 16) return 'ovulation';
  return 'luteal';
}

export function daysUntilPeriod(day: number, cycleLength = CYCLE_LENGTH): number {
  return Math.max(0, cycleLength - day + 1);
}

export function phaseMeta(day: number, cycleLength = CYCLE_LENGTH) {
  return Phase[phaseForDay(day, cycleLength)];
}
