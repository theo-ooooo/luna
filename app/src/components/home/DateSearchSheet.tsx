import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated, FlatList, Modal, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

const SHEET_HEIGHT = 480;
const DAY_KO = '일월화수목금토';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
}

function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DateSearchSheet({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const dates = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return dateStr(d);
  }), [visible]);

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

  function fmtLabel(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86_400_000));
    if (iso === today) return '오늘';
    if (iso === yesterday) return '어제';
    return `${d.getMonth() + 1}월 ${d.getDate()}일 · ${DAY_KO[d.getDay()]}`;
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>날짜로 이동</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.ink2} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dates}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => { onSelect(item); onClose(); }}
              activeOpacity={0.65}
            >
              <Text style={[styles.itemLabel, index === 0 && styles.itemLabelToday]}>{fmtLabel(item)}</Text>
              <Icon name="chev" size={14} strokeWidth={2} color={Colors.ink4} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,17,15,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
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
  listContent: { paddingVertical: 4 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  itemLabel: { fontSize: 15, fontFamily: 'NotoSansKR_500Medium', color: Colors.ink1 },
  itemLabelToday: { fontFamily: 'NotoSansKR_700Bold', color: Colors.coral },
  separator: { height: 1, backgroundColor: Colors.borderSoft, marginHorizontal: 20 },
});
