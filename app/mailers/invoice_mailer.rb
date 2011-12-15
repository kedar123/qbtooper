class InvoiceMailer < ActionMailer::Base
  # default :from => ""

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.invoice_mailer.send_invoice.subject
  #
  def send_invoice(invoice_id, recipient, subject, message, attach_pdf, pdf_file, from)
    @invoice = Invoice.find(invoice_id)
    @message = message

    if attach_pdf
      attachments["INVOICE-#{@invoice.code}-#{@invoice.company.name.gsub(/ /, "_")}.pdf"] = pdf_file
    end
    
    mail :to => recipient, :subject => subject, :from => from
  end
end
