import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Modal, ScrollView, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import type { Cycle } from '../../hooks/useCycles';
import { todayStr } from '../../utils/date';

const SHEET_HEIGHT = 380;

interface Props {
  visible: boolean;
  onClose: () => void;
  cycle: Cycle | null;
  onConfirm: (params: { startedOn: string; endedOn: string | null }) => void;
  isLoading?: boolean;
}

function buildDateRange(center: string, daysBefore: number, daysAfter: number, maxDate?: string): string[] {
  const max = maxDate ?? todayStr();
  const dates: string[] = [];
  const base = new Date(center + 'T00:00:00');
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (s <= max) dates.push(s);
  }
  return dates.sort((a, b) => (a > b ? -1 : 1));
}

function fmtChip(iso: string): string {
  const today = todayStr();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  if (iso === today) return '오늘';
  if (iso === yesterday) return '어제';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function CycleEditSheet({ visible, onClose, cycle, onConfirm, isLoading }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [startedOn, setStartedOn] = useState('');
  const [endedOn, setEndedOn] = useState<string | null>(null);

  useEffect(() => {
    if (cycle) {
      setStartedOn(cycle.started_on);
      setEndedOn(cycle.ended_on);
    }
  }, [cycle, visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: Motion.fast, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 260 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: Motion.fast, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: Motion.fast, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  const startOptions = cycle ? buildDateRange(cycle.started_on, 7, 3) : [];
  const endOptions = cycle
    ? buildDateRange(endedOn ?? cycle.ended_on ?? todayStr(), 14, 14, todayStr()).filter(d => d >= startedOn)
    : [];

  function handleConfirm() {
    onConfirm({ startedOn, endedOn });
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>생리 기간 수정</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.ink2} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>시작일</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {startOptions.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, startedOn === d && styles.chipActive]}
                onPress={() => {
                  setStartedOn(d);
                  if (endedOn && endedOn < d) setEndedOn(d);
                }}
              >
                <Text style={[styles.chipText, startedOn === d && styles.chipTextActive]}>{fmtChip(d)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.sectionLabel, { marginTop: 14 }]}>종료일</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, endedOn === null && styles.chipActive]}
              onPress={() => setEndedOn(null)}
            >
              <Text style={[styles.chipText, endedOn === null && styles.chipTextActive]}>진행 중</Text>
            </TouchableOpacity>
            {endOptions.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, endedOn === d && styles.chipActive]}
                onPress={() => setEndedOn(d)}
              >
                <Text style={[styles.chipText, endedOn === d && styles.chipTextActive]}>{fmtChip(d)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <Text style={styles.confirmBtnText}>{isLoading ? '수정 중…' : '수정 완료'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,17,15,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.borderSoft, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSoft,
  },
  title: { fontSize: 17, fontFamily: 'NotoSansKR_800ExtraBold', color: Colors.ink1, letterSpacing: -0.4 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 18, gap: 8 },
  sectionLabel: { fontSize: 12, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink3 },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgAlt,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  chipText: { fontSize: 13, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink2 },
  chipTextActive: { color: Colors.inkInv },
  confirmBtn: {
    marginTop: 20, paddingVertical: 15, borderRadius: Radius.pill,
    backgroundColor: Colors.coral, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: Colors.inkInv },
});
