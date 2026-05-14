class CreateOauthIdentities < ActiveRecord::Migration[8.1]
  def change
    create_table :oauth_identities do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :provider, null: false, limit: 50
      t.string :uid, null: false, limit: 255
      t.timestamps
    end
    add_index :oauth_identities, [:provider, :uid], unique: true, name: "uq_oauth_identities_provider_uid"
  end
end
