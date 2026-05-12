module Ai
  class ContextBuilder
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
        bbt: log.bbt,
        lh_result: log.lh_result
      }.compact
    end
  end
end
