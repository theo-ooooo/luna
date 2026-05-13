class CreateAiMonthlyReports < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_monthly_reports do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :year
      t.integer :month
      t.text :summary
      t.jsonb :stats
      t.boolean :stale, null: false, default: true
      t.datetime :generated_at

      t.timestamps
    end
    add_index :ai_monthly_reports, [:user_id, :year, :month], unique: true
  end
end
