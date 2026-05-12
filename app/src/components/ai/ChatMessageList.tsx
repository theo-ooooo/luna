import React, { useEffect, useRef } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/tokens';
import { ChatBubble } from './ChatBubble';
import type { ChatMessage } from '../../types/chat';

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Luna AI</Text>
        <Text style={styles.emptyBody}>생리주기, 증상, 기분에 대해 물어보세요.{'\n'}과학적인 답변을 드릴게요.</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={m => m.id}
      renderItem={({ item }) => <ChatBubble message={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1, justifyContent: 'flex-end' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, color: Colors.ink1, marginBottom: 10 },
  emptyBody: { fontSize: 14, color: Colors.ink3, textAlign: 'center', lineHeight: 22 },
});
