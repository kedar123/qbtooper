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

wesabe.provide('views.pages.trends', function() {
  wesabe.views.shared
    .setCurrentTab("trends")
    .setPageTitle("Trends")
    .enableDefaultAccountsSearch()
    .enableDefaultAccountSidebarBehavior()
    .enableDefaultTagSidebarBehavior();
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

jQuery(function($) {
  var date = wesabe.lang.date;
  var money = wesabe.lang.money;
  var string = wesabe.lang.string;
  var math = wesabe.lang.math;
  var array = wesabe.lang.array;
  var shared = wesabe.views.shared;
  var prefs = wesabe.data.preferences;
  var root = $('#spending-summary');

  var defaultCurrency = prefs.defaultCurrency();

  var ZERO_SUMMARY = { count: 0, value: 0, display: money.format(0, {currency: defaultCurrency}) };

  var behaviors = wesabe.provide('views.spendingSummaryWidget', {
    root: {
      init: function() {
        var self = $(this);

        self.fn("controlPanel")
          .include(behaviors.controlPanel)
          .bind("updated", function() { self.fn("update"); })
          .fn("init");

        self.fn('dateRangeNav')
          .include(behaviors.dateRangeNav)
          .bind("currentDateRangeChanged", function(e) { self.fn("update", e.callback); })
          .fn("init");

        self.fn('tagsList')
          .include(behaviors.tagsList)
          .fn("init");

        self.fn("spendingOrEarnings", "spending"); // default

        self.kvobserve('spending-earnings', function() {
          self.fn("title").text(string.ucfirst(self.fn('spendingOrEarnings')));
          self.fn("update");
        });

        $(window).bind('statechange', function() {
          self.fn('_restoreState');
        });

        var state = History.getState(),
            path  = state && state.url || window.location.pathname;

        if (path == "/trends") History.pushState(null, null, "/trends/spending");
        else self.fn('_restoreState');

        //FIXME Ben History link is broken. Disabling for now
        //$('#trends-summary li a').each(function() {
        //  new wesabe.views.widgets.HistoryLink($(this));
        //});

        return self;
      },

      _restoreState: function() {
        var state = History.getState(),
            path  = state && state.url || window.location.pathname,
            match = path.match(/\/trends\/(spending|earnings)$/),
            mode = match && match[1];

        if (mode) {
          $(this).fn("spendingOrEarnings", mode);

          $('#trends-summary li').each(function() {
            var li = $(this);
            if (li.hasClass(mode)) li.addClass('on');
            else li.removeClass('on');
          });

          var viewportMinY = document.body.scrollTop,
              viewportMaxY = viewportMinY + window.innerHeight,
              destination = $('#spending-summary').offset().top;

          if (destination < viewportMinY || destination > viewportMaxY)
            $("body:not(:animated)").animate({ scrollTop: destination-20}, 500 );
        }
      },

      title: function() {
        return $(".spending-earnings", this);
      },

      spendingOrEarnings: $.getsetdata('spending-earnings'),

      btaTags: function(dateRange) {
        return $(this).fn("getCache", "bta-" + $(this).fn("spendingOrEarnings"), dateRange);
      },

      useBta: function() {
        return $(this).fn("controlPanel").fn("state", "tagScope") == "tag-scope-top-button";
      },

      loading: function(key, flag) {
        if (!flag) {
          return $(this).data("loading-" + key);
        }
        else {
          $(this).data("loading-" + key, flag);
        }
      },

      update: function(callback) {
        $(this).fn("loadData", callback);
      },

      loadData: function(callback) {
        var self = $(this);

        var bta = self.fn("useBta");

        var currentDateRange = self.fn("dateRangeNav").fn("currentDateRange");
        var comparisonDateRange;
        if (self.fn("controlPanel").fn("state", "compare") != 'compare-none-button') {
          comparisonDateRange = self.fn("dateRangeNav").fn("previousDateRange");
        }

        self.fn("loadTags", currentDateRange);

        if (comparisonDateRange)
          self.fn("loadTags", comparisonDateRange);

        if (bta)
          self.fn("loadBtaTags", currentDateRange);

        var pollInterval = 25; // ms
        var ttl = 10 * date.SECONDS / pollInterval;

        function poll() {
          var currentData = self.fn('getCache', 'se', currentDateRange);
          var comparisonData;
          var btaTags;
          if (comparisonDateRange)
            comparisonData = self.fn('getCache', 'se', comparisonDateRange);
          if (bta)
            btaTags = self.fn("btaTags", currentDateRange);

          if (currentData &&
              (comparisonData || !comparisonDateRange) &&
              (btaTags || !bta))
          {
            self.fn("_onDataLoaded", self.fn('mergeData', currentData, comparisonData, btaTags), callback);
          } else if (ttl-- > 0) {
            setTimeout(poll, 25);
          } else {
            // show an error that we timed out?
          }
        }

        poll();
      },

      _onDataLoaded: function(data, callback) {
        // filter out zero spending/earnings
        //data = $.grep(data, function(row) {
          //return row["current"]["value"] != 0 || (row["comparison"] && row["comparison"]["value"] != 0);
        //});
        return $(this).fn('tagsList').fn('update', data, callback);
      },

      mergeData: function(currentData, comparisonData, btaTags) {
        var dataHash = {};
        var btaTagHash = {};

        var se = root.fn("spendingOrEarnings");
  var debit_total = 0;
  var credit_total = 0;
        // create bta tag lookup hash
        if (btaTags) {
          for (var i = 0; i < btaTags.length; i++) {
            btaTagHash[btaTags[i]] = 1;
          }
        }

        $.each(currentData, function(_, row) {
            var name = row["tag"]["name"];

            //if (btaTags && !btaTagHash[name]) return; // ignore any non-bta tags if we're using bta
            dataHash[name] = dataHash[name] || {};
            dataHash[name]["current"] = row[se];
            dataHash[name]["credit"] = row['earnings'];
            dataHash[name]["debit"] = row['spending'];
            dataHash[name]["net"] = row['net'];
            if (comparisonData)
              dataHash[name]["comparison"] = ZERO_SUMMARY;
          });

        if (comparisonData) {
          $.each(comparisonData, function(_, row) {
              var name = row["tag"]["name"];
              //if (btaTags && !btaTagHash[name]) return; // ignore any non-bta tags if we're using bta
              dataHash[name] = dataHash[name] || {};
              dataHash[name]["comparison"] = row[se];
              dataHash[name]["current"] = dataHash[name]["current"] || ZERO_SUMMARY;
            });
        }

        var data = [];

        for (tag in dataHash) {
          var row = { name: tag,
                      current: dataHash[tag]["current"],
                      net: dataHash[tag]["net"],
                      debit: dataHash[tag]["debit"],
                      credit: dataHash[tag]["credit"] };

          if (comparisonData)
            row.comparison = dataHash[tag]["comparison"];


            //@Ben Credit and Debit should be summed
            if (row["net"]["value"] > 0) {
              row["credit"]["value"] = row["net"]["value"];
              row["debit"]["value"] = 0;
              credit_total += parseFloat(row["net"]["value"]);
            } else {
              row["credit"]["value"] = 0;
              row["debit"]["value"] = -1 * row["net"]["value"];
              debit_total += parseFloat(-1 * row["net"]["value"]);
            }
          data.push(row);
        }
            $(".credit > .tag-amount-credit-total", this).text(money.format(credit_total, {currency: defaultCurrency, unit: ""}));
            $(".debit > .tag-amount-debit-total", this).text(money.format(debit_total, {currency: defaultCurrency, unit: ""}));

        return data;
      },

      loadBtaTags: function(dateRange) {
        var self = $(this);

        if (!self.fn("btaTags", dateRange)) {
          var se = self.fn("spendingOrEarnings");
          if (!self.fn("loading", "bta-" + se + dateRange)) {
            self.fn("loading", "bta-" + se + dateRange, true);
            $.ajax({
              url: '/transactions/rational.xml',
              data: { start_date: date.toParam(dateRange[0]),
                      end_date: date.toParam(dateRange[1]),
                      filter_transfers: true,
                      compact: true,
                      currency: defaultCurrency,
                      type: se },
              dataType: 'xml',
              cache: false,
              success: function(data){
                self.fn("loading", "bta-" + se + dateRange, false);
                self.fn("_onBtaTagsLoaded", dateRange, data);
              },
              error: function(){ self.fn("_onTagsError"); }
            });
          }
        }
      },

      _onBtaTagsLoaded: function(dateRange, data) {
        var self = $(this);

        var tags = array.uniq(
          $.map($(data).find("tag > name"), function(el) {
            return $(el).text().split(/:/)[0]; // remove splits
          })
        );
        self.fn("setCache", "bta-" + self.fn("spendingOrEarnings"), dateRange, tags);
      },

      loadTags: function(dateRange) {
        var self = $(this);

        if (!self.fn("getCache", "se", dateRange)) {
          $.ajax({
            url: ['/data/analytics/summaries/tags',
                   date.toParam(dateRange[0]),
                   date.toParam(date.addDays(dateRange[1], 1)),
                   defaultCurrency].join('/'),
            dataType: 'json',
            cache: false,
            success: function(data){ self.fn("_onTagsLoaded", dateRange, data); },
            error: function(){ self.fn("_onTagsError"); }
          });
        }
        return self;
      },

      _onTagsLoaded: function(dateRange, data) {
        // FIXME: massage the data so that the value of each tag is a number rather than a string
        // I'm told that a currently unreleased version of BRCM corrects this for us, so remove this code when that's in place
        data = data["summaries"];
        for (var i = 0; i < data.length; i++) {
          data[i]["spending"]["value"] = parseFloat(data[i]["spending"]["value"]);
          data[i]["earnings"]["value"] = parseFloat(data[i]["earnings"]["value"]);
        }
        $(this).fn("setCache", 'se', dateRange, data);
      },

      _onTagsError: function() {
        /* do something? */
        return $(this);
      },

      controlPanel: function() { return $("#control-panel", this); },

      dateRangeNav: function() { return $("#date-range-nav", this); },

      tagsList: function() { return $("#tags-list", this); },

      cacheKey: function(name, dateRange) {
        return [name, dateRange[0].valueOf(), dateRange[1].valueOf()].join('-');
      },

      getCache: function(name, dateRange) {
        var cacheKey = $(this).fn("cacheKey", name, dateRange);
        return $(this).data("tagsCache-"+cacheKey);
      },

      setCache: function(name, dateRange, data) {
        var cacheKey = $(this).fn("cacheKey", name, dateRange);
        $(this).data("tagsCache-"+cacheKey,  data);
      }
    },

    // FIXME: extract this functionality to a generic ControlPanel class that can be reused elsewhere
    controlPanel: (function() {
      var buttonGroups = {
        tagScope:  ["tag-scope-all-button","tag-scope-top-button"],
        compare:   ["compare-none-button","compare-previous-button","compare-average-button"],
        dateRange: ["date-range-month-button","date-range-quarter-button","date-range-year-button","date-range-custom-button"]
      };

      return {
        init: function() {
          var self = $(this);

          // set up click handler so that clicking one button in a group will turn the others off
          for (var key in buttonGroups) {
            var buttonIds = buttonGroups[key],
                buttons = [],
                buttonGroup;

            for (var i = 0; i < buttonIds.length; i++)
              buttons.push(new wesabe.views.widgets.Button($('#'+buttonIds[i])));

            buttonGroup = new wesabe.views.widgets.ButtonGroup(buttons, {
              onSelectionChange: function(sender, button) {
                self.fn("fireUpdatedEvent", sender.key, button);
              }
            });

            buttonGroup.key = key;
            buttonGroup.selectButton(buttons[0]);
          }

          $("#custom-edit", self).dateRangePicker({
            onShow: function() {
              var dateRange = prefs.get("trends.summary.custom-date-range");
              if (dateRange) {
                dateRange = dateRange.split(":");
                this.startDate(dateRange[0]);
                this.endDate(dateRange[1]);
              }
            },

            onSave: function() {
              var startDate = this.startDateInput().val();
              var endDate = this.endDateInput().val();
              prefs.update("trends.summary.custom-date-range", startDate + ':' + endDate);
              root.fn("controlPanel").fn("fireUpdatedEvent", "dateRange", "date-range-custom-button");
            }
          });

          // special case for the custom date range button
          $("#date-range-custom-button", this).click(function() {
            if (!prefs.get("trends.summary.custom-date-range"))
              $("#custom-edit", self).fn("dateRangePicker").show();
          });
        },

        // return jQuery object for the given button
        button: function(id) { return $("#" + id, this); },

        // return current state of one or all all buttonGroups
        state: function(group) {
          var self = $(this);
          if (group) {
            for (var i in buttonGroups[group]) {
              var button = buttonGroups[group][i];
              if (self.fn("button", button).hasClass("on")) return button;
            }
          } else {
            var state = {};
            for (group in buttonGroups) {
              state[group] = self.fn("state", group);
            }
            return state;
          }
        },

        fireUpdatedEvent: function(group, button) {
          return $(this)
            .trigger("updated")
            .trigger(group + "Updated", button);
        },

        customDateRange: function() {
          var dateRange = prefs.get("trends.summary.custom-date-range");
          if (dateRange) {
            dateRange = dateRange.split(":");
            var startDate = date.parse(dateRange[0]);
            var endDate = date.parse(dateRange[1]);
            if (startDate && endDate)
              return [startDate, endDate];
          }
        }

      };
    })(),

    dateRangeNav: {
      init: function() {
        var self = $(this);

        // catch dateRangeUpdated event from the control panel so we can update ourselves
        root.fn("controlPanel")
          .bind("dateRangeUpdated", function(_, button) {
            self.fn("selectedDateRangeChanged", button);
          });

        // update ourselves whenever the currentDateRange changes
        self.kvobserve("currentDateRange", function(_, value) { self.fn("update", value); });

        // initialize current date range to today
        self.fn("currentDateRange", self.fn("calculateDateRange", new Date()));

        $(".left-arrow,.previous-date-range", this).click(function() {
          root.fn("tagsList").hide("slide", {direction:"right", useVisibility:true}, 500);
          self.fn("currentDateRange", self.fn("previousDateRange"),
            function() { root.fn("tagsList").show("slide", {direction:"left"}, 500);});
        });

        $(".right-arrow,.next-date-range", this).click(function() {
          root.fn("tagsList").hide("slide", {direction:"left", useVisibility:true}, 500);
          self.fn("currentDateRange", self.fn("nextDateRange"),
            function() {root.fn("tagsList").show("slide", {direction:"right"}, 500);});
        });

        return self;
      },

      calculateDateRange: function(d) {
        switch($(this).fn("selectedDateRange")) {
          case 1:
            return [date.startOfMonth(d), date.endOfMonth(d)];
          case 3:
            return [date.startOfQuarter(d), date.endOfQuarter(d)];
          case 12:
            return [date.startOfYear(d), date.endOfYear(d)];
          case "custom":
            return root.fn("controlPanel").fn("customDateRange") || $(this).fn("currentDateRange");
        }
      },

      selectedDateRange: function() {
        switch(root.fn("controlPanel").fn("state", "dateRange")) {
          case "date-range-month-button": return 1;
          case "date-range-quarter-button": return 3;
          case "date-range-year-button": return 12;
          case "date-range-custom-button": return "custom";
        }
      },

      currentDateRange: function(dateRange, callback) {
        var currentDateRange = $(this).kvo("currentDateRange");
        if (dateRange && dateRange != currentDateRange) {
          $(this).kvo("currentDateRange", dateRange);
          var evt = {type:"currentDateRangeChanged"};
          if (callback) evt.callback = callback;
          $(this).trigger(evt);
        } else {
          return currentDateRange;
        }
      },

      selectedDateRangeChanged: function(button) {
        root.fn("tagsList").fadeTo("fast", 0.3);
        $(this).fn("currentDateRange",
          $(this).fn("calculateDateRange", $(this).fn("currentDateRange")[0]),
          function() { root.fn("tagsList").fadeTo("fast", 1); });
      },

      previousDateRange: function() {
        var selectedDateRange = $(this).fn("selectedDateRange");
        var currentDateRange = $(this).fn("currentDateRange");

        if (selectedDateRange == "custom") {
          var timeSpan = currentDateRange[0].getTime() - currentDateRange[1].getTime();
          return [date.add(currentDateRange[0], timeSpan), date.add(currentDateRange[1], timeSpan)];
        } else {
          return $(this).fn("calculateDateRange",
            date.addMonths(currentDateRange[0], -selectedDateRange));
        }
      },

      nextDateRange: function() {
        var selectedDateRange = $(this).fn("selectedDateRange");
        var currentDateRange = $(this).fn("currentDateRange");

        if (selectedDateRange == "custom") {
          var timeSpan = currentDateRange[1].getTime() - currentDateRange[0].getTime();
          return [date.add(currentDateRange[0], timeSpan), date.add(currentDateRange[1], timeSpan)];
        } else {
          return $(this).fn("calculateDateRange",
            date.addMonths(currentDateRange[0], selectedDateRange));
        }
      },

      update: function(currentDateRange) {
        var self = $(this);
        var dateRangeText;
        switch(self.fn("selectedDateRange")) {
          case 1:
            dateRangeText = date.format(currentDateRange[0], "MMM yyyy"); break;
          case 3:
          case "custom":
            dateRangeText = date.shortFriendlyFormat(currentDateRange[0]) + ' - ' + date.shortFriendlyFormat(currentDateRange[1]); break;
          case 12:
            dateRangeText = currentDateRange[0].getFullYear();
        }
        $(".current-date-range", self).text(dateRangeText);

        if (!date.before(date.startOfDay(currentDateRange[1]), date.startOfDay(new Date()))) {
          $(".next-date-range,.right-arrow", self).hide();
        } else {
          $(".next-date-range,.right-arrow", self).show();
        }
      }
    },

    tagsList: {
      init: function() {
        return $(this);
      },

      maxAmount: $.getsetdata('maxAmount'),

      tags: function() {
        return $(this).find("li:not(.template)");
      },

      clear: function() {
        return $(this).fn('tags').remove();
      },

      update: function(data, callback) {
        var self = $(this);

        self.removeClass("spending").removeClass("earnings").addClass(root.fn("spendingOrEarnings"));
        self.fn('clear');
        if (data.length == 0) {
          $("#no-tags .type").text(root.fn("spendingOrEarnings"));
          $("#no-tags").show();
          $(".column-headers").hide();
          self.hide();
        } else {
          $("#no-tags").hide();
          $(".column-headers").show();

          if (data[0]["comparison"]) {
            self.addClass("comparison");
          } else {
            self.removeClass("comparison");
          }
          // sort the array from high to low current value and get max amount
          //data.sort(function(a,b) { return b["current"]["value"] - a["current"]["value"]; });
          var currentValues = [];
          var comparisonValues = [];
          $.each(data, function(_, row) {
            currentValues.push(row["current"]["value"]);
            if (row["comparison"])
              comparisonValues.push(row["comparison"]["value"]);
          });
          var maxCurrent = math.max(currentValues);
          var maxComparison = math.max(comparisonValues) || 0;
          if (maxCurrent >= maxComparison) {
            self.fn("maxAmount", maxCurrent);
          } else {
            self.fn("maxAmount", maxComparison);
          }

          $.each(data, function(_, item) { self.fn('add', item); });
          root.fn("dateRangeNav").show();

          self.css("visibility","visible").show();

          if (callback) callback();
          // ensure that we aren't left in a faded state
          self.fadeTo("fast", 1);
        }
      },

      add: function(data) {
        return $(".template", this).clone().removeClass("template")
          .include(behaviors.tag)
          .fn("init")
          .fn("update", data)
          .appendTo(this);
      }
    },

    tag: (function() {
      var maxAmount;

      return {
        init: function() {
          var self = $(this);

           maxAmount = root.fn("tagsList").fn("maxAmount");

          // <HACK>
          // Works around what may be a jQuery/Chrome compatibility issue
          // that happens when doing $('.tag-name, .tag-amount, .tag-bar-spent', self).
          var clickables = $([])
            .add($('.tag-name', self))
            .add($('.tag-amount', self))
            .add($('.tag-bar-spent', self));

          clickables.click(function() {
            shared.navigateTo('/tags/'+encodeURIComponent(self.fn("data")["name"].replace(/\s/g, '_')));
          });
          // </HACK>

          return self;
        },

        data: $.getsetdata("data"),

        update: function(data) {
          $(this).fn('data', data)
            .fn('redraw');
          return $(this);
        },

        // position the bar
        redraw: function() {
          var self = $(this);
          var data = self.fn('data');
          data["name"] = data["name"].replace(/_/g," ")
          $(".tag-name", this).text(data["name"]);
          //$(".current > .tag-amount-debit", this).text(data["current"]["display"]);
          if (data["debit"]["value"]>0) {
            $(".debit > .tag-amount-debit", this).text(money.format(data["debit"]["value"], {currency: defaultCurrency, unit: ""}));
          }
          if (data["credit"]["value"]>0) {
            $(".credit > .tag-amount-credit", this).text(money.format(data["credit"]["value"], {currency: defaultCurrency, unit: ""}));
          }
          /*
          $(".current > .tag-amount", this).text(data["current"]["display"]);
           if (data["comparison"]) {
            $(".comparison > .tag-amount", this).text(data["comparison"]["display"]);
          } else {
            $(".tag-bar-amount.comparison", this).hide();
          }
          */

          var bars = ["current"];
          if (data["comparison"])
            bars.push("comparison");

          for (var i = 0; i < bars.length; i++) {
            var bar = bars[i];
            var percentFull = self.fn("percentFull", data[bar]["value"]);
            var barPos = 400 * percentFull - 400;
            /*
            if (barPos > 0) barPos = 0;
            $(".tag-bar-amount." + bar, this).css('background-position', barPos + 'px 4px');
            */
            $(".tag-bar-amount." + bar, this).css('background', 'none');
            var tagAmount = $("." + bar + " > .tag-amount", this);
            var textLen = tagAmount.text().length;
            tagAmount.addClass("outside").css({"margin-left": 300});
            /*
              if (barPos + 405 < textLen * 8) {
              tagAmount.addClass("outside").css({"margin-left": barPos + 395});
            }
            */
          }

          return self;
        },

        percentFull: function(amount) {
          if (maxAmount == 0) return 0;
          return amount / maxAmount;
        }
      };
    })()
  });

  root.include(behaviors.root).fn('init');
});

jQuery(function($) {
  var date = wesabe.lang.date;
  var money = wesabe.lang.money;
  var string = wesabe.lang.string;
  var math = wesabe.lang.math;
  var array = wesabe.lang.array;
  var shared = wesabe.views.shared;
  var prefs = wesabe.data.preferences;
  var root = $('#balance-sheet');

  var defaultCurrency = prefs.defaultCurrency();

  var ZERO_SUMMARY = { count: 0, value: 0, display: money.format(0, {currency: defaultCurrency}) };

  var behaviors = wesabe.provide('views.balanceSheetWidget', {
    root: {
      init: function() {
        var self = $(this);

        self.fn("controlPanel")
          .include(behaviors.controlPanel)
          .bind("updated", function() { self.fn("update"); })
          .fn("init");

        self.fn('dateRangeNav')
          .include(behaviors.dateRangeNav)
          .bind("currentDateRangeChanged", function(e) { self.fn("update", e.callback); })
          .fn("init");

        self.fn('tagsList')
          .include(behaviors.tagsList)
          .fn("init");

        self.fn("spendingOrEarnings", "spending"); // default

        self.kvobserve('spending-earnings', function() {
          self.fn("title").text(string.ucfirst(self.fn('spendingOrEarnings')));
          self.fn("update");
        });

        $(window).bind('statechange', function() {
          self.fn('_restoreState');
        });

        var state = History.getState(),
            path  = state && state.url || window.location.pathname;

        if (path == "/trends") History.pushState(null, null, "/trends/spending");
        else self.fn('_restoreState');

        //FIXME Ben History link is broken. Disabling for now
        //$('#trends-summary li a').each(function() {
        //  new wesabe.views.widgets.HistoryLink($(this));
        //});

        return self;
      },

      _restoreState: function() {
        var state = History.getState(),
            path  = state && state.url || window.location.pathname,
            match = path.match(/\/trends\/(spending|earnings)$/),
            mode = match && match[1];

        if (mode) {
          $(this).fn("spendingOrEarnings", mode);

          $('#trends-summary li').each(function() {
            var li = $(this);
            if (li.hasClass(mode)) li.addClass('on');
            else li.removeClass('on');
          });

          var viewportMinY = document.body.scrollTop,
              viewportMaxY = viewportMinY + window.innerHeight,
              destination = $('#spending-summary').offset().top;

          if (destination < viewportMinY || destination > viewportMaxY)
            $("body:not(:animated)").animate({ scrollTop: destination-20}, 500 );
        }
      },

      title: function() {
        return $(".spending-earnings", this);
      },

      spendingOrEarnings: $.getsetdata('spending-earnings'),

      btaTags: function(dateRange) {
        return $(this).fn("getCache", "bta-" + $(this).fn("spendingOrEarnings"), dateRange);
      },

      useBta: function() {
        return $(this).fn("controlPanel").fn("state", "tagScope") == "tag-scope-top-button";
      },

      loading: function(key, flag) {
        if (!flag) {
          return $(this).data("loading-" + key);
        }
        else {
          $(this).data("loading-" + key, flag);
        }
      },

      update: function(callback) {
        $(this).fn("loadData", callback);
      },

      loadData: function(callback) {
        var self = $(this);

        var bta = self.fn("useBta");

        var currentDateRange = self.fn("dateRangeNav").fn("currentDateRange");
        var comparisonDateRange;
        if (self.fn("controlPanel").fn("state", "compare") != 'compare-none-button') {
          comparisonDateRange = self.fn("dateRangeNav").fn("previousDateRange");
        }

        self.fn("loadTags", currentDateRange);

        if (comparisonDateRange)
          self.fn("loadTags", comparisonDateRange);

        if (bta)
          self.fn("loadBtaTags", currentDateRange);

        var pollInterval = 25; // ms
        var ttl = 10 * date.SECONDS / pollInterval;

        function poll() {
          var currentData = self.fn('getCache', 'se', currentDateRange);
          var comparisonData;
          var btaTags;
          if (comparisonDateRange)
            comparisonData = self.fn('getCache', 'se', comparisonDateRange);
          if (bta)
            btaTags = self.fn("btaTags", currentDateRange);

          if (currentData &&
              (comparisonData || !comparisonDateRange) &&
              (btaTags || !bta))
          {
            self.fn("_onDataLoaded", self.fn('mergeData', currentData, comparisonData, btaTags), callback);
          } else if (ttl-- > 0) {
            setTimeout(poll, 25);
          } else {
            // show an error that we timed out?
          }
        }

        poll();
      },

      _onDataLoaded: function(data, callback) {
        // filter out zero spending/earnings
        //data = $.grep(data, function(row) {
          //return row["current"]["value"] != 0 || (row["comparison"] && row["comparison"]["value"] != 0);
        //});
        console.log(data);
          for (var i = 0; i < data.length; i++) {
            data[i]['group'] = Math.floor((Math.random()*11)+1);
          }
        console.log(data);
        return $(this).fn('tagsList').fn('update', data, callback);
      },

      mergeData: function(currentData, comparisonData, btaTags) {
            //console.log(currentData);
        var dataHash = {};
        var btaTagHash = {};

        var se = root.fn("spendingOrEarnings");
  var debit_total = 0;
  var credit_total = 0;
        // create bta tag lookup hash
        if (btaTags) {
          for (var i = 0; i < btaTags.length; i++) {
            btaTagHash[btaTags[i]] = 1;
          }
        }

        $.each(currentData, function(_, row) {
            var name = row["tag"]["name"];

            //console.log(row[se]);
            //if (btaTags && !btaTagHash[name]) return; // ignore any non-bta tags if we're using bta
            dataHash[name] = dataHash[name] || {};
            dataHash[name]["current"] = row[se];
            dataHash[name]["credit"] = row['spending'];
            dataHash[name]["debit"] = row['earnings'];
            if (comparisonData)
              dataHash[name]["comparison"] = ZERO_SUMMARY;
          });

        if (comparisonData) {
          $.each(comparisonData, function(_, row) {
              var name = row["tag"]["name"];
              //if (btaTags && !btaTagHash[name]) return; // ignore any non-bta tags if we're using bta
              dataHash[name] = dataHash[name] || {};
              dataHash[name]["comparison"] = row[se];
              dataHash[name]["current"] = dataHash[name]["current"] || ZERO_SUMMARY;
            });
        }

        var data = [];

        for (tag in dataHash) {
          var row = { name: tag,
                      current: dataHash[tag]["current"],
                      debit: dataHash[tag]["debit"],
                      credit: dataHash[tag]["credit"] };

          if (comparisonData)
            row.comparison = dataHash[tag]["comparison"];


            credit_total += dataHash[tag]["credit"]["value"];
            debit_total += dataHash[tag]["debit"]["value"];
          data.push(row);
        }
            //console.log(row);
            //console.log(dataHash);
            $(".credit > .tag-amount-credit-total", this).text(money.format(credit_total, {currency: defaultCurrency}));
            $(".debit > .tag-amount-debit-total", this).text(money.format(debit_total, {currency: defaultCurrency}));

        return data;
      },

      loadBtaTags: function(dateRange) {
        var self = $(this);

        if (!self.fn("btaTags", dateRange)) {
          var se = self.fn("spendingOrEarnings");
          if (!self.fn("loading", "bta-" + se + dateRange)) {
            self.fn("loading", "bta-" + se + dateRange, true);
            $.ajax({
              url: '/transactions/rational.xml',
              data: { start_date: date.toParam(dateRange[0]),
                      end_date: date.toParam(dateRange[1]),
                      filter_transfers: true,
                      compact: true,
                      currency: defaultCurrency,
                      type: se },
              dataType: 'xml',
              cache: false,
              success: function(data){
                self.fn("loading", "bta-" + se + dateRange, false);
                self.fn("_onBtaTagsLoaded", dateRange, data);
              },
              error: function(){ self.fn("_onTagsError"); }
            });
          }
        }
      },

      _onBtaTagsLoaded: function(dateRange, data) {
        var self = $(this);

        var tags = array.uniq(
          $.map($(data).find("tag > name"), function(el) {
            return $(el).text().split(/:/)[0]; // remove splits
          })
        );
        self.fn("setCache", "bta-" + self.fn("spendingOrEarnings"), dateRange, tags);
      },

      loadTags: function(dateRange) {
        var self = $(this);

        if (!self.fn("getCache", "se", dateRange)) {
          $.ajax({
            url: ['/data/analytics/summaries/tags',
                   date.toParam(dateRange[0]),
                   date.toParam(date.addDays(dateRange[1], 1)),
                   defaultCurrency].join('/'),
            dataType: 'json',
            cache: false,
            success: function(data){ self.fn("_onTagsLoaded", dateRange, data); },
            error: function(){ self.fn("_onTagsError"); }
          });
        }
        return self;
      },

      _onTagsLoaded: function(dateRange, data) {
        // FIXME: massage the data so that the value of each tag is a number rather than a string
        // I'm told that a currently unreleased version of BRCM corrects this for us, so remove this code when that's in place
        data = data["summaries"];
        for (var i = 0; i < data.length; i++) {
          data[i]["spending"]["value"] = parseFloat(data[i]["spending"]["value"]);
          data[i]["earnings"]["value"] = parseFloat(data[i]["earnings"]["value"]);
        }
        $(this).fn("setCache", 'se', dateRange, data);
      },

      _onTagsError: function() {
        /* do something? */
        return $(this);
      },

      controlPanel: function() { return $("#control-panel", this); },

      dateRangeNav: function() { return $("#date-range-nav", this); },

      tagsList: function() { return $("#tags-list", this); },

      cacheKey: function(name, dateRange) {
        return [name, dateRange[0].valueOf(), dateRange[1].valueOf()].join('-');
      },

      getCache: function(name, dateRange) {
        var cacheKey = $(this).fn("cacheKey", name, dateRange);
        return $(this).data("tagsCache-"+cacheKey);
      },

      setCache: function(name, dateRange, data) {
        var cacheKey = $(this).fn("cacheKey", name, dateRange);
        $(this).data("tagsCache-"+cacheKey,  data);
      }
    },

    // FIXME: extract this functionality to a generic ControlPanel class that can be reused elsewhere
    controlPanel: (function() {
      var buttonGroups = {
        tagScope:  ["tag-scope-all-button","tag-scope-top-button"],
        compare:   ["compare-none-button","compare-previous-button","compare-average-button"],
        dateRange: ["date-range-month-button","date-range-quarter-button","date-range-year-button","date-range-custom-button"]
      };

      return {
        init: function() {
          var self = $(this);

          // set up click handler so that clicking one button in a group will turn the others off
          for (var key in buttonGroups) {
            var buttonIds = buttonGroups[key],
                buttons = [],
                buttonGroup;

            for (var i = 0; i < buttonIds.length; i++)
              buttons.push(new wesabe.views.widgets.Button($('#'+buttonIds[i])));

            buttonGroup = new wesabe.views.widgets.ButtonGroup(buttons, {
              onSelectionChange: function(sender, button) {
                self.fn("fireUpdatedEvent", sender.key, button);
              }
            });

            buttonGroup.key = key;
            buttonGroup.selectButton(buttons[0]);
          }

          $("#custom-edit", self).dateRangePicker({
            onShow: function() {
              var dateRange = prefs.get("trends.summary.custom-date-range");
              if (dateRange) {
                dateRange = dateRange.split(":");
                this.startDate(dateRange[0]);
                this.endDate(dateRange[1]);
              }
            },

            onSave: function() {
              var startDate = this.startDateInput().val();
              var endDate = this.endDateInput().val();
              prefs.update("trends.summary.custom-date-range", startDate + ':' + endDate);
              root.fn("controlPanel").fn("fireUpdatedEvent", "dateRange", "date-range-custom-button");
            }
          });

          // special case for the custom date range button
          $("#date-range-custom-button", this).click(function() {
            if (!prefs.get("trends.summary.custom-date-range"))
              $("#custom-edit", self).fn("dateRangePicker").show();
          });
        },

        // return jQuery object for the given button
        button: function(id) { return $("#" + id, this); },

        // return current state of one or all all buttonGroups
        state: function(group) {
          var self = $(this);
          if (group) {
            for (var i in buttonGroups[group]) {
              var button = buttonGroups[group][i];
              if (self.fn("button", button).hasClass("on")) return button;
            }
          } else {
            var state = {};
            for (group in buttonGroups) {
              state[group] = self.fn("state", group);
            }
            return state;
          }
        },

        fireUpdatedEvent: function(group, button) {
          return $(this)
            .trigger("updated")
            .trigger(group + "Updated", button);
        },

        customDateRange: function() {
          var dateRange = prefs.get("trends.summary.custom-date-range");
          if (dateRange) {
            dateRange = dateRange.split(":");
            var startDate = date.parse(dateRange[0]);
            var endDate = date.parse(dateRange[1]);
            if (startDate && endDate)
              return [startDate, endDate];
          }
        }

      };
    })(),

    dateRangeNav: {
      init: function() {
        var self = $(this);

        // catch dateRangeUpdated event from the control panel so we can update ourselves
        root.fn("controlPanel")
          .bind("dateRangeUpdated", function(_, button) {
            self.fn("selectedDateRangeChanged", button);
          });

        // update ourselves whenever the currentDateRange changes
        self.kvobserve("currentDateRange", function(_, value) { self.fn("update", value); });

        // initialize current date range to today
        self.fn("currentDateRange", self.fn("calculateDateRange", new Date()));

        $(".left-arrow,.previous-date-range", this).click(function() {
          root.fn("tagsList").hide("slide", {direction:"right", useVisibility:true}, 500);
          self.fn("currentDateRange", self.fn("previousDateRange"),
            function() { root.fn("tagsList").show("slide", {direction:"left"}, 500);});
        });

        $(".right-arrow,.next-date-range", this).click(function() {
          root.fn("tagsList").hide("slide", {direction:"left", useVisibility:true}, 500);
          self.fn("currentDateRange", self.fn("nextDateRange"),
            function() {root.fn("tagsList").show("slide", {direction:"right"}, 500);});
        });

        return self;
      },

      calculateDateRange: function(d) {
        switch($(this).fn("selectedDateRange")) {
          case 1:
            return [date.startOfMonth(d), date.endOfMonth(d)];
          case 3:
            return [date.startOfQuarter(d), date.endOfQuarter(d)];
          case 12:
            return [date.startOfYear(d), date.endOfYear(d)];
          case "custom":
            return root.fn("controlPanel").fn("customDateRange") || $(this).fn("currentDateRange");
        }
      },

      selectedDateRange: function() {
        switch(root.fn("controlPanel").fn("state", "dateRange")) {
          case "date-range-month-button": return 1;
          case "date-range-quarter-button": return 3;
          case "date-range-year-button": return 12;
          case "date-range-custom-button": return "custom";
        }
      },

      currentDateRange: function(dateRange, callback) {
        var currentDateRange = $(this).kvo("currentDateRange");
        if (dateRange && dateRange != currentDateRange) {
          $(this).kvo("currentDateRange", dateRange);
          var evt = {type:"currentDateRangeChanged"};
          if (callback) evt.callback = callback;
          $(this).trigger(evt);
        } else {
          return currentDateRange;
        }
      },

      selectedDateRangeChanged: function(button) {
        root.fn("tagsList").fadeTo("fast", 0.3);
        $(this).fn("currentDateRange",
          $(this).fn("calculateDateRange", $(this).fn("currentDateRange")[0]),
          function() { root.fn("tagsList").fadeTo("fast", 1); });
      },

      previousDateRange: function() {
        var selectedDateRange = $(this).fn("selectedDateRange");
        var currentDateRange = $(this).fn("currentDateRange");

        if (selectedDateRange == "custom") {
          var timeSpan = currentDateRange[0].getTime() - currentDateRange[1].getTime();
          return [date.add(currentDateRange[0], timeSpan), date.add(currentDateRange[1], timeSpan)];
        } else {
          return $(this).fn("calculateDateRange",
            date.addMonths(currentDateRange[0], -selectedDateRange));
        }
      },

      nextDateRange: function() {
        var selectedDateRange = $(this).fn("selectedDateRange");
        var currentDateRange = $(this).fn("currentDateRange");

        if (selectedDateRange == "custom") {
          var timeSpan = currentDateRange[1].getTime() - currentDateRange[0].getTime();
          return [date.add(currentDateRange[0], timeSpan), date.add(currentDateRange[1], timeSpan)];
        } else {
          return $(this).fn("calculateDateRange",
            date.addMonths(currentDateRange[0], selectedDateRange));
        }
      },

      update: function(currentDateRange) {
        var self = $(this);
        var dateRangeText;
        switch(self.fn("selectedDateRange")) {
          case 1:
            dateRangeText = date.format(currentDateRange[0], "MMM yyyy"); break;
          case 3:
          case "custom":
            dateRangeText = date.shortFriendlyFormat(currentDateRange[0]) + ' - ' + date.shortFriendlyFormat(currentDateRange[1]); break;
          case 12:
            dateRangeText = currentDateRange[0].getFullYear();
        }
        $(".current-date-range", self).text(dateRangeText);

        if (!date.before(date.startOfDay(currentDateRange[1]), date.startOfDay(new Date()))) {
          $(".next-date-range,.right-arrow", self).hide();
        } else {
          $(".next-date-range,.right-arrow", self).show();
        }
      }
    },

    tagsList: {
      init: function() {
        return $(this);
      },

      maxAmount: $.getsetdata('maxAmount'),

      tags: function() {
        return $(this).find("li:not(.template)");
      },

      clear: function() {
        return $(this).fn('tags').remove();
      },

      update: function(data, callback) {
        var self = $(this);

        self.removeClass("spending").removeClass("earnings").addClass(root.fn("spendingOrEarnings"));
        self.fn('clear');
        if (data.length == 0) {
          $("#no-tags .type").text(root.fn("spendingOrEarnings"));
          $("#no-tags").show();
          $(".column-headers").hide();
          self.hide();
        } else {
          $("#no-tags").hide();
          $(".column-headers").show();
          $(".asset").show();

          if (data[0]["comparison"]) {
            self.addClass("comparison");
          } else {
            self.removeClass("comparison");
          }
          // sort the array from high to low current value and get max amount
          data.sort(function(a,b) { return b["current"]["value"] - a["current"]["value"]; });
          var currentValues = [];
          var comparisonValues = [];
          $.each(data, function(_, row) {
            currentValues.push(row["current"]["value"]);
            if (row["comparison"])
              comparisonValues.push(row["comparison"]["value"]);
          });
          var maxCurrent = math.max(currentValues);
          var maxComparison = math.max(comparisonValues) || 0;
          if (maxCurrent >= maxComparison) {
            self.fn("maxAmount", maxCurrent);
          } else {
            self.fn("maxAmount", maxComparison);
          }

          $.each(data, function(_, item) { self.fn('add', item); });
          root.fn("dateRangeNav").show();

          self.css("visibility","visible").show();

          if (callback) callback();
          // ensure that we aren't left in a faded state
          self.fadeTo("fast", 1);
        }
      },

      add: function(data) {
        return $(".template", this).clone().removeClass("template")
          .include(behaviors.tag)
          .fn("init")
          .fn("update", data)
          .appendTo(this);
      }
    },

    tag: (function() {
      var maxAmount;

      return {
        init: function() {
          var self = $(this);

           maxAmount = root.fn("tagsList").fn("maxAmount");

          // <HACK>
          // Works around what may be a jQuery/Chrome compatibility issue
          // that happens when doing $('.tag-name, .tag-amount, .tag-bar-spent', self).
          var clickables = $([])
            .add($('.tag-name', self))
            .add($('.tag-amount', self))
            .add($('.tag-bar-spent', self));

          clickables.click(function() {
            shared.navigateTo('/tags/'+encodeURIComponent(self.fn("data")["name"].replace(/\s/g, '_')));
          });
          // </HACK>

          return self;
        },

        data: $.getsetdata("data"),

        update: function(data) {
          $(this).fn('data', data)
            .fn('redraw');
          return $(this);
        },

        // position the bar
        redraw: function() {
          var self = $(this);
          var data = self.fn('data');

          console.log(data);

          data["name"] = data["name"].replace(/_/g," ")
          $(".tag-name", this).text(data["name"]);
          //$(".current > .tag-amount-debit", this).text(data["current"]["display"]);
            //$(".asset > .tag-amount", this).text(data["net"]["display"]);
            $(".asset > .tag-amount", this).text(data["credit"]["display"]);
          /*
          $(".current > .tag-amount", this).text(data["current"]["display"]);
           if (data["comparison"]) {
            $(".comparison > .tag-amount", this).text(data["comparison"]["display"]);
          } else {
            $(".tag-bar-amount.comparison", this).hide();
          }
          */

          var bars = ["current"];
          if (data["comparison"])
            bars.push("comparison");

          for (var i = 0; i < bars.length; i++) {
            var bar = bars[i];
            var percentFull = self.fn("percentFull", data[bar]["value"]);
            var barPos = 400 * percentFull - 400;
            /*
            if (barPos > 0) barPos = 0;
            $(".tag-bar-amount." + bar, this).css('background-position', barPos + 'px 4px');
            */
            $(".tag-bar-amount." + bar, this).css('background', 'none');
            var tagAmount = $("." + bar + " > .tag-amount", this);
            var textLen = tagAmount.text().length;
            tagAmount.addClass("outside").css({"margin-left": 300});
            /*
              if (barPos + 405 < textLen * 8) {
              tagAmount.addClass("outside").css({"margin-left": barPos + 395});
            }
            */
          }

          return self;
        },

        percentFull: function(amount) {
          if (maxAmount == 0) return 0;
          return amount / maxAmount;
        }
      };
    })()
  });

  root.include(behaviors.root).fn('init');
});

/**
 * Wraps the filtered tag editor in the tags widget, and is a long-lived
 * singleton instance.
 */
wesabe.$class('wesabe.views.widgets.tags.FilteredTagsEditDialog', wesabe.views.widgets.Dialog, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _originalValue: null,
    _tagEditField: null,

    init: function(element, tagDataSource) {
      var me = this;

      $super.init.call(me, element);

      me._tagEditField = new wesabe.views.widgets.tags.TagAutocompleterField(
       element.find('input[name=filter-tags]'),
       tagDataSource
      );

      // read the original value from the input element
      me._originalValue = me.get('value');
    },

    /**
     * Shows this dialog and focuses the filtered tags field.
     */
    show: function() {
      var field = this._tagEditField;
      $super.show.call(this, function() {
        field.selectAllAndFocus();
      });
    },

    /**
     * Hides this dialog and resets the value of the filtered tags input.
     */
    hide: function() {
      var me = this;
      $super.hide.call(this, function(){ me.resetValue() });
    },

    /**
     * Gets the text value of the filtered tags field.
     *
     * @return {string}
     */
    value: function() {
      return this._tagEditField.get('value');
    },

    /**
     * Sets the text value of the filtered tags field.
     *
     * @param {!string}
     */
    setValue: function(value) {
      this._tagEditField.set('value', value);
    },

    /**
     * Resets the value of the filtered tags input element to what it was
     * before the user edited it.
     */
    resetValue: function() {
      this.set('value', this._originalValue);
    },

    onConfirm: function() {
      var me = this;

      $.ajax({
        url: '/user/edit_filter_tags',
        type: 'POST',
        data: {filter_tags: me.get('value')},
        dataType: 'json',
        success: function(data, textStatus) {
          me._originalValue = data.join(' ');
          me.hide();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert("Sorry, there was an error changing your filtered tags.");
        }
      });
    }
  });
});

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

      this.name = name;
      this.set('uri', '/tags/'+encodeURI(name));
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
      return [{name: 'tag', value: this.get('uri')}];
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

/**
 * Wraps an input field and applies a YUI autocompleter to autocomplete tags.
 */
wesabe.$class('wesabe.views.widgets.tags.TagAutocompleterField', wesabe.views.widgets.AutocompleterField, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.number
  var number = wesabe.lang.number;

  $.extend($class.prototype, {
    _tagDataSource: null,

    /**
     * Gets the total amount avaialble to autocomplete with splits. If the
     * value is +null+, splits will not be autocompleted.
     *
     * @type {number}
     */
    splitAutocompletionTotal: null,

    init: function(element, tagDataSource) {
      $super.init.call(this, element);

      var me = this;
      me._tagDataSource = tagDataSource || wesabe.data.tags.sharedDataSource;
      me._tagDataSource.requestDataAndSubscribe({
        change: function() {
          me.onTagsChanged();
        }
      });
    },

    /**
     * Gets a wrapper element for the autocompleter.
     *
     * @return {jQuery}
     */
    wrapperElement: function() {
      return $super.wrapperElement.call(this)
        .addClass('tag-autocomplete');
    },

    /**
     * Called when the tag data has changed.
     */
    onTagsChanged: function() {
      this._refreshCompletions();
    },

    onKeyUp: function() {
      $super.onKeyUp.apply(this, arguments);

      // parse the tags entered already and remove them from the completions
      this._refreshCompletions();

      if (this._lastKeyPressKeyCode != 58 /* : (colon) */)
        return;

      var total = this.get('splitAutocompletionTotal');
      if (!total)
        return;

      total = Math.abs(total);
      var remainder = total,
          sel = this.get('element').caret(),
          value = this.get('value'),
          before = value.substring(0, sel.begin).replace(/\s*:$/, ':'), // remove any spaces between the colon and the amount
          after = value.substring(sel.end, value.length),
          taglist = wesabe.data.tags.parseTagString(this.get('value'));

      while (taglist.length) {
        var tag = taglist.shift();
        if (tag.amount) {
          // ensure percents are converted to absolute numbers before parsing the amount
          tag.amount = tag.amount.replace(/([\d\.]+%)/g, function(all, pct) {
            return number.parse(pct) * total;
          });
          remainder -= number.parse(tag.amount);
        }
      }

      remainder = Math.max(remainder, 0);
      remainder = Math.round(remainder * 100) / 100;
      remainder = (remainder == 0 || isNaN(remainder)) ? '' : remainder.toString();

      this.set('value', before+remainder+after);
      this.get('element').caret(before.length, before.length+remainder.length);
      this._lastKeyPressKeyCode = null;
    },

    /**
     * Refresh the list of available completions.
     *
     * @private
     */
    _refreshCompletions: function() {
      var allTags = this._tagDataSource.get('tagNames');
      var allTagNames = [];
      var enteredTags = wesabe.data.tags.parseTagString(this.get('value'));
      var enteredTagNames = [];

      for (var i = allTags.length; i--; ) {
        allTagNames.push(allTags[i].replace(/_/g," "));
      }

      for (var i = enteredTags.length; i--; ) {
        enteredTagNames.push(enteredTags[i].name);
      }

      this.set('completions', wesabe.lang.array.minus(allTagNames, enteredTagNames));
    }
  });
});

wesabe.$class('wesabe.views.widgets.tags.TagEditDialog', wesabe.views.widgets.Dialog, function($class, $super, $package) {
  $.extend($class.prototype, {
    _editPanel: null,
    _renamePanel: null,
    _deletePanel: null,
    _mergePanel: null,
    _panels: null,
    _currentPanel: null,
    _tagDataSource: null,

    init: function(element, tagDataSource) {
      var me = this;

      $super.init.call(me, element);
      me._tagDataSource = tagDataSource;
      me._editPanel   = new $package.TagEditDialogPromptPanel(element.find('.edit-panel'), me, me._tagDataSource);
      me._renamePanel = new $package.TagEditDialogPanel(element.find('.rename-panel'), me);
      me._mergePanel  = new $package.TagEditDialogPanel(element.find('.merge-panel'), me);
      me._deletePanel = new $package.TagEditDialogPanel(element.find('.delete-panel'), me);
      me._panels = [me._editPanel, me._renamePanel, me._deletePanel, me._mergePanel];

      me.registerChildWidgets.apply(me, me._panels);
    },

    onTagsChanged: function(tagEditDialogPromptPanel) {
      if (!tagEditDialogPromptPanel.get('tags').length) {
        this.set('buttonsDisabled', true);
      } else {
        this.set('buttonsDisabled', false);

        tagEditDialogPromptPanel.set('confirmButtonText',
          !tagEditDialogPromptPanel.isDirty() ? 'Save' :
                               this.isMerge() ? 'Merge…' :
                                                'Rename…');
      }
    },

    onBeginEdit: function(tagListItem) {
      var me = this;

      me._tagListItem = tagListItem;

      // set the initial visibility
      me._showPanel(me._editPanel);

      // Move to line up witht he tag's edit button
      me.get('element').css('top', tagListItem.get('element').offset().top-140)
      // show the edit dialog
      me.show(function() {
        // Focus on the input after fading in
        me._editPanel.set('visible', true);
      });

      var panels = me._panels,
          length = panels.length;

      while (length--)
        panels[length].onBeginEdit(tagListItem);
    },

    onEndEdit: function() {
      delete this._tagListItem;

      var panels = this._panels,
          length = panels.length;

      while (length--)
        panels[length].onEndEdit();
    },

    onDelete: function(senderPanel) {
      if (senderPanel === this._editPanel)
        this._animatePanel(this._deletePanel);
    },

    _showPanel: function(panel, animate) {
      if (panel === this._currentPanel)
        return;

      var panels = this._panels,
          length = panels.length;

      while (length--) {
        var p = panels[length];
        if (panel !== p) {
          animate ? p.animateVisible(false) : p.set('visible', false);
        } else {
          p.set('tags', this.get('tags'));
          this.set('buttonsDisabled', false);
          animate ? p.animateVisible(true) : p.set('visible', true);
        }
      }

      this._currentPanel = panel;
    },

    _animatePanel: function(panel) {
      this._showPanel(panel, true);
    },

    saveTag: function() {
      var me = this;

      $.ajax({
        type: 'PUT',
        url: me._tagListItem.get('uri'),
        data: { replacement_tags: me.get('tagString') },
        beforeSend: function () {
          me.set('buttonsDisabled', true);
        },
        success: function() {
          me._tagDataSource.requestData();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert("Tag could not be saved: " + XMLHttpRequest.responseText);
        },
        complete: function() { me.hide(); }
      });
    },

    destroyTag: function() {
      var me = this;

      $.ajax({
        type: 'DELETE',
        url: me._tagListItem.get('uri'),
        data: '_=', // NOTE: fixes a possible Rails bug (nil.attributes when doing DELETE)
        beforeSend: function () {
          me.set('buttonsDisabled', true);
        },
        success: function() {
          me._tagDataSource.requestData();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert("Tag could not be deleted: " + XMLHttpRequest.responseText);
        },
        complete: function() { me.hide(); }
      });
    },

    hide: function() {
      this.onEndEdit();
      $super.hide.apply(this, arguments);
    },

    /**
     * Called on enter by {Dialog} when this dialog is the first responder.
     */
    onConfirm: function() {
      var currentPanel = this._currentPanel;

      if (currentPanel === this._deletePanel) {
        this.destroyTag();
      } else if (currentPanel === this._editPanel) {
        if (!currentPanel.isDirty()) {
          this.hide();
        } else if (this.isMerge()) {
          this._animatePanel(this._mergePanel);
        } else {
          this._animatePanel(this._renamePanel);
        }
      } else {
        this.saveTag();
      }
    },

    /**
     * Called on escape by {Dialog} when this dialog is the first responder.
     */
    onCancel: function() {
      if (this._currentPanel !== this._editPanel) {
        this._animatePanel(this._editPanel);
      } else {
        this.hide();
      }
    },

    // Tag edit box helper functions

    isMerge: function() {
      if (!this.isDirty())
        return false;

      var newTags = this.get('tags'),
          newTagsLength = newTags.length,
          summaries = this._tagDataSource.get('data').summaries,
          summariesLength = summaries.length;

      // it's not a merge if there are no new tags
      if (!newTags.length) return false;

      // it's a merge if all new tags are in the old set
      for (var i = newTagsLength; i--; ) {
        var found = false;

        for (var j = summariesLength; j--; ) {
          if (summaries[j].tag.name == newTags[i].name) {
            found = true;
            break;
          }
        }

        if (!found) return false;
      }

      return true;
    },

    isDirty: function() {
      return this._editPanel.isDirty();
    },

    tags: function() {
      return this._editPanel.get('tags');
    },

    tagString: function() {
      return this._editPanel.get('tagString');
    }
  });
});

/**
 * Wraps a panel in the {TagEditDialog}.
 */
wesabe.$class('wesabe.views.widgets.tags.TagEditDialogPanel', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  $.extend($class.prototype, {
    enabled: true,

    _tags: null,
    _tagEditDialog: null,
    _confirmButton: null,
    _cancelButton: null,
    _tagNameLabel: null,
    _newTagsLabel: null,

    init: function(element, tagEditDialog) {
      $super.init.call(this, element);

      var me = this;

      me._tagEditDialog = tagEditDialog;

      me._confirmButton = new wesabe.views.widgets.Button(element.find('.confirm.button'));
      me._cancelButton = new wesabe.views.widgets.Button(element.find('.cancel.button'));

      me._tagNameLabel = element.find('.tag-name');
      me._newTagsLabel = element.find('.tag-name.new');
    },

    onBeginEdit: function(tagListItem) {
      this._tagNameLabel.text('“'+tagListItem.get('name')+'”');
    },

    onEndEdit: function() {
      // nothing to do
    },

    setEnabled: function(enabled) {
      if (this.enabled === enabled)
        return;

      this.enabled = enabled;
      this._confirmButton.set('enabled', enabled);
    },

    animateVisible: function(visible, callback) {
      var me = this;

      if (visible !== me.get('visible'))
        me.get('element').slideToggle(function() {
          me.set('visible', visible);
          callback && callback();
        });
    },

    tags: function() {
      return this._tags;
    },

    setTags: function(newTags) {
      this._tags = newTags;

      if (this._newTagsLabel.length) {
        var newTagsString = "",
            length = newTags.length;

        for (var i = 0; i < length; i++) {
          newTagsString += '“'+newTags[i].name+'”';
          if (i < (newTags.length-2)) {
            newTagsString += ', ';
          } else if (i == (newTags.length-2)) {
            newTagsString += ' and ';
          }
        }

        this._newTagsLabel.text(newTagsString);
      }
    },

    setConfirmButtonText: function(text) {
      this._confirmButton.set('text', text);
    }
  });
});

/**
 * Panel that includes a text field to allow the user to rename/merge tags.
 */
wesabe.$class('wesabe.views.widgets.tags.TagEditDialogPromptPanel', wesabe.views.widgets.tags.TagEditDialogPanel, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.data.tags
  var tags = wesabe.data.tags;

  $.extend($class.prototype, {
    /**
     * Stores the original (unedited) version of the tag.
     *
     * @private
     */
    _originalTag: null,

    _deleteButton: null,
    _tagNameField: null,
    _tagDataSource: null,

    init: function(element, tagEditDialog, tagDataSource) {
      var me = this;

      $super.init.apply(me, arguments);
      me._tagEditDialog = tagEditDialog;
      me._tagDataSource = tagDataSource;

      // keep pressing enter from submitting the form that only exists to make the widget validate
      element.find('form').bind('submit', function(event){ event.preventDefault() });

      me._tagNameField = new $package.TagAutocompleterField(element.find('input[name=tag-name]'));
      me._deleteButton = element.find('.delete.button');
      me._deleteButton.click(function(){ me.onDelete() });
    },

    tags: function() {
      return tags.parseTagString(this.get('tagString'));
    },

    setTags: function(list) {
      $super.setTags.apply(this, arguments);
      this._tagNameField.set('value', tags.joinTags(list));
    },

    tagString: function() {
      return this._tagNameField.get('value');
    },

    onBeginEdit: function(tagListItem) {
      var me = this;

      // hang on to the original tag
      me.set('originalTag', {name: tagListItem.get('name')});

      // Editing "foo"
      me._tagNameLabel.text('“' + me.get('originalTag').name + '”');

      // watch for tag changes
      me._tagNameField.get('element').bind('keyup.tedpp', function(event){ me.onKeyUp(event) });

      // set the prompt value
      me.set('tags', [me.get('originalTag')]);
    },

    onEndEdit: function() {
      this._tagNameField.get('element').unbind('keyup.tedpp');
    },

    onKeyUp: function(event) {
      if (!tags.listsEqual(this._tags || [], this.get('tags')))
        this._tagEditDialog.onTagsChanged(this);
    },

    setEnabled: function(enabled) {
      if (this.get('enabled') === enabled)
        return;

      $super.setEnabled.call(this, enabled);
      this._deleteButton.set('enabled', enabled);
    },

    onDelete: function() {
      if (!this.get('enabled'))
        return;

      this._tagEditDialog.onDelete(this);
    },

    isDirty: function() {
      return !tags.listsEqual(this.get('tags'), [this.get('originalTag')]);
    },

    setVisible: function(visible) {
      var field = this._tagNameField;

      $super.setVisible.apply(this, arguments);
      setTimeout(function(){ visible ? field.focus() : field.blur() }, 50);
    },

    animateVisible: function(visible, callback) {
      var me = this;

      $super.animateVisible.call(me, visible, function() {
        me.set('visible', visible);
        callback && callback();
      });
    }
  });
});

/**
 * Wraps a <li class="group"> containing both the group name and balance
 * as well as the list of tags. Instances are managed by an
 * {TagGroupList} to which they delegate both selection and DOM event
 * handling.
 */
wesabe.$class('wesabe.views.widgets.tags.TagGroup', wesabe.views.widgets.BaseListWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;
  // import wesabe.data.preferences as prefs
  var prefs = wesabe.data.preferences;

  $.extend($class.prototype, {
    /**
     * URI for this {TagGroup} (e.g. "/account-groups/checking").
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
     * The short url-friendly name for this {TagGroup} (e.g. "credit").
     *
     * @type {string}
     */
    key: null,

    _template: null,
    _nameElement: null,
    _tagGroupList: null,
    _total: null,
    _expanded: false,
    _editMode: false,
    _wasExpanded: null,
    _items: null,

    init: function(element, tagGroupList) {
      $super.init.call(this, element);

      this._tagGroupList = tagGroupList;
      // extract the tag template
      var template = element.children('ul').children('li.tag.template');
      this._template = template.clone().removeClass('template');
      template.remove();

      // get name and total
      var header = element.children(':header');
      this._total = new wesabe.views.widgets.MoneyLabel(header.find('span.total'));
      this.registerChildWidget(this._total);
      this._nameElement = header.find('span.text-content');

      // get the tag list element
      this.setListElement(element.children('ul'));
    },

    /**
     * Sets the name of this {tagGroup} and updates the text, but does not
     * update the name on the server.
     */
    setName: function(name) {
      if (this.name === name)
        return;

      this.name = name;
      this._nameElement.text(name);
    },

    /**
     * Sets the short url-friendly name for this {TagGroup}. This determines
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
     * Gets the tag with the given {uri}, returning null if it's not found.
     *
     * @param {!string} uri The unique identifier for the tag to find.
     * @return {Tag}
     */
    getTagByURI: function(uri) {
      var items = this.get('items');

      for (var i = items.length; i--;) {
        var tag = items[i];
        if (tag.get('uri') === uri) return tag;
      }

      return null;
    },

    /**
     * Gets the URL parameters for this {TagGroup}, which is the
     * collection of all the params of its children {Tag} instances.
     *
     * See {wesabe.views.pages.accounts#paramsForCurrentSelection}.
     */
    toParams: function() {
      var params = [],
          tags = this.get('items'),
          length = tags.length;

      while (length--)
        params = params.concat(tags[length].toParams());

      return params;
    },

    /**
     * Gets the currencies of all children {Tag} instances.
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
     * Returns the {wesabe.util.Selection} associated with this {TagGroup}.
     */
    getSelection: function() {
      return this._tagGroupList.get('selection');
    },

    /**
     * Gets the {CredentialDataSource} used to populate this {TagGroup}.
     */
    credentialDataSource: function() {
      return this._tagGroupList.get('credentialDataSource');
    },

    /**
     * Handle clicks on this {TagGroup} and its descendants, delegating
     * to a child {Tag} if necessary.
     *
     * NOTE: There is no accompanying bind statement because this widget uses
     * event delegation for the entire list of tags,
     * see {TagWidget#onClick}.
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
      var tagElement = target.parents('.tag');
      if (tagElement.length) {
        var tag = this.getItemByElement(tagElement);
        if (tag)
          tag.onClick(event);
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
     * Called when the user chooses to start editing {tag}.
     */
    onBeginEdit: function(tag) {
      if (this._tagGroupList)
        this._tagGroupList.onBeginEdit(tag);
    },

    /**
     * Sets whether this {TagGroup} is currently in edit mode
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
     * Returns a boolean indicating whether this {TagGroup} is expanded.
     */
    isExpanded: function() {
      return this._expanded;
    },

    /**
     * Sets the expansion state of this {TagGroup} immediately, as
     * opposed to the gradual animation provided by {#animateExpanded}.
     *
     * If the value of {expanded} is the same as the current expansion
     * state, this function has no effect.
     *
     * This does not update the user's preferences for this {TagGroup}'s
     * expansion state.
     */
    setExpanded: function(expanded) {
      this.animateExpanded(expanded, 0);
    },

    /**
     * Sets the expansion state of this {TagGroup} gradually using a
     * sliding animation, as opposed to the immediate expansion provided by
     * {#setExpanded}.
     *
     * If the value of {expanded} is the same as the current expansion
     * state, this function has no effect.
     *
     * This does not update the user's preferences for this {TagGroup}'s
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
     * Updates the DOM for this {TagGroup} with new data.
     */
    update: function(tagGroup) {
      this.setName(tagGroup[0].group.name);
      this._total.setMoney(tagGroup.total);
      this.set('uri', tagGroup.uri);
      this.set('key', tagGroup.key);

      var tags = tagGroup,
          length = tags.length,
          items = [];

      while (length--) {
        var tagDatum = tags[length],
            item = this.getItemByURI(tagDatum.uri);

        if (!item) {
          item = new $package.Tag(this._template.clone(), this);
          //item.setEditMode(this._editMode);
        }

        items[length] = item;

        item.update(tagDatum);
      }

      this.setItems(items);
      //if (!this._editMode)
      //  this._restorePreferences();
    },

    /**
     * Updates the upload statuses for the child {Tags} items.
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
    updatingTags: function() {
      var items = this.get('items'),
          length = items.length;

      while (length--)
        if (items[length].isUpdating())
          return true;

      return false;
    },

    /**
     * Store the current state of this {TagGroup} with the
     * preferences service.
     *
     * @private
     */
    _persistPreferences: function() {
      prefs.update(this._fullPrefKey('expanded'), this.isExpanded());
    },

    /**
     * Reload the state of this {TagGroup} from the preference service.
     *
     * @private
     */
    _restorePreferences: function() {
      this.setExpanded(prefs.get(this._fullPrefKey('expanded')));
    },

    _fullPrefKey: function(shortKey) {
      return 'tags.groups.' + this.key + '.' + shortKey;
    }
  });
});

/**
 * Wraps the <ul class="tag-groups"> inside the {TagWidget}. Manages
 * the selection for the {TagWidget} and all descendants.
 *
 * NOTE: This is intended to be a long-lived singleton and therefore does not
 * have any sort of cleanup function.
 */
wesabe.$class('wesabe.views.widgets.tags.TagGroupList', wesabe.views.widgets.BaseListWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;

  $.extend($class.prototype, {
    editMode: false,

    /**
     * Returns the {wesabe.util.Selection} associated with this
     * {TagGroupList}.
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

      // register a delegating click handler
      this.set('selection', new wesabe.util.Selection());
    },

    /**
     * Refreshes the {TagGroup} children with the new data.
     */
    update: function(tags) {
      var length = tags.length,
          groupname,
          items = [],
          tagGroups = {};
      
      tagGroups.groups = new Object; 
      while (length--) {
        var tagGroupDatum = tags[length];
        TagGroupitem = this.getItemByURI(tagGroupDatum.uri);
        var this_tag = tags[length];
        //console.log(this_tag);
        //if (this_tag.group != undefined) {
          groupname = this_tag.group.name;
          if (groupname == "Bank Accounts (Auto)" || groupname == "Credit Cards (Auto)") continue;
          var group_count = 0;
          if (!tagGroups.groups[groupname]) {
            tagGroups.groups[groupname] = new Array;
            group_count++;
          } 
            tagGroups.groups[groupname].push(tagGroupDatum);
        //}
      }
      
      for (var key in tagGroups.groups) {

        //if (!TagGroupitem) {
          TagGroupitem = new $package.TagGroup(this._template.clone(), this);
          TagGroupitem.set('editMode', this.editMode);
        //}

        items.push(TagGroupitem);
        TagGroupitem.update(tagGroups.groups[key]);
      }
      this.set('items', items);
    }

  });
});

/**
 * Wraps the <ul> of tags, manages {TagListItem} instances, and handles most
 * DOM events for them (google "event delegation").
 *
 * NOTE: This is intended to be a long-lived singleton and therefore does not
 * have any sort of cleanup function.
 */
wesabe.$class('wesabe.views.widgets.tags.TagList', wesabe.views.widgets.BaseListWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;

  $.extend($class.prototype, {
    /**
     * The selection used by this tag list.
     *
     * @type {wesabe.util.Selection}
     */
    selection: null,

    /**
     * The current style (i.e. either "cloud" or "list").
     *
     * @type {String}
     */
    style: null,

    _editDialog: null,
    _template: null,

    init: function(element, selection, editDialog) {
      $super.init.call(this, element);

      var me = this;

      me.selection = selection;
      me._editDialog = editDialog;
      // extract the template element
      var template = me.get('element').children('li.template');
      me._template = template.clone().removeClass('template');
      template.remove();

      // register a delegating click handler
      me.get('element').click(function(event){ me.onClick(event) });

      // use zebra striping
      me.set('stripingEnabled', true);
    },

    /**
     * NOTE: This does not update the user's preferences.
     */
    setStyle: function(newStyle) {
      if (this.style === newStyle)
        return;

      var oldStyle = this.style;
      this.style = newStyle;
      this.onStyleChanged(newStyle, oldStyle);
    },

    /**
     * Handles changes to the current style of this {TagList}.
     */
    onStyleChanged: function(newStyle, oldStyle) {
      this.get('element').addClass(newStyle)
      if (oldStyle) this.get('element').removeClass(oldStyle);

      if (newStyle === 'list') {
        this.get('element').add(this.get('element').parent())
          .removeClass('one-col-list-off')
          .addClass('one-col-list');
      } else {
        this.get('element').add(this.get('element').parent())
          .removeClass('one-col-list')
          .addClass('one-col-list-off');
      }

      var items = this.get('items'),
          length = items.length;

      while (length--)
        items[length].onStyleChanged(newStyle, oldStyle);
    },

    /**
     * Handles click events for both the {TagList} and its {TagListItem} children.
     * This is the event delegation pattern [1] and is a performance optimization
     * intended to reduce the number of click handlers from one per tag to one total.
     *
     * [1] http://www.sitepoint.com/blogs/2008/07/23/javascript-event-delegation-is-easier-than-you-think/
     */
    onClick: function(event) {
      // get the {TagListItem} that is really the target of this click event
      var tagListItem = this._getTagListItemForElement(event.target);

      // bail if somehow we couldn't find a {TagListItem} for the target
      if (!tagListItem)
        return;

      tagListItem.onClick(event);
    },

    /**
     * Called when the user chooses to edit a specific tag.
     */
    onBeginEdit: function(tagListItem) {
      this._editDialog.onBeginEdit(tagListItem);
    },

    /**
     * Gets the {TagListItem} that contains the given element, returning null
     * if no such {TagListItem} can be found.
     */
    _getTagListItemForElement: function(element) {
      var items = this.get('items'),
          length = items.length;

      element = $(element);
      while (element.length && !element.is('.tag'))
        element = element.parent();

      if (!element.length)
        return null;

      while (length--)
        if ($.same(items[length].get('element'), element))
          return items[length];

      return null;
    },

    /**
     * Toggles selected status for the given {TagListItem}.
     */
    toggleListItemSelection: function(tagListItem) {
      this.get('selection').toggle(tagListItem);
    },

    /**
     * Selects the given {TagListItem}.
     */
    selectListItem: function(tagListItem) {
      this.get('selection').set(tagListItem);
    },

    /**
     * Updates the DOM to reflect the given tag data.
     */
    update: function(summaries) {
      var length = summaries.length,
          items = [];

      while (length--) {
        var summary = summaries[length],
            item = this.getItemByName(summary.tag.name);

        if (!item)
          item = new $package.TagListItem(this._template.clone(), this);

        items[length] = item;
        item.update(summary);
      }

      this.set('items', items);
    },

    /**
     * Gets the {TagListItem} associated with the given name, returning null
     * if no such {TagListItem} is found.
     */
    getItemByName: function(name) {
      var items = this.get('items'),
          length = items.length;

      while (length--)
        if (items[length].get('name') === name) return items[length];

      return null;
    }
  });
});

/**
 * Wraps a <li class="tag"> representing a tag in the tag widget. Instances
 * are managed by a {TagList} to which they delegate both selection and DOM
 * event handling.
 */
wesabe.$class('wesabe.views.widgets.tags.TagListItem', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  $.extend($class.prototype, {
    /**
     * Name of the tag (e.g. "food").
     */
    name: null,

    /**
     * URI for the tag (e.g. "/tags/food").
     *
     * See {wesabe.views.pages.accounts#storeState}.
     */
    uri: null,

    _tagList: null,
    _summary: null,
    _percent: null,
    _count: null,
    _nameElement: null,
    _countElement: null,

    init: function(element, tagList) {
      $super.init.call(this, element);
      this._tagList = tagList;
      this._nameElement = element.children('a.text-content');
      this._countElement = element.children('.count');

      // NOTE: Looking for a click handler binding?
      // See #onClick and TagList#onClick for an explanation of why it's not here.
    },

    /**
     * Handles changes to the current style of this {TagListItem}.
     */
    onStyleChanged: function(newStyle, oldStyle) {
      var size, display;

      if (newStyle == 'cloud') {
        size = ((95 + 120 * this._percent) + '%');
        display = 'inline';
      } else {
        size = '';
        display = 'block';
      }

      this.get('element').css('display', display);
      this._nameElement.css('font-size', size);
    },

    /**
     * Handles clicks for this {TagListItem}'s element, but is called
     * by the parent {TagList} since using event delegation means it
     * has the DOM event handler instead.
     *
     * See {TagList#onClick}.
     */
    onClick: function(event) {
      event.preventDefault();

      if ($(event.target).is('.edit-button')) {
        // clicked an edit pencil, start editing the tag
        this._tagList.onBeginEdit(this);
      } else if (event.metaKey || event.ctrlKey) {
        // cmd/ctrl+click to toggle the selection of the tag
        this._tagList.toggleListItemSelection(this);
      } else {
        // just clicked on the tag, so select it
        this.select();
      }
    },

    /**
     * Called by {wesabe.util.Selection} instances when this object
     * becomes part of the current selection.
     */
    onSelect: function() {
      if (this.get('element'))
        this.get('element').addClass('on');
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
     * Update the display for this {TagListItem} based on new data.
     */
    update: function(summary) {
      this.set('name', summary.tag.name);
      //this.set('percent', summary.percent);
      //this.set('count', summary.net.count);
    },

    /**
     * Sets the name of the tag and updates the label.
     */
    setName: function(name) {
      if (this.name === name)
        return;

      this.name = name;
      this.set('uri', '/tags/'+name);
      this._nameElement.text(name)
        .attr('href', '#'+this.uri);
    },

    /**
     * Sets the percent (size) of this tag list item.
     *
     * @private
     */
    _setPercent: function(percent) {
      if (this._percent === percent)
        return;

      this._percent = percent;
      this.onStyleChanged(this._tagList.get('style'));
    },

    /**
     * Sets the transaction count for this tag list item.
     *
     * @private
     */
    _setCount: function(count) {
      if (this._count === count)
        return;

      this._count = count;
      this._countElement.text(count);
    },

    /**
     * Gets the URL parameters for this {TagListItem}.
     *
     * See {wesabe.views.pages.accounts#paramsForCurrentSelection}.
     */
    toParams: function() {
      return [{name: 'tag', value: this.get('uri')}];
    },

    /**
     * Selects this {TagListItem}.
     */
    select: function() {
      this._tagList.selectListItem(this);
    }
  });
});

/**
 * Wraps the <div id="tags"> element containing the list of tags on the page.
 * Manages a {TagList} and handles toggling edit mode. Tag selection is
 * handled by the {TagList}.
 *
 * NOTE: This is intended to be a long-lived singleton and therefore does not
 * have any sort of cleanup function.
 */
wesabe.$class('wesabe.views.widgets.tags.TagWidget', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.data.preferences as prefs
  var prefs = wesabe.data.preferences
  // import wesabe.lang.array
  var array = wesabe.lang.array
  // import wesabe.lang.number
  var number = wesabe.lang.number

  $.extend($class.prototype, {
    /**
     * The current style (i.e. either "cloud" or "list").
     */
    style: null,

    /**
     * The child {TagList} of this widget.
     */
    tagList: null,

    /**
    *      * Gets the {AccountGroupList} wrapping the <ul class="account-groups">.
    *           */
    tagGroupList: null,


    _noTagsLabel: null,
    _tagDataSource: null,
    _styleButtons: null,
    _editButton: null,
    _doneButton: null,
    _hasDoneInitialLoad: false,

    init: function(element, tagDataSource) {
      var me = this;

      $super.init.call(me, element);
      me._tagDataSource = tagDataSource;

      me._styleButtons = element.find('.module-header .cloud.toggle, .module-header .list.toggle');
      me._styleButtons.click(function(event){ me.onStyleButtonClick(event) });

      var filteredTagsEditDialog = new wesabe.views.widgets.tags.FilteredTagsEditDialog($('#filter-tags-edit .hover-box'), wesabe.data.tags.sharedDataSource);
      me._filteredTagsButton = element.find("#filtered-tags-button").click(function(){filteredTagsEditDialog.toggle();});

      me._editButton = element.find(".module-header .edit-tags");
      me._editButton.click(function(){ me.set('editModeEnabled', true) });

      me._doneButton = element.find(".module-header .done-tags");
      me._doneButton.click(function(){ me.set('editModeEnabled', false) });

      //me.set('tagList', new $package.TagList(element.find('.content ul.tags'), new wesabe.util.Selection(), me.get('editDialog')));
      //me.registerChildWidget(me.get('tagList'));

      me._noTagsLabel = new wesabe.views.widgets.Label(element.find('.no-tags-label'));
      //me.registerChildWidget(me._noTagsLabel);


      // set up DOM event handlers
      element.click(function(event){ me.onClick(event) });
      
      me.tagGroupList = new $package.TagGroupList(element.find('ul.tag-groups'), me);
      me.registerChildWidgets(me._noTagsLabel, me.tagGroupList);

      me._tagDataSource.requestDataAndSubscribe({
        change: function(tags) {
          me.onTagsChanged(tags);
        },

        error: function() {
          me.onTagsError();
        }
      });
      //me._restoreStyleFromPrefs();
    },

    /**
     * Returns a boolean indicating whether this widget has done at least
     * one painting of the tags.
     */
    hasDoneInitialLoad: function() {
      return this._hasDoneInitialLoad;
    },


    /**
     * Returns the {wesabe.util.Selection} associated with this {TagWidget}.
     */
    selection: function() {
      return this.tagGroupList.get('selection');
    },

    /**
     * Sets the {wesabe.util.Selection} associated with this {TagWidget}.
     */
    setSelection: function(selection) {
      this.tagGroupList.set('selection', selection);
    },


    /**
     * NOTE: This does not update the user's preferences.
     */
    setStyle: function(newStyle) {
      var oldStyle = this.style;
      if (newStyle === oldStyle)
        return;

      this.style = newStyle;
      this.onStyleChanged(newStyle, oldStyle);
    },

    /**
     * Returns a list of objects that may be selected in this {TagWidget}.
     *
     * See {wesabe.views.pages.accounts#reloadState}.
     */
    selectableObjects: function() {
      if (!this._selectableObjects) {
        var groups = this.get('tagGroupList').get('items'),
            length = groups.length,
            objects = $.makeArray(groups);

        while (length--)
          objects = objects.concat(groups[length].get('items'));

        this._selectableObjects = objects;
      }

      return this._selectableObjects;
    },

    /**
     * Handles clicks on the "cloud" and "list" style buttons.
     *
     * Since this is a direct result of user action, this function does
     * update the user's preferences.
     */
    onStyleButtonClick: function(event) {
      var style = $(event.target).is('.list') ? 'list' : 'cloud';
      prefs.update('tag_cloud', (style == 'cloud'));
      this.set('style', style);
    },

    /**
     * Handles clicks for this {TagWidget} and its descendants, delegating
     * to a child {TagGroup} if necessary.
     */
    onClick: function(event) {
      var element = $(event.target),
          groupElement = element.parents('.group');

      if (groupElement.length) {
        var group = this.get('tagGroupList').getItemByElement(groupElement);
        if (group)
          group.onClick(event);
        return;
      }
    },

    /**
     * Restores the current style to whatever the user's preferences indicate.
     *
     * @private
     */
    _restoreStyleFromPrefs: function () {
      this.set('style', prefs.get('tag_cloud') ? 'cloud' : 'list');
    },

    /**
     * Handles changes to the current style of this {TagWidget}.
     */
    onStyleChanged: function(newStyle, oldStyle) {
      this._styleButtons.filter('.'+newStyle).addClass('on');
      this._styleButtons.filter(':not(.'+newStyle+')').removeClass('on');
      this.setPath('tagList.style', newStyle);
    },

    /**
     * Ensures that the tag data is loaded from the server.
     */
    loadData: function() {
      this._tagDataSource.requestDataUnlessHasData();
    },

    /**
     * Handles changes to the underlying tag data.
     */
    onTagsChanged: function(data) {
      //this.update(data);
      this.updateTagListing(data);
      //this.onStyleChanged(this.get('style'));
      this._hasDoneInitialLoad = true;
      this.trigger('loaded');
    },

    /**
     * Handles errors while loading the tag data.
     */
    onTagsError: function() {
      wesabe.error("Something went wrong loading your tags. Sorry.");
    },

    /**
     * Updates the DOM using the new tag data.
     */
    update: function(data) {
      this._noTagsLabel.set('visible', data.summaries.length == 0);

      // do some preprocessing to sort the data and generate useful stats
      data.summaries = array.caseInsensitiveSort(data.summaries,
        function(summary){ return summary.tag.name });

      var maxSpent = 0, maxEarned = 0;
      var maxSpentCount = 0, maxEarnedCount = 0;

      $.each(data.summaries, function(i, s) {
        s.spending.value = number.parse(s.spending.value);
        s.earnings.value = number.parse(s.earnings.value);
        s.net.value      = number.parse(s.net.value);

        if (s.spending.value > maxSpent) maxSpent = s.spending.value;
        if (s.earnings.value > maxEarned) maxEarned = s.earnings.value;
        if (s.spending.count > maxSpentCount) maxSpentCount = s.spending.count;
        if (s.earnings.count > maxEarnedCount) maxEarnedCount = s.earnings.count;
      });

      $.each(data.summaries, function(i, s) {
        if (s.net.value > 0) {
          s.percent = 0.75 * (s.net.value / maxEarned + s.net.count / maxEarnedCount) / 2;
        } else {
          s.percent = (-s.net.value / maxSpent + s.net.count / maxSpentCount) / 2;
        }
      });

      this.get('tagList').update(data.summaries);
    },

    /**
     * Lazy-load the {TagEditDialog} for this tag list since editing is so rare.
     */
    editDialog: function() {
      if (!this._editDialog)
        this._editDialog = new $package.TagEditDialog(this.get('element').children('.edit-dialog'), this._tagDataSource);

      return this._editDialog;
    },

    selectTag: function(tagURI) {
      // REVIEW: totally unsure if this should be in tagList or not
      var tagListItems = this.getPath('tagList.items'),
          length = tagListItems.length;

      while (length--) {
        if (tagListItems[length].get('uri') == tagURI) {
          tagListItems[length].select();
          break;
        }
      }
    },

    /**
     * Update the listing of accounts only, not the update status.
     */
    updateTagListing: function(data) {
      this.get('tagGroupList').update(data['summaries']);
    },

    /**
     * Enables or disables edit mode.
     */
    setEditModeEnabled: function(enabled) {
      if (enabled) {
        this.set('style', 'list');
        this.get('element').addClass("editing");
      } else {
        this.get('editDialog').hide();
        this._restoreStyleFromPrefs();
        this.get('element').removeClass("editing");
      }
    }
  });
});

jQuery(function($) {
  var widget = wesabe.provide('views.widgets.tags.__instance__', new wesabe.views.widgets.tags.TagWidget($('#tags'), wesabe.data.tags.sharedDataSource));
  widget.loadData();
});

(function($) {
  var string = wesabe.lang.string;
  var date = wesabe.lang.date;

  function DateRangePicker(trigger, options) {
    this.options = {
      dialog: "#date-range-dialog", // dialog element
      startDateInput: "input[name='start-date']",
      endDateInput: "input[name='end-date']",
      saveButton: ".save",
      cancelButton: ".cancel",
      startDateError: ".start-date-error",
      endDateError: ".end-date-error",
      error: {
        noStartDate: "Please enter a starting date",
        noEndDate: "Please enter an ending date",
        invalidStartDate: "The starting date is not in a valid format",
        invalidEndDate: "The ending date is not in a valid format"
      },
      onInit: function() {},
      onShow: function() {},
      onSave: function() {},
      onCancel: function() { $("form", this.dialog).reset();},
      onError: function() {},
      changeMonth: true,
      changeYear: true,
      validateDates: true,
      allowBlankDates: false
    };
    $.extend(this.options, options || {});

    this.onInit = this.options.onInit;
    this.onShow = this.options.onShow;
    this.onSave = this.options.onSave;
    this.onCancel = this.options.onCancel;
    this.onError = this.options.onError;

    this.trigger = trigger;
    return this.init();
  }

  $.extend(DateRangePicker.prototype, {
    init: function() {
      var self = this;

      self.dialog = $(self.options.dialog);

      // bind the date pickers
      self.startDateInput().datepicker(self.options)
        .siblings('.ui-datepicker-trigger')
          .addClass('calendar');

      self.endDateInput().datepicker(self.options)
          .siblings('.ui-datepicker-trigger')
            .addClass('calendar');

      $(self.options.saveButton, self.dialog).click(function() { self.save(); });
      $(self.options.cancelButton, self.dialog).click(function() { self.cancel(); });

      self.trigger.click(function() {
        self.toggle();
      });

      self.onInit();

      return self;
    },

    startDateInput: function() {
      return $(this.options.startDateInput, this.dialog);
    },

    endDateInput: function() {
      return $(this.options.endDateInput, this.dialog);
    },

    startDateError: function(msg) {
      if (msg === undefined)
        return $(this.options.startDateError, this.dialog);
      else
        $(this.options.startDateError, this.dialog).text(msg);
    },

    endDateError: function(msg) {
      if (msg === undefined)
        return $(this.options.endDateError, this.dialog);
      else
        $(this.options.endDateError, this.dialog).text(msg);
    },

    startDate: function(value) {
      return this.getSetDate(this.startDateInput(), value);
    },

    endDate: function(value) {
      return this.getSetDate(this.endDateInput(), value);
    },

    clearDates: function() {
      this.startDate('');
      this.endDate('');
    },

    isStartDateBlank: function() {
      return string.blank(this.startDateInput().val());
    },

    isEndDateBlank: function() {
      return string.blank(this.endDateInput().val());
    },

    getSetDate: function(input, value) {
      if (value === undefined) {
        if (string.blank(input.val()))
          return null;
        else
          return date.parse(input.val());
      } else {
        var d = typeof value == "string" ? value : $.datepicker.formatDate($.datepicker._defaults.dateFormat, value);
        return input.val(d);
      }
    },

    save: function() {
      var errors = {};
      var startDate = this.startDate();
      var endDate = this.endDate();
      if (this.options.validateDates) {
        if (!this.options.allowBlankDates) {
          if (this.isStartDateBlank())
            errors.startDate = this.options.error.noStartDate;
          if (this.isEndDateBlank())
            errors.endDate = this.options.error.noEndDate;
        }

        if (!errors.startDate && !this.isStartDateBlank() && !startDate)
          errors.startDate = this.options.error.invalidStartDate;
        if (!errors.endDate && !this.isEndDateBlank() && !endDate)
          errors.endDate = this.options.error.invalidEndDate;

        this.startDateError().hide();
        this.endDateError().hide();
        if (errors.startDate) {
          this.startDateError(errors.startDate);
          this.startDateError().show();
        }
        if (errors.endDate) {
          this.endDateError(errors.endDate);
          this.endDateError().show();
        }
        if (errors.startDate || errors.endDate) {
          this.onError();
          return;
        }
      }
      // silently reverse the dates if they're in the wrong order
      if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
        this.startDate(endDate);
        this.endDate(startDate);
      }
      this.onSave();
      return this.hide();
    },

    cancel: function() {
      this.onCancel();
      return this.hide();
    },

    show: function() {
      this.onShow();
      return this.dialog.show();
    },

    hide: function() {
      this.startDateError().hide();
      this.endDateError().hide();
      this.startDateInput().datepicker("hide", "fast");
      this.endDateInput().datepicker("hide", "fast");
      return this.dialog.hide();
    },

    toggle: function() {
      return this.dialog.is(":visible") ? this.hide() : this.show();
    }
  });

  $.fn.dateRangePicker = function(options) {
    return this.each(function() {
      var dateRangePicker = new DateRangePicker($(this), options);
      $(this).fn({ dateRangePicker: function() { return dateRangePicker; } });
    });
  };

})(jQuery);