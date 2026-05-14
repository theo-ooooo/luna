class CreateAppVersions < ActiveRecord::Migration[8.1]
  def change
    create_table :app_versions do |t|
      t.string :latest_version, null: false, default: '1.0.0'
      t.string :min_version, null: false, default: '1.0.0'

      t.timestamps
    end

    execute "INSERT INTO app_versions (latest_version, min_version, created_at, updated_at) VALUES ('1.0.1', '1.0.0', NOW(), NOW())"
  end
end
