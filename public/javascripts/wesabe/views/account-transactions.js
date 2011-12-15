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

        // TODO: show this only when the selection is a single account
        var quickEntry = new wesabe.views.widgets.transactions.QuickTransactionEntry($('#quick-transaction-entry'));

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

          //Hide manual entry if this account is a linked account
          var url = $.url('');
          if (url.segment(3) == "tags") {
              $('#quick-transaction-entry').show();
          } else {
              $('#quick-transaction-entry').hide();
          }
          var transactions = data.transactions || data['investment-transactions'];
		  transactions.reverse();
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
          //Scroll to top of page if we are not already there
          //$("#transactions").animate({scrollTop: 999999999}, "fast");
            
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
        var self = $(this),
            widget = self.data('widget'),
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
