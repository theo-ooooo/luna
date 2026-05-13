/** 스케줄된 알림 한 건의 로컬 표현 (서버 동기화용) */
export interface NotificationLogEntry {
  /** expo-notifications identifier (예: 'luna-period-d3') */
  id: string;
  title: string;
  body: string;
  /** 알림 예약 시각 (Unix ms) */
  scheduledFor: number;
}
