module RequestHelpers
  def auth_headers(user)
    post "/api/v1/auth/login",
         params: { user: { email: user.email, password: user.password } },
         as: :json

    token = response.parsed_body.dig("data", "token")
    { "Authorization" => "Bearer #{token}" }
  end
end
