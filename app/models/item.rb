class Item < ActiveRecord::Base
  belongs_to :company
  has_many :line_items # You can see where this product has been sold
  
  validates :name, :presence => true
  
  
  #this is just for storing the item into the table
  def self.quickbook_item_import(token,xml)
#    if !xml['QBXMLMsgsRs'].blank?
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemServiceRet'].blank?
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemServiceRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end  
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemNonInventoryRet'].blank?
#            
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemNonInventoryRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemOtherChargeRet'].blank?
#            
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemOtherChargeRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryRet'].blank?
#            
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryAssemblyRet'].blank?
#            
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryAssemblyRet'].each do |itemservice|
#          if  itemservice.class.to_s == "Array"
#            self.call_item_save_by_name(itemservice[1],token)   if   itemservice[0] == "Name"
#          else
#            self.call_item_save(itemservice,token)    
#          end
#        end
#      end
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemFixedAssetRet'].blank?
#            
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemFixedAssetRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#           
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemSubtotalRet'].blank?
#      
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemSubtotalRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#            
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemDiscountRet'].blank?
#      
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemDiscountRet'].each do |itemservice|
#          if  itemservice.class.to_s == "Array"
#            self.call_item_save_by_name(itemservice[1],token)   if   itemservice[0] == "Name"
#          else
#            self.call_item_save(itemservice,token)    
#          end
#        end
#      end
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemPaymentRet'].blank?
#      
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemPaymentRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxRet'].blank?
#              
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#             
#      if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxGroupRet'].blank?
#      
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxGroupRet'].each do |itemservice|
#          if  itemservice.class.to_s == "Array"
#            self.call_item_save_by_name(itemservice[1],token)   if   itemservice[0] == "Name"
#          else
#            self.call_item_save(itemservice,token)
#          end
#       end
#     end
#     if !xml['QBXMLMsgsRs']['ItemQueryRs']['ItemGroupRet'].blank?
#             
#        xml['QBXMLMsgsRs']['ItemQueryRs']['ItemGroupRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#    elsif  !xml['QBXML'].blank?
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemServiceRet'].blank?
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemServiceRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemNonInventoryRet'].blank?
#               
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemNonInventoryRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end     
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemOtherChargeRet'].blank?
#         
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemOtherChargeRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryRet'].blank?
#            
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryAssemblyRet'].blank?
#              
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemInventoryAssemblyRet'].each do |itemservice|
#          if  itemservice.class.to_s == "Array"
#            self.call_item_save_by_name(itemservice[1],token)   if   itemservice[0] == "Name"
#          else
#            self.call_item_save(itemservice,token)    
#          end
#        end
#      end
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemFixedAssetRet'].blank?
#          
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemFixedAssetRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#          
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemSubtotalRet'].blank?
#         
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemSubtotalRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#     if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemDiscountRet'].blank?
#          
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemDiscountRet'].each do |itemservice|
#          if  itemservice.class.to_s == "Array"
#            self.call_item_save_by_name(itemservice[1],token)   if   itemservice[0] == "Name"
#          else
#            self.call_item_save(itemservice,token)    
#          end
#       end
#      end
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemPaymentRet'].blank?
#          
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemPaymentRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#          
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxRet'].blank?
#        
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxRet'].each do |itemservice|
#          self.call_item_save(itemservice,token)
#        end
#      end
#        
#      if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxGroupRet'].blank?
#        
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemSalesTaxGroupRet'].each do |itemservice|
#          if  itemservice.class.to_s == "Array"
#            self.call_item_save_by_name(itemservice[1],token)   if   itemservice[0] == "Name"
#          else
#            self.call_item_save(itemservice,token)
#          end
#        end
#      end
#     if !xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemGroupRet'].blank?
#      
#        xml['QBXML']['QBXMLMsgsRs']['ItemQueryRs']['ItemGroupRet'].each do |itemservice|
#         self.call_item_save(itemservice,token)
#        end
#      end      
#      
#     if true
#       logger.info "im always true but i can not parse it1111111"
#       logger.info xml['QBXMLMsgsRs']['ItemQueryRs']
#       logger.info "im always true but i can not parse it222222222"
#       logger.info xml['QBXMLMsgsRs']
#       
#       
#     end 
#      
#      
#    else
#      logger.info "im totally blank"
#      logger.info xml['QBXMLMsgsRs']
#    end
    
    
  end
    
    
  def self.call_item_save(itemservice,token)
      logger.info "this item i got"
      logger.info itemservice
      newp = ProductProduct.new
      newp.name = itemservice["Name"]
      prtmp = ProductTemplate.new
      prtmp.name = itemservice["Name"]
      logger.info "itemservice"
      prtmp.description_purchase = itemservice["PurchaseDesc"]
      prtmp.description_sale =  itemservice["SalesOrPurchase"]["Desc"] if itemservice["SalesOrPurchase"]
      prtmp.company_id =  1
      prtmp.type = "service"
      prtmp.supply_method = "buy"
      prtmp.purchase_method = "make_to_order"
      prtmp.categ_id = 1
      logger.info "itemservice12"
      if  !itemservice["PurchaseCost"].blank?
          prtmp.standard_price = itemservice["PurchaseCost"]       
      end
      if  !itemservice["SalesAndPurchase"].blank?
          prtmp.standard_price = itemservice["SalesAndPurchase"]["PurchaseCost"]      
      end
      if  !itemservice["SalesOrPurchase"].blank?
          prtmp.standard_price = itemservice["SalesOrPurchase"]["Price"]      
      end
      prtmp.cost_method = "standard"
      prtmp.uom_id = 1
      logger.info "itemservice45"
      prtmp.uom_po_id = 1
       
      #prtmp.mes_type = "Fixed"
      prtmp.save
      newp.product_tmpl_id = prtmp.id
      newp.save
      psli = ProductSupplierinfo.new
      psli.company_id = 1
      psli.name = 1
      psli.min_qty = 0
      psli.delay = 0
      psli.product_id = prtmp.id
      psli.save
        sm = StockMove.new
      sm.product_id = newp.id
      sm.product_qty = itemservice["QuantityOnSalesOrder"]
      sm.product_qty = 0 if sm.product_qty.blank?
      sm.product_uom = 1
      sm.location_id = 18
      sm.name = "abcd"
      sm.location_dest_id = 1
      
      sm.save
      sil = StockInventoryLine.new
      sil.product_id = newp.id
      sil.product_uom = 1
      sil.company_id = 1
      sil.inventory_id = 1
      sil.location_id = 18
      sil.product_qty = itemservice["QuantityOnHand"]
      sil.product_qty = 0 if sil.product_qty.blank?
      sil.save
      
      sinv = StockInventory.new
      sinv.company_id = 1
      sinv.name = itemservice["Name"]
      sinv.state = "done"
      sinv.save
       
       
      
    
      
      

   # item = Item.find(:first,:conditions=>["name = ? ",itemservice['Name']])
   # if item.blank?
   #   item = Item.new(:name=>itemservice['Name']) 
   #   item.company_id = QuickbooksImportStatus.find_by_token(token).company_id
   #   item.save
   # end
  end
  def self.call_item_save_by_name(name,token)
    logger.info "this itemmmms i got12121212"
    logger.info name
    logger.info "this item i got"
       
      newp = ProductProduct.new
      newp.name = name
      prtmp = ProductTemplate.new
      prtmp.name = name
      
      prtmp.company_id =  1
      prtmp.type = "service"
      prtmp.supply_method = "buy"
      prtmp.purchase_method = "make_to_order"
      prtmp.categ_id = 1
      logger.info "itemservice12"
      
          prtmp.standard_price = 0
      
       
          prtmp.standard_price = 0
      
          prtmp.standard_price = 0
      
      prtmp.cost_method = "standard"
      prtmp.uom_id = 1
      logger.info "itemservice45"
      prtmp.uom_po_id = 1
      prtmp.uom_po_id = 1
      #prtmp.mes_type = "Fixed"
      prtmp.save
      newp.product_tmpl_id = prtmp.id
      newp.save
      psli = ProductSupplierinfo.new
      psli.company_id = 1
      psli.name = 1
      psli.min_qty = 0
      psli.delay = 0
      psli.product_id = prtmp.id
      psli.save
        sm = StockMove.new
      sm.product_id = newp.id
      sm.product_qty = 0
      sm.product_uom = 1
      sm.location_id = 1
      sm.name = "abc"
      sm.location_dest_id = 1
      
      sm.save
       sil = StockInventoryLine.new
      sil.product_id = newp.id
      sil.product_uom = 1
      sil.company_id = 1
      sil.inventory_id = 1
      sil.location_id = 18
       
      sil.product_qty = 0  
      sil.save
      
      sinv = StockInventory.new
      sinv.company_id = 1
      sinv.name = name
      sinv.state = "done"
      sinv.save
       
    
    #item = Item.find(:first,:conditions=>["name = ? ",name])
    #if item.blank?
    #  item = Item.new(:name=>name) 
    #  item.company_id = QuickbooksImportStatus.find_by_token(token).company_id
    #  item.save
    #end
  end
  
end
