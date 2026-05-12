module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!

      def check_email
        exists = User.exists?(email: params.require(:email).to_s.downcase.strip)
        success({ exists: exists })
      end
    end
  end
end
