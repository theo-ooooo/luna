class CreateNotificationLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :notification_logs do |t|
      t.references :user, null: false, foreign_key: true, comment: "알림을 받은 사용자"
      t.string  :identifier,     null: false, comment: "알림 식별자 (luna-period-d3 등)"
      t.string  :title,          null: false, comment: "알림 제목"
      t.string  :body,           null: false, comment: "알림 본문"
      t.datetime :scheduled_for, null: false, comment: "알림 예약 시각"

      t.timestamps
    end

    add_index :notification_logs, [:user_id, :identifier], unique: true
    add_index :notification_logs, [:user_id, :scheduled_for]
  end
end
