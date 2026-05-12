class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :cycles, dependent: :destroy
  has_many :daily_logs, dependent: :destroy
  has_many :predictions, dependent: :destroy
  has_many :push_tokens, dependent: :destroy
  has_many :ai_conversations, dependent: :destroy

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :nickname, length: { maximum: 50 }, allow_blank: true
  validates :cycle_length_default, numericality: { in: 2..90 }
  validates :luteal_phase_length, numericality: { in: 5..20 }

  def avg_cycle_length_days
    recent = cycles.recent(6)
    return cycle_length_default if recent.empty?
    recent.average(:length_days)&.to_i || cycle_length_default
  end
end
