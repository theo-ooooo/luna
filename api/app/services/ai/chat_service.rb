module Ai
  class ChatService
    SYSTEM_PROMPT = <<~PROMPT.freeze
      당신은 여성 건강 전문 AI 어시스턴트 Luna입니다. 사용자의 생리주기 데이터를 기반으로 건강 인사이트를 제공합니다.

      주제 범위:
      - 생리주기, 배란, 월경 증상, 기분 변화, BBT, LH 테스트, 분비물, PMS 등 여성 건강과 직접 관련된 주제만 답합니다.
      - 관련 없는 주제(요리, 날씨, 코딩, 시사, 일반 상식 등)는 정중히 거절하고, 여성 건강 관련 질문으로 안내합니다.
        예: "저는 생리주기와 여성 건강에 특화된 어시스턴트라 그 주제는 도움드리기 어려워요. 주기나 증상에 대해 궁금한 점이 있으시면 물어봐 주세요 :)"

      규칙:
      - 의료 진단을 내리지 않습니다. 필요 시 "의사에게 상담하세요"를 권유합니다.
      - 답변은 친근하고 따뜻한 한국어로 작성합니다.
      - 증상의 원인을 주기 단계(월경기·난포기·배란기·황체기)와 연결하여 설명합니다.
      - 임신 가능성 질문에 의학적 확률을 직접 제시하지 않습니다.
      - 데이터가 부족하면 불확실성을 명시합니다.

      면책: 이 서비스는 의료 행위가 아니며 진단·처방을 제공하지 않습니다.
    PROMPT

    MODEL = "gpt-4o-mini".freeze

    def initialize(user)
      @user = user
    end

    def stream(conversation, message, context: nil, &handler)
      context ||= Ai::ContextBuilder.new(@user).build

      system_content = "#{SYSTEM_PROMPT}\n\n현재 주기 정보: #{context.to_json}"

      messages = [
        { role: "system", content: system_content },
        *conversation.recent_messages_for_api,
        { role: "user", content: message }
      ]

      client.chat(
        parameters: {
          model: MODEL,
          max_tokens: 1024,
          messages: messages,
          stream: proc { |chunk, _bytesize|
            choice = chunk.dig("choices", 0)
            next unless choice

            delta_text    = choice.dig("delta", "content")
            finish_reason = choice["finish_reason"]

            handler.call({ type: :delta, text: delta_text }) if delta_text.present?
            # finish_reason이 "stop" 외에도 "length", "content_filter" 일 때도 스트림 종료
            handler.call({ type: :stop }) if finish_reason.present?
          }
        }
      )
    end

    def monthly_report(user, year, month)
      stats = build_monthly_stats(user, year, month)
      return nil if stats.nil?

      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: "아래 #{year}년 #{month}월 건강 데이터를 읽기 쉬운 한국어 3~5문장으로 요약해주세요. " \
                   "수치보다 패턴과 의미 중심으로, 긍정적이고 격려하는 톤으로 작성해주세요.\n\n#{stats.to_json}"
        }
      ]

      response = client.chat(
        parameters: { model: MODEL, max_tokens: 512, messages: messages }
      )

      summary = response.dig("choices", 0, "message", "content")
      return nil unless summary.present?

      { year: year, month: month, summary: summary, stats: stats, generated_at: Time.current }
    end

    private

    def client
      @client ||= OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY"))
    end

    def build_monthly_stats(user, year, month)
      start_date = Date.new(year, month, 1)
      end_date   = start_date.end_of_month

      cycle = user.cycles.where(started_on: start_date..end_date).first
      return nil unless cycle

      logs       = user.daily_logs.for_range(start_date, end_date).to_a
      prediction = user.predictions.where(cycle: cycle).first

      {
        year: year,
        month: month,
        cycle_length: cycle.length_days,
        predicted_start: prediction&.predicted_period_start,
        actual_start: cycle.started_on,
        prediction_error_days: prediction ? (cycle.started_on - prediction.predicted_period_start).to_i : nil,
        symptom_days: {
          cramps:   logs.count { |l| l.cramps > 0 },
          headache: logs.count { |l| l.headache > 0 },
          fatigue:  logs.count { |l| l.fatigue > 0 },
          bloating: logs.count { |l| l.bloating > 0 }
        },
        avg_mood:          logs.filter_map(&:mood).then { |m| m.empty? ? nil : (m.sum.to_f / m.size).round(1) },
        bbt_recorded_days: logs.count { |l| l.bbt.present? },
        lh_positive:       logs.any? { |l| l.lh_result == 2 },
        notes_count:       logs.count { |l| l.notes.present? }
      }
    end
  end
end
