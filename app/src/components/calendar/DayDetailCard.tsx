import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Phase, PhaseKey, Radius, Shadow } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

interface DayDetailCardProps {
  day: number;
  month: number;
  phaseKey: PhaseKey;
  isToday: boolean;
  logChips?: string[];
  hasLog?: boolean;
  onRecord?: () => void;
  onStartPeriod?: () => void;
  onEndPeriod?: () => void;
}

export function DayDetailCard({ day, month, phaseKey, isToday, logChips = [], hasLog, onRecord, onStartPeriod, onEndPeriod }: DayDetailCardProps) {
  const phase = Phase[phaseKey];
  const hasBtns = !!(onRecord || onEndPeriod || onStartPeriod);

  return (
    <View style={[styles.card, { backgroundColor: phase.bg }, Shadow.card]}>
      <View style={[styles.blob, { backgroundColor: phase.color }]} />
      <View style={styles.content}>
        <View style={styles.phaseRow}>
          <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
          <Text style={styles.phaseLabel}>{phase.ko}</Text>
        </View>
        <View style={styles.dayRow}>
          <Text style={styles.dayNumber}>
            {day}<Text style={{ color: phase.color }}>.</Text>
          </Text>
          <Text style={styles.dayMeta}>{month}월 · {isToday ? '오늘' : `Day ${day}`}</Text>
        </View>
        <Text style={styles.desc}>{phase.desc}</Text>
        {logChips.length > 0 && (
          <View style={styles.chipRow}>
            {logChips.map(tag => (
              <View key={tag} style={styles.chip}>
                <Text style={styles.chipText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {hasBtns && (
          <View style={styles.btnRow}>
            {onRecord && (
              <TouchableOpacity style={styles.recordBtn} onPress={onRecord} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={hasLog ? '기록 수정' : '기록하기'}>
                <Icon name="edit" size={14} strokeWidth={2.2} color={Colors.ink1} />
                <Text style={styles.recordBtnText}>{hasLog ? '기록 수정' : '기록하기'}</Text>
              </TouchableOpacity>
            )}
            {onEndPeriod ? (
              <TouchableOpacity style={[styles.recordBtn, styles.periodEndBtn]} onPress={onEndPeriod} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="생리 종료">
                <Icon name="minus" size={14} strokeWidth={2.2} color={Colors.coral} />
                <Text style={[styles.recordBtnText, { color: Colors.coral }]}>생리 종료</Text>
              </TouchableOpacity>
            ) : onStartPeriod ? (
              <TouchableOpacity style={[styles.recordBtn, styles.periodStartBtn]} onPress={onStartPeriod} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="생리 시작">
                <Icon name="plus" size={14} strokeWidth={2.2} color={Colors.inkInv} />
                <Text style={[styles.recordBtnText, { color: Colors.inkInv }]}>생리 시작</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 20, borderRadius: Radius.card, padding: 20, overflow: 'hidden' },
  blob: { position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: 70, opacity: 0.18 },
  content: { position: 'relative' },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  phaseDot: { width: 8, height: 8, borderRadius: 4 },
  phaseLabel: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1, letterSpacing: 0.6 },
  dayRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  dayNumber: { fontSize: 52, fontFamily: 'NotoSansKR_900Black', letterSpacing: -2, lineHeight: 52, color: Colors.ink1 },
  dayMeta: { fontSize: 14, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink2, paddingBottom: 6 },
  desc: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.6)' },
  chipText: { fontSize: 11, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink1 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  recordBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: Radius.pill,
  },
  periodStartBtn: { backgroundColor: Colors.coral },
  periodEndBtn: { backgroundColor: 'rgba(255,90,71,0.15)' },
  recordBtnText: { fontSize: 13, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1 },
});
