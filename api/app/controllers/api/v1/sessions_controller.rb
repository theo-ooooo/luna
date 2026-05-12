module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      private

      def respond_with(resource, _opts = {})
        render json: {
          status: true,
          data: { token: current_token, user: user_json(resource) },
          error: nil
        }
      end

      def respond_to_on_destroy
        render json: { status: true, data: nil, error: nil }
      end

      def current_token
        request.env["warden-jwt_auth.token"]
      end

      def user_json(user)
        user.slice(:id, :email, :nickname, :cycle_length_default, :luteal_phase_length, :notifications_enabled)
      end
    end
  end
end
