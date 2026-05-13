import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import type { ChatMessage } from '../types/chat';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const isStreamingRef = useRef(false);
  const conversationIdRef = useRef<number | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => () => { xhrRef.current?.abort(); }, []);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreamingRef.current) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed, ts: new Date() };
    const assistantId = `a-${Date.now() + 1}`;
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', ts: new Date(), isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    isStreamingRef.current = true;
    setIsStreaming(true);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    const token = useAuthStore.getState().token;

    let sseOffset = 0;
    let sseBuffer = '';
    let ended = false;

    const finishWith = (isError: boolean) => {
      if (ended) return;
      ended = true;
      setMessages(prev => prev.map(m =>
        m.id !== assistantId ? m : isError
          ? { ...m, content: '오류가 발생했어요. 다시 시도해 주세요.', isStreaming: false, isError: true }
          : { ...m, isStreaming: false }
      ));
      isStreamingRef.current = false;
      setIsStreaming(false);
    };

    xhr.open('POST', `${BASE_URL}/api/v1/ai/chat`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.onreadystatechange = () => {
      if (xhr.readyState < XMLHttpRequest.LOADING) return;

      const newText = xhr.responseText.substring(sseOffset);
      sseOffset = xhr.responseText.length;
      if (!newText) return;

      sseBuffer += newText;
      const lines = sseBuffer.split('\n');
      sseBuffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (!payload) continue;

        try {
          const event = JSON.parse(payload) as { type: string; conversation_id?: number; text?: string };
          if (event.type === 'start' && event.conversation_id) {
            conversationIdRef.current = event.conversation_id;
          } else if (event.type === 'delta' && event.text) {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + event.text } : m
            ));
          } else if (event.type === 'end') {
            finishWith(false);
          } else if (event.type === 'error') {
            finishWith(true);
          }
        } catch {}
      }
    };

    xhr.onloadend = () => finishWith(xhr.status !== 200 && xhr.status !== 0);
    xhr.onerror = () => finishWith(true);
    xhr.onabort = () => {
      ended = true;
      isStreamingRef.current = false;
      setIsStreaming(false);
    };

    xhr.send(JSON.stringify({
      message: trimmed,
      ...(conversationIdRef.current !== null ? { conversation_id: conversationIdRef.current } : {}),
    }));
  }, []);

  return { messages, isStreaming, sendMessage };
}
