class CycleAutoService
  def initialize(user)
    @user = user
  end

  def call(log)
    return unless log.flow_level.present? && log.flow_level > 0

    active = @user.cycles.where(ended_on: nil).where("started_on <= ?", log.logged_on).first
    return if active

    prev_cycle = @user.cycles.where("started_on < ?", log.logged_on).order(started_on: :desc).first
    if prev_cycle && prev_cycle.ended_on.nil?
      prev_cycle.update!(ended_on: log.logged_on - 1)
    end

    cycle_flow = { 1 => 1, 2 => 1, 3 => 2, 4 => 3 }.fetch(log.flow_level, 1)
    @user.cycles.find_or_create_by!(started_on: log.logged_on) do |c|
      c.flow_level = cycle_flow
    end

    PredictionService.new(@user).compute!
  rescue ActiveRecord::RecordInvalid
    nil
  end
end
