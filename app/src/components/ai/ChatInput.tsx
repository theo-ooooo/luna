import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

const SUGGESTED = ['왜 지금 두통이?', '이번 달 패턴은?', '임신 가능일은?'];

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  function handleSend() {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 12 }]}>
      {/* Gradient fade */}
      <View style={styles.gradientFade} pointerEvents="none" />

      {/* Suggested chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        style={styles.chips}
      >
        {SUGGESTED.map(s => (
          <TouchableOpacity
            key={s}
            style={styles.chip}
            onPress={() => onSend(s)}
            disabled={disabled}
            accessibilityRole="button"
          >
            <Text style={styles.chipText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input pill */}
      <View style={styles.inputPill}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="편하게 물어보세요…"
          placeholderTextColor="rgba(242,238,232,0.4)"
          multiline
          maxLength={500}
          editable={!disabled}
          onSubmitEditing={handleSend}
          accessibilityLabel="메시지 입력"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || disabled) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          accessibilityRole="button"
          accessibilityLabel="전송"
        >
          <Icon name="send" size={16} strokeWidth={2.2} color={Colors.ink1} />
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>의학적 조언이 아닙니다 · 일반 정보 참고용</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    backgroundColor: Colors.bgInk,
  },
  gradientFade: {
    position: 'absolute',
    top: -40, left: 0, right: 0, height: 40,
    // RN doesn't support linear-gradient natively without expo-linear-gradient;
    // this is a solid fade approximation
    backgroundColor: Colors.bgInk,
    opacity: 0.7,
  },
  chips: { marginBottom: 0 },
  chipsContent: { gap: 8, paddingVertical: 12, paddingHorizontal: 4 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(201,184,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,184,255,0.3)',
    borderRadius: Radius.pill,
  },
  chipText: { fontSize: 12, fontFamily: 'NotoSansKR_600SemiBold', color: Colors.lavender, letterSpacing: -0.1 },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.pill,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 13,
    color: Colors.inkInv,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.lavender,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  disclaimer: {
    fontSize: 9,
    color: 'rgba(242,238,232,0.4)',
    textAlign: 'center',
    paddingTop: 12,
    letterSpacing: 0.4,
  },
});
