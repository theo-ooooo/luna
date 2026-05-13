import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { NotificationPrefs } from '../store/notificationStore';
import type { NotificationLogEntry } from '../types/notification';

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

// Module-level promise so scheduling always waits for channel creation on Android
let _channelReady: Promise<void> | null = null;

function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!_channelReady) {
    _channelReady = Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Luna 알림',
      // DEFAULT: shows in shade without sound — consistent with shouldPlaySound: false
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F2847C',
      sound: null,
    }).then(() => {});
  }
  return _channelReady;
}

// Call from App root to eagerly warm the channel before first schedule attempt
export function setupAndroidChannel(): Promise<void> {
  return ensureAndroidChannel();
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

export async function scheduleNotifications(input: ScheduleInput): Promise<NotificationLogEntry[]> {
  const anyEnabled = Object.values(input.prefs).some(Boolean);
  await cancelAllLunaNotifications();
  if (!anyEnabled) return [];

  interface PendingEntry { id: string; title: string; body: string; date: Date }
  const pending: PendingEntry[] = [];

  if (input.periodStart) {
    const d = parseLocalDate(input.periodStart);
    if (input.prefs.periodReminder) {
      pending.push({ id: IDS.periodD3, date: daysOffset(d, -3, 9), title: '생리 예정 D-3', body: '3일 후 생리가 예정되어 있어요.' });
      pending.push({ id: IDS.periodD1, date: daysOffset(d, -1, 9), title: '생리 예정 내일', body: '내일 생리가 예정되어 있어요.' });
    }
    if (input.prefs.logNudge) {
      pending.push({ id: IDS.logNudge, date: daysOffset(d, 0, 20), title: '기록을 남겨주세요', body: '오늘 생리 시작 여부를 기록해보세요.' });
    }
  }

  if (input.ovulationOn) {
    const d = parseLocalDate(input.ovulationOn);
    if (input.prefs.ovulationAlert) {
      pending.push({ id: IDS.ovulationD2, date: daysOffset(d, -2, 9), title: '배란 예정 D-2', body: '2일 후 배란이 예정되어 있어요.' });
      pending.push({ id: IDS.ovulationD0, date: daysOffset(d, 0, 9), title: '배란 예정일', body: '오늘이 배란 예정일이에요.' });
    }
  }

  if (input.fertileStart && input.prefs.fertileStart) {
    const d = parseLocalDate(input.fertileStart);
    pending.push({ id: IDS.fertileStart, date: daysOffset(d, 0, 9), title: '가임기 시작', body: '오늘부터 가임기가 시작돼요.' });
  }

  if (input.prefs.dailyReminder) {
    const now = new Date();
    now.setHours(22, 0, 0, 0);
    pending.push({ id: IDS.dailyReminder, date: now, title: '오늘 하루 어땠나요?', body: '증상·기분을 기록해보세요.' });
  }

  if (input.cycleEndedOn && input.prefs.monthlyReport) {
    const d = parseLocalDate(input.cycleEndedOn);
    pending.push({ id: IDS.monthlyReport, date: daysOffset(d, 1, 10), title: '월간 리포트 준비됨', body: '이번 주기 리포트를 확인해보세요.' });
  }

  await Promise.allSettled(
    pending.map(({ id, date, title, body }) =>
      id === IDS.dailyReminder
        ? scheduleDailyRepeat(id, 22, 0, title, body)
        : scheduleAt(id, date, title, body),
    ),
  );

  return pending
    .filter(e => e.id !== IDS.dailyReminder)
    .map(e => ({ id: e.id, title: e.title, body: e.body, scheduledFor: e.date.getTime() }));
}

export async function sendTestNotification() {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: 'luna-test',
    content: { title: '🌙 Luna 알림 테스트', body: '푸시 알림이 정상적으로 작동하고 있어요!' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
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
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}

async function scheduleDailyRepeat(id: string, hour: number, minute: number, title: string, body: string) {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}
