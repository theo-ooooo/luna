import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '../api/client';

export interface Stats {
  avg_bleed_days: number | null;
  avg_bbt: number | null;
  regularity_pct: number | null;
}

export function useStats() {
  return useQuery<Stats | null>({
    queryKey: ['stats'],
    queryFn: async () => {
      try {
        return await api.get<Stats>('/api/v1/stats/summary');
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}
