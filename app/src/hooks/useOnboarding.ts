import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface UpdateUserResponse {
  user: {
    id: number;
    email: string;
    nickname?: string;
    cycle_length_default: number;
    luteal_phase_length: number;
    period_length_default: number;
    notifications_enabled?: boolean;
  };
}

export function useOnboarding() {
  const qc = useQueryClient();
  const setOnboardingDone = useAuthStore(s => s.setOnboardingDone);

  const mutation = useMutation({
    mutationFn: async ({
      cycleLen,
      lastPeriodDate,
      nickname,
    }: {
      cycleLen: number;
      lastPeriodDate: string | null;
      nickname?: string;
    }) => {
      // 주기 길이 + 닉네임 + 온보딩 완료 플래그 업데이트
      const response = await api.patch<UpdateUserResponse>('/api/v1/users/me', {
        cycle_length_default: cycleLen,
        onboarding_completed: true,
        ...(nickname ? { nickname } : {}),
      });
      const { token, setAuth } = useAuthStore.getState();
      if (token && response.user) {
        setAuth(token, response.user);
      }

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
    onError: () => {
      Toast.show({ type: 'error', text1: '오류가 발생했어요', text2: '다시 시도해 주세요.' });
    },
  });

  return {
    submit: (cycleLen: number, lastPeriodDate: string | null, nickname?: string) =>
      mutation.mutate({ cycleLen, lastPeriodDate, nickname }),
    isPending: mutation.isPending,
  };
}
