import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export interface NotificationLogItem {
  id: number;
  identifier: string;
  title: string;
  body: string;
  scheduled_for: string; // ISO 8601
}

interface BulkEntry {
  id: string;
  title: string;
  body: string;
  scheduled_for: string; // ISO 8601
}

export function useNotificationLog() {
  return useQuery<NotificationLogItem[]>({
    queryKey: ['notification_logs'],
    queryFn: () => api.get<NotificationLogItem[]>('/api/v1/notifications'),
    staleTime: 60 * 1000,
  });
}

export function useSyncNotificationLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entries: BulkEntry[]) =>
      api.put('/api/v1/notifications', { entries }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification_logs'] }),
  });
}
