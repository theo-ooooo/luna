import { useState, useEffect, useRef } from 'react';
import type { FlowId, LHResult } from '../types/record';

export type { FlowId, LHResult };

interface DailyLogSnapshot {
  discharge_type: string | null;
  flow_level?: number | null;
  headache: number;
  cramps: number;
  fatigue: number;
  bloating: number;
  backache?: boolean;
  breast_pain?: boolean;
  nausea?: boolean;
  acne?: boolean;
  increased_appetite?: boolean;
  dizziness?: boolean;
  mood: number | null;
  bbt: number | null;
  lh_result: LHResult | null;
  notes: string | null;
}

const SCORE_TO_MOOD: Record<number, string> = { 5: '좋음', 4: '평온', 3: '짜증', 2: '피곤', 1: '불안' };

function logToFlow(log: DailyLogSnapshot | null | undefined): FlowId | null {
  if (!log) return null;
  const lvl = log.flow_level;
  if (lvl === 0) return 'none';
  if (lvl === 1) return 'spot';
  if (lvl === 2) return 'light';
  if (lvl === 3) return 'med';
  if (lvl === 4) return 'heavy';
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
  if (log.backache) s.push('요통');
  if (log.breast_pain) s.push('유방통');
  if (log.nausea) s.push('메스꺼움');
  if (log.acne) s.push('여드름');
  if (log.increased_appetite) s.push('식욕증가');
  if (log.dizziness) s.push('어지러움');
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
  setMoods: (v: string[]) => void;
  setSymptoms: (v: string[]) => void;
  toggleMood: (v: string) => void;
  toggleSymptom: (v: string) => void;
  setBbt: (v: string) => void;
  setLhResult: (v: LHResult | null) => void;
  setNotes: (v: string) => void;
}

export function useRecordForm(todayLog?: DailyLogSnapshot | null, dateKey?: string): RecordFormState {
  const [flow, setFlow] = useState<FlowId | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bbt, setBbt] = useState('');
  const [lhResult, setLhResult] = useState<LHResult | null>(null);
  const [notes, setNotes] = useState('');
  const seeded = useRef(false);
  const prevDateKey = useRef(dateKey);

  useEffect(() => {
    if (dateKey !== undefined && dateKey !== prevDateKey.current) {
      prevDateKey.current = dateKey;
      seeded.current = false;
      setFlow(null);
      setMoods([]);
      setSymptoms([]);
      setBbt('');
      setLhResult(null);
      setNotes('');
    }
  }, [dateKey]);

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

  // 기분은 단일 선택: 같은 항목 탭 시 해제, 다른 항목 탭 시 교체
  function toggleMoodSingle(val: string) {
    setMoods(moods.includes(val) ? [] : [val]);
  }

  return {
    flow, moods, symptoms, bbt, lhResult, notes,
    setFlow,
    setMoods,
    setSymptoms,
    toggleMood: toggleMoodSingle,
    toggleSymptom: (v) => toggle(symptoms, setSymptoms, v),
    setBbt,
    setLhResult,
    setNotes,
  };
}
