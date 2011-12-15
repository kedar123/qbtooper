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
