require 'rails_helper'

RSpec.describe "Api::V1::Cycles", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/v1/cycles" do
    before { create_list(:cycle, 3, user: user) }

    it "주기 목록을 반환" do
      get "/api/v1/cycles", headers: headers
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "cycles").size).to eq(3)
    end

    it "인증 없이 401 반환" do
      get "/api/v1/cycles"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/cycles" do
    let(:params) { { started_on: Date.current.to_s, flow_level: 2 } }

    it "주기를 생성하고 예측을 계산" do
      expect {
        post "/api/v1/cycles", params: params, headers: headers, as: :json
      }.to change(Cycle, :count).by(1).and change(Prediction, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body.dig("data", "started_on")).to eq(Date.current.to_s)
    end

    it "미래 날짜 시작 시 422 반환" do
      post "/api/v1/cycles", params: { started_on: Date.tomorrow.to_s }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "중복 날짜 시작 시 422 반환" do
      create(:cycle, :ongoing, user: user, started_on: Date.current)
      post "/api/v1/cycles", params: params, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PUT /api/v1/cycles/:id" do
    let!(:cycle) { create(:cycle, :ongoing, user: user) }

    it "주기 종료일 업데이트" do
      put "/api/v1/cycles/#{cycle.id}",
          params: { ended_on: Date.current.to_s },
          headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(cycle.reload.ended_on).to eq(Date.current)
    end

    it "다른 사용자 주기 접근 시 404" do
      other_cycle = create(:cycle)
      put "/api/v1/cycles/#{other_cycle.id}", params: {}, headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/cycles/:id" do
    let!(:cycle) { create(:cycle, user: user) }

    it "주기 삭제" do
      expect {
        delete "/api/v1/cycles/#{cycle.id}", headers: headers
      }.to change(Cycle, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end
  end
end
