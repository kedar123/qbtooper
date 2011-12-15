/**
 * Provides a base for all widgets that manage data-driven lists of things
 * identifiable by URI.
 */
wesabe.$class('wesabe.views.widgets.BaseListWidget', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;

  $.extend($class.prototype, {
    /**
     * true if zebra striping is enabled, false otherwise.
     *
     * @type {boolean}
     */
    stripingEnabled: false,

    _listElement: null,

    init: function(element, listElement) {
      $super.init.call(this, element);
      this.set('listElement', listElement);
    },

    /**
     * Gets the container for the list items.
     *
     * @return {element}
     */
    listElement: function() {
      return this._listElement || this.get('element');
    },

    /**
     * Sets the container to put the list items into.
     *
     * @param {element} listElement The list item container.
     */
    setListElement: function(listElement) {
      this._listElement = listElement;
    },

    /**
     * Gets the item associated with the given DOM element. If no matching item
     * is found this function returns null.
     *
     * @param {!element} element The DOM element to search for.
     * @return {BaseWidget}
     */
    getItemByElement: function(element) {
      var items = this.get('items'),
          length = items.length;

      while (length--)
        if ($.same(element, items[length].get('element')))
          return items[length];

      return null;
    },

    /**
     * Gets the item associated with the given URI, returning null
     * if no such item is found.
     *
     * @param {!string} uri A unique identifier for the item.
     * @return {BaseWidget}
     */
    getItemByURI: function(uri) {
      var items = this.get('items'),
          length = items.length;

      while (length--)
        if (items[length].get('uri') === uri)
          return items[length];

      return null;
    },

    /**
     * Gets an array of the child items.
     *
     * @return {Array.<BaseWidget>}
     */
    items: function() {
      if (!this._items) {
        this._items = [];
      }
      return this._items;
    },

    /**
     * Gets the child item at {index} or undefined if {index} is out of bounds.
     *
     * @param {!number} index
     * @return {BaseWidget}
     */
    getItem: function(index) {
      return this.get('items')[index];
    },

    /**
     * Removes the item at +index+.
     */
    removeItemAtIndex: function(index) {
      var items = this.get('items'),
          length = items.length;

      for (var i = index; i < length-1; i++)
        items[i] = items[i+1];

      items.length--;
    },

    /**
     * Replaces the current child items and their DOM elements with the given
     * list, updating in place where needed.
     *
     * @param {!Array.<BaseWidget>} items The replacements.
     */
    setItems: function(items) {
      var elements = [],
          stripe = this.get('stripingEnabled');

      for (var i = items.length; i--;) {
        var element = items[i].get('element');
        if (stripe) {
          var isEven = i % 2 == 0;
          element.addClass(isEven ? 'even' : 'odd')
            .removeClass(isEven ? 'odd' : 'even');
        }
        elements[i] = element[0];
      }

      if (this._items)
        for (var i = this._items.length; i--;)
          if (!array.contains(items, this._items[i]))
            this._items[i].remove();

      this._items = items;
      this.get('listElement').append(elements);
    },

    /**
     * Removes the existing child items from this list and from the DOM.
     */
    clear: function() {
      var items = this.get('items'),
          length = items.length;

      // prevent multiple reflows by hiding, clearing, then showing
      this.set('visible', false);
      while (length--)
        items.shift().remove();
      this.set('visible', true);
    },

    /**
     * Cleans up all references in this widget.
     */
    destroy: function() {
      // clean up all list items
      this.clear();

      // clean up everything else
      $super.destroy.apply(this, arguments);
    }
  });
});
