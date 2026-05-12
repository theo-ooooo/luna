import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { requestNotificationPermission, scheduleNotifications } from '../services/notifications';
import { usePrediction } from './usePrediction';
import { useLatestCycle } from './useCycles';

// Request permission once and schedule notifications based on current prediction.
// Mount this in the authenticated root so it runs on every app launch.
export function useNotificationSetup() {
  const { data: prediction } = usePrediction();
  const { data: latestCycle } = useLatestCycle();
  const { permissionGranted, prefs, setPermissionGranted } = useNotificationStore();

  // Request permission on first authenticated load
  useEffect(() => {
    if (permissionGranted) return;
    requestNotificationPermission().then(setPermissionGranted);
  }, [permissionGranted, setPermissionGranted]);

  // Reschedule whenever prediction or prefs change
  useEffect(() => {
    if (!permissionGranted) return;

    scheduleNotifications({
      periodStart: prediction?.predicted_period_start ?? null,
      ovulationOn: prediction?.predicted_ovulation_on ?? null,
      fertileStart: prediction?.fertile_start ?? null,
      cycleEndedOn: latestCycle?.ended_on ?? null,
      prefs,
    });
  }, [permissionGranted, prediction, latestCycle, prefs]);
}
