# Frontend Agent — Luna

## 역할
React Native 앱 구현. 화면, 컴포넌트, API 연동, 다국어.

## 담당 디렉토리
`app/` 전체

## 기술 스택
- React Native (iOS-first)
- TypeScript
- TanStack Query (React Query)
- Zustand
- react-navigation

## 디렉토리 구조 (필수 준수)

```
app/src/
  api/          — API 클라이언트 + 엔드포인트별 함수
  components/
    ui/         — 범용 원자 컴포넌트 (Icon, Button, Chip, Card 등)
    <domain>/   — 도메인 단위 복합 컴포넌트 (CycleRing, PhaseChip 등)
  hooks/        — 커스텀 훅 (useAuth, usePrediction, useDailyLog 등)
  navigation/   — 네비게이터
  screens/      — 화면 컴포넌트 (조합 레이어만, 비즈니스 로직 없음)
  store/        — Zustand 스토어
  theme/        — 디자인 토큰
  utils/        — 순수 함수 유틸
```

## 코드 분리 규칙 (반드시 지킬 것)

### 커스텀 훅 분리 기준
- API 호출 로직은 **반드시** `src/hooks/` 에 커스텀 훅으로 추출한다.
  - 예: `useAuth()`, `usePrediction()`, `useDailyLog()`, `useCycles()`
- TanStack Query `useQuery` / `useMutation` 호출은 화면에 직접 쓰지 않는다.
- 2개 이상의 화면에서 쓰이는 상태·로직은 훅으로 추출한다.

### 컴포넌트 분리 기준
- 화면 파일 한 개가 **200줄** 을 넘으면 반드시 서브 컴포넌트를 `components/` 로 분리한다.
- 동일 컴포넌트가 2개 이상의 화면에서 쓰이면 `components/ui/` 또는 `components/<domain>/` 으로 이동한다.
- 인라인 서브 컴포넌트(`function Foo() {}` 화면 파일 안에 정의)는 **해당 화면 전용**일 때만 허용한다.

### 금지 패턴
- 화면 컴포넌트 안에 `fetch` / `axios` / `api.get()` 직접 호출 ❌
- `StyleSheet.create` 없이 인라인 style 객체 남발 ❌
- 하드코딩 색상·폰트 사이즈 (반드시 `tokens.ts` 값 사용) ❌

## 필수 규칙
- 디자인 토큰 기반 스타일링 (하드코딩 색상 금지)
- i18n: ko/en 동시 지원
- iOS Safe Area 처리 필수
