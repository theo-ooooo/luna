module Api
  module V1
    class StatsController < ApplicationController
      def summary
        cycles  = current_user.cycles.recent(6)
        lengths = cycles.map(&:length_days).compact

        avg_bleed = if lengths.any?
          (lengths.sum.to_f / lengths.size).round(1)
        end

        # Include open (in-progress) cycle in BBT range
        open_cycle = current_user.cycles.where(ended_on: nil).order(started_on: :desc).first
        completed_start = cycles.map(&:started_on).min
        bbt_from = [open_cycle&.started_on, completed_start].compact.min
        avg_bbt = if bbt_from
          current_user.daily_logs
            .where(logged_on: bbt_from..Date.current)
            .where.not(bbt: nil)
            .average(:bbt)&.to_f&.round(2)
        end

        regularity_pct = if lengths.size >= 2
          mean = lengths.sum.to_f / lengths.size
          std  = Math.sqrt(lengths.map { |l| (l - mean)**2 }.sum / lengths.size)
          [100 - ((std / mean) * 100).round, 0].max
        end

        success({
          avg_bleed_days:  avg_bleed,
          avg_bbt:         avg_bbt,
          regularity_pct:  regularity_pct
        })
      end
    end
  end
end
