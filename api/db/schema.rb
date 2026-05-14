# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_14_000009) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "ai_conversations", force: :cascade do |t|
    t.jsonb "context_snapshot", comment: "대화 시점의 사용자 건강 컨텍스트 스냅샷"
    t.datetime "created_at", null: false
    t.jsonb "messages", default: [], null: false, comment: "대화 메시지 배열 [{role, content, ts}]"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false, comment: "소유 유저"
    t.index ["user_id", "created_at"], name: "idx_ai_conv_user", order: { created_at: :desc }
    t.index ["user_id"], name: "index_ai_conversations_on_user_id"
  end

  create_table "ai_daily_insights", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.datetime "generated_at"
    t.boolean "stale", default: true, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "date"], name: "index_ai_daily_insights_on_user_id_and_date", unique: true
    t.index ["user_id"], name: "index_ai_daily_insights_on_user_id"
  end

  create_table "ai_monthly_reports", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "generated_at", comment: "리포트 AI 생성 시각"
    t.integer "month", comment: "리포트 월 (1~12)"
    t.boolean "stale", default: true, null: false, comment: "캐시 무효화 여부 (true이면 다음 조회 시 AI 재생성)"
    t.jsonb "stats", comment: "월간 통계 데이터 (JSONB)"
    t.text "summary", comment: "AI 생성 월간 요약 텍스트"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false, comment: "소유 유저"
    t.integer "year", comment: "리포트 연도"
    t.index ["user_id", "year", "month"], name: "index_ai_monthly_reports_on_user_id_and_year_and_month", unique: true
    t.index ["user_id"], name: "index_ai_monthly_reports_on_user_id"
  end

  create_table "oauth_identities", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "provider", limit: 50, null: false
    t.string "uid", limit: 255, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_oauth_identities_on_user_id"
    t.index ["provider", "uid"], name: "uq_oauth_identities_provider_uid", unique: true
  end

  create_table "cycles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "ended_on", comment: "생리 종료일 (null이면 진행 중)"
    t.integer "flow_level", comment: "출혈량 (1=가벼움, 2=보통, 3=많음)"
    t.date "started_on", null: false, comment: "생리 시작일"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false, comment: "소유 유저"
    t.index ["user_id", "started_on"], name: "idx_cycles_user_started", order: { started_on: :desc }
    t.index ["user_id", "started_on"], name: "uq_cycles_user_started", unique: true
    t.index ["user_id"], name: "index_cycles_on_user_id"
  end

  create_table "daily_logs", force: :cascade do |t|
    t.boolean "acne", default: false, null: false, comment: "여드름 여부"
    t.boolean "backache", default: false, null: false, comment: "요통 여부"
    t.decimal "bbt", precision: 4, scale: 2, comment: "기초체온 (℃, 소수점 2자리, null=미기록)"
    t.integer "bloating", default: 0, null: false, comment: "부종 여부 (0=없음, 1=있음)"
    t.boolean "breast_pain", default: false, null: false, comment: "유방통 여부"
    t.integer "cramps", default: 0, null: false, comment: "복통 강도 (0=없음, 1=약함, 2=강함)"
    t.datetime "created_at", null: false
    t.string "discharge_type", limit: 20, comment: "분비물 유형 (none/spotting/creamy/watery/egg_white, null=미기록)"
    t.boolean "dizziness", default: false, null: false, comment: "어지러움 여부"
    t.integer "fatigue", default: 0, null: false, comment: "피로 여부 (0=없음, 1=있음)"
    t.integer "flow_level", comment: "출혈량 (0=없음, 1=점출혈, 2=적음, 3=보통, 4=많음, null=미기록)"
    t.integer "headache", default: 0, null: false, comment: "두통 여부 (0=없음, 1=있음)"
    t.boolean "increased_appetite", default: false, null: false, comment: "식욕증가 여부"
    t.integer "lh_result", comment: "LH 배란 테스트 결과 (0=음성, 1=양성, null=미기록)"
    t.date "logged_on", null: false, comment: "기록 날짜"
    t.integer "mood", comment: "기분 점수 (1=불안 ~ 5=좋음, null=미기록)"
    t.boolean "nausea", default: false, null: false, comment: "메스꺼움 여부"
    t.text "notes", comment: "자유 메모"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false, comment: "소유 유저"
    t.index ["user_id", "logged_on"], name: "idx_daily_logs_user_date", order: { logged_on: :desc }
    t.index ["user_id", "logged_on"], name: "uq_daily_logs_user_date", unique: true
    t.index ["user_id"], name: "index_daily_logs_on_user_id"
  end

  create_table "notification_logs", force: :cascade do |t|
    t.string "body", null: false, comment: "알림 본문"
    t.datetime "created_at", null: false
    t.string "identifier", null: false, comment: "알림 식별자 (luna-period-d3 등)"
    t.datetime "scheduled_for", null: false, comment: "알림 예약 시각"
    t.string "title", null: false, comment: "알림 제목"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false, comment: "알림을 받은 사용자"
    t.index ["user_id", "identifier"], name: "index_notification_logs_on_user_id_and_identifier", unique: true
    t.index ["user_id", "scheduled_for"], name: "index_notification_logs_on_user_id_and_scheduled_for"
    t.index ["user_id"], name: "index_notification_logs_on_user_id"
  end

  create_table "predictions", force: :cascade do |t|
    t.decimal "avg_cycle_length", precision: 5, scale: 2, null: false, comment: "예측에 사용된 평균 주기 길이(일)"
    t.integer "based_on_cycles_count", null: false, comment: "평균 계산에 사용된 주기 수"
    t.datetime "computed_at", null: false, comment: "예측 계산 시각"
    t.bigint "cycle_id", comment: "예측 기준 주기 (주기 삭제 시 null)"
    t.date "fertile_end", null: false, comment: "임신 가능 기간 종료일"
    t.date "fertile_start", null: false, comment: "임신 가능 기간 시작일"
    t.date "observed_ovulation_on", comment: "실측 배란일 (BBT 급등 또는 LH surge 기반, null=미확인)"
    t.date "predicted_ovulation_on", null: false, comment: "예측 배란일 (다음 생리일 - 황체기 길이)"
    t.date "predicted_period_start", null: false, comment: "예측 다음 생리 시작일"
    t.bigint "user_id", null: false, comment: "소유 유저"
    t.index ["cycle_id"], name: "index_predictions_on_cycle_id"
    t.index ["user_id", "computed_at"], name: "idx_predictions_user", order: { computed_at: :desc }
    t.index ["user_id"], name: "index_predictions_on_user_id"
  end

  create_table "push_tokens", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "platform", limit: 10, default: "ios", null: false, comment: "플랫폼 (ios/android)"
    t.string "token", limit: 512, null: false, comment: "디바이스 푸시 토큰 (최대 512자)"
    t.datetime "updated_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.bigint "user_id", null: false, comment: "소유 유저"
    t.index ["token"], name: "uq_push_tokens_token", unique: true
    t.index ["user_id"], name: "index_push_tokens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "cycle_length_default", default: 28, null: false, comment: "기본 주기 길이(일), 주기 데이터 부족 시 예측 초기값으로 사용"
    t.string "email", null: false, comment: "로그인 이메일"
    t.string "encrypted_password", null: false, comment: "암호화된 비밀번호 (Devise)"
    t.string "jti", null: false, comment: "JWT 토큰 고유 식별자 (devise-jwt 블랙리스트용)"
    t.integer "luteal_phase_length", default: 14, null: false, comment: "황체기 길이(일), 배란일 역산에 사용 (기본 14일)"
    t.string "nickname", limit: 50, comment: "앱 내 표시 이름 (최대 50자)"
    t.boolean "notifications_enabled", default: true, null: false, comment: "푸시 알림 수신 여부"
    t.boolean "onboarding_completed", default: false, null: false, comment: "온보딩 완료 여부 (앱 재설치 후에도 온보딩 재진입 방지)"
    t.datetime "password_reset_sent_at"
    t.string "password_reset_token"
    t.integer "period_length_default", default: 5, null: false, comment: "평균 생리 기간(일), 종료일 추정에 사용 (기본 5일)"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["password_reset_token"], name: "index_users_on_password_reset_token"
  end

  add_foreign_key "oauth_identities", "users", on_delete: :cascade
  add_foreign_key "ai_conversations", "users", on_delete: :cascade
  add_foreign_key "ai_daily_insights", "users", on_delete: :cascade
  add_foreign_key "ai_monthly_reports", "users", on_delete: :cascade
  add_foreign_key "cycles", "users", on_delete: :cascade
  add_foreign_key "daily_logs", "users", on_delete: :cascade
  add_foreign_key "notification_logs", "users", on_delete: :cascade
  add_foreign_key "predictions", "cycles", on_delete: :nullify
  add_foreign_key "predictions", "users", on_delete: :cascade
  add_foreign_key "push_tokens", "users", on_delete: :cascade
end
