import React, { useEffect, useRef } from 'react';
import {
  Animated, FlatList, Modal, StyleSheet, Text, TouchableOpacity,
  TouchableWithoutFeedback, View, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import { useCycleList } from '../../hooks/useCycles';

const FLOW_LABELS: Record<number, string> = { 1: '가벼움', 2: '보통', 3: '많음' };
const SHEET_HEIGHT = 480;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CycleHistoryModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { data: cycles = [], isLoading } = useCycleList(20);
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

  function fmtDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    const prefix = d.getFullYear() !== new Date().getFullYear() ? `${d.getFullYear()}/` : '';
    return `${prefix}${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>주기 이력</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.ink2} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.coral} />
          </View>
        ) : cycles.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>기록된 주기가 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={cycles}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const isActive = index === 0 && !item.ended_on;
              return (
                <View style={styles.item}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemRange}>
                      {fmtDate(item.started_on)} — {item.ended_on ? fmtDate(item.ended_on) : '진행 중'}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      {item.length_days != null && (
                        <Text style={styles.itemMeta}>{item.length_days}일 주기</Text>
                      )}
                      {item.flow_level != null && (
                        <Text style={styles.itemMeta}> · {FLOW_LABELS[item.flow_level] ?? ''}</Text>
                      )}
                    </View>
                  </View>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>진행 중</Text>
                    </View>
                  )}
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,17,15,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: Colors.ink1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderSoft,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSoft,
  },
  title: { fontSize: 17, fontWeight: '800', color: Colors.ink1, letterSpacing: -0.4 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: Colors.ink3 },
  listContent: { paddingVertical: 4 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, gap: 12 },
  itemLeft: { flex: 1, gap: 3 },
  itemRange: { fontSize: 15, fontWeight: '600', color: Colors.ink1 },
  itemMetaRow: { flexDirection: 'row' },
  itemMeta: { fontSize: 12, color: Colors.ink3 },
  activeBadge: {
    backgroundColor: 'rgba(255,90,71,0.10)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: 'rgba(255,90,71,0.22)',
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.coral },
  separator: { height: 1, backgroundColor: Colors.borderSoft, marginHorizontal: 20 },
});
