class FixNotificationLogsFkCascade < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :notification_logs, :users
    add_foreign_key :notification_logs, :users, on_delete: :cascade
  end
end
