class PushToken < ApplicationRecord
  belongs_to :user

  PLATFORMS = %w[ios android].freeze

  validates :token, presence: true, uniqueness: true
  validates :platform, inclusion: { in: PLATFORMS }
end
