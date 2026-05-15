import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { LunaLogo } from '../components/ui/LunaLogo';
import { Icon } from '../components/ui/Icon';
import { HeroCard } from '../components/home/HeroCard';
import { StatTile } from '../components/home/StatTile';
import { MiniSparkline } from '../components/home/MiniSparkline';
import { CycleRingTile } from '../components/home/CycleRingTile';
import { CycleHistoryModal } from '../components/home/CycleHistoryModal';
import { DateSearchSheet } from '../components/home/DateSearchSheet';
import { NotificationHistorySheet } from '../components/home/NotificationHistorySheet';
import { PeriodDateSheet } from '../components/home/PeriodDateSheet';
import { phaseForDay, daysUntilPeriod, CYCLE_DEFAULTS } from '../utils/phase';
import { usePrediction } from '../hooks/usePrediction';
import { useAiDailyInsight } from '../hooks/useAiDailyInsight';
import { useLatestCycle, useStartPeriod, useEndPeriod } from '../hooks/useCycles';
import { useTodayLog } from '../hooks/useDailyLog';
import { useBbtHistory } from '../hooks/useBbtHistory';
import { usePeriodLength } from '../hooks/usePeriodLength';
import type { TabParamList } from '../navigation/TabNavigator';

const MOOD_LABELS: Record<number, string> = { 5: '좋음', 4: '평온', 3: '짜증', 2: '피곤', 1: '불안' };

function formatGeneratedAt(generatedAt: string | null | undefined): string | null {
  if (!generatedAt) return null;
  const d = new Date(generatedAt);
  if (isNaN(d.getTime())) return null;
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const h = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${h}:${minutes} 생성`;
}


export function HomeScreen() {
  const { width: screenW } = useWindowDimensions();
  const bentoHalfWidth = (screenW - 32 - 10) / 2;
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { data: prediction } = usePrediction();
  const { data: latestCycle, isLoading: cycleLoading } = useLatestCycle();
  const { data: todayLog } = useTodayLog();
  const { data: bbtHistory } = useBbtHistory();
  const startPeriod = useStartPeriod();
  const endPeriod = useEndPeriod();
  const [showCycleHistory, setShowCycleHistory] = useState(false);
  const [showDateSearch, setShowDateSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [periodSheet, setPeriodSheet] = useState<'start' | 'end' | null>(null);

  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);
  const { data: insight, isLoading: insightLoading } = useAiDailyInsight(todayIso);

  // latestCycle.started_on 우선 — 유저가 직접 기록한 값이 기준
  const cycleDay = useMemo(() => {
    if (latestCycle?.started_on) {
      const start = new Date(latestCycle.started_on + 'T00:00:00');
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1;
    }
    return prediction?.cycle_day ?? 1;
  }, [latestCycle?.started_on, prediction?.cycle_day]);
  const cycleLength: number = prediction?.avg_cycle_length ?? CYCLE_DEFAULTS.length;
  const periodLength = usePeriodLength();
  const phaseKey = phaseForDay(cycleDay, cycleLength, periodLength);
  const dPeriod = daysUntilPeriod(cycleDay, cycleLength);

  const isActivePeriod = !!latestCycle && !latestCycle.ended_on;

  const periodDayCount = useMemo(() => {
    if (!latestCycle || latestCycle.ended_on) return null;
    const start = new Date(latestCycle.started_on + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
  }, [latestCycle, todayIso]);

  const daysUntilNext = useMemo(() => {
    if (!prediction?.predicted_period_start) return null;
    const next = new Date(prediction.predicted_period_start + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((next.getTime() - today.getTime()) / 86_400_000);
  }, [prediction]);

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

  function recordPeriodStart(date: string, flowLevel: 1 | 2 | 3 = 2) {
    startPeriod.mutate({ flowLevel, startedOn: date }, {
      onSuccess: () => { setPeriodSheet(null); Toast.show({ type: 'success', text1: '생리 시작을 기록했어요.' }); },
      onError: () => Toast.show({ type: 'error', text1: '기록 실패', text2: '다시 시도해주세요.' }),
    });
  }

  function handlePeriodSheetConfirm({ date, flowLevel }: { date: string; flowLevel?: 1 | 2 | 3 }) {
    if (periodSheet === 'start') {
      recordPeriodStart(date, flowLevel);
    } else if (periodSheet === 'end') {
      if (!latestCycle) {
        Toast.show({ type: 'error', text1: '기록 실패', text2: '활성 주기를 찾을 수 없어요.' });
        return;
      }
      endPeriod.mutate({ cycleId: latestCycle.id, endedOn: date }, {
        onSuccess: () => { setPeriodSheet(null); Toast.show({ type: 'success', text1: '생리 종료를 기록했어요.' }); },
        onError: () => Toast.show({ type: 'error', text1: '기록 실패', text2: '다시 시도해주세요.' }),
      });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <LunaLogo size={18} />
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowDateSearch(true)} accessibilityRole="button" accessibilityLabel="검색">
            <Icon name="search" size={20} color={Colors.ink1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotifications(true)} accessibilityRole="button" accessibilityLabel="알림">
            <Icon name="bell" size={20} color={Colors.ink1} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroCard phaseKey={phaseKey} cycleDay={cycleDay} daysUntilPeriod={dPeriod} onDetail={() => navigation.navigate('Calendar')} />

        {/* 생리 상태 카드 */}
        {!cycleLoading && isActivePeriod ? (
          <View style={[styles.periodCard, Shadow.card]}>
            <View style={styles.periodCardHeader}>
              <View style={styles.activeDot} />
              <Text style={styles.periodCardTitle}>생리 중</Text>
              {periodDayCount !== null && (
                <Text style={styles.periodDayBadge}>{periodDayCount}일째</Text>
              )}
            </View>
            <Text style={styles.periodCardMeta}>
              {latestCycle.started_on.slice(5).replace('-', '/')} 시작
              {latestCycle.estimated_period_end
                ? `  ·  예상 종료 ${latestCycle.estimated_period_end.slice(5).replace('-', '/')}`
                : ''}
            </Text>
            <TouchableOpacity
              style={[styles.periodBtn, styles.periodBtnEnd]}
              onPress={() => setPeriodSheet('end')}
            >
              <Text style={[styles.periodBtnText, styles.periodBtnTextDark]}>생리 종료 기록</Text>
            </TouchableOpacity>
          </View>
        ) : !cycleLoading ? (
          <View style={[styles.periodCard, Shadow.card]}>
            {daysUntilNext !== null ? (
              <>
                <Text style={styles.periodCardTitle}>
                  생리 예정일까지 {daysUntilNext > 0 ? `D-${daysUntilNext}` : daysUntilNext === 0 ? 'D-day' : '지남'}
                </Text>
                {prediction?.predicted_period_start && (
                  <Text style={styles.periodCardMeta}>
                    {(() => { const d = new Date(prediction.predicted_period_start + 'T00:00:00'); return `${d.getMonth() + 1}월 ${d.getDate()}일 예정`; })()}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.periodCardTitle}>생리 주기를 기록해보세요</Text>
                <Text style={styles.periodCardMeta}>시작일을 기록하면 다음 예정일을 알려드려요</Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.periodBtn, styles.periodBtnStart]}
              onPress={() => recordPeriodStart(todayIso)}
              disabled={startPeriod.isPending}
            >
              <Text style={styles.periodBtnText}>
                {startPeriod.isPending ? '기록 중…' : '오늘 생리가 시작됐어요'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPeriodSheet('start')} style={styles.altLink}>
              <Text style={styles.altLinkText}>다른 날짜로 기록 →</Text>
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
            </View>
            {insightLoading ? (
              <ActivityIndicator size="small" color={Colors.coral} style={styles.aiLoader} />
            ) : (
              <>
                <Text style={styles.aiText}>
                  {insight?.content ?? '오늘의 인사이트를 준비 중이에요.'}
                </Text>
                {(() => { const ts = formatGeneratedAt(insight?.generated_at); return ts != null && <Text style={styles.aiTimestamp}>{ts}</Text>; })()}
              </>
            )}
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

      <PeriodDateSheet
        visible={periodSheet !== null}
        onClose={() => setPeriodSheet(null)}
        mode={periodSheet ?? 'start'}
        minDate={periodSheet === 'end' ? latestCycle?.started_on : undefined}
        onConfirm={handlePeriodSheetConfirm}
        isLoading={startPeriod.isPending || endPeriod.isPending}
      />
      <CycleHistoryModal visible={showCycleHistory} onClose={() => setShowCycleHistory(false)} />
      <DateSearchSheet
        visible={showDateSearch}
        onClose={() => setShowDateSearch(false)}
        onSelect={(date) => navigation.navigate('Record', { date })}
      />
      <NotificationHistorySheet visible={showNotifications} onClose={() => setShowNotifications(false)} />
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
  aiEyebrow: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.ink3 },
  aiText: { fontSize: 14, fontFamily: 'NotoSansKR_500Medium', color: Colors.ink1, lineHeight: 21, letterSpacing: -0.1 },
  aiLoader: { alignSelf: 'flex-start', marginTop: 4 },
  aiTimestamp: { fontSize: 11, color: Colors.ink3, marginTop: 8 },
  periodCard: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: 20, padding: 18, gap: 10 },
  periodCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.coral },
  periodCardTitle: { fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1 },
  periodDayBadge: { marginLeft: 'auto', fontSize: 13, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.coral },
  periodCardMeta: { fontSize: 13, color: Colors.ink3, fontFamily: 'NotoSansKR_500Medium' },
  periodBtn: { marginTop: 4, paddingVertical: 14, borderRadius: Radius.pill, alignItems: 'center' },
  periodBtnStart: { backgroundColor: Colors.coral },
  periodBtnEnd: { backgroundColor: Colors.bgAlt },
  periodBtnText: { fontSize: 14, fontFamily: 'NotoSansKR_700Bold', color: Colors.inkInv },
  periodBtnTextDark: { color: Colors.ink1 },
  altLink: { alignSelf: 'center', paddingVertical: 2 },
  altLinkText: { fontSize: 12, color: Colors.ink3, fontFamily: 'NotoSansKR_600SemiBold' },
  historyLink: { alignSelf: 'flex-start', paddingVertical: 2 },
  historyLinkText: { fontSize: 12, color: Colors.ink3, fontFamily: 'NotoSansKR_600SemiBold' },
});
