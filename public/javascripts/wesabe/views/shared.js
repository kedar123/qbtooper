wesabe.provide('views.shared', {
  setCurrentTab: function(tab) {
    $("#global-nav .current-tab").removeClass("current-tab");
    $("#nav-" + tab).addClass("current-tab");
    return this;
  },

  setPageTitle: function(title) {
    document.title = "Cheqbook: " + title;
    return this;
  },

  navigateTo: function(location) {
    this.navigating = true;
    window.location = location;
    return this;
  },

  historyHash: function(parts) {
    var hash;

    if (typeof parts == 'string')
      parts = [parts];

    parts = parts.sort();
    for (var i = 0; i < parts.length; i++)
      parts[i] = encodeURIComponent(parts[i]
        // expand the hash part separator
        .replace(/,/g, '-comma-'))
        // unescape a few harmless characters to improve readability
        .replace(/%2f/gi, '/')
        .replace(/%3d/gi, '=');
    hash = parts.join(',');

    return hash;
  },

  parseState: function(stateString) {
    var path = null,
        search = null,
        params = {};

    if (!stateString) {
      var state = History.getState();
      if (state)
        stateString = state.url;
    }

    if (stateString) {
      var pathAndSearch = stateString.split('?');
      path = pathAndSearch[0];
      search = pathAndSearch[1];
    }

    if (path) {
      var index = path.indexOf('://');
      if (index != -1) {
        index = path.indexOf('/', index+3);
        path = (index == -1) ? '/' : path.substring(index);
      }
    } else {
      path = window.location.pathname;
    }

    if (!search)
      search = window.location.search;

    if (search) {
      var parts = search.split('&');

      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split('='),
            key = decodeURIComponent(pair[0]), value = decodeURIComponent(pair[1]);

        var m;

        if (m = key.match(/^(.+)\[\]$/)) {
          // id[]=1
          key = m[1];
          var arrayValue = params[key] || [];
          arrayValue.push(value);
          value = arrayValue;
        } else if (m = key.match(/^(.+)\[([^\]]+)\]$/)) {
          // name[first]=Frank
          key = m[1];
          var subkey = m[2];
          var hashValue = params[key] || {};
          hashValue[subkey] = value;
          value = hashValue;
        }

        params[key] = value;
      }
    }

    return {path: decodeURIComponent(path).replace(/\+/g, ' '), params: params};
  },

  pushState: function(state) {
    if (this.statesEqual(state, this.parseState()))
      return;

    var search = state.params && $.param(state.params),
        url = state.path;

    if (search)
      url += '?'+search;

    History.pushState(null, null, url);
  },

  statesEqual: function(state1, state2) {
    function equal(o1, o2) {
      if (o1 === o2)
        return true;

      if ($.isArray(o1)) {
        if (!$.isArray(o2) || (o1.length != o2.length))
          return false;

        for (var i = 0; i < o1.length; i++)
          if (!equal(o1[i], o2[i]))
            return false;
      } else if (typeof o1 == 'object') {
        var keys = {};

        for (var key in o1)
          if (o1.hasOwnProperty(key))
            keys[key] = true;
        for (var key in o2)
          if (o2.hasOwnProperty(key))
            keys[key] = true;

        for (var key in keys)
          if (keys.hasOwnProperty(key) && !equal(o1[key], o2[key]))
            return false;
      } else {
        return (''+o1) === (''+o2);
      }

      return true;
    }

    return equal(state1, state2);
  },

  addSearchListener: function(fn) {
    var input = $('#query');

    $('#nav-search').show();
    $("#searchform").submit(function(event) {
      event.preventDefault();
      fn(input.val());
      input.blur();
    });
    return this;
  },

  setSearch: function(search) {
    $('#query').val(search);
  },

  enableDefaultAccountsSearch: function() {
    var self = this;
    self.addSearchListener(function(event) {
      self.navigateTo('/accounts/search?q='+encodeURIComponent($('#query').val()));
    });
    return self;
  },

  enableDefaultAccountSidebarBehavior: function() {
    var self = this;
    wesabe.ready('wesabe.views.widgets.accounts.__instance__', function(accounts) {
      accounts.get('selection').bind('changed', function(_, selection) {
        self.navigateTo(selection[0].get('uri'));
      });
    });
    return self;
  },

  enableDefaultTagSidebarBehavior: function() {
    var self = this;
    wesabe.ready('wesabe.views.widgets.tags.__instance__', function() {
      wesabe.views.widgets.tags.__instance__.get('selection').bind('changed', function(_, selection) {
        self.navigateTo(selection[0].get('uri'));
      });
    });
    return self;
  },

  populateAccountsTab: function() {
    var accountListColumn = $('#nav-accounts .menu-content');
    var url = $.url('');

    wesabe.data.accounts.sharedDataSource.requestDataAndSubscribe(function(data) {
      accountListColumn.children().remove();
      var linkTo = function(object) {
        return $('<a></a>')
          .attr('href', object.uri)
          .text(object.name)
          .click(function(){ History.pushState(null, null, object.uri); });
      };
      $.each(data['account-groups'], function(i, group) {
        $('<li class="menu-head"></li>')
          .append(linkTo(group))
          .appendTo(accountListColumn);

        $.each(group.accounts, function(j, account) {
          if (account.company == url.segment(2)) {
            $('<li></li>')
              .append(linkTo(account))
              .appendTo(accountListColumn);
          }
        });
      });
    });
  },

  loggedIn: $.getsetdata('loggedIn')
});

$(function(){
  if (wesabe.views.shared.loggedIn())
    wesabe.views.shared.populateAccountsTab();

  $('#forgot-password-link')
    .click(function() {
      window.location = this.href+'?email='+encodeURIComponent($('#email').val());
      return false;
    });

  $('a.history-link').each(function() {
    new wesabe.views.widgets.HistoryLink($(this), this.href.replace(/^http(s)?:\/\/[^\/]+/,''));
  });

  // Highlight and show the sidebar link to this page if there is one
  $("#left a[href$='"+window.location.pathname+"']").parents("li:first").addClass("on")
    .parents("li.group").addClass("open");

  if ($('#accounts').length == 0) {
    // only set this up on non-accounts stuff, like Help or My Profile
    $("#left li.group h6, #left li.group .view").click(function(){
      $(this).parents("li:first").children("ul:first")
        .slideToggle("normal", function(){
          $(this).parents("li.group").toggleClass("open"); });
    });
  }

  // jQuery datepicker defaults
  $.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    defaultDate: null, // null means today
    duration:'fast',
    gotoCurrent:true,
    showAnim:'slideDown',
    showOn: 'both',
    yearRange: '-10:1'
  });
});
