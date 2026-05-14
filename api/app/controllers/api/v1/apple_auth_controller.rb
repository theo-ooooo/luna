module Api
  module V1
    # Apple Sign In 엔드포인트
    # POST /api/v1/auth/apple
    class AppleAuthController < ApplicationController
      skip_before_action :authenticate_user!

      def create
        identity_token = params.require(:identity_token)

        result = AppleSignInService.verify(identity_token)
        apple_uid = result[:apple_uid]
        email     = result[:email]

        raise AppleSignInError, "Apple UID를 확인할 수 없습니다." if apple_uid.blank?

        user = find_or_create_user(apple_uid: apple_uid, email: email)

        token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
        render json: {
          status: true,
          data: { token: token, user: user_json(user) },
          error: nil
        }, status: :ok
      rescue AppleSignInError => e
        render json: {
          status: false,
          data: nil,
          error: { code: "APPLE_AUTH_FAILED", message: e.message }
        }, status: :unauthorized
      rescue ActionController::ParameterMissing => e
        render json: {
          status: false,
          data: nil,
          error: { code: "VALIDATION_ERROR", message: e.message }
        }, status: :bad_request
      end

      private

      def find_or_create_user(apple_uid:, email:)
        # 1. apple_uid로 먼저 찾기
        user = User.find_by(apple_uid: apple_uid)
        return user if user

        # 2. 이메일이 있으면 이메일로 찾기 (기존 계정 연동)
        if email.present?
          user = User.find_by(email: email)
          if user
            user.update_column(:apple_uid, apple_uid)
            return user
          end
        end

        # 3. 신규 생성 (동시 요청 race condition 대비)
        begin
          User.create!(
            apple_uid: apple_uid,
            email: email.presence || generated_placeholder_email(apple_uid),
            password: SecureRandom.hex(24),
            jti: SecureRandom.uuid
          )
        rescue ActiveRecord::RecordNotUnique
          User.find_by!(apple_uid: apple_uid)
        end
      end

      # Apple이 이메일을 제공하지 않는 경우 placeholder 생성
      def generated_placeholder_email(apple_uid)
        "apple-#{apple_uid}@privaterelay.luna.app"
      end

      def user_json(user)
        user.slice(:id, :email, :nickname, :cycle_length_default, :luteal_phase_length, :notifications_enabled)
      end
    end
  end
end
