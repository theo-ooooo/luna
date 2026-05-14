class CreateAppVersions < ActiveRecord::Migration[8.1]
  def change
    create_table :app_versions do |t|
      t.string :latest_version, null: false, default: '1.0.0'
      t.string :min_version, null: false, default: '1.0.0'

      t.timestamps
    end

    AppVersion.create!(latest_version: '1.0.1', min_version: '1.0.0')
  end
end
