class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :cycles, dependent: :destroy
  has_many :daily_logs, dependent: :destroy
  has_many :predictions, dependent: :destroy
  has_one :latest_prediction, -> { order(computed_at: :desc) }, class_name: 'Prediction', dependent: nil
  has_many :push_tokens, dependent: :destroy
  has_many :ai_conversations, dependent: :destroy
  has_many :ai_monthly_reports, dependent: :destroy
  has_many :ai_daily_insights, dependent: :destroy
  has_many :notification_logs, dependent: :destroy
  has_many :oauth_identities, dependent: :destroy, inverse_of: :user

  # OAuth(Apple 등) 유저는 email/password 없이 생성될 수 있음
  # 신규 레코드는 Devise 기본값(email+password 필수)을 따르고, 컨트롤러에서 placeholder를 채워준다.
  # 이미 저장된 OAuth 유저는 oauth_identities 존재 시 불필요.
  def password_required?
    new_record? ? super : (oauth_identities.none? && super)
  end

  def email_required?
    new_record? ? super : (oauth_identities.none? && super)
  end

  validates :email, uniqueness: { case_sensitive: false, allow_blank: true },
                    format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true },
                    presence: true, unless: -> { !new_record? && oauth_identities.any? }
  validates :nickname, length: { maximum: 50 }, allow_blank: true
  validates :cycle_length_default, numericality: { in: 2..90 }
  validates :luteal_phase_length, numericality: { in: 5..20 }
  validates :period_length_default, numericality: { in: 1..10 }

  def avg_cycle_length_days
    lengths = cycles.recent(6).map(&:length_days).compact
    return cycle_length_default if lengths.empty?
    (lengths.sum.to_f / lengths.size).round
  end

  def avg_period_length_days
    completed = cycles.completed.order(started_on: :desc).limit(6)
    lengths = completed.map { |c| (c.ended_on - c.started_on).to_i + 1 }
    return period_length_default if lengths.empty?
    (lengths.sum.to_f / lengths.size).round
  end
end
