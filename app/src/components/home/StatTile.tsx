import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme/tokens';

interface StatTileProps {
  eyebrow: string;
  value: string;
  detail?: string;
  width: number;
  children?: React.ReactNode;
}

export function StatTile({ eyebrow, value, detail, width, children }: StatTileProps) {
  return (
    <View style={[styles.card, { width }, Shadow.card]}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <View style={styles.bottom}>
        <Text style={styles.value}>{value}</Text>
        {detail && <Text style={styles.detail}>{detail}</Text>}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.tile,
    padding: 16,
    minHeight: 120,
  },
  eyebrow: {
    fontSize: 11, fontFamily: 'NotoSansKR_700Bold', letterSpacing: 1.5,
    textTransform: 'uppercase', color: Colors.ink3,
  },
  bottom: { flex: 1, justifyContent: 'flex-end', marginTop: 8 },
  value: { fontSize: 28, fontFamily: 'NotoSansKR_900Black', letterSpacing: -1.1, color: Colors.ink1 },
  detail: { fontSize: 11, color: Colors.ink3, marginTop: 2, fontFamily: 'NotoSansKR_500Medium' },
});
