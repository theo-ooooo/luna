Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users,
             path: "api/v1/auth",
             path_names: { sign_in: "login", sign_out: "logout", registration: "signup" },
             controllers: {
               registrations: "api/v1/registrations",
               sessions: "api/v1/sessions"
             }

  get "api/version", to: "api/version#show"

  namespace :api do
    namespace :v1 do
      post  "auth/check_email", to: "auth#check_email"

      get   "users/me",  to: "users#show"
      patch "users/me",  to: "users#update"

      resources :cycles, only: [:index, :create, :update, :destroy]
      resources :daily_logs, only: [:index, :create, :update, :destroy] do
        collection do
          get :bbt_history
          get :symptom_heatmap
        end
      end

      scope :stats do
        get "summary", to: "stats#summary", as: :stats_summary
      end

      scope :predictions do
        get "current",  to: "predictions#current",  as: :predictions_current
        get "history",  to: "predictions#history",  as: :predictions_history
      end

      scope :notifications do
        get  "/", to: "notifications#index",   as: :notifications
        put  "/", to: "notifications#replace", as: :notifications_replace
      end

      scope :push_tokens do
        put  "/",     to: "push_tokens#upsert",     as: :push_tokens_upsert
        post "test",  to: "push_tokens#test_push",  as: :push_tokens_test
      end

      scope :ai do
        post "chat",                      to: "ai#chat",                 as: :ai_chat
        post "parse_log",                 to: "ai#parse_log",            as: :ai_parse_log
        get  "conversations",             to: "ai#list_conversations",   as: :ai_conversations
        get  "conversations/:id",         to: "ai#show_conversation",    as: :ai_conversation
        get  "monthly_report",            to: "ai#monthly_report",       as: :ai_monthly_report
        get  "daily_insight",             to: "ai#daily_insight",        as: :ai_daily_insight
      end
    end
  end
end
