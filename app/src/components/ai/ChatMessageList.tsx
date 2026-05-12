import React, { useEffect, useRef } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/tokens';
import { ChatBubble, ThinkingBubble } from './ChatBubble';
import type { ChatMessage } from '../../types/chat';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
}

export function ChatMessageList({ messages, isStreaming = false }: ChatMessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>안녕하세요 👋</Text>
        <Text style={styles.emptyBody}>생리주기, 증상, 기분에 대해{'\n'}편하게 물어보세요.</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={m => m.id}
      renderItem={({ item }) => <ChatBubble message={item} />}
      ListFooterComponent={isStreaming ? <ThinkingBubble /> : null}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexGrow: 1, justifyContent: 'flex-end' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, color: Colors.inkInv, marginBottom: 10 },
  emptyBody: { fontSize: 14, color: 'rgba(242,238,232,0.5)', textAlign: 'center', lineHeight: 22 },
});
