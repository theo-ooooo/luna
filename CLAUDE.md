# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 다룰 때 참고하는 전역 안내서입니다.

## 프로젝트 개요

**Luna**는 여성의 생리주기·배란일·증상을 추적하는 모바일 앱입니다. 과학적 예측 알고리즘(가중평균 + 배란 지표)을 기반으로 다음 생리일·배란일을 예측하고, 일상 증상(기분·통증·분비물·BBT·LH 테스트)을 기록합니다.

- 서비스명: **Luna** (루나)
- 저장소: [theo-ooooo/luna](https://github.com/theo-ooooo/luna) (Public, MIT)
- 프로젝트 단계: **Phase 1 (MVP)** — 2026-05 ~

## 서브 프로젝트 구조

| 디렉토리 | 역할 |
| --- | --- |
| `api/` | 백엔드 — Ruby on Rails 8 (API mode) |
| `app/` | 모바일 앱 — React Native + TypeScript |
| `docs/` | 설계·기획·운영 문서 |
| `infra/` | 인프라 구성 (docker-compose 등) |
| `agents/` | AI 에이전트 하네스 파일 |

## 에이전트 위임 가이드

- **API/DB 관련** → `agents/backend.md`
  - REST 엔드포인트, ActiveRecord 모델, 마이그레이션, 인증
  - 설정은 Rails credentials / ENV 기반으로 관리
- **UI 관련** → `agents/frontend.md`
  - 화면·컴포넌트, 상태 관리, API 연동, 다국어(ko/en)
- **디자인/UX** → `agents/design.md`
  - 와이어프레임, 디자인 시스템 (Claude Code Design 기반)
- **문서/기획 산출물** → `agents/docs.md`
- **QA/검증** → `agents/qa.md`
  - 시나리오 체크리스트(SC-01~06), GATE 4 통과 판정
  - Critical/High 버그 0건 확인 후 오케스트레이터에게 결과 반환
- **코드 리뷰** → `agents/reviewer.md`
  - PR 생성 직후 자동 실행, 블로커+개선권고 모두 처리

## 확정 기술 스택

```
Backend  : Ruby on Rails 8.x (API mode)
DB       : PostgreSQL 16
Auth     : Devise + devise-jwt
Mobile   : React Native (iOS-first) / TypeScript / React Query / Zustand
Infra    : Docker Compose (개발), AWS ECS Fargate (프로덕션 예정)
CI/CD    : GitHub Actions
```

## 핵심 도메인 모델

| 모델 | 역할 |
| --- | --- |
| `User` | 계정, 기본 주기 설정 |
| `Cycle` | 생리 시작/종료일, 주기 길이, 출혈량 |
| `DailyLog` | 날짜별 기록 (증상, 기분, 분비물, BBT, LH 테스트) |
| `Prediction` | 다음 생리일·배란일·임신가능기간 예측 결과 캐시 |

## 예측 알고리즘 원칙

- 최근 6개 주기 가중평균으로 다음 생리일 예측
- 배란일 = 다음 생리 예정일 - 14일 (Luteal phase 고정)
- BBT 급등 / LH surge 기록이 있으면 해당 주기의 실측 배란일로 보정
- 주기 데이터 3개 미만이면 기본값(28일 주기) 사용

## AI 에이전트 오케스트레이션 파이프라인

Claude Code가 오케스트레이터 역할을 수행하며, GATE 승인 기반으로 개발 흐름을 관리합니다.

```
/기획시작 → GATE 1 승인
  → /설계시작 → GATE 2 승인
    → /backend시작 + /frontend시작 + /design시작 (병렬)
      ├── PR 생성 즉시 → /리뷰시작 자동 실행 → PR 코멘트 게시
      │     블로커 0건 → 유저에게 머지 요청
      │     블로커 있음 → 수정 → 재커밋 → 재리뷰
      └── GATE 3 (DB 스키마 변경 검증)
        → /qa시작 → /docs시작
```

### 리뷰어 자동 실행 규칙

오케스트레이터는 **PR을 생성한 직후 반드시** `/리뷰시작 <PR번호>`를 실행한다. 유저가 별도로 요청하지 않아도 자동으로 수행한다. `agents/reviewer.md` 참조.

## GATE 승인 기준

| GATE | 조건 | 승인 방법 |
| --- | --- | --- |
| GATE 1 (기획→설계) | 기획문서 완성, 미결사항 0건 | "기획 승인" 또는 "설계 시작해" |
| GATE 2 (설계→구현) | 설계 산출물 완성, API 스펙 합의 | "설계 승인" 또는 "구현 시작해" |
| GATE 3 (DB 스키마) | DB 변경 시 마이그레이션 검증 | "DB 승인" 또는 자동 통과 |
| GATE 4 (QA→문서) | Critical/High 버그 0건 | QA 에이전트 자동 판단 |
| **PR 리뷰 게이트** | 모든 PR에 reviewer 에이전트 리뷰 코멘트 1회 이상, 블로커 0건 | 유저가 머지 버튼 |

## 코드 수정 및 테스트 규칙

### 수정-테스트 루프
```
수정 명세서 승인
  → 코드 수정
    → 단위 테스트 작성/실행
      → PASS (커버리지 80%+) → 커밋
      → FAIL → 원인 분석 → 코드 수정 → 단위 테스트 (반복, 최대 10회)
```

### 필수 규칙
- 코드 수정 시 반드시 해당 기능의 단위 테스트를 작성하거나 기존 테스트를 실행
- 수정 명세서에 명시되지 않은 파일/함수는 수정하지 않음

## Git Convention

- 브랜치: `feature/{기능}` / `fix/{버그}` / `improve/{기능}`
- 커밋: `feat/fix/refactor/style/test/docs/chore/db: {내용}`
- 흐름: 품질검사 PASS → 커밋 → 코드 리뷰 요청 → 승인 → develop 머지

## 다국어 / 인코딩

- 기본 언어: 한국어 (ko)
- 지원: 한국어, 영어
- 코드 주석·커밋 메시지: 한국어

## 보조 커맨드

| 커맨드 | 용도 |
| --- | --- |
| `/기획시작` | 요구사항 토론 → 기획문서 작성 |
| `/설계시작` | 아키텍처·API·DB 설계 |
| `/backend시작` | Rails API 구현 |
| `/frontend시작` | 앱 UI 구현 |
| `/design시작` | 와이어프레임·디자인 시스템 |
| `/qa시작` | 시나리오·통합·E2E 테스트 |
| `/docs시작` | 문서·릴리즈 노트 작성 |
| `/리뷰시작 <PR번호>` | PR 코드 리뷰 에이전트 호출 |
