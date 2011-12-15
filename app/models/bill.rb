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
  end
     

  def self.call_bill_save(bill,token,start_tag,xml)
      if bill.class.to_s == "Hash"
         logger.info bill
         logger.info "this is bill"
         #self.call_bill_save_data(bill,token,start_tag,xml)
      end
   end
  
 
  
  
  def self.call_bill_save_data(bill,token,start_tag,xml)
       newbill = self.new
       payee = MerchantInfo.find(:first,:conditions=>["name = ?",bill['VendorRef']['FullName']])
       newbill.payee_id = payee.id if payee
       newbill.payee_id = 12 if newbill.payee_id.blank?
       newbill.company_id = QuickbooksImportStatus.find_by_token(token).company_id
       newbill.invoice_number = bill['RefNumber'] if bill['RefNumber']
       newbill.bill_date = bill['TimeCreated'] if bill['TimeCreated']
       newbill.bill_date = Time.now  if newbill.bill_date.blank?
       newbill.due_date = bill['DueDate'] if bill['DueDate']
       newbill.payment_terms = bill['TermsRef']['FullName'] if bill['TermsRef']
       newbill.ttl_amount = 0
       newbill.currency = "USD"
       newbill.purchase_order = ""
       newbill.notes = ""
       newbill.ttl_tax = 0
       newbill.save
       if bill['LinkedTxn'].class == Hash
        bill_payment = BillExpense.new
        bill_payment.bill_id = newbill.id
        trascid = nil
        trascid = Txaction.find(:first,:conditions=>["txid = ? ",bill['LinkedTxn']['TxnID']]) if bill['LinkedTxn']
        logger.info "some transactions are not found46"
        logger.info bill['LinkedTxn']['TxnID'] if bill['LinkedTxn']
        bill_payment.txaction_id = trascid.id if trascid  
        bill_payment.save
      elsif bill['LinkedTxn'].class == Array
         bill['LinkedTxn'].each do |likntra|
          bill_payment = BillExpense.new
          bill_payment.bill_id = newbill.id
         
          trascid = Txaction.find(:first,:conditions=>["txid = ? ",likntra['TxnID']])
          logger.info "some transactions are not found45"
          logger.info likntra['TxnID']
          bill_payment.txaction_id = trascid.id if trascid  
          bill_payment.save
        end
      end 
  
  end
  
  
  
  
end
