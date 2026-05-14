class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('GMAIL_USERNAME', 'noreply@luna.app')
  layout 'mailer'
end
