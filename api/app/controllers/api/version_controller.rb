module Api
  class VersionController < ApplicationController
    skip_before_action :authenticate_user!

    def show
      version = File.read(Rails.root.join("VERSION")).strip
      success({
        api_version: "v1",
        app_version: version,
        env: Rails.env
      })
    end
  end
end
