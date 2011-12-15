# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)

Rails.root.join('db/seeds').children.each do |child|
  next if child.basename.to_s.starts_with? '.'

  begin
    puts "** Importing #{child.basename}"
    SeedFile.import(child)
  rescue NameError => e
    abort "!! #{e}"
  end
end

puts "** Creating account type tags"
AccountType.find(:all).each do |at|
  Tag.find_or_create_by_normalized_name(at.name)
end
