import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import { api } from '../../api/client';

interface ConversationItem {
  id: number;
  preview: string;
  message_count: number;
  updated_at: string;
}

interface ServerMessage {
  role: string;
  content: string;
  ts: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: number, messages: ServerMessage[]) => void;
}

export function ConversationHistoryModal({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    api.get<{ data: ConversationItem[] }>('/api/v1/ai/conversations')
      .then(res => setList((res as any).data ?? res as any))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [visible]);

  async function handleSelect(id: number) {
    setLoadingId(id);
    try {
      const res = await api.get<any>(`/api/v1/ai/conversations/${id}`);
      const data = res.data ?? res;
      onSelect(data.id, data.messages ?? []);
      onClose();
    } finally {
      setLoadingId(null);
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>이전 대화</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={18} strokeWidth={2.2} color={Colors.inkInv} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.lavender} />
          </View>
        ) : list.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>이전 대화가 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item.id)}
                disabled={loadingId === item.id}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemPreview} numberOfLines={2}>{item.preview || '(내용 없음)'}</Text>
                  <Text style={styles.itemMeta}>{formatDate(item.updated_at)} · {item.message_count}개 메시지</Text>
                </View>
                {loadingId === item.id
                  ? <ActivityIndicator size="small" color={Colors.lavender} />
                  : <Icon name="chev" size={16} strokeWidth={2} color="rgba(242,238,232,0.3)" />
                }
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgInk },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.inkInv, letterSpacing: -0.4 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: 'rgba(242,238,232,0.4)' },
  listContent: { paddingVertical: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 12,
  },
  itemLeft: { flex: 1, gap: 4 },
  itemPreview: { fontSize: 14, color: Colors.inkInv, fontWeight: '500', lineHeight: 20 },
  itemMeta: { fontSize: 12, color: 'rgba(242,238,232,0.4)' },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 20 },
});
