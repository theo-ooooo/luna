module Api
  class VersionController < ApplicationController
    skip_before_action :authenticate_user!

    def show
      av = AppVersion.instance
      success({
        api_version: "v1",
        latest_version: av.latest_version,
        min_version: av.min_version,
        env: Rails.env
      })
    end
  end
end
