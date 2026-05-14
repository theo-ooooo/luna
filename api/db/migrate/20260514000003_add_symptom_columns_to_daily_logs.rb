class AddSymptomColumnsToDailyLogs < ActiveRecord::Migration[8.1]
  def change
    add_column :daily_logs, :backache,           :boolean, null: false, default: false, comment: "요통 여부"
    add_column :daily_logs, :breast_pain,        :boolean, null: false, default: false, comment: "유방통 여부"
    add_column :daily_logs, :nausea,             :boolean, null: false, default: false, comment: "메스꺼움 여부"
    add_column :daily_logs, :acne,               :boolean, null: false, default: false, comment: "여드름 여부"
    add_column :daily_logs, :increased_appetite, :boolean, null: false, default: false, comment: "식욕증가 여부"
    add_column :daily_logs, :dizziness,          :boolean, null: false, default: false, comment: "어지러움 여부"
  end
end
