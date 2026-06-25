import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

interface Cycle {
  id: number;
  started_on: string;
  ended_on: string | null;
  estimated_period_end: string | null;
  flow_level: number | null;
  length_days: number | null;
}

interface CyclesResponse {
  cycles: Cycle[];
  meta: { total: number; page: number; per: number };
}

export function useCycleList(per = 6) {
  return useQuery({
    queryKey: ['cycles', 'list', per],
    queryFn: async () => {
      const res = await api.get<CyclesResponse>(`/api/v1/cycles?page=1&per=${per}`);
      return res.cycles;
    },
  });
}

export function useLatestCycle() {
  return useQuery({
    queryKey: ['cycles', 'latest'],
    queryFn: async () => {
      const res = await api.get<CyclesResponse>('/api/v1/cycles?page=1&per=1');
      return res.cycles[0] ?? null;
    },
  });
}

function invalidateCycleRelated(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['cycles'] });
  qc.invalidateQueries({ queryKey: ['prediction'] });
  qc.invalidateQueries({ queryKey: ['ai-daily-insight'] });
}

export function useStartPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ flowLevel, startedOn }: { flowLevel: 1 | 2 | 3; startedOn: string }) => {
      return api.post<Cycle>('/api/v1/cycles', { started_on: startedOn, flow_level: flowLevel });
    },
    onSuccess: () => invalidateCycleRelated(qc),
  });
}

export function useEndPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cycleId, endedOn }: { cycleId: number; endedOn: string }) => {
      return api.patch<Cycle>(`/api/v1/cycles/${cycleId}`, { ended_on: endedOn });
    },
    onSuccess: () => invalidateCycleRelated(qc),
  });
}

export function useUpdateCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cycleId, startedOn, endedOn }: { cycleId: number; startedOn?: string; endedOn?: string | null }) => {
      const payload: Record<string, unknown> = {};
      if (startedOn !== undefined) payload.started_on = startedOn;
      if (endedOn !== undefined) payload.ended_on = endedOn;
      return api.patch<Cycle>(`/api/v1/cycles/${cycleId}`, payload);
    },
    onSuccess: (updatedCycle) => {
      // 캐시를 즉시 업데이트해서 refetch 전에도 달력이 바로 반영되도록
      qc.setQueriesData<Cycle[]>({ queryKey: ['cycles', 'list'] }, (old) =>
        old?.map((c) => (c.id === updatedCycle.id ? updatedCycle : c)),
      );
      qc.setQueryData<Cycle | null>(['cycles', 'latest'], (old) =>
        old?.id === updatedCycle.id ? updatedCycle : old,
      );
      invalidateCycleRelated(qc);
    },
  });
}

export type { Cycle };
