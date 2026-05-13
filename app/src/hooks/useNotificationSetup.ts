import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { requestNotificationPermission, scheduleNotifications } from '../services/notifications';
import { usePrediction } from './usePrediction';
import { useLatestCycle } from './useCycles';

// Mount in the authenticated root. On every app launch:
//   1. Re-checks OS permission (handles the case where the user revoked it in Settings)
//   2. Reschedules notifications once both prediction and cycle data have loaded
export function useNotificationSetup() {
  const { data: prediction, isSuccess: predOk } = usePrediction();
  const { data: latestCycle, isSuccess: cycleOk } = useLatestCycle();
  const { permissionGranted, prefs, setPermissionGranted, setNotificationLog } = useNotificationStore();

  // Always re-verify permission on mount — persisted value can be stale after OS-level revocation
  useEffect(() => {
    requestNotificationPermission()
      .then(setPermissionGranted)
      .catch(() => setPermissionGranted(false));
  }, [setPermissionGranted]);

  // Wait until both queries succeed so we don't cancel existing notifications prematurely
  useEffect(() => {
    if (!permissionGranted || !predOk || !cycleOk) return;

    scheduleNotifications({
      periodStart: prediction?.predicted_period_start ?? null,
      ovulationOn: prediction?.predicted_ovulation_on ?? null,
      fertileStart: prediction?.fertile_start ?? null,
      cycleEndedOn: latestCycle?.ended_on ?? null,
      prefs,
    }).then(setNotificationLog).catch(() => {});
  }, [permissionGranted, predOk, cycleOk, prediction, latestCycle, prefs]);
}
