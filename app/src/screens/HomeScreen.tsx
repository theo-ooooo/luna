import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { Colors, Phase, PhaseKey, Radius, Shadow, Typography } from '../theme/tokens';
import { LunaLogo } from '../components/ui/LunaLogo';
import { Icon } from '../components/ui/Icon';
import { phaseForDay, daysUntilPeriod } from '../utils/phase';

const CYCLE_LENGTH = 28;

interface HomeScreenProps {
  cycleDay?: number;
}

export function HomeScreen({ cycleDay = 14 }: HomeScreenProps) {
  const { width: screenW } = useWindowDimensions();
  const bentoHalfWidth = (screenW - 32 - 10) / 2;
  const phaseKey: PhaseKey = phaseForDay(cycleDay);
  const phase = Phase[phaseKey];
  const dPeriod = daysUntilPeriod(cycleDay);
  const pct = cycleDay / CYCLE_LENGTH;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <LunaLogo size={18} />
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="검색">
            <Icon name="search" size={20} color={Colors.ink1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="알림">
            <Icon name="bell" size={20} color={Colors.ink1} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero dark card */}
        <View style={[styles.heroCard, Shadow.lift]}>
          {/* Phase glow blob — simulated with a radial tint overlay */}
          <View style={[styles.heroBlob, { backgroundColor: phase.color }]} />

          {/* Phase label */}
          <View style={styles.phaseRow}>
            <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
            <Text style={styles.phaseLabel}>DAY {cycleDay} · {phase.ko}</Text>
          </View>

          {/* Phase name large */}
          <Text style={styles.phaseWord}>{phase.ko}</Text>

          {/* Description */}
          <Text style={styles.phaseDesc}>{phase.desc}</Text>

          {/* D-N footer */}
          <View style={styles.heroFooter}>
            <View>
              <Text style={styles.heroFooterEyebrow}>NEXT PERIOD</Text>
              <Text style={styles.heroFooterValue}>D-{dPeriod}</Text>
            </View>
            <TouchableOpacity style={styles.detailBtn}>
              <Text style={styles.detailBtnText}>자세히 보기</Text>
              <Icon name="arrow" size={12} strokeWidth={2} color="rgba(242,238,232,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bento grid */}
        <View style={styles.bento}>
          {/* AI insight — full width */}
          <View style={[styles.bentoCard, styles.bentoFull, Shadow.card]}>
            <View style={styles.bentoHeader}>
              <Icon name="spark" size={14} strokeWidth={2.2} color={Colors.coral} />
              <Text style={styles.bentoEyebrow}>LUNA AI</Text>
              <Text style={[styles.bentoEyebrow, { marginLeft: 'auto' }]}>방금</Text>
            </View>
            <Text style={styles.bentoInsightText}>
              지난 3주기 대비 컨디션이 안정적이에요. 어제 30분 산책이 도움이 됐을지도요.
            </Text>
          </View>

          {/* Mood tile */}
          <StatTile eyebrow="기분" value="좋음" detail="3일 연속" width={bentoHalfWidth} />
          {/* BBT tile */}
          <StatTile eyebrow="기초체온" value="36.7°" detail="평균 +0.1°" width={bentoHalfWidth}>
            <MiniSparkline data={[36.4, 36.5, 36.4, 36.3, 36.4, 36.6, 36.7]} />
          </StatTile>
          {/* Sleep tile */}
          <StatTile eyebrow="수면" value="7h 20m" detail="목표 달성" width={bentoHalfWidth} />
          {/* Hydration tile */}
          <StatTile eyebrow="수분" value="1.8L" detail="2L 목표" width={bentoHalfWidth}>
            <HydroBar pct={0.9} />
          </StatTile>

          {/* Cycle ring tile — full width */}
          <CycleRingTile day={cycleDay} phase={phase} pct={pct} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatTile({ eyebrow, value, detail, width, children }: {
  eyebrow: string; value: string; detail?: string; width: number; children?: React.ReactNode;
}) {
  return (
    <View style={[styles.bentoCard, { width, minHeight: 120 }, Shadow.card]}>
      <Text style={styles.bentoEyebrow}>{eyebrow}</Text>
      <View style={styles.statBottom}>
        <Text style={styles.statValue}>{value}</Text>
        {detail && <Text style={styles.statDetail}>{detail}</Text>}
        {children}
      </View>
    </View>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const min = 36.2, max = 36.8, w = 100, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ marginTop: 4 }}>
      <Polyline
        points={pts}
        fill="none"
        stroke={Colors.coral}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HydroBar({ pct }: { pct: number }) {
  return (
    <View style={hydroStyles.track}>
      <View style={[hydroStyles.fill, { width: `${pct * 100}%` as any }]} />
    </View>
  );
}

const hydroStyles = StyleSheet.create({
  track: {
    marginTop: 8, height: 5, backgroundColor: Colors.bgAlt,
    borderRadius: 999, overflow: 'hidden',
  },
  fill: {
    height: '100%', backgroundColor: Colors.ink1, borderRadius: 999,
  },
});

function CycleRingTile({ day, phase, pct }: {
  day: number; phase: typeof Phase[PhaseKey]; pct: number;
}) {
  const r = 42, size = 90, cx = 45, cy = 45;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - circumference * pct;

  return (
    <View style={[styles.bentoCard, styles.bentoFull, styles.cycleRing, Shadow.card]}>
      <View style={{ position: 'relative', width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Circle cx={cx} cy={cy} r={r} fill="none" stroke={Colors.bgAlt} strokeWidth="7" />
          <Circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={Colors.ink1} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringDay}>{day}</Text>
          <Text style={styles.ringOf}>OF {CYCLE_LENGTH}</Text>
        </View>
      </View>

      <View style={styles.ringInfo}>
        <Text style={styles.bentoEyebrow}>이번 주기</Text>
        <Text style={styles.ringPct}>{Math.round(pct * 100)}% 진행</Text>
        <Text style={styles.ringMeta}>5월 1일 시작 · 28일 평균</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: Colors.coral }]} />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  topBarRight: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120 },

  // Hero card
  heroCard: {
    backgroundColor: Colors.bgInk,
    borderRadius: Radius.cardLg,
    padding: 24,
    minHeight: 300,
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute', right: -60, top: -50,
    width: 200, height: 200, borderRadius: 100,
    opacity: 0.25,
  },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  phaseDot: { width: 6, height: 6, borderRadius: 3 },
  phaseLabel: {
    fontSize: 11, fontWeight: '600', color: 'rgba(242,238,232,0.6)',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  phaseWord: {
    fontSize: 64, fontWeight: '900', letterSpacing: -3,
    lineHeight: 64, color: Colors.inkInv, marginLeft: -2,
  },
  phaseDesc: {
    fontSize: 13, lineHeight: 20, color: 'rgba(242,238,232,0.7)',
    marginTop: 16, marginBottom: 20, maxWidth: 260,
  },
  heroFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(242,238,232,0.12)',
  },
  heroFooterEyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.8,
    color: 'rgba(242,238,232,0.45)', textTransform: 'uppercase',
  },
  heroFooterValue: {
    fontSize: 28, fontWeight: '900', letterSpacing: -0.8,
    color: Colors.inkInv, marginTop: 4,
  },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  detailBtnText: { color: 'rgba(242,238,232,0.7)', fontSize: 12, fontWeight: '600' },

  // Bento
  bento: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bentoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.tile,
    padding: 16,
  },
  bentoFull: { width: '100%' },
  bentoHalf: { minHeight: 120 },
  bentoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  bentoEyebrow: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', color: Colors.ink3,
  },
  bentoInsightText: {
    fontSize: 14, fontWeight: '500', color: Colors.ink1, lineHeight: 21, letterSpacing: -0.1,
  },
  statBottom: { flex: 1, justifyContent: 'flex-end', marginTop: 8 },
  statValue: { fontSize: 28, fontWeight: '900', letterSpacing: -1.1, color: Colors.ink1 },
  statDetail: { fontSize: 11, color: Colors.ink3, marginTop: 2, fontWeight: '500' },

  // Cycle ring
  cycleRing: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ringCenter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  ringDay: { fontSize: 28, fontWeight: '900', letterSpacing: -1.1, color: Colors.ink1 },
  ringOf: { fontSize: 9, fontWeight: '700', letterSpacing: 1.6, color: Colors.ink3, marginTop: 2 },
  ringInfo: { flex: 1 },
  ringPct: { fontSize: 22, fontWeight: '800', letterSpacing: -0.8, marginTop: 4, color: Colors.ink1 },
  ringMeta: { fontSize: 12, color: Colors.ink2, marginTop: 6, lineHeight: 18 },
  progressTrack: {
    marginTop: 12, height: 4, backgroundColor: Colors.bgAlt, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
});
