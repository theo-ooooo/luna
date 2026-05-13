import { useState } from 'react';
import { PhaseKey } from '../theme/tokens';

const _now = new Date();
const TODAY = { year: _now.getFullYear(), month: _now.getMonth() + 1, day: _now.getDate() };

export type PhaseFilter = 'all' | PhaseKey;

export interface CalendarState {
  year: number;
  month: number;
  selectedDay: number;
  today: typeof TODAY;
  daysInMonth: number;
  firstWeekday: number;
  activePhaseFilter: PhaseFilter;
  setSelectedDay: (d: number) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  jumpToDate: (isoDate: string) => void;
  setActivePhaseFilter: (f: PhaseFilter) => void;
}

export function useCalendar(): CalendarState {
  const [year, setYear] = useState(TODAY.year);
  const [month, setMonth] = useState(TODAY.month);
  const [selectedDay, setSelectedDay] = useState(TODAY.day);
  const [activePhaseFilter, setActivePhaseFilter] = useState<PhaseFilter>('all');

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  function clampDay(ny: number, nm: number) {
    const max = new Date(ny, nm, 0).getDate();
    setSelectedDay(d => Math.min(d, max));
  }

  function prevMonth() {
    const ny = month === 1 ? year - 1 : year;
    const nm = month === 1 ? 12 : month - 1;
    setYear(ny); setMonth(nm); clampDay(ny, nm);
  }

  function nextMonth() {
    const ny = month === 12 ? year + 1 : year;
    const nm = month === 12 ? 1 : month + 1;
    setYear(ny); setMonth(nm); clampDay(ny, nm);
  }

  function jumpToDate(isoDate: string) {
    const d = new Date(isoDate + 'T00:00:00');
    if (isNaN(d.getTime())) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 365);
    if (d > today || d < minDate) return;
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSelectedDay(d.getDate());
  }

  return {
    year, month, selectedDay, today: TODAY,
    daysInMonth, firstWeekday,
    activePhaseFilter,
    setSelectedDay, prevMonth, nextMonth,
    jumpToDate, setActivePhaseFilter,
  };
}
