import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface AiDailyInsight {
  content: string | null;
  generated_at: string | null;
}

export function useAiDailyInsight(date: string) {
  return useQuery<AiDailyInsight>({
    queryKey: ['ai-daily-insight', date],
    queryFn: async () => {
      try {
        return await api.get<AiDailyInsight>(`/api/v1/ai/daily_insight?date=${date}`);
      } catch {
        return { content: null, generated_at: null };
      }
    },
    staleTime: 4 * 60 * 60 * 1000, // 4시간
    retry: false,
  });
}
