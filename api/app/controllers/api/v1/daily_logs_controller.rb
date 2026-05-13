module Api
  module V1
    class DailyLogsController < ApplicationController
      wrap_parameters false
      before_action :set_log, only: [:update, :destroy]

      def index
        from_raw = parse_date(params[:from])
        to_raw   = parse_date(params[:to])

        if from_raw == :invalid || to_raw == :invalid
          return failure("VALIDATION_ERROR", "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)", status: :bad_request)
        end

        from = from_raw || 30.days.ago.to_date
        to   = to_raw   || Date.current

        if (to - from).to_i > 92
          return failure("VALIDATION_ERROR", "날짜 범위는 최대 92일입니다.", status: :bad_request)
        end

        logs = current_user.daily_logs.for_range(from, to)
        success(logs.map { |l| log_json(l) })
      end

      def create
        date = log_params[:logged_on].presence || Date.current.to_s
        log  = current_user.daily_logs.find_or_initialize_by(logged_on: date)
        log.assign_attributes(log_params.except(:logged_on))
        log.save!
        CycleAutoService.new(current_user).call(log)
        success(log_json(log), status: log.previously_new_record? ? :created : :ok)
      end

      def update
        @log.update!(log_params.except(:logged_on))
        CycleAutoService.new(current_user).call(@log)
        success(log_json(@log))
      end

      def destroy
        @log.destroy!
        success(nil)
      end

      def bbt_history
        latest_cycle = current_user.cycles.order(started_on: :desc).first
        from = latest_cycle&.started_on || 30.days.ago.to_date

        logs = current_user.daily_logs
          .where(logged_on: from..Date.current)
          .where.not(bbt: nil)
          .order(:logged_on)
          .select(:logged_on, :bbt)

        prediction = latest_cycle&.prediction || current_user.predictions.order(computed_at: :desc).first

        success({
          data: logs.map { |l| { date: l.logged_on, bbt: l.bbt.to_f } },
          cycle_start: from,
          ovulation_on: prediction&.observed_ovulation_on || prediction&.predicted_ovulation_on
        })
      end

      def symptom_heatmap
        from = 11.weeks.ago.beginning_of_week(:monday).to_date
        logs = current_user.daily_logs
          .where(logged_on: from..Date.current)
          .order(:logged_on)
          .select(:logged_on, :headache, :cramps, :bloating, :fatigue)

        symptom_cols  = %i[headache cramps bloating fatigue]
        symptom_names = %w[두통 복통 부종 피로]
        grid = Array.new(4) { Array.new(12, 0) }

        logs.each do |log|
          week_idx = ((log.logged_on - from) / 7).to_i
          next unless week_idx.between?(0, 11)
          symptom_cols.each_with_index do |col, s_idx|
            grid[s_idx][week_idx] = [grid[s_idx][week_idx] + (log.send(col).to_i > 0 ? 1 : 0), 3].min
          end
        end

        success({ symptoms: symptom_names, weeks: 12, grid: grid })
      end

      private

      def parse_date(str)
        return nil unless str.present?
        Date.parse(str)
      rescue ArgumentError
        :invalid
      end

      def set_log
        @log = current_user.daily_logs.find(params[:id])
      end

      def log_params
        params.permit(:logged_on, :cramps, :headache, :fatigue, :bloating,
                      :mood, :discharge_type, :bbt, :lh_result, :notes, :flow_level)
      end

      def log_json(log)
        log.slice(:id, :logged_on, :cramps, :headache, :fatigue, :bloating,
                  :mood, :discharge_type, :bbt, :lh_result, :notes, :flow_level, :created_at)
      end
    end
  end
end
