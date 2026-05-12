FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { "password123" }
    nickname { Faker::Name.first_name }
    cycle_length_default { 28 }
    luteal_phase_length { 14 }
    notifications_enabled { true }
  end
end
