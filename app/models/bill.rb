class Bill < ActiveRecord::Base

  has_many :bill_payments
  has_many :bill_expenses
  has_many :payments, :through => :bill_payments, :source => :txaction
  has_many :expenses, :through => :bill_expenses, :source => :txaction
  has_one :company
  belongs_to :payee, :class_name => "MerchantInfo"
  
  accepts_nested_attributes_for :expenses

  validates_presence_of :bill_date, :ttl_amount, :company_id, :payee_id
  validates_numericality_of :ttl_amount, :ttl_tax
  validate :due_date_must_be_greater_than_bill_date

  attr_accessor :payment_method_options
  
  def due_date_must_be_greater_than_bill_date
    errors.add_to_base("Due Date must be greater than Bill Date") unless  due_date >= bill_date
  end
  
  def self.quickbook_bill_import(token,xml)
    logger.info "this bill xml i got"
    #logger.info xml 
     if !xml['QBXMLMsgsRs'].blank?
       if xml['QBXMLMsgsRs']['BillQueryRs']['BillRet'].class == Hash
        self.call_bill_save(xml['QBXMLMsgsRs']['BillQueryRs']['BillRet'],token,start_tag = "qbxmlmsgsrs",xml)
      else
       xml['QBXMLMsgsRs']['BillQueryRs']['BillRet'].each do |bill|
           self.call_bill_save(bill,token,start_tag = "qbxmlmsgsrs",xml)
        end
      end
    elsif !xml['QBXML'].blank?
       if xml['QBXML']['QBXMLMsgsRs']['BillQueryRs']['BillRet'].class ==  Hash
        self.call_bill_save(xml['QBXML']['QBXMLMsgsRs']['BillQueryRs']['BillRet'],token,start_tag = "qbxml",xml)
      else
      xml['QBXML']['QBXMLMsgsRs']['BillQueryRs']['BillRet'].each do |bill|
          self.call_bill_save(bill,token,start_tag = "qbxml",xml)  
        end
      end
    end
    logger.info "bill import complete"
  end
     

  def self.call_bill_save(bill,token,start_tag,xml)
      if bill.class.to_s == "Hash"
         self.call_bill_save_data(bill,token,start_tag,xml)
      end
  end
  
 
  
  
  def self.call_bill_save_data(bill,token,start_tag,xml)
    logger.info "111111billllllll"
    logger.info bill
    acin = AccountInvoice.new
     logger.info "115651111"
   
    acin.journal_id = 16
     logger.info "111156546511"
   acin.type = "in_invoice"
    respid = ResPartner.search([['name', '=', "#{bill['VendorRef']['FullName']}"]])[0]
     logger.info "1179871111"
   
    acin.partner_id = respid
     logger.info "111115551"
   
     acin.address_invoice_id =  ResPartnerAddress.find(:all,:domain => [[:partner_id ,'=', respid]])[0].id if ResPartnerAddress.find(:all,:domain => [[:partner_id ,'=', respid]])[0]
      logger.info "1197981111"
   
    acin.currency_id = 1
    acin.account_id = 533
    if !respid.blank?
      acin.save
    end
  logger.info "11198798111"
   
  if bill['ItemLineRet'].class == Array
     logger.info "111198798711"
   
  
  if bill['ItemLineRet'].each do |bit|
       logger.info "117771111"
   
     if bit.class == Hash 
       acinl = AccountInvoiceLine.new
        logger.info "1111959511"
   
      prodid = ProductProduct.find(:all,:domain => [[:name ,'=', "#{bit['ItemRef']['FullName'].split(":")[0]}"]])[0]  if bit[ "ItemRef"] 
       logger.info "117851111"
   
       acinl.quantity =  bit['Quantity']
        logger.info "111117541"
   
       acinl.price_unit = bit['Cost']
        logger.info "1189871111"
         acinl.invoice_id = acin.id
         acinl.account_id = 667
         acinl.name = bit['ItemRef']['FullName'].split(":")[0]
       acinl.save
     end  
  end
  end
  else
    if bill['ItemLineRet'].class == Hash 
       acinl = AccountInvoiceLine.new
        logger.info "1111959511"
   
      prodid = ProductProduct.find(:all,:domain => [[:name ,'=', "#{bill['ItemLineRet']['ItemRef']['FullName'].split(":")[0]}"]])[0]  if bill['ItemLineRet'][ "ItemRef"] 
       logger.info "117851111"
   
       acinl.quantity =  bill['ItemLineRet']['Quantity']
        logger.info "111117541"
   
       acinl.price_unit = bill['ItemLineRet']['Cost']
        logger.info "1189871111"
         acinl.invoice_id = acin.id
         acinl.account_id = 667
         acinl.name = bill['ItemLineRet']['ItemRef']['FullName'].split(":")[0]
       acinl.save
     end
      
  end
     
    
    
    
#       newbill = self.new
#       payee = MerchantInfo.find(:first,:conditions=>["name = ?",bill['VendorRef']['FullName']])
#       newbill.payee_id = payee.id if payee
#       newbill.payee_id = 12 if newbill.payee_id.blank?
#       newbill.company_id = QuickbooksImportStatus.find_by_token(token).company_id
#       newbill.invoice_number = bill['RefNumber'] if bill['RefNumber']
#       newbill.bill_date = bill['TimeCreated'] if bill['TimeCreated']
#       newbill.bill_date = Time.now  if newbill.bill_date.blank?
#       newbill.due_date = bill['DueDate'] if bill['DueDate']
#       newbill.payment_terms = bill['TermsRef']['FullName'] if bill['TermsRef']
#       newbill.ttl_amount = 0
#       newbill.currency = "USD"
#       newbill.purchase_order = ""
#       newbill.notes = ""
#       newbill.ttl_tax = 0
#       newbill.save
#       if bill['LinkedTxn'].class == Hash
#        bill_payment = BillExpense.new
#        bill_payment.bill_id = newbill.id
#        trascid = nil
#        trascid = Txaction.find(:first,:conditions=>["txid = ? ",bill['LinkedTxn']['TxnID']]) if bill['LinkedTxn']
#        logger.info "some transactions are not found46"
#        logger.info bill['LinkedTxn']['TxnID'] if bill['LinkedTxn']
#        bill_payment.txaction_id = trascid.id if trascid  
#        bill_payment.save
#      elsif bill['LinkedTxn'].class == Array
#         bill['LinkedTxn'].each do |likntra|
#          bill_payment = BillExpense.new
#          bill_payment.bill_id = newbill.id
#         
#          trascid = Txaction.find(:first,:conditions=>["txid = ? ",likntra['TxnID']])
#          logger.info "some transactions are not found45"
#          logger.info likntra['TxnID']
#          bill_payment.txaction_id = trascid.id if trascid  
#          bill_payment.save
#        end
#      end 
#  
  end
  
  
  
  
end
