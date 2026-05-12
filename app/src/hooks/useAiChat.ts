import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import type { ChatMessage } from '../types/chat';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const conversationIdRef = useRef<number | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      ts: new Date(),
    };
    const assistantId = `a-${Date.now() + 1}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      ts: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${BASE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: trimmed,
          ...(conversationIdRef.current !== null ? { conversation_id: conversationIdRef.current } : {}),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;

          const event = JSON.parse(payload) as { type: string; conversation_id?: number; text?: string };

          if (event.type === 'start' && event.conversation_id) {
            conversationIdRef.current = event.conversation_id;
          } else if (event.type === 'delta' && event.text) {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + event.text } : m
            ));
          } else if (event.type === 'end') {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            ));
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: '오류가 발생했어요. 다시 시도해 주세요.', isStreaming: false }
          : m
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  return { messages, isStreaming, sendMessage };
}
