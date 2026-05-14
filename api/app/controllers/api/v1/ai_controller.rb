module Api
  module V1
    class AiController < ApplicationController
      include ActionController::Live
      def chat
        message = params.require(:message)
        if message.to_s.length > 1000
          return failure("VALIDATION_ERROR", "메시지가 너무 길어요. 1000자 이하로 입력해주세요.", status: :unprocessable_content)
        end

        conversation = find_or_create_conversation

        context = Ai::ContextBuilder.new(current_user).build
        conversation.messages_will_change!
        conversation.messages << { "role" => "user", "content" => message, "ts" => Time.current.iso8601 }
        conversation.update!(context_snapshot: context)

        response.headers["Content-Type"] = "text/event-stream"
        response.headers["X-Accel-Buffering"] = "no"

        sse = SSE.new(response.stream)
        sse.write({ type: "start", conversation_id: conversation.id })

        full_response = +""

        begin
          service = Ai::ChatService.new(current_user)
          service.stream(conversation, message, context: context) do |event|
            if event[:type] == :delta
              full_response << event[:text]
              sse.write({ type: "delta", text: event[:text] })
            elsif event[:type] == :stop
              sse.write({ type: "end" })
            end
          end
        rescue => e
          sse.write({ type: "error", message: "AI 서비스를 일시적으로 사용할 수 없습니다." })
          Rails.logger.error("AI chat error: #{e.message}")
        ensure
          conversation.append_message("assistant", full_response) if full_response.present?
          sse.close
        end
      end

      def list_conversations
        conversations = current_user.ai_conversations
                                    .where("jsonb_array_length(messages) > 0")
                                    .order(updated_at: :desc)
                                    .limit(30)
        success(conversations.map { |c|
          first_user_msg = c.messages.find { |m| m["role"] == "user" }
          {
            id: c.id,
            preview: first_user_msg&.dig("content")&.truncate(60) || "",
            message_count: c.messages.size,
            updated_at: c.updated_at
          }
        })
      end

      def show_conversation
        conversation = current_user.ai_conversations.find(params[:id])
        success({
          id: conversation.id,
          messages: conversation.messages,
          created_at: conversation.created_at
        })
      end

      def parse_log
        text = params.require(:text).to_s.strip
        return failure("VALIDATION_ERROR", "입력 텍스트가 비어있습니다.", status: :bad_request) if text.blank?
        return failure("VALIDATION_ERROR", "텍스트는 200자 이내로 입력해주세요.", status: :bad_request) if text.length > 200

        result = Ai::ParseLogService.new.parse(text)
        success(result)
      rescue Faraday::Error, OpenAI::Error, RuntimeError => e
        Rails.logger.error("AI parse_log error: #{e.message}")
        failure("AI_UNAVAILABLE", "AI 서비스를 일시적으로 사용할 수 없습니다.", status: :service_unavailable)
      end

      def daily_insight
        date = Date.iso8601(params.fetch(:date, Date.current.iso8601))
        record = AiDailyInsight.for(current_user, date)
        if record.persisted? && !record.stale?
          return success(record.slice(:date, :content, :generated_at))
        end
        result = Ai::ChatService.new(current_user).daily_insight(date)
        return success({ content: nil }) unless result
        record.assign_attributes(content: result[:content], stale: false, generated_at: result[:generated_at])
        begin
          record.save!
        rescue ActiveRecord::RecordNotUnique
          record = AiDailyInsight.find_by!(user: current_user, date: date)
          return success(record.slice(:date, :content, :generated_at))
        end
        success(record.slice(:date, :content, :generated_at))
      rescue ArgumentError
        failure("VALIDATION_ERROR", "date 형식이 올바르지 않습니다.", status: :bad_request)
      rescue Faraday::Error, OpenAI::Error, RuntimeError => e
        Rails.logger.error("AI daily_insight error: #{e.message}")
        failure("AI_UNAVAILABLE", "AI 서비스를 일시적으로 사용할 수 없습니다.", status: :service_unavailable)
      end

      def monthly_report
        year  = (params[:year]  || Date.current.year).to_i
        month = (params[:month] || Date.current.month).to_i

        unless (2020..2100).cover?(year) && (1..12).cover?(month)
          return failure("VALIDATION_ERROR", "year(2020~2100) 또는 month(1~12) 범위를 확인하세요.", status: :bad_request)
        end

        report = AiMonthlyReport.for(current_user, year, month)

        if report.persisted? && !report.stale?
          return success(report.slice(:year, :month, :summary, :stats, :generated_at))
        end

        service = Ai::ChatService.new(current_user)
        result = service.monthly_report(current_user, year, month)

        return failure("NOT_FOUND", "해당 월의 주기 데이터가 없습니다.", status: :not_found) unless result

        report.assign_attributes(
          summary: result[:summary],
          stats: result[:stats],
          stale: false,
          generated_at: result[:generated_at]
        )
        begin
          report.save!
        rescue ActiveRecord::RecordNotUnique
          # 동시 요청이 먼저 저장한 경우 — 이미 저장된 레코드 반환
          report = current_user.ai_monthly_reports.find_by!(year: year, month: month)
          return success(report.slice(:year, :month, :summary, :stats, :generated_at))
        end

        success(result)
      rescue Faraday::Error, OpenAI::Error, RuntimeError => e
        Rails.logger.error("AI monthly_report error: #{e.message}")
        failure("AI_UNAVAILABLE", "AI 서비스를 일시적으로 사용할 수 없습니다.", status: :service_unavailable)
      end

      private

      def find_or_create_conversation
        if params[:conversation_id].present?
          current_user.ai_conversations.find(params[:conversation_id])
        else
          current_user.ai_conversations.create!(messages: [])
        end
      end
    end
  end
end
