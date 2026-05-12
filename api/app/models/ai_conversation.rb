class AiConversation < ApplicationRecord
  belongs_to :user

  MAX_HISTORY_TURNS = 10

  def append_message(role, content)
    messages << { "role" => role, "content" => content, "ts" => Time.current.iso8601 }
    save!
  end

  def recent_messages_for_api
    messages.last(MAX_HISTORY_TURNS * 2).map { |m| m.slice("role", "content") }
  end
end
