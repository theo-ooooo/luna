class ExpoPushService
  EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

  def self.send_to_user(user, title:, body:, data: {})
    tokens = user.push_tokens.pluck(:token)
    return if tokens.empty?

    messages = tokens.map { |t| { to: t, title: title, body: body, data: data } }
    post(messages)
  end

  def self.post(messages)
    uri = URI(EXPO_PUSH_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    req = Net::HTTP::Post.new(uri.path)
    req["Content-Type"] = "application/json"
    req["Accept"] = "application/json"
    req.body = messages.to_json

    http.request(req)
  rescue => e
    Rails.logger.error("ExpoPushService error: #{e.message}")
    nil
  end
end
