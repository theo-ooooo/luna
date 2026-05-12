import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Phase, PhaseKey, Radius, Shadow } from '../../theme/tokens';

interface DayDetailCardProps {
  day: number;
  month: number;
  phaseKey: PhaseKey;
  isToday: boolean;
  logChips?: string[];
}

export function DayDetailCard({ day, month, phaseKey, isToday, logChips = [] }: DayDetailCardProps) {
  const phase = Phase[phaseKey];

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
  phaseLabel: { fontSize: 11, fontWeight: '700', color: Colors.ink1, letterSpacing: 0.6 },
  dayRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  dayNumber: { fontSize: 52, fontWeight: '900', letterSpacing: -2, lineHeight: 52, color: Colors.ink1 },
  dayMeta: { fontSize: 14, fontWeight: '600', color: Colors.ink2, paddingBottom: 6 },
  desc: { fontSize: 13, color: Colors.ink2, lineHeight: 20, marginTop: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.6)' },
  chipText: { fontSize: 11, fontWeight: '600', color: Colors.ink1 },
});
