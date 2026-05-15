import { Phase, PhaseKey } from '../theme/tokens';

export const CYCLE_DEFAULTS = {
  length: 28,
  period: 5,
} as const;

export function phaseForDay(
  day: number,
  cycleLength: number = CYCLE_DEFAULTS.length,
  periodLength: number = CYCLE_DEFAULTS.period,
): PhaseKey {
  if (day < 1) day = 1;
  if (day > cycleLength) day = ((day - 1) % cycleLength) + 1;
  const follicularEnd = Math.min(periodLength + 7, cycleLength - 2);
  const ovulationEnd = Math.min(follicularEnd + 4, cycleLength - 1);
  if (day <= periodLength) return 'menstrual';
  if (day <= follicularEnd) return 'follicular';
  if (day <= ovulationEnd) return 'ovulation';
  return 'luteal';
}

export function daysUntilPeriod(day: number, cycleLength: number = CYCLE_DEFAULTS.length): number {
  return Math.max(0, cycleLength - day + 1);
}

export function phaseMeta(day: number, cycleLength = CYCLE_DEFAULTS.length, periodLength = CYCLE_DEFAULTS.period) {
  return Phase[phaseForDay(day, cycleLength, periodLength)];
}
