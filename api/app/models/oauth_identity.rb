class OauthIdentity < ApplicationRecord
  belongs_to :user, inverse_of: :oauth_identities
  validates :provider, :uid, presence: true
  validates :uid, uniqueness: { scope: :provider }
end
