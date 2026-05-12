import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '../api/client';

export interface MonthlyReport {
  year: number;
  month: number;
  summary: string;
  stats: Record<string, unknown>;
  generated_at: string;
}

export function useMonthlyReport(year: number, month: number) {
  return useQuery<MonthlyReport | null>({
    queryKey: ['monthly-report', year, month],
    queryFn: async () => {
      try {
        return await api.get<MonthlyReport>(`/api/v1/ai/monthly_report?year=${year}&month=${month}`);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    staleTime: 60 * 60 * 1000, // 1h — report doesn't change often
  });
}
