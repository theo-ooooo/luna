module Api
  module V1
    class UsersController < ApplicationController
      def show
        success(user_json(current_user))
      end

      def update
        current_user.update!(update_params)
        success(user_json(current_user))
      end

      private

      def update_params
        params.permit(:nickname, :cycle_length_default, :luteal_phase_length,
                      :period_length_default, :notifications_enabled)
      end

      def user_json(user)
        user.slice(:id, :email, :nickname, :cycle_length_default, :luteal_phase_length,
                   :period_length_default, :notifications_enabled, :created_at)
      end
    end
  end
end
