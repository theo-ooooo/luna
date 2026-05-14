module Api
  class VersionController < ApplicationController
    skip_before_action :authenticate_user!

    def show
      av = AppVersion.latest
      success({
        api_version: "v1",
        ios: { latest_version: av.ios_latest_version, min_version: av.ios_min_version, store_url: av.ios_store_url },
        android: { latest_version: av.android_latest_version, min_version: av.android_min_version, store_url: av.android_store_url },
        env: Rails.env
      })
    end
  end
end
