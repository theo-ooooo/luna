import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export function useCheckEmail() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ exists: boolean }>('/api/v1/auth/check_email', { email }),
  });
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nickname?: string;
    cycle_length_default: number;
    luteal_phase_length: number;
    period_length_default: number;
    notifications_enabled?: boolean;
    onboarding_completed: boolean;
  };
}

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth);
  const setOnboardingDone = useAuthStore(s => s.setOnboardingDone);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.post<AuthResponse>('/api/v1/auth/login', { user: { email, password } }),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      setOnboardingDone(!!user.onboarding_completed);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ message: string; code?: string }>('/api/v1/passwords/forgot', { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, code, password }: { email: string; code: string; password: string }) =>
      api.post<{ message: string }>('/api/v1/passwords/verify', { email, code, password }),
  });
}

export function useSignup() {
  const setAuth = useAuthStore(s => s.setAuth);
  const setOnboardingDone = useAuthStore(s => s.setOnboardingDone);
  return useMutation({
    mutationFn: async ({
      email, password, nickname, cycleLength, periodLength, lastPeriodDate,
    }: {
      email: string; password: string; nickname: string;
      cycleLength: number; periodLength: number; lastPeriodDate: string;
    }) => {
      const auth = await api.post<AuthResponse>('/api/v1/auth/signup', {
        user: { email, password, password_confirmation: password, nickname, cycle_length_default: cycleLength, period_length_default: periodLength },
      });
      const [py, pm, pd] = lastPeriodDate.split('-').map(Number);
      const endDate = new Date(py, pm - 1, pd + periodLength - 1);
      const endedOn = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      await api.post('/api/v1/cycles', { started_on: lastPeriodDate, ended_on: endedOn, flow_level: 1 });
      setAuth(auth.token, auth.user);
      setOnboardingDone(true);
      return auth;
    },
  });
}
