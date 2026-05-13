import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export function useOnboarding() {
  const qc = useQueryClient();
  const setOnboardingDone = useAuthStore(s => s.setOnboardingDone);

  const mutation = useMutation({
    mutationFn: async ({
      cycleLen,
      lastPeriodDate,
    }: {
      cycleLen: number;
      lastPeriodDate: string | null;
    }) => {
      // 주기 길이 기본값 업데이트
      await api.patch('/api/v1/users/me', { cycle_length_default: cycleLen });

      // 마지막 월경일이 선택된 경우 주기 데이터 생성
      if (lastPeriodDate != null) {
        await api.post('/api/v1/cycles', { started_on: lastPeriodDate, flow_level: 1 });
      }
    },
    onSuccess: () => {
      setOnboardingDone(true);
      qc.invalidateQueries({ queryKey: ['cycles'] });
      qc.invalidateQueries({ queryKey: ['prediction'] });
    },
  });

  return {
    submit: (cycleLen: number, lastPeriodDate: string | null) =>
      mutation.mutate({ cycleLen, lastPeriodDate }),
    isPending: mutation.isPending,
  };
}
