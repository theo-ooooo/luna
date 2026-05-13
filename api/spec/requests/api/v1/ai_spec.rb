require 'rails_helper'

RSpec.describe "Api::V1::Ai", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "POST /api/v1/ai/parse_log" do
    let(:parsed_result) do
      { "moods" => ["피곤"], "symptoms" => ["두통"], "flow" => nil, "bbt" => "36.7", "lh_result" => nil, "notes" => "오늘 피곤하고 두통이 있어요." }
    end

    it "정상 파싱 결과 반환" do
      allow_any_instance_of(Ai::ParseLogService).to receive(:parse).and_return(parsed_result)
      post "/api/v1/ai/parse_log", params: { text: "오늘 피곤하고 두통이 있어요." }, headers: headers
      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["moods"]).to include("피곤")
      expect(data["symptoms"]).to include("두통")
    end

    it "빈 텍스트 입력 시 400" do
      post "/api/v1/ai/parse_log", params: { text: "   " }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "200자 초과 입력 시 400" do
      post "/api/v1/ai/parse_log", params: { text: "가" * 201 }, headers: headers
      expect(response).to have_http_status(:bad_request)
    end

    it "미인증 요청 시 401" do
      post "/api/v1/ai/parse_log", params: { text: "오늘 피곤해요." }
      expect(response).to have_http_status(:unauthorized)
    end

    it "AI 서비스 오류 시 503" do
      allow_any_instance_of(Ai::ParseLogService).to receive(:parse).and_raise(Faraday::Error.new("API error"))
      post "/api/v1/ai/parse_log", params: { text: "오늘 피곤해요." }, headers: headers
      expect(response).to have_http_status(:service_unavailable)
      expect(response.parsed_body.dig("error", "code")).to eq("AI_UNAVAILABLE")
    end
  end

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

    context "캐시 로직" do
      let(:cached_report) do
        user.ai_monthly_reports.create!(
          year: 2026, month: 5,
          summary: "캐시된 요약입니다.",
          stats: { cycle_length: 28 },
          stale: false,
          generated_at: 1.hour.ago
        )
      end

      it "stale: false 리포트는 OpenAI 호출 없이 DB 반환" do
        cached_report
        expect_any_instance_of(Ai::ChatService).not_to receive(:monthly_report)
        get "/api/v1/ai/monthly_report", params: { year: 2026, month: 5 }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.dig("data", "summary")).to eq("캐시된 요약입니다.")
      end

      it "stale: true 리포트는 OpenAI 재생성 후 DB 갱신" do
        cached_report.update!(stale: true)
        new_result = { year: 2026, month: 5, summary: "새 요약", stats: {}, generated_at: Time.current }
        allow_any_instance_of(Ai::ChatService).to receive(:monthly_report).and_return(new_result)
        get "/api/v1/ai/monthly_report", params: { year: 2026, month: 5 }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(cached_report.reload.stale).to eq(false)
        expect(cached_report.reload.summary).to eq("새 요약")
      end
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
