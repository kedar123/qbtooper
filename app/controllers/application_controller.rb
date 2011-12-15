 
class ApplicationController < ActionController::Base
  protect_from_forgery
  include Authentication::ControllerMethods
  require 'rubygems'
  require 'ooor'

end
