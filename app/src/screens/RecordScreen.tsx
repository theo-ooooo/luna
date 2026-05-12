import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { FlowSelector } from '../components/record/FlowSelector';
import { TagChipGroup } from '../components/record/TagChipGroup';
import { useRecordForm } from '../hooks/useRecordForm';
import { useTodayLog, useSaveDailyLog, buildLogFields } from '../hooks/useDailyLog';
import type { TabParamList } from '../navigation/TabNavigator';

const MOODS = ['좋음', '평온', '피곤', '짜증', '우울', '불안'] as const;
const MOOD_EMOJI: Record<string, string> = {
  좋음: '😊', 평온: '😌', 피곤: '😴', 짜증: '😤', 우울: '😔', 불안: '😰',
};
const SYMPTOMS = ['두통', '복통', '요통', '유방통', '메스꺼움', '부종', '여드름', '식욕증가', '어지러움', '경련'] as const;
const LH_OPTIONS = [{ val: 0 as const, label: '미측정' }, { val: 1 as const, label: '음성' }, { val: 2 as const, label: '양성 (surge)' }] as const;

export function RecordScreen() {
  const form = useRecordForm();
  const { data: todayLog } = useTodayLog();
  const save = useSaveDailyLog();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 · ${'일월화수목금토'[today.getDay()]}`;

  function handleSave() {
    save.mutate(
      { id: todayLog?.id, fields: buildLogFields(form) },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: '기록 저장 완료!', text2: '오늘의 기록이 저장됐어요.', onHide: () => navigation.navigate('Home') });
        },
        onError: (err) => {
          Toast.show({ type: 'error', text1: '저장 실패', text2: (err as Error).message ?? '다시 시도해주세요.' });
        },
      },
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft} />
        <Text style={styles.topBarLabel}>03 · 기록</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={save.isPending} accessibilityRole="button" accessibilityLabel="저장">
          <Text style={styles.saveBtnText}>{save.isPending ? '저장 중…' : '저장'}</Text>
          <Icon name="check" size={14} strokeWidth={2.4} color={Colors.inkInv} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.heroCard, Shadow.lift]}>
          <Text style={styles.heroDate}>{dateLabel}</Text>
          <Text style={styles.heroTitle}>오늘 어떠셨나요?</Text>
        </View>

        <Section title="출혈량">
          <FlowSelector value={form.flow} onChange={form.setFlow} />
        </Section>

        <Section title="기분">
          <TagChipGroup options={MOODS} selected={form.moods} onToggle={form.toggleMood} emojiMap={MOOD_EMOJI} />
        </Section>

        <Section title="증상">
          <TagChipGroup options={SYMPTOMS} selected={form.symptoms} onToggle={form.toggleSymptom} />
        </Section>

        <Section title="기초 체온 (°C)">
          <View style={styles.bbtRow}>
            <TextInput
              style={styles.bbtInput}
              value={form.bbt}
              onChangeText={form.setBbt}
              placeholder="36.5"
              placeholderTextColor={Colors.ink4}
              keyboardType="decimal-pad"
              maxLength={5}
              accessibilityLabel="기초체온 입력"
            />
            <Text style={styles.bbtUnit}>°C</Text>
          </View>
        </Section>

        <Section title="LH 테스트">
          <View style={styles.lhRow}>
            {LH_OPTIONS.map(opt => {
              const active = form.lhResult === opt.val;
              return (
                <TouchableOpacity
                  key={opt.val}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                  onPress={() => form.setLhResult(active ? null : opt.val)}
                  accessibilityRole="button"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title="메모">
          <TextInput
            style={styles.notesInput}
            value={form.notes}
            onChangeText={form.setNotes}
            placeholder="오늘 몸 상태나 특이 사항을 기록해 보세요."
            placeholderTextColor={Colors.ink4}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="메모 입력"
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={[styles.section, Shadow.card]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  topBarLeft: { width: 40 },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgInk, borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: Colors.inkInv },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  heroCard: { backgroundColor: Colors.bgInk, borderRadius: Radius.card, padding: 24 },
  heroDate: { fontSize: 11, fontWeight: '700', color: 'rgba(242,238,232,0.5)', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -1, color: Colors.inkInv, marginTop: 8 },
  section: { backgroundColor: Colors.bgCard, borderRadius: Radius.tile, padding: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.ink3, marginBottom: 14 },
  bbtRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bbtInput: { flex: 1, fontSize: 36, fontWeight: '900', letterSpacing: -1, color: Colors.ink1, paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: Colors.borderSoft },
  bbtUnit: { fontSize: 18, fontWeight: '700', color: Colors.ink3 },
  lhRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tagChip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.bgAlt, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: 'transparent' },
  tagChipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  tagChipText: { fontSize: 13, fontWeight: '600', color: Colors.ink2 },
  tagChipTextActive: { color: Colors.inkInv },
  notesInput: { fontSize: 14, color: Colors.ink1, lineHeight: 22, borderWidth: 1.5, borderColor: Colors.borderSoft, borderRadius: 12, padding: 12, minHeight: 96 },
});
