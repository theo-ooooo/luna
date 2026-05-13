import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPrefs {
  periodReminder: boolean;   // 생리 예정 D-3, D-1
  ovulationAlert: boolean;   // 배란 예정 D-2, D-0
  fertileStart: boolean;     // 가임기 시작
  logNudge: boolean;         // 기록 독려 (예정일 당일 미기록)
  dailyReminder: boolean;    // 일일 로그 리마인더 (기본 off)
  monthlyReport: boolean;    // 월간 리포트 준비됨
}

export interface NotificationLogEntry {
  id: string;
  title: string;
  body: string;
  scheduledFor: number; // unix timestamp (ms)
}

interface NotificationState {
  permissionGranted: boolean;
  permissionChecked: boolean;
  prefs: NotificationPrefs;
  notificationLog: NotificationLogEntry[];
  setPermissionGranted: (v: boolean) => void;
  setPrefs: (p: Partial<NotificationPrefs>) => void;
  setNotificationLog: (entries: NotificationLogEntry[]) => void;
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
      notificationLog: [],
      setPermissionGranted: (v) => set({ permissionGranted: v, permissionChecked: true }),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      setNotificationLog: (entries) => set({ notificationLog: entries }),
    }),
    {
      name: 'luna-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        permissionGranted: s.permissionGranted,
        prefs: s.prefs,
        notificationLog: s.notificationLog,
      }),
    },
  ),
);
