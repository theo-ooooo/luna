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
        # 1. oauth_identities로 먼저 찾기
        identity = OauthIdentity.find_by(provider: "apple", uid: apple_uid)
        return identity.user if identity

        # 2. 이메일로 기존 계정 찾기 (연동)
        user = email.present? ? User.find_by(email: email) : nil

        # 3. 없으면 신규 유저 생성
        user ||= User.create!(
          email: email.presence || "apple-#{apple_uid}@privaterelay.luna.app",
          password: SecureRandom.hex(24),
          jti: SecureRandom.uuid
        )

        # 4. OauthIdentity 연결 (race condition 대비)
        begin
          user.oauth_identities.create!(provider: "apple", uid: apple_uid)
        rescue ActiveRecord::RecordNotUnique
          # 동시 요청으로 다른 유저에 먼저 연결된 경우 해당 유저를 반환
          identity = OauthIdentity.find_by(provider: "apple", uid: apple_uid)
          return identity.user if identity
        end

        user
      end

      def user_json(user)
        user.slice(:id, :email, :nickname, :cycle_length_default, :luteal_phase_length, :period_length_default, :notifications_enabled, :onboarding_completed)
      end
    end
  end
end
