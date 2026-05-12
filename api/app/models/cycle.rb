class Cycle < ApplicationRecord
  belongs_to :user
  has_one :prediction

  validates :started_on, presence: true
  validates :started_on, uniqueness: { scope: :user_id }
  validates :flow_level, inclusion: { in: 1..3 }, allow_nil: true
  validate :ended_on_after_started_on
  validate :no_future_dates

  def length_days
    return nil unless ended_on
    (ended_on - started_on).to_i + 1
  end

  scope :completed, -> { where.not(ended_on: nil) }
  scope :recent, ->(n) { completed.order(started_on: :desc).limit(n) }

  private

  def ended_on_after_started_on
    return unless ended_on && started_on
    errors.add(:ended_on, :invalid) if ended_on < started_on
  end

  def no_future_dates
    errors.add(:started_on, :invalid) if started_on && started_on > Date.current
    errors.add(:ended_on, :invalid) if ended_on && ended_on > Date.current
  end
end
