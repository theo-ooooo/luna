import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../theme/tokens';
import { AuthField } from '../../components/auth/AuthField';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import Toast from 'react-native-toast-message';
import { useForgotPassword } from '../../hooks/useAuthMutations';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  async function handleSend() {
    const trimmed = email.trim();
    try {
      const result = await forgotPassword.mutateAsync(trimmed);
      navigation.navigate('ResetPassword', { email: trimmed, code: result.code ?? '' });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: '오류가 발생했어요',
        text2: (err as Error).message ?? '잠시 후 다시 시도해주세요.',
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
            <Text style={styles.eyebrow}>FORGOT PASSWORD</Text>
            <Text style={styles.title}>비밀번호를{'\n'}찾아볼게요<Text style={styles.coral}>.</Text></Text>
            <Text style={styles.body}>가입하신 이메일 주소를 입력하면{'\n'}6자리 인증코드를 보내드릴게요.</Text>
          </View>

          <View style={styles.form}>
            <AuthField
              label="이메일"
              value={email}
              onChangeText={setEmail}
              placeholder="아이디@도메인"
              keyboardType="email-address"
              autoFocus
              accessibilityLabel="이메일 입력"
            />

            <PrimaryButton
              onPress={handleSend}
              disabled={!EMAIL_RE.test(email.trim())}
              loading={forgotPassword.isPending}
            >
              인증코드 발송
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
  form: { gap: 12 },
});
