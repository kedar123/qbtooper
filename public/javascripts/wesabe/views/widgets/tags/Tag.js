/**
 * Wraps a <li class="account"> node in the accounts widget. Instances are
 * managed by an {AccountGroup} to which they delegate both selection and
 * DOM event handling.
 */
wesabe.$class('wesabe.views.widgets.tags.Tag', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.date
  var date = wesabe.lang.date;

  $.extend($class.prototype, {

    /**
     * Visible name of the tag 
     *
     * @type {string}
     */
    name: null,

    /**
     * URI for this {Account} (e.g. "/accounts/1").
     *
     * See {wesabe.views.pages.accounts#storeState}.
     *
     * @type {string}
     */
    uri: null,

    _tagList: null,
    _status: null,
    _balance: null,
    _data: null,

    // references
    _nameElement: null,


    init: function(element, tagList) {
      $super.init.call(this, element);
      this._tagList = tagList;
      var container = element.children('span.account-name');
      this._nameElement = container.children('.text-content');

    },

    /**
     * Sets the name of this {Account} and updates the text, but does not
     * update the name on the server.
     */
    setName: function(name) {
      if (this.name === name)
        return;

      var url = $.url('');

      this.name = name;
      name = name.replace(/ /g,"_");
      this.set('uri', "/companies/" + url.segment(2) + '/tags/'+encodeURI(name));
      name = name.replace(/_/g," ");
      this._nameElement.text(name)
        .attr('href', '#'+this.uri);

    },

    /**
     * Gets the transactions URI for this {Account} (e.g. "/accounts/1/transactions").
     *
     * See {wesabe.views.pages.accounts#storeState}.
     */
    getTransactionsURI: function() {
      if (this.get('type') === "Investment")
        return this.get('uri') + '/investment-transactions';
      else
        return this.get('uri') + '/transactions';
    },

    /**
     * Gets the URL parameters for this {Account}.
     *
     * See {wesabe.views.pages.accounts#paramsForCurrentSelection}.
     */
    toParams: function() {
      var url = $.url('');
      return [{name: 'tag', value: '/tags/' + url.segment(4)}];
    },

    /**
     * Sets the display currency for this tag, but does not update
     * the value of the currency on the server.
     */
    setCurrency: function(currency) {
      if (this.currency === currency)
        return;

      this.currency = currency;
      this._total.set('currency', currency);
    },

    /**
     * Gets the single currency for this tag as an array.
     *
     * See {wesabe.views.pages.accounts#paramsForCurrentSelection}.
     */
    currencies: function() {
      return [this.get('currency')];
    },

    /**
     * Returns the investment positions associated with this {Account}
     */
    investmentPositions: function() {
      return this._investment_positions;
    },

    /**
     * Returns the investment balance associated with this {Account}
     */
    investmentBalance: function(balance) {
      if (this._investment_balance) {
        if (balance)
          return this._investment_balance[balance];
        else
          return this._investment_balance;
      }
    },

    /**
     * Returns the {wesabe.util.Selection} associated with this {Account}.
     */
    selection: function() {
      return this._tagList.get('selection');
    },

    hasBalance: function() {
      return hasValue(this._total.get('value'));
    },

    total: function() {
      return this._total.get('value');
    },


    /**
     * Handle clicks on this {Account}.
     *
     * NOTE: There is no accompanying bind statement because
     * this widget uses event delegation for the entire list
     * of accounts, see {AccountWidget#onClick}.
     */
    onClick: function(event) {
        if (event.ctrlKey || event.metaKey) {
          this.get('selection').toggle(this);
        } else {
          this.get('selection').set(this);
        }
    },


    /**
     * Called by {wesabe.util.Selection} instances when this object
     * becomes part of the current selection.
     */
    onSelect: function() {
      if (this.get('element'))
        this.get('element').addClass('on');
      // ensure that the containing group is expanded
      if (this._tagList)
        this._tagList.animateExpanded(true);
    },


    /**
     * Called by {wesabe.util.Selection} instances when this object
     * ceases to be part of the current selection.
     */
    onDeselect: function() {
      if (this.get('element'))
        this.get('element').removeClass('on');
    },

    /**
     * Update the display for this {Account} based on new data.
     */
    update: function(summary) {
      this.set('name', summary.tag.name);
      /*
      this.set('name', accountData.name);
      this._status = accountData.status;
      this.set('type', accountData.type);
      this.set('uri', accountData.uri);
      this.set('credential', this._accountGroup.get('credentialDataSource').getCredentialDataByAccountURI(accountData.uri));
      this.set('currency', accountData.currency);
      this.setLastBalanceDate(date.parse(accountData['last-balance-at']));
      this._balance = accountData.balance;
      this._marketValue = accountData["market-value"];
      this._total.setMoney(accountData.balance);
      this._data = accountData;
      this._investment_positions = accountData["investment-positions"];
      this._investment_balance = accountData["investment-balance"];
      this._restoreAccountStatus();
      */
    }


  });
});
