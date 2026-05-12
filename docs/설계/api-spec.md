# Luna API Spec v0.1

> 작성일: 2026-05-12 | Base URL: `/api/v1` | Auth: Bearer JWT

---

## 공통 규칙

### 요청 헤더
```
Authorization: Bearer <JWT>        # 인증 필요 엔드포인트
Content-Type: application/json
Accept: application/json
```

### 응답 포맷
```json
{
  "status": true,
  "data": { ... },
  "error": null
}
```

오류 시:
```json
{
  "status": false,
  "data": null,
  "error": { "code": "ERROR_CODE", "message": "설명" }
}
```

### HTTP 상태 코드
| 코드 | 상황 |
|---|---|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 (유효성 실패) |
| 401 | 인증 없음 / 토큰 만료 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 422 | 처리 불가 (비즈니스 규칙 위반) |

---

## 1. 인증 (Auth)

### POST /auth/signup
회원가입

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "nickname": "지연",
  "cycle_length_default": 28,
  "luteal_phase_length": 14
}
```

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| email | string | ✓ | 이메일 형식, unique |
| password | string | ✓ | 8자 이상 |
| nickname | string | - | 최대 50자 |
| cycle_length_default | integer | - | 2~90, default 28 |
| luteal_phase_length | integer | - | 5~20, default 14 |

**Response 201**
```json
{
  "status": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "지연",
      "cycle_length_default": 28,
      "luteal_phase_length": 14
    }
  }
}
```

---

### POST /auth/login
로그인 → JWT 발급

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 200**
```json
{
  "status": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "지연",
      "cycle_length_default": 28,
      "luteal_phase_length": 14,
      "notifications_enabled": true
    }
  }
}
```

---

### DELETE /auth/logout
로그아웃 (토큰 무효화)

**Response 200** `{ "status": true, "data": null }`

---

## 2. 사용자 (Users)

### GET /users/me
내 프로필 조회

**Response 200**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "지연",
    "cycle_length_default": 28,
    "luteal_phase_length": 14,
    "notifications_enabled": true,
    "created_at": "2026-05-01T09:00:00Z"
  }
}
```

---

### PATCH /users/me
프로필 수정 (부분 업데이트)

**Request Body** (모든 필드 선택)
```json
{
  "nickname": "새닉네임",
  "cycle_length_default": 30,
  "luteal_phase_length": 13,
  "notifications_enabled": false
}
```

**Response 200** → GET /users/me 와 동일 구조

---

## 3. 주기 (Cycles)

### GET /cycles
주기 목록 조회

**Query Params**
| 파라미터 | 설명 | 예시 |
|---|---|---|
| page | 페이지 번호 (default 1) | `?page=2` |
| per | 페이지당 건수 (default 12, max 24) | `?per=6` |

**Response 200**
```json
{
  "status": true,
  "data": {
    "cycles": [
      {
        "id": 5,
        "started_on": "2026-04-15",
        "ended_on": "2026-04-19",
        "flow_level": 2,
        "length_days": 5,
        "created_at": "2026-04-15T08:00:00Z"
      }
    ],
    "meta": { "total": 12, "page": 1, "per": 12 }
  }
}
```

---

### POST /cycles
새 주기 시작 기록

**Request Body**
```json
{
  "started_on": "2026-05-10",
  "flow_level": 2
}
```

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| started_on | date | ✓ | 미래 날짜 불가, 동일 사용자 unique |
| flow_level | integer | - | 1~3 |

**Response 201**
```json
{
  "status": true,
  "data": {
    "id": 6,
    "started_on": "2026-05-10",
    "ended_on": null,
    "flow_level": 2,
    "length_days": null
  }
}
```

---

### PUT /cycles/:id
주기 종료일·출혈량 수정

**Request Body**
```json
{
  "ended_on": "2026-05-14",
  "flow_level": 3
}
```

**Validation**
- `ended_on >= started_on`
- 종료일은 오늘 이하

**Response 200** → 업데이트된 cycle 객체

---

### DELETE /cycles/:id
주기 삭제

**Response 200** `{ "status": true, "data": null }`

---

## 4. 일일 로그 (Daily Logs)

### GET /daily_logs
날짜 범위 조회

**Query Params**
| 파라미터 | 설명 |
|---|---|
| from | 시작일 (YYYY-MM-DD) |
| to | 종료일 (YYYY-MM-DD) |

최대 92일 범위. 미지정 시 최근 30일.

**Response 200**
```json
{
  "status": true,
  "data": [
    {
      "id": 10,
      "logged_on": "2026-05-10",
      "cramps": 2,
      "headache": 0,
      "fatigue": 1,
      "bloating": 0,
      "mood": 3,
      "discharge_type": "creamy",
      "bbt": 36.45,
      "lh_result": 0,
      "notes": null,
      "created_at": "2026-05-10T22:00:00Z"
    }
  ]
}
```

---

### POST /daily_logs
일일 로그 기록

**Request Body**
```json
{
  "logged_on": "2026-05-10",
  "cramps": 2,
  "headache": 0,
  "fatigue": 1,
  "bloating": 0,
  "mood": 3,
  "discharge_type": "creamy",
  "bbt": 36.45,
  "lh_result": 0,
  "notes": "오늘 컨디션 그럭저럭"
}
```

| 필드 | 타입 | 제약 |
|---|---|---|
| logged_on | date | 필수, 미래 불가, unique per user |
| cramps/headache/fatigue/bloating | integer | 0~3 |
| mood | integer | 1~5, nullable |
| discharge_type | string | none/dry/sticky/creamy/watery/egg_white/spotting, nullable |
| bbt | decimal | 35.0~42.0, nullable |
| lh_result | integer | 0~2, nullable |
| notes | string | 최대 1000자 |

**Response 201** → 생성된 daily_log 객체

---

### PUT /daily_logs/:id
로그 수정 (부분 업데이트)

같은 Request Body (모두 선택), `logged_on` 변경 불가.

**Response 200** → 업데이트된 daily_log 객체

---

### DELETE /daily_logs/:id
로그 삭제

**Response 200** `{ "status": true, "data": null }`

---

## 5. 예측 (Predictions)

### GET /predictions/current
현재 주기 기준 예측 데이터 조회

**Response 200**
```json
{
  "status": true,
  "data": {
    "id": 15,
    "predicted_period_start": "2026-06-07",
    "predicted_ovulation_on": "2026-05-24",
    "fertile_start": "2026-05-22",
    "fertile_end": "2026-05-25",
    "based_on_cycles_count": 5,
    "avg_cycle_length": 28.5,
    "observed_ovulation_on": null,
    "computed_at": "2026-05-10T08:00:00Z",
    "current_phase": "menstrual",
    "cycle_day": 1
  }
}
```

`current_phase` 값: `menstrual` / `follicular` / `ovulation` / `luteal`

데이터 부족(주기 0개) 시:
```json
{
  "status": true,
  "data": null
}
```

---

### GET /predictions/history
예측 이력 조회 (최근 12개)

**Response 200**
```json
{
  "status": true,
  "data": [
    {
      "id": 14,
      "predicted_period_start": "2026-05-10",
      "avg_cycle_length": 28.2,
      "based_on_cycles_count": 4,
      "computed_at": "2026-04-15T08:00:00Z"
    }
  ]
}
```

---

## 6. AI 채팅 (AI)

### POST /ai/chat
AI 증상 분석 채팅 (스트리밍)

**Request Body**
```json
{
  "message": "오늘 두통이 심한데 왜 그런 걸까요?",
  "conversation_id": 3
}
```

`conversation_id` 미포함 시 새 대화 생성.

**Response** — `text/event-stream` (SSE)
```
data: {"type":"start","conversation_id":3}

data: {"type":"delta","text":"황체기에는 "}
data: {"type":"delta","text":"프로게스테론 수치가 상승하면서 "}
data: {"type":"delta","text":"두통이 생길 수 있어요."}

data: {"type":"end","usage":{"input_tokens":450,"output_tokens":128}}
```

**전송 컨텍스트 (서버 측 구성, 사용자 식별 정보 미포함)**
```json
{
  "cycle_day": 22,
  "phase": "luteal",
  "recent_symptoms": { "headache": 3, "fatigue": 2 },
  "avg_cycle_length": 28.5,
  "predicted_ovulation": "2026-05-19"
}
```

---

### GET /ai/chat/:conversation_id
대화 이력 조회

**Response 200**
```json
{
  "status": true,
  "data": {
    "id": 3,
    "messages": [
      { "role": "user", "content": "오늘 두통이 심한데 왜 그런 걸까요?", "ts": "2026-05-10T14:00:00Z" },
      { "role": "assistant", "content": "황체기에는 ...", "ts": "2026-05-10T14:00:05Z" }
    ],
    "created_at": "2026-05-10T14:00:00Z"
  }
}
```

---

### GET /ai/monthly_report
월간 자연어 리포트

**Query Params**
| 파라미터 | 설명 | 예시 |
|---|---|---|
| year | 연도 | `?year=2026` |
| month | 월 | `?month=4` |

**Response 200**
```json
{
  "status": true,
  "data": {
    "year": 2026,
    "month": 4,
    "summary": "4월은 28일 주기로 예측보다 하루 일찍 생리가 시작되었어요...",
    "stats": {
      "cycle_length": 27,
      "avg_mood": 3.2,
      "symptom_highlights": ["fatigue", "bloating"]
    },
    "generated_at": "2026-05-01T10:00:00Z"
  }
}
```

---

## 7. 푸시 토큰 (Push Tokens) — Phase 2

### POST /push_tokens
디바이스 토큰 등록

**Request Body**
```json
{
  "token": "ExponentPushToken[xxx]",
  "platform": "ios"
}
```

**Response 201** `{ "status": true, "data": { "id": 1 } }`

---

### DELETE /push_tokens/:token
토큰 제거 (로그아웃 / 앱 삭제 시)

**Response 200** `{ "status": true, "data": null }`

---

## 에러 코드 목록

| 코드 | HTTP | 설명 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 입력값 유효성 실패 |
| `UNAUTHORIZED` | 401 | 인증 토큰 없음 또는 만료 |
| `FORBIDDEN` | 403 | 다른 사용자의 리소스 접근 시도 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `DUPLICATE_DATE` | 422 | 동일 날짜에 이미 cycle/log 존재 |
| `INVALID_DATE_RANGE` | 422 | ended_on < started_on 등 |
| `FUTURE_DATE` | 422 | 미래 날짜로 cycle/log 기록 시도 |
| `AI_UNAVAILABLE` | 503 | Claude API 일시 불가 |
