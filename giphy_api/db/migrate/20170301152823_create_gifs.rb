class CreateGifs < ActiveRecord::Migration[5.0]
  def change
    create_table :gifs do |t|
      t.string :name
      t.string :url
      t.references :user

      t.timestamps
    end
  end
end
