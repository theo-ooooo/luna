import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import type { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PeriodLen'>;

const QUICK_PICKS = [3, 4, 5, 6, 7];

export function OnboardingPeriodLenScreen({ navigation, route }: Props) {
  const { cycleLen, lastPeriodDate } = route.params;
  const [periodLen, setPeriodLen] = useState(5);

  function handleNext() {
    navigation.navigate('Nickname', { cycleLen, periodLen, lastPeriodDate });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <View style={[styles.bar, styles.barActive]} />
          <View style={[styles.bar, styles.barActive]} />
          <View style={[styles.bar, styles.barActive]} />
          <View style={styles.bar} />
        </View>
        <Text style={styles.stepLabel}>3/4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>STEP 03 · 생리 기간</Text>
        <Text style={styles.title}>보통 며칠{'\n'}지속되나요<Text style={styles.coral}>?</Text></Text>
        <Text style={styles.body}>평균은 5일이에요. 모른다면 그대로 두셔도 돼요.</Text>

        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setPeriodLen(v => Math.max(2, v - 1))}
            accessibilityRole="button"
            accessibilityLabel="생리 기간 줄이기"
          >
            <Icon name="minus" size={20} strokeWidth={2.4} color={Colors.ink1} />
          </TouchableOpacity>
          <View style={styles.stepValue}>
            <Text style={styles.stepNumber}>{periodLen}</Text>
            <Text style={styles.stepUnit}>일 / DAYS</Text>
          </View>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setPeriodLen(v => Math.min(10, v + 1))}
            accessibilityRole="button"
            accessibilityLabel="생리 기간 늘리기"
          >
            <Icon name="plus" size={20} strokeWidth={2.4} color={Colors.ink1} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          {QUICK_PICKS.map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.quick, periodLen === v && styles.quickActive]}
              onPress={() => setPeriodLen(v)}
              accessibilityRole="button"
            >
              <Text style={[styles.quickText, periodLen === v && styles.quickTextActive]}>{v}일</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 16, color: Colors.ink1 },
  progressWrap: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderSoft },
  barActive: { backgroundColor: Colors.ink1 },
  stepLabel: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, minWidth: 28, textAlign: 'right' },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  eyebrow: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 1.6 },
  title: { fontSize: 44, fontFamily: 'NotoSansKR_900Black', letterSpacing: -2.2, lineHeight: 48, marginTop: 10, color: Colors.ink1 },
  coral: { color: Colors.coral },
  body: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 14, marginBottom: 40, maxWidth: 280 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 },
  stepBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  stepValue: { alignItems: 'center', minWidth: 130 },
  stepNumber: { fontSize: 96, fontFamily: 'NotoSansKR_900Black', letterSpacing: -5, lineHeight: 100, color: Colors.ink1 },
  stepUnit: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 1.2, marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 },
  quick: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: Radius.pill, backgroundColor: Colors.bgCard },
  quickActive: { backgroundColor: Colors.bgInk },
  quickText: { fontSize: 12, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink2 },
  quickTextActive: { color: Colors.inkInv },
  footer: { paddingHorizontal: 24, paddingBottom: 36 },
  ctaBtn: {
    backgroundColor: Colors.coral,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 14, fontFamily: 'NotoSansKR_700Bold', color: '#FFFFFF' },
});
