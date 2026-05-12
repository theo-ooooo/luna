import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BaseToastProps } from 'react-native-toast-message';
import { Colors, Radius } from '../../theme/tokens';

function ToastBase({ text1, text2, accent }: { text1?: string; text2?: string; accent: string }) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <View style={styles.body}>
        {text1 ? <Text style={styles.title} numberOfLines={1}>{text1}</Text> : null}
        {text2 ? <Text style={styles.sub} numberOfLines={2}>{text2}</Text> : null}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase text1={text1} text2={text2} accent={Colors.lime} />
  ),
  error: ({ text1, text2 }: BaseToastProps) => (
    <ToastBase text1={text1} text2={text2} accent={Colors.coral} />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInk,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    gap: 12,
    shadowColor: Colors.ink1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  body: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.inkInv, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: Colors.ink3, marginTop: 2, lineHeight: 16 },
});
