import React, { useEffect, useRef } from 'react';
import {
  Animated, Modal, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Radius, Phase } from '../../theme/tokens';
import type { PhaseKey } from '../../theme/tokens';

const SHEET_HEIGHT = 260;

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
  phaseKey?: PhaseKey;
  actions: DayAction[];
}

const PHASE_LABELS: Record<PhaseKey, string> = {
  menstrual: '생리기',
  follicular: '생리 후',
  ovulation: '가임기',
  luteal: '생리 전',
};

export function DayActionSheet({ visible, onClose, month, day, phaseKey, actions }: Props) {
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

        <View style={styles.header}>
          <Text style={styles.dateText}>{month}월 {day}일</Text>
          {phase && (
            <View style={[styles.phaseBadge, { backgroundColor: phase.bg }]}>
              <Text style={[styles.phaseLabel, { color: phase.fg }]}>{PHASE_LABELS[phaseKey!]}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.actionBtn,
                action.variant === 'coral' && styles.actionBtnCoral,
              ]}
              onPress={() => { onClose(); action.onPress(); }}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.actionLabel,
                action.variant === 'coral' && styles.actionLabelCoral,
              ]}>
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
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSoft,
  },
  dateText: {
    fontSize: 18, fontFamily: 'NotoSansKR_800ExtraBold',
    color: Colors.ink1, letterSpacing: -0.4,
  },
  phaseBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  phaseLabel: {
    fontSize: 11, fontFamily: 'NotoSansKR_700Bold', letterSpacing: 0.2,
  },
  actions: {
    paddingHorizontal: 16, paddingTop: 12, gap: 8,
  },
  actionBtn: {
    paddingVertical: 15, borderRadius: Radius.card,
    backgroundColor: Colors.bgAlt,
    alignItems: 'center',
  },
  actionBtnCoral: {
    backgroundColor: Colors.coral,
  },
  actionLabel: {
    fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: Colors.ink1,
  },
  actionLabelCoral: {
    color: Colors.inkInv,
  },
  cancelBtn: {
    paddingVertical: 15, borderRadius: Radius.card,
    alignItems: 'center', marginTop: 2,
  },
  cancelLabel: {
    fontSize: 15, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink3,
  },
});
