import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Phase, PhaseKey, Radius, Shadow } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { phaseForDay, CYCLE_DEFAULTS } from '../utils/phase';

const WEEK_HEADERS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const TODAY_DAY = 14; // TODO: derive from real cycle data

export function CalendarScreen() {
  const { width: screenW } = useWindowDimensions();
  const cellSize = Math.floor((screenW - 32 - 24) / 7);

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const grid: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedPhaseKey: PhaseKey = phaseForDay(selectedDay);
  const selectedPhase = Phase[selectedPhaseKey];

  const monthEn = new Date(year, month - 1)
    .toLocaleString('en', { month: 'short' })
    .toUpperCase();

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>02 · 캘린더</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="필터">
            <Icon name="filter" size={20} color={Colors.ink1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="검색">
            <Icon name="search" size={20} color={Colors.ink1} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Month header */}
        <View style={styles.monthHeader}>
          <View>
            <Text style={styles.monthEn}>{monthEn} · {year}</Text>
            <Text style={styles.monthKo}>
              {month}월<Text style={{ color: Colors.coral }}>.</Text>
            </Text>
          </View>
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.navBtn} onPress={prevMonth} accessibilityRole="button" accessibilityLabel="이전 달">
              <Icon name="chevDn" size={18} strokeWidth={2.2} color={Colors.ink2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={nextMonth} accessibilityRole="button" accessibilityLabel="다음 달">
              <Icon name="chev" size={18} strokeWidth={2.2} color={Colors.ink2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Phase legend */}
        <View style={[styles.legendCard, Shadow.card]}>
          {(Object.entries(Phase) as [PhaseKey, typeof Phase[PhaseKey]][]).map(([key, p]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: p.color }]} />
              <Text style={styles.legendLabel}>{p.ko}</Text>
            </View>
          ))}
        </View>

        {/* Weekday headers */}
        <View style={styles.weekHeaders}>
          {WEEK_HEADERS.map((w, i) => (
            <View key={w} style={[styles.weekHeaderCell, { width: cellSize }]}>
              <Text style={[styles.weekHeaderText, i === 0 && styles.weekHeaderSun]}>{w}</Text>
            </View>
          ))}
        </View>

        {/* Day grid */}
        <View style={styles.dayGrid}>
          {grid.map((d, i) => {
            if (d === null) {
              return <View key={`e-${i}`} style={{ width: cellSize, height: cellSize }} />;
            }
            const phaseKey: PhaseKey = phaseForDay(d);
            const phase = Phase[phaseKey];
            const isToday = d === TODAY_DAY;
            const isSelected = d === selectedDay;

            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dayCell,
                  { width: cellSize, height: cellSize },
                  { backgroundColor: isSelected ? Colors.bgInk : phase.bg },
                ]}
                onPress={() => setSelectedDay(d)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${month}월 ${d}일`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[
                  styles.dayText,
                  { color: isSelected ? phase.color : Colors.ink1 },
                  (isToday || isSelected) && styles.dayTextBold,
                ]}>
                  {d}
                </Text>
                {isToday && !isSelected && (
                  <View style={[styles.todayDot, { backgroundColor: Colors.ink1 }]} />
                )}
                {isSelected && (
                  <View style={[styles.selectedBar, { backgroundColor: phase.color }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected day detail */}
        <View style={[styles.detailCard, { backgroundColor: selectedPhase.bg }, Shadow.card]}>
          <View style={[styles.detailBlob, { backgroundColor: selectedPhase.color }]} />
          <View style={styles.detailContent}>
            <View style={styles.detailPhaseRow}>
              <View style={[styles.detailPhaseDot, { backgroundColor: selectedPhase.color }]} />
              <Text style={styles.detailPhaseLabel}>{selectedPhase.ko}</Text>
            </View>
            <View style={styles.detailDayRow}>
              <Text style={styles.detailDayNumber}>
                {selectedDay}<Text style={{ color: selectedPhase.color }}>.</Text>
              </Text>
              <Text style={styles.detailDayMeta}>
                {month}월 · {selectedDay === TODAY_DAY ? '오늘' : `Day ${selectedDay}`}
              </Text>
            </View>
            <Text style={styles.detailDesc}>{selectedPhase.desc}</Text>
            <View style={styles.chipRow}>
              {['두통', '컨디션 좋음', 'BBT 36.7°'].map(tag => (
                <View key={tag} style={styles.chip}>
                  <Text style={styles.chipText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  topBarRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120 },

  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 16, paddingHorizontal: 4,
  },
  monthEn: { fontSize: 12, fontWeight: '700', color: Colors.ink3, letterSpacing: 0.6 },
  monthKo: { fontSize: 36, fontWeight: '900', letterSpacing: -1.5, lineHeight: 40, marginTop: 4, color: Colors.ink1 },
  monthNav: { flexDirection: 'row', gap: 6 },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
  },

  legendCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.tile,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, fontWeight: '600', color: Colors.ink2 },

  weekHeaders: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  weekHeaderCell: { alignItems: 'center', paddingVertical: 4 },
  weekHeaderText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.ink3 },
  weekHeaderSun: { color: Colors.coral },

  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayCell: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayText: { fontSize: 14, fontWeight: '600', letterSpacing: -0.3 },
  dayTextBold: { fontWeight: '900' },
  todayDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },
  selectedBar: { position: 'absolute', bottom: 4, width: 14, height: 3, borderRadius: 2 },

  detailCard: { marginTop: 20, borderRadius: Radius.card, padding: 20, overflow: 'hidden' },
  detailBlob: { position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: 70, opacity: 0.18 },
  detailContent: { position: 'relative' },
  detailPhaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  detailPhaseDot: { width: 8, height: 8, borderRadius: 4 },
  detailPhaseLabel: { fontSize: 11, fontWeight: '700', color: Colors.ink1, letterSpacing: 0.6 },
  detailDayRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  detailDayNumber: { fontSize: 52, fontWeight: '900', letterSpacing: -2, lineHeight: 52, color: Colors.ink1 },
  detailDayMeta: { fontSize: 14, fontWeight: '600', color: Colors.ink2, paddingBottom: 6 },
  detailDesc: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.6)' },
  chipText: { fontSize: 11, fontWeight: '600', color: Colors.ink1 },
});
