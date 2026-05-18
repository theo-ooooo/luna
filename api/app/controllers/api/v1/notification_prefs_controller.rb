module Api
  module V1
    class NotificationPrefsController < ApplicationController
      def show
        pref = current_user.notification_pref || NotificationPref.new(NotificationPref::KEYS.index_with(true).merge(daily_reminder: false))
        success(serialize(pref))
      end

      def update
        pref = current_user.notification_pref || current_user.build_notification_pref
        pref.assign_attributes(pref_params)
        pref.save!
        success(serialize(pref))
      end

      private

      def pref_params
        params.permit(*NotificationPref::KEYS)
      end

      def serialize(pref)
        NotificationPref::KEYS.index_with { |k| pref.public_send(k) }
      end
    end
  end
end
