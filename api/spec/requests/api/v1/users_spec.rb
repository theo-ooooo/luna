require 'rails_helper'

RSpec.describe "Api::V1::Users", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/v1/users/me" do
    it "내 프로필 반환" do
      get "/api/v1/users/me", headers: headers
      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["email"]).to eq(user.email)
      expect(data["cycle_length_default"]).to eq(28)
    end

    it "인증 없이 401" do
      get "/api/v1/users/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/users/me" do
    it "닉네임 업데이트" do
      patch "/api/v1/users/me", params: { nickname: "새이름" }, headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(user.reload.nickname).to eq("새이름")
    end

    it "cycle_length_default 범위 초과 시 422" do
      patch "/api/v1/users/me", params: { cycle_length_default: 99 }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
