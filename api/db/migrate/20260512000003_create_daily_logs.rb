class CreateDailyLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :daily_logs do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.date :logged_on, null: false

      # 증상 (0~3)
      t.integer :cramps, null: false, default: 0
      t.integer :headache, null: false, default: 0
      t.integer :fatigue, null: false, default: 0
      t.integer :bloating, null: false, default: 0

      # 기분 (1~5)
      t.integer :mood

      # 분비물
      t.string :discharge_type, limit: 20

      # 배란 지표
      t.decimal :bbt, precision: 4, scale: 2
      t.integer :lh_result

      t.text :notes

      t.timestamps null: false
    end

    add_index :daily_logs, [:user_id, :logged_on], unique: true, name: "uq_daily_logs_user_date"
    add_index :daily_logs, [:user_id, :logged_on], order: { logged_on: :desc }, name: "idx_daily_logs_user_date"
  end
end
