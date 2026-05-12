class CreatePushTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :push_tokens do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :token, limit: 512, null: false
      t.string :platform, limit: 10, null: false, default: "ios"

      t.datetime :created_at, null: false
    end

    add_index :push_tokens, :token, unique: true, name: "uq_push_tokens_token"
  end
end
