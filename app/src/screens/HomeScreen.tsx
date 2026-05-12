import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadow } from '../theme/tokens';
import { LunaLogo } from '../components/ui/LunaLogo';
import { Icon } from '../components/ui/Icon';
import { HeroCard } from '../components/home/HeroCard';
import { StatTile } from '../components/home/StatTile';
import { MiniSparkline } from '../components/home/MiniSparkline';
import { HydroBar } from '../components/home/HydroBar';
import { CycleRingTile } from '../components/home/CycleRingTile';
import { phaseForDay, daysUntilPeriod, CYCLE_DEFAULTS } from '../utils/phase';
import { usePrediction } from '../hooks/usePrediction';

export function HomeScreen() {
  const { width: screenW } = useWindowDimensions();
  const bentoHalfWidth = (screenW - 32 - 10) / 2;
  const { data: prediction } = usePrediction();

  const cycleDay = prediction?.cycle_day ?? 1;
  const cycleLength: number = prediction?.avg_cycle_length ?? CYCLE_DEFAULTS.length;
  const phaseKey = phaseForDay(cycleDay, cycleLength);
  const dPeriod = daysUntilPeriod(cycleDay, cycleLength);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroCard phaseKey={phaseKey} cycleDay={cycleDay} daysUntilPeriod={dPeriod} />

        <View style={styles.bento}>
          {/* AI 인사이트 */}
          <View style={[styles.aiCard, Shadow.card]}>
            <View style={styles.aiHeader}>
              <Icon name="spark" size={14} strokeWidth={2.2} color={Colors.coral} />
              <Text style={styles.aiEyebrow}>LUNA AI</Text>
              <Text style={[styles.aiEyebrow, { marginLeft: 'auto' }]}>방금</Text>
            </View>
            <Text style={styles.aiText}>
              지난 3주기 대비 컨디션이 안정적이에요. 어제 30분 산책이 도움이 됐을지도요.
            </Text>
          </View>

          <StatTile eyebrow="기분" value="좋음" detail="3일 연속" width={bentoHalfWidth} />
          <StatTile eyebrow="기초체온" value="36.7°" detail="평균 +0.1°" width={bentoHalfWidth}>
            <MiniSparkline data={[36.4, 36.5, 36.4, 36.3, 36.4, 36.6, 36.7]} />
          </StatTile>
          <StatTile eyebrow="수면" value="7h 20m" detail="목표 달성" width={bentoHalfWidth} />
          <StatTile eyebrow="수분" value="1.8L" detail="2L 목표" width={bentoHalfWidth}>
            <HydroBar pct={0.9} />
          </StatTile>

          <CycleRingTile day={cycleDay} phaseKey={phaseKey} startLabel={prediction ? `${cycleLength}일 평균 주기` : '데이터 없음'} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  topBarRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  aiCard: {
    width: '100%', backgroundColor: Colors.bgCard,
    borderRadius: 20, padding: 18,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.ink3 },
  aiText: { fontSize: 14, fontWeight: '500', color: Colors.ink1, lineHeight: 21, letterSpacing: -0.1 },
});
