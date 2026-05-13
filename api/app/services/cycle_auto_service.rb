class CycleAutoService
  FLOW_MAP = { 1 => 1, 2 => 1, 3 => 2, 4 => 3 }.freeze

  def initialize(user)
    @user = user
  end

  def call(log)
    return unless log.flow_level.present? && log.flow_level > 0

    # Skip if a cycle already started on the same day (idempotent)
    return if @user.cycles.where(started_on: log.logged_on, ended_on: nil).exists?

    # Auto-close the previous cycle if it was left open
    prev_cycle = @user.cycles.where("started_on < ?", log.logged_on).order(started_on: :desc).first
    prev_cycle.update!(ended_on: log.logged_on - 1) if prev_cycle && prev_cycle.ended_on.nil?

    @user.cycles.find_or_create_by!(started_on: log.logged_on) do |c|
      c.flow_level = FLOW_MAP.fetch(log.flow_level, 1)
    end

    PredictionService.new(@user).compute!
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.warn("[CycleAutoService] failed for user=#{@user.id} log=#{log.id}: #{e.message}")
  end

  def check_period_end(log)
    return unless log.flow_level == 0
    active = @user.cycles.where(ended_on: nil)
                         .where("started_on <= ?", log.logged_on)
                         .order(started_on: :desc)
                         .first
    return unless active
    # Only auto-close if period has been active for at least 2 days (logged_on - started_on >= 2)
    return if (log.logged_on - active.started_on).to_i < 2
    # Don't close if there are flow > 0 logs after this date (retroactive record)
    return if @user.daily_logs.where("logged_on > ?", log.logged_on).where("flow_level > 0").exists?
    active.update!(ended_on: log.logged_on - 1)
    PredictionService.new(@user).compute!
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.warn("[CycleAutoService] check_period_end failed for user=#{@user.id}: #{e.message}")
  end
end
