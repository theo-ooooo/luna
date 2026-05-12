import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

interface PrimaryButtonProps {
  children: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ children, onPress, disabled = false, loading = false }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
    >
      {loading
        ? <ActivityIndicator color={Colors.inkInv} />
        : (
          <>
            <Text style={styles.text}>{children}</Text>
            <Icon name="arrow" size={16} strokeWidth={2.2} color={Colors.inkInv} />
          </>
        )
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%' as const,
    backgroundColor: Colors.bgInk,
    borderRadius: Radius.pill,
    paddingVertical: 18, paddingHorizontal: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnDisabled: { backgroundColor: Colors.ink4 },
  text: { fontSize: 14, fontWeight: '700', color: Colors.inkInv },
});
