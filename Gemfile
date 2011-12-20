source :gemcutter
gem 'rake', '0.8.7'
# Regular gems
gem 'rails',             '3.0.7'
gem 'resque'
gem 'resque-scheduler', :require => 'resque_scheduler', :git => 'git://github.com/bvandenbos/resque-scheduler'
gem 'daemon_controller', '0.2.5'
gem 'json'
#gem 'actionwebservice'
#gem 'actionservice'
gem 'chronic',           '0.2.3'
#gem 'memcache-client',              :require => 'memcache'
gem 'rchardet',          '1.3.99', :git => 'git://github.com/jmhodges/rchardet.git'
gem 'dalli'
gem 'mime-types',                   :require => 'mime/types'
gem 'rest-client',                  :require => 'rest_client'
gem 'rubyzip',                      :require => 'zip/zip'
gem 'libxml-ruby',                  :require => 'xml/libxml'
gem 'daemons'
#gem 'rdoc'
gem 'thor' # for imports
gem 'unicorn' # faster development server
gem 'jquery-rails'
gem 'yui-compressor', :git => "git://github.com/oleander/ruby-yui-compressor.git", :require  => "yui/compressor"
gem "jammit", :git => "git://github.com/documentcloud/jammit.git"
gem 'wicked_pdf' # PDF generation

gem "nifty-generators", :group => :development
gem 'choices'
gem 'client_side_validations'
gem 'paperclip'
gem 'aws-s3'
gem 'actionwebservice', :git => "git://github.com/dnordberg/actionwebservice.git"
gem 'soap4r' ,:git=>"git://github.com/KarateCode/soap4r.git"

gem 'hoe', '~> 2.6.1' # Heroku's rubygems is too old for hoe 2.9.1 as of 28 Mar 2011

#yodlee_dev = File.expand_path("../../yodlee", __FILE__)
#if File.exist?(yodlee_dev)
#  gem "yodlee", :path => yodlee_dev
#else
 # gem "yodlee", :git => "git@github.com:cheqbook/yodlee.git"
#end

gem "nori", :git => "https://github.com/cdavaz/nori.git"

group :development, :test do
  gem 'mysql2', '~> 0.2.7'
  gem 'rspec-rails',     '>= 2.0.1'
end

group :production do
  gem 'redis'
end
gem 'xml-simple'

group :development, :test do
  gem 'mysql2', '~> 0.2.7'
  gem 'ruby-debug19'
end

group :test do
  gem 'webmock'
  gem 'ruby-debug19'
  gem 'machinist'
  gem 'faker'
  gem 'webrat'
  gem 'mocha'
end

gem 'chargify_api_ares', '0.4.0'
gem 'ooor'