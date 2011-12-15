class InviteMailer < ActionMailer::Base
  default from: "ben@cheqbook.com"

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.mailer.invitation.subject
  #
  def role(role, signup_url)
   subject    'Invitation'
   recipients role.recipient_email
   from       'ben@cheqbook.com'
   body       :role => invitation, :signup_url => signup_url
  end

  def send_invite(role, signup_url)
    @message = signup_url


    mail :to => role.recipient_email, :subject => 'Invitation', :from => 'ben@cheqbook.com'
  end

end
