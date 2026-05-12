require "devise/orm/active_record"

Devise.setup do |config|
  config.mailer_sender = "noreply@luna-app.io"
  config.navigational_formats = []

  config.jwt do |jwt|
    jwt.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY")
    jwt.dispatch_requests = [
      ["POST", %r{^/api/v1/auth/login$}],
      ["POST", %r{^/api/v1/auth/signup$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/api/v1/auth/logout$}]
    ]
    jwt.expiration_time = 30.days.to_i
  end
end
