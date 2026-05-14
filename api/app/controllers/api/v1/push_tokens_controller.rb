module Api
  module V1
    class PushTokensController < ApplicationController
      def upsert
        token = params.require(:token)
        platform = params.fetch(:platform, "ios")

        # 다른 유저에게 귀속된 토큰이면 재귀속 (기기 교체 등)
        PushToken.where(token: token).where.not(user_id: current_user.id).destroy_all

        current_user.push_tokens.find_or_create_by(token: token) do |pt|
          pt.platform = platform
        end

        success(nil, status: :ok)
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
