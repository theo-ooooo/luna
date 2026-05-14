class ExpoPushService
  EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

  def self.send_to_user(user, title:, body:, data: {})
    tokens = user.push_tokens.pluck(:token)
    return if tokens.empty?

    messages = tokens.map { |t| { to: t, title: title, body: body, data: data } }
    post_and_cleanup(messages)
  end

  def self.post_and_cleanup(messages)
    uri = URI(EXPO_PUSH_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10

    req = Net::HTTP::Post.new(uri.path)
    req["Content-Type"] = "application/json"
    req["Accept"] = "application/json"
    req.body = messages.to_json

    res = http.request(req)
    body = JSON.parse(res.body)

    Array(body["data"]).each_with_index do |result, i|
      next unless result["status"] == "error" && result.dig("details", "error") == "DeviceNotRegistered"

      stale_token = messages[i][:to]
      PushToken.where(token: stale_token).destroy_all
      Rails.logger.info("ExpoPushService: removed stale token #{stale_token.first(20)}...")
    end
  rescue => e
    Rails.logger.error("ExpoPushService error: #{e.message}")
    nil
  end
end
