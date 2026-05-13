module Api
  module V1
    class NotificationsController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/notifications
      # 현재 사용자의 알림 내역 반환 (예약 시각 기준 내림차순)
      def index
        logs = current_user.notification_logs.order(scheduled_for: :desc)
        render json: logs.map { |l|
          {
            id:            l.id,
            identifier:    l.identifier,
            title:         l.title,
            body:          l.body,
            scheduled_for: l.scheduled_for.iso8601,
          }
        }
      end

      # PUT /api/v1/notifications
      # 앱이 알림 예약 후 전체 목록을 서버에 동기화 (기존 항목 upsert)
      def replace
        entries = params.require(:entries)

        ActiveRecord::Base.transaction do
          entries.each do |entry|
            current_user.notification_logs.find_or_initialize_by(identifier: entry[:id]).tap do |log|
              log.title         = entry[:title]
              log.body          = entry[:body]
              log.scheduled_for = entry[:scheduled_for]
              log.save!
            end
          end

          # 이번 예약에 포함되지 않은 이전 항목 삭제
          ids = entries.map { |e| e[:id] }
          current_user.notification_logs.where.not(identifier: ids).destroy_all
        end

        render json: { ok: true }
      rescue ActionController::ParameterMissing => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      end
    end
  end
end
