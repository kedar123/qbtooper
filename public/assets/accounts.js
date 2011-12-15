(function() {
  var array = wesabe.lang.array;
  var number = wesabe.lang.number;
  var date = wesabe.lang.date;
  var shared = wesabe.views.shared;
  var preferences = wesabe.data.preferences;

  var TRANSACTIONS_PER_PAGE = 30;

  wesabe.provide('views.pages.accounts', function() {
    this.init();
  });

  wesabe.views.pages.accounts.prototype = {
    // Contains the current selection for the page.
    // @type wesabe.util.Selection
    selection: null,

    // The current search term in use, if any.
    search: null,

    // References the #accounts node wrapped in a jQuery object.
    accounts: null,

    // References the #account-transactions node wrapped in a jQuery object.
    transactions: null,

    // References the #tags node wrapped in a jQuery object.
    tags: null,

    // essentially, what page of transactions are we on?
    offset: null,
    limit: TRANSACTIONS_PER_PAGE,

    // what date range should we be showing transactions in?
    start: null,
    end: null,

    // are we showing only unedited transactions?
    unedited: false,

    // have the various page components been loaded yet?
    _hasLoadedAccounts: false,
    _hasLoadedTags: false,
    _hasLoadedTransactions: false,

    init: function() {
      var self = this;

      shared
        .setPageTitle('My Accounts')
        .setCurrentTab('accounts');

      // create a shared selection for this page
      self.selection = new wesabe.util.Selection();
      self.selection.bind('changed', function(event, newsel, oldsel) {
        self.onSelectionChanged();
      });

      $(window).bind('statechange', function() {
        self.attemptToReloadState();
      });

      // load all accounts view
      var url = $.url('');
      $('#accounts .module-header :header a, #nav-accounts > a')
        .click(function(event) {
          self.selection.clear();
          History.pushState("/companies/" + url.segment(2) + '/accounts');
          return false;
        });

      wesabe.ready('wesabe.views.widgets.accounts.__instance__', function() {
        self.setUpAccountsWidget();
      });

      wesabe.ready('wesabe.views.widgets.account-transactions', function() {
        self.setUpTransactionWidget();
      });

      wesabe.ready('wesabe.views.widgets.tags.__instance__', function() {
        self.setUpTagsWidget();
      });

      shared.addSearchListener(function(query) {
        self.onSearch(query);
      });

      $(function(){ self.attemptToReloadState() });
    },

    onSearch: function(query) {
      this.search = query;
      this.storeState();
    },

    setUpAccountsWidget: function() {
      var self = this;

      self.accounts = wesabe.views.widgets.accounts.__instance__;
      // use the shared selection for the accounts widget's selection
      self.accounts.set('selection', self.selection);
      // wait until the accounts have loaded to try to restore selection
      function loaded() {
        self.accounts.unbind('loaded', loaded);
        self._hasLoadedAccounts = true;
        self.attemptToReloadState();
      }

      self.accounts
        .bind('loaded', loaded)
        .bind('account-updated', function() {
          // setTimeout(..., 0) cargo-culted from GWT -- I think it's like Thread.pass,
          // and won't block other callbacks to the account-updated event
          setTimeout(function() {
            self.refresh();
          }, 0);
        });

      if (self.accounts.hasDoneInitialLoad()) loaded();
    },

    setUpTransactionWidget: function() {
      var self = this;

      self.transactions = $('#account-transactions');
      // use the shared selection for the transaction widget's selection
      self.transactions.fn('selection', self.selection);
      // set the default offset/limit
      self.transactions.fn('offset', 0);
      self.transactions.fn('limit', TRANSACTIONS_PER_PAGE);
      // try to restore the selection in case this is the last widget loaded
      self._hasLoadedTransactions = true;
      self.attemptToReloadState();

      self.transactions
        // when a transaction is added/saved, reload the list, chart, accounts, and tags
        .bind('transaction-changed', function() {
          self.refreshTransactions();
          self.redrawChart();
          wesabe.data.accounts.sharedDataSource.requestData();
          wesabe.data.tags.sharedDataSource.requestData();
        })
        // toggle between All / Unedited
        .kvobserve('unedited', function(_, unedited) {
          if (self.unedited !== unedited) {
            self.unedited = unedited;
            self.storeState();
            self.reload();
          }
        })
        // handle clicking Earlier / Later buttons
        .kvobserve('offset', function(_, offset) {
          if (self.offset !== offset) {
            self.offset = offset;
            self.storeState();
            self.reload();
          }
        })
        // if the limit changes just refresh the data with the new value
        .kvobserve('limit', function(_, limit) {
          if (self.limit !== limit) {
            self.limit = limit;
            self.refresh();
          }
        });

      self.transactions.fn('transactionDataSource').subscribe({
        change: function(data) {
          self.transactions.fn('transactions', data);
        }
      });
    },

    // refreshing just means repopulating the list with new data
    refreshTransactions: function() {
      var ds = this.transactions.fn('transactionDataSource');
      ds.set('params', this.paramsForCurrentSelection());
      ds.requestData();
    },

    // reloading means hiding the list while refreshing
    reloadTransactions: function() {
      this.transactions.fn('loading', true);
      this.refreshTransactions();
    },

    setUpTagsWidget: function() {
      var self = this;

      function loaded() {
        self.tags.unbind('loaded', loaded);
        self._hasLoadedTags = true;
        self.attemptToReloadState();
      }

      self.tags = wesabe.views.widgets.tags.__instance__;
      // use the shared selection for the tags widget's selection
      self.tags.set('selection', self.selection);
      // wait until the tags have loaded to try to restore selection
      self.tags.bind('loaded', loaded);

      if (self.tags.hasDoneInitialLoad()) loaded();
    },

    attemptToReloadState: function(state) {
      if (this._hasLoadedAccounts && this._hasLoadedTransactions && this._hasLoadedTags) {
        this.reloadState(state);
      }
    },

    reloadState: function(state) {
      var state = state || shared.parseState(),
          path = state.path,
          params = state.params,

          selectableObjects,
          selectableObjectsByURI,

          selectedObjects = [],
          m = null,

          search = null,
          unedited = false,
          offset = null,
          start = null,
          end = null,

          length;

      selectableObjects = this.accounts.get('selectableObjects');
      selectableObjects = selectableObjects.concat(this.tags.get('selectableObjects'));
      length = selectableObjects.length;

      while (length--)
        selectableObjects[selectableObjects[length].get('uri')] = selectableObjects[length];

      for (var key in params) {
        if (!params.hasOwnProperty(key)) return;

        var value = params[key];
        switch (key) {
          case 'selection':
            for (var i = 0; i < value.length; i++) {
              var selectableObject = selectableObjects[value[i]];
              if (selectableObject)
                selectedObjects.push(selectableObject);
            }
            break;

          case 'unedited':
            unedited = (value == true) || (value == 'true');
            break;

          case 'q':
            search = value;
            break;

          case 'offset':
            offset = number.parse(value);
            break;

          case 'limit':
            limit = number.parse(value);
            break;

          case 'start':
            start = date.parse(value);
            break;

          case 'end':
            end = date.parse(value);
            break;
        }
      }

      if (this.unedited != unedited) {
        this.unedited = unedited;
        this.transactions.fn('unedited', unedited);
      }

      if (selectableObjects[path])
        selectedObjects.push(selectableObjects[path]);
      else if (m = path.match(/^\/merchants\/([^\/]+)$/))
        selectedObjects.push(new wesabe.views.widgets.accounts.Merchant(m[1]));

      this.selection.set(selectedObjects);

      if (!offset)
        offset = 0;

      this.offset = offset;
      this.transactions.fn('offset', offset);

      // restore the date range
      this.start = start;
      this.end = end;

      // restore the search term
      this.search = search;

      this.repaint();
      this.reload();
    },

    onSelectionChanged: function() {
      this.storeState();
    },

    reload: function() {
      this.redrawChart();
      this.reloadTransactions();
    },

    refresh: function() {
      this.repaint();
      this.redrawChart();
      this.refreshTransactions();
    },

    repaint: function() {
      var tags = [], accounts = [], groups = [], merchants = [],
          items = this.selection.get(), length = items.length;

      while (length--) {
        var item = items[length];
        if (item.isInstanceOf(wesabe.views.widgets.tags.TagListItem)) {
          tags.push(item);
        } else if (item.isInstanceOf(wesabe.views.widgets.accounts.Account)) {
          accounts.push(item);
        } else if (item.isInstanceOf(wesabe.views.widgets.accounts.AccountGroup)) {
          groups.push(item);
        } else if (item.isInstanceOf(wesabe.views.widgets.accounts.Merchant)) {
          merchants.push(item);
        }
      }

      shared.setSearch(this.search || '');
      this.setTitleForState(accounts, groups, tags, merchants, this.search);
      this.setAddTransactionAvailabilityForState(accounts, groups, tags, merchants, this.search);
    },

    storeState: function() {
      var path = '/accounts',
          params = {},
          selection = this.selection.get();

      // handle the selection
      if (selection.length == 1) {
        path = selection[0].get('uri');
      } else if (selection.length > 1) {
        params.selection = [];
        for (var i = 0; i < selection.length; i++) {
          params.selection.push(selection[i].get('uri'));
        }
      }

      if (this.search) {
        path = '/accounts/search';
        params.q = this.search;
      }

      // handle the unedited flag
      if (this.unedited)
        params.unedited = true;

      if (this.offset)
        params.offset = this.offset;

      if (this.start)
        params.start = date.toParam(this.start);

      if (this.end)
        params.end = date.toParam(this.end);

      var state = {path: path, params: params};
      // create the history entry
      shared.pushState(state);

      return state;
    },

    setTitleForState: function(accounts, groups, tags, merchants, search) {
      var title = null, subtitle = null;
      var quote = function(item) {
        if (typeof item != 'string') item = item.get('name');
        return '“'+item+'”'
      };

      if (search) {
        title = quote(search);
        subtitle = 'Search Results';
      } else if (accounts.length + groups.length + tags.length + merchants.length == 0) {
        title = 'All';
        subtitle = 'Accounts';
      } else {
        var tagsDisplay = [], merchantsDisplay = [], accountsDisplay = [], title, subtitle;

        if (tags.length) {
          if (tags.length > 3) {
            tagsDisplay.push(tags.length + ' Tags');
            tagsDisplay.push('Summary');
          } else {
            tagsDisplay.push($.map(tags, quote).join(' + '));
            tagsDisplay.push('Tag Summary');
          }
        }

        if (merchants.length) {
          if (merchants.length > 3) {
            merchantsDisplay.push(merchants.length + ' Merchants');
            merchantsDisplay.push('Summary');
          } else {
            merchantsDisplay.push($.map(merchants, quote).join(' + '));
            merchantsDisplay.push('Merchant Summary');
          }
        }

        if (accounts.length + groups.length > 1) {
          $.each(groups, function(i, group){ $.merge(accounts, $(group).fn('items')) });
          accountsDisplay.push($.unique(accounts).length + ' Accounts');
        } else if (accounts.length) {
          accountsDisplay.push(accounts[0].get('name'));
        } else if (groups.length) {
          accountsDisplay.push(groups[0].get('name'))
          accountsDisplay.push('Account Group');
        }

        if (tagsDisplay.length && merchantsDisplay.length && accountsDisplay.length) {
          title = [tagsDisplay[0], merchantsDisplay[0]].join(' and ');
          subtitle = 'in ' + accountsDisplay[0];
        } else if ((tagsDisplay.length || merchantsDisplay.length) && accountsDisplay.length) {
          title = (tagsDisplay[0] || merchantsDisplay[0]);
          subtitle = 'in ' + accountsDisplay[0];
        } else if (tagsDisplay.length && merchantsDisplay.length) {
          title = [tagsDisplay[0], merchantsDisplay[0]].join(' and ');
          subtitle = 'Summary';
        } else if (tagsDisplay.length) {
          title = tagsDisplay[0];
          subtitle = tagsDisplay[1];
        } else if (merchantsDisplay.length) {
          title = merchantsDisplay[0];
          subtitle = merchantsDisplay[1];
        } else if (accountsDisplay.length) {
          title = accountsDisplay[0];
          subtitle = accountsDisplay[1];
        }
      }

      this.transactions.fn('setTitle', {display: title, subtitle: subtitle || ''});
      shared.setPageTitle(title + ' ' + (subtitle || ''));
    },

    setAddTransactionAvailabilityForState: function(accounts, groups, tags, merchants, search) {
      var oneAccountSelected = (accounts.length == 1) && (groups.length + tags.length + merchants.length == 0),
          testerForPendingTransactions = preferences.hasFeature('pending_txactions'),
          accountIsManual = oneAccountSelected && accounts[0].isCash(),
          accountIsInvestment= oneAccountSelected && accounts[0].isInvestment(),
          addTransactionEnabled = oneAccountSelected && !search && !accountIsInvestment && (testerForPendingTransactions || accountIsManual);

      $('.add-transaction .edit', this.transactions).css('visibility', addTransactionEnabled ? '' : 'hidden');
      if (addTransactionEnabled) $('.add-transaction', this.transactions).fn('account', accounts[0]);
    },

    redrawChart: function() {
      if (!wesabe.charts || !wesabe.charts.txn) {
        var self = this;
        wesabe.ready('wesabe.charts.txn', function(){ self.redrawChart(); });
        return;
      }

      var chart = wesabe.charts.txn;
      chart.params = this.paramsForCurrentSelection();

      var account = page.selection.getByClass(wesabe.views.widgets.accounts.Account)[0];
      if (account && account.isInvestment()) {
        chart.hide();
        this.displayInvestmentHeader(account);
      } else {
        $("#investment-header").hide();
        chart.redraw();
        chart.show();
      }
    },

    displayInvestmentHeader: function(account) {
      var positions = account.get('investmentPositions');
      $("#investment-positions .position").remove();
      for (i = 0; i < positions.length; i++) {
        var position = positions[i];
        var security = position["investment-security"];
        var cell = {
          name: $('<td>' + (security["display-name"] || security.name) + '</td>'),
          units: $('<td class="amount">' + position.units + '</td>'),
          unitPrice: $('<td class="amount">' + position["unit-price"].display + '</td>'),
          marketValue: $('<td class="total amount">' + position["market-value"].display + '</td>')
        };

        if (security.ticker) {
          cell.name.append(' (<a href="http://www.google.com/finance?q=' + security.ticker + '">' + security.ticker + '</a>)');
        }

        var row = $("<tr class='position'/>")
                    .append(cell.name, cell.units, cell.unitPrice, cell.marketValue);
        $("#investment-positions tr.header").after(row);
      }

      var availableCash = account.get('investmentBalance', "available-cash");
      if (availableCash) {
        $("#available-cash").html(availableCash.display)
        $("tr.available-cash").show();
      } else {
        $("tr.available-cash").hide();
      }

      $("#market-value").html(account.get('marketValue').display);
      $("#account-value").html(account.get('balance').display);
      $("#investment-header").show();
    },

    paramsForCurrentSelection: function() {
      var selection = this.selection.get(),
          length = selection.length,
          params = [],
          currencies = [];

      while (length--) {
        var selectedObject = selection[length];
        if (jQuery.isFunction(selectedObject.toParams))
          params = params.concat(selectedObject.toParams());
        try { currencies = currencies.concat(selectedObject.get('currencies')); }
        catch (e) {}
      }

      if (this.start && this.end) {
        params.push({name: 'start', value: date.toParam(this.start)});
        params.push({name: 'end', value: date.toParam(this.end)});
      }

      if (this.search != null)
        params.push({name: 'query', value: this.search});

      // when not searching we don't necessarily need offset and limit
      if (this.offset !== null)
        params.push({name: 'offset', value: this.offset});
      if (this.limit !== null)
        params.push({name: 'limit', value: this.limit});

      params.push({name: 'unedited', value: this.unedited ? 'true' : 'false'});

      currencies = array.uniq(currencies);
      params.currency = (currencies.length == 1) ?
                          currencies[0] :
                          wesabe.data.preferences.defaultCurrency();

      return params;
    }
  };
})();

jQuery(function($) {
  var root = $('#account-transactions');
  var TRANSACTIONS_PER_PAGE = 30;

  var number = wesabe.lang.number;
  var string = wesabe.lang.string;
  var array  = wesabe.lang.array;
  var shared  = wesabe.views.shared;
  var preferences  = wesabe.data.preferences;
  var transactionDataSource = new wesabe.data.TransactionDataSource();

  var behaviors = wesabe.provide('views.widgets.account-transactions', {
    root: {
      transactionDataSource: function(){ return transactionDataSource },
      selection: $.getsetdata('selection'),
      offset: $.getsetdata('offset'),
      limit: $.getsetdata('limit'),

      init: function() {
        var self = $(this);

        transactionDataSource.subscribe({
          afterLoad: function() {
            self.fn('loading', false);
          }
        });

        self.data('activity-buttons', new wesabe.views.widgets.ButtonGroup([
          new wesabe.views.widgets.Button(self.find("#all-transactions-button"), /* unedited = */ false),
          new wesabe.views.widgets.Button(self.find("#unedited-transactions-button"), /* unedited = */ true)], {
            onSelectionChange: function(sender, selectedButton) {
              self.kvo('unedited', selectedButton.get('value'));
            }
        }));

        self.kvobserve('unedited', function(_, unedited) {
          self.data('activity-buttons').selectButtonByValue(unedited);
        });

        var header = root.find('.module-header :header');
        self.data('_header', {
          display: header.get(0).firstChild,
          subtitle: header.children().get(0).firstChild
        });

        self
          .fn('transactions')
            .fn('init');

        return self;
      },

      loading: $.getsetclass('loading'),

      setTitle: function(title) {
        var header = $(this).data('_header');
        header.display.nodeValue = title.display;
        header.subtitle.nodeValue = title.subtitle;
      },

      transactions: $.getset({
        get: function() {
          return root
            .find('#transactions')
            .include(behaviors.transactionList);
        },

        set: function(data, getset) {
          getset.get().fn('update', data);
        }
      }),

      unedited: $.getsetdata('unedited')
    },

    transactionList: (function() {
      var template = null; // transactions template cache
      var investmentTemplate = null;

      return {
        start: $.getsetdata('start'),
        end: $.getsetdata('end'),

        init: function() {
          var self = $(this);

          transactionDataSource.subscribe({
            change: function(data) {
              self.fn('update', data);
            },

            error: function() {
              // FIXME: so it goes.
            }
          });

          $('.date-range-detail .left-arrow, .prev-date-range', root).click(function() {
            var txactions = transactionDataSource.get('data');
            var total = (txactions && txactions.count && txactions.count.total) || 0;
            var newOffset = root.fn('offset') + root.fn('limit');

            if (total > newOffset) {
              root.fn('offset', newOffset);
            }
          });

          $('.date-range-detail .right-arrow, .next-date-range', root).click(function() {
            var newOffset = root.fn('offset') - root.fn('limit');

            if (newOffset >= 0) {
              root.fn('offset', newOffset);
            }
          });

          return self;
        },

        update: function(data) {
          var self = $(this);

          var i;
          var newTxactionList = $([]);

          var transactions = data.transactions || data['investment-transactions'];
          var isInvestment = data['investment-transactions'] !== undefined;

          var items = self.fn("items");

          if (items.length == 0) {
            // no existing items, so just add the transactions
            for (i = 0; i < transactions.length; i++) {
              newTxactionList = newTxactionList.add(self.fn("create", isInvestment).fn("update", transactions[i]));
            }
          } else {
            var newTxactionsByURI = {};
            var existingTxactionsByURI = {};

            // clear the list if we're switching to or from investments
            if (isInvestment ^ items[0].isInvestment)
              self.fn('clear');
            else {
              for (i = 0; i < transactions.length; i++) {
                newTxactionsByURI[transactions[i].uri] = transactions[i];
              }

              // remove any existing transactions not in the new transaction dataset
              for (i = 0; i < items.length; i++) {
                var item = $(items[i]),
                    uri = item.fn("uri");

                if (!newTxactionsByURI[uri]) {
                  item.remove();
                } else {
                  existingTxactionsByURI[uri] = item;
                }
              }
            }

            // build new transaction list, inserting new transactions
            for (i = 0; i < transactions.length; i++) {
              var transaction = transactions[i],
                  uri = transaction.uri,
                  item = existingTxactionsByURI[uri];

              if (!item)
                item = self.fn("create", isInvestment);

              newTxactionList = newTxactionList.add(item[0]);
              item.fn('update', transaction);
            }
          }

          self.prepend(newTxactionList);

          // FIXME: we need singleton txaction edit so bad
          //   this is still pretty awful, it will jump you to name from tags
          if (root.fn('unedited'))
            $('.edit-dialog:visible .name-edit').focus()

          if (transactions.length == 0) {
            $("#no-transactions").show();
          } else {
            $("#no-transactions").hide();
          }

          self.fn('restripe');

          var nextLink = $('.next-date-range, .right-arrow', root),
              prevLink = $('.prev-date-range, .left-arrow', root),
              txactions = transactionDataSource.get('data'),
              offset = root.fn('offset'),
              limit = root.fn('limit'),
              total = (txactions && txactions.count && txactions.count.total) || 0;

          if (offset == 0 || limit == null)
            nextLink.hide();
          else
            nextLink.show();

          if (offset + TRANSACTIONS_PER_PAGE < total)
            prevLink.show();
          else
            prevLink.hide();

          return self;
        },

        restripe: function() {
          var self = $(this);
          self
            .fn('items')
              .removeClass('even')
              .removeClass('odd')
              .filter(':even')
                .addClass('even')
              .end()
              .filter(':odd')
                .addClass('odd');
          return self;
        },

        clear: function() {
          $(this).fn('items').remove();
          return $(this);
        },

        create: function(isInvestment) {
          var template = $(this).fn('template', isInvestment).clone().removeClass('template');
          if (isInvestment)
            return template.include(behaviors.investmentTransaction).fn('init');
          else
            return template.include(behaviors.transaction).fn('init');
        },

        template: function(isInvestment) {
          if (isInvestment)
            return investmentTemplate = investmentTemplate ||  $(this).children(".investment-transaction.template");
          else
            return template = template || $(this).children(".transaction.template");
        },

        items: function() {
          return $(this).children('.transaction,.investment-transaction').not('.template');
        },

        merchantNames: function() {
          var self = $(this);
          if ( !self.kvo('merchantNames') ) {
            self.kvo('merchantNames', 'loading');
            $.ajax({
              dataType: 'json',
              cache: false,
              url: '/txactions/merchant_list/',
              success: function(data){
                // data is [user merchants, site merchants]
                var names = data[0].concat(data[1]);
                self.kvo('merchantNames', names);
              }
            });
          }
          return self.kvo('merchantNames');
        },

        addMerchantName: function(newMerchantName) {
          $(this).kvo('merchantNames',
            $(this).kvo('merchantNames').concat(newMerchantName));
          return true;
        }
      };
    })(),

    transaction: {
      uri:            $.getsetdata('uri'),
      amount:         $.getsetdata('amount'),
      account:        $.getsetdata('account'),

      merchant: $.getset({
        get: function() { return $(this).data('widget').get('merchant'); },
        set: function(data, getset) {
          var self = $(this),
              widget = self.data('widget');

          widget.set('merchant', data);
          $('.merchant-info', self)
            .unbind('click')
            .click(function() {
              if (widget.isUnedited()) {
                self.fn('startEdit');
              }
          });
        }
      }),

      init: function() {
        var self = $(this);

        self.data('widget', new wesabe.views.widgets.transactions.Transaction(self));
        self.include(behaviors.transactionEdit);
        self.children('.edit').click(function(){
          self.fn('startEdit'); });

        $('.account-name', self)
          .click(function(event) {
            History.pushState(null, null, self.fn('account').uri);
            event.preventDefault();
          });

        return self;
      },

      update: function(data) {
        var self = $(this);
        var selection = root.fn('selection'),
            selectingSingleAccount = (selection.get().length == 1) && selection.get()[0].isInstanceOf(wesabe.views.widgets.accounts.Account);
        data['amount'].value = number.parse(data['amount'].value);
        var merchant = data['merchant'] || {};
        var uneditedName = merchant.uneditedName = data['unedited-name'] || '';
        if (!merchant.name) {
          merchant.suggestedName = string.titleCaps(uneditedName.toLowerCase()).replace(/\s+/g, ' ');
        }

        var transactionTags = data.tags,
            tagSelection = $.map(selection.getByClass(wesabe.views.widgets.TagListItem), function(t){ return t.get('name') });

        // show the split amounts if the tags we've selected have splits
        if (tagSelection.length > 0 && transactionTags.length > 0) {
          var length = transactionTags.length;
          var amount = 0;
          while (length--) {
            var tag = transactionTags[length];
            if (array.contains(tagSelection, tag.name)) {
              if (tag.amount) {
                amount += Math.abs(number.parse(tag.amount.value));
              } else {
                // one selected tag is not a split, which is an implicit 100%,
                // so act like there are no splits
                amount = 0;
                break;
              }
            }
          }

          // if the split summation is within (0, txaction amount) then use it for display
          if (amount > 0 && amount < Math.abs(data.amount.value)) {
            amount = amount * (data.amount.value > 0 ? 1 : -1);
            data['display-amount'] = {
              value: amount,
              display: wesabe.lang.money.format(amount, {currency: data.account.currency})
            };
          }
        }

        self
          .fn('uri', data['uri'])
          .fn('amount', data['amount'])
          .fn('account', data['account'])
          .fn('attachments', data['attachments'] || []);

        var widget = self.data('widget');

        widget.set('URI', data['id']);
        widget.set('note', data['note']);
        widget.set('date', data['date']);
        widget.set('checkNumber', data['check-number']);

        widget.set('account', data['account']);
        widget.set('accountVisible', !selectingSingleAccount);
        widget.set('balance', data['balance']);
        // Cash accounts shouldn't have balances
        if (data['account'].type == "Cash")
          widget.set('balanceText', selectingSingleAccount ? '' : 'n/a');
        widget.set('amount', data['display-amount'] || data['amount']);
        widget.set('tags', data['tags']);
        widget.set('transfer', data['transfer'] || null);
        widget.set('merchant', merchant);

        return self;
      },

      tagsString: function() {
        return $('.merchant-tag:not(.template)', this)
          .map(function(){
            return $(this).text().trim();
          }).get().join(" ");
      },

      attachmentListItems: function(showDelete) {
        var attachments = $(this).fn('attachments');
        if (!attachments)
          return [];

        var list = [];
        list.push(
          $('<p></p>').text(
            'Attached ' + string.pluralize(attachments.length, 'file') + ': ').get(0));

        for (var i = 0; i < attachments.length; i++) {
          var a = attachments[i],
              uri = '/attachments/' + a.guid;

          list.push(
            $('<a></a>')
              .attr('href', uri)
              .text(a.filename).get(0));

          if (showDelete) {
            list.push(document.createTextNode(' '));
            list.push(
              $('<a class="delete-attachment">remove</a>')
                .attr('href', uri)
                .click(function() {
                  var me = $(this),
                      attachmentLink = me.prev('a');

                  $.ajax({
                    type:"DELETE",
                    url:me.attr('href'),
                    success: function() {
                      attachmentLink
                        .addClass('removed-attachment')
                        .click(function(){ return false });
                      me.remove();
                    }
                  });
                  return false;
                }).get(0));
          }

          if (i != attachments.length - 1)
            list.push(document.createTextNode(', '));
        }
        return list;
      },

      attachments: $.getset({
        get: function() {
          return $(this).data('attachments');
        },

        set: function(attachments, getset) {
          var self = $(this);
          self.data('attachments', attachments);

          if (attachments.length > 0) {
            $('.merchant-icons div.attachments-list', self).empty().append(self.fn('attachmentListItems'));
            $('.merchant-icons.attachments', self).addClass("on attachments-on");
          }
        }
      }),

      uneditedName: function() {
        var self = $(this),
            widget = self.data('widget'),
            uneditedName = widget.get('merchant').uneditedName,
            checkNumber = widget.get('checkNumber');

        if ((checkNumber && checkNumber.length > 0) || uneditedName.length > 0) {
          var originalNameParts = [];
          if (checkNumber && checkNumber.length > 0)
            originalNameParts.push('Check #' + checkNumber);
          if (uneditedName.length > 0)
            originalNameParts.push('Originally: ' + uneditedName);

          return originalNameParts.join(' — ');
        }
        return;
      }
    },

    investmentTransaction: {
      isInvestment: true,
      uri:              $.getsetdata('uri'),
      account:          $.getsetdata('account'),
      // investment transaction attributes
      tradeDate:        $.getsetdata('trade-date'),
      units:            $.getsetdata('units'),
      unitPrice:        $.getsetdata('unit-price'),
      displayUnitPrice: $.getsetdata('display-unit-price'),
      total:            $.getsetdata('total'),
      displayTotal:     $.getsetdata('display-total'),
      security:         $.getsetdata('security'),
      memo:             $.getsetdata('memo'),

      init: function() {
        var self = $(this);

        // bind the units text
        $('.units', self)
          .kvobind(self, 'units', {property: 'text', transform: function(b){ return b }});

        // bind the text to formatted unit price
        $('.unit-price', self)
          .kvobind(self, 'unit-price', {property: 'text', transform: function(b){ return b && b.display }});

        // bind the total to formatted total and bind the "credit" class to positive total
        $('.total', self)
          .kvobind(self, 'total', {property: 'text', transform: function(a){ return a && a.display.replace(/[-\(\)]/g, '') }})
          .kvobind(self, 'total', {hasClass: 'credit', when: function(a){ return a && a.value > 0 }});

        // bind security text to security name
        $('.security-name', self)
          .kvobind(self, 'security', {property: 'text', transform: function(m){ return m && (m["display-name"] || m.name) }});

        // bind security ticker text to security ticker
        $('.security-ticker', self)
          .kvobind(self, 'security', {property: 'html', transform: function(m){
            // display ticker only if it isn't the same as the name
            if (m && m.ticker && m.ticker != (m["display-name"] || m.name))
              return '(<a href="http://www.google.com/finance?q=' + m.ticker + '">' + m.ticker + '</a>)';
            else
              return '';
          }});

        // bind memo text to memo
        $('.memo', self)
          .kvobind(self, 'memo', {property: 'text', transform: function(m){ return m }});

        // bind date text to formatted date (e.g. "Apr 28th")
        $('.trade-date', self)
          .kvobind(self, 'trade-date', {property: 'text', transform: function(date) {
            if (date) {
              return wesabe.lang.date.format(date, 'NNN') + ' ' + number.ordinalize(date.getDate()) +
                (date.getFullYear() != new Date().getFullYear() ? ' ' + date.getFullYear() : '');
            }
          }});

        var selection = root.fn('selection').get();
        self.kvobserve('account', function(_, a) {
          if (a.uri) {
            var accounts = wesabe.data.accounts.sharedDataSource.get('data').accounts;
            for (var i = accounts.length; i--;) {
              if (accounts[i].uri === a.uri) {
                a = accounts[i];
                break;
              }
            }
          }

          if (selection.length != 1 || selection[0].getClass() != wesabe.views.widgets.accounts.Account) {
            $('.account-name .text-content', self).text(a ? a.name : '');
          }
        });

        $('.account-name', self)
          .click(function(event) {
            History.pushState(null, null, self.fn('account').uri);
            event.preventDefault();
          });

        return self;
      },

      update: function(data) {
        var self = $(this);
        var selection = root.fn('selection');
        if (data['total'])
          data['total'].value = number.parse(data['total'].value);
        var security = data['investment-security'] || {};

        self
          .fn('id', data['id'])
          .fn('uri', data['uri'])
          .fn('tradeDate', data['trade-date'] && wesabe.lang.date.parse(data['trade-date']))
          .fn('units', data['units'])
          .fn('unitPrice', data['unit-price'])
          .fn('total', data['total'] || '')
          .fn('security', data['investment-security'])
          .fn('memo', data['memo'])
          .fn('account', data['account']);

        return self;
      }
    },

    transactionEdit: {
      tagsField: function() {
        return $("input[name=tags]", this);
      },

      startEdit: function() {
        var self = $(this),
            edit_button = self.children('.edit'),
            isAddTransaction = self.hasClass('add-transaction'),
            widget = self.data('widget');

        // whoa there son, only one edit box at a time
        if ($('.edit-dialog:visible', self).length) return false;

        // copy edit template into place
        var edit_box = $('#transactions .template')
          .find('.edit-dialog')
          .clone()
          .appendTo(edit_button);

        // don't create another box on another click
        edit_button.unbind('click');

        // pull txaction data into the form unless this is a new txaction
        if (!isAddTransaction)
          self.fn('populateEdit');

        // configure tags
        var amountField = $('input[name=amount]', self),
            tagAutocompleterField = new wesabe.views.widgets.tags.TagAutocompleterField(self.fn('tagsField')),
            hasEditableAmount = isAddTransaction || amountField.is(':visible');

        tagAutocompleterField.setTip('Use a colon ‘:’ to split this transaction (e.g. food:10 health:5)');
        function recomputeSplitTotal() {
          var amount = hasEditableAmount ? amountField.val() :
                  self.data('fn.amount') ? self.fn('amount').value :
                                           null;
          if (amount)
            tagAutocompleterField.set('splitAutocompletionTotal', number.parse(amount));
        }

        amountField.bind('change', recomputeSplitTotal);
        recomputeSplitTotal();

        // bind the date picker
        var dateVal = wesabe.lang.date.format((widget && widget.get('date') ? widget.get('date') : new Date()), 'yyyy-MM-dd');
	$('.date-edit', edit_box).datepicker().val(dateVal);

        // bind the merchant autocompleter
        self.fn('startMerchantAutocomplete');

        // toggle the merchant icons
        self.find('form div.merchant-icons').removeClass('on');
        if (widget && widget.get('tags').length > 0) self.find('form div.merchant-icons.tags').addClass('on tags-on');
        if (widget && widget.get('note') && widget.get('note').length > 0) self.find('form div.merchant-icons.notes').addClass('on notes-on');
        if (self.fn('attachments').length > 0) self.find('form div.merchant-icons.attachments').addClass('on attachments-on');
        if (widget && widget.isTransfer()) self.find('form div.merchant-icons.transfer').addClass('on transfer-on');

        // bind the tabs to show the content divs when clicked
        $('a.edit-dialog-inset-tab', edit_box).click(function(){
          $('a.edit-dialog-inset-tab', edit_box)
            .add('div.inset-tab-text', edit_box)
            .removeClass('on');

          var tabName = $(this).children('span').attr('class');
          $(this).add('div.inset-tab-text.'+tabName, edit_box).addClass('on');

          return false;
        });

        // reset the currently selected tab
        $('a.edit-dialog-inset-tab:first', edit_box).trigger('click');

        // bind the change autotags link to show the autotag editor
        $('.autotags-edit-link', edit_box).click(
          function(){ self.fn('toggleAutotagEdit'); })

        // bind the cancel button to cancel the edit
        $('.cancel', edit_box).click(
          function(){ self.fn('teardownEdit'); });

        // bind the save button to ajaxSubmit the edit
        $('.save', edit_box).click(
          function(){ self.fn('saveEdit'); });

        // catch submit so we can do our own ajaxSubmit
        $('form.edit-transaction', edit_box).submit(
          function(){ self.fn('saveEdit'); return false;});

        // if in unedited mode, note that saving will open the next unedited
        if (root.fn('unedited'))
          $('.save span', edit_box).text("Save & Edit Next");

        // bind the escape key to cancel the edit
        var closeOnEsc = function(event) {
          if (event.which == 27) self.fn('teardownEdit');
          event.preventDefault();
        };
        $(document).bind('keyup.esccancel', closeOnEsc);
        $(':input', self).bind('keyup.esccancel', closeOnEsc);

        // reveal the edit box
        self.addClass("edit-transaction");
        edit_box.slideDown("fast", function() {
          var name = $('.name-edit', self);
          name.caret(0, name.val().length);
        });
        return $(this);
      },

      startMerchantAutocomplete: function() {
        var self = $(this),
            widget = self.data('widget'),
            options = {};

        if (!self.hasClass("add-transaction")) {
          var checkNumber = widget.get("checkNumber");
          var merchant = self.fn("merchant");
          // show Happy Magic Check Autocomplete if this is a check and it is unedited
          if (checkNumber && checkNumber.length > 0 && !widget.get('unedited')) {
            options.showChecks = true;
            options.txactionURI = self.fn("uri");
          }

          options.footer = self.fn('uneditedName');
        }
        $('.edit-dialog .name-edit', self)
          .merchantAutocomplete(options, function() { self.fn('populateMerchantDefaults'); });
       },

      populateEdit: function() {
        var self = $(this),
            edit_box = $('.edit-dialog', self),
            widget = self.data('widget');

        // REVIEW: kvobind the template fields to the txaction object?
        $('.name-edit', edit_box).val(
          widget.get('merchant').name || widget.get('merchant').suggestedName);
        if (widget.get('merchant').name) {
          setTimeout(function(){ self.fn('populateAutotagEdit') }, 150);
          setTimeout(function(){ self.fn('populateMerchantDefaults') }, 150);
        }

        self.fn('tagsField').val(self.fn('tagsString'));

        switch (txType = self.fn('account').type) {
          case "Manual":
          case "Cash":
            var amount = self.fn('amount').value;
            $('.amount-edit', edit_box)
              .find('input[name=amount]').val(Math.abs(amount));
            if (amount && amount > 0)
              $('input[value=earned]', edit_box).attr('checked', 'true');
            break;
          default:
            $('.amount-edit', edit_box).hide()
              .find('input').attr('disabled', true);
            $('.amount', edit_box).show()
              .text(self.fn('amount').display);
        }

        $('.delete.button', self).show()
          .click(function(){self.fn('destroy');});

        $('textarea[name=note]', edit_box).val(widget.get('note') || '');

        var attachmentList = $('.inset-tab-text div.attachments-list', self);
        attachmentList.empty().append(self.fn('attachmentListItems', true));

        $('.transfer-details input[type=checkbox]', edit_box)
          .attr('id', 'is_transfer_' + widget.get('uri'))
          .attr('checked', widget.isTransfer())
          .click(function(){
            if ($(this).attr('checked')) {
              self.fn('loadTransferData')
            } else {
              $('.transfer-select', self).slideUp();
            }
          });

        if (widget.isTransfer())
          setTimeout(function(){ self.fn('loadTransferData') }, 150);
      },

      loadTransferData: function() {
        var self = $(this);
        $.get(self.fn('uri') + '/transfer_selector',
          function(data){
            $('.transfer-select', self)
              .html(data)
              .slideDown("normal");
          }
        );
      },

      populateMerchantDefaults: function() {
        var self = $(this);
        var merchantName = $('form input[name=merchant_name]', self).fieldValue()[0];

        $.ajax({url: self.fn('uri') + '/on_select_merchant',
          data: {name: merchantName},
          type: 'GET',
          dataType: 'json',
          cache: false,
          success: function(data) {
            if (data['id'])
              self.fn('populateAutotagEdit', data['id']);

            var tagsInput = $('form input[name=tags]', self);
            if (data['tags'] && string.blank(tagsInput.val()))
              tagsInput.val(data['tags']['display']);

            if (data['suggested-tags'] && data['suggested-tags'].length)
              self.fn('showSuggestedTags', data['suggested-tags']);
          },
          error: function(error) {
            wesabe.error("Failed to get merchant defaults: ", error);
          }
        });
      },

      showSuggestedTags: function(suggestedTags) {
        var self = $(this);
        var suggestedTagsField = $(".suggested-tags", self).text("Suggested tags:");
        $.map(suggestedTags, function(tag){
          $('<a></a>')
            .text(tag.display)
            .click(function() {
              var field = self.fn('tagsField');
              var tagList = wesabe.data.tags.parseTagString(field.val());
              var newTagList = $.grep(tagList, function(tagListItem) {
                return wesabe.data.tags.unquote(tagListItem.name) != wesabe.data.tags.unquote(tag.display);
              });

              if (tagList.length == newTagList.length) {
                // we didn't already have the tag, add it
                newTagList.push({name: tag.display});
              } else {
                // we already had the tag, and it's been removed
              }

              field.val(wesabe.data.tags.joinTags(newTagList));
            })
            .prepend(" ")
            .appendTo(suggestedTagsField);
        });
        suggestedTagsField.slideDown();
      },

      populateAutotagEdit: function(merchantId) {
        var self = $(this);
        merchantId = merchantId || widget.get('merchant').id;
        var sign = -1;
        if (!self.hasClass("add-transaction") && self.fn('amount').value > 0) {
          sign = 1;
        }

        $.ajax({url: '/account_merchant_tag_stats/' + merchantId + '/edit',
          data: {sign: sign },
          type: 'GET',
          cache: false,
          success: function(data){
            // save autotag changes when the form is submitted or button is clicked
            $('.autotags-edit', self).html(data)
              .find('form').submit(function(){
                self.fn('saveAutotagEdit'); return false; });

            self.find('.autotags-save').unbind('click').
              click(function(){ self.fn('saveAutotagEdit'); }).end()
            .find('.autotags-cancel').unbind('click').
              click(function(){ self.fn('toggleAutotagEdit'); });

            var newTags = $('input[name=autotags]', self);
            var newTagsValue = newTags.val();
            var tags = $('input[name=tags]', self);
            // if tags is empty, copy the autotags
            if ( string.blank(tags.val()) ) tags.val(newTagsValue);
            // enable autocomplete

            new wesabe.views.widgets.tags.TagAutocompleterField(
              newTags,
              wesabe.data.tags.sharedDataSource
            );

            // show the link to show the form
            $('.autotags-edit-link', self).fadeIn();
          }
        });
      },

      saveAutotagEdit: function() {
        var self = $(this);
        var autotags = $('input[name=autotags]', self);
        var old_tags = $('input[name=old_tags]', self);
        var update_all = $('input[name=update_all]', self).attr('checked');

        if ( !update_all && (autotags.val() == old_tags.val()) ) {
          // don't submit if nothing's changed
          self.fn('toggleAutotagEdit');
          return;
        }

        $('.autotags-edit form', self).ajaxSubmit({
          type: 'PUT',
          beforeSubmit: function() {
            spinDiv($('.autotags-edit', self));
            $('.edit-dialog .error-message', self).slideUp("normal");
          },
          error: function() {
            $('.edit-dialog .error-message', self).slideDown("normal");
          },
          success: function() {
            var tagsField = $('input[name=tags]', self);
            if (string.blank(tagsField.val())) {
              tagsField.val(autotags.val());
            }
            self.fn('toggleAutotagEdit');
          },
          complete: function() {
            spinDiv($('.autotags-edit', self));
          }
        });
      },

      toggleAutotagEdit: function() {
        var editPanel = $('.autotags-edit', this),
            autotagButtons = $('.autotag-buttons', this),
            buttons = $('.buttons', this),
            autotagsVisible = editPanel.is(':visible');

        editPanel.slideToggle();
        if (autotagsVisible) {
          buttons.show();
          autotagButtons.hide();
        } else {
          buttons.hide();
          autotagButtons.show();
        }
      },

      saveEdit: function() {
        var self = $(this),
            widget = self.data('widget'),
            doneSaving = false;

        var editing = widget && widget.get('uri');
        var form = $('form:first', self);
        if (editing) {
          form.append('<input type="hidden" name="_method" value="PUT">');
        }
        form.ajaxSubmit({
          url: self.fn('uri'),
          type: editing ? "PUT" : "POST",
          dataType: "json",
          beforeSend: function(xhr) {
             xhr.setRequestHeader('Accept', 'application/json');
          },
          beforeSubmit: function() {
            $('.edit-dialog .error-message', self).slideUp("normal");
            $('.edit-dialog', self).slideUp("slow", function(){
              if (!doneSaving) $('img.uploading-spinner', self).show();
              if(root.fn('unedited')) self.next().fn('startEdit');
            });

            // TODO: add live-validation callbacks here so that you can't submit
            //   the form if the data is invalid
          },
          error: function() {
            $('.edit-dialog .error-message', self).slideDown('normal');
          },
          success: function(data) {
            self.fn('teardownEdit')
            root.trigger('transaction-changed', [self]);
          },
          complete: function() {
            doneSaving = true;
            $('img.uploading-spinner', self).hide();
          }
        });
      },

      showDeleted: function () {
        var self = $(this);
        self.addClass("deleted")
          .prepend("<p class='undelete'>Transaction deleted. <a>Undo?</a></p></div>")
          .prepend("<div class='deleted-cover'></div>");
        self.find('p.undelete a').bind('click', function() { self.fn('undestroy'); });
      },

      hideDeleted: function() {
        $(this).removeClass('deleted').find('div.deleted-cover, p.undelete').remove();
      },

      destroy: function() {
        var self = $(this);
        $.ajax({
          url: self.fn('uri'),
          type: 'DELETE',
          data: '_=', // HACK: chrome bug causes "nil.attributes" Rails exception
          beforeSend: function() {
            self.fn('teardownEdit', function() {
              self.fn('showDeleted');
            });
          },
          error: function() {
            self.fn('hideDeleted');
          }
        });
      },

      undestroy: function() {
        var self = $(this);
        $.ajax({
          url: self.fn('uri') + '/undelete',
          type: 'PUT',
          data: '_=', // HACK: chrome bug causes "nil.attributes" Rails exception
          success: function() { self.fn('hideDeleted'); }
        });
      },

      teardownEdit: function(callback) {
        var self = $(this);
        // stop watching for an esc key
        $(document).unbind('keyup.esccancel');
        $(':input', self).unbind('keyup.esccancel');
        // hide the edit box, remove it, and rebind the edit button
        $('.edit-dialog', self).hideModal(function() {
          self.removeClass("edit-transaction");
          $(this).remove();
          self.children('.edit').click(function(){ self.fn('startEdit'); });
          if (callback) { callback(); }
        });
      }
    }
  });

  root
    .include(behaviors.root)
    .fn('init');

  add = $('.add-transaction');
  add.include(behaviors.transactionEdit);
  add.include({
    date: function() { return new Date; },
    sign: function() {
      var checked = $("input[type=radio]:checked", this).val();
      return (checked == "spent") ? "-" : "+";
    },
    account: $.getsetdata('account'),
    uri: function() {
      var account = $(this).fn('account');
      return account.get('transactionsURI');
    },
    tags: function() { return []; },
    notes: function() { return null; },
    attachments: function() { return []; },
    transfer: function() { return null; }
  })

  add.children('.edit').click(function(){
    add.fn('startEdit');
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
      this._tagNames = this._tagDataSource._tagNames;
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
            return wesabe.lang.date.format(date, 'NNN') + ' ' + number.ordinalize(date.getDate()) +
              (date.getFullYear() != new Date().getFullYear() ? ' ' + date.getFullYear() : '');
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

        tags[0].name = tagName;

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
      var selectedTagName = tags[0] && tags[0].name.toLowerCase();

      this._tags = tags;
      tagNames = this._tagDataSource.tagNames();
      this._catElement.empty();

      var select = this._catElement.get(0),
          selectedIndex = -1;

      for (var i = 0, length = tagNames.length; i < length; i++) {
        var tagName = tagNames[i];

        if (selectedTagName === tagName.toLowerCase())
          selectedIndex = i;

        select.options.add(new Option(tagName.replace(/_/g," "),tagName));
      }

      select.selectedIndex = selectedIndex;

      //this._tagLinkList.setTags(tags);
      this._catElement.combobox();
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

jQuery(function($) {
  var root = $('#trends-summary');

  var behaviors = wesabe.provide('views.trendsSummaryWidget', {
    root: {
      init: function() {
        var self = $(this);

        $(window).bind('hash-changed', function(_, hash) { self.fn("_restoreFromHash", hash); });
        if (window.location.hash)
          self.fn("_restoreFromHash", window.location.hash);

        return self;
      },

      _restoreFromHash: function(hash) {
        var match = hash.match(/spending|earnings/);
        if (match) {
          $("#spending-earnings-summary li", this).removeClass("on");
          $("." + match[0], this).addClass("on");
        }
      }
    }
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

jQuery(function($) {
  function resetExportVisibility() {
    if (page.search) $('#export').hide();
    else $('#export').show();
    // CSV/XLS aren't supported yet for investment accounts
    var account = page.selection.getByClass(wesabe.views.widgets.accounts.Account)[0];
    if (account && account.isInvestment()) {
      $("#export-format option[value=csv],option[value=xls]").hide();
      $("#export-format option[value=json]").attr('selected', true);
    } else {
      $("#export-format option[value=csv],option[value=xls]").show();
      $("#export-format option[value=csv]").attr('selected', true);
    }
  }

  resetExportVisibility();
  $(page).bind("state-changed", resetExportVisibility);

  $("#export-link").dateRangePicker({
    dialog: '#export-dialog',
    allowBlankDates: true,
    onInit: function() {
      var picker = this;
      $("#date-range-select").change(function() {
        var year = new Date().getFullYear();
        $("#custom-date-range").slideUp('fast');
        switch($(this).val()) {
          case 'all':
            picker.clearDates();
            break;
          case 'tax':
            picker.startDate(new Date(year-1,0,1));
            picker.endDate(new Date(year-1,11,31));
            break;
          case 'ytd':
            picker.startDate(new Date(year,0,1));
            picker.endDate(new Date());
            break;
          case 'custom':
            picker.clearDates();
            $("#custom-date-range").slideDown('fast');
        }
      });
    },

    onShow: function() {
      $("#custom-date-range .notification.error").hide();

      var header = $("#account-transactions").data("_header");
      $("#export-source").text(header.display.nodeValue + " " + header.subtitle.nodeValue);

      if (page.start || page.end) {
        this.startDate(page.start);
        this.endDate(page.end);
        $("#date-range-select").val("custom");
        $("#custom-date-range").show();
      }
      else {
        $("#date-range-select").val("all");
        $("#custom-date-range").hide();
      }
    },

    onSave: function() {
      var p = wesabe.lang.params;

      var startDate = this.startDate();
      var endDate = this.endDate();

      var params = page.paramsForCurrentSelection();
      var currency = params.currency || wesabe.data.preferences.defaultCurrency();
      delete params.currency;

      // TODO: handle export from search results
      p.remove(params, 'offset');
      p.remove(params, 'limit');
      var format = $("#export-format").val();
      p.set(params, 'format', format);

      if (startDate)
        p.set(params, 'start', wesabe.lang.date.toParam(startDate));

      if (endDate)
        p.set(params, 'end', wesabe.lang.date.toParam(wesabe.lang.date.addDays(endDate, 1)));

      var account = page.selection.getByClass(wesabe.views.widgets.accounts.Account)[0];
      var uri = '/data/' + (account && account.isInvestment() ? 'investment-' : '') + 'transactions/' + currency + '?' + $.param(params);
      // open new window only for non-attachment downloads
      if (format == 'json' || format == 'xml')
        window.open(uri);
      else
        window.location.href = uri;
    },

    onError: function() {
      $("#custom-date-range .notification.error").show();
    }
  });
});

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
 * jQuery Form Plugin
 * version: 2.28 (10-MAY-2009)
 * @requires jQuery v1.2.2 or later
 *
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function($) {

/*
    Usage Note:
    -----------
    Do not use both ajaxSubmit and ajaxForm on the same form.  These
    functions are intended to be exclusive.  Use ajaxSubmit if you want
    to bind your own submit handler to the form.  For example,

    $(document).ready(function() {
        $('#myForm').bind('submit', function() {
            $(this).ajaxSubmit({
                target: '#output'
            });
            return false; // <-- important!
        });
    });

    Use ajaxForm when you want the plugin to manage all the event binding
    for you.  For example,

    $(document).ready(function() {
        $('#myForm').ajaxForm({
            target: '#output'
        });
    });

    When using ajaxForm, the ajaxSubmit function will be invoked for you
    at the appropriate time.
*/

/**
 * ajaxSubmit() provides a mechanism for immediately submitting
 * an HTML form using AJAX.
 */
$.fn.ajaxSubmit = function(options) {
    // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
    if (!this.length) {
        log('ajaxSubmit: skipping submit process - no element selected');
        return this;
    }

    if (typeof options == 'function')
        options = { success: options };

    var url = $.trim(this.attr('action'));
    if (url) {
	    // clean url (don't include hash vaue)
	    url = (url.match(/^([^#]+)/)||[])[1];
   	}
   	url = url || window.location.href || ''

    options = $.extend({
        url:  url,
        type: this.attr('method') || 'GET'
    }, options || {});

    // hook for manipulating the form data before it is extracted;
    // convenient for use with rich editors like tinyMCE or FCKEditor
    var veto = {};
    this.trigger('form-pre-serialize', [this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
        return this;
    }

    // provide opportunity to alter form data before it is serialized
    if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSerialize callback');
        return this;
    }

    var a = this.formToArray(options.semantic);
    if (options.data) {
        options.extraData = options.data;
        for (var n in options.data) {
          if(options.data[n] instanceof Array) {
            for (var k in options.data[n])
              a.push( { name: n, value: options.data[n][k] } );
          }
          else
             a.push( { name: n, value: options.data[n] } );
        }
    }

    // give pre-submit callback an opportunity to abort the submit
    if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSubmit callback');
        return this;
    }

    // fire vetoable 'validate' event
    this.trigger('form-submit-validate', [a, this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
        return this;
    }

    var q = $.param(a);

    if (options.type.toUpperCase() == 'GET') {
        options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
        options.data = null;  // data is null for 'get'
    }
    else
        options.data = q; // data is the query string for 'post'

    var $form = this, callbacks = [];
    if (options.resetForm) callbacks.push(function() { $form.resetForm(); });
    if (options.clearForm) callbacks.push(function() { $form.clearForm(); });

    // perform a load on the target only if dataType is not provided
    if (!options.dataType && options.target) {
        var oldSuccess = options.success || function(){};
        callbacks.push(function(data) {
            $(options.target).html(data).each(oldSuccess, arguments);
        });
    }
    else if (options.success)
        callbacks.push(options.success);

    options.success = function(data, status) {
        for (var i=0, max=callbacks.length; i < max; i++)
            callbacks[i].apply(options, [data, status, $form]);
    };

    // are there files to upload?
    var files = $('input:file', this).fieldValue();
    var found = false;
    for (var j=0; j < files.length; j++)
        if (files[j])
            found = true;

	var multipart = false;
//	var mp = 'multipart/form-data';
//	multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

    // options.iframe allows user to force iframe mode
   if (options.iframe || found || multipart) {
       // hack to fix Safari hang (thanks to Tim Molendijk for this)
       // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
       if (options.closeKeepAlive)
           $.get(options.closeKeepAlive, fileUpload);
       else
           fileUpload();
       }
   else
       $.ajax(options);

    // fire 'notify' event
    this.trigger('form-submit-notify', [this, options]);
    return this;


    // private function for handling file uploads (hat tip to YAHOO!)
    function fileUpload() {
        var form = $form[0];

        if ($(':input[name=submit]', form).length) {
            alert('Error: Form elements must not be named "submit".');
            return;
        }

        var opts = $.extend({}, $.ajaxSettings, options);
		var s = $.extend(true, {}, $.extend(true, {}, $.ajaxSettings), opts);

        var id = 'jqFormIO' + (new Date().getTime());
        var $io = $('<iframe id="' + id + '" name="' + id + '" src="about:blank" />');
        var io = $io[0];

        $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

        var xhr = { // mock object
            aborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {},
            abort: function() {
                this.aborted = 1;
                $io.attr('src','about:blank'); // abort op in progress
            }
        };

        var g = opts.global;
        // trigger ajax global events so that activity/block indicators work like normal
        if (g && ! $.active++) $.event.trigger("ajaxStart");
        if (g) $.event.trigger("ajaxSend", [xhr, opts]);

		if (s.beforeSend && s.beforeSend(xhr, s) === false) {
			s.global && $.active--;
			return;
        }
        if (xhr.aborted)
            return;

        var cbInvoked = 0;
        var timedOut = 0;

        // add submitting element to data if we know it
        var sub = form.clk;
        if (sub) {
            var n = sub.name;
            if (n && !sub.disabled) {
                options.extraData = options.extraData || {};
                options.extraData[n] = sub.value;
                if (sub.type == "image") {
                    options.extraData[name+'.x'] = form.clk_x;
                    options.extraData[name+'.y'] = form.clk_y;
                }
            }
        }

        // take a breath so that pending repaints get some cpu time before the upload starts
        setTimeout(function() {
            // make sure form attrs are set
            var t = $form.attr('target'), a = $form.attr('action');

			// update form attrs in IE friendly way
			form.setAttribute('target',id);
			if (form.getAttribute('method') != 'POST')
				form.setAttribute('method', 'POST');
			if (form.getAttribute('action') != opts.url)
				form.setAttribute('action', opts.url);

            // ie borks in some cases when setting encoding
            if (! options.skipEncodingOverride) {
                $form.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // support timout
            if (opts.timeout)
                setTimeout(function() { timedOut = true; cb(); }, opts.timeout);

            // add "extra" data to form if provided in options
            var extraInputs = [];
            try {
                if (options.extraData)
                    for (var n in options.extraData)
                        extraInputs.push(
                            $('<input type="hidden" name="'+n+'" value="'+options.extraData[n]+'" />')
                                .appendTo(form)[0]);

                // add iframe to doc and submit the form
                $io.appendTo('body');
                io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
                form.submit();
            }
            finally {
                // reset attrs and remove "extra" input elements
				form.setAttribute('action',a);
                t ? form.setAttribute('target', t) : $form.removeAttr('target');
                $(extraInputs).remove();
            }
        }, 10);

        var nullCheckFlag = 0;

        function cb() {
            if (cbInvoked++) return;

            io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);

            var ok = true;
            try {
                if (timedOut) throw 'timeout';
                // extract the server response from the iframe
                var data, doc;

                doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;

                if ((doc.body == null || doc.body.innerHTML == '') && !nullCheckFlag) {
                    // in some browsers (cough, Opera 9.2.x) the iframe DOM is not always traversable when
                    // the onload callback fires, so we give them a 2nd chance
                    nullCheckFlag = 1;
                    cbInvoked--;
                    setTimeout(cb, 100);
                    return;
                }

                xhr.responseText = doc.body ? doc.body.innerHTML : null;
                xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                xhr.getResponseHeader = function(header){
                    var headers = {'content-type': opts.dataType};
                    return headers[header];
                };

                if (opts.dataType == 'json' || opts.dataType == 'script') {
                    var ta = doc.getElementsByTagName('textarea')[0];
                    xhr.responseText = ta ? ta.value : xhr.responseText;
                }
                else if (opts.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
                    xhr.responseXML = toXml(xhr.responseText);
                }
                data = $.httpData(xhr, opts.dataType);
            }
            catch(e){
                ok = false;
                $.handleError(opts, xhr, 'error', e);
            }

            // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
            if (ok) {
                opts.success(data, 'success');
                if (g) $.event.trigger("ajaxSuccess", [xhr, opts]);
            }
            if (g) $.event.trigger("ajaxComplete", [xhr, opts]);
            if (g && ! --$.active) $.event.trigger("ajaxStop");
            if (opts.complete) opts.complete(xhr, ok ? 'success' : 'error');

            // clean up
            setTimeout(function() {
                $io.remove();
                xhr.responseXML = null;
            }, 100);
        };

        function toXml(s, doc) {
            if (window.ActiveXObject) {
                doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = 'false';
                doc.loadXML(s);
            }
            else
                doc = (new DOMParser()).parseFromString(s, 'text/xml');
            return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
        };
    };
};

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of ajaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *    is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *    used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.
 */
$.fn.ajaxForm = function(options) {
    return this.ajaxFormUnbind().bind('submit.form-plugin',function() {
        $(this).ajaxSubmit(options);
        return false;
    }).each(function() {
        // store options in hash
        $(":submit,input:image", this).bind('click.form-plugin',function(e) {
            var form = this.form;
            form.clk = this;
            if (this.type == 'image') {
                if (e.offsetX != undefined) {
                    form.clk_x = e.offsetX;
                    form.clk_y = e.offsetY;
                } else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
                    var offset = $(this).offset();
                    form.clk_x = e.pageX - offset.left;
                    form.clk_y = e.pageY - offset.top;
                } else {
                    form.clk_x = e.pageX - this.offsetLeft;
                    form.clk_y = e.pageY - this.offsetTop;
                }
            }
            // clear form vars
            setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 10);
        });
    });
};

// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
$.fn.ajaxFormUnbind = function() {
    this.unbind('submit.form-plugin');
    return this.each(function() {
        $(":submit,input:image", this).unbind('click.form-plugin');
    });

};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 */
$.fn.formToArray = function(semantic) {
    var a = [];
    if (this.length == 0) return a;

    var form = this[0];
    var els = semantic ? form.getElementsByTagName('*') : form.elements;
    if (!els) return a;
    for(var i=0, max=els.length; i < max; i++) {
        var el = els[i];
        var n = el.name;
        if (!n) continue;

        if (semantic && form.clk && el.type == "image") {
            // handle image inputs on the fly when semantic == true
            if(!el.disabled && form.clk == el) {
            	a.push({name: n, value: $(el).val()});
                a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
            }
            continue;
        }

        var v = $.fieldValue(el, true);
        if (v && v.constructor == Array) {
            for(var j=0, jmax=v.length; j < jmax; j++)
                a.push({name: n, value: v[j]});
        }
        else if (v !== null && typeof v != 'undefined')
            a.push({name: n, value: v});
    }

    if (!semantic && form.clk) {
        // input type=='image' are not found in elements array! handle it here
        var $input = $(form.clk), input = $input[0], n = input.name;
        if (n && !input.disabled && input.type == 'image') {
        	a.push({name: n, value: $input.val()});
            a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
        }
    }
    return a;
};

/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 */
$.fn.formSerialize = function(semantic) {
    //hand off to jQuery.param for proper encoding
    return $.param(this.formToArray(semantic));
};

/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 */
$.fn.fieldSerialize = function(successful) {
    var a = [];
    this.each(function() {
        var n = this.name;
        if (!n) return;
        var v = $.fieldValue(this, successful);
        if (v && v.constructor == Array) {
            for (var i=0,max=v.length; i < max; i++)
                a.push({name: n, value: v[i]});
        }
        else if (v !== null && typeof v != 'undefined')
            a.push({name: this.name, value: v});
    });
    //hand off to jQuery.param for proper encoding
    return $.param(a);
};

/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *      <input name="A" type="text" />
 *      <input name="A" type="text" />
 *      <input name="B" type="checkbox" value="B1" />
 *      <input name="B" type="checkbox" value="B2"/>
 *      <input name="C" type="radio" value="C1" />
 *      <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $(':text').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $(':checkbox').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $(':radio').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *       array will be empty, otherwise it will contain one or more values.
 */
$.fn.fieldValue = function(successful) {
    for (var val=[], i=0, max=this.length; i < max; i++) {
        var el = this[i];
        var v = $.fieldValue(el, successful);
        if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length))
            continue;
        v.constructor == Array ? $.merge(val, v) : val.push(v);
    }
    return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (typeof successful == 'undefined') successful = true;

    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1))
            return null;

    if (tag == 'select') {
        var index = el.selectedIndex;
        if (index < 0) return null;
        var a = [], ops = el.options;
        var one = (t == 'select-one');
        var max = (one ? index+1 : ops.length);
        for(var i=(one ? index : 0); i < max; i++) {
            var op = ops[i];
            if (op.selected) {
				var v = op.value;
				if (!v) // extra pain for IE...
                	v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
                if (one) return v;
                a.push(v);
            }
        }
        return a;
    }
    return el.value;
};

/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 */
$.fn.clearForm = function() {
    return this.each(function() {
        $('input,select,textarea', this).clearFields();
    });
};

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function() {
    return this.each(function() {
        var t = this.type, tag = this.tagName.toLowerCase();
        if (t == 'text' || t == 'password' || tag == 'textarea')
            this.value = '';
        else if (t == 'checkbox' || t == 'radio')
            this.checked = false;
        else if (tag == 'select')
            this.selectedIndex = -1;
    });
};

/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 */
$.fn.resetForm = function() {
    return this.each(function() {
        // guard against an input with the name of 'reset'
        // note that IE reports the reset function as an 'object'
        if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType))
            this.reset();
    });
};

/**
 * Enables or disables any matching elements.
 */
$.fn.enable = function(b) {
    if (b == undefined) b = true;
    return this.each(function() {
        this.disabled = !b;
    });
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 */
$.fn.selected = function(select) {
    if (select == undefined) select = true;
    return this.each(function() {
        var t = this.type;
        if (t == 'checkbox' || t == 'radio')
            this.checked = select;
        else if (this.tagName.toLowerCase() == 'option') {
            var $sel = $(this).parent('select');
            if (select && $sel[0] && $sel[0].type == 'select-one') {
                // deselect all other options
                $sel.find('option').selected(false);
            }
            this.selected = select;
        }
    });
};

// helper fn for console logging
// set $.fn.ajaxSubmit.debug to true to enable debug logging
function log() {
    if ($.fn.ajaxSubmit.debug && window.console && window.console.log)
        window.console.log('[jquery.form] ' + Array.prototype.join.call(arguments,''));
};

})(jQuery);
jQuery(function($) {

var MerchantAutocompleter = function(input, options, callback) {
  return this.init(input, options, callback);
}
MerchantAutocompleter.user_list = [];
MerchantAutocompleter.public_list = [];
MerchantAutocompleter.checks = [];
MerchantAutocompleter.loadMerchants = function() {
  $.ajax({url: '/merchants/my', dataType: 'json',
    success: function(data) { MerchantAutocompleter.user_list = data; }
  });
  $.ajax({url: '/merchants/public', dataType: 'json',
    success: function(data) { MerchantAutocompleter.public_list = data; }
  });
};

MerchantAutocompleter.isReady = function() {
  return MerchantAutocompleter.user_list.length && MerchantAutocompleter.public_list.length
};
MerchantAutocompleter.loadMerchants();
MerchantAutocompleter.prototype = {
  autocomplete: null,

  defaults: {
    queryDelay: 0,
    maxResultsDisplayed: 10,
    queryMatchContains: false,
    useIFrame: true,
    footer: null,
    showChecks: false,
    txactionURI: null
  },

  init: function(input, options, callback) {
    // YUI wants a container for the autocomplete, so create one
    var container = $('<div></div>');
    // explicitly set the container width to that of the element
    // assumes width and padding are in px
    if (input.css("width")) {
      var width = parseInt(input.css("width").replace('px',''));
      if (width > 0) {
        $.each(["padding-left", "padding-right"], function(_,attr) {
          width = width + parseInt(input.css(attr).replace('px',''));
        });
        container.css("width", width + "px");
      }
    }
    input.wrap('<div class="merchant-autocomplete"></div>"');
    input.after(container);

    this.autocomplete = new YAHOO.widget.AutoComplete(input[0], container[0],
      new YAHOO.util.FunctionDataSource(this.doQuery), options);

    if (options.footer) {
      this.autocomplete.setFooter('<div class="yui-ac-tip">' + options.footer + '</div>');
    }

    this.autocomplete.itemSelectEvent.subscribe(
      function(self, item, data) {
        input.focus();
        if (callback)
          callback(data);
      });

    // make the user's merchants bold
    this.autocomplete.formatResult = function(oResultData, sQuery, sResultMatch) {
      var sMarkup = (sResultMatch) ? sResultMatch : "";
      if (oResultData[1] == 0)
        sMarkup   = ["<b>", sMarkup, "</b>"].join('');
      return sMarkup;
    };

    if (options.showChecks) {
      this.loadChecks(options.txactionURI);
    }
  },

  doQuery : function(sQuery) {
    var results = [],
        klass = MerchantAutocompleter,
        i;

    // suggest checks if there are checks and there's a '-' query
    if (klass.checks.length >= 1 && sQuery === "-") {
      for (i=0; i < klass.checks.length; i++) {
        results.push([klass.checks[i],1]);
      }
      return results;
    }

    // finally search if if there's a query string
    sQuery = sQuery.toLowerCase();
    for (i=0; i < klass.user_list.length; i++) {
      var sIndex = encodeURIComponent(klass.user_list[i]).toLowerCase().indexOf(sQuery);
      if (sIndex == 0) {
        results.push([klass.user_list[i],0]);
      }
    }

    for (i=0; i < klass.public_list.length; i++) {
      var sIndex = encodeURIComponent(klass.public_list[i]).toLowerCase().indexOf(sQuery);
      if (sIndex == 0) {
        results.push([klass.public_list[i],1]);
      }
    }

    return results;
  },

  loadChecks: function(txactionURI) {
    var self = this;
    $.ajax({
      url: txactionURI+'/merchant_list_checks',
      dataType: 'json',
      success: function(data) {
        MerchantAutocompleter.checks = data;
        self.autocomplete.sendQuery("-");
      }
    });
  }
};

$.fn.extend({
  merchantAutocomplete: function(options, callback) {
    options = $.extend({}, MerchantAutocompleter.defaults, options);

    return this.each(function() {
      var self = $(this);
      var autocompleter = new MerchantAutocompleter(self, options, callback);
      self.data("autocompleter", autocompleter);
    });
  }
});

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
