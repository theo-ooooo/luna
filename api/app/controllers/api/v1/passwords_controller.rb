module Api
  module V1
    class PasswordsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:forgot, :verify]

      # POST /api/v1/passwords/forgot
      # 이메일로 6자리 인증코드를 생성하고 저장합니다.
      # 현재는 코드를 응답 바디에 직접 반환합니다 (이메일 발송 미구현).
      def forgot
        email = params.require(:email).to_s.downcase.strip
        user = User.find_by(email: email)

        # 가입되지 않은 이메일이어도 보안상 동일하게 응답
        unless user
          return success({ message: "인증코드가 발송되었습니다." })
        end

        code = rand(100_000..999_999).to_s
        user.update_columns(
          password_reset_token: code,
          password_reset_sent_at: Time.current
        )

        # TODO: 이메일 발송 구현 후 code를 응답에서 제거
        success({ message: "인증코드가 발송되었습니다.", code: code })
      end

      # POST /api/v1/passwords/verify
      # 인증코드 검증 후 비밀번호를 변경합니다.
      def verify
        email    = params.require(:email).to_s.downcase.strip
        code     = params.require(:code).to_s.strip
        password = params.require(:password)

        user = User.find_by(email: email)

        unless user&.password_reset_token.present?
          return failure("INVALID_CODE", "유효하지 않은 인증코드입니다.", status: :unprocessable_content)
        end

        if user.password_reset_sent_at < 10.minutes.ago
          user.update_columns(password_reset_token: nil, password_reset_sent_at: nil)
          return failure("EXPIRED_CODE", "인증코드가 만료되었습니다. 다시 요청해주세요.", status: :unprocessable_content)
        end

        unless user.password_reset_token == code
          return failure("INVALID_CODE", "인증코드가 올바르지 않습니다.", status: :unprocessable_content)
        end

        user.update!(password: password, password_confirmation: password)
        user.update_columns(password_reset_token: nil, password_reset_sent_at: nil)

        success({ message: "비밀번호가 변경되었습니다." })
      end
    end
  end
end
