import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { requestNotificationPermission, scheduleNotifications } from '../services/notifications';
import { usePrediction } from './usePrediction';
import { useLatestCycle } from './useCycles';
import { useSyncNotificationLog } from './useNotificationLog';

export function useNotificationSetup() {
  const { data: prediction, isSuccess: predOk } = usePrediction();
  const { data: latestCycle, isSuccess: cycleOk } = useLatestCycle();
  const { permissionGranted, serverPushRegistered, prefs, setPermissionGranted } = useNotificationStore();
  const syncLog = useSyncNotificationLog();

  useEffect(() => {
    requestNotificationPermission()
      .then(setPermissionGranted)
      .catch(() => setPermissionGranted(false));
  }, [setPermissionGranted]);

  useEffect(() => {
    // 서버 푸시가 등록된 경우 로컬 알림 중복 예약 방지
    if (!permissionGranted || !predOk || !cycleOk || serverPushRegistered) return;

    scheduleNotifications({
      periodStart: prediction?.predicted_period_start ?? null,
      ovulationOn: prediction?.predicted_ovulation_on ?? null,
      fertileStart: prediction?.fertile_start ?? null,
      cycleEndedOn: latestCycle?.ended_on ?? null,
      prefs,
    }).then(entries => {
      if (entries.length === 0) return;
      syncLog.mutate(
        entries.map(e => ({
          id: e.id,
          title: e.title,
          body: e.body,
          scheduled_for: new Date(e.scheduledFor).toISOString(),
        })),
      );
    }).catch(() => {});
  }, [permissionGranted, serverPushRegistered, predOk, cycleOk, prediction, latestCycle, prefs]);
}
