class FixAiMonthlyReportsForeignKeyCascade < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :ai_monthly_reports, :users
    add_foreign_key :ai_monthly_reports, :users, on_delete: :cascade
  end
end
