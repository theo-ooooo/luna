import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Phase, PhaseKey } from '../../theme/tokens';
import { phaseForDay } from '../../utils/phase';

interface DayCellProps {
  day: number;
  month: number;
  size: number;
  isToday: boolean;
  isSelected: boolean;
  onPress: (day: number) => void;
}

export function DayCell({ day, month, size, isToday, isSelected, onPress }: DayCellProps) {
  const phaseKey: PhaseKey = phaseForDay(day);
  const phase = Phase[phaseKey];

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { width: size, height: size },
        { backgroundColor: isSelected ? Colors.bgInk : phase.bg },
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
  text: { fontSize: 14, fontWeight: '600', letterSpacing: -0.3 },
  textBold: { fontWeight: '900' },
  todayDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },
  selectedBar: { position: 'absolute', bottom: 4, width: 14, height: 3, borderRadius: 2 },
});
