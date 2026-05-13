FactoryBot.define do
  factory :daily_log do
    association :user
    logged_on { Date.current }
    cramps { 0 }
    headache { 0 }
    fatigue { 1 }
    bloating { 0 }
    mood { 3 }
    discharge_type { "creamy" }
    bbt { 36.45 }
    lh_result { 0 }
  end
end
