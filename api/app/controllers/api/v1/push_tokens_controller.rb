module Api
  module V1
    class PushTokensController < ApplicationController
      def upsert
        token = params.require(:token)
        platform = params.fetch(:platform, "ios")

        current_user.push_tokens.find_or_initialize_by(token: token).tap do |pt|
          pt.platform = platform
          pt.save!
        end

        success(nil, status: :ok)
      rescue ActionController::ParameterMissing => e
        failure("VALIDATION_ERROR", e.message)
      end

      def test_push
        ExpoPushService.send_to_user(
          current_user,
          title: "🌙 Luna 테스트 알림",
          body: "서버에서 보낸 푸시 알림이에요!"
        )
        success(nil)
      end
    end
  end
end
