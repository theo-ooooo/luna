import { useState } from 'react';

export type FlowId = 'none' | 'spot' | 'light' | 'med' | 'heavy';
export type LHResult = 0 | 1 | 2;

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

export function useRecordForm(): RecordFormState {
  const [flow, setFlow] = useState<FlowId | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bbt, setBbt] = useState('');
  const [lhResult, setLhResult] = useState<LHResult | null>(null);
  const [notes, setNotes] = useState('');

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
