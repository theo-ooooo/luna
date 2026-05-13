require 'rails_helper'

RSpec.describe DailyLog, type: :model do
  let(:user) { create(:user) }

  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    subject { build(:daily_log, user: user) }
    it { is_expected.to validate_uniqueness_of(:logged_on).scoped_to(:user_id) }
    it { is_expected.to validate_inclusion_of(:discharge_type).in_array(DailyLog::DISCHARGE_TYPES).allow_nil }
    it { is_expected.to validate_numericality_of(:cramps).is_in(0..3) }
    it { is_expected.to validate_numericality_of(:mood).is_in(1..5).allow_nil }

    it "rejects future logged_on" do
      log = build(:daily_log, user: user, logged_on: Date.tomorrow)
      expect(log).not_to be_valid
    end

    it "rejects bbt below 35.0" do
      log = build(:daily_log, user: user, bbt: 34.9)
      expect(log).not_to be_valid
    end

    it "accepts bbt in normal range" do
      log = build(:daily_log, user: user, bbt: 36.75)
      expect(log).to be_valid
    end
  end
end
