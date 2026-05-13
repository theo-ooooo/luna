import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, FlatList, Modal, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Motion, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import { api } from '../../api/client';

const SHEET_HEIGHT = 520;

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
  const [error, setError] = useState<string | null>(null);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: Motion.fast, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 260 }),
      ]).start();
      setLoading(true);
      setError(null);
      api.get<ConversationItem[]>('/api/v1/ai/conversations')
        .then(res => setList(res))
        .catch(() => setError('대화 목록을 불러오지 못했어요.'))
        .finally(() => setLoading(false));
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: Motion.fast, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: Motion.fast, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  async function handleSelect(id: number) {
    setLoadingId(id);
    try {
      const res = await api.get<{ id: number; messages: ServerMessage[] }>(`/api/v1/ai/conversations/${id}`);
      onSelect(res.id, res.messages ?? []);
      onClose();
    } catch {
      setError('대화를 불러오지 못했어요. 다시 시도해 주세요.');
    } finally {
      setLoadingId(null);
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>이전 대화</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
            <Icon name="close" size={16} strokeWidth={2.4} color={Colors.inkInv} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.lavender} />
          </View>
        ) : list.length === 0 && !error ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>이전 대화가 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: 'rgba(242,238,232,0.4)' },
  errorBanner: { margin: 16, padding: 14, backgroundColor: 'rgba(255,90,71,0.12)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,90,71,0.25)' },
  errorText: { fontSize: 13, color: Colors.coralSoft, textAlign: 'center' },
  listContent: { paddingVertical: 4 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  itemLeft: { flex: 1, gap: 4 },
  itemPreview: { fontSize: 14, color: Colors.inkInv, fontFamily: 'NotoSansKR_500Medium', lineHeight: 20 },
  itemMeta: { fontSize: 12, color: 'rgba(242,238,232,0.4)' },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 20 },
});
