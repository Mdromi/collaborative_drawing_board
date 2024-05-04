class CreateBoards < ActiveRecord::Migration[7.1]
  def change
    create_table :boards do |t|
      t.string :username

      t.timestamps
    end
  end
end
