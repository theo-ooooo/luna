import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import { useCycleList } from '../../hooks/useCycles';

const FLOW_LABELS: Record<number, string> = { 1: '가벼움', 2: '보통', 3: '많음' };

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CycleHistoryModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { data: cycles = [], isLoading } = useCycleList(20);

  function fmtDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>주기 이력</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={18} strokeWidth={2.2} color={Colors.ink1} />
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSoft,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.ink1, letterSpacing: -0.4 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: Colors.ink3 },
  listContent: { paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  itemLeft: { flex: 1, gap: 4 },
  itemRange: { fontSize: 15, fontWeight: '600', color: Colors.ink1 },
  itemMetaRow: { flexDirection: 'row' },
  itemMeta: { fontSize: 12, color: Colors.ink3 },
  activeBadge: {
    backgroundColor: 'rgba(255,90,71,0.12)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: 'rgba(255,90,71,0.25)',
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.coral },
  separator: { height: 1, backgroundColor: Colors.borderSoft, marginHorizontal: 20 },
});
