class Invoice < ActiveRecord::Base
  STATUS_DRAFT = 'draft'
  STATUS_SENT  = 'sent'
  STATUS_PAID  = 'paid'

  belongs_to :customer, :class_name => "MerchantInfo"
  belongs_to :company
  
  has_many :line_items, :dependent => :destroy
  has_many :invoice_taxes, :dependent => :destroy
  has_and_belongs_to_many :invoice_payments, :join_table => :invoices_invoice_payments
  
  accepts_nested_attributes_for :line_items, :allow_destroy => true, :reject_if => proc { |attributes| attributes['description'].blank? }
  accepts_nested_attributes_for :invoice_taxes, :allow_destroy => true

  validates :code, :subject, :issue_date, :customer, :presence => true
  validates :status, :inclusion => { :in => [STATUS_PAID, STATUS_SENT, STATUS_DRAFT], :message => "You need to pick one status." }
  validates :discount, :numericality => { :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100 }
  validates :code, :uniqueness => { :scope => :customer_id } # Do not repeat codes for the same client.

  # scope :for_user, ->(user) { where(:user_id => user.id).order('created_at desc') }
  scope :for_company, ->(company) { where(:company_id => company.id).order('created_at desc') }
  
  attr_protected :company_id
  
  after_save :associate_taxes_to_items # It's important that this stays after_save and not before_save
  
  # Used in the views, for <select>s
  def self.status_collection
    {
      "Draft" => STATUS_DRAFT,
      "Sent" => STATUS_SENT,
      "Paid" => STATUS_PAID
    }
  end
  
  def subtotal
    # Without discount
    line_items.each.sum(&:total)
  end
  
  def total
    # Applies discount
    subtotal * (1 - (self.discount / 100.0))
  end
  
  def paid_so_far
    invoice_payments.all.sum(&:amount)
  end
  
  def amount_due
    (total - paid_so_far).round(2) # Round to the last two decimals
  end
  
  def mark_as_sent!
    self.status = STATUS_SENT
    save
  end
  
  def mark_as_paid!
    self.status = STATUS_PAID
    save
  end
  
  def check_if_paid
    if amount_due == 0
      logger.info { "Invoice is paid!" }
      mark_as_paid! 
    else
      logger.info { "Invoice is not paid! (Amount due is #{amount_due})" }
      mark_as_sent!
    end
  end
  
  def draft?
    self.status == STATUS_DRAFT
  end
  
  def sent?
    self.status == STATUS_SENT
  end
  
  def paid?
    self.status == STATUS_PAID
  end
  
  def self.quickbook_invoice_import(xml)
    logger.info "quickbook invoice model import"
    if !xml['QBXMLMsgsRs'].blank?
      xml['QBXMLMsgsRs']['InvoiceQueryRs']['InvoiceRet'].each do |invoice|
      #  logger.info "totally sending the invoic454eq"
        self.call_invoice_save(invoice)
      #  logger.info "totally sending the invoic454e78"
      end  
    elsif  !xml['QBXML'].blank?    
      xml['QBXML']['QBXMLMsgsRs']['InvoiceQueryRs']['InvoiceRet'].each do |invoice|
       # logger.info "totally sending the invoice"
        self.call_invoice_save(invoice)
      #  logger.info "totally sending the invoic454e"
      end
    end
  end
  
  def self.call_invoice_save(invoice)
    p invoice
    logger.info "im in the invoice saving"
    logger.info invoice
    
    acin = AccountInvoice.new
    acin.journal_id = 15
    respid = ResPartner.search([['name', '=', "#{invoice['CustomerRef']['FullName'].split(':')[0]}"]])[0]
    acin.partner_id = respid
    logger.info "11111"
    acin.address_invoice_id =  ResPartnerAddress.find(:all,:domain => [[:partner_id ,'=', respid]])[0].id if ResPartnerAddress.find(:all,:domain => [[:partner_id ,'=', respid]])[0]
    acin.currency_id = 1
    acin.account_id = 447
    logger.info "2222"
    p "8978"
    if !respid.blank?
    acin.save
    end
    logger.info "984564"
    invoice['InvoiceLineRet'].each do |lit|
      if lit.class == Hash
    logger.info "212315"
    acinl = AccountInvoiceLine.new
    logger.info "21231588"
    
    logger.info ProductProduct.find(:all,:domain => [[:name ,'=', "#{lit['ItemRef']['FullName']}"]]) if lit[ "ItemRef"]
    prodid = ProductProduct.find(:all,:domain => [[:name ,'=', "#{lit['ItemRef']['FullName']}"]])[0]  if lit[ "ItemRef"]
    logger.info "853635465"
    if prodid.class == Array
      
    logger.info "85455"
    acinl.product_id =  prodid[0].id if prodid
    logger.info "98987978"
    end
    logger.info "754355"
    acinl.quantity = lit["Quantity"]  
    logger.info "5555" 
    p "987987"
    acinl.price_unit = lit["Rate"] if lit["Rate"]
    acinl.account_id = 867
    logger.info "89879797"
    acinl.name = lit['ItemRef']['FullName'] if lit['ItemRef']
    logger.info "65654654"
    if !lit['ItemRef'].blank?  
      if !lit['ItemRef']['FullName'].blank?  
           acinl.save
      end
    end 
      logger.info "98778987"
     p "54654"
  end
      
    end
#   
#    if  invoice.class == Hash
#          
#      invcl = MerchantInfo.find(:first,:conditions=>["name = ?",invoice['CustomerRef']['FullName'].split(":")[0]])
#      if invcl.blank?
#        logger.info "the invoice client is not found"
#        #first this condition is need to be checked so that we should come to know that customer is there or not
#      else
#        logger.info "i got the customer now need to store the invoice"
#        logger.info invoice
#        inv = Invoice.find(:first,:conditions=>["customer_id = ? and code = ?",invcl.id,invoice['TxnID']])    
#        if inv.blank?
#          logger.info "i found that invoice is not already created so i will create it"
#          if invoice.class.to_s == "Hash" 
#            logger.info "i found the invoice is of hash type and im saving it"
#          
#            inv = Invoice.new
#            inv.customer_id = invcl.id
#            inv.code = invoice['TxnID']
#            inv.subject = invoice['TemplateRef']['FullName'] if invoice['TemplateRef']
#            inv.issue_date = invoice['TxnDate']
#            if invoice['IsPending'] == true
#              inv.status = 'draft'
#            elsif invoice['IsPaid'] == true
#              inv.status = 'paid'
#            else
#              inv.status = 'sent'
#            end
#            
#            inv.discount = invoice['SuggestedDiscountAmount'].to_i
#            inv.discount = 100 if inv.discount > 100
#            inv.terms = invoice['TermsRef']['FullName'] if invoice['TermsRef']
#            inv.issue_date = invoice['ShipDate']
#            inv.due_date = invoice['DueDate']
#            qbimst = QuickbooksImportStatus.find_by_token("kedar.pathak@pragtech.co.in")
#         
#            inv.company_id = qbimst.company_id
#            inv.save
#            #after saving the invoice i need to make the entry in line items table for 
#            if !invoice['InvoiceLineRet'].blank?
#            
#              #i will check here if its hash then save only here one time  
#              #and if its a hash then save this as in else
#              #else save as follows 
#              if invoice['InvoiceLineRet'].class == Hash
#                lineitem = LineItem.new()
#                lineitem.description = invoice['InvoiceLineRet']['Desc'] 
#                lineitem.description = "default value" if lineitem.description.blank?
#                lineitem.unit_price = invoice['InvoiceLineRet']['Rate']  if invoice['InvoiceLineRet']['Rate']
#                lineitem.unit_price = 0 if  lineitem.unit_price.blank?
#                lineitem.quantity = invoice['InvoiceLineRet']['Quantity']   #this is also im storing as default
#                lineitem.quantity = 1 if lineitem.quantity.blank?
#                lineitem.item_type = 'product'
#                lineitem.invoice_id = inv.id  if inv
#                lineitem.invoice_id = 0 if inv.blank?
#                itemid = Item.find(:first,:conditions=>["name = ? ",invoice['InvoiceLineRet']['ItemRef']['FullName'].to_s.split(":")[0]]) if invoice['InvoiceLineRet']['ItemRef']
#                if itemid.blank?
#                  lineitem.item_id =  0
#                else
#                  lineitem.item_id =  itemid.id
#                end
#                lineitem.save
#              
#                
#              else
#            
#                invoice['InvoiceLineRet'].each do |lit|
#                  if lit.class == Hash
#                    lineitem = LineItem.new()
#                    lineitem.description = lit['Desc'] 
#                    lineitem.description = "default value" if lineitem.description.blank?
#                    lineitem.unit_price = lit['Rate']  if lit['Rate']
#                    lineitem.unit_price = 0 if  lineitem.unit_price.blank?
#                    lineitem.quantity = lit['Quantity']   #this is also im storing as default
#                    lineitem.quantity = 1 if lineitem.quantity.blank?
#                    lineitem.item_type = 'product'
#                    lineitem.invoice_id = inv.id  if inv
#                    lineitem.invoice_id = 0 if inv.blank?
#              
#                    itemid = Item.find(:first,:conditions=>["name = ? ",lit['ItemRef']['FullName'].to_s.split(":")[0]]) if lit['ItemRef']
#                    if itemid.blank?
#                      lineitem.item_id =  0
#                    else
#                      lineitem.item_id =  itemid.id
#                    end
#              
#                    lineitem.save
#                  end 
#                end
#                #here there will be an end of if else of invoice line ret
#              end  
#            else
#            
#            
#              if !invoice['InvoiceLineGroupRet'].blank?
#                self.call_invoice_line_item_with_group(invoice,inv)
#              end
#            
#            end
#            invoice_payment = InvoicePayment.new
#             
#            invoice_payment.invoice_id = inv.id
#            invoice_payment.txaction_id =  invoice['TxnID'] 
#            invoice_payment.save
#          else
#             
#          end
#        else
#        end
#      end#invoice.blank if herererer
#    end    
  end
  
  
  def self.call_invoice_line_item_with_group(invoice,inv)
    if !invoice['InvoiceLineGroupRet']['InvoiceLineRet'].blank?
      #here also same as above
      if invoice['InvoiceLineGroupRet']['InvoiceLineRet'].class == hash   
        if   lit.class == Array
          lineitem = LineItem.new()
          lineitem.description = invoice['InvoiceLineGroupRet']['InvoiceLineRet']['Desc'] 
          lineitem.description = "default value" if lineitem.description.blank?
          lineitem.unit_price = invoice['InvoiceLineGroupRet']['InvoiceLineRet']['Rate']  if invoice['InvoiceLineGroupRet']['InvoiceLineRet']['Rate']
          lineitem.unit_price = 0 if  lineitem.unit_price.blank?
          lineitem.quantity = invoice['InvoiceLineGroupRet']['InvoiceLineRet']['Quantity']   #this is also im storing as default
          lineitem.quantity = 1 if lineitem.quantity.blank?
          lineitem.item_type = 'product'
          lineitem.invoice_id = inv.id  if inv
          lineitem.invoice_id = 0 if inv.blank?
          itemid = Item.find(:first,:conditions=>["name = ? ",invoice['InvoiceLineGroupRet']['InvoiceLineRet']['ItemRef']['FullName'].to_s.split(":")[0]]) if invoice['InvoiceLineGroupRet']['InvoiceLineRet']['ItemRef']
          if itemid.blank?
            lineitem.item_id =  0
          else
            lineitem.item_id =  itemid.id
          end
          lineitem.save
        else 
          invoice['InvoiceLineGroupRet']['InvoiceLineRet'].each do |lit|
            
            lineitem = LineItem.new()
            lineitem.description = lit['Desc'] 
            lineitem.description = "default value" if lineitem.description.blank?
            lineitem.unit_price = lit['Rate']  if lit['Rate']
            lineitem.unit_price = 0 if  lineitem.unit_price.blank?
            lineitem.quantity = lit['Quantity']   #this is also im storing as default
            lineitem.quantity = 1 if lineitem.quantity.blank?
            lineitem.item_type = 'product'
            lineitem.invoice_id = inv.id  if inv
            lineitem.invoice_id = 0 if inv.blank?
              
            itemid = Item.find(:first,:conditions=>["name = ? ",lit['ItemRef']['FullName'].to_s.split(":")[0]]) if lit['ItemRef']
            if itemid.blank?
              lineitem.item_id =  0
            else
              lineitem.item_id =  itemid.id
            end
              
            lineitem.save
          
          end 
        end
      end
    else
             
    end



  end
  
 
  
  
  
  private
  def associate_taxes_to_items
    # This supposedly gets called when all associated elements have been saved already,
    # and creates the HABTM association for the taxes
    line_items.each { |li| li.check_taxes }
  end
end
