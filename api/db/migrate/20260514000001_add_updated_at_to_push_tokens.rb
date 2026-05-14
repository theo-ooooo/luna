class AddUpdatedAtToPushTokens < ActiveRecord::Migration[8.1]
  def change
    add_column :push_tokens, :updated_at, :datetime, null: false, default: -> { "CURRENT_TIMESTAMP" }
  end
end
