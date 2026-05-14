import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export function useRegisterPushToken() {
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    if (!token) return;
    registerToken().catch(() => {});

    // 앱 복귀 시 재시도 — 설정에서 권한 허용 후 돌아온 경우 처리
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') registerToken().catch(() => {});
    });
    return () => sub.remove();
  }, [token]);
}

async function registerToken() {
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: requested } = await Notifications.requestPermissionsAsync();
    status = requested;
  }
  if (status !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await api.put('/api/v1/push_tokens', {
    token: pushToken,
    platform: Platform.OS,
  });
}
