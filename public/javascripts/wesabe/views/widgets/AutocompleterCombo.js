$.widget( "ui.combobox", {
  _create: function() {
    var self = this,
        select = this.element.hide(),
        select_el = select.get(0);
        var selectedIndex = select_el.selectedIndex;
        if(selectedIndex<0)
        {
          selectedIndex = 0;
        }
        var selected = $(select_el.options[selectedIndex]),
        value = selected.val() || selected.text();


    var updating = this.updating = $( "<div class='updating-cat'><img alt='' src='/images/maincontent/animated-gifs/uploading-spinner.gif'></div>" )
          .insertAfter( select ).hide();

    var input = this.input = $( "<input>" )
          .insertAfter( select )
          .val( value )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: function( request, response ) {
              var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
              var select_el = select.get(0); // get dom element
              var rep = new Array(); // response array
              // simple loop for the options
              for (var i = 0; i < select_el.length; i++) {
                var text = select_el.options[i].text;
                if ( select_el.options[i].value && ( !request.term || matcher.test(text) ) )
                  // add element to result array
                  rep.push({
                    label: text, // no more bold
                    value: text,
                    option: select_el.options[i]
                  });
              }
              // send response
              response( rep );
            },
            select: function( event, ui ) {
              ui.item.option.selected = true;
              self._trigger( "selected", event, {
                item: ui.item.option
              });
            },
            change: function( event, ui ) {
              if ( !ui.item ) {
                var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
                valid = false;
                select.children( "option" ).each(function() {
                  if ( $( this ).text().match( matcher ) ) {
                    this.selected = valid = true;
                    return false;
                  }
                });
                if ( !valid ) {
                  // remove invalid value, as it didn't match anything
                  $( this ).val( "" );
                  select.val( "" );
                  input.data( "autocomplete" ).term = "";
                  return false;
                }
              }
            }
          })
          .addClass( "ui-widget ui-widget-content ui-corner-left" );

    input.data( "autocomplete" )._renderItem = function( ul, item ) {
      return $( "<li></li>" )
               .data( "item.autocomplete", item )
               .append( "<a>" + item.label + "</a>" )
               .appendTo( ul );
    };

    input.val( $(select).children("option:selected").text() );

    this.button = $( "<button type='button'>&nbsp;</button>" )
                    .attr( "tabIndex", -1 )
                    .attr( "title", "Show All Items" )
                    .insertAfter( input )
                    .button({
                      icons: {
                        primary: "ui-icon-triangle-1-s"
                      },
                      text: false
                    })
                    .removeClass( "ui-corner-all" )
                    .addClass( "ui-corner-right ui-button-icon" )
                    .click(function() {
                      // close if already visible
                      if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                        input.autocomplete( "close" );
                        return;
                      }

                      // work around a bug (likely same cause as #5265)
                      $( this ).blur();

                      // pass empty string as value to search for, displaying all results
                      input.autocomplete( "search", "" );
                      input.focus();
                    });
  },

  setBusy: function(busy) {
    busy ? this.updating.show() : this.updating.hide();
  },

    //allows programmatic selection of combo using the option value
    setValue: function (value) {
        var $input = this.input;
        $("option", this.element).each(function () {
            if ($(this).val() == value) {
                this.selected = true;
                $input.val(this.text);
                return false;
            }
        });
    },

  destroy: function() {
    this.input.remove();
    this.button.remove();
    this.element.show();
    $.Widget.prototype.destroy.call( this );
  }
});
