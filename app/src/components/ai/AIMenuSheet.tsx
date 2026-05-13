import React, { useEffect, useRef } from 'react';
import {
  Animated, Modal, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

const SHEET_HEIGHT = 240;

interface Props {
  visible: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  onViewHistory: () => void;
}

export function AIMenuSheet({ visible, onClose, onNewConversation, onViewHistory }: Props) {
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

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>메뉴</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.inkInv} />
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => { onNewConversation(); onClose(); }}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, styles.actionIconDestructive]}>
              <Icon name="plus" size={18} strokeWidth={2.4} color={Colors.coral} />
            </View>
            <Text style={[styles.actionLabel, styles.actionLabelDestructive]}>새 대화 시작</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => { onViewHistory(); onClose(); }}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Icon name="dots" size={18} strokeWidth={2.4} color={Colors.inkInv} />
            </View>
            <Text style={styles.actionLabel}>이전 대화 보기</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,17,15,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.bgInk,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { fontSize: 17, fontFamily: 'NotoSansKR_800ExtraBold', color: Colors.inkInv, letterSpacing: -0.4 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  actions: { paddingHorizontal: 16, paddingTop: 8 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  actionIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  actionIconDestructive: { backgroundColor: 'rgba(255,90,71,0.12)' },
  actionLabel: { fontSize: 15, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.inkInv },
  actionLabelDestructive: { color: Colors.coral },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 50 },
});
