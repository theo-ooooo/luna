class CreateNotificationPrefs < ActiveRecord::Migration[8.1]
  def change
    create_table :notification_prefs do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: { unique: true }
      t.boolean :period_reminder,  null: false, default: true
      t.boolean :ovulation_alert,  null: false, default: true
      t.boolean :fertile_start,    null: false, default: true
      t.boolean :log_nudge,        null: false, default: true
      t.boolean :daily_reminder,   null: false, default: false
      t.boolean :monthly_report,   null: false, default: true
      t.timestamps
    end
  end
end
