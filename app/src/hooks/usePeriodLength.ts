import { useAuthStore } from '../store/authStore';
import { CYCLE_DEFAULTS } from '../utils/phase';

export function usePeriodLength(): number {
  return useAuthStore(s => s.user?.period_length_default ?? CYCLE_DEFAULTS.period);
}
