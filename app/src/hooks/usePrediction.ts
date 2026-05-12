import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

interface Prediction {
  predicted_period_start: string;
  predicted_ovulation_on: string;
  fertile_start: string;
  fertile_end: string;
  avg_cycle_length: number;
  based_on_cycles_count: number;
  observed_ovulation_on: string | null;
  cycle_day: number;
  current_phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
}

export function usePrediction() {
  return useQuery<Prediction>({
    queryKey: ['prediction'],
    queryFn: () => api.get<Prediction>('/api/v1/predictions/current'),
    staleTime: 5 * 60 * 1000,
  });
}
