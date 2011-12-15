/**
 * CLASS DESCRIPTION
 */
wesabe.$class('wesabe.views.widgets.transactions.Transaction', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.number
  var number = wesabe.lang.number;

  $.extend($class.prototype, {
    /**
     * URI of this transaction if it has one.
     */
    uri: null,

    _noteContainerElement: null,
    _noteLabel: null,

    _checkNumberLabel: null,

    _balanceLabel: null,
    _amountLabel: null,
    _dateLabel: null,
    _accountLabel: null,

    _tags: undefined,
    _tagLinkList: null,

    _unedited: undefined,
    _merchant: undefined,
    _merchantLink: null,
    _merchantInfoElement: null,

    _account: undefined,
    _accountLink: null,

    _transfer: undefined,
    _transferContainerElement: null,
    _transferHoverBoxElement: null,
    _transferThisAccountLink: null,
    _transferOtherAccountLink: null,
    _transferFromOtherConjunctionLabel: null,
    _transferToOtherConjunctionLabel: null,

    init: function(element) {
      $super.init.call(this, element);
      var me = this;

      this._tagDataSource = wesabe.data.tags.sharedDataSource;
      this._noteContainerElement = element.find('.notes');
      this._noteLabel = new wesabe.views.widgets.Label(this._noteContainerElement.find('.text-content'));
      this.registerChildWidget(this._noteLabel);

      this._checkNumberLabel = new wesabe.views.widgets.Label(element.find('.check-number'), {
                                 format: function(c) {
                                   return c ? (' — Check #'+c) : '';
                                 }
                               });
      this.registerChildWidget(this._checkNumberLabel);

      this._balanceLabel = new wesabe.views.widgets.MoneyLabel(element.find('.balance'));
      this._amountLabel = new wesabe.views.widgets.MoneyLabel(element.find('.amount'));
      this._amountLabel.setShowSignum(false);
      this._amountLabel.setAmountClassesEnabled(true);
      this.registerChildWidgets(this._balanceLabel, this._amountLabel);

      this._dateLabel = new wesabe.views.widgets.Label(element.find('.transaction-date'), {
        format: function(date) {
          if (date) {
            return wesabe.lang.date.format(date, 'M/d/yyyy');
          }
        }
      });
      this.registerChildWidget(this._dateLabel);

      this._accountLabel = new wesabe.views.widgets.HistoryLink(element.find('.account-name'), null, {
        format: function(account) {
          return account && account.name;
        }
      });
      this.registerChildWidget(this._accountLabel);

      //this._tagLinkList = new wesabe.views.widgets.transactions.TagLinkList(element.find('.merchant-tags'));
      //this.registerChildWidget(this._tagLinkList);

      this._merchantLink = new wesabe.views.widgets.HistoryLink(element.find('.merchant-name .text-content'));
      this._merchantInfoElement = element.find('.merchant-info');

      this._catElement = element.find('select.combobox');
      this._catElement.bind('comboboxselected', function(event, info) {
        var item = info.item,
            tagName = item.value,
            tags = me.getTags(),
            combobox = me._catElement.data('combobox');

        if (tags.length == 0)
          tags.push({});

        var url = $.url('');
        var tagFilter = "";
        if (url.segment(3) == "tags") {
            tagFilter = url.segment(4).toLowerCase();
        } else {
            tagFilter = "linked_account";
        }
        for (x = 0; x < tags.length; x++) {
            if (tagFilter == "linked_account") {
                if (tags[x].name.toLowerCase() !== "checking" && tags[x].name.toLowerCase() !== "credit card") tags[x].name = tagName;
            } else {
                if (tags[x].name.toLowerCase() !== tagFilter.replace(/_/g, " ")) tags[x].name = tagName;
            }
        }


        combobox.setBusy(true);
        $.ajax({
          type: 'PUT',
          url: me.uri,
          data: {
            tags: wesabe.data.tags.joinTags(tags),
            authenticity_token: $('input[name=authenticity_token]').val()
          },
          complete: function() {
            combobox.setBusy(false);
          }
        });
      });
      this._transferContainerElement = element.find('.transfer');
      this._transferHoverBoxElement = this._transferContainerElement.find('.hover-box');
      this._transferThisAccountLink = new wesabe.views.widgets.HistoryLink(this._transferContainerElement.find('.this-account'));
      this._transferOtherAccountLink = new wesabe.views.widgets.HistoryLink(this._transferContainerElement.find('.other-account'));
      this._transferFromOtherConjunctionLabel = new wesabe.views.widgets.Label(this._transferContainerElement.find('.from'));
      this._transferToOtherConjunctionLabel = new wesabe.views.widgets.Label(this._transferContainerElement.find('.to'));
    },

    /**
     * Sets the uri of this transaction if it has one.
     *
     * @param {?String} uri
     */
    setURI: function(uri) {
      if (typeof uri == 'number' || !/^\/transactions\/(\d+)$/.test(uri))
        uri = '/transactions/'+uri;

      this.uri = uri;
    },

    /**
     * Gets the text value of the note label.
     *
     * @return {?string}
     */
    getNote: function() {
      return this._noteLabel.get('value');
    },

    /**
     * Sets the text value of the note label.
     *
     * @param {?string} note
     */
    setNote: function(note) {
      this._noteLabel.setValue(note);
      if (note && note.length > 0) {
        this._noteContainerElement.addClass('on notes-on');
      } else {
        this._noteContainerElement.removeClass('on notes-on');
      }
    },

    /**
     * Gets the list of tags shown under the merchant.
     *
     * @return {array}
     */
    getTags: function() {
      return this._tags || [];
    },

    /**
     * Sets the list of tags to show under the merchant.
     *
     * @param {array} tags
     */
    setTags: function(tags) {

        var url = $.url('');
        var selectedTagName = "";
        var tagFilter = "";
        if (url.segment(3) == "tags") {
            tagFilter = url.segment(4).toLowerCase();
        } else {
            tagFilter = "linked_account";
        }
        var x = 0;
        for (x = 0; x < tags.length; x++) {
            if (tagFilter == "linked_account") {
                if (tags[x].name.toLowerCase() !== "checking" && tags[x].name.toLowerCase() !== "credit card") selectedTagName = tags[x].name;
            } else {
                if (tags[x].name.toLowerCase() !== tagFilter.replace(/_/g, " ")) selectedTagName = tags[x].name;
            }
        }
        this._tags = tags;
        tagNames = this._tagDataSource.tagNames();
        this._catElement.empty();

        var select = this._catElement.get(0),
            selectedIndex = -1;
        var i = 0;
        for (i = 0; i < tagNames.length; i++) {
            var tagName = tagNames[i];

            if (selectedTagName.toLowerCase() === tagName.toLowerCase())
                selectedIndex = i;

            select.options.add(new Option(tagName.replace(/_/g, " "), tagName));
        }

        select.selectedIndex = selectedIndex;


        //this._tagLinkList.setTags(tags);
        this._catElement.combobox();
        //For some reason, we have to set the input.
        this._catElement.combobox('setValue',selectedTagName);
        //Disable the widget if this is a Checking or Credit Card account
        if (selectedTagName.indexOf("Checking") >= 0 || selectedTagName.indexOf("Credit Card") >= 0 ) {
            this._catElement.closest(".ui-widget").find("input, button" ).prop("disabled", true);
        }
    },

    /**
     * Gets the merchant data for this transaction.
     *
     * @return {object}
     */
    getMerchant: function() {
      return this._merchant;
    },

    /**
     * Sets the merchant data for this transaction.
     *
     * @param {object} merchant
     */
    setMerchant: function(merchant) {
      var unedited = !merchant || !merchant.name;

      this._merchant = merchant;
      this._merchantLink.setURI(unedited ? null : wesabe.views.shared.historyHash('/merchants/'+merchant.name));
      this._merchantLink.setText(merchant && (merchant.name || merchant.uneditedName));
      this.setUnedited(unedited);
    },

    /**
     * Gets the value of the date label.
     *
     * @return {date}
     */
    getDate: function() {
      return this._dateLabel.get('value');
    },

    /**
     * Sets the value of the date label.
     *
     * @param {date}
     */
    setDate: function(date) {
      this._dateLabel.setValue(date && wesabe.lang.date.parse(date));
    },

    /**
     * Gets the account associated with this transaction.
     *
     * @return {object}
     */
    getAccount: function() {
      return this._accountLabel.get('value');
    },

    /**
     * Sets the account associated with this transaction.
     *
     * @param {object} account
     */
    setAccount: function(account) {
      account = account && this._getAccountDataByURI(account.uri);
      this._account = account;
      this._accountLabel.set('value', account);
      this._accountLabel.set('uri', account && account.uri);
    },

    /**
     * Returns whether or not the account label is shown.
     *
     * @return {boolean}
     */
    accountVisible: function() {
      return this._accountLabel.get('visible');
    },

    /**
     * Sets whether or not to show the account link.
     *
     * @param {!boolean} visible
     */
    setAccountVisible: function(visible) {
      this._accountLabel.set('visible', visible);
    },

    /**
     * Gets the structured value of the balance label.
     *
     * @return {object}
     */
    balance: function() {
      return this._balanceLabel.get('money');
    },

    /**
     * Sets the text value of the balance label.
     *
     * @param {?string|object} balance
     */
    setBalance: function(balance) {
      this._balanceLabel.set('money', balance || {display: 'n/a'});
    },

    /**
     * Returns the check number for this transaction or null if there is none.
     *
     * @return {?string}
     */
    checkNumber: function() {
      return this._checkNumberLabel.get('value');
    },

    /**
     * Sets the check number for this transaction, if it has one.
     *
     * @param {?string} checkNumber
     */
    setCheckNumber: function(checkNumber) {
      this._checkNumberLabel.set('value', checkNumber);
    },

    /**
     * Sets the balance text to an arbitrary string.
     *
     * @param {string} text
     */
    setBalanceText: function(text) {
      this.setBalance({display: text});
    },

    /**
     * Gets the structured value of the amount label.
     *
     * @return {object}
     */
    getAmount: function() {
      return this._amountLabel.get('money');
    },

    /**
     * Sets the text value of the amount label.
     *
     * @param {?string|object} amount
     */
    setAmount: function(amount) {
      this._amountLabel.setMoney(amount);
    },

    /**
     * Returns whether this transaction is considered unedited.
     *
     * @return {boolean}
     */
    isUnedited: function() {
      return this._unedited;
    },

    /**
     * Sets whether this transaction is considered unedited.
     *
     * @param {boolean} unedited
     */
    setUnedited: function(unedited) {
      if (unedited === this._unedited) return;

      this._unedited = unedited;
      if (this._unedited) {
        this._merchantInfoElement.addClass('unedited');
        this.addClassName('unedited');
      } else {
        this._merchantInfoElement.removeClass('unedited');
        this.removeClassName('unedited');
      }
    },

    /**
     * Gets the transfer data for this transaction.
     *
     * @return {boolean|object}
     */
    getTransfer: function() {
      return this._transfer;
    },

    /**
     * Sets the transfer data for this transaction.
     *
     * @param {boolean|object}
     */
    setTransfer: function(transfer) {
      if (this._transfer === transfer) return;

      // TODO: move this to some sort of data wrapper for transactions
      if (transfer && transfer.amount)
        transfer.amount.value = number.parse(transfer.amount.value);

      this._transfer = transfer;

      if (!this.isTransfer()) {
        this._setTransferInfoVisible(false);
        this._transferContainerElement.removeClass('on transfer-on');
      } else if (!this.isPairedTransfer()) {
        this._setTransferInfoVisible(false);
        this._transferContainerElement.addClass('on transfer-on');
      } else {
        this._transferContainerElement.addClass('on transfer-on');

        var thisAccount = this.get('account'),
            otherAccount = transfer.account;

        thisAccount = thisAccount && this._getAccountDataByURI(thisAccount.uri);
        otherAccount = otherAccount && this._getAccountDataByURI(otherAccount.uri);

        if (!thisAccount || !otherAccount) {
          // one or both accounts are unavailable for some reason
          this._setTransferInfoVisible(false);
        } else {
          this._transferThisAccountLink.setText(thisAccount.name);
          this._transferThisAccountLink.setURI(thisAccount.uri);
          this._transferOtherAccountLink.setText(otherAccount.name);
          this._transferOtherAccountLink.setURI(otherAccount.uri);

          var isFromOther = transfer.amount.value < 0;
          this._transferFromOtherConjunctionLabel.setVisible(isFromOther);
          this._transferToOtherConjunctionLabel.setVisible(!isFromOther);

          this._setTransferInfoVisible(true);
        }
      }
    },

    /**
     * Returns whether or not this transaction is a transfer.
     *
     * @return {boolean}
     */
    isTransfer: function() {
      return !!this._transfer;
    },

    /**
     * Returns whether or not this transaction is a paired transfer.
     *
     * @return {boolean}
     */
    isPairedTransfer: function() {
      return this._transfer && (this._transfer !== true);
    },

    _getAccountDataByURI: function(uri) {
      return wesabe.data.accounts.sharedDataSource.getAccountDataByURI(uri);
    },

    _setTransferInfoVisible: function(visible) {
      if (visible) {
        // visible means "allow hover to make it display:block"
        this._transferHoverBoxElement.css('display', '');
        this._transferContainerElement.removeClass('solo');
      } else {
        // hidden means "set it to display:none so it won't show on hover"
        this._transferHoverBoxElement.css('display', 'none');
        this._transferContainerElement.addClass('solo');
      }
    }
  });
});
