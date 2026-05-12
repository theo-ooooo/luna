import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, ...props }: AuthInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        placeholderTextColor={Colors.ink4}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: Colors.ink3 },
  input: {
    height: 48, borderRadius: Radius.chip,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 14,
    fontSize: 15, color: Colors.ink1,
    borderWidth: 1.5, borderColor: Colors.borderSoft,
  },
  inputError: { borderColor: Colors.coral },
  error: { fontSize: 12, color: Colors.coral },
});
