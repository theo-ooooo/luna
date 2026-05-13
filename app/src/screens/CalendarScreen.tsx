import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { PhaseLegend } from '../components/calendar/PhaseLegend';
import { DayCell } from '../components/calendar/DayCell';
import { DayDetailCard } from '../components/calendar/DayDetailCard';
import { InsightsBody } from '../components/insights/InsightsBody';
import { useCalendar } from '../hooks/useCalendar';

const WEEK_HEADERS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const CONTENT_PADDING = 16;
const TILE_PADDING = 18;

type Tab = 'calendar' | 'insights';

export function CalendarScreen() {
  const { width: screenW } = useWindowDimensions();
  const cellSize = Math.floor((screenW - 32 - 24) / 7);
  const chartW = screenW - CONTENT_PADDING * 2 - TILE_PADDING * 2;
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  const {
    year, month, selectedDay, today,
    daysInMonth, firstWeekday,
    selectedPhaseKey,
    setSelectedDay, prevMonth, nextMonth,
  } = useCalendar();

  const grid: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthEn = new Date(year, month - 1).toLocaleString('en', { month: 'short' }).toUpperCase();

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
          />
        </ScrollView>
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
  weekHeaders: { flexDirection: 'row', gap: 4 },
  weekHeaderCell: { alignItems: 'center', paddingVertical: 4 },
  weekHeaderText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.ink3 },
  weekHeaderSun: { color: Colors.coral },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
