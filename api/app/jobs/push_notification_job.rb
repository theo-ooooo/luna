class PushNotificationJob < ApplicationJob
  queue_as :default

  def perform
    today = Date.current

    User.joins(:push_tokens, :predictions).distinct.find_each do |user|
      prediction = user.predictions.order(computed_at: :desc).first
      next unless prediction

      send_period_reminders(user, prediction, today)
      send_ovulation_reminders(user, prediction, today)
      send_fertile_reminder(user, prediction, today)
    end
  end

  private

  def send_period_reminders(user, prediction, today)
    period_start = prediction.predicted_period_start
    return unless period_start

    days_until = (period_start - today).to_i
    case days_until
    when 3
      ExpoPushService.send_to_user(user, title: "생리 예정 D-3", body: "3일 후 생리가 예정되어 있어요.")
    when 1
      ExpoPushService.send_to_user(user, title: "생리 예정 내일", body: "내일 생리가 예정되어 있어요.")
    end
  end

  def send_ovulation_reminders(user, prediction, today)
    ovulation = prediction.predicted_ovulation_on
    return unless ovulation

    days_until = (ovulation - today).to_i
    case days_until
    when 2
      ExpoPushService.send_to_user(user, title: "배란 예정 D-2", body: "2일 후 배란이 예정되어 있어요.")
    when 0
      ExpoPushService.send_to_user(user, title: "배란 예정일", body: "오늘이 배란 예정일이에요.")
    end
  end

  def send_fertile_reminder(user, prediction, today)
    fertile_start = prediction.fertile_start
    return unless fertile_start
    return unless (fertile_start - today).to_i == 0

    ExpoPushService.send_to_user(user, title: "가임기 시작", body: "오늘부터 가임기가 시작돼요.")
  end
end
