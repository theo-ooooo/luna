import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors, Radius } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { PhaseLegend } from '../components/calendar/PhaseLegend';
import { DayCell } from '../components/calendar/DayCell';
import { InsightsBody } from '../components/insights/InsightsBody';
import { DateSearchSheet } from '../components/home/DateSearchSheet';
import { DayActionSheet } from '../components/calendar/DayActionSheet';
import type { DayAction } from '../components/calendar/DayActionSheet';
import { useCalendar } from '../hooks/useCalendar';
import { useLatestCycle, useStartPeriod, useEndPeriod, useCycleList, useUpdateCycle } from '../hooks/useCycles';
import type { Cycle } from '../hooks/useCycles';
import { usePrediction } from '../hooks/usePrediction';
import { useLogForDate } from '../hooks/useDailyLog';
import { PeriodDateSheet } from '../components/home/PeriodDateSheet';
import { CycleEditSheet } from '../components/home/CycleEditSheet';
import Toast from 'react-native-toast-message';
import { ApiError } from '../api/client';
import { phaseForDay, CYCLE_DEFAULTS } from '../utils/phase';
import { usePeriodLength } from '../hooks/usePeriodLength';
import type { PhaseFilter } from '../hooks/useCalendar';
import type { PhaseKey } from '../theme/tokens';
import type { TabParamList } from '../navigation/TabNavigator';

const WEEK_HEADERS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const CONTENT_PADDING = 16;
const TILE_PADDING = 18;

interface PhaseChipOption {
  label: string;
  value: PhaseFilter;
}

const PHASE_CHIPS: PhaseChipOption[] = [
  { label: '전체', value: 'all' },
  { label: '생리기', value: 'menstrual' },
  { label: '생리 후', value: 'follicular' },
  { label: '가임기', value: 'ovulation' },
  { label: '생리 전', value: 'luteal' },
];

const MOOD_LABELS: Record<number, string> = { 5: '좋음', 4: '평온', 3: '짜증', 2: '우울', 1: '불안' };

export function CalendarScreen() {
  const { width: screenW } = useWindowDimensions();
  const cellSize = Math.floor((screenW - 32 - 24) / 7);
  const chartW = screenW - CONTENT_PADDING * 2 - TILE_PADDING * 2;
  const [searchVisible, setSearchVisible] = useState(false);
  const [periodSheet, setPeriodSheet] = useState<'start' | 'end' | null>(null);
  const [editCycle, setEditCycle] = useState<Cycle | null>(null);
  const [dayActions, setDayActions] = useState<DayAction[]>([]);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  const {
    year, month, selectedDay, today,
    daysInMonth, firstWeekday,
    activePhaseFilter,
    setSelectedDay, prevMonth, nextMonth,
    jumpToDate, setActivePhaseFilter,
  } = useCalendar();

  const { data: latestCycle } = useLatestCycle();
  const { data: cycleList } = useCycleList(12);
  const { data: prediction } = usePrediction();
  const startPeriod = useStartPeriod();
  const endPeriod = useEndPeriod();
  const updateCycle = useUpdateCycle();

  const selectedDateStr = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const { data: selectedLog } = useLogForDate(selectedDateStr);

  const cycleLength = prediction?.avg_cycle_length ?? CYCLE_DEFAULTS.length;
  const periodLength = usePeriodLength();

  // latestCycle.started_on 우선 — 유저가 직접 기록한 값이 기준
  // prediction.cycle_day는 latestCycle이 없을 때만 폴백으로 사용
  const cycleStartMs = useMemo(() => {
    if (latestCycle?.started_on) {
      return new Date(latestCycle.started_on + 'T00:00:00').getTime();
    }
    if (prediction?.cycle_day != null) {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      t.setDate(t.getDate() - (prediction.cycle_day - 1));
      return t.getTime();
    }
    return null;
  }, [latestCycle?.started_on, prediction?.cycle_day]);

  // 날짜에 해당하는 사이클을 찾아 실제 started_on / ended_on 기반으로 위상 계산
  const phaseForDate = useCallback((dateStr: string, dayMs: number): PhaseKey => {
    const cycle = cycleList?.find(c =>
      dateStr >= c.started_on && (c.ended_on ? dateStr <= c.ended_on : true),
    );

    if (cycle) {
      const refStartMs = new Date(cycle.started_on + 'T00:00:00').getTime();
      let effectivePeriodLen = periodLength;
      if (cycle.ended_on) {
        const endMs = new Date(cycle.ended_on + 'T00:00:00').getTime();
        effectivePeriodLen = Math.round((endMs - refStartMs) / 86_400_000) + 1;
      }
      const cycleDay = Math.floor((dayMs - refStartMs) / 86_400_000) + 1;
      return cycleDay >= 1 ? phaseForDay(cycleDay, cycleLength, effectivePeriodLen) : 'follicular';
    }

    // ended_on 이후 날짜: ended_on 캡은 첫 번째 주기 범위(cycleLength 이내)에만 적용
    const precedingCycle = cycleList?.find(c => c.started_on <= dateStr);
    if (precedingCycle) {
      const refStartMs = new Date(precedingCycle.started_on + 'T00:00:00').getTime();
      const rawCycleDay = Math.floor((dayMs - refStartMs) / 86_400_000) + 1;
      let effectivePeriodLen = periodLength;
      if (precedingCycle.ended_on && rawCycleDay <= cycleLength) {
        const endMs = new Date(precedingCycle.ended_on + 'T00:00:00').getTime();
        effectivePeriodLen = Math.round((endMs - refStartMs) / 86_400_000) + 1;
      }
      return rawCycleDay >= 1 ? phaseForDay(rawCycleDay, cycleLength, effectivePeriodLen) : 'follicular';
    }

    if (cycleStartMs === null) return 'follicular';
    const cycleDay = Math.floor((dayMs - cycleStartMs) / 86_400_000) + 1;
    return cycleDay >= 1 ? phaseForDay(cycleDay, cycleLength, periodLength) : 'follicular';
  }, [cycleList, cycleStartMs, cycleLength, periodLength]);

  const selectedPhaseKey = useMemo(() => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    return phaseForDate(dateStr, new Date(year, month - 1, selectedDay).getTime());
  }, [phaseForDate, year, month, selectedDay]);

  const dayPhases = useMemo(() => {
    const phases: Record<number, PhaseKey> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      phases[d] = phaseForDate(dateStr, new Date(year, month - 1, d).getTime());
    }
    return phases;
  }, [phaseForDate, year, month, daysInMonth]);

  // Derive display chips from the fetched daily log for the selected date
  const logChips = useMemo(() => {
    if (!selectedLog) return [];
    const chips: string[] = [];
    if (selectedLog.mood != null) {
      const moodLabel = MOOD_LABELS[selectedLog.mood];
      if (moodLabel) chips.push(moodLabel);
    }
    if ((selectedLog.headache ?? 0) > 0) chips.push('두통');
    if ((selectedLog.cramps ?? 0) > 0) chips.push('복통');
    if ((selectedLog.fatigue ?? 0) > 0) chips.push('피곤');
    if ((selectedLog.bloating ?? 0) > 0) chips.push('부종');
    return chips;
  }, [selectedLog]);

  const grid: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthEn = new Date(year, month - 1).toLocaleString('en', { month: 'short' }).toUpperCase();

  const nextMonthRef = useRef(nextMonth);
  const prevMonthRef = useRef(prevMonth);
  nextMonthRef.current = nextMonth;
  prevMonthRef.current = prevMonth;

  const screenWRef = useRef(screenW);
  screenWRef.current = screenW;

  const slideAnim = useRef(new Animated.Value(0)).current;

  const SWIPE_THRESHOLD = 50;
  const SLIDE_DURATION = 180;

  const swipePan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) =>
      Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
    onPanResponderMove: (_, gs) => {
      slideAnim.setValue(gs.dx);
    },
    onPanResponderRelease: (_, gs) => {
      const w = screenWRef.current;
      if (gs.dx < -SWIPE_THRESHOLD) {
        Animated.timing(slideAnim, { toValue: -w, duration: SLIDE_DURATION, useNativeDriver: true }).start(() => {
          nextMonthRef.current();
          slideAnim.setValue(w);
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }).start();
        });
      } else if (gs.dx > SWIPE_THRESHOLD) {
        Animated.timing(slideAnim, { toValue: w, duration: SLIDE_DURATION, useNativeDriver: true }).start(() => {
          prevMonthRef.current();
          slideAnim.setValue(-w);
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }).start();
        });
      } else {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
      }
    },
  })).current;

  const handleDayCellPress = useCallback((day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isDateFuture = new Date(year, month - 1, day) > new Date(today.year, today.month - 1, today.day);

    setSelectedDay(day);

    if (isDateFuture) {
      return;
    }

    const matchedCycle = cycleList?.find(c =>
      dateStr >= c.started_on && (c.ended_on ? dateStr <= c.ended_on : true),
    ) ?? null;

    if (matchedCycle) {
      setDayActions([
        { label: '기록하기', onPress: () => navigation.navigate('Record', { date: dateStr }) },
        { label: '사이클 수정하기', variant: 'coral', onPress: () => setEditCycle(matchedCycle) },
      ]);
    } else {
      setDayActions([
        { label: '기록하기', onPress: () => navigation.navigate('Record', { date: dateStr }) },
        { label: '사이클 추가하기', variant: 'coral', onPress: () => setPeriodSheet('start') },
      ]);
    }
    setActionSheetVisible(true);
  }, [year, month, today, cycleList, navigation, setSelectedDay]);

  function handlePeriodSheetConfirm({ date, flowLevel }: { date: string; flowLevel?: 1 | 2 | 3 }) {
    if (periodSheet === 'start') {
      startPeriod.mutate(
        { startedOn: date, flowLevel: flowLevel ?? 2 },
        {
          onSuccess: () => {
            setPeriodSheet(null);
            Toast.show({ type: 'success', text1: '생리 시작을 기록했어요.' });
          },
            onError: (err) => Toast.show({ type: 'error', text1: '기록 실패', text2: err instanceof ApiError ? err.message : '다시 시도해주세요.' }),
        },
      );
    } else if (periodSheet === 'end' && latestCycle) {
      endPeriod.mutate(
        { cycleId: latestCycle.id, endedOn: date },
        {
          onSuccess: () => {
            setPeriodSheet(null);
            Toast.show({ type: 'success', text1: '생리 종료를 기록했어요.' });
          },
          onError: (err) => Toast.show({ type: 'error', text1: '기록 실패', text2: err instanceof ApiError ? err.message : '다시 시도해주세요.' }),
        },
      );
    }
  }

  function handleCycleEditConfirm({ startedOn, endedOn }: { startedOn: string; endedOn: string | null }) {
    if (!editCycle) return;
    updateCycle.mutate(
      { cycleId: editCycle.id, startedOn, endedOn },
      {
        onSuccess: () => {
          setEditCycle(null);
          Toast.show({ type: 'success', text1: '생리 기간을 수정했어요.' });
        },
        onError: (err) => Toast.show({ type: 'error', text1: '수정 실패', text2: err instanceof ApiError ? err.message : '다시 시도해주세요.' }),
      },
    );
  }

  function isDimmed(day: number): boolean {
    if (activePhaseFilter === 'all' || dayPhases === null) return false;
    return dayPhases[day] !== activePhaseFilter;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>캘린더</Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setSearchVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="날짜 검색"
        >
          <Icon name="search" size={18} strokeWidth={2.2} color={Colors.ink2} />
        </TouchableOpacity>
      </View>

      <>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.monthHeader}>
              <View>
                <Text style={styles.monthEn}>{monthEn} · {year}</Text>
                <Text style={styles.monthKo}>{month}월<Text style={{ color: Colors.coral }}>.</Text></Text>
              </View>
              <View style={styles.monthNav}>
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

            <Animated.View {...swipePan.panHandlers} style={{ transform: [{ translateX: slideAnim }] }}>
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
                        phaseKey={dayPhases?.[d] ?? 'follicular'}
                        dimmed={isDimmed(d)}
                        onPress={handleDayCellPress}
                      />
                )}
              </View>
            </Animated.View>

            <InsightsBody chartW={chartW} />

          </ScrollView>

          <DateSearchSheet
            visible={searchVisible}
            onClose={() => setSearchVisible(false)}
            onSelect={jumpToDate}
          />

          <PeriodDateSheet
            visible={periodSheet !== null}
            onClose={() => setPeriodSheet(null)}
            mode={periodSheet ?? 'start'}
            initialDate={selectedDateStr}
            minDate={periodSheet === 'end' ? latestCycle?.started_on : undefined}
            onConfirm={handlePeriodSheetConfirm}
            isLoading={endPeriod.isPending}
          />

          <CycleEditSheet
            visible={editCycle !== null}
            onClose={() => setEditCycle(null)}
            cycle={editCycle}
            onConfirm={handleCycleEditConfirm}
            isLoading={updateCycle.isPending}
          />

          <DayActionSheet
            visible={actionSheetVisible}
            onClose={() => setActionSheetVisible(false)}
            month={month}
            day={selectedDay}
            isToday={selectedDay === today.day && month === today.month && year === today.year}
            phaseKey={selectedPhaseKey}
            logChips={logChips}
            actions={dayActions}
          />
        </>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  topBarLabel: { fontSize: 13, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: -0.1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4,
  },
  monthEn: { fontSize: 12, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 0.6 },
  monthKo: { fontSize: 36, fontFamily: 'NotoSansKR_900Black', letterSpacing: -1.5, lineHeight: 40, marginTop: 4, color: Colors.ink1 },
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
    fontSize: 12, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink2,
  },
  filterChipTextActive: {
    color: Colors.bgCard,
    fontFamily: 'NotoSansKR_700Bold',
  },
  weekHeaders: { flexDirection: 'row', gap: 4 },
  weekHeaderCell: { alignItems: 'center', paddingVertical: 4 },
  weekHeaderText: { fontSize: 10, fontFamily: 'NotoSansKR_700Bold', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.ink3 },
  weekHeaderSun: { color: Colors.coral },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
