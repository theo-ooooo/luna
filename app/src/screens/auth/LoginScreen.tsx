import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius } from '../../theme/tokens';
import { AuthInput } from '../../components/auth/AuthInput';
import { useLogin } from '../../hooks/useAuthMutations';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function handleLogin() {
    if (!email.trim() || !password) return;
    login.mutate({ email: email.trim(), password });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Luna</Text>
          <Text style={styles.heroSub}>나의 주기를 과학적으로.</Text>
        </View>

        <View style={styles.form}>
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
            onChangeText={setPassword}
            placeholder="8자 이상"
            secureTextEntry
            accessibilityLabel="비밀번호 입력"
          />

          {login.isError && (
            <Text style={styles.errorBanner}>
              {(login.error as Error)?.message ?? '로그인에 실패했어요.'}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, login.isPending && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={login.isPending}
            accessibilityRole="button"
            accessibilityLabel="로그인"
          >
            {login.isPending
              ? <ActivityIndicator color={Colors.inkInv} />
              : <Text style={styles.primaryBtnText}>로그인</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => navigation.navigate('Signup')}
          accessibilityRole="button"
        >
          <Text style={styles.switchText}>계정이 없으신가요? <Text style={styles.switchAccent}>회원가입</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 48 },
  heroTitle: { fontSize: 48, fontWeight: '900', letterSpacing: -2, color: Colors.ink1 },
  heroSub: { fontSize: 15, color: Colors.ink3, marginTop: 8 },
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
  switchBtn: { marginTop: 'auto', paddingTop: 32, alignItems: 'center' },
  switchText: { fontSize: 14, color: Colors.ink3 },
  switchAccent: { color: Colors.coral, fontWeight: '700' },
});
