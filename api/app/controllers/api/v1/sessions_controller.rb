module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      def create
        email    = params.dig(:user, :email).to_s.downcase.strip
        password = params.dig(:user, :password).to_s
        resource = resource_class.find_by(email: email)

        unless resource&.valid_password?(password)
          return render json: { status: false, data: nil, error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않아요.' } }, status: :unauthorized
        end

        super
      end

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
