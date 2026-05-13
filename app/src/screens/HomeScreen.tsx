import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { LunaLogo } from '../components/ui/LunaLogo';
import { Icon } from '../components/ui/Icon';
import { HeroCard } from '../components/home/HeroCard';
import { StatTile } from '../components/home/StatTile';
import { MiniSparkline } from '../components/home/MiniSparkline';
import { CycleRingTile } from '../components/home/CycleRingTile';
import { CycleHistoryModal } from '../components/home/CycleHistoryModal';
import { phaseForDay, daysUntilPeriod, CYCLE_DEFAULTS } from '../utils/phase';
import { usePrediction } from '../hooks/usePrediction';
import { useLatestCycle, useStartPeriod, useEndPeriod } from '../hooks/useCycles';
import { useTodayLog } from '../hooks/useDailyLog';
import { useBbtHistory } from '../hooks/useBbtHistory';

const MOOD_LABELS: Record<number, string> = { 5: '좋음', 4: '평온', 3: '짜증', 2: '피곤', 1: '불안' };

function formatDateChip(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function HomeScreen() {
  const { width: screenW } = useWindowDimensions();
  const bentoHalfWidth = (screenW - 32 - 10) / 2;
  const { data: prediction } = usePrediction();
  const { data: latestCycle, isLoading: cycleLoading } = useLatestCycle();
  const { data: todayLog } = useTodayLog();
  const { data: bbtHistory } = useBbtHistory();
  const startPeriod = useStartPeriod();
  const endPeriod = useEndPeriod();
  const [selectedFlow, setSelectedFlow] = useState<1 | 2 | 3>(2);
  const [showCycleHistory, setShowCycleHistory] = useState(false);

  const recentDates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }), []);
  const [selectedDate, setSelectedDate] = useState(() => recentDates[0]);
  const [selectedEndDate, setSelectedEndDate] = useState(() => recentDates[0]);

  const cycleDay = prediction?.cycle_day ?? 1;
  const cycleLength: number = prediction?.avg_cycle_length ?? CYCLE_DEFAULTS.length;
  const phaseKey = phaseForDay(cycleDay, cycleLength);
  const dPeriod = daysUntilPeriod(cycleDay, cycleLength);

  const isActivePeriod = !!latestCycle && !latestCycle.ended_on;

  const endDateOptions = useMemo(
    () => recentDates.filter(d => !latestCycle || d >= latestCycle.started_on),
    [recentDates, latestCycle],
  );

  // Reset end date chip to today whenever a period becomes active
  useEffect(() => {
    if (isActivePeriod) setSelectedEndDate(recentDates[0]);
  }, [isActivePeriod, recentDates]);

  // ── Stat tile data ────────────────────────────────────────────────────────
  const moodLabel = todayLog?.mood != null ? (MOOD_LABELS[todayLog.mood] ?? '—') : '—';
  const moodDetail = todayLog?.mood != null ? '오늘 기록' : '미기록';

  const bbtValue = todayLog?.bbt != null ? `${Number(todayLog.bbt).toFixed(1)}°` : '—';
  const bbtDetail = todayLog?.bbt != null ? '오늘 기록' : '미기록';
  const bbtSparkline = bbtHistory?.data.slice(-7).map(p => p.bbt) ?? [];

  const symptomCount = todayLog
    ? [(todayLog.headache ?? 0) > 0, (todayLog.cramps ?? 0) > 0,
      (todayLog.fatigue ?? 0) > 0, (todayLog.bloating ?? 0) > 0].filter(Boolean).length
    : null;
  const symptomValue = symptomCount !== null ? (symptomCount > 0 ? `${symptomCount}개` : '없음') : '—';
  const symptomDetail = symptomCount !== null ? '오늘 기록' : '미기록';

  const ovDate = prediction?.predicted_ovulation_on;
  const ovDays = ovDate
    ? Math.round((new Date(ovDate + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
    : null;
  const ovValue = ovDays !== null ? (ovDays > 0 ? `D-${ovDays}` : ovDays === 0 ? 'D-day' : '지남') : '—';
  const ovDetail = ovDays !== null ? '배란 예정' : '데이터 없음';
  // ─────────────────────────────────────────────────────────────────────────

  function handleStartPeriod() {
    startPeriod.mutate({ flowLevel: selectedFlow, startedOn: selectedDate }, {
      onSuccess: () => Toast.show({ type: 'success', text1: '생리 시작을 기록했어요.' }),
      onError: () => Toast.show({ type: 'error', text1: '기록 실패', text2: '다시 시도해주세요.' }),
    });
  }

  function handleEndPeriod() {
    if (!latestCycle) return;
    endPeriod.mutate({ cycleId: latestCycle.id, endedOn: selectedEndDate }, {
      onSuccess: () => Toast.show({ type: 'success', text1: '생리 종료를 기록했어요.' }),
      onError: () => Toast.show({ type: 'error', text1: '기록 실패', text2: '다시 시도해주세요.' }),
    });
  }

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

        {/* 생리 시작/종료 카드 */}
        {!cycleLoading && isActivePeriod ? (
          <View style={[styles.periodCard, Shadow.card]}>
            <View style={styles.periodCardHeader}>
              <View style={styles.activeDot} />
              <Text style={styles.periodCardTitle}>생리 중</Text>
              <Text style={styles.periodCardSince}>
                {latestCycle.started_on.slice(5).replace('-', '/')} 시작
              </Text>
            </View>
            <View style={styles.dateSectionRow}>
              <Text style={styles.dateSectionLabel}>종료일</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScrollContent}>
                {endDateOptions.map((dateStr) => (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dateChip, selectedEndDate === dateStr && styles.dateChipActive]}
                    onPress={() => setSelectedEndDate(dateStr)}
                  >
                    <Text style={[styles.dateChipText, selectedEndDate === dateStr && styles.dateChipTextActive]}>
                      {formatDateChip(dateStr)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity
              style={[styles.periodBtn, styles.periodBtnEnd]}
              onPress={handleEndPeriod}
              disabled={endPeriod.isPending}
            >
              <Text style={[styles.periodBtnText, styles.periodBtnTextDark]}>
                {endPeriod.isPending ? '기록 중…' : '생리 종료'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : !cycleLoading ? (
          <View style={[styles.periodCard, Shadow.card]}>
            <Text style={styles.periodCardTitle}>생리가 시작됐나요?</Text>
            <View style={styles.dateSectionRow}>
              <Text style={styles.dateSectionLabel}>시작일</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScrollContent}>
                {recentDates.map((dateStr) => (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dateChip, selectedDate === dateStr && styles.dateChipActive]}
                    onPress={() => setSelectedDate(dateStr)}
                  >
                    <Text style={[styles.dateChipText, selectedDate === dateStr && styles.dateChipTextActive]}>
                      {formatDateChip(dateStr)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.flowRow}>
              {([1, 2, 3] as const).map((lv) => {
                const labels = { 1: '가벼움', 2: '보통', 3: '많음' };
                return (
                  <TouchableOpacity
                    key={lv}
                    style={[styles.flowChip, selectedFlow === lv && styles.flowChipActive]}
                    onPress={() => setSelectedFlow(lv)}
                  >
                    <Text style={[styles.flowChipText, selectedFlow === lv && styles.flowChipTextActive]}>
                      {labels[lv]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.periodBtn, styles.periodBtnStart]}
              onPress={handleStartPeriod}
              disabled={startPeriod.isPending}
            >
              <Text style={styles.periodBtnText}>{startPeriod.isPending ? '기록 중…' : '생리 시작'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.historyLink} onPress={() => setShowCycleHistory(true)} accessibilityRole="button">
          <Text style={styles.historyLinkText}>주기 이력 보기</Text>
        </TouchableOpacity>

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

          <StatTile eyebrow="기분" value={moodLabel} detail={moodDetail} width={bentoHalfWidth} />
          <StatTile eyebrow="기초체온" value={bbtValue} detail={bbtDetail} width={bentoHalfWidth}>
            {bbtSparkline.length > 1 && <MiniSparkline data={bbtSparkline} />}
          </StatTile>
          <StatTile eyebrow="증상" value={symptomValue} detail={symptomDetail} width={bentoHalfWidth} />
          <StatTile eyebrow="배란" value={ovValue} detail={ovDetail} width={bentoHalfWidth} />

          <CycleRingTile day={cycleDay} cycleLength={cycleLength} phaseKey={phaseKey} startLabel={prediction ? `${cycleLength}일 평균 주기` : '데이터 없음'} />
        </View>
      </ScrollView>

      <CycleHistoryModal visible={showCycleHistory} onClose={() => setShowCycleHistory(false)} />
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
  aiCard: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: 20, padding: 18 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.ink3 },
  aiText: { fontSize: 14, fontWeight: '500', color: Colors.ink1, lineHeight: 21, letterSpacing: -0.1 },
  periodCard: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: 20, padding: 18, gap: 14 },
  periodCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.coral },
  periodCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink1 },
  periodCardSince: { fontSize: 12, color: Colors.ink3, marginLeft: 'auto' },
  dateSectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateSectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.ink3 },
  dateScrollContent: { gap: 6, flexDirection: 'row' },
  dateChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.bgAlt, borderWidth: 1.5, borderColor: 'transparent' },
  dateChipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  dateChipText: { fontSize: 12, fontWeight: '600', color: Colors.ink2 },
  dateChipTextActive: { color: Colors.inkInv },
  flowRow: { flexDirection: 'row', gap: 8 },
  flowChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.pill, backgroundColor: Colors.bgAlt, borderWidth: 1.5, borderColor: 'transparent' },
  flowChipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  flowChipText: { fontSize: 13, fontWeight: '600', color: Colors.ink2 },
  flowChipTextActive: { color: Colors.inkInv },
  periodBtn: { paddingVertical: 14, borderRadius: Radius.pill, alignItems: 'center' },
  periodBtnStart: { backgroundColor: Colors.coral },
  periodBtnEnd: { backgroundColor: Colors.bgAlt },
  periodBtnText: { fontSize: 14, fontWeight: '700', color: Colors.inkInv },
  periodBtnTextDark: { color: Colors.ink1 },
  historyLink: { alignSelf: 'flex-start', paddingVertical: 2 },
  historyLinkText: { fontSize: 12, color: Colors.ink3, fontWeight: '600' },
});
