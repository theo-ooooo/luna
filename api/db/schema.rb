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

ActiveRecord::Schema[8.1].define(version: 2026_05_12_000006) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "ai_conversations", force: :cascade do |t|
    t.jsonb "context_snapshot"
    t.datetime "created_at", null: false
    t.jsonb "messages", default: [], null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "created_at"], name: "idx_ai_conv_user", order: { created_at: :desc }
    t.index ["user_id"], name: "index_ai_conversations_on_user_id"
  end

  create_table "cycles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "ended_on"
    t.integer "flow_level"
    t.date "started_on", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "started_on"], name: "idx_cycles_user_started", order: { started_on: :desc }
    t.index ["user_id", "started_on"], name: "uq_cycles_user_started", unique: true
    t.index ["user_id"], name: "index_cycles_on_user_id"
  end

  create_table "daily_logs", force: :cascade do |t|
    t.decimal "bbt", precision: 4, scale: 2
    t.integer "bloating", default: 0, null: false
    t.integer "cramps", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "discharge_type", limit: 20
    t.integer "fatigue", default: 0, null: false
    t.integer "headache", default: 0, null: false
    t.integer "lh_result"
    t.date "logged_on", null: false
    t.integer "mood"
    t.text "notes"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "logged_on"], name: "idx_daily_logs_user_date", order: { logged_on: :desc }
    t.index ["user_id", "logged_on"], name: "uq_daily_logs_user_date", unique: true
    t.index ["user_id"], name: "index_daily_logs_on_user_id"
  end

  create_table "predictions", force: :cascade do |t|
    t.decimal "avg_cycle_length", precision: 5, scale: 2, null: false
    t.integer "based_on_cycles_count", null: false
    t.datetime "computed_at", null: false
    t.bigint "cycle_id"
    t.date "fertile_end", null: false
    t.date "fertile_start", null: false
    t.date "observed_ovulation_on"
    t.date "predicted_ovulation_on", null: false
    t.date "predicted_period_start", null: false
    t.bigint "user_id", null: false
    t.index ["cycle_id"], name: "index_predictions_on_cycle_id"
    t.index ["user_id", "computed_at"], name: "idx_predictions_user", order: { computed_at: :desc }
    t.index ["user_id"], name: "index_predictions_on_user_id"
  end

  create_table "push_tokens", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "platform", limit: 10, default: "ios", null: false
    t.string "token", limit: 512, null: false
    t.bigint "user_id", null: false
    t.index ["token"], name: "uq_push_tokens_token", unique: true
    t.index ["user_id"], name: "index_push_tokens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "cycle_length_default", default: 28, null: false
    t.string "email", null: false
    t.string "encrypted_password", null: false
    t.string "jti", null: false
    t.integer "luteal_phase_length", default: 14, null: false
    t.string "nickname", limit: 50
    t.boolean "notifications_enabled", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
  end

  add_foreign_key "ai_conversations", "users", on_delete: :cascade
  add_foreign_key "cycles", "users", on_delete: :cascade
  add_foreign_key "daily_logs", "users", on_delete: :cascade
  add_foreign_key "predictions", "cycles", on_delete: :nullify
  add_foreign_key "predictions", "users", on_delete: :cascade
  add_foreign_key "push_tokens", "users", on_delete: :cascade
end
