import React, { useEffect, useRef } from 'react';
import {
  Animated, Modal, StyleSheet, Switch, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import { useNotificationStore } from '../../store/notificationStore';

const SHEET_HEIGHT = 400;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PREF_ROWS: { key: keyof import('../../store/notificationStore').NotificationPrefs; label: string; desc: string }[] = [
  { key: 'periodReminder',  label: '생리 예정일 알림',  desc: 'D-3, D-1일 전 알림' },
  { key: 'ovulationAlert',  label: '배란 예정일 알림',  desc: 'D-2, 당일 알림' },
  { key: 'fertileStart',    label: '가임기 시작 알림',  desc: '임신 가능 기간 시작' },
  { key: 'dailyReminder',   label: '일일 기록 리마인더', desc: '매일 오후 10시' },
];

export function NotificationSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs, permissionGranted } = useNotificationStore();
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

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>알림 설정</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.ink2} />
          </TouchableOpacity>
        </View>

        {!permissionGranted && (
          <View style={styles.permBanner}>
            <Text style={styles.permText}>기기 설정에서 Luna 알림 권한을 허용해주세요.</Text>
          </View>
        )}

        <View style={styles.list}>
          {PREF_ROWS.map((row, i) => (
            <View key={row.key} style={[styles.row, i < PREF_ROWS.length - 1 && styles.rowBorder]}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDesc}>{row.desc}</Text>
              </View>
              <Switch
                value={prefs[row.key]}
                onValueChange={v => setPrefs({ [row.key]: v })}
                trackColor={{ false: Colors.borderSoft, true: Colors.coral }}
                thumbColor={Colors.bgCard}
                disabled={!permissionGranted}
              />
            </View>
          ))}
        </View>
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
  permBanner: { margin: 16, padding: 12, backgroundColor: 'rgba(255,90,71,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,90,71,0.2)' },
  permText: { fontSize: 12, color: Colors.coral, textAlign: 'center', fontFamily: 'NotoSansKR_600SemiBold' },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  rowLeft: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 14, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.ink1 },
  rowDesc: { fontSize: 12, color: Colors.ink3 },
});
