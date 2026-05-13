module Api
  module V1
    class CyclesController < ApplicationController
      wrap_parameters false
      before_action :set_cycle, only: [:update, :destroy]

      def index
        page = (params[:page] || 1).to_i
        per = [[( params[:per] || 12).to_i, 24].min, 1].max

        cycles = current_user.cycles.order(started_on: :desc).page(page).per(per)

        success({
          cycles: cycles.map { |c| cycle_json(c) },
          meta: { total: cycles.total_count, page: page, per: per }
        })
      end

      def create
        cycle = current_user.cycles.create!(create_params)
        PredictionService.new(current_user).compute!
        success(cycle_json(cycle), status: :created)
      end

      def update
        @cycle.update!(update_params)
        PredictionService.new(current_user).compute! if @cycle.saved_change_to_ended_on?
        success(cycle_json(@cycle))
      end

      def destroy
        @cycle.destroy!
        success(nil)
      end

      private

      def set_cycle
        @cycle = current_user.cycles.find(params[:id])
      end

      def create_params
        params.permit(:started_on, :flow_level)
      end

      def update_params
        params.permit(:ended_on, :flow_level)
      end

      def cycle_json(cycle)
        {
          id: cycle.id,
          started_on: cycle.started_on,
          ended_on: cycle.ended_on,
          flow_level: cycle.flow_level,
          length_days: cycle.length_days,
          created_at: cycle.created_at
        }
      end
    end
  end
end
