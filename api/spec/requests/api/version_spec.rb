require 'rails_helper'

RSpec.describe "Api::Version", type: :request do
  before do
    AppVersion.create!(
      ios_latest_version: '1.0.1', ios_min_version: '1.0.0', ios_store_url: 'https://apps.apple.com/app/id6769269495',
      android_latest_version: '1.0.1', android_min_version: '1.0.0', android_store_url: nil
    )
  end

  describe "GET /api/version" do
    it "인증 없이 버전 정보를 반환한다" do
      get "/api/version"
      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["api_version"]).to eq("v1")
      expect(data["ios"]["latest_version"]).to match(/\A\d+\.\d+\.\d+\z/)
      expect(data["android"]["latest_version"]).to match(/\A\d+\.\d+\.\d+\z/)
      expect(data["env"]).to eq("test")
    end

    it "표준 응답 포맷({ status, data, error })을 따른다" do
      get "/api/version"
      body = response.parsed_body
      expect(body["status"]).to eq(true)
      expect(body["data"]).to be_a(Hash)
      expect(body["error"]).to be_nil
    end

    it "app_versions 테이블이 비어 있으면 503을 반환한다" do
      AppVersion.delete_all
      get "/api/version"
      expect(response).to have_http_status(:service_unavailable)
    end
  end
end
