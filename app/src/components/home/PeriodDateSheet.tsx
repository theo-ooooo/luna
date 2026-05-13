import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Modal, ScrollView, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

const SHEET_HEIGHT = 320;

interface Props {
  visible: boolean;
  onClose: () => void;
  mode: 'start' | 'end';
  minDate?: string;
  onConfirm: (params: { date: string; flowLevel?: 1 | 2 | 3 }) => void;
  isLoading?: boolean;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildDateOptions(minDate?: string): string[] {
  const today = new Date();
  const todayS = todayStr();
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (s > todayS) continue;
    if (minDate && s < minDate) continue;
    dates.push(s);
  }
  return dates;
}

function fmtChip(iso: string): string {
  const today = todayStr();
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  if (iso === today) return '오늘';
  if (iso === yesterday) return '어제';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const FLOW_LABELS: Record<1 | 2 | 3, string> = { 1: '가벼움', 2: '보통', 3: '많음' };

export function PeriodDateSheet({ visible, onClose, mode, minDate, onConfirm, isLoading }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const dateOptions = buildDateOptions(mode === 'end' ? minDate : undefined);
  const [selectedDate, setSelectedDate] = useState(() => dateOptions[0] ?? todayStr());
  const [selectedFlow, setSelectedFlow] = useState<1 | 2 | 3>(2);

  useEffect(() => {
    const dates = buildDateOptions(mode === 'end' ? minDate : undefined);
    setSelectedDate(dates[0] ?? todayStr());
  }, [visible, mode, minDate]);

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

  function handleConfirm() {
    onConfirm({ date: selectedDate, flowLevel: mode === 'start' ? selectedFlow : undefined });
  }

  const title = mode === 'start' ? '생리 시작일 선택' : '생리 종료일 선택';
  const confirmLabel = isLoading ? '기록 중…' : (mode === 'start' ? '생리 시작 기록' : '생리 종료 기록');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.ink2} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>날짜</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {dateOptions.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, selectedDate === d && styles.chipActive]}
                onPress={() => setSelectedDate(d)}
              >
                <Text style={[styles.chipText, selectedDate === d && styles.chipTextActive]}>{fmtChip(d)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {mode === 'start' && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>출혈량</Text>
              <View style={styles.flowRow}>
                {([1, 2, 3] as const).map(lv => (
                  <TouchableOpacity
                    key={lv}
                    style={[styles.chip, styles.chipFlex, selectedFlow === lv && styles.chipActive]}
                    onPress={() => setSelectedFlow(lv)}
                  >
                    <Text style={[styles.chipText, selectedFlow === lv && styles.chipTextActive]}>{FLOW_LABELS[lv]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
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
  title: { fontSize: 17, fontWeight: '800', color: Colors.ink1, letterSpacing: -0.4 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 18, gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.ink3 },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  flowRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgAlt,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipFlex: { flex: 1, alignItems: 'center' },
  chipActive: { backgroundColor: Colors.bgInk, borderColor: Colors.coral },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.ink2 },
  chipTextActive: { color: Colors.inkInv },
  confirmBtn: {
    marginTop: 20, paddingVertical: 15, borderRadius: Radius.pill,
    backgroundColor: Colors.coral, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: Colors.inkInv },
});
