module Api
  module V1
    class NotificationsController < ApplicationController
      def index
        logs = current_user.notification_logs.order(scheduled_for: :desc)
        success(logs.map { |l|
          { id: l.id, identifier: l.identifier, title: l.title, body: l.body,
            scheduled_for: l.scheduled_for.iso8601 }
        })
      end

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

          ids = entries.map { |e| e[:id] }
          current_user.notification_logs.where.not(identifier: ids).destroy_all
        end

        success(nil)
      end
    end
  end
end
