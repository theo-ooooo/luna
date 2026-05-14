import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius } from '../../theme/tokens';
import { AuthField } from '../../components/auth/AuthField';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import Toast from 'react-native-toast-message';
import { useLogin } from '../../hooks/useAuthMutations';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Password'>;

export function PasswordScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const login = useLogin();
  const initial = email[0]?.toUpperCase() ?? 'L';

  function handleLogin() {
    if (!password) return;
    login.mutate(
      { email, password },
      { onError: (err) => Toast.show({ type: 'error', text1: '로그인 실패', text2: (err as Error).message ?? '이메일 또는 비밀번호를 확인해주세요.' }) },
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>다시 만나서{'\n'}반가워요<Text style={styles.coral}>.</Text></Text>
          </View>

          <View style={styles.emailPill}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          <View style={styles.form}>
            <AuthField
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoFocus
              accessibilityLabel="비밀번호 입력"
              trailing={
                <Text style={styles.forgotLink}>찾기</Text>
              }
            />

            <PrimaryButton onPress={handleLogin} disabled={!password} loading={login.isPending}>
              로그인
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
  hero: { marginTop: 24, marginBottom: 24 },
  eyebrow: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 1.6 },
  title: { fontSize: 44, fontFamily: 'NotoSansKR_900Black', letterSpacing: -2.2, lineHeight: 52, marginTop: 12, color: Colors.ink1 },
  coral: { color: Colors.coral },
  emailPill: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start', backgroundColor: Colors.bgCard, borderRadius: Radius.pill, padding: 10, paddingRight: 16, marginBottom: 28 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgInk, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontFamily: 'NotoSansKR_900Black', color: Colors.bg },
  emailText: { fontSize: 13, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1 },
  form: { gap: 12 },
  forgotLink: { fontSize: 11, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink3 },
});
