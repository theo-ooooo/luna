import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/tokens';
import { InsightsBody } from '../components/insights/InsightsBody';

const CONTENT_PADDING = 16;
const TILE_PADDING = 18;

export function InsightsScreen() {
  const { width: screenW } = useWindowDimensions();
  const chartW = screenW - CONTENT_PADDING * 2 - TILE_PADDING * 2;
  const now = new Date();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>인사이트</Text>
        <View style={styles.topBarRight} />
      </View>
      <InsightsBody chartW={chartW} scrollable />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  topBarLabel: { fontSize: 13, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink3, letterSpacing: -0.1 },
  topBarRight: { width: 36, height: 36 },
});
