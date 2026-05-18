class PushNotificationJob < ApplicationJob
  queue_as :default

  def perform
    today = Date.current

    User.joins(:push_tokens, :predictions)
        .where(notifications_enabled: true)
        .includes(:push_tokens, :latest_prediction, :notification_pref)
        .distinct
        .find_each do |user|
      prediction = user.latest_prediction
      next unless prediction

      prefs = user.notification_pref

      send_period_reminders(user, prediction, today, prefs)
      send_ovulation_reminders(user, prediction, today, prefs)
      send_fertile_reminder(user, prediction, today, prefs)
    end
  end

  private

  def send_period_reminders(user, prediction, today, prefs)
    return if prefs && !prefs.period_reminder

    period_start = prediction.predicted_period_start
    return unless period_start

    days_until = (period_start - today).to_i
    case days_until
    when 3
      send_and_log(user, "luna-period-d3-#{today}", title: "생리 예정 D-3", body: "3일 후 생리가 예정되어 있어요.", scheduled_for: today)
    when 1
      send_and_log(user, "luna-period-d1-#{today}", title: "생리 예정 내일", body: "내일 생리가 예정되어 있어요.", scheduled_for: today)
    end
  end

  def send_ovulation_reminders(user, prediction, today, prefs)
    return if prefs && !prefs.ovulation_alert

    ovulation = prediction.predicted_ovulation_on
    return unless ovulation

    days_until = (ovulation - today).to_i
    case days_until
    when 2
      send_and_log(user, "luna-ovulation-d2-#{today}", title: "배란 예정 D-2", body: "2일 후 배란이 예정되어 있어요.", scheduled_for: today)
    when 0
      send_and_log(user, "luna-ovulation-d0-#{today}", title: "배란 예정일", body: "오늘이 배란 예정일이에요.", scheduled_for: today)
    end
  end

  def send_fertile_reminder(user, prediction, today, prefs)
    return if prefs && !prefs.fertile_start

    fertile_start = prediction.fertile_start
    return unless fertile_start
    return unless (fertile_start - today).to_i == 0

    send_and_log(user, "luna-fertile-#{today}", title: "가임기 시작", body: "오늘부터 가임기가 시작돼요.", scheduled_for: today)
  end

  def send_and_log(user, identifier, title:, body:, scheduled_for:)
    log = user.notification_logs.find_or_initialize_by(identifier: identifier)
    return if log.persisted?

    ExpoPushService.send_to_user(user, title: title, body: body)
    log.title = title
    log.body = body
    log.scheduled_for = scheduled_for
    log.save!
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotSaved => e
    Rails.logger.error("PushNotificationJob log error for user #{user.id}: #{e.message}")
  end
end
