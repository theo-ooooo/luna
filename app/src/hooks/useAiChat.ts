import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../api/client';
import type { ChatMessage } from '../types/chat';

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const conversationIdRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

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
      const res = await api.streamPost(
        '/api/v1/ai/chat',
        {
          message: trimmed,
          ...(conversationIdRef.current !== null ? { conversation_id: conversationIdRef.current } : {}),
        },
        controller.signal,
      );

      if (!res.body) throw new Error('No response body');

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
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
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
