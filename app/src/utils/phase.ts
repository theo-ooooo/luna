import { Phase, PhaseKey } from '../theme/tokens';

export const CYCLE_DEFAULTS = {
  length: 28,
  period: 5,
  follicularEnd: 12,  // day ≤ this → follicular (scales with cycle length in future)
  ovulationEnd: 16,   // day ≤ this → ovulation
} as const;

export function phaseForDay(day: number, cycleLength: number = CYCLE_DEFAULTS.length): PhaseKey {
  if (day < 1) day = 1;
  if (day > cycleLength) day = ((day - 1) % cycleLength) + 1;
  if (day <= CYCLE_DEFAULTS.period) return 'menstrual';
  if (day <= CYCLE_DEFAULTS.follicularEnd) return 'follicular';
  if (day <= CYCLE_DEFAULTS.ovulationEnd) return 'ovulation';
  return 'luteal';
}

export function daysUntilPeriod(day: number, cycleLength: number = CYCLE_DEFAULTS.length): number {
  return Math.max(0, cycleLength - day + 1);
}

export function phaseMeta(day: number, cycleLength = CYCLE_DEFAULTS.length) {
  return Phase[phaseForDay(day, cycleLength)];
}
