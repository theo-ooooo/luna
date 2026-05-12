import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlowId = 'none' | 'spot' | 'light' | 'med' | 'heavy';

interface FlowOption {
  id: FlowId;
  label: string;
  dots: number;
}

const FLOW_OPTIONS: FlowOption[] = [
  { id: 'none',  label: '없음',   dots: 0 },
  { id: 'spot',  label: '점출혈', dots: 1 },
  { id: 'light', label: '적음',   dots: 2 },
  { id: 'med',   label: '보통',   dots: 3 },
  { id: 'heavy', label: '많음',   dots: 4 },
];

const MOODS = [
  { id: '좋음', emoji: '😊' },
  { id: '평온', emoji: '😌' },
  { id: '피곤', emoji: '😴' },
  { id: '짜증', emoji: '😤' },
  { id: '우울', emoji: '😔' },
  { id: '불안', emoji: '😰' },
] as const;

const SYMPTOMS = [
  '두통', '복통', '요통', '유방통', '메스꺼움',
  '부종', '여드름', '식욕증가', '어지러움', '경련',
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export function RecordScreen() {
  const [flow, setFlow] = useState<FlowId | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bbt, setBbt] = useState('');
  const [lhResult, setLhResult] = useState<0 | 1 | 2 | null>(null);
  const [notes, setNotes] = useState('');

  function toggleArr<T>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 · ${['일','월','화','수','목','금','토'][today.getDay()]}`;

  function handleSave() {
    // TODO: call API POST /api/v1/daily_logs
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft} />
        <Text style={styles.topBarLabel}>03 · 기록</Text>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="저장"
        >
          <Text style={styles.saveBtnText}>저장</Text>
          <Icon name="check" size={14} strokeWidth={2.4} color={Colors.inkInv} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date hero */}
        <View style={[styles.heroCard, Shadow.lift]}>
          <Text style={styles.heroDate}>{dateLabel}</Text>
          <Text style={styles.heroTitle}>오늘 어떠셨나요?</Text>
        </View>

        {/* Flow section */}
        <SectionCard title="출혈량">
          <View style={styles.flowRow}>
            {FLOW_OPTIONS.map(opt => {
              const active = flow === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.flowChip, active && styles.flowChipActive]}
                  onPress={() => setFlow(active ? null : opt.id)}
                  accessibilityRole="button"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ selected: active }}
                >
                  <FlowDots count={opt.dots} active={active} />
                  <Text style={[styles.flowChipText, active && styles.flowChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Mood section */}
        <SectionCard title="기분">
          <View style={styles.chipGrid}>
            {MOODS.map(m => {
              const active = moods.includes(m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.moodChip, active && styles.moodChipActive]}
                  onPress={() => toggleArr(moods, setMoods, m.id)}
                  accessibilityRole="button"
                  accessibilityLabel={m.id}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>{m.id}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Symptoms section */}
        <SectionCard title="증상">
          <View style={styles.chipGrid}>
            {SYMPTOMS.map(s => {
              const active = symptoms.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                  onPress={() => toggleArr(symptoms, setSymptoms, s)}
                  accessibilityRole="button"
                  accessibilityLabel={s}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* BBT section */}
        <SectionCard title="기초 체온 (°C)">
          <View style={styles.bbtRow}>
            <TextInput
              style={styles.bbtInput}
              value={bbt}
              onChangeText={setBbt}
              placeholder="36.5"
              placeholderTextColor={Colors.ink4}
              keyboardType="decimal-pad"
              maxLength={5}
              accessibilityLabel="기초체온 입력"
            />
            <Text style={styles.bbtUnit}>°C</Text>
          </View>
        </SectionCard>

        {/* LH test section */}
        <SectionCard title="LH 테스트">
          <View style={styles.lhRow}>
            {([
              { val: 0 as const, label: '미측정' },
              { val: 1 as const, label: '음성' },
              { val: 2 as const, label: '양성 (surge)' },
            ] as const).map(opt => {
              const active = lhResult === opt.val;
              return (
                <TouchableOpacity
                  key={opt.val}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                  onPress={() => setLhResult(active ? null : opt.val)}
                  accessibilityRole="button"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Notes section */}
        <SectionCard title="메모">
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="오늘 몸 상태나 특이 사항을 기록해 보세요."
            placeholderTextColor={Colors.ink4}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="메모 입력"
          />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={[styles.sectionCard, Shadow.card]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FlowDots({ count, active }: { count: number; active: boolean }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i < count ? (active ? Colors.coral : Colors.ink2) : Colors.ink4 },
          ]}
        />
      ))}
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
  topBarLeft: { width: 40 },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgInk, borderRadius: Radius.pill,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: Colors.inkInv },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },

  // Hero date card
  heroCard: {
    backgroundColor: Colors.bgInk,
    borderRadius: Radius.card,
    padding: 24,
  },
  heroDate: { fontSize: 11, fontWeight: '700', color: 'rgba(242,238,232,0.5)', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -1, color: Colors.inkInv, marginTop: 8 },

  // Section card
  sectionCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.tile, padding: 18,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase',
    color: Colors.ink3, marginBottom: 14,
  },

  // Flow
  flowRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  flowChip: {
    flex: 1, minWidth: 56, alignItems: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: Colors.bgAlt, borderRadius: Radius.chip,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  flowChipActive: {
    backgroundColor: Colors.bgInk, borderColor: Colors.coral,
  },
  flowChipText: { fontSize: 11, fontWeight: '600', color: Colors.ink2 },
  flowChipTextActive: { color: Colors.inkInv },
  dotsRow: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  // Mood
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: Colors.bgAlt, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  moodChipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  moodEmoji: { fontSize: 16 },
  moodLabel: { fontSize: 13, fontWeight: '600', color: Colors.ink2 },
  moodLabelActive: { color: Colors.inkInv },

  // Tag chips (symptoms, LH)
  tagChip: {
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: Colors.bgAlt, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  tagChipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  tagChipText: { fontSize: 13, fontWeight: '600', color: Colors.ink2 },
  tagChipTextActive: { color: Colors.inkInv },

  lhRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  // BBT
  bbtRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bbtInput: {
    flex: 1, fontSize: 36, fontWeight: '900', letterSpacing: -1,
    color: Colors.ink1, paddingVertical: 4,
    borderBottomWidth: 2, borderBottomColor: Colors.borderSoft,
  },
  bbtUnit: { fontSize: 18, fontWeight: '700', color: Colors.ink3 },

  // Notes
  notesInput: {
    fontSize: 14, color: Colors.ink1, lineHeight: 22,
    borderWidth: 1.5, borderColor: Colors.borderSoft,
    borderRadius: 12, padding: 12, minHeight: 96,
  },
});
