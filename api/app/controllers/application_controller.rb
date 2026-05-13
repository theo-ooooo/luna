class ApplicationController < ActionController::API
  wrap_parameters false
  before_action :authenticate_user!

  def success(data, status: :ok)
    render json: { status: true, data: data, error: nil }, status: status
  end

  def failure(code, message, status: :unprocessable_content)
    render json: { status: false, data: nil, error: { code: code, message: message } }, status: status
  end

  rescue_from ActiveRecord::RecordNotFound do
    failure("NOT_FOUND", "리소스를 찾을 수 없습니다.", status: :not_found)
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    failure("VALIDATION_ERROR", e.message, status: :unprocessable_content)
  end

  rescue_from ActionController::ParameterMissing do |e|
    failure("VALIDATION_ERROR", e.message, status: :bad_request)
  end
end
