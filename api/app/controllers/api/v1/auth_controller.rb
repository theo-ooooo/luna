module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:check_email]

      def check_email
        exists = User.exists?(email: params.require(:email).to_s.downcase.strip)
        success({ exists: exists })
      end

      # DELETE /api/v1/auth/me
      # 회원탈퇴: 현재 로그인된 사용자의 계정을 삭제하고 JWT를 폐기합니다. (PIPA 대응)
      def destroy
        user = current_user
        sign_out(user)
        user.destroy!
        success(nil)
      end
    end
  end
end
