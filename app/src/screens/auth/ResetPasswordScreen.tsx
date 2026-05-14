import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../theme/tokens';
import { AuthField } from '../../components/auth/AuthField';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import Toast from 'react-native-toast-message';
import { useResetPassword } from '../../hooks/useAuthMutations';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { email, code: prefilledCode } = route.params;
  const [code, setCode] = useState(prefilledCode ?? '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const resetPassword = useResetPassword();

  const isValid = code.length === 6 && password.length >= 8 && password === passwordConfirm;

  async function handleReset() {
    if (!isValid) return;
    try {
      await resetPassword.mutateAsync({ email, code, password });
      Toast.show({ type: 'success', text1: '비밀번호가 변경되었어요', text2: '새 비밀번호로 로그인해주세요.' });
      navigation.navigate('Password', { email });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: '변경 실패',
        text2: (err as Error).message ?? '인증코드 또는 비밀번호를 확인해주세요.',
      });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>RESET PASSWORD</Text>
            <Text style={styles.title}>새 비밀번호를{'\n'}설정해요<Text style={styles.coral}>.</Text></Text>
            <Text style={styles.body}>
              <Text style={styles.emailHighlight}>{email}</Text>
              {'\n'}로 발송된 6자리 코드를 입력해주세요.
            </Text>
          </View>

          <View style={styles.form}>
            <AuthField
              label="인증코드"
              value={code}
              onChangeText={setCode}
              placeholder="6자리 숫자"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              accessibilityLabel="인증코드 입력"
            />

            <AuthField
              label="새 비밀번호"
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상"
              secureTextEntry
              accessibilityLabel="새 비밀번호 입력"
            />

            <AuthField
              label="비밀번호 확인"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호 재입력"
              secureTextEntry
              accessibilityLabel="비밀번호 확인 입력"
            />

            {passwordConfirm.length > 0 && password !== passwordConfirm && (
              <Text style={styles.error}>비밀번호가 일치하지 않아요.</Text>
            )}

            <PrimaryButton
              onPress={handleReset}
              disabled={!isValid}
              loading={resetPassword.isPending}
            >
              비밀번호 변경
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 16, color: Colors.ink1 },
  hero: { marginTop: 24, marginBottom: 32 },
  eyebrow: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 1.6 },
  title: { fontSize: 44, fontFamily: 'NotoSansKR_900Black', letterSpacing: -2.2, lineHeight: 52, marginTop: 12, color: Colors.ink1 },
  coral: { color: Colors.coral },
  body: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 14, maxWidth: 280 },
  emailHighlight: { fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1 },
  form: { gap: 12 },
  error: { fontSize: 12, color: Colors.coral, marginTop: -4 },
});
