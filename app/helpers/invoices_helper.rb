module InvoicesHelper
  def replace_with_variables(content, invoice)
    content.gsub! "%invoice_payment_total%", "$#{number_to_currency(invoice.total)}"
    content.gsub! "%invoice_issue_date%", l(invoice.issue_date)
    content.gsub! "%invoice_customer%", invoice.customer.name
    content.gsub! "%invoice_due_date%", l(invoice.due_date)
    content.gsub! "%invoice_subject%", invoice.subject
    content.gsub! "%invoice_id%", invoice.code
    content.gsub! "%company_name%", invoice.company.name

    content
  end
end
