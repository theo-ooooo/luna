import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../theme/tokens';
import { AuthField } from '../../components/auth/AuthField';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { DomainChips, getEmailMatches } from '../../components/auth/DomainChips';
import { LunaLogo } from '../../components/ui/LunaLogo';
import { useCheckEmail } from '../../hooks/useAuthMutations';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Email'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const auto = getEmailMatches(email);
  const checkEmail = useCheckEmail();


  async function handleContinue() {
    const trimmed = email.trim();
    try {
      const result = await checkEmail.mutateAsync(trimmed);
      if (result.exists) {
        navigation.navigate('Password', { email: trimmed });
      } else {
        navigation.navigate('SignupStep1', { email: trimmed });
      }
    } catch {
      // error state handled by checkEmail.isError in the UI
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <LunaLogo size={22} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>HELLO · 안녕하세요</Text>
            <Text style={styles.title}>이메일로{'\n'}시작해요<Text style={styles.coral}>.</Text></Text>
            <Text style={styles.body}>가입 여부는 Luna가 자동으로 확인해요.</Text>
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
            {auto.show && <DomainChips local={auto.local} query={auto.query} matches={auto.matches} onPick={setEmail} />}

            {checkEmail.isError && (
              <Text style={styles.error}>이메일 확인에 실패했어요. 다시 시도해주세요.</Text>
            )}

            <View style={styles.btnWrap}>
              <PrimaryButton
                onPress={handleContinue}
                disabled={!EMAIL_RE.test(email.trim())}
                loading={checkEmail.isPending}
              >
                계속하기
              </PrimaryButton>
            </View>
          </View>

          <Text style={styles.terms}>
            계속하면 Luna의 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  logoWrap: { marginBottom: 32 },
  hero: { marginBottom: 32 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: Colors.ink3, letterSpacing: 1.6 },
  title: { fontSize: 48, fontWeight: '900', letterSpacing: -2.4, lineHeight: 46, marginTop: 12, color: Colors.ink1 },
  coral: { color: Colors.coral },
  body: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 14, maxWidth: 280 },
  form: { gap: 0 },
  btnWrap: { marginTop: 16 },
  error: { fontSize: 13, color: Colors.coral, textAlign: 'center', marginTop: 8 },
  terms: { marginTop: 'auto', paddingTop: 28, fontSize: 11, color: Colors.ink3, textAlign: 'center', lineHeight: 17 },
});
