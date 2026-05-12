class PredictionService
  WEIGHTS = [6, 5, 4, 3, 2, 1].freeze
  MIN_CYCLES_FOR_PREDICTION = 1
  MAX_CYCLES_USED = 6

  def initialize(user)
    @user = user
  end

  def compute!
    completed_cycles = @user.cycles.recent(MAX_CYCLES_USED).to_a
    latest_cycle = @user.cycles.order(started_on: :desc).first

    avg_length, cycles_count = if completed_cycles.size >= MIN_CYCLES_FOR_PREDICTION
      weighted_average(completed_cycles)
    else
      [@user.cycle_length_default.to_f, 0]
    end

    last_cycle = latest_cycle
    last_start = last_cycle&.started_on || Date.current

    predicted_start = last_start + avg_length.round.days
    ovulation = predicted_start - @user.luteal_phase_length.days

    observed = observed_ovulation_for_cycle(last_cycle)

    Prediction.create!(
      user: @user,
      cycle: last_cycle,
      predicted_period_start: predicted_start,
      predicted_ovulation_on: ovulation,
      fertile_start: ovulation - 2.days,
      fertile_end: ovulation + 1.day,
      based_on_cycles_count: cycles_count,
      avg_cycle_length: avg_length.round(2),
      observed_ovulation_on: observed,
      computed_at: Time.current
    )
  end

  private

  def weighted_average(cycles)
    weights = WEIGHTS.first(cycles.size)
    total_weight = weights.sum.to_f
    weighted_sum = cycles.each_with_index.sum do |cycle, i|
      cycle.length_days * weights[i]
    end
    avg = weighted_sum / total_weight
    [avg, cycles.size]
  end

  # BBT 급등(전날 대비 +0.2°C) 또는 LH surge(lh_result=2)로 실측 배란일 결정
  def observed_ovulation_for_cycle(cycle)
    return nil unless cycle

    range_start = cycle.started_on
    range_end = cycle.ended_on || Date.current

    logs = @user.daily_logs.for_range(range_start, range_end).reorder(:logged_on).to_a

    lh_day = logs.find { |l| l.lh_result == 2 }
    return lh_day.logged_on if lh_day

    logs.each_cons(2) do |prev, curr|
      next unless prev.bbt && curr.bbt
      return curr.logged_on if curr.bbt - prev.bbt >= 0.2
    end

    nil
  end
end
