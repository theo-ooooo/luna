class UserMailer < ApplicationMailer
  def password_reset(user, code)
    @user = user
    @code = code
    mail(to: user.email, subject: '[Luna] 비밀번호 재설정 인증코드')
  end
end
