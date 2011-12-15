// shared form methods
jQuery(function($){
  wesabe.provide('views.shared.form', {
    enable: function(form) {
      this.enableSubmit(form);
      this.enableCancel(form);
    },
    // enable link-submit buttons on forms, adding a hidden submit button so that
    // hitting enter to submit works
    enableSubmit: function(form) {
      form.append('<input type="submit" style="position:absolute;left:-10000px;width:1px"/>');
      $(".submit", form).unbind("click").bind("click", function(){ $(this).parents("form").submit(); });
    },
    // enable hitting escape to hide the hover box
    enableCancel: function(form) {
      $(":input", form).keyup(function(event) {
        if (event.which == 27 /* esc */) {
          var hoverBox = $(this).parents('.hover-box');
          if (hoverBox.length) {
            hoverBox.hideModal();
            event.preventDefault();
          }
        }
      });
    },
    setFocus: function() {
      $("form .initial-focus").focus();
    }
  });

  var forms = $("form");
  wesabe.views.shared.form.enableSubmit(forms);
  wesabe.views.shared.form.enableCancel(forms);
  wesabe.views.shared.form.setFocus();
});

wesabe.$class('views.pages.DashboardPage', function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    init: function() {
      wesabe.views.shared
        .setCurrentTab("dashboard")
        .setPageTitle("Dashboard")
        .enableDefaultAccountsSearch()
        .enableDefaultAccountSidebarBehavior();

      var targetDataSource = new wesabe.data.TargetDataSource();
      targetDataSource.set('cachingEnabled', true);
      this._targets = new wesabe.views.widgets.targets.TargetWidget($("#spending-targets"), targetDataSource);
    }
  });
});

/**
 * Wraps an element for displaying a formatted monetary amount.
 */
wesabe.$class('wesabe.views.widgets.MoneyLabel', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import $ as jQuery
  var $ = jQuery;
  // import wesabe.lang.number
  var number = wesabe.lang.number;
  // import wesabe.lang.money
  var money = wesabe.lang.money;

  $.extend($class.prototype, {
    /**
     * The override currency code if one was specified (e.g. "USD").
     *
     * @type {string}
     */
    currency: null,

    /**
     * The value of the label as a structured object.
     *
     * @type {object}
     */
    money: null,

    /**
     * true if the "credit" and "debit" classes are applied to positive
     * and negative amounts, respectively, false otherwise.
     *
     * @type {boolean}
     */
    amountClassesEnabled: false,

    /**
     * true or false if the signum should be forcibly shown or hidden,
     * respectively, or null if the signum should not be affected.
     *
     * @type {?boolean}
     */
    showSignum: null,

    /**
     * @private
     */
    _className: null,

    init: function(element, money) {
      $super.init.call(this, element);
      if (money) this.set('money', money);
    },

    /**
     * Sets the new value of the label, overriding any previous
     * calls to {#set('currency')} and instead using {money.display}.
     */
    setMoney: function(money) {
      if (this.money === money || (this.money && money &&
        this.money.value === money.value &&
        this.money.display === money.display))
        return;

      this.money = money && {
        display: money.display,
        value: number.parse(money.value)
      };
      this.set('currency', null);
      this._className = (money && money.value < 0) ? 'debit' : 'credit';
      this._redraw();
    },

    /**
     * Overrides the currency to use when formatting the amount for display,
     * overriding any display value included in the {money}. Changing the value
     * of this property will cause a redraw.
     */
    setCurrency: function(currency) {
      if (this.currency === currency)
        return;

      this.currency = currency;
      this._redraw();
    },

    /**
     * Returns the numerical value of the {money}, as for an edit field.
     */
    value: function() {
      if (!this.money) return;
      return this.money.value;
    },

    setAmountClassesEnabled: function(amountClassesEnabled) {
      if (amountClassesEnabled == this.amountClassesEnabled)
        return;

      this.amountClassesEnabled = amountClassesEnabled;
      this._redraw();
    },

    setShowSignum: function(showSignum) {
      if (this.showSignum === showSignum)
        return;

      this.showSignum = showSignum;
      this._redraw();
    },

    /**
     * Redraws the text of the label.
     *
     * @private
     */
    _redraw: function() {
      var text, className;

      if (!this.money) {
        // nothing we can do if we have no amount
        text = '';
      } else {
        if (!this.currency) {
          // no need to do formatting ourselves, just use the display value we're given
          text = this.money.display;
        } else {
          // alternate currency specified, format it ourselves
          text = money.format(this.money.value, {currency: this.currency});
        }

        var firstCharacter = text.substring(0,1),
            signum = (this.money.value < 0) ? '-' : '+';
        if (this.get('showSignum') === true) {
          if (firstCharacter !== signum)
            text = signum+text;
        } else if (this._showSignum === false) {
          if (firstCharacter === signum)
            text = text.substring(1);
        }
      }

      if (this.get('amountClassesEnabled') && this._className)
        this.get('element').removeClass('credit debit').addClass(this._className);

      this.get('element').text(text);
    }
  });
});

/**
 * Wraps a currency drop-down <select> element.
 */
wesabe.$class('views.widgets.CurrencyDropDownField', wesabe.views.widgets.DropDownField, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _currencySet: null,
    _currencySetChangeHandler: null,

    init: function(element, delegate, currencySet) {
      var me = this;

      if (!wesabe.isJQuery(element))
        currencySet = delegate, delegate = element, element = null;

      $super.init.call(me, element, delegate);

      me._currencySetChangeHandler = function(){ me.onCurrencySetChange() };
      me.setCurrencySet(currencySet || wesabe.data.currencies.sharedCurrencySet);
    },

    getCurrencySet: function() {
      return this._currencySet;
    },

    setCurrencySet: function(currencySet) {
      if (currencySet === this._currencySet)
        return;

      if (this._currencySet)
        this._currencySet.unbind('change', this._currencySetChangeHandler);

      this._currencySet = currencySet;
      this._currencySet.bind('change', this._currencySetChangeHandler);

      // trigger a refresh
      this._currencySetChangeHandler();
    },

    onCurrencySetChange: function() {
      this.clearOptions();

      var currencies = this._currencySet.getList();

      for (var i = 0, length = currencies.length; i < length; i++)
        this.addOption(currencies[i].code);
    }
  });
});

/**
 * Wraps the <div id="accounts"> element containing the list of accounts
 * on the page. Manages an {AccountGroupList} and handles most DOM events
 * for its descendants (google "event delegation").
 *
 * NOTE: This is intended to be a long-lived singleton and therefore does not
 * have any sort of cleanup function.
 */
wesabe.$class('wesabe.views.widgets.accounts.AccountWidget', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    /**
     * Returns a boolean indicating whether this {AccountWidget} is currently
     * loading data from the servers.
     */
    loading: false,

    /**
     * Gets the {CredentialDataSource} used to populate this {AccountGroupList}.
     */
    credentialDataSource: null,

    /**
     * Gets the {AccountGroupList} wrapping the <ul class="account-groups">.
     */
    accountGroupList: null,

    /**
     * Gets the {wesabe.views.widgets.MoneyLabel} wrapping the net worth line.
     */
    total: null,

    _editButton: null,
    _doneButton: null,
    _updateButton: null,
    _updateButtonSpinner: null,
    _accountEditDialog: null,
    _selectableObjects: null,
    _editMode: false,
    _hasDoneInitialLoad: false,
    _accountDataSource: null,

    init: function(element, accountDataSource, credentialDataSource) {
      $super.init.call(this, element);

      var me = this;

      me._accountDataSource = accountDataSource;
      me.credentialDataSource = credentialDataSource;
      // set up children
      me.accountGroupList = new $package.AccountGroupList(element.find('ul.account-groups'), me);
      me.total = new wesabe.views.widgets.MoneyLabel(element.find('.accounts-total .total'));
      me._editButton = new wesabe.views.widgets.Button(element.find('div.module-header a.edit-button'));
      me._editButton.bind('click', me.onEditButtonClick, me);
      me._doneButton = new wesabe.views.widgets.Button(element.find('div.module-header a.done-button'));
      me._doneButton.bind('click', me.onDoneButtonClick, me);
      me._updateButton = new wesabe.views.widgets.Button(element.find('div.module-header .update-button'));
      me._updateButtonSpinner = me._updateButton.get('element').children('.updating-spinner');
      me._updateButton.bind('click', me.triggerUpdates, me);

      // set up data source callbacks
      me._accountDataSource.subscribe({
        change: me.onAccountDataChanged,
        error: me.onAccountDataError
      }, me);

      // if we already have the data (preloaded), use it, otherwise load it
      if (me._accountDataSource.hasData()) {
        me.onAccountDataChanged(me._accountDataSource.get('data'));
      } else {
        me.loadData();
      }

      var creds = me.credentialDataSource;

      // set up the credential data source callbacks
      creds.subscribe(me.onUploadStatusChanged, me);

      if (!creds.hasData() || (creds.hasData() && creds.isUpdating()))
        creds.pollUntilSyncDone();

      // set up DOM event handlers
      element.click(function(event){ me.onClick(event) });

      me.registerChildWidgets(me.total, me.accountGroupList, me._editButton, me._doneButton, me._updateButton);
    },

    /**
     * Returns a boolean indicating whether this widget has done at least
     * one painting of the accounts.
     */
    hasDoneInitialLoad: function() {
      return this._hasDoneInitialLoad;
    },

    /**
     * Returns the {wesabe.util.Selection} associated with this {AccountWidget}.
     */
    selection: function() {
      return this.accountGroupList.get('selection');
    },

    /**
     * Sets the {wesabe.util.Selection} associated with this {AccountWidget}.
     */
    setSelection: function(selection) {
      this.accountGroupList.set('selection', selection);
    },

    /**
     * Gets the account with the given {uri}, returning null if it's not found.
     *
     * @param {!string} uri The unique identifier for the account to find.
     * @return {Account}
     */
    getAccountByURI: function(uri) {
      return this.get('accountGroupList').getAccountByURI(uri);
    },

    /**
     * Gets the {AccountEditDialog} singleton for this widget, passing it to
     * the callback when it becomes available.
     *
     * NOTE: This is lazy-loaded because account editing is relatively rare.
     */
    asyncGetAccountEditDialog: function(callback) {
      var me = this;

      if (me._accountEditDialog) {
        callback(me._accountEditDialog);
      } else {
        wesabe.ready('wesabe.views.widgets.accounts.AccountEditDialog', function() {
          var editDialogElement = me.get('element').find('div.edit-dialog');
          me._accountEditDialog = new $package.AccountEditDialog(editDialogElement, me);
          callback(me._accountEditDialog);
        });
      }
    },

    /**
     * Begins loading the account data if it is not already loaded.
     */
    loadData: function() {
      this.setLoading(true);
      this.refresh();
    },

    /**
     * Refresh the data used to draw this widget.
     */
    refresh: function() {
      this._accountDataSource.requestData();
      this.credentialDataSource.pollUntilSyncDone();
    },

    /**
     * Triggers updates of out-of-date SSU accounts for the user.
     */
    triggerUpdates: function() {
      var ds = this.credentialDataSource;
      $.post('/accounts/trigger-updates', function() {
        ds.pollUntilSyncDone();
      });
    },

    /**
     * Sets the flag indicating whether this {AccountWidget} is currently
     * loading data from the servers, hiding and showing the account data
     * appropriately.
     */
    setLoading: function(loading) {
      loading = !!loading;
      if (this.loading === loading)
        return;

      loading ? this.get('element').addClass('loading') :
                this.get('element').removeClass('loading');
      this.loading = loading;
    },

    /**
     * Sets the flag indicating whether this {AccountWidget} is currently
     * in account edit mode (expands all groups, shows editing pencils).
     */
    setEditMode: function(editMode) {
      if (editMode === this._editMode)
        return;

      this._editMode = editMode;
      this._editButton.setVisible(!editMode);
      this._doneButton.setVisible(editMode);
      this._updateButton.setVisible(!editMode);

      if (!editMode) {
        if (this._accountEditDialog)
          this._accountEditDialog.onEndEdit();
      }

      this.accountGroupList.set('editMode', editMode);

      if (!$package.AccountEditDialog)
        wesabe.load($package, 'AccountEditDialog');
    },

    /**
     * Called when the account data has been refreshed and requires a repaint.
     *
     * @private
     */
    onAccountDataChanged: function() {
      this.set('loading', false);
      this.updateAccountListing(this._accountDataSource.get('data'));
      this._hasDoneInitialLoad = true;
      this.set('selectableObjects', null);
      this.trigger('loaded');
    },

    /**
     * Called when the account data fails to refresh.
     *
     * @private
     */
    onAccountDataError: function() {
      wesabe.error("Unable to load accounts! Oh no!");
    },

    /**
     * Update the listing of accounts only, not the update status.
     */
    updateAccountListing: function(data) {
      this.setPath('total.money', data.total);
      this.get('accountGroupList').update(data['account-groups']);
    },

    /**
     * Called when the account upload status has changed.
     */
    onUploadStatusChanged: function() {
      this._updateButton.setVisible(this.credentialDataSource.hasCredentials());
      this.get('accountGroupList').updateUploadStatus(this.credentialDataSource);
      this._updateButtonSpinner.css('visibility', this.get('updatingAccounts') ? 'visible' : 'hidden');
    },

    /**
     * Returns a boolean indicating whether any accounts are currently being
     * updated via the Automatic Uploader.
     */
    updatingAccounts: function() {
      var groups = this.getPath('accountGroupList.items'),
          length = groups.length;

      while (length--)
        if (groups[length].get('updatingAccounts'))
          return true;

      return false;
    },

    /**
     * Handles clicks for this {AccountWidget} and its descendants, delegating
     * to a child {AccountGroup} if necessary.
     */
    onClick: function(event) {
      var element = $(event.target),
          groupElement = element.parents('.group');

      if (groupElement.length) {
        var group = this.get('accountGroupList').getItemByElement(groupElement);
        if (group)
          group.onClick(event);
        return;
      }
    },

    /**
     * Called when the user chooses to start editing {account}.
     */
    onBeginEdit: function(account) {
      this.asyncGetAccountEditDialog(function(accountEditDialog) {
        accountEditDialog.onBeginEdit(account);
      });
    },

    /**
     * Called when the user clicks the Edit button.
     */
    onEditButtonClick: function() {
      this.set('editMode', true);
    },

    /**
     * Called when the user clicks the Done button.
     */
    onDoneButtonClick: function() {
      this.set('editMode', false);
    },

    /**
     * Returns a list of objects that may be selected in this {AccountWidget}.
     *
     * See {wesabe.views.pages.accounts#reloadState}.
     */
    selectableObjects: function() {
      if (!this._selectableObjects) {
        var groups = this.get('accountGroupList').get('items'),
            length = groups.length,
            objects = $.makeArray(groups);

        while (length--)
          objects = objects.concat(groups[length].get('items'));

        this._selectableObjects = objects;
      }

      return this._selectableObjects;
    }
  });
});

$(function() {
  wesabe.provide('views.widgets.accounts.__instance__',
    new wesabe.views.widgets.accounts.AccountWidget($('#accounts'),
      wesabe.data.accounts.sharedDataSource, wesabe.data.credentials.sharedDataSource)) });

/**
 * Wraps the <ul class="account-groups"> inside the {AccountWidget}. Manages
 * the selection for the {AccountWidget} and all descendants.
 *
 * NOTE: This is intended to be a long-lived singleton and therefore does not
 * have any sort of cleanup function.
 */
wesabe.$class('wesabe.views.widgets.accounts.AccountGroupList', wesabe.views.widgets.BaseListWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;

  $.extend($class.prototype, {
    editMode: false,

    /**
     * Returns the {wesabe.util.Selection} associated with this
     * {AccountGroupList}.
     */
    selection: null,

    _widget: null,
    _template: null,

    init: function(element, widget) {
      $super.init.call(this, element);

      this._widget = widget;
      // extract the group template
      var template = element.children('li.group.template');
      this._template = template.clone().removeClass('template');
      template.remove();

      this.set('selection', new wesabe.util.Selection());
    },

    /**
     * Gets the {CredentialDataSource} used to populate this {AccountGroupList}.
     */
    credentialDataSource: function() {
      return this._widget.get('credentialDataSource');
    },

    /**
     * Gets the account with the given {uri}, returning null if it's not found.
     *
     * @param {!string} uri The unique identifier for the account to find.
     * @return {Account}
     */
    getAccountByURI: function(uri) {
      var items = this.get('items');

      for (var i = items.length; i--;) {
        var account = items[i].getAccountByURI(uri);
        if (account) return account;
      }

      return null;
    },

    /**
     * Refreshes the {AccountGroup} children with the new data.
     */
    update: function(accountGroups) {
      var length = accountGroups.length,
          items = [];

      while (length--) {
        var accountGroupDatum = accountGroups[length],
            item = this.getItemByURI(accountGroupDatum.uri);

        if (!item) {
          item = new $package.AccountGroup(this._template.clone(), this);
          item.set('editMode', this.editMode);
        }

        if (accountGroupDatum.key === 'archived')
          delete accountGroupDatum.total;

        items[length] = item;
        item.update(accountGroupDatum);
      }

      this.set('items', items);
    },

    /**
     * Refreshes the upload status of the {AccountGroup} children.
     */
    updateUploadStatus: function(credentialDataSource) {
      var items = this.get('items'),
          length = items.length;

      while (length--)
        items[length].updateUploadStatus(credentialDataSource);
    },

    /**
     * Sets the flag indicating whether this {AccountGroupList} is currently
     * in account edit mode (expands all groups, shows editing pencils).
     */
    setEditMode: function(editMode) {
      if (this.editMode === editMode)
        return;

      this.editMode = editMode;

      var items = this.get('items'),
          length = items.length;

      while (length--)
        items[length].set('editMode', editMode);
    },

    /**
     * Called when the user chooses to start editing {account}.
     */
    onBeginEdit: function(account) {
      if (this._widget)
        this._widget.onBeginEdit(account);
    }
  });
});

/**
 * Wraps a <li class="group"> containing both the group name and balance
 * as well as the list of accounts. Instances are managed by an
 * {AccountGroupList} to which they delegate both selection and DOM event
 * handling.
 */
wesabe.$class('wesabe.views.widgets.accounts.AccountGroup', wesabe.views.widgets.BaseListWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;
  // import wesabe.data.preferences as prefs
  var prefs = wesabe.data.preferences;

  $.extend($class.prototype, {
    /**
     * URI for this {AccountGroup} (e.g. "/account-groups/checking").
     *
     * @type {string}
     */
    uri: null,

    /**
     * Visible name of the group (e.g. "Checking").
     *
     * @type {string}
     */
    name: null,

    /**
     * The short url-friendly name for this {AccountGroup} (e.g. "credit").
     *
     * @type {string}
     */
    key: null,

    _template: null,
    _nameElement: null,
    _accountGroupList: null,
    _total: null,
    _expanded: false,
    _editMode: false,
    _wasExpanded: null,
    _items: null,

    init: function(element, accountGroupList) {
      $super.init.call(this, element);

      this._accountGroupList = accountGroupList;
      // extract the account template
      var template = element.children('ul').children('li.account.template');
      this._template = template.clone().removeClass('template');
      template.remove();

      // get name and total
      var header = element.children(':header');
      this._total = new wesabe.views.widgets.MoneyLabel(header.find('span.total'));
      this.registerChildWidget(this._total);
      this._nameElement = header.find('span.text-content');

      // get the account list element
      this.setListElement(element.children('ul'));
    },

    /**
     * Sets the name of this {AccountGroup} and updates the text, but does not
     * update the name on the server.
     */
    setName: function(name) {
      if (this.name === name)
        return;

      this.name = name;
      this._nameElement.text(name);
    },

    /**
     * Sets the short url-friendly name for this {AccountGroup}. This determines
     * which icon shows up next to the name.
     *
     * @param {!string} key
     */
    setKey: function(key) {
      if (this.key === key)
        return;

      if (this.key) this.get('element').removeClass(this.key);
      this.key = key;
      if (key) this.get('element').addClass(key);
    },

    /**
     * Gets the account with the given {uri}, returning null if it's not found.
     *
     * @param {!string} uri The unique identifier for the account to find.
     * @return {Account}
     */
    getAccountByURI: function(uri) {
      var items = this.get('items');

      for (var i = items.length; i--;) {
        var account = items[i];
        if (account.get('uri') === uri) return account;
      }

      return null;
    },

    /**
     * Gets the URL parameters for this {AccountGroup}, which is the
     * collection of all the params of its children {Account} instances.
     *
     * See {wesabe.views.pages.accounts#paramsForCurrentSelection}.
     */
    toParams: function() {
      var params = [],
          accounts = this.get('items'),
          length = accounts.length;

      while (length--)
        params = params.concat(accounts[length].toParams());

      return params;
    },

    /**
     * Gets the currencies of all children {Account} instances.
     *
     * See {wesabe.views.pages.accounts#paramsForCurrentSelection}.
     */
    getCurrencies: function() {
      var items = this.get('items'),
          length = items.length,
          currencies = [];

      while (length--)
        currencies = currencies.concat(items[length].get('currencies'));

      return array.uniq(currencies);
    },

    /**
     * Returns the {wesabe.util.Selection} associated with this {AccountGroup}.
     */
    getSelection: function() {
      return this._accountGroupList.get('selection');
    },

    /**
     * Gets the {CredentialDataSource} used to populate this {AccountGroup}.
     */
    credentialDataSource: function() {
      return this._accountGroupList.get('credentialDataSource');
    },

    /**
     * Handle clicks on this {AccountGroup} and its descendants, delegating
     * to a child {Account} if necessary.
     *
     * NOTE: There is no accompanying bind statement because this widget uses
     * event delegation for the entire list of accounts,
     * see {AccountWidget#onClick}.
     */
    onClick: function(event) {
      event.preventDefault();

      var target = $(event.target);

      // did they click the expand/collapse button?
      if (target.hasClass('view')) {
        if (!this.get('listElement').is(':animated')) {
          this.animateExpanded(!this.isExpanded());
          //this._persistPreferences();
        }
        return;
      }

      // do we need to delegate to an account?
      var accountElement = target.parents('.account');
      if (accountElement.length) {
        var account = this.getItemByElement(accountElement);
        if (account)
          account.onClick(event);
        return;
      }

      // we got clicked somewhere that isn't a hotspot
      if (event.ctrlKey || event.metaKey) {
        this.get('selection').toggle(this);
      } else {
        this.get('selection').set(this);
        if (!this.isExpanded()) {
          this.animateExpanded(true);
          //this._persistPreferences();
        }
      }
    },

    /**
     * Called by {wesabe.util.Selection} instances when this object
     * becomes part of the current selection.
     */
    onSelect: function() {
      if (this.get('element')) {
        this.get('element').addClass('on');
        if (this.get('element').hasClass('open'))
          this.get('element').addClass('open-on');
      }
    },

    /**
     * Called by {wesabe.util.Selection} instances when this object
     * ceases to be part of the current selection.
     */
    onDeselect: function() {
      if (this.get('element'))
        this.get('element').removeClass('on').removeClass('open-on');
    },

    /**
     * Called when the user chooses to start editing {account}.
     */
    onBeginEdit: function(account) {
      if (this._accountGroupList)
        this._accountGroupList.onBeginEdit(account);
    },

    /**
     * Sets whether this {AccountGroup} is currently in edit mode
     * (forces expansion).
     */
    setEditMode: function(editMode) {
      if (this._editMode === editMode)
        return;

      this._editMode = editMode;
      if (editMode) {
        // entering edit mode, keep track of whether it was expanded
        this._wasExpanded = this._expanded;
        this.animateExpanded(true);
      } else {
        // leaving edit mode, collapse if it was previously collapsed
        if (this._wasExpanded === false)
          this.animateExpanded(false);
        this._wasExpanded = null;
      }

      var items = this.get('items'),
          length = items.length;

      while (length--)
        items[length].setEditMode(editMode);
    },

    /**
     * Returns a boolean indicating whether this {AccountGroup} is expanded.
     */
    isExpanded: function() {
      return this._expanded;
    },

    /**
     * Sets the expansion state of this {AccountGroup} immediately, as
     * opposed to the gradual animation provided by {#animateExpanded}.
     *
     * If the value of {expanded} is the same as the current expansion
     * state, this function has no effect.
     *
     * This does not update the user's preferences for this {AccountGroup}'s
     * expansion state.
     */
    setExpanded: function(expanded) {
      this.animateExpanded(expanded, 0);
    },

    /**
     * Sets the expansion state of this {AccountGroup} gradually using a
     * sliding animation, as opposed to the immediate expansion provided by
     * {#setExpanded}.
     *
     * If the value of {expanded} is the same as the current expansion
     * state, this function has no effect.
     *
     * This does not update the user's preferences for this {AccountGroup}'s
     * expansion state.
     */
    animateExpanded: function(expanded, speed) {
      var me = this;

      if (expanded === me.isExpanded())
        return;

      if (expanded) {
        me.get('listElement').slideDown(speed, function() {
          me.get('element').addClass('open');
        });
      } else {
        me.get('listElement').slideUp(speed, function() {
          me.get('element').removeClass('open');
        });
      }

      me._expanded = expanded;
    },

    /**
     * Updates the DOM for this {AccountGroup} with new data.
     */
    update: function(accountGroup) {
      this.setName(accountGroup.name);
      this._total.setMoney(accountGroup.total);
      this.set('uri', accountGroup.uri);
      this.set('key', accountGroup.key);

      var accounts = accountGroup.accounts,
          length = accounts.length,
          items = [];

      while (length--) {
        var accountDatum = accounts[length],
            item = this.getItemByURI(accountDatum.uri);

        if (!item) {
          item = new $package.Account(this._template.clone(), this);
          item.setEditMode(this._editMode);
        }

        items[length] = item;
        item.update(accountDatum);
      }

      this.setItems(items);
      if (!this._editMode)
        this._restorePreferences();
    },

    /**
     * Updates the upload statuses for the child {Account} items.
     */
    updateUploadStatus: function(credentialDataSource) {
      var items = this.get('items'),
          length = items.length;

      while (length--)
        items[length].setCredential(credentialDataSource.getCredentialDataByAccountURI(items[length].get('uri')));
    },

    /**
     * Returns true if any of the accounts in this group are doing an SSU update, false otherwise.
     */
    updatingAccounts: function() {
      var items = this.get('items'),
          length = items.length;

      while (length--)
        if (items[length].isUpdating())
          return true;

      return false;
    },

    /**
     * Store the current state of this {AccountGroup} with the
     * preferences service.
     *
     * @private
     */
    _persistPreferences: function() {
      prefs.update(this._fullPrefKey('expanded'), this.isExpanded());
    },

    /**
     * Reload the state of this {AccountGroup} from the preference service.
     *
     * @private
     */
    _restorePreferences: function() {
      this.setExpanded(prefs.get(this._fullPrefKey('expanded')));
    },

    _fullPrefKey: function(shortKey) {
      return 'accounts.groups.' + this.key + '.' + shortKey;
    }
  });
});

/**
 * Wraps a <li class="account"> node in the accounts widget. Instances are
 * managed by an {AccountGroup} to which they delegate both selection and
 * DOM event handling.
 */
wesabe.$class('wesabe.views.widgets.accounts.Account', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.date
  var date = wesabe.lang.date;

  $.extend($class.prototype, {
    // state
    _editMode: false,

    /**
     * Gets the credential (i.e. ssu sync status) for this {Account}.
     *
     * @type {object}
     */
    credential: null,

    /**
     * Visible name of the account (e.g. "Bank of America - Checking").
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

    /**
     * Currency code for this account (e.g. "USD").
     *
     * @type {string}
     */
    currency: null,

    /**
     * The type of account.
     *
     * @type {string}
     */
    type: null,

    _status: null,
    _balance: null,
    _marketValue: null,
    _lastBalanceDate: null,
    _investment_positions: null,
    _investment_balance: null,
    _data: null,

    // references
    _accountGroup: null,
    _nameElement: null,
    _editButtonElement: null,
    _cashAccountStatusElement: null,
    _ssuStatusElement: null,
    _ssuUpdateSpinner: null,
    _ssuErrorStatusElement: null,
    _manualUploadStatusElement: null,
    _uploadStatusElement: null,
    _accountStatusElements: null,

    // child widgets
    _total: null,
    _ssuErrorHoverBox: null,
    _manualUploadHoverBox: null,

    init: function(element, accountGroup) {
      $super.init.call(this, element);
      this._accountGroup = accountGroup;

      var container = element.children('span.account-name');
      this._nameElement = container.children('.text-content');
      this._total = new wesabe.views.widgets.MoneyLabel(container.children('.balance'));
      this._editButtonElement = element.find('.edit');

      this._accountStatusElements = element.children('.account-status');
      this._cashAccountStatusElement = this._accountStatusElements.filter('.cash');
      this._ssuStatusElement = this._accountStatusElements.filter('.update:not(.error)');
      this._ssuUpdateSpinner = this._ssuStatusElement.find('.updating-spinner');
      this._ssuErrorStatusElement = this._accountStatusElements.filter('.update.error');
      this._ssuErrorHoverBox = new $package.AutomaticUploaderErrorDialog(this);
      this._ssuErrorHoverBox.setVisible(false);
      this._ssuErrorHoverBox.appendTo(this._ssuErrorStatusElement);
      this._manualUploadStatusElement = this._accountStatusElements.filter('.upload');
      this._manualUploadHoverBox = new $package.ManualUploadDialog(this._manualUploadStatusElement.find('.hover-box'), this);
      this._uploadStatusElement = this._accountStatusElements.filter('.upload');
      this._restoreAccountStatus();

      this.registerChildWidgets(this._total, this._ssuErrorHoverBox, this._manualUploadHoverBox);
    },

    /**
     * Sets the name of this {Account} and updates the text, but does not
     * update the name on the server.
     */
    setName: function(name) {
      if (this.name === name)
        return;

      this.name = name;
      this._nameElement.text(name);
    },

    setLastBalanceDate: function(lastBalanceDate) {
      if (this._lastBalanceDate === lastBalanceDate)
        return;

      this._lastBalanceDate = lastBalanceDate;
      this.get('element').attr('title', lastBalanceDate ? 'Updated ' + date.timeAgoInWords(lastBalanceDate) : '');
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
      return [{name: 'account', value: this.get('uri')}];
    },

    /**
     * Sets the display currency for this account, but does not update
     * the value of the currency on the server.
     */
    setCurrency: function(currency) {
      if (this.currency === currency)
        return;

      this.currency = currency;
      this._total.set('currency', currency);
    },

    /**
     * Gets the single currency for this account as an array.
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
      return this._accountGroup.get('selection');
    },

    hasBalance: function() {
      return hasValue(this._total.get('value'));
    },

    total: function() {
      return this._total.get('value');
    },

    isCash: function() {
      return (this.type == "Cash" || this.type == "Manual");
    },

    isInvestment: function() {
      return this.type === "Investment";
    },

    isArchived: function() {
      return (this._status == "archived");
    },

    isSSU: function() {
      return this.get('credential') ? true : false;
    },

    lastSSUJob: function() {
      var cred = this.get('credential');
      return cred && cred.last_job;
    },

    hasSSUError: function() {
      var lastJob = this.lastSSUJob();
      return lastJob && lastJob.status == 'failed';
    },

    isUpdating: function() {
      var lastJob = this.lastSSUJob();
      return lastJob && lastJob.status == 'pending';
    },

    /**
     * Sets the credential and updates the UI accordingly.
     */
    setCredential: function(credential) {
      var oldIsSSU = this.isSSU(),
          oldHasSSUError = this.hasSSUError(),
          oldIsUpdating = this.isUpdating();

      this.credential = credential;

      if (this.isSSU() !== oldIsSSU || this.hasSSUError() !== oldHasSSUError || this.isUpdating() !== oldIsUpdating)
        this._restoreAccountStatus();
    },

    /**
     * Handle clicks on this {Account}.
     *
     * NOTE: There is no accompanying bind statement because
     * this widget uses event delegation for the entire list
     * of accounts, see {AccountWidget#onClick}.
     */
    onClick: function(event) {
      if (event.target === this._editButtonElement[0]) {
        this.onBeginEdit();
      } else if (event.target === this._ssuStatusElement[0]) {
        this._startUpdate();
      } else if (event.target === this._ssuErrorStatusElement[0]) {
        this._ssuErrorHoverBox.toggle();
        event.stopPropagation();
      } else if (event.target === this._manualUploadStatusElement[0]) {
        this._manualUploadHoverBox.toggle();
        event.stopPropagation();
      } else {
        if (event.ctrlKey || event.metaKey) {
          this.get('selection').toggle(this);
        } else {
          this.get('selection').set(this);
        }
      }
    },

    /**
     * Tells the server to begin updating the credential associated with
     * this {Account} and restarts polling for job completion.
     *
     * @private
     */
    _startUpdate: function() {
      if (!this.isSSU())
        return;

      var ds = this._accountGroup.get('credentialDataSource');
      $.post(this.get('credential').uri+'/jobs', function() {
        ds.pollUntilSyncDone();
      });
    },

    /**
     * Called by {wesabe.util.Selection} instances when this object
     * becomes part of the current selection.
     */
    onSelect: function() {
      if (this.get('element'))
        this.get('element').addClass('on');
      // ensure that the containing group is expanded
      if (this._accountGroup)
        this._accountGroup.animateExpanded(true);
    },

    /**
     * Called when the user chooses to start editing this account.
     */
    onBeginEdit: function() {
      if (this._accountGroup)
        this._accountGroup.onBeginEdit(this);
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
    update: function(accountData) {
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
    },

    /**
     * Sets the flag indicating whether this {Account} is currently
     * in account edit mode.
     */
    setEditMode: function(editMode) {
      if (editMode === this._editMode)
        return;

      this._editMode = editMode;

      if (editMode) {
        this._editButtonElement.show();
      } else {
        this._editButtonElement.hide();
      }

      this._restoreAccountStatus();
    },

    /**
     * Shows the account status element appropriate for the current status
     * of this {Account}.
     *
     * @private
     */
    _restoreAccountStatus: function() {
      this._accountStatusElements.hide();
      if (this._editMode)
        return;

      if (this.isSSU()) {
        if (this.hasSSUError()) {
          this._ssuErrorStatusElement.show();
        } else {
          this._ssuStatusElement.show();
          this._ssuUpdateSpinner.css('visibility', this.isUpdating() ? 'visible' : 'hidden');
        }
      } else if (this.isCash()) {
        this._cashAccountStatusElement.show();
      } else {
        this._uploadStatusElement.show();
      }
    }
  });
});

/**
 * Provides selection support for merchants.
 */
wesabe.$class('wesabe.views.widgets.accounts.Merchant', function($class, $super, $package) {
  $.extend($class.prototype, {
    /**
     * The name of the merchant (e.g. "Starbucks").
     */
    name: null,

    init: function(name) {
      this.name = name;
    },

    /**
     * Gets the URI for this {Merchant} (e.g. "/merchants/Starbucks").
     *
     * See {wesabe.views.pages.accounts#storeState}.
     */
    uri: function() {
      return '/merchants/'+this.get('name');
    },

    /**
     * Gets the URL parameters for this {Merchant}.
     *
     * See {wesabe.views.pages.accounts#paramsForCurrentSelection}.
     */
    toParams: function() {
      return [{name: 'merchant', value: this.get('name')}];
    },

    /**
     * Returns true if {other} is a {Merchant} and has the same name.
     */
    isEqualTo: function(other) {
      return other && other.isInstanceOf($class) && (this.get('name') === other.get('name'));
    }
  });
});

/**
 * Displays an error along with a reset link for an account's credentials.
 */
wesabe.$class('wesabe.views.widgets.accounts.AutomaticUploaderErrorDialog', wesabe.views.widgets.Dialog, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _account: null,
    _resetCredLink: null,

    init: function(account) {
      $super.init.call(this);
      this._account = account;

      this.addClassName("hover-box");
      this.set('contentElement', this.get('topElement'));

      var contents = $('<div class="contents">'+
                         '<div class="header">Automatic Uploader Error</div>'+
                         '<p>Your bank has reported an error. To reset your bank credentials, click <a class="reset-creds">here</a>.</p>'+
                       '</div>');

      this.appendElement(contents);
      this._resetCredLink = contents.find('a.reset-creds');
    },

    onBlur: function() {
      this.hide();
    },

    show: function() {
      // FIXME: This shouldn't be done as a GET, but this is a historical artifact
      // from when SSU was first created. It should instead do an ajax DELETE or
      // a form POST with _method=DELETE and then send the user to the right page
      // to re-enter their credentials.
      this._resetCredLink.attr('href', '/credentials/destroy/'+this._account.get('credential').id);
      $super.show.call(this);
    }
  });
});

/**
 * Handles the dialog for uploading files to non-SSU accounts.
 */
wesabe.$class('wesabe.views.widgets.accounts.ManualUploadDialog', wesabe.views.widgets.Dialog, function($class, $super, $package) {
  $.extend($class.prototype, {
    _account: null,
    _form: null,
    _accountUriInput: null,
    _fiLink: null,

    init: function(element, account) {
      $super.init.call(this, element);
      this._account = account;
      this._accountUriInput = element.find('input[name=account_uri]');
      this._fiLink = element.find('a.fi-link');
      this._form = element.find('form');
    },

    show: function() {
      this._accountUriInput.val(this._account.get('uri'));
      this._fiLink.attr('href', this._account.get('uri')+'/financial_institution_site');
      $super.show.apply(this, arguments);
    },

    onBlur: function() {
      this.hide();
    },

    onConfirm: function() {
      this._form[0].submit();
    }
  });
});

/**
 * Wraps the targets widget on the dashboard.
 */
wesabe.$class('wesabe.views.widgets.targets.TargetWidget', wesabe.views.widgets.Module, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.date
  var date = wesabe.lang.date;
  // import wesabe.views.widgets.Button
  var Button = wesabe.views.widgets.Button;
  // import wesabe.views.widgets.Label
  var Label = wesabe.views.widgets.Label;

  $.extend($class.prototype, {
    _dataSource: null,
    _targetList: null,
    _addTargetDialog: null,
    _addTargetDialogElement: null,
    _previousMonthButton: null,
    _nextMonthButton: null,
    _previousMonthLabel: null,
    _nextMonthLabel: null,
    _currentMonthLabel: null,
    _headerMonthLabel: null,

    init: function(element, dataSource) {
      $super.init.call(this, element);

      this._dataSource = dataSource;

      // create the list of targets
      this._targetList = new $package.TargetList($("#targets-list"), this, this._dataSource);

      // bind click on Add Target to show the add target dialog
      var addTargetButton = Button.withText('Add Spending Target');
      addTargetButton.bind('click', this.onAddTarget, this);
      addTargetButton.prependTo(this.get('headerElement'));
      this._addTargetDialogElement = element.find('#add-target .dialog');

      // set up the month navigation buttons
      var dateRangeNavElement = element.find('#date-range-nav');
      this._previousMonthButton = new Button(dateRangeNavElement.find('.left-arrow,.previous-month'));
      this._previousMonthButton.bind('click', this.selectPreviousMonth, this);
      this._nextMonthButton = new Button(dateRangeNavElement.find('.right-arrow,.next-month'));
      this._nextMonthButton.bind('click', this.selectNextMonth, this);

      // set up the month labels
      var monthFormatter = {format: function(value){ return date.format(value, 'MMM yyyy') }};
      this._previousMonthLabel = new Label(dateRangeNavElement.find('.previous-month span'), monthFormatter);
      this._nextMonthLabel = new Label(dateRangeNavElement.find('.next-month span'), monthFormatter);
      this._currentMonthLabel = new Label(dateRangeNavElement.find('.current-date-range'), {
        format: function(value) {
          var now = new Date(),
              endOfMonth = date.endOfMonth(now);
          if (date.equals(endOfMonth, date.endOfMonth(value))) {
            var days = Math.ceil((endOfMonth - now)/date.DAY) + 1;
            return (days == 1 ? "Last day of " : days + " days left in ") + date.format(value, "MMM");
          } else {
            return monthFormatter.format(value);
          }
        }
      });
      this._headerMonthLabel = new Label(element.find('.module-header .month'), {
          format: function(value){ return date.format(value, 'MMM') }
      });

      // make sure we GC the target list and add target button when we're cleaning up
      this.registerChildWidgets(
        this._targetList, addTargetButton,
        this._previousMonthButton, this._nextMonthButton
      );

      // set things in motion by displaying the current month
      this.set('currentMonth', new Date());
    },

    /**
     * Selects the month before the currently-selected month, updating the UI.
     */
    selectPreviousMonth: function() {
      this.set('currentMonth', this.getMonthWithOffsetInMonths(-1));
    },

    /**
     * Selects the month before the currently-selected month, updating the UI.
     */
    selectNextMonth: function() {
      this.set('currentMonth', this.getMonthWithOffsetInMonths(1));
    },

    /**
     * Returns a date in the month offset from the current month by +offset+ months.
     *
     * @param {!number} offset
     * @private
     */
    getMonthWithOffsetInMonths: function(offset) {
      return date.addMonths(this.get('currentMonth'), offset);
    },

    /**
     * Returns a Date in the currently-selected month.
     *
     * @return {Date}
     */
    currentMonth: function() {
      return this._dataSource.get('startDate');
    },

    /**
     * Returns true if the currently-selected month is this month, false otherwise.
     *
     * @return {boolean}
     */
    isThisMonth: function() {
      return date.equals(date.startOfMonth(this.get('currentMonth')), date.startOfMonth(new Date()));
    },

    /**
     * Sets the displayed month to the month that includes +currentMonth+.
     *
     * @param {!date} currentMonth
     */
    setCurrentMonth: function(currentMonth) {
      this._dataSource.selectMonth(currentMonth);
      this._dataSource.requestData();

      this._nextMonthButton.set('visible', !this.isThisMonth());
      this._previousMonthLabel.set('value', this.getMonthWithOffsetInMonths(-1));
      this._nextMonthLabel.set('value', this.getMonthWithOffsetInMonths(1));
      this._currentMonthLabel.set('value', currentMonth);
      this._headerMonthLabel.set('value', currentMonth);
    },

    /**
     * Handles the user clicking the Add Target button.
     *
     * @private
     */
    onAddTarget: function() {
      this.asyncGetAddTargetDialog(function(dialog) {
        dialog.showModal();
      });
    },

    /**
     * Load the AddTargetDialog class and call back with an instance.
     *
     * @param {?function(AddTargetDialog)} callback
     * @private
     */
    asyncGetAddTargetDialog: function(callback) {
      if (this._addTargetDialog) {
        if (callback) callback(this._addTargetDialog);
        return;
      }

      var me = this;
      wesabe.load($package, 'AddTargetDialog', function(klass) {
        me._addTargetDialog = new klass(me._addTargetDialogElement, me);
        if (callback) callback(me._addTargetDialog);
      });
    },

    /**
     * Delegate method for the AddTargetDialog instance.
     *
     * @private
     */
    onConfirm: function(dialog) {
      this._dataSource.create(dialog.get('tag'), dialog.get('amount'), function(){ this._targetList.refresh() }, this);
      dialog.hideModal();
    }
  });
});

/**
 * Wraps a target list item on the dashboard.
 */
wesabe.$class('wesabe.views.widgets.targets.Target', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.money
  var money = wesabe.lang.money;
  // import wesabe.lang.string
  var string = wesabe.lang.string;
  // import wesabe.views.shared
  var shared = wesabe.views.shared;
  // import wesabe.views.widgets.Label
  var Label = wesabe.views.widgets.Label;

  $.extend($class.prototype, {
    /**
     * The name of the tag this target is set for.
     *
     * @type {string}
     */
    tagName: null,

    /**
     * The monthly spending limit this target is set to.
     *
     * @type {number}
     */
    monthlyLimit: null,

    /**
     * The amount the user has spent on this target's tag so far this month.
     *
     * @type {number}
     */
    amountSpent: null,

    /**
     * true if this target has been destroyed, false otherwise
     *
     * @type {boolean}
     */
    destroyed: false,

    _targetList: null,
    _tagNameElement: null,
    _barSpentElement: null,
    _amountSpentLabel: null,
    _amountRemainingLabel: null,
    _targetAmountLabel: null,
    _removeButton: null,
    _editButton: null,

    init: function(element, targetList) {
      var me = this;

      $super.init.call(this, element);

      this._targetList = targetList;

      this._tagNameElement = element.find('.target-name');
      this._barSpentElement = element.find('.target-bar-spent');
      this._barSpentElement.css('background-position', '-410px 4px');

      this._amountSpentLabel = new Label(element.find('.amount-spent'));
      this._amountRemainingLabel = new Label(element.find('.amount-remaining'));
      this._targetAmountLabel = new Label(element.find('.target-amount'));

      this._removeButton = new wesabe.views.widgets.Button(element.find('.remove'));
      this._removeButton.bind('click', this.onRemove, this);
      this._editButton = new wesabe.views.widgets.Button(element.find('.edit'));
      this._editButton.bind('click', this.onEdit, this);

      this._tagNameElement.add(this._barSpentElement).add(this._targetAmountLabelElement).bind('click', function() {
        shared.navigateTo('/tags/'+string.uriEscape(me.get('tagName')));
      });

      this.registerChildWidgets(this._removeButton, this._editButton, this._amountSpentLabel, this._amountRemainingLabel, this._targetAmountLabel);
    },

    setTagName: function(tagName) {
      if (this.tagName === tagName)
        return;

      this.tagName = tagName;
      this._tagNameElement.text(tagName);
    },

    setMonthlyLimit: function(monthlyLimit) {
      this.monthlyLimit = monthlyLimit;
      this.redraw();
    },

    setAmountSpent: function(amountSpent) {
      this.amountSpent = amountSpent;
      this.redraw();
    },

    percentFull: function() {
      var limit = money.amount(this.get('monthlyLimit'));
      var amountSpent = money.amount(this.get('amountSpent'));
      if (limit == 0)
        return amountSpent == 0 ? 0 : 1;

      return amountSpent / limit;
    },

    amountRemaining: function() {
      return money.toMoney(
          money.amount(this.get('monthlyLimit')) - money.amount(this.get('amountSpent')),
          this.get('monthlyLimit').currency);
    },

    /**
     * Handles clicking the remove button on a target.
     */
    onRemove: function() {
      var me = this;
      this._targetList.removeTarget(this.get('tagName'));
      this.set('destroyed', true);
      this.get('element').fadeOut(function(){ me.remove() });
    },

    /**
     * Handles clicking the edit button on a target.
     */
    onEdit: function() {
      var me = this;

      this._targetList.asyncGetEditTargetDialog(function(dialog) {
        dialog.set('tagName', me.get('tagName'));
        dialog.set('amount', money.amount(me.get('monthlyLimit')));
        dialog.alignWithTarget(me);
        dialog.showModal();
      });
    },

    redraw: function() {
      if (this.get('amountSpent') === null || this.get('monthlyLimit') === null)
        return;

      var me              = this,
          percentFull     = this.get('percentFull'),
          amountRemaining = this.get('amountRemaining'),
          hasLeftBuffer   = percentFull >= 0.1,
          hasRightBuffer  = percentFull <= 0.9;

      this.animateSpent(percentFull, function() {
        var remainingText = "";
        if (hasRightBuffer) {
          remainingText += me._format(me.get('amountRemaining'));
          if (!hasLeftBuffer) remainingText += ' left';
        }
        me._amountRemainingLabel.set('value', remainingText);

        var spentText = "";
        if (hasLeftBuffer) {
          spentText += me._format(me.get('amountRemaining'));
        }
        me._amountSpentLabel.set('value', spentText);

        me._amountSpentLabel.set('visible', hasLeftBuffer);
        me._amountRemainingLabel.set('visible', hasRightBuffer);

        if (money.amount(amountRemaining) < 0) {
          me._targetAmountLabel.set('value', me._format(money.abs(amountRemaining))+' over');
          me._targetAmountLabel.get('element').addClass('over');
        } else {
          me._targetAmountLabel.set('value', me._format(me.get('monthlyLimit')))
          me._targetAmountLabel.get('element').removeClass('over');
        }
      });
    },

    animateSpent: function(percentFull, callback) {
      var origin = -10,
          x = Math.min(0, 400 * percentFull - 410);

      this._barSpentElement
        //.css('background-position', origin+'px 4px')
        .animate({ 'background-position': x+'px 4px' }, callback);

      this._amountRemainingLabel.get('element')
        //.css('left', origin+415)
        .animate({'left': x+415});
    },

    _format: function(amount) {
      return (money.amount(amount) < 1) ? money.format(amount) : money.format(amount, {precision: 0});
    }
  });
});

/**
 * Manages the list of targets on the dashboard.
 */
wesabe.$class('wesabe.views.widgets.targets.TargetList', wesabe.views.widgets.BaseListWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _template: null,
    _targetWidget: null,
    _dataSource: null,
    _noTargetsElement: null,
    _dateRangeNavElement: null,
    _targetEditDialog: null,
    _targetEditDialogElement: null,

    init: function(element, targetWidget, dataSource) {
      $super.init.call(this, element);

      this._targetWidget = targetWidget;
      this._dataSource = dataSource;
      this._dataSource.subscribe(this.update, this);

      var template = element.children('.template');
      this._template = template.clone().removeClass('template');
      template.remove();

      this._noTargetsElement = $('#no-targets');
      this._dateRangeNavElement = $('#date-range-nav');
      this._targetEditDialogElement = $('#edit-dialog');
    },

    update: function(targetListData) {
      if (targetListData.length) {
        this._noTargetsElement.hide();
        this._dateRangeNavElement.show();
      } else {
        this._noTargetsElement.show();
        this._dateRangeNavElement.hide();
      }

      var items = [];

      for (var i = targetListData.length; i--; ) {
        var targetDatum = targetListData[i],
            target = this.getItemByTagName(targetDatum.tag.name);

        if (!target) {
          target = new $package.Target(this._template.clone(), this);
        }

        target.set('tagName', targetDatum.tag.name);
        target.set('monthlyLimit', targetDatum.monthly_limit);
        target.set('amountSpent', targetDatum.amount_spent);

        items[i] = target;
      }

      this.set('items', items);
    },

    getItemByTagName: function(tagName) {
      for (var i = this.get('items').length; i--; ) {
        var item = this.getItem(i);
        if (item.get('tagName') === tagName)
          return item;
      }
    },

    onConfirm: function(dialog) {
      this._dataSource.update(dialog.get('tagName'), dialog.get('amount'), this.refresh, this);
      dialog.hideModal()
    },

    /**
     * Refreshes the data in the data source and, as a result, redraws the list.
     */
    refresh: function() {
      for (var i = this.get('items').length; i--; )
        if (this.getItem(i).get('destroyed'))
          this.removeItemAtIndex(i);

      this._dataSource.clearCache();
      this._dataSource.requestData();
    },

    /**
     * Load the EditTargetDialog class and call back with an instance.
     *
     * @param {?function(EditTargetDialog)} callback
     * @private
     */
    asyncGetEditTargetDialog: function(callback) {
      if (this._targetEditDialog) {
        if (callback) callback(this._targetEditDialog);
        return;
      }

      var me = this;
      wesabe.load($package, 'EditTargetDialog', function(klass) {
        me._targetEditDialog = new klass(me._targetEditDialogElement, me);
        if (callback) callback(me._targetEditDialog);
      });
    },

    /**
     * Updates the amount for the target with the given tag.
     *
     * @param {!string} tag
     * @param {!number} amount
     */
    removeTarget: function(tag) {
      this._dataSource.remove(tag, this.refresh, this);
    }
  });
});

wesabe.$class('wesabe.data.TargetDataSource', wesabe.data.BaseDataSource, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.date
  var date = wesabe.lang.date;

  $.extend($class.prototype, {
    /**
     * The start date to get target data for.
     *
     * @type {date}
     */
    startDate: null,

    /**
     * The end date to get target data for.
     *
     * @type {date}
     */
    endDate: null,

    /**
     * Selects the current month as the date range for this data source.
     */
    selectCurrentMonth: function() {
      this.selectMonth(new Date());
    },

    /**
     * Sets the start and end dates to the start and end of the month containing {dateInMonth}.
     *
     * @param {!date} dateInMonth
     */
    selectMonth: function(dateInMonth) {
      this.startDate = date.startOfMonth(dateInMonth);
      this.endDate = date.endOfMonth(dateInMonth);
    },

    /**
     * Gets the default set of options to pass to {jQuery.ajax}.
     */
    requestOptions: function() {
      return $.extend($super.requestOptions.apply(this, arguments), {
        url: '/targets',
        data: {
          start_date: date.toParam(this.get('startDate')),
          end_date: date.toParam(this.get('endDate'))
        }
      });
    },

    /**
     * Updates the target with the given tag to the given amount.
     *
     * @param {!string} tag
     * @param {!number} amount
     * @param {?function(object, string)} callback Handler for the XHR response.
     * @param {?object} context `this' inside callback
     */
    update: function(tag, amount, callback, context) {
      $.put("/targets/" + tag, { amount: amount },
        callback && function(){ callback.apply(context || this, arguments) },
        "json");
    },

    /**
     * Updates the target with the given tag to the given amount.
     *
     * @param {!string} tag
     * @param {!number} amount
     * @param {?function(object, string)} callback Handler for the XHR response.
     * @param {?object} context `this' inside callback
     */
    create: function(tag, amount, callback, context) {
      $.post("/targets", { tag: tag, amount: amount },
        callback && function(){ callback.apply(context || this, arguments) },
        "json");
    },

    /**
     * Updates the target with the given tag to the given amount.
     *
     * @param {!string} tag
     * @param {!number} amount
     * @param {?function(object, string)} callback Handler for the XHR response.
     * @param {?object} context `this' inside callback
     */
    remove: function(tag, amount, callback, context) {
      // this is not using DELETE /targets/:tag because it seems just about impossible to get escaped
      // data in urls through both Apache and Mongrel, so we just send it as part of the POST body.
      $.post("/targets/delete", { tag: tag },
        callback && function(){ callback.apply(context || this, arguments) },
        "json");
    }
  });
  $class.sharedDataSource = new $class();
});

/**
 * Provides access to user credentials and sync status.
 */
wesabe.$class('wesabe.data.credentials.CredentialDataSource', wesabe.data.BaseDataSource.dataSourceWithURI('/credentials'), function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;
  // import wesabe.lang.number
  var number = wesabe.lang.number;

  $.extend($class.prototype, {
    _syncDonePoller: null,

    /**
     * Returns credential data for the account with URI {accountUri}, or null if
     * no such credential can be found.
     */
    getCredentialDataByAccountURI: function(accountUri) {
      if (!this.hasData())
        return null;

      var credentials = this.get('data'),
          length = credentials.length;

      while (length--)
        if (array.contains(credentials[length].accounts, accountUri))
          return credentials[length];

      return null;
    },

    /**
     * Destroys the credential at the given +uri+. If +uri+ is a credential
     * structure, the uri will be determined for you.
     *
     * @param {!String|Object} uri
     */
    destroy: function(uri) {
      if (uri && uri.uri)
        uri = uri.uri;

      if (!uri)
        return;

      var me = this;
      $.ajax({
        type: 'DELETE',
        url: uri,
        success: function(){ me.onDestroy(uri); },
        error: function(xhr, textStatus, errorThrown){ me.onDestroyFailed(uri, xhr, textStatus, errorThrown); }
      });
    },

    onDestroy: function(uri) {
      if (this.get('cachingEnabled')) {
        // remove from the cache
        for (var k in this._cache) {
          var cache = this._cache[k], result = [];

          for (var i = 0, length = cache.length; i < length; i++)
            if (cache[i].uri != uri)
              result.push(cache[i]);

          this._cache[k] = result;
        }
      }

      this.trigger('destroy', [uri]);

      if (this.get('cachingEnabled')) {
        var data = this.getCache({});
        if (data)
          this.trigger('change', [data]);
      }
    },

    onDestroyFailed: function(uri, xhr, textStatus, errorThrown) {
      this.trigger('destroy-failed', [uri, xhr, textStatus, errorThrown]);
    },

    /**
     * Returns true if there are any credentials still pending, false otherwise.
     */
    isUpdating: function() {
      var data = this.get('data');

      if (!data)
        return false;

      for (var i = data.length; i--;) {
        var job = data[i].last_job;
        if (job && job.status === 'pending')
          return true;
      }

      return false;
    },

    /**
     * Returns whether or not there are any credentials in this data source.
     *
     * @return {boolean}
     */
    hasCredentials: function() {
      if (!this.hasData())
        return false;
      else if (this.get('data').length > 0)
        return true;
      else
        return false;
    },

    /**
     * Begin polling for credentials every {duration} milliseconds until there
     * are no more running sync jobs.
     */
    pollUntilSyncDone: function(duration) {
      var me = this;

      if (!duration)
        duration = 6000 /* ms */;

      // start the sync done poller if it isn't started yet
      if (!me._syncDonePoller)
        me._syncDonePoller = me.startPoller(duration, function() {
          if (!me.isUpdating()) {
            me.stopPoller(me._syncDonePoller);
            me._syncDonePoller = null;
          }
        });

      return me._syncDonePoller;
    }
  });
  $package.sharedDataSource = new $class();
});

/*
 * Processing.js - John Resig (http://ejohn.org/)
 * MIT Licensed
 * http://ejohn.org/blog/processingjs/
 */

(function(){

this.Processing = function Processing( aElement, aCode )
{
  var p = buildProcessing( aElement );
  p.init( aCode );
  return p;
};

function log()
{
  try
  {
    console.log.apply( console, arguments );
  }
  catch(e)
  {
    try
    {
      opera.postError.apply( opera, arguments );
    }
    catch(e){}
  }
}

function parse( aCode, p )
{
  // Angels weep at this parsing code :-(

  // Remove end-of-line comments
  aCode = aCode.replace(/\/\/ .*\n/g, "\n");

  // Weird parsing errors with %
  aCode = aCode.replace(/([^\s])%([^\s])/g, "$1%$2");

  // Simple convert a function-like thing to function
  aCode = aCode.replace(/(?:static )?(\w+ )(\w+)\s*(\([^\)]*\)\s*{)/g, function(all, type, name, args)
  {
    if ( name == "if" || name == "for" || name == "while" )
    {
      return all;
    }
    else
    {
      return "Processing." + name + " = function " + name + args;
    }
  });

  // Force .length() to be .length
  aCode = aCode.replace(/\.length\(\)/g, ".length");

  // foo( int foo, float bar )
  aCode = aCode.replace(/([\(,]\s*)(\w+)((?:\[\])+| )\s*(\w+\s*[\),])/g, "$1$4");
  aCode = aCode.replace(/([\(,]\s*)(\w+)((?:\[\])+| )\s*(\w+\s*[\),])/g, "$1$4");

  // float[] foo = new float[5];
  aCode = aCode.replace(/new (\w+)((?:\[([^\]]*)\])+)/g, function(all, name, args)
  {
    return "new ArrayList(" + args.slice(1,-1).split("][").join(", ") + ")";
  });

  aCode = aCode.replace(/(?:static )?\w+\[\]\s*(\w+)\[?\]?\s*=\s*{.*?};/g, function(all)
  {
    return all.replace(/{/g, "[").replace(/}/g, "]");
  });

  // int|float foo;
  var intFloat = /(\n\s*(?:int|float)(?:\[\])?(?:\s*|[^\(]*?,\s*))([a-z]\w*)(;|,)/i;
  while ( intFloat.test(aCode) )
  {
    aCode = aCode.replace(new RegExp(intFloat), function(all, type, name, sep)
    {
      return type + " " + name + " = 0" + sep;
    });
  }

  // float foo = 5;
  aCode = aCode.replace(/(?:static )?(\w+)((?:\[\])+| ) *(\w+)\[?\]?(\s*[=,;])/g, function(all, type, arr, name, sep)
  {
    if ( type == "return" || type == "div" || type == "span" || type == "img" || type == "a" || type == "strong" || type == "input" || type == "option"|| type == "tr"|| type == "td")
      return all;
    else
      return "var " + name + sep;
  });

  // Fix Array[] foo = {...} to [...]
  aCode = aCode.replace(/=\s*{((.|\s)*?)};/g, function(all,data)
  {
    return "= [" + data.replace(/{/g, "[").replace(/}/g, "]") + "]";
  });

  // static { ... } blocks
  aCode = aCode.replace(/static\s*{((.|\n)*?)}/g, function(all, init)
  {
    // Convert the static definitons to variable assignments
    //return init.replace(/\((.*?)\)/g, " = $1");
    return init;
  });

  // super() is a reserved word
  aCode = aCode.replace(/super\(/g, "superMethod(");

  var classes = ["int", "float", "boolean", "string"];

  function ClassReplace(all, name, extend, vars, last)
  {
    classes.push( name );

    var static = "";

    vars = vars.replace(/final\s+var\s+(\w+\s*=\s*.*?;)/g, function(all,set)
    {
      static += " " + name + "." + set;
      return "";
    });

    // Move arguments up from constructor and wrap contents with
    // a with(this), and unwrap constructor
    return "function " + name + "() {with(this){\n  " +
      (extend ? "var __self=this;function superMethod(){extendClass(__self,arguments," + extend + ");}\n" : "") +
      // Replace var foo = 0; with this.foo = 0;
      // and force var foo; to become this.foo = null;
      vars
        .replace(/,\s?/g, ";\n  this.")
        .replace(/\b(var |final |public )+\s*/g, "this.")
        .replace(/this.(\w+);/g, "this.$1 = null;") +
  (extend ? "extendClass(this, " + extend + ");\n" : "") +
        "<CLASS " + name + " " + static + ">" + (typeof last == "string" ? last : name + "(");
  }

  var matchClasses = /(?:public |abstract |static )*class (\w+)\s*(?:extends\s*(\w+)\s*)?{\s*((?:.|\n)*?)\b\1\s*\(/g;
  var matchNoCon = /(?:public |abstract |static )*class (\w+)\s*(?:extends\s*(\w+)\s*)?{\s*((?:.|\n)*?)(Processing)/g;

  aCode = aCode.replace(matchClasses, ClassReplace);
  aCode = aCode.replace(matchNoCon, ClassReplace);

  var matchClass = /<CLASS (\w+) (.*?)>/, m;

  while ( (m = aCode.match( matchClass )) )
  {
    var left = RegExp.leftContext,
      allRest = RegExp.rightContext,
      rest = nextBrace(allRest),
      className = m[1],
      staticVars = m[2] || "";

    allRest = allRest.slice( rest.length + 1 );

    rest = rest.replace(new RegExp("\\b" + className + "\\(([^\\)]*?)\\)\\s*{", "g"), function(all, args)
    {
      args = args.split(/,\s*?/);

      if ( args[0].match(/^\s*$/) )
        args.shift();

      var fn = "if ( arguments.length == " + args.length + " ) {\n";

      for ( var i = 0; i < args.length; i++ )
      {
        fn += "    var " + args[i] + " = arguments[" + i + "];\n";
      }

      return fn;
    });

    // Fix class method names
    // this.collide = function() { ... }
    // and add closing } for with(this) ...
    rest = rest.replace(/(?:public )?Processing.\w+ = function (\w+)\((.*?)\)/g, function(all, name, args)
    {
      return "ADDMETHOD(this, '" + name + "', function(" + args + ")";
    });

    var matchMethod = /ADDMETHOD([\s\S]*?{)/, mc;
    var methods = "";

    while ( (mc = rest.match( matchMethod )) )
    {
      var prev = RegExp.leftContext,
        allNext = RegExp.rightContext,
        next = nextBrace(allNext);

      methods += "addMethod" + mc[1] + next + "});"

      rest = prev + allNext.slice( next.length + 1 );

    }

    rest = methods + rest;

    aCode = left + rest + "\n}}" + staticVars + allRest;
  }

  // Do some tidying up, where necessary
  aCode = aCode.replace(/Processing.\w+ = function addMethod/g, "addMethod");

  function nextBrace( right )
  {
    var rest = right;
    var position = 0;
    var leftCount = 1, rightCount = 0;

    while ( leftCount != rightCount )
    {
      var nextLeft = rest.indexOf("{");
      var nextRight = rest.indexOf("}");

      if ( nextLeft < nextRight && nextLeft != -1 )
      {
        leftCount++;
        rest = rest.slice( nextLeft + 1 );
        position += nextLeft + 1;
      }
      else
      {
        rightCount++;
        rest = rest.slice( nextRight + 1 );
        position += nextRight + 1;
      }
    }

    return right.slice(0, position - 1);
  }

  // Handle (int) Casting
  aCode = aCode.replace(/\(int\)/g, "0|");

  // Remove Casting
  aCode = aCode.replace(new RegExp("\\((" + classes.join("|") + ")(\\[\\])?\\)", "g"), "");

  // Convert 3.0f to just 3.0
  aCode = aCode.replace(/(\d+)f/g, "$1");

  // Force numbers to exist
  //aCode = aCode.replace(/([^.])(\w+)\s*\+=/g, "$1$2 = ($2||0) +");

  // Force characters-as-bytes to work
  aCode = aCode.replace(/('[a-zA-Z0-9]')/g, "$1.charCodeAt(0)");

  /* Convert #aaaaaa into color
  aCode = aCode.replace(/#([a-f0-9]{6})/ig, function(m, hex){
    var num = toNumbers(hex);
    return "color(" + num[0] + "," + num[1] + "," + num[2] + ")";
  });
  */

  function toNumbers( str ){
    var ret = [];
     str.replace(/(..)/g, function(str){
      ret.push( parseInt( str, 16 ) );
    });
    return ret;
  }

//log(aCode);

  return aCode;
}

function buildProcessing( curElement ){

  var p = {};

  // init
  p.PI = Math.PI;
  p.TWO_PI = 2 * p.PI;
  p.HALF_PI = p.PI / 2;
  p.P3D = 3;
  p.CORNER = 0;
  p.CENTER = 1;
  p.CENTER_RADIUS = 2;
  p.RADIUS = 2;
  p.POLYGON = 1;
  p.TRIANGLES = 6;
  p.POINTS = 7;
  p.LINES = 8;
  p.TRIANGLE_STRIP = 9;
  p.CORNERS = 10;
  p.CLOSE = true;
  p.RGB = 1;
  p.HSB = 2;

  // "Private" variables used to maintain state
  var curContext = curElement.getContext("2d");
  var doFill = true;
  var doStroke = true;
  var loopStarted = false;
  var hasBackground = false;
  var doLoop = true;
  var curRectMode = p.CORNER;
  var curEllipseMode = p.CENTER;
  var inSetup = false;
  var inDraw = false;
  var curBackground = "rgba(204,204,204,1)";
  var curFrameRate = 1000;
  var curShape = p.POLYGON;
  var curShapeCount = 0;
  var opacityRange = 255;
  var redRange = 255;
  var greenRange = 255;
  var blueRange = 255;
  var pathOpen = false;
  var mousePressed = false;
  var keyPressed = false;
  var firstX, firstY, prevX, prevY;
  var curColorMode = p.RGB;
  var curTint = -1;
  var curTextSize = 12;
  var curTextFont = "Arial";
  var getLoaded = false;
  var start = (new Date).getTime();
  var looping = undefined;

  // Global vars for tracking mouse position
  p.pmouseX = 0;
  p.pmouseY = 0;
  p.mouseX = 0;
  p.mouseY = 0;

  // Will be replaced by the user, most likely
  p.mouseDragged = undefined;
  p.mouseMoved = undefined;
  p.mousePressed = undefined;
  p.mouseReleased = undefined;
  p.mouseOut = undefined;
  p.keyPressed = undefined;
  p.keyReleased = undefined;
  p.draw = undefined;
  p.setup = undefined;

  // The height/width of the canvas
  p.width = curElement.width - 0;
  p.height = curElement.height - 0;


  // In case I ever need to do HSV conversion:
  // http://srufaculty.sru.edu/david.dailey/javascript/js/5rml.js
  p.color = function color( aValue1, aValue2, aValue3, aValue4 )
  {
    var aColor = "";

    if ( arguments.length == 3 )
    {
      aColor = p.color( aValue1, aValue2, aValue3, opacityRange );
    }
    else if ( arguments.length == 4 )
    {
      var a = aValue4 / opacityRange;
      a = isNaN(a) ? 1 : a;

      if ( curColorMode == p.HSB )
      {
        var rgb = HSBtoRGB(aValue1, aValue2, aValue3);
        var r = rgb[0], g = rgb[1], b = rgb[2];
      }
      else
      {
        var r = getColor(aValue1, redRange);
        var g = getColor(aValue2, greenRange);
        var b = getColor(aValue3, blueRange);
      }

      aColor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }
    else if ( typeof aValue1 == "string" )
    {
      aColor = aValue1;

      if ( arguments.length == 2 )
      {
        var c = aColor.split(",");
  c[3] = (aValue2 / opacityRange) + ")";
  aColor = c.join(",");
      }
    }
    else if ( arguments.length == 2 )
    {
      aColor = p.color( aValue1, aValue1, aValue1, aValue2 );
    }
    else if ( typeof aValue1 == "number" )
    {
      aColor = p.color( aValue1, aValue1, aValue1, opacityRange );
    }
    else
    {
      aColor = p.color( redRange, greenRange, blueRange, opacityRange );
    }

    // HSB conversion function from Mootools, MIT Licensed
    function HSBtoRGB(h, s, b)
    {
      h = (h / redRange) * 100;
      s = (s / greenRange) * 100;
      b = (b / blueRange) * 100;
      if (s == 0){
        return [b, b, b];
      } else {
        var hue = h % 360;
        var f = hue % 60;
        var br = Math.round(b / 100 * 255);
        var p = Math.round((b * (100 - s)) / 10000 * 255);
        var q = Math.round((b * (6000 - s * f)) / 600000 * 255);
        var t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255);
        switch (Math.floor(hue / 60)){
          case 0: return [br, t, p];
          case 1: return [q, br, p];
          case 2: return [p, br, t];
          case 3: return [p, q, br];
          case 4: return [t, p, br];
          case 5: return [br, p, q];
        }
      }
    }

    function getColor( aValue, range )
    {
      return Math.round(255 * (aValue / range));
    }

    return aColor;
  }

  p.nf = function( num, pad )
  {
    var str = "" + num;
    while ( pad - str.length )
      str = "0" + str;
    return str;
  };

  p.AniSprite = function( prefix, frames )
  {
    this.images = [];
    this.pos = 0;

    for ( var i = 0; i < frames; i++ )
    {
      this.images.push( prefix + p.nf( i, ("" + frames).length ) + ".gif" );
    }

    this.display = function( x, y )
    {
      p.image( this.images[ this.pos ], x, y );

      if ( ++this.pos >= frames )
        this.pos = 0;
    };

    this.getWidth = function()
    {
      return getImage(this.images[0]).width;
    };

    this.getHeight = function()
    {
      return getImage(this.images[0]).height;
    };
  };

  function buildImageObject( obj )
  {
    var pixels = obj.data;
    var data = p.createImage( obj.width, obj.height );

    if ( data.__defineGetter__ && data.__lookupGetter__ && !data.__lookupGetter__("pixels") )
    {
      var pixelsDone;
      data.__defineGetter__("pixels", function()
      {
        if ( pixelsDone )
    return pixelsDone;

  pixelsDone = [];

        for ( var i = 0; i < pixels.length; i += 4 )
        {
          pixelsDone.push( p.color(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]) );
        }

  return pixelsDone;
      });
    }
    else
    {
      data.pixels = [];

      for ( var i = 0; i < pixels.length; i += 4 )
      {
        data.pixels.push( p.color(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]) );
      }
    }

    return data;
  }

  p.createImage = function createImage( w, h, mode )
  {
    var data = {
      width: w,
      height: h,
      pixels: new Array( w * h ),
      get: function(x,y)
      {
        return this.pixels[w*y+x];
      },
      _mask: null,
      mask: function(img)
      {
        this._mask = img;
      },
      loadPixels: function()
      {
      },
      updatePixels: function()
      {
      }
    };

    return data;
  }

  p.createGraphics = function createGraphics( w, h )
  {
try {
    var canvas = document.createElement("canvas");
    if (/MSIE/.test(navigator.userAgent) && !window.opera)
      G_vmlCanvasManager.initElement(canvas);
    var ret = buildProcessing( canvas );
    ret.size( w, h );
    ret.canvas = canvas;
} catch (ex) { alert("why? -> " + ex.message); }
    return ret;
  }

  p.beginDraw = function beginDraw()
  {

  }

  p.endDraw = function endDraw()
  {

  }

  p.tint = function tint( rgb, a )
  {
    curTint = a;
  }

  function getImage( img ) {
    if ( typeof img == "string" ) return document.getElementById(img);

    if ( img.img || img.canvas ) return img.img || img.canvas;

    img.data = [];

    for ( var i = 0, l = img.pixels.length; i < l; i++ ) {
      var c = (img.pixels[i] || "rgba(0,0,0,1)").slice(5,-1).split(",");
      img.data.push( parseInt(c[0]), parseInt(c[1]), parseInt(c[2]), parseFloat(c[3]) * 100 );
    }

    try {
      var canvas = document.createElement("canvas")
      if (/MSIE/.test(navigator.userAgent) && !window.opera)
        G_vmlCanvasManager.initElement(canvas);
      canvas.width = img.width;
      canvas.height = img.height;
      var context = canvas.getContext("2d");
      context.putImageData( img, 0, 0 );
    }
    catch (ex) { alert("precessing.getImage exception: " + ex.message); }

    img.canvas = canvas;

    return canvas;
  }

  p.image = function image( img, x, y, w, h )
  {
    x = x || 0;
    y = y || 0;

    var obj = getImage(img);

    if ( curTint >= 0 )
    {
      var oldAlpha = curContext.globalAlpha;
      curContext.globalAlpha = curTint / opacityRange;
    }

    if ( arguments.length == 3 )
    {
      curContext.drawImage( obj, x, y );
    }
    else
    {
      curContext.drawImage( obj, x, y, w, h );
    }

    if ( curTint >= 0 )
    {
      curContext.globalAlpha = oldAlpha;
    }

    if ( img._mask )
    {
      var oldComposite = curContext.globalCompositeOperation;
      curContext.globalCompositeOperation = "darker";
      p.image( img._mask, x, y );
      curContext.globalCompositeOperation = oldComposite;
    }
  }

  p.exit = function exit()
  {

  }

  p.save = function save( file )
  {

  }

  p.loadImage = function loadImage( file )
  {
    var img = document.getElementById(file);
    if ( !img )
      return;

    var h = img.height, w = img.width;

    var canvas = document.createElement("canvas");
    if (/MSIE/.test(navigator.userAgent) && !window.opera)
      G_vmlCanvasManager.initElement(canvas);
    canvas.width = w;
    canvas.height = h;
    var context = canvas.getContext("2d");

    context.drawImage( img, 0, 0 );
    var data = buildImageObject( context.getImageData( 0, 0, w, h ) );
    data.img = img;
    return data;

  }

  p.loadFont = function loadFont( name )
  {
    return {
      name: name,
      width: function( str )
      {
        if ( curContext.mozMeasureText )
          return curContext.mozMeasureText( typeof str == "number" ?
            String.fromCharCode( str ) :
            str) / curTextSize;
  else
    return 0;
      }
    };
  }

  p.textFont = function textFont( name, size )
  {
    curTextFont = name;
    p.textSize( size );
  }

  p.textSize = function textSize( size )
  {
    if ( size )
    {
      curTextSize = size;
    }
  }

  p.textAlign = function textAlign()
  {

  }

  p.text = function text( str, x, y )
  {
    /*
    if ( str && curContext.mozDrawText )
    {
      curContext.save();
      curContext.mozTextStyle = curTextSize + "px " + curTextFont.name;
      curContext.translate(x, y);
      curContext.mozDrawText( typeof str == "number" ?
        String.fromCharCode( str ) :
  str );
      curContext.restore();
    }
    else if ( str ) {
    */
      var container = curElement.parentNode;
      // container.style.position = 'relative';

      var label = document.createElement('span');
      label.innerHTML = str;
      label.style.zIndex = "5";
      label.style.color = "000";
      label.style.position = 'absolute';

      // label.style.left = (x+hack.offsetLeft) + 'px';
      // label.style.top = (y+hack.offsetTop-(9/2)) + 'px';

      label.style.left = x + 'px';
      label.style.top = y + 'px';
      label.style.font = "9px Arial, Helvetica, sans-serif";

      container.appendChild(label);

  }

  p.char = function char( key )
  {
    // return String.fromCharCode( key );
    return key;
  }

  p.println = function println()
  {

  }

  p.map = function map( value, istart, istop, ostart, ostop )
  {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  };

  String.prototype.replaceAll = function(re, replace)
  {
    return this.replace(new RegExp(re, "g"), replace);
  };

  p.Point = function Point( x, y )
  {
    this.x = x;
    this.y = y;
    this.copy = function()
    {
      return new Point( x, y );
    }
  }

  p.Random = function()
  {
    var haveNextNextGaussian = false;
    var nextNextGaussian;

    this.nextGaussian = function()
    {
      if (haveNextNextGaussian) {
        haveNextNextGaussian = false;

        return nextNextGaussian;
      } else {
        var v1, v2, s;
        do {
          v1 = 2 * p.random(1) - 1;   // between -1.0 and 1.0
          v2 = 2 * p.random(1) - 1;   // between -1.0 and 1.0
          s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s == 0);
        var multiplier = Math.sqrt(-2 * Math.log(s)/s);
        nextNextGaussian = v2 * multiplier;
        haveNextNextGaussian = true;

        return v1 * multiplier;
      }
    };
  }

  p.ArrayList = function ArrayList( size, size2, size3 )
  {
    var array = new Array( 0 | size );

    if ( size2 )
    {
      for ( var i = 0; i < size; i++ )
      {
        array[i] = [];

        for ( var j = 0; j < size2; j++ )
        {
    var a = array[i][j] = size3 ? new Array( size3 ) : 0;
    for ( var k = 0; k < size3; k++ )
    {
      a[k] = 0;
    }
        }
      }
    }
    else
    {
      for ( var i = 0; i < size; i++ )
      {
        array[i] = 0;
      }
    }

    array.size = function()
    {
      return this.length;
    };
    array.get = function( i )
    {
      return this[ i ];
    };
    array.remove = function( i )
    {
      return this.splice( i, 1 );
    };
    array.add = function( item )
    {
      for ( var i = 0; this[ i ] != undefined; i++ ) {}
      this[ i ] = item;
    };
    array.clone = function()
    {
      var a = new ArrayList( size );
      for ( var i = 0; i < size; i++ )
      {
        a[ i ] = this[ i ];
      }
      return a;
    };
    array.isEmpty = function()
    {
      return !this.length;
    };
    array.clear = function()
    {
      this.length = 0;
    };

    return array;
  }

  p.colorMode = function colorMode( mode, range1, range2, range3, range4 )
  {
    curColorMode = mode;

    if ( arguments.length >= 4 )
    {
      redRange = range1;
      greenRange = range2;
      blueRange = range3;
    }

    if ( arguments.length == 5 )
    {
      opacityRange = range4;
    }

    if ( arguments.length == 2 )
    {
      p.colorMode( mode, range1, range1, range1, range1 );
    }
  }

  p.beginShape = function beginShape( type )
  {
    curShape = type;
    curShapeCount = 0;
  }

  p.endShape = function endShape( close )
  {
    if ( curShapeCount != 0 )
    {
      curContext.lineTo( firstX, firstY );

      if ( doFill )
        curContext.fill();

      if ( doStroke )
        curContext.stroke();

      curContext.closePath();
      curShapeCount = 0;
      pathOpen = false;
    }

    if ( pathOpen )
    {
      curContext.closePath();
    }
  }

  p.vertex = function vertex( x, y, x2, y2, x3, y3 )
  {
    if ( curShapeCount == 0 && curShape != p.POINTS )
    {
      pathOpen = true;
      curContext.beginPath();
      curContext.moveTo( x, y );
    }
    else
    {
      if ( curShape == p.POINTS )
      {
        p.point( x, y );
      }
      else if ( arguments.length == 2 )
      {
        if ( curShape == p.TRIANGLE_STRIP && curShapeCount == 2 )
  {
          curContext.moveTo( prevX, prevY );
          curContext.lineTo( firstX, firstY );
  }

        curContext.lineTo( x, y );
      }
      else if ( arguments.length == 4 )
      {
        if ( curShapeCount > 1 )
        {
    curContext.moveTo( prevX, prevY );
          curContext.quadraticCurveTo( firstX, firstY, x, y );
    curShapeCount = 1;
        }
      }
      else if ( arguments.length == 6 )
      {
        curContext.bezierCurveTo( x, y, x2, y2, x3, y3 );
        curShapeCount = -1;
      }
    }

    prevX = firstX;
    prevY = firstY;
    firstX = x;
    firstY = y;


    curShapeCount++;

    if ( curShape == p.LINES && curShapeCount == 2 ||
         (curShape == p.TRIANGLES || curShape == p.TRIANGLE_STRIP) && curShapeCount == 3 )
    {
      p.endShape();
    }

    if ( curShape == p.TRIANGLE_STRIP && curShapeCount == 3 )
    {
      curShapeCount = 2;
    }
  }

  p.curveTightness = function()
  {

  }

  // Unimplmented - not really possible with the Canvas API
  p.curveVertex = function( x, y, x2, y2 )
  {
    p.vertex( x, y, x2, y2 );
  }

  p.bezierVertex = p.vertex

  p.rectMode = function rectMode( aRectMode )
  {
    curRectMode = aRectMode;
  }

  p.imageMode = function()
  {

  }

  p.ellipseMode = function ellipseMode( aEllipseMode )
  {
    curEllipseMode = aEllipseMode;
  }

  p.dist = function dist( x1, y1, x2, y2 )
  {
    return Math.sqrt( Math.pow( x2 - x1, 2 ) + Math.pow( y2 - y1, 2 ) );
  }

  p.year = function year()
  {
    return (new Date).getYear() + 1900;
  }

  p.month = function month()
  {
    return (new Date).getMonth();
  }

  p.day = function day()
  {
    return (new Date).getDay();
  }

  p.hour = function hour()
  {
    return (new Date).getHours();
  }

  p.minute = function minute()
  {
    return (new Date).getMinutes();
  }

  p.second = function second()
  {
    return (new Date).getSeconds();
  }

  p.millis = function millis()
  {
    return (new Date).getTime() - start;
  }

  p.ortho = function ortho() {

  }

  p.translate = function translate( x, y )
  {
    curContext.translate( x, y );
  }

  p.scale = function scale( x, y )
  {
    curContext.scale( x, y || x );
  }

  p.rotate = function rotate( aAngle )
  {
    curContext.rotate( aAngle );
  }

  p.pushMatrix = function pushMatrix()
  {
    curContext.save();
  }

  p.popMatrix = function popMatrix()
  {
    curContext.restore();
  }

  p.redraw = function redraw() {
    if ( hasBackground ) {
      p.background();
    }

    inDraw = true;
    p.pushMatrix();
    p.draw();
    p.popMatrix();
    inDraw = false;
  }

  p.loop = function loop() {
    if ( loopStarted ) return;

    looping = setInterval(function() {
      try {
        p.redraw();
      }
      catch(e) {
        clearInterval( looping );
        throw e;
      }
    }, 1000 / curFrameRate );

    loopStarted = true;
  }

  p.frameRate = function frameRate( aRate )
  {
    curFrameRate = aRate;
  }

  p.background = function background( img ) {
    if ( arguments.length ) {
      if ( img && img.img ) {
        curBackground = img;
      }
      else {
        curBackground = p.color.apply( this, arguments );
      }
    }
    if ( curBackground.img ) {
      p.image( curBackground, 0, 0 );
    }
    else {
      var oldFill = curContext.fillStyle;
      curContext.fillStyle = curBackground + "";
      curContext.fillRect( 0, 0, p.width, p.height );
      curContext.fillStyle = oldFill;
    }
  }

  p.sq = function sq( aNumber )
  {
    return aNumber * aNumber;
  }

  p.sqrt = function sqrt( aNumber )
  {
    return Math.sqrt( aNumber );
  }

  p.int = function int( aNumber )
  {
    return Math.floor( aNumber );
  }

  p.min = function min( aNumber, aNumber2 )
  {
    return Math.min( aNumber, aNumber2 );
  }

  p.max = function max( aNumber, aNumber2 )
  {
    return Math.max( aNumber, aNumber2 );
  }

  p.ceil = function ceil( aNumber )
  {
    return Math.ceil( aNumber );
  }

  p.floor = function floor( aNumber )
  {
    return Math.floor( aNumber );
  }

  p.float = function float( aNumber )
  {
    return typeof aNumber == "string" ?
  p.float( aNumber.charCodeAt(0) ) :
        parseFloat( aNumber );
  }

  p.byte = function byte( aNumber )
  {
    return aNumber || 0;
  }

  p.random = function random( aMin, aMax )
  {
    return arguments.length == 2 ?
      aMin + (Math.random() * (aMax - aMin)) :
      Math.random() * aMin;
  }

  // From: http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
  p.noise = function( x, y, z )
  {
    return arguments.length >= 2 ?
      PerlinNoise_2D( x, y ) :
      PerlinNoise_2D( x, x );
  }

  function Noise(x, y)
  {
    var n = x + y * 57;
    n = (n<<13) ^ n;
    return Math.abs(1.0 - (((n * ((n * n * 15731) + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0));
  }

  function SmoothedNoise(x, y)
  {
    var corners = ( Noise(x-1, y-1)+Noise(x+1, y-1)+Noise(x-1, y+1)+Noise(x+1, y+1) ) / 16;
    var sides   = ( Noise(x-1, y)  +Noise(x+1, y)  +Noise(x, y-1)  +Noise(x, y+1) ) /  8;
    var center  =  Noise(x, y) / 4;
    return corners + sides + center;
  }

  function InterpolatedNoise(x, y)
  {
    var integer_X    = Math.floor(x);
    var fractional_X = x - integer_X;

    var integer_Y    = Math.floor(y);
    var fractional_Y = y - integer_Y;

    var v1 = SmoothedNoise(integer_X,     integer_Y);
    var v2 = SmoothedNoise(integer_X + 1, integer_Y);
    var v3 = SmoothedNoise(integer_X,     integer_Y + 1);
    var v4 = SmoothedNoise(integer_X + 1, integer_Y + 1);

    var i1 = Interpolate(v1 , v2 , fractional_X);
    var i2 = Interpolate(v3 , v4 , fractional_X);

    return Interpolate(i1 , i2 , fractional_Y);
  }

  function PerlinNoise_2D(x, y)
  {
      var total = 0;
      var p = 0.25;
      var n = 3;

      for ( var i = 0; i <= n; i++ )
      {
          var frequency = Math.pow(2, i);
          var amplitude = Math.pow(p, i);

          total = total + InterpolatedNoise(x * frequency, y * frequency) * amplitude;
      }

      return total;
  }

  function Interpolate(a, b, x)
  {
    var ft = x * p.PI;
    var f = (1 - p.cos(ft)) * .5;
    return  a*(1-f) + b*f;
  }

  p.red = function( aColor )
  {
    return parseInt(aColor.slice(5));
  }

  p.green = function( aColor )
  {
    return parseInt(aColor.split(",")[1]);
  }

  p.blue = function( aColor )
  {
    return parseInt(aColor.split(",")[2]);
  }

  p.alpha = function( aColor )
  {
    return parseInt(aColor.split(",")[3]);
  }

  p.abs = function abs( aNumber )
  {
    return Math.abs( aNumber );
  }

  p.cos = function cos( aNumber )
  {
    return Math.cos( aNumber );
  }

  p.sin = function sin( aNumber )
  {
    return Math.sin( aNumber );
  }

  p.pow = function pow( aNumber, aExponent )
  {
    return Math.pow( aNumber, aExponent );
  }

  p.constrain = function constrain( aNumber, aMin, aMax )
  {
    return Math.min( Math.max( aNumber, aMin ), aMax );
  }

  p.sqrt = function sqrt( aNumber )
  {
    return Math.sqrt( aNumber );
  }

  p.atan2 = function atan2( aNumber, aNumber2 )
  {
    return Math.atan2( aNumber, aNumber2 );
  }

  p.radians = function radians( aAngle )
  {
    return ( aAngle / 180 ) * p.PI;
  }

  p.size = function size( aWidth, aHeight )
  {
    var fillStyle = curContext.fillStyle;
    var strokeStyle = curContext.strokeStyle;

    curElement.width = p.width = aWidth;
    curElement.height = p.height = aHeight;

    curContext.fillStyle = fillStyle;
    curContext.strokeStyle = strokeStyle;
  }

  p.noStroke = function noStroke()
  {
    doStroke = false;
  }

  p.noFill = function noFill()
  {
    doFill = false;
  }

  p.smooth = function smooth()
  {

  }

  p.noLoop = function noLoop()
  {
    doLoop = false;
    if (looping) {
      clearInterval( looping );
      loopStarted = false;
    }
  }

  p.fill = function fill()
  {
    doFill = true;
    curContext.fillStyle = p.color.apply( this, arguments );
  }

  p.stroke = function stroke()
  {
    doStroke = true;
    curContext.strokeStyle = p.color.apply( this, arguments );
  }

  p.strokeWeight = function strokeWeight( w )
  {
    curContext.lineWidth = w;
  }

  p.point = function point( x, y )
  {
    var oldFill = curContext.fillStyle;
    curContext.fillStyle = curContext.strokeStyle;
    curContext.fillRect( Math.round( x ), Math.round( y ), 1, 1 );
    curContext.fillStyle = oldFill;
  }

  p.get = function get( x, y )
  {
    if ( arguments.length == 0 )
    {
      var c = p.createGraphics( p.width, p.height );
      c.image( curContext, 0, 0 );
      return c;
    }

    if ( !getLoaded )
    {
      getLoaded = buildImageObject( curContext.getImageData(0, 0, p.width, p.height) );
    }

    return getLoaded.get( x, y );
  }

  p.set = function set( x, y, color )
  {
    var oldFill = curContext.fillStyle;
    curContext.fillStyle = color;
    curContext.fillRect( Math.round( x ), Math.round( y ), 1, 1 );
    curContext.fillStyle = oldFill;
  }

  p.arc = function arc( x, y, width, height, start, stop )
  {
    if ( width <= 0 )
      return;

    if ( curEllipseMode == p.CORNER )
    {
      x += width / 2;
      y += height / 2;
    }

    if ( doFill ) {
      curContext.beginPath();
      curContext.moveTo( x, y );
      curContext.arc( x, y, curEllipseMode == p.CENTER_RADIUS ? width : width/2, start, stop, false );
      curContext.closePath();
      curContext.fill();
    }

    if ( doStroke ) {
      curContext.beginPath();
      curContext.moveTo( x, y );
      curContext.arc( x, y, curEllipseMode == p.CENTER_RADIUS ? width : width/2, start, stop, false );
      curContext.closePath();
      curContext.stroke();
    }

  }

  p.line = function line( x1, y1, x2, y2 )
  {
    curContext.lineCap = "round";
    curContext.beginPath();
    curContext.moveTo( x1 || 0, y1 || 0 );
    curContext.lineTo( x2 || 0, y2 || 0 );
    curContext.closePath();
    curContext.stroke();
  }

  p.multiLine = function line( pointArray )
  {
    curContext.lineCap = "round";
    curContext.beginPath();
    curContext.moveTo( pointArray[0].x || 0, pointArray[0].y || 0 );
    for (var p=1;p < pointArray.length;p++)
      curContext.lineTo( pointArray[p].x || 0, pointArray[p].y || 0 );
    curContext.stroke();
  }

  p.multiQuad = function line( pointArray )
  {
    curContext.lineCap = "round";
    curContext.beginPath();
    curContext.moveTo( pointArray[0].x || 0, pointArray[0].y || 0 );
    var lastX = pointArray[0].x;
    var lastY = pointArray[0].y;
    for (var p=1;p < pointArray.length;p++) {
      curContext.quadraticCurveTo(lastX, lastY, pointArray[p].x || 0, pointArray[p].y || 0 );
      lastX = pointArray[p].x;
      lastY = pointArray[p].y;
    }
    // curContext.closePath();
    curContext.stroke();
  }

  p.bezier = function bezier( x1, y1, x2, y2, x3, y3, x4, y4 )
  {
    curContext.lineCap = "butt";
    curContext.beginPath();

    curContext.moveTo( x1, y1 );
    curContext.bezierCurveTo( x2, y2, x3, y3, x4, y4 );

    curContext.stroke();

    curContext.closePath();
  }

  p.triangle = function triangle( x1, y1, x2, y2, x3, y3 )
  {
    p.beginShape();
    p.vertex( x1, y1 );
    p.vertex( x2, y2 );
    p.vertex( x3, y3 );
    p.endShape();
  }

  p.quad = function quad( x1, y1, x2, y2, x3, y3, x4, y4 )
  {
    p.beginShape();
    p.vertex( x1, y1 );
    p.vertex( x2, y2 );
    p.vertex( x3, y3 );
    p.vertex( x4, y4 );
    p.endShape();
  }

  p.rect = function rect( x, y, width, height )
  {
    if ( width == 0 && height == 0 )
      return;


    var offsetStart = 0;
    var offsetEnd = 0;

    if ( curRectMode == p.CORNERS )
    {
      width -= x;
      height -= y;
    }

    if ( curRectMode == p.RADIUS )
    {
      width *= 2;
      height *= 2;
    }

    if ( curRectMode == p.CENTER || curRectMode == p.RADIUS )
    {
      x -= width / 2;
      y -= height / 2;
    }


    if ( doFill ) {
      curContext.beginPath();
      curContext.rect(Math.round( x ) - offsetStart,
        Math.round( y ) - offsetStart,
        Math.round( width ) + offsetEnd,
        Math.round( height ) + offsetEnd);
      curContext.closePath();
      curContext.fill();
    }

    if ( doStroke ) {
      curContext.beginPath();
      curContext.rect(Math.round( x ) - offsetStart,
        Math.round( y ) - offsetStart,
        Math.round( width ) + offsetEnd,
        Math.round( height ) + offsetEnd);
      curContext.closePath();
      curContext.stroke();
    }

  }

  p.ellipse = function ellipse( x, y, width, height )
  {
    x = x || 0;
    y = y || 0;

    if ( width <= 0 && height <= 0 )
      return;


    if ( curEllipseMode == p.RADIUS )
    {
      width *= 2;
      height *= 2;
    }

    var offsetStart = 0;

    curContext.beginPath();
    // Shortcut for drawing a circle
    if ( width == height )
      curContext.arc( x - offsetStart, y - offsetStart, width / 2, 0, Math.PI * 2, false );
    if ( doFill )
      curContext.fill();
    curContext.closePath();

    curContext.beginPath();
    if ( width == height )
      curContext.arc( x - offsetStart, y - offsetStart, width / 2, 0, Math.PI * 2, false );
    if ( doStroke )
      curContext.stroke();
    curContext.closePath();

  }

  p.link = function( href, target )
  {
    window.location = href;
  }

  p.loadPixels = function()
  {
    p.pixels = buildImageObject( curContext.getImageData(0, 0, p.width, p.height) ).pixels;
  }

  p.updatePixels = function()
  {
    var colors = /(\d+),(\d+),(\d+),(\d+)/;
    var pixels = {};
    var data = pixels.data = [];
    pixels.width = p.width;
    pixels.height = p.height;

    var pos = 0;

    for ( var i = 0, l = p.pixels.length; i < l; i++ ) {
      var c = (p.pixels[i] || "rgba(0,0,0,1)").match(colors);
      data[pos] = parseInt(c[1]);
      data[pos+1] = parseInt(c[2]);
      data[pos+2] = parseInt(c[3]);
      data[pos+3] = parseFloat(c[4]) * 100;
      pos += 4;
    }

    curContext.putImageData(pixels, 0, 0);
  }

  p.extendClass = function extendClass( obj, args, fn )
  {
    if ( arguments.length == 3 )
    {
      fn.apply( obj, args );
    }
    else
    {
      args.call( obj );
    }
  }

  p.addMethod = function addMethod( object, name, fn )
  {
    if ( object[ name ] )
    {
      var args = fn.length;

      var oldfn = object[ name ];
      object[ name ] = function()
      {
        if ( arguments.length == args )
          return fn.apply( this, arguments );
        else
          return oldfn.apply( this, arguments );
      };
    }
    else
    {
      object[ name ] = fn;
    }
  }

  p.init = function init(code){
    p.stroke( 0 );
    p.fill( 255 );

    // Canvas has trouble rendering single pixel stuff on whole-pixel
    // counts, so we slightly offset it (this is super lame).
    curContext.translate( 0.5, 0.5 );

    if ( code ) {
      (function(Processing){with (p){
        eval(parse(code, p));
      }})(p);
    }


    if ( p.setup ) {
      inSetup = true;
      p.setup();
    }

    inSetup = false;


    if ( p.draw ) {
      if ( !doLoop ) {
        p.redraw();
      }
      else {
        p.loop();
      }
    }

    attach( curElement, "mousemove", function(e) {
      var scrollX = window.scrollX != null ? window.scrollX : window.pageXOffset;
      var scrollY = window.scrollY != null ? window.scrollY : window.pageYOffset;
      if (scrollX === undefined || scrollY === undefined) {
          scrollX = document.body.parentNode ? document.body.parentNode.scrollLeft : document.body.scrollLeft;
          scrollY = document.body.parentNode ? document.body.parentNode.scrollTop : document.body.scrollTop;
      }
      p.pmouseX = p.mouseX;
      p.pmouseY = p.mouseY;
      /*
      p.mouseX = e.clientX - curElement.offsetLeft + scrollX;
      p.mouseY = e.clientY - curElement.offsetTop + scrollY;
      */
      var offset = $(curElement).offset();
      p.mouseX = e.clientX - offset.left + scrollX;
      p.mouseY = e.clientY - offset.top + scrollY;

      if ( p.mouseMoved )
      {
        p.mouseMoved();
      }

      if ( mousePressed && p.mouseDragged )
      {
        p.mouseDragged();
      }
    });

    attach( curElement, "mousedown", function(e)
    {
      mousePressed = true;

      if ( typeof p.mousePressed == "function" )
      {
        p.mousePressed();
      }
      else
      {
        p.mousePressed = true;
      }
    });

    attach( curElement, "mouseup", function(e)
    {
      mousePressed = false;

      if ( typeof p.mousePressed != "function" )
      {
        p.mousePressed = false;
      }

      if ( p.mouseReleased )
      {
        p.mouseReleased();
      }
    });

    attach( document, "keydown", function(e)
    {
      keyPressed = true;

      p.key = e.keyCode + 32;

      if ( e.shiftKey )
      {
        p.key = String.fromCharCode(p.key).toUpperCase().charCodeAt(0);
      }

      if ( typeof p.keyPressed == "function" )
      {
        p.keyPressed();
      }
      else
      {
        p.keyPressed = true;
      }
    });

    attach( document, "keyup", function(e)
    {
      keyPressed = false;

      if ( typeof p.keyPressed != "function" )
      {
        p.keyPressed = false;
      }

      if ( p.keyReleased )
      {
        p.keyReleased();
      }
    });

    attach( curElement, "mouseout", function(e) {
      if ( p.mouseOut ) { p.mouseOut(); }
    });

    function attach(elem, type, fn)
    {
      if ( elem.addEventListener )
        elem.addEventListener( type, fn, false );
      else
        elem.attachEvent( "on" + type, fn );
    }
  };

  return p;
}

})();

var dashboardDnd = {
  container: null,
  order: null,
  msie6: ($.browser.msie && $.browser.version == "6.0"),

  init: function(container) {
    this.container = $(container);
    this.order = this.readOrderFromDOM();

    for (var i = 0, draggables = this.getDraggables(); i < draggables.length; i++)
      this.prepareDraggable(draggables[i]);
  },

  prepareDraggable: function(draggable) {
    var self = this;

    // Set the proper styles so that positions and other boxing is available to jQuery in how we employ it.
    $(draggable).css({
      display: (self.msie6 ? "inline" : "block"),
      position: "relative",
      top: "0px"
    });

    $(".movable.grip", draggable).bind("mousedown", function(e) {
      var containerPosition = self.container.position();

      $(draggable).draggable({
        // restrict movement to the leftmost border of `container' [x1, y1, x2, y2]
        containment: [containerPosition.left, containerPosition.top, containerPosition.left, containerPosition.top + self.container.height()],

        start: function(event, ui) {
          self.onStartDragging(event.target, ui);
        },

        drag: function(event, ui) {
          // only do this every other pixel.  really, it makes a difference.
          if (event.pageY % 2 == 0)
            self.onDrag(event.target, ui);
        },

        stop: function(event, ui) {
          ui.helper.draggable('destroy');
          self.onDraggableDropped(event.target, ui);
        }
      });
    });
  },

  getDraggables: function() {
    return this.container.children();
  },

  onStartDragging: function(draggable, ui) {
    // for MSIE 7, yes, really. doesn't harm any other browser.
    this.getDraggables().css('zIndex', 99);
    $(draggable).css('zIndex', 999);
  },

  onDrag: function(draggable, ui) {
    var chartIsAboveDraggable = true;
    var chartOrders = this.order;

    for (var co=0, coLength = chartOrders.length;co < coLength;co++) {
      if (chartOrders[co] == draggable.id) {
        chartIsAboveDraggable = false;
        continue;
      }

      var draggableTop = ui.offset.top-this.container.position().top;
      var draggableBottom = draggableTop + $(draggable).height();

      var chart = $("#"+chartOrders[co]);
      var chartTop = chart.position().top;
      var chartHeight = chart.height();

      var draggingInTopHalf = (draggableTop > chartTop && draggableTop < (chartTop+chartHeight/2));
      var draggingInBottomHalf = (draggableBottom < chartTop+chartHeight && draggableBottom > (chartTop+chartHeight/2));

      if ((draggingInTopHalf && chartIsAboveDraggable) || (draggingInBottomHalf && !chartIsAboveDraggable)) {
        var sign = chartIsAboveDraggable ? '' : '-';
        if (chart.css("top") != $(draggable).height()+"px")
          chart.css("top", sign+$(draggable).height()+"px");
      } else if ((draggingInTopHalf && !chartIsAboveDraggable) || (draggingInBottomHalf && chartIsAboveDraggable)) {
        if (chart.css("top") != "0px")
          chart.css("top", "0px");
      }
    }
  },

  onDraggableDropped: function(draggable, ui) {
    wesabe.data.preferences.update('charts.order', this.readOrderFromDOM().join(','));
    this.writeOrderToDOM(this.order);
  },

  readOrderFromDOM: function() {
    // get the children of the container
    var newOrder = this.getDraggables().map(function(){ return {id: this.id, top: $(this).position().top}; });
    // sort from top to bottom
    newOrder.sort(function(c1, c2) { return (c1.top < c2.top) ? -1 : 1; });
    // store just the ids
    return this.order = $.map(newOrder, function(chart){ return chart.id });
  },

  writeOrderToDOM: function(charts) {
    var previousNode = null;

    for (var i = 0, cl = charts.length; i < cl; i++) {
      var e = $("#"+charts[i]);
      if (!previousNode) e.prependTo(this.container);
      else e.insertAfter(previousNode);
      e.css({ "display": (this.msie6 ? "inline" : "block"), "position": "relative", "top": "0px", "zIndex": '' });
      previousNode = e;
    }
  }
};

var wesCharts = {

  url: "",
  chartsP55: new Object(),
  chartsData: new Object(),
  chartsOptions: new Object(),
  msie: (/MSIE/.test(navigator.userAgent) && !window.opera),

  baseChart: function(chartType, chartId, options, data) {
    var self = this;

    self.render = function(p55Code) {
      if (data) wesCharts.setChartData(chartId, data);
      if (options) wesCharts.setChartOptions(chartId, options);
      try {
        if (!p55Code)
          wesCharts.getWesabeProcessingChart(chartType, function(p55Code){ self.render(p55Code) });
        else {
          // document.getElementById('container').style.position = 'absolute';
          var chartContainer = document.getElementById(chartId);
          //if our container doesn't exist, fail gracefully
          if (!chartContainer) return;
          chartContainer.innerHTML = "";
          chartContainer.style.padding = "0px";
          chartContainer.style.margin = "0px";
          chartContainer.style.position = 'relative';

          // add the drawing canvas
          var thisPieCanvas = document.createElement('canvas');
          thisPieCanvas.style.width = options.width + "px";
          thisPieCanvas.style.height = options.height + "px";
          thisPieCanvas.style.padding = "0px";
          thisPieCanvas.style.margin = "0px";
          chartContainer.appendChild(thisPieCanvas);
          // excanvas switching for msies
          var p55Chart;
          if (wesCharts.msie) {
              G_vmlCanvasManager.initElement(thisPieCanvas);
              p55Chart = Processing(chartContainer.firstChild, p55Code);
          }
          else {
              p55Chart = Processing(thisPieCanvas, p55Code);
          }
          wesCharts.setChartP55(chartId, p55Chart);
        }
      }
      catch (ex) {
        alert("wesCharts.baseChart.render: " + chartType + ".p55 for " + chartId + " reported:\n\n " + ex.message);
      }
    }

  },

  getChartP55: function(chartId) {
    return wesCharts.chartsP55[chartId];
  },

  setChartP55: function(chartId, chartP55) {
    wesCharts.chartsP55[chartId] = chartP55;
  },

  getChartData: function(chartId) {
    return wesCharts.chartsData[chartId];
  },

  setChartData: function(chartId, data) {
    wesCharts.chartsData[chartId] = data;
  },

  getChartOptions: function(chartId) {
    return wesCharts.chartsOptions[chartId];
  },

  setChartOptions: function(chartId, options) {
    wesCharts.chartsOptions[chartId] = options;
  },

  getWesabeProcessingChart: function(type, callback) {
    var url = wesCharts.url + '/wesabeProcessingCharts/' + type + '.p55?_=1269926821';

    jQuery.ajax({
      url: url,
      success: callback,
      error: function(request, textStatus) { wesabe.error("wesCharts.getWesabeProcessingChart: error requesting url=", url, " - got status text ", textStatus) },
      beforeSend: function(request) {
        request.setRequestHeader("Cache-Control", "no-cache");
        request.setRequestHeader("Pragma", "no-cache");
      }
    });
  },

  getWesabeChartData: function(url, callback, format) {
    jQuery.ajax({
      url: url,
      dataType: format || 'xml',
      success: callback,
      error: function(request, textStatus) { wesabe.error("wesCharts.getWesabeChartData: error requesting url=", url, " - got status text ", textStatus); wesabe.debug(request.responseXML); },
      beforeSend: function(request) {
        request.setRequestHeader("Accept", "application/xml")
        request.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        request.setRequestHeader("Pragma", "no-cache");
      }
    });
  },

  text: function(curElement, str, x, y, options) {
    var ops = options ? options : {};
    var fontSize = ops.fontSize ? ops.fontSize : 9;
    var fontWeight = ops.fontWeight ? ops.fontWeight + " " : "";
    var loading = ops.hasOwnProperty('loading') ? ops.loading : true;
    var container =
      (wesCharts.msie) ? curElement : curElement.parentNode;

    var label = document.createElement('span');
    label.innerHTML = str;
    label.className = "wesChartLabel";
    label.style.color = ops.color ? ops.color : "#000";
    label.style.position = 'absolute';
    label.style.left = x + 'px';
    label.style.top = y + 'px';
    label.style.textAlign = 'center';

    label.style.verticalAlign = 'middle';
    label.setAttribute('valign', 'middle');

    if (ops.id) label.id= ops.id;
    if (ops.border) label.style.border = ops.border;
    if (ops.padding) label.style.padding = ops.padding;

    if (ops.w) label.style.width = ops.w + 'px';
    if (ops.h) label.style.height = ops.h + 'px';
    label.style.font = fontWeight + fontSize + "px Arial, Helvetica, sans-serif";
    if (ops.cursor) label.style.cursor = ops.cursor;
    if (ops.backgroundImage) {
      label.style.paddingTop = "1px";
      label.style.backgroundImage = "url('" + ops.backgroundImage + "')";
      label.style.backgroundRepeat = "no-repeat";
    }
    label.style.textDecoration = ops.textDecoration ? ops.textDecoration : 'none';
    if (ops.backgroundColor) label.style.backgroundColor = ops.backgroundColor;
    if (ops.background) label.style.background = ops.background;
    if (ops.zIndex) label.style.zIndex = ops.zIndex;
    if (ops.opacity) {
      label.style.opacity = ops.opacity ? ops.opacity : 0.8;
      label.style.MozOpacity = ops.opacity ? ops.opacity : 0.8;
      label.style.filter = ops.opacity ?
        "alpha(opacity=" + Math.round(ops.opacity*100) + ")" : "alpha(opacity=80)";
    }

    if (ops.notification) {
      var container = (wesCharts.msie) ? curElement : curElement.parentNode;
      if (document.getElementById('wesabeChartNotification_' + curElement.parentNode.id))
        container.removeChild(document.getElementById('wesabeChartNotification_' + curElement.parentNode.id));
      label.id = "wesabeChartNotification_" + curElement.parentNode.id;

      var fs = fontSize+2;
      label.innerHTML = (ops.loading ?
         "<img src='/images/loading.gif' height='11px' width='11px' align='top' style='margin: 1px 5px 1px 0px;'/>" : '') + str;
      var metrics = wesCharts.textMetrics(curElement, str);
      label.style.left = (ops.x-(metrics.width/2)-11) + 'px';
      label.style.top = (ops.y-(metrics.height/2)-11) + 'px';
      label.style.font = "bold " + fs + "px Arial, Helvetica, sans-serif";
      label.style.color = ops.color ? ops.color : "#FFF";
      label.style.padding = "7px";
      label.style.backgroundColor = ops.backgroundColor ? ops.backgroundColor : "#666";
      label.style.opacity = ops.opacity ? ops.opacity : 0.8;
      label.style.MozOpacity = ops.opacity ? ops.opacity : 0.8;
      label.style.filter = ops.opacity ?
        "alpha(opacity=" + Math.round(ops.opacity*100) + ")" : "alpha(opacity=80)";
      label.style.border = "1px solid #FFF";
    }
    if (ops.click) {
      if (label.addEventListener)
        label.addEventListener("click", ops.click, false );
      else
        label.attachEvent("on" + "click", ops.click);
    }
    if (ops.mouseover) {
      if (label.addEventListener)
        label.addEventListener("mouseover", ops.mouseover, false );
      else
        label.attachEvent("on" + "mouseover", ops.mouseover);
    }
    if (ops.mouseout) {
      if (label.addEventListener)
        label.addEventListener("mouseout", ops.mouseout, false );
      else
        label.attachEvent("on" + "mouseout", ops.mouseout);
    }
    if (ops.mousemove) {
      if (label.addEventListener)
        label.addEventListener("mousemove", ops.mousemove, false );
      else
        label.attachEvent("on" + "mousemove", ops.mousemove);
    }
    container.appendChild(label);

  },

  textMetrics: function(curElement, str, options) {
    var ops = options ? options : {};
    var fontSize = ops.fontSize ? ops.fontSize : 9;
    var container =
      (wesCharts.msie) ? curElement : curElement.parentNode;
    var label = document.createElement('span');
    label.innerHTML = str;
    label.style.position = 'absolute';
    label.style.left = -9999 + 'px';
    label.style.top = -9999 + 'px';
    label.style.font = fontSize + "px Arial, Helvetica, sans-serif";
    container.appendChild(label);
    var ow = label.offsetWidth;
    var oh = label.offsetHeight;
    container.removeChild(label);
    return { width: ow, height: oh }
  },

  tooltip: function(curElement, str, x, y, options) {
    var container =
      (wesCharts.msie) ? curElement : curElement.parentNode;

    if (document.getElementById('wesabeChartTooltip'))
      document.getElementById('wesabeChartTooltip').parentNode.removeChild(document.getElementById('wesabeChartTooltip'));

    if (str) {
      var fontSize = (options && options.fontSize) ?
        options.fontSize : 9;
      var label = document.createElement('span');
      // label.setAttribute("align", "left");
      label.innerHTML = str;
      label.id = "wesabeChartTooltip";
      label.name = "wesabeChartTooltip";
      label.style.position = 'absolute';
      label.zIndex = 9999;
      label.style.left = x+1 + 'px';
      label.style.top = y-(fontSize*2.5) + 'px';
      label.style.font = fontSize + "px Arial, Helvetica, sans-serif";
      label.style.color = (options && options.color) ?
        options.color : "#FFF";
      label.style.padding = "3px 5px 3px 5px";
      label.style.backgroundColor = (options && options.backgroundColor) ?
        options.backgroundColor : "#666";
      label.style.opacity = "0.8";
      label.style.MozOpacity = "0.8";
      label.style.filter = "alpha(opacity=80)";
      label.style.border = (options && options.border) ?
        options.border : "1px solid #FFF";
      container.appendChild(label);
    }
  },

  htmlTooltip: function(curElement, str, x, y, options) {
    var container =
      (wesCharts.msie) ? curElement : curElement.parentNode;

    if (document.getElementById('wesabeChartTooltip'))
      document.getElementById('wesabeChartTooltip').parentNode.removeChild(document.getElementById('wesabeChartTooltip'));

    if (str) {
      var label = document.createElement('div');
      label.setAttribute("align", "left");
      label.style.overflow = 'visible';
      label.id = "wesabeChartTooltip";
      label.style.position = 'absolute';
      label.zIndex = '99999';
      label.style.left = x+7 + 'px';
      label.style.top = y-(9*3) + 'px';
      label.style.font = "bold 10px Arial, Helvetica, sans-serif";
      label.style.padding = "1px 3px 1px 3px";
      label.style.backgroundColor = (options && options.backgroundColor) ?
        options.backgroundColor : "#FFF";
      label.width = 100;
      label.style.width = '100px';
      /*
      label.style.MozOpacity = "0.90";
      label.style.opacity = "0.90";
      label.style.filter = "alpha(opacity=90)";
      */
      label.style.border = (options && options.border) ?
        options.border : "2px solid #ccc";
      if (options && options.click) {
        if (label.addEventListener)
          label.addEventListener("click", options.click, false );
        else {
          label.attachEvent("onclick", options.click);
        }
      }
      container.appendChild(label);
      label.innerHTML = str;
    }
  },

  htmlDialog: function(curElement, str, x, y, options) {
    var container =
      (wesCharts.msie) ? curElement : curElement.parentNode;

    if (document.getElementById('wesabeChartDialog')) {
      document.getElementById('wesabeChartDialog').parentNode.removeChild(document.getElementById('wesabeChartDialog'));
    }

    if (str) {
      var label = document.createElement('div');
      label.setAttribute("align", "left");
      label.style.overflow = 'visible';
      label.id = "wesabeChartDialog";
      label.style.position = 'absolute';
      label.zIndex = '99999';
      label.style.left = x + 'px';
      label.style.top = y + 'px';

      label.style.font = "bold 10px Arial, Helvetica, sans-serif";
      label.style.padding = "1px 3px 1px 3px";
      label.style.backgroundColor = (options && options.backgroundColor) ?
        options.backgroundColor : "#FFF";
      label.style.border = (options && options.border) ?
        options.border : "2px solid #ccc";
      if (options && options.click) {
        if (label.addEventListener)
          label.addEventListener("click", options.click, false );
        else
          label.attachEvent("onclick", options.click);
      }
      container.appendChild(label);
      if (label.addEventListener)
        label.addEventListener("mouseover", function () {}, false );
      else
        label.attachEvent("onmouseover", function () {});
      label.innerHTML = str;
    }
  },

  clearLabels: function(curElement) {
    var element =
      (wesCharts.msie) ? curElement : curElement.parentNode;
    var labels = element.getElementsByTagName('span');
    for (var l=labels.length-1;l >= 0;l--)
      if (!labels[l].id.match(/_no_clear$/)) element.removeChild(labels[l]);
  },

  // xml2object parsing - simple, only handles element and text nodes
  objectifyMe: function(objectOfAffect) {
    if (objectOfAffect.childNodes.length > 1) {
      var objectified = new Object();
      for (var n=0;n < objectOfAffect.childNodes.length; n++) {
       if (objectOfAffect.childNodes[n].nodeType !== 3) {
        if (objectOfAffect.childNodes[n].childNodes.length > 1) {
          objectified[objectOfAffect.childNodes[n].nodeName] = this.objectifyMe(objectOfAffect.childNodes[n]);
        }
        else if (objectOfAffect.childNodes[n].firstChild.nodeType === 3) {
          objectified[objectOfAffect.childNodes[n].nodeName] = objectOfAffect.childNodes[n].childNodes[0].nodeValue;
          var attributed = new Object();
          attributed['someAttr'] = 'whatever';
          objectified[objectOfAffect.childNodes[n].nodeName] = attributed;
        }
        else {
          objectified[objectOfAffect.childNodes[n].nodeName] = this.objectifyMe(objectOfAffect.childNodes[n].firstChild);
          var attributed = new Object();
          attributed['someAttr'] = 'whatever';
          objectified[objectOfAffect.childNodes[n].nodeName] = attributed;
        }
       }
      }
      return objectified;
    }
    else if (objectOfAffect.childNodes.length === 1 && objectOfAffect.nodeType === 1 && objectOfAffect.firstChild.nodeType === 3) {
      var objectified = new Object();
      objectified[objectOfAffect.nodeName] = objectOfAffect.childNodes[0].nodeValue;
      return objectified;
    }
    else if (objectOfAffect.firstChild.nodeType === 1) {
      var objectified = new Object();
      objectified[objectOfAffect.nodeName] = this.objectifyMe(objectOfAffect.firstChild);
      return objectified;
    }
    return;
  },

  myAttributes: function(theObjected, node, theName) {
    if (node.attributes.length > 0) {
      var attributed = new Object();
      attributed[node.attributes[0].name] = node.attributes[0].value;
      alert(theName + " -> " + node.attributes[0].name + " = " + node.attributes[0].value);
      theObjected = attributed;
    }
  },

  PIE: 'pie',
  BAR: 'vbar',
  LINE: 'line',
  TXN: 'txn'

}

window.onload = function() {

  if ( $("#right").length ) dashboardDnd.init($('#right'));

  if ( $("#sve-chart").length ) {
    var sveChartOptions = {
      width: 630,
      height: 175
    };
    var wesabeSvEChart = new wesCharts.baseChart(wesCharts.LINE, 'sve-chart', sveChartOptions);
    wesabeSvEChart.render();
  }

  if ( $("#spending-pie").length ) {
    var tagChartOptions = {
      width: 315,
      height: 230,
      view: 'Spending'
    };
    var wtc = new wesCharts.baseChart(wesCharts.PIE, 'spending-pie', tagChartOptions);
    wtc.render();
  }

  if ( $("#earnings-pie").length ) {
    var tagChartOptions2 = {
      width: 315,
      height: 230,
      view: 'Earnings'
    };
    var wtc2 = new wesCharts.baseChart(wesCharts.PIE, 'earnings-pie', tagChartOptions2);
    wtc2.render();
  }

  if ( $("#txn-chart").length ) {
    // for some reason the width of the container is 2 pixels less on the txactions view
    var txnChartOptions = {
      width: 628,
      height: 175
    };
    var wesabeTxnChart = new wesCharts.baseChart(wesCharts.TXN, 'txn-chart', txnChartOptions);
    wesabeTxnChart.render();
  }

};


var wesData = {

  currency: {},

  profiling: false,
  profileXml: null,
  profileCallbackQueue: [],

  // transactions
  transactionCallbackQueue: [],
  transactionStartDate: null,
  transactionEndDate: null,
  transactionXml: null,
  transactionXmlRationalized: null,

  getProfile: function(callback) {
    if (this.profileXml) {
      callback(this.profileXml);
    }
    else if (this.profiling) {
      this.profileCallbackQueue.push(callback);
    }
    else {
      this.profiling = true;
      this.profileCallbackQueue.push(callback);
      this.getWesabeData('/profile.xml', wesData.popProfile);
    }
  },

  getWesabeData: function(url, callback, format) {
    jQuery.ajax({
      url: url,
      dataType: format || 'xml',
      success: callback,
      error: function(request, textStatus) { wesabe.error("wesCharts.getWesabeData: error requesting url=", url, " - got status text ", textStatus) }
    });
  },

  // called outside of scope - hence must refer to queue in global space
  popProfile: function(profileXml) {
    wesData.profileXml = profileXml;
    wesData.profiling = false;
    for (var cbs = 0;cbs < wesData.profileCallbackQueue.length; cbs++)
      wesData.profileCallbackQueue[cbs](profileXml);
  },

  parseProfile: function(profileXml) {
    var dc = profileXml.getElementsByTagName('default-currency')[0];
    currency = {
                'name': dc.firstChild.nodeValue,
                'unit': dc.getAttribute('symbol'),
           'precision': dc.getAttribute('decimal_places'),
           'separator': dc.getAttribute('separator'),
           'delimiter': dc.getAttribute('delimiter')
    };
  }
};

var either = function(a, b) { return (a===null || a===undefined) ? b : a };
