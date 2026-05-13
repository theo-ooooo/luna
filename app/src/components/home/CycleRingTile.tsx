import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Phase, PhaseKey, Radius, Shadow } from '../../theme/tokens';

const CYCLE_LENGTH = 28;
const RING_R = 42;
const RING_SIZE = 90;
const CX = 45, CY = 45;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

interface CycleRingTileProps {
  day: number;
  phaseKey: PhaseKey;
  cycleLength?: number;
  startLabel?: string;
}

export function CycleRingTile({ day, phaseKey, cycleLength = CYCLE_LENGTH, startLabel }: CycleRingTileProps) {
  const phase = Phase[phaseKey];
  const pct = Math.min(day / cycleLength, 1);
  const dashOffset = CIRCUMFERENCE - CIRCUMFERENCE * pct;

  return (
    <View style={[styles.card, Shadow.card]}>
      <View style={{ width: RING_SIZE, height: RING_SIZE }}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 90 90">
          <Circle cx={CX} cy={CY} r={RING_R} fill="none" stroke={Colors.bgAlt} strokeWidth="7" />
          <Circle
            cx={CX} cy={CY} r={RING_R} fill="none"
            stroke={Colors.ink1} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${CX} ${CY})`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={styles.dayNum}>{day}</Text>
          <Text style={styles.dayOf}>OF {cycleLength}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.eyebrow}>이번 주기</Text>
        <Text style={styles.pct}>{Math.round(pct * 100)}% 진행</Text>
        {startLabel && <Text style={styles.meta}>{startLabel}</Text>}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: Colors.coral }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.bgCard, borderRadius: Radius.tile,
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 18,
  },
  center: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNum: { fontSize: 28, fontFamily: 'NotoSansKR_900Black', letterSpacing: -1.1, color: Colors.ink1 },
  dayOf: { fontSize: 9, fontFamily: 'NotoSansKR_700Bold', letterSpacing: 1.6, color: Colors.ink3, marginTop: 2 },
  info: { flex: 1 },
  eyebrow: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.ink3 },
  pct: { fontSize: 22, fontFamily: 'NotoSansKR_800ExtraBold', letterSpacing: -0.8, marginTop: 4, color: Colors.ink1 },
  meta: { fontSize: 12, color: Colors.ink2, marginTop: 6, lineHeight: 18 },
  track: { marginTop: 12, height: 4, backgroundColor: Colors.bgAlt, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});
