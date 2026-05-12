require 'rails_helper'

RSpec.describe "Api::V1::Predictions", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/v1/predictions/current" do
    context "주기 데이터 없음" do
      it "data: null 반환" do
        get "/api/v1/predictions/current", headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["data"]).to be_nil
      end
    end

    context "주기 있음" do
      before do
        create(:cycle, :ongoing, user: user, started_on: 5.days.ago.to_date)
        PredictionService.new(user).compute!
      end

      it "예측 데이터 반환" do
        get "/api/v1/predictions/current", headers: headers
        expect(response).to have_http_status(:ok)
        data = response.parsed_body["data"]
        expect(data["predicted_period_start"]).to be_present
        expect(data["current_phase"]).to be_in(%w[menstrual follicular ovulation luteal])
        expect(data["fertile_start"]).to be_present
      end
    end
  end

  describe "GET /api/v1/predictions/history" do
    before do
      create(:cycle, user: user)
      PredictionService.new(user).compute!
    end

    it "예측 이력 반환" do
      get "/api/v1/predictions/history", headers: headers
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]).to be_an(Array)
    end
  end
end
