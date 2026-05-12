require 'rails_helper'

RSpec.describe "Api::V1::DailyLogs", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/v1/daily_logs" do
    before { create(:daily_log, user: user, logged_on: Date.current) }

    it "날짜 범위 조회" do
      get "/api/v1/daily_logs", params: { from: 7.days.ago.to_s, to: Date.current.to_s }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to eq(1)
    end

    it "92일 초과 범위 시 400" do
      get "/api/v1/daily_logs",
          params: { from: 100.days.ago.to_s, to: Date.current.to_s },
          headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "POST /api/v1/daily_logs" do
    let(:params) { { logged_on: Date.current.to_s, cramps: 2, mood: 3, bbt: 36.45 } }

    it "로그 생성" do
      post "/api/v1/daily_logs", params: params, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body.dig("data", "cramps")).to eq(2)
    end

    it "미래 날짜 422" do
      post "/api/v1/daily_logs",
           params: { logged_on: Date.tomorrow.to_s },
           headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "cramps 범위 초과 422" do
      post "/api/v1/daily_logs",
           params: { logged_on: Date.current.to_s, cramps: 5 },
           headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "중복 날짜 upsert — 기존 로그 업데이트 200" do
      create(:daily_log, user: user, logged_on: Date.current)
      post "/api/v1/daily_logs", params: params, headers: headers, as: :json
      expect(response).to have_http_status(:ok)
    end
  end

  describe "PUT /api/v1/daily_logs/:id" do
    let!(:log) { create(:daily_log, user: user) }

    it "로그 수정" do
      put "/api/v1/daily_logs/#{log.id}",
          params: { mood: 5 },
          headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(log.reload.mood).to eq(5)
    end

    it "다른 사용자 로그 수정 시 404" do
      other_log = create(:daily_log)
      put "/api/v1/daily_logs/#{other_log.id}", params: { mood: 1 }, headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/daily_logs/:id" do
    let!(:log) { create(:daily_log, user: user) }

    it "로그 삭제" do
      expect {
        delete "/api/v1/daily_logs/#{log.id}", headers: headers
      }.to change(DailyLog, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end
  end
end
