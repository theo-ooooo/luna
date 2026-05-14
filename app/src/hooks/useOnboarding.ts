import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api, ApiError } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface UpdateUserResponse {
  id: number;
  email: string;
  nickname?: string;
  cycle_length_default: number;
  luteal_phase_length: number;
  period_length_default: number;
  notifications_enabled?: boolean;
  onboarding_completed: boolean;
}

export function useOnboarding() {
  const qc = useQueryClient();
  const setOnboardingDone = useAuthStore(s => s.setOnboardingDone);

  const mutation = useMutation({
    mutationFn: async ({
      cycleLen,
      periodLen,
      lastPeriodDate,
      nickname,
    }: {
      cycleLen: number;
      periodLen: number;
      lastPeriodDate: string | null;
      nickname?: string;
    }) => {
      // 주기 길이 + 생리 기간 + 닉네임 + 온보딩 완료 플래그 업데이트
      const response = await api.patch<UpdateUserResponse>('/api/v1/users/me', {
        cycle_length_default: cycleLen,
        period_length_default: periodLen,
        onboarding_completed: true,
        ...(nickname ? { nickname } : {}),
      });
      const { token, setAuth } = useAuthStore.getState();
      if (token && response) {
        setAuth(token, response);
      }

      // 마지막 월경일이 선택된 경우 완료된 주기로 생성 (ended_on 포함해 생리중 표시 방지)
      if (lastPeriodDate != null) {
        const endDate = new Date(lastPeriodDate);
        endDate.setDate(endDate.getDate() + periodLen - 1);
        const endedOn = endDate.toISOString().split('T')[0];
        try {
          await api.post('/api/v1/cycles', { started_on: lastPeriodDate, ended_on: endedOn, flow_level: 1 });
        } catch (e) {
          if (!(e instanceof ApiError && e.code === 'DUPLICATE_DATE')) throw e;
        }
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
    submit: (cycleLen: number, periodLen: number, lastPeriodDate: string | null, nickname?: string) =>
      mutation.mutate({ cycleLen, periodLen, lastPeriodDate, nickname }),
    isPending: mutation.isPending,
  };
}
