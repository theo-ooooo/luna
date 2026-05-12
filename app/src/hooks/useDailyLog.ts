import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { LHResult } from '../types/record';

interface DailyLog {
  id: number;
  logged_on: string;
  cramps: number;
  headache: number;
  fatigue: number;
  bloating: number;
  mood: number | null;
  bbt: number | null;
  lh_result: LHResult | null;
  notes: string | null;
}

type LogFields = Omit<DailyLog, 'id' | 'logged_on'>;

const MOOD_SCORE: Record<string, number> = {
  '좋음': 5, '평온': 4, '짜증': 3, '피곤': 2, '우울': 2, '불안': 1,
};

export function buildLogFields({
  moods, symptoms, bbt, lhResult, notes,
}: {
  moods: string[];
  symptoms: string[];
  bbt: string;
  lhResult: LHResult | null;
  notes: string;
}): LogFields {
  const bbtNum = bbt ? parseFloat(bbt) : null;
  return {
    headache: symptoms.includes('두통') ? 1 : 0,
    cramps: symptoms.includes('경련') ? 2 : symptoms.includes('복통') ? 1 : 0,
    fatigue: moods.includes('피곤') ? 1 : 0,
    bloating: symptoms.includes('부종') ? 1 : 0,
    mood: moods.length > 0 ? (MOOD_SCORE[moods[0]] ?? null) : null,
    bbt: bbtNum && !isNaN(bbtNum) ? bbtNum : null,
    lh_result: lhResult,
    notes: notes || null,
  };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useTodayLog() {
  const today = todayStr();
  return useQuery({
    queryKey: ['dailyLog', today],
    queryFn: async () => {
      const logs = await api.get<DailyLog[]>(`/api/v1/daily_logs?from=${today}&to=${today}`);
      return logs[0] ?? null;
    },
  });
}

export function useSaveDailyLog() {
  const qc = useQueryClient();
  const today = todayStr();

  return useMutation({
    mutationFn: ({ id, fields }: { id?: number; fields: LogFields }) => {
      if (id) {
        return api.patch<DailyLog>(`/api/v1/daily_logs/${id}`, fields);
      }
      return api.post<DailyLog>('/api/v1/daily_logs', { ...fields, logged_on: today });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dailyLog', today] }),
  });
}
