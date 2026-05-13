import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated, Modal, SectionList, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import { useNotificationStore } from '../../store/notificationStore';
import type { NotificationLogEntry } from '../../store/notificationStore';

const SHEET_HEIGHT = 500;

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Section {
  title: string;
  data: NotificationLogEntry[];
  past: boolean;
}

function timeLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86_400_000);
  const dateStr = `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diff === 0) return `오늘 · ${dateStr.slice(dateStr.indexOf(' ') + 1)}`;
  if (diff === -1) return `어제 · ${dateStr.slice(dateStr.indexOf(' ') + 1)}`;
  if (diff === 1) return `내일 · ${dateStr.slice(dateStr.indexOf(' ') + 1)}`;
  return dateStr;
}

export function NotificationHistorySheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { notificationLog } = useNotificationStore();

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

  const sections = useMemo<Section[]>(() => {
    const now = Date.now();
    const received = notificationLog
      .filter(e => e.scheduledFor <= now)
      .sort((a, b) => b.scheduledFor - a.scheduledFor);
    const upcoming = notificationLog
      .filter(e => e.scheduledFor > now)
      .sort((a, b) => a.scheduledFor - b.scheduledFor);
    const result: Section[] = [];
    if (received.length > 0) result.push({ title: '받은 알림', data: received, past: true });
    if (upcoming.length > 0) result.push({ title: '예정된 알림', data: upcoming, past: false });
    return result;
  }, [notificationLog]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>알림 내역</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.ink2} />
          </TouchableOpacity>
        </View>

        {notificationLog.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" size={32} strokeWidth={1.4} color={Colors.ink4} />
            <Text style={styles.emptyTitle}>알림 내역이 없어요</Text>
            <Text style={styles.emptyDesc}>앱이 알림을 예약하면{'\n'}여기에 기록이 남아요.</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item, section }) => (
              <View style={[styles.item, (section as Section).past && styles.itemPast]}>
                <View style={styles.iconWrap}>
                  <Icon
                    name="bell"
                    size={15}
                    strokeWidth={2}
                    color={(section as Section).past ? Colors.ink3 : Colors.coral}
                  />
                </View>
                <View style={styles.itemBody}>
                  <Text style={[styles.itemTitle, (section as Section).past && styles.itemTitlePast]}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemBody2}>{item.body}</Text>
                  <Text style={styles.itemTime}>{timeLabel(item.scheduledFor)}</Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
          />
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
  list: { paddingBottom: 8 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6, backgroundColor: Colors.bgCard },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.ink3 },
  item: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  itemPast: { opacity: 0.6 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink1 },
  itemTitlePast: { color: Colors.ink2 },
  itemBody2: { fontSize: 13, color: Colors.ink2, lineHeight: 18 },
  itemTime: { fontSize: 11, color: Colors.ink3, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.borderSoft, marginHorizontal: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink2 },
  emptyDesc: { fontSize: 13, color: Colors.ink3, textAlign: 'center', lineHeight: 20 },
});
