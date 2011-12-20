class Txaction < ActiveRecord::Base
  
 

  #this method will import all the transactions into the Txaction table and TxactionTagging table.
  #for finding the  tag_id first it will find a tag  into the tag table if its did not find it then 
  #it will search it in qbtag table. if it did not find the tag id then in log fill it will print tag name 
  #if its find a tag id then it will search weather this transaction is already there in the transaction table or not 
  #if its not then it will create it else it will not create it. this is for avoiding the duplication of entry.
  #before this it will find or create an account for quickbook as per the email sent to me 
  def self.quickbook_transaction_import(token,xml) 
    
    if !xml['QBXMLMsgsRs'].blank?
      if !xml['QBXMLMsgsRs']['TransactionQueryRs']['TransactionRet'].blank?
        xml['QBXMLMsgsRs']['TransactionQueryRs']['TransactionRet'].each do |transaction|
         self.call_transaction_save(transaction,token)
         #logger.info transaction
         #logger.info "i got trans"
        end
      end
    elsif  !xml['QBXML'].blank?
      if !xml['QBXML']['QBXMLMsgsRs']['TransactionQueryRs']['TransactionRet'].blank?
        xml['QBXML']['QBXMLMsgsRs']['TransactionQueryRs']['TransactionRet'].each do |transaction|
          #logger.info transaction
          #logger.info "i got th etrans"
          self.call_transaction_save(transaction,token)
        end
      end  
    end
  end
  def self.call_transaction_save(transaction,token)
    logger.info "this is transaction"
    logger.info transaction
    
#     if transaction.class.to_s == "Hash"
#      tagid = Tag.find(:first,:conditions=>["normalized_name = ?",transaction['AccountRef']['FullName']])
#       if tagid.blank?
#        tagid = QbTag.find(:first,:conditions=>["account LIKE ?","%#{transaction['AccountRef']['FullName']}%"])
#                 
#        tagid = Tag.find(:first,:conditions=>['id = ?',tagid.tag_id]) if tagid
#               
#      end
#      if tagid.blank?
#        logger.info "i did not get the tag id"
#      else
#        #here i need to check if if transaction is already exist then dont insert twice
#        if Txaction.find(:first,:conditions=>["txid = ?",transaction['TxnID']]).blank?
#          acc = Account.find(:first,:conditions=>["name = ? and account_key = ? and company_id = ?","Quickbook Imports",User.find_by_email("kedar.pathak@pragtech.co.in").account_key,QuickbooksImportStatus.find_by_token(token).company_id])
#          if acc.blank?
#            acc = Account.new
#            acc.name = "Quickbook Imports"
#            acc.account_type_id = AccountType.find_by_raw_name('QUICKBOOK').id
#            acc.account_key = User.find_by_email("kedar.pathak@pragtech.co.in").account_key
#            acc.currency = 'USD'
#            acc.company_id = QuickbooksImportStatus.find_by_token(token).company_id
#            acc.save
#          end 
#                       
#          transactionc = Txaction.new    
#          transactionc.amount = transaction['Amount'] if transaction['Amount']
#          transactionc.account = acc
#          transactionc.txid = transaction['TxnID']
#          transactionc.date_posted = transaction['TimeCreated']
#          transactionc.fi_date_posted = Time.now
#                  
#          if transaction['TxnType'] == "ReceivePayment"
#            transactionc.txaction_type_id = 12
#          end
#          if transaction['TxnType'] == "BillPaymentCheck"
#            transactionc.txaction_type_id = 11
#          end
#          if transaction['TxnType'] == "Deposit"
#            transactionc.txaction_type_id = 7
#          end
#          transactionc.save
#           txtg = TxactionTagging.new
#          txtg.tag = tagid
#          txtg.name = tagid.normalized_name
#          txtg.txaction = transactionc
#          txtg.save  
#                 
#        else
#         end 
#      end  
#    else
#     end
  end
  
   
 
 

 

end