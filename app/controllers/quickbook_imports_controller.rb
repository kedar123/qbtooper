class QuickbookImportsController < ApplicationController
  # GET /quickbook_imports
  # GET /quickbook_imports.xml
  def index
    #@quickbook_imports = QuickbookImport.all
    params[:company_id] = 1
    @subscription = Subscription.find_by_company_id(params[:company_id]) 
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @quickbook_imports }
    end
  end
  
  

  # GET /quickbook_imports/1
  # GET /quickbook_imports/1.xml
  def show
    @quickbook_import = QuickbookImport.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @quickbook_import }
    end
  end

  # GET /quickbook_imports/new
  # GET /quickbook_imports/new.xml
  def new
    @quickbook_import = QuickbookImport.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @quickbook_import }
    end
  end

  # GET /quickbook_imports/1/edit
  def edit
    @quickbook_import = QuickbookImport.find(params[:id])
  end

  # POST /quickbook_imports
  # POST /quickbook_imports.xml
  def create
    @quickbook_import = QuickbookImport.new(params[:quickbook_import])

    respond_to do |format|
      if @quickbook_import.save
        format.html { redirect_to(@quickbook_import, :notice => 'Quickbook import was successfully created.') }
        format.xml  { render :xml => @quickbook_import, :status => :created, :location => @quickbook_import }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @quickbook_import.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /quickbook_imports/1
  # PUT /quickbook_imports/1.xml
  def update
    @quickbook_import = QuickbookImport.find(params[:id])

    respond_to do |format|
      if @quickbook_import.update_attributes(params[:quickbook_import])
        format.html { redirect_to(@quickbook_import, :notice => 'Quickbook import was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @quickbook_import.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /quickbook_imports/1
  # DELETE /quickbook_imports/1.xml
  def destroy
    @quickbook_import = QuickbookImport.find(params[:id])
    @quickbook_import.destroy

    respond_to do |format|
      format.html { redirect_to(quickbook_imports_url) }
      format.xml  { head :ok }
    end
  end
  
  def importqwc
    #QuickbooksImportStatus.create(:username=>"",:password=>"abcd",:querystatus=>"")
    send_file "#{Rails.root}/public/qbwc.qwc"
  end
  
  def quickbook_import_status
     
    sendquery = QuickbooksImportStatus.find_by_token("kedar.pathak@pragtech.co.in")
    
    if sendquery
      if sendquery.querystatus == "Import Completed"
        render :text=>sendquery.querystatus 
      else
        render :text=>sendquery.querystatus + "import started"
      end
    else
      render :text=>"There is some problem or the data is already loaded"
    end
  end
   
  def clean_up_import_status
    QuickbooksImportStatus.delete_all("id > 0") 
    Account.delete_all("id > 0") 
    #BillItem.delete_all("id > 0")
    BillExpense.delete_all("id > 0")
    Bill.delete_all("id > 0")
    Company.delete_all("id > 0")
    Subscription.delete_all("id > 0")
    #InvoiceClient.delete_all("id > 0")
    InvoicePayment.delete_all("id > 0")
    Invoice.delete_all("id > 0")
    Item.delete_all("id > 0")
    LineItem.delete_all("id > 0")
    #Payee.delete_all("id > 0")
    MerchantInfo.delete_all("id > 0")
    Role.delete_all("id > 0")
    Txaction.delete_all("id > 0")
    TxactionTagging.delete_all("id > 0")
    render :text=>"clean up"
  end
  
end
