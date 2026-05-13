# Luna ERD — DB 스키마 설계 v0.1

> 작성일: 2026-05-12 | DB: PostgreSQL 16 | ORM: ActiveRecord (Rails 8)

---

## 테이블 목록

### users
```sql
id                    BIGSERIAL PRIMARY KEY
email                 VARCHAR(255) NOT NULL UNIQUE
password_digest       VARCHAR(255) NOT NULL          -- has_secure_password
nickname              VARCHAR(50)
cycle_length_default  SMALLINT     NOT NULL DEFAULT 28  -- 2~90일
luteal_phase_length   SMALLINT     NOT NULL DEFAULT 14  -- 고정 황체기 길이
notifications_enabled BOOLEAN      NOT NULL DEFAULT TRUE
created_at            TIMESTAMPTZ  NOT NULL
updated_at            TIMESTAMPTZ  NOT NULL
```

### cycles
```sql
id           BIGSERIAL PRIMARY KEY
user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE
started_on   DATE        NOT NULL
ended_on     DATE                                    -- NULL = 진행 중
flow_level   SMALLINT                                -- 1:가벼움 2:보통 3:많음
length_days  SMALLINT GENERATED ALWAYS AS            -- ended_on - started_on + 1
             (ended_on - started_on + 1) STORED
created_at   TIMESTAMPTZ NOT NULL
updated_at   TIMESTAMPTZ NOT NULL

INDEX idx_cycles_user_started ON cycles(user_id, started_on DESC)
UNIQUE uq_cycles_user_started ON cycles(user_id, started_on)
```

### daily_logs
```sql
id               BIGSERIAL PRIMARY KEY
user_id          BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE
logged_on        DATE        NOT NULL
-- 증상 (0: 없음, 1: 약함, 2: 보통, 3: 심함)
cramps           SMALLINT    NOT NULL DEFAULT 0
headache         SMALLINT    NOT NULL DEFAULT 0
fatigue          SMALLINT    NOT NULL DEFAULT 0
bloating         SMALLINT    NOT NULL DEFAULT 0
-- 기분 (1~5)
mood             SMALLINT
-- 분비물 (none/dry/sticky/creamy/watery/egg_white/spotting)
discharge_type   VARCHAR(20)
-- 배란 지표
bbt              DECIMAL(4,2)    -- 기초체온 (예: 36.75)
lh_result        SMALLINT        -- 0:미측정 1:음성 2:양성(LH surge)
-- 자유 메모
notes            TEXT
created_at       TIMESTAMPTZ NOT NULL
updated_at       TIMESTAMPTZ NOT NULL

UNIQUE uq_daily_logs_user_date ON daily_logs(user_id, logged_on)
INDEX  idx_daily_logs_user_date ON daily_logs(user_id, logged_on DESC)
```

### predictions
```sql
id                       BIGSERIAL PRIMARY KEY
user_id                  BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE
-- 예측 결과
predicted_period_start   DATE        NOT NULL
predicted_ovulation_on   DATE        NOT NULL
fertile_start            DATE        NOT NULL   -- ovulation - 2
fertile_end              DATE        NOT NULL   -- ovulation + 1
-- 예측 근거
based_on_cycles_count    SMALLINT    NOT NULL   -- 사용된 주기 수 (최대 6)
avg_cycle_length         DECIMAL(5,2) NOT NULL
-- 배란 실측 보정
observed_ovulation_on    DATE                   -- BBT/LH 실측 시 기록
-- 메타
computed_at              TIMESTAMPTZ NOT NULL
cycle_id                 BIGINT      REFERENCES cycles(id) ON DELETE SET NULL

INDEX idx_predictions_user ON predictions(user_id, computed_at DESC)
```

### push_tokens
```sql
id          BIGSERIAL PRIMARY KEY
user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE
token       VARCHAR(512) NOT NULL
platform    VARCHAR(10)  NOT NULL DEFAULT 'ios'  -- ios / android
created_at  TIMESTAMPTZ  NOT NULL

UNIQUE uq_push_tokens_token ON push_tokens(token)
```

### ai_conversations
```sql
id         BIGSERIAL PRIMARY KEY
user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE
messages   JSONB       NOT NULL DEFAULT '[]'   -- [{role, content, ts}]
context_snapshot JSONB                          -- 전송 당시 주기 컨텍스트
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL

INDEX idx_ai_conv_user ON ai_conversations(user_id, created_at DESC)
```

---

## 관계도

```
users ──< cycles          (1:N)
users ──< daily_logs      (1:N, unique per date)
users ──< predictions     (1:N)
users ──< push_tokens     (1:N)
users ──< ai_conversations (1:N)
cycles ──○ predictions    (1:0..1)
```

---

## 예측 알고리즘 메모

1. 최근 6개 주기의 `length_days` 수집
2. 가중평균: 최신 주기에 높은 가중치 (6,5,4,3,2,1)
3. `predicted_period_start = 마지막 생리 시작일 + avg_cycle_length`
4. `predicted_ovulation_on = predicted_period_start - luteal_phase_length`
5. `fertile_start = predicted_ovulation_on - 2`
6. `fertile_end   = predicted_ovulation_on + 1`
7. 해당 주기에 `lh_result = 2` 또는 BBT 급등(전날 대비 +0.2°C) 존재하면 `observed_ovulation_on` 기록 → 다음 주기 예측 보정에 반영
