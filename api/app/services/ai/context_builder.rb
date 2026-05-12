module Ai
  class ContextBuilder
    # Claude API 전송 컨텍스트 구성.
    # 규칙: 사용자 식별 정보(id/email/nickname) 미포함.
    # bbt는 범주화(low/normal/elevated/high)로 변환, lh_result는 코드값 그대로.
    def initialize(user)
      @user = user
    end

    def build
      prediction = @user.predictions.order(computed_at: :desc).first
      recent_logs = @user.daily_logs.for_range(3.days.ago.to_date, Date.current).order(:logged_on)

      context = {
        today: Date.current.iso8601,
        avg_cycle_length: prediction&.avg_cycle_length,
        luteal_phase_length: @user.luteal_phase_length,
        recent_logs: recent_logs.map { |l| log_summary(l) }
      }

      if prediction
        context.merge!(
          cycle_day: prediction.cycle_day,
          phase: prediction.current_phase,
          predicted_ovulation: prediction.predicted_ovulation_on,
          observed_ovulation: prediction.observed_ovulation_on,
          next_period_start: prediction.predicted_period_start,
          fertile_start: prediction.fertile_start,
          fertile_end: prediction.fertile_end
        )
      end

      context
    end

    private

    def log_summary(log)
      {
        date: log.logged_on,
        symptoms: {
          cramps: log.cramps,
          headache: log.headache,
          fatigue: log.fatigue,
          bloating: log.bloating
        }.reject { |_, v| v.zero? },
        mood: log.mood,
        bbt_category: categorize_bbt(log.bbt),
        lh_surge: log.lh_result == 2 ? true : (log.lh_result == 1 ? false : nil)
      }.compact
    end

    # 원시 체온값 대신 단계값으로 전송 — 개인 생체정보 최소화
    def categorize_bbt(bbt)
      return nil if bbt.nil?
      case bbt.to_f
      when ..36.2            then "low"
      when 36.2...36.5       then "normal_low"
      when 36.5...36.8       then "normal"
      when 36.8...37.1       then "elevated"
      else                        "high"
      end
    end
  end
end
