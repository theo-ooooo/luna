require 'rails_helper'

RSpec.describe "Api::Version", type: :request do
  describe "GET /api/version" do
    it "인증 없이 버전 정보를 반환한다" do
      get "/api/version"
      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["api_version"]).to eq("v1")
      expect(data["app_version"]).to match(/\A\d+\.\d+\.\d+\z/)
      expect(data["env"]).to eq("test")
    end

    it "표준 응답 포맷({ status, data, error })을 따른다" do
      get "/api/version"
      body = response.parsed_body
      expect(body["status"]).to eq(true)
      expect(body["data"]).to be_a(Hash)
      expect(body["error"]).to be_nil
    end
  end
end
