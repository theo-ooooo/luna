import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface ProfileUpdate {
  nickname?: string;
  cycle_length_default?: number;
  luteal_phase_length?: number;
  period_length_default?: number;
  notifications_enabled?: boolean;
}

interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  cycle_length_default: number;
  luteal_phase_length: number;
  period_length_default: number;
  notifications_enabled: boolean;
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setAuth = useAuthStore(s => s.setAuth);
  const token = useAuthStore(s => s.token);

  return useMutation({
    mutationFn: (data: ProfileUpdate) =>
      api.patch<UserResponse>('/api/v1/users/me', data),
    onSuccess: (updatedUser) => {
      if (token) setAuth(token, updatedUser);
      qc.invalidateQueries({ queryKey: ['prediction'] });
    },
  });
}
