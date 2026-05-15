import React, { useEffect, useRef } from 'react';
import {
  Animated, Modal, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Phase, Radius } from '../../theme/tokens';
import type { PhaseKey } from '../../theme/tokens';

const SHEET_HEIGHT = 420;

export interface DayAction {
  label: string;
  variant?: 'default' | 'coral';
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  month: number;
  day: number;
  isToday?: boolean;
  phaseKey?: PhaseKey;
  logChips?: string[];
  actions: DayAction[];
}

const PHASE_LABELS: Record<PhaseKey, string> = {
  menstrual: '생리기',
  follicular: '생리 후',
  ovulation: '가임기',
  luteal: '생리 전',
};

export function DayActionSheet({ visible, onClose, month, day, isToday, phaseKey, logChips = [], actions }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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

  const phase = phaseKey ? Phase[phaseKey] : null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />

        {/* 위상 상세 헤더 */}
        <View style={[styles.detailCard, phase && { backgroundColor: phase.bg }]}>
          {phase && <View style={[styles.blob, { backgroundColor: phase.color }]} />}
          <View style={styles.detailContent}>
            {phase && (
              <View style={styles.phaseRow}>
                <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                <Text style={styles.phaseLabel}>{PHASE_LABELS[phaseKey!]}</Text>
              </View>
            )}
            <View style={styles.dayRow}>
              <Text style={[styles.dayNumber, phase && { color: Colors.ink1 }]}>
                {day}<Text style={{ color: phase?.color ?? Colors.coral }}>.</Text>
              </Text>
              <Text style={styles.dayMeta}>{month}월 · {isToday ? '오늘' : `Day ${day}`}</Text>
            </View>
            {phase && <Text style={styles.phaseDesc}>{phase.desc}</Text>}
            {logChips.length > 0 && (
              <View style={styles.chipRow}>
                {logChips.map(tag => (
                  <View key={tag} style={styles.chip}>
                    <Text style={styles.chipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionBtn, action.variant === 'coral' && styles.actionBtnCoral]}
              onPress={() => { onClose(); action.onPress(); }}
              activeOpacity={0.75}
            >
              <Text style={[styles.actionLabel, action.variant === 'coral' && styles.actionLabelCoral]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelLabel}>취소</Text>
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
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderSoft,
    alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  detailCard: {
    marginHorizontal: 16, borderRadius: Radius.card,
    padding: 18, overflow: 'hidden',
    backgroundColor: Colors.bgAlt,
  },
  blob: {
    position: 'absolute', right: -30, top: -30,
    width: 120, height: 120, borderRadius: 60, opacity: 0.2,
  },
  detailContent: { position: 'relative' },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  phaseDot: { width: 7, height: 7, borderRadius: 4 },
  phaseLabel: { fontSize: 10, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1, letterSpacing: 0.6 },
  dayRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  dayNumber: { fontSize: 44, fontFamily: 'NotoSansKR_900Black', letterSpacing: -2, lineHeight: 44, color: Colors.ink1 },
  dayMeta: { fontSize: 13, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink2, paddingBottom: 4 },
  phaseDesc: { fontSize: 12, color: Colors.ink2, lineHeight: 18, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.65)' },
  chipText: { fontSize: 11, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink1 },
  actions: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  actionBtn: {
    paddingVertical: 14, borderRadius: Radius.card,
    backgroundColor: Colors.bgAlt, alignItems: 'center',
  },
  actionBtnCoral: { backgroundColor: Colors.coral },
  actionLabel: { fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1 },
  actionLabelCoral: { color: Colors.inkInv },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelLabel: { fontSize: 14, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink3 },
});
