import React from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
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
  };
}

/**
 * Apple Sign In 버튼 컴포넌트
 * iOS에서만 렌더링됩니다 (App Store 정책 상 서드파티 로그인 제공 시 필수)
 */
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
      setOnboardingDone(true);
    } catch (error: any) {
      // 사용자가 직접 취소한 경우 — 별도 알림 불필요
      if (error?.code === 'ERR_REQUEST_CANCELED') return;

      Alert.alert('Apple 로그인 실패', '로그인 중 문제가 발생했어요. 다시 시도해주세요.');
    }
  }

  return (
    <View style={styles.wrap}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={12}
        style={styles.button}
        onPress={handleAppleSignIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  button: { width: '100%', height: 50 },
});
