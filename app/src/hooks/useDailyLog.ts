import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { FlowId, LHResult } from '../types/record';

interface DailyLog {
  id: number;
  logged_on: string;
  cramps: number;
  headache: number;
  fatigue: number;
  bloating: number;
  mood: number | null;
  discharge_type: string | null;
  flow_level: number | null;
  bbt: number | null;
  lh_result: LHResult | null;
  notes: string | null;
}

type LogFields = Omit<DailyLog, 'id' | 'logged_on'>;

const MOOD_SCORE: Record<string, number> = {
  '좋음': 5, '평온': 4, '짜증': 3, '피곤': 2, '우울': 2, '불안': 1,
};

const FLOW_TO_LEVEL: Record<FlowId, number> = {
  none: 0, spot: 1, light: 2, med: 3, heavy: 4,
};

export function buildLogFields({
  flow, moods, symptoms, bbt, lhResult, notes,
}: {
  flow: FlowId | null;
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
    discharge_type: null,
    flow_level: flow !== null ? FLOW_TO_LEVEL[flow] : null,
    bbt: bbtNum && !isNaN(bbtNum) ? bbtNum : null,
    lh_result: lhResult,
    notes: notes || null,
  };
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useLogForDate(date: string) {
  return useQuery({
    queryKey: ['dailyLog', date],
    queryFn: async () => {
      const logs = await api.get<DailyLog[]>(`/api/v1/daily_logs?from=${date}&to=${date}`);
      return logs[0] ?? null;
    },
  });
}

export function useTodayLog() {
  return useLogForDate(todayStr());
}

export function useSaveDailyLog(date: string = todayStr()) {
  const qc = useQueryClient();
  const isToday = date === todayStr();

  return useMutation({
    mutationFn: ({ id, fields }: { id?: number; fields: LogFields }) => {
      if (id) {
        return api.patch<DailyLog>(`/api/v1/daily_logs/${id}`, fields);
      }
      return api.post<DailyLog>('/api/v1/daily_logs', { ...fields, logged_on: date });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dailyLog', date] });
      qc.invalidateQueries({ queryKey: ['bbt-history'] });
      qc.invalidateQueries({ queryKey: ['symptom-heatmap'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['monthly-report'] });
      qc.invalidateQueries({ queryKey: ['prediction'] });
      qc.invalidateQueries({ queryKey: ['cycles'] });
      qc.invalidateQueries({ queryKey: ['ai-daily-insight'] });
      if (isToday) {
        import('../services/notifications').then(({ cancelLogNudge }) => cancelLogNudge()).catch(() => {});
      }
    },
  });
}
