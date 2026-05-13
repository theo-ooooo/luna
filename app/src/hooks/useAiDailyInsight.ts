import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface AiDailyInsight {
  content: string | null;
  generated_at: string | null;
}

export function useAiDailyInsight(date: string) {
  return useQuery<AiDailyInsight>({
    queryKey: ['ai-daily-insight', date],
    queryFn: () => api.get<AiDailyInsight>(`/api/v1/ai/daily_insight?date=${date}`),
    staleTime: 4 * 60 * 60 * 1000, // 4시간
    retry: false,
  });
}
