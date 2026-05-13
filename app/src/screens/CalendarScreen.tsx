import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors, Radius } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { PhaseLegend } from '../components/calendar/PhaseLegend';
import { DayCell } from '../components/calendar/DayCell';
import { DayDetailCard } from '../components/calendar/DayDetailCard';
import { InsightsBody } from '../components/insights/InsightsBody';
import { DateSearchSheet } from '../components/home/DateSearchSheet';
import { useCalendar } from '../hooks/useCalendar';
import { useLatestCycle } from '../hooks/useCycles';
import { usePrediction } from '../hooks/usePrediction';
import { phaseForDay, CYCLE_DEFAULTS } from '../utils/phase';
import type { PhaseFilter } from '../hooks/useCalendar';
import type { TabParamList } from '../navigation/TabNavigator';

const WEEK_HEADERS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const CONTENT_PADDING = 16;
const TILE_PADDING = 18;

type Tab = 'calendar' | 'insights';

interface PhaseChipOption {
  label: string;
  value: PhaseFilter;
}

const PHASE_CHIPS: PhaseChipOption[] = [
  { label: '전체', value: 'all' },
  { label: '생리기', value: 'menstrual' },
  { label: '난포기', value: 'follicular' },
  { label: '배란기', value: 'ovulation' },
  { label: '황체기', value: 'luteal' },
];

export function CalendarScreen() {
  const { width: screenW } = useWindowDimensions();
  const cellSize = Math.floor((screenW - 32 - 24) / 7);
  const chartW = screenW - CONTENT_PADDING * 2 - TILE_PADDING * 2;
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [searchVisible, setSearchVisible] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  const {
    year, month, selectedDay, today,
    daysInMonth, firstWeekday,
    selectedPhaseKey,
    activePhaseFilter,
    setSelectedDay, prevMonth, nextMonth,
    jumpToDate, setActivePhaseFilter,
  } = useCalendar();

  const { data: latestCycle } = useLatestCycle();
  const { data: prediction } = usePrediction();

  const cycleLength = prediction?.avg_cycle_length ?? CYCLE_DEFAULTS.length;

  // Compute cycle start date: from latestCycle.started_on, or estimate from prediction.cycle_day
  const cycleStartMs = useMemo(() => {
    if (latestCycle?.started_on) {
      return new Date(latestCycle.started_on + 'T00:00:00').getTime();
    }
    if (prediction?.cycle_day) {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      t.setDate(t.getDate() - (prediction.cycle_day - 1));
      return t.getTime();
    }
    return null;
  }, [latestCycle?.started_on, prediction?.cycle_day]);

  // Pre-compute phase per day-of-month for the current view
  const dayPhases = useMemo(() => {
    if (activePhaseFilter === 'all' || cycleStartMs === null) return null;
    const phases: Record<number, string> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dayMs = new Date(year, month - 1, d).getTime();
      const cycleDay = Math.floor((dayMs - cycleStartMs) / 86_400_000) + 1;
      phases[d] = cycleDay >= 1 ? phaseForDay(cycleDay, cycleLength) : 'follicular';
    }
    return phases;
  }, [activePhaseFilter, cycleStartMs, year, month, daysInMonth, cycleLength]);

  const grid: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthEn = new Date(year, month - 1).toLocaleString('en', { month: 'short' }).toUpperCase();

  const selectedDate = new Date(year, month - 1, selectedDay);
  const isFutureDate = selectedDate > new Date(today.year, today.month - 1, today.day);

  const handleRecord = useCallback(() => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    navigation.navigate('Record', { date });
  }, [year, month, selectedDay, navigation]);

  function isDimmed(day: number): boolean {
    if (activePhaseFilter === 'all' || dayPhases === null) return false;
    return dayPhases[day] !== activePhaseFilter;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>캘린더</Text>
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segBtn, activeTab === 'calendar' && styles.segBtnActive]}
            onPress={() => setActiveTab('calendar')}
            accessibilityRole="button"
            accessibilityLabel="캘린더"
          >
            <Text style={[styles.segText, activeTab === 'calendar' && styles.segTextActive]}>캘린더</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, activeTab === 'insights' && styles.segBtnActive]}
            onPress={() => setActiveTab('insights')}
            accessibilityRole="button"
            accessibilityLabel="인사이트"
          >
            <Text style={[styles.segText, activeTab === 'insights' && styles.segTextActive]}>인사이트</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'calendar' ? (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.monthHeader}>
              <View>
                <Text style={styles.monthEn}>{monthEn} · {year}</Text>
                <Text style={styles.monthKo}>{month}월<Text style={{ color: Colors.coral }}>.</Text></Text>
              </View>
              <View style={styles.monthNav}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => setSearchVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="날짜 검색"
                >
                  <Icon name="search" size={18} strokeWidth={2.2} color={Colors.ink2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={prevMonth} accessibilityRole="button" accessibilityLabel="이전 달">
                  <Icon name="chevLeft" size={18} strokeWidth={2.2} color={Colors.ink2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={nextMonth} accessibilityRole="button" accessibilityLabel="다음 달">
                  <Icon name="chev" size={18} strokeWidth={2.2} color={Colors.ink2} />
                </TouchableOpacity>
              </View>
            </View>

            <PhaseLegend />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScroll}
            >
              {PHASE_CHIPS.map(chip => (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.filterChip,
                    activePhaseFilter === chip.value && styles.filterChipActive,
                  ]}
                  onPress={() => setActivePhaseFilter(chip.value)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={chip.label}
                  accessibilityState={{ selected: activePhaseFilter === chip.value }}
                >
                  <Text style={[
                    styles.filterChipText,
                    activePhaseFilter === chip.value && styles.filterChipTextActive,
                  ]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.weekHeaders}>
              {WEEK_HEADERS.map((w, i) => (
                <View key={w} style={[styles.weekHeaderCell, { width: cellSize }]}>
                  <Text style={[styles.weekHeaderText, i === 0 && styles.weekHeaderSun]}>{w}</Text>
                </View>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {grid.map((d, i) =>
                d === null
                  ? <View key={`e-${i}`} style={{ width: cellSize, height: cellSize }} />
                  : <DayCell
                      key={d}
                      day={d}
                      month={month}
                      size={cellSize}
                      isToday={d === today.day && month === today.month && year === today.year}
                      isSelected={d === selectedDay}
                      dimmed={isDimmed(d)}
                      onPress={setSelectedDay}
                    />
              )}
            </View>

            <DayDetailCard
              day={selectedDay}
              month={month}
              phaseKey={selectedPhaseKey}
              isToday={selectedDay === today.day && month === today.month && year === today.year}
              logChips={[]}
              onRecord={isFutureDate ? undefined : handleRecord}
            />
          </ScrollView>

          <DateSearchSheet
            visible={searchVisible}
            onClose={() => setSearchVisible(false)}
            onSelect={jumpToDate}
          />
        </>
      ) : (
        <InsightsBody chartW={chartW} scrollable />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.bgAlt,
    borderRadius: Radius.pill,
    padding: 3,
  },
  segBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  segBtnActive: {
    backgroundColor: Colors.bgCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segText: { fontSize: 12, fontWeight: '600', color: Colors.ink3 },
  segTextActive: { color: Colors.ink1, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4,
  },
  monthEn: { fontSize: 12, fontWeight: '700', color: Colors.ink3, letterSpacing: 0.6 },
  monthKo: { fontSize: 36, fontWeight: '900', letterSpacing: -1.5, lineHeight: 40, marginTop: 4, color: Colors.ink1 },
  monthNav: { flexDirection: 'row', gap: 6 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { marginHorizontal: -16 },
  filterRow: { paddingHorizontal: 16, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgAlt,
  },
  filterChipActive: {
    backgroundColor: Colors.coral,
  },
  filterChipText: {
    fontSize: 12, fontWeight: '600', color: Colors.ink2,
  },
  filterChipTextActive: {
    color: Colors.bgCard,
    fontWeight: '700',
  },
  weekHeaders: { flexDirection: 'row', gap: 4 },
  weekHeaderCell: { alignItems: 'center', paddingVertical: 4 },
  weekHeaderText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.ink3 },
  weekHeaderSun: { color: Colors.coral },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
