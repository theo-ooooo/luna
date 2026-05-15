class PredictionService
  WEIGHTS = [6, 5, 4, 3, 2, 1].freeze
  MIN_CYCLES_FOR_PREDICTION = 3  # 3개 미만이면 기본값 28일 사용 (CLAUDE.md 명세)
  MAX_CYCLES_USED = 6

  def initialize(user)
    @user = user
  end

  def compute!
    # 최근 주기를 한 번만 조회 — completed + ongoing 포함
    # 인터벌 N개를 구하려면 N+1개의 사이클 시작일이 필요
    all_recent = @user.cycles.order(started_on: :desc).limit(MAX_CYCLES_USED + 1).to_a
    latest_cycle = all_recent.first

    avg_length, cycles_count = if all_recent.size >= MIN_CYCLES_FOR_PREDICTION
      intervals = all_recent.each_cons(2).map { |newer, older| (newer.started_on - older.started_on).to_i }
      weighted_average(intervals.first(MAX_CYCLES_USED))
    else
      [@user.cycle_length_default.to_f, 0]
    end

    last_start = latest_cycle&.started_on || Date.current

    predicted_start = last_start + avg_length.round.days
    ovulation = predicted_start - @user.luteal_phase_length.days

    observed = observed_ovulation_for_cycle(latest_cycle)

    Prediction.create!(
      user: @user,
      cycle: latest_cycle,
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

  def weighted_average(intervals)
    weights = WEIGHTS.first(intervals.size)
    total_weight = weights.sum.to_f
    weighted_sum = intervals.each_with_index.sum { |len, i| len * weights[i] }
    [weighted_sum / total_weight, intervals.size]
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
