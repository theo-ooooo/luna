import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Phase, PhaseKey, Radius, Shadow } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

interface HeroCardProps {
  phaseKey: PhaseKey;
  cycleDay: number;
  daysUntilPeriod: number;
  onDetail?: () => void;
}

export function HeroCard({ phaseKey, cycleDay, daysUntilPeriod, onDetail }: HeroCardProps) {
  const phase = Phase[phaseKey];

  return (
    <View style={[styles.card, Shadow.lift]}>
      <View style={[styles.blob, { backgroundColor: phase.color }]} />

      <View style={styles.phaseRow}>
        <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
        <Text style={styles.phaseLabel}>DAY {cycleDay} · {phase.ko}</Text>
      </View>

      <Text style={styles.phaseWord}>{phase.ko}</Text>
      <Text style={styles.phaseDesc}>{phase.desc}</Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerEyebrow}>NEXT PERIOD</Text>
          <Text style={styles.footerValue}>D-{daysUntilPeriod}</Text>
        </View>
        <TouchableOpacity style={styles.detailBtn} onPress={onDetail} accessibilityRole="button" accessibilityLabel="자세히 보기">
          <Text style={styles.detailBtnText}>자세히 보기</Text>
          <Icon name="arrow" size={12} strokeWidth={2} color="rgba(242,238,232,0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgInk,
    borderRadius: Radius.cardLg,
    padding: 24,
    minHeight: 300,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute', right: -60, top: -50,
    width: 200, height: 200, borderRadius: 100, opacity: 0.25,
  },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  phaseDot: { width: 6, height: 6, borderRadius: 3 },
  phaseLabel: {
    fontSize: 11, fontFamily: 'NotoSansKR_600SemiBold', color: 'rgba(242,238,232,0.6)',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  phaseWord: {
    fontSize: 64, fontFamily: 'NotoSansKR_900Black', letterSpacing: -3,
    lineHeight: 64, color: Colors.inkInv, marginLeft: -2,
  },
  phaseDesc: {
    fontSize: 13, lineHeight: 20, color: 'rgba(242,238,232,0.7)',
    marginTop: 16, marginBottom: 20, maxWidth: 260,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(242,238,232,0.12)',
  },
  footerEyebrow: {
    fontSize: 10, fontFamily: 'NotoSansKR_700Bold', letterSpacing: 1.8,
    color: 'rgba(242,238,232,0.45)', textTransform: 'uppercase',
  },
  footerValue: { fontSize: 28, fontFamily: 'NotoSansKR_900Black', letterSpacing: -0.8, color: Colors.inkInv, marginTop: 4 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  detailBtnText: { color: 'rgba(242,238,232,0.7)', fontSize: 12, fontFamily: 'NotoSansKR_600SemiBold' },
});
