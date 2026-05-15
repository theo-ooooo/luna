/**
 * 시나리오 테스트: 최초 가입자 / 기존 이용자
 *
 * 각 시나리오는 Given-When-Then 구조로 작성됩니다.
 * API 클라이언트와 Auth 스토어는 mock으로 대체됩니다.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';

// ── Mock: API 클라이언트 ────────────────────────────────────────────────────
const mockApiPost = jest.fn();
const mockApiPatch = jest.fn();
const mockApiGet = jest.fn();

jest.mock('../api/client', () => ({
  api: { post: mockApiPost, patch: mockApiPatch, get: mockApiGet },
  ApiError: class ApiError extends Error {
    code: string;
    constructor(message: string, code: string) { super(message); this.code = code; }
  },
}));

// ── Mock: Auth 스토어 ───────────────────────────────────────────────────────
const mockSetAuth = jest.fn();
const mockSetOnboardingDone = jest.fn();
const mockGetState = jest.fn(() => ({
  token: 'mock-token',
  setAuth: mockSetAuth,
  setOnboardingDone: mockSetOnboardingDone,
  user: null,
}));

jest.mock('../store/authStore', () => ({
  useAuthStore: Object.assign(
    jest.fn((selector: (s: any) => any) => selector({
      setAuth: mockSetAuth,
      setOnboardingDone: mockSetOnboardingDone,
      token: 'mock-token',
      user: null,
    })),
    { getState: mockGetState },
  ),
}));

// ── Mock: Toast ─────────────────────────────────────────────────────────────
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

// ── Mock: notifications 서비스 (dynamic import) ──────────────────────────────
jest.mock('../services/notifications', () => ({ cancelLogNudge: jest.fn() }));

// ── Helper: QueryClient 래퍼 ─────────────────────────────────────────────────
function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════
// 시나리오: 최초 가입자
// ═══════════════════════════════════════════════════════════════════
describe('시나리오: 최초 가입자', () => {

  describe('이메일 회원가입 플로우', () => {
    const { useSignup } = require('../hooks/useAuthMutations');

    const mockSignupParams = {
      email: 'luna@example.com',
      password: 'password123',
      nickname: '경원',
      cycleLength: 28,
      periodLength: 5,
      lastPeriodDate: '2026-04-24',
    };
    const mockAuthResponse = {
      token: 'jwt-token',
      user: {
        id: 1, email: 'luna@example.com', nickname: '경원',
        cycle_length_default: 28, period_length_default: 5,
        luteal_phase_length: 14, onboarding_completed: true,
      },
    };

    it('시작하기 → 회원가입 API 호출 후 주기가 생성된다', async () => {
      // Given: 회원가입 성공, 주기 생성 성공
      mockApiPost
        .mockResolvedValueOnce(mockAuthResponse)
        .mockResolvedValueOnce({ id: 1, started_on: '2026-04-24', ended_on: '2026-04-28' });

      const { result } = renderHook(() => useSignup(), { wrapper: makeWrapper() });

      // When: 시작하기 버튼 누름
      await act(async () => {
        result.current.mutate(mockSignupParams);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Then: 회원가입 API 호출됨
      expect(mockApiPost).toHaveBeenNthCalledWith(1,
        '/api/v1/auth/signup',
        expect.objectContaining({
          user: expect.objectContaining({
            email: 'luna@example.com',
            cycle_length_default: 28,
            period_length_default: 5,
          }),
        }),
      );

      // Then: 주기 생성 API 호출됨 (ended_on 포함)
      expect(mockApiPost).toHaveBeenNthCalledWith(2,
        '/api/v1/cycles',
        expect.objectContaining({
          started_on: '2026-04-24',
          ended_on: '2026-04-28', // 4/24 + 5일 - 1 = 4/28
        }),
      );

      // Then: 인증 상태와 온보딩 완료 플래그 설정됨
      expect(mockSetAuth).toHaveBeenCalledWith('jwt-token', mockAuthResponse.user);
      expect(mockSetOnboardingDone).toHaveBeenCalledWith(true);
    });

    it('회원가입 API 실패 시 주기 미생성, onboardingDone 미설정', async () => {
      // Given: 회원가입 실패
      mockApiPost.mockRejectedValueOnce(new Error('이메일 중복'));

      const { result } = renderHook(() => useSignup(), { wrapper: makeWrapper() });

      await act(async () => {
        result.current.mutate(mockSignupParams);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Then: 주기 생성 미호출
      expect(mockApiPost).toHaveBeenCalledTimes(1);

      // Then: 인증 상태 변경 없음
      expect(mockSetAuth).not.toHaveBeenCalled();
      expect(mockSetOnboardingDone).not.toHaveBeenCalled();
    });

    it('주기 생성 API 실패 시 setAuth / setOnboardingDone 미설정', async () => {
      // Given: 회원가입 성공, 주기 생성 실패
      mockApiPost
        .mockResolvedValueOnce(mockAuthResponse)
        .mockRejectedValueOnce(new Error('서버 오류'));

      const { result } = renderHook(() => useSignup(), { wrapper: makeWrapper() });

      await act(async () => {
        result.current.mutate(mockSignupParams);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Then: 인증 상태 미설정 (주기 생성 성공 후 setAuth 호출되는 구조)
      expect(mockSetAuth).not.toHaveBeenCalled();
      expect(mockSetOnboardingDone).not.toHaveBeenCalled();
    });
  });

  describe('애플 로그인 온보딩 플로우', () => {
    const { useOnboarding } = require('../hooks/useOnboarding');

    it('온보딩 완료 시 사용자 정보 업데이트 + 주기 생성됨', async () => {
      // Given: PATCH /users/me 성공, POST /cycles 성공
      mockApiPatch.mockResolvedValueOnce({
        id: 1, email: 'apple@example.com', nickname: '경원',
        cycle_length_default: 28, period_length_default: 7,
        onboarding_completed: true,
      });
      mockApiPost.mockResolvedValueOnce({ id: 1, started_on: '2026-04-24', ended_on: '2026-04-30' });

      const { result } = renderHook(() => useOnboarding(), { wrapper: makeWrapper() });

      // When: 온보딩 완료 버튼 누름 (생리 주기 28일, 생리 기간 7일, 마지막 생리 4/24)
      await act(async () => {
        result.current.submit(28, 7, '2026-04-24', '경원');
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      // Then: 사용자 정보 업데이트 API 호출됨
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/api/v1/users/me',
        expect.objectContaining({
          cycle_length_default: 28,
          period_length_default: 7,
          onboarding_completed: true,
          nickname: '경원',
        }),
      );

      // Then: 주기 생성 API 호출됨 (ended_on = 4/24 + 7일 - 1 = 4/30)
      expect(mockApiPost).toHaveBeenCalledWith(
        '/api/v1/cycles',
        expect.objectContaining({
          started_on: '2026-04-24',
          ended_on: '2026-04-30',
        }),
      );

      // Then: 온보딩 완료 플래그 설정됨
      expect(mockSetOnboardingDone).toHaveBeenCalledWith(true);
    });

    it('마지막 생리일 없이 온보딩 완료 시 주기 미생성', async () => {
      // Given: PATCH /users/me 성공
      mockApiPatch.mockResolvedValueOnce({
        id: 1, email: 'apple@example.com',
        cycle_length_default: 28, period_length_default: 5,
        onboarding_completed: true,
      });

      const { result } = renderHook(() => useOnboarding(), { wrapper: makeWrapper() });

      // When: 마지막 생리일 null로 온보딩 완료
      await act(async () => {
        result.current.submit(28, 5, null);
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      // Then: 주기 생성 API 미호출
      expect(mockApiPost).not.toHaveBeenCalled();
      expect(mockSetOnboardingDone).toHaveBeenCalledWith(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// 시나리오: 기존 이용자
// ═══════════════════════════════════════════════════════════════════
describe('시나리오: 기존 이용자', () => {

  describe('생리 시작', () => {
    const { useStartPeriod } = require('../hooks/useCycles');

    it('시작하기 누르면 POST /cycles 호출된다', async () => {
      // Given: POST /cycles 성공
      mockApiPost.mockResolvedValueOnce({ id: 10, started_on: '2026-05-15', ended_on: null });

      const { result } = renderHook(() => useStartPeriod(), { wrapper: makeWrapper() });

      // When: 시작하기 버튼 누름 (보통 출혈량=2)
      await act(async () => {
        result.current.mutate({ flowLevel: 2, startedOn: '2026-05-15' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Then: 올바른 payload로 API 호출됨
      expect(mockApiPost).toHaveBeenCalledWith('/api/v1/cycles', {
        started_on: '2026-05-15',
        flow_level: 2,
      });
    });

    it('API 실패 시 error 상태로 전환된다', async () => {
      // Given: 서버 오류
      mockApiPost.mockRejectedValueOnce(new Error('500'));

      const { result } = renderHook(() => useStartPeriod(), { wrapper: makeWrapper() });

      await act(async () => {
        result.current.mutate({ flowLevel: 1, startedOn: '2026-05-15' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('생리 종료', () => {
    const { useEndPeriod } = require('../hooks/useCycles');

    it('종료하기 누르면 PATCH /cycles/:id 호출된다', async () => {
      // Given: PATCH 성공
      mockApiPatch.mockResolvedValueOnce({ id: 10, started_on: '2026-05-15', ended_on: '2026-05-19' });

      const { result } = renderHook(() => useEndPeriod(), { wrapper: makeWrapper() });

      // When: 종료하기 버튼 누름
      await act(async () => {
        result.current.mutate({ cycleId: 10, endedOn: '2026-05-19' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Then: 올바른 엔드포인트와 payload로 호출됨
      expect(mockApiPatch).toHaveBeenCalledWith('/api/v1/cycles/10', { ended_on: '2026-05-19' });
    });
  });

  describe('일별 기록 저장', () => {
    const { useSaveDailyLog } = require('../hooks/useDailyLog');

    it('새 기록 → POST /daily_logs 호출된다', async () => {
      // Given: POST 성공
      mockApiPost.mockResolvedValueOnce({ id: 5, logged_on: '2026-05-15', mood: 4 });

      const { result } = renderHook(() => useSaveDailyLog('2026-05-15'), { wrapper: makeWrapper() });

      // When: 기록 저장 (id 없음 → 신규 생성)
      await act(async () => {
        result.current.mutate({ fields: { mood: 4, cramps: 0, headache: 0, fatigue: 0, bloating: 0 } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Then: POST 호출됨
      expect(mockApiPost).toHaveBeenCalledWith(
        '/api/v1/daily_logs',
        expect.objectContaining({ mood: 4, logged_on: '2026-05-15' }),
      );
    });

    it('기존 기록 수정 → PATCH /daily_logs/:id 호출된다', async () => {
      // Given: PATCH 성공
      mockApiPatch.mockResolvedValueOnce({ id: 5, logged_on: '2026-05-15', mood: 5 });

      const { result } = renderHook(() => useSaveDailyLog('2026-05-15'), { wrapper: makeWrapper() });

      // When: 기록 수정 (id 있음 → 업데이트)
      await act(async () => {
        result.current.mutate({ id: 5, fields: { mood: 5 } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Then: PATCH 호출됨
      expect(mockApiPatch).toHaveBeenCalledWith('/api/v1/daily_logs/5', { mood: 5 });
    });
  });
});
