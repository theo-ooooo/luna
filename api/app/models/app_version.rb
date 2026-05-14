class AppVersion < ApplicationRecord
  validates :latest_version, :min_version, presence: true

  def self.instance
    first_or_create!(latest_version: '1.0.0', min_version: '1.0.0')
  end
end
