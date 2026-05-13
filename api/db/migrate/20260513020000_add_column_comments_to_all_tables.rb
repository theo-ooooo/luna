class AddColumnCommentsToAllTables < ActiveRecord::Migration[8.1]
  def change
    # users
    change_column_comment :users, :email,                  from: nil, to: "로그인 이메일"
    change_column_comment :users, :encrypted_password,     from: nil, to: "암호화된 비밀번호 (Devise)"
    change_column_comment :users, :jti,                    from: nil, to: "JWT 토큰 고유 식별자 (devise-jwt 블랙리스트용)"
    change_column_comment :users, :nickname,               from: nil, to: "앱 내 표시 이름 (최대 50자)"
    change_column_comment :users, :cycle_length_default,   from: nil, to: "기본 주기 길이(일), 주기 데이터 부족 시 예측 초기값으로 사용"
    change_column_comment :users, :luteal_phase_length,    from: nil, to: "황체기 길이(일), 배란일 역산에 사용 (기본 14일)"
    change_column_comment :users, :notifications_enabled,  from: nil, to: "푸시 알림 수신 여부"

    # cycles
    change_column_comment :cycles, :user_id,    from: nil, to: "소유 유저"
    change_column_comment :cycles, :started_on, from: nil, to: "생리 시작일"
    change_column_comment :cycles, :ended_on,   from: nil, to: "생리 종료일 (null이면 진행 중)"
    change_column_comment :cycles, :flow_level, from: nil, to: "출혈량 (1=가벼움, 2=보통, 3=많음)"

    # daily_logs
    change_column_comment :daily_logs, :user_id,        from: nil, to: "소유 유저"
    change_column_comment :daily_logs, :logged_on,      from: nil, to: "기록 날짜"
    change_column_comment :daily_logs, :mood,           from: nil, to: "기분 점수 (1=불안 ~ 5=좋음, null=미기록)"
    change_column_comment :daily_logs, :bbt,            from: nil, to: "기초체온 (℃, 소수점 2자리, null=미기록)"
    change_column_comment :daily_logs, :discharge_type, from: nil, to: "분비물 유형 (none/spotting/creamy/watery/egg_white, null=미기록)"
    change_column_comment :daily_logs, :cramps,         from: nil, to: "복통 강도 (0=없음, 1=약함, 2=강함)"
    change_column_comment :daily_logs, :bloating,       from: nil, to: "부종 여부 (0=없음, 1=있음)"
    change_column_comment :daily_logs, :fatigue,        from: nil, to: "피로 여부 (0=없음, 1=있음)"
    change_column_comment :daily_logs, :headache,       from: nil, to: "두통 여부 (0=없음, 1=있음)"
    change_column_comment :daily_logs, :lh_result,      from: nil, to: "LH 배란 테스트 결과 (0=음성, 1=양성, null=미기록)"
    change_column_comment :daily_logs, :notes,          from: nil, to: "자유 메모"

    # predictions
    change_column_comment :predictions, :user_id,                  from: nil, to: "소유 유저"
    change_column_comment :predictions, :cycle_id,                 from: nil, to: "예측 기준 주기 (주기 삭제 시 null)"
    change_column_comment :predictions, :avg_cycle_length,         from: nil, to: "예측에 사용된 평균 주기 길이(일)"
    change_column_comment :predictions, :based_on_cycles_count,    from: nil, to: "평균 계산에 사용된 주기 수"
    change_column_comment :predictions, :computed_at,              from: nil, to: "예측 계산 시각"
    change_column_comment :predictions, :predicted_period_start,   from: nil, to: "예측 다음 생리 시작일"
    change_column_comment :predictions, :predicted_ovulation_on,   from: nil, to: "예측 배란일 (다음 생리일 - 황체기 길이)"
    change_column_comment :predictions, :observed_ovulation_on,    from: nil, to: "실측 배란일 (BBT 급등 또는 LH surge 기반, null=미확인)"
    change_column_comment :predictions, :fertile_start,            from: nil, to: "임신 가능 기간 시작일"
    change_column_comment :predictions, :fertile_end,              from: nil, to: "임신 가능 기간 종료일"

    # push_tokens
    change_column_comment :push_tokens, :user_id,  from: nil, to: "소유 유저"
    change_column_comment :push_tokens, :token,    from: nil, to: "디바이스 푸시 토큰 (최대 512자)"
    change_column_comment :push_tokens, :platform, from: nil, to: "플랫폼 (ios/android)"

    # ai_conversations
    change_column_comment :ai_conversations, :user_id,          from: nil, to: "소유 유저"
    change_column_comment :ai_conversations, :messages,         from: nil, to: "대화 메시지 배열 [{role, content, ts}]"
    change_column_comment :ai_conversations, :context_snapshot, from: nil, to: "대화 시점의 사용자 건강 컨텍스트 스냅샷"

    # ai_monthly_reports
    change_column_comment :ai_monthly_reports, :user_id,      from: nil, to: "소유 유저"
    change_column_comment :ai_monthly_reports, :year,         from: nil, to: "리포트 연도"
    change_column_comment :ai_monthly_reports, :month,        from: nil, to: "리포트 월 (1~12)"
    change_column_comment :ai_monthly_reports, :summary,      from: nil, to: "AI 생성 월간 요약 텍스트"
    change_column_comment :ai_monthly_reports, :stats,        from: nil, to: "월간 통계 데이터 (JSONB)"
    change_column_comment :ai_monthly_reports, :stale,        from: nil, to: "캐시 무효화 여부 (true이면 다음 조회 시 AI 재생성)"
    change_column_comment :ai_monthly_reports, :generated_at, from: nil, to: "리포트 AI 생성 시각"
  end
end
