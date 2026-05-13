class AddPeriodTrackingFields < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :period_length_default, :integer, default: 5, null: false,
               comment: "평균 생리 기간(일), 종료일 추정에 사용 (기본 5일)"

    add_column :daily_logs, :flow_level, :integer,
               comment: "출혈량 (0=없음, 1=점출혈, 2=적음, 3=보통, 4=많음, null=미기록)"
  end
end
