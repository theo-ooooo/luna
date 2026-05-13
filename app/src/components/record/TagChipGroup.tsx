import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';

interface TagChipGroupProps {
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  emojiMap?: Record<string, string>;
}

export function TagChipGroup({ options, selected, onToggle, emojiMap }: TagChipGroupProps) {
  return (
    <View style={styles.row}>
      {options.map(opt => {
        const active = selected.includes(opt);
        const emoji = emojiMap?.[opt];
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, active && styles.chipActive, emoji && styles.chipEmoji]}
            onPress={() => onToggle(opt)}
            accessibilityRole="button"
            accessibilityLabel={opt}
            accessibilityState={{ selected: active }}
          >
            {emoji && <Text style={styles.emoji}>{emoji}</Text>}
            <Text style={[styles.label, active && styles.labelActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: Colors.bgAlt, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipEmoji: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  emoji: { fontSize: 16 },
  label: { fontSize: 13, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink2 },
  labelActive: { color: Colors.inkInv },
});
