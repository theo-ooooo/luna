class AppVersion < ApplicationRecord
  validates :ios_latest_version, :ios_min_version, :android_latest_version, :android_min_version, presence: true

  def self.latest
    order(created_at: :desc).limit(1).first
  end
end
