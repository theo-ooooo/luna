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

    it "started_on 미전달 시 오늘 날짜로 생성" do
      post "/api/v1/cycles", params: { flow_level: 2 }, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body.dig("data", "started_on")).to eq(Date.current.to_s)
    end

    it "started_on 빈 문자열 전달 시 오늘 날짜로 생성" do
      post "/api/v1/cycles", params: { started_on: "", flow_level: 2 }, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body.dig("data", "started_on")).to eq(Date.current.to_s)
    end

    it "미래 날짜 시작 시 422 반환 및 FUTURE_DATE 코드" do
      post "/api/v1/cycles", params: { started_on: Date.tomorrow.to_s }, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("error", "code")).to eq("FUTURE_DATE")
    end

    it "중복 날짜 시작 시 422 반환 및 DUPLICATE_DATE 코드" do
      create(:cycle, :ongoing, user: user, started_on: Date.current)
      post "/api/v1/cycles", params: params, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("error", "code")).to eq("DUPLICATE_DATE")
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

    context "주기가 여러 개일 때 삭제하면 PredictionService 재계산 호출" do
      it "PredictionService#compute! 호출" do
        create(:cycle, user: user)
        expect_any_instance_of(PredictionService).to receive(:compute!)
        delete "/api/v1/cycles/#{cycle.id}", headers: headers
        expect(response).to have_http_status(:ok)
      end
    end

    context "마지막 주기 삭제 시 예측 데이터 제거" do
      it "prediction 삭제" do
        PredictionService.new(user).compute!
        delete "/api/v1/cycles/#{cycle.id}", headers: headers
        expect(user.predictions.reload).to be_empty
      end
    end
  end
end
