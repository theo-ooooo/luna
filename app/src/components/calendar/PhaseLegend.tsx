import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Phase, PhaseKey, Radius, Shadow } from '../../theme/tokens';

export function PhaseLegend() {
  return (
    <View style={[styles.card, Shadow.card]}>
      {(Object.entries(Phase) as [PhaseKey, typeof Phase[PhaseKey]][]).map(([key, p]) => (
        <View key={key} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: p.color }]} />
          <Text style={styles.label}>{p.ko}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.tile,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 10, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink2 },
});
