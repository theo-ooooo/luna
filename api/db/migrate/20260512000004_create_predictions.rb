class CreatePredictions < ActiveRecord::Migration[8.1]
  def change
    create_table :predictions do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :cycle, foreign_key: { on_delete: :nullify }

      t.date :predicted_period_start, null: false
      t.date :predicted_ovulation_on, null: false
      t.date :fertile_start, null: false
      t.date :fertile_end, null: false

      t.integer :based_on_cycles_count, null: false
      t.decimal :avg_cycle_length, precision: 5, scale: 2, null: false

      t.date :observed_ovulation_on

      t.datetime :computed_at, null: false
    end

    add_index :predictions, [:user_id, :computed_at], order: { computed_at: :desc }, name: "idx_predictions_user"
  end
end
