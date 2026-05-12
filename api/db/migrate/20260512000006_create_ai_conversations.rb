class CreateAiConversations < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_conversations do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.jsonb :messages, null: false, default: []
      t.jsonb :context_snapshot

      t.timestamps null: false
    end

    add_index :ai_conversations, [:user_id, :created_at], order: { created_at: :desc }, name: "idx_ai_conv_user"
  end
end
