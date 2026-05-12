import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';
import { FlowId } from '../../hooks/useRecordForm';

const FLOW_OPTIONS: { id: FlowId; label: string; dots: number }[] = [
  { id: 'none',  label: '없음',   dots: 0 },
  { id: 'spot',  label: '점출혈', dots: 1 },
  { id: 'light', label: '적음',   dots: 2 },
  { id: 'med',   label: '보통',   dots: 3 },
  { id: 'heavy', label: '많음',   dots: 4 },
];

interface FlowSelectorProps {
  value: FlowId | null;
  onChange: (v: FlowId | null) => void;
}

export function FlowSelector({ value, onChange }: FlowSelectorProps) {
  return (
    <View style={styles.row}>
      {FLOW_OPTIONS.map(opt => {
        const active = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(active ? null : opt.id)}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: active }}
          >
            <View style={styles.dots}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i < opt.dots ? (active ? Colors.coral : Colors.ink2) : Colors.ink4 }]} />
              ))}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flex: 1, minWidth: 56, alignItems: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: Colors.bgAlt, borderRadius: Radius.chip,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: '600', color: Colors.ink2 },
  labelActive: { color: Colors.inkInv },
});
