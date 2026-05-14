class Prediction < ApplicationRecord
  belongs_to :user
  belongs_to :cycle, optional: true

  PHASES = %w[menstrual follicular ovulation luteal].freeze

  def current_phase
    return "unknown" if predicted_period_start.nil?

    today = Date.current
    if (today - last_period_start).to_i + 1 <= user.period_length_default
      "menstrual"
    elsif today < fertile_start
      "follicular"
    elsif today <= fertile_end
      "ovulation"
    else
      "luteal"
    end
  end

  def cycle_day
    (Date.current - last_period_start).to_i + 1
  end

  private

  def last_period_start
    @last_period_start ||= predicted_period_start - user.avg_cycle_length_days.days
  end
end
