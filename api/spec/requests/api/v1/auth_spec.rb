require 'rails_helper'

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/signup" do
    let(:params) do
      {
        user: {
          email: "test@example.com",
          password: "password123",
          password_confirmation: "password123",
          nickname: "테스터"
        }
      }
    end

    it "회원가입 후 토큰 발급" do
      post "/api/v1/auth/signup", params: params, as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body.dig("data", "token")).to be_present
      expect(response.parsed_body.dig("data", "user", "email")).to eq("test@example.com")
    end

    it "이메일 중복 시 422" do
      create(:user, email: "test@example.com")
      post "/api/v1/auth/signup", params: params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "비밀번호 8자 미만 시 422" do
      post "/api/v1/auth/signup",
           params: params.deep_merge(user: { password: "short" }),
           as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "POST /api/v1/auth/check_email" do
    let!(:existing_user) { create(:user, email: "existing@example.com") }

    it "가입된 이메일이면 exists: true 반환" do
      post "/api/v1/auth/check_email", params: { email: "existing@example.com" }, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "exists")).to be true
    end

    it "미가입 이메일이면 exists: false 반환" do
      post "/api/v1/auth/check_email", params: { email: "new@example.com" }, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "exists")).to be false
    end

    it "대소문자 구분 없이 조회" do
      post "/api/v1/auth/check_email", params: { email: "EXISTING@EXAMPLE.COM" }, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "exists")).to be true
    end

    it "email 파라미터 없으면 400" do
      post "/api/v1/auth/check_email", params: {}, as: :json
      expect(response).to have_http_status(:bad_request)
    end

    it "인증 토큰 없어도 접근 가능" do
      post "/api/v1/auth/check_email", params: { email: "any@example.com" }, as: :json
      expect(response).not_to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "login@example.com", password: "password123") }

    it "로그인 성공 시 토큰 반환" do
      post "/api/v1/auth/login",
           params: { user: { email: "login@example.com", password: "password123" } },
           as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "token")).to be_present
    end

    it "비밀번호 틀리면 401" do
      post "/api/v1/auth/login",
           params: { user: { email: "login@example.com", password: "wrong" } },
           as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
