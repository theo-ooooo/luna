import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  email: string;
  nickname?: string;
  cycle_length_default: number;
  luteal_phase_length: number;
  period_length_default: number;
  notifications_enabled?: boolean;
  onboarding_completed: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  onboardingDone: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setOnboardingDone: (v: boolean) => void;
}

const secureStorage = createJSONStorage<AuthState>(() => ({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      onboardingDone: false,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null, onboardingDone: false }),
      setOnboardingDone: (v: boolean) => set({ onboardingDone: v }),
    }),
    {
      name: 'luna-auth',
      storage: secureStorage,
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 온보딩 기능 추가 전에 이미 로그인한 유저는 온보딩 완료로 처리
        if (version < 1 && persistedState.token) {
          return { ...persistedState, onboardingDone: true };
        }
        return persistedState;
      },
    },
  ),
);
