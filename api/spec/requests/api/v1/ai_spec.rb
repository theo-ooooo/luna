require 'rails_helper'

RSpec.describe "Api::V1::Ai", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/v1/ai/monthly_report" do
    it "주기 데이터 없을 때 404" do
      get "/api/v1/ai/monthly_report", params: { year: 2026, month: 4 }, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "month 범위 초과 시 400" do
      get "/api/v1/ai/monthly_report", params: { year: 2026, month: 13 }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "year 범위 초과 시 400" do
      get "/api/v1/ai/monthly_report", params: { year: 1999, month: 1 }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "GET /api/v1/ai/conversations/:id" do
    let!(:conversation) { user.ai_conversations.create!(messages: []) }

    it "대화 이력 반환" do
      get "/api/v1/ai/conversations/#{conversation.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "id")).to eq(conversation.id)
    end

    it "다른 사용자 대화 접근 시 404" do
      other_conv = create(:user).ai_conversations.create!(messages: [])
      get "/api/v1/ai/conversations/#{other_conv.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
