import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Phase, PhaseKey } from '../../theme/tokens';

interface DayCellProps {
  day: number;
  month: number;
  size: number;
  isToday: boolean;
  isSelected: boolean;
  phaseKey?: PhaseKey;
  dimmed?: boolean;
  onPress: (day: number) => void;
}

export function DayCell({ day, month, size, isToday, isSelected, phaseKey = 'follicular', dimmed = false, onPress }: DayCellProps) {
  const phase = Phase[phaseKey];

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { width: size, height: size },
        { backgroundColor: isSelected ? Colors.bgInk : phase.bg },
        dimmed && styles.dimmed,
      ]}
      onPress={() => onPress(day)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${month}월 ${day}일`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={[
        styles.text,
        { color: isSelected ? phase.color : Colors.ink1 },
        (isToday || isSelected) && styles.textBold,
      ]}>
        {day}
      </Text>
      {isToday && !isSelected && <View style={[styles.todayDot, { backgroundColor: Colors.ink1 }]} />}
      {isSelected && <View style={[styles.selectedBar, { backgroundColor: phase.color }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dimmed: { opacity: 0.3 },
  text: { fontSize: 14, fontFamily: 'NotoSansKR_600SemiBold', letterSpacing: -0.3 },
  textBold: { fontFamily: 'NotoSansKR_900Black' },
  todayDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },
  selectedBar: { position: 'absolute', bottom: 4, width: 14, height: 3, borderRadius: 2 },
});
