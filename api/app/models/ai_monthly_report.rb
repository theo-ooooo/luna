class AiMonthlyReport < ApplicationRecord
  belongs_to :user

  validates :year, :month, presence: true
  validates :month, numericality: { in: 1..12 }

  def self.for(user, year, month)
    find_or_initialize_by(user: user, year: year, month: month)
  end
end
