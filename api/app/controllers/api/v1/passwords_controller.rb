module Api
  module V1
    class PasswordsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:forgot, :verify]

      # POST /api/v1/passwords/forgot
      # 이메일로 6자리 인증코드를 생성하고 저장한 뒤 Gmail SMTP로 발송합니다.
      def forgot
        email = params.require(:email).to_s.downcase.strip
        user = User.find_by(email: email)

        # 가입되지 않은 이메일이어도 보안상 동일하게 응답
        unless user
          return success({ message: "인증코드가 발송되었습니다." })
        end

        code = rand(100_000..999_999).to_s
        hashed = Digest::SHA256.hexdigest(code)
        user.update_columns(
          password_reset_token: hashed,
          password_reset_sent_at: Time.current
        )

        UserMailer.password_reset(user, code).deliver_now
        success({ message: "인증코드가 발송되었습니다." })
      end

      # POST /api/v1/passwords/verify
      # 인증코드 검증 후 비밀번호를 변경합니다.
      def verify
        email                 = params.require(:email).to_s.downcase.strip
        code                  = params.require(:code).to_s.strip
        password              = params.require(:password)
        password_confirmation = params.fetch(:password_confirmation, password)

        if password != password_confirmation
          return failure("VALIDATION_ERROR", "비밀번호가 일치하지 않아요.", status: :unprocessable_content)
        end

        # 이메일당 최대 5회 실패 허용 (무차별 대입 방지)
        attempts_key = "pwd_reset_attempts:#{email}"
        attempts = Rails.cache.read(attempts_key).to_i
        if attempts >= 5
          return failure("TOO_MANY_ATTEMPTS", "너무 많이 시도했어요. 잠시 후 다시 시도해주세요.", status: :too_many_requests)
        end

        user = User.find_by(email: email)

        unless user&.password_reset_token.present?
          return failure("INVALID_CODE", "유효하지 않은 인증코드입니다.", status: :unprocessable_content)
        end

        if user.password_reset_sent_at < 10.minutes.ago
          user.update_columns(password_reset_token: nil, password_reset_sent_at: nil)
          return failure("EXPIRED_CODE", "인증코드가 만료되었습니다. 다시 요청해주세요.", status: :unprocessable_content)
        end

        submitted_hash = Digest::SHA256.hexdigest(code)
        unless ActiveSupport::SecurityUtils.secure_compare(user.password_reset_token, submitted_hash)
          Rails.cache.write(attempts_key, attempts + 1, expires_in: 10.minutes)
          return failure("INVALID_CODE", "인증코드가 올바르지 않아요.", status: :unprocessable_content)
        end

        Rails.cache.delete(attempts_key)
        user.update!(password: password, password_confirmation: password_confirmation)
        user.update_columns(password_reset_token: nil, password_reset_sent_at: nil)

        success({ message: "비밀번호가 변경되었습니다." })
      end
    end
  end
end
