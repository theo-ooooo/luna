import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import type { FlowId, LHResult } from '../types/record';

export interface ParsedLog {
  moods: string[];
  symptoms: string[];
  flow: FlowId | null;
  bbt: string | null;
  lh_result: LHResult | null;
  notes: string | null;
}

export function useParseLog() {
  return useMutation({
    mutationFn: (text: string) =>
      api.post<ParsedLog>('/api/v1/ai/parse_log', { text }),
  });
}
