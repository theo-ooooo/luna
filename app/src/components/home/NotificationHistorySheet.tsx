import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated, FlatList, Modal, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import { usePrediction } from '../../hooks/usePrediction';
import { useNotificationStore } from '../../store/notificationStore';

const SHEET_HEIGHT = 480;

interface NotifItem {
  id: string;
  label: string;
  date: Date;
  daysFromNow: number;
  color: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date) {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function daysLabel(n: number) {
  if (n === 0) return '오늘';
  if (n === 1) return '내일';
  if (n < 0) return `${Math.abs(n)}일 전`;
  return `${n}일 후`;
}

export function NotificationHistorySheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { data: prediction } = usePrediction();
  const { prefs } = useNotificationStore();

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

  const items = useMemo<NotifItem[]>(() => {
    if (!prediction) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: NotifItem[] = [];

    const push = (date: Date, label: string, color: string, id: string) => {
      const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
      if (diff >= -1 && diff <= 60) {
        result.push({ id, label, date, daysFromNow: diff, color });
      }
    };

    const period = new Date(prediction.predicted_period_start + 'T00:00:00');
    push(addDays(period, -3), '생리 예정 D-3', Colors.coral, 'period-3');
    push(addDays(period, -1), '생리 예정 D-1', Colors.coral, 'period-1');
    push(period, '생리 예정일', Colors.coral, 'period-0');

    if (prediction.predicted_ovulation_on) {
      const ov = new Date(prediction.predicted_ovulation_on + 'T00:00:00');
      push(addDays(ov, -2), '배란 예정 D-2', Colors.lavender, 'ov-2');
      push(ov, '배란 예정일', Colors.lavender, 'ov-0');
    }

    if (prediction.fertile_start) {
      push(new Date(prediction.fertile_start + 'T00:00:00'), '가임기 시작', Colors.lime, 'fertile');
    }

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [prediction, visible]);

  const noAlerts = !prefs.periodReminder && !prefs.ovulationAlert && !prefs.fertileStart;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>알림 예정</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.ink2} />
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" size={28} strokeWidth={1.6} color={Colors.ink4} />
            <Text style={styles.emptyText}>예측 데이터가 없어요</Text>
            <Text style={styles.emptyDesc}>주기를 기록하면 알림 예정 목록이 표시돼요.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDate}>{fmtDate(item.date)}</Text>
                </View>
                <View style={[styles.badge, item.daysFromNow < 0 && styles.badgePast, item.daysFromNow === 0 && styles.badgeToday]}>
                  <Text style={[styles.badgeText, item.daysFromNow === 0 && styles.badgeTextToday]}>
                    {daysLabel(item.daysFromNow)}
                  </Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
          />
        )}

        {noAlerts && (
          <View style={styles.hint}>
            <Icon name="bell" size={13} strokeWidth={2} color={Colors.ink3} />
            <Text style={styles.hintText}>설정 {'>'} 알림에서 알림을 켜세요.</Text>
          </View>
        )}
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
  title: { fontSize: 17, fontWeight: '800', color: Colors.ink1, letterSpacing: -0.4 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 4 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  itemBody: { flex: 1, gap: 2 },
  itemLabel: { fontSize: 14, fontWeight: '600', color: Colors.ink1 },
  itemDate: { fontSize: 12, color: Colors.ink3 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.bgAlt, borderRadius: 20 },
  badgePast: { opacity: 0.5 },
  badgeToday: { backgroundColor: Colors.coral },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.ink2 },
  badgeTextToday: { color: Colors.inkInv },
  sep: { height: 1, backgroundColor: Colors.borderSoft, marginHorizontal: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 40 },
  emptyText: { fontSize: 15, fontWeight: '700', color: Colors.ink2 },
  emptyDesc: { fontSize: 13, color: Colors.ink3, textAlign: 'center' },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  hintText: { fontSize: 12, color: Colors.ink3 },
});
