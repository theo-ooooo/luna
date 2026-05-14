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

  end
end
