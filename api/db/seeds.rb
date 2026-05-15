# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

unless AppVersion.exists?
  AppVersion.create!(
    ios_latest_version: '1.0.3',
    ios_min_version: '1.0.0',
    ios_store_url: 'https://apps.apple.com/app/id6769269495',
    android_latest_version: '1.0.3',
    android_min_version: '1.0.0',
    android_store_url: nil
  )
end
