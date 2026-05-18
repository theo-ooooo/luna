import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { api } from '../api/client';
import { useNotificationStore, type NotificationPrefs } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

interface ServerPrefs {
  period_reminder: boolean;
  ovulation_alert: boolean;
  fertile_start: boolean;
  log_nudge: boolean;
  daily_reminder: boolean;
  monthly_report: boolean;
}

function toLocal(s: Partial<ServerPrefs>): Partial<NotificationPrefs> {
  const l: Partial<NotificationPrefs> = {};
  if (s.period_reminder  != null) l.periodReminder = s.period_reminder;
  if (s.ovulation_alert  != null) l.ovulationAlert = s.ovulation_alert;
  if (s.fertile_start    != null) l.fertileStart    = s.fertile_start;
  if (s.log_nudge        != null) l.logNudge        = s.log_nudge;
  if (s.daily_reminder   != null) l.dailyReminder   = s.daily_reminder;
  if (s.monthly_report   != null) l.monthlyReport   = s.monthly_report;
  return l;
}

function toServer(l: Partial<NotificationPrefs>): Partial<ServerPrefs> {
  const s: Partial<ServerPrefs> = {};
  if (l.periodReminder  !== undefined) s.period_reminder  = l.periodReminder;
  if (l.ovulationAlert  !== undefined) s.ovulation_alert  = l.ovulationAlert;
  if (l.fertileStart    !== undefined) s.fertile_start    = l.fertileStart;
  if (l.logNudge        !== undefined) s.log_nudge        = l.logNudge;
  if (l.dailyReminder   !== undefined) s.daily_reminder   = l.dailyReminder;
  if (l.monthlyReport   !== undefined) s.monthly_report   = l.monthlyReport;
  return s;
}

/** 앱 시작 시 서버 prefs를 로컬 store에 동기화 */
export function useSyncNotificationPrefs() {
  const token = useAuthStore(s => s.token);
  const setPrefs = useNotificationStore(s => s.setPrefs);

  const { data } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: () => api.get<ServerPrefs>('/api/v1/notification_prefs'),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) setPrefs(toLocal(data));
  }, [data, setPrefs]);
}

/** 개별 pref 토글 → 로컬 즉시 반영 + 서버 PATCH */
export function useUpdateNotificationPref() {
  const setPrefs = useNotificationStore(s => s.setPrefs);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<NotificationPrefs>) =>
      api.patch<ServerPrefs>('/api/v1/notification_prefs', toServer(patch)),
    onMutate: async (patch) => {
      const previous = useNotificationStore.getState().prefs;
      setPrefs(patch);
      await qc.cancelQueries({ queryKey: ['notification-prefs'] });
      return { previous };
    },
    onSuccess: (data) => {
      setPrefs(toLocal(data));
      qc.setQueryData(['notification-prefs'], data);
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.previous) setPrefs(ctx.previous);
      qc.invalidateQueries({ queryKey: ['notification-prefs'] });
      Toast.show({ type: 'error', text1: '알림 설정 저장 실패', text2: '잠시 후 다시 시도해주세요.' });
    },
  });
}
