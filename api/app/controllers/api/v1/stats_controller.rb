module Api
  module V1
    class StatsController < ApplicationController
      def summary
        cycles  = current_user.cycles.recent(6)
        lengths = cycles.map(&:length_days).compact

        avg_bleed = if lengths.any?
          (lengths.sum.to_f / lengths.size).round(1)
        end

        cycle_date_range = cycles.map(&:started_on).minmax
        avg_bbt = if cycle_date_range.first
          current_user.daily_logs
            .where(logged_on: cycle_date_range.first..Date.current)
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
