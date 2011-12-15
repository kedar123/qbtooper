# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20111018153940) do

  create_table "quickbooks_import_statuses", :force => true do |t|
    t.string   "username"
    t.string   "password"
    t.string   "querystatus"
    t.integer  "returnqid"
    t.string   "token"
    t.string   "queryretstatus"
    t.text     "continueid"
    t.integer  "iteratorremaining"
    t.integer  "company_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
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
