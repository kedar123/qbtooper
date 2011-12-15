wesabe.$class('wesabe.views.widgets.transactions.QuickTransactionEntry', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.date
  var date = wesabe.lang.date;
  // import wesabe.lang.number
  var number = wesabe.lang.number;

  $.extend($class.prototype, {
    _widget: null,
    _datePostedField: null,
    _merchantAutocomplete: null,
    _categoryCombobox: null,
    _amountField: null,
    _addTransactionButton: null,
    _accountType: null,

    init: function(element) {
      $super.init.call(this, element);

      this._datePostedField = new wesabe.views.widgets.BaseField(element.find('.transaction-date input'));
      this._datePostedField.get('element').datepicker();
      this._merchantAutocomplete = element.find('.merchant-info input');
      this._tagDataSource = wesabe.data.tags.sharedDataSource;

      tagNames = this._tagDataSource.tagNames();
      this._categoryCombobox = element.find('.category select');
      this._categoryCombobox.empty();

      var select = this._categoryCombobox.get(0),
        selectedIndex = -1;
      select.options.add(new Option("Choose Category", ""));
      var i = 0;
      for (i = 0; i < tagNames.length; i++) {
        var tagName = tagNames[i];
        select.options.add(new Option(tagName.replace(/_/g, " "), tagName));
      }
      select.selectedIndex = selectedIndex;

      this._categoryCombobox.combobox();
      this._amountField = new wesabe.views.widgets.BaseField(element.find('.amount input'));
      this._accountType = $("#account_type");
      this._companyId = $("#company_id");
      this._tagFilter = $("#tag_filter");
      this._addTransactionButton = new wesabe.views.widgets.Button(element.find('.button'));
      this._addTransactionButton.bind('click', this.onSubmit, this);
      $("#quick-transaction-entry input").bind('keypress', function(e) {
        if(e.keyCode==13){
            $("#quick-transaction-entry a").click();
            e.preventDefault();
            return false;
        }
      });

      this.reset();
    },

    getDate: function() {
      return this._datePostedField.get('value');
    },

    setDate: function(value) {
      if (value && value.getFullYear)
        value = wesabe.lang.date.format(value, 'MM/dd/yyyy');

      this._datePostedField.set('value', value || '');
    },

    getMerchant: function() {
      return this._merchantAutocomplete.val();
    },

    setMerchant: function(merchant) {
      this._merchantAutocomplete.val(merchant || '');
    },

    getCategory: function() {
      return this._categoryCombobox.val();
    },

    setCategory: function(category) {
      this._categoryCombobox.val(category || '');
      this._categoryCombobox.combobox(category || '');
    },

    getAmount: function() {
      return number.parse(this._amountField.get('value'));
    },

    setAmount: function(amount) {
      this._amountField.set('value', amount);
    },

    reset: function() {
      this.setDate(new Date());
      this.setMerchant(null);
      this.setCategory(null);
      this.setAmount(null);
      $(".add_manual_entry_spinner").hide();
    },

    toParams: function() {
      var url = $.url('');
      this._tagFilter[0].value = "\"" + url.segment(4).replace(/_/g, " ") + "\"";
      return $.map([this._datePostedField.get('element'), this._merchantAutocomplete, this._accountType, this._tagFilter, this._amountField.get('element')], function(input) {
        return {name: input.attr('name'), value: input.val()};
      }).concat([{name: 'tags', value: wesabe.data.tags.joinTags([{name: this.getCategory()}])}]);
    },

    onSubmit: function() {

      var self = this,
          account = page.selection.get()[0];

      $(".add_manual_entry_spinner").show();
      $.ajax({
        type: 'POST',
        url: '/transactions',
        data: this.toParams(),
        success: function() {
          $('#account-transactions').
            fn('transactionDataSource').
            requestData(function(){
              self.reset();
            });
        },
        error: function() {
          // TODO: handle the error more elegantly
          alert('could not save');
        }
      });
    }
  });
});
