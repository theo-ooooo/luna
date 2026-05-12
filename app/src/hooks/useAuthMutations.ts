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
  };
}

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.post<AuthResponse>('/api/v1/auth/login', { user: { email, password } }),
    onSuccess: ({ token, user }) => setAuth(token, user),
  });
}

export function useSignup() {
  const setAuth = useAuthStore(s => s.setAuth);
  return useMutation({
    mutationFn: async ({
      email, password, nickname, cycleLength, lastPeriodDate,
    }: {
      email: string; password: string; nickname: string;
      cycleLength: number; lastPeriodDate: string;
    }) => {
      const auth = await api.post<AuthResponse>('/api/v1/auth/signup', {
        user: { email, password, password_confirmation: password, nickname, cycle_length_default: cycleLength },
      });
      setAuth(auth.token, auth.user);
      await api.post('/api/v1/cycles', { started_on: lastPeriodDate, flow_level: 1 });
      return auth;
    },
    onSuccess: () => {},
  });
}
