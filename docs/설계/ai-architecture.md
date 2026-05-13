# Luna AI 아키텍처 v0.1

> 작성일: 2026-05-12 | 모델: Claude Haiku 3.5 | 기능: 증상 분석 채팅 + 월간 리포트

---

## 1. 개요

Luna의 AI 기능은 두 가지입니다.

| 기능 | 설명 | 트리거 |
|---|---|---|
| **증상 분석 채팅** | 현재 주기 컨텍스트 기반 Q&A | 사용자 메시지 |
| **월간 자연어 리포트** | 해당 월 주기·증상 패턴 요약 | 주기 종료 후 배치 |

---

## 2. 모델 선택

**Claude Haiku 3.5** (`claude-haiku-3-5-20251001`)

| 항목 | 값 |
|---|---|
| Input | $0.80 / 1M tokens |
| Output | $4.00 / 1M tokens |
| Cache Write | $1.00 / 1M tokens |
| Cache Read | $0.08 / 1M tokens |
| Context window | 200K tokens |

**선택 이유**
- 건강 민감 데이터를 다루므로 Anthropic 인프라 유지 (GDPR/개인정보 보호)
- 가격 대비 충분한 의료 상식 이해도
- Prompt Caching으로 시스템 프롬프트 재활용 → 비용 최소화

**예상 비용 (사용자당/월)**
```
시스템 프롬프트: ~500 tokens (캐시 히트 가정)
컨텍스트 스냅샷: ~200 tokens
대화 이력: 평균 3턴 × 200 tokens = 600 tokens
Output: 평균 3턴 × 150 tokens = 450 tokens

= 캐시 리드 700 × $0.08/1M + 아웃풋 450 × $4.00/1M
≈ $0.018/사용자/월
```

---

## 3. 증상 분석 채팅

### 3-1. 컨텍스트 구성 (서버 측)

사용자 메시지 전송 시 서버가 **익명 컨텍스트 스냅샷**을 생성하여 시스템 프롬프트에 주입합니다. 사용자 식별 정보(이름/이메일/ID)는 일체 포함하지 않습니다.

```json
{
  "today": "2026-05-10",
  "cycle_day": 22,
  "phase": "luteal",
  "avg_cycle_length": 28.5,
  "luteal_phase_length": 14,
  "predicted_ovulation": "2026-04-19",
  "observed_ovulation": null,
  "next_period_start": "2026-05-03",
  "recent_logs": [
    { "day": 20, "symptoms": { "headache": 2, "fatigue": 1 }, "mood": 3 },
    { "day": 21, "symptoms": { "headache": 3, "fatigue": 2 }, "mood": 2 },
    { "day": 22, "symptoms": { "cramps": 0, "headache": 3 }, "mood": 2 }
  ]
}
```

### 3-2. 시스템 프롬프트 (Prompt Caching 적용)

```
[CACHE BLOCK — 정적 파트]
당신은 여성 건강 전문 AI 어시스턴트 Luna입니다. 사용자의 생리주기 데이터를 기반으로
건강 인사이트를 제공합니다.

규칙:
- 의료 진단을 내리지 않습니다. "의사에게 상담하세요"를 적절히 권유합니다.
- 답변은 친근하고 따뜻한 한국어로 작성합니다.
- 증상의 원인을 주기 단계(월경기·난포기·배란기·황체기)와 연결하여 설명합니다.
- 임신 가능성 질문에 대해 의학적 확률을 직접 제시하지 않습니다.
- 데이터가 부족하면 불확실성을 명시합니다.

면책:
이 서비스는 의료 행위가 아니며 진단·처방을 제공하지 않습니다.
[END CACHE BLOCK]

[DYNAMIC CONTEXT]
현재 주기 정보: {context_snapshot_json}
[END DYNAMIC CONTEXT]
```

### 3-3. 데이터 흐름

```
[앱] 사용자 메시지 입력
  ↓
[Rails API] /ai/chat
  1. JWT 인증
  2. DB에서 최근 3일 daily_logs + 예측 데이터 조회
  3. context_snapshot 생성 (개인식별정보 제외)
  4. ai_conversations.messages에 user 메시지 append
  5. Anthropic SDK → messages.create (stream: true)
     - system: [cached_prompt + context]
     - messages: 대화 이력 (최근 10턴)
  ↓
[SSE Stream] 클라이언트로 delta 전송
  ↓
[Rails API] 스트림 완료 후
  6. ai_conversations.messages에 assistant 응답 append
  7. context_snapshot 저장 (감사 용도)
```

### 3-4. 대화 이력 관리

- `ai_conversations.messages` JSONB 배열에 `{role, content, ts}` 저장
- 최근 10턴(20 messages)만 API 전송 → context window 절약
- 대화 세션은 1개월 보관 후 자동 삭제 (개인정보 최소 보유 원칙)

---

## 4. 월간 자연어 리포트

### 4-1. 트리거

주기 종료 시(`cycles.ended_on` 기록) 백그라운드 Job(`ActiveJob`) 큐에 등록.

```ruby
# app/jobs/monthly_report_job.rb
MonthlyReportJob.perform_later(user_id: user.id, year: year, month: month)
```

### 4-2. 프롬프트

```
[시스템]
당신은 여성 건강 데이터 분석 전문가입니다. 아래 데이터를 읽기 쉬운 한국어 문단으로 요약하세요.
- 3~5문장
- 수치보다 패턴과 의미 중심
- 긍정적이고 격려하는 톤

[사용자]
{월간 통계 JSON}
```

### 4-3. 월간 통계 JSON 구조

```json
{
  "year": 2026,
  "month": 4,
  "cycle_length": 27,
  "predicted_start": "2026-04-15",
  "actual_start": "2026-04-14",
  "prediction_error_days": -1,
  "symptom_days": {
    "cramps": 3,
    "headache": 5,
    "fatigue": 8,
    "bloating": 2
  },
  "avg_mood": 3.2,
  "bbt_recorded_days": 12,
  "lh_positive": false,
  "notes_count": 7
}
```

### 4-4. 결과 저장

생성된 리포트는 `ai_conversations`에 별도 레코드로 저장 (role: `monthly_report` 타입 구분).

---

## 5. 보안 및 개인정보 원칙

| 원칙 | 구현 방법 |
|---|---|
| 최소 데이터 전송 | API 전송 시 날짜·증상 코드만, 이름/이메일/ID 제외 |
| 전송 암호화 | HTTPS only, TLS 1.3 |
| 서버 저장 보호 | `ai_conversations` 테이블 컬럼 레벨 암호화 (pgcrypto) |
| 보존 기간 | 대화 이력 1개월, 월간 리포트 12개월 후 자동 삭제 |
| 제3자 공유 금지 | Anthropic API 이외 AI 서비스 미사용 |

---

## 6. 오류 처리

| 상황 | 처리 방법 |
|---|---|
| Claude API timeout (>30s) | 503 반환, 클라이언트에 재시도 안내 |
| Claude API 5xx | 지수 백오프 3회 재시도 후 503 |
| 컨텍스트 없음 (주기 데이터 0건) | 컨텍스트 없이 일반 건강 정보로 응답 |
| 대화 이력 과다 (>100턴) | 최근 10턴만 전송, 나머지 DB에 보관 |

---

## 7. 향후 확장 (Phase 2+)

- **다국어 지원**: 영어 시스템 프롬프트 추가 (i18n)
- **자연어 증상 파싱**: "오늘 배가 아프고 기분이 별로야" → structured 증상 추출 (Tool Use)
- **배란일 예측 보정 제안**: BBT/LH 데이터 패턴 분석 후 luteal_phase_length 재조정 제안
- **Opus 업그레이드 경로**: 복잡 질의 시 claude-opus-4 자동 라우팅
