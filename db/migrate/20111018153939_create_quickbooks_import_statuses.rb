class CreateQuickbooksImportStatuses < ActiveRecord::Migration
  
  def self.up
    create_table :quickbooks_import_statuses do |t|
      t.string :username
      t.string :password
      t.string :querystatus
      t.integer :returnqid
      t.string  :token
      t.string  :queryretstatus
      t.text    :continueid 
      t.integer :iteratorremaining
      t.integer :company_id 
      t.timestamps
    
    end
  end

  def self.down
    drop_table :quickbooks_import_statuses
  end
end
