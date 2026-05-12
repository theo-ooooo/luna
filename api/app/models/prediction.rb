class Prediction < ApplicationRecord
  belongs_to :user
  belongs_to :cycle, optional: true

  PHASES = %w[menstrual follicular ovulation luteal].freeze

  def current_phase
    today = Date.current
    last_period = predicted_period_start - user.avg_cycle_length_days.days

    day_in_cycle = (today - last_period).to_i + 1
    menstrual_end = 5

    if day_in_cycle <= menstrual_end
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
    last_period = predicted_period_start - user.avg_cycle_length_days.days
    (Date.current - last_period).to_i + 1
  end
end
