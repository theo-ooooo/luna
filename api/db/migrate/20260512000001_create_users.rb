class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :encrypted_password, null: false
      t.string :nickname, limit: 50
      t.integer :cycle_length_default, null: false, default: 28
      t.integer :luteal_phase_length, null: false, default: 14
      t.boolean :notifications_enabled, null: false, default: true

      # devise-jwt: 토큰 무효화용 jti
      t.string :jti, null: false

      t.timestamps null: false
    end

    add_index :users, :email, unique: true
    add_index :users, :jti, unique: true
  end
end
