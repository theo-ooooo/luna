export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
  isStreaming?: boolean;
}
