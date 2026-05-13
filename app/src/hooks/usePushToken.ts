import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export function useRegisterPushToken() {
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    if (!token) return;
    registerToken().catch(() => {});
  }, [token]);
}

async function registerToken() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await api.put('/api/v1/push_tokens', {
    token: pushToken,
    platform: Platform.OS,
  });
}
