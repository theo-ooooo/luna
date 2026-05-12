require 'rails_helper'

RSpec.describe PredictionService, type: :service do
  let(:user) { create(:user, cycle_length_default: 28, luteal_phase_length: 14) }
  subject(:service) { described_class.new(user) }

  describe "#compute!" do
    context "주기 데이터 없음" do
      it "기본값 28일로 예측 생성" do
        prediction = service.compute!
        expect(prediction.based_on_cycles_count).to eq(0)
        expect(prediction.avg_cycle_length).to eq(28.0)
      end
    end

    context "주기 1개" do
      let!(:cycle) do
        create(:cycle, user: user,
               started_on: 28.days.ago.to_date,
               ended_on: 23.days.ago.to_date)
      end

      it "1개 주기로 예측 생성" do
        prediction = service.compute!
        expect(prediction.based_on_cycles_count).to eq(1)
        expect(prediction.predicted_period_start).to eq(Date.current - 23.days + 1)
      end
    end

    context "주기 3개 가중평균" do
      before do
        [84, 56, 28].each_with_index do |days_ago, i|
          create(:cycle, user: user,
                 started_on: days_ago.days.ago.to_date,
                 ended_on: (days_ago - 5).days.ago.to_date)
        end
      end

      it "가중평균으로 avg_cycle_length 계산" do
        prediction = service.compute!
        expect(prediction.based_on_cycles_count).to eq(3)
        expect(prediction.avg_cycle_length).to be_a(BigDecimal)
      end

      it "fertile_start = ovulation - 2" do
        prediction = service.compute!
        expect(prediction.fertile_start).to eq(prediction.predicted_ovulation_on - 2.days)
      end

      it "fertile_end = ovulation + 1" do
        prediction = service.compute!
        expect(prediction.fertile_end).to eq(prediction.predicted_ovulation_on + 1.day)
      end
    end

    context "LH surge 기록 있음" do
      let!(:cycle) do
        create(:cycle, user: user,
               started_on: 20.days.ago.to_date,
               ended_on: nil)
      end

      before do
        create(:daily_log, user: user, logged_on: 6.days.ago.to_date, lh_result: 2)
      end

      it "observed_ovulation_on을 LH surge 날짜로 설정" do
        prediction = service.compute!
        expect(prediction.observed_ovulation_on).to eq(6.days.ago.to_date)
      end
    end

    context "BBT 급등 기록 있음" do
      let!(:cycle) do
        create(:cycle, user: user,
               started_on: 20.days.ago.to_date,
               ended_on: nil)
      end

      before do
        create(:daily_log, user: user, logged_on: 8.days.ago.to_date, bbt: 36.40, lh_result: nil)
        create(:daily_log, user: user, logged_on: 7.days.ago.to_date, bbt: 36.65, lh_result: nil)
      end

      it "observed_ovulation_on을 BBT 급등 날짜로 설정" do
        prediction = service.compute!
        expect(prediction.observed_ovulation_on).to eq(7.days.ago.to_date)
      end
    end
  end
end
