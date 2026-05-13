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

  describe "#check_period_end" do
    # ───────────────────────────────────────────────
    # 1. 조기 반환 케이스
    # ───────────────────────────────────────────────

    context "flow_level 이 0 이 아닌 경우" do
      it "flow_level > 0 이면 아무것도 하지 않는다" do
        create(:cycle, user: user, started_on: 5.days.ago.to_date, ended_on: nil)
        log = build_log(logged_on: today, flow_level: 2)
        expect { service.check_period_end(log) }.not_to change { user.cycles.reload; user.cycles.first.ended_on }
      end

      it "flow_level nil 이면 아무것도 하지 않는다" do
        create(:cycle, user: user, started_on: 5.days.ago.to_date, ended_on: nil)
        log = build_log(logged_on: today, flow_level: nil)
        expect { service.check_period_end(log) }.not_to change { user.cycles.count }
      end
    end

    context "활성 주기가 없는 경우" do
      it "아무것도 하지 않는다" do
        log = build_log(logged_on: today, flow_level: 0)
        expect { service.check_period_end(log) }.not_to change { user.cycles.count }
      end
    end

    context "활성 주기가 2일 미만 지속된 경우" do
      it "logged_on - started_on < 2 이면 종료하지 않는다" do
        cycle = create(:cycle, user: user, started_on: today - 1, ended_on: nil)
        log = build_log(logged_on: today, flow_level: 0)
        service.check_period_end(log)
        expect(cycle.reload.ended_on).to be_nil
      end
    end

    # ───────────────────────────────────────────────
    # 2. 소급 기록 가드
    # ───────────────────────────────────────────────

    context "log.logged_on 이후에 flow_level > 0 기록이 존재하는 경우 (소급 종료 방지)" do
      let!(:active_cycle) { create(:cycle, user: user, started_on: 7.days.ago.to_date, ended_on: nil) }

      before do
        # log.logged_on(3일 전) 이후인 2일 전에 flow > 0 기록 존재
        later_log = build(:daily_log, user: user, logged_on: 2.days.ago.to_date)
        later_log.define_singleton_method(:flow_level) { 2 }
        allow(@user.daily_logs).to receive(:where).and_call_original
        # DailyLog 픽스처로 실제 DB 레코드 생성
        create(:daily_log, user: user, logged_on: 2.days.ago.to_date)
        allow_any_instance_of(ActiveRecord::Relation).to receive(:where).and_call_original
      end

      it "ended_on 을 설정하지 않는다" do
        # 실제 DB 레코드로 테스트
        later_dl = user.daily_logs.find_by(logged_on: 2.days.ago.to_date)
        later_dl.update_columns(flow_level: 2) rescue nil

        log = build_log(logged_on: 3.days.ago.to_date, flow_level: 0)
        service.check_period_end(log)
        expect(active_cycle.reload.ended_on).to be_nil
      end
    end

    # ───────────────────────────────────────────────
    # 3. 정상 종료 (happy path)
    # ───────────────────────────────────────────────

    context "2일 이상 지속된 활성 주기에 flow_level=0 기록이 들어온 경우" do
      let!(:active_cycle) { create(:cycle, user: user, started_on: 5.days.ago.to_date, ended_on: nil) }

      it "ended_on 을 log.logged_on - 1 로 설정한다" do
        log = build_log(logged_on: today, flow_level: 0)
        service.check_period_end(log)
        expect(active_cycle.reload.ended_on).to eq(today - 1)
      end

      it "PredictionService#compute! 를 호출한다" do
        prediction_double = instance_double(PredictionService)
        allow(PredictionService).to receive(:new).with(user).and_return(prediction_double)
        allow(prediction_double).to receive(:compute!)

        log = build_log(logged_on: today, flow_level: 0)
        service.check_period_end(log)

        expect(prediction_double).to have_received(:compute!)
      end
    end

    # ───────────────────────────────────────────────
    # 4. 예외 처리
    # ───────────────────────────────────────────────

    context "ActiveRecord::RecordInvalid 가 발생하는 경우" do
      let!(:active_cycle) { create(:cycle, user: user, started_on: 5.days.ago.to_date, ended_on: nil) }

      before do
        allow_any_instance_of(Cycle).to receive(:update!).and_raise(ActiveRecord::RecordInvalid.new(Cycle.new))
      end

      it "예외를 raise 하지 않는다" do
        log = build_log(logged_on: today, flow_level: 0)
        expect { service.check_period_end(log) }.not_to raise_error
      end

      it "Rails.logger.warn 을 [CycleAutoService] 접두어와 함께 호출한다" do
        log = build_log(logged_on: today, flow_level: 0)
        expect(Rails.logger).to receive(:warn).with(/\[CycleAutoService\]/)
        service.check_period_end(log)
      end
    end
  end
end
