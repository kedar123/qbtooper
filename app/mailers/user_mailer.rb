class UserMailer < ActionMailer::Base
  default :from => "ben@cheqbook.com"

  def registration_confirmation(user)
    @user = user
    mail(:to => "#{user.name} <#{user.email}>", :subject => "Registered")
  end

  def access_granted(user)
    @user = user
    mail(:to => "#{user.name} <#{user.email}>", :subject => "Access Granted")
  end

  def access_removed(role)
    @role = role
    mail(:to => "<#{role.recipient_email}>", :subject => "Access Removed")
  end
end
