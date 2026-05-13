import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../theme/tokens';
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
          <Icon name="spark" size={16} strokeWidth={2.2} color={Colors.ink1} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : message.isError ? styles.bubbleError : styles.bubbleAI]}>
        <Text style={[styles.text, isUser ? styles.textUser : message.isError ? styles.textError : styles.textAI]}>
          {message.content}
          {message.isStreaming && <Text style={styles.cursor}>▌</Text>}
        </Text>
      </View>
    </View>
  );
}

export function ThinkingBubble() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -4, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 150 + 300),
        ]),
      ),
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Icon name="spark" size={16} strokeWidth={2.2} color={Colors.ink1} />
      </View>
      <View style={[styles.bubble, styles.bubbleAI]}>
        <View style={styles.dotRow}>
          {dots.map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ translateY: dot }] }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  rowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.lavender,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '76%',
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 20,
  },
  bubbleAI: {
    backgroundColor: Colors.bgInkAlt,
    borderTopLeftRadius: 6,
  },
  bubbleError: {
    backgroundColor: 'rgba(255,90,71,0.12)',
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,90,71,0.25)',
  },
  bubbleUser: {
    backgroundColor: Colors.lavender,
    borderTopRightRadius: 6,
  },
  text: { fontSize: 13, lineHeight: 20 },
  textAI: { color: Colors.inkInv, fontWeight: '400' },
  textUser: { color: Colors.ink1, fontWeight: '600' },
  textError: { color: Colors.coralSoft, fontWeight: '400' },
  cursor: { color: Colors.lavender },
  dotRow: { flexDirection: 'row', gap: 4, paddingVertical: 2, paddingHorizontal: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.lavender },
});
