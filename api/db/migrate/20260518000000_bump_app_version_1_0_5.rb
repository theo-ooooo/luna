class BumpAppVersion105 < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      UPDATE app_versions
      SET ios_latest_version = '1.0.5', android_latest_version = '1.0.5', updated_at = NOW()
    SQL
  end

  def down
    execute <<~SQL
      UPDATE app_versions
      SET ios_latest_version = '1.0.2', android_latest_version = '1.0.2', updated_at = NOW()
    SQL
  end
end
