class FixAiDailyInsightsFkCascade < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :ai_daily_insights, :users
    add_foreign_key :ai_daily_insights, :users, on_delete: :cascade
  end
end
