#require 'validators/email_validator'

class MerchantInfo < ActiveRecord::Base
#  belongs_to :company
#  belongs_to :merchant
#  belongs_to :country

#  has_many :invoices, :foreign_key => :customer_id
#  has_many :bills, :foreign_key => :payee_id

#  validates :company,  :presence => true
#  validates :name,     :presence => true
#  validates :email,    :email => true

#  before_validation :nilify_empty
#  before_save :update_merchant

#  attr_accessible :name, :email, :phone, :fax, :website,
#    :address, :city, :state, :zipcode

  
  
  def self.quickbook_customer_import(xml)
    if !xml['QBXMLMsgsRs'].blank?
      xml['QBXMLMsgsRs']['CustomerQueryRs']['CustomerRet'].each do |customer|
        self.call_customer_save(customer)
      end
    elsif  !xml['QBXML'].blank?
      xml['QBXML']['QBXMLMsgsRs']['CustomerQueryRs']['CustomerRet'].each do |customer|
        self.call_customer_save(customer)
      end
    end
  end
  
  def self.call_customer_save(customer)
     logger.info "this is my customer list"
     logger.info customer 
     #    @oor =  Ooor.new(:url => 'http://192.168.1.100:8069/xmlrpc', :database => 'Temp1', :username =>
     #'admin', :password => 'admin')
     
     respart = ResPartner.new
     if customer.class == Hash
     if customer["ParentRef"].blank?  
     
     p "i got the real instanceeeeee"
     respart.name = customer['Name'] if customer['Name']
     respart.phone = customer['Phone'] if customer['Phone']
     respart.email = customer['Email'] if customer['Email']
     respart.company_id = 1
     respart.customer = true
     respart.supplier = false
     
     p respart
     respart.save
     p respart.id
     p "this is partner id"
     respartadd = ResPartnerAddress.new
     respartadd.partner_id = respart.id
     #respartadd.name = customer['Name']
     respartadd.phone = customer['Phone'] if customer['Phone']
     respartadd.email = customer['Email'] if customer['Email']
     
     respartadd.city = customer['BillAddress']['City'] if customer['BillAddress']['City']
     respartadd.zip =  customer['BillAddress']['PostalCode'] if customer['BillAddress']['PostalCode']
     respartadd.street =  customer['BillAddress']['Addr1'] + " " +customer['BillAddress']['Addr2'] if customer['BillAddress'] and customer['BillAddress']['Addr1'] and customer['BillAddress']['Addr2']
     respartadd.country =  customer['BillAddress']['State'] 
   
     respartadd.save
     
     end
     end 
    
    
    
#     
       
  #  if customer.class.to_s == "Hash"
  #    #here im considering the phone as compulsory number
  #    customer['Phone'] = '55555555' if customer['Phone'].blank?
         
  #    if   MerchantInfo.find(:first,:conditions=>["phone = ? and name = ?",customer['Phone'],customer['Name']]).blank?
   #     invc = MerchantInfo.new	
   #     invc.name = customer['Name']
   #     invc.address = customer['BillAddress']['Addr1'] if customer['BillAddress']
   #     invc.email = customer['Email']
   #     invc.phone = customer['Phone']
   #     invc.phone = '55555555' if invc.phone.blank?
   #     invc.email = 'kkk@gmaill.com' if invc.email.blank?
   #     invc.address = 'address' if invc.address.blank?
   #     #here im assume that all the customers of pragtech co so id is static
        #otherwise i have to craete a company
  #      qbimst = QuickbooksImportStatus.find_by_token("kedar.pathak@pragtech.co.in")
  #      invc.company_id = qbimst.company_id
  #      invc.save
  #    else
  #      if MerchantInfo.find(:first,:conditions=>["name = ? ",customer['Name']]).blank?
  #        invc = MerchantInfo.new	
  #        invc.name = customer['Name']
  #        invc.save
  #      end
             
  #    end
  #  else
   #   if customer[0] == "Name"
  #      if   MerchantInfo.find(:first,:conditions=>[" name = ?", customer[1]]).blank?
  #        invc = MerchantInfo.new	
  #        invc.name = customer[1]
  #        invc.phone = "521542"
  #        qbimst = QuickbooksImportStatus.find_by_token("kedar.pathak@pragtech.co.in")
  #        invc.company_id = qbimst.company_id
  #        invc.save
  #      end      
  #    end
      
  #  end
  end
  
  def self.quickbook_vendor_import(xml)
            
    if !xml['QBXMLMsgsRs'].blank?
      xml['QBXMLMsgsRs']['VendorQueryRs']['VendorRet'].each do |vendor|
        self.call_vendor_save(vendor)
      end
              
    elsif  !xml['QBXML'].blank?    
      xml['QBXML']['QBXMLMsgsRs']['VendorQueryRs']['VendorRet'].each do |vendor|
        self.call_vendor_save(vendor)
      end
              
    end 
          
          
       
  end
  
  def self.call_vendor_save(vendor)
    
    if vendor.class == Hash
         respart = ResPartner.new
     
     p "i got the real instanceeeeee"
     respart.name = vendor["Name"] if vendor["Name"]
     respart.phone = vendor["Phone"] if vendor["Phone"]
     respart.email = vendor["Email"] if vendor["Email"]
     respart.company_id = 1
     respart.supplier = true
     respart.customer = false
     
     p respart
     respart.save
     respartadd = ResPartnerAddress.new
     respartadd.partner_id = respart.id
     #respartadd.name = vendor['Name']
     respartadd.phone = vendor["Phone"] if vendor["Phone"]
     respartadd.email = vendor["Email"] if vendor["Email"]
     respartadd.city = vendor["BillAddress"]["City"] if vendor["BillAddress"] and vendor["BillAddress"]["City"]
     respartadd.zip =  vendor["BillAddress"]["PostalCode"] if vendor["BillAddress"] and vendor["BillAddress"]["PostalCode"]
     respartadd.street =  vendor["BillAddress"]["Addr1"] + " "+vendor["BillAddress"]["Addr2"] if vendor["BillAddress"] and vendor["BillAddress"]["Addr1"] and vendor["BillAddress"]["Addr2"]
     respartadd.country =  vendor["BillAddress"]["State"]  if vendor["BillAddress"] and vendor["BillAddress"]["State"]
   
     respartadd.save
     
    end  
   
   # qbimst = QuickbooksImportStatus.find_by_token("kedar.pathak@pragtech.co.in")
   # payee = ""
   # if vendor.class.to_s == "Hash"
   #   payee = MerchantInfo.find(:first,:conditions=>["name = ?",vendor['Name']]) if vendor['Name']
   #   if payee.blank?
   #     payee = MerchantInfo.new
   #     
   #     payee.company_id = qbimst.company_id
   #    
   #     payee.name = vendor['Name']
   #   
   #     payee.email = vendor['Email']
   #     payee.phone = vendor['Phone'] if  vendor['Phone']
   #     payee.fax = vendor['Fax'] if vendor['Fax']
   #     payee.website = ""
   #     payee.address = vendor['VendorAddress']['Addr1'] if vendor['VendorAddress']
   #     payee.city = vendor['VendorAddress']['City'] if vendor['VendorAddress']
   #     payee.zipcode = vendor['VendorAddress']['PostalCode'] if vendor['VendorAddress']
   #     payee.country_id = ""
   #    
   #     payee.save
          
   #   else
      
   #   end
   # else
   #   if vendor[0] == "Name"
   #     payee = MerchantInfo.find(:first,:conditions=>["name = ?",vendor[1]])  
   #     if payee.blank?
   #       payee = MerchantInfo.new
        
  #        payee.company_id = qbimst.company_id
  #     
  #        payee.name = vendor[1]
  #        qbimst = QuickbooksImportStatus.find_by_token("kedar.pathak@pragtech.co.in")
  #        payee.company_id = qbimst.company_id
  #        payee.save
  #      end
  #    end
      
  #  end
  end
  
    
   
  
  
  private

  def nilify_empty
    %w(email phone fax website address city state zipcode).each do |n|
      write_attribute(n, nil) if send(n).try(:empty?)
    end
  end

  def update_merchant
    return merchant if merchant && merchant.name == name
    self.merchant = Merchant.find_or_create_by_name(name)
  end

end
