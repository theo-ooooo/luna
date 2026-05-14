require 'net/http'

# Apple Sign In 서비스
# Apple의 공개키로 identity token을 검증하고 apple_uid, email을 추출합니다.
class AppleSignInService
  APPLE_KEYS_URI = "https://appleid.apple.com/auth/keys"
  APPLE_ISSUER   = "https://appleid.apple.com"
  APPLE_AUD      = "com.theo.luna"

  # Solid Cache 미설치 환경에서도 동작하는 in-process 캐시 (1시간 TTL)
  JWKS_CACHE = ActiveSupport::Cache::MemoryStore.new(expires_in: 1.hour)

  # identity_token (JWT 문자열) 을 검증하고 { apple_uid:, email: } 반환
  # 검증 실패 시 예외 발생
  def self.verify(identity_token)
    new(identity_token).call
  end

  def initialize(identity_token)
    @identity_token = identity_token
  end

  def call
    header = decode_header
    jwk    = find_jwk(header["kid"])
    payload = decode_payload(jwk)

    { apple_uid: payload["sub"], email: payload["email"]&.downcase&.strip }
  rescue JWT::DecodeError => e
    raise AppleSignInError, "토큰 검증 실패: #{e.message}"
  end

  private

  def decode_header
    encoded_header = @identity_token.split(".").first
    JSON.parse(Base64.urlsafe_decode64(encoded_header + "=="))
  rescue StandardError
    raise AppleSignInError, "토큰 헤더 파싱 실패"
  end

  def find_jwk(kid)
    jwks = fetch_apple_keys
    jwk  = jwks.find { |k| k["kid"] == kid }
    raise AppleSignInError, "매칭되는 Apple 공개키를 찾을 수 없습니다." unless jwk
    jwk
  end

  def fetch_apple_keys
    JWKS_CACHE.fetch("apple_jwks") do
      uri      = URI.parse(APPLE_KEYS_URI)
      http     = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.open_timeout = 5
      http.read_timeout = 5
      response = http.get(uri.path)
      raise AppleSignInError, "Apple 공개키 조회 실패 (#{response.code})" unless response.is_a?(Net::HTTPSuccess)

      JSON.parse(response.body)["keys"]
    end
  rescue Net::OpenTimeout, Net::ReadTimeout
    raise AppleSignInError, "Apple 공개키 조회 타임아웃"
  end

  def decode_payload(jwk)
    public_key = jwt_key_from_jwk(jwk)

    payload, _header = JWT.decode(
      @identity_token,
      public_key,
      true,
      algorithms: [ jwk["alg"] || "RS256" ],
      iss: APPLE_ISSUER,
      verify_iss: true,
      aud: APPLE_AUD,
      verify_aud: true
    )
    payload
  end

  # JWK → OpenSSL::PKey::RSA 변환
  def jwt_key_from_jwk(jwk)
    key_data = {
      kty: jwk["kty"],
      n:   jwk["n"],
      e:   jwk["e"]
    }
    JWT::JWK.import(key_data).public_key
  end
end

class AppleSignInError < StandardError; end
