import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { ChatMessageList } from '../components/ai/ChatMessageList';
import { ChatInput } from '../components/ai/ChatInput';
import { useAiChat } from '../hooks/useAiChat';

export function AIScreen() {
  const { messages, isStreaming, sendMessage } = useAiChat();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>04 · AI</Text>
        <View style={styles.topBarBadge}>
          <Icon name="spark" size={12} color={Colors.coral} />
          <Text style={styles.badgeText}>Luna AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ChatMessageList messages={messages} />
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  topBarBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: Colors.bgCard, borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.ink2 },
  body: { flex: 1 },
});
