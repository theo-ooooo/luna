class NotificationPref < ApplicationRecord
  belongs_to :user

  KEYS = %i[period_reminder ovulation_alert fertile_start log_nudge daily_reminder monthly_report].freeze
end
