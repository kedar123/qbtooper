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
