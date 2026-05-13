import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface Prediction {
  predicted_period_start: string;
  predicted_ovulation_on: string | null;
  fertile_start: string | null;
  fertile_end: string | null;
  avg_cycle_length: number;
  based_on_cycles_count: number;
  observed_ovulation_on: string | null;
  cycle_day: number | null;
  current_phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | null;
}

export function usePrediction() {
  return useQuery<Prediction | null>({
    queryKey: ['prediction'],
    queryFn: () => api.get<Prediction | null>('/api/v1/predictions/current'),
    staleTime: 5 * 60 * 1000,
  });
}
