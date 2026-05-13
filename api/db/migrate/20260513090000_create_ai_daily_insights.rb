class CreateAiDailyInsights < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_daily_insights do |t|
      t.references :user, null: false, foreign_key: true
      t.date :date, null: false
      t.text :content
      t.boolean :stale, null: false, default: true
      t.datetime :generated_at
      t.timestamps
    end
    add_index :ai_daily_insights, [:user_id, :date], unique: true
  end
end
