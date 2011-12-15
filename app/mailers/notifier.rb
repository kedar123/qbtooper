class Notifier < ActionMailer::Base

  # mail to user i.e company, for succesful billing for subscription 
  def successful_billing(billing_history, company_email)
    @billing_history = billing_history
    subject = "Subscription charging success alert."
    setup_email(company_email, subject)
  end

  # mail to admin and user i.e company, for failure in billing for subscription 
  def failed_billing(billing_history, company_email)
    @billing_history = billing_history
    subject = "Subscription charging failed alert."
    setup_email([ADMIN_EMAIL, company_email], subject)
  end

  private

  def setup_email(sent_to, subject, sent_by=nil)
    sent_by = sent_by == nil ? NO_REPLY_EMAIL : sent_by
    mail(:from => sent_by,
         :to => sent_to,
         :subject => subject)
  end

end
