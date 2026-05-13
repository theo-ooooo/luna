require 'rails_helper'

RSpec.describe 'GET /api/v1/stats/summary', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  context '주기 데이터 없을 때' do
    it '빈 stats 반환' do
      get '/api/v1/stats/summary', headers: headers
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['data']['avg_bleed_days']).to be_nil
      expect(json['data']['avg_bbt']).to be_nil
      expect(json['data']['regularity_pct']).to be_nil
    end
  end

  context '완료된 주기 있을 때' do
    before do
      create(:cycle, user: user, started_on: 60.days.ago.to_date, ended_on: 55.days.ago.to_date)
      create(:cycle, user: user, started_on: 30.days.ago.to_date, ended_on: 25.days.ago.to_date)
      create(:daily_log, user: user, bbt: 36.5, logged_on: 10.days.ago.to_date)
      create(:daily_log, user: user, bbt: 36.7, logged_on: 9.days.ago.to_date)
    end

    it 'avg_bleed_days, avg_bbt, regularity_pct 반환' do
      get '/api/v1/stats/summary', headers: headers
      expect(response).to have_http_status(:ok)
      data = response.parsed_body['data']
      expect(data['avg_bleed_days']).to be_present
      expect(data['avg_bbt']).to be_within(0.1).of(36.6)
      expect(data['regularity_pct']).to be_a(Integer)
    end
  end

  context '미인증' do
    it '401 반환' do
      get '/api/v1/stats/summary'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
