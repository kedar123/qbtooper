class Company < ActiveRecord::Base
   

  has_one  :subscription, :dependent => :destroy
  has_many :accounts, :dependent => :destroy
  has_many :roles, :dependent => :destroy
  has_many :users, :through => :roles

  # Accounts Payable
  has_many :bills
  has_many :payees, :through => :bills, :order => "name DESC"
  has_many :billing_histories, :dependent => :destroy

  # Accounts Receivable
  has_many :invoices, :dependent => :destroy
  has_many :customers, :through => :invoices
  has_many :default_invoice_taxes, :dependent => :destroy

  # Payees and customers in one big pile
  has_many :merchant_infos

  has_attached_file :photo,
    :styles => {
    :thumb  => "100x100",
    :medium => "200x200",
    :large => "600x400"
    },
  :storage => :s3,
  :s3_credentials => "#{RAILS_ROOT}/config/s3.yml",
  :path => ":attachment/:id/:style.:extension",
  :bucket => 'cheqbook'

  #after_create :create_default_invoice_taxes
  #after_create :create_default_accounts

  # calls create_subsciption to create subscription at Chargify
  #after_create :create_subscription

  #validates_presence_of :name, :contact_name_first, :contact_name_last, :email
  #validates_format_of :email, :with => /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i

  #----------------------------------------------------------------------------
  # Currency & Country
  #

  belongs_to :country

  #before_create :set_default_currency
  #validate :check_default_currency


  #after_update :update_subscription

  def self.new_for_user(attrs,user)
    self.new(attrs).tap do |company|
        #Save new role for user who created the company
        company.roles << Role.new(:role => 1,:user => user,:recipient_email => user.email,:company => company)
    end
  end

  # override AR method so we can return a currency object
  def default_currency
    Currency.new(read_attribute(:default_currency))
  rescue Currency::UnknownCurrencyException
    nil
  end

  # override AR method so we can set with a Currency object
  def default_currency=(cur)
    write_attribute(:default_currency, cur.to_s)
  end

  def has_default_currency?
    read_attribute(:default_currency).present?
  end

  # set the default currency based on the country before create
  def set_default_currency
    self.default_currency = country.currency.name if country unless has_default_currency?
  end

  def check_default_currency
    # validate default currency
    if currency = read_attribute(:default_currency)
      unless Currency.known?(currency)
        errors.add('default_currency', 'is not a valid currency')
      end
    end
  end

  # Updated company object is passed to the method
  # If company attributes have changed then update the same in the subscription record of
  # company created at Chargify
  def update_subscription
    if (self.contact_name_first_changed? or
          self.contact_name_last_changed? or
          self.email_changed? or
          self.name_changed?) and self.subscription.chargify_subscription_id
      begin
        subscription = Chargify::Subscription.find(self.subscription.chargify_subscription_id)

        #Updating details of company at Chargify
        unless subscription.customer.update_attributes(:first_name => self.contact_name_first,
                                                       :last_name => self.contact_name_last,
                                                       :email => self.email,
                                                       :organization => self.name
                                                      )
          #FIXME if update_attributes returns false, send mail to Admin to do it manually at chargify
        end
      rescue Exception
        #FIX ME send mail to Admin to do it manually at chargify
      end
    end
  end

  def customer_attributes
    { :first_name => self.contact_name_first,
      :last_name => self.contact_name_last,
      :email => self.email,
      :organization => self.name
    }
  end
  
  def self.quickbook_company_import(token,xml)
 #    logger.info "im inserting here the xmllll"
 #      logger.info xml
 #   @oor =  Ooor.new(:url => 'http://192.168.1.40:8069/xmlrpc', :database => 'Temp1', :username =>
 #    'admin', :password => 'admin')
 

 #   logger.info "5555555555754"
 #   logger.info xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyName']
 #      logger.info "55555555557"
 #   logger.info "im fom company database"
 #   resc = ResCompany.new
 #   logger.info resc.methods
 #   logger.info resc.attributes
    
    #company = self.find(:first,:conditions=>["name = ?",xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyName']])
 #   logger.info "im fom company database"
   # if company.blank?
#      logger.info "im fom company database"
#      company = ResCompany.new
#       logger.info xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyName']
#       logger.info "55555555"
#      company.name = xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyName']
#      company.contact_name_first = "contact name first"
#      company.contact_name_last = "Contact Name Last"
#      company.email = xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['Email']
#      company.email = "abc"+rand(100).to_s+"@gmail.com" if company.email.blank?
#      company.state = xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']['State'] if# xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']
#      company.city = xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']['City'] if ##xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']
#      company.telephone = xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['Phone']
#      company.fax = xml['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['Fax']
#      company.save
#      role = Role.new
#      role.company_id = company.id
#      role.role = 1
#      current_user = User.find_by_email("kedar.pathak@pragtech.co.in")
#      role.user_id = current_user.id
#      role.sender_id = current_user.id
#      role.recipient_email = current_user.email
#      role.save
#      subscription = Subscription.new
#      subscription.first_name = "demo name"
#      subscription.full_number = "526548"
#      subscription.last_name = "demo"
#      subscription.card_type = "visa"
#      subscription.company_id = company.id
#      subscription.save
#             
    #end
#    qbimst = QuickbooksImportStatus.find_by_token(token)
#    qbimst.company_id = company.id
#    qbimst.save
  end
  
  def self.quickbook_company_import_parse(token,xml)
 #      logger.info "im inserting here the xmllll"
 #      logger.info xml
 #       @oor =  Ooor.new(:url => 'http://localhost:8069/xmlrpc', :database => 'mybase', :username =>
 #    'admin', :password => 'admin')
 #   
 #    logger.info "5555555555775"
 #   logger.info xml['QBXML']['CompanyQueryRs']['CompanyRet']['CompanyName']
 #      logger.info "555555555547"
 #   company = Company.find(:first,:conditions=>["name = ?",xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['#CompanyRet']['CompanyName']])
     
#    if company.blank?
 #     
 #     company = self.new
 #     company.name = xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyName']
       
 #     company.contact_name_first = "contact name first"
 #     company.contact_name_last = "Contact Name Last"
 #     company.email = xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['Email']
 #     company.email = "abc"+rand(100).to_s+"@gmail.com" if company.email.blank?
 #     company.state = xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']['State'] if xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']
 #     company.city = xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']['City'] if xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['CompanyAddressForCustomer']
 #     company.telephone = xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['Phone']
 #     company.fax = xml['QBXML']['QBXMLMsgsRs']['CompanyQueryRs']['CompanyRet']['Fax']
 #     company.save
 #     role = Role.new
 #     role.company_id = company.id
 #     role.role = 1
 #     current_user = User.find_by_email("kedar.pathak@pragtech.co.in")
 #     role.user_id = current_user.id
 #     role.sender_id = current_user.id
 #     role.recipient_email = current_user.email
 #     role.save
 #     subscription = Subscription.new
 #     subscription.first_name = "demo name"
 #     subscription.full_number = "526548"
 #     subscription.last_name = "demo"
 #     subscription.card_type = "visa"
 #     subscription.company_id = company.id
 #     subscription.save
 #           
 #   else

 #   end
 #   qbimst = QuickbooksImportStatus.find_by_token(token)
 #   qbimst.company_id = company.id
 #   qbimst.save
  
  end
  
  
  private
  def create_default_invoice_taxes
    # This hard-codes two taxes for cheqbook
    2.times { self.default_invoice_taxes.create :tax => 0 }
  end

  def create_default_accounts
    # This creates a manual account to hold journal entries. All txactions not
    # imported via yodlee or bulk should belong to this account
    Account.create(:name => "Journal",
                              :user => users.first,
                              :company_id => self.id,
                              :account_type_id => AccountType::MANUAL,
                              :currency => default_currency)
    # This creates an accounts payable account to be used with that module.
    Account.create(:name => "Accounts Payable",
                              :user => users.first,
                              :company_id => self.id,
                              :account_type_id => AccountType::PAYABLE,
                              :currency => default_currency)
    # This creates an accounts receivable account to be used with that module.
    Account.create(:name => "Accounts Receivable",
                              :user => users.first,
                              :company_id => self.id,
                              :account_type_id => AccountType::RECEIVABLE,
                              :currency => default_currency)

  end

end
