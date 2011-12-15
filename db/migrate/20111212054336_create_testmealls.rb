class CreateTestmealls < ActiveRecord::Migration
  def self.up
    create_table :testmealls do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :testmealls
  end
end
