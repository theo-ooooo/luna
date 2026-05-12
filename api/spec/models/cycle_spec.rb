require 'rails_helper'

RSpec.describe Cycle, type: :model do
  let(:user) { create(:user) }

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_one(:prediction) }
  end

  describe "validations" do
    subject { build(:cycle, user: user) }
    it { is_expected.to validate_uniqueness_of(:started_on).scoped_to(:user_id) }
    it { is_expected.to validate_inclusion_of(:flow_level).in_range(1..3).allow_nil }

    it "rejects future started_on" do
      cycle = build(:cycle, user: user, started_on: Date.tomorrow)
      expect(cycle).not_to be_valid
    end

    it "rejects ended_on before started_on" do
      cycle = build(:cycle, user: user, started_on: 5.days.ago.to_date, ended_on: 10.days.ago.to_date)
      expect(cycle).not_to be_valid
    end
  end

  describe "#length_days" do
    it "returns nil when ended_on is nil" do
      cycle = build(:cycle, user: user, ended_on: nil)
      expect(cycle.length_days).to be_nil
    end

    it "calculates length correctly" do
      cycle = build(:cycle, user: user, started_on: 10.days.ago.to_date, ended_on: 5.days.ago.to_date)
      expect(cycle.length_days).to eq(6)
    end
  end
end
