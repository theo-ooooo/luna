class RemoveAppleUidFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_index :users, :apple_uid, if_exists: true
    remove_column :users, :apple_uid, :string
  end
end
