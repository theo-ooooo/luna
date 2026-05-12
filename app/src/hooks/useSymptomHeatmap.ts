import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '../api/client';

export interface SymptomHeatmap {
  symptoms: string[];
  weeks: number;
  grid: number[][];
}

export function useSymptomHeatmap() {
  return useQuery<SymptomHeatmap | null>({
    queryKey: ['symptom-heatmap'],
    queryFn: async () => {
      try {
        return await api.get<SymptomHeatmap>('/api/v1/daily_logs/symptom_heatmap');
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
