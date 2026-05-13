import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Phase, Radius } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import { ChatMessageList } from '../components/ai/ChatMessageList';
import { ChatInput } from '../components/ai/ChatInput';
import { ConversationHistoryModal } from '../components/ai/ConversationHistoryModal';
import { AIMenuSheet } from '../components/ai/AIMenuSheet';
import { useAiChat } from '../hooks/useAiChat';
import { usePrediction } from '../hooks/usePrediction';
import { phaseForDay, CYCLE_DEFAULTS } from '../utils/phase';

export function AIScreen() {
  const { messages, isStreaming, sendMessage, resetConversation, loadConversation } = useAiChat();
  const { data: prediction } = usePrediction();
  const [showHistory, setShowHistory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const cycleDay = prediction?.cycle_day ?? 1;
  const cycleLength = prediction?.avg_cycle_length ?? CYCLE_DEFAULTS.length;
  const phaseKey = phaseForDay(cycleDay, cycleLength);
  const phase = Phase[phaseKey];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Lavender glow blob */}
      <View style={styles.glowBlob} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatar}>
            <Icon name="spark" size={16} strokeWidth={2.4} color={Colors.ink1} />
          </View>
          <View>
            <Text style={styles.aiTitle}>LUNA AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.dotsBtn} onPress={() => setShowMenu(true)} accessibilityRole="button" accessibilityLabel="더보기">
          <Icon name="dots" size={18} strokeWidth={2.4} color={Colors.inkInv} />
        </TouchableOpacity>
      </View>

      {/* Context chip */}
      <View style={styles.chipRow}>
        <View style={styles.contextChip}>
          <View style={[styles.phaseDot, { backgroundColor: phase.color, shadowColor: phase.color }]} />
          <Text style={styles.chipText}>현재 주기 {cycleDay}일차 · {phase.ko}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ChatMessageList messages={messages} isStreaming={isStreaming} />
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </KeyboardAvoidingView>

      <ConversationHistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        onSelect={loadConversation}
      />
      <AIMenuSheet
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onNewConversation={resetConversation}
        onViewHistory={() => setShowHistory(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgInk },
  glowBlob: {
    position: 'absolute', top: -40, left: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.lavender,
    opacity: 0.12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
    zIndex: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.lavender,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.lavender,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  aiTitle: { fontSize: 14, fontFamily: 'NotoSansKR_900Black', color: Colors.inkInv, letterSpacing: -0.3, lineHeight: 17 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  onlineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.lime },
  onlineText: { fontSize: 10, color: 'rgba(242,238,232,0.5)', fontFamily: 'NotoSansKR_500Medium', letterSpacing: 0.4 },
  dotsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  chipRow: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6, zIndex: 2 },
  contextChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.pill,
  },
  phaseDot: {
    width: 6, height: 6, borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 2,
  },
  chipText: { fontSize: 11, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.inkInv },
  body: { flex: 1, zIndex: 2 },
});
