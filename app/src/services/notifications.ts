import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { NotificationPrefs } from '../store/notificationStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ANDROID_CHANNEL_ID = 'luna-default';

// Android 8+ requires a notification channel — call once at app start
export async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Luna 알림',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F2847C',
    sound: null,
  });
}

// Parses "YYYY-MM-DD" in local timezone, avoiding the UTC-midnight trap of new Date(str)
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Stable identifier prefix per notification type for idempotent cancel+reschedule
const IDS = {
  periodD3: 'luna-period-d3',
  periodD1: 'luna-period-d1',
  ovulationD2: 'luna-ov-d2',
  ovulationD0: 'luna-ov-d0',
  fertileStart: 'luna-fertile-start',
  logNudge: 'luna-log-nudge',
  dailyReminder: 'luna-daily-reminder',
  monthlyReport: 'luna-monthly-report',
} as const;

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: false },
  });
  return status === 'granted';
}

interface ScheduleInput {
  periodStart: string | null;       // YYYY-MM-DD
  ovulationOn: string | null;       // YYYY-MM-DD
  fertileStart: string | null;      // YYYY-MM-DD
  cycleEndedOn: string | null;      // YYYY-MM-DD (for monthly report)
  prefs: NotificationPrefs;
}

export async function scheduleNotifications(input: ScheduleInput) {
  const anyEnabled = Object.values(input.prefs).some(Boolean);
  await cancelAllLunaNotifications();
  if (!anyEnabled) return;

  const tasks: Promise<void>[] = [];

  if (input.periodStart) {
    const d = parseLocalDate(input.periodStart);
    if (input.prefs.periodReminder) {
      tasks.push(scheduleAt(IDS.periodD3, daysOffset(d, -3, 9), '생리 예정 D-3', '3일 후 생리가 예정되어 있어요.'));
      tasks.push(scheduleAt(IDS.periodD1, daysOffset(d, -1, 9), '생리 예정 내일', '내일 생리가 예정되어 있어요.'));
    }
    if (input.prefs.logNudge) {
      tasks.push(scheduleAt(IDS.logNudge, daysOffset(d, 0, 20), '기록을 남겨주세요', '오늘 생리 시작 여부를 기록해보세요.'));
    }
  }

  if (input.ovulationOn) {
    const d = parseLocalDate(input.ovulationOn);
    if (input.prefs.ovulationAlert) {
      tasks.push(scheduleAt(IDS.ovulationD2, daysOffset(d, -2, 9), '배란 예정 D-2', '2일 후 배란이 예정되어 있어요.'));
      tasks.push(scheduleAt(IDS.ovulationD0, daysOffset(d, 0, 9), '배란 예정일', '오늘이 배란 예정일이에요.'));
    }
  }

  if (input.fertileStart && input.prefs.fertileStart) {
    const d = parseLocalDate(input.fertileStart);
    tasks.push(scheduleAt(IDS.fertileStart, daysOffset(d, 0, 9), '가임기 시작', '오늘부터 가임기가 시작돼요.'));
  }

  if (input.prefs.dailyReminder) {
    tasks.push(scheduleDailyRepeat(IDS.dailyReminder, 22, 0, '오늘 하루 어땠나요?', '증상·기분을 기록해보세요.'));
  }

  if (input.cycleEndedOn && input.prefs.monthlyReport) {
    const d = parseLocalDate(input.cycleEndedOn);
    tasks.push(scheduleAt(IDS.monthlyReport, daysOffset(d, 1, 10), '월간 리포트 준비됨', '이번 주기 리포트를 확인해보세요.'));
  }

  await Promise.allSettled(tasks);
}

export async function cancelLogNudge() {
  await Notifications.cancelScheduledNotificationAsync(IDS.logNudge).catch(() => {});
}

export async function cancelAllLunaNotifications() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const luna = all.filter((n) => n.identifier.startsWith('luna-'));
  await Promise.allSettled(luna.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysOffset(base: Date, days: number, hour: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function scheduleAt(id: string, date: Date, title: string, body: string) {
  if (date <= new Date()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }) },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

async function scheduleDailyRepeat(id: string, hour: number, minute: number, title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }) },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
