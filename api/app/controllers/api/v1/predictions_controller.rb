module Api
  module V1
    class PredictionsController < ApplicationController
      def current
        prediction = current_user.predictions.order(computed_at: :desc).first

        if prediction.nil?
          return success(nil)
        end

        success(prediction_json(prediction))
      end

      def history
        predictions = current_user.predictions.order(computed_at: :desc).limit(12)
        success(predictions.map { |p| history_json(p) })
      end

      private

      def prediction_json(p)
        {
          id: p.id,
          predicted_period_start: p.predicted_period_start,
          predicted_ovulation_on: p.predicted_ovulation_on,
          fertile_start: p.fertile_start,
          fertile_end: p.fertile_end,
          based_on_cycles_count: p.based_on_cycles_count,
          avg_cycle_length: p.avg_cycle_length,
          observed_ovulation_on: p.observed_ovulation_on,
          computed_at: p.computed_at,
          current_phase: p.current_phase,
          cycle_day: p.cycle_day
        }
      end

      def history_json(p)
        p.slice(:id, :predicted_period_start, :avg_cycle_length, :based_on_cycles_count, :computed_at)
      end
    end
  end
end
