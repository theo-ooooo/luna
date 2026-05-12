import { useState, useEffect, useRef } from 'react';
import type { FlowId, LHResult } from '../types/record';

export type { FlowId, LHResult };

interface DailyLogSnapshot {
  discharge_type: string | null;
  headache: number;
  cramps: number;
  fatigue: number;
  bloating: number;
  mood: number | null;
  bbt: number | null;
  lh_result: LHResult | null;
  notes: string | null;
}

const SCORE_TO_MOOD: Record<number, string> = { 5: '좋음', 4: '평온', 3: '짜증', 2: '피곤', 1: '불안' };

function logToFlow(log: DailyLogSnapshot | null | undefined): FlowId | null {
  if (!log) return null;
  if (log.discharge_type === 'none') return 'none';
  if (log.discharge_type === 'spotting') return 'spot';
  return null;
}

function logToSymptoms(log: DailyLogSnapshot | null | undefined): string[] {
  if (!log) return [];
  const s: string[] = [];
  if (log.headache > 0) s.push('두통');
  if (log.cramps === 2) s.push('경련');
  else if (log.cramps === 1) s.push('복통');
  if (log.fatigue > 0) s.push('피곤');
  if (log.bloating > 0) s.push('부종');
  return s;
}

function logToMoods(log: DailyLogSnapshot | null | undefined): string[] {
  if (!log || log.mood === null) return [];
  const mood = SCORE_TO_MOOD[log.mood];
  return mood ? [mood] : [];
}

export interface RecordFormState {
  flow: FlowId | null;
  moods: string[];
  symptoms: string[];
  bbt: string;
  lhResult: LHResult | null;
  notes: string;
  setFlow: (v: FlowId | null) => void;
  toggleMood: (v: string) => void;
  toggleSymptom: (v: string) => void;
  setBbt: (v: string) => void;
  setLhResult: (v: LHResult | null) => void;
  setNotes: (v: string) => void;
}

export function useRecordForm(todayLog?: DailyLogSnapshot | null): RecordFormState {
  const [flow, setFlow] = useState<FlowId | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bbt, setBbt] = useState('');
  const [lhResult, setLhResult] = useState<LHResult | null>(null);
  const [notes, setNotes] = useState('');
  const seeded = useRef(false);

  useEffect(() => {
    if (todayLog && !seeded.current) {
      seeded.current = true;
      setFlow(logToFlow(todayLog));
      setSymptoms(logToSymptoms(todayLog));
      setMoods(logToMoods(todayLog));
      setBbt(todayLog.bbt ? String(todayLog.bbt) : '');
      setLhResult(todayLog.lh_result ?? null);
      setNotes(todayLog.notes ?? '');
    }
  }, [todayLog]);

  function toggle<T>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  return {
    flow, moods, symptoms, bbt, lhResult, notes,
    setFlow,
    toggleMood: (v) => toggle(moods, setMoods, v),
    toggleSymptom: (v) => toggle(symptoms, setSymptoms, v),
    setBbt,
    setLhResult,
    setNotes,
  };
}
