import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/tokens';

interface HydroBarProps {
  pct: number; // 0–1
}

export function HydroBar({ pct }: HydroBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    marginTop: 8, height: 5, backgroundColor: Colors.bgAlt,
    borderRadius: 999, overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.ink1, borderRadius: 999 },
});
