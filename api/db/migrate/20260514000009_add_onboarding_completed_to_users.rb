class AddOnboardingCompletedToUsers < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :onboarding_completed, :boolean, null: false, default: false,
               comment: "온보딩 완료 여부 (앱 재설치 후에도 온보딩 재진입 방지)"
    execute "UPDATE users SET onboarding_completed = TRUE WHERE nickname IS NOT NULL AND nickname != ''"
  end

  def down
    remove_column :users, :onboarding_completed
  end
end
