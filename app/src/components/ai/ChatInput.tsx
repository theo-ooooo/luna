import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';
import { Icon } from '../ui/Icon';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="메시지를 입력하세요..."
        placeholderTextColor={Colors.ink4}
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
        <Icon name="send" size={18} color={Colors.inkInv} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.borderSoft,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120,
    backgroundColor: Colors.bgCard, borderRadius: Radius.tile,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: Colors.ink1, lineHeight: 20,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.coral,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.ink4 },
});
