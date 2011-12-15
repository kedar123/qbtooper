class TestmeallsController < ApplicationController
  # GET /testmealls
  # GET /testmealls.xml
  def index
    respart = ResPartner.new
     
    #@testmealls = Testmeall.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @testmealls }
    end
  end

  # GET /testmealls/1
  # GET /testmealls/1.xml
  def show
    @testmeall = Testmeall.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @testmeall }
    end
  end

  # GET /testmealls/new
  # GET /testmealls/new.xml
  def new
    @testmeall = Testmeall.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @testmeall }
    end
  end

  # GET /testmealls/1/edit
  def edit
    @testmeall = Testmeall.find(params[:id])
  end

  # POST /testmealls
  # POST /testmealls.xml
  def create
    @testmeall = Testmeall.new(params[:testmeall])

    respond_to do |format|
      if @testmeall.save
        format.html { redirect_to(@testmeall, :notice => 'Testmeall was successfully created.') }
        format.xml  { render :xml => @testmeall, :status => :created, :location => @testmeall }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @testmeall.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /testmealls/1
  # PUT /testmealls/1.xml
  def update
    @testmeall = Testmeall.find(params[:id])

    respond_to do |format|
      if @testmeall.update_attributes(params[:testmeall])
        format.html { redirect_to(@testmeall, :notice => 'Testmeall was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @testmeall.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /testmealls/1
  # DELETE /testmealls/1.xml
  def destroy
    @testmeall = Testmeall.find(params[:id])
    @testmeall.destroy

    respond_to do |format|
      format.html { redirect_to(testmealls_url) }
      format.xml  { head :ok }
    end
  end
end
