class AiDailyInsight < ApplicationRecord
  belongs_to :user

  validates :date, presence: true
  validates :user_id, uniqueness: { scope: :date }

  def self.for(user, date)
    find_or_initialize_by(user: user, date: date)
  end
end
