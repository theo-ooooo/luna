module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      before_action :configure_sign_up_params, only: [:create]

      def create
        build_resource(sign_up_params)
        resource.save
        if resource.persisted?
          sign_up(resource_name, resource)
          respond_with resource
        else
          clean_up_passwords resource
          respond_with resource
        end
      end

      private

      def respond_with(resource, _opts = {})
        if resource.persisted?
          render json: {
            status: true,
            data: { token: current_token, user: user_json(resource) },
            error: nil
          }, status: :created
        else
          render json: {
            status: false,
            data: nil,
            error: { code: "VALIDATION_ERROR", message: resource.errors.full_messages.join(", ") }
          }, status: :unprocessable_entity
        end
      end

      def configure_sign_up_params
        devise_parameter_sanitizer.permit(:sign_up, keys: [:nickname, :cycle_length_default, :luteal_phase_length])
      end

      def current_token
        request.env["warden-jwt_auth.token"]
      end

      def user_json(user)
        user.slice(:id, :email, :nickname, :cycle_length_default, :luteal_phase_length)
      end
    end
  end
end
