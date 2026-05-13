FactoryBot.define do
  sequence(:cycle_start_offset) { |n| (n * 30) + 30 }

  factory :cycle do
    association :user
    started_on { generate(:cycle_start_offset).days.ago.to_date }
    ended_on { started_on + 5.days }
    flow_level { 2 }
  end

  trait :ongoing do
    ended_on { nil }
  end

  trait :recent do
    started_on { 5.days.ago.to_date }
    ended_on { nil }
  end
end
