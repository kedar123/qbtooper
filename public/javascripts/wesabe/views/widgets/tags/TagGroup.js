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
