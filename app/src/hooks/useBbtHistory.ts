import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '../api/client';

export interface BbtPoint {
  date: string;
  bbt: number;
}

export interface BbtHistory {
  data: BbtPoint[];
  cycle_start: string;
  ovulation_on: string | null;
}

export function useBbtHistory() {
  return useQuery<BbtHistory | null>({
    queryKey: ['bbt-history'],
    queryFn: async () => {
      try {
        return await api.get<BbtHistory>('/api/v1/daily_logs/bbt_history');
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
