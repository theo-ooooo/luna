import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

interface Cycle {
  id: number;
  started_on: string;
  ended_on: string | null;
  flow_level: number | null;
  length_days: number | null;
}

export function useLatestCycle() {
  return useQuery({
    queryKey: ['cycles', 'latest'],
    queryFn: async () => {
      const res = await api.get<{ cycles: Cycle[] }>('/api/v1/cycles?page=1&per=1');
      return res.cycles[0] ?? null;
    },
  });
}

export function useStartPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flowLevel: 1 | 2 | 3) => {
      const today = todayStr();
      return api.post<Cycle>('/api/v1/cycles', { started_on: today, flow_level: flowLevel });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles'] });
      qc.invalidateQueries({ queryKey: ['prediction'] });
    },
  });
}

export function useEndPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: number) => {
      const today = todayStr();
      return api.patch<Cycle>(`/api/v1/cycles/${cycleId}`, { ended_on: today });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles'] });
      qc.invalidateQueries({ queryKey: ['prediction'] });
    },
  });
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
