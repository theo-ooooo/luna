import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../theme/tokens';
import { AuthField } from '../../components/auth/AuthField';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignupStep1'>;

function StrengthBar({ password }: { password: string }) {
  const score = Math.min(4, Math.floor(password.length / 2));
  const label = score < 2 ? '약함' : score < 3 ? '보통' : '강함';
  const color = score >= 3 ? Colors.ink1 : Colors.coral;
  return (
    <View style={sbStyles.row}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={[sbStyles.bar, i < score && { backgroundColor: color }]} />
      ))}
      <Text style={sbStyles.label}>{label}</Text>
    </View>
  );
}
const sbStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, paddingHorizontal: 4 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.borderSoft },
  label: { fontSize: 10, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, marginLeft: 6 },
});

export function SignupStep1Screen({ navigation, route }: Props) {
  const { email } = route.params;
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            {[1, 2, 3].map(i => <View key={i} style={[styles.bar, i <= 1 && styles.barActive]} />)}
          </View>
          <Text style={styles.stepLabel}>1/3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>STEP 01 · 프로필</Text>
            <Text style={styles.title}>새 계정을{'\n'}만들어요<Text style={styles.coral}>.</Text></Text>
            <View style={styles.emailPill}>
              <View style={styles.checkCircle}><Text style={styles.check}>✓</Text></View>
              <Text style={styles.emailText}>{email}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <AuthField
              label="호칭"
              value={nickname}
              onChangeText={setNickname}
              placeholder="Luna"
              accessibilityLabel="닉네임 입력"
            />
            <View>
              <AuthField
                label="비밀번호"
                value={password}
                onChangeText={setPassword}
                placeholder="8자 이상"
                secureTextEntry
                accessibilityLabel="비밀번호 입력"
              />
              {password.length > 0 && <StrengthBar password={password} />}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            onPress={() => navigation.navigate('SignupStep2', { email, nickname, password })}
            disabled={password.length < 8}
          >
            다음
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 16, color: Colors.ink1 },
  progressWrap: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderSoft },
  barActive: { backgroundColor: Colors.ink1 },
  stepLabel: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, minWidth: 28, textAlign: 'right' },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  hero: { marginBottom: 28 },
  eyebrow: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 1.6 },
  title: { fontSize: 44, fontFamily: 'NotoSansKR_900Black', letterSpacing: -2.2, lineHeight: 52, marginTop: 10, color: Colors.ink1 },
  coral: { color: Colors.coral },
  emailPill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: Colors.bgCard, borderRadius: 999, paddingVertical: 8, paddingLeft: 8, paddingRight: 12, marginTop: 12 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.bgInk, alignItems: 'center', justifyContent: 'center' },
  check: { fontSize: 11, color: Colors.coral, fontFamily: 'NotoSansKR_900Black' },
  emailText: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink2 },
  form: { gap: 10 },
  footer: { paddingHorizontal: 24, paddingBottom: 36 },
});
