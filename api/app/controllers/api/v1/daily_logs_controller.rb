module Api
  module V1
    class DailyLogsController < ApplicationController
      before_action :set_log, only: [:update, :destroy]

      def index
        from = params[:from] ? Date.parse(params[:from]) : 30.days.ago.to_date
        to   = params[:to]   ? Date.parse(params[:to])   : Date.current

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
