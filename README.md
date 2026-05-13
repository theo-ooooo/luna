# Luna 🌙

> 생리주기 추적 + AI 건강 인사이트 앱

생리주기·배란일·증상을 기록하고, 내 데이터를 아는 AI 어시스턴트가 건강 패턴을 이해하도록 도와주는 iOS 앱입니다.

## 주요 기능

- **주기 기록** — 생리 시작/종료, 출혈량 추적
- **예측** — 최근 6주기 가중평균 기반 다음 생리일·배란일 예측
- **증상 기록** — 기분, 통증, BBT, LH 테스트, AI 자연어 입력
- **캘린더** — 주기 단계별(생리기/난포기/배란기/황체기) 색상 뷰
- **AI 어시스턴트** — 주기 컨텍스트 기반 Q&A, 월간 요약 리포트
- **인사이트** — BBT 차트, 증상 히트맵, 주기 통계

## 기술 스택

| 영역 | 스택 |
|---|---|
| Backend | Ruby on Rails 8.1 (API mode), PostgreSQL 16 |
| Auth | Devise + devise-jwt |
| Mobile | React Native 0.81 (Expo), TypeScript |
| 상태 관리 | TanStack Query v5, Zustand v5 |
| AI | Claude Haiku (via ruby-openai) |
| 배포 | fly.io (API), GitHub Actions CI/CD |

## 프로젝트 구조

```
luna/
├── api/          # Rails 8 백엔드
├── app/          # React Native 앱
├── docs/         # 기획·설계 문서
├── infra/        # Docker Compose
└── agents/       # AI 에이전트 하네스
```

## 개발 환경 설정

### 사전 요구사항

- Ruby 3.3+, Bundler
- Node.js 20+, npm
- Docker (PostgreSQL용)

### 백엔드 (api/)

```bash
# DB 시작
docker compose -f infra/docker-compose.yml up -d

# 의존성 설치
cd api && bundle install

# DB 생성 및 마이그레이션
bin/rails db:create db:migrate

# 서버 실행 (port 3000)
bin/rails server
```

환경 변수 (`.env` 또는 Rails credentials):

```
DEVISE_JWT_SECRET_KEY=<최소 32자 랜덤 문자열>
OPENAI_API_KEY=<OpenAI 또는 Anthropic API 키>
```

### 앱 (app/)

```bash
cd app && npm install

# iOS 시뮬레이터
npx expo run:ios
```

## API

Base URL: `/api/v1` | 인증: `Authorization: Bearer <JWT>`

```
GET    /api/version
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/users/me
GET    /api/v1/cycles
POST   /api/v1/cycles
GET    /api/v1/predictions/current
POST   /api/v1/ai/chat
GET    /api/v1/ai/monthly_report
```

전체 스펙: [`docs/설계/api-spec.md`](docs/설계/api-spec.md)

## 테스트

```bash
cd api && bundle exec rspec
```

## 배포

`main` 브랜치에 `api/` 변경이 push되면 GitHub Actions가 fly.io에 자동 배포합니다.

수동 배포:
```bash
cd api && fly deploy --remote-only
```

필요한 GitHub Secrets: `FLY_API_TOKEN`

## 라이선스

MIT
