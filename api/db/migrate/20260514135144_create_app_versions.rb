class CreateAppVersions < ActiveRecord::Migration[8.1]
  def change
    create_table :app_versions do |t|
      t.string :ios_latest_version, null: false
      t.string :ios_min_version, null: false
      t.string :ios_store_url
      t.string :android_latest_version, null: false
      t.string :android_min_version, null: false
      t.string :android_store_url

      t.timestamps
    end

    execute <<~SQL
      INSERT INTO app_versions (
        ios_latest_version, ios_min_version, ios_store_url,
        android_latest_version, android_min_version, android_store_url,
        created_at, updated_at
      ) VALUES (
        '1.0.1', '1.0.0', 'https://apps.apple.com/app/id6769269495',
        '1.0.1', '1.0.0', NULL,
        NOW(), NOW()
      )
    SQL
  end
end
