Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users,
             path: "api/v1/auth",
             path_names: { sign_in: "login", sign_out: "logout", registration: "signup" },
             controllers: {
               registrations: "api/v1/registrations",
               sessions: "api/v1/sessions"
             }

  namespace :api do
    namespace :v1 do
      get   "users/me",  to: "users#show"
      patch "users/me",  to: "users#update"

      resources :cycles, only: [:index, :create, :update, :destroy]
      resources :daily_logs, only: [:index, :create, :update, :destroy]

      scope :predictions do
        get "current",  to: "predictions#current",  as: :predictions_current
        get "history",  to: "predictions#history",  as: :predictions_history
      end

      scope :ai do
        post "chat",                      to: "ai#chat",              as: :ai_chat
        get  "conversations/:id",         to: "ai#show_conversation", as: :ai_conversation
        get  "monthly_report",            to: "ai#monthly_report",    as: :ai_monthly_report
      end
    end
  end
end
