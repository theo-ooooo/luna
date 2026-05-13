class AiMonthlyReport < ApplicationRecord
  belongs_to :user

  validates :year, :month, presence: true
  validates :year,  numericality: { in: 2020..2100 }
  validates :month, numericality: { in: 1..12 }

  scope :fresh, -> { where(stale: false) }
  scope :stale, -> { where(stale: true) }

  def self.for(user, year, month)
    find_or_initialize_by(user: user, year: year, month: month)
  end
end
