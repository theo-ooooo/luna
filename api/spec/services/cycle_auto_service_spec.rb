require 'rails_helper'

RSpec.describe CycleAutoService, type: :service do
  let(:user) { create(:user) }
  let(:today) { Date.current }

  # DailyLog 에는 flow_level 컬럼이 없으므로 싱글턴 메서드로 주입한다.
  def build_log(logged_on:, flow_level:)
    log = build(:daily_log, user: user, logged_on: logged_on)
    log.define_singleton_method(:flow_level) { flow_level }
    log.define_singleton_method(:id) { 0 }
    log
  end

  subject(:service) { described_class.new(user) }

  describe "#call" do
    # ───────────────────────────────────────────────
    # 1. flow_level nil / 0 → 조기 반환
    # ───────────────────────────────────────────────

    context "flow_level 가 nil 인 경우" do
      it "조기 반환하며 주기를 생성하지 않는다" do
        log = build_log(logged_on: today, flow_level: nil)
        expect { service.call(log) }.not_to change { user.cycles.count }
      end
    end

    context "flow_level 이 0 인 경우" do
      it "조기 반환하며 주기를 생성하지 않는다" do
        log = build_log(logged_on: today, flow_level: 0)
        expect { service.call(log) }.not_to change { user.cycles.count }
      end
    end

    # ───────────────────────────────────────────────
    # 2. 이미 열린 주기 존재 → 조기 반환
    # ───────────────────────────────────────────────

    context "log.logged_on 이전에 시작된 열린(ended_on nil) 주기가 이미 존재하는 경우 (진행 중 중복 방지)" do
      before do
        # started_on <= log.logged_on, ended_on nil → 가드 발동 (중복 방지)
        create(:cycle, user: user, started_on: 3.days.ago.to_date, ended_on: nil)
      end

      it "조기 반환하며 새 주기를 생성하지 않는다" do
        log = build_log(logged_on: today, flow_level: 2)
        expect { service.call(log) }.not_to change { user.cycles.count }
      end

      it "열려 있는 주기를 닫지 않는다" do
        log = build_log(logged_on: today, flow_level: 2)
        service.call(log)
        expect(user.cycles.find_by(started_on: 3.days.ago.to_date).ended_on).to be_nil
      end
    end

    # ───────────────────────────────────────────────
    # 3. 이전 주기 없음 → 새 주기 생성
    # ───────────────────────────────────────────────

    context "열린 주기가 없고 이전 주기도 없는 경우" do
      it "log.logged_on 으로 새 주기를 생성한다" do
        log = build_log(logged_on: today, flow_level: 2)
        expect { service.call(log) }.to change { user.cycles.count }.by(1)
        expect(user.cycles.find_by(started_on: today)).to be_present
      end

      it "같은 날짜로 두 번 호출해도 주기가 중복 생성되지 않는다 (find_or_create_by!)" do
        log = build_log(logged_on: today, flow_level: 2)
        service.call(log)
        expect { service.call(log) }.not_to change { user.cycles.count }
      end
    end

    # ───────────────────────────────────────────────
    # 4. started_on < log.logged_on 인 열린 주기 → 가드 발동, 조기 반환
    #    (가드: where(ended_on: nil).where("started_on <= ?", log.logged_on))
    # ───────────────────────────────────────────────

    context "log 날짜 이전에 시작된 열린(ended_on nil) 주기가 있는 경우" do
      let!(:active_cycle) do
        create(:cycle, user: user, started_on: 30.days.ago.to_date, ended_on: nil)
      end

      it "가드에 의해 조기 반환되어 새 주기를 생성하지 않는다" do
        log = build_log(logged_on: today, flow_level: 2)
        expect { service.call(log) }.not_to change { user.cycles.count }
      end

      it "열려 있는 주기를 자동으로 닫지 않는다" do
        log = build_log(logged_on: today, flow_level: 2)
        service.call(log)
        expect(active_cycle.reload.ended_on).to be_nil
      end
    end

    # ───────────────────────────────────────────────
    # 4b. 이전 주기가 이미 닫혀 있는 경우 (ended_on 존재)
    #     → prev_cycle.ended_on.nil? == false 이므로 닫기 스킵, 새 주기 생성
    # ───────────────────────────────────────────────

    context "이전 주기가 닫혀(ended_on 있음) 있는 경우" do
      let!(:prev_cycle) do
        create(:cycle, user: user,
               started_on: 30.days.ago.to_date,
               ended_on: 25.days.ago.to_date)
      end

      it "이전 주기의 ended_on 을 변경하지 않는다" do
        original_ended_on = prev_cycle.ended_on
        log = build_log(logged_on: today, flow_level: 2)
        service.call(log)
        expect(prev_cycle.reload.ended_on).to eq(original_ended_on)
      end

      it "새 주기를 생성한다" do
        log = build_log(logged_on: today, flow_level: 2)
        expect { service.call(log) }.to change { user.cycles.count }.by(1)
        expect(user.cycles.find_by(started_on: today)).to be_present
      end
    end

    # ───────────────────────────────────────────────
    # 5. FLOW_MAP 매핑
    # ───────────────────────────────────────────────

    describe "FLOW_MAP 매핑" do
      {
        1 => 1,
        2 => 1,
        3 => 2,
        4 => 3
      }.each do |input_level, expected_level|
        it "flow_level #{input_level} → Cycle#flow_level #{expected_level} 로 저장된다" do
          log = build_log(logged_on: today, flow_level: input_level)
          service.call(log)
          cycle = user.cycles.find_by(started_on: today)
          expect(cycle.flow_level).to eq(expected_level)
        end
      end

      it "FLOW_MAP 에 없는 flow_level(예: 5) 은 기본값 1 로 저장된다" do
        log = build_log(logged_on: today, flow_level: 5)
        service.call(log)
        expect(user.cycles.find_by(started_on: today).flow_level).to eq(1)
      end
    end

    # ───────────────────────────────────────────────
    # 6. RecordInvalid 예외 처리
    # ───────────────────────────────────────────────

    context "ActiveRecord::RecordInvalid 가 발생하는 경우" do
      before do
        allow(user.cycles).to receive(:find_or_create_by!)
          .and_raise(ActiveRecord::RecordInvalid.new(Cycle.new))
      end

      it "예외를 raise 하지 않는다" do
        log = build_log(logged_on: today, flow_level: 2)
        expect { service.call(log) }.not_to raise_error
      end

      it "Rails.logger.warn 을 [CycleAutoService] 접두어와 함께 호출한다" do
        log = build_log(logged_on: today, flow_level: 2)
        expect(Rails.logger).to receive(:warn).with(/\[CycleAutoService\]/)
        service.call(log)
      end
    end

    # ───────────────────────────────────────────────
    # PredictionService 연동
    # ───────────────────────────────────────────────

    context "주기 생성 성공 시" do
      it "PredictionService#compute! 를 호출한다" do
        prediction_double = instance_double(PredictionService)
        allow(PredictionService).to receive(:new).with(user).and_return(prediction_double)
        allow(prediction_double).to receive(:compute!)

        log = build_log(logged_on: today, flow_level: 2)
        service.call(log)

        expect(prediction_double).to have_received(:compute!)
      end
    end

    context "조기 반환되는 경우 (log 날짜를 포함하는 active cycle 존재)" do
      before { create(:cycle, user: user, started_on: 3.days.ago.to_date, ended_on: nil) }

      it "PredictionService#compute! 를 호출하지 않는다" do
        expect(PredictionService).not_to receive(:new)
        log = build_log(logged_on: today, flow_level: 2)
        service.call(log)
      end
    end
  end
end
