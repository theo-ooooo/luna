import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPrefs {
  periodReminder: boolean;
  ovulationAlert: boolean;
  fertileStart: boolean;
  logNudge: boolean;
  dailyReminder: boolean;
  monthlyReport: boolean;
}

interface NotificationState {
  permissionGranted: boolean;
  permissionChecked: boolean;
  prefs: NotificationPrefs;
  setPermissionGranted: (v: boolean) => void;
  setPrefs: (p: Partial<NotificationPrefs>) => void;
}

const defaultPrefs: NotificationPrefs = {
  periodReminder: true,
  ovulationAlert: true,
  fertileStart: true,
  logNudge: true,
  dailyReminder: false,
  monthlyReport: true,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      permissionGranted: false,
      permissionChecked: false,
      prefs: defaultPrefs,
      setPermissionGranted: (v) => set({ permissionGranted: v, permissionChecked: true }),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
    }),
    {
      name: 'luna-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ permissionGranted: s.permissionGranted, prefs: s.prefs }),
    },
  ),
);
