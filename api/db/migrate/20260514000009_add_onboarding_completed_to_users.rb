class AddOnboardingCompletedToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :onboarding_completed, :boolean, null: false, default: false
    # 기존 닉네임 있는 유저는 온보딩 완료로 간주
    User.where.not(nickname: [nil, '']).update_all(onboarding_completed: true)
  end
end
