import React from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

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
    onboarding_completed?: boolean;
  };
}

export function AppleSignInButton() {
  const setAuth         = useAuthStore((s) => s.setAuth);
  const setOnboardingDone = useAuthStore((s) => s.setOnboardingDone);

  if (Platform.OS !== 'ios') return null;

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert('오류', 'Apple 인증 정보를 가져오지 못했어요. 다시 시도해주세요.');
        return;
      }

      const data = await api.post<AuthResponse>('/api/v1/auth/apple', {
        identity_token: credential.identityToken,
      });

      setAuth(data.token, data.user);
      // 서버의 onboarding_completed 기준으로 판단 (기기 재설치에도 안전)
      setOnboardingDone(!!data.user.onboarding_completed);
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Apple 로그인 실패', '로그인 중 문제가 발생했어요. 다시 시도해주세요.');
    }
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={12}
      style={styles.button}
      onPress={handleAppleSignIn}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    marginTop: 12,
  },
});
