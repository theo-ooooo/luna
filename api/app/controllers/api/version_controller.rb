module Api
  class VersionController < ApplicationController
    skip_before_action :authenticate_user!

    def show
      version = File.read(Rails.root.join("VERSION")).strip
      min_version = ENV.fetch("APP_MIN_VERSION", "1.0.0")
      success({
        api_version: "v1",
        latest_version: version,
        min_version: min_version,
        env: Rails.env
      })
    end
  end
end
