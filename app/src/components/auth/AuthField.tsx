import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../theme/tokens';

interface AuthFieldProps extends TextInputProps {
  label: string;
  trailing?: React.ReactNode;
}

export function AuthField({ label, trailing, style, ...props }: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.card, focused && styles.cardFocused]}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        {trailing}
      </View>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.ink4}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardFocused: { borderColor: Colors.ink1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 10, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase' },
  input: { fontSize: 16, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink1, letterSpacing: -0.2, padding: 0 },
});
