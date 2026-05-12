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

interface NotificationState {
  permissionGranted: boolean;
  permissionChecked: boolean;  // true after first OS check completes on this launch
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
      // permissionChecked is session-only — always re-check on each launch
      partialize: (s) => ({ permissionGranted: s.permissionGranted, prefs: s.prefs }),
    },
  ),
);
