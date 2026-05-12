import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { usePrediction } from '../hooks/usePrediction';
import { useCycleList } from '../hooks/useCycles';
import { useMonthlyReport } from '../hooks/useMonthlyReport';

// Static mock data — BBT and symptoms require historical daily_logs aggregation (future API)
const BBT_DATA = [36.4, 36.5, 36.4, 36.5, 36.4, 36.3, 36.5, 36.6, 36.5, 36.4, 36.3, 36.7, 36.9, 36.8];
const BBT_OVULATION_DAY = 10;
const SYMPTOMS = ['두통', '복통', '부종', '피로', '여드름'] as const;
const HEATMAP_DATA = [
  [0, 2, 3, 0, 1, 1, 0, 1, 2, 1, 0, 0],
  [3, 2, 1, 0, 0, 1, 2, 3, 1, 0, 0, 1],
  [1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 1, 0],
  [2, 1, 0, 1, 2, 1, 2, 1, 0, 1, 2, 1],
  [0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 1, 0],
];
export function InsightsScreen() {
  const { width: screenW } = useWindowDimensions();
  const { data: prediction } = usePrediction();
  const { data: cycles = [] } = useCycleList(6);
  const now = new Date();
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return `${d.getMonth() + 1}월`;
  });
  const { data: report, isLoading: reportLoading } = useMonthlyReport(now.getFullYear(), now.getMonth() + 1);

  const avgCycle = prediction?.avg_cycle_length ?? 28;
  const chartW = screenW - 32 - 36; // tile padding

  const cycleBarData = cycles
    .filter(c => c.length_days != null)
    .slice(0, 6)
    .reverse()
    .map(c => ({
      days: c.length_days!,
      label: `${parseInt(c.started_on.slice(5, 7), 10)}월`,
    }));

  const barData = cycleBarData.length >= 1 ? cycleBarData : monthLabels.map((label, i) => ({ days: 26 + (i % 3), label }));
  const maxBar = Math.max(...barData.map(b => b.days));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>{String(now.getMonth() + 1).padStart(2, '0')} · 인사이트</Text>
        <View style={styles.topBarRight} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>INSIGHTS · 6 MONTHS</Text>
          <Text style={styles.heroTitle}>당신의{'\n'}패턴<Text style={styles.heroDot}>.</Text></Text>
        </View>

        {/* AI Summary — lime card */}
        <View style={[styles.aiCard, Shadow.card]}>
          <View style={styles.aiCardHeader}>
            <View style={styles.aiIconWrap}>
              <Icon name="spark" size={12} strokeWidth={2.4} color={Colors.lime} />
            </View>
            <Text style={styles.aiCardEyebrow}>{now.getMonth() + 1}월 AI 요약</Text>
          </View>
          {reportLoading ? (
            <ActivityIndicator size="small" color={Colors.ink2} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
          ) : report?.summary ? (
            <Text style={styles.aiCardText}>{report.summary}</Text>
          ) : (
            <Text style={styles.aiCardTextMuted}>이번 달 주기 데이터가 쌓이면 AI 요약이 표시돼요.</Text>
          )}
        </View>

        {/* KPI tiles */}
        <View style={styles.kpiRow}>
          <KpiTile label="평균 주기" value={avgCycle.toFixed(1)} unit="일" bg={Colors.bgCard} />
          <KpiTile label="평균 출혈" value="—" unit="일" bg={Colors.coral} inkLight />
        </View>
        <View style={styles.kpiRow}>
          <KpiTile label="평균 BBT" value="—" unit="°" bg={Colors.lavender} />
          <KpiTile label="규칙성" value="—" unit="%" bg={Colors.bgCard} />
        </View>

        {/* BBT Chart */}
        <View style={[styles.tile, Shadow.card]}>
          <View style={styles.tileHeader}>
            <View>
              <Text style={styles.tileEyebrow}>BBT · 이번 주기</Text>
              <Text style={styles.tileTitle}>기초체온 변화</Text>
            </View>
          </View>
          <BbtChart width={chartW} data={BBT_DATA} ovDay={BBT_OVULATION_DAY} />
        </View>

        {/* Symptom heatmap */}
        <View style={[styles.tile, Shadow.card]}>
          <Text style={styles.tileEyebrow}>증상 빈도 · 6개월</Text>
          <View style={styles.heatmapGrid}>
            {SYMPTOMS.map((symptom, r) => (
              <View key={symptom} style={styles.heatmapRow}>
                <Text style={styles.heatmapLabel}>{symptom}</Text>
                {HEATMAP_DATA[r].map((v, c) => (
                  <View
                    key={c}
                    style={[styles.heatCell, { backgroundColor: heatColor(v) }]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Cycle length bars */}
        <View style={[styles.tile, Shadow.card]}>
          <View style={styles.tileHeader}>
            <Text style={styles.tileEyebrow}>주기 길이</Text>
            <Text style={styles.tileMeta}>RECENT {barData.length}</Text>
          </View>
          <View style={styles.barsRow}>
            {barData.map((item, i) => {
              const isLatest = i === barData.length - 1;
              const barH = Math.round((item.days / maxBar) * 88);
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={[styles.barValue, isLatest && styles.barValueLatest]}>{item.days}</Text>
                  <View style={[styles.barFill, { height: barH, backgroundColor: isLatest ? Colors.coral : Colors.bgAlt }]} />
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function KpiTile({ label, value, unit, bg, inkLight = false }: { label: string; value: string; unit: string; bg: string; inkLight?: boolean }) {
  const labelColor = inkLight ? Colors.bgCard : Colors.ink3;
  const valueColor = inkLight ? Colors.bgCard : Colors.ink1;
  const unitColor  = inkLight ? Colors.bgCard : Colors.ink3;
  return (
    <View style={[styles.kpiTile, { backgroundColor: bg }]}>
      <Text style={[styles.kpiLabel, { color: labelColor }]}>{label}</Text>
      <View style={styles.kpiValueRow}>
        <Text style={[styles.kpiValue, { color: valueColor }]}>{value}</Text>
        <Text style={[styles.kpiUnit, { color: unitColor }]}>{unit}</Text>
      </View>
    </View>
  );
}

function BbtChart({ width, data, ovDay }: { width: number; data: number[]; ovDay: number }) {
  const h = 130, padX = 28, padY = 20;
  const minV = 36.2, maxV = 37.0;
  const innerW = width - padX * 2;
  const innerH = h - padY * 2;
  const divisor = Math.max(data.length - 1, 1);
  const clamp = (v: number) => Math.max(minV, Math.min(maxV, v));
  const xs = (i: number) => padX + (i / divisor) * innerW;
  const ys = (v: number) => h - padY - ((clamp(v) - minV) / (maxV - minV)) * innerH;

  const preOvPath  = data.slice(0, ovDay + 1).map((v, i) => `${i === 0 ? 'M' : 'L'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
  const postOvPath = data.slice(ovDay).map((v, i) => `${i === 0 ? 'M' : 'L'}${xs(i + ovDay).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
  const gridLevels = [36.4, 36.6, 36.8];
  const ovX = xs(ovDay);

  return (
    <View>
      <Svg width={width} height={h}>
        {gridLevels.map(v => (
          <React.Fragment key={v}>
            <Line x1={padX} y1={ys(v)} x2={width - padX} y2={ys(v)} stroke={Colors.bgAlt} strokeWidth={1} strokeDasharray="2,4" />
            <SvgText x={2} y={ys(v) + 4} fontSize={8} fill={Colors.ink4} fontWeight="500">{v}</SvgText>
          </React.Fragment>
        ))}
        {/* Ovulation zone */}
        <Rect x={ovX - 8} y={padY} width={16} height={innerH} fill={Colors.coral} opacity={0.08} rx={4} />
        <SvgText x={ovX} y={padY - 4} fontSize={7} fill={Colors.coral} fontWeight="700" textAnchor="middle">OVUL</SvgText>
        {/* Lines */}
        <Path d={preOvPath}  stroke={Colors.coral}        strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={postOvPath} stroke={Colors.lavenderDeep} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {data.map((v, i) => (
          <Circle key={i} cx={xs(i)} cy={ys(v)} r={i === data.length - 1 ? 4 : 2.5}
            fill={i <= ovDay ? Colors.coral : Colors.lavenderDeep}
            stroke={i === data.length - 1 ? Colors.bgCard : 'none'} strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}><View style={[styles.legendLine, { backgroundColor: Colors.coral }]} /><Text style={styles.legendText}>난포기</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendLine, { backgroundColor: Colors.lavenderDeep }]} /><Text style={styles.legendText}>황체기</Text></View>
      </View>
    </View>
  );
}

function heatColor(v: number) {
  if (v === 0) return Colors.bgAlt;
  const alpha = Math.min(0.25 + v * 0.25, 1);
  return `rgba(255, 90, 71, ${alpha})`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  topBarRight: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },

  heroSection: { paddingTop: 4, paddingBottom: 4 },
  heroEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: Colors.ink3, marginBottom: 8 },
  heroTitle: { fontSize: 44, fontWeight: '900', letterSpacing: -2, lineHeight: 46, color: Colors.ink1 },
  heroDot: { color: Colors.coral },

  aiCard: { backgroundColor: Colors.lime, borderRadius: Radius.card, padding: 20 },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.ink1, alignItems: 'center', justifyContent: 'center' },
  aiCardEyebrow: { fontSize: 11, fontWeight: '700', color: Colors.ink1, letterSpacing: 0.6 },
  aiCardText: { fontSize: 14, lineHeight: 22, color: Colors.ink1, fontWeight: '600', letterSpacing: -0.1 },
  aiCardTextMuted: { fontSize: 13, lineHeight: 20, color: Colors.ink2, fontWeight: '500', letterSpacing: -0.1 },

  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiTile: { flex: 1, borderRadius: Radius.tile, padding: 18, minHeight: 110, justifyContent: 'space-between' },
  kpiLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  kpiValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  kpiValue: { fontSize: 36, fontWeight: '900', letterSpacing: -2 },
  kpiUnit: { fontSize: 14, fontWeight: '700' },

  tile: { backgroundColor: Colors.bgCard, borderRadius: Radius.tile, padding: 18 },
  tileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  tileEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.ink3, marginBottom: 4 },
  tileTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4, color: Colors.ink1 },
  tileMeta: { fontSize: 10, color: Colors.ink3, fontWeight: '600', letterSpacing: 0.4 },

  chartLegend: { flexDirection: 'row', gap: 12, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendLine: { width: 8, height: 2, borderRadius: 1 },
  legendText: { fontSize: 10, color: Colors.ink3, fontWeight: '500' },

  heatmapGrid: { gap: 4, marginTop: 8 },
  heatmapRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heatmapLabel: { width: 42, fontSize: 11, fontWeight: '600', color: Colors.ink1 },
  heatCell: { flex: 1, aspectRatio: 1, borderRadius: 4 },

  barsRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 130, marginTop: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  barValue: { fontSize: 11, fontWeight: '700', color: Colors.ink2 },
  barValueLatest: { color: Colors.coral },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 9, color: Colors.ink3, fontWeight: '600' },
});
