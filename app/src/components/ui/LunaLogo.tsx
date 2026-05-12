import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography } from '../../theme/tokens';

interface LunaLogoProps {
  size?: number;
  dark?: boolean;
  markColor?: string;
}

export function LunaLogo({ size = 20, dark = false, markColor = Colors.coral }: LunaLogoProps) {
  const r = size / 2;
  const ink = dark ? Colors.inkInv : Colors.ink1;
  const bgColor = dark ? Colors.bgInk : Colors.bg;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={r} cy={r} r={r} fill={ink} />
        <Circle cx={r + size * 0.22} cy={r - size * 0.07} r={r * 0.92} fill={bgColor} />
        <Circle cx={r + size * 0.36} cy={r - size * 0.16} r={size * 0.075} fill={markColor} />
      </Svg>
      <Text style={[styles.wordmark, { fontSize: size, color: ink }]}>
        Luna<Text style={{ color: markColor }}>.</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontWeight: '900',
    letterSpacing: -0.8,
  },
});
