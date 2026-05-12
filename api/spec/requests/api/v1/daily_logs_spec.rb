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

  describe "GET /api/v1/daily_logs/bbt_history" do
    context '데이터 없을 때' do
      it '빈 data 배열 반환' do
        get '/api/v1/daily_logs/bbt_history', headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['data']['data']).to eq([])
      end
    end

    context 'BBT 기록 있을 때' do
      before do
        create(:cycle, user: user, started_on: 10.days.ago.to_date)
        create(:daily_log, user: user, bbt: 36.5, logged_on: 8.days.ago.to_date)
        create(:daily_log, user: user, bbt: 36.7, logged_on: 6.days.ago.to_date)
        create(:daily_log, user: user, bbt: nil, logged_on: 4.days.ago.to_date) # excluded
      end

      it 'BBT 있는 로그만 반환' do
        get '/api/v1/daily_logs/bbt_history', headers: headers
        expect(response).to have_http_status(:ok)
        data = response.parsed_body['data']['data']
        expect(data.size).to eq(2)
        expect(data.map { |d| d['bbt'] }).to contain_exactly(36.5, 36.7)
      end
    end

    it '미인증 401' do
      get '/api/v1/daily_logs/bbt_history'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/daily_logs/symptom_heatmap" do
    context '데이터 없을 때' do
      it '모두 0인 grid 반환' do
        get '/api/v1/daily_logs/symptom_heatmap', headers: headers
        expect(response).to have_http_status(:ok)
        grid = response.parsed_body['data']['grid']
        expect(grid.flatten.uniq).to eq([0])
      end
    end

    context '증상 기록 있을 때' do
      before do
        create(:daily_log, user: user, headache: 2, logged_on: 1.week.ago.to_date)
      end

      it '해당 주에 headache 집계' do
        get '/api/v1/daily_logs/symptom_heatmap', headers: headers
        expect(response).to have_http_status(:ok)
        grid = response.parsed_body['data']['grid']
        expect(grid[0].any? { |v| v > 0 }).to be true
      end
    end

    it '미인증 401' do
      get '/api/v1/daily_logs/symptom_heatmap'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
