import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

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
    mutationFn: ({ email, password, nickname }: { email: string; password: string; nickname: string }) =>
      api.post<AuthResponse>('/api/v1/auth/signup', { user: { email, password, password_confirmation: password, nickname } }),
    onSuccess: ({ token, user }) => setAuth(token, user),
  });
}
