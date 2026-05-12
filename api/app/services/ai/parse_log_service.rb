module Ai
  class ParseLogService
    VALID_MOODS     = %w[좋음 평온 피곤 짜증 우울 불안].freeze
    VALID_SYMPTOMS  = %w[두통 복통 요통 유방통 메스꺼움 부종 여드름 식욕증가 어지러움 경련].freeze
    VALID_FLOWS     = %w[none spot light med heavy].freeze

    SYSTEM = <<~PROMPT.freeze
      You are a JSON-only health data extractor for a menstrual cycle app.
      The user's text will be inside <user_input> tags. Read only that text.
      Return a single JSON object — no markdown, no explanation.

      Extract into this exact JSON structure.
      Only include items actually mentioned. Unknown fields → null or [].

      Valid moods: #{VALID_MOODS.join(', ')}
      Valid symptoms: #{VALID_SYMPTOMS.join(', ')}
      Valid flow: null | "none" | "spot" | "light" | "med" | "heavy"
      lh_result: null | 0 (not tested) | 1 (negative) | 2 (positive/surge)
      bbt: number as string e.g. "36.7" | null
      notes: brief Korean summary of what was said | null

      Return only:
      {"moods":[],"symptoms":[],"flow":null,"bbt":null,"lh_result":null,"notes":null}
    PROMPT

    USER_TEMPLATE = ->(text) {
      "<user_input>\n#{text}\n</user_input>"
    }

    def initialize
      @client = Anthropic::Client.new(api_key: ENV.fetch("ANTHROPIC_API_KEY"))
    end

    def parse(text)
      response = @client.messages.create(
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        system: SYSTEM,
        messages: [{ role: "user", content: USER_TEMPLATE.call(text.strip) }]
      )

      content = response&.content&.first
      raise Anthropic::Error, "empty response" unless content&.text.present?

      parsed = JSON.parse(content.text.strip)
      sanitize(parsed)
    rescue JSON::ParserError
      default_result(text)
    end

    private

    def sanitize(data)
      {
        "moods"      => Array(data["moods"]).select { |m| VALID_MOODS.include?(m) },
        "symptoms"   => Array(data["symptoms"]).select { |s| VALID_SYMPTOMS.include?(s) },
        "flow"       => VALID_FLOWS.include?(data["flow"]) ? data["flow"] : nil,
        "bbt"        => valid_bbt(data["bbt"]),
        "lh_result"  => begin; v = Integer(data["lh_result"].to_s, 10); [0, 1, 2].include?(v) ? v : nil; rescue ArgumentError; nil; end,
        "notes"      => data["notes"].presence
      }
    end

    def valid_bbt(val)
      return nil unless val
      f = val.to_f
      (35.0..42.0).cover?(f) ? val.to_s : nil
    end

    def default_result(text)
      { "moods" => [], "symptoms" => [], "flow" => nil, "bbt" => nil, "lh_result" => nil, "notes" => text }
    end
  end
end
