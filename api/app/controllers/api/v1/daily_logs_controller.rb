module Api
  module V1
    class DailyLogsController < ApplicationController
      before_action :set_log, only: [:update, :destroy]

      def index
        from = parse_date(params[:from]) || 30.days.ago.to_date
        to   = parse_date(params[:to])   || Date.current

        if from.nil? || to.nil?
          return failure("VALIDATION_ERROR", "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)", status: :bad_request)
        end

        if (to - from).to_i > 92
          return failure("VALIDATION_ERROR", "날짜 범위는 최대 92일입니다.", status: :bad_request)
        end

        logs = current_user.daily_logs.for_range(from, to)
        success(logs.map { |l| log_json(l) })
      end

      def create
        log = current_user.daily_logs.create!(log_params)
        success(log_json(log), status: :created)
      end

      def update
        @log.update!(log_params.except(:logged_on))
        success(log_json(@log))
      end

      def destroy
        @log.destroy!
        success(nil)
      end

      private

      def parse_date(str)
        str.present? ? Date.parse(str) : nil
      rescue ArgumentError
        nil
      end

      def set_log
        @log = current_user.daily_logs.find(params[:id])
      end

      def log_params
        params.permit(:logged_on, :cramps, :headache, :fatigue, :bloating,
                      :mood, :discharge_type, :bbt, :lh_result, :notes)
      end

      def log_json(log)
        log.slice(:id, :logged_on, :cramps, :headache, :fatigue, :bloating,
                  :mood, :discharge_type, :bbt, :lh_result, :notes, :created_at)
      end
    end
  end
end
