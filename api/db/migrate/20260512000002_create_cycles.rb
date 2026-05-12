class CreateCycles < ActiveRecord::Migration[8.1]
  def change
    create_table :cycles do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.date :started_on, null: false
      t.date :ended_on
      t.integer :flow_level

      t.timestamps null: false
    end

    add_index :cycles, [:user_id, :started_on], unique: true, name: "uq_cycles_user_started"
    add_index :cycles, [:user_id, :started_on], order: { started_on: :desc }, name: "idx_cycles_user_started"
  end
end
