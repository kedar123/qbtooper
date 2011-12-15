 class CreateUser < ActiveRecord::Migration
 
  def self.up
    create_table :users do |t|
    t.string   "username",              :limit => 64,                    :null => false
    t.string   "salt",                  :limit => 16
    t.string   "password_hash",         :limit => 64
    t.string   "name",                  :limit => 32
    t.datetime "last_web_login"
    t.datetime "last_api_login"
    t.integer  "status",                              :default => 0,     :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "postal_code",           :limit => 32
    t.integer  "country_id"
    t.string   "photo_key",             :limit => 16
    t.string   "feed_key"
    t.string   "goals_key"
    t.string   "email"
    t.string   "security_answers_hash", :limit => 64
    t.string   "encrypted_account_key", :limit => 96
    t.integer  "membership_type",                     :default => 0
    t.datetime "membership_expiration"
    t.string   "default_currency",      :limit => 3
    t.string   "normalized_name"
    t.boolean  "ignore_subnet",                       :default => false
    t.datetime "bozo_since"
    t.date     "last_upload_date"
    t.integer  "cobrand_id"
    t.integer  "bad_email"
    t.string   "uid",                   :limit => 64,                    :null => false
    t.string   "time_zone"
    t.string   "account_key"
    t.integer  "invitation_id"
    t.integer  "invitation_limit"
    
    end
  end

  def self.down
    drop_table :users
  end
end
