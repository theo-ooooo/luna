class AddAppleUidToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :apple_uid, :string, comment: "Apple Sign In 고유 식별자 (sub)"
    add_index  :users, :apple_uid, unique: true, name: "index_users_on_apple_uid"
  end
end
