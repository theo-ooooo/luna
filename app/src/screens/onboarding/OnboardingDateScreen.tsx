import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius } from '../../theme/tokens';
import type { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Date'>;

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function OnboardingDateScreen({ navigation }: Props) {
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth() + 1;
  const todayD = today.getDate();

  const [year, setYear] = useState(todayY);
  const [month, setMonth] = useState(todayM);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const isCurrentMonth = year === todayY && month === todayM;

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (isCurrentMonth) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  const grid: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedDate = selectedDay != null
    ? `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  function handleNext() {
    navigation.navigate('CycleLen', { lastPeriodDate: selectedDate });
  }

  function handleSkip() {
    navigation.navigate('CycleLen', { lastPeriodDate: null });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <View style={[styles.bar, styles.barActive]} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </View>
        <Text style={styles.stepLabel}>1/3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>STEP 01 · 마지막 월경일</Text>
        <Text style={styles.title}>마지막{'\n'}월경일은<Text style={styles.coral}>?</Text></Text>
        <Text style={styles.body}>기억이 정확하지 않아도 괜찮아요. 나중에 언제든 수정할 수 있어요.</Text>

        <View style={styles.calCard}>
          <View style={styles.calHeader}>
            <Text style={styles.calTitle}>{year}년 {month}월</Text>
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
                <Text style={styles.navIcon}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
                onPress={nextMonth}
                disabled={isCurrentMonth}
              >
                <Text style={styles.navIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.weekRow}>
            {WEEK_DAYS.map((w, i) => (
              <Text key={w} style={[styles.weekDay, i === 0 && styles.weekDaySun]}>{w}</Text>
            ))}
          </View>

          <View style={styles.dayGrid}>
            {grid.map((d, i) => {
              if (d === null) return <View key={`e-${i}`} style={styles.cell} />;
              const isFuture = year === todayY && month === todayM && d > todayD;
              const isSelected = d === selectedDay;
              const isToday = d === todayD && month === todayM && year === todayY;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.cell, isSelected && styles.cellSelected]}
                  onPress={() => !isFuture && setSelectedDay(d)}
                  disabled={isFuture}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isFuture && styles.dayTextFuture,
                  ]}>
                    {d}
                  </Text>
                  {isToday && !isSelected && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedDay != null && (
          <View style={styles.selectedCard}>
            <View>
              <Text style={styles.selectedLabel}>선택된 날짜</Text>
              <Text style={styles.selectedDate}>{month}월 {selectedDay}일</Text>
            </View>
            {isCurrentMonth && (
              <Text style={styles.daysAgo}>
                {selectedDay === todayD ? '오늘' : `${todayD - selectedDay}일 전`}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, selectedDay === null && styles.ctaBtnDisabled]}
          onPress={handleNext}
          disabled={selectedDay === null}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>다음</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleSkip}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CELL_SIZE = 44;
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
  title: { fontSize: 44, fontFamily: 'NotoSansKR_900Black', letterSpacing: -2.2, lineHeight: 42, marginTop: 10, color: Colors.ink1 },
  coral: { color: Colors.coral },
  body: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 14, marginBottom: 24, maxWidth: 280 },
  calCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.tile, padding: 16 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  calTitle: { fontSize: 13, fontFamily: 'NotoSansKR_800ExtraBold', color: Colors.ink1 },
  navRow: { flexDirection: 'row', gap: 4 },
  navBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navIcon: { fontSize: 18, color: Colors.ink1, lineHeight: 22 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDay: { width: CELL_SIZE, textAlign: 'center', fontSize: 10, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 0.6 },
  weekDaySun: { color: Colors.coral },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  cellSelected: { backgroundColor: Colors.bgInk },
  dayText: { fontSize: 13, fontFamily: 'NotoSansKR_500Medium', color: Colors.ink1 },
  dayTextSelected: { color: Colors.coral, fontFamily: 'NotoSansKR_900Black' },
  dayTextFuture: { color: Colors.ink4 },
  todayDot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.coral },
  selectedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgInk,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  selectedLabel: { fontSize: 10, fontFamily: 'NotoSansKR_700Bold', color: 'rgba(242,238,232,0.5)', letterSpacing: 1.2 },
  selectedDate: { fontSize: 18, fontFamily: 'NotoSansKR_900Black', color: Colors.inkInv, marginTop: 2 },
  daysAgo: { fontSize: 11, color: 'rgba(242,238,232,0.6)' },
  footer: { paddingHorizontal: 24, paddingBottom: 36, gap: 12 },
  ctaBtn: {
    backgroundColor: Colors.bgInk,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnDisabled: { opacity: 0.4 },
  ctaText: { fontSize: 14, fontFamily: 'NotoSansKR_700Bold', color: Colors.inkInv },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 13, color: Colors.ink3, fontFamily: 'NotoSansKR_500Medium' },
});
