import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius } from '../../theme/tokens';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Nickname'>;

export function OnboardingNicknameScreen({ route, navigation }: Props) {
  const { cycleLen, lastPeriodDate } = route.params;
  const [nickname, setNickname] = useState('');
  const { submit, isPending } = useOnboarding();

  function handleStart() {
    submit(cycleLen, lastPeriodDate, nickname.trim() || undefined);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={[styles.bar, styles.barActive]} />
            <View style={[styles.bar, styles.barActive]} />
            <View style={[styles.bar, styles.barActive]} />
          </View>
          <Text style={styles.stepLabel}>3/3</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>STEP 03 · 호칭</Text>
          <Text style={styles.title}>어떻게{'\n'}불러드릴까요<Text style={styles.coral}>?</Text></Text>
          <Text style={styles.body}>나중에 설정에서 언제든지 바꿀 수 있어요.</Text>

          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임 (선택)"
            placeholderTextColor={Colors.ink4}
            maxLength={20}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
            onPress={handleStart}
            disabled={isPending}
            activeOpacity={0.85}
          >
            {isPending
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.ctaText}>Luna 시작하기</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 16, color: Colors.ink1 },
  progressWrap: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderSoft },
  barActive: { backgroundColor: Colors.ink1 },
  stepLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.ink3,
    minWidth: 28,
    textAlign: 'right',
  },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  eyebrow: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 1.6 },
  title: {
    fontSize: 44,
    fontFamily: 'NotoSansKR_900Black',
    letterSpacing: -2.2,
    lineHeight: 48,
    marginTop: 10,
    color: Colors.ink1,
  },
  coral: { color: Colors.coral },
  body: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 14, marginBottom: 40 },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.tile,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'NotoSansKR_600SemiBold',
    color: Colors.ink1,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 36 },
  ctaBtn: {
    backgroundColor: Colors.coral,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnDisabled: { backgroundColor: Colors.ink4 },
  ctaText: { fontSize: 14, fontFamily: 'NotoSansKR_700Bold', color: '#FFFFFF' },
});
