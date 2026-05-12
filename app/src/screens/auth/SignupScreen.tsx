import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius } from '../../theme/tokens';
import { AuthInput } from '../../components/auth/AuthInput';
import { useSignup } from '../../hooks/useAuthMutations';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [pwError, setPwError] = useState('');
  const signup = useSignup();

  function handleSignup() {
    setPwError('');
    if (password.length < 8) { setPwError('비밀번호는 8자 이상이어야 해요.'); return; }
    if (!email.trim()) return;
    signup.mutate({ email: email.trim(), password, nickname: nickname.trim() });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로">
            <Text style={styles.back}>← 로그인</Text>
          </TouchableOpacity>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.sub}>루나와 함께 나의 주기를 기록해 보세요.</Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            label="닉네임"
            value={nickname}
            onChangeText={setNickname}
            placeholder="예: 지연"
            accessibilityLabel="닉네임 입력"
          />
          <AuthInput
            label="이메일"
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            accessibilityLabel="이메일 입력"
          />
          <AuthInput
            label="비밀번호"
            value={password}
            onChangeText={v => { setPassword(v); setPwError(''); }}
            placeholder="8자 이상"
            secureTextEntry
            error={pwError}
            accessibilityLabel="비밀번호 입력"
          />

          {signup.isError && (
            <Text style={styles.errorBanner}>
              {(signup.error as Error)?.message ?? '회원가입에 실패했어요.'}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, signup.isPending && styles.primaryBtnDisabled]}
            onPress={handleSignup}
            disabled={signup.isPending}
            accessibilityRole="button"
            accessibilityLabel="회원가입"
          >
            {signup.isPending
              ? <ActivityIndicator color={Colors.inkInv} />
              : <Text style={styles.primaryBtnText}>시작하기</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  header: { marginBottom: 40 },
  back: { fontSize: 14, color: Colors.ink3, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, color: Colors.ink1 },
  sub: { fontSize: 14, color: Colors.ink3, marginTop: 8 },
  form: { gap: 16 },
  errorBanner: { fontSize: 13, color: Colors.coral, textAlign: 'center' },
  primaryBtn: {
    height: 52, borderRadius: Radius.pill,
    backgroundColor: Colors.bgInk,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.inkInv },
});
