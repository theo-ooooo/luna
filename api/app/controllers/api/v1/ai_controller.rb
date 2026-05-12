module Api
  module V1
    class AiController < ApplicationController
      def chat
        message = params.require(:message)
        conversation = find_or_create_conversation

        conversation.append_message("user", message)
        conversation.update!(context_snapshot: Ai::ContextBuilder.new(current_user).build)

        response.headers["Content-Type"] = "text/event-stream"
        response.headers["X-Accel-Buffering"] = "no"

        sse = SSE.new(response.stream)
        sse.write({ type: "start", conversation_id: conversation.id })

        full_response = +""

        begin
          service = Ai::ChatService.new(current_user)
          service.stream(conversation, message) do |event|
            if event.type == "content_block_delta" && event.delta.type == "text_delta"
              text = event.delta.text
              full_response << text
              sse.write({ type: "delta", text: text })
            elsif event.type == "message_stop"
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

      def show_conversation
        conversation = current_user.ai_conversations.find(params[:id])
        success({
          id: conversation.id,
          messages: conversation.messages,
          created_at: conversation.created_at
        })
      end

      def monthly_report
        year = (params[:year] || Date.current.year).to_i
        month = (params[:month] || Date.current.month).to_i

        service = Ai::ChatService.new(current_user)
        result = service.monthly_report(current_user, year, month)

        if result
          success(result)
        else
          failure("NOT_FOUND", "해당 월의 주기 데이터가 없습니다.", status: :not_found)
        end
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
