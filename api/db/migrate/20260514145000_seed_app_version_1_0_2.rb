class SeedAppVersion102 < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      INSERT INTO app_versions (
        ios_latest_version, ios_min_version, ios_store_url,
        android_latest_version, android_min_version, android_store_url,
        created_at, updated_at
      ) VALUES (
        '1.0.2', '1.0.2', 'https://apps.apple.com/app/id6769269495',
        '1.0.2', '1.0.2', NULL,
        NOW(), NOW()
      )
    SQL
  end

  def down
    execute "DELETE FROM app_versions WHERE ios_latest_version = '1.0.2' AND ios_min_version = '1.0.2'"
  end
end
