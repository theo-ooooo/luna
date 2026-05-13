class DailyLog < ApplicationRecord
  DISCHARGE_TYPES = %w[none dry sticky creamy watery egg_white spotting].freeze

  belongs_to :user

  validates :logged_on, presence: true
  validates :logged_on, uniqueness: { scope: :user_id }
  validates :logged_on, comparison: { less_than_or_equal_to: -> { Date.current } }
  validates :cramps, :headache, :fatigue, :bloating, numericality: { in: 0..3 }
  validates :mood, numericality: { in: 1..5 }, allow_nil: true
  validates :discharge_type, inclusion: { in: DISCHARGE_TYPES }, allow_nil: true
  validates :bbt, numericality: { greater_than_or_equal_to: 35.0, less_than_or_equal_to: 42.0 }, allow_nil: true
  validates :lh_result, numericality: { in: 0..2 }, allow_nil: true
  validates :notes, length: { maximum: 1000 }, allow_nil: true

  scope :for_range, ->(from, to) { where(logged_on: from..to).order(logged_on: :desc) }

  after_save :mark_monthly_report_stale
  after_save_commit :invalidate_daily_insight, if: -> { saved_changes.except("updated_at", "created_at").any? }

  private

  def mark_monthly_report_stale
    AiMonthlyReport.where(user: user, year: logged_on.year, month: logged_on.month)
                   .update_all(stale: true)
  end

  def invalidate_daily_insight
    user.ai_daily_insights.where(date: logged_on).update_all(stale: true)
  end
end
