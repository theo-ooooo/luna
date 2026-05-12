import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';
import type { ChatMessage } from '../../types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Icon name="spark" size={14} color={Colors.coral} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {message.content}
          {message.isStreaming && <Text style={styles.cursor}>▌</Text>}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  rowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: { maxWidth: '75%', borderRadius: Radius.tile, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleUser: { backgroundColor: Colors.bgInk },
  bubbleAssistant: { backgroundColor: Colors.bgCard },
  text: { fontSize: 14, lineHeight: 22 },
  textUser: { color: Colors.inkInv },
  textAssistant: { color: Colors.ink1 },
  cursor: { color: Colors.coral },
});
