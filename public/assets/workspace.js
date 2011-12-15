/*!
 * jQuery JavaScript Library v1.6.2
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Thu Jun 30 14:16:56 2011 -0400
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
  navigator = window.navigator,
  location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    return new jQuery.fn.init( selector, context, rootjQuery );
  },

  // Map over jQuery in case of overwrite
  _jQuery = window.jQuery,

  // Map over the $ in case of overwrite
  _$ = window.$,

  // A central reference to the root jQuery(document)
  rootjQuery,

  // A simple way to check for HTML strings or ID strings
  // (both of which we optimize for)
  quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

  // Check if a string has a non-whitespace character in it
  rnotwhite = /\S/,

  // Used for trimming whitespace
  trimLeft = /^\s+/,
  trimRight = /\s+$/,

  // Check for digits
  rdigit = /\d/,

  // Match a standalone tag
  rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

  // JSON RegExp
  rvalidchars = /^[\],:{}\s]*$/,
  rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
  rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
  rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

  // Useragent RegExp
  rwebkit = /(webkit)[ \/]([\w.]+)/,
  ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
  rmsie = /(msie) ([\w.]+)/,
  rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

  // Matches dashed string for camelizing
  rdashAlpha = /-([a-z])/ig,

  // Used by jQuery.camelCase as callback to replace()
  fcamelCase = function( all, letter ) {
    return letter.toUpperCase();
  },

  // Keep a UserAgent string for use with jQuery.browser
  userAgent = navigator.userAgent,

  // For matching the engine and version of the browser
  browserMatch,

  // The deferred used on DOM ready
  readyList,

  // The ready event handler
  DOMContentLoaded,

  // Save a reference to some core methods
  toString = Object.prototype.toString,
  hasOwn = Object.prototype.hasOwnProperty,
  push = Array.prototype.push,
  slice = Array.prototype.slice,
  trim = String.prototype.trim,
  indexOf = Array.prototype.indexOf,

  // [[Class]] -> type pairs
  class2type = {};

jQuery.fn = jQuery.prototype = {
  constructor: jQuery,
  init: function( selector, context, rootjQuery ) {
    var match, elem, ret, doc;

    // Handle $(""), $(null), or $(undefined)
    if ( !selector ) {
      return this;
    }

    // Handle $(DOMElement)
    if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;
    }

    // The body element only exists once, optimize finding it
    if ( selector === "body" && !context && document.body ) {
      this.context = document;
      this[0] = document.body;
      this.selector = selector;
      this.length = 1;
      return this;
    }

    // Handle HTML strings
    if ( typeof selector === "string" ) {
      // Are we dealing with HTML string or an ID?
      if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
        // Assume that strings that start and end with <> are HTML and skip the regex check
        match = [ null, selector, null ];

      } else {
        match = quickExpr.exec( selector );
      }

      // Verify a match, and that no context was specified for #id
      if ( match && (match[1] || !context) ) {

        // HANDLE: $(html) -> $(array)
        if ( match[1] ) {
          context = context instanceof jQuery ? context[0] : context;
          doc = (context ? context.ownerDocument || context : document);

          // If a single string is passed in and it's a single tag
          // just do a createElement and skip the rest
          ret = rsingleTag.exec( selector );

          if ( ret ) {
            if ( jQuery.isPlainObject( context ) ) {
              selector = [ document.createElement( ret[1] ) ];
              jQuery.fn.attr.call( selector, context, true );

            } else {
              selector = [ doc.createElement( ret[1] ) ];
            }

          } else {
            ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
            selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
          }

          return jQuery.merge( this, selector );

        // HANDLE: $("#id")
        } else {
          elem = document.getElementById( match[2] );

          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE and Opera return items
            // by name instead of ID
            if ( elem.id !== match[2] ) {
              return rootjQuery.find( selector );
            }

            // Otherwise, we inject the element directly into the jQuery object
            this.length = 1;
            this[0] = elem;
          }

          this.context = document;
          this.selector = selector;
          return this;
        }

      // HANDLE: $(expr, $(...))
      } else if ( !context || context.jquery ) {
        return (context || rootjQuery).find( selector );

      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        return this.constructor( context ).find( selector );
      }

    // HANDLE: $(function)
    // Shortcut for document ready
    } else if ( jQuery.isFunction( selector ) ) {
      return rootjQuery.ready( selector );
    }

    if (selector.selector !== undefined) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    return jQuery.makeArray( selector, this );
  },

  // Start with an empty selector
  selector: "",

  // The current version of jQuery being used
  jquery: "1.6.2",

  // The default length of a jQuery object is 0
  length: 0,

  // The number of elements contained in the matched element set
  size: function() {
    return this.length;
  },

  toArray: function() {
    return slice.call( this, 0 );
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  get: function( num ) {
    return num == null ?

      // Return a 'clean' array
      this.toArray() :

      // Return just the object
      ( num < 0 ? this[ this.length + num ] : this[ num ] );
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  pushStack: function( elems, name, selector ) {
    // Build a new jQuery matched element set
    var ret = this.constructor();

    if ( jQuery.isArray( elems ) ) {
      push.apply( ret, elems );

    } else {
      jQuery.merge( ret, elems );
    }

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    ret.context = this.context;

    if ( name === "find" ) {
      ret.selector = this.selector + (this.selector ? " " : "") + selector;
    } else if ( name ) {
      ret.selector = this.selector + "." + name + "(" + selector + ")";
    }

    // Return the newly-formed element set
    return ret;
  },

  // Execute a callback for every element in the matched set.
  // (You can seed the arguments with an array of args, but this is
  // only used internally.)
  each: function( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  ready: function( fn ) {
    // Attach the listeners
    jQuery.bindReady();

    // Add the callback
    readyList.done( fn );

    return this;
  },

  eq: function( i ) {
    return i === -1 ?
      this.slice( i ) :
      this.slice( i, +i + 1 );
  },

  first: function() {
    return this.eq( 0 );
  },

  last: function() {
    return this.eq( -1 );
  },

  slice: function() {
    return this.pushStack( slice.apply( this, arguments ),
      "slice", slice.call(arguments).join(",") );
  },

  map: function( callback ) {
    return this.pushStack( jQuery.map(this, function( elem, i ) {
      return callback.call( elem, i, elem );
    }));
  },

  end: function() {
    return this.prevObject || this.constructor(null);
  },

  // For internal use only.
  // Behaves like an Array's method, not like a jQuery method.
  push: push,
  sort: [].sort,
  splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : [];

          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = jQuery.extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jQuery.extend({
  noConflict: function( deep ) {
    if ( window.$ === jQuery ) {
      window.$ = _$;
    }

    if ( deep && window.jQuery === jQuery ) {
      window.jQuery = _jQuery;
    }

    return jQuery;
  },

  // Is the DOM ready to be used? Set to true once it occurs.
  isReady: false,

  // A counter to track how many items to wait for before
  // the ready event fires. See #6781
  readyWait: 1,

  // Hold (or release) the ready event
  holdReady: function( hold ) {
    if ( hold ) {
      jQuery.readyWait++;
    } else {
      jQuery.ready( true );
    }
  },

  // Handle when the DOM is ready
  ready: function( wait ) {
    // Either a released hold or an DOMready/load event and not yet ready
    if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
      // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
      if ( !document.body ) {
        return setTimeout( jQuery.ready, 1 );
      }

      // Remember that the DOM is ready
      jQuery.isReady = true;

      // If a normal DOM Ready event fired, decrement, and wait if need be
      if ( wait !== true && --jQuery.readyWait > 0 ) {
        return;
      }

      // If there are functions bound, to execute
      readyList.resolveWith( document, [ jQuery ] );

      // Trigger any bound ready events
      if ( jQuery.fn.trigger ) {
        jQuery( document ).trigger( "ready" ).unbind( "ready" );
      }
    }
  },

  bindReady: function() {
    if ( readyList ) {
      return;
    }

    readyList = jQuery._Deferred();

    // Catch cases where $(document).ready() is called after the
    // browser event has already occurred.
    if ( document.readyState === "complete" ) {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      return setTimeout( jQuery.ready, 1 );
    }

    // Mozilla, Opera and webkit nightlies currently support this event
    if ( document.addEventListener ) {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

      // A fallback to window.onload, that will always work
      window.addEventListener( "load", jQuery.ready, false );

    // If IE event model is used
    } else if ( document.attachEvent ) {
      // ensure firing before onload,
      // maybe late but safe also for iframes
      document.attachEvent( "onreadystatechange", DOMContentLoaded );

      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", jQuery.ready );

      // If IE and not a frame
      // continually check to see if the document is ready
      var toplevel = false;

      try {
        toplevel = window.frameElement == null;
      } catch(e) {}

      if ( document.documentElement.doScroll && toplevel ) {
        doScrollCheck();
      }
    }
  },

  // See test/unit/core.js for details concerning isFunction.
  // Since version 1.3, DOM methods and functions like alert
  // aren't supported. They return false on IE (#2968).
  isFunction: function( obj ) {
    return jQuery.type(obj) === "function";
  },

  isArray: Array.isArray || function( obj ) {
    return jQuery.type(obj) === "array";
  },

  // A crude way of determining if an object is a window
  isWindow: function( obj ) {
    return obj && typeof obj === "object" && "setInterval" in obj;
  },

  isNaN: function( obj ) {
    return obj == null || !rdigit.test( obj ) || isNaN( obj );
  },

  type: function( obj ) {
    return obj == null ?
      String( obj ) :
      class2type[ toString.call(obj) ] || "object";
  },

  isPlainObject: function( obj ) {
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
      return false;
    }

    // Not own constructor property must be Object
    if ( obj.constructor &&
      !hasOwn.call(obj, "constructor") &&
      !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
  },

  isEmptyObject: function( obj ) {
    for ( var name in obj ) {
      return false;
    }
    return true;
  },

  error: function( msg ) {
    throw msg;
  },

  parseJSON: function( data ) {
    if ( typeof data !== "string" || !data ) {
      return null;
    }

    // Make sure leading/trailing whitespace is removed (IE can't handle it)
    data = jQuery.trim( data );

    // Attempt to parse using the native JSON parser first
    if ( window.JSON && window.JSON.parse ) {
      return window.JSON.parse( data );
    }

    // Make sure the incoming data is actual JSON
    // Logic borrowed from http://json.org/json2.js
    if ( rvalidchars.test( data.replace( rvalidescape, "@" )
      .replace( rvalidtokens, "]" )
      .replace( rvalidbraces, "")) ) {

      return (new Function( "return " + data ))();

    }
    jQuery.error( "Invalid JSON: " + data );
  },

  // Cross-browser xml parsing
  // (xml & tmp used internally)
  parseXML: function( data , xml , tmp ) {

    if ( window.DOMParser ) { // Standard
      tmp = new DOMParser();
      xml = tmp.parseFromString( data , "text/xml" );
    } else { // IE
      xml = new ActiveXObject( "Microsoft.XMLDOM" );
      xml.async = "false";
      xml.loadXML( data );
    }

    tmp = xml.documentElement;

    if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
      jQuery.error( "Invalid XML: " + data );
    }

    return xml;
  },

  noop: function() {},

  // Evaluates a script in a global context
  // Workarounds based on findings by Jim Driscoll
  // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
  globalEval: function( data ) {
    if ( data && rnotwhite.test( data ) ) {
      // We use execScript on Internet Explorer
      // We use an anonymous function so that context is window
      // rather than jQuery in Firefox
      ( window.execScript || function( data ) {
        window[ "eval" ].call( window, data );
      } )( data );
    }
  },

  // Converts a dashed string to camelCased string;
  // Used by both the css and data modules
  camelCase: function( string ) {
    return string.replace( rdashAlpha, fcamelCase );
  },

  nodeName: function( elem, name ) {
    return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
  },

  // args is for internal usage only
  each: function( object, callback, args ) {
    var name, i = 0,
      length = object.length,
      isObj = length === undefined || jQuery.isFunction( object );

    if ( args ) {
      if ( isObj ) {
        for ( name in object ) {
          if ( callback.apply( object[ name ], args ) === false ) {
            break;
          }
        }
      } else {
        for ( ; i < length; ) {
          if ( callback.apply( object[ i++ ], args ) === false ) {
            break;
          }
        }
      }

    // A special, fast, case for the most common use of each
    } else {
      if ( isObj ) {
        for ( name in object ) {
          if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
            break;
          }
        }
      } else {
        for ( ; i < length; ) {
          if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
            break;
          }
        }
      }
    }

    return object;
  },

  // Use native String.trim function wherever possible
  trim: trim ?
    function( text ) {
      return text == null ?
        "" :
        trim.call( text );
    } :

    // Otherwise use our own trimming functionality
    function( text ) {
      return text == null ?
        "" :
        text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
    },

  // results is for internal usage only
  makeArray: function( array, results ) {
    var ret = results || [];

    if ( array != null ) {
      // The window, strings (and functions) also have 'length'
      // The extra typeof function check is to prevent crashes
      // in Safari 2 (See: #3039)
      // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
      var type = jQuery.type( array );

      if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
        push.call( ret, array );
      } else {
        jQuery.merge( ret, array );
      }
    }

    return ret;
  },

  inArray: function( elem, array ) {

    if ( indexOf ) {
      return indexOf.call( array, elem );
    }

    for ( var i = 0, length = array.length; i < length; i++ ) {
      if ( array[ i ] === elem ) {
        return i;
      }
    }

    return -1;
  },

  merge: function( first, second ) {
    var i = first.length,
      j = 0;

    if ( typeof second.length === "number" ) {
      for ( var l = second.length; j < l; j++ ) {
        first[ i++ ] = second[ j ];
      }

    } else {
      while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
      }
    }

    first.length = i;

    return first;
  },

  grep: function( elems, callback, inv ) {
    var ret = [], retVal;
    inv = !!inv;

    // Go through the array, only saving the items
    // that pass the validator function
    for ( var i = 0, length = elems.length; i < length; i++ ) {
      retVal = !!callback( elems[ i ], i );
      if ( inv !== retVal ) {
        ret.push( elems[ i ] );
      }
    }

    return ret;
  },

  // arg is for internal usage only
  map: function( elems, callback, arg ) {
    var value, key, ret = [],
      i = 0,
      length = elems.length,
      // jquery objects are treated as arrays
      isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

    // Go through the array, translating each of the items to their
    if ( isArray ) {
      for ( ; i < length; i++ ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }

    // Go through every key on the object,
    } else {
      for ( key in elems ) {
        value = callback( elems[ key ], key, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }
    }

    // Flatten any nested arrays
    return ret.concat.apply( [], ret );
  },

  // A global GUID counter for objects
  guid: 1,

  // Bind a function to a context, optionally partially applying any
  // arguments.
  proxy: function( fn, context ) {
    if ( typeof context === "string" ) {
      var tmp = fn[ context ];
      context = fn;
      fn = tmp;
    }

    // Quick check to determine if target is callable, in the spec
    // this throws a TypeError, but we will just return undefined.
    if ( !jQuery.isFunction( fn ) ) {
      return undefined;
    }

    // Simulated bind
    var args = slice.call( arguments, 2 ),
      proxy = function() {
        return fn.apply( context, args.concat( slice.call( arguments ) ) );
      };

    // Set the guid of unique handler to the same of original handler, so it can be removed
    proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

    return proxy;
  },

  // Mutifunctional method to get and set values to a collection
  // The value/s can optionally be executed if it's a function
  access: function( elems, key, value, exec, fn, pass ) {
    var length = elems.length;

    // Setting many attributes
    if ( typeof key === "object" ) {
      for ( var k in key ) {
        jQuery.access( elems, k, key[k], exec, fn, value );
      }
      return elems;
    }

    // Setting one attribute
    if ( value !== undefined ) {
      // Optionally, function values get executed if exec is true
      exec = !pass && exec && jQuery.isFunction(value);

      for ( var i = 0; i < length; i++ ) {
        fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
      }

      return elems;
    }

    // Getting an attribute
    return length ? fn( elems[0], key ) : undefined;
  },

  now: function() {
    return (new Date()).getTime();
  },

  // Use of jQuery.browser is frowned upon.
  // More details: http://docs.jquery.com/Utilities/jQuery.browser
  uaMatch: function( ua ) {
    ua = ua.toLowerCase();

    var match = rwebkit.exec( ua ) ||
      ropera.exec( ua ) ||
      rmsie.exec( ua ) ||
      ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
      [];

    return { browser: match[1] || "", version: match[2] || "0" };
  },

  sub: function() {
    function jQuerySub( selector, context ) {
      return new jQuerySub.fn.init( selector, context );
    }
    jQuery.extend( true, jQuerySub, this );
    jQuerySub.superclass = this;
    jQuerySub.fn = jQuerySub.prototype = this();
    jQuerySub.fn.constructor = jQuerySub;
    jQuerySub.sub = this.sub;
    jQuerySub.fn.init = function init( selector, context ) {
      if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
        context = jQuerySub( context );
      }

      return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
    };
    jQuerySub.fn.init.prototype = jQuerySub.fn;
    var rootjQuerySub = jQuerySub(document);
    return jQuerySub;
  },

  browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
  class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
  jQuery.browser[ browserMatch.browser ] = true;
  jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
  jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
  trimLeft = /^[\s\xA0]+/;
  trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
  DOMContentLoaded = function() {
    document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
    jQuery.ready();
  };

} else if ( document.attachEvent ) {
  DOMContentLoaded = function() {
    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
    if ( document.readyState === "complete" ) {
      document.detachEvent( "onreadystatechange", DOMContentLoaded );
      jQuery.ready();
    }
  };
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
  if ( jQuery.isReady ) {
    return;
  }

  try {
    // If IE is used, use the trick by Diego Perini
    // http://javascript.nwbox.com/IEContentLoaded/
    document.documentElement.doScroll("left");
  } catch(e) {
    setTimeout( doScrollCheck, 1 );
    return;
  }

  // and execute any waiting functions
  jQuery.ready();
}

return jQuery;

})();


var // Promise methods
  promiseMethods = "done fail isResolved isRejected promise then always pipe".split( " " ),
  // Static reference to slice
  sliceDeferred = [].slice;

jQuery.extend({
  // Create a simple deferred (one callbacks list)
  _Deferred: function() {
    var // callbacks list
      callbacks = [],
      // stored [ context , args ]
      fired,
      // to avoid firing when already doing so
      firing,
      // flag to know if the deferred has been cancelled
      cancelled,
      // the deferred itself
      deferred  = {

        // done( f1, f2, ...)
        done: function() {
          if ( !cancelled ) {
            var args = arguments,
              i,
              length,
              elem,
              type,
              _fired;
            if ( fired ) {
              _fired = fired;
              fired = 0;
            }
            for ( i = 0, length = args.length; i < length; i++ ) {
              elem = args[ i ];
              type = jQuery.type( elem );
              if ( type === "array" ) {
                deferred.done.apply( deferred, elem );
              } else if ( type === "function" ) {
                callbacks.push( elem );
              }
            }
            if ( _fired ) {
              deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
            }
          }
          return this;
        },

        // resolve with given context and args
        resolveWith: function( context, args ) {
          if ( !cancelled && !fired && !firing ) {
            // make sure args are available (#8421)
            args = args || [];
            firing = 1;
            try {
              while( callbacks[ 0 ] ) {
                callbacks.shift().apply( context, args );
              }
            }
            finally {
              fired = [ context, args ];
              firing = 0;
            }
          }
          return this;
        },

        // resolve with this as context and given arguments
        resolve: function() {
          deferred.resolveWith( this, arguments );
          return this;
        },

        // Has this deferred been resolved?
        isResolved: function() {
          return !!( firing || fired );
        },

        // Cancel
        cancel: function() {
          cancelled = 1;
          callbacks = [];
          return this;
        }
      };

    return deferred;
  },

  // Full fledged deferred (two callbacks list)
  Deferred: function( func ) {
    var deferred = jQuery._Deferred(),
      failDeferred = jQuery._Deferred(),
      promise;
    // Add errorDeferred methods, then and promise
    jQuery.extend( deferred, {
      then: function( doneCallbacks, failCallbacks ) {
        deferred.done( doneCallbacks ).fail( failCallbacks );
        return this;
      },
      always: function() {
        return deferred.done.apply( deferred, arguments ).fail.apply( this, arguments );
      },
      fail: failDeferred.done,
      rejectWith: failDeferred.resolveWith,
      reject: failDeferred.resolve,
      isRejected: failDeferred.isResolved,
      pipe: function( fnDone, fnFail ) {
        return jQuery.Deferred(function( newDefer ) {
          jQuery.each( {
            done: [ fnDone, "resolve" ],
            fail: [ fnFail, "reject" ]
          }, function( handler, data ) {
            var fn = data[ 0 ],
              action = data[ 1 ],
              returned;
            if ( jQuery.isFunction( fn ) ) {
              deferred[ handler ](function() {
                returned = fn.apply( this, arguments );
                if ( returned && jQuery.isFunction( returned.promise ) ) {
                  returned.promise().then( newDefer.resolve, newDefer.reject );
                } else {
                  newDefer[ action ]( returned );
                }
              });
            } else {
              deferred[ handler ]( newDefer[ action ] );
            }
          });
        }).promise();
      },
      // Get a promise for this deferred
      // If obj is provided, the promise aspect is added to the object
      promise: function( obj ) {
        if ( obj == null ) {
          if ( promise ) {
            return promise;
          }
          promise = obj = {};
        }
        var i = promiseMethods.length;
        while( i-- ) {
          obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ];
        }
        return obj;
      }
    });
    // Make sure only one callback list will be used
    deferred.done( failDeferred.cancel ).fail( deferred.cancel );
    // Unexpose cancel
    delete deferred.cancel;
    // Call given func if any
    if ( func ) {
      func.call( deferred, deferred );
    }
    return deferred;
  },

  // Deferred helper
  when: function( firstParam ) {
    var args = arguments,
      i = 0,
      length = args.length,
      count = length,
      deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
        firstParam :
        jQuery.Deferred();
    function resolveFunc( i ) {
      return function( value ) {
        args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
        if ( !( --count ) ) {
          // Strange bug in FF4:
          // Values changed onto the arguments object sometimes end up as undefined values
          // outside the $.when method. Cloning the object into a fresh array solves the issue
          deferred.resolveWith( deferred, sliceDeferred.call( args, 0 ) );
        }
      };
    }
    if ( length > 1 ) {
      for( ; i < length; i++ ) {
        if ( args[ i ] && jQuery.isFunction( args[ i ].promise ) ) {
          args[ i ].promise().then( resolveFunc(i), deferred.reject );
        } else {
          --count;
        }
      }
      if ( !count ) {
        deferred.resolveWith( deferred, args );
      }
    } else if ( deferred !== firstParam ) {
      deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
    }
    return deferred.promise();
  }
});



jQuery.support = (function() {

  var div = document.createElement( "div" ),
    documentElement = document.documentElement,
    all,
    a,
    select,
    opt,
    input,
    marginDiv,
    support,
    fragment,
    body,
    testElementParent,
    testElement,
    testElementStyle,
    tds,
    events,
    eventName,
    i,
    isSupported;

  // Preliminary tests
  div.setAttribute("className", "t");
  div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

  all = div.getElementsByTagName( "*" );
  a = div.getElementsByTagName( "a" )[ 0 ];

  // Can't get basic test support
  if ( !all || !all.length || !a ) {
    return {};
  }

  // First batch of supports tests
  select = document.createElement( "select" );
  opt = select.appendChild( document.createElement("option") );
  input = div.getElementsByTagName( "input" )[ 0 ];

  support = {
    // IE strips leading whitespace when .innerHTML is used
    leadingWhitespace: ( div.firstChild.nodeType === 3 ),

    // Make sure that tbody elements aren't automatically inserted
    // IE will insert them into empty tables
    tbody: !div.getElementsByTagName( "tbody" ).length,

    // Make sure that link elements get serialized correctly by innerHTML
    // This requires a wrapper element in IE
    htmlSerialize: !!div.getElementsByTagName( "link" ).length,

    // Get the style information from getAttribute
    // (IE uses .cssText instead)
    style: /top/.test( a.getAttribute("style") ),

    // Make sure that URLs aren't manipulated
    // (IE normalizes it by default)
    hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

    // Make sure that element opacity exists
    // (IE uses filter instead)
    // Use a regex to work around a WebKit issue. See #5145
    opacity: /^0.55$/.test( a.style.opacity ),

    // Verify style float existence
    // (IE uses styleFloat instead of cssFloat)
    cssFloat: !!a.style.cssFloat,

    // Make sure that if no value is specified for a checkbox
    // that it defaults to "on".
    // (WebKit defaults to "" instead)
    checkOn: ( input.value === "on" ),

    // Make sure that a selected-by-default option has a working selected property.
    // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
    optSelected: opt.selected,

    // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
    getSetAttribute: div.className !== "t",

    // Will be defined later
    submitBubbles: true,
    changeBubbles: true,
    focusinBubbles: false,
    deleteExpando: true,
    noCloneEvent: true,
    inlineBlockNeedsLayout: false,
    shrinkWrapBlocks: false,
    reliableMarginRight: true
  };

  // Make sure checked status is properly cloned
  input.checked = true;
  support.noCloneChecked = input.cloneNode( true ).checked;

  // Make sure that the options inside disabled selects aren't marked as disabled
  // (WebKit marks them as disabled)
  select.disabled = true;
  support.optDisabled = !opt.disabled;

  // Test to see if it's possible to delete an expando from an element
  // Fails in Internet Explorer
  try {
    delete div.test;
  } catch( e ) {
    support.deleteExpando = false;
  }

  if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
    div.attachEvent( "onclick", function() {
      // Cloning a node shouldn't copy over any
      // bound event handlers (IE does this)
      support.noCloneEvent = false;
    });
    div.cloneNode( true ).fireEvent( "onclick" );
  }

  // Check if a radio maintains it's value
  // after being appended to the DOM
  input = document.createElement("input");
  input.value = "t";
  input.setAttribute("type", "radio");
  support.radioValue = input.value === "t";

  input.setAttribute("checked", "checked");
  div.appendChild( input );
  fragment = document.createDocumentFragment();
  fragment.appendChild( div.firstChild );

  // WebKit doesn't clone checked state correctly in fragments
  support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

  div.innerHTML = "";

  // Figure out if the W3C box model works as expected
  div.style.width = div.style.paddingLeft = "1px";

  body = document.getElementsByTagName( "body" )[ 0 ];
  // We use our own, invisible, body unless the body is already present
  // in which case we use a div (#9239)
  testElement = document.createElement( body ? "div" : "body" );
  testElementStyle = {
    visibility: "hidden",
    width: 0,
    height: 0,
    border: 0,
    margin: 0
  };
  if ( body ) {
    jQuery.extend( testElementStyle, {
      position: "absolute",
      left: -1000,
      top: -1000
    });
  }
  for ( i in testElementStyle ) {
    testElement.style[ i ] = testElementStyle[ i ];
  }
  testElement.appendChild( div );
  testElementParent = body || documentElement;
  testElementParent.insertBefore( testElement, testElementParent.firstChild );

  // Check if a disconnected checkbox will retain its checked
  // value of true after appended to the DOM (IE6/7)
  support.appendChecked = input.checked;

  support.boxModel = div.offsetWidth === 2;

  if ( "zoom" in div.style ) {
    // Check if natively block-level elements act like inline-block
    // elements when setting their display to 'inline' and giving
    // them layout
    // (IE < 8 does this)
    div.style.display = "inline";
    div.style.zoom = 1;
    support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

    // Check if elements with layout shrink-wrap their children
    // (IE 6 does this)
    div.style.display = "";
    div.innerHTML = "<div style='width:4px;'></div>";
    support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
  }

  div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
  tds = div.getElementsByTagName( "td" );

  // Check if table cells still have offsetWidth/Height when they are set
  // to display:none and there are still other visible table cells in a
  // table row; if so, offsetWidth/Height are not reliable for use when
  // determining if an element has been hidden directly using
  // display:none (it is still safe to use offsets if a parent element is
  // hidden; don safety goggles and see bug #4512 for more information).
  // (only IE 8 fails this test)
  isSupported = ( tds[ 0 ].offsetHeight === 0 );

  tds[ 0 ].style.display = "";
  tds[ 1 ].style.display = "none";

  // Check if empty table cells still have offsetWidth/Height
  // (IE < 8 fail this test)
  support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
  div.innerHTML = "";

  // Check if div with explicit width and no margin-right incorrectly
  // gets computed margin-right based on width of container. For more
  // info see bug #3333
  // Fails in WebKit before Feb 2011 nightlies
  // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
  if ( document.defaultView && document.defaultView.getComputedStyle ) {
    marginDiv = document.createElement( "div" );
    marginDiv.style.width = "0";
    marginDiv.style.marginRight = "0";
    div.appendChild( marginDiv );
    support.reliableMarginRight =
      ( parseInt( ( document.defaultView.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
  }

  // Remove the body element we added
  testElement.innerHTML = "";
  testElementParent.removeChild( testElement );

  // Technique from Juriy Zaytsev
  // http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
  // We only care about the case where non-standard event systems
  // are used, namely in IE. Short-circuiting here helps us to
  // avoid an eval call (in setAttribute) which can cause CSP
  // to go haywire. See: https://developer.mozilla.org/en/Security/CSP
  if ( div.attachEvent ) {
    for( i in {
      submit: 1,
      change: 1,
      focusin: 1
    } ) {
      eventName = "on" + i;
      isSupported = ( eventName in div );
      if ( !isSupported ) {
        div.setAttribute( eventName, "return;" );
        isSupported = ( typeof div[ eventName ] === "function" );
      }
      support[ i + "Bubbles" ] = isSupported;
    }
  }

  // Null connected elements to avoid leaks in IE
  testElement = fragment = select = opt = body = marginDiv = div = input = null;

  return support;
})();

// Keep track of boxModel
jQuery.boxModel = jQuery.support.boxModel;




var rbrace = /^(?:\{.*\}|\[.*\])$/,
  rmultiDash = /([a-z])([A-Z])/g;

jQuery.extend({
  cache: {},

  // Please use with caution
  uuid: 0,

  // Unique for each copy of jQuery on the page
  // Non-digits removed to match rinlinejQuery
  expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

  // The following elements throw uncatchable exceptions if you
  // attempt to add expando properties to them.
  noData: {
    "embed": true,
    // Ban all objects except for Flash (which handle expandos)
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
    "applet": true
  },

  hasData: function( elem ) {
    elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];

    return !!elem && !isEmptyDataObject( elem );
  },

  data: function( elem, name, data, pvt /* Internal Use Only */ ) {
    if ( !jQuery.acceptData( elem ) ) {
      return;
    }

    var internalKey = jQuery.expando, getByName = typeof name === "string", thisCache,

      // We have to handle DOM nodes and JS objects differently because IE6-7
      // can't GC object references properly across the DOM-JS boundary
      isNode = elem.nodeType,

      // Only DOM nodes need the global jQuery cache; JS object data is
      // attached directly to the object so GC can occur automatically
      cache = isNode ? jQuery.cache : elem,

      // Only defining an ID for JS objects if its cache already exists allows
      // the code to shortcut on the same path as a DOM node with no cache
      id = isNode ? elem[ jQuery.expando ] : elem[ jQuery.expando ] && jQuery.expando;

    // Avoid doing any more work than we need to when trying to get data on an
    // object that has no data at all
    if ( (!id || (pvt && id && !cache[ id ][ internalKey ])) && getByName && data === undefined ) {
      return;
    }

    if ( !id ) {
      // Only DOM nodes need a new unique ID for each element since their data
      // ends up in the global cache
      if ( isNode ) {
        elem[ jQuery.expando ] = id = ++jQuery.uuid;
      } else {
        id = jQuery.expando;
      }
    }

    if ( !cache[ id ] ) {
      cache[ id ] = {};

      // TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
      // metadata on plain JS objects when the object is serialized using
      // JSON.stringify
      if ( !isNode ) {
        cache[ id ].toJSON = jQuery.noop;
      }
    }

    // An object can be passed to jQuery.data instead of a key/value pair; this gets
    // shallow copied over onto the existing cache
    if ( typeof name === "object" || typeof name === "function" ) {
      if ( pvt ) {
        cache[ id ][ internalKey ] = jQuery.extend(cache[ id ][ internalKey ], name);
      } else {
        cache[ id ] = jQuery.extend(cache[ id ], name);
      }
    }

    thisCache = cache[ id ];

    // Internal jQuery data is stored in a separate object inside the object's data
    // cache in order to avoid key collisions between internal data and user-defined
    // data
    if ( pvt ) {
      if ( !thisCache[ internalKey ] ) {
        thisCache[ internalKey ] = {};
      }

      thisCache = thisCache[ internalKey ];
    }

    if ( data !== undefined ) {
      thisCache[ jQuery.camelCase( name ) ] = data;
    }

    // TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
    // not attempt to inspect the internal events object using jQuery.data, as this
    // internal data object is undocumented and subject to change.
    if ( name === "events" && !thisCache[name] ) {
      return thisCache[ internalKey ] && thisCache[ internalKey ].events;
    }

    return getByName ? 
      // Check for both converted-to-camel and non-converted data property names
      thisCache[ jQuery.camelCase( name ) ] || thisCache[ name ] :
      thisCache;
  },

  removeData: function( elem, name, pvt /* Internal Use Only */ ) {
    if ( !jQuery.acceptData( elem ) ) {
      return;
    }

    var internalKey = jQuery.expando, isNode = elem.nodeType,

      // See jQuery.data for more information
      cache = isNode ? jQuery.cache : elem,

      // See jQuery.data for more information
      id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

    // If there is already no cache entry for this object, there is no
    // purpose in continuing
    if ( !cache[ id ] ) {
      return;
    }

    if ( name ) {
      var thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

      if ( thisCache ) {
        delete thisCache[ name ];

        // If there is no data left in the cache, we want to continue
        // and let the cache object itself get destroyed
        if ( !isEmptyDataObject(thisCache) ) {
          return;
        }
      }
    }

    // See jQuery.data for more information
    if ( pvt ) {
      delete cache[ id ][ internalKey ];

      // Don't destroy the parent cache unless the internal data object
      // had been the only thing left in it
      if ( !isEmptyDataObject(cache[ id ]) ) {
        return;
      }
    }

    var internalCache = cache[ id ][ internalKey ];

    // Browsers that fail expando deletion also refuse to delete expandos on
    // the window, but it will allow it on all other JS objects; other browsers
    // don't care
    if ( jQuery.support.deleteExpando || cache != window ) {
      delete cache[ id ];
    } else {
      cache[ id ] = null;
    }

    // We destroyed the entire user cache at once because it's faster than
    // iterating through each key, but we need to continue to persist internal
    // data if it existed
    if ( internalCache ) {
      cache[ id ] = {};
      // TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
      // metadata on plain JS objects when the object is serialized using
      // JSON.stringify
      if ( !isNode ) {
        cache[ id ].toJSON = jQuery.noop;
      }

      cache[ id ][ internalKey ] = internalCache;

    // Otherwise, we need to eliminate the expando on the node to avoid
    // false lookups in the cache for entries that no longer exist
    } else if ( isNode ) {
      // IE does not allow us to delete expando properties from nodes,
      // nor does it have a removeAttribute function on Document nodes;
      // we must handle all of these cases
      if ( jQuery.support.deleteExpando ) {
        delete elem[ jQuery.expando ];
      } else if ( elem.removeAttribute ) {
        elem.removeAttribute( jQuery.expando );
      } else {
        elem[ jQuery.expando ] = null;
      }
    }
  },

  // For internal use only.
  _data: function( elem, name, data ) {
    return jQuery.data( elem, name, data, true );
  },

  // A method for determining if a DOM node can handle the data expando
  acceptData: function( elem ) {
    if ( elem.nodeName ) {
      var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

      if ( match ) {
        return !(match === true || elem.getAttribute("classid") !== match);
      }
    }

    return true;
  }
});

jQuery.fn.extend({
  data: function( key, value ) {
    var data = null;

    if ( typeof key === "undefined" ) {
      if ( this.length ) {
        data = jQuery.data( this[0] );

        if ( this[0].nodeType === 1 ) {
          var attr = this[0].attributes, name;
          for ( var i = 0, l = attr.length; i < l; i++ ) {
            name = attr[i].name;

            if ( name.indexOf( "data-" ) === 0 ) {
              name = jQuery.camelCase( name.substring(5) );

              dataAttr( this[0], name, data[ name ] );
            }
          }
        }
      }

      return data;

    } else if ( typeof key === "object" ) {
      return this.each(function() {
        jQuery.data( this, key );
      });
    }

    var parts = key.split(".");
    parts[1] = parts[1] ? "." + parts[1] : "";

    if ( value === undefined ) {
      data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

      // Try to fetch any internally stored data first
      if ( data === undefined && this.length ) {
        data = jQuery.data( this[0], key );
        data = dataAttr( this[0], key, data );
      }

      return data === undefined && parts[1] ?
        this.data( parts[0] ) :
        data;

    } else {
      return this.each(function() {
        var $this = jQuery( this ),
          args = [ parts[0], value ];

        $this.triggerHandler( "setData" + parts[1] + "!", args );
        jQuery.data( this, key, value );
        $this.triggerHandler( "changeData" + parts[1] + "!", args );
      });
    }
  },

  removeData: function( key ) {
    return this.each(function() {
      jQuery.removeData( this, key );
    });
  }
});

function dataAttr( elem, key, data ) {
  // If nothing was found internally, try to fetch any
  // data from the HTML5 data-* attribute
  if ( data === undefined && elem.nodeType === 1 ) {
    var name = "data-" + key.replace( rmultiDash, "$1-$2" ).toLowerCase();

    data = elem.getAttribute( name );

    if ( typeof data === "string" ) {
      try {
        data = data === "true" ? true :
        data === "false" ? false :
        data === "null" ? null :
        !jQuery.isNaN( data ) ? parseFloat( data ) :
          rbrace.test( data ) ? jQuery.parseJSON( data ) :
          data;
      } catch( e ) {}

      // Make sure we set the data so it isn't changed later
      jQuery.data( elem, key, data );

    } else {
      data = undefined;
    }
  }

  return data;
}

// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
// property to be considered empty objects; this property always exists in
// order to make sure JSON.stringify does not expose internal metadata
function isEmptyDataObject( obj ) {
  for ( var name in obj ) {
    if ( name !== "toJSON" ) {
      return false;
    }
  }

  return true;
}




function handleQueueMarkDefer( elem, type, src ) {
  var deferDataKey = type + "defer",
    queueDataKey = type + "queue",
    markDataKey = type + "mark",
    defer = jQuery.data( elem, deferDataKey, undefined, true );
  if ( defer &&
    ( src === "queue" || !jQuery.data( elem, queueDataKey, undefined, true ) ) &&
    ( src === "mark" || !jQuery.data( elem, markDataKey, undefined, true ) ) ) {
    // Give room for hard-coded callbacks to fire first
    // and eventually mark/queue something else on the element
    setTimeout( function() {
      if ( !jQuery.data( elem, queueDataKey, undefined, true ) &&
        !jQuery.data( elem, markDataKey, undefined, true ) ) {
        jQuery.removeData( elem, deferDataKey, true );
        defer.resolve();
      }
    }, 0 );
  }
}

jQuery.extend({

  _mark: function( elem, type ) {
    if ( elem ) {
      type = (type || "fx") + "mark";
      jQuery.data( elem, type, (jQuery.data(elem,type,undefined,true) || 0) + 1, true );
    }
  },

  _unmark: function( force, elem, type ) {
    if ( force !== true ) {
      type = elem;
      elem = force;
      force = false;
    }
    if ( elem ) {
      type = type || "fx";
      var key = type + "mark",
        count = force ? 0 : ( (jQuery.data( elem, key, undefined, true) || 1 ) - 1 );
      if ( count ) {
        jQuery.data( elem, key, count, true );
      } else {
        jQuery.removeData( elem, key, true );
        handleQueueMarkDefer( elem, type, "mark" );
      }
    }
  },

  queue: function( elem, type, data ) {
    if ( elem ) {
      type = (type || "fx") + "queue";
      var q = jQuery.data( elem, type, undefined, true );
      // Speed up dequeue by getting out quickly if this is just a lookup
      if ( data ) {
        if ( !q || jQuery.isArray(data) ) {
          q = jQuery.data( elem, type, jQuery.makeArray(data), true );
        } else {
          q.push( data );
        }
      }
      return q || [];
    }
  },

  dequeue: function( elem, type ) {
    type = type || "fx";

    var queue = jQuery.queue( elem, type ),
      fn = queue.shift(),
      defer;

    // If the fx queue is dequeued, always remove the progress sentinel
    if ( fn === "inprogress" ) {
      fn = queue.shift();
    }

    if ( fn ) {
      // Add a progress sentinel to prevent the fx queue from being
      // automatically dequeued
      if ( type === "fx" ) {
        queue.unshift("inprogress");
      }

      fn.call(elem, function() {
        jQuery.dequeue(elem, type);
      });
    }

    if ( !queue.length ) {
      jQuery.removeData( elem, type + "queue", true );
      handleQueueMarkDefer( elem, type, "queue" );
    }
  }
});

jQuery.fn.extend({
  queue: function( type, data ) {
    if ( typeof type !== "string" ) {
      data = type;
      type = "fx";
    }

    if ( data === undefined ) {
      return jQuery.queue( this[0], type );
    }
    return this.each(function() {
      var queue = jQuery.queue( this, type, data );

      if ( type === "fx" && queue[0] !== "inprogress" ) {
        jQuery.dequeue( this, type );
      }
    });
  },
  dequeue: function( type ) {
    return this.each(function() {
      jQuery.dequeue( this, type );
    });
  },
  // Based off of the plugin by Clint Helfers, with permission.
  // http://blindsignals.com/index.php/2009/07/jquery-delay/
  delay: function( time, type ) {
    time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
    type = type || "fx";

    return this.queue( type, function() {
      var elem = this;
      setTimeout(function() {
        jQuery.dequeue( elem, type );
      }, time );
    });
  },
  clearQueue: function( type ) {
    return this.queue( type || "fx", [] );
  },
  // Get a promise resolved when queues of a certain type
  // are emptied (fx is the type by default)
  promise: function( type, object ) {
    if ( typeof type !== "string" ) {
      object = type;
      type = undefined;
    }
    type = type || "fx";
    var defer = jQuery.Deferred(),
      elements = this,
      i = elements.length,
      count = 1,
      deferDataKey = type + "defer",
      queueDataKey = type + "queue",
      markDataKey = type + "mark",
      tmp;
    function resolve() {
      if ( !( --count ) ) {
        defer.resolveWith( elements, [ elements ] );
      }
    }
    while( i-- ) {
      if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
          ( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
            jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
          jQuery.data( elements[ i ], deferDataKey, jQuery._Deferred(), true ) )) {
        count++;
        tmp.done( resolve );
      }
    }
    resolve();
    return defer.promise();
  }
});




var rclass = /[\n\t\r]/g,
  rspace = /\s+/,
  rreturn = /\r/g,
  rtype = /^(?:button|input)$/i,
  rfocusable = /^(?:button|input|object|select|textarea)$/i,
  rclickable = /^a(?:rea)?$/i,
  rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
  rinvalidChar = /\:|^on/,
  formHook, boolHook;

jQuery.fn.extend({
  attr: function( name, value ) {
    return jQuery.access( this, name, value, true, jQuery.attr );
  },

  removeAttr: function( name ) {
    return this.each(function() {
      jQuery.removeAttr( this, name );
    });
  },
  
  prop: function( name, value ) {
    return jQuery.access( this, name, value, true, jQuery.prop );
  },
  
  removeProp: function( name ) {
    name = jQuery.propFix[ name ] || name;
    return this.each(function() {
      // try/catch handles cases where IE balks (such as removing a property on window)
      try {
        this[ name ] = undefined;
        delete this[ name ];
      } catch( e ) {}
    });
  },

  addClass: function( value ) {
    var classNames, i, l, elem,
      setClass, c, cl;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).addClass( value.call(this, j, this.className) );
      });
    }

    if ( value && typeof value === "string" ) {
      classNames = value.split( rspace );

      for ( i = 0, l = this.length; i < l; i++ ) {
        elem = this[ i ];

        if ( elem.nodeType === 1 ) {
          if ( !elem.className && classNames.length === 1 ) {
            elem.className = value;

          } else {
            setClass = " " + elem.className + " ";

            for ( c = 0, cl = classNames.length; c < cl; c++ ) {
              if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
                setClass += classNames[ c ] + " ";
              }
            }
            elem.className = jQuery.trim( setClass );
          }
        }
      }
    }

    return this;
  },

  removeClass: function( value ) {
    var classNames, i, l, elem, className, c, cl;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).removeClass( value.call(this, j, this.className) );
      });
    }

    if ( (value && typeof value === "string") || value === undefined ) {
      classNames = (value || "").split( rspace );

      for ( i = 0, l = this.length; i < l; i++ ) {
        elem = this[ i ];

        if ( elem.nodeType === 1 && elem.className ) {
          if ( value ) {
            className = (" " + elem.className + " ").replace( rclass, " " );
            for ( c = 0, cl = classNames.length; c < cl; c++ ) {
              className = className.replace(" " + classNames[ c ] + " ", " ");
            }
            elem.className = jQuery.trim( className );

          } else {
            elem.className = "";
          }
        }
      }
    }

    return this;
  },

  toggleClass: function( value, stateVal ) {
    var type = typeof value,
      isBool = typeof stateVal === "boolean";

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( i ) {
        jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
      });
    }

    return this.each(function() {
      if ( type === "string" ) {
        // toggle individual class names
        var className,
          i = 0,
          self = jQuery( this ),
          state = stateVal,
          classNames = value.split( rspace );

        while ( (className = classNames[ i++ ]) ) {
          // check each className given, space seperated list
          state = isBool ? state : !self.hasClass( className );
          self[ state ? "addClass" : "removeClass" ]( className );
        }

      } else if ( type === "undefined" || type === "boolean" ) {
        if ( this.className ) {
          // store className if set
          jQuery._data( this, "__className__", this.className );
        }

        // toggle whole className
        this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
      }
    });
  },

  hasClass: function( selector ) {
    var className = " " + selector + " ";
    for ( var i = 0, l = this.length; i < l; i++ ) {
      if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
        return true;
      }
    }

    return false;
  },

  val: function( value ) {
    var hooks, ret,
      elem = this[0];
    
    if ( !arguments.length ) {
      if ( elem ) {
        hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

        if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
          return ret;
        }

        ret = elem.value;

        return typeof ret === "string" ? 
          // handle most common string cases
          ret.replace(rreturn, "") : 
          // handle cases where value is null/undef or number
          ret == null ? "" : ret;
      }

      return undefined;
    }

    var isFunction = jQuery.isFunction( value );

    return this.each(function( i ) {
      var self = jQuery(this), val;

      if ( this.nodeType !== 1 ) {
        return;
      }

      if ( isFunction ) {
        val = value.call( this, i, self.val() );
      } else {
        val = value;
      }

      // Treat null/undefined as ""; convert numbers to string
      if ( val == null ) {
        val = "";
      } else if ( typeof val === "number" ) {
        val += "";
      } else if ( jQuery.isArray( val ) ) {
        val = jQuery.map(val, function ( value ) {
          return value == null ? "" : value + "";
        });
      }

      hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

      // If set returns undefined, fall back to normal setting
      if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
        this.value = val;
      }
    });
  }
});

jQuery.extend({
  valHooks: {
    option: {
      get: function( elem ) {
        // attributes.value is undefined in Blackberry 4.7 but
        // uses .value. See #6932
        var val = elem.attributes.value;
        return !val || val.specified ? elem.value : elem.text;
      }
    },
    select: {
      get: function( elem ) {
        var value,
          index = elem.selectedIndex,
          values = [],
          options = elem.options,
          one = elem.type === "select-one";

        // Nothing was selected
        if ( index < 0 ) {
          return null;
        }

        // Loop through all the selected options
        for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
          var option = options[ i ];

          // Don't return options that are disabled or in a disabled optgroup
          if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
              (!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

            // Get the specific value for the option
            value = jQuery( option ).val();

            // We don't need an array for one selects
            if ( one ) {
              return value;
            }

            // Multi-Selects return an array
            values.push( value );
          }
        }

        // Fixes Bug #2551 -- select.val() broken in IE after form.reset()
        if ( one && !values.length && options.length ) {
          return jQuery( options[ index ] ).val();
        }

        return values;
      },

      set: function( elem, value ) {
        var values = jQuery.makeArray( value );

        jQuery(elem).find("option").each(function() {
          this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
        });

        if ( !values.length ) {
          elem.selectedIndex = -1;
        }
        return values;
      }
    }
  },

  attrFn: {
    val: true,
    css: true,
    html: true,
    text: true,
    data: true,
    width: true,
    height: true,
    offset: true
  },
  
  attrFix: {
    // Always normalize to ensure hook usage
    tabindex: "tabIndex"
  },
  
  attr: function( elem, name, value, pass ) {
    var nType = elem.nodeType;
    
    // don't get/set attributes on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return undefined;
    }

    if ( pass && name in jQuery.attrFn ) {
      return jQuery( elem )[ name ]( value );
    }

    // Fallback to prop when attributes are not supported
    if ( !("getAttribute" in elem) ) {
      return jQuery.prop( elem, name, value );
    }

    var ret, hooks,
      notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

    // Normalize the name if needed
    if ( notxml ) {
      name = jQuery.attrFix[ name ] || name;

      hooks = jQuery.attrHooks[ name ];

      if ( !hooks ) {
        // Use boolHook for boolean attributes
        if ( rboolean.test( name ) ) {

          hooks = boolHook;

        // Use formHook for forms and if the name contains certain characters
        } else if ( formHook && name !== "className" &&
          (jQuery.nodeName( elem, "form" ) || rinvalidChar.test( name )) ) {

          hooks = formHook;
        }
      }
    }

    if ( value !== undefined ) {

      if ( value === null ) {
        jQuery.removeAttr( elem, name );
        return undefined;

      } else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
        return ret;

      } else {
        elem.setAttribute( name, "" + value );
        return value;
      }

    } else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
      return ret;

    } else {

      ret = elem.getAttribute( name );

      // Non-existent attributes return null, we normalize to undefined
      return ret === null ?
        undefined :
        ret;
    }
  },

  removeAttr: function( elem, name ) {
    var propName;
    if ( elem.nodeType === 1 ) {
      name = jQuery.attrFix[ name ] || name;
    
      if ( jQuery.support.getSetAttribute ) {
        // Use removeAttribute in browsers that support it
        elem.removeAttribute( name );
      } else {
        jQuery.attr( elem, name, "" );
        elem.removeAttributeNode( elem.getAttributeNode( name ) );
      }

      // Set corresponding property to false for boolean attributes
      if ( rboolean.test( name ) && (propName = jQuery.propFix[ name ] || name) in elem ) {
        elem[ propName ] = false;
      }
    }
  },

  attrHooks: {
    type: {
      set: function( elem, value ) {
        // We can't allow the type property to be changed (since it causes problems in IE)
        if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
          jQuery.error( "type property can't be changed" );
        } else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
          // Setting the type on a radio button after the value resets the value in IE6-9
          // Reset value to it's default in case type is set after value
          // This is for element creation
          var val = elem.value;
          elem.setAttribute( "type", value );
          if ( val ) {
            elem.value = val;
          }
          return value;
        }
      }
    },
    tabIndex: {
      get: function( elem ) {
        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        var attributeNode = elem.getAttributeNode("tabIndex");

        return attributeNode && attributeNode.specified ?
          parseInt( attributeNode.value, 10 ) :
          rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
            0 :
            undefined;
      }
    },
    // Use the value property for back compat
    // Use the formHook for button elements in IE6/7 (#1954)
    value: {
      get: function( elem, name ) {
        if ( formHook && jQuery.nodeName( elem, "button" ) ) {
          return formHook.get( elem, name );
        }
        return name in elem ?
          elem.value :
          null;
      },
      set: function( elem, value, name ) {
        if ( formHook && jQuery.nodeName( elem, "button" ) ) {
          return formHook.set( elem, value, name );
        }
        // Does not return so that setAttribute is also used
        elem.value = value;
      }
    }
  },

  propFix: {
    tabindex: "tabIndex",
    readonly: "readOnly",
    "for": "htmlFor",
    "class": "className",
    maxlength: "maxLength",
    cellspacing: "cellSpacing",
    cellpadding: "cellPadding",
    rowspan: "rowSpan",
    colspan: "colSpan",
    usemap: "useMap",
    frameborder: "frameBorder",
    contenteditable: "contentEditable"
  },
  
  prop: function( elem, name, value ) {
    var nType = elem.nodeType;

    // don't get/set properties on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return undefined;
    }

    var ret, hooks,
      notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

    if ( notxml ) {
      // Fix name and attach hooks
      name = jQuery.propFix[ name ] || name;
      hooks = jQuery.propHooks[ name ];
    }

    if ( value !== undefined ) {
      if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
        return ret;

      } else {
        return (elem[ name ] = value);
      }

    } else {
      if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== undefined ) {
        return ret;

      } else {
        return elem[ name ];
      }
    }
  },
  
  propHooks: {}
});

// Hook for boolean attributes
boolHook = {
  get: function( elem, name ) {
    // Align boolean attributes with corresponding properties
    return jQuery.prop( elem, name ) ?
      name.toLowerCase() :
      undefined;
  },
  set: function( elem, value, name ) {
    var propName;
    if ( value === false ) {
      // Remove boolean attributes when set to false
      jQuery.removeAttr( elem, name );
    } else {
      // value is true since we know at this point it's type boolean and not false
      // Set boolean attributes to the same name and set the DOM property
      propName = jQuery.propFix[ name ] || name;
      if ( propName in elem ) {
        // Only set the IDL specifically if it already exists on the element
        elem[ propName ] = true;
      }

      elem.setAttribute( name, name.toLowerCase() );
    }
    return name;
  }
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !jQuery.support.getSetAttribute ) {

  // propFix is more comprehensive and contains all fixes
  jQuery.attrFix = jQuery.propFix;
  
  // Use this for any attribute on a form in IE6/7
  formHook = jQuery.attrHooks.name = jQuery.attrHooks.title = jQuery.valHooks.button = {
    get: function( elem, name ) {
      var ret;
      ret = elem.getAttributeNode( name );
      // Return undefined if nodeValue is empty string
      return ret && ret.nodeValue !== "" ?
        ret.nodeValue :
        undefined;
    },
    set: function( elem, value, name ) {
      // Check form objects in IE (multiple bugs related)
      // Only use nodeValue if the attribute node exists on the form
      var ret = elem.getAttributeNode( name );
      if ( ret ) {
        ret.nodeValue = value;
        return value;
      }
    }
  };

  // Set width and height to auto instead of 0 on empty string( Bug #8150 )
  // This is for removals
  jQuery.each([ "width", "height" ], function( i, name ) {
    jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
      set: function( elem, value ) {
        if ( value === "" ) {
          elem.setAttribute( name, "auto" );
          return value;
        }
      }
    });
  });
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
  jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
    jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
      get: function( elem ) {
        var ret = elem.getAttribute( name, 2 );
        return ret === null ? undefined : ret;
      }
    });
  });
}

if ( !jQuery.support.style ) {
  jQuery.attrHooks.style = {
    get: function( elem ) {
      // Return undefined in the case of empty string
      // Normalize to lowercase since IE uppercases css property names
      return elem.style.cssText.toLowerCase() || undefined;
    },
    set: function( elem, value ) {
      return (elem.style.cssText = "" + value);
    }
  };
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
  jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
    get: function( elem ) {
      var parent = elem.parentNode;

      if ( parent ) {
        parent.selectedIndex;

        // Make sure that it also works with optgroups, see #5701
        if ( parent.parentNode ) {
          parent.parentNode.selectedIndex;
        }
      }
    }
  });
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
  jQuery.each([ "radio", "checkbox" ], function() {
    jQuery.valHooks[ this ] = {
      get: function( elem ) {
        // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
        return elem.getAttribute("value") === null ? "on" : elem.value;
      }
    };
  });
}
jQuery.each([ "radio", "checkbox" ], function() {
  jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
    set: function( elem, value ) {
      if ( jQuery.isArray( value ) ) {
        return (elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0);
      }
    }
  });
});




var rnamespaces = /\.(.*)$/,
  rformElems = /^(?:textarea|input|select)$/i,
  rperiod = /\./g,
  rspaces = / /g,
  rescape = /[^\w\s.|`]/g,
  fcleanup = function( nm ) {
    return nm.replace(rescape, "\\$&");
  };

/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

  // Bind an event to an element
  // Original by Dean Edwards
  add: function( elem, types, handler, data ) {
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    if ( handler === false ) {
      handler = returnFalse;
    } else if ( !handler ) {
      // Fixes bug #7229. Fix recommended by jdalton
      return;
    }

    var handleObjIn, handleObj;

    if ( handler.handler ) {
      handleObjIn = handler;
      handler = handleObjIn.handler;
    }

    // Make sure that the function being executed has a unique ID
    if ( !handler.guid ) {
      handler.guid = jQuery.guid++;
    }

    // Init the element's event structure
    var elemData = jQuery._data( elem );

    // If no elemData is found then we must be trying to bind to one of the
    // banned noData elements
    if ( !elemData ) {
      return;
    }

    var events = elemData.events,
      eventHandle = elemData.handle;

    if ( !events ) {
      elemData.events = events = {};
    }

    if ( !eventHandle ) {
      elemData.handle = eventHandle = function( e ) {
        // Discard the second event of a jQuery.event.trigger() and
        // when an event is called after a page has unloaded
        return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
          jQuery.event.handle.apply( eventHandle.elem, arguments ) :
          undefined;
      };
    }

    // Add elem as a property of the handle function
    // This is to prevent a memory leak with non-native events in IE.
    eventHandle.elem = elem;

    // Handle multiple events separated by a space
    // jQuery(...).bind("mouseover mouseout", fn);
    types = types.split(" ");

    var type, i = 0, namespaces;

    while ( (type = types[ i++ ]) ) {
      handleObj = handleObjIn ?
        jQuery.extend({}, handleObjIn) :
        { handler: handler, data: data };

      // Namespaced event handlers
      if ( type.indexOf(".") > -1 ) {
        namespaces = type.split(".");
        type = namespaces.shift();
        handleObj.namespace = namespaces.slice(0).sort().join(".");

      } else {
        namespaces = [];
        handleObj.namespace = "";
      }

      handleObj.type = type;
      if ( !handleObj.guid ) {
        handleObj.guid = handler.guid;
      }

      // Get the current list of functions bound to this event
      var handlers = events[ type ],
        special = jQuery.event.special[ type ] || {};

      // Init the event handler queue
      if ( !handlers ) {
        handlers = events[ type ] = [];

        // Check for a special event handler
        // Only use addEventListener/attachEvent if the special
        // events handler returns false
        if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
          // Bind the global event handler to the element
          if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle, false );

          } else if ( elem.attachEvent ) {
            elem.attachEvent( "on" + type, eventHandle );
          }
        }
      }

      if ( special.add ) {
        special.add.call( elem, handleObj );

        if ( !handleObj.handler.guid ) {
          handleObj.handler.guid = handler.guid;
        }
      }

      // Add the function to the element's handler list
      handlers.push( handleObj );

      // Keep track of which events have been used, for event optimization
      jQuery.event.global[ type ] = true;
    }

    // Nullify elem to prevent memory leaks in IE
    elem = null;
  },

  global: {},

  // Detach an event or set of events from an element
  remove: function( elem, types, handler, pos ) {
    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    if ( handler === false ) {
      handler = returnFalse;
    }

    var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
      elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
      events = elemData && elemData.events;

    if ( !elemData || !events ) {
      return;
    }

    // types is actually an event object here
    if ( types && types.type ) {
      handler = types.handler;
      types = types.type;
    }

    // Unbind all events for the element
    if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
      types = types || "";

      for ( type in events ) {
        jQuery.event.remove( elem, type + types );
      }

      return;
    }

    // Handle multiple events separated by a space
    // jQuery(...).unbind("mouseover mouseout", fn);
    types = types.split(" ");

    while ( (type = types[ i++ ]) ) {
      origType = type;
      handleObj = null;
      all = type.indexOf(".") < 0;
      namespaces = [];

      if ( !all ) {
        // Namespaced event handlers
        namespaces = type.split(".");
        type = namespaces.shift();

        namespace = new RegExp("(^|\\.)" +
          jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)");
      }

      eventType = events[ type ];

      if ( !eventType ) {
        continue;
      }

      if ( !handler ) {
        for ( j = 0; j < eventType.length; j++ ) {
          handleObj = eventType[ j ];

          if ( all || namespace.test( handleObj.namespace ) ) {
            jQuery.event.remove( elem, origType, handleObj.handler, j );
            eventType.splice( j--, 1 );
          }
        }

        continue;
      }

      special = jQuery.event.special[ type ] || {};

      for ( j = pos || 0; j < eventType.length; j++ ) {
        handleObj = eventType[ j ];

        if ( handler.guid === handleObj.guid ) {
          // remove the given handler for the given type
          if ( all || namespace.test( handleObj.namespace ) ) {
            if ( pos == null ) {
              eventType.splice( j--, 1 );
            }

            if ( special.remove ) {
              special.remove.call( elem, handleObj );
            }
          }

          if ( pos != null ) {
            break;
          }
        }
      }

      // remove generic event handler if no more handlers exist
      if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
        if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
          jQuery.removeEvent( elem, type, elemData.handle );
        }

        ret = null;
        delete events[ type ];
      }
    }

    // Remove the expando if it's no longer used
    if ( jQuery.isEmptyObject( events ) ) {
      var handle = elemData.handle;
      if ( handle ) {
        handle.elem = null;
      }

      delete elemData.events;
      delete elemData.handle;

      if ( jQuery.isEmptyObject( elemData ) ) {
        jQuery.removeData( elem, undefined, true );
      }
    }
  },
  
  // Events that are safe to short-circuit if no handlers are attached.
  // Native DOM events should not be added, they may have inline handlers.
  customEvent: {
    "getData": true,
    "setData": true,
    "changeData": true
  },

  trigger: function( event, data, elem, onlyHandlers ) {
    // Event object or event type
    var type = event.type || event,
      namespaces = [],
      exclusive;

    if ( type.indexOf("!") >= 0 ) {
      // Exclusive events trigger only for the exact event (no namespaces)
      type = type.slice(0, -1);
      exclusive = true;
    }

    if ( type.indexOf(".") >= 0 ) {
      // Namespaced trigger; create a regexp to match event type in handle()
      namespaces = type.split(".");
      type = namespaces.shift();
      namespaces.sort();
    }

    if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
      // No jQuery handlers for this event type, and it can't have inline handlers
      return;
    }

    // Caller can pass in an Event, Object, or just an event type string
    event = typeof event === "object" ?
      // jQuery.Event object
      event[ jQuery.expando ] ? event :
      // Object literal
      new jQuery.Event( type, event ) :
      // Just the event type (string)
      new jQuery.Event( type );

    event.type = type;
    event.exclusive = exclusive;
    event.namespace = namespaces.join(".");
    event.namespace_re = new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)");
    
    // triggerHandler() and global events don't bubble or run the default action
    if ( onlyHandlers || !elem ) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Handle a global trigger
    if ( !elem ) {
      // TODO: Stop taunting the data cache; remove global events and always attach to document
      jQuery.each( jQuery.cache, function() {
        // internalKey variable is just used to make it easier to find
        // and potentially change this stuff later; currently it just
        // points to jQuery.expando
        var internalKey = jQuery.expando,
          internalCache = this[ internalKey ];
        if ( internalCache && internalCache.events && internalCache.events[ type ] ) {
          jQuery.event.trigger( event, data, internalCache.handle.elem );
        }
      });
      return;
    }

    // Don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    // Clean up the event in case it is being reused
    event.result = undefined;
    event.target = elem;

    // Clone any incoming data and prepend the event, creating the handler arg list
    data = data != null ? jQuery.makeArray( data ) : [];
    data.unshift( event );

    var cur = elem,
      // IE doesn't like method names with a colon (#3533, #8272)
      ontype = type.indexOf(":") < 0 ? "on" + type : "";

    // Fire event on the current element, then bubble up the DOM tree
    do {
      var handle = jQuery._data( cur, "handle" );

      event.currentTarget = cur;
      if ( handle ) {
        handle.apply( cur, data );
      }

      // Trigger an inline bound script
      if ( ontype && jQuery.acceptData( cur ) && cur[ ontype ] && cur[ ontype ].apply( cur, data ) === false ) {
        event.result = false;
        event.preventDefault();
      }

      // Bubble up to document, then to window
      cur = cur.parentNode || cur.ownerDocument || cur === event.target.ownerDocument && window;
    } while ( cur && !event.isPropagationStopped() );

    // If nobody prevented the default action, do it now
    if ( !event.isDefaultPrevented() ) {
      var old,
        special = jQuery.event.special[ type ] || {};

      if ( (!special._default || special._default.call( elem.ownerDocument, event ) === false) &&
        !(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

        // Call a native DOM method on the target with the same name name as the event.
        // Can't use an .isFunction)() check here because IE6/7 fails that test.
        // IE<9 dies on focus to hidden element (#1486), may want to revisit a try/catch.
        try {
          if ( ontype && elem[ type ] ) {
            // Don't re-trigger an onFOO event when we call its FOO() method
            old = elem[ ontype ];

            if ( old ) {
              elem[ ontype ] = null;
            }

            jQuery.event.triggered = type;
            elem[ type ]();
          }
        } catch ( ieError ) {}

        if ( old ) {
          elem[ ontype ] = old;
        }

        jQuery.event.triggered = undefined;
      }
    }
    
    return event.result;
  },

  handle: function( event ) {
    event = jQuery.event.fix( event || window.event );
    // Snapshot the handlers list since a called handler may add/remove events.
    var handlers = ((jQuery._data( this, "events" ) || {})[ event.type ] || []).slice(0),
      run_all = !event.exclusive && !event.namespace,
      args = Array.prototype.slice.call( arguments, 0 );

    // Use the fix-ed Event rather than the (read-only) native event
    args[0] = event;
    event.currentTarget = this;

    for ( var j = 0, l = handlers.length; j < l; j++ ) {
      var handleObj = handlers[ j ];

      // Triggered event must 1) be non-exclusive and have no namespace, or
      // 2) have namespace(s) a subset or equal to those in the bound event.
      if ( run_all || event.namespace_re.test( handleObj.namespace ) ) {
        // Pass in a reference to the handler function itself
        // So that we can later remove it
        event.handler = handleObj.handler;
        event.data = handleObj.data;
        event.handleObj = handleObj;

        var ret = handleObj.handler.apply( this, args );

        if ( ret !== undefined ) {
          event.result = ret;
          if ( ret === false ) {
            event.preventDefault();
            event.stopPropagation();
          }
        }

        if ( event.isImmediatePropagationStopped() ) {
          break;
        }
      }
    }
    return event.result;
  },

  props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

  fix: function( event ) {
    if ( event[ jQuery.expando ] ) {
      return event;
    }

    // store a copy of the original event object
    // and "clone" to set read-only properties
    var originalEvent = event;
    event = jQuery.Event( originalEvent );

    for ( var i = this.props.length, prop; i; ) {
      prop = this.props[ --i ];
      event[ prop ] = originalEvent[ prop ];
    }

    // Fix target property, if necessary
    if ( !event.target ) {
      // Fixes #1925 where srcElement might not be defined either
      event.target = event.srcElement || document;
    }

    // check if target is a textnode (safari)
    if ( event.target.nodeType === 3 ) {
      event.target = event.target.parentNode;
    }

    // Add relatedTarget, if necessary
    if ( !event.relatedTarget && event.fromElement ) {
      event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
    }

    // Calculate pageX/Y if missing and clientX/Y available
    if ( event.pageX == null && event.clientX != null ) {
      var eventDocument = event.target.ownerDocument || document,
        doc = eventDocument.documentElement,
        body = eventDocument.body;

      event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
    }

    // Add which for key events
    if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
      event.which = event.charCode != null ? event.charCode : event.keyCode;
    }

    // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
    if ( !event.metaKey && event.ctrlKey ) {
      event.metaKey = event.ctrlKey;
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if ( !event.which && event.button !== undefined ) {
      event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
    }

    return event;
  },

  // Deprecated, use jQuery.guid instead
  guid: 1E8,

  // Deprecated, use jQuery.proxy instead
  proxy: jQuery.proxy,

  special: {
    ready: {
      // Make sure the ready event is setup
      setup: jQuery.bindReady,
      teardown: jQuery.noop
    },

    live: {
      add: function( handleObj ) {
        jQuery.event.add( this,
          liveConvert( handleObj.origType, handleObj.selector ),
          jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) );
      },

      remove: function( handleObj ) {
        jQuery.event.remove( this, liveConvert( handleObj.origType, handleObj.selector ), handleObj );
      }
    },

    beforeunload: {
      setup: function( data, namespaces, eventHandle ) {
        // We only want to do this special case on windows
        if ( jQuery.isWindow( this ) ) {
          this.onbeforeunload = eventHandle;
        }
      },

      teardown: function( namespaces, eventHandle ) {
        if ( this.onbeforeunload === eventHandle ) {
          this.onbeforeunload = null;
        }
      }
    }
  }
};

jQuery.removeEvent = document.removeEventListener ?
  function( elem, type, handle ) {
    if ( elem.removeEventListener ) {
      elem.removeEventListener( type, handle, false );
    }
  } :
  function( elem, type, handle ) {
    if ( elem.detachEvent ) {
      elem.detachEvent( "on" + type, handle );
    }
  };

jQuery.Event = function( src, props ) {
  // Allow instantiation without the 'new' keyword
  if ( !this.preventDefault ) {
    return new jQuery.Event( src, props );
  }

  // Event object
  if ( src && src.type ) {
    this.originalEvent = src;
    this.type = src.type;

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
      src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

  // Event type
  } else {
    this.type = src;
  }

  // Put explicitly provided properties onto the event object
  if ( props ) {
    jQuery.extend( this, props );
  }

  // timeStamp is buggy for some events on Firefox(#3843)
  // So we won't rely on the native value
  this.timeStamp = jQuery.now();

  // Mark it as fixed
  this[ jQuery.expando ] = true;
};

function returnFalse() {
  return false;
}
function returnTrue() {
  return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
  preventDefault: function() {
    this.isDefaultPrevented = returnTrue;

    var e = this.originalEvent;
    if ( !e ) {
      return;
    }

    // if preventDefault exists run it on the original event
    if ( e.preventDefault ) {
      e.preventDefault();

    // otherwise set the returnValue property of the original event to false (IE)
    } else {
      e.returnValue = false;
    }
  },
  stopPropagation: function() {
    this.isPropagationStopped = returnTrue;

    var e = this.originalEvent;
    if ( !e ) {
      return;
    }
    // if stopPropagation exists run it on the original event
    if ( e.stopPropagation ) {
      e.stopPropagation();
    }
    // otherwise set the cancelBubble property of the original event to true (IE)
    e.cancelBubble = true;
  },
  stopImmediatePropagation: function() {
    this.isImmediatePropagationStopped = returnTrue;
    this.stopPropagation();
  },
  isDefaultPrevented: returnFalse,
  isPropagationStopped: returnFalse,
  isImmediatePropagationStopped: returnFalse
};

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function( event ) {

  // Check if mouse(over|out) are still within the same parent element
  var related = event.relatedTarget,
    inside = false,
    eventType = event.type;

  event.type = event.data;

  if ( related !== this ) {

    if ( related ) {
      inside = jQuery.contains( this, related );
    }

    if ( !inside ) {

      jQuery.event.handle.apply( this, arguments );

      event.type = eventType;
    }
  }
},

// In case of event delegation, we only need to rename the event.type,
// liveHandler will take care of the rest.
delegate = function( event ) {
  event.type = event.data;
  jQuery.event.handle.apply( this, arguments );
};

// Create mouseenter and mouseleave events
jQuery.each({
  mouseenter: "mouseover",
  mouseleave: "mouseout"
}, function( orig, fix ) {
  jQuery.event.special[ orig ] = {
    setup: function( data ) {
      jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
    },
    teardown: function( data ) {
      jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
    }
  };
});

// submit delegation
if ( !jQuery.support.submitBubbles ) {

  jQuery.event.special.submit = {
    setup: function( data, namespaces ) {
      if ( !jQuery.nodeName( this, "form" ) ) {
        jQuery.event.add(this, "click.specialSubmit", function( e ) {
          var elem = e.target,
            type = elem.type;

          if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
            trigger( "submit", this, arguments );
          }
        });

        jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
          var elem = e.target,
            type = elem.type;

          if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
            trigger( "submit", this, arguments );
          }
        });

      } else {
        return false;
      }
    },

    teardown: function( namespaces ) {
      jQuery.event.remove( this, ".specialSubmit" );
    }
  };

}

// change delegation, happens here so we have bind.
if ( !jQuery.support.changeBubbles ) {

  var changeFilters,

  getVal = function( elem ) {
    var type = elem.type, val = elem.value;

    if ( type === "radio" || type === "checkbox" ) {
      val = elem.checked;

    } else if ( type === "select-multiple" ) {
      val = elem.selectedIndex > -1 ?
        jQuery.map( elem.options, function( elem ) {
          return elem.selected;
        }).join("-") :
        "";

    } else if ( jQuery.nodeName( elem, "select" ) ) {
      val = elem.selectedIndex;
    }

    return val;
  },

  testChange = function testChange( e ) {
    var elem = e.target, data, val;

    if ( !rformElems.test( elem.nodeName ) || elem.readOnly ) {
      return;
    }

    data = jQuery._data( elem, "_change_data" );
    val = getVal(elem);

    // the current data will be also retrieved by beforeactivate
    if ( e.type !== "focusout" || elem.type !== "radio" ) {
      jQuery._data( elem, "_change_data", val );
    }

    if ( data === undefined || val === data ) {
      return;
    }

    if ( data != null || val ) {
      e.type = "change";
      e.liveFired = undefined;
      jQuery.event.trigger( e, arguments[1], elem );
    }
  };

  jQuery.event.special.change = {
    filters: {
      focusout: testChange,

      beforedeactivate: testChange,

      click: function( e ) {
        var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

        if ( type === "radio" || type === "checkbox" || jQuery.nodeName( elem, "select" ) ) {
          testChange.call( this, e );
        }
      },

      // Change has to be called before submit
      // Keydown will be called before keypress, which is used in submit-event delegation
      keydown: function( e ) {
        var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

        if ( (e.keyCode === 13 && !jQuery.nodeName( elem, "textarea" ) ) ||
          (e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
          type === "select-multiple" ) {
          testChange.call( this, e );
        }
      },

      // Beforeactivate happens also before the previous element is blurred
      // with this event you can't trigger a change event, but you can store
      // information
      beforeactivate: function( e ) {
        var elem = e.target;
        jQuery._data( elem, "_change_data", getVal(elem) );
      }
    },

    setup: function( data, namespaces ) {
      if ( this.type === "file" ) {
        return false;
      }

      for ( var type in changeFilters ) {
        jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
      }

      return rformElems.test( this.nodeName );
    },

    teardown: function( namespaces ) {
      jQuery.event.remove( this, ".specialChange" );

      return rformElems.test( this.nodeName );
    }
  };

  changeFilters = jQuery.event.special.change.filters;

  // Handle when the input is .focus()'d
  changeFilters.focus = changeFilters.beforeactivate;
}

function trigger( type, elem, args ) {
  // Piggyback on a donor event to simulate a different one.
  // Fake originalEvent to avoid donor's stopPropagation, but if the
  // simulated event prevents default then we do the same on the donor.
  // Don't pass args or remember liveFired; they apply to the donor event.
  var event = jQuery.extend( {}, args[ 0 ] );
  event.type = type;
  event.originalEvent = {};
  event.liveFired = undefined;
  jQuery.event.handle.call( elem, event );
  if ( event.isDefaultPrevented() ) {
    args[ 0 ].preventDefault();
  }
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
  jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

    // Attach a single capturing handler while someone wants focusin/focusout
    var attaches = 0;

    jQuery.event.special[ fix ] = {
      setup: function() {
        if ( attaches++ === 0 ) {
          document.addEventListener( orig, handler, true );
        }
      },
      teardown: function() {
        if ( --attaches === 0 ) {
          document.removeEventListener( orig, handler, true );
        }
      }
    };

    function handler( donor ) {
      // Donor event is always a native one; fix it and switch its type.
      // Let focusin/out handler cancel the donor focus/blur event.
      var e = jQuery.event.fix( donor );
      e.type = fix;
      e.originalEvent = {};
      jQuery.event.trigger( e, null, e.target );
      if ( e.isDefaultPrevented() ) {
        donor.preventDefault();
      }
    }
  });
}

jQuery.each(["bind", "one"], function( i, name ) {
  jQuery.fn[ name ] = function( type, data, fn ) {
    var handler;

    // Handle object literals
    if ( typeof type === "object" ) {
      for ( var key in type ) {
        this[ name ](key, data, type[key], fn);
      }
      return this;
    }

    if ( arguments.length === 2 || data === false ) {
      fn = data;
      data = undefined;
    }

    if ( name === "one" ) {
      handler = function( event ) {
        jQuery( this ).unbind( event, handler );
        return fn.apply( this, arguments );
      };
      handler.guid = fn.guid || jQuery.guid++;
    } else {
      handler = fn;
    }

    if ( type === "unload" && name !== "one" ) {
      this.one( type, data, fn );

    } else {
      for ( var i = 0, l = this.length; i < l; i++ ) {
        jQuery.event.add( this[i], type, handler, data );
      }
    }

    return this;
  };
});

jQuery.fn.extend({
  unbind: function( type, fn ) {
    // Handle object literals
    if ( typeof type === "object" && !type.preventDefault ) {
      for ( var key in type ) {
        this.unbind(key, type[key]);
      }

    } else {
      for ( var i = 0, l = this.length; i < l; i++ ) {
        jQuery.event.remove( this[i], type, fn );
      }
    }

    return this;
  },

  delegate: function( selector, types, data, fn ) {
    return this.live( types, data, fn, selector );
  },

  undelegate: function( selector, types, fn ) {
    if ( arguments.length === 0 ) {
      return this.unbind( "live" );

    } else {
      return this.die( types, null, fn, selector );
    }
  },

  trigger: function( type, data ) {
    return this.each(function() {
      jQuery.event.trigger( type, data, this );
    });
  },

  triggerHandler: function( type, data ) {
    if ( this[0] ) {
      return jQuery.event.trigger( type, data, this[0], true );
    }
  },

  toggle: function( fn ) {
    // Save reference to arguments for access in closure
    var args = arguments,
      guid = fn.guid || jQuery.guid++,
      i = 0,
      toggler = function( event ) {
        // Figure out which function to execute
        var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
        jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

        // Make sure that clicks stop
        event.preventDefault();

        // and execute the function
        return args[ lastToggle ].apply( this, arguments ) || false;
      };

    // link all the functions, so any of them can unbind this click handler
    toggler.guid = guid;
    while ( i < args.length ) {
      args[ i++ ].guid = guid;
    }

    return this.click( toggler );
  },

  hover: function( fnOver, fnOut ) {
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
  }
});

var liveMap = {
  focus: "focusin",
  blur: "focusout",
  mouseenter: "mouseover",
  mouseleave: "mouseout"
};

jQuery.each(["live", "die"], function( i, name ) {
  jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
    var type, i = 0, match, namespaces, preType,
      selector = origSelector || this.selector,
      context = origSelector ? this : jQuery( this.context );

    if ( typeof types === "object" && !types.preventDefault ) {
      for ( var key in types ) {
        context[ name ]( key, data, types[key], selector );
      }

      return this;
    }

    if ( name === "die" && !types &&
          origSelector && origSelector.charAt(0) === "." ) {

      context.unbind( origSelector );

      return this;
    }

    if ( data === false || jQuery.isFunction( data ) ) {
      fn = data || returnFalse;
      data = undefined;
    }

    types = (types || "").split(" ");

    while ( (type = types[ i++ ]) != null ) {
      match = rnamespaces.exec( type );
      namespaces = "";

      if ( match )  {
        namespaces = match[0];
        type = type.replace( rnamespaces, "" );
      }

      if ( type === "hover" ) {
        types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
        continue;
      }

      preType = type;

      if ( liveMap[ type ] ) {
        types.push( liveMap[ type ] + namespaces );
        type = type + namespaces;

      } else {
        type = (liveMap[ type ] || type) + namespaces;
      }

      if ( name === "live" ) {
        // bind live handler
        for ( var j = 0, l = context.length; j < l; j++ ) {
          jQuery.event.add( context[j], "live." + liveConvert( type, selector ),
            { data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
        }

      } else {
        // unbind live handler
        context.unbind( "live." + liveConvert( type, selector ), fn );
      }
    }

    return this;
  };
});

function liveHandler( event ) {
  var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
    elems = [],
    selectors = [],
    events = jQuery._data( this, "events" );

  // Make sure we avoid non-left-click bubbling in Firefox (#3861) and disabled elements in IE (#6911)
  if ( event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click" ) {
    return;
  }

  if ( event.namespace ) {
    namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
  }

  event.liveFired = this;

  var live = events.live.slice(0);

  for ( j = 0; j < live.length; j++ ) {
    handleObj = live[j];

    if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
      selectors.push( handleObj.selector );

    } else {
      live.splice( j--, 1 );
    }
  }

  match = jQuery( event.target ).closest( selectors, event.currentTarget );

  for ( i = 0, l = match.length; i < l; i++ ) {
    close = match[i];

    for ( j = 0; j < live.length; j++ ) {
      handleObj = live[j];

      if ( close.selector === handleObj.selector && (!namespace || namespace.test( handleObj.namespace )) && !close.elem.disabled ) {
        elem = close.elem;
        related = null;

        // Those two events require additional checking
        if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
          event.type = handleObj.preType;
          related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];

          // Make sure not to accidentally match a child element with the same selector
          if ( related && jQuery.contains( elem, related ) ) {
            related = elem;
          }
        }

        if ( !related || related !== elem ) {
          elems.push({ elem: elem, handleObj: handleObj, level: close.level });
        }
      }
    }
  }

  for ( i = 0, l = elems.length; i < l; i++ ) {
    match = elems[i];

    if ( maxLevel && match.level > maxLevel ) {
      break;
    }

    event.currentTarget = match.elem;
    event.data = match.handleObj.data;
    event.handleObj = match.handleObj;

    ret = match.handleObj.origHandler.apply( match.elem, arguments );

    if ( ret === false || event.isPropagationStopped() ) {
      maxLevel = match.level;

      if ( ret === false ) {
        stop = false;
      }
      if ( event.isImmediatePropagationStopped() ) {
        break;
      }
    }
  }

  return stop;
}

function liveConvert( type, selector ) {
  return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspaces, "&");
}

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
  "change select submit keydown keypress keyup error").split(" "), function( i, name ) {

  // Handle event binding
  jQuery.fn[ name ] = function( data, fn ) {
    if ( fn == null ) {
      fn = data;
      data = null;
    }

    return arguments.length > 0 ?
      this.bind( name, data, fn ) :
      this.trigger( name );
  };

  if ( jQuery.attrFn ) {
    jQuery.attrFn[ name ] = true;
  }
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
  done = 0,
  toString = Object.prototype.toString,
  hasDuplicate = false,
  baseHasDuplicate = true,
  rBackslash = /\\/g,
  rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
  baseHasDuplicate = false;
  return 0;
});

var Sizzle = function( selector, context, results, seed ) {
  results = results || [];
  context = context || document;

  var origContext = context;

  if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
    return [];
  }
  
  if ( !selector || typeof selector !== "string" ) {
    return results;
  }

  var m, set, checkSet, extra, ret, cur, pop, i,
    prune = true,
    contextXML = Sizzle.isXML( context ),
    parts = [],
    soFar = selector;
  
  // Reset the position of the chunker regexp (start from head)
  do {
    chunker.exec( "" );
    m = chunker.exec( soFar );

    if ( m ) {
      soFar = m[3];
    
      parts.push( m[1] );
    
      if ( m[2] ) {
        extra = m[3];
        break;
      }
    }
  } while ( m );

  if ( parts.length > 1 && origPOS.exec( selector ) ) {

    if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
      set = posProcess( parts[0] + parts[1], context );

    } else {
      set = Expr.relative[ parts[0] ] ?
        [ context ] :
        Sizzle( parts.shift(), context );

      while ( parts.length ) {
        selector = parts.shift();

        if ( Expr.relative[ selector ] ) {
          selector += parts.shift();
        }
        
        set = posProcess( selector, set );
      }
    }

  } else {
    // Take a shortcut and set the context if the root selector is an ID
    // (but not if it'll be faster if the inner selector is an ID)
    if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
        Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

      ret = Sizzle.find( parts.shift(), context, contextXML );
      context = ret.expr ?
        Sizzle.filter( ret.expr, ret.set )[0] :
        ret.set[0];
    }

    if ( context ) {
      ret = seed ?
        { expr: parts.pop(), set: makeArray(seed) } :
        Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

      set = ret.expr ?
        Sizzle.filter( ret.expr, ret.set ) :
        ret.set;

      if ( parts.length > 0 ) {
        checkSet = makeArray( set );

      } else {
        prune = false;
      }

      while ( parts.length ) {
        cur = parts.pop();
        pop = cur;

        if ( !Expr.relative[ cur ] ) {
          cur = "";
        } else {
          pop = parts.pop();
        }

        if ( pop == null ) {
          pop = context;
        }

        Expr.relative[ cur ]( checkSet, pop, contextXML );
      }

    } else {
      checkSet = parts = [];
    }
  }

  if ( !checkSet ) {
    checkSet = set;
  }

  if ( !checkSet ) {
    Sizzle.error( cur || selector );
  }

  if ( toString.call(checkSet) === "[object Array]" ) {
    if ( !prune ) {
      results.push.apply( results, checkSet );

    } else if ( context && context.nodeType === 1 ) {
      for ( i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
          results.push( set[i] );
        }
      }

    } else {
      for ( i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
          results.push( set[i] );
        }
      }
    }

  } else {
    makeArray( checkSet, results );
  }

  if ( extra ) {
    Sizzle( extra, origContext, results, seed );
    Sizzle.uniqueSort( results );
  }

  return results;
};

Sizzle.uniqueSort = function( results ) {
  if ( sortOrder ) {
    hasDuplicate = baseHasDuplicate;
    results.sort( sortOrder );

    if ( hasDuplicate ) {
      for ( var i = 1; i < results.length; i++ ) {
        if ( results[i] === results[ i - 1 ] ) {
          results.splice( i--, 1 );
        }
      }
    }
  }

  return results;
};

Sizzle.matches = function( expr, set ) {
  return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
  return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
  var set;

  if ( !expr ) {
    return [];
  }

  for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
    var match,
      type = Expr.order[i];
    
    if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
      var left = match[1];
      match.splice( 1, 1 );

      if ( left.substr( left.length - 1 ) !== "\\" ) {
        match[1] = (match[1] || "").replace( rBackslash, "" );
        set = Expr.find[ type ]( match, context, isXML );

        if ( set != null ) {
          expr = expr.replace( Expr.match[ type ], "" );
          break;
        }
      }
    }
  }

  if ( !set ) {
    set = typeof context.getElementsByTagName !== "undefined" ?
      context.getElementsByTagName( "*" ) :
      [];
  }

  return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
  var match, anyFound,
    old = expr,
    result = [],
    curLoop = set,
    isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

  while ( expr && set.length ) {
    for ( var type in Expr.filter ) {
      if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
        var found, item,
          filter = Expr.filter[ type ],
          left = match[1];

        anyFound = false;

        match.splice(1,1);

        if ( left.substr( left.length - 1 ) === "\\" ) {
          continue;
        }

        if ( curLoop === result ) {
          result = [];
        }

        if ( Expr.preFilter[ type ] ) {
          match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

          if ( !match ) {
            anyFound = found = true;

          } else if ( match === true ) {
            continue;
          }
        }

        if ( match ) {
          for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
            if ( item ) {
              found = filter( item, match, i, curLoop );
              var pass = not ^ !!found;

              if ( inplace && found != null ) {
                if ( pass ) {
                  anyFound = true;

                } else {
                  curLoop[i] = false;
                }

              } else if ( pass ) {
                result.push( item );
                anyFound = true;
              }
            }
          }
        }

        if ( found !== undefined ) {
          if ( !inplace ) {
            curLoop = result;
          }

          expr = expr.replace( Expr.match[ type ], "" );

          if ( !anyFound ) {
            return [];
          }

          break;
        }
      }
    }

    // Improper expression
    if ( expr === old ) {
      if ( anyFound == null ) {
        Sizzle.error( expr );

      } else {
        break;
      }
    }

    old = expr;
  }

  return curLoop;
};

Sizzle.error = function( msg ) {
  throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
  order: [ "ID", "NAME", "TAG" ],

  match: {
    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
    NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
    TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
    CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
    POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
    PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
  },

  leftMatch: {},

  attrMap: {
    "class": "className",
    "for": "htmlFor"
  },

  attrHandle: {
    href: function( elem ) {
      return elem.getAttribute( "href" );
    },
    type: function( elem ) {
      return elem.getAttribute( "type" );
    }
  },

  relative: {
    "+": function(checkSet, part){
      var isPartStr = typeof part === "string",
        isTag = isPartStr && !rNonWord.test( part ),
        isPartStrNotTag = isPartStr && !isTag;

      if ( isTag ) {
        part = part.toLowerCase();
      }

      for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
        if ( (elem = checkSet[i]) ) {
          while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

          checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
            elem || false :
            elem === part;
        }
      }

      if ( isPartStrNotTag ) {
        Sizzle.filter( part, checkSet, true );
      }
    },

    ">": function( checkSet, part ) {
      var elem,
        isPartStr = typeof part === "string",
        i = 0,
        l = checkSet.length;

      if ( isPartStr && !rNonWord.test( part ) ) {
        part = part.toLowerCase();

        for ( ; i < l; i++ ) {
          elem = checkSet[i];

          if ( elem ) {
            var parent = elem.parentNode;
            checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
          }
        }

      } else {
        for ( ; i < l; i++ ) {
          elem = checkSet[i];

          if ( elem ) {
            checkSet[i] = isPartStr ?
              elem.parentNode :
              elem.parentNode === part;
          }
        }

        if ( isPartStr ) {
          Sizzle.filter( part, checkSet, true );
        }
      }
    },

    "": function(checkSet, part, isXML){
      var nodeCheck,
        doneName = done++,
        checkFn = dirCheck;

      if ( typeof part === "string" && !rNonWord.test( part ) ) {
        part = part.toLowerCase();
        nodeCheck = part;
        checkFn = dirNodeCheck;
      }

      checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
    },

    "~": function( checkSet, part, isXML ) {
      var nodeCheck,
        doneName = done++,
        checkFn = dirCheck;

      if ( typeof part === "string" && !rNonWord.test( part ) ) {
        part = part.toLowerCase();
        nodeCheck = part;
        checkFn = dirNodeCheck;
      }

      checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
    }
  },

  find: {
    ID: function( match, context, isXML ) {
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);
        // Check parentNode to catch when Blackberry 4.6 returns
        // nodes that are no longer in the document #6963
        return m && m.parentNode ? [m] : [];
      }
    },

    NAME: function( match, context ) {
      if ( typeof context.getElementsByName !== "undefined" ) {
        var ret = [],
          results = context.getElementsByName( match[1] );

        for ( var i = 0, l = results.length; i < l; i++ ) {
          if ( results[i].getAttribute("name") === match[1] ) {
            ret.push( results[i] );
          }
        }

        return ret.length === 0 ? null : ret;
      }
    },

    TAG: function( match, context ) {
      if ( typeof context.getElementsByTagName !== "undefined" ) {
        return context.getElementsByTagName( match[1] );
      }
    }
  },
  preFilter: {
    CLASS: function( match, curLoop, inplace, result, not, isXML ) {
      match = " " + match[1].replace( rBackslash, "" ) + " ";

      if ( isXML ) {
        return match;
      }

      for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
        if ( elem ) {
          if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
            if ( !inplace ) {
              result.push( elem );
            }

          } else if ( inplace ) {
            curLoop[i] = false;
          }
        }
      }

      return false;
    },

    ID: function( match ) {
      return match[1].replace( rBackslash, "" );
    },

    TAG: function( match, curLoop ) {
      return match[1].replace( rBackslash, "" ).toLowerCase();
    },

    CHILD: function( match ) {
      if ( match[1] === "nth" ) {
        if ( !match[2] ) {
          Sizzle.error( match[0] );
        }

        match[2] = match[2].replace(/^\+|\s*/g, '');

        // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
          match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
          !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

        // calculate the numbers (first)n+(last) including if they are negative
        match[2] = (test[1] + (test[2] || 1)) - 0;
        match[3] = test[3] - 0;
      }
      else if ( match[2] ) {
        Sizzle.error( match[0] );
      }

      // TODO: Move to normal caching system
      match[0] = done++;

      return match;
    },

    ATTR: function( match, curLoop, inplace, result, not, isXML ) {
      var name = match[1] = match[1].replace( rBackslash, "" );
      
      if ( !isXML && Expr.attrMap[name] ) {
        match[1] = Expr.attrMap[name];
      }

      // Handle if an un-quoted value was used
      match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

      if ( match[2] === "~=" ) {
        match[4] = " " + match[4] + " ";
      }

      return match;
    },

    PSEUDO: function( match, curLoop, inplace, result, not ) {
      if ( match[1] === "not" ) {
        // If we're dealing with a complex expression, or a simple one
        if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
          match[3] = Sizzle(match[3], null, null, curLoop);

        } else {
          var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

          if ( !inplace ) {
            result.push.apply( result, ret );
          }

          return false;
        }

      } else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
        return true;
      }
      
      return match;
    },

    POS: function( match ) {
      match.unshift( true );

      return match;
    }
  },
  
  filters: {
    enabled: function( elem ) {
      return elem.disabled === false && elem.type !== "hidden";
    },

    disabled: function( elem ) {
      return elem.disabled === true;
    },

    checked: function( elem ) {
      return elem.checked === true;
    },
    
    selected: function( elem ) {
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      if ( elem.parentNode ) {
        elem.parentNode.selectedIndex;
      }
      
      return elem.selected === true;
    },

    parent: function( elem ) {
      return !!elem.firstChild;
    },

    empty: function( elem ) {
      return !elem.firstChild;
    },

    has: function( elem, i, match ) {
      return !!Sizzle( match[3], elem ).length;
    },

    header: function( elem ) {
      return (/h\d/i).test( elem.nodeName );
    },

    text: function( elem ) {
      var attr = elem.getAttribute( "type" ), type = elem.type;
      // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
      // use getAttribute instead to test this case
      return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
    },

    radio: function( elem ) {
      return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
    },

    checkbox: function( elem ) {
      return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
    },

    file: function( elem ) {
      return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
    },

    password: function( elem ) {
      return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
    },

    submit: function( elem ) {
      var name = elem.nodeName.toLowerCase();
      return (name === "input" || name === "button") && "submit" === elem.type;
    },

    image: function( elem ) {
      return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
    },

    reset: function( elem ) {
      var name = elem.nodeName.toLowerCase();
      return (name === "input" || name === "button") && "reset" === elem.type;
    },

    button: function( elem ) {
      var name = elem.nodeName.toLowerCase();
      return name === "input" && "button" === elem.type || name === "button";
    },

    input: function( elem ) {
      return (/input|select|textarea|button/i).test( elem.nodeName );
    },

    focus: function( elem ) {
      return elem === elem.ownerDocument.activeElement;
    }
  },
  setFilters: {
    first: function( elem, i ) {
      return i === 0;
    },

    last: function( elem, i, match, array ) {
      return i === array.length - 1;
    },

    even: function( elem, i ) {
      return i % 2 === 0;
    },

    odd: function( elem, i ) {
      return i % 2 === 1;
    },

    lt: function( elem, i, match ) {
      return i < match[3] - 0;
    },

    gt: function( elem, i, match ) {
      return i > match[3] - 0;
    },

    nth: function( elem, i, match ) {
      return match[3] - 0 === i;
    },

    eq: function( elem, i, match ) {
      return match[3] - 0 === i;
    }
  },
  filter: {
    PSEUDO: function( elem, match, i, array ) {
      var name = match[1],
        filter = Expr.filters[ name ];

      if ( filter ) {
        return filter( elem, i, match, array );

      } else if ( name === "contains" ) {
        return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

      } else if ( name === "not" ) {
        var not = match[3];

        for ( var j = 0, l = not.length; j < l; j++ ) {
          if ( not[j] === elem ) {
            return false;
          }
        }

        return true;

      } else {
        Sizzle.error( name );
      }
    },

    CHILD: function( elem, match ) {
      var type = match[1],
        node = elem;

      switch ( type ) {
        case "only":
        case "first":
          while ( (node = node.previousSibling) )  {
            if ( node.nodeType === 1 ) { 
              return false; 
            }
          }

          if ( type === "first" ) { 
            return true; 
          }

          node = elem;

        case "last":
          while ( (node = node.nextSibling) )  {
            if ( node.nodeType === 1 ) { 
              return false; 
            }
          }

          return true;

        case "nth":
          var first = match[2],
            last = match[3];

          if ( first === 1 && last === 0 ) {
            return true;
          }
          
          var doneName = match[0],
            parent = elem.parentNode;
  
          if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
            var count = 0;
            
            for ( node = parent.firstChild; node; node = node.nextSibling ) {
              if ( node.nodeType === 1 ) {
                node.nodeIndex = ++count;
              }
            } 

            parent.sizcache = doneName;
          }
          
          var diff = elem.nodeIndex - last;

          if ( first === 0 ) {
            return diff === 0;

          } else {
            return ( diff % first === 0 && diff / first >= 0 );
          }
      }
    },

    ID: function( elem, match ) {
      return elem.nodeType === 1 && elem.getAttribute("id") === match;
    },

    TAG: function( elem, match ) {
      return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
    },
    
    CLASS: function( elem, match ) {
      return (" " + (elem.className || elem.getAttribute("class")) + " ")
        .indexOf( match ) > -1;
    },

    ATTR: function( elem, match ) {
      var name = match[1],
        result = Expr.attrHandle[ name ] ?
          Expr.attrHandle[ name ]( elem ) :
          elem[ name ] != null ?
            elem[ name ] :
            elem.getAttribute( name ),
        value = result + "",
        type = match[2],
        check = match[4];

      return result == null ?
        type === "!=" :
        type === "=" ?
        value === check :
        type === "*=" ?
        value.indexOf(check) >= 0 :
        type === "~=" ?
        (" " + value + " ").indexOf(check) >= 0 :
        !check ?
        value && result !== false :
        type === "!=" ?
        value !== check :
        type === "^=" ?
        value.indexOf(check) === 0 :
        type === "$=" ?
        value.substr(value.length - check.length) === check :
        type === "|=" ?
        value === check || value.substr(0, check.length + 1) === check + "-" :
        false;
    },

    POS: function( elem, match, i, array ) {
      var name = match[2],
        filter = Expr.setFilters[ name ];

      if ( filter ) {
        return filter( elem, i, match, array );
      }
    }
  }
};

var origPOS = Expr.match.POS,
  fescape = function(all, num){
    return "\\" + (num - 0 + 1);
  };

for ( var type in Expr.match ) {
  Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
  Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
  array = Array.prototype.slice.call( array, 0 );

  if ( results ) {
    results.push.apply( results, array );
    return results;
  }
  
  return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
  Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
  makeArray = function( array, results ) {
    var i = 0,
      ret = results || [];

    if ( toString.call(array) === "[object Array]" ) {
      Array.prototype.push.apply( ret, array );

    } else {
      if ( typeof array.length === "number" ) {
        for ( var l = array.length; i < l; i++ ) {
          ret.push( array[i] );
        }

      } else {
        for ( ; array[i]; i++ ) {
          ret.push( array[i] );
        }
      }
    }

    return ret;
  };
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
  sortOrder = function( a, b ) {
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }

    if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
      return a.compareDocumentPosition ? -1 : 1;
    }

    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
  };

} else {
  sortOrder = function( a, b ) {
    // The nodes are identical, we can exit early
    if ( a === b ) {
      hasDuplicate = true;
      return 0;

    // Fallback to using sourceIndex (in IE) if it's available on both nodes
    } else if ( a.sourceIndex && b.sourceIndex ) {
      return a.sourceIndex - b.sourceIndex;
    }

    var al, bl,
      ap = [],
      bp = [],
      aup = a.parentNode,
      bup = b.parentNode,
      cur = aup;

    // If the nodes are siblings (or identical) we can do a quick check
    if ( aup === bup ) {
      return siblingCheck( a, b );

    // If no parents were found then the nodes are disconnected
    } else if ( !aup ) {
      return -1;

    } else if ( !bup ) {
      return 1;
    }

    // Otherwise they're somewhere else in the tree so we need
    // to build up a full list of the parentNodes for comparison
    while ( cur ) {
      ap.unshift( cur );
      cur = cur.parentNode;
    }

    cur = bup;

    while ( cur ) {
      bp.unshift( cur );
      cur = cur.parentNode;
    }

    al = ap.length;
    bl = bp.length;

    // Start walking down the tree looking for a discrepancy
    for ( var i = 0; i < al && i < bl; i++ ) {
      if ( ap[i] !== bp[i] ) {
        return siblingCheck( ap[i], bp[i] );
      }
    }

    // We ended someplace up the tree so do a sibling check
    return i === al ?
      siblingCheck( a, bp[i], -1 ) :
      siblingCheck( ap[i], b, 1 );
  };

  siblingCheck = function( a, b, ret ) {
    if ( a === b ) {
      return ret;
    }

    var cur = a.nextSibling;

    while ( cur ) {
      if ( cur === b ) {
        return -1;
      }

      cur = cur.nextSibling;
    }

    return 1;
  };
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
  var ret = "", elem;

  for ( var i = 0; elems[i]; i++ ) {
    elem = elems[i];

    // Get the text from text nodes and CDATA nodes
    if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
      ret += elem.nodeValue;

    // Traverse everything else, except comment nodes
    } else if ( elem.nodeType !== 8 ) {
      ret += Sizzle.getText( elem.childNodes );
    }
  }

  return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
  // We're going to inject a fake input element with a specified name
  var form = document.createElement("div"),
    id = "script" + (new Date()).getTime(),
    root = document.documentElement;

  form.innerHTML = "<a name='" + id + "'/>";

  // Inject it into the root element, check its status, and remove it quickly
  root.insertBefore( form, root.firstChild );

  // The workaround has to do additional checks after a getElementById
  // Which slows things down for other browsers (hence the branching)
  if ( document.getElementById( id ) ) {
    Expr.find.ID = function( match, context, isXML ) {
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);

        return m ?
          m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
            [m] :
            undefined :
          [];
      }
    };

    Expr.filter.ID = function( elem, match ) {
      var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

      return elem.nodeType === 1 && node && node.nodeValue === match;
    };
  }

  root.removeChild( form );

  // release memory in IE
  root = form = null;
})();

(function(){
  // Check to see if the browser returns only elements
  // when doing getElementsByTagName("*")

  // Create a fake element
  var div = document.createElement("div");
  div.appendChild( document.createComment("") );

  // Make sure no comments are found
  if ( div.getElementsByTagName("*").length > 0 ) {
    Expr.find.TAG = function( match, context ) {
      var results = context.getElementsByTagName( match[1] );

      // Filter out possible comments
      if ( match[1] === "*" ) {
        var tmp = [];

        for ( var i = 0; results[i]; i++ ) {
          if ( results[i].nodeType === 1 ) {
            tmp.push( results[i] );
          }
        }

        results = tmp;
      }

      return results;
    };
  }

  // Check to see if an attribute returns normalized href attributes
  div.innerHTML = "<a href='#'></a>";

  if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
      div.firstChild.getAttribute("href") !== "#" ) {

    Expr.attrHandle.href = function( elem ) {
      return elem.getAttribute( "href", 2 );
    };
  }

  // release memory in IE
  div = null;
})();

if ( document.querySelectorAll ) {
  (function(){
    var oldSizzle = Sizzle,
      div = document.createElement("div"),
      id = "__sizzle__";

    div.innerHTML = "<p class='TEST'></p>";

    // Safari can't handle uppercase or unicode characters when
    // in quirks mode.
    if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
      return;
    }
  
    Sizzle = function( query, context, extra, seed ) {
      context = context || document;

      // Only use querySelectorAll on non-XML documents
      // (ID selectors don't work in non-HTML documents)
      if ( !seed && !Sizzle.isXML(context) ) {
        // See if we find a selector to speed up
        var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
        
        if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
          // Speed-up: Sizzle("TAG")
          if ( match[1] ) {
            return makeArray( context.getElementsByTagName( query ), extra );
          
          // Speed-up: Sizzle(".CLASS")
          } else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
            return makeArray( context.getElementsByClassName( match[2] ), extra );
          }
        }
        
        if ( context.nodeType === 9 ) {
          // Speed-up: Sizzle("body")
          // The body element only exists once, optimize finding it
          if ( query === "body" && context.body ) {
            return makeArray( [ context.body ], extra );
            
          // Speed-up: Sizzle("#ID")
          } else if ( match && match[3] ) {
            var elem = context.getElementById( match[3] );

            // Check parentNode to catch when Blackberry 4.6 returns
            // nodes that are no longer in the document #6963
            if ( elem && elem.parentNode ) {
              // Handle the case where IE and Opera return items
              // by name instead of ID
              if ( elem.id === match[3] ) {
                return makeArray( [ elem ], extra );
              }
              
            } else {
              return makeArray( [], extra );
            }
          }
          
          try {
            return makeArray( context.querySelectorAll(query), extra );
          } catch(qsaError) {}

        // qSA works strangely on Element-rooted queries
        // We can work around this by specifying an extra ID on the root
        // and working up from there (Thanks to Andrew Dupont for the technique)
        // IE 8 doesn't work on object elements
        } else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
          var oldContext = context,
            old = context.getAttribute( "id" ),
            nid = old || id,
            hasParent = context.parentNode,
            relativeHierarchySelector = /^\s*[+~]/.test( query );

          if ( !old ) {
            context.setAttribute( "id", nid );
          } else {
            nid = nid.replace( /'/g, "\\$&" );
          }
          if ( relativeHierarchySelector && hasParent ) {
            context = context.parentNode;
          }

          try {
            if ( !relativeHierarchySelector || hasParent ) {
              return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
            }

          } catch(pseudoError) {
          } finally {
            if ( !old ) {
              oldContext.removeAttribute( "id" );
            }
          }
        }
      }
    
      return oldSizzle(query, context, extra, seed);
    };

    for ( var prop in oldSizzle ) {
      Sizzle[ prop ] = oldSizzle[ prop ];
    }

    // release memory in IE
    div = null;
  })();
}

(function(){
  var html = document.documentElement,
    matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

  if ( matches ) {
    // Check to see if it's possible to do matchesSelector
    // on a disconnected node (IE 9 fails this)
    var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
      pseudoWorks = false;

    try {
      // This should fail with an exception
      // Gecko does not error, returns false instead
      matches.call( document.documentElement, "[test!='']:sizzle" );
  
    } catch( pseudoError ) {
      pseudoWorks = true;
    }

    Sizzle.matchesSelector = function( node, expr ) {
      // Make sure that attribute selectors are quoted
      expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

      if ( !Sizzle.isXML( node ) ) {
        try { 
          if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
            var ret = matches.call( node, expr );

            // IE 9's matchesSelector returns false on disconnected nodes
            if ( ret || !disconnectedMatch ||
                // As well, disconnected nodes are said to be in a document
                // fragment in IE 9, so check for that
                node.document && node.document.nodeType !== 11 ) {
              return ret;
            }
          }
        } catch(e) {}
      }

      return Sizzle(expr, null, null, [node]).length > 0;
    };
  }
})();

(function(){
  var div = document.createElement("div");

  div.innerHTML = "<div class='test e'></div><div class='test'></div>";

  // Opera can't find a second classname (in 9.6)
  // Also, make sure that getElementsByClassName actually exists
  if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
    return;
  }

  // Safari caches class attributes, doesn't catch changes (in 3.2)
  div.lastChild.className = "e";

  if ( div.getElementsByClassName("e").length === 1 ) {
    return;
  }
  
  Expr.order.splice(1, 0, "CLASS");
  Expr.find.CLASS = function( match, context, isXML ) {
    if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
      return context.getElementsByClassName(match[1]);
    }
  };

  // release memory in IE
  div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];

    if ( elem ) {
      var match = false;

      elem = elem[dir];

      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }

        if ( elem.nodeType === 1 && !isXML ){
          elem.sizcache = doneName;
          elem.sizset = i;
        }

        if ( elem.nodeName.toLowerCase() === cur ) {
          match = elem;
          break;
        }

        elem = elem[dir];
      }

      checkSet[i] = match;
    }
  }
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];

    if ( elem ) {
      var match = false;
      
      elem = elem[dir];

      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }

        if ( elem.nodeType === 1 ) {
          if ( !isXML ) {
            elem.sizcache = doneName;
            elem.sizset = i;
          }

          if ( typeof cur !== "string" ) {
            if ( elem === cur ) {
              match = true;
              break;
            }

          } else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
            match = elem;
            break;
          }
        }

        elem = elem[dir];
      }

      checkSet[i] = match;
    }
  }
}

if ( document.documentElement.contains ) {
  Sizzle.contains = function( a, b ) {
    return a !== b && (a.contains ? a.contains(b) : true);
  };

} else if ( document.documentElement.compareDocumentPosition ) {
  Sizzle.contains = function( a, b ) {
    return !!(a.compareDocumentPosition(b) & 16);
  };

} else {
  Sizzle.contains = function() {
    return false;
  };
}

Sizzle.isXML = function( elem ) {
  // documentElement is verified for cases where it doesn't yet exist
  // (such as loading iframes in IE - #4833) 
  var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

  return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
  var match,
    tmpSet = [],
    later = "",
    root = context.nodeType ? [context] : context;

  // Position selectors must be done after the filter
  // And so must :not(positional) so we move all PSEUDOs to the end
  while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
    later += match[0];
    selector = selector.replace( Expr.match.PSEUDO, "" );
  }

  selector = Expr.relative[selector] ? selector + "*" : selector;

  for ( var i = 0, l = root.length; i < l; i++ ) {
    Sizzle( selector, root[i], tmpSet );
  }

  return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
  rparentsprev = /^(?:parents|prevUntil|prevAll)/,
  // Note: This RegExp should be improved, or likely pulled from Sizzle
  rmultiselector = /,/,
  isSimple = /^.[^:#\[\.,]*$/,
  slice = Array.prototype.slice,
  POS = jQuery.expr.match.POS,
  // methods guaranteed to produce a unique set when starting from a unique set
  guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true
  };

jQuery.fn.extend({
  find: function( selector ) {
    var self = this,
      i, l;

    if ( typeof selector !== "string" ) {
      return jQuery( selector ).filter(function() {
        for ( i = 0, l = self.length; i < l; i++ ) {
          if ( jQuery.contains( self[ i ], this ) ) {
            return true;
          }
        }
      });
    }

    var ret = this.pushStack( "", "find", selector ),
      length, n, r;

    for ( i = 0, l = this.length; i < l; i++ ) {
      length = ret.length;
      jQuery.find( selector, this[i], ret );

      if ( i > 0 ) {
        // Make sure that the results are unique
        for ( n = length; n < ret.length; n++ ) {
          for ( r = 0; r < length; r++ ) {
            if ( ret[r] === ret[n] ) {
              ret.splice(n--, 1);
              break;
            }
          }
        }
      }
    }

    return ret;
  },

  has: function( target ) {
    var targets = jQuery( target );
    return this.filter(function() {
      for ( var i = 0, l = targets.length; i < l; i++ ) {
        if ( jQuery.contains( this, targets[i] ) ) {
          return true;
        }
      }
    });
  },

  not: function( selector ) {
    return this.pushStack( winnow(this, selector, false), "not", selector);
  },

  filter: function( selector ) {
    return this.pushStack( winnow(this, selector, true), "filter", selector );
  },

  is: function( selector ) {
    return !!selector && ( typeof selector === "string" ?
      jQuery.filter( selector, this ).length > 0 :
      this.filter( selector ).length > 0 );
  },

  closest: function( selectors, context ) {
    var ret = [], i, l, cur = this[0];
    
    // Array
    if ( jQuery.isArray( selectors ) ) {
      var match, selector,
        matches = {},
        level = 1;

      if ( cur && selectors.length ) {
        for ( i = 0, l = selectors.length; i < l; i++ ) {
          selector = selectors[i];

          if ( !matches[ selector ] ) {
            matches[ selector ] = POS.test( selector ) ?
              jQuery( selector, context || this.context ) :
              selector;
          }
        }

        while ( cur && cur.ownerDocument && cur !== context ) {
          for ( selector in matches ) {
            match = matches[ selector ];

            if ( match.jquery ? match.index( cur ) > -1 : jQuery( cur ).is( match ) ) {
              ret.push({ selector: selector, elem: cur, level: level });
            }
          }

          cur = cur.parentNode;
          level++;
        }
      }

      return ret;
    }

    // String
    var pos = POS.test( selectors ) || typeof selectors !== "string" ?
        jQuery( selectors, context || this.context ) :
        0;

    for ( i = 0, l = this.length; i < l; i++ ) {
      cur = this[i];

      while ( cur ) {
        if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
          ret.push( cur );
          break;

        } else {
          cur = cur.parentNode;
          if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
            break;
          }
        }
      }
    }

    ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

    return this.pushStack( ret, "closest", selectors );
  },

  // Determine the position of an element within
  // the matched set of elements
  index: function( elem ) {
    if ( !elem || typeof elem === "string" ) {
      return jQuery.inArray( this[0],
        // If it receives a string, the selector is used
        // If it receives nothing, the siblings are used
        elem ? jQuery( elem ) : this.parent().children() );
    }
    // Locate the position of the desired element
    return jQuery.inArray(
      // If it receives a jQuery object, the first element is used
      elem.jquery ? elem[0] : elem, this );
  },

  add: function( selector, context ) {
    var set = typeof selector === "string" ?
        jQuery( selector, context ) :
        jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
      all = jQuery.merge( this.get(), set );

    return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
      all :
      jQuery.unique( all ) );
  },

  andSelf: function() {
    return this.add( this.prevObject );
  }
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
  return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
  parent: function( elem ) {
    var parent = elem.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },
  parents: function( elem ) {
    return jQuery.dir( elem, "parentNode" );
  },
  parentsUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "parentNode", until );
  },
  next: function( elem ) {
    return jQuery.nth( elem, 2, "nextSibling" );
  },
  prev: function( elem ) {
    return jQuery.nth( elem, 2, "previousSibling" );
  },
  nextAll: function( elem ) {
    return jQuery.dir( elem, "nextSibling" );
  },
  prevAll: function( elem ) {
    return jQuery.dir( elem, "previousSibling" );
  },
  nextUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "nextSibling", until );
  },
  prevUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "previousSibling", until );
  },
  siblings: function( elem ) {
    return jQuery.sibling( elem.parentNode.firstChild, elem );
  },
  children: function( elem ) {
    return jQuery.sibling( elem.firstChild );
  },
  contents: function( elem ) {
    return jQuery.nodeName( elem, "iframe" ) ?
      elem.contentDocument || elem.contentWindow.document :
      jQuery.makeArray( elem.childNodes );
  }
}, function( name, fn ) {
  jQuery.fn[ name ] = function( until, selector ) {
    var ret = jQuery.map( this, fn, until ),
      // The variable 'args' was introduced in
      // https://github.com/jquery/jquery/commit/52a0238
      // to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
      // http://code.google.com/p/v8/issues/detail?id=1050
      args = slice.call(arguments);

    if ( !runtil.test( name ) ) {
      selector = until;
    }

    if ( selector && typeof selector === "string" ) {
      ret = jQuery.filter( selector, ret );
    }

    ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

    if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
      ret = ret.reverse();
    }

    return this.pushStack( ret, name, args.join(",") );
  };
});

jQuery.extend({
  filter: function( expr, elems, not ) {
    if ( not ) {
      expr = ":not(" + expr + ")";
    }

    return elems.length === 1 ?
      jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
      jQuery.find.matches(expr, elems);
  },

  dir: function( elem, dir, until ) {
    var matched = [],
      cur = elem[ dir ];

    while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
      if ( cur.nodeType === 1 ) {
        matched.push( cur );
      }
      cur = cur[dir];
    }
    return matched;
  },

  nth: function( cur, result, dir, elem ) {
    result = result || 1;
    var num = 0;

    for ( ; cur; cur = cur[dir] ) {
      if ( cur.nodeType === 1 && ++num === result ) {
        break;
      }
    }

    return cur;
  },

  sibling: function( n, elem ) {
    var r = [];

    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType === 1 && n !== elem ) {
        r.push( n );
      }
    }

    return r;
  }
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

  // Can't pass null or undefined to indexOf in Firefox 4
  // Set to 0 to skip string check
  qualifier = qualifier || 0;

  if ( jQuery.isFunction( qualifier ) ) {
    return jQuery.grep(elements, function( elem, i ) {
      var retVal = !!qualifier.call( elem, i, elem );
      return retVal === keep;
    });

  } else if ( qualifier.nodeType ) {
    return jQuery.grep(elements, function( elem, i ) {
      return (elem === qualifier) === keep;
    });

  } else if ( typeof qualifier === "string" ) {
    var filtered = jQuery.grep(elements, function( elem ) {
      return elem.nodeType === 1;
    });

    if ( isSimple.test( qualifier ) ) {
      return jQuery.filter(qualifier, filtered, !keep);
    } else {
      qualifier = jQuery.filter( qualifier, filtered );
    }
  }

  return jQuery.grep(elements, function( elem, i ) {
    return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
  });
}




var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
  rleadingWhitespace = /^\s+/,
  rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
  rtagName = /<([\w:]+)/,
  rtbody = /<tbody/i,
  rhtml = /<|&#?\w+;/,
  rnocache = /<(?:script|object|embed|option|style)/i,
  // checked="checked" or checked
  rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
  rscriptType = /\/(java|ecma)script/i,
  rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
  wrapMap = {
    option: [ 1, "<select multiple='multiple'>", "</select>" ],
    legend: [ 1, "<fieldset>", "</fieldset>" ],
    thead: [ 1, "<table>", "</table>" ],
    tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
    col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
    area: [ 1, "<map>", "</map>" ],
    _default: [ 0, "", "" ]
  };

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
  wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
  text: function( text ) {
    if ( jQuery.isFunction(text) ) {
      return this.each(function(i) {
        var self = jQuery( this );

        self.text( text.call(this, i, self.text()) );
      });
    }

    if ( typeof text !== "object" && text !== undefined ) {
      return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
    }

    return jQuery.text( this );
  },

  wrapAll: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapAll( html.call(this, i) );
      });
    }

    if ( this[0] ) {
      // The elements to wrap the target around
      var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

      if ( this[0].parentNode ) {
        wrap.insertBefore( this[0] );
      }

      wrap.map(function() {
        var elem = this;

        while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
          elem = elem.firstChild;
        }

        return elem;
      }).append( this );
    }

    return this;
  },

  wrapInner: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapInner( html.call(this, i) );
      });
    }

    return this.each(function() {
      var self = jQuery( this ),
        contents = self.contents();

      if ( contents.length ) {
        contents.wrapAll( html );

      } else {
        self.append( html );
      }
    });
  },

  wrap: function( html ) {
    return this.each(function() {
      jQuery( this ).wrapAll( html );
    });
  },

  unwrap: function() {
    return this.parent().each(function() {
      if ( !jQuery.nodeName( this, "body" ) ) {
        jQuery( this ).replaceWith( this.childNodes );
      }
    }).end();
  },

  append: function() {
    return this.domManip(arguments, true, function( elem ) {
      if ( this.nodeType === 1 ) {
        this.appendChild( elem );
      }
    });
  },

  prepend: function() {
    return this.domManip(arguments, true, function( elem ) {
      if ( this.nodeType === 1 ) {
        this.insertBefore( elem, this.firstChild );
      }
    });
  },

  before: function() {
    if ( this[0] && this[0].parentNode ) {
      return this.domManip(arguments, false, function( elem ) {
        this.parentNode.insertBefore( elem, this );
      });
    } else if ( arguments.length ) {
      var set = jQuery(arguments[0]);
      set.push.apply( set, this.toArray() );
      return this.pushStack( set, "before", arguments );
    }
  },

  after: function() {
    if ( this[0] && this[0].parentNode ) {
      return this.domManip(arguments, false, function( elem ) {
        this.parentNode.insertBefore( elem, this.nextSibling );
      });
    } else if ( arguments.length ) {
      var set = this.pushStack( this, "after", arguments );
      set.push.apply( set, jQuery(arguments[0]).toArray() );
      return set;
    }
  },

  // keepData is for internal use only--do not document
  remove: function( selector, keepData ) {
    for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
      if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
        if ( !keepData && elem.nodeType === 1 ) {
          jQuery.cleanData( elem.getElementsByTagName("*") );
          jQuery.cleanData( [ elem ] );
        }

        if ( elem.parentNode ) {
          elem.parentNode.removeChild( elem );
        }
      }
    }

    return this;
  },

  empty: function() {
    for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
      // Remove element nodes and prevent memory leaks
      if ( elem.nodeType === 1 ) {
        jQuery.cleanData( elem.getElementsByTagName("*") );
      }

      // Remove any remaining nodes
      while ( elem.firstChild ) {
        elem.removeChild( elem.firstChild );
      }
    }

    return this;
  },

  clone: function( dataAndEvents, deepDataAndEvents ) {
    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

    return this.map( function () {
      return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
    });
  },

  html: function( value ) {
    if ( value === undefined ) {
      return this[0] && this[0].nodeType === 1 ?
        this[0].innerHTML.replace(rinlinejQuery, "") :
        null;

    // See if we can take a shortcut and just use innerHTML
    } else if ( typeof value === "string" && !rnocache.test( value ) &&
      (jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
      !wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

      value = value.replace(rxhtmlTag, "<$1></$2>");

      try {
        for ( var i = 0, l = this.length; i < l; i++ ) {
          // Remove element nodes and prevent memory leaks
          if ( this[i].nodeType === 1 ) {
            jQuery.cleanData( this[i].getElementsByTagName("*") );
            this[i].innerHTML = value;
          }
        }

      // If using innerHTML throws an exception, use the fallback method
      } catch(e) {
        this.empty().append( value );
      }

    } else if ( jQuery.isFunction( value ) ) {
      this.each(function(i){
        var self = jQuery( this );

        self.html( value.call(this, i, self.html()) );
      });

    } else {
      this.empty().append( value );
    }

    return this;
  },

  replaceWith: function( value ) {
    if ( this[0] && this[0].parentNode ) {
      // Make sure that the elements are removed from the DOM before they are inserted
      // this can help fix replacing a parent with child elements
      if ( jQuery.isFunction( value ) ) {
        return this.each(function(i) {
          var self = jQuery(this), old = self.html();
          self.replaceWith( value.call( this, i, old ) );
        });
      }

      if ( typeof value !== "string" ) {
        value = jQuery( value ).detach();
      }

      return this.each(function() {
        var next = this.nextSibling,
          parent = this.parentNode;

        jQuery( this ).remove();

        if ( next ) {
          jQuery(next).before( value );
        } else {
          jQuery(parent).append( value );
        }
      });
    } else {
      return this.length ?
        this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
        this;
    }
  },

  detach: function( selector ) {
    return this.remove( selector, true );
  },

  domManip: function( args, table, callback ) {
    var results, first, fragment, parent,
      value = args[0],
      scripts = [];

    // We can't cloneNode fragments that contain checked, in WebKit
    if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
      return this.each(function() {
        jQuery(this).domManip( args, table, callback, true );
      });
    }

    if ( jQuery.isFunction(value) ) {
      return this.each(function(i) {
        var self = jQuery(this);
        args[0] = value.call(this, i, table ? self.html() : undefined);
        self.domManip( args, table, callback );
      });
    }

    if ( this[0] ) {
      parent = value && value.parentNode;

      // If we're in a fragment, just use that instead of building a new one
      if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
        results = { fragment: parent };

      } else {
        results = jQuery.buildFragment( args, this, scripts );
      }

      fragment = results.fragment;

      if ( fragment.childNodes.length === 1 ) {
        first = fragment = fragment.firstChild;
      } else {
        first = fragment.firstChild;
      }

      if ( first ) {
        table = table && jQuery.nodeName( first, "tr" );

        for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
          callback.call(
            table ?
              root(this[i], first) :
              this[i],
            // Make sure that we do not leak memory by inadvertently discarding
            // the original fragment (which might have attached data) instead of
            // using it; in addition, use the original fragment object for the last
            // item instead of first because it can end up being emptied incorrectly
            // in certain situations (Bug #8070).
            // Fragments from the fragment cache must always be cloned and never used
            // in place.
            results.cacheable || (l > 1 && i < lastIndex) ?
              jQuery.clone( fragment, true, true ) :
              fragment
          );
        }
      }

      if ( scripts.length ) {
        jQuery.each( scripts, evalScript );
      }
    }

    return this;
  }
});

function root( elem, cur ) {
  return jQuery.nodeName(elem, "table") ?
    (elem.getElementsByTagName("tbody")[0] ||
    elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
    elem;
}

function cloneCopyEvent( src, dest ) {

  if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
    return;
  }

  var internalKey = jQuery.expando,
    oldData = jQuery.data( src ),
    curData = jQuery.data( dest, oldData );

  // Switch to use the internal data object, if it exists, for the next
  // stage of data copying
  if ( (oldData = oldData[ internalKey ]) ) {
    var events = oldData.events;
        curData = curData[ internalKey ] = jQuery.extend({}, oldData);

    if ( events ) {
      delete curData.handle;
      curData.events = {};

      for ( var type in events ) {
        for ( var i = 0, l = events[ type ].length; i < l; i++ ) {
          jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
        }
      }
    }
  }
}

function cloneFixAttributes( src, dest ) {
  var nodeName;

  // We do not need to do anything for non-Elements
  if ( dest.nodeType !== 1 ) {
    return;
  }

  // clearAttributes removes the attributes, which we don't want,
  // but also removes the attachEvent events, which we *do* want
  if ( dest.clearAttributes ) {
    dest.clearAttributes();
  }

  // mergeAttributes, in contrast, only merges back on the
  // original attributes, not the events
  if ( dest.mergeAttributes ) {
    dest.mergeAttributes( src );
  }

  nodeName = dest.nodeName.toLowerCase();

  // IE6-8 fail to clone children inside object elements that use
  // the proprietary classid attribute value (rather than the type
  // attribute) to identify the type of content to display
  if ( nodeName === "object" ) {
    dest.outerHTML = src.outerHTML;

  } else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
    // IE6-8 fails to persist the checked state of a cloned checkbox
    // or radio button. Worse, IE6-7 fail to give the cloned element
    // a checked appearance if the defaultChecked value isn't also set
    if ( src.checked ) {
      dest.defaultChecked = dest.checked = src.checked;
    }

    // IE6-7 get confused and end up setting the value of a cloned
    // checkbox/radio button to an empty string instead of "on"
    if ( dest.value !== src.value ) {
      dest.value = src.value;
    }

  // IE6-8 fails to return the selected option to the default selected
  // state when cloning options
  } else if ( nodeName === "option" ) {
    dest.selected = src.defaultSelected;

  // IE6-8 fails to set the defaultValue to the correct value when
  // cloning other types of input fields
  } else if ( nodeName === "input" || nodeName === "textarea" ) {
    dest.defaultValue = src.defaultValue;
  }

  // Event data gets referenced instead of copied if the expando
  // gets copied too
  dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
  var fragment, cacheable, cacheresults, doc;

  // nodes may contain either an explicit document object,
  // a jQuery collection or context object.
  // If nodes[0] contains a valid object to assign to doc
  if ( nodes && nodes[0] ) {
    doc = nodes[0].ownerDocument || nodes[0];
  }

  // Ensure that an attr object doesn't incorrectly stand in as a document object
  // Chrome and Firefox seem to allow this to occur and will throw exception
  // Fixes #8950
  if ( !doc.createDocumentFragment ) {
    doc = document;
  }

  // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
  // Cloning options loses the selected state, so don't cache them
  // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
  // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
  if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
    args[0].charAt(0) === "<" && !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

    cacheable = true;

    cacheresults = jQuery.fragments[ args[0] ];
    if ( cacheresults && cacheresults !== 1 ) {
      fragment = cacheresults;
    }
  }

  if ( !fragment ) {
    fragment = doc.createDocumentFragment();
    jQuery.clean( args, doc, fragment, scripts );
  }

  if ( cacheable ) {
    jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
  }

  return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
  appendTo: "append",
  prependTo: "prepend",
  insertBefore: "before",
  insertAfter: "after",
  replaceAll: "replaceWith"
}, function( name, original ) {
  jQuery.fn[ name ] = function( selector ) {
    var ret = [],
      insert = jQuery( selector ),
      parent = this.length === 1 && this[0].parentNode;

    if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
      insert[ original ]( this[0] );
      return this;

    } else {
      for ( var i = 0, l = insert.length; i < l; i++ ) {
        var elems = (i > 0 ? this.clone(true) : this).get();
        jQuery( insert[i] )[ original ]( elems );
        ret = ret.concat( elems );
      }

      return this.pushStack( ret, name, insert.selector );
    }
  };
});

function getAll( elem ) {
  if ( "getElementsByTagName" in elem ) {
    return elem.getElementsByTagName( "*" );

  } else if ( "querySelectorAll" in elem ) {
    return elem.querySelectorAll( "*" );

  } else {
    return [];
  }
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
  if ( elem.type === "checkbox" || elem.type === "radio" ) {
    elem.defaultChecked = elem.checked;
  }
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
  if ( jQuery.nodeName( elem, "input" ) ) {
    fixDefaultChecked( elem );
  } else if ( "getElementsByTagName" in elem ) {
    jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
  }
}

jQuery.extend({
  clone: function( elem, dataAndEvents, deepDataAndEvents ) {
    var clone = elem.cloneNode(true),
        srcElements,
        destElements,
        i;

    if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
        (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
      // IE copies events bound via attachEvent when using cloneNode.
      // Calling detachEvent on the clone will also remove the events
      // from the original. In order to get around this, we use some
      // proprietary methods to clear the events. Thanks to MooTools
      // guys for this hotness.

      cloneFixAttributes( elem, clone );

      // Using Sizzle here is crazy slow, so we use getElementsByTagName
      // instead
      srcElements = getAll( elem );
      destElements = getAll( clone );

      // Weird iteration because IE will replace the length property
      // with an element if you are cloning the body and one of the
      // elements on the page has a name or id of "length"
      for ( i = 0; srcElements[i]; ++i ) {
        cloneFixAttributes( srcElements[i], destElements[i] );
      }
    }

    // Copy the events from the original to the clone
    if ( dataAndEvents ) {
      cloneCopyEvent( elem, clone );

      if ( deepDataAndEvents ) {
        srcElements = getAll( elem );
        destElements = getAll( clone );

        for ( i = 0; srcElements[i]; ++i ) {
          cloneCopyEvent( srcElements[i], destElements[i] );
        }
      }
    }

    srcElements = destElements = null;

    // Return the cloned set
    return clone;
  },

  clean: function( elems, context, fragment, scripts ) {
    var checkScriptType;

    context = context || document;

    // !context.createElement fails in IE with an error but returns typeof 'object'
    if ( typeof context.createElement === "undefined" ) {
      context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
    }

    var ret = [], j;

    for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
      if ( typeof elem === "number" ) {
        elem += "";
      }

      if ( !elem ) {
        continue;
      }

      // Convert html string into DOM nodes
      if ( typeof elem === "string" ) {
        if ( !rhtml.test( elem ) ) {
          elem = context.createTextNode( elem );
        } else {
          // Fix "XHTML"-style tags in all browsers
          elem = elem.replace(rxhtmlTag, "<$1></$2>");

          // Trim whitespace, otherwise indexOf won't work as expected
          var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
            wrap = wrapMap[ tag ] || wrapMap._default,
            depth = wrap[0],
            div = context.createElement("div");

          // Go to html and back, then peel off extra wrappers
          div.innerHTML = wrap[1] + elem + wrap[2];

          // Move to the right depth
          while ( depth-- ) {
            div = div.lastChild;
          }

          // Remove IE's autoinserted <tbody> from table fragments
          if ( !jQuery.support.tbody ) {

            // String was a <table>, *may* have spurious <tbody>
            var hasBody = rtbody.test(elem),
              tbody = tag === "table" && !hasBody ?
                div.firstChild && div.firstChild.childNodes :

                // String was a bare <thead> or <tfoot>
                wrap[1] === "<table>" && !hasBody ?
                  div.childNodes :
                  [];

            for ( j = tbody.length - 1; j >= 0 ; --j ) {
              if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
                tbody[ j ].parentNode.removeChild( tbody[ j ] );
              }
            }
          }

          // IE completely kills leading whitespace when innerHTML is used
          if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
            div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
          }

          elem = div.childNodes;
        }
      }

      // Resets defaultChecked for any radios and checkboxes
      // about to be appended to the DOM in IE 6/7 (#8060)
      var len;
      if ( !jQuery.support.appendChecked ) {
        if ( elem[0] && typeof (len = elem.length) === "number" ) {
          for ( j = 0; j < len; j++ ) {
            findInputs( elem[j] );
          }
        } else {
          findInputs( elem );
        }
      }

      if ( elem.nodeType ) {
        ret.push( elem );
      } else {
        ret = jQuery.merge( ret, elem );
      }
    }

    if ( fragment ) {
      checkScriptType = function( elem ) {
        return !elem.type || rscriptType.test( elem.type );
      };
      for ( i = 0; ret[i]; i++ ) {
        if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
          scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

        } else {
          if ( ret[i].nodeType === 1 ) {
            var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

            ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
          }
          fragment.appendChild( ret[i] );
        }
      }
    }

    return ret;
  },

  cleanData: function( elems ) {
    var data, id, cache = jQuery.cache, internalKey = jQuery.expando, special = jQuery.event.special,
      deleteExpando = jQuery.support.deleteExpando;

    for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
      if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
        continue;
      }

      id = elem[ jQuery.expando ];

      if ( id ) {
        data = cache[ id ] && cache[ id ][ internalKey ];

        if ( data && data.events ) {
          for ( var type in data.events ) {
            if ( special[ type ] ) {
              jQuery.event.remove( elem, type );

            // This is a shortcut to avoid jQuery.event.remove's overhead
            } else {
              jQuery.removeEvent( elem, type, data.handle );
            }
          }

          // Null the DOM reference to avoid IE6/7/8 leak (#7054)
          if ( data.handle ) {
            data.handle.elem = null;
          }
        }

        if ( deleteExpando ) {
          delete elem[ jQuery.expando ];

        } else if ( elem.removeAttribute ) {
          elem.removeAttribute( jQuery.expando );
        }

        delete cache[ id ];
      }
    }
  }
});

function evalScript( i, elem ) {
  if ( elem.src ) {
    jQuery.ajax({
      url: elem.src,
      async: false,
      dataType: "script"
    });
  } else {
    jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
  }

  if ( elem.parentNode ) {
    elem.parentNode.removeChild( elem );
  }
}



var ralpha = /alpha\([^)]*\)/i,
  ropacity = /opacity=([^)]*)/,
  // fixed for IE9, see #8346
  rupper = /([A-Z]|^ms)/g,
  rnumpx = /^-?\d+(?:px)?$/i,
  rnum = /^-?\d/,
  rrelNum = /^[+\-]=/,
  rrelNumFilter = /[^+\-\.\de]+/g,

  cssShow = { position: "absolute", visibility: "hidden", display: "block" },
  cssWidth = [ "Left", "Right" ],
  cssHeight = [ "Top", "Bottom" ],
  curCSS,

  getComputedStyle,
  currentStyle;

jQuery.fn.css = function( name, value ) {
  // Setting 'undefined' is a no-op
  if ( arguments.length === 2 && value === undefined ) {
    return this;
  }

  return jQuery.access( this, name, value, true, function( elem, name, value ) {
    return value !== undefined ?
      jQuery.style( elem, name, value ) :
      jQuery.css( elem, name );
  });
};

jQuery.extend({
  // Add in style property hooks for overriding the default
  // behavior of getting and setting a style property
  cssHooks: {
    opacity: {
      get: function( elem, computed ) {
        if ( computed ) {
          // We should always get a number back from opacity
          var ret = curCSS( elem, "opacity", "opacity" );
          return ret === "" ? "1" : ret;

        } else {
          return elem.style.opacity;
        }
      }
    }
  },

  // Exclude the following css properties to add px
  cssNumber: {
    "fillOpacity": true,
    "fontWeight": true,
    "lineHeight": true,
    "opacity": true,
    "orphans": true,
    "widows": true,
    "zIndex": true,
    "zoom": true
  },

  // Add in properties whose names you wish to fix before
  // setting or getting the value
  cssProps: {
    // normalize float css property
    "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
  },

  // Get and set the style property on a DOM Node
  style: function( elem, name, value, extra ) {
    // Don't set styles on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
      return;
    }

    // Make sure that we're working with the right name
    var ret, type, origName = jQuery.camelCase( name ),
      style = elem.style, hooks = jQuery.cssHooks[ origName ];

    name = jQuery.cssProps[ origName ] || origName;

    // Check if we're setting a value
    if ( value !== undefined ) {
      type = typeof value;

      // Make sure that NaN and null values aren't set. See: #7116
      if ( type === "number" && isNaN( value ) || value == null ) {
        return;
      }

      // convert relative number strings (+= or -=) to relative numbers. #7345
      if ( type === "string" && rrelNum.test( value ) ) {
        value = +value.replace( rrelNumFilter, "" ) + parseFloat( jQuery.css( elem, name ) );
        // Fixes bug #9237
        type = "number";
      }

      // If a number was passed in, add 'px' to the (except for certain CSS properties)
      if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
        value += "px";
      }

      // If a hook was provided, use that value, otherwise just set the specified value
      if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
        // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
        // Fixes bug #5509
        try {
          style[ name ] = value;
        } catch(e) {}
      }

    } else {
      // If a hook was provided get the non-computed value from there
      if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
        return ret;
      }

      // Otherwise just get the value from the style object
      return style[ name ];
    }
  },

  css: function( elem, name, extra ) {
    var ret, hooks;

    // Make sure that we're working with the right name
    name = jQuery.camelCase( name );
    hooks = jQuery.cssHooks[ name ];
    name = jQuery.cssProps[ name ] || name;

    // cssFloat needs a special treatment
    if ( name === "cssFloat" ) {
      name = "float";
    }

    // If a hook was provided get the computed value from there
    if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
      return ret;

    // Otherwise, if a way to get the computed value exists, use that
    } else if ( curCSS ) {
      return curCSS( elem, name );
    }
  },

  // A method for quickly swapping in/out CSS properties to get correct calculations
  swap: function( elem, options, callback ) {
    var old = {};

    // Remember the old values, and insert the new ones
    for ( var name in options ) {
      old[ name ] = elem.style[ name ];
      elem.style[ name ] = options[ name ];
    }

    callback.call( elem );

    // Revert the old values
    for ( name in options ) {
      elem.style[ name ] = old[ name ];
    }
  }
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
  jQuery.cssHooks[ name ] = {
    get: function( elem, computed, extra ) {
      var val;

      if ( computed ) {
        if ( elem.offsetWidth !== 0 ) {
          return getWH( elem, name, extra );
        } else {
          jQuery.swap( elem, cssShow, function() {
            val = getWH( elem, name, extra );
          });
        }

        return val;
      }
    },

    set: function( elem, value ) {
      if ( rnumpx.test( value ) ) {
        // ignore negative width and height values #1599
        value = parseFloat( value );

        if ( value >= 0 ) {
          return value + "px";
        }

      } else {
        return value;
      }
    }
  };
});

if ( !jQuery.support.opacity ) {
  jQuery.cssHooks.opacity = {
    get: function( elem, computed ) {
      // IE uses filters for opacity
      return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
        ( parseFloat( RegExp.$1 ) / 100 ) + "" :
        computed ? "1" : "";
    },

    set: function( elem, value ) {
      var style = elem.style,
        currentStyle = elem.currentStyle;

      // IE has trouble with opacity if it does not have layout
      // Force it by setting the zoom level
      style.zoom = 1;

      // Set the alpha filter to set the opacity
      var opacity = jQuery.isNaN( value ) ?
        "" :
        "alpha(opacity=" + value * 100 + ")",
        filter = currentStyle && currentStyle.filter || style.filter || "";

      style.filter = ralpha.test( filter ) ?
        filter.replace( ralpha, opacity ) :
        filter + " " + opacity;
    }
  };
}

jQuery(function() {
  // This hook cannot be added until DOM ready because the support test
  // for it is not run until after DOM ready
  if ( !jQuery.support.reliableMarginRight ) {
    jQuery.cssHooks.marginRight = {
      get: function( elem, computed ) {
        // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
        // Work around by temporarily setting element display to inline-block
        var ret;
        jQuery.swap( elem, { "display": "inline-block" }, function() {
          if ( computed ) {
            ret = curCSS( elem, "margin-right", "marginRight" );
          } else {
            ret = elem.style.marginRight;
          }
        });
        return ret;
      }
    };
  }
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
  getComputedStyle = function( elem, name ) {
    var ret, defaultView, computedStyle;

    name = name.replace( rupper, "-$1" ).toLowerCase();

    if ( !(defaultView = elem.ownerDocument.defaultView) ) {
      return undefined;
    }

    if ( (computedStyle = defaultView.getComputedStyle( elem, null )) ) {
      ret = computedStyle.getPropertyValue( name );
      if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
        ret = jQuery.style( elem, name );
      }
    }

    return ret;
  };
}

if ( document.documentElement.currentStyle ) {
  currentStyle = function( elem, name ) {
    var left,
      ret = elem.currentStyle && elem.currentStyle[ name ],
      rsLeft = elem.runtimeStyle && elem.runtimeStyle[ name ],
      style = elem.style;

    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels
    if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
      // Remember the original values
      left = style.left;

      // Put in the new values to get a computed value out
      if ( rsLeft ) {
        elem.runtimeStyle.left = elem.currentStyle.left;
      }
      style.left = name === "fontSize" ? "1em" : (ret || 0);
      ret = style.pixelLeft + "px";

      // Revert the changed values
      style.left = left;
      if ( rsLeft ) {
        elem.runtimeStyle.left = rsLeft;
      }
    }

    return ret === "" ? "auto" : ret;
  };
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

  // Start with offset property
  var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
    which = name === "width" ? cssWidth : cssHeight;

  if ( val > 0 ) {
    if ( extra !== "border" ) {
      jQuery.each( which, function() {
        if ( !extra ) {
          val -= parseFloat( jQuery.css( elem, "padding" + this ) ) || 0;
        }
        if ( extra === "margin" ) {
          val += parseFloat( jQuery.css( elem, extra + this ) ) || 0;
        } else {
          val -= parseFloat( jQuery.css( elem, "border" + this + "Width" ) ) || 0;
        }
      });
    }

    return val + "px";
  }

  // Fall back to computed then uncomputed css if necessary
  val = curCSS( elem, name, name );
  if ( val < 0 || val == null ) {
    val = elem.style[ name ] || 0;
  }
  // Normalize "", auto, and prepare for extra
  val = parseFloat( val ) || 0;

  // Add padding, border, margin
  if ( extra ) {
    jQuery.each( which, function() {
      val += parseFloat( jQuery.css( elem, "padding" + this ) ) || 0;
      if ( extra !== "padding" ) {
        val += parseFloat( jQuery.css( elem, "border" + this + "Width" ) ) || 0;
      }
      if ( extra === "margin" ) {
        val += parseFloat( jQuery.css( elem, extra + this ) ) || 0;
      }
    });
  }

  return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.hidden = function( elem ) {
    var width = elem.offsetWidth,
      height = elem.offsetHeight;

    return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
  };

  jQuery.expr.filters.visible = function( elem ) {
    return !jQuery.expr.filters.hidden( elem );
  };
}




var r20 = /%20/g,
  rbracket = /\[\]$/,
  rCRLF = /\r?\n/g,
  rhash = /#.*$/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
  rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
  // #7653, #8125, #8152: local protocol detection
  rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  rquery = /\?/,
  rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  rselectTextarea = /^(?:select|textarea)/i,
  rspacesAjax = /\s+/,
  rts = /([?&])_=[^&]*/,
  rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

  // Keep a copy of the old load method
  _load = jQuery.fn.load,

  /* Prefilters
   * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
   * 2) These are called:
   *    - BEFORE asking for a transport
   *    - AFTER param serialization (s.data is a string if s.processData is true)
   * 3) key is the dataType
   * 4) the catchall symbol "*" can be used
   * 5) execution will start with transport dataType and THEN continue down to "*" if needed
   */
  prefilters = {},

  /* Transports bindings
   * 1) key is the dataType
   * 2) the catchall symbol "*" can be used
   * 3) selection will start with transport dataType and THEN go to "*" if needed
   */
  transports = {},

  // Document location
  ajaxLocation,

  // Document location segments
  ajaxLocParts;

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
  ajaxLocation = location.href;
} catch( e ) {
  // Use the href attribute of an A element
  // since IE will modify it given document.location
  ajaxLocation = document.createElement( "a" );
  ajaxLocation.href = "";
  ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

  // dataTypeExpression is optional and defaults to "*"
  return function( dataTypeExpression, func ) {

    if ( typeof dataTypeExpression !== "string" ) {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    if ( jQuery.isFunction( func ) ) {
      var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
        i = 0,
        length = dataTypes.length,
        dataType,
        list,
        placeBefore;

      // For each dataType in the dataTypeExpression
      for(; i < length; i++ ) {
        dataType = dataTypes[ i ];
        // We control if we're asked to add before
        // any existing element
        placeBefore = /^\+/.test( dataType );
        if ( placeBefore ) {
          dataType = dataType.substr( 1 ) || "*";
        }
        list = structure[ dataType ] = structure[ dataType ] || [];
        // then we add to the structure accordingly
        list[ placeBefore ? "unshift" : "push" ]( func );
      }
    }
  };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
    dataType /* internal */, inspected /* internal */ ) {

  dataType = dataType || options.dataTypes[ 0 ];
  inspected = inspected || {};

  inspected[ dataType ] = true;

  var list = structure[ dataType ],
    i = 0,
    length = list ? list.length : 0,
    executeOnly = ( structure === prefilters ),
    selection;

  for(; i < length && ( executeOnly || !selection ); i++ ) {
    selection = list[ i ]( options, originalOptions, jqXHR );
    // If we got redirected to another dataType
    // we try there if executing only and not done already
    if ( typeof selection === "string" ) {
      if ( !executeOnly || inspected[ selection ] ) {
        selection = undefined;
      } else {
        options.dataTypes.unshift( selection );
        selection = inspectPrefiltersOrTransports(
            structure, options, originalOptions, jqXHR, selection, inspected );
      }
    }
  }
  // If we're only executing or nothing was selected
  // we try the catchall dataType if not done already
  if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
    selection = inspectPrefiltersOrTransports(
        structure, options, originalOptions, jqXHR, "*", inspected );
  }
  // unnecessary when only executing (prefilters)
  // but it'll be ignored by the caller in that case
  return selection;
}

jQuery.fn.extend({
  load: function( url, params, callback ) {
    if ( typeof url !== "string" && _load ) {
      return _load.apply( this, arguments );

    // Don't do a request if no elements are being requested
    } else if ( !this.length ) {
      return this;
    }

    var off = url.indexOf( " " );
    if ( off >= 0 ) {
      var selector = url.slice( off, url.length );
      url = url.slice( 0, off );
    }

    // Default to a GET request
    var type = "GET";

    // If the second parameter was provided
    if ( params ) {
      // If it's a function
      if ( jQuery.isFunction( params ) ) {
        // We assume that it's the callback
        callback = params;
        params = undefined;

      // Otherwise, build a param string
      } else if ( typeof params === "object" ) {
        params = jQuery.param( params, jQuery.ajaxSettings.traditional );
        type = "POST";
      }
    }

    var self = this;

    // Request the remote document
    jQuery.ajax({
      url: url,
      type: type,
      dataType: "html",
      data: params,
      // Complete callback (responseText is used internally)
      complete: function( jqXHR, status, responseText ) {
        // Store the response as specified by the jqXHR object
        responseText = jqXHR.responseText;
        // If successful, inject the HTML into all the matched elements
        if ( jqXHR.isResolved() ) {
          // #4825: Get the actual response in case
          // a dataFilter is present in ajaxSettings
          jqXHR.done(function( r ) {
            responseText = r;
          });
          // See if a selector was specified
          self.html( selector ?
            // Create a dummy div to hold the results
            jQuery("<div>")
              // inject the contents of the document in, removing the scripts
              // to avoid any 'Permission Denied' errors in IE
              .append(responseText.replace(rscript, ""))

              // Locate the specified elements
              .find(selector) :

            // If not, just inject the full result
            responseText );
        }

        if ( callback ) {
          self.each( callback, [ responseText, status, jqXHR ] );
        }
      }
    });

    return this;
  },

  serialize: function() {
    return jQuery.param( this.serializeArray() );
  },

  serializeArray: function() {
    return this.map(function(){
      return this.elements ? jQuery.makeArray( this.elements ) : this;
    })
    .filter(function(){
      return this.name && !this.disabled &&
        ( this.checked || rselectTextarea.test( this.nodeName ) ||
          rinput.test( this.type ) );
    })
    .map(function( i, elem ){
      var val = jQuery( this ).val();

      return val == null ?
        null :
        jQuery.isArray( val ) ?
          jQuery.map( val, function( val, i ){
            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
          }) :
          { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    }).get();
  }
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
  jQuery.fn[ o ] = function( f ){
    return this.bind( o, f );
  };
});

jQuery.each( [ "get", "post" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    // shift arguments if data argument was omitted
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      type: method,
      url: url,
      data: data,
      success: callback,
      dataType: type
    });
  };
});

jQuery.extend({

  getScript: function( url, callback ) {
    return jQuery.get( url, undefined, callback, "script" );
  },

  getJSON: function( url, data, callback ) {
    return jQuery.get( url, data, callback, "json" );
  },

  // Creates a full fledged settings object into target
  // with both ajaxSettings and settings fields.
  // If target is omitted, writes into ajaxSettings.
  ajaxSetup: function ( target, settings ) {
    if ( !settings ) {
      // Only one parameter, we extend ajaxSettings
      settings = target;
      target = jQuery.extend( true, jQuery.ajaxSettings, settings );
    } else {
      // target was provided, we extend into it
      jQuery.extend( true, target, jQuery.ajaxSettings, settings );
    }
    // Flatten fields we don't want deep extended
    for( var field in { context: 1, url: 1 } ) {
      if ( field in settings ) {
        target[ field ] = settings[ field ];
      } else if( field in jQuery.ajaxSettings ) {
        target[ field ] = jQuery.ajaxSettings[ field ];
      }
    }
    return target;
  },

  ajaxSettings: {
    url: ajaxLocation,
    isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
    global: true,
    type: "GET",
    contentType: "application/x-www-form-urlencoded",
    processData: true,
    async: true,
    /*
    timeout: 0,
    data: null,
    dataType: null,
    username: null,
    password: null,
    cache: null,
    traditional: false,
    headers: {},
    */

    accepts: {
      xml: "application/xml, text/xml",
      html: "text/html",
      text: "text/plain",
      json: "application/json, text/javascript",
      "*": "*/*"
    },

    contents: {
      xml: /xml/,
      html: /html/,
      json: /json/
    },

    responseFields: {
      xml: "responseXML",
      text: "responseText"
    },

    // List of data converters
    // 1) key format is "source_type destination_type" (a single space in-between)
    // 2) the catchall symbol "*" can be used for source_type
    converters: {

      // Convert anything to text
      "* text": window.String,

      // Text to html (true = no transformation)
      "text html": true,

      // Evaluate text as a json expression
      "text json": jQuery.parseJSON,

      // Parse text as xml
      "text xml": jQuery.parseXML
    }
  },

  ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
  ajaxTransport: addToPrefiltersOrTransports( transports ),

  // Main method
  ajax: function( url, options ) {

    // If url is an object, simulate pre-1.5 signature
    if ( typeof url === "object" ) {
      options = url;
      url = undefined;
    }

    // Force options to be an object
    options = options || {};

    var // Create the final options object
      s = jQuery.ajaxSetup( {}, options ),
      // Callbacks context
      callbackContext = s.context || s,
      // Context for global events
      // It's the callbackContext if one was provided in the options
      // and if it's a DOM node or a jQuery collection
      globalEventContext = callbackContext !== s &&
        ( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
            jQuery( callbackContext ) : jQuery.event,
      // Deferreds
      deferred = jQuery.Deferred(),
      completeDeferred = jQuery._Deferred(),
      // Status-dependent callbacks
      statusCode = s.statusCode || {},
      // ifModified key
      ifModifiedKey,
      // Headers (they are sent all at once)
      requestHeaders = {},
      requestHeadersNames = {},
      // Response headers
      responseHeadersString,
      responseHeaders,
      // transport
      transport,
      // timeout handle
      timeoutTimer,
      // Cross-domain detection vars
      parts,
      // The jqXHR state
      state = 0,
      // To know if global events are to be dispatched
      fireGlobals,
      // Loop variable
      i,
      // Fake xhr
      jqXHR = {

        readyState: 0,

        // Caches the header
        setRequestHeader: function( name, value ) {
          if ( !state ) {
            var lname = name.toLowerCase();
            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
            requestHeaders[ name ] = value;
          }
          return this;
        },

        // Raw string
        getAllResponseHeaders: function() {
          return state === 2 ? responseHeadersString : null;
        },

        // Builds headers hashtable if needed
        getResponseHeader: function( key ) {
          var match;
          if ( state === 2 ) {
            if ( !responseHeaders ) {
              responseHeaders = {};
              while( ( match = rheaders.exec( responseHeadersString ) ) ) {
                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
              }
            }
            match = responseHeaders[ key.toLowerCase() ];
          }
          return match === undefined ? null : match;
        },

        // Overrides response content-type header
        overrideMimeType: function( type ) {
          if ( !state ) {
            s.mimeType = type;
          }
          return this;
        },

        // Cancel the request
        abort: function( statusText ) {
          statusText = statusText || "abort";
          if ( transport ) {
            transport.abort( statusText );
          }
          done( 0, statusText );
          return this;
        }
      };

    // Callback for when everything is done
    // It is defined here because jslint complains if it is declared
    // at the end of the function (which would be more logical and readable)
    function done( status, statusText, responses, headers ) {

      // Called once
      if ( state === 2 ) {
        return;
      }

      // State is "done" now
      state = 2;

      // Clear timeout if it exists
      if ( timeoutTimer ) {
        clearTimeout( timeoutTimer );
      }

      // Dereference transport for early garbage collection
      // (no matter how long the jqXHR object will be used)
      transport = undefined;

      // Cache response headers
      responseHeadersString = headers || "";

      // Set readyState
      jqXHR.readyState = status ? 4 : 0;

      var isSuccess,
        success,
        error,
        response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
        lastModified,
        etag;

      // If successful, handle type chaining
      if ( status >= 200 && status < 300 || status === 304 ) {

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {

          if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
            jQuery.lastModified[ ifModifiedKey ] = lastModified;
          }
          if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
            jQuery.etag[ ifModifiedKey ] = etag;
          }
        }

        // If not modified
        if ( status === 304 ) {

          statusText = "notmodified";
          isSuccess = true;

        // If we have data
        } else {

          try {
            success = ajaxConvert( s, response );
            statusText = "success";
            isSuccess = true;
          } catch(e) {
            // We have a parsererror
            statusText = "parsererror";
            error = e;
          }
        }
      } else {
        // We extract error from statusText
        // then normalize statusText and status for non-aborts
        error = statusText;
        if( !statusText || status ) {
          statusText = "error";
          if ( status < 0 ) {
            status = 0;
          }
        }
      }

      // Set data for the fake xhr object
      jqXHR.status = status;
      jqXHR.statusText = statusText;

      // Success/Error
      if ( isSuccess ) {
        deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
      } else {
        deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
      }

      // Status-dependent callbacks
      jqXHR.statusCode( statusCode );
      statusCode = undefined;

      if ( fireGlobals ) {
        globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
            [ jqXHR, s, isSuccess ? success : error ] );
      }

      // Complete
      completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxComplete", [ jqXHR, s] );
        // Handle the global AJAX counter
        if ( !( --jQuery.active ) ) {
          jQuery.event.trigger( "ajaxStop" );
        }
      }
    }

    // Attach deferreds
    deferred.promise( jqXHR );
    jqXHR.success = jqXHR.done;
    jqXHR.error = jqXHR.fail;
    jqXHR.complete = completeDeferred.done;

    // Status-dependent callbacks
    jqXHR.statusCode = function( map ) {
      if ( map ) {
        var tmp;
        if ( state < 2 ) {
          for( tmp in map ) {
            statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
          }
        } else {
          tmp = map[ jqXHR.status ];
          jqXHR.then( tmp, tmp );
        }
      }
      return this;
    };

    // Remove hash character (#7531: and string promotion)
    // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
    // We also use the url parameter if available
    s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

    // Extract dataTypes list
    s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

    // Determine if a cross-domain request is in order
    if ( s.crossDomain == null ) {
      parts = rurl.exec( s.url.toLowerCase() );
      s.crossDomain = !!( parts &&
        ( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
          ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
            ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
      );
    }

    // Convert data if not already a string
    if ( s.data && s.processData && typeof s.data !== "string" ) {
      s.data = jQuery.param( s.data, s.traditional );
    }

    // Apply prefilters
    inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

    // If request was aborted inside a prefiler, stop there
    if ( state === 2 ) {
      return false;
    }

    // We can fire global events as of now if asked to
    fireGlobals = s.global;

    // Uppercase the type
    s.type = s.type.toUpperCase();

    // Determine if request has content
    s.hasContent = !rnoContent.test( s.type );

    // Watch for a new set of requests
    if ( fireGlobals && jQuery.active++ === 0 ) {
      jQuery.event.trigger( "ajaxStart" );
    }

    // More options handling for requests with no content
    if ( !s.hasContent ) {

      // If data is available, append data to url
      if ( s.data ) {
        s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
      }

      // Get ifModifiedKey before adding the anti-cache parameter
      ifModifiedKey = s.url;

      // Add anti-cache in url if needed
      if ( s.cache === false ) {

        var ts = jQuery.now(),
          // try replacing _= if it is there
          ret = s.url.replace( rts, "$1_=" + ts );

        // if nothing was replaced, add timestamp to the end
        s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
      }
    }

    // Set the correct header, if data is being sent
    if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
      jqXHR.setRequestHeader( "Content-Type", s.contentType );
    }

    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    if ( s.ifModified ) {
      ifModifiedKey = ifModifiedKey || s.url;
      if ( jQuery.lastModified[ ifModifiedKey ] ) {
        jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
      }
      if ( jQuery.etag[ ifModifiedKey ] ) {
        jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
      }
    }

    // Set the Accepts header for the server, depending on the dataType
    jqXHR.setRequestHeader(
      "Accept",
      s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
        s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", */*; q=0.01" : "" ) :
        s.accepts[ "*" ]
    );

    // Check for headers option
    for ( i in s.headers ) {
      jqXHR.setRequestHeader( i, s.headers[ i ] );
    }

    // Allow custom headers/mimetypes and early abort
    if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
        // Abort if not done already
        jqXHR.abort();
        return false;

    }

    // Install callbacks on deferreds
    for ( i in { success: 1, error: 1, complete: 1 } ) {
      jqXHR[ i ]( s[ i ] );
    }

    // Get transport
    transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

    // If no transport, we auto-abort
    if ( !transport ) {
      done( -1, "No Transport" );
    } else {
      jqXHR.readyState = 1;
      // Send global event
      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
      }
      // Timeout
      if ( s.async && s.timeout > 0 ) {
        timeoutTimer = setTimeout( function(){
          jqXHR.abort( "timeout" );
        }, s.timeout );
      }

      try {
        state = 1;
        transport.send( requestHeaders, done );
      } catch (e) {
        // Propagate exception as error if not done
        if ( status < 2 ) {
          done( -1, e );
        // Simply rethrow otherwise
        } else {
          jQuery.error( e );
        }
      }
    }

    return jqXHR;
  },

  // Serialize an array of form elements or a set of
  // key/values into a query string
  param: function( a, traditional ) {
    var s = [],
      add = function( key, value ) {
        // If value is a function, invoke it and return its value
        value = jQuery.isFunction( value ) ? value() : value;
        s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
      };

    // Set traditional to true for jQuery <= 1.3.2 behavior.
    if ( traditional === undefined ) {
      traditional = jQuery.ajaxSettings.traditional;
    }

    // If an array was passed in, assume that it is an array of form elements.
    if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
      // Serialize the form elements
      jQuery.each( a, function() {
        add( this.name, this.value );
      });

    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for ( var prefix in a ) {
        buildParams( prefix, a[ prefix ], traditional, add );
      }
    }

    // Return the resulting serialization
    return s.join( "&" ).replace( r20, "+" );
  }
});

function buildParams( prefix, obj, traditional, add ) {
  if ( jQuery.isArray( obj ) ) {
    // Serialize array item.
    jQuery.each( obj, function( i, v ) {
      if ( traditional || rbracket.test( prefix ) ) {
        // Treat each array item as a scalar.
        add( prefix, v );

      } else {
        // If array item is non-scalar (array or object), encode its
        // numeric index to resolve deserialization ambiguity issues.
        // Note that rack (as of 1.0.0) can't currently deserialize
        // nested arrays properly, and attempting to do so may cause
        // a server error. Possible fixes are to modify rack's
        // deserialization algorithm or to provide an option or flag
        // to force array serialization to be shallow.
        buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
      }
    });

  } else if ( !traditional && obj != null && typeof obj === "object" ) {
    // Serialize object item.
    for ( var name in obj ) {
      buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
    }

  } else {
    // Serialize scalar item.
    add( prefix, obj );
  }
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

  // Counter for holding the number of active queries
  active: 0,

  // Last-Modified header cache for next request
  lastModified: {},
  etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

  var contents = s.contents,
    dataTypes = s.dataTypes,
    responseFields = s.responseFields,
    ct,
    type,
    finalDataType,
    firstDataType;

  // Fill responseXXX fields
  for( type in responseFields ) {
    if ( type in responses ) {
      jqXHR[ responseFields[type] ] = responses[ type ];
    }
  }

  // Remove auto dataType and get content-type in the process
  while( dataTypes[ 0 ] === "*" ) {
    dataTypes.shift();
    if ( ct === undefined ) {
      ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
    }
  }

  // Check if we're dealing with a known content-type
  if ( ct ) {
    for ( type in contents ) {
      if ( contents[ type ] && contents[ type ].test( ct ) ) {
        dataTypes.unshift( type );
        break;
      }
    }
  }

  // Check to see if we have a response for the expected dataType
  if ( dataTypes[ 0 ] in responses ) {
    finalDataType = dataTypes[ 0 ];
  } else {
    // Try convertible dataTypes
    for ( type in responses ) {
      if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
        finalDataType = type;
        break;
      }
      if ( !firstDataType ) {
        firstDataType = type;
      }
    }
    // Or just use first one
    finalDataType = finalDataType || firstDataType;
  }

  // If we found a dataType
  // We add the dataType to the list if needed
  // and return the corresponding response
  if ( finalDataType ) {
    if ( finalDataType !== dataTypes[ 0 ] ) {
      dataTypes.unshift( finalDataType );
    }
    return responses[ finalDataType ];
  }
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

  // Apply the dataFilter if provided
  if ( s.dataFilter ) {
    response = s.dataFilter( response, s.dataType );
  }

  var dataTypes = s.dataTypes,
    converters = {},
    i,
    key,
    length = dataTypes.length,
    tmp,
    // Current and previous dataTypes
    current = dataTypes[ 0 ],
    prev,
    // Conversion expression
    conversion,
    // Conversion function
    conv,
    // Conversion functions (transitive conversion)
    conv1,
    conv2;

  // For each dataType in the chain
  for( i = 1; i < length; i++ ) {

    // Create converters map
    // with lowercased keys
    if ( i === 1 ) {
      for( key in s.converters ) {
        if( typeof key === "string" ) {
          converters[ key.toLowerCase() ] = s.converters[ key ];
        }
      }
    }

    // Get the dataTypes
    prev = current;
    current = dataTypes[ i ];

    // If current is auto dataType, update it to prev
    if( current === "*" ) {
      current = prev;
    // If no auto and dataTypes are actually different
    } else if ( prev !== "*" && prev !== current ) {

      // Get the converter
      conversion = prev + " " + current;
      conv = converters[ conversion ] || converters[ "* " + current ];

      // If there is no direct converter, search transitively
      if ( !conv ) {
        conv2 = undefined;
        for( conv1 in converters ) {
          tmp = conv1.split( " " );
          if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
            conv2 = converters[ tmp[1] + " " + current ];
            if ( conv2 ) {
              conv1 = converters[ conv1 ];
              if ( conv1 === true ) {
                conv = conv2;
              } else if ( conv2 === true ) {
                conv = conv1;
              }
              break;
            }
          }
        }
      }
      // If we found no converter, dispatch an error
      if ( !( conv || conv2 ) ) {
        jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
      }
      // If found converter is not an equivalence
      if ( conv !== true ) {
        // Convert with 1 or 2 converters accordingly
        response = conv ? conv( response ) : conv2( conv1(response) );
      }
    }
  }
  return response;
}




var jsc = jQuery.now(),
  jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
  jsonp: "callback",
  jsonpCallback: function() {
    return jQuery.expando + "_" + ( jsc++ );
  }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

  var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
    ( typeof s.data === "string" );

  if ( s.dataTypes[ 0 ] === "jsonp" ||
    s.jsonp !== false && ( jsre.test( s.url ) ||
        inspectData && jsre.test( s.data ) ) ) {

    var responseContainer,
      jsonpCallback = s.jsonpCallback =
        jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
      previous = window[ jsonpCallback ],
      url = s.url,
      data = s.data,
      replace = "$1" + jsonpCallback + "$2";

    if ( s.jsonp !== false ) {
      url = url.replace( jsre, replace );
      if ( s.url === url ) {
        if ( inspectData ) {
          data = data.replace( jsre, replace );
        }
        if ( s.data === data ) {
          // Add callback manually
          url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
        }
      }
    }

    s.url = url;
    s.data = data;

    // Install callback
    window[ jsonpCallback ] = function( response ) {
      responseContainer = [ response ];
    };

    // Clean-up function
    jqXHR.always(function() {
      // Set callback back to previous value
      window[ jsonpCallback ] = previous;
      // Call if it was a function and we have a response
      if ( responseContainer && jQuery.isFunction( previous ) ) {
        window[ jsonpCallback ]( responseContainer[ 0 ] );
      }
    });

    // Use data converter to retrieve json after script execution
    s.converters["script json"] = function() {
      if ( !responseContainer ) {
        jQuery.error( jsonpCallback + " was not called" );
      }
      return responseContainer[ 0 ];
    };

    // force json dataType
    s.dataTypes[ 0 ] = "json";

    // Delegate to script
    return "script";
  }
});




// Install script dataType
jQuery.ajaxSetup({
  accepts: {
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  },
  contents: {
    script: /javascript|ecmascript/
  },
  converters: {
    "text script": function( text ) {
      jQuery.globalEval( text );
      return text;
    }
  }
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
  if ( s.cache === undefined ) {
    s.cache = false;
  }
  if ( s.crossDomain ) {
    s.type = "GET";
    s.global = false;
  }
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

  // This transport only deals with cross domain requests
  if ( s.crossDomain ) {

    var script,
      head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

    return {

      send: function( _, callback ) {

        script = document.createElement( "script" );

        script.async = "async";

        if ( s.scriptCharset ) {
          script.charset = s.scriptCharset;
        }

        script.src = s.url;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function( _, isAbort ) {

          if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;

            // Remove the script
            if ( head && script.parentNode ) {
              head.removeChild( script );
            }

            // Dereference the script
            script = undefined;

            // Callback if not abort
            if ( !isAbort ) {
              callback( 200, "success" );
            }
          }
        };
        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
        // This arises when a base node is used (#2709 and #4378).
        head.insertBefore( script, head.firstChild );
      },

      abort: function() {
        if ( script ) {
          script.onload( 0, 1 );
        }
      }
    };
  }
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
  xhrOnUnloadAbort = window.ActiveXObject ? function() {
    // Abort all pending requests
    for ( var key in xhrCallbacks ) {
      xhrCallbacks[ key ]( 0, 1 );
    }
  } : false,
  xhrId = 0,
  xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
  try {
    return new window.XMLHttpRequest();
  } catch( e ) {}
}

function createActiveXHR() {
  try {
    return new window.ActiveXObject( "Microsoft.XMLHTTP" );
  } catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
  /* Microsoft failed to properly
   * implement the XMLHttpRequest in IE7 (can't request local files),
   * so we use the ActiveXObject when it is available
   * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
   * we need a fallback.
   */
  function() {
    return !this.isLocal && createStandardXHR() || createActiveXHR();
  } :
  // For all other browsers, use the standard XMLHttpRequest object
  createStandardXHR;

// Determine support properties
(function( xhr ) {
  jQuery.extend( jQuery.support, {
    ajax: !!xhr,
    cors: !!xhr && ( "withCredentials" in xhr )
  });
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

  jQuery.ajaxTransport(function( s ) {
    // Cross domain only allowed if supported through XMLHttpRequest
    if ( !s.crossDomain || jQuery.support.cors ) {

      var callback;

      return {
        send: function( headers, complete ) {

          // Get a new xhr
          var xhr = s.xhr(),
            handle,
            i;

          // Open the socket
          // Passing null username, generates a login popup on Opera (#2865)
          if ( s.username ) {
            xhr.open( s.type, s.url, s.async, s.username, s.password );
          } else {
            xhr.open( s.type, s.url, s.async );
          }

          // Apply custom fields if provided
          if ( s.xhrFields ) {
            for ( i in s.xhrFields ) {
              xhr[ i ] = s.xhrFields[ i ];
            }
          }

          // Override mime type if needed
          if ( s.mimeType && xhr.overrideMimeType ) {
            xhr.overrideMimeType( s.mimeType );
          }

          // X-Requested-With header
          // For cross-domain requests, seeing as conditions for a preflight are
          // akin to a jigsaw puzzle, we simply never set it to be sure.
          // (it can always be set on a per-request basis or even using ajaxSetup)
          // For same-domain requests, won't change header if already provided.
          if ( !s.crossDomain && !headers["X-Requested-With"] ) {
            headers[ "X-Requested-With" ] = "XMLHttpRequest";
          }

          // Need an extra try/catch for cross domain requests in Firefox 3
          try {
            for ( i in headers ) {
              xhr.setRequestHeader( i, headers[ i ] );
            }
          } catch( _ ) {}

          // Do send the request
          // This may raise an exception which is actually
          // handled in jQuery.ajax (so no try/catch here)
          xhr.send( ( s.hasContent && s.data ) || null );

          // Listener
          callback = function( _, isAbort ) {

            var status,
              statusText,
              responseHeaders,
              responses,
              xml;

            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occured
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {

              // Was never called and is aborted or complete
              if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

                // Only called once
                callback = undefined;

                // Do not keep as active anymore
                if ( handle ) {
                  xhr.onreadystatechange = jQuery.noop;
                  if ( xhrOnUnloadAbort ) {
                    delete xhrCallbacks[ handle ];
                  }
                }

                // If it's an abort
                if ( isAbort ) {
                  // Abort it manually if needed
                  if ( xhr.readyState !== 4 ) {
                    xhr.abort();
                  }
                } else {
                  status = xhr.status;
                  responseHeaders = xhr.getAllResponseHeaders();
                  responses = {};
                  xml = xhr.responseXML;

                  // Construct response list
                  if ( xml && xml.documentElement /* #4958 */ ) {
                    responses.xml = xml;
                  }
                  responses.text = xhr.responseText;

                  // Firefox throws an exception when accessing
                  // statusText for faulty cross-domain requests
                  try {
                    statusText = xhr.statusText;
                  } catch( e ) {
                    // We normalize with Webkit giving an empty statusText
                    statusText = "";
                  }

                  // Filter status for non standard behaviors

                  // If the request is local and we have data: assume a success
                  // (success with no data won't get notified, that's the best we
                  // can do given current implementations)
                  if ( !status && s.isLocal && !s.crossDomain ) {
                    status = responses.text ? 200 : 404;
                  // IE - #1450: sometimes returns 1223 when it should be 204
                  } else if ( status === 1223 ) {
                    status = 204;
                  }
                }
              }
            } catch( firefoxAccessException ) {
              if ( !isAbort ) {
                complete( -1, firefoxAccessException );
              }
            }

            // Call complete if needed
            if ( responses ) {
              complete( status, statusText, responses, responseHeaders );
            }
          };

          // if we're in sync mode or it's in cache
          // and has been retrieved directly (IE6 & IE7)
          // we need to manually fire the callback
          if ( !s.async || xhr.readyState === 4 ) {
            callback();
          } else {
            handle = ++xhrId;
            if ( xhrOnUnloadAbort ) {
              // Create the active xhrs callbacks list if needed
              // and attach the unload handler
              if ( !xhrCallbacks ) {
                xhrCallbacks = {};
                jQuery( window ).unload( xhrOnUnloadAbort );
              }
              // Add to list of active xhrs callbacks
              xhrCallbacks[ handle ] = callback;
            }
            xhr.onreadystatechange = callback;
          }
        },

        abort: function() {
          if ( callback ) {
            callback(0,1);
          }
        }
      };
    }
  });
}




var elemdisplay = {},
  iframe, iframeDoc,
  rfxtypes = /^(?:toggle|show|hide)$/,
  rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
  timerId,
  fxAttrs = [
    // height animations
    [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
    // width animations
    [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
    // opacity animations
    [ "opacity" ]
  ],
  fxNow,
  requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame;

jQuery.fn.extend({
  show: function( speed, easing, callback ) {
    var elem, display;

    if ( speed || speed === 0 ) {
      return this.animate( genFx("show", 3), speed, easing, callback);

    } else {
      for ( var i = 0, j = this.length; i < j; i++ ) {
        elem = this[i];

        if ( elem.style ) {
          display = elem.style.display;

          // Reset the inline display of this element to learn if it is
          // being hidden by cascaded rules or not
          if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
            display = elem.style.display = "";
          }

          // Set elements which have been overridden with display: none
          // in a stylesheet to whatever the default browser style is
          // for such an element
          if ( display === "" && jQuery.css( elem, "display" ) === "none" ) {
            jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
          }
        }
      }

      // Set the display of most of the elements in a second loop
      // to avoid the constant reflow
      for ( i = 0; i < j; i++ ) {
        elem = this[i];

        if ( elem.style ) {
          display = elem.style.display;

          if ( display === "" || display === "none" ) {
            elem.style.display = jQuery._data(elem, "olddisplay") || "";
          }
        }
      }

      return this;
    }
  },

  hide: function( speed, easing, callback ) {
    if ( speed || speed === 0 ) {
      return this.animate( genFx("hide", 3), speed, easing, callback);

    } else {
      for ( var i = 0, j = this.length; i < j; i++ ) {
        if ( this[i].style ) {
          var display = jQuery.css( this[i], "display" );

          if ( display !== "none" && !jQuery._data( this[i], "olddisplay" ) ) {
            jQuery._data( this[i], "olddisplay", display );
          }
        }
      }

      // Set the display of the elements in a second loop
      // to avoid the constant reflow
      for ( i = 0; i < j; i++ ) {
        if ( this[i].style ) {
          this[i].style.display = "none";
        }
      }

      return this;
    }
  },

  // Save the old toggle function
  _toggle: jQuery.fn.toggle,

  toggle: function( fn, fn2, callback ) {
    var bool = typeof fn === "boolean";

    if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
      this._toggle.apply( this, arguments );

    } else if ( fn == null || bool ) {
      this.each(function() {
        var state = bool ? fn : jQuery(this).is(":hidden");
        jQuery(this)[ state ? "show" : "hide" ]();
      });

    } else {
      this.animate(genFx("toggle", 3), fn, fn2, callback);
    }

    return this;
  },

  fadeTo: function( speed, to, easing, callback ) {
    return this.filter(":hidden").css("opacity", 0).show().end()
          .animate({opacity: to}, speed, easing, callback);
  },

  animate: function( prop, speed, easing, callback ) {
    var optall = jQuery.speed(speed, easing, callback);

    if ( jQuery.isEmptyObject( prop ) ) {
      return this.each( optall.complete, [ false ] );
    }

    // Do not change referenced properties as per-property easing will be lost
    prop = jQuery.extend( {}, prop );

    return this[ optall.queue === false ? "each" : "queue" ](function() {
      // XXX 'this' does not always have a nodeName when running the
      // test suite

      if ( optall.queue === false ) {
        jQuery._mark( this );
      }

      var opt = jQuery.extend( {}, optall ),
        isElement = this.nodeType === 1,
        hidden = isElement && jQuery(this).is(":hidden"),
        name, val, p,
        display, e,
        parts, start, end, unit;

      // will store per property easing and be used to determine when an animation is complete
      opt.animatedProperties = {};

      for ( p in prop ) {

        // property name normalization
        name = jQuery.camelCase( p );
        if ( p !== name ) {
          prop[ name ] = prop[ p ];
          delete prop[ p ];
        }

        val = prop[ name ];

        // easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
        if ( jQuery.isArray( val ) ) {
          opt.animatedProperties[ name ] = val[ 1 ];
          val = prop[ name ] = val[ 0 ];
        } else {
          opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
        }

        if ( val === "hide" && hidden || val === "show" && !hidden ) {
          return opt.complete.call( this );
        }

        if ( isElement && ( name === "height" || name === "width" ) ) {
          // Make sure that nothing sneaks out
          // Record all 3 overflow attributes because IE does not
          // change the overflow attribute when overflowX and
          // overflowY are set to the same value
          opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

          // Set display property to inline-block for height/width
          // animations on inline elements that are having width/height
          // animated
          if ( jQuery.css( this, "display" ) === "inline" &&
              jQuery.css( this, "float" ) === "none" ) {
            if ( !jQuery.support.inlineBlockNeedsLayout ) {
              this.style.display = "inline-block";

            } else {
              display = defaultDisplay( this.nodeName );

              // inline-level elements accept inline-block;
              // block-level elements need to be inline with layout
              if ( display === "inline" ) {
                this.style.display = "inline-block";

              } else {
                this.style.display = "inline";
                this.style.zoom = 1;
              }
            }
          }
        }
      }

      if ( opt.overflow != null ) {
        this.style.overflow = "hidden";
      }

      for ( p in prop ) {
        e = new jQuery.fx( this, opt, p );
        val = prop[ p ];

        if ( rfxtypes.test(val) ) {
          e[ val === "toggle" ? hidden ? "show" : "hide" : val ]();

        } else {
          parts = rfxnum.exec( val );
          start = e.cur();

          if ( parts ) {
            end = parseFloat( parts[2] );
            unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

            // We need to compute starting value
            if ( unit !== "px" ) {
              jQuery.style( this, p, (end || 1) + unit);
              start = ((end || 1) / e.cur()) * start;
              jQuery.style( this, p, start + unit);
            }

            // If a +=/-= token was provided, we're doing a relative animation
            if ( parts[1] ) {
              end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
            }

            e.custom( start, end, unit );

          } else {
            e.custom( start, val, "" );
          }
        }
      }

      // For JS strict compliance
      return true;
    });
  },

  stop: function( clearQueue, gotoEnd ) {
    if ( clearQueue ) {
      this.queue([]);
    }

    this.each(function() {
      var timers = jQuery.timers,
        i = timers.length;
      // clear marker counters if we know they won't be
      if ( !gotoEnd ) {
        jQuery._unmark( true, this );
      }
      while ( i-- ) {
        if ( timers[i].elem === this ) {
          if (gotoEnd) {
            // force the next step to be the last
            timers[i](true);
          }

          timers.splice(i, 1);
        }
      }
    });

    // start the next in the queue if the last step wasn't forced
    if ( !gotoEnd ) {
      this.dequeue();
    }

    return this;
  }

});

// Animations created synchronously will run synchronously
function createFxNow() {
  setTimeout( clearFxNow, 0 );
  return ( fxNow = jQuery.now() );
}

function clearFxNow() {
  fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
  var obj = {};

  jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
    obj[ this ] = type;
  });

  return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
  slideDown: genFx("show", 1),
  slideUp: genFx("hide", 1),
  slideToggle: genFx("toggle", 1),
  fadeIn: { opacity: "show" },
  fadeOut: { opacity: "hide" },
  fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return this.animate( props, speed, easing, callback );
  };
});

jQuery.extend({
  speed: function( speed, easing, fn ) {
    var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
      complete: fn || !fn && easing ||
        jQuery.isFunction( speed ) && speed,
      duration: speed,
      easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
    };

    opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
      opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

    // Queueing
    opt.old = opt.complete;
    opt.complete = function( noUnmark ) {
      if ( jQuery.isFunction( opt.old ) ) {
        opt.old.call( this );
      }

      if ( opt.queue !== false ) {
        jQuery.dequeue( this );
      } else if ( noUnmark !== false ) {
        jQuery._unmark( this );
      }
    };

    return opt;
  },

  easing: {
    linear: function( p, n, firstNum, diff ) {
      return firstNum + diff * p;
    },
    swing: function( p, n, firstNum, diff ) {
      return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
    }
  },

  timers: [],

  fx: function( elem, options, prop ) {
    this.options = options;
    this.elem = elem;
    this.prop = prop;

    options.orig = options.orig || {};
  }

});

jQuery.fx.prototype = {
  // Simple function for setting a style value
  update: function() {
    if ( this.options.step ) {
      this.options.step.call( this.elem, this.now, this );
    }

    (jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
  },

  // Get the current size
  cur: function() {
    if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
      return this.elem[ this.prop ];
    }

    var parsed,
      r = jQuery.css( this.elem, this.prop );
    // Empty strings, null, undefined and "auto" are converted to 0,
    // complex values such as "rotate(1rad)" are returned as is,
    // simple values such as "10px" are parsed to Float.
    return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
  },

  // Start an animation from one number to another
  custom: function( from, to, unit ) {
    var self = this,
      fx = jQuery.fx,
      raf;

    this.startTime = fxNow || createFxNow();
    this.start = from;
    this.end = to;
    this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );
    this.now = this.start;
    this.pos = this.state = 0;

    function t( gotoEnd ) {
      return self.step(gotoEnd);
    }

    t.elem = this.elem;

    if ( t() && jQuery.timers.push(t) && !timerId ) {
      // Use requestAnimationFrame instead of setInterval if available
      if ( requestAnimationFrame ) {
        timerId = true;
        raf = function() {
          // When timerId gets set to null at any point, this stops
          if ( timerId ) {
            requestAnimationFrame( raf );
            fx.tick();
          }
        };
        requestAnimationFrame( raf );
      } else {
        timerId = setInterval( fx.tick, fx.interval );
      }
    }
  },

  // Simple 'show' function
  show: function() {
    // Remember where we started, so that we can go back to it later
    this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
    this.options.show = true;

    // Begin the animation
    // Make sure that we start at a small width/height to avoid any
    // flash of content
    this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

    // Start by showing the element
    jQuery( this.elem ).show();
  },

  // Simple 'hide' function
  hide: function() {
    // Remember where we started, so that we can go back to it later
    this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
    this.options.hide = true;

    // Begin the animation
    this.custom(this.cur(), 0);
  },

  // Each step of an animation
  step: function( gotoEnd ) {
    var t = fxNow || createFxNow(),
      done = true,
      elem = this.elem,
      options = this.options,
      i, n;

    if ( gotoEnd || t >= options.duration + this.startTime ) {
      this.now = this.end;
      this.pos = this.state = 1;
      this.update();

      options.animatedProperties[ this.prop ] = true;

      for ( i in options.animatedProperties ) {
        if ( options.animatedProperties[i] !== true ) {
          done = false;
        }
      }

      if ( done ) {
        // Reset the overflow
        if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

          jQuery.each( [ "", "X", "Y" ], function (index, value) {
            elem.style[ "overflow" + value ] = options.overflow[index];
          });
        }

        // Hide the element if the "hide" operation was done
        if ( options.hide ) {
          jQuery(elem).hide();
        }

        // Reset the properties, if the item has been hidden or shown
        if ( options.hide || options.show ) {
          for ( var p in options.animatedProperties ) {
            jQuery.style( elem, p, options.orig[p] );
          }
        }

        // Execute the complete function
        options.complete.call( elem );
      }

      return false;

    } else {
      // classical easing cannot be used with an Infinity duration
      if ( options.duration == Infinity ) {
        this.now = t;
      } else {
        n = t - this.startTime;
        this.state = n / options.duration;

        // Perform the easing function, defaults to swing
        this.pos = jQuery.easing[ options.animatedProperties[ this.prop ] ]( this.state, n, 0, 1, options.duration );
        this.now = this.start + ((this.end - this.start) * this.pos);
      }
      // Perform the next step of the animation
      this.update();
    }

    return true;
  }
};

jQuery.extend( jQuery.fx, {
  tick: function() {
    for ( var timers = jQuery.timers, i = 0 ; i < timers.length ; ++i ) {
      if ( !timers[i]() ) {
        timers.splice(i--, 1);
      }
    }

    if ( !timers.length ) {
      jQuery.fx.stop();
    }
  },

  interval: 13,

  stop: function() {
    clearInterval( timerId );
    timerId = null;
  },

  speeds: {
    slow: 600,
    fast: 200,
    // Default speed
    _default: 400
  },

  step: {
    opacity: function( fx ) {
      jQuery.style( fx.elem, "opacity", fx.now );
    },

    _default: function( fx ) {
      if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
        fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
      } else {
        fx.elem[ fx.prop ] = fx.now;
      }
    }
  }
});

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.animated = function( elem ) {
    return jQuery.grep(jQuery.timers, function( fn ) {
      return elem === fn.elem;
    }).length;
  };
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

  if ( !elemdisplay[ nodeName ] ) {

    var body = document.body,
      elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
      display = elem.css( "display" );

    elem.remove();

    // If the simple way fails,
    // get element's real default display by attaching it to a temp iframe
    if ( display === "none" || display === "" ) {
      // No iframe to use yet, so create it
      if ( !iframe ) {
        iframe = document.createElement( "iframe" );
        iframe.frameBorder = iframe.width = iframe.height = 0;
      }

      body.appendChild( iframe );

      // Create a cacheable copy of the iframe document on first call.
      // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
      // document to it; WebKit & Firefox won't allow reusing the iframe document.
      if ( !iframeDoc || !iframe.createElement ) {
        iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
        iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
        iframeDoc.close();
      }

      elem = iframeDoc.createElement( nodeName );

      iframeDoc.body.appendChild( elem );

      display = jQuery.css( elem, "display" );

      body.removeChild( iframe );
    }

    // Store the correct default display
    elemdisplay[ nodeName ] = display;
  }

  return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
  rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
  jQuery.fn.offset = function( options ) {
    var elem = this[0], box;

    if ( options ) {
      return this.each(function( i ) {
        jQuery.offset.setOffset( this, options, i );
      });
    }

    if ( !elem || !elem.ownerDocument ) {
      return null;
    }

    if ( elem === elem.ownerDocument.body ) {
      return jQuery.offset.bodyOffset( elem );
    }

    try {
      box = elem.getBoundingClientRect();
    } catch(e) {}

    var doc = elem.ownerDocument,
      docElem = doc.documentElement;

    // Make sure we're not dealing with a disconnected DOM node
    if ( !box || !jQuery.contains( docElem, elem ) ) {
      return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
    }

    var body = doc.body,
      win = getWindow(doc),
      clientTop  = docElem.clientTop  || body.clientTop  || 0,
      clientLeft = docElem.clientLeft || body.clientLeft || 0,
      scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
      scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
      top  = box.top  + scrollTop  - clientTop,
      left = box.left + scrollLeft - clientLeft;

    return { top: top, left: left };
  };

} else {
  jQuery.fn.offset = function( options ) {
    var elem = this[0];

    if ( options ) {
      return this.each(function( i ) {
        jQuery.offset.setOffset( this, options, i );
      });
    }

    if ( !elem || !elem.ownerDocument ) {
      return null;
    }

    if ( elem === elem.ownerDocument.body ) {
      return jQuery.offset.bodyOffset( elem );
    }

    jQuery.offset.initialize();

    var computedStyle,
      offsetParent = elem.offsetParent,
      prevOffsetParent = elem,
      doc = elem.ownerDocument,
      docElem = doc.documentElement,
      body = doc.body,
      defaultView = doc.defaultView,
      prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
      top = elem.offsetTop,
      left = elem.offsetLeft;

    while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
      if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
        break;
      }

      computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
      top  -= elem.scrollTop;
      left -= elem.scrollLeft;

      if ( elem === offsetParent ) {
        top  += elem.offsetTop;
        left += elem.offsetLeft;

        if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
          top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
          left += parseFloat( computedStyle.borderLeftWidth ) || 0;
        }

        prevOffsetParent = offsetParent;
        offsetParent = elem.offsetParent;
      }

      if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
        top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
        left += parseFloat( computedStyle.borderLeftWidth ) || 0;
      }

      prevComputedStyle = computedStyle;
    }

    if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
      top  += body.offsetTop;
      left += body.offsetLeft;
    }

    if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
      top  += Math.max( docElem.scrollTop, body.scrollTop );
      left += Math.max( docElem.scrollLeft, body.scrollLeft );
    }

    return { top: top, left: left };
  };
}

jQuery.offset = {
  initialize: function() {
    var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.css(body, "marginTop") ) || 0,
      html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

    jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

    container.innerHTML = html;
    body.insertBefore( container, body.firstChild );
    innerDiv = container.firstChild;
    checkDiv = innerDiv.firstChild;
    td = innerDiv.nextSibling.firstChild.firstChild;

    this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
    this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

    checkDiv.style.position = "fixed";
    checkDiv.style.top = "20px";

    // safari subtracts parent border width here which is 5px
    this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
    checkDiv.style.position = checkDiv.style.top = "";

    innerDiv.style.overflow = "hidden";
    innerDiv.style.position = "relative";

    this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

    this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

    body.removeChild( container );
    jQuery.offset.initialize = jQuery.noop;
  },

  bodyOffset: function( body ) {
    var top = body.offsetTop,
      left = body.offsetLeft;

    jQuery.offset.initialize();

    if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
      top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
      left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
    }

    return { top: top, left: left };
  },

  setOffset: function( elem, options, i ) {
    var position = jQuery.css( elem, "position" );

    // set position first, in-case top/left are set even on static elem
    if ( position === "static" ) {
      elem.style.position = "relative";
    }

    var curElem = jQuery( elem ),
      curOffset = curElem.offset(),
      curCSSTop = jQuery.css( elem, "top" ),
      curCSSLeft = jQuery.css( elem, "left" ),
      calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
      props = {}, curPosition = {}, curTop, curLeft;

    // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    if ( calculatePosition ) {
      curPosition = curElem.position();
      curTop = curPosition.top;
      curLeft = curPosition.left;
    } else {
      curTop = parseFloat( curCSSTop ) || 0;
      curLeft = parseFloat( curCSSLeft ) || 0;
    }

    if ( jQuery.isFunction( options ) ) {
      options = options.call( elem, i, curOffset );
    }

    if (options.top != null) {
      props.top = (options.top - curOffset.top) + curTop;
    }
    if (options.left != null) {
      props.left = (options.left - curOffset.left) + curLeft;
    }

    if ( "using" in options ) {
      options.using.call( elem, props );
    } else {
      curElem.css( props );
    }
  }
};


jQuery.fn.extend({
  position: function() {
    if ( !this[0] ) {
      return null;
    }

    var elem = this[0],

    // Get *real* offsetParent
    offsetParent = this.offsetParent(),

    // Get correct offsets
    offset       = this.offset(),
    parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

    // Subtract element margins
    // note: when an element has margin: auto the offsetLeft and marginLeft
    // are the same in Safari causing offset.left to incorrectly be 0
    offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
    offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

    // Add offsetParent borders
    parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
    parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

    // Subtract the two offsets
    return {
      top:  offset.top  - parentOffset.top,
      left: offset.left - parentOffset.left
    };
  },

  offsetParent: function() {
    return this.map(function() {
      var offsetParent = this.offsetParent || document.body;
      while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent;
    });
  }
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
  var method = "scroll" + name;

  jQuery.fn[ method ] = function( val ) {
    var elem, win;

    if ( val === undefined ) {
      elem = this[ 0 ];

      if ( !elem ) {
        return null;
      }

      win = getWindow( elem );

      // Return the scroll offset
      return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
        jQuery.support.boxModel && win.document.documentElement[ method ] ||
          win.document.body[ method ] :
        elem[ method ];
    }

    // Set the scroll offset
    return this.each(function() {
      win = getWindow( this );

      if ( win ) {
        win.scrollTo(
          !i ? val : jQuery( win ).scrollLeft(),
           i ? val : jQuery( win ).scrollTop()
        );

      } else {
        this[ method ] = val;
      }
    });
  };
});

function getWindow( elem ) {
  return jQuery.isWindow( elem ) ?
    elem :
    elem.nodeType === 9 ?
      elem.defaultView || elem.parentWindow :
      false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

  var type = name.toLowerCase();

  // innerHeight and innerWidth
  jQuery.fn[ "inner" + name ] = function() {
    var elem = this[0];
    return elem && elem.style ?
      parseFloat( jQuery.css( elem, type, "padding" ) ) :
      null;
  };

  // outerHeight and outerWidth
  jQuery.fn[ "outer" + name ] = function( margin ) {
    var elem = this[0];
    return elem && elem.style ?
      parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
      null;
  };

  jQuery.fn[ type ] = function( size ) {
    // Get window width or height
    var elem = this[0];
    if ( !elem ) {
      return size == null ? null : this;
    }

    if ( jQuery.isFunction( size ) ) {
      return this.each(function( i ) {
        var self = jQuery( this );
        self[ type ]( size.call( this, i, self[ type ]() ) );
      });
    }

    if ( jQuery.isWindow( elem ) ) {
      // Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
      // 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
      var docElemProp = elem.document.documentElement[ "client" + name ];
      return elem.document.compatMode === "CSS1Compat" && docElemProp ||
        elem.document.body[ "client" + name ] || docElemProp;

    // Get document width or height
    } else if ( elem.nodeType === 9 ) {
      // Either scroll[Width/Height] or offset[Width/Height], whichever is greater
      return Math.max(
        elem.documentElement["client" + name],
        elem.body["scroll" + name], elem.documentElement["scroll" + name],
        elem.body["offset" + name], elem.documentElement["offset" + name]
      );

    // Get or set width or height on the element
    } else if ( size === undefined ) {
      var orig = jQuery.css( elem, type ),
        ret = parseFloat( orig );

      return jQuery.isNaN( ret ) ? orig : ret;

    // Set the width or height on the element (default to pixels if value is unitless)
    } else {
      return this.css( type, typeof size === "string" ? size : size + "px" );
    }
  };

});


// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;
})(window);

/**
 * @author Alexander Farkas
 * v. 1.21
 */


(function($) {
	if(!document.defaultView || !document.defaultView.getComputedStyle){ // IE6-IE8
		var oldCurCSS = jQuery.curCSS;
		jQuery.curCSS = function(elem, name, force){
			if(name === 'background-position'){
				name = 'backgroundPosition';
			}
			if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
				return oldCurCSS.apply(this, arguments);
			}
			var style = elem.style;
			if ( !force && style && style[ name ] ){
				return style[ name ];
			}
			return oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force);
		};
	}
	
	var oldAnim = $.fn.animate;
	$.fn.animate = function(prop){
		if('background-position' in prop){
			prop.backgroundPosition = prop['background-position'];
			delete prop['background-position'];
		}
		if('backgroundPosition' in prop){
			prop.backgroundPosition = '('+ prop.backgroundPosition;
		}
		return oldAnim.apply(this, arguments);
	};
	
	function toArray(strg){
		strg = strg.replace(/left|top/g,'0px');
		strg = strg.replace(/right|bottom/g,'100%');
		strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
		var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
		return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
	}
	
	$.fx.step. backgroundPosition = function(fx) {
		if (!fx.bgPosReady) {
			var start = $.curCSS(fx.elem,'backgroundPosition');
			
			if(!start){//FF2 no inline-style fallback
				start = '0px 0px';
			}
			
			start = toArray(start);
			
			fx.start = [start[0],start[2]];
			
			var end = toArray(fx.options.curAnim.backgroundPosition);
			fx.end = [end[0],end[2]];
			
			fx.unit = [end[1],end[3]];
			fx.bgPosReady = true;
		}
		//return;
		var nowPosX = [];
		nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
		nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
		fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];

	};
})(jQuery);
jQuery.fn.extend({
  // allow reset to be called directly on jQuery selectors
  reset: function() { this.each(function() { this.reset(); }); },

  disable: function(value) {
    this.attr("disabled", true);
    if (value != undefined) {
      if (this.is("select")) {
        this.append("<option class='disable-message' selected>"+value+"</option>");
      } else {
        this.val(value);
      }
    }
    return this;
  },

  enable: function() {
    if (this.is("select")) {
      this.remove("option.disable-message");
    } else {
      this.val('');
    }
    this.attr("disabled", false);
    return this;
  },

  exists: function() {
    return this.length > 0;
  }

});

// set up jQuery's ajax to filter /*-secure- header
jQuery.ajaxSetup({
  'dataFilter': function(data, type) { return (typeof data == "string") ? data.replace(/^\/\*-secure-([\s\S]*)\*\/\s*$/, "$1") : data; }
});

jQuery.same = function(a, b) {
  a = $.unique($.makeArray(a)); b = $.unique($.makeArray(b));
  var length = a.length;
  return (a.length == b.length) && ($.unique($.merge(a, b)).length == length);
};

jQuery.getsettext = function(finder) {
  return jQuery.getset({
    node: function() {
      return finder.apply(this, arguments);
    },

    get: function(getset) {
      return getset.node().text();
    },

    set: function(value, getset) {
      getset.node().text(value);
    }
  });
};

jQuery.getsetclass = function(className, finder) {
  return jQuery.getset({
    get: function(getset) {
      return getset.node().hasClass(className);
    },

    set: function(value, getset) {
      if (value != getset.get())
        getset.node().toggleClass(className);
    },

    node: function() {
      return finder ? finder.apply(this, arguments) : $(this);
    }
  });
};

jQuery.getsetdata = function(key) {
  return jQuery.getset({
    get: function() {
      return $(this).kvo(key);
    },

    set: function(value) {
      $(this).kvo(key, value);
    }
  });
};

jQuery.getset = function(getset) {
  return function() {
    var self = this, wrapper = {};

    var wrap = function(wrapper, name) {
      wrapper[name] = function() {
        var args = $.makeArray(arguments);
        args.push(wrapper);
        return getset[name].apply(self, args);
      };
    };

    for (var k in getset) {
      if (getset.hasOwnProperty(k)) {
        wrap(wrapper, k);
      }
    }

    var value = arguments[0];
    if (value === undefined) {
      if (jQuery.isFunction(wrapper.get)) {
        return wrapper.get();
      } else {
        throw new Error("No getter defined for " + this);
      }
    } else {
      if (jQuery.isFunction(wrapper.set)) {
        wrapper.set.apply(wrapper, arguments);
        return $(this);
      } else {
        throw new Error("No setter defined for " + this);
      }
    }
  };
};

// cookie access from http://www.stilbuero.de/2006/09/17/cookie-plugin-for-jquery/
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

// fix browser version regex (IE 7 sometimes has both MSIE 7.0 and later MSIE 6.0 in the user agent)
jQuery.browser.version = (navigator.userAgent.toLowerCase().match( /.+?(?:rv|it|ra|ie)[\/: ]([\d.]+)(?!.+opera)/ ) || [])[1];

// shortcut for performing a PUT
jQuery.put = function(url, data, callback, type) {
  if ( jQuery.isFunction( data ) ) {
    callback = data;
    data = {};
  }

  return jQuery.ajax({
    type: "PUT",
    url: url,
    data: data,
    success: callback,
    dataType: type
  });
};

// extracted from http://digitalbush.com/projects/masked-input-plugin/
// allows for $("#textarea-yay").caret(beginPos, endPos)
(function($) {
  //Helper Function for Caret positioning
  $.fn.caret=function(begin,end){
    if(this.length==0) return;
    if (typeof begin == 'number') {
      end = (typeof end == 'number')?end:begin;
      return this.each(function(){
        if(this.setSelectionRange){
          this.focus();
          this.setSelectionRange(begin,end);
        }else if (this.createTextRange){
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', begin);
          range.select();
        }
      });
    } else {
      if (this[0].setSelectionRange){
        begin = this[0].selectionStart;
        end = this[0].selectionEnd;
      }else if (document.selection && document.selection.createRange){
        var range = document.selection.createRange();
        begin = 0 - range.duplicate().moveStart('character', -100000);
        end = begin + range.text.length;
      }
      return {begin:begin,end:end};
    }
  };
})(jQuery);

(function($) {
  function makeExpando() {
    var o = {}, expando, id;
    $(o).data('expando');
    for (var k in o) {
      if (/^jQuery/.test(k)) {
        expando = k;
        id = o[expando];
        break;
      }
    }
    return {expando: expando, id: id};
  }

  $.fn.kvobservable = function(observable) {
    return this.data('kvo', observable);
  };

  $.fn.kvobserve = function(property, fn) {
    return this.bind('kvo-'+property+'-set', fn).kvobservable(true);
  };

  $.fn.kvone = function(property, fn) {
    return this.one('kvo-'+property+'-set', fn).kvobservable(true);
  };

  $.fn.kvunobserve = function(property, fn) {
    return this.unbind('kvo-'+property+'-set', fn).kvobservable(true);
  };

  $.fn.kvo = function(property, value) {
    if (value === undefined) {
      if (typeof property == 'string')
        return this.data('kvo-'+property+'-value');
      else
        for (var p in property) this.kvo(p, property[p]);
    } else {
      var oldvalue = this.kvo(property);
      if (value === oldvalue)
        return this;
      else
        return this
          .data('kvo-'+property+'-value', value)
          .each(function() {
            // prevent bubbling
            $(this).triggerHandler('kvo-'+property+'-set', [value, oldvalue]);
          });
    }
  };

  $.fn.kvobind = function(observable, key, options) {
    if (typeof observable == 'string') {
      options = key;
      var kvo = $.kvo.find(observable);
      observable = kvo.observable;
      key  = kvo.key;
    }

    options = options || {};

    // some option aliases
    options.transform = options.when || options.transform;
    options.property  = options.hasClass || options.attr || options.property;

    // preset transforms
    if (!options.transform || options.transform == 'present') {
      options.transform = function(o){ return o };
    }

    observable = $(observable);
    observable.kvobservable(true);
    var self = this;

    observable.bind('kvo-'+key+'-set', function(event, newvalue, oldvalue) {
      $.kvo.change(self, options.transform(newvalue), oldvalue, key, options);
    });

    $.kvo.change(this, options.transform(observable.kvo(key)), null, key, options);
    return this;
  };

  $.kvo = {
    setters: {
      html: function(e,v){ e.html(v ? v.toString() : '') },
      text: function(e,v){ e.html('').append(document.createTextNode(v)) },
      value: function(e,v){ e.val(v) },
      checked: function(e,v){ e.val(v ? '1' : '0').attr('checked', v) },
      visible: function(e,v){ v ? e.show() : e.hide() },
      hidden: function(e,v){ v ? e.hide() : e.show() }
    },

    setterFor: function(element, options) {
      var setters = $.kvo.setters;
      var property = options.property;

      if (property) {
        return setters[property] || (
          options.attr ? function(e,v){ e.attr(options.attr, v) } :
                         function(e,v){ v ? e.addClass(property) : e.removeClass(property) }
        );
      } else {
        return (
          element.is(':text')     ? setters.value   :
          element.is(':checkbox') ? setters.checked :
          element.is(':radio')    ? setters.checked :
          element.is(':input')    ? setters.value   :
                                    setters.text
        );
      }
    },

    set: function(element, value, options) {
      $.kvo.setterFor(element, options).call($.kvo, element, value);
    },

    change: function(elements, newvalue, oldvalue, key, options) {
      $(elements).each(function() {
        $.kvo.set($(this), newvalue, options);
      });
    },

    defineGetter: function(object, key) {
      object.getter(key, function(){ return $(this).kvo(key) });
    },

    defineSetter: function(object, key) {
      object.setter(key, function(value){ $(this).kvo(key, value) });
    },

    find: function(path, scope) {
      if (!scope) scope = window;
      var observable, valuepath = [];

      $.each(path.split('.'), function() {
        if ($(scope).kvobservable()) {
          valuepath = [];
          observable = scope;
        }
        valuepath.push(this);
        scope = scope[this];
      });

      return {observable: observable, valuepath: valuepath};
    },

    getValue: function(valuepath, value) {
      $.each(valuepath, function(){ value = value[this] });
      return value;
    }
  };
})(jQuery);

(function($) {
  $.fn.fn = function() {
    var self = this;
    var extension = arguments[0], name = arguments[0];
    if (typeof name == "string") {
      return apply(self, name, $.makeArray(arguments).slice(1, arguments.length));
    } else {
      $.each(extension, function(key, value) {
        define(self, key, value);
      });
      return self;
    }
  }
  function define(self, name, fn) {
    self.data(namespacedName(name), fn);
  };
  function apply(self, name, args) {
    var result;
    self.each(function(i, item) {
      var fn = $(item).data(namespacedName(name));
      if (fn)
        result = fn.apply(item, args);
      else
        throw(name + " is not defined");
    });
    return result;
  };
  function namespacedName(name) {
    return 'fn.' + name;
  }
})(jQuery);
/**
 * jQuery.ScrollTo
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 3/9/2009
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * Works with jQuery +1.2.6. Tested on FF 2/3, IE 6/7, Opera 9.5/6, Safari 3, Chrome 1 on WinXP.
 *
 * @author Ariel Flesler
 * @version 1.4.1
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 * @param {Number} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends. 
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @dec Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @ Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');																   
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */
;(function( $ ){
	
	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window).scrollable();
	};

	// Hack, hack, hack... stay away!
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn.scrollable = function(){
		return this.map(function(){
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if( !isWin )
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
			
			return $.browser.safari || doc.compatMode == 'BackCompat' ?
				doc.body : 
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };
			
		if( target == 'max' )
			target = 9e9;
			
		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;
		
		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this.scrollable().each(function(){
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=)?\d+(\.\d+)?(px)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target 
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					Dim = axis == 'x' ? 'Width' : 'Height';

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;
					
					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[Dim.toLowerCase()]() * settings.over[pos];
				}else
					attr[key] = targ[pos];

				// Number or 'number'
				if( /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max(Dim) );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};

			// Max scrolling position, works on quirks mode
			// It only fails (not too badly) on IE, quirks mode.
			function max( Dim ){
				var scroll = 'scroll'+Dim;
				
				if( !win )
					return elem[scroll];
				
				var size = 'client' + Dim,
					html = elem.ownerDocument.documentElement,
					body = elem.ownerDocument.body;

				return Math.max( html[scroll], body[scroll] ) 
					 - Math.min( html[size]  , body[size]   );
					
			};

		}).end();
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );

/*!
 * jQuery UI 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function(c,j){function k(a,b){var d=a.nodeName.toLowerCase();if("area"===d){b=a.parentNode;d=b.name;if(!a.href||!d||b.nodeName.toLowerCase()!=="map")return false;a=c("img[usemap=#"+d+"]")[0];return!!a&&l(a)}return(/input|select|textarea|button|object/.test(d)?!a.disabled:"a"==d?a.href||b:b)&&l(a)}function l(a){return!c(a).parents().andSelf().filter(function(){return c.curCSS(this,"visibility")==="hidden"||c.expr.filters.hidden(this)}).length}c.ui=c.ui||{};if(!c.ui.version){c.extend(c.ui,{version:"1.8.14",
keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}});c.fn.extend({_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=this;setTimeout(function(){c(d).focus();
b&&b.call(d)},a)}):this._focus.apply(this,arguments)},scrollParent:function(){var a;a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,
"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?c(document):a},zIndex:function(a){if(a!==j)return this.css("zIndex",a);if(this.length){a=c(this[0]);for(var b;a.length&&a[0]!==document;){b=a.css("position");if(b==="absolute"||b==="relative"||b==="fixed"){b=parseInt(a.css("zIndex"),10);if(!isNaN(b)&&b!==0)return b}a=a.parent()}}return 0},disableSelection:function(){return this.bind((c.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",
function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}});c.each(["Width","Height"],function(a,b){function d(f,g,m,n){c.each(e,function(){g-=parseFloat(c.curCSS(f,"padding"+this,true))||0;if(m)g-=parseFloat(c.curCSS(f,"border"+this+"Width",true))||0;if(n)g-=parseFloat(c.curCSS(f,"margin"+this,true))||0});return g}var e=b==="Width"?["Left","Right"]:["Top","Bottom"],h=b.toLowerCase(),i={innerWidth:c.fn.innerWidth,innerHeight:c.fn.innerHeight,outerWidth:c.fn.outerWidth,
outerHeight:c.fn.outerHeight};c.fn["inner"+b]=function(f){if(f===j)return i["inner"+b].call(this);return this.each(function(){c(this).css(h,d(this,f)+"px")})};c.fn["outer"+b]=function(f,g){if(typeof f!=="number")return i["outer"+b].call(this,f);return this.each(function(){c(this).css(h,d(this,f,true,g)+"px")})}});c.extend(c.expr[":"],{data:function(a,b,d){return!!c.data(a,d[3])},focusable:function(a){return k(a,!isNaN(c.attr(a,"tabindex")))},tabbable:function(a){var b=c.attr(a,"tabindex"),d=isNaN(b);
return(d||b>=0)&&k(a,!d)}});c(function(){var a=document.body,b=a.appendChild(b=document.createElement("div"));c.extend(b.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0});c.support.minHeight=b.offsetHeight===100;c.support.selectstart="onselectstart"in b;a.removeChild(b).style.display="none"});c.extend(c.ui,{plugin:{add:function(a,b,d){a=c.ui[a].prototype;for(var e in d){a.plugins[e]=a.plugins[e]||[];a.plugins[e].push([b,d[e]])}},call:function(a,b,d){if((b=a.plugins[b])&&a.element[0].parentNode)for(var e=
0;e<b.length;e++)a.options[b[e][0]]&&b[e][1].apply(a.element,d)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(a,b){if(c(a).css("overflow")==="hidden")return false;b=b&&b==="left"?"scrollLeft":"scrollTop";var d=false;if(a[b]>0)return true;a[b]=1;d=a[b]>0;a[b]=0;return d},isOverAxis:function(a,b,d){return a>b&&a<b+d},isOver:function(a,b,d,e,h,i){return c.ui.isOverAxis(a,d,h)&&c.ui.isOverAxis(b,e,i)}})}})(jQuery);
;/*!
 * jQuery UI Widget 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b,j){if(b.cleanData){var k=b.cleanData;b.cleanData=function(a){for(var c=0,d;(d=a[c])!=null;c++)b(d).triggerHandler("remove");k(a)}}else{var l=b.fn.remove;b.fn.remove=function(a,c){return this.each(function(){if(!c)if(!a||b.filter(a,[this]).length)b("*",this).add([this]).each(function(){b(this).triggerHandler("remove")});return l.call(b(this),a,c)})}}b.widget=function(a,c,d){var e=a.split(".")[0],f;a=a.split(".")[1];f=e+"-"+a;if(!d){d=c;c=b.Widget}b.expr[":"][f]=function(h){return!!b.data(h,
a)};b[e]=b[e]||{};b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)};c=new c;c.options=b.extend(true,{},c.options);b[e][a].prototype=b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);b.widget.bridge(a,b[e][a])};b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):d;if(e&&d.charAt(0)==="_")return h;
e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;if(i!==g&&i!==j){h=i;return false}}):this.each(function(){var g=b.data(this,a);g?g.option(d||{})._init():b.data(this,a,new c(d,this))});return h}};b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){b.data(c,this.widgetName,this);this.element=b(c);this.options=b.extend(true,{},this.options,
this._getCreateOptions(),a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();this._trigger("create");this._init()},_getCreateOptions:function(){return b.metadata&&b.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled ui-state-disabled")},
widget:function(){return this.element},option:function(a,c){var d=a;if(arguments.length===0)return b.extend({},this.options);if(typeof a==="string"){if(c===j)return this.options[a];d={};d[a]=c}this._setOptions(d);return this},_setOptions:function(a){var c=this;b.each(a,function(d,e){c._setOption(d,e)});return this},_setOption:function(a,c){this.options[a]=c;if(a==="disabled")this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",c);return this},
enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(a,c,d){var e=this.options[a];c=b.Event(c);c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(c.originalEvent){a=b.event.props.length;for(var f;a;){f=b.event.props[--a];c[f]=c.originalEvent[f]}}this.element.trigger(c,d);return!(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())}}})(jQuery);
;/*!
 * jQuery UI Mouse 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *  jquery.ui.widget.js
 */
(function(b){var d=false;b(document).mousedown(function(){d=false});b.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;this.element.bind("mousedown."+this.widgetName,function(c){return a._mouseDown(c)}).bind("click."+this.widgetName,function(c){if(true===b.data(c.target,a.widgetName+".preventClickEvent")){b.removeData(c.target,a.widgetName+".preventClickEvent");c.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+
this.widgetName)},_mouseDown:function(a){if(!d){this._mouseStarted&&this._mouseUp(a);this._mouseDownEvent=a;var c=this,f=a.which==1,g=typeof this.options.cancel=="string"?b(a.target).closest(this.options.cancel).length:false;if(!f||g||!this._mouseCapture(a))return true;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=true},this.options.delay);if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){this._mouseStarted=this._mouseStart(a)!==
false;if(!this._mouseStarted){a.preventDefault();return true}}true===b.data(a.target,this.widgetName+".preventClickEvent")&&b.removeData(a.target,this.widgetName+".preventClickEvent");this._mouseMoveDelegate=function(e){return c._mouseMove(e)};this._mouseUpDelegate=function(e){return c._mouseUp(e)};b(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);a.preventDefault();return d=true}},_mouseMove:function(a){if(b.browser.msie&&
!(document.documentMode>=9)&&!a.button)return this._mouseUp(a);if(this._mouseStarted){this._mouseDrag(a);return a.preventDefault()}if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==false)?this._mouseDrag(a):this._mouseUp(a);return!this._mouseStarted},_mouseUp:function(a){b(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=
false;a.target==this._mouseDownEvent.target&&b.data(a.target,this.widgetName+".preventClickEvent",true);this._mouseStop(a)}return false},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true}})})(jQuery);
;/*
 * jQuery UI Position 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Position
 */
(function(c){c.ui=c.ui||{};var n=/left|center|right/,o=/top|center|bottom/,t=c.fn.position,u=c.fn.offset;c.fn.position=function(b){if(!b||!b.of)return t.apply(this,arguments);b=c.extend({},b);var a=c(b.of),d=a[0],g=(b.collision||"flip").split(" "),e=b.offset?b.offset.split(" "):[0,0],h,k,j;if(d.nodeType===9){h=a.width();k=a.height();j={top:0,left:0}}else if(d.setTimeout){h=a.width();k=a.height();j={top:a.scrollTop(),left:a.scrollLeft()}}else if(d.preventDefault){b.at="left top";h=k=0;j={top:b.of.pageY,
left:b.of.pageX}}else{h=a.outerWidth();k=a.outerHeight();j=a.offset()}c.each(["my","at"],function(){var f=(b[this]||"").split(" ");if(f.length===1)f=n.test(f[0])?f.concat(["center"]):o.test(f[0])?["center"].concat(f):["center","center"];f[0]=n.test(f[0])?f[0]:"center";f[1]=o.test(f[1])?f[1]:"center";b[this]=f});if(g.length===1)g[1]=g[0];e[0]=parseInt(e[0],10)||0;if(e.length===1)e[1]=e[0];e[1]=parseInt(e[1],10)||0;if(b.at[0]==="right")j.left+=h;else if(b.at[0]==="center")j.left+=h/2;if(b.at[1]==="bottom")j.top+=
k;else if(b.at[1]==="center")j.top+=k/2;j.left+=e[0];j.top+=e[1];return this.each(function(){var f=c(this),l=f.outerWidth(),m=f.outerHeight(),p=parseInt(c.curCSS(this,"marginLeft",true))||0,q=parseInt(c.curCSS(this,"marginTop",true))||0,v=l+p+(parseInt(c.curCSS(this,"marginRight",true))||0),w=m+q+(parseInt(c.curCSS(this,"marginBottom",true))||0),i=c.extend({},j),r;if(b.my[0]==="right")i.left-=l;else if(b.my[0]==="center")i.left-=l/2;if(b.my[1]==="bottom")i.top-=m;else if(b.my[1]==="center")i.top-=
m/2;i.left=Math.round(i.left);i.top=Math.round(i.top);r={left:i.left-p,top:i.top-q};c.each(["left","top"],function(s,x){c.ui.position[g[s]]&&c.ui.position[g[s]][x](i,{targetWidth:h,targetHeight:k,elemWidth:l,elemHeight:m,collisionPosition:r,collisionWidth:v,collisionHeight:w,offset:e,my:b.my,at:b.at})});c.fn.bgiframe&&f.bgiframe();f.offset(c.extend(i,{using:b.using}))})};c.ui.position={fit:{left:function(b,a){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();b.left=
d>0?b.left-d:Math.max(b.left-a.collisionPosition.left,b.left)},top:function(b,a){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();b.top=d>0?b.top-d:Math.max(b.top-a.collisionPosition.top,b.top)}},flip:{left:function(b,a){if(a.at[0]!=="center"){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();var g=a.my[0]==="left"?-a.elemWidth:a.my[0]==="right"?a.elemWidth:0,e=a.at[0]==="left"?a.targetWidth:-a.targetWidth,h=-2*a.offset[0];b.left+=
a.collisionPosition.left<0?g+e+h:d>0?g+e+h:0}},top:function(b,a){if(a.at[1]!=="center"){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();var g=a.my[1]==="top"?-a.elemHeight:a.my[1]==="bottom"?a.elemHeight:0,e=a.at[1]==="top"?a.targetHeight:-a.targetHeight,h=-2*a.offset[1];b.top+=a.collisionPosition.top<0?g+e+h:d>0?g+e+h:0}}}};if(!c.offset.setOffset){c.offset.setOffset=function(b,a){if(/static/.test(c.curCSS(b,"position")))b.style.position="relative";var d=c(b),
g=d.offset(),e=parseInt(c.curCSS(b,"top",true),10)||0,h=parseInt(c.curCSS(b,"left",true),10)||0;g={top:a.top-g.top+e,left:a.left-g.left+h};"using"in a?a.using.call(b,g):d.css(g)};c.fn.offset=function(b){var a=this[0];if(!a||!a.ownerDocument)return null;if(b)return this.each(function(){c.offset.setOffset(this,b)});return u.call(this)}}})(jQuery);
;/*
 * jQuery UI Draggable 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.mouse.js
 *  jquery.ui.widget.js
 */
(function(d){d.widget("ui.draggable",d.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:true,appendTo:"parent",axis:false,connectToSortable:false,containment:false,cursor:"auto",cursorAt:false,grid:false,handle:false,helper:"original",iframeFix:false,opacity:false,refreshPositions:false,revert:false,revertDuration:500,scope:"default",scroll:true,scrollSensitivity:20,scrollSpeed:20,snap:false,snapMode:"both",snapTolerance:20,stack:false,zIndex:false},_create:function(){if(this.options.helper==
"original"&&!/^(?:r|a|f)/.test(this.element.css("position")))this.element[0].style.position="relative";this.options.addClasses&&this.element.addClass("ui-draggable");this.options.disabled&&this.element.addClass("ui-draggable-disabled");this._mouseInit()},destroy:function(){if(this.element.data("draggable")){this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");this._mouseDestroy();return this}},_mouseCapture:function(a){var b=
this.options;if(this.helper||b.disabled||d(a.target).is(".ui-resizable-handle"))return false;this.handle=this._getHandle(a);if(!this.handle)return false;d(b.iframeFix===true?"iframe":b.iframeFix).each(function(){d('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1E3}).css(d(this).offset()).appendTo("body")});return true},_mouseStart:function(a){var b=this.options;this.helper=
this._createHelper(a);this._cacheHelperProportions();if(d.ui.ddmanager)d.ui.ddmanager.current=this;this._cacheMargins();this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent();this.offset=this.positionAbs=this.element.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});
this.originalPosition=this.position=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);b.containment&&this._setContainment();if(this._trigger("start",a)===false){this._clear();return false}this._cacheHelperProportions();d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.helper.addClass("ui-draggable-dragging");this._mouseDrag(a,true);d.ui.ddmanager&&d.ui.ddmanager.dragStart(this,a);return true},
_mouseDrag:function(a,b){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!b){b=this._uiHash();if(this._trigger("drag",a,b)===false){this._mouseUp({});return false}this.position=b.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);return false},_mouseStop:function(a){var b=
false;if(d.ui.ddmanager&&!this.options.dropBehaviour)b=d.ui.ddmanager.drop(this,a);if(this.dropped){b=this.dropped;this.dropped=false}if((!this.element[0]||!this.element[0].parentNode)&&this.options.helper=="original")return false;if(this.options.revert=="invalid"&&!b||this.options.revert=="valid"&&b||this.options.revert===true||d.isFunction(this.options.revert)&&this.options.revert.call(this.element,b)){var c=this;d(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,
10),function(){c._trigger("stop",a)!==false&&c._clear()})}else this._trigger("stop",a)!==false&&this._clear();return false},_mouseUp:function(a){this.options.iframeFix===true&&d("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)});d.ui.ddmanager&&d.ui.ddmanager.dragStop(this,a);return d.ui.mouse.prototype._mouseUp.call(this,a)},cancel:function(){this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear();return this},_getHandle:function(a){var b=!this.options.handle||
!d(this.options.handle,this.element).length?true:false;d(this.options.handle,this.element).find("*").andSelf().each(function(){if(this==a.target)b=true});return b},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a])):b.helper=="clone"?this.element.clone().removeAttr("id"):this.element;a.parents("body").length||a.appendTo(b.appendTo=="parent"?this.element[0].parentNode:b.appendTo);a[0]!=this.element[0]&&!/(fixed|absolute)/.test(a.css("position"))&&
a.css("position","absolute");return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=
this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),
10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),
10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[a.containment=="document"?0:d(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,a.containment=="document"?0:d(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,
(a.containment=="document"?0:d(window).scrollLeft())+d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(a.containment=="document"?0:d(window).scrollTop())+(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)&&a.containment.constructor!=Array){a=d(a.containment);var b=a[0];if(b){a.offset();var c=d(b).css("overflow")!=
"hidden";this.containment=[(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0),(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0),(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),
10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom];this.relative_container=a}}else if(a.containment.constructor==Array)this.containment=a.containment},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName);return{top:b.top+
this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&
!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName),e=a.pageX,h=a.pageY;if(this.originalPosition){var g;if(this.containment){if(this.relative_container){g=this.relative_container.offset();g=[this.containment[0]+g.left,this.containment[1]+g.top,this.containment[2]+g.left,this.containment[3]+g.top]}else g=this.containment;if(a.pageX-this.offset.click.left<g[0])e=g[0]+this.offset.click.left;
if(a.pageY-this.offset.click.top<g[1])h=g[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>g[2])e=g[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>g[3])h=g[3]+this.offset.click.top}if(b.grid){h=b.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/b.grid[1])*b.grid[1]:this.originalPageY;h=g?!(h-this.offset.click.top<g[1]||h-this.offset.click.top>g[3])?h:!(h-this.offset.click.top<g[1])?h-b.grid[1]:h+b.grid[1]:h;e=b.grid[0]?this.originalPageX+Math.round((e-this.originalPageX)/
b.grid[0])*b.grid[0]:this.originalPageX;e=g?!(e-this.offset.click.left<g[0]||e-this.offset.click.left>g[2])?e:!(e-this.offset.click.left<g[0])?e-b.grid[0]:e+b.grid[0]:e}}return{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop()),left:e-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&d.browser.version<
526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove();this.helper=null;this.cancelHelperRemoval=false},_trigger:function(a,b,c){c=c||this._uiHash();d.ui.plugin.call(this,a,[b,c]);if(a=="drag")this.positionAbs=this._convertPositionTo("absolute");return d.Widget.prototype._trigger.call(this,a,b,
c)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}});d.extend(d.ui.draggable,{version:"1.8.14"});d.ui.plugin.add("draggable","connectToSortable",{start:function(a,b){var c=d(this).data("draggable"),f=c.options,e=d.extend({},b,{item:c.element});c.sortables=[];d(f.connectToSortable).each(function(){var h=d.data(this,"sortable");if(h&&!h.options.disabled){c.sortables.push({instance:h,shouldRevert:h.options.revert});
h.refreshPositions();h._trigger("activate",a,e)}})},stop:function(a,b){var c=d(this).data("draggable"),f=d.extend({},b,{item:c.element});d.each(c.sortables,function(){if(this.instance.isOver){this.instance.isOver=0;c.cancelHelperRemoval=true;this.instance.cancelHelperRemoval=false;if(this.shouldRevert)this.instance.options.revert=true;this.instance._mouseStop(a);this.instance.options.helper=this.instance.options._helper;c.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})}else{this.instance.cancelHelperRemoval=
false;this.instance._trigger("deactivate",a,f)}})},drag:function(a,b){var c=d(this).data("draggable"),f=this;d.each(c.sortables,function(){this.instance.positionAbs=c.positionAbs;this.instance.helperProportions=c.helperProportions;this.instance.offset.click=c.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver){this.instance.isOver=1;this.instance.currentItem=d(f).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item",true);
this.instance.options._helper=this.instance.options.helper;this.instance.options.helper=function(){return b.helper[0]};a.target=this.instance.currentItem[0];this.instance._mouseCapture(a,true);this.instance._mouseStart(a,true,true);this.instance.offset.click.top=c.offset.click.top;this.instance.offset.click.left=c.offset.click.left;this.instance.offset.parent.left-=c.offset.parent.left-this.instance.offset.parent.left;this.instance.offset.parent.top-=c.offset.parent.top-this.instance.offset.parent.top;
c._trigger("toSortable",a);c.dropped=this.instance.element;c.currentItem=c.element;this.instance.fromOutside=c}this.instance.currentItem&&this.instance._mouseDrag(a)}else if(this.instance.isOver){this.instance.isOver=0;this.instance.cancelHelperRemoval=true;this.instance.options.revert=false;this.instance._trigger("out",a,this.instance._uiHash(this.instance));this.instance._mouseStop(a,true);this.instance.options.helper=this.instance.options._helper;this.instance.currentItem.remove();this.instance.placeholder&&
this.instance.placeholder.remove();c._trigger("fromSortable",a);c.dropped=false}})}});d.ui.plugin.add("draggable","cursor",{start:function(){var a=d("body"),b=d(this).data("draggable").options;if(a.css("cursor"))b._cursor=a.css("cursor");a.css("cursor",b.cursor)},stop:function(){var a=d(this).data("draggable").options;a._cursor&&d("body").css("cursor",a._cursor)}});d.ui.plugin.add("draggable","opacity",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("opacity"))b._opacity=
a.css("opacity");a.css("opacity",b.opacity)},stop:function(a,b){a=d(this).data("draggable").options;a._opacity&&d(b.helper).css("opacity",a._opacity)}});d.ui.plugin.add("draggable","scroll",{start:function(){var a=d(this).data("draggable");if(a.scrollParent[0]!=document&&a.scrollParent[0].tagName!="HTML")a.overflowOffset=a.scrollParent.offset()},drag:function(a){var b=d(this).data("draggable"),c=b.options,f=false;if(b.scrollParent[0]!=document&&b.scrollParent[0].tagName!="HTML"){if(!c.axis||c.axis!=
"x")if(b.overflowOffset.top+b.scrollParent[0].offsetHeight-a.pageY<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop+c.scrollSpeed;else if(a.pageY-b.overflowOffset.top<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop-c.scrollSpeed;if(!c.axis||c.axis!="y")if(b.overflowOffset.left+b.scrollParent[0].offsetWidth-a.pageX<c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft+c.scrollSpeed;else if(a.pageX-b.overflowOffset.left<
c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft-c.scrollSpeed}else{if(!c.axis||c.axis!="x")if(a.pageY-d(document).scrollTop()<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()-c.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()+c.scrollSpeed);if(!c.axis||c.axis!="y")if(a.pageX-d(document).scrollLeft()<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()-
c.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()+c.scrollSpeed)}f!==false&&d.ui.ddmanager&&!c.dropBehaviour&&d.ui.ddmanager.prepareOffsets(b,a)}});d.ui.plugin.add("draggable","snap",{start:function(){var a=d(this).data("draggable"),b=a.options;a.snapElements=[];d(b.snap.constructor!=String?b.snap.items||":data(draggable)":b.snap).each(function(){var c=d(this),f=c.offset();this!=a.element[0]&&a.snapElements.push({item:this,
width:c.outerWidth(),height:c.outerHeight(),top:f.top,left:f.left})})},drag:function(a,b){for(var c=d(this).data("draggable"),f=c.options,e=f.snapTolerance,h=b.offset.left,g=h+c.helperProportions.width,n=b.offset.top,o=n+c.helperProportions.height,i=c.snapElements.length-1;i>=0;i--){var j=c.snapElements[i].left,l=j+c.snapElements[i].width,k=c.snapElements[i].top,m=k+c.snapElements[i].height;if(j-e<h&&h<l+e&&k-e<n&&n<m+e||j-e<h&&h<l+e&&k-e<o&&o<m+e||j-e<g&&g<l+e&&k-e<n&&n<m+e||j-e<g&&g<l+e&&k-e<o&&
o<m+e){if(f.snapMode!="inner"){var p=Math.abs(k-o)<=e,q=Math.abs(m-n)<=e,r=Math.abs(j-g)<=e,s=Math.abs(l-h)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:k-c.helperProportions.height,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:m,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:j-c.helperProportions.width}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:l}).left-c.margins.left}var t=
p||q||r||s;if(f.snapMode!="outer"){p=Math.abs(k-n)<=e;q=Math.abs(m-o)<=e;r=Math.abs(j-h)<=e;s=Math.abs(l-g)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:k,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:m-c.helperProportions.height,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:j}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:l-c.helperProportions.width}).left-c.margins.left}if(!c.snapElements[i].snapping&&
(p||q||r||s||t))c.options.snap.snap&&c.options.snap.snap.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[i].item}));c.snapElements[i].snapping=p||q||r||s||t}else{c.snapElements[i].snapping&&c.options.snap.release&&c.options.snap.release.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[i].item}));c.snapElements[i].snapping=false}}}});d.ui.plugin.add("draggable","stack",{start:function(){var a=d(this).data("draggable").options;a=d.makeArray(d(a.stack)).sort(function(c,f){return(parseInt(d(c).css("zIndex"),
10)||0)-(parseInt(d(f).css("zIndex"),10)||0)});if(a.length){var b=parseInt(a[0].style.zIndex)||0;d(a).each(function(c){this.style.zIndex=b+c});this[0].style.zIndex=b+a.length}}});d.ui.plugin.add("draggable","zIndex",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("zIndex"))b._zIndex=a.css("zIndex");a.css("zIndex",b.zIndex)},stop:function(a,b){a=d(this).data("draggable").options;a._zIndex&&d(b.helper).css("zIndex",a._zIndex)}})})(jQuery);
;/*
 * jQuery UI Droppable 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 *  jquery.ui.draggable.js
 */
(function(d){d.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:false,addClasses:true,greedy:false,hoverClass:false,scope:"default",tolerance:"intersect"},_create:function(){var a=this.options,b=a.accept;this.isover=0;this.isout=1;this.accept=d.isFunction(b)?b:function(c){return c.is(b)};this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};d.ui.ddmanager.droppables[a.scope]=d.ui.ddmanager.droppables[a.scope]||[];d.ui.ddmanager.droppables[a.scope].push(this);
a.addClasses&&this.element.addClass("ui-droppable")},destroy:function(){for(var a=d.ui.ddmanager.droppables[this.options.scope],b=0;b<a.length;b++)a[b]==this&&a.splice(b,1);this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");return this},_setOption:function(a,b){if(a=="accept")this.accept=d.isFunction(b)?b:function(c){return c.is(b)};d.Widget.prototype._setOption.apply(this,arguments)},_activate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&
this.element.addClass(this.options.activeClass);b&&this._trigger("activate",a,this.ui(b))},_deactivate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass);b&&this._trigger("deactivate",a,this.ui(b))},_over:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.addClass(this.options.hoverClass);
this._trigger("over",a,this.ui(b))}},_out:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("out",a,this.ui(b))}},_drop:function(a,b){var c=b||d.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return false;var e=false;this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var g=
d.data(this,"droppable");if(g.options.greedy&&!g.options.disabled&&g.options.scope==c.options.scope&&g.accept.call(g.element[0],c.currentItem||c.element)&&d.ui.intersect(c,d.extend(g,{offset:g.element.offset()}),g.options.tolerance)){e=true;return false}});if(e)return false;if(this.accept.call(this.element[0],c.currentItem||c.element)){this.options.activeClass&&this.element.removeClass(this.options.activeClass);this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("drop",
a,this.ui(c));return this.element}return false},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}});d.extend(d.ui.droppable,{version:"1.8.14"});d.ui.intersect=function(a,b,c){if(!b.offset)return false;var e=(a.positionAbs||a.position.absolute).left,g=e+a.helperProportions.width,f=(a.positionAbs||a.position.absolute).top,h=f+a.helperProportions.height,i=b.offset.left,k=i+b.proportions.width,j=b.offset.top,l=j+b.proportions.height;
switch(c){case "fit":return i<=e&&g<=k&&j<=f&&h<=l;case "intersect":return i<e+a.helperProportions.width/2&&g-a.helperProportions.width/2<k&&j<f+a.helperProportions.height/2&&h-a.helperProportions.height/2<l;case "pointer":return d.ui.isOver((a.positionAbs||a.position.absolute).top+(a.clickOffset||a.offset.click).top,(a.positionAbs||a.position.absolute).left+(a.clickOffset||a.offset.click).left,j,i,b.proportions.height,b.proportions.width);case "touch":return(f>=j&&f<=l||h>=j&&h<=l||f<j&&h>l)&&(e>=
i&&e<=k||g>=i&&g<=k||e<i&&g>k);default:return false}};d.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(a,b){var c=d.ui.ddmanager.droppables[a.options.scope]||[],e=b?b.type:null,g=(a.currentItem||a.element).find(":data(droppable)").andSelf(),f=0;a:for(;f<c.length;f++)if(!(c[f].options.disabled||a&&!c[f].accept.call(c[f].element[0],a.currentItem||a.element))){for(var h=0;h<g.length;h++)if(g[h]==c[f].element[0]){c[f].proportions.height=0;continue a}c[f].visible=c[f].element.css("display")!=
"none";if(c[f].visible){e=="mousedown"&&c[f]._activate.call(c[f],b);c[f].offset=c[f].element.offset();c[f].proportions={width:c[f].element[0].offsetWidth,height:c[f].element[0].offsetHeight}}}},drop:function(a,b){var c=false;d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(this.options){if(!this.options.disabled&&this.visible&&d.ui.intersect(a,this,this.options.tolerance))c=c||this._drop.call(this,b);if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],a.currentItem||
a.element)){this.isout=1;this.isover=0;this._deactivate.call(this,b)}}});return c},dragStart:function(a,b){a.element.parentsUntil("body").bind("scroll.droppable",function(){a.options.refreshPositions||d.ui.ddmanager.prepareOffsets(a,b)})},drag:function(a,b){a.options.refreshPositions&&d.ui.ddmanager.prepareOffsets(a,b);d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(!(this.options.disabled||this.greedyChild||!this.visible)){var c=d.ui.intersect(a,this,this.options.tolerance);if(c=
!c&&this.isover==1?"isout":c&&this.isover==0?"isover":null){var e;if(this.options.greedy){var g=this.element.parents(":data(droppable):eq(0)");if(g.length){e=d.data(g[0],"droppable");e.greedyChild=c=="isover"?1:0}}if(e&&c=="isover"){e.isover=0;e.isout=1;e._out.call(e,b)}this[c]=1;this[c=="isout"?"isover":"isout"]=0;this[c=="isover"?"_over":"_out"].call(this,b);if(e&&c=="isout"){e.isout=0;e.isover=1;e._over.call(e,b)}}}})},dragStop:function(a,b){a.element.parentsUntil("body").unbind("scroll.droppable");
a.options.refreshPositions||d.ui.ddmanager.prepareOffsets(a,b)}}})(jQuery);
;/*
 * jQuery UI Resizable 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Resizables
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.mouse.js
 *  jquery.ui.widget.js
 */
(function(e){e.widget("ui.resizable",e.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1E3},_create:function(){var b=this,a=this.options;this.element.addClass("ui-resizable");e.extend(this,{_aspectRatio:!!a.aspectRatio,aspectRatio:a.aspectRatio,originalElement:this.element,
_proportionallyResizeElements:[],_helper:a.helper||a.ghost||a.animate?a.helper||"ui-resizable-helper":null});if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)){/relative/.test(this.element.css("position"))&&e.browser.opera&&this.element.css({position:"relative",top:"auto",left:"auto"});this.element.wrap(e('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),
top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("resizable",this.element.data("resizable"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});this.originalResizeStyle=
this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize()}this.handles=a.handles||(!e(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",
nw:".ui-resizable-nw"});if(this.handles.constructor==String){if(this.handles=="all")this.handles="n,e,s,w,se,sw,ne,nw";var c=this.handles.split(",");this.handles={};for(var d=0;d<c.length;d++){var f=e.trim(c[d]),g=e('<div class="ui-resizable-handle '+("ui-resizable-"+f)+'"></div>');/sw|se|ne|nw/.test(f)&&g.css({zIndex:++a.zIndex});"se"==f&&g.addClass("ui-icon ui-icon-gripsmall-diagonal-se");this.handles[f]=".ui-resizable-"+f;this.element.append(g)}}this._renderAxis=function(h){h=h||this.element;for(var i in this.handles){if(this.handles[i].constructor==
String)this.handles[i]=e(this.handles[i],this.element).show();if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var j=e(this.handles[i],this.element),l=0;l=/sw|ne|nw|se|n|s/.test(i)?j.outerHeight():j.outerWidth();j=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join("");h.css(j,l);this._proportionallyResize()}e(this.handles[i])}};this._renderAxis(this.element);this._handles=e(".ui-resizable-handle",this.element).disableSelection();
this._handles.mouseover(function(){if(!b.resizing){if(this.className)var h=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);b.axis=h&&h[1]?h[1]:"se"}});if(a.autoHide){this._handles.hide();e(this.element).addClass("ui-resizable-autohide").hover(function(){if(!a.disabled){e(this).removeClass("ui-resizable-autohide");b._handles.show()}},function(){if(!a.disabled)if(!b.resizing){e(this).addClass("ui-resizable-autohide");b._handles.hide()}})}this._mouseInit()},destroy:function(){this._mouseDestroy();
var b=function(c){e(c).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};if(this.elementIsWrapper){b(this.element);var a=this.element;a.after(this.originalElement.css({position:a.css("position"),width:a.outerWidth(),height:a.outerHeight(),top:a.css("top"),left:a.css("left")})).remove()}this.originalElement.css("resize",this.originalResizeStyle);b(this.originalElement);return this},_mouseCapture:function(b){var a=
false;for(var c in this.handles)if(e(this.handles[c])[0]==b.target)a=true;return!this.options.disabled&&a},_mouseStart:function(b){var a=this.options,c=this.element.position(),d=this.element;this.resizing=true;this.documentScroll={top:e(document).scrollTop(),left:e(document).scrollLeft()};if(d.is(".ui-draggable")||/absolute/.test(d.css("position")))d.css({position:"absolute",top:c.top,left:c.left});e.browser.opera&&/relative/.test(d.css("position"))&&d.css({position:"relative",top:"auto",left:"auto"});
this._renderProxy();c=m(this.helper.css("left"));var f=m(this.helper.css("top"));if(a.containment){c+=e(a.containment).scrollLeft()||0;f+=e(a.containment).scrollTop()||0}this.offset=this.helper.offset();this.position={left:c,top:f};this.size=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalSize=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalPosition={left:c,top:f};this.sizeDiff=
{width:d.outerWidth()-d.width(),height:d.outerHeight()-d.height()};this.originalMousePosition={left:b.pageX,top:b.pageY};this.aspectRatio=typeof a.aspectRatio=="number"?a.aspectRatio:this.originalSize.width/this.originalSize.height||1;a=e(".ui-resizable-"+this.axis).css("cursor");e("body").css("cursor",a=="auto"?this.axis+"-resize":a);d.addClass("ui-resizable-resizing");this._propagate("start",b);return true},_mouseDrag:function(b){var a=this.helper,c=this.originalMousePosition,d=this._change[this.axis];
if(!d)return false;c=d.apply(this,[b,b.pageX-c.left||0,b.pageY-c.top||0]);this._updateVirtualBoundaries(b.shiftKey);if(this._aspectRatio||b.shiftKey)c=this._updateRatio(c,b);c=this._respectSize(c,b);this._propagate("resize",b);a.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"});!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize();this._updateCache(c);this._trigger("resize",b,this.ui());return false},
_mouseStop:function(b){this.resizing=false;var a=this.options,c=this;if(this._helper){var d=this._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName);d=f&&e.ui.hasScroll(d[0],"left")?0:c.sizeDiff.height;f=f?0:c.sizeDiff.width;f={width:c.helper.width()-f,height:c.helper.height()-d};d=parseInt(c.element.css("left"),10)+(c.position.left-c.originalPosition.left)||null;var g=parseInt(c.element.css("top"),10)+(c.position.top-c.originalPosition.top)||null;a.animate||this.element.css(e.extend(f,
{top:g,left:d}));c.helper.height(c.size.height);c.helper.width(c.size.width);this._helper&&!a.animate&&this._proportionallyResize()}e("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");this._propagate("stop",b);this._helper&&this.helper.remove();return false},_updateVirtualBoundaries:function(b){var a=this.options,c,d,f;a={minWidth:k(a.minWidth)?a.minWidth:0,maxWidth:k(a.maxWidth)?a.maxWidth:Infinity,minHeight:k(a.minHeight)?a.minHeight:0,maxHeight:k(a.maxHeight)?a.maxHeight:
Infinity};if(this._aspectRatio||b){b=a.minHeight*this.aspectRatio;d=a.minWidth/this.aspectRatio;c=a.maxHeight*this.aspectRatio;f=a.maxWidth/this.aspectRatio;if(b>a.minWidth)a.minWidth=b;if(d>a.minHeight)a.minHeight=d;if(c<a.maxWidth)a.maxWidth=c;if(f<a.maxHeight)a.maxHeight=f}this._vBoundaries=a},_updateCache:function(b){this.offset=this.helper.offset();if(k(b.left))this.position.left=b.left;if(k(b.top))this.position.top=b.top;if(k(b.height))this.size.height=b.height;if(k(b.width))this.size.width=
b.width},_updateRatio:function(b){var a=this.position,c=this.size,d=this.axis;if(k(b.height))b.width=b.height*this.aspectRatio;else if(k(b.width))b.height=b.width/this.aspectRatio;if(d=="sw"){b.left=a.left+(c.width-b.width);b.top=null}if(d=="nw"){b.top=a.top+(c.height-b.height);b.left=a.left+(c.width-b.width)}return b},_respectSize:function(b){var a=this._vBoundaries,c=this.axis,d=k(b.width)&&a.maxWidth&&a.maxWidth<b.width,f=k(b.height)&&a.maxHeight&&a.maxHeight<b.height,g=k(b.width)&&a.minWidth&&
a.minWidth>b.width,h=k(b.height)&&a.minHeight&&a.minHeight>b.height;if(g)b.width=a.minWidth;if(h)b.height=a.minHeight;if(d)b.width=a.maxWidth;if(f)b.height=a.maxHeight;var i=this.originalPosition.left+this.originalSize.width,j=this.position.top+this.size.height,l=/sw|nw|w/.test(c);c=/nw|ne|n/.test(c);if(g&&l)b.left=i-a.minWidth;if(d&&l)b.left=i-a.maxWidth;if(h&&c)b.top=j-a.minHeight;if(f&&c)b.top=j-a.maxHeight;if((a=!b.width&&!b.height)&&!b.left&&b.top)b.top=null;else if(a&&!b.top&&b.left)b.left=
null;return b},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var b=this.helper||this.element,a=0;a<this._proportionallyResizeElements.length;a++){var c=this._proportionallyResizeElements[a];if(!this.borderDif){var d=[c.css("borderTopWidth"),c.css("borderRightWidth"),c.css("borderBottomWidth"),c.css("borderLeftWidth")],f=[c.css("paddingTop"),c.css("paddingRight"),c.css("paddingBottom"),c.css("paddingLeft")];this.borderDif=e.map(d,function(g,h){g=parseInt(g,10)||
0;h=parseInt(f[h],10)||0;return g+h})}e.browser.msie&&(e(b).is(":hidden")||e(b).parents(":hidden").length)||c.css({height:b.height()-this.borderDif[0]-this.borderDif[2]||0,width:b.width()-this.borderDif[1]-this.borderDif[3]||0})}},_renderProxy:function(){var b=this.options;this.elementOffset=this.element.offset();if(this._helper){this.helper=this.helper||e('<div style="overflow:hidden;"></div>');var a=e.browser.msie&&e.browser.version<7,c=a?1:0;a=a?2:-1;this.helper.addClass(this._helper).css({width:this.element.outerWidth()+
a,height:this.element.outerHeight()+a,position:"absolute",left:this.elementOffset.left-c+"px",top:this.elementOffset.top-c+"px",zIndex:++b.zIndex});this.helper.appendTo("body").disableSelection()}else this.helper=this.element},_change:{e:function(b,a){return{width:this.originalSize.width+a}},w:function(b,a){return{left:this.originalPosition.left+a,width:this.originalSize.width-a}},n:function(b,a,c){return{top:this.originalPosition.top+c,height:this.originalSize.height-c}},s:function(b,a,c){return{height:this.originalSize.height+
c}},se:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},sw:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[b,a,c]))},ne:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},nw:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[b,a,c]))}},_propagate:function(b,a){e.ui.plugin.call(this,b,[a,this.ui()]);
b!="resize"&&this._trigger(b,a,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}});e.extend(e.ui.resizable,{version:"1.8.14"});e.ui.plugin.add("resizable","alsoResize",{start:function(){var b=e(this).data("resizable").options,a=function(c){e(c).each(function(){var d=e(this);d.data("resizable-alsoresize",{width:parseInt(d.width(),
10),height:parseInt(d.height(),10),left:parseInt(d.css("left"),10),top:parseInt(d.css("top"),10),position:d.css("position")})})};if(typeof b.alsoResize=="object"&&!b.alsoResize.parentNode)if(b.alsoResize.length){b.alsoResize=b.alsoResize[0];a(b.alsoResize)}else e.each(b.alsoResize,function(c){a(c)});else a(b.alsoResize)},resize:function(b,a){var c=e(this).data("resizable");b=c.options;var d=c.originalSize,f=c.originalPosition,g={height:c.size.height-d.height||0,width:c.size.width-d.width||0,top:c.position.top-
f.top||0,left:c.position.left-f.left||0},h=function(i,j){e(i).each(function(){var l=e(this),q=e(this).data("resizable-alsoresize"),p={},r=j&&j.length?j:l.parents(a.originalElement[0]).length?["width","height"]:["width","height","top","left"];e.each(r,function(n,o){if((n=(q[o]||0)+(g[o]||0))&&n>=0)p[o]=n||null});if(e.browser.opera&&/relative/.test(l.css("position"))){c._revertToRelativePosition=true;l.css({position:"absolute",top:"auto",left:"auto"})}l.css(p)})};typeof b.alsoResize=="object"&&!b.alsoResize.nodeType?
e.each(b.alsoResize,function(i,j){h(i,j)}):h(b.alsoResize)},stop:function(){var b=e(this).data("resizable"),a=b.options,c=function(d){e(d).each(function(){var f=e(this);f.css({position:f.data("resizable-alsoresize").position})})};if(b._revertToRelativePosition){b._revertToRelativePosition=false;typeof a.alsoResize=="object"&&!a.alsoResize.nodeType?e.each(a.alsoResize,function(d){c(d)}):c(a.alsoResize)}e(this).removeData("resizable-alsoresize")}});e.ui.plugin.add("resizable","animate",{stop:function(b){var a=
e(this).data("resizable"),c=a.options,d=a._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName),g=f&&e.ui.hasScroll(d[0],"left")?0:a.sizeDiff.height;f={width:a.size.width-(f?0:a.sizeDiff.width),height:a.size.height-g};g=parseInt(a.element.css("left"),10)+(a.position.left-a.originalPosition.left)||null;var h=parseInt(a.element.css("top"),10)+(a.position.top-a.originalPosition.top)||null;a.element.animate(e.extend(f,h&&g?{top:h,left:g}:{}),{duration:c.animateDuration,easing:c.animateEasing,
step:function(){var i={width:parseInt(a.element.css("width"),10),height:parseInt(a.element.css("height"),10),top:parseInt(a.element.css("top"),10),left:parseInt(a.element.css("left"),10)};d&&d.length&&e(d[0]).css({width:i.width,height:i.height});a._updateCache(i);a._propagate("resize",b)}})}});e.ui.plugin.add("resizable","containment",{start:function(){var b=e(this).data("resizable"),a=b.element,c=b.options.containment;if(a=c instanceof e?c.get(0):/parent/.test(c)?a.parent().get(0):c){b.containerElement=
e(a);if(/document/.test(c)||c==document){b.containerOffset={left:0,top:0};b.containerPosition={left:0,top:0};b.parentData={element:e(document),left:0,top:0,width:e(document).width(),height:e(document).height()||document.body.parentNode.scrollHeight}}else{var d=e(a),f=[];e(["Top","Right","Left","Bottom"]).each(function(i,j){f[i]=m(d.css("padding"+j))});b.containerOffset=d.offset();b.containerPosition=d.position();b.containerSize={height:d.innerHeight()-f[3],width:d.innerWidth()-f[1]};c=b.containerOffset;
var g=b.containerSize.height,h=b.containerSize.width;h=e.ui.hasScroll(a,"left")?a.scrollWidth:h;g=e.ui.hasScroll(a)?a.scrollHeight:g;b.parentData={element:a,left:c.left,top:c.top,width:h,height:g}}}},resize:function(b){var a=e(this).data("resizable"),c=a.options,d=a.containerOffset,f=a.position;b=a._aspectRatio||b.shiftKey;var g={top:0,left:0},h=a.containerElement;if(h[0]!=document&&/static/.test(h.css("position")))g=d;if(f.left<(a._helper?d.left:0)){a.size.width+=a._helper?a.position.left-d.left:
a.position.left-g.left;if(b)a.size.height=a.size.width/c.aspectRatio;a.position.left=c.helper?d.left:0}if(f.top<(a._helper?d.top:0)){a.size.height+=a._helper?a.position.top-d.top:a.position.top;if(b)a.size.width=a.size.height*c.aspectRatio;a.position.top=a._helper?d.top:0}a.offset.left=a.parentData.left+a.position.left;a.offset.top=a.parentData.top+a.position.top;c=Math.abs((a._helper?a.offset.left-g.left:a.offset.left-g.left)+a.sizeDiff.width);d=Math.abs((a._helper?a.offset.top-g.top:a.offset.top-
d.top)+a.sizeDiff.height);f=a.containerElement.get(0)==a.element.parent().get(0);g=/relative|absolute/.test(a.containerElement.css("position"));if(f&&g)c-=a.parentData.left;if(c+a.size.width>=a.parentData.width){a.size.width=a.parentData.width-c;if(b)a.size.height=a.size.width/a.aspectRatio}if(d+a.size.height>=a.parentData.height){a.size.height=a.parentData.height-d;if(b)a.size.width=a.size.height*a.aspectRatio}},stop:function(){var b=e(this).data("resizable"),a=b.options,c=b.containerOffset,d=b.containerPosition,
f=b.containerElement,g=e(b.helper),h=g.offset(),i=g.outerWidth()-b.sizeDiff.width;g=g.outerHeight()-b.sizeDiff.height;b._helper&&!a.animate&&/relative/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g});b._helper&&!a.animate&&/static/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g})}});e.ui.plugin.add("resizable","ghost",{start:function(){var b=e(this).data("resizable"),a=b.options,c=b.size;b.ghost=b.originalElement.clone();b.ghost.css({opacity:0.25,
display:"block",position:"relative",height:c.height,width:c.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof a.ghost=="string"?a.ghost:"");b.ghost.appendTo(b.helper)},resize:function(){var b=e(this).data("resizable");b.ghost&&b.ghost.css({position:"relative",height:b.size.height,width:b.size.width})},stop:function(){var b=e(this).data("resizable");b.ghost&&b.helper&&b.helper.get(0).removeChild(b.ghost.get(0))}});e.ui.plugin.add("resizable","grid",{resize:function(){var b=
e(this).data("resizable"),a=b.options,c=b.size,d=b.originalSize,f=b.originalPosition,g=b.axis;a.grid=typeof a.grid=="number"?[a.grid,a.grid]:a.grid;var h=Math.round((c.width-d.width)/(a.grid[0]||1))*(a.grid[0]||1);a=Math.round((c.height-d.height)/(a.grid[1]||1))*(a.grid[1]||1);if(/^(se|s|e)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a}else if(/^(ne)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}else{if(/^(sw)$/.test(g)){b.size.width=d.width+h;b.size.height=
d.height+a}else{b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}b.position.left=f.left-h}}});var m=function(b){return parseInt(b,10)||0},k=function(b){return!isNaN(parseInt(b,10))}})(jQuery);
;/*
 * jQuery UI Selectable 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Selectables
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.mouse.js
 *  jquery.ui.widget.js
 */
(function(e){e.widget("ui.selectable",e.ui.mouse,{options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch"},_create:function(){var c=this;this.element.addClass("ui-selectable");this.dragged=false;var f;this.refresh=function(){f=e(c.options.filter,c.element[0]);f.each(function(){var d=e(this),b=d.offset();e.data(this,"selectable-item",{element:this,$element:d,left:b.left,top:b.top,right:b.left+d.outerWidth(),bottom:b.top+d.outerHeight(),startselected:false,selected:d.hasClass("ui-selected"),
selecting:d.hasClass("ui-selecting"),unselecting:d.hasClass("ui-unselecting")})})};this.refresh();this.selectees=f.addClass("ui-selectee");this._mouseInit();this.helper=e("<div class='ui-selectable-helper'></div>")},destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");this._mouseDestroy();return this},_mouseStart:function(c){var f=this;this.opos=[c.pageX,
c.pageY];if(!this.options.disabled){var d=this.options;this.selectees=e(d.filter,this.element[0]);this._trigger("start",c);e(d.appendTo).append(this.helper);this.helper.css({left:c.clientX,top:c.clientY,width:0,height:0});d.autoRefresh&&this.refresh();this.selectees.filter(".ui-selected").each(function(){var b=e.data(this,"selectable-item");b.startselected=true;if(!c.metaKey){b.$element.removeClass("ui-selected");b.selected=false;b.$element.addClass("ui-unselecting");b.unselecting=true;f._trigger("unselecting",
c,{unselecting:b.element})}});e(c.target).parents().andSelf().each(function(){var b=e.data(this,"selectable-item");if(b){var g=!c.metaKey||!b.$element.hasClass("ui-selected");b.$element.removeClass(g?"ui-unselecting":"ui-selected").addClass(g?"ui-selecting":"ui-unselecting");b.unselecting=!g;b.selecting=g;(b.selected=g)?f._trigger("selecting",c,{selecting:b.element}):f._trigger("unselecting",c,{unselecting:b.element});return false}})}},_mouseDrag:function(c){var f=this;this.dragged=true;if(!this.options.disabled){var d=
this.options,b=this.opos[0],g=this.opos[1],h=c.pageX,i=c.pageY;if(b>h){var j=h;h=b;b=j}if(g>i){j=i;i=g;g=j}this.helper.css({left:b,top:g,width:h-b,height:i-g});this.selectees.each(function(){var a=e.data(this,"selectable-item");if(!(!a||a.element==f.element[0])){var k=false;if(d.tolerance=="touch")k=!(a.left>h||a.right<b||a.top>i||a.bottom<g);else if(d.tolerance=="fit")k=a.left>b&&a.right<h&&a.top>g&&a.bottom<i;if(k){if(a.selected){a.$element.removeClass("ui-selected");a.selected=false}if(a.unselecting){a.$element.removeClass("ui-unselecting");
a.unselecting=false}if(!a.selecting){a.$element.addClass("ui-selecting");a.selecting=true;f._trigger("selecting",c,{selecting:a.element})}}else{if(a.selecting)if(c.metaKey&&a.startselected){a.$element.removeClass("ui-selecting");a.selecting=false;a.$element.addClass("ui-selected");a.selected=true}else{a.$element.removeClass("ui-selecting");a.selecting=false;if(a.startselected){a.$element.addClass("ui-unselecting");a.unselecting=true}f._trigger("unselecting",c,{unselecting:a.element})}if(a.selected)if(!c.metaKey&&
!a.startselected){a.$element.removeClass("ui-selected");a.selected=false;a.$element.addClass("ui-unselecting");a.unselecting=true;f._trigger("unselecting",c,{unselecting:a.element})}}}});return false}},_mouseStop:function(c){var f=this;this.dragged=false;e(".ui-unselecting",this.element[0]).each(function(){var d=e.data(this,"selectable-item");d.$element.removeClass("ui-unselecting");d.unselecting=false;d.startselected=false;f._trigger("unselected",c,{unselected:d.element})});e(".ui-selecting",this.element[0]).each(function(){var d=
e.data(this,"selectable-item");d.$element.removeClass("ui-selecting").addClass("ui-selected");d.selecting=false;d.selected=true;d.startselected=true;f._trigger("selected",c,{selected:d.element})});this._trigger("stop",c);this.helper.remove();return false}});e.extend(e.ui.selectable,{version:"1.8.14"})})(jQuery);
;/*
 * jQuery UI Sortable 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.mouse.js
 *  jquery.ui.widget.js
 */
(function(d){d.widget("ui.sortable",d.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1E3},_create:function(){var a=this.options;this.containerCache={};this.element.addClass("ui-sortable");
this.refresh();this.floating=this.items.length?a.axis==="x"||/left|right/.test(this.items[0].item.css("float"))||/inline|table-cell/.test(this.items[0].item.css("display")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var a=this.items.length-1;a>=0;a--)this.items[a].item.removeData("sortable-item");return this},_setOption:function(a,b){if(a===
"disabled"){this.options[a]=b;this.widget()[b?"addClass":"removeClass"]("ui-sortable-disabled")}else d.Widget.prototype._setOption.apply(this,arguments)},_mouseCapture:function(a,b){if(this.reverting)return false;if(this.options.disabled||this.options.type=="static")return false;this._refreshItems(a);var c=null,e=this;d(a.target).parents().each(function(){if(d.data(this,"sortable-item")==e){c=d(this);return false}});if(d.data(a.target,"sortable-item")==e)c=d(a.target);if(!c)return false;if(this.options.handle&&
!b){var f=false;d(this.options.handle,c).find("*").andSelf().each(function(){if(this==a.target)f=true});if(!f)return false}this.currentItem=c;this._removeCurrentsFromItems();return true},_mouseStart:function(a,b,c){b=this.options;var e=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(a);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,
left:this.offset.left-this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};
this.helper[0]!=this.currentItem[0]&&this.currentItem.hide();this._createPlaceholder();b.containment&&this._setContainment();if(b.cursor){if(d("body").css("cursor"))this._storedCursor=d("body").css("cursor");d("body").css("cursor",b.cursor)}if(b.opacity){if(this.helper.css("opacity"))this._storedOpacity=this.helper.css("opacity");this.helper.css("opacity",b.opacity)}if(b.zIndex){if(this.helper.css("zIndex"))this._storedZIndex=this.helper.css("zIndex");this.helper.css("zIndex",b.zIndex)}if(this.scrollParent[0]!=
document&&this.scrollParent[0].tagName!="HTML")this.overflowOffset=this.scrollParent.offset();this._trigger("start",a,this._uiHash());this._preserveHelperProportions||this._cacheHelperProportions();if(!c)for(c=this.containers.length-1;c>=0;c--)this.containers[c]._trigger("activate",a,e._uiHash(this));if(d.ui.ddmanager)d.ui.ddmanager.current=this;d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(a);
return true},_mouseDrag:function(a){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!this.lastPositionAbs)this.lastPositionAbs=this.positionAbs;if(this.options.scroll){var b=this.options,c=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop+b.scrollSpeed;else if(a.pageY-this.overflowOffset.top<
b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop-b.scrollSpeed;if(this.overflowOffset.left+this.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft+b.scrollSpeed;else if(a.pageX-this.overflowOffset.left<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft-b.scrollSpeed}else{if(a.pageY-d(document).scrollTop()<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()-
b.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()+b.scrollSpeed);if(a.pageX-d(document).scrollLeft()<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed)}c!==false&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,
a)}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";for(b=this.items.length-1;b>=0;b--){c=this.items[b];var e=c.item[0],f=this._intersectsWithPointer(c);if(f)if(e!=this.currentItem[0]&&this.placeholder[f==1?"next":"prev"]()[0]!=e&&!d.ui.contains(this.placeholder[0],e)&&(this.options.type=="semi-dynamic"?!d.ui.contains(this.element[0],
e):true)){this.direction=f==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(c))this._rearrange(a,c);else break;this._trigger("change",a,this._uiHash());break}}this._contactContainers(a);d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);this._trigger("sort",a,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(a,b){if(a){d.ui.ddmanager&&!this.options.dropBehaviour&&d.ui.ddmanager.drop(this,a);if(this.options.revert){var c=this;b=c.placeholder.offset();
c.reverting=true;d(this.helper).animate({left:b.left-this.offset.parent.left-c.margins.left+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollLeft),top:b.top-this.offset.parent.top-c.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){c._clear(a)})}else this._clear(a,b);return false}},cancel:function(){var a=this;if(this.dragging){this._mouseUp({target:null});this.options.helper=="original"?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):
this.currentItem.show();for(var b=this.containers.length-1;b>=0;b--){this.containers[b]._trigger("deactivate",null,a._uiHash(this));if(this.containers[b].containerCache.over){this.containers[b]._trigger("out",null,a._uiHash(this));this.containers[b].containerCache.over=0}}}if(this.placeholder){this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.options.helper!="original"&&this.helper&&this.helper[0].parentNode&&this.helper.remove();d.extend(this,{helper:null,
dragging:false,reverting:false,_noFinalSort:null});this.domPosition.prev?d(this.domPosition.prev).after(this.currentItem):d(this.domPosition.parent).prepend(this.currentItem)}return this},serialize:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};d(b).each(function(){var e=(d(a.item||this).attr(a.attribute||"id")||"").match(a.expression||/(.+)[-=_](.+)/);if(e)c.push((a.key||e[1]+"[]")+"="+(a.key&&a.expression?e[1]:e[2]))});!c.length&&a.key&&c.push(a.key+"=");return c.join("&")},
toArray:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};b.each(function(){c.push(d(a.item||this).attr(a.attribute||"id")||"")});return c},_intersectsWith:function(a){var b=this.positionAbs.left,c=b+this.helperProportions.width,e=this.positionAbs.top,f=e+this.helperProportions.height,g=a.left,h=g+a.width,i=a.top,k=i+a.height,j=this.offset.click.top,l=this.offset.click.left;j=e+j>i&&e+j<k&&b+l>g&&b+l<h;return this.options.tolerance=="pointer"||this.options.forcePointerForContainers||
this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>a[this.floating?"width":"height"]?j:g<b+this.helperProportions.width/2&&c-this.helperProportions.width/2<h&&i<e+this.helperProportions.height/2&&f-this.helperProportions.height/2<k},_intersectsWithPointer:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left,a.width);b=b&&a;a=this._getDragVerticalDirection();
var c=this._getDragHorizontalDirection();if(!b)return false;return this.floating?c&&c=="right"||a=="down"?2:1:a&&(a=="down"?2:1)},_intersectsWithSides:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top+a.height/2,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left+a.width/2,a.width);var c=this._getDragVerticalDirection(),e=this._getDragHorizontalDirection();return this.floating&&e?e=="right"&&a||e=="left"&&!a:c&&(c=="down"&&b||c=="up"&&!b)},
_getDragVerticalDirection:function(){var a=this.positionAbs.top-this.lastPositionAbs.top;return a!=0&&(a>0?"down":"up")},_getDragHorizontalDirection:function(){var a=this.positionAbs.left-this.lastPositionAbs.left;return a!=0&&(a>0?"right":"left")},refresh:function(a){this._refreshItems(a);this.refreshPositions();return this},_connectWith:function(){var a=this.options;return a.connectWith.constructor==String?[a.connectWith]:a.connectWith},_getItemsAsjQuery:function(a){var b=[],c=[],e=this._connectWith();
if(e&&a)for(a=e.length-1;a>=0;a--)for(var f=d(e[a]),g=f.length-1;g>=0;g--){var h=d.data(f[g],"sortable");if(h&&h!=this&&!h.options.disabled)c.push([d.isFunction(h.options.items)?h.options.items.call(h.element):d(h.options.items,h.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),h])}c.push([d.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):d(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),
this]);for(a=c.length-1;a>=0;a--)c[a][0].each(function(){b.push(this)});return d(b)},_removeCurrentsFromItems:function(){for(var a=this.currentItem.find(":data(sortable-item)"),b=0;b<this.items.length;b++)for(var c=0;c<a.length;c++)a[c]==this.items[b].item[0]&&this.items.splice(b,1)},_refreshItems:function(a){this.items=[];this.containers=[this];var b=this.items,c=[[d.isFunction(this.options.items)?this.options.items.call(this.element[0],a,{item:this.currentItem}):d(this.options.items,this.element),
this]],e=this._connectWith();if(e)for(var f=e.length-1;f>=0;f--)for(var g=d(e[f]),h=g.length-1;h>=0;h--){var i=d.data(g[h],"sortable");if(i&&i!=this&&!i.options.disabled){c.push([d.isFunction(i.options.items)?i.options.items.call(i.element[0],a,{item:this.currentItem}):d(i.options.items,i.element),i]);this.containers.push(i)}}for(f=c.length-1;f>=0;f--){a=c[f][1];e=c[f][0];h=0;for(g=e.length;h<g;h++){i=d(e[h]);i.data("sortable-item",a);b.push({item:i,instance:a,width:0,height:0,left:0,top:0})}}},refreshPositions:function(a){if(this.offsetParent&&
this.helper)this.offset.parent=this._getParentOffset();for(var b=this.items.length-1;b>=0;b--){var c=this.items[b];if(!(c.instance!=this.currentContainer&&this.currentContainer&&c.item[0]!=this.currentItem[0])){var e=this.options.toleranceElement?d(this.options.toleranceElement,c.item):c.item;if(!a){c.width=e.outerWidth();c.height=e.outerHeight()}e=e.offset();c.left=e.left;c.top=e.top}}if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(b=
this.containers.length-1;b>=0;b--){e=this.containers[b].element.offset();this.containers[b].containerCache.left=e.left;this.containers[b].containerCache.top=e.top;this.containers[b].containerCache.width=this.containers[b].element.outerWidth();this.containers[b].containerCache.height=this.containers[b].element.outerHeight()}return this},_createPlaceholder:function(a){var b=a||this,c=b.options;if(!c.placeholder||c.placeholder.constructor==String){var e=c.placeholder;c.placeholder={element:function(){var f=
d(document.createElement(b.currentItem[0].nodeName)).addClass(e||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!e)f.style.visibility="hidden";return f},update:function(f,g){if(!(e&&!c.forcePlaceholderSize)){g.height()||g.height(b.currentItem.innerHeight()-parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10));g.width()||g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||
0,10))}}}}b.placeholder=d(c.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);c.placeholder.update(b,b.placeholder)},_contactContainers:function(a){for(var b=null,c=null,e=this.containers.length-1;e>=0;e--)if(!d.ui.contains(this.currentItem[0],this.containers[e].element[0]))if(this._intersectsWith(this.containers[e].containerCache)){if(!(b&&d.ui.contains(this.containers[e].element[0],b.element[0]))){b=this.containers[e];c=e}}else if(this.containers[e].containerCache.over){this.containers[e]._trigger("out",
a,this._uiHash(this));this.containers[e].containerCache.over=0}if(b)if(this.containers.length===1){this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}else if(this.currentContainer!=this.containers[c]){b=1E4;e=null;for(var f=this.positionAbs[this.containers[c].floating?"left":"top"],g=this.items.length-1;g>=0;g--)if(d.ui.contains(this.containers[c].element[0],this.items[g].item[0])){var h=this.items[g][this.containers[c].floating?"left":"top"];if(Math.abs(h-
f)<b){b=Math.abs(h-f);e=this.items[g]}}if(e||this.options.dropOnEmpty){this.currentContainer=this.containers[c];e?this._rearrange(a,e,null,true):this._rearrange(a,null,this.containers[c].element,true);this._trigger("change",a,this._uiHash());this.containers[c]._trigger("change",a,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}}},_createHelper:function(a){var b=
this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a,this.currentItem])):b.helper=="clone"?this.currentItem.clone():this.currentItem;a.parents("body").length||d(b.appendTo!="parent"?b.appendTo:this.currentItem[0].parentNode)[0].appendChild(a[0]);if(a[0]==this.currentItem[0])this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")};if(a[0].style.width==
""||b.forceHelperSize)a.width(this.currentItem.width());if(a[0].style.height==""||b.forceHelperSize)a.height(this.currentItem.height());return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=
this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a=
{top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.currentItem.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),
10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?
document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)){var b=d(a.containment)[0];a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),
10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(a,b){if(!b)b=
this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);return{top:b.top+this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&
this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0]))this.offset.relative=this._getRelativeOffset();
var f=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])f=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>this.containment[2])f=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-
this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;f=this.originalPageX+Math.round((f-this.originalPageX)/b.grid[0])*b.grid[0];f=this.containment?!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:!(f-this.offset.click.left<this.containment[0])?f-b.grid[0]:f+b.grid[0]:f}}return{top:g-
this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())}},_rearrange:function(a,b,c,e){c?c[0].appendChild(this.placeholder[0]):b.item[0].parentNode.insertBefore(this.placeholder[0],
this.direction=="down"?b.item[0]:b.item[0].nextSibling);this.counter=this.counter?++this.counter:1;var f=this,g=this.counter;window.setTimeout(function(){g==f.counter&&f.refreshPositions(!e)},0)},_clear:function(a,b){this.reverting=false;var c=[];!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem);this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var e in this._storedCSS)if(this._storedCSS[e]=="auto"||this._storedCSS[e]=="static")this._storedCSS[e]=
"";this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();this.fromOutside&&!b&&c.push(function(f){this._trigger("receive",f,this._uiHash(this.fromOutside))});if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!=this.currentItem.parent()[0])&&!b)c.push(function(f){this._trigger("update",f,this._uiHash())});if(!d.ui.contains(this.element[0],this.currentItem[0])){b||c.push(function(f){this._trigger("remove",
f,this._uiHash())});for(e=this.containers.length-1;e>=0;e--)if(d.ui.contains(this.containers[e].element[0],this.currentItem[0])&&!b){c.push(function(f){return function(g){f._trigger("receive",g,this._uiHash(this))}}.call(this,this.containers[e]));c.push(function(f){return function(g){f._trigger("update",g,this._uiHash(this))}}.call(this,this.containers[e]))}}for(e=this.containers.length-1;e>=0;e--){b||c.push(function(f){return function(g){f._trigger("deactivate",g,this._uiHash(this))}}.call(this,
this.containers[e]));if(this.containers[e].containerCache.over){c.push(function(f){return function(g){f._trigger("out",g,this._uiHash(this))}}.call(this,this.containers[e]));this.containers[e].containerCache.over=0}}this._storedCursor&&d("body").css("cursor",this._storedCursor);this._storedOpacity&&this.helper.css("opacity",this._storedOpacity);if(this._storedZIndex)this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex);this.dragging=false;if(this.cancelHelperRemoval){if(!b){this._trigger("beforeStop",
a,this._uiHash());for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}return false}b||this._trigger("beforeStop",a,this._uiHash());this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.helper[0]!=this.currentItem[0]&&this.helper.remove();this.helper=null;if(!b){for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){d.Widget.prototype._trigger.apply(this,arguments)===false&&this.cancel()},
_uiHash:function(a){var b=a||this;return{helper:b.helper,placeholder:b.placeholder||d([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:a?a.element:null}}});d.extend(d.ui.sortable,{version:"1.8.14"})})(jQuery);
;/*
 * jQuery UI Accordion 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 */
(function(c){c.widget("ui.accordion",{options:{active:0,animated:"slide",autoHeight:true,clearStyle:false,collapsible:false,event:"click",fillSpace:false,header:"> li > :first-child,> :not(li):even",icons:{header:"ui-icon-triangle-1-e",headerSelected:"ui-icon-triangle-1-s"},navigation:false,navigationFilter:function(){return this.href.toLowerCase()===location.href.toLowerCase()}},_create:function(){var a=this,b=a.options;a.running=0;a.element.addClass("ui-accordion ui-widget ui-helper-reset").children("li").addClass("ui-accordion-li-fix");
a.headers=a.element.find(b.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion",function(){b.disabled||c(this).addClass("ui-state-hover")}).bind("mouseleave.accordion",function(){b.disabled||c(this).removeClass("ui-state-hover")}).bind("focus.accordion",function(){b.disabled||c(this).addClass("ui-state-focus")}).bind("blur.accordion",function(){b.disabled||c(this).removeClass("ui-state-focus")});a.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");
if(b.navigation){var d=a.element.find("a").filter(b.navigationFilter).eq(0);if(d.length){var h=d.closest(".ui-accordion-header");a.active=h.length?h:d.closest(".ui-accordion-content").prev()}}a.active=a._findActive(a.active||b.active).addClass("ui-state-default ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");a.active.next().addClass("ui-accordion-content-active");a._createIcons();a.resize();a.element.attr("role","tablist");a.headers.attr("role","tab").bind("keydown.accordion",
function(f){return a._keydown(f)}).next().attr("role","tabpanel");a.headers.not(a.active||"").attr({"aria-expanded":"false","aria-selected":"false",tabIndex:-1}).next().hide();a.active.length?a.active.attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}):a.headers.eq(0).attr("tabIndex",0);c.browser.safari||a.headers.find("a").attr("tabIndex",-1);b.event&&a.headers.bind(b.event.split(" ").join(".accordion ")+".accordion",function(f){a._clickHandler.call(a,f,this);f.preventDefault()})},_createIcons:function(){var a=
this.options;if(a.icons){c("<span></span>").addClass("ui-icon "+a.icons.header).prependTo(this.headers);this.active.children(".ui-icon").toggleClass(a.icons.header).toggleClass(a.icons.headerSelected);this.element.addClass("ui-accordion-icons")}},_destroyIcons:function(){this.headers.children(".ui-icon").remove();this.element.removeClass("ui-accordion-icons")},destroy:function(){var a=this.options;this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role");this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-accordion-disabled ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected").removeAttr("tabIndex");
this.headers.find("a").removeAttr("tabIndex");this._destroyIcons();var b=this.headers.next().css("display","").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-accordion-disabled ui-state-disabled");if(a.autoHeight||a.fillHeight)b.css("height","");return c.Widget.prototype.destroy.call(this)},_setOption:function(a,b){c.Widget.prototype._setOption.apply(this,arguments);a=="active"&&this.activate(b);if(a=="icons"){this._destroyIcons();
b&&this._createIcons()}if(a=="disabled")this.headers.add(this.headers.next())[b?"addClass":"removeClass"]("ui-accordion-disabled ui-state-disabled")},_keydown:function(a){if(!(this.options.disabled||a.altKey||a.ctrlKey)){var b=c.ui.keyCode,d=this.headers.length,h=this.headers.index(a.target),f=false;switch(a.keyCode){case b.RIGHT:case b.DOWN:f=this.headers[(h+1)%d];break;case b.LEFT:case b.UP:f=this.headers[(h-1+d)%d];break;case b.SPACE:case b.ENTER:this._clickHandler({target:a.target},a.target);
a.preventDefault()}if(f){c(a.target).attr("tabIndex",-1);c(f).attr("tabIndex",0);f.focus();return false}return true}},resize:function(){var a=this.options,b;if(a.fillSpace){if(c.browser.msie){var d=this.element.parent().css("overflow");this.element.parent().css("overflow","hidden")}b=this.element.parent().height();c.browser.msie&&this.element.parent().css("overflow",d);this.headers.each(function(){b-=c(this).outerHeight(true)});this.headers.next().each(function(){c(this).height(Math.max(0,b-c(this).innerHeight()+
c(this).height()))}).css("overflow","auto")}else if(a.autoHeight){b=0;this.headers.next().each(function(){b=Math.max(b,c(this).height("").height())}).height(b)}return this},activate:function(a){this.options.active=a;a=this._findActive(a)[0];this._clickHandler({target:a},a);return this},_findActive:function(a){return a?typeof a==="number"?this.headers.filter(":eq("+a+")"):this.headers.not(this.headers.not(a)):a===false?c([]):this.headers.filter(":eq(0)")},_clickHandler:function(a,b){var d=this.options;
if(!d.disabled)if(a.target){a=c(a.currentTarget||b);b=a[0]===this.active[0];d.active=d.collapsible&&b?false:this.headers.index(a);if(!(this.running||!d.collapsible&&b)){var h=this.active;j=a.next();g=this.active.next();e={options:d,newHeader:b&&d.collapsible?c([]):a,oldHeader:this.active,newContent:b&&d.collapsible?c([]):j,oldContent:g};var f=this.headers.index(this.active[0])>this.headers.index(a[0]);this.active=b?c([]):a;this._toggle(j,g,e,b,f);h.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);
if(!b){a.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").children(".ui-icon").removeClass(d.icons.header).addClass(d.icons.headerSelected);a.next().addClass("ui-accordion-content-active")}}}else if(d.collapsible){this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);this.active.next().addClass("ui-accordion-content-active");var g=this.active.next(),
e={options:d,newHeader:c([]),oldHeader:d.active,newContent:c([]),oldContent:g},j=this.active=c([]);this._toggle(j,g,e)}},_toggle:function(a,b,d,h,f){var g=this,e=g.options;g.toShow=a;g.toHide=b;g.data=d;var j=function(){if(g)return g._completed.apply(g,arguments)};g._trigger("changestart",null,g.data);g.running=b.size()===0?a.size():b.size();if(e.animated){d={};d=e.collapsible&&h?{toShow:c([]),toHide:b,complete:j,down:f,autoHeight:e.autoHeight||e.fillSpace}:{toShow:a,toHide:b,complete:j,down:f,autoHeight:e.autoHeight||
e.fillSpace};if(!e.proxied)e.proxied=e.animated;if(!e.proxiedDuration)e.proxiedDuration=e.duration;e.animated=c.isFunction(e.proxied)?e.proxied(d):e.proxied;e.duration=c.isFunction(e.proxiedDuration)?e.proxiedDuration(d):e.proxiedDuration;h=c.ui.accordion.animations;var i=e.duration,k=e.animated;if(k&&!h[k]&&!c.easing[k])k="slide";h[k]||(h[k]=function(l){this.slide(l,{easing:k,duration:i||700})});h[k](d)}else{if(e.collapsible&&h)a.toggle();else{b.hide();a.show()}j(true)}b.prev().attr({"aria-expanded":"false",
"aria-selected":"false",tabIndex:-1}).blur();a.prev().attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}).focus()},_completed:function(a){this.running=a?0:--this.running;if(!this.running){this.options.clearStyle&&this.toShow.add(this.toHide).css({height:"",overflow:""});this.toHide.removeClass("ui-accordion-content-active");if(this.toHide.length)this.toHide.parent()[0].className=this.toHide.parent()[0].className;this._trigger("change",null,this.data)}}});c.extend(c.ui.accordion,{version:"1.8.14",
animations:{slide:function(a,b){a=c.extend({easing:"swing",duration:300},a,b);if(a.toHide.size())if(a.toShow.size()){var d=a.toShow.css("overflow"),h=0,f={},g={},e;b=a.toShow;e=b[0].style.width;b.width(parseInt(b.parent().width(),10)-parseInt(b.css("paddingLeft"),10)-parseInt(b.css("paddingRight"),10)-(parseInt(b.css("borderLeftWidth"),10)||0)-(parseInt(b.css("borderRightWidth"),10)||0));c.each(["height","paddingTop","paddingBottom"],function(j,i){g[i]="hide";j=(""+c.css(a.toShow[0],i)).match(/^([\d+-.]+)(.*)$/);
f[i]={value:j[1],unit:j[2]||"px"}});a.toShow.css({height:0,overflow:"hidden"}).show();a.toHide.filter(":hidden").each(a.complete).end().filter(":visible").animate(g,{step:function(j,i){if(i.prop=="height")h=i.end-i.start===0?0:(i.now-i.start)/(i.end-i.start);a.toShow[0].style[i.prop]=h*f[i.prop].value+f[i.prop].unit},duration:a.duration,easing:a.easing,complete:function(){a.autoHeight||a.toShow.css("height","");a.toShow.css({width:e,overflow:d});a.complete()}})}else a.toHide.animate({height:"hide",
paddingTop:"hide",paddingBottom:"hide"},a);else a.toShow.animate({height:"show",paddingTop:"show",paddingBottom:"show"},a)},bounceslide:function(a){this.slide(a,{easing:a.down?"easeOutBounce":"swing",duration:a.down?1E3:200})}}})})(jQuery);
;/*
 * jQuery UI Autocomplete 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 *  jquery.ui.position.js
 */
(function(d){var e=0;d.widget("ui.autocomplete",{options:{appendTo:"body",autoFocus:false,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null},pending:0,_create:function(){var a=this,b=this.element[0].ownerDocument,g;this.element.addClass("ui-autocomplete-input").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(c){if(!(a.options.disabled||a.element.attr("readonly"))){g=
false;var f=d.ui.keyCode;switch(c.keyCode){case f.PAGE_UP:a._move("previousPage",c);break;case f.PAGE_DOWN:a._move("nextPage",c);break;case f.UP:a._move("previous",c);c.preventDefault();break;case f.DOWN:a._move("next",c);c.preventDefault();break;case f.ENTER:case f.NUMPAD_ENTER:if(a.menu.active){g=true;c.preventDefault()}case f.TAB:if(!a.menu.active)return;a.menu.select(c);break;case f.ESCAPE:a.element.val(a.term);a.close(c);break;default:clearTimeout(a.searching);a.searching=setTimeout(function(){if(a.term!=
a.element.val()){a.selectedItem=null;a.search(null,c)}},a.options.delay);break}}}).bind("keypress.autocomplete",function(c){if(g){g=false;c.preventDefault()}}).bind("focus.autocomplete",function(){if(!a.options.disabled){a.selectedItem=null;a.previous=a.element.val()}}).bind("blur.autocomplete",function(c){if(!a.options.disabled){clearTimeout(a.searching);a.closing=setTimeout(function(){a.close(c);a._change(c)},150)}});this._initSource();this.response=function(){return a._response.apply(a,arguments)};
this.menu=d("<ul></ul>").addClass("ui-autocomplete").appendTo(d(this.options.appendTo||"body",b)[0]).mousedown(function(c){var f=a.menu.element[0];d(c.target).closest(".ui-menu-item").length||setTimeout(function(){d(document).one("mousedown",function(h){h.target!==a.element[0]&&h.target!==f&&!d.ui.contains(f,h.target)&&a.close()})},1);setTimeout(function(){clearTimeout(a.closing)},13)}).menu({focus:function(c,f){f=f.item.data("item.autocomplete");false!==a._trigger("focus",c,{item:f})&&/^key/.test(c.originalEvent.type)&&
a.element.val(f.value)},selected:function(c,f){var h=f.item.data("item.autocomplete"),i=a.previous;if(a.element[0]!==b.activeElement){a.element.focus();a.previous=i;setTimeout(function(){a.previous=i;a.selectedItem=h},1)}false!==a._trigger("select",c,{item:h})&&a.element.val(h.value);a.term=a.element.val();a.close(c);a.selectedItem=h},blur:function(){a.menu.element.is(":visible")&&a.element.val()!==a.term&&a.element.val(a.term)}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).hide().data("menu");
d.fn.bgiframe&&this.menu.element.bgiframe()},destroy:function(){this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");this.menu.element.remove();d.Widget.prototype.destroy.call(this)},_setOption:function(a,b){d.Widget.prototype._setOption.apply(this,arguments);a==="source"&&this._initSource();if(a==="appendTo")this.menu.element.appendTo(d(b||"body",this.element[0].ownerDocument)[0]);a==="disabled"&&
b&&this.xhr&&this.xhr.abort()},_initSource:function(){var a=this,b,g;if(d.isArray(this.options.source)){b=this.options.source;this.source=function(c,f){f(d.ui.autocomplete.filter(b,c.term))}}else if(typeof this.options.source==="string"){g=this.options.source;this.source=function(c,f){a.xhr&&a.xhr.abort();a.xhr=d.ajax({url:g,data:c,dataType:"json",autocompleteRequest:++e,success:function(h){this.autocompleteRequest===e&&f(h)},error:function(){this.autocompleteRequest===e&&f([])}})}}else this.source=
this.options.source},search:function(a,b){a=a!=null?a:this.element.val();this.term=this.element.val();if(a.length<this.options.minLength)return this.close(b);clearTimeout(this.closing);if(this._trigger("search",b)!==false)return this._search(a)},_search:function(a){this.pending++;this.element.addClass("ui-autocomplete-loading");this.source({term:a},this.response)},_response:function(a){if(!this.options.disabled&&a&&a.length){a=this._normalize(a);this._suggest(a);this._trigger("open")}else this.close();
this.pending--;this.pending||this.element.removeClass("ui-autocomplete-loading")},close:function(a){clearTimeout(this.closing);if(this.menu.element.is(":visible")){this.menu.element.hide();this.menu.deactivate();this._trigger("close",a)}},_change:function(a){this.previous!==this.element.val()&&this._trigger("change",a,{item:this.selectedItem})},_normalize:function(a){if(a.length&&a[0].label&&a[0].value)return a;return d.map(a,function(b){if(typeof b==="string")return{label:b,value:b};return d.extend({label:b.label||
b.value,value:b.value||b.label},b)})},_suggest:function(a){var b=this.menu.element.empty().zIndex(this.element.zIndex()+1);this._renderMenu(b,a);this.menu.deactivate();this.menu.refresh();b.show();this._resizeMenu();b.position(d.extend({of:this.element},this.options.position));this.options.autoFocus&&this.menu.next(new d.Event("mouseover"))},_resizeMenu:function(){var a=this.menu.element;a.outerWidth(Math.max(a.width("").outerWidth(),this.element.outerWidth()))},_renderMenu:function(a,b){var g=this;
d.each(b,function(c,f){g._renderItem(a,f)})},_renderItem:function(a,b){return d("<li></li>").data("item.autocomplete",b).append(d("<a></a>").text(b.label)).appendTo(a)},_move:function(a,b){if(this.menu.element.is(":visible"))if(this.menu.first()&&/^previous/.test(a)||this.menu.last()&&/^next/.test(a)){this.element.val(this.term);this.menu.deactivate()}else this.menu[a](b);else this.search(null,b)},widget:function(){return this.menu.element}});d.extend(d.ui.autocomplete,{escapeRegex:function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,
"\\$&")},filter:function(a,b){var g=new RegExp(d.ui.autocomplete.escapeRegex(b),"i");return d.grep(a,function(c){return g.test(c.label||c.value||c)})}})})(jQuery);
(function(d){d.widget("ui.menu",{_create:function(){var e=this;this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"listbox","aria-activedescendant":"ui-active-menuitem"}).click(function(a){if(d(a.target).closest(".ui-menu-item a").length){a.preventDefault();e.select(a)}});this.refresh()},refresh:function(){var e=this;this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","menuitem").children("a").addClass("ui-corner-all").attr("tabindex",
-1).mouseenter(function(a){e.activate(a,d(this).parent())}).mouseleave(function(){e.deactivate()})},activate:function(e,a){this.deactivate();if(this.hasScroll()){var b=a.offset().top-this.element.offset().top,g=this.element.scrollTop(),c=this.element.height();if(b<0)this.element.scrollTop(g+b);else b>=c&&this.element.scrollTop(g+b-c+a.height())}this.active=a.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();this._trigger("focus",e,{item:a})},deactivate:function(){if(this.active){this.active.children("a").removeClass("ui-state-hover").removeAttr("id");
this._trigger("blur");this.active=null}},next:function(e){this.move("next",".ui-menu-item:first",e)},previous:function(e){this.move("prev",".ui-menu-item:last",e)},first:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},last:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},move:function(e,a,b){if(this.active){e=this.active[e+"All"](".ui-menu-item").eq(0);e.length?this.activate(b,e):this.activate(b,this.element.children(a))}else this.activate(b,
this.element.children(a))},nextPage:function(e){if(this.hasScroll())if(!this.active||this.last())this.activate(e,this.element.children(".ui-menu-item:first"));else{var a=this.active.offset().top,b=this.element.height(),g=this.element.children(".ui-menu-item").filter(function(){var c=d(this).offset().top-a-b+d(this).height();return c<10&&c>-10});g.length||(g=this.element.children(".ui-menu-item:last"));this.activate(e,g)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||
this.last()?":first":":last"))},previousPage:function(e){if(this.hasScroll())if(!this.active||this.first())this.activate(e,this.element.children(".ui-menu-item:last"));else{var a=this.active.offset().top,b=this.element.height();result=this.element.children(".ui-menu-item").filter(function(){var g=d(this).offset().top-a+b-d(this).height();return g<10&&g>-10});result.length||(result=this.element.children(".ui-menu-item:first"));this.activate(e,result)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||
this.first()?":last":":first"))},hasScroll:function(){return this.element.height()<this.element[d.fn.prop?"prop":"attr"]("scrollHeight")},select:function(e){this._trigger("selected",e,{item:this.active})}})})(jQuery);
;/*
 * jQuery UI Button 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Button
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 */
(function(b){var h,i,j,g,l=function(){var a=b(this).find(":ui-button");setTimeout(function(){a.button("refresh")},1)},k=function(a){var c=a.name,e=a.form,f=b([]);if(c)f=e?b(e).find("[name='"+c+"']"):b("[name='"+c+"']",a.ownerDocument).filter(function(){return!this.form});return f};b.widget("ui.button",{options:{disabled:null,text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",l);if(typeof this.options.disabled!==
"boolean")this.options.disabled=this.element.attr("disabled");this._determineButtonType();this.hasTitle=!!this.buttonElement.attr("title");var a=this,c=this.options,e=this.type==="checkbox"||this.type==="radio",f="ui-state-hover"+(!e?" ui-state-active":"");if(c.label===null)c.label=this.buttonElement.html();if(this.element.is(":disabled"))c.disabled=true;this.buttonElement.addClass("ui-button ui-widget ui-state-default ui-corner-all").attr("role","button").bind("mouseenter.button",function(){if(!c.disabled){b(this).addClass("ui-state-hover");
this===h&&b(this).addClass("ui-state-active")}}).bind("mouseleave.button",function(){c.disabled||b(this).removeClass(f)}).bind("click.button",function(d){if(c.disabled){d.preventDefault();d.stopImmediatePropagation()}});this.element.bind("focus.button",function(){a.buttonElement.addClass("ui-state-focus")}).bind("blur.button",function(){a.buttonElement.removeClass("ui-state-focus")});if(e){this.element.bind("change.button",function(){g||a.refresh()});this.buttonElement.bind("mousedown.button",function(d){if(!c.disabled){g=
false;i=d.pageX;j=d.pageY}}).bind("mouseup.button",function(d){if(!c.disabled)if(i!==d.pageX||j!==d.pageY)g=true})}if(this.type==="checkbox")this.buttonElement.bind("click.button",function(){if(c.disabled||g)return false;b(this).toggleClass("ui-state-active");a.buttonElement.attr("aria-pressed",a.element[0].checked)});else if(this.type==="radio")this.buttonElement.bind("click.button",function(){if(c.disabled||g)return false;b(this).addClass("ui-state-active");a.buttonElement.attr("aria-pressed",true);
var d=a.element[0];k(d).not(d).map(function(){return b(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed",false)});else{this.buttonElement.bind("mousedown.button",function(){if(c.disabled)return false;b(this).addClass("ui-state-active");h=this;b(document).one("mouseup",function(){h=null})}).bind("mouseup.button",function(){if(c.disabled)return false;b(this).removeClass("ui-state-active")}).bind("keydown.button",function(d){if(c.disabled)return false;if(d.keyCode==b.ui.keyCode.SPACE||
d.keyCode==b.ui.keyCode.ENTER)b(this).addClass("ui-state-active")}).bind("keyup.button",function(){b(this).removeClass("ui-state-active")});this.buttonElement.is("a")&&this.buttonElement.keyup(function(d){d.keyCode===b.ui.keyCode.SPACE&&b(this).click()})}this._setOption("disabled",c.disabled);this._resetButton()},_determineButtonType:function(){this.type=this.element.is(":checkbox")?"checkbox":this.element.is(":radio")?"radio":this.element.is("input")?"input":"button";if(this.type==="checkbox"||this.type===
"radio"){var a=this.element.parents().filter(":last"),c="label[for="+this.element.attr("id")+"]";this.buttonElement=a.find(c);if(!this.buttonElement.length){a=a.length?a.siblings():this.element.siblings();this.buttonElement=a.filter(c);if(!this.buttonElement.length)this.buttonElement=a.find(c)}this.element.addClass("ui-helper-hidden-accessible");(a=this.element.is(":checked"))&&this.buttonElement.addClass("ui-state-active");this.buttonElement.attr("aria-pressed",a)}else this.buttonElement=this.element},
widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible");this.buttonElement.removeClass("ui-button ui-widget ui-state-default ui-corner-all ui-state-hover ui-state-active  ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only").removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());this.hasTitle||this.buttonElement.removeAttr("title");
b.Widget.prototype.destroy.call(this)},_setOption:function(a,c){b.Widget.prototype._setOption.apply(this,arguments);if(a==="disabled")c?this.element.attr("disabled",true):this.element.removeAttr("disabled");else this._resetButton()},refresh:function(){var a=this.element.is(":disabled");a!==this.options.disabled&&this._setOption("disabled",a);if(this.type==="radio")k(this.element[0]).each(function(){b(this).is(":checked")?b(this).button("widget").addClass("ui-state-active").attr("aria-pressed",true):
b(this).button("widget").removeClass("ui-state-active").attr("aria-pressed",false)});else if(this.type==="checkbox")this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed",true):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed",false)},_resetButton:function(){if(this.type==="input")this.options.label&&this.element.val(this.options.label);else{var a=this.buttonElement.removeClass("ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only"),
c=b("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(a.empty()).text(),e=this.options.icons,f=e.primary&&e.secondary,d=[];if(e.primary||e.secondary){if(this.options.text)d.push("ui-button-text-icon"+(f?"s":e.primary?"-primary":"-secondary"));e.primary&&a.prepend("<span class='ui-button-icon-primary ui-icon "+e.primary+"'></span>");e.secondary&&a.append("<span class='ui-button-icon-secondary ui-icon "+e.secondary+"'></span>");if(!this.options.text){d.push(f?"ui-button-icons-only":
"ui-button-icon-only");this.hasTitle||a.attr("title",c)}}else d.push("ui-button-text-only");a.addClass(d.join(" "))}}});b.widget("ui.buttonset",{options:{items:":button, :submit, :reset, :checkbox, :radio, a, :data(button)"},_create:function(){this.element.addClass("ui-buttonset")},_init:function(){this.refresh()},_setOption:function(a,c){a==="disabled"&&this.buttons.button("option",a,c);b.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){var a=this.element.css("direction")===
"ltr";this.buttons=this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return b(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(a?"ui-corner-left":"ui-corner-right").end().filter(":last").addClass(a?"ui-corner-right":"ui-corner-left").end().end()},destroy:function(){this.element.removeClass("ui-buttonset");this.buttons.map(function(){return b(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");
b.Widget.prototype.destroy.call(this)}})})(jQuery);
;/*
 * jQuery UI Dialog 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 *  jquery.ui.button.js
 *  jquery.ui.draggable.js
 *  jquery.ui.mouse.js
 *  jquery.ui.position.js
 *  jquery.ui.resizable.js
 */
(function(c,l){var m={buttons:true,height:true,maxHeight:true,maxWidth:true,minHeight:true,minWidth:true,width:true},n={maxHeight:true,maxWidth:true,minHeight:true,minWidth:true},o=c.attrFn||{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true,click:true};c.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,
position:{my:"center",at:"center",collision:"fit",using:function(a){var b=c(this).css(a).offset().top;b<0&&c(this).css("top",a.top-b)}},resizable:true,show:null,stack:true,title:"",width:300,zIndex:1E3},_create:function(){this.originalTitle=this.element.attr("title");if(typeof this.originalTitle!=="string")this.originalTitle="";this.options.title=this.options.title||this.originalTitle;var a=this,b=a.options,d=b.title||"&#160;",e=c.ui.dialog.getTitleId(a.element),g=(a.uiDialog=c("<div></div>")).appendTo(document.body).hide().addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+
b.dialogClass).css({zIndex:b.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(i){if(b.closeOnEscape&&i.keyCode&&i.keyCode===c.ui.keyCode.ESCAPE){a.close(i);i.preventDefault()}}).attr({role:"dialog","aria-labelledby":e}).mousedown(function(i){a.moveToTop(false,i)});a.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g);var f=(a.uiDialogTitlebar=c("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),
h=c('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")},function(){h.removeClass("ui-state-hover")}).focus(function(){h.addClass("ui-state-focus")}).blur(function(){h.removeClass("ui-state-focus")}).click(function(i){a.close(i);return false}).appendTo(f);(a.uiDialogTitlebarCloseText=c("<span></span>")).addClass("ui-icon ui-icon-closethick").text(b.closeText).appendTo(h);c("<span></span>").addClass("ui-dialog-title").attr("id",
e).html(d).prependTo(f);if(c.isFunction(b.beforeclose)&&!c.isFunction(b.beforeClose))b.beforeClose=b.beforeclose;f.find("*").add(f).disableSelection();b.draggable&&c.fn.draggable&&a._makeDraggable();b.resizable&&c.fn.resizable&&a._makeResizable();a._createButtons(b.buttons);a._isOpen=false;c.fn.bgiframe&&g.bgiframe()},_init:function(){this.options.autoOpen&&this.open()},destroy:function(){var a=this;a.overlay&&a.overlay.destroy();a.uiDialog.hide();a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");
a.uiDialog.remove();a.originalTitle&&a.element.attr("title",a.originalTitle);return a},widget:function(){return this.uiDialog},close:function(a){var b=this,d,e;if(false!==b._trigger("beforeClose",a)){b.overlay&&b.overlay.destroy();b.uiDialog.unbind("keypress.ui-dialog");b._isOpen=false;if(b.options.hide)b.uiDialog.hide(b.options.hide,function(){b._trigger("close",a)});else{b.uiDialog.hide();b._trigger("close",a)}c.ui.dialog.overlay.resize();if(b.options.modal){d=0;c(".ui-dialog").each(function(){if(this!==
b.uiDialog[0]){e=c(this).css("z-index");isNaN(e)||(d=Math.max(d,e))}});c.ui.dialog.maxZ=d}return b}},isOpen:function(){return this._isOpen},moveToTop:function(a,b){var d=this,e=d.options;if(e.modal&&!a||!e.stack&&!e.modal)return d._trigger("focus",b);if(e.zIndex>c.ui.dialog.maxZ)c.ui.dialog.maxZ=e.zIndex;if(d.overlay){c.ui.dialog.maxZ+=1;d.overlay.$el.css("z-index",c.ui.dialog.overlay.maxZ=c.ui.dialog.maxZ)}a={scrollTop:d.element.attr("scrollTop"),scrollLeft:d.element.attr("scrollLeft")};c.ui.dialog.maxZ+=
1;d.uiDialog.css("z-index",c.ui.dialog.maxZ);d.element.attr(a);d._trigger("focus",b);return d},open:function(){if(!this._isOpen){var a=this,b=a.options,d=a.uiDialog;a.overlay=b.modal?new c.ui.dialog.overlay(a):null;a._size();a._position(b.position);d.show(b.show);a.moveToTop(true);b.modal&&d.bind("keypress.ui-dialog",function(e){if(e.keyCode===c.ui.keyCode.TAB){var g=c(":tabbable",this),f=g.filter(":first");g=g.filter(":last");if(e.target===g[0]&&!e.shiftKey){f.focus(1);return false}else if(e.target===
f[0]&&e.shiftKey){g.focus(1);return false}}});c(a.element.find(":tabbable").get().concat(d.find(".ui-dialog-buttonpane :tabbable").get().concat(d.get()))).eq(0).focus();a._isOpen=true;a._trigger("open");return a}},_createButtons:function(a){var b=this,d=false,e=c("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),g=c("<div></div>").addClass("ui-dialog-buttonset").appendTo(e);b.uiDialog.find(".ui-dialog-buttonpane").remove();typeof a==="object"&&a!==null&&c.each(a,
function(){return!(d=true)});if(d){c.each(a,function(f,h){h=c.isFunction(h)?{click:h,text:f}:h;var i=c('<button type="button"></button>').click(function(){h.click.apply(b.element[0],arguments)}).appendTo(g);c.each(h,function(j,k){if(j!=="click")j in o?i[j](k):i.attr(j,k)});c.fn.button&&i.button()});e.appendTo(b.uiDialog)}},_makeDraggable:function(){function a(f){return{position:f.position,offset:f.offset}}var b=this,d=b.options,e=c(document),g;b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",
handle:".ui-dialog-titlebar",containment:"document",start:function(f,h){g=d.height==="auto"?"auto":c(this).height();c(this).height(c(this).height()).addClass("ui-dialog-dragging");b._trigger("dragStart",f,a(h))},drag:function(f,h){b._trigger("drag",f,a(h))},stop:function(f,h){d.position=[h.position.left-e.scrollLeft(),h.position.top-e.scrollTop()];c(this).removeClass("ui-dialog-dragging").height(g);b._trigger("dragStop",f,a(h));c.ui.dialog.overlay.resize()}})},_makeResizable:function(a){function b(f){return{originalPosition:f.originalPosition,
originalSize:f.originalSize,position:f.position,size:f.size}}a=a===l?this.options.resizable:a;var d=this,e=d.options,g=d.uiDialog.css("position");a=typeof a==="string"?a:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:a,start:function(f,h){c(this).addClass("ui-dialog-resizing");d._trigger("resizeStart",f,b(h))},resize:function(f,h){d._trigger("resize",
f,b(h))},stop:function(f,h){c(this).removeClass("ui-dialog-resizing");e.height=c(this).height();e.width=c(this).width();d._trigger("resizeStop",f,b(h));c.ui.dialog.overlay.resize()}}).css("position",g).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var a=this.options;return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)},_position:function(a){var b=[],d=[0,0],e;if(a){if(typeof a==="string"||typeof a==="object"&&"0"in a){b=a.split?a.split(" "):
[a[0],a[1]];if(b.length===1)b[1]=b[0];c.each(["left","top"],function(g,f){if(+b[g]===b[g]){d[g]=b[g];b[g]=f}});a={my:b.join(" "),at:b.join(" "),offset:d.join(" ")}}a=c.extend({},c.ui.dialog.prototype.options.position,a)}else a=c.ui.dialog.prototype.options.position;(e=this.uiDialog.is(":visible"))||this.uiDialog.show();this.uiDialog.css({top:0,left:0}).position(c.extend({of:window},a));e||this.uiDialog.hide()},_setOptions:function(a){var b=this,d={},e=false;c.each(a,function(g,f){b._setOption(g,f);
if(g in m)e=true;if(g in n)d[g]=f});e&&this._size();this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",d)},_setOption:function(a,b){var d=this,e=d.uiDialog;switch(a){case "beforeclose":a="beforeClose";break;case "buttons":d._createButtons(b);break;case "closeText":d.uiDialogTitlebarCloseText.text(""+b);break;case "dialogClass":e.removeClass(d.options.dialogClass).addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+b);break;case "disabled":b?e.addClass("ui-dialog-disabled"):
e.removeClass("ui-dialog-disabled");break;case "draggable":var g=e.is(":data(draggable)");g&&!b&&e.draggable("destroy");!g&&b&&d._makeDraggable();break;case "position":d._position(b);break;case "resizable":(g=e.is(":data(resizable)"))&&!b&&e.resizable("destroy");g&&typeof b==="string"&&e.resizable("option","handles",b);!g&&b!==false&&d._makeResizable(b);break;case "title":c(".ui-dialog-title",d.uiDialogTitlebar).html(""+(b||"&#160;"));break}c.Widget.prototype._setOption.apply(d,arguments)},_size:function(){var a=
this.options,b,d,e=this.uiDialog.is(":visible");this.element.show().css({width:"auto",minHeight:0,height:0});if(a.minWidth>a.width)a.width=a.minWidth;b=this.uiDialog.css({height:"auto",width:a.width}).height();d=Math.max(0,a.minHeight-b);if(a.height==="auto")if(c.support.minHeight)this.element.css({minHeight:d,height:"auto"});else{this.uiDialog.show();a=this.element.css("height","auto").height();e||this.uiDialog.hide();this.element.height(Math.max(a,d))}else this.element.height(Math.max(a.height-
b,0));this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())}});c.extend(c.ui.dialog,{version:"1.8.14",uuid:0,maxZ:0,getTitleId:function(a){a=a.attr("id");if(!a){this.uuid+=1;a=this.uuid}return"ui-dialog-title-"+a},overlay:function(a){this.$el=c.ui.dialog.overlay.create(a)}});c.extend(c.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:c.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"}).join(" "),
create:function(a){if(this.instances.length===0){setTimeout(function(){c.ui.dialog.overlay.instances.length&&c(document).bind(c.ui.dialog.overlay.events,function(d){if(c(d.target).zIndex()<c.ui.dialog.overlay.maxZ)return false})},1);c(document).bind("keydown.dialog-overlay",function(d){if(a.options.closeOnEscape&&d.keyCode&&d.keyCode===c.ui.keyCode.ESCAPE){a.close(d);d.preventDefault()}});c(window).bind("resize.dialog-overlay",c.ui.dialog.overlay.resize)}var b=(this.oldInstances.pop()||c("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),
height:this.height()});c.fn.bgiframe&&b.bgiframe();this.instances.push(b);return b},destroy:function(a){var b=c.inArray(a,this.instances);b!=-1&&this.oldInstances.push(this.instances.splice(b,1)[0]);this.instances.length===0&&c([document,window]).unbind(".dialog-overlay");a.remove();var d=0;c.each(this.instances,function(){d=Math.max(d,this.css("z-index"))});this.maxZ=d},height:function(){var a,b;if(c.browser.msie&&c.browser.version<7){a=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
b=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight);return a<b?c(window).height()+"px":a+"px"}else return c(document).height()+"px"},width:function(){var a,b;if(c.browser.msie){a=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);b=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);return a<b?c(window).width()+"px":a+"px"}else return c(document).width()+"px"},resize:function(){var a=c([]);c.each(c.ui.dialog.overlay.instances,function(){a=
a.add(this)});a.css({width:0,height:0}).css({width:c.ui.dialog.overlay.width(),height:c.ui.dialog.overlay.height()})}});c.extend(c.ui.dialog.overlay.prototype,{destroy:function(){c.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);
;/*
 * jQuery UI Slider 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.mouse.js
 *  jquery.ui.widget.js
 */
(function(d){d.widget("ui.slider",d.ui.mouse,{widgetEventPrefix:"slide",options:{animate:false,distance:0,max:100,min:0,orientation:"horizontal",range:false,step:1,value:0,values:null},_create:function(){var b=this,a=this.options,c=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),f=a.values&&a.values.length||1,e=[];this._mouseSliding=this._keySliding=false;this._animateOff=true;this._handleIndex=null;this._detectOrientation();this._mouseInit();this.element.addClass("ui-slider ui-slider-"+
this.orientation+" ui-widget ui-widget-content ui-corner-all"+(a.disabled?" ui-slider-disabled ui-disabled":""));this.range=d([]);if(a.range){if(a.range===true){if(!a.values)a.values=[this._valueMin(),this._valueMin()];if(a.values.length&&a.values.length!==2)a.values=[a.values[0],a.values[0]]}this.range=d("<div></div>").appendTo(this.element).addClass("ui-slider-range ui-widget-header"+(a.range==="min"||a.range==="max"?" ui-slider-range-"+a.range:""))}for(var j=c.length;j<f;j+=1)e.push("<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>");
this.handles=c.add(d(e.join("")).appendTo(b.element));this.handle=this.handles.eq(0);this.handles.add(this.range).filter("a").click(function(g){g.preventDefault()}).hover(function(){a.disabled||d(this).addClass("ui-state-hover")},function(){d(this).removeClass("ui-state-hover")}).focus(function(){if(a.disabled)d(this).blur();else{d(".ui-slider .ui-state-focus").removeClass("ui-state-focus");d(this).addClass("ui-state-focus")}}).blur(function(){d(this).removeClass("ui-state-focus")});this.handles.each(function(g){d(this).data("index.ui-slider-handle",
g)});this.handles.keydown(function(g){var k=true,l=d(this).data("index.ui-slider-handle"),i,h,m;if(!b.options.disabled){switch(g.keyCode){case d.ui.keyCode.HOME:case d.ui.keyCode.END:case d.ui.keyCode.PAGE_UP:case d.ui.keyCode.PAGE_DOWN:case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:k=false;if(!b._keySliding){b._keySliding=true;d(this).addClass("ui-state-active");i=b._start(g,l);if(i===false)return}break}m=b.options.step;i=b.options.values&&b.options.values.length?
(h=b.values(l)):(h=b.value());switch(g.keyCode){case d.ui.keyCode.HOME:h=b._valueMin();break;case d.ui.keyCode.END:h=b._valueMax();break;case d.ui.keyCode.PAGE_UP:h=b._trimAlignValue(i+(b._valueMax()-b._valueMin())/5);break;case d.ui.keyCode.PAGE_DOWN:h=b._trimAlignValue(i-(b._valueMax()-b._valueMin())/5);break;case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:if(i===b._valueMax())return;h=b._trimAlignValue(i+m);break;case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:if(i===b._valueMin())return;h=b._trimAlignValue(i-
m);break}b._slide(g,l,h);return k}}).keyup(function(g){var k=d(this).data("index.ui-slider-handle");if(b._keySliding){b._keySliding=false;b._stop(g,k);b._change(g,k);d(this).removeClass("ui-state-active")}});this._refreshValue();this._animateOff=false},destroy:function(){this.handles.remove();this.range.remove();this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");this._mouseDestroy();
return this},_mouseCapture:function(b){var a=this.options,c,f,e,j,g;if(a.disabled)return false;this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();c=this._normValueFromMouse({x:b.pageX,y:b.pageY});f=this._valueMax()-this._valueMin()+1;j=this;this.handles.each(function(k){var l=Math.abs(c-j.values(k));if(f>l){f=l;e=d(this);g=k}});if(a.range===true&&this.values(1)===a.min){g+=1;e=d(this.handles[g])}if(this._start(b,g)===false)return false;
this._mouseSliding=true;j._handleIndex=g;e.addClass("ui-state-active").focus();a=e.offset();this._clickOffset=!d(b.target).parents().andSelf().is(".ui-slider-handle")?{left:0,top:0}:{left:b.pageX-a.left-e.width()/2,top:b.pageY-a.top-e.height()/2-(parseInt(e.css("borderTopWidth"),10)||0)-(parseInt(e.css("borderBottomWidth"),10)||0)+(parseInt(e.css("marginTop"),10)||0)};this.handles.hasClass("ui-state-hover")||this._slide(b,g,c);return this._animateOff=true},_mouseStart:function(){return true},_mouseDrag:function(b){var a=
this._normValueFromMouse({x:b.pageX,y:b.pageY});this._slide(b,this._handleIndex,a);return false},_mouseStop:function(b){this.handles.removeClass("ui-state-active");this._mouseSliding=false;this._stop(b,this._handleIndex);this._change(b,this._handleIndex);this._clickOffset=this._handleIndex=null;return this._animateOff=false},_detectOrientation:function(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(b){var a;if(this.orientation==="horizontal"){a=
this.elementSize.width;b=b.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)}else{a=this.elementSize.height;b=b.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)}a=b/a;if(a>1)a=1;if(a<0)a=0;if(this.orientation==="vertical")a=1-a;b=this._valueMax()-this._valueMin();return this._trimAlignValue(this._valueMin()+a*b)},_start:function(b,a){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(a);
c.values=this.values()}return this._trigger("start",b,c)},_slide:function(b,a,c){var f;if(this.options.values&&this.options.values.length){f=this.values(a?0:1);if(this.options.values.length===2&&this.options.range===true&&(a===0&&c>f||a===1&&c<f))c=f;if(c!==this.values(a)){f=this.values();f[a]=c;b=this._trigger("slide",b,{handle:this.handles[a],value:c,values:f});this.values(a?0:1);b!==false&&this.values(a,c,true)}}else if(c!==this.value()){b=this._trigger("slide",b,{handle:this.handles[a],value:c});
b!==false&&this.value(c)}},_stop:function(b,a){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(a);c.values=this.values()}this._trigger("stop",b,c)},_change:function(b,a){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(a);c.values=this.values()}this._trigger("change",b,c)}},value:function(b){if(arguments.length){this.options.value=
this._trimAlignValue(b);this._refreshValue();this._change(null,0)}else return this._value()},values:function(b,a){var c,f,e;if(arguments.length>1){this.options.values[b]=this._trimAlignValue(a);this._refreshValue();this._change(null,b)}else if(arguments.length)if(d.isArray(arguments[0])){c=this.options.values;f=arguments[0];for(e=0;e<c.length;e+=1){c[e]=this._trimAlignValue(f[e]);this._change(null,e)}this._refreshValue()}else return this.options.values&&this.options.values.length?this._values(b):
this.value();else return this._values()},_setOption:function(b,a){var c,f=0;if(d.isArray(this.options.values))f=this.options.values.length;d.Widget.prototype._setOption.apply(this,arguments);switch(b){case "disabled":if(a){this.handles.filter(".ui-state-focus").blur();this.handles.removeClass("ui-state-hover");this.handles.attr("disabled","disabled");this.element.addClass("ui-disabled")}else{this.handles.removeAttr("disabled");this.element.removeClass("ui-disabled")}break;case "orientation":this._detectOrientation();
this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();break;case "value":this._animateOff=true;this._refreshValue();this._change(null,0);this._animateOff=false;break;case "values":this._animateOff=true;this._refreshValue();for(c=0;c<f;c+=1)this._change(null,c);this._animateOff=false;break}},_value:function(){var b=this.options.value;return b=this._trimAlignValue(b)},_values:function(b){var a,c;if(arguments.length){a=this.options.values[b];
return a=this._trimAlignValue(a)}else{a=this.options.values.slice();for(c=0;c<a.length;c+=1)a[c]=this._trimAlignValue(a[c]);return a}},_trimAlignValue:function(b){if(b<=this._valueMin())return this._valueMin();if(b>=this._valueMax())return this._valueMax();var a=this.options.step>0?this.options.step:1,c=(b-this._valueMin())%a;alignValue=b-c;if(Math.abs(c)*2>=a)alignValue+=c>0?a:-a;return parseFloat(alignValue.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},
_refreshValue:function(){var b=this.options.range,a=this.options,c=this,f=!this._animateOff?a.animate:false,e,j={},g,k,l,i;if(this.options.values&&this.options.values.length)this.handles.each(function(h){e=(c.values(h)-c._valueMin())/(c._valueMax()-c._valueMin())*100;j[c.orientation==="horizontal"?"left":"bottom"]=e+"%";d(this).stop(1,1)[f?"animate":"css"](j,a.animate);if(c.options.range===true)if(c.orientation==="horizontal"){if(h===0)c.range.stop(1,1)[f?"animate":"css"]({left:e+"%"},a.animate);
if(h===1)c.range[f?"animate":"css"]({width:e-g+"%"},{queue:false,duration:a.animate})}else{if(h===0)c.range.stop(1,1)[f?"animate":"css"]({bottom:e+"%"},a.animate);if(h===1)c.range[f?"animate":"css"]({height:e-g+"%"},{queue:false,duration:a.animate})}g=e});else{k=this.value();l=this._valueMin();i=this._valueMax();e=i!==l?(k-l)/(i-l)*100:0;j[c.orientation==="horizontal"?"left":"bottom"]=e+"%";this.handle.stop(1,1)[f?"animate":"css"](j,a.animate);if(b==="min"&&this.orientation==="horizontal")this.range.stop(1,
1)[f?"animate":"css"]({width:e+"%"},a.animate);if(b==="max"&&this.orientation==="horizontal")this.range[f?"animate":"css"]({width:100-e+"%"},{queue:false,duration:a.animate});if(b==="min"&&this.orientation==="vertical")this.range.stop(1,1)[f?"animate":"css"]({height:e+"%"},a.animate);if(b==="max"&&this.orientation==="vertical")this.range[f?"animate":"css"]({height:100-e+"%"},{queue:false,duration:a.animate})}}});d.extend(d.ui.slider,{version:"1.8.14"})})(jQuery);
;/*
 * jQuery UI Tabs 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 */
(function(d,p){function u(){return++v}function w(){return++x}var v=0,x=0;d.widget("ui.tabs",{options:{add:null,ajaxOptions:null,cache:false,cookie:null,collapsible:false,disable:null,disabled:[],enable:null,event:"click",fx:null,idPrefix:"ui-tabs-",load:null,panelTemplate:"<div></div>",remove:null,select:null,show:null,spinner:"<em>Loading&#8230;</em>",tabTemplate:"<li><a href='#{href}'><span>#{label}</span></a></li>"},_create:function(){this._tabify(true)},_setOption:function(b,e){if(b=="selected")this.options.collapsible&&
e==this.options.selected||this.select(e);else{this.options[b]=e;this._tabify()}},_tabId:function(b){return b.title&&b.title.replace(/\s/g,"_").replace(/[^\w\u00c0-\uFFFF-]/g,"")||this.options.idPrefix+u()},_sanitizeSelector:function(b){return b.replace(/:/g,"\\:")},_cookie:function(){var b=this.cookie||(this.cookie=this.options.cookie.name||"ui-tabs-"+w());return d.cookie.apply(null,[b].concat(d.makeArray(arguments)))},_ui:function(b,e){return{tab:b,panel:e,index:this.anchors.index(b)}},_cleanup:function(){this.lis.filter(".ui-state-processing").removeClass("ui-state-processing").find("span:data(label.tabs)").each(function(){var b=
d(this);b.html(b.data("label.tabs")).removeData("label.tabs")})},_tabify:function(b){function e(g,f){g.css("display","");!d.support.opacity&&f.opacity&&g[0].style.removeAttribute("filter")}var a=this,c=this.options,h=/^#.+/;this.list=this.element.find("ol,ul").eq(0);this.lis=d(" > li:has(a[href])",this.list);this.anchors=this.lis.map(function(){return d("a",this)[0]});this.panels=d([]);this.anchors.each(function(g,f){var i=d(f).attr("href"),l=i.split("#")[0],q;if(l&&(l===location.toString().split("#")[0]||
(q=d("base")[0])&&l===q.href)){i=f.hash;f.href=i}if(h.test(i))a.panels=a.panels.add(a.element.find(a._sanitizeSelector(i)));else if(i&&i!=="#"){d.data(f,"href.tabs",i);d.data(f,"load.tabs",i.replace(/#.*$/,""));i=a._tabId(f);f.href="#"+i;f=a.element.find("#"+i);if(!f.length){f=d(c.panelTemplate).attr("id",i).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").insertAfter(a.panels[g-1]||a.list);f.data("destroy.tabs",true)}a.panels=a.panels.add(f)}else c.disabled.push(g)});if(b){this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");
this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.lis.addClass("ui-state-default ui-corner-top");this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");if(c.selected===p){location.hash&&this.anchors.each(function(g,f){if(f.hash==location.hash){c.selected=g;return false}});if(typeof c.selected!=="number"&&c.cookie)c.selected=parseInt(a._cookie(),10);if(typeof c.selected!=="number"&&this.lis.filter(".ui-tabs-selected").length)c.selected=
this.lis.index(this.lis.filter(".ui-tabs-selected"));c.selected=c.selected||(this.lis.length?0:-1)}else if(c.selected===null)c.selected=-1;c.selected=c.selected>=0&&this.anchors[c.selected]||c.selected<0?c.selected:0;c.disabled=d.unique(c.disabled.concat(d.map(this.lis.filter(".ui-state-disabled"),function(g){return a.lis.index(g)}))).sort();d.inArray(c.selected,c.disabled)!=-1&&c.disabled.splice(d.inArray(c.selected,c.disabled),1);this.panels.addClass("ui-tabs-hide");this.lis.removeClass("ui-tabs-selected ui-state-active");
if(c.selected>=0&&this.anchors.length){a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash)).removeClass("ui-tabs-hide");this.lis.eq(c.selected).addClass("ui-tabs-selected ui-state-active");a.element.queue("tabs",function(){a._trigger("show",null,a._ui(a.anchors[c.selected],a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash))[0]))});this.load(c.selected)}d(window).bind("unload",function(){a.lis.add(a.anchors).unbind(".tabs");a.lis=a.anchors=a.panels=null})}else c.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"));
this.element[c.collapsible?"addClass":"removeClass"]("ui-tabs-collapsible");c.cookie&&this._cookie(c.selected,c.cookie);b=0;for(var j;j=this.lis[b];b++)d(j)[d.inArray(b,c.disabled)!=-1&&!d(j).hasClass("ui-tabs-selected")?"addClass":"removeClass"]("ui-state-disabled");c.cache===false&&this.anchors.removeData("cache.tabs");this.lis.add(this.anchors).unbind(".tabs");if(c.event!=="mouseover"){var k=function(g,f){f.is(":not(.ui-state-disabled)")&&f.addClass("ui-state-"+g)},n=function(g,f){f.removeClass("ui-state-"+
g)};this.lis.bind("mouseover.tabs",function(){k("hover",d(this))});this.lis.bind("mouseout.tabs",function(){n("hover",d(this))});this.anchors.bind("focus.tabs",function(){k("focus",d(this).closest("li"))});this.anchors.bind("blur.tabs",function(){n("focus",d(this).closest("li"))})}var m,o;if(c.fx)if(d.isArray(c.fx)){m=c.fx[0];o=c.fx[1]}else m=o=c.fx;var r=o?function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.hide().removeClass("ui-tabs-hide").animate(o,o.duration||"normal",
function(){e(f,o);a._trigger("show",null,a._ui(g,f[0]))})}:function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.removeClass("ui-tabs-hide");a._trigger("show",null,a._ui(g,f[0]))},s=m?function(g,f){f.animate(m,m.duration||"normal",function(){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");e(f,m);a.element.dequeue("tabs")})}:function(g,f){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");a.element.dequeue("tabs")};
this.anchors.bind(c.event+".tabs",function(){var g=this,f=d(g).closest("li"),i=a.panels.filter(":not(.ui-tabs-hide)"),l=a.element.find(a._sanitizeSelector(g.hash));if(f.hasClass("ui-tabs-selected")&&!c.collapsible||f.hasClass("ui-state-disabled")||f.hasClass("ui-state-processing")||a.panels.filter(":animated").length||a._trigger("select",null,a._ui(this,l[0]))===false){this.blur();return false}c.selected=a.anchors.index(this);a.abort();if(c.collapsible)if(f.hasClass("ui-tabs-selected")){c.selected=
-1;c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){s(g,i)}).dequeue("tabs");this.blur();return false}else if(!i.length){c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this));this.blur();return false}c.cookie&&a._cookie(c.selected,c.cookie);if(l.length){i.length&&a.element.queue("tabs",function(){s(g,i)});a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this))}else throw"jQuery UI Tabs: Mismatching fragment identifier.";
d.browser.msie&&this.blur()});this.anchors.bind("click.tabs",function(){return false})},_getIndex:function(b){if(typeof b=="string")b=this.anchors.index(this.anchors.filter("[href$="+b+"]"));return b},destroy:function(){var b=this.options;this.abort();this.element.unbind(".tabs").removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible").removeData("tabs");this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.anchors.each(function(){var e=
d.data(this,"href.tabs");if(e)this.href=e;var a=d(this).unbind(".tabs");d.each(["href","load","cache"],function(c,h){a.removeData(h+".tabs")})});this.lis.unbind(".tabs").add(this.panels).each(function(){d.data(this,"destroy.tabs")?d(this).remove():d(this).removeClass("ui-state-default ui-corner-top ui-tabs-selected ui-state-active ui-state-hover ui-state-focus ui-state-disabled ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide")});b.cookie&&this._cookie(null,b.cookie);return this},add:function(b,
e,a){if(a===p)a=this.anchors.length;var c=this,h=this.options;e=d(h.tabTemplate.replace(/#\{href\}/g,b).replace(/#\{label\}/g,e));b=!b.indexOf("#")?b.replace("#",""):this._tabId(d("a",e)[0]);e.addClass("ui-state-default ui-corner-top").data("destroy.tabs",true);var j=c.element.find("#"+b);j.length||(j=d(h.panelTemplate).attr("id",b).data("destroy.tabs",true));j.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");if(a>=this.lis.length){e.appendTo(this.list);j.appendTo(this.list[0].parentNode)}else{e.insertBefore(this.lis[a]);
j.insertBefore(this.panels[a])}h.disabled=d.map(h.disabled,function(k){return k>=a?++k:k});this._tabify();if(this.anchors.length==1){h.selected=0;e.addClass("ui-tabs-selected ui-state-active");j.removeClass("ui-tabs-hide");this.element.queue("tabs",function(){c._trigger("show",null,c._ui(c.anchors[0],c.panels[0]))});this.load(0)}this._trigger("add",null,this._ui(this.anchors[a],this.panels[a]));return this},remove:function(b){b=this._getIndex(b);var e=this.options,a=this.lis.eq(b).remove(),c=this.panels.eq(b).remove();
if(a.hasClass("ui-tabs-selected")&&this.anchors.length>1)this.select(b+(b+1<this.anchors.length?1:-1));e.disabled=d.map(d.grep(e.disabled,function(h){return h!=b}),function(h){return h>=b?--h:h});this._tabify();this._trigger("remove",null,this._ui(a.find("a")[0],c[0]));return this},enable:function(b){b=this._getIndex(b);var e=this.options;if(d.inArray(b,e.disabled)!=-1){this.lis.eq(b).removeClass("ui-state-disabled");e.disabled=d.grep(e.disabled,function(a){return a!=b});this._trigger("enable",null,
this._ui(this.anchors[b],this.panels[b]));return this}},disable:function(b){b=this._getIndex(b);var e=this.options;if(b!=e.selected){this.lis.eq(b).addClass("ui-state-disabled");e.disabled.push(b);e.disabled.sort();this._trigger("disable",null,this._ui(this.anchors[b],this.panels[b]))}return this},select:function(b){b=this._getIndex(b);if(b==-1)if(this.options.collapsible&&this.options.selected!=-1)b=this.options.selected;else return this;this.anchors.eq(b).trigger(this.options.event+".tabs");return this},
load:function(b){b=this._getIndex(b);var e=this,a=this.options,c=this.anchors.eq(b)[0],h=d.data(c,"load.tabs");this.abort();if(!h||this.element.queue("tabs").length!==0&&d.data(c,"cache.tabs"))this.element.dequeue("tabs");else{this.lis.eq(b).addClass("ui-state-processing");if(a.spinner){var j=d("span",c);j.data("label.tabs",j.html()).html(a.spinner)}this.xhr=d.ajax(d.extend({},a.ajaxOptions,{url:h,success:function(k,n){e.element.find(e._sanitizeSelector(c.hash)).html(k);e._cleanup();a.cache&&d.data(c,
"cache.tabs",true);e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.success(k,n)}catch(m){}},error:function(k,n){e._cleanup();e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.error(k,n,b,c)}catch(m){}}}));e.element.dequeue("tabs");return this}},abort:function(){this.element.queue([]);this.panels.stop(false,true);this.element.queue("tabs",this.element.queue("tabs").splice(-2,2));if(this.xhr){this.xhr.abort();delete this.xhr}this._cleanup();return this},
url:function(b,e){this.anchors.eq(b).removeData("cache.tabs").data("load.tabs",e);return this},length:function(){return this.anchors.length}});d.extend(d.ui.tabs,{version:"1.8.14"});d.extend(d.ui.tabs.prototype,{rotation:null,rotate:function(b,e){var a=this,c=this.options,h=a._rotate||(a._rotate=function(j){clearTimeout(a.rotation);a.rotation=setTimeout(function(){var k=c.selected;a.select(++k<a.anchors.length?k:0)},b);j&&j.stopPropagation()});e=a._unrotate||(a._unrotate=!e?function(j){j.clientX&&
a.rotate(null)}:function(){t=c.selected;h()});if(b){this.element.bind("tabsshow",h);this.anchors.bind(c.event+".tabs",e);h()}else{clearTimeout(a.rotation);this.element.unbind("tabsshow",h);this.anchors.unbind(c.event+".tabs",e);delete this._rotate;delete this._unrotate}return this}})})(jQuery);
;/*
 * jQuery UI Datepicker 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *  jquery.ui.core.js
 */
(function(d,C){function M(){this.debug=false;this._curInst=null;this._keyEvent=false;this._disabledInputs=[];this._inDialog=this._datepickerShowing=false;this._mainDivId="ui-datepicker-div";this._inlineClass="ui-datepicker-inline";this._appendClass="ui-datepicker-append";this._triggerClass="ui-datepicker-trigger";this._dialogClass="ui-datepicker-dialog";this._disableClass="ui-datepicker-disabled";this._unselectableClass="ui-datepicker-unselectable";this._currentClass="ui-datepicker-current-day";this._dayOverClass=
"ui-datepicker-days-cell-over";this.regional=[];this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su",
"Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""};this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:"c-10:c+10",showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",
minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:true,showButtonPanel:false,autoSize:false};d.extend(this._defaults,this.regional[""]);this.dpDiv=N(d('<div id="'+this._mainDivId+'" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))}function N(a){return a.bind("mouseout",function(b){b=
d(b.target).closest("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a");b.length&&b.removeClass("ui-state-hover ui-datepicker-prev-hover ui-datepicker-next-hover")}).bind("mouseover",function(b){b=d(b.target).closest("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a");if(!(d.datepicker._isDisabledDatepicker(J.inline?a.parent()[0]:J.input[0])||!b.length)){b.parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");b.addClass("ui-state-hover");
b.hasClass("ui-datepicker-prev")&&b.addClass("ui-datepicker-prev-hover");b.hasClass("ui-datepicker-next")&&b.addClass("ui-datepicker-next-hover")}})}function H(a,b){d.extend(a,b);for(var c in b)if(b[c]==null||b[c]==C)a[c]=b[c];return a}d.extend(d.ui,{datepicker:{version:"1.8.14"}});var A=(new Date).getTime(),J;d.extend(M.prototype,{markerClassName:"hasDatepicker",maxRows:4,log:function(){this.debug&&console.log.apply("",arguments)},_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(a){H(this._defaults,
a||{});return this},_attachDatepicker:function(a,b){var c=null;for(var e in this._defaults){var f=a.getAttribute("date:"+e);if(f){c=c||{};try{c[e]=eval(f)}catch(h){c[e]=f}}}e=a.nodeName.toLowerCase();f=e=="div"||e=="span";if(!a.id){this.uuid+=1;a.id="dp"+this.uuid}var i=this._newInst(d(a),f);i.settings=d.extend({},b||{},c||{});if(e=="input")this._connectDatepicker(a,i);else f&&this._inlineDatepicker(a,i)},_newInst:function(a,b){return{id:a[0].id.replace(/([^A-Za-z0-9_-])/g,"\\\\$1"),input:a,selectedDay:0,
selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:b,dpDiv:!b?this.dpDiv:N(d('<div class="'+this._inlineClass+' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))}},_connectDatepicker:function(a,b){var c=d(a);b.append=d([]);b.trigger=d([]);if(!c.hasClass(this.markerClassName)){this._attachments(c,b);c.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker",function(e,f,h){b.settings[f]=
h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});this._autoSize(b);d.data(a,"datepicker",b)}},_attachments:function(a,b){var c=this._get(b,"appendText"),e=this._get(b,"isRTL");b.append&&b.append.remove();if(c){b.append=d('<span class="'+this._appendClass+'">'+c+"</span>");a[e?"before":"after"](b.append)}a.unbind("focus",this._showDatepicker);b.trigger&&b.trigger.remove();c=this._get(b,"showOn");if(c=="focus"||c=="both")a.focus(this._showDatepicker);if(c=="button"||c=="both"){c=
this._get(b,"buttonText");var f=this._get(b,"buttonImage");b.trigger=d(this._get(b,"buttonImageOnly")?d("<img/>").addClass(this._triggerClass).attr({src:f,alt:c,title:c}):d('<button type="button"></button>').addClass(this._triggerClass).html(f==""?c:d("<img/>").attr({src:f,alt:c,title:c})));a[e?"before":"after"](b.trigger);b.trigger.click(function(){d.datepicker._datepickerShowing&&d.datepicker._lastInput==a[0]?d.datepicker._hideDatepicker():d.datepicker._showDatepicker(a[0]);return false})}},_autoSize:function(a){if(this._get(a,
"autoSize")&&!a.inline){var b=new Date(2009,11,20),c=this._get(a,"dateFormat");if(c.match(/[DM]/)){var e=function(f){for(var h=0,i=0,g=0;g<f.length;g++)if(f[g].length>h){h=f[g].length;i=g}return i};b.setMonth(e(this._get(a,c.match(/MM/)?"monthNames":"monthNamesShort")));b.setDate(e(this._get(a,c.match(/DD/)?"dayNames":"dayNamesShort"))+20-b.getDay())}a.input.attr("size",this._formatDate(a,b).length)}},_inlineDatepicker:function(a,b){var c=d(a);if(!c.hasClass(this.markerClassName)){c.addClass(this.markerClassName).append(b.dpDiv).bind("setData.datepicker",
function(e,f,h){b.settings[f]=h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});d.data(a,"datepicker",b);this._setDate(b,this._getDefaultDate(b),true);this._updateDatepicker(b);this._updateAlternate(b);b.dpDiv.show()}},_dialogDatepicker:function(a,b,c,e,f){a=this._dialogInst;if(!a){this.uuid+=1;this._dialogInput=d('<input type="text" id="'+("dp"+this.uuid)+'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');this._dialogInput.keydown(this._doKeyDown);d("body").append(this._dialogInput);
a=this._dialogInst=this._newInst(this._dialogInput,false);a.settings={};d.data(this._dialogInput[0],"datepicker",a)}H(a.settings,e||{});b=b&&b.constructor==Date?this._formatDate(a,b):b;this._dialogInput.val(b);this._pos=f?f.length?f:[f.pageX,f.pageY]:null;if(!this._pos)this._pos=[document.documentElement.clientWidth/2-100+(document.documentElement.scrollLeft||document.body.scrollLeft),document.documentElement.clientHeight/2-150+(document.documentElement.scrollTop||document.body.scrollTop)];this._dialogInput.css("left",
this._pos[0]+20+"px").css("top",this._pos[1]+"px");a.settings.onSelect=c;this._inDialog=true;this.dpDiv.addClass(this._dialogClass);this._showDatepicker(this._dialogInput[0]);d.blockUI&&d.blockUI(this.dpDiv);d.data(this._dialogInput[0],"datepicker",a);return this},_destroyDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();d.removeData(a,"datepicker");if(e=="input"){c.append.remove();c.trigger.remove();b.removeClass(this.markerClassName).unbind("focus",
this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)}else if(e=="div"||e=="span")b.removeClass(this.markerClassName).empty()}},_enableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();if(e=="input"){a.disabled=false;c.trigger.filter("button").each(function(){this.disabled=false}).end().filter("img").css({opacity:"1.0",cursor:""})}else if(e=="div"||e=="span"){b=
b.children("."+this._inlineClass);b.children().removeClass("ui-state-disabled");b.find("select.ui-datepicker-month, select.ui-datepicker-year").removeAttr("disabled")}this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:f})}},_disableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();if(e=="input"){a.disabled=true;c.trigger.filter("button").each(function(){this.disabled=true}).end().filter("img").css({opacity:"0.5",
cursor:"default"})}else if(e=="div"||e=="span"){b=b.children("."+this._inlineClass);b.children().addClass("ui-state-disabled");b.find("select.ui-datepicker-month, select.ui-datepicker-year").attr("disabled","disabled")}this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:f});this._disabledInputs[this._disabledInputs.length]=a}},_isDisabledDatepicker:function(a){if(!a)return false;for(var b=0;b<this._disabledInputs.length;b++)if(this._disabledInputs[b]==a)return true;return false},
_getInst:function(a){try{return d.data(a,"datepicker")}catch(b){throw"Missing instance data for this datepicker";}},_optionDatepicker:function(a,b,c){var e=this._getInst(a);if(arguments.length==2&&typeof b=="string")return b=="defaults"?d.extend({},d.datepicker._defaults):e?b=="all"?d.extend({},e.settings):this._get(e,b):null;var f=b||{};if(typeof b=="string"){f={};f[b]=c}if(e){this._curInst==e&&this._hideDatepicker();var h=this._getDateDatepicker(a,true),i=this._getMinMaxDate(e,"min"),g=this._getMinMaxDate(e,
"max");H(e.settings,f);if(i!==null&&f.dateFormat!==C&&f.minDate===C)e.settings.minDate=this._formatDate(e,i);if(g!==null&&f.dateFormat!==C&&f.maxDate===C)e.settings.maxDate=this._formatDate(e,g);this._attachments(d(a),e);this._autoSize(e);this._setDate(e,h);this._updateAlternate(e);this._updateDatepicker(e)}},_changeDatepicker:function(a,b,c){this._optionDatepicker(a,b,c)},_refreshDatepicker:function(a){(a=this._getInst(a))&&this._updateDatepicker(a)},_setDateDatepicker:function(a,b){if(a=this._getInst(a)){this._setDate(a,
b);this._updateDatepicker(a);this._updateAlternate(a)}},_getDateDatepicker:function(a,b){(a=this._getInst(a))&&!a.inline&&this._setDateFromField(a,b);return a?this._getDate(a):null},_doKeyDown:function(a){var b=d.datepicker._getInst(a.target),c=true,e=b.dpDiv.is(".ui-datepicker-rtl");b._keyEvent=true;if(d.datepicker._datepickerShowing)switch(a.keyCode){case 9:d.datepicker._hideDatepicker();c=false;break;case 13:c=d("td."+d.datepicker._dayOverClass+":not(."+d.datepicker._currentClass+")",b.dpDiv);
c[0]?d.datepicker._selectDay(a.target,b.selectedMonth,b.selectedYear,c[0]):d.datepicker._hideDatepicker();return false;case 27:d.datepicker._hideDatepicker();break;case 33:d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");break;case 34:d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");break;case 35:if(a.ctrlKey||a.metaKey)d.datepicker._clearDate(a.target);
c=a.ctrlKey||a.metaKey;break;case 36:if(a.ctrlKey||a.metaKey)d.datepicker._gotoToday(a.target);c=a.ctrlKey||a.metaKey;break;case 37:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,e?+1:-1,"D");c=a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");break;case 38:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,-7,"D");c=a.ctrlKey||a.metaKey;break;case 39:if(a.ctrlKey||
a.metaKey)d.datepicker._adjustDate(a.target,e?-1:+1,"D");c=a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");break;case 40:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,+7,"D");c=a.ctrlKey||a.metaKey;break;default:c=false}else if(a.keyCode==36&&a.ctrlKey)d.datepicker._showDatepicker(this);else c=false;if(c){a.preventDefault();a.stopPropagation()}},_doKeyPress:function(a){var b=
d.datepicker._getInst(a.target);if(d.datepicker._get(b,"constrainInput")){b=d.datepicker._possibleChars(d.datepicker._get(b,"dateFormat"));var c=String.fromCharCode(a.charCode==C?a.keyCode:a.charCode);return a.ctrlKey||a.metaKey||c<" "||!b||b.indexOf(c)>-1}},_doKeyUp:function(a){a=d.datepicker._getInst(a.target);if(a.input.val()!=a.lastVal)try{if(d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),a.input?a.input.val():null,d.datepicker._getFormatConfig(a))){d.datepicker._setDateFromField(a);
d.datepicker._updateAlternate(a);d.datepicker._updateDatepicker(a)}}catch(b){d.datepicker.log(b)}return true},_showDatepicker:function(a){a=a.target||a;if(a.nodeName.toLowerCase()!="input")a=d("input",a.parentNode)[0];if(!(d.datepicker._isDisabledDatepicker(a)||d.datepicker._lastInput==a)){var b=d.datepicker._getInst(a);if(d.datepicker._curInst&&d.datepicker._curInst!=b){d.datepicker._datepickerShowing&&d.datepicker._triggerOnClose(d.datepicker._curInst);d.datepicker._curInst.dpDiv.stop(true,true)}var c=
d.datepicker._get(b,"beforeShow");H(b.settings,c?c.apply(a,[a,b]):{});b.lastVal=null;d.datepicker._lastInput=a;d.datepicker._setDateFromField(b);if(d.datepicker._inDialog)a.value="";if(!d.datepicker._pos){d.datepicker._pos=d.datepicker._findPos(a);d.datepicker._pos[1]+=a.offsetHeight}var e=false;d(a).parents().each(function(){e|=d(this).css("position")=="fixed";return!e});if(e&&d.browser.opera){d.datepicker._pos[0]-=document.documentElement.scrollLeft;d.datepicker._pos[1]-=document.documentElement.scrollTop}c=
{left:d.datepicker._pos[0],top:d.datepicker._pos[1]};d.datepicker._pos=null;b.dpDiv.empty();b.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});d.datepicker._updateDatepicker(b);c=d.datepicker._checkOffset(b,c,e);b.dpDiv.css({position:d.datepicker._inDialog&&d.blockUI?"static":e?"fixed":"absolute",display:"none",left:c.left+"px",top:c.top+"px"});if(!b.inline){c=d.datepicker._get(b,"showAnim");var f=d.datepicker._get(b,"duration"),h=function(){var i=b.dpDiv.find("iframe.ui-datepicker-cover");
if(i.length){var g=d.datepicker._getBorders(b.dpDiv);i.css({left:-g[0],top:-g[1],width:b.dpDiv.outerWidth(),height:b.dpDiv.outerHeight()})}};b.dpDiv.zIndex(d(a).zIndex()+1);d.datepicker._datepickerShowing=true;d.effects&&d.effects[c]?b.dpDiv.show(c,d.datepicker._get(b,"showOptions"),f,h):b.dpDiv[c||"show"](c?f:null,h);if(!c||!f)h();b.input.is(":visible")&&!b.input.is(":disabled")&&b.input.focus();d.datepicker._curInst=b}}},_updateDatepicker:function(a){this.maxRows=4;var b=d.datepicker._getBorders(a.dpDiv);
J=a;a.dpDiv.empty().append(this._generateHTML(a));var c=a.dpDiv.find("iframe.ui-datepicker-cover");c.length&&c.css({left:-b[0],top:-b[1],width:a.dpDiv.outerWidth(),height:a.dpDiv.outerHeight()});a.dpDiv.find("."+this._dayOverClass+" a").mouseover();b=this._getNumberOfMonths(a);c=b[1];a.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");c>1&&a.dpDiv.addClass("ui-datepicker-multi-"+c).css("width",17*c+"em");a.dpDiv[(b[0]!=1||b[1]!=1?"add":"remove")+"Class"]("ui-datepicker-multi");
a.dpDiv[(this._get(a,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");a==d.datepicker._curInst&&d.datepicker._datepickerShowing&&a.input&&a.input.is(":visible")&&!a.input.is(":disabled")&&a.input[0]!=document.activeElement&&a.input.focus();if(a.yearshtml){var e=a.yearshtml;setTimeout(function(){e===a.yearshtml&&a.yearshtml&&a.dpDiv.find("select.ui-datepicker-year:first").replaceWith(a.yearshtml);e=a.yearshtml=null},0)}},_getBorders:function(a){var b=function(c){return{thin:1,medium:2,thick:3}[c]||
c};return[parseFloat(b(a.css("border-left-width"))),parseFloat(b(a.css("border-top-width")))]},_checkOffset:function(a,b,c){var e=a.dpDiv.outerWidth(),f=a.dpDiv.outerHeight(),h=a.input?a.input.outerWidth():0,i=a.input?a.input.outerHeight():0,g=document.documentElement.clientWidth+d(document).scrollLeft(),j=document.documentElement.clientHeight+d(document).scrollTop();b.left-=this._get(a,"isRTL")?e-h:0;b.left-=c&&b.left==a.input.offset().left?d(document).scrollLeft():0;b.top-=c&&b.top==a.input.offset().top+
i?d(document).scrollTop():0;b.left-=Math.min(b.left,b.left+e>g&&g>e?Math.abs(b.left+e-g):0);b.top-=Math.min(b.top,b.top+f>j&&j>f?Math.abs(f+i):0);return b},_findPos:function(a){for(var b=this._get(this._getInst(a),"isRTL");a&&(a.type=="hidden"||a.nodeType!=1||d.expr.filters.hidden(a));)a=a[b?"previousSibling":"nextSibling"];a=d(a).offset();return[a.left,a.top]},_triggerOnClose:function(a){var b=this._get(a,"onClose");if(b)b.apply(a.input?a.input[0]:null,[a.input?a.input.val():"",a])},_hideDatepicker:function(a){var b=
this._curInst;if(!(!b||a&&b!=d.data(a,"datepicker")))if(this._datepickerShowing){a=this._get(b,"showAnim");var c=this._get(b,"duration"),e=function(){d.datepicker._tidyDialog(b);this._curInst=null};d.effects&&d.effects[a]?b.dpDiv.hide(a,d.datepicker._get(b,"showOptions"),c,e):b.dpDiv[a=="slideDown"?"slideUp":a=="fadeIn"?"fadeOut":"hide"](a?c:null,e);a||e();d.datepicker._triggerOnClose(b);this._datepickerShowing=false;this._lastInput=null;if(this._inDialog){this._dialogInput.css({position:"absolute",
left:"0",top:"-100px"});if(d.blockUI){d.unblockUI();d("body").append(this.dpDiv)}}this._inDialog=false}},_tidyDialog:function(a){a.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},_checkExternalClick:function(a){if(d.datepicker._curInst){a=d(a.target);a[0].id!=d.datepicker._mainDivId&&a.parents("#"+d.datepicker._mainDivId).length==0&&!a.hasClass(d.datepicker.markerClassName)&&!a.hasClass(d.datepicker._triggerClass)&&d.datepicker._datepickerShowing&&!(d.datepicker._inDialog&&
d.blockUI)&&d.datepicker._hideDatepicker()}},_adjustDate:function(a,b,c){a=d(a);var e=this._getInst(a[0]);if(!this._isDisabledDatepicker(a[0])){this._adjustInstDate(e,b+(c=="M"?this._get(e,"showCurrentAtPos"):0),c);this._updateDatepicker(e)}},_gotoToday:function(a){a=d(a);var b=this._getInst(a[0]);if(this._get(b,"gotoCurrent")&&b.currentDay){b.selectedDay=b.currentDay;b.drawMonth=b.selectedMonth=b.currentMonth;b.drawYear=b.selectedYear=b.currentYear}else{var c=new Date;b.selectedDay=c.getDate();b.drawMonth=
b.selectedMonth=c.getMonth();b.drawYear=b.selectedYear=c.getFullYear()}this._notifyChange(b);this._adjustDate(a)},_selectMonthYear:function(a,b,c){a=d(a);var e=this._getInst(a[0]);e._selectingMonthYear=false;e["selected"+(c=="M"?"Month":"Year")]=e["draw"+(c=="M"?"Month":"Year")]=parseInt(b.options[b.selectedIndex].value,10);this._notifyChange(e);this._adjustDate(a)},_clickMonthYear:function(a){var b=this._getInst(d(a)[0]);b.input&&b._selectingMonthYear&&setTimeout(function(){b.input.focus()},0);b._selectingMonthYear=
!b._selectingMonthYear},_selectDay:function(a,b,c,e){var f=d(a);if(!(d(e).hasClass(this._unselectableClass)||this._isDisabledDatepicker(f[0]))){f=this._getInst(f[0]);f.selectedDay=f.currentDay=d("a",e).html();f.selectedMonth=f.currentMonth=b;f.selectedYear=f.currentYear=c;this._selectDate(a,this._formatDate(f,f.currentDay,f.currentMonth,f.currentYear))}},_clearDate:function(a){a=d(a);this._getInst(a[0]);this._selectDate(a,"")},_selectDate:function(a,b){a=this._getInst(d(a)[0]);b=b!=null?b:this._formatDate(a);
a.input&&a.input.val(b);this._updateAlternate(a);var c=this._get(a,"onSelect");if(c)c.apply(a.input?a.input[0]:null,[b,a]);else a.input&&a.input.trigger("change");if(a.inline)this._updateDatepicker(a);else{this._hideDatepicker();this._lastInput=a.input[0];typeof a.input[0]!="object"&&a.input.focus();this._lastInput=null}},_updateAlternate:function(a){var b=this._get(a,"altField");if(b){var c=this._get(a,"altFormat")||this._get(a,"dateFormat"),e=this._getDate(a),f=this.formatDate(c,e,this._getFormatConfig(a));
d(b).each(function(){d(this).val(f)})}},noWeekends:function(a){a=a.getDay();return[a>0&&a<6,""]},iso8601Week:function(a){a=new Date(a.getTime());a.setDate(a.getDate()+4-(a.getDay()||7));var b=a.getTime();a.setMonth(0);a.setDate(1);return Math.floor(Math.round((b-a)/864E5)/7)+1},parseDate:function(a,b,c){if(a==null||b==null)throw"Invalid arguments";b=typeof b=="object"?b.toString():b+"";if(b=="")return null;var e=(c?c.shortYearCutoff:null)||this._defaults.shortYearCutoff;e=typeof e!="string"?e:(new Date).getFullYear()%
100+parseInt(e,10);for(var f=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,h=(c?c.dayNames:null)||this._defaults.dayNames,i=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort,g=(c?c.monthNames:null)||this._defaults.monthNames,j=c=-1,l=-1,u=-1,k=false,o=function(p){(p=B+1<a.length&&a.charAt(B+1)==p)&&B++;return p},m=function(p){var D=o(p);p=new RegExp("^\\d{1,"+(p=="@"?14:p=="!"?20:p=="y"&&D?4:p=="o"?3:2)+"}");p=b.substring(q).match(p);if(!p)throw"Missing number at position "+q;q+=
p[0].length;return parseInt(p[0],10)},n=function(p,D,K){p=d.map(o(p)?K:D,function(w,x){return[[x,w]]}).sort(function(w,x){return-(w[1].length-x[1].length)});var E=-1;d.each(p,function(w,x){w=x[1];if(b.substr(q,w.length).toLowerCase()==w.toLowerCase()){E=x[0];q+=w.length;return false}});if(E!=-1)return E+1;else throw"Unknown name at position "+q;},s=function(){if(b.charAt(q)!=a.charAt(B))throw"Unexpected literal at position "+q;q++},q=0,B=0;B<a.length;B++)if(k)if(a.charAt(B)=="'"&&!o("'"))k=false;
else s();else switch(a.charAt(B)){case "d":l=m("d");break;case "D":n("D",f,h);break;case "o":u=m("o");break;case "m":j=m("m");break;case "M":j=n("M",i,g);break;case "y":c=m("y");break;case "@":var v=new Date(m("@"));c=v.getFullYear();j=v.getMonth()+1;l=v.getDate();break;case "!":v=new Date((m("!")-this._ticksTo1970)/1E4);c=v.getFullYear();j=v.getMonth()+1;l=v.getDate();break;case "'":if(o("'"))s();else k=true;break;default:s()}if(q<b.length)throw"Extra/unparsed characters found in date: "+b.substring(q);
if(c==-1)c=(new Date).getFullYear();else if(c<100)c+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c<=e?0:-100);if(u>-1){j=1;l=u;do{e=this._getDaysInMonth(c,j-1);if(l<=e)break;j++;l-=e}while(1)}v=this._daylightSavingAdjust(new Date(c,j-1,l));if(v.getFullYear()!=c||v.getMonth()+1!=j||v.getDate()!=l)throw"Invalid date";return v},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",
TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925))*24*60*60*1E7,formatDate:function(a,b,c){if(!b)return"";var e=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,f=(c?c.dayNames:null)||this._defaults.dayNames,h=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort;c=(c?c.monthNames:null)||this._defaults.monthNames;var i=function(o){(o=k+1<a.length&&a.charAt(k+1)==o)&&k++;return o},g=function(o,m,n){m=""+m;if(i(o))for(;m.length<
n;)m="0"+m;return m},j=function(o,m,n,s){return i(o)?s[m]:n[m]},l="",u=false;if(b)for(var k=0;k<a.length;k++)if(u)if(a.charAt(k)=="'"&&!i("'"))u=false;else l+=a.charAt(k);else switch(a.charAt(k)){case "d":l+=g("d",b.getDate(),2);break;case "D":l+=j("D",b.getDay(),e,f);break;case "o":l+=g("o",Math.round(((new Date(b.getFullYear(),b.getMonth(),b.getDate())).getTime()-(new Date(b.getFullYear(),0,0)).getTime())/864E5),3);break;case "m":l+=g("m",b.getMonth()+1,2);break;case "M":l+=j("M",b.getMonth(),h,
c);break;case "y":l+=i("y")?b.getFullYear():(b.getYear()%100<10?"0":"")+b.getYear()%100;break;case "@":l+=b.getTime();break;case "!":l+=b.getTime()*1E4+this._ticksTo1970;break;case "'":if(i("'"))l+="'";else u=true;break;default:l+=a.charAt(k)}return l},_possibleChars:function(a){for(var b="",c=false,e=function(h){(h=f+1<a.length&&a.charAt(f+1)==h)&&f++;return h},f=0;f<a.length;f++)if(c)if(a.charAt(f)=="'"&&!e("'"))c=false;else b+=a.charAt(f);else switch(a.charAt(f)){case "d":case "m":case "y":case "@":b+=
"0123456789";break;case "D":case "M":return null;case "'":if(e("'"))b+="'";else c=true;break;default:b+=a.charAt(f)}return b},_get:function(a,b){return a.settings[b]!==C?a.settings[b]:this._defaults[b]},_setDateFromField:function(a,b){if(a.input.val()!=a.lastVal){var c=this._get(a,"dateFormat"),e=a.lastVal=a.input?a.input.val():null,f,h;f=h=this._getDefaultDate(a);var i=this._getFormatConfig(a);try{f=this.parseDate(c,e,i)||h}catch(g){this.log(g);e=b?"":e}a.selectedDay=f.getDate();a.drawMonth=a.selectedMonth=
f.getMonth();a.drawYear=a.selectedYear=f.getFullYear();a.currentDay=e?f.getDate():0;a.currentMonth=e?f.getMonth():0;a.currentYear=e?f.getFullYear():0;this._adjustInstDate(a)}},_getDefaultDate:function(a){return this._restrictMinMax(a,this._determineDate(a,this._get(a,"defaultDate"),new Date))},_determineDate:function(a,b,c){var e=function(h){var i=new Date;i.setDate(i.getDate()+h);return i},f=function(h){try{return d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),h,d.datepicker._getFormatConfig(a))}catch(i){}var g=
(h.toLowerCase().match(/^c/)?d.datepicker._getDate(a):null)||new Date,j=g.getFullYear(),l=g.getMonth();g=g.getDate();for(var u=/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,k=u.exec(h);k;){switch(k[2]||"d"){case "d":case "D":g+=parseInt(k[1],10);break;case "w":case "W":g+=parseInt(k[1],10)*7;break;case "m":case "M":l+=parseInt(k[1],10);g=Math.min(g,d.datepicker._getDaysInMonth(j,l));break;case "y":case "Y":j+=parseInt(k[1],10);g=Math.min(g,d.datepicker._getDaysInMonth(j,l));break}k=u.exec(h)}return new Date(j,
l,g)};if(b=(b=b==null||b===""?c:typeof b=="string"?f(b):typeof b=="number"?isNaN(b)?c:e(b):new Date(b.getTime()))&&b.toString()=="Invalid Date"?c:b){b.setHours(0);b.setMinutes(0);b.setSeconds(0);b.setMilliseconds(0)}return this._daylightSavingAdjust(b)},_daylightSavingAdjust:function(a){if(!a)return null;a.setHours(a.getHours()>12?a.getHours()+2:0);return a},_setDate:function(a,b,c){var e=!b,f=a.selectedMonth,h=a.selectedYear;b=this._restrictMinMax(a,this._determineDate(a,b,new Date));a.selectedDay=
a.currentDay=b.getDate();a.drawMonth=a.selectedMonth=a.currentMonth=b.getMonth();a.drawYear=a.selectedYear=a.currentYear=b.getFullYear();if((f!=a.selectedMonth||h!=a.selectedYear)&&!c)this._notifyChange(a);this._adjustInstDate(a);if(a.input)a.input.val(e?"":this._formatDate(a))},_getDate:function(a){return!a.currentYear||a.input&&a.input.val()==""?null:this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay))},_generateHTML:function(a){var b=new Date;b=this._daylightSavingAdjust(new Date(b.getFullYear(),
b.getMonth(),b.getDate()));var c=this._get(a,"isRTL"),e=this._get(a,"showButtonPanel"),f=this._get(a,"hideIfNoPrevNext"),h=this._get(a,"navigationAsDateFormat"),i=this._getNumberOfMonths(a),g=this._get(a,"showCurrentAtPos"),j=this._get(a,"stepMonths"),l=i[0]!=1||i[1]!=1,u=this._daylightSavingAdjust(!a.currentDay?new Date(9999,9,9):new Date(a.currentYear,a.currentMonth,a.currentDay)),k=this._getMinMaxDate(a,"min"),o=this._getMinMaxDate(a,"max");g=a.drawMonth-g;var m=a.drawYear;if(g<0){g+=12;m--}if(o){var n=
this._daylightSavingAdjust(new Date(o.getFullYear(),o.getMonth()-i[0]*i[1]+1,o.getDate()));for(n=k&&n<k?k:n;this._daylightSavingAdjust(new Date(m,g,1))>n;){g--;if(g<0){g=11;m--}}}a.drawMonth=g;a.drawYear=m;n=this._get(a,"prevText");n=!h?n:this.formatDate(n,this._daylightSavingAdjust(new Date(m,g-j,1)),this._getFormatConfig(a));n=this._canAdjustMonth(a,-1,m,g)?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+A+".datepicker._adjustDate('#"+a.id+"', -"+j+", 'M');\" title=\""+n+'"><span class="ui-icon ui-icon-circle-triangle-'+
(c?"e":"w")+'">'+n+"</span></a>":f?"":'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>";var s=this._get(a,"nextText");s=!h?s:this.formatDate(s,this._daylightSavingAdjust(new Date(m,g+j,1)),this._getFormatConfig(a));f=this._canAdjustMonth(a,+1,m,g)?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+A+".datepicker._adjustDate('#"+a.id+"', +"+j+", 'M');\" title=\""+s+'"><span class="ui-icon ui-icon-circle-triangle-'+
(c?"w":"e")+'">'+s+"</span></a>":f?"":'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+s+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+s+"</span></a>";j=this._get(a,"currentText");s=this._get(a,"gotoCurrent")&&a.currentDay?u:b;j=!h?j:this.formatDate(j,s,this._getFormatConfig(a));h=!a.inline?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+A+'.datepicker._hideDatepicker();">'+this._get(a,
"closeText")+"</button>":"";e=e?'<div class="ui-datepicker-buttonpane ui-widget-content">'+(c?h:"")+(this._isInRange(a,s)?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+A+".datepicker._gotoToday('#"+a.id+"');\">"+j+"</button>":"")+(c?"":h)+"</div>":"";h=parseInt(this._get(a,"firstDay"),10);h=isNaN(h)?0:h;j=this._get(a,"showWeek");s=this._get(a,"dayNames");this._get(a,"dayNamesShort");var q=this._get(a,"dayNamesMin"),B=
this._get(a,"monthNames"),v=this._get(a,"monthNamesShort"),p=this._get(a,"beforeShowDay"),D=this._get(a,"showOtherMonths"),K=this._get(a,"selectOtherMonths");this._get(a,"calculateWeek");for(var E=this._getDefaultDate(a),w="",x=0;x<i[0];x++){var O="";this.maxRows=4;for(var G=0;G<i[1];G++){var P=this._daylightSavingAdjust(new Date(m,g,a.selectedDay)),t=" ui-corner-all",y="";if(l){y+='<div class="ui-datepicker-group';if(i[1]>1)switch(G){case 0:y+=" ui-datepicker-group-first";t=" ui-corner-"+(c?"right":
"left");break;case i[1]-1:y+=" ui-datepicker-group-last";t=" ui-corner-"+(c?"left":"right");break;default:y+=" ui-datepicker-group-middle";t="";break}y+='">'}y+='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+t+'">'+(/all|left/.test(t)&&x==0?c?f:n:"")+(/all|right/.test(t)&&x==0?c?n:f:"")+this._generateMonthYearHeader(a,g,m,k,o,x>0||G>0,B,v)+'</div><table class="ui-datepicker-calendar"><thead><tr>';var z=j?'<th class="ui-datepicker-week-col">'+this._get(a,"weekHeader")+"</th>":
"";for(t=0;t<7;t++){var r=(t+h)%7;z+="<th"+((t+h+6)%7>=5?' class="ui-datepicker-week-end"':"")+'><span title="'+s[r]+'">'+q[r]+"</span></th>"}y+=z+"</tr></thead><tbody>";z=this._getDaysInMonth(m,g);if(m==a.selectedYear&&g==a.selectedMonth)a.selectedDay=Math.min(a.selectedDay,z);t=(this._getFirstDayOfMonth(m,g)-h+7)%7;z=Math.ceil((t+z)/7);this.maxRows=z=l?this.maxRows>z?this.maxRows:z:z;r=this._daylightSavingAdjust(new Date(m,g,1-t));for(var Q=0;Q<z;Q++){y+="<tr>";var R=!j?"":'<td class="ui-datepicker-week-col">'+
this._get(a,"calculateWeek")(r)+"</td>";for(t=0;t<7;t++){var I=p?p.apply(a.input?a.input[0]:null,[r]):[true,""],F=r.getMonth()!=g,L=F&&!K||!I[0]||k&&r<k||o&&r>o;R+='<td class="'+((t+h+6)%7>=5?" ui-datepicker-week-end":"")+(F?" ui-datepicker-other-month":"")+(r.getTime()==P.getTime()&&g==a.selectedMonth&&a._keyEvent||E.getTime()==r.getTime()&&E.getTime()==P.getTime()?" "+this._dayOverClass:"")+(L?" "+this._unselectableClass+" ui-state-disabled":"")+(F&&!D?"":" "+I[1]+(r.getTime()==u.getTime()?" "+
this._currentClass:"")+(r.getTime()==b.getTime()?" ui-datepicker-today":""))+'"'+((!F||D)&&I[2]?' title="'+I[2]+'"':"")+(L?"":' onclick="DP_jQuery_'+A+".datepicker._selectDay('#"+a.id+"',"+r.getMonth()+","+r.getFullYear()+', this);return false;"')+">"+(F&&!D?"&#xa0;":L?'<span class="ui-state-default">'+r.getDate()+"</span>":'<a class="ui-state-default'+(r.getTime()==b.getTime()?" ui-state-highlight":"")+(r.getTime()==u.getTime()?" ui-state-active":"")+(F?" ui-priority-secondary":"")+'" href="#">'+
r.getDate()+"</a>")+"</td>";r.setDate(r.getDate()+1);r=this._daylightSavingAdjust(r)}y+=R+"</tr>"}g++;if(g>11){g=0;m++}y+="</tbody></table>"+(l?"</div>"+(i[0]>0&&G==i[1]-1?'<div class="ui-datepicker-row-break"></div>':""):"");O+=y}w+=O}w+=e+(d.browser.msie&&parseInt(d.browser.version,10)<7&&!a.inline?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':"");a._keyEvent=false;return w},_generateMonthYearHeader:function(a,b,c,e,f,h,i,g){var j=this._get(a,"changeMonth"),
l=this._get(a,"changeYear"),u=this._get(a,"showMonthAfterYear"),k='<div class="ui-datepicker-title">',o="";if(h||!j)o+='<span class="ui-datepicker-month">'+i[b]+"</span>";else{i=e&&e.getFullYear()==c;var m=f&&f.getFullYear()==c;o+='<select class="ui-datepicker-month" onchange="DP_jQuery_'+A+".datepicker._selectMonthYear('#"+a.id+"', this, 'M');\" onclick=\"DP_jQuery_"+A+".datepicker._clickMonthYear('#"+a.id+"');\">";for(var n=0;n<12;n++)if((!i||n>=e.getMonth())&&(!m||n<=f.getMonth()))o+='<option value="'+
n+'"'+(n==b?' selected="selected"':"")+">"+g[n]+"</option>";o+="</select>"}u||(k+=o+(h||!(j&&l)?"&#xa0;":""));if(!a.yearshtml){a.yearshtml="";if(h||!l)k+='<span class="ui-datepicker-year">'+c+"</span>";else{g=this._get(a,"yearRange").split(":");var s=(new Date).getFullYear();i=function(q){q=q.match(/c[+-].*/)?c+parseInt(q.substring(1),10):q.match(/[+-].*/)?s+parseInt(q,10):parseInt(q,10);return isNaN(q)?s:q};b=i(g[0]);g=Math.max(b,i(g[1]||""));b=e?Math.max(b,e.getFullYear()):b;g=f?Math.min(g,f.getFullYear()):
g;for(a.yearshtml+='<select class="ui-datepicker-year" onchange="DP_jQuery_'+A+".datepicker._selectMonthYear('#"+a.id+"', this, 'Y');\" onclick=\"DP_jQuery_"+A+".datepicker._clickMonthYear('#"+a.id+"');\">";b<=g;b++)a.yearshtml+='<option value="'+b+'"'+(b==c?' selected="selected"':"")+">"+b+"</option>";a.yearshtml+="</select>";k+=a.yearshtml;a.yearshtml=null}}k+=this._get(a,"yearSuffix");if(u)k+=(h||!(j&&l)?"&#xa0;":"")+o;k+="</div>";return k},_adjustInstDate:function(a,b,c){var e=a.drawYear+(c==
"Y"?b:0),f=a.drawMonth+(c=="M"?b:0);b=Math.min(a.selectedDay,this._getDaysInMonth(e,f))+(c=="D"?b:0);e=this._restrictMinMax(a,this._daylightSavingAdjust(new Date(e,f,b)));a.selectedDay=e.getDate();a.drawMonth=a.selectedMonth=e.getMonth();a.drawYear=a.selectedYear=e.getFullYear();if(c=="M"||c=="Y")this._notifyChange(a)},_restrictMinMax:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");b=c&&b<c?c:b;return b=a&&b>a?a:b},_notifyChange:function(a){var b=this._get(a,"onChangeMonthYear");
if(b)b.apply(a.input?a.input[0]:null,[a.selectedYear,a.selectedMonth+1,a])},_getNumberOfMonths:function(a){a=this._get(a,"numberOfMonths");return a==null?[1,1]:typeof a=="number"?[1,a]:a},_getMinMaxDate:function(a,b){return this._determineDate(a,this._get(a,b+"Date"),null)},_getDaysInMonth:function(a,b){return 32-this._daylightSavingAdjust(new Date(a,b,32)).getDate()},_getFirstDayOfMonth:function(a,b){return(new Date(a,b,1)).getDay()},_canAdjustMonth:function(a,b,c,e){var f=this._getNumberOfMonths(a);
c=this._daylightSavingAdjust(new Date(c,e+(b<0?b:f[0]*f[1]),1));b<0&&c.setDate(this._getDaysInMonth(c.getFullYear(),c.getMonth()));return this._isInRange(a,c)},_isInRange:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");return(!c||b.getTime()>=c.getTime())&&(!a||b.getTime()<=a.getTime())},_getFormatConfig:function(a){var b=this._get(a,"shortYearCutoff");b=typeof b!="string"?b:(new Date).getFullYear()%100+parseInt(b,10);return{shortYearCutoff:b,dayNamesShort:this._get(a,
"dayNamesShort"),dayNames:this._get(a,"dayNames"),monthNamesShort:this._get(a,"monthNamesShort"),monthNames:this._get(a,"monthNames")}},_formatDate:function(a,b,c,e){if(!b){a.currentDay=a.selectedDay;a.currentMonth=a.selectedMonth;a.currentYear=a.selectedYear}b=b?typeof b=="object"?b:this._daylightSavingAdjust(new Date(e,c,b)):this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay));return this.formatDate(this._get(a,"dateFormat"),b,this._getFormatConfig(a))}});d.fn.datepicker=
function(a){if(!this.length)return this;if(!d.datepicker.initialized){d(document).mousedown(d.datepicker._checkExternalClick).find("body").append(d.datepicker.dpDiv);d.datepicker.initialized=true}var b=Array.prototype.slice.call(arguments,1);if(typeof a=="string"&&(a=="isDisabled"||a=="getDate"||a=="widget"))return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b));if(a=="option"&&arguments.length==2&&typeof arguments[1]=="string")return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,
[this[0]].concat(b));return this.each(function(){typeof a=="string"?d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this].concat(b)):d.datepicker._attachDatepicker(this,a)})};d.datepicker=new M;d.datepicker.initialized=false;d.datepicker.uuid=(new Date).getTime();d.datepicker.version="1.8.14";window["DP_jQuery_"+A]=d})(jQuery);
;/*
 * jQuery UI Progressbar 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function(b,d){b.widget("ui.progressbar",{options:{value:0,max:100},min:0,_create:function(){this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({role:"progressbar","aria-valuemin":this.min,"aria-valuemax":this.options.max,"aria-valuenow":this._value()});this.valueDiv=b("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);this.oldValue=this._value();this._refreshValue()},destroy:function(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");
this.valueDiv.remove();b.Widget.prototype.destroy.apply(this,arguments)},value:function(a){if(a===d)return this._value();this._setOption("value",a);return this},_setOption:function(a,c){if(a==="value"){this.options.value=c;this._refreshValue();this._value()===this.options.max&&this._trigger("complete")}b.Widget.prototype._setOption.apply(this,arguments)},_value:function(){var a=this.options.value;if(typeof a!=="number")a=0;return Math.min(this.options.max,Math.max(this.min,a))},_percentage:function(){return 100*
this._value()/this.options.max},_refreshValue:function(){var a=this.value(),c=this._percentage();if(this.oldValue!==a){this.oldValue=a;this._trigger("change")}this.valueDiv.toggle(a>this.min).toggleClass("ui-corner-right",a===this.options.max).width(c.toFixed(0)+"%");this.element.attr("aria-valuenow",a)}});b.extend(b.ui.progressbar,{version:"1.8.14"})})(jQuery);
;/*
 * jQuery UI Effects 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/
 */
jQuery.effects||function(f,j){function m(c){var a;if(c&&c.constructor==Array&&c.length==3)return c;if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c))return[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10)];if(a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c))return[parseFloat(a[1])*2.55,parseFloat(a[2])*2.55,parseFloat(a[3])*2.55];if(a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c))return[parseInt(a[1],
16),parseInt(a[2],16),parseInt(a[3],16)];if(a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c))return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)];if(/rgba\(0, 0, 0, 0\)/.exec(c))return n.transparent;return n[f.trim(c).toLowerCase()]}function s(c,a){var b;do{b=f.curCSS(c,a);if(b!=""&&b!="transparent"||f.nodeName(c,"body"))break;a="backgroundColor"}while(c=c.parentNode);return m(b)}function o(){var c=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,
a={},b,d;if(c&&c.length&&c[0]&&c[c[0]])for(var e=c.length;e--;){b=c[e];if(typeof c[b]=="string"){d=b.replace(/\-(\w)/g,function(g,h){return h.toUpperCase()});a[d]=c[b]}}else for(b in c)if(typeof c[b]==="string")a[b]=c[b];return a}function p(c){var a,b;for(a in c){b=c[a];if(b==null||f.isFunction(b)||a in t||/scrollbar/.test(a)||!/color/i.test(a)&&isNaN(parseFloat(b)))delete c[a]}return c}function u(c,a){var b={_:0},d;for(d in a)if(c[d]!=a[d])b[d]=a[d];return b}function k(c,a,b,d){if(typeof c=="object"){d=
a;b=null;a=c;c=a.effect}if(f.isFunction(a)){d=a;b=null;a={}}if(typeof a=="number"||f.fx.speeds[a]){d=b;b=a;a={}}if(f.isFunction(b)){d=b;b=null}a=a||{};b=b||a.duration;b=f.fx.off?0:typeof b=="number"?b:b in f.fx.speeds?f.fx.speeds[b]:f.fx.speeds._default;d=d||a.complete;return[c,a,b,d]}function l(c){if(!c||typeof c==="number"||f.fx.speeds[c])return true;if(typeof c==="string"&&!f.effects[c])return true;return false}f.effects={};f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor",
"borderTopColor","borderColor","color","outlineColor"],function(c,a){f.fx.step[a]=function(b){if(!b.colorInit){b.start=s(b.elem,a);b.end=m(b.end);b.colorInit=true}b.elem.style[a]="rgb("+Math.max(Math.min(parseInt(b.pos*(b.end[0]-b.start[0])+b.start[0],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[1]-b.start[1])+b.start[1],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[2]-b.start[2])+b.start[2],10),255),0)+")"}});var n={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,
0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,
211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]},q=["add","remove","toggle"],t={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};f.effects.animateClass=function(c,a,b,
d){if(f.isFunction(b)){d=b;b=null}return this.queue(function(){var e=f(this),g=e.attr("style")||" ",h=p(o.call(this)),r,v=e.attr("class");f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])});r=p(o.call(this));e.attr("class",v);e.animate(u(h,r),{queue:false,duration:a,easing:b,complete:function(){f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])});if(typeof e.attr("style")=="object"){e.attr("style").cssText="";e.attr("style").cssText=g}else e.attr("style",g);d&&d.apply(this,arguments);f.dequeue(this)}})})};
f.fn.extend({_addClass:f.fn.addClass,addClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{add:c},a,b,d]):this._addClass(c)},_removeClass:f.fn.removeClass,removeClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{remove:c},a,b,d]):this._removeClass(c)},_toggleClass:f.fn.toggleClass,toggleClass:function(c,a,b,d,e){return typeof a=="boolean"||a===j?b?f.effects.animateClass.apply(this,[a?{add:c}:{remove:c},b,d,e]):this._toggleClass(c,a):f.effects.animateClass.apply(this,
[{toggle:c},a,b,d])},switchClass:function(c,a,b,d,e){return f.effects.animateClass.apply(this,[{add:a,remove:c},b,d,e])}});f.extend(f.effects,{version:"1.8.14",save:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.data("ec.storage."+a[b],c[0].style[a[b]])},restore:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.css(a[b],c.data("ec.storage."+a[b]))},setMode:function(c,a){if(a=="toggle")a=c.is(":hidden")?"show":"hide";return a},getBaseline:function(c,a){var b;switch(c[0]){case "top":b=
0;break;case "middle":b=0.5;break;case "bottom":b=1;break;default:b=c[0]/a.height}switch(c[1]){case "left":c=0;break;case "center":c=0.5;break;case "right":c=1;break;default:c=c[1]/a.width}return{x:c,y:b}},createWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent();var a={width:c.outerWidth(true),height:c.outerHeight(true),"float":c.css("float")},b=f("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0});
c.wrap(b);b=c.parent();if(c.css("position")=="static"){b.css({position:"relative"});c.css({position:"relative"})}else{f.extend(a,{position:c.css("position"),zIndex:c.css("z-index")});f.each(["top","left","bottom","right"],function(d,e){a[e]=c.css(e);if(isNaN(parseInt(a[e],10)))a[e]="auto"});c.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})}return b.css(a).show()},removeWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent().replaceWith(c);return c},setTransition:function(c,
a,b,d){d=d||{};f.each(a,function(e,g){unit=c.cssUnit(g);if(unit[0]>0)d[g]=unit[0]*b+unit[1]});return d}});f.fn.extend({effect:function(c){var a=k.apply(this,arguments),b={options:a[1],duration:a[2],callback:a[3]};a=b.options.mode;var d=f.effects[c];if(f.fx.off||!d)return a?this[a](b.duration,b.callback):this.each(function(){b.callback&&b.callback.call(this)});return d.call(this,b)},_show:f.fn.show,show:function(c){if(l(c))return this._show.apply(this,arguments);else{var a=k.apply(this,arguments);
a[1].mode="show";return this.effect.apply(this,a)}},_hide:f.fn.hide,hide:function(c){if(l(c))return this._hide.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="hide";return this.effect.apply(this,a)}},__toggle:f.fn.toggle,toggle:function(c){if(l(c)||typeof c==="boolean"||f.isFunction(c))return this.__toggle.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="toggle";return this.effect.apply(this,a)}},cssUnit:function(c){var a=this.css(c),b=[];f.each(["em","px","%",
"pt"],function(d,e){if(a.indexOf(e)>0)b=[parseFloat(a),e]});return b}});f.easing.jswing=f.easing.swing;f.extend(f.easing,{def:"easeOutQuad",swing:function(c,a,b,d,e){return f.easing[f.easing.def](c,a,b,d,e)},easeInQuad:function(c,a,b,d,e){return d*(a/=e)*a+b},easeOutQuad:function(c,a,b,d,e){return-d*(a/=e)*(a-2)+b},easeInOutQuad:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a+b;return-d/2*(--a*(a-2)-1)+b},easeInCubic:function(c,a,b,d,e){return d*(a/=e)*a*a+b},easeOutCubic:function(c,a,b,d,e){return d*
((a=a/e-1)*a*a+1)+b},easeInOutCubic:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a+b;return d/2*((a-=2)*a*a+2)+b},easeInQuart:function(c,a,b,d,e){return d*(a/=e)*a*a*a+b},easeOutQuart:function(c,a,b,d,e){return-d*((a=a/e-1)*a*a*a-1)+b},easeInOutQuart:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a+b;return-d/2*((a-=2)*a*a*a-2)+b},easeInQuint:function(c,a,b,d,e){return d*(a/=e)*a*a*a*a+b},easeOutQuint:function(c,a,b,d,e){return d*((a=a/e-1)*a*a*a*a+1)+b},easeInOutQuint:function(c,a,b,d,e){if((a/=
e/2)<1)return d/2*a*a*a*a*a+b;return d/2*((a-=2)*a*a*a*a+2)+b},easeInSine:function(c,a,b,d,e){return-d*Math.cos(a/e*(Math.PI/2))+d+b},easeOutSine:function(c,a,b,d,e){return d*Math.sin(a/e*(Math.PI/2))+b},easeInOutSine:function(c,a,b,d,e){return-d/2*(Math.cos(Math.PI*a/e)-1)+b},easeInExpo:function(c,a,b,d,e){return a==0?b:d*Math.pow(2,10*(a/e-1))+b},easeOutExpo:function(c,a,b,d,e){return a==e?b+d:d*(-Math.pow(2,-10*a/e)+1)+b},easeInOutExpo:function(c,a,b,d,e){if(a==0)return b;if(a==e)return b+d;if((a/=
e/2)<1)return d/2*Math.pow(2,10*(a-1))+b;return d/2*(-Math.pow(2,-10*--a)+2)+b},easeInCirc:function(c,a,b,d,e){return-d*(Math.sqrt(1-(a/=e)*a)-1)+b},easeOutCirc:function(c,a,b,d,e){return d*Math.sqrt(1-(a=a/e-1)*a)+b},easeInOutCirc:function(c,a,b,d,e){if((a/=e/2)<1)return-d/2*(Math.sqrt(1-a*a)-1)+b;return d/2*(Math.sqrt(1-(a-=2)*a)+1)+b},easeInElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/
h);return-(h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g))+b},easeOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*a)*Math.sin((a*e-c)*2*Math.PI/g)+d+b},easeInOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e/2)==2)return b+d;g||(g=e*0.3*1.5);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);if(a<1)return-0.5*
h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)+b;return h*Math.pow(2,-10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)*0.5+d+b},easeInBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*(a/=e)*a*((g+1)*a-g)+b},easeOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*((a=a/e-1)*a*((g+1)*a+g)+1)+b},easeInOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;if((a/=e/2)<1)return d/2*a*a*(((g*=1.525)+1)*a-g)+b;return d/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b},easeInBounce:function(c,a,b,d,e){return d-f.easing.easeOutBounce(c,
e-a,0,d,e)+b},easeOutBounce:function(c,a,b,d,e){return(a/=e)<1/2.75?d*7.5625*a*a+b:a<2/2.75?d*(7.5625*(a-=1.5/2.75)*a+0.75)+b:a<2.5/2.75?d*(7.5625*(a-=2.25/2.75)*a+0.9375)+b:d*(7.5625*(a-=2.625/2.75)*a+0.984375)+b},easeInOutBounce:function(c,a,b,d,e){if(a<e/2)return f.easing.easeInBounce(c,a*2,0,d,e)*0.5+b;return f.easing.easeOutBounce(c,a*2-e,0,d,e)*0.5+d*0.5+b}})}(jQuery);
;/*
 * jQuery UI Effects Blind 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(b){b.effects.blind=function(c){return this.queue(function(){var a=b(this),g=["position","top","bottom","left","right"],f=b.effects.setMode(a,c.options.mode||"hide"),d=c.options.direction||"vertical";b.effects.save(a,g);a.show();var e=b.effects.createWrapper(a).css({overflow:"hidden"}),h=d=="vertical"?"height":"width";d=d=="vertical"?e.height():e.width();f=="show"&&e.css(h,0);var i={};i[h]=f=="show"?d:0;e.animate(i,c.duration,c.options.easing,function(){f=="hide"&&a.hide();b.effects.restore(a,
g);b.effects.removeWrapper(a);c.callback&&c.callback.apply(a[0],arguments);a.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Bounce 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(e){e.effects.bounce=function(b){return this.queue(function(){var a=e(this),l=["position","top","bottom","left","right"],h=e.effects.setMode(a,b.options.mode||"effect"),d=b.options.direction||"up",c=b.options.distance||20,m=b.options.times||5,i=b.duration||250;/show|hide/.test(h)&&l.push("opacity");e.effects.save(a,l);a.show();e.effects.createWrapper(a);var f=d=="up"||d=="down"?"top":"left";d=d=="up"||d=="left"?"pos":"neg";c=b.options.distance||(f=="top"?a.outerHeight({margin:true})/3:a.outerWidth({margin:true})/
3);if(h=="show")a.css("opacity",0).css(f,d=="pos"?-c:c);if(h=="hide")c/=m*2;h!="hide"&&m--;if(h=="show"){var g={opacity:1};g[f]=(d=="pos"?"+=":"-=")+c;a.animate(g,i/2,b.options.easing);c/=2;m--}for(g=0;g<m;g++){var j={},k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing);c=h=="hide"?c*2:c/2}if(h=="hide"){g={opacity:0};g[f]=(d=="pos"?"-=":"+=")+c;a.animate(g,i/2,b.options.easing,function(){a.hide();e.effects.restore(a,l);e.effects.removeWrapper(a);
b.callback&&b.callback.apply(this,arguments)})}else{j={};k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing,function(){e.effects.restore(a,l);e.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments)})}a.queue("fx",function(){a.dequeue()});a.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Clip 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Clip
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(b){b.effects.clip=function(e){return this.queue(function(){var a=b(this),i=["position","top","bottom","left","right","height","width"],f=b.effects.setMode(a,e.options.mode||"hide"),c=e.options.direction||"vertical";b.effects.save(a,i);a.show();var d=b.effects.createWrapper(a).css({overflow:"hidden"});d=a[0].tagName=="IMG"?d:a;var g={size:c=="vertical"?"height":"width",position:c=="vertical"?"top":"left"};c=c=="vertical"?d.height():d.width();if(f=="show"){d.css(g.size,0);d.css(g.position,
c/2)}var h={};h[g.size]=f=="show"?c:0;h[g.position]=f=="show"?0:c/2;d.animate(h,{queue:false,duration:e.duration,easing:e.options.easing,complete:function(){f=="hide"&&a.hide();b.effects.restore(a,i);b.effects.removeWrapper(a);e.callback&&e.callback.apply(a[0],arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Drop 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(c){c.effects.drop=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right","opacity"],e=c.effects.setMode(a,d.options.mode||"hide"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a);var f=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var g=d.options.distance||(f=="top"?a.outerHeight({margin:true})/2:a.outerWidth({margin:true})/2);if(e=="show")a.css("opacity",0).css(f,b=="pos"?-g:g);var i={opacity:e==
"show"?1:0};i[f]=(e=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+g;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){e=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Explode 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Explode
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(j){j.effects.explode=function(a){return this.queue(function(){var c=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3,d=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3;a.options.mode=a.options.mode=="toggle"?j(this).is(":visible")?"hide":"show":a.options.mode;var b=j(this).show().css("visibility","hidden"),g=b.offset();g.top-=parseInt(b.css("marginTop"),10)||0;g.left-=parseInt(b.css("marginLeft"),10)||0;for(var h=b.outerWidth(true),i=b.outerHeight(true),e=0;e<c;e++)for(var f=
0;f<d;f++)b.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-f*(h/d),top:-e*(i/c)}).parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:h/d,height:i/c,left:g.left+f*(h/d)+(a.options.mode=="show"?(f-Math.floor(d/2))*(h/d):0),top:g.top+e*(i/c)+(a.options.mode=="show"?(e-Math.floor(c/2))*(i/c):0),opacity:a.options.mode=="show"?0:1}).animate({left:g.left+f*(h/d)+(a.options.mode=="show"?0:(f-Math.floor(d/2))*(h/d)),top:g.top+
e*(i/c)+(a.options.mode=="show"?0:(e-Math.floor(c/2))*(i/c)),opacity:a.options.mode=="show"?1:0},a.duration||500);setTimeout(function(){a.options.mode=="show"?b.css({visibility:"visible"}):b.css({visibility:"visible"}).hide();a.callback&&a.callback.apply(b[0]);b.dequeue();j("div.ui-effects-explode").remove()},a.duration||500)})}})(jQuery);
;/*
 * jQuery UI Effects Fade 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Fade
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(b){b.effects.fade=function(a){return this.queue(function(){var c=b(this),d=b.effects.setMode(c,a.options.mode||"hide");c.animate({opacity:d},{queue:false,duration:a.duration,easing:a.options.easing,complete:function(){a.callback&&a.callback.apply(this,arguments);c.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Fold 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Fold
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(c){c.effects.fold=function(a){return this.queue(function(){var b=c(this),j=["position","top","bottom","left","right"],d=c.effects.setMode(b,a.options.mode||"hide"),g=a.options.size||15,h=!!a.options.horizFirst,k=a.duration?a.duration/2:c.fx.speeds._default/2;c.effects.save(b,j);b.show();var e=c.effects.createWrapper(b).css({overflow:"hidden"}),f=d=="show"!=h,l=f?["width","height"]:["height","width"];f=f?[e.width(),e.height()]:[e.height(),e.width()];var i=/([0-9]+)%/.exec(g);if(i)g=parseInt(i[1],
10)/100*f[d=="hide"?0:1];if(d=="show")e.css(h?{height:0,width:g}:{height:g,width:0});h={};i={};h[l[0]]=d=="show"?f[0]:g;i[l[1]]=d=="show"?f[1]:0;e.animate(h,k,a.options.easing).animate(i,k,a.options.easing,function(){d=="hide"&&b.hide();c.effects.restore(b,j);c.effects.removeWrapper(b);a.callback&&a.callback.apply(b[0],arguments);b.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Highlight 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Highlight
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(b){b.effects.highlight=function(c){return this.queue(function(){var a=b(this),e=["backgroundImage","backgroundColor","opacity"],d=b.effects.setMode(a,c.options.mode||"show"),f={backgroundColor:a.css("backgroundColor")};if(d=="hide")f.opacity=0;b.effects.save(a,e);a.show().css({backgroundImage:"none",backgroundColor:c.options.color||"#ffff99"}).animate(f,{queue:false,duration:c.duration,easing:c.options.easing,complete:function(){d=="hide"&&a.hide();b.effects.restore(a,e);d=="show"&&!b.support.opacity&&
this.style.removeAttribute("filter");c.callback&&c.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Pulsate 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Pulsate
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(d){d.effects.pulsate=function(a){return this.queue(function(){var b=d(this),c=d.effects.setMode(b,a.options.mode||"show");times=(a.options.times||5)*2-1;duration=a.duration?a.duration/2:d.fx.speeds._default/2;isVisible=b.is(":visible");animateTo=0;if(!isVisible){b.css("opacity",0).show();animateTo=1}if(c=="hide"&&isVisible||c=="show"&&!isVisible)times--;for(c=0;c<times;c++){b.animate({opacity:animateTo},duration,a.options.easing);animateTo=(animateTo+1)%2}b.animate({opacity:animateTo},duration,
a.options.easing,function(){animateTo==0&&b.hide();a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()}).dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Scale 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Scale
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(c){c.effects.puff=function(b){return this.queue(function(){var a=c(this),e=c.effects.setMode(a,b.options.mode||"hide"),g=parseInt(b.options.percent,10)||150,h=g/100,i={height:a.height(),width:a.width()};c.extend(b.options,{fade:true,mode:e,percent:e=="hide"?g:100,from:e=="hide"?i:{height:i.height*h,width:i.width*h}});a.effect("scale",b.options,b.duration,b.callback);a.dequeue()})};c.effects.scale=function(b){return this.queue(function(){var a=c(this),e=c.extend(true,{},b.options),g=c.effects.setMode(a,
b.options.mode||"effect"),h=parseInt(b.options.percent,10)||(parseInt(b.options.percent,10)==0?0:g=="hide"?0:100),i=b.options.direction||"both",f=b.options.origin;if(g!="effect"){e.origin=f||["middle","center"];e.restore=true}f={height:a.height(),width:a.width()};a.from=b.options.from||(g=="show"?{height:0,width:0}:f);h={y:i!="horizontal"?h/100:1,x:i!="vertical"?h/100:1};a.to={height:f.height*h.y,width:f.width*h.x};if(b.options.fade){if(g=="show"){a.from.opacity=0;a.to.opacity=1}if(g=="hide"){a.from.opacity=
1;a.to.opacity=0}}e.from=a.from;e.to=a.to;e.mode=g;a.effect("size",e,b.duration,b.callback);a.dequeue()})};c.effects.size=function(b){return this.queue(function(){var a=c(this),e=["position","top","bottom","left","right","width","height","overflow","opacity"],g=["position","top","bottom","left","right","overflow","opacity"],h=["width","height","overflow"],i=["fontSize"],f=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],k=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"],
p=c.effects.setMode(a,b.options.mode||"effect"),n=b.options.restore||false,m=b.options.scale||"both",l=b.options.origin,j={height:a.height(),width:a.width()};a.from=b.options.from||j;a.to=b.options.to||j;if(l){l=c.effects.getBaseline(l,j);a.from.top=(j.height-a.from.height)*l.y;a.from.left=(j.width-a.from.width)*l.x;a.to.top=(j.height-a.to.height)*l.y;a.to.left=(j.width-a.to.width)*l.x}var d={from:{y:a.from.height/j.height,x:a.from.width/j.width},to:{y:a.to.height/j.height,x:a.to.width/j.width}};
if(m=="box"||m=="both"){if(d.from.y!=d.to.y){e=e.concat(f);a.from=c.effects.setTransition(a,f,d.from.y,a.from);a.to=c.effects.setTransition(a,f,d.to.y,a.to)}if(d.from.x!=d.to.x){e=e.concat(k);a.from=c.effects.setTransition(a,k,d.from.x,a.from);a.to=c.effects.setTransition(a,k,d.to.x,a.to)}}if(m=="content"||m=="both")if(d.from.y!=d.to.y){e=e.concat(i);a.from=c.effects.setTransition(a,i,d.from.y,a.from);a.to=c.effects.setTransition(a,i,d.to.y,a.to)}c.effects.save(a,n?e:g);a.show();c.effects.createWrapper(a);
a.css("overflow","hidden").css(a.from);if(m=="content"||m=="both"){f=f.concat(["marginTop","marginBottom"]).concat(i);k=k.concat(["marginLeft","marginRight"]);h=e.concat(f).concat(k);a.find("*[width]").each(function(){child=c(this);n&&c.effects.save(child,h);var o={height:child.height(),width:child.width()};child.from={height:o.height*d.from.y,width:o.width*d.from.x};child.to={height:o.height*d.to.y,width:o.width*d.to.x};if(d.from.y!=d.to.y){child.from=c.effects.setTransition(child,f,d.from.y,child.from);
child.to=c.effects.setTransition(child,f,d.to.y,child.to)}if(d.from.x!=d.to.x){child.from=c.effects.setTransition(child,k,d.from.x,child.from);child.to=c.effects.setTransition(child,k,d.to.x,child.to)}child.css(child.from);child.animate(child.to,b.duration,b.options.easing,function(){n&&c.effects.restore(child,h)})})}a.animate(a.to,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){a.to.opacity===0&&a.css("opacity",a.from.opacity);p=="hide"&&a.hide();c.effects.restore(a,
n?e:g);c.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Shake 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Shake
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(d){d.effects.shake=function(a){return this.queue(function(){var b=d(this),j=["position","top","bottom","left","right"];d.effects.setMode(b,a.options.mode||"effect");var c=a.options.direction||"left",e=a.options.distance||20,l=a.options.times||3,f=a.duration||a.options.duration||140;d.effects.save(b,j);b.show();d.effects.createWrapper(b);var g=c=="up"||c=="down"?"top":"left",h=c=="up"||c=="left"?"pos":"neg";c={};var i={},k={};c[g]=(h=="pos"?"-=":"+=")+e;i[g]=(h=="pos"?"+=":"-=")+e*2;k[g]=
(h=="pos"?"-=":"+=")+e*2;b.animate(c,f,a.options.easing);for(e=1;e<l;e++)b.animate(i,f,a.options.easing).animate(k,f,a.options.easing);b.animate(i,f,a.options.easing).animate(c,f/2,a.options.easing,function(){d.effects.restore(b,j);d.effects.removeWrapper(b);a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()});b.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Slide 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(c){c.effects.slide=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right"],f=c.effects.setMode(a,d.options.mode||"show"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a).css({overflow:"hidden"});var g=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var e=d.options.distance||(g=="top"?a.outerHeight({margin:true}):a.outerWidth({margin:true}));if(f=="show")a.css(g,b=="pos"?isNaN(e)?"-"+e:-e:e);
var i={};i[g]=(f=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+e;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){f=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Transfer 1.8.14
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Transfer
 *
 * Depends:
 *  jquery.effects.core.js
 */
(function(e){e.effects.transfer=function(a){return this.queue(function(){var b=e(this),c=e(a.options.to),d=c.offset();c={top:d.top,left:d.left,height:c.innerHeight(),width:c.innerWidth()};d=b.offset();var f=e('<div class="ui-effects-transfer"></div>').appendTo(document.body).addClass(a.options.className).css({top:d.top,left:d.left,height:b.innerHeight(),width:b.innerWidth(),position:"absolute"}).animate(c,a.duration,a.options.easing,function(){f.remove();a.callback&&a.callback.apply(b[0],arguments);
b.dequeue()})})}})(jQuery);
;




/*
 * jQuery UI Effects Slide 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Customized to take useVisibility option, which, when true, sets the visibility
 * of the element to hidden rather than hiding it, which will preserve the space it
 * takes on the page
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.slide = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'show'); // Set Mode
		var direction = o.options.direction || 'left'; // Default Direction

		// Adjust
		$.effects.save(el, props); el.css("visibility","visible").show(); // Save & Show
		$.effects.createWrapper(el).css({overflow:'hidden'}); // Create Wrapper
		var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';
		var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';
		var distance = o.options.distance || (ref == 'top' ? el.outerHeight({margin:true}) : el.outerWidth({margin:true}));
		if (mode == 'show') el.css(ref, motion == 'pos' ? -distance : distance); // Shift

		// Animation
		var animation = {};
		animation[ref] = (mode == 'show' ? (motion == 'pos' ? '+=' : '-=') : (motion == 'pos' ? '-=' : '+=')) + distance;

		// Animate
		el.animate(animation, { queue: false, duration: o.duration, easing: o.options.easing, complete: function() {
			if(mode == 'hide')
			  o.options.useVisibility ? el.css("visibility","hidden") : el.hide(); // Hide
			$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(this, arguments); // Callback
			el.dequeue();
		}});

	});

};

})(jQuery);

(function ($) {
  var m = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  },
  s = {
    'array': function (x) {
      var a = ['['], b, f, i, l = x.length, v;
      for (i = 0; i < l; i += 1) {
          v = x[i];
          f = s[typeof v];
          if (f) {
              v = f(v);
              if (typeof v == 'string') {
                  if (b) {
                      a[a.length] = ',';
                  }
                  a[a.length] = v;
                  b = true;
              }
          }
      }
      a[a.length] = ']';
      return a.join('');
    },
    'boolean': function (x) {
        return String(x);
    },
    'null': function (x) {
        return "null";
    },
    'number': function (x) {
        return isFinite(x) ? String(x) : 'null';
    },
    'object': function (x) {
        if (x) {
            if (Object.prototype.toString.apply(x) == "[object Array]" || x instanceof Array) {
                return s.array(x);
            }
            var a = ['{'], b, f, i, v;
            for (i in x) {
                v = x[i];
                f = s[typeof v];
                if (f) {
                    v = f(v);
                    if (typeof v == 'string') {
                        if (b) {
                            a[a.length] = ',';
                        }
                        a.push(s.string(i), ':', v);
                        b = true;
                    }
                }
            }
            a[a.length] = '}';
            return a.join('');
        }
        return 'null';
    },
    'string': function (x) {
      if (/["\\\x00-\x1f]/.test(x)) {
        x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
          var c = m[b];
          if (c) {
            return c;
          }
          c = b.charCodeAt();
          return '\\u00' +
            Math.floor(c / 16).toString(16) +
            (c % 16).toString(16);
          });
      }
      return '"' + x + '"';
    }
  };

  $.toJSON = function(v) {
    var f = isNaN(v) ? s[typeof v] : s['number'];
    if (f) return f(v);
  };
  
  $.parseJSON = function(v, safe) {
    if (safe === undefined) safe = $.parseJSON.safe;
    if (safe && !(/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/).test(v))
      return undefined;
    return eval('('+v+')');
  };
  
  $.parseJSON.safe = false;
  
})(jQuery);

/*
    http://www.JSON.org/json2.js
    2011-01-18

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

// History.js
// New-BSD License, Copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>

(function(window,undefined){

	// --------------------------------------------------------------------------
	// Initialise

	// History Object
	window.History = window.History||{};

	// Localise Globals
	var
		document = window.document, // Make sure we are using the correct document
		_History = {}, // Private History Object
		History = window.History, // Public History Object
		history = window.history; // Old History Object

	// Check Existence of History.js
	if ( typeof History.emulated !== 'undefined' ) {
		throw new Error('History.js has already been emulated...');
	}

	// Initialise
	History.init = function(){

		// ----------------------------------------------------------------------
		// Debug Helpers

		/**
		 * History.options
		 * Configurable options
		 */
		History.options = {
			/**
			 * History.options.hashChangeCheckerDelay
			 * How long should the interval be before hashchange checks
			 */
			hashChangeCheckerDelay: 100
		};

		// ----------------------------------------------------------------------
		// Debug Helpers

		/**
		 * History.debug(message,...)
		 * Logs the passed arguments if debug enabled
		 */
		History.debug = function(){
			if ( (History.debug.enable||false) ) {
				History.log.apply(History,arguments);
			}
		};
		History.debug.enable = false;

		/**
		 * History.log(message,...)
		 * Logs the passed arguments
		 */
		History.log = function(){
			// Prepare
			var consoleExists = typeof console !== 'undefined';

			// Write to Console
			if ( consoleExists ) {
				console.log.apply(console,[arguments]);
			}

			// Write to log
			var message = "\n"+arguments[0]+"\n";
			for ( var i=1,n=arguments.length; i<n; ++i ) {
				message += "\n"+arguments[i]+"\n";
			}
			var textarea = document.getElementById('log');
			if ( textarea ) {
				textarea.value += message+"\n-----\n";
			} else if ( !consoleExists ) {
				alert(message);
			}

			// Return true
			return true;
		}

		// ----------------------------------------------------------------------
		// Emulated Status

		/**
		 * _History.getInternetExplorerMajorVersion()
		 * Get's the major version of Internet Explorer
		 * @return {integer}
		 * @license Public Domain
		 * @author Benjamin Lupton <contact@balupton.com>
		 * @author James Padolsey <https://gist.github.com/527683>
		 */
		_History.getInternetExplorerMajorVersion = function(){
			return _History.getInternetExplorerMajorVersion.cached =
					(typeof _History.getInternetExplorerMajorVersion.cached !== 'undefined')
				?	_History.getInternetExplorerMajorVersion.cached
				:	(function(){
						var undef,
								v = 3,
								div = document.createElement('div'),
								all = div.getElementsByTagName('i');
						while (
								div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
								all[0]
						);
						return v > 4 ? v : undef;
					})()
				;
		};

		/**
		 * _History.isInternetExplorer()
		 * Are we using Internet Explorer?
		 * @return {boolean}
		 * @license Public Domain
		 * @author Benjamin Lupton <contact@balupton.com>
		 */
		_History.isInternetExplorer = function(){
			return _History.isInternetExplorer.cached =
					(typeof _History.isInternetExplorer.cached !== 'undefined')
				?	_History.isInternetExplorer.cached
				:	(_History.getInternetExplorerMajorVersion() !== 0)
				;
		};

		/**
		 * History.emulated
		 * Which features require emulating?
		 */
		History.emulated = {
			pushState: !Boolean(window.history && window.history.pushState && window.history.replaceState),
			hashChange: Boolean(
				!('onhashchange' in window || 'onhashchange' in document)
				||
				(_History.isInternetExplorer() && _History.getInternetExplorerMajorVersion() < 8)
			)
		};

		/**
		 * _History.isEmptyObject(obj)
		 * Checks to see if the Object is Empty
		 * @param {Object} obj
		 * @return {boolean}
		 */
		_History.isEmptyObject = function(obj) {
			for ( var key in obj ) {
				if ( !this.hasOwnProperty(key) ) {
					continue;
				}
				return false;
			}
			return true;
		};

		/**
		 * _History.cloneObject(obj)
		 * Clones a object
		 * @param {Object} obj
		 * @return {Object}
		 */
		_History.cloneObject = function(obj) {
			var hash,newObj;
			if ( obj ) {
				hash = JSON.stringify(obj);
				newObj = JSON.parse(hash);
			}
			else {
				newObj = {};
			}
			return newObj;
		};


		// ----------------------------------------------------------------------
		// Hash Helpers

		/**
		 * History.setHash(hash)
		 * Sets the document hash
		 * @param {string} hash
		 * @return {string}
		 */
		History.setHash = function(hash){
			// Prepare
			var adjustedHash = _History.escapeHash(hash);

			// Log hash
			History.debug('History.setHash',this,arguments,'hash:',hash,'adjustedHash:',adjustedHash,'oldHash:',document.location.hash);

			// Apply hash
			document.location.hash = adjustedHash;

			// Return hash
			return hash;
		};

		/**
		 * History.getHash()
		 * Gets the current document hash
		 * @return {string}
		 */
		History.getHash = function(){
			var hash = _History.unescapeHash(document.location.hash);
			return hash;
		};

		/**
		 * _History.escape()
		 * Normalise and Escape a Hash
		 * @return {string}
		 */
		_History.escapeHash = function(hash){
			var result = _History.normalizeHash(hash);

			// Escape hash
			if ( /[^a-zA-Z0-9\/\-\_\%\.]/.test(result) ) {
				result = escape(result);
			}

			// Return result
			return result;
		};

		/**
		 * _History.unescapeHash()
		 * Normalise and Unescape a Hash
		 * @return {string}
		 */
		_History.unescapeHash = function(hash){
			var result = _History.normalizeHash(hash);

			// Unescape hash
			if ( /[\%]/.test(result) ) {
				result = unescape(result);
			}

			// Return result
			return result;
		};

		/**
		 * _History.normalizeHash()
		 * Normalise a hash across browsers
		 * @return {string}
		 */
		_History.normalizeHash = function(hash){
			var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');

			// Return result
			return result;
		};

		/**
		 * History.extractHashFromUrl(url)
		 * Extracts the Hash from a URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.extractHashFromUrl = function(url){
			// Extract the hash
			var hash = String(url)
				.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')
				;

			// Unescape hash
			hash = _History.unescapeHash(hash);

			// Return hash
			return hash;
		};

		/**
		 * History.isTraditionalAnchor(url)
		 * Checks to see if the url is a traditional anchor
		 * @param {string} url
		 * @return {boolean}
		 */
		History.isTraditionalAnchor = function(url){
			var
				hash = History.extractHashFromUrl(url),
				el = document.getElementById(hash),
				exists = typeof el !== 'undefined';

			return exists;
		}

		// ----------------------------------------------------------------------
		// State Object Helpers

		/**
		 * History.contractUrl(url)
		 * Ensures that we have a relative URL and not a absolute URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.contractUrl = function(url){
			// Prepare
			url = History.expandUrl(url);

			// Prepare for Base Domain
			var baseDomain = document.location.protocol+'//'+(document.location.hostname||document.location.host);
			if ( document.location.port||false ) {
				baseDomain += ':'+document.location.port;
			}
			baseDomain += '/';

			// Adjust for Base Domain
			url = url.replace(baseDomain,'/');

			// Return url
			return url;
		};

		/**
		 * History.expandUrl(url)
		 * Ensures that we have an absolute URL and not a relative URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.expandUrl = function(url){
			// Prepare
			url = url||'';

			// Test for Full URL
			if ( /[a-z]+\:\/\//.test(url) ) {
				// We have a Full URL
			}

			// Relative URL
			else {
				// Test for Base Page
				if ( url.length === 0 || url.substring(0,1) === '?' ) {
					// Fetch Base Page
					var basePage = document.location.href.replace(/[#\?].*/,'');

					// Adjust Page
					url = basePage+url;
				}

				// No Base Page
				else {

					// Prepare for Base Element
					var
						baseElements = document.getElementsByTagName('base'),
						baseElement = null,
						baseHref = '';

					// Test for Base Element
					if ( baseElements.length === 1 ) {
						// Prepare for Base Element
						baseElement = baseElements[0];
						baseHref = baseElement.href;
						if ( baseHref[baseHref.length-1] !== '/' ) baseHref += '/';

						// Adjust for Base Element
						url = baseHref+url.replace(/^\//,'');
					}

					// No Base Element
					else {
						// Test for Base URL
						if ( url.substring(0,1) === '.' ) {
							// Prepare for Base URL
							var baseUrl = document.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,'');
							if ( baseUrl[baseUrl.length-1] !== '/' ) baseUrl += '/';

							// Adjust for Base URL
							url = baseUrl + url;
						}

						// No Base URL
						else {
							// Prepare for Base Domain
							var baseDomain = document.location.protocol+'//'+(document.location.hostname||document.location.host);
							if ( document.location.port||false ) {
								baseDomain += ':'+document.location.port;
							}
							baseDomain += '/';

							// Adjust for Base Domain
							url = baseDomain+url.replace(/^\//,'');
						}
					}
				}
			}

			// Return url
			return url;
		};

		/**
		 * History.expandState(State)
		 * Expands a State Object
		 * @param {object} State
		 * @return {object}
		 */
		History.expandState = function(oldState){
			oldState = oldState||{};
			var newState = {
				'data': oldState.data||{},
				'url': History.expandUrl(oldState.url||''),
				'title': oldState.title||''
			};
			newState.data.title = newState.data.title||newState.title;
			newState.data.url = newState.data.url||newState.url;
			return newState;
		};

		/**
		 * History.createStateObject(data,title,url)
		 * Creates a object based on the data, title and url state params
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {object}
		 */
		History.createStateObject = function(data,title,url){
			// Hashify
			var State = {
				"data": data,
				"title": title,
				"url": url
			};

			// Expand the State
			State = History.expandState(State);

			// Return object
			return State;
		};

		/**
		 * History.expandHash(hash)
		 * Expands a Hash into a StateHash if applicable
		 * @param {string} hash
		 * @return {Object|null} State
		 */
		History.expandHash = function(hash){
			// Prepare
			var State = null;

			// JSON
			try {
				State = JSON.parse(hash);
			}
			catch ( Exception ) {
				var
					parts = /(.*)\/uid=([0-9]+)$/.exec(hash),
					url = parts ? (parts[1]||hash) : hash,
					uid = parts ? String(parts[2]||'') : '';

				if ( uid ) {
					State = _History.getStateByUid(uid)||null;
				}

				if ( !State && /\//.test(hash) ) {
					// Is a URL
					var expandedUrl = History.expandUrl(hash);
					State = History.createStateObject(null,null,expandedUrl);
				}
				else {
					// Non State Hash
					// do nothing
				}
			}

			// Expand
			State = State ? History.expandState(State) : null;

			// Return State
			return State;
		};

		/**
		 * History.contractState(State)
		 * Creates a Hash for the State Object
		 * @param {object} passedState
		 * @return {string} hash
		 */
		History.contractState = function(passedState){
			// Check
			if ( !passedState ) {
				return null;
			}

			// Prepare
			var
				hash = null,
				State = _History.cloneObject(passedState);

			// Ensure State
			if ( State ) {
				// Clean
				State.data = State.data||{};
				delete State.data.title;
				delete State.data.url;

				// Handle
				if ( _History.isEmptyObject(State) && !State.title ) {
					hash = History.contractUrl(State.url);
				}
				else {
					// Serialised Hash
					hash = JSON.stringify(State);

					// Has it been associated with a UID?
					var uid;
					if ( typeof _History.hashesToUids[hash] !== 'undefined' ) {
						uid = _History.hashesToUids[hash];
					}
					else {
						while ( true ) {
							uid = String(Math.floor(Math.random()*1000));
							if ( typeof _History.uidsToStates[uid] === 'undefined' ) {
								break;
							}
						}
					}

					// Associate UID with Hash
					_History.hashesToUids[hash] = uid;
					_History.uidsToStates[uid] = State;

					// Simplified Hash
					hash = History.contractUrl(State.url)+'/uid='+uid;
				}
			}

			// Return hash
			return hash;
		};

		/**
		 * _History.uidsToStates
		 * UIDs to States
		 */
		_History.uidsToStates = {};

		/**
		 * _History.hashesToUids
		 * Serialised States to UIDs
		 */
		_History.hashesToUids = {};

		/**
		 * _History.getStateByUid(uid)
		 * Get a state by it's UID
		 * @param {string} uid
		 */
		_History.getStateByUid = function(uid){
			uid = String(uid);
			var State = _History.uidsToStates[uid]||undefined;
			return State;
		};


		// ----------------------------------------------------------------------
		// State Logging

		/**
		 * _History.statesByUrl
		 * Store the states indexed by their URLs
		 */
		_History.statesByUrl = {};

		/**
		 * _History.duplicateStateUrls
		 * Which urls have duplicate states (indexed by url)
		 */
		_History.duplicateStateUrls = {};

		/**
		 * _History.statesByHash
		 * Store the states indexed by their Hashes
		 */
		_History.statesByHash = {};

		/**
		 * _History.savedStates
		 * Store the states in an array
		 */
		_History.savedStates = [];

		/**
		 * History.getState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getState = function(){
			return _History.getStateByIndex();
		};

		/**
		 * History.getStateHash()
		 * Get the hash of the current state
		 * @return {string} hash
		 */
		History.getStateHash = function(){
			return History.contractState(History.getState());
		};

		/**
		 * _History.getStateByUrl
		 * Get a state by it's url
		 * @param {string} stateUrl
		 */
		_History.getStateByUrl = function(stateUrl){
			var State = _History.statesByUrl[stateUrl]||undefined;
			return State;
		};

		/**
		 * _History.getStateByHash
		 * Get a state by it's hash
		 * @param {string} stateHash
		 */
		_History.getStateByHash = function(stateHash){
			var State = _History.statesByHash[stateHash]||undefined;
			return State;
		};

		/**
		 * _History.storeState
		 * Store a State
		 * @param {object} State
		 * @return {boolean} true
		 */
		_History.storeState = function(newState){
			// Prepare
			var
				newStateHash = History.contractState(newState),
				oldState = _History.getStateByUrl(newState.url);

			// Check for Conflict
			if ( typeof oldState !== 'undefined' ) {
				// Compare Hashes
				var oldStateHash = History.contractState(oldState);
				if ( oldStateHash !== newStateHash ) {
					// We have a conflict
					_History.duplicateStateUrls[newState.url] = true;
				}
			}

			// Store the State
			_History.statesByUrl[newState.url] = _History.statesByHash[newStateHash] = newState;

			// Return true
			return true;
		};

		/**
		 * _History.isLastState(newState)
		 * Tests to see if the state is the last state
		 * @param {Object} newState
		 * @return {boolean} isLast
		 */
		_History.isLastState = function(newState){
			// Prepare
			var
				newStateHash = History.contractState(newState),
				oldStateHash = History.getStateHash();

			// Check
			var isLast = _History.savedStates.length && newStateHash === oldStateHash;

			// Return isLast
			return isLast;
		};

		/**
		 * _History.saveState
		 * Push a State
		 * @param {Object} newState
		 * @return {boolean} changed
		 */
		_History.saveState = function(newState){
			// Check Hash
			if ( _History.isLastState(newState) ) {
				return false;
			}

			// Push the State
			_History.savedStates.push(newState);

			// Return true
			return true;
		};

		/**
		 * _History.getStateByIndex()
		 * Gets a state by the index
		 * @param {integer} index
		 * @return {Object}
		 */
		_History.getStateByIndex = function(index){
			// Prepare
			var State = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				State = _History.savedStates[_History.savedStates.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				State = _History.savedStates[_History.savedStates.length+index];
			}
			else {
				// Get from the beginning
				State = _History.savedStates[index];
			}

			// Return State
			return State;
		};

		/**
		 * _History.stateUrlExists
		 * Checks if the State Url Exists
		 * @param {string} stateUrl
		 * @return {boolean} exists
		 */
		_History.stateUrlExists = function(stateUrl){
			// Prepare
			var exists = typeof _History.statesByUrl[stateUrl] !== 'undefined';

			// Return exists
			return exists;
		};

		/**
		 * _History.urlDuplicateExists
		 * Check if the url has multiple states associated to it
		 * @param {string} stateUrl
		 * @return {boolean} exists
		 */
		_History.urlDuplicateExists = function(stateUrl){
			var exists = typeof _History.duplicateStateUrls[stateUrl] !== 'undefined';
			return exists;
		};

		// ----------------------------------------------------------------------
		// Hash Logging

		/**
		 * _History.savedHashes
		 * Store the hashes in an array
		 */
		_History.savedHashes = [];

		/**
		 * _History.isLastHash(newHash)
		 * Checks if the hash is the last hash
		 * @param {string} newHash
		 * @return {boolean} true
		 */
		_History.isLastHash = function(newHash){
			// Prepare
			var oldHash = _History.getHashByIndex();

			// Check
			var isLast = newHash === oldHash;

			// Return isLast
			return isLast;
		};

		/**
		 * _History.saveHash(newHash)
		 * Push a Hash
		 * @param {string} newHash
		 * @return {boolean} true
		 */
		_History.saveHash = function(newHash){
			// Check Hash
			if ( _History.isLastHash(newHash) ) {
				return false;
			}

			// Push the Hash
			_History.savedHashes.push(newHash);

			// Return true
			return true;
		};

		/**
		 * _History.getHashByIndex()
		 * Gets a hash by the index
		 * @param {integer} index
		 * @return {string}
		 */
		_History.getHashByIndex = function(index){
			// Prepare
			var hash = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				hash = _History.savedHashes[_History.savedHashes.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				hash = _History.savedHashes[_History.savedHashes.length+index];
			}
			else {
				// Get from the beginning
				hash = _History.savedHashes[index];
			}

			// Return hash
			return hash;
		};

		/**
		 * _History.stateHashExists
		 * Checks if the State Hash Exists
		 * @param {string} stateHash
		 * @return {boolean} exists
		 */
		_History.stateHashExists = function(stateHash){
			// Prepare
			var exists = typeof _History.statesByHash[stateHash] !== 'undefined';

			// Return exists
			return exists;
		};


		// ----------------------------------------------------------------------
		// Discarded States

		/**
		 * _History.discardedHashes
		 * A hashed array of discarded hashes
		 */
		_History.discardedHashes = {};

		/**
		 * _History.discardedStates
		 * A hashed array of discarded states
		 */
		_History.discardedStates = {};

		/**
		 * _History.discardState(State)
		 * Discards the state by ignoring it through History
		 * @param {object} State
		 * @return {true}
		 */
		_History.discardState = function(discardedState,forwardState,backState){
			History.debug('History.discardState',this,arguments);
			// Prepare
			var discardedStateHash = History.contractState(discardedState);

			// Create Discard Object
			var discardObject = {
				'discardedState': discardedState,
				'backState': backState,
				'forwardState': forwardState
			};

			// Add to DiscardedStates
			_History.discardedStates[discardedStateHash] = discardObject;

			// Return true
			return true;
		};

		/**
		 * _History.discardHash(hash)
		 * Discards the hash by ignoring it through History
		 * @param {string} hash
		 * @return {true}
		 */
		_History.discardHash = function(discardedHash,forwardState,backState){
			History.debug('History.discardState',this,arguments);
			// Create Discard Object
			var discardObject = {
				'discardedHash': discardedHash,
				'backState': backState,
				'forwardState': forwardState
			};

			// Add to discardedHash
			_History.discardedHashes[discardedHash] = discardObject;

			// Return true
			return true;
		};

		/**
		 * _History.discardState(State)
		 * Checks to see if the state is discarded
		 * @param {object} State
		 * @return {bool}
		 */
		_History.discardedState = function(State){
			// Prepare
			var StateHash = History.contractState(State);

			// Check
			var discarded = _History.discardedStates[StateHash]||false;

			// Return true
			return discarded;
		};

		/**
		 * _History.discardedHash(hash)
		 * Checks to see if the state is discarded
		 * @param {string} State
		 * @return {bool}
		 */
		_History.discardedHash = function(hash){
			// Check
			var discarded = _History.discardedHashes[hash]||false;

			// Return true
			return discarded;
		};

		/**
		 * _History.recycleState(State)
		 * Allows a discarded state to be used again
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {true}
		 */
		_History.recycleState = function(State){
			History.debug('History.recycleState',this,arguments);
			// Prepare
			var StateHash = History.contractState(State);

			// Remove from DiscardedStates
			if ( _History.discardedState(State) ) {
				delete _History.discardedStates[StateHash];
			}

			// Return true
			return true;
		};


		// ----------------------------------------------------------------------
		// HTML4 HashChange Support

		if ( History.emulated.hashChange ) {
			/*
			 * We must emulate the HTML4 HashChange Support by manually checking for hash changes
			 */

			(function(){
				// Define our Checker Function
				_History.checkerFunction = null;

				// Handle depending on the browser
				if ( _History.isInternetExplorer() ) {
					// IE6 and IE7
					// We need to use an iframe to emulate the back and forward buttons

					// Create iFrame
					var
						iframeId = 'historyjs-iframe',
						iframe = document.createElement('iframe');

					// Adjust iFarme
					iframe.setAttribute('id', iframeId);
					iframe.style.display = 'none';

					// Append iFrame
					document.body.appendChild(iframe);

					// Create initial history entry
					iframe.contentWindow.document.open();
					iframe.contentWindow.document.close();

					// Define some variables that will help in our checker function
					var
						lastDocumentHash = null,
						lastIframeHash = null,
						checkerRunning = false;

					// Define the checker function
					_History.checkerFunction = function(){
						// Check Running
						if ( checkerRunning ) {
							History.debug('hashchange.checker: checker is running');
							return false;
						}

						// Update Running
						checkerRunning = true;

						// Fetch
						var
							documentHash = History.getHash(),
							iframeHash = _History.unescapeHash(iframe.contentWindow.document.location.hash);

						// The Document Hash has changed (application caused)
						if ( documentHash !== lastDocumentHash ) {
							// Equalise
							lastDocumentHash = documentHash;

							// Create a history entry in the iframe
							if ( iframeHash !== documentHash ) {
								History.debug('hashchange.checker: iframe hash change', 'documentHash (new):', documentHash, 'iframeHash (old):', iframeHash);

								// Equalise
								lastIframeHash = iframeHash = documentHash;

								// Create History Entry
								iframe.contentWindow.document.open();
								iframe.contentWindow.document.close();

								// Update the iframe's hash
								iframe.contentWindow.document.location.hash = _History.escapeHash(documentHash);
							}

							// Trigger Hashchange Event
							History.Adapter.trigger(window,'hashchange');
						}

						// The iFrame Hash has changed (back button caused)
						else if ( iframeHash !== lastIframeHash ) {
							History.debug('hashchange.checker: iframe hash out of sync', 'iframeHash (new):', iframeHash, 'documentHash (old):', documentHash);

							// Equalise
							lastIframeHash = iframeHash;

							// Update the Hash
							History.setHash(iframeHash);
						}

						// Reset Running
						checkerRunning = false;

						// Return true
						return true;
					};
				}
				else {
					// We are not IE
					// Firefox 1 or 2, Opera

					// Define some variables that will help in our checker function
					var
						lastDocumentHash = null;

					// Define the checker function
					_History.checkerFunction = function(){
						// Prepare
						var documentHash = History.getHash();

						// The Document Hash has changed (application caused)
						if ( documentHash !== lastDocumentHash ) {
							// Equalise
							lastDocumentHash = documentHash;

							// Trigger Hashchange Event
							History.Adapter.trigger(window,'hashchange');
						}

						// Return true
						return true;
					};
				}

				// Apply the checker function
				setInterval(_History.checkerFunction, History.options.hashChangeCheckerDelay);

				// Return true
				return true;

			})(); // closure

		}

		// ----------------------------------------------------------------------
		// HTML5 State Support

		if ( History.emulated.pushState ) {
			/*
			 * We must emulate the HTML5 State Management by using HTML4 HashChange
			 */

			/**
			 * _History.onHashChange(event)
			 * Trigger HTML5's window.onpopstate via HTML4 HashChange Support
			 */
			_History.onHashChange = function(event){
				History.debug('_History.onHashChange',this,arguments);
				// Prepare
				var
					currentUrl						= (event && event.newURL) || document.location.href;
					currentHash						= unescape(History.extractHashFromUrl(currentUrl)),
					currentState					= null,
					currentStateHash			= null,
					currentStateHashExits	= null;

				// Check if we are the same state
				if ( _History.isLastHash(currentHash) ) {
					// There has been no change (just the page's hash has finally propagated)
					History.debug('_History.onHashChange: no change');
					return false;
				}

				// Store our location for use in detecting back/forward direction
				_History.saveHash(currentHash);

				// Expand Hash
				currentState = History.expandHash(currentHash);
				if ( !currentState ) {
					// Traditional Anchor Hash
					History.debug('_History.onHashChange: traditional anchor');
					History.Adapter.trigger('anchorchange');
					return false;
				}

				// Check if we are the same state
				if ( _History.isLastState(currentState) ) {
					// There has been no change (just the page's hash has finally propagated)
					History.debug('_History.onHashChange: no change');
					return false;
				}

				// Create the state Hash
				currentStateHash = History.contractState(currentState);

				// Log
				History.debug('_History.onHashChange: ',
					'currentStateHash',
					currentStateHash,
					'Hash -1',
					_History.getHashByIndex(-1),
					'Hash -2',
					_History.getHashByIndex(-2),
					'Hash -3',
					_History.getHashByIndex(-3),
					'Hash -4',
					_History.getHashByIndex(-4),
					'Hash -5',
					_History.getHashByIndex(-5),
					'Hash -6',
					_History.getHashByIndex(-6),
					'Hash -7',
					_History.getHashByIndex(-7)
				);

				// Check if we are DiscardedState
				var discardObject = _History.discardedState(currentState);
				if ( discardObject ) {
					History.debug('forwardState:',History.contractState(discardObject.forwardState),'backState:',History.contractState(discardObject.backState));
					// Ignore this state as it has been discarded and go back to the state before it
					if ( _History.getHashByIndex(-2) === History.contractState(discardObject.forwardState) ) {
						// We are going backwards
						History.debug('_History.onHashChange: go backwards');
						History.back();
					} else {
						// We are going forwards
						History.debug('_History.onHashChange: go forwards');
						History.forward();
					}
					return false;
				}

				// Push the new HTML5 State
				History.debug('_History.onHashChange: success hashchange');
				History.pushState(currentState.data,currentState.title,currentState.url);

				// Return true
				return true;
			};
			History.Adapter.bind(window,'hashchange',_History.onHashChange);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url){
				History.debug('History.pushState',this,arguments);

				// Check the State
				if ( History.extractHashFromUrl(url) ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Fetch the State Object
				var
					newState = History.createStateObject(data,title,url),
					newStateHash = History.contractState(newState),
					oldState = History.getState(),
					oldStateHash = History.getStateHash(),
					html4Hash = unescape(History.getHash());

				// Store the newState
				_History.storeState(newState);

				// Recycle the State
				_History.recycleState(newState);

				// Force update of the title
				if ( newState.title ) {
					document.title = newState.title
				}

				History.debug(
					'History.pushState: details',
					'newStateHash:', newStateHash,
					'oldStateHash:', oldStateHash,
					'html4Hash:', html4Hash
				);

				// Check if we are the same State
				if ( newStateHash === oldStateHash ) {
					History.debug('History.pushState: no change', newStateHash);
					return false;
				}

				// Update HTML4 Hash
				if ( newStateHash !== html4Hash ) {
					History.debug('History.pushState: update hash', newStateHash);
					History.setHash(newStateHash);
					return false;
				}

				// Update HTML5 State
				_History.saveState(newState);

				// Fire HTML5 Event
				History.debug('History.pushState: trigger popstate');
				History.Adapter.trigger(window,'statechange');

				// Return true
				return true;
			};

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url){
				History.debug('History.replaceState',this,arguments);
				// Check the State
				if ( History.extractHashFromUrl(url) ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Fetch the State Objects
				var
					newState 				= History.createStateObject(data,title,url),
					oldState 				= History.getState(),
					previousState 	= _History.getStateByIndex(-2)

				// Discard Old State
				_History.discardState(oldState,newState,previousState);

				// Alias to PushState
				History.pushState(newState.data,newState.title,newState.url);

				// Return true
				return true;
			};

			/**
			 * Ensure initial state is handled correctly
			 **/
			if ( !document.location.hash || document.location.hash === '#' ) {
				History.Adapter.onDomLoad(function(){
					History.debug('hash1');
					var currentState = History.createStateObject({},'',document.location.href);
					History.pushState(currentState.data,currentState.title,currentState.url);
				});
			} else if ( !History.emulated.hashChange ) {
				History.debug('hash2');
				History.Adapter.onDomLoad(function(){
					_History.onHashChange();
				});
			}

		}
		else {

			/**
			 * _History.onPopState(event,extra)
			 * Refresh the Current State
			 */
			_History.onPopState = function(event){
				History.debug('_History.onPopState',this,arguments);

				// Check for a Hash, and handle apporiatly
				var currentHash	= unescape(History.getHash());
				if ( currentHash ) {
					// Expand Hash
					var currentState = History.expandHash(currentHash);
					if ( currentState ) {
						// We were able to parse it, it must be a State!
						// Let's forward to replaceState
						History.debug('_History.onPopState: state anchor', currentHash, currentState);
						History.replaceState(currentState.data, currentState.tite, currentState.url);
					}
					else {
						// Traditional Anchor
						History.debug('_History.onPopState: traditional anchor', currentHash);
						History.Adapter.trigger(window,'anchorchange');
					}

					// We don't care for hashes
					return false;
				}

				// Prepare
				var
					currentStateHashExits				= null,
					stateData										= {},
					stateTitle									= null,
					stateUrl										= null,
					newState										= null;

				// Prepare
				event = event||{};
				if ( typeof event.state === 'undefined' ) {
					// jQuery
					if ( typeof event.originalEvent !== 'undefined' && typeof event.originalEvent.state !== 'undefined' ) {
						event.state = event.originalEvent.state;
					}
					// MooTools
					else if ( typeof event.event !== 'undefined' && typeof event.event.state !== 'undefined' ) {
						event.state = event.event.state;
					}
				}

				// Fetch Data
				if ( event.state === null ) {
					// Vanilla: State has no data (new state, not pushed)
					stateData = event.state;
				}
				else if ( typeof event.state !== 'undefined' ) {
					// Vanilla: Back/forward button was used

					// Using Chrome Fix
					var
						newStateUrl = History.expandUrl(document.location.href),
						oldState = _History.getStateByUrl(newStateUrl),
						duplicateExists = _History.urlDuplicateExists(newStateUrl);

					// Does oldState Exist?
					if ( typeof oldState !== 'undefined' && !duplicateExists ) {
						stateData = oldState.data;
					}
					else {
						stateData = event.state;
					}

					// Use the way that should work
					// stateData = event.state;
				}
				else {
					// Vanilla: A new state was pushed, and popstate was called manually

					// Get State object from the last state
					var
						newStateUrl = History.expandUrl(document.location.href),
						oldState = _History.getStateByUrl(newStateUrl);

					// Check if the URLs match
					if ( newStateUrl == oldState.url ) {
						stateData = oldState.data;
					}
					else {
						throw new Error('Unknown state');
					}
				}

				// Resolve newState
				stateData		= (typeof stateData !== 'object' || stateData === null) ? {} : stateData;
				stateTitle	=	stateData.title||'',
				stateUrl		=	stateData.url||document.location.href,
				newState		=	History.createStateObject(stateData,stateTitle,stateUrl);

				// Check if we are the same state
				if ( _History.isLastState(newState) ) {
					// There has been no change (just the page's hash has finally propagated)
					History.debug('_History.onPopState: no change', newState, _History.savedStates);
					return false;
				}

				// Log
				History.debug(
					'_History.onPopState',
					'newState:', newState,
					'oldState:', _History.getStateByUrl(History.expandUrl(document.location.href)),
					'duplicateExists:', _History.urlDuplicateExists(History.expandUrl(document.location.href))
				);

				// Store the State
				_History.storeState(newState);
				_History.saveState(newState);

				// Force update of the title
				if ( newState.title ) {
					document.title = newState.title
				}

				// Fire Our Event
				History.Adapter.trigger(window,'statechange');

				// Return true
				return true;
			};
			History.Adapter.bind(window,'popstate',_History.onPopState);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url){
				// Check the State
				if ( History.extractHashFromUrl(url) ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Store the newState
				_History.storeState(newState);

				// Push the newState
				history.pushState(newState.data,newState.title,newState.url);

				// Fire HTML5 Event
				History.Adapter.trigger(window,'popstate');

				// Return true
				return true;
			}

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url){
				// Check the State
				if ( History.extractHashFromUrl(url) ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Store the newState
				_History.storeState(newState);

				// Push the newState
				history.replaceState(newState.data,newState.title,newState.url);

				// Fire HTML5 Event
				History.Adapter.trigger(window,'popstate');

				// Return true
				return true;
			}

		}

		// ----------------------------------------------------------------------
		// HTML4 State Aliases
		// We do not support go, as we cannot guarantee correct positioning due to discards

		History.back = function(){
			History.debug('History.back: called');

			// Fix a bug in IE6
			if ( History.emulated.hashChange && _History.isInternetExplorer() ) {
				// Prepare
				var currentHash = History.getHash();

				// Apply Check
				setTimeout(function(){
					var newHash = History.getHash();
					if ( newHash === currentHash ) {
						// No change occurred, try again
						History.debug('History.back: trying again');
						return History.back();
					}
					return true;
				},History.options.hashChangeCheckerDelay*2);
			}

			// Go back
			return history.go(-1);
		};

		History.forward = function(){
			History.debug('History.forward: called');

			// Fix a bug in IE6
			if ( History.emulated.hashChange && _History.isInternetExplorer() ) {
				// Prepare
				var currentHash = History.getHash();

				// Apply Check
				setTimeout(function(){
					var newHash = History.getHash();
					if ( newHash === currentHash ) {
						// No change occurred, try again
						History.debug('History.forward: trying again');
						return History.forward();
					}
					return true;
				},History.options.hashChangeCheckerDelay*2);
			}

			// Go forward
			return history.go(1);
		};

		History.go = function(index){
			History.debug('History.go: called with index ['+index+']');

			// Handle
			if ( index > 0 ) {
				// Forward
				for ( var i=1; i<=index; ++i ) {
					var timeout = History.options.hashChangeCheckerDelay*20*i;
					setTimeout(
						function(){
							History.debug('History.go: heading forward');
							History.forward();
						},
						timeout
					);
				}
			}
			else if ( index < 0 ) {
				// Backward
				for ( var i=-1; i>=index; --i ) {
					var timeout = History.options.hashChangeCheckerDelay*20*(i*-1);
					setTimeout(
						function(){
							History.debug('History.go: heading back');
							History.back();
						},
						timeout
					);
				}
			}
			else {
				throw new Error('History.go: History.go requires a positive or negative integer passed.');
			}

			// Return true
			return true;
		};


		History.debug('History.emulated: hashchange['+History.emulated.hashChange+'] pushstate['+History.emulated.pushState+']');

	}; // init

	// Check Load Status
	if ( typeof History.Adapter !== 'undefined' ) {
		// Adapter loaded faster than History.js, fire init.
		History.init();
	}

})(window);

// History.js jQuery Adapter
// New-BSD License, Copyright 2011 Benjamin Arthur Lupton <contact@balupton.com>

(function($,window,undefined){

	// --------------------------------------------------------------------------
	// Initialise

	// History Object
	window.History = window.History||{};

	// Localise Globals
	var
		History = window.History||{},
		history = window.history;

	// Check Existence of Adapter
	if ( typeof History.Adapter !== 'undefined' ) {
		throw new Error('History.js Adapter has already been emulated...');
	}

	// Add the Adapter
	History.Adapter = {

		/**
		 * History.Adapter.bind(el,event,callback)
		 * @param {element} el
		 * @param {string} event
		 * @param {Function} callback
		 * @return {element}
		 */
		bind: function(el,event,callback){
			return $(el).bind(event,callback);
		},

		/**
		 * History.Adapter.trigger(el,event)
		 * @param {element} el
		 * @param {string} event
		 * @return {element}
		 */
		trigger: function(el,event){
			return $(el).trigger(event);
		},

		/**
		 * History.Adapter.trigger(el,event,data)
		 * @param {Function} callback
		 * @return {true}
		 */
		onDomLoad: function(callback) {
			jQuery(callback);
		}

	};

	// Check Load Status
	if ( typeof History.init !== 'undefined' ) {
		// History.js loaded faster than the Adapter, Fire init
		History.init();
	}

})(jQuery,window);

// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

// add trim function to String class
String.prototype.trim = function() { return this.replace(/^\s*|\s*$/g,""); };

var SessionTimer = {
  start: function() {
    SessionTimer.interval_id = setTimeout(SessionTimer.check, 60000);
  },
  disable: function() {
    window.clearTimeout(SessionTimer.interval_id);
  },
  check: function() {
    jQuery.getScript('/session');
    SessionTimer.start();
  },
  reset: function() {
    jQuery.ajax({
      type: 'PUT',
      url: '/session',
      dataType: 'script'
    });
  }
};


var wesabe = {
  __name__: 'wesabe',

  expando: (function() {
    var element = $('<div></div>');
    for (var k in element)
      if (/^jQuery\d+$/.test(k))
        return k;
    // choose a semi-plausible fallback
    return 'appendTo';
  })(),

  isJQuery: function(object) {
    return !!(object && object[wesabe.expando] && !object.getClass);
  },

  __idCounter__: 0,

  uniqueId: function() {
    return '__id'+(wesabe.__idCounter__++);
  },

  get: function(pkg, module, base, callback) {
    var name  = wesabe._fqn(pkg, module),
        parts = name.split('.');

    if (!base)
      base = window;

    if (base.__name__)
      parts.unshift(base.__name__);

    if (!callback)
      callback = function(o){ return o };

    if (typeof module == 'string')
      parts.push(module);

    for (var i = 0; i < parts.length; i++) {
      base = base[parts[i]] = callback(base[parts[i]], parts.slice(0, i+1).join('.'));
      if (!base) return null;
    }

    return base;
  },

  _fqn: function(pkg, module) {
    var result = pkg && pkg.__name__ || pkg;

    if (module)
      result += '.' + module;

    return result;
  },

  /**
   * Define a namespace under the toplevel 'wesabe' namespace.
   *
   * @param {!string} module A dot-separated namespace (e.g. lang.string).
   * @param {?*} value An optional value for the namespace (defaults to {}).
   * @return {*}
   */
  provide: function(module, value) {
    if (!/^wesabe\./.test(module))
      module = 'wesabe.' + module;

    return wesabe.get(module, null, null, function(part, name) {
      part = ((module == name) && value) || part || {};
      part.__name__ = name;
      return part;
    });
  },

  /**
   * Takes a callback to be run once the given module has been loaded.
   *
   *   wesabe.ready("$.historyInit", function() {
   *     wesabe.privacy.registerSanitizer(...);
   *   });
   *
   * @param {!string} name The dot-separated name of the module/class to watch for.
   * @param {!function(*)} callback A function to call when the module is ready.
   * @param {?number} ttl Number of times to check for the module (default: 100).
   */
  ready: function(name, callback, ttl) {
    ttl = ttl || 100;

    (function() {
      var obj = wesabe.get(name);

      if (obj) {
        // got it, fire the callback
        callback(obj);
      } else if (ttl--) {
        // not yet, try again in 50ms
        setTimeout(arguments.callee, 50);
      }
    })();
  },

  /* Dynamically load a javascript module.
   *
   * @param {!string|object} pkg The path to a javascript file or a JS package object.
   * @param {?string} module The name of the module to load within pkg, if given a JS object.
   * @param {?function(object)} callback A function to call after the module has been loaded.
   */
  load: function(pkg, module, callback) {
    var src;

    var obj = wesabe.get(pkg, module);
    if (obj) {
      callback(obj);
      return;
    }

    src = /\//.test(pkg) ? pkg
                         : wesabe._fqn(pkg, module).replace(/\./g, '/');

    if (!src.match(/\.js$/))
      src = src+'.js?'+(new Date().getTime());
    if (!src.match(/^(http(s)?:|\/javascripts\/)/))
      src = '/javascripts/' + src;

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.getElementsByTagName('body')[0].appendChild(script);

    if (callback)
      wesabe.ready(wesabe._fqn(pkg, module), callback);
  },

  /**
   * Builds a class with +name+ with an optional superclass given by +$super+,
   * yielding the class, superclass, and package to +callback+.
   *
   * @param {!string} name The full name of the class "foo.Bar".
   * @param {?function()} $super Optional superclass, used as callback if no 3rd
   *                             argument is given, defaults to wesabe.lang.Subscribable.
   * @param {?function(function, function, object)} callback
   * @return {function()} The class that was built.
   */
  $class: function(name, $super, callback) {
    if (callback === undefined) {
      callback = $super;
      $super = undefined;
    }

    // mix in some default modules if there's no superclass
    if ($super === undefined) {
      $super = function() {}.prototype;
      $.extend($super, wesabe.lang.Subscribable);
      $.extend($super, wesabe.lang.KeyValueCoding);
    }

    // use the prototype if they gave us a class
    if ($super && $super.prototype) $super = $super.prototype;

    // create the constructor and inject it into the tree
    var $class = wesabe.provide(name, function() {
      if (this.init)
        this.init.apply(this, arguments);
    });

    // build the class
    $class.prototype = $.extend($super ? $.extend({}, $super) : {}, {
      getClass: function(){ return $class },
      isInstanceOf: function(klass){ return klass === this.getClass() }
    });

    // get the package
    var $package = wesabe.get($class.__name__.replace(/\.[^\.]+$/, ''));

    if (callback)
      callback($class, $super, $package);

    return $class;
  }
};

var either = function() {
  for (var i = 0; i < arguments.length; i++)
    if (arguments[i]!==null && arguments[i]!==undefined)
      return arguments[i];
};

var hasValue = function(val) {
  return val !== undefined && val !== null
};

// from http://dominiek.com/108-ajax-snippet-blank-out-a-div-with-a-spinner
function spinDiv(div) {
  // see if the spinDiv exists already, and remove it to toggle off
  if (div.children(".spin_div").remove().length == 0) {
    var container = div[0]; // assumes jQuery element
    var positioning = 'top: '+container.offsetTop+'px; width: '+container.offsetWidth+'px; height: '+container.offsetHeight+'px; left: ' + container.offsetLeft + 'px;';
    div.append('<div class="spin_div" style="position: absolute; ' + positioning + '"></div>');
  }
}

wesabe.provide('lang.date');

wesabe.lang.date = {
  MONTH_NAMES: [
    'January','February','March','April','May','June','July',
    'August','September','October','November','December',
    'Jan','Feb','Mar','Apr','May','Jun','Jul',
    'Aug','Sep','Oct','Nov','Dec'
  ],

  DAY_NAMES: [
    'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday',
    'Sun','Mon','Tue','Wed','Thu','Fri','Sat'
  ],

  LZ: function(x) {
    return (x<0||x>9?"":"0")+x;
  },

  SECOND: 1000,
  SECONDS: 1000,

  parse: function(string) {
    if (!string)
      return null;

    var p = function(s) { return parseInt(s, 10); };

    var idate = Date.parse(string);
    if (isNaN(idate)) {
      var m;

      // xml schema format yyyy-MM-ddTHH:mm:ssZ or yyyy-MM-ddTHH:mm:ss+-hhmm
      m = string.match(/^(\d{4})-?(\d{2})-?(\d{2})T(\d{2}):?(\d{2}):?(\d{2})(?:Z|([+-])(\d{2})(\d{2}))$/);
      if (m) {
        var year = p(m[1]), month = p(m[2]) - 1, day = p(m[3]);
        var hour = p(m[4]), minute = p(m[5]), second = p(m[6]);
        var utcResult, result = new Date(year, month, day, hour, minute, second);
        if (!m[7]) {
          utcResult = result;
        } else {
          var tzsign  = (m[7] == '+') ? 1 : -1;
          var tzhours = p(m[8]);
          var tzmins  = p(m[9]);
          var tzoffset = -tzsign * (tzhours * this.HOURS + tzmins * this.MINUTES);
          utcResult = this.add(result, tzoffset);
        }
        result = this.add(utcResult, -new Date().getTimezoneOffset()*this.MINUTES);
        return result;
      }

      // url parameter format
      m = string.match(/^(\d{4})-?(\d{2})-?(\d{2})$/);
      if (m) {
        var year = p(m[1]), month = p(m[2]) - 1, day = p(m[3]);
        return new Date(year, month, day);
      }

      wesabe.warn('unable to parse date: ', string);
      return null;
    }
    return new Date(idate);
  },

  //
  // Date Math
  //

  add: function(date, duration) {
    return new Date(date.getTime() + duration);
  },

  addDays: function(date, days) {
    return YAHOO.widget.DateMath.add(date, YAHOO.widget.DateMath.DAY, days);
  },

  addWeeks: function(date, weeks) {
    return YAHOO.widget.DateMath.add(date, YAHOO.widget.DateMath.WEEK, weeks);
  },

  addMonths: function(date, months) {
    return YAHOO.widget.DateMath.add(date, YAHOO.widget.DateMath.MONTH, months);
  },

  addYears: function(date, years) {
    return YAHOO.widget.DateMath.add(date, YAHOO.widget.DateMath.YEAR, years);
  },

  startOfYear: function(date) {
    return YAHOO.widget.DateMath.getJan1(date.getFullYear());
  },

  endOfYear: function(date) {
    return new Date(date.getFullYear(), 11, 31);
  },

  startOfQuarter: function(date) {
    return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
  },

  endOfQuarter: function(date) {
    return wesabe.lang.date.endOfMonth(
      new Date(date.getFullYear(), (Math.floor(date.getMonth() / 3) * 3) + 2, 1));
  },

  startOfMonth: function(date) {
    return YAHOO.widget.DateMath.findMonthStart(date);
  },

  endOfMonth: function(date) {
    return YAHOO.widget.DateMath.findMonthEnd(date);
  },

  startOfWeek: function(date, firstDay) {
    return YAHOO.widget.DateMath.getFirstDayOfWeek(date, firstDay);
  },

  startOfDay: function(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },

  startOf: function(unit, date) {
    return wesabe.lang.date.doWithUnit('startOf', unit, date);
  },

  before: function(date, compareTo) {
    return YAHOO.widget.DateMath.before(date, compareTo);
  },

  after: function(date, compareTo) {
    return YAHOO.widget.DateMath.after(date, compareTo);
  },

  between: function(date, dateBegin, dateEnd) {
    return YAHOO.widget.DateMath.between(date, dateBegin, dateEnd);
  },

  overlap: function(range1, range2) {
    return wesabe.lang.date.between(range1.start, range2.start, range2.end) ||
           wesabe.lang.date.between(range1.end,   range2.start, range2.end);
  },

  equals: function(date1, date2) {
    return date1.valueOf() == date2.valueOf();
  },

  doWithUnit: function() {
    var args = jQuery.makeArray(arguments),
        name = args.shift(),
        unit = args.shift();

    u = /^day/i.test(unit)    ?  'Day'   :
        /^month/i.test(unit)  ?  'Month' :
        /^year/i.test(unit)   ?  'Year'  :
        /^week/i.test(unit)   ?  'Week'  :
        null;
    if (!u) throw new Error(unit+" is not a valid unit - use day, week, month or year");

    var possibleFunctions = [name+u, name+u+'s'];

    var fn;
    for (var i = 0; i < possibleFunctions.length; i++) {
      if (fn = wesabe.lang.date[possibleFunctions[i]]) break;
    }
    if (fn) return fn.apply(wesabe.lang.date, args);
    else throw new Error("No function named one of ("+possibleFunctions.join(', ')+") could be found in wesabe.lang.date");
  },

  //
  // Date Formatting
  //

  format: function(date, format) {
    var LZ = wesabe.lang.date.LZ;

    format = format + "";
    var result = "";
    var i_format = 0;
    var c = "";
    var token = "";
    var y = date.getYear()+"";
    var M = date.getMonth()+1;
    var d = date.getDate();
    var E = date.getDay();
    var H = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
    // Convert real date parts into formatted versions
    var value = new Object();
    if (y.length < 4) {
      y=""+(y-0+1900);
    }
    value["y"] = ""+y;
    value["yyyy"] = y;
    value["yy"] = y.substring(2,4);
    value["M"] = M;
    value["MM"] = LZ(M);
    value["MMM"] = wesabe.lang.date.MONTH_NAMES[M-1];
    value["NNN"] = wesabe.lang.date.MONTH_NAMES[M+11];
    value["d"] = d;
    value["dd"] = LZ(d);
    value["E"] = wesabe.lang.date.DAY_NAMES[E+7];
    value["EE"] = wesabe.lang.date.DAY_NAMES[E];
    value["H"] = H;
    value["HH"] = LZ(H);
    if (H == 0) {
      value["h"] = 12;
    } else if (H>12) {
      value["h"] = H-12;
    } else {
      value["h"] = H;
    }
    value["hh"] = LZ(value["h"]);
    if (H>11) {
      value["K"] = H-12;
    } else {
      value["K"] = H;
    }
    value["k"] = H+1;
    value["KK"] = LZ(value["K"]);
    value["kk"] = LZ(value["k"]);
    if (H > 11) {
      value["a"] = "PM";
    } else {
      value["a"] = "AM";
    }
    value["m"] = m;
    value["mm"] = LZ(m);
    value["s"] = s;
    value["ss"] = LZ(s);
    while (i_format < format.length) {
      c = format.charAt(i_format);
      token = "";
      while ((format.charAt(i_format) == c) && (i_format < format.length)) {
        token += format.charAt(i_format++);
      }
      if (value[token] != null) {
        result = result + value[token];
      } else {
        result = result + token;
      }
    }
    return result;
  },

  toParam: function(date) {
    if (typeof date == 'string') date = wesabe.lang.date.parse(date);
    if (!date) return '';
    return wesabe.lang.date.format(date, "yyyyMMdd");
  },

  // Tuesday, July 1st or Tuesday, July 1st, 2008
  friendlyFormat: function(date) {
    if (typeof date == 'string') date = wesabe.lang.date.parse(date);
    if (!date) return '';
    var string = '';
    string += wesabe.lang.date.format(date, 'EE, MMM ');      // "Tuesday, July"
    string += wesabe.lang.number.ordinalize(date.getDate());  // "1st"
    if (date.getYear() != new Date().getYear())
      string += wesabe.lang.date.format(date, ', yyyy');       // ", 2008"
    return string;
  },

  // July 1 or July 1, 2008
  shortFriendlyFormat: function(date) {
    if (typeof date == 'string') date = wesabe.lang.date.parse(date);
    if (!date) return '';
    var string = '';
    string += wesabe.lang.date.format(date, 'MMM d');      // "July 1"
    if (date.getYear() != new Date().getYear())
      string += wesabe.lang.date.format(date, ', yyyy');       // ", 2008"
    return string;
  },

  timeAgoInWords: function(targetDate, includeTime) {
    return wesabe.lang.date.distanceOfTimeInWords(targetDate, new Date(), includeTime);
  },

  distanceOfTimeInWords: function(fromTime, toTime, includeTime) {
    if (typeof fromTime == 'string') fromTime = wesabe.lang.date.parse(fromTime);
    if (typeof toTime == 'string') toTime = wesabe.lang.date.parse(toTime);
    var delta = parseInt((toTime.getTime()-fromTime.getTime())/1000);
    if (delta < 60) {
      return'less than a minute ago';
    } else if (delta < 120) {
      return'about a minute ago';
    } else if (delta < (45*60)) {
      return (parseInt(delta/60)).toString()+' minutes ago';
    } else if (delta < (120*60)) {
      return'about an hour ago';
    } else if (delta < (24*60*60)) {
      return'about '+(parseInt(delta/3600)).toString()+' hours ago';
    } else if (delta < (48*60*60)) {
      return'1 day ago';
    } else {
      var days = (parseInt(delta/86400)).toString();
      if (days > 5) {
        var fmt='%B %d, %Y';
        if(includeTime) fmt += ' %I:%M %p';
        return wesabe.lang.date.format(fromTime, 'MMM dd, yyyy');
      } else {
        return days+" days ago";
      }
    }
  },

  relatize: function(context) {
    context = context || document;
    jQuery(context).find("span.relatize").each(function() {
      var el = jQuery(this);
      var date = wesabe.lang.date.parse(el.text());
      el.html(wesabe.lang.date.timeAgoInWords(date));
      el.attr("title", date.toString());
    });
  }
};

wesabe.lang.date.MINUTE = wesabe.lang.date.MINUTES = 60 * wesabe.lang.date.SECONDS;
wesabe.lang.date.HOUR   = wesabe.lang.date.HOURS   = 60 * wesabe.lang.date.MINUTES;
wesabe.lang.date.DAY    = wesabe.lang.date.DAYS    = 24 * wesabe.lang.date.HOURS;

jQuery(function(){ wesabe.lang.date.relatize(); });

wesabe.provide('lang.number');

wesabe.lang.number = {
  ordinalize: function(n) {
    // teens
    if (10 < n && n < 20) return n+'th';
    // everything else
    switch (n % 10) {
      case 1:  return n+'st';
      case 2:  return n+'nd';
      case 3:  return n+'rd';
      default: return n+'th';
    }
  },

  parse: function(expr) {
    if (/^\d+$/.test(expr))
      return parseInt(expr);
    else if (/^\d*\.\d+$/.test(expr))
      return parseFloat(expr);
    else if (/^((?:\d*\.)?\d+)%$/.test(expr))
      return wesabe.lang.number.parse(RegExp.$1) / 100.0;
    else if (/^[\d\.\-\+\(\)\/\*]+$/.test(expr)) {
      try {
        // WARNING: Be aware that this uses eval.
        // While ideally we never want to use eval on the client given anything
        // from the server that might be dangerous (tag names, in this case),
        // this is fairly well protected by the regular expression above.
        //
        // The ^ and $ anchors ensure that the entire string may only contain
        // digits, periods, minus, plus, parentheses, forward slash (division),
        // and asterisks (multiplication). I don't think it is possible to
        // construct malicious javascript using these characters, but if it is
        // then this should be replaced by a proper parser or removed.
        //
        // DO NOT CHANGE THIS FUNCTION WITHOUT KNOWING WHAT YOU'RE DOING!
        var result = eval(expr);
        if (typeof result == "number") return result;
      } catch(e) { }
      return NaN;
    }
  }
};

wesabe.provide('lang.money');

/**
 * Provides methods for formatting and converting money.
 */
wesabe.lang.money = {
  CURRENCIES: {
    USD: {unit: '$', name: 'USD', delimiter: ',', separator: '.', precision: 2}
  },

  toMoney: function(moneyOrNumber, currency) {
    if (moneyOrNumber.hasOwnProperty('currency')) {
      return moneyOrNumber;
    }
    else {
      currency = either(currency, wesabe.data.preferences.defaultCurrency());
      var money = {currency: currency};
      money[currency] = moneyOrNumber;
      return money;
    }
  },

  /**
  * Returns a copy of the money object passed in. Optionally function can be
  * passed in to mutate the cloning process.
  * @see #abs for example of using mutate
  * @public
  */

  clone: function(money, mutate) {
    var klone = {};

    for (var attr in money) {
      klone[attr] = (attr == 'currency') ?
        money[attr] : (mutate ? mutate(money[attr]) : money[attr]);
    }

    return klone;
  },

  /**
   * Returns a marked up formatted amount. If it's a positive amount,
   * it's wrapped in a +span+ with class +credit+.
   *
   * It takes the same parameters as #format.
   *
   * @see #format
   *
   * @public
   */
  formatWithMarkup: function(money, options) {
    money = wesabe.lang.money.toMoney(money);
    var html = wesabe.lang.money.format(money, options);
    return (money[money.currency] >= 0) ? '<span class="credit">'+html+'</span>' : html;
  },

  /**
   * Formats a money amount.
   *
   *   wesabe.lang.money.format(20) // => "$20.00"
   *
   * Custom currency units, separators, delimiters, and precision can be used:
   *
   *   wesabe.lang.money.format(4500,
   *     {unit: "¥", separator: "", delimiter: ",", precision: 0}) // => "¥4,500"
   *
   * Or you can set them by providing a currency:
   *
   *   wesabe.lang.money.format(4500, {currency: "JPY"}) // => "¥4,500"
   *
   * It also works by providing a +Money+ object:
   *
   *   wesabe.lang.money.format({GBP: 43.21, currency: "GBP"}); // => "£43.21"
   *
   * @param money [Money,Number]
   *   Either a number amount or a +Money+ object with currency.
   * @param options [Object]
   *   currency [String]
   *     3-letter abbreviation of the currency to use (defaults to 'USD')
   *   separator [String]
   *     separates the whole and fractional parts (defaults to '.')
   *   delimiter [String]
   *     delimits numeric groups in the whole part (defaults to ',')
   *   precision [Number]
   *     number of digits in the fractional part to show (defaults to 2)
   *   unit [String]
   *     the currency symbol to use (defaults to '$')
   *   negativePrefix [String]
   *     prepended when +money+ is negative
   *   negativeSuffix [String]
   *     appended when +money+ is negative
   *   positivePrefix [String]
   *     prepended when +money+ is positive
   *   positiveSuffix [String]
   *     appended when +money+ is positive
   *
   * @return [String]
   *   A formatted string representing the amount given.
   *
   * @public
   */
  format: function(money, options) {
    var string = '', prefix = '', suffix = '';
    options = options || {};
    money = wesabe.lang.money.toMoney(money, options.currency);

    var amount = wesabe.lang.money.amount(money, money.currency);
    var currency = wesabe.lang.money.currency(money.currency);

    var delimiter = either(options.delimiter, currency.delimiter, ',');
    var separator = either(options.separator, currency.separator, '.');
    var precision = either(options.precision, currency.precision, 2);
    var unit      = either(options.unit, currency.unit, '$');

    if (amount < 0) {
      amount = -amount;
      prefix += either(options.negativePrefix, '-');
      suffix += either(options.negativeSuffix, '');
    } else {
      prefix += either(options.positivePrefix, '');
      suffix += either(options.positiveSuffix, '');
    }
    prefix += unit;

    // breaks amount=23.45 into whole=23 and fractional=45 (depending on precision)
    var fractional = Math.round((amount-parseInt(amount))*Math.pow(10, precision));
    var whole = precision == 0 ? Math.round(amount) : parseInt(amount);

    string += whole.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1"+delimiter);
    if (precision) {
      string += separator;
      string += this._pad(fractional, precision);
    }

    return prefix+string+suffix;
  },

  /**
   * Left pads a string or number up to {length}.
   *
   * @param {number|string} object The value to add padding to.
   * @param {!number} length The total desired length of the return value.
   * @param {string=} padding The padding to use (' ' for strings, '0' for numbers).
   * @return {string}
   */
  _pad: function(object, length, padding) {
    if (!padding)
      padding = (typeof object == 'number') ? '0' : ' ';
    object = object+'';
    while (object.length < length)
      object += padding;
    return object;
  },

  currency: function(name) {
    if (typeof name == 'string' && wesabe.lang.money.CURRENCIES[name])
      return wesabe.lang.money.CURRENCIES[name];
    else
      return { name: name };
  },

  amount: function(money) {
    if (money)
      return money[money.currency];
  },

  abs: function (money) {
    return wesabe.lang.money.clone(money,function(attr){
      return Math.abs(attr);
    });
  }
};

wesabe.ready('wesabe.data.currencies.sharedCurrencySet', function(currencySet) {
  function updateCurrencies() {
    wesabe.lang.money.CURRENCIES = currencySet.get('currencies');
  }

  updateCurrencies();
  currencySet.subscribe(updateCurrencies);
});

wesabe.provide('lang.uri', {
  escape: function(string) {
    return string
      .replace(/([^ a-zA-Z0-9_.-]+)/g, function(s) {
        return encodeURIComponent(s);
      })
      .replace(/ /g, '+');
  }
});

wesabe.provide('lang.object', {
  equals: function(o1, o2) {
    if (o1 === o2)
      return true;

    if (this.isPrimitive(o1) || this.isPrimitive(o2))
      return false;

    if (o1 && o1.isEqualTo)
      return o1.isEqualTo(o2);

    if (o2 && o2.isEqualTo)
      return o2.isEqualTo(o1);

    if (o1 && o2 && o1.valueOf && o2.valueOf)
      return o1.valueOf() == o2.valueOf();

    return false;
  },

  isPrimitive: function(object) {
    return (/^\[object (Number|Array|String|Function)\]$/.test(Object.prototype.toString.call(object)));
  }
});

wesabe.provide('lang.array', {
  intersection: (function() {
    function intersection() {
      var args = $.makeArray(arguments);

      switch (args.length) {
        case 0:  return [];
        case 1:  return args[0];
        case 2:  return simpleIntersection(args[0], args[1]);
        default: return this.intersection(args[0], this.intersection.apply(this, args.slice(1)));
      }
    }

    function simpleIntersection(a1, a2) {
      var result = [];

      for (var i = 0; i < a1.length; i++)
        if (wesabe.lang.array.contains(a2, a1[i]))
          result.push(a1[i]);
      for (var i = 0; i < a2.length; i++)
        if (wesabe.lang.array.contains(a1, a2[i]) && !wesabe.lang.array.contains(result, a2[i]))
          result.push(a2[i]);

      return result;
    }

    return intersection;
  })(),

  contains: function(array, item, matcher) {
    if (!matcher) matcher = function(a,b){ return a===b };
    for (var i = 0; i < array.length; i++)
      if (matcher(array[i], item))
        return true;
    return false;
  },

  minus: function(a1, a2) {
    var result = [];
    for (var i = 0; i < a1.length; i++)
      if (!this.contains(a2, a1[i]))
        result.push(a1[i]);
    return result;
  },

  merge: function(ai, aj) {
    var intersection = this.intersection(ai, aj);
    var result = [];

    for (var i = 0, j = 0; i < ai.length || j < aj.length; ) {
      if (ai[i] == aj[j]) {
        result.push(ai[i]);
        i++; j++;
      } else {
        if (this.contains(intersection, ai[i])) {
          result.push(ai[i]);
          i++;
        } else if (this.contains(intersection, aj[j])) {
          result.push(aj[j]);
          j++;
        } else {
          if (i < ai.length) result.push(ai[i++]);
          if (j < aj.length) result.push(aj[j++]);
        }
      }
    }

    return result;
  },

  caseInsensitiveSort: function(array, transform) {
    transform = transform || function(o){ return o };
    return array.sort(function(a, b) {
      a = transform(a).toLowerCase();
      b = transform(b).toLowerCase();
      // fix odd error in IE 6/7 where one of the values is unknown (IE says "Variable uses an Automation type not supported in JScript")
      if (typeof(a) == "unknown" || typeof(b) == "unknown") {
        return 0;
      } else {
        return (a == b) ? 0 : (a < b) ? -1 : 1;
      }
    });
  },

  uniq: function(array) {
    var entries = [];

    return $.grep(array, function(entry) {
      var duplicate = wesabe.lang.array.contains(entries, entry);
      if (!duplicate) entries.push(entry);
      return !duplicate;
    });
  }
});

wesabe.provide('lang.string', {
  pluralize: function(count, singular, plural) {
    return (count == 1) ? singular :
                 plural ? plural :
                          singular + 's';
  },

  commonPrefix: function() {
    if (arguments.length == 0)
      return "";

    var shortestString = arguments[0];
    for (var i = 1; i < arguments.length; i++)
      if (arguments[i].length < shortestString.length)
        shortestString = arguments[i];

    for (var i = 0; i < shortestString.length; i++)
      for (var j = 0; j < arguments.length; j++)
        if (arguments[j].substring(0, i) !== arguments[0].substring(0, i))
          return arguments[0].substring(0, i-1);

    return shortestString;
  },

  escapeHTML: function(text) {
    return $('<div></div>').text(text).html();
  },

  // collapse a string to max_length, adding ellipses
  collapse: function(text, max_length, chars_at_end, connector) {
    chars_at_end = chars_at_end == undefined ? 10 : chars_at_end;
    connector = connector || "...";
    if (text.length > max_length) {
      var newText = text.slice(0, max_length - chars_at_end - connector.length) + connector;
      if (chars_at_end > 0) {
         newText += text.slice(-chars_at_end, text.length);
      }
      return newText;
    } else {
      return text;
    }
  },

  // linkify some text. Stolen from ActionView::Helpers::TextHelper
  auto_link: function(text, max_link_length, chars_at_end, connector) {
    var pattern = /(<\w+.*?>|[^=!:'"\/]|^)((?:https?:\/\/)|(?:www\.))([-\w]+(?:\.[-\w]+)*(?::\d+)?(?:\/(?:[~\w\+@%=\(\)-]|(?:[,.;:'][^\s$]))*)*(?:\?[\w\+@%&=.;:-]+)?(?:\#[\w\-]*)?)([[:punct:]]|<|$|)/g;
    return text.replace(pattern, function(match, a, b, c, d) {
      // don't link things that are already linked
      if (a.match(/<a /i)) {
        return match;
      } else {
        var linkText = wesabe.lang.string.collapse(b + c, max_link_length, chars_at_end, connector);
        return a + '<a href="'
                + (b == "www." ? "http://www." : b)
                + c + '">'
                + linkText + '</a>'
                + d;
      }
    });
  },

  /*
   * Title Caps
   *
   * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
   * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
   * License: http://www.opensource.org/licenses/mit-license.php
   */
  titleCaps: (function() {
    var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
    var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

    function titleCaps(title){
      var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;

      while (true) {
        var m = split.exec(title);

        parts.push( title.substring(index, m ? m.index : title.length)
          .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
            return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
          })
          .replace(RegExp("\\b" + small + "\\b", "ig"), lower)
          .replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
            return punct + upper(word);
          })
          .replace(RegExp("\\b" + small + punct + "$", "ig"), upper));

        index = split.lastIndex;

        if ( m ) parts.push( m[0] );
        else break;
      }

      return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
        .replace(/(['Õ])S\b/ig, "$1s")
        .replace(/\b(AT&T|Q&A)\b/ig, function(all){
          return all.toUpperCase();
        });
    };

    function lower(word){
      return word.toLowerCase();
    }

    function upper(word){
      return word.substr(0,1).toUpperCase() + word.substr(1);
    }

    return titleCaps;
  })(),

  blank: function(string) {
    return !string || (string.match(/^\s*$/) != null);
  },

  ucfirst: function(word){
    return word.substr(0,1).toUpperCase() + word.substr(1);
  },

  uriEscape: function(string) {
    return string.replace(/[^a-z0-9]/ig, function(c) {
      return '%'+c.charCodeAt(0).toString(16).toUpperCase();
    });
  }
});

wesabe.provide('lang.params', {
  add: function(params, name, value) {
    if (jQuery.isArray(params)) {
      params.push({name: name, value: value});
    } else {
      params[name] = value;
    }
    return params;
  },

  set: function(params, name, value) {
    return this.add(this.remove(params, name), name, value);
  },

  remove: function(params, name) {
    if (jQuery.isArray(params)) {
      for (var i = 0; i < params.length; ) {
        if (params[i].name == name) params.splice(i, 1);
        else i++;
      }
    } else {
      delete params[name];
    }
    return params;
  },

  get: function(params, name) {
    if (jQuery.isArray(params)) {
      for (var i = 0; i < params.length; i++) {
        if (params[i].name == name) return params[i].value;
      }
    } else {
      return params[name];
    }
  },

  has: function(params, name) {
    if (jQuery.isArray(params)) {
      for (var i = params.length; i--;)
        if (params[i].name === name)
          return true;
      return false;
    } else {
      return params.hasOwnProperty(name);
    }
  },

  copy: function(params) {
    if (jQuery.isArray(params)) {
      return params.concat();
    } else {
      return $.extend({}, params);
    }
  }
});

wesabe.provide('lang.math');

wesabe.lang.math = {
  // return the max number in an array of numbers
  max: function(array) {
    if (array.length == 0) return;
    var max = array[0];
    for (var i=1; i<array.length; i++) {
      if (array[i] > max) max = array[i];
    }
    return max;
  },

  // return the sum of an array of numbers
  sum: function(array) {
    if (array.length == 0) return;
    var sum = 0;
    for (var i=0; i<array.length; i++) {
      sum = sum + array[i];
    }
    return sum;
  },

  // return the average (mean) of an array of numbers
  avg: function(array) {
    if (array.length == 0) return;
    return wesabe.lang.math.sum(array) / array.length;
  },

  // return the standard deviation of an array of numbers
  stddev: function(array) {
    if (array.length == 0) return;
    var sum = 0;
    var avg = wesabe.lang.math.avg(array);
    for (var i=0; i<array.length; i++) {
      sum = sum + Math.pow(array[i] - avg, 2);
    }
    return Math.sqrt(sum / array.length);
  }
};

wesabe.provide('lang.KeyValueCoding', {
  get: function(keyPath) {
    return this.valueForKey(keyPath);
  },

  valueForKey: function(key) {
    var getterNames = [key, 'get'+key.substring(0,1).toUpperCase()+key.substring(1)],
        prefixes = ['', '_'];

    for (var i = 0; i < prefixes.length; i++) {
      for (var j = 0; j < getterNames.length; j++) {
        var property = prefixes[i]+getterNames[j];

        if (!this.hasOwnProperty(property) && (typeof this[property] == 'undefined'))
          continue;

        var value = this[property];

        if ($.isFunction(value))
          return value.call(this);

        return value;
      }
    }

    return this.valueForUndefinedKey(key);
  },

  getPath: function(keyPath) {
    return this.valueForKeyPath(keyPath);
  },

  valueForKeyPath: function(keyPath) {
    var headAndTail = this._keyPathHeadAndTail(keyPath),
        head = headAndTail[0],
        tail = headAndTail[1],
        headValue = this.valueForKey(head);

    if (tail)
      return headValue.valueForKeyPath(tail);

    return headValue;
  },

  valueForUndefinedKey: function(key) {
    throw new Error(""+this+" is not key value coding-compliant for the key "+key);
  },

  set: function(keyPath, value) {
    this.setValueForKey(keyPath, value);
  },

  setValueForKey: function(key, value) {
    var property = key,
        privateProperty = '_'+property;
        setter = 'set'+key.substring(0,1).toUpperCase()+key.substring(1),
        privateSetter = '_'+setter,
        candidate = null,
        self = this;

    function wrapSet(doSet) {
      self.willChangeValueForKey(key);
      doSet();
      self.didChangeValueForKey(key);
    }

    // prefer setters to manipulating values directly
    candidate = this[setter];
    if ($.isFunction(candidate))
      return wrapSet(function(){ candidate.call(self, value); });

    candidate = this[privateSetter];
    if ($.isFunction(candidate))
      return wrapSet(function(){ candidate.call(self, value); });

    // if there are no setters, try to set it ourselves, but don't override getters
    candidate = this[property];
    if ((this.hasOwnProperty(property) || (typeof candidate != 'undefined')) && !$.isFunction(candidate))
      return wrapSet(function(){ self[property] = value; });

    candidate = this[privateProperty];
    if ((this.hasOwnProperty(privateProperty) || (typeof candidate != 'undefined')) && !$.isFunction(candidate))
      return wrapSet(function(){ self[privateProperty] = value; });

    this.setValueForUndefinedKey(key);
  },

  setPath: function(keyPath, value) {
    this.setValueForKeyPath(keyPath, value);
  },

  setValueForKeyPath: function(keyPath, value) {
    var headAndTail = this._keyPathHeadAndTail(keyPath),
        head = headAndTail[0],
        tail = headAndTail[1];

    if (tail) this.valueForKey(head).setValueForKeyPath(tail, value);
    else this.setValueForKey(head, value);
  },

  setValueForUndefinedKey: function(key, value) {
    throw new Error(""+this+" is not key value coding-compliant for the key "+key);
  },

  willChangeValueForKey: function(key) {
  },

  didChangeValueForKey: function(key) {
  },

  _keyPathHeadAndTail: function(keyPath) {
    var dotIndex = keyPath.indexOf('.');

    if (dotIndex == -1)
      return [keyPath, null];

    return [keyPath.substring(0, dotIndex), keyPath.substring(dotIndex+1)];
  }
});

wesabe.provide('lang.Subscribable', {
  /**
   * Subscribe to the 'change' event if {callback} is a function, or specify
   * multiple callbacks via an object with events as keys and functions as
   * values:
   *
   *    ds.subscribe({change: function(data){ ... }, error: function(){ ... });
   *
   * Works with a custom context as described in #bind.
   */
  subscribe: function(callbacks, context) {
    if ($.isFunction(callbacks)) {
      callbacks = {change: callbacks};
    } else if (!callbacks) {
      return;
    }

    context = context || this;
    for (var key in callbacks)
      if (callbacks.hasOwnProperty(key))
        this.bind(key, function(event) {
          var args = $.makeArray(arguments);
          args.shift();
          callbacks[event.type].apply(context, args);
        });
  },

  /**
   * Syntactic sugar for {jQuery#bind} with the addition of an optional context.
   *
   *    // bind click with simple handler
   *    widget.bind('click', function(){ alert('hi') });
   *
   *    // bind click with event data
   *    widget.bind('click', {msg: 'hi'}, function(event){ alert(event.data.msg) });
   *
   *    // bind click with a context
   *    widget.bind('click', function(){ alert(this.msg) }, widget);
   *
   *    // bind with everything
   *    widget.bind('click', {msg: 'hi'}, function(event){ alert(this.msg + ': ' + event.data.msg) }, widget);
   */
  bind: function(eventType, eventDataOrHandler, handlerOrContext, contextOrUndefined) {
    var eventData, handler, context;

    // figure out the method signature
    if (typeof contextOrUndefined != 'undefined') {
      // bind(eventType, eventData, handler, context)
      eventData = eventDataOrHandler;
      handler   = handlerOrContext;
      context   = contextOrUndefined;
    } else {
      if ($.isFunction(eventDataOrHandler)) {
        // bind(eventType, handler, context)
        handler = eventDataOrHandler;
        context = handlerOrContext;
      } else {
        // bind(eventType, eventData, handler)
        eventData = eventDataOrHandler;
        handler   = handlerOrContext;
      }
    }

    // use the context if we got one
    if (context) {
      var wrappedHandler = handler;
      handler = function(){ wrappedHandler.apply(context, arguments) };
    }

    $(this).bind(eventType, eventData, handler);
    return this;
  },

  /**
   * Syntactic sugar for {jQuery#unbind}.
   *
   * @param {!String} eventType
   * @param {?Function} eventHandler
   */
  unbind: function(eventType, eventHandler) {
    $(this).unbind(eventType, eventHandler);
  },

  /**
   * Syntactic sugar for {jQuery#trigger}.
   */
  trigger: function() {
    $(this).trigger.apply($(this), arguments);
    return this;
  }
});

(function() {
  // import jQuery as $
  var $ = jQuery;
  // import window.console
  var console = window.console;

  /* @const */ var LEVELS = ['debug', 'log', 'info', 'warn', 'error'];
  /* @const */ var LEVEL_MAP = {debug: 0, log: 1, info: 2, warn: 3, error: 4};

  /**
   * Module that includes logging methods that delegate to a _log method that
   * you define with type {function(string, Array.<*>)}.
   */
  wesabe.provide('util.Loggable', {
    debug: function() {
      this._log('debug', $.makeArray(arguments));
    },

    log: function() {
      this._log('log', $.makeArray(arguments));
    },

    info: function() {
      this._log('info', $.makeArray(arguments));
    },

    warn: function() {
      this._log('warn', $.makeArray(arguments));
    },

    error: function() {
      this._log('error', $.makeArray(arguments));
    }
  });

  var $class = wesabe.provide('util.Logger', function() {});
  var support = $class.support = {
    logging: console && $.isFunction(console.log),
    nativeConsole: false,
    firebugConsole: false,
    multiArgs: false,
    debug: false,
    info: false,
    warn: false,
    error: false
  };

  if (support.logging) {
    var logFuncString = $.isFunction(console.log.toString) ? console.log.toString() : '';
    support.nativeConsole = /\[native code\]/.test(logFuncString);
    support.firebugConsole = /firebug/i.test(logFuncString);
    support.multiArgs = support.firebugConsole || $.browser.safari;

    for (var i = LEVELS.length; i--;)
      support[LEVELS[i]] = $.isFunction(console[LEVELS[i]]);
  }

  $class.prototype = $.extend({
    _prefix: '',
    _level: LEVEL_MAP.debug,

    getLevel: function() {
      return this._level;
    },

    setLevel: function(level) {
      this._level = LEVEL_MAP[level] || '';
    },

    getPrefix: function() {
      return this._prefix;
    },

    setPrefix: function(prefix) {
      this._prefix = prefix;
    },

    /**
     * Set up a method to delegate to {#_sendToConsole} depending on the level
     * of support the browser has for logging.
     *
     * @private
     */
    _log: !support.logging ? function(){} :
        !support.multiArgs ? function(level, args){ this._sendToConsole(level, [this._prefix+args.join('')]) } :
                             function(level, args){ this._sendToConsole(level, [this._prefix].concat(args)) },

    /**
     * This is the function that actually calls console.log etc.
     *
     * @private
     */
    _sendToConsole: function(level, args) {
      if (LEVEL_MAP[level] < this._level)
        return;

      if (!support[level])
        level = 'log';
      console[level].apply(console, args);
    }
  }, wesabe.util.Loggable);

  /**
   * Add logging to the global wesabe object.
   */
  $.extend($.extend(wesabe, wesabe.util.Loggable), {
    _log: function(level, args) {
      if (!this._logger)
        this._logger = this.loggerFor('');
      this._logger[level].apply(this._logger, args);
    },

    loggerFor: function(prefix) {
      var logger = new wesabe.util.Logger();
      logger.setPrefix(prefix);
      return logger;
    }
  });
})();

/**
 * Manages a list of selected objects and provides callbacks for when the
 * list changes. The objects can be any JavaScript or DOM objects, though
 * it's recommended to use JavaScript objects to take advantage of the
 * {onSelect} and {onDeselect} callbacks which are called on objects as
 * they are added and removed, respectively, from the list.
 *
 * To observe any change to the list bind to the 'changed' event.
 */
wesabe.$class('wesabe.util.Selection', function($class, $super, $package) {
  // import wesabe.lang.array
  var array = wesabe.lang.array;
  // import wesabe.lang.object
  var object = wesabe.lang.object;

  $.extend($class.prototype, {
    _current: null,

    init: function() {
      this._current = [];
    },

    /**
     * Gets the current list of selected objects.
     */
    get: function() {
      return this._current.concat(); // return a copy
    },

    /**
     * Gets all the instances of {klass} contained by this {Selection}.
     *
     * @param {function()} klass The class to search for instances of.
     * @return {Array.<*>}
     */
    getByClass: function(klass) {
      var result = [];
      for (var items = this._current, i = items.length; i--;) {
        var item = items[i];
        if (item && $.isFunction(item.isInstanceOf) && item.isInstanceOf(klass))
          result.push(item);
      }
      return result;
    },

    /**
     * Uses {newsel} as the new selection, removing any existing objects from
     * the selection. {newsel} may be an array or a single object.
     */
    set: function(newsel) {
      newsel = $.makeArray(newsel);

      if (!this._selectionsEqual(newsel, this._current)) {
        var oldsel = this._current;

        this._current = newsel;

        var length;

        length = oldsel.length;
        while (length--)
          oldsel[length].onDeselect && oldsel[length].onDeselect();

        length = newsel.length;
        while (length--)
          newsel[length].onSelect && newsel[length].onSelect();

        this.trigger('changed', [newsel, oldsel]);
      }
    },

    /**
     * Adds {elems}, which may be an array or single object, to the current
     * selection.
     */
    add: function(elems) {
      this.set(array.merge(this._current, [elems]));
    },

    /**
     * Removes {elems}, which may be an array or single object, from the
     * current selection.
     */
    remove: function(elems) {
      this.set(array.minus(this._current, [elems]));
    },

    /**
     * Removes objects from the current selection already present in {elems}
     * and adds objects in {elems} not already in the current selection. {elems}
     * may be an array or a single object.
     */
    toggle: function(elems) {
      elems = $.makeArray(elems);
      var oldsel = $.makeArray(this._current),
          itemsToRemove = array.intersection(oldsel, elems),
          itemsToAdd = array.minus(elems, itemsToRemove),
          newsel = array.minus(oldsel, itemsToRemove).concat(itemsToAdd);

      this.set(newsel);
    },

    /**
     * Removes all elements from the current selection.
     */
    clear: function() {
      this.set([]);
    },

    /**
     * Returns a boolean indicating whether {elem} is contained in the
     * current selection.
     */
    contains: function(elem) {
      return array.contains(this._current, elem);
    },

    /**
     * Helper function to determine whether two selection lists contain the
     * same list of objects in any order, with equality determined by
     * {wesabe.lang.object.equals}.
     *
     * @private
     */
    _selectionsEqual: function(sel1, sel2) {
      sel1 = $.makeArray(sel1);
      sel2 = $.makeArray(sel2);

      if (sel1.length !== sel2.length)
        return false;

      var len1 = sel1.length;
      while (len1--) {
        var found = false,
            s1 = sel1[len1],
            len2 = sel2.length;

        while (len2--) {
          if (object.equals(s1, sel2[len2])) {
            found = true;
            break;
          }
        }

        if (!found)
          return false;
      }

      return true;
    }
  });
});

if (!applesearch)	var applesearch = {};

applesearch.init = function ()
{
	var srchform = document.getElementById('searchform');

	// Paranoia! Make sure we can get the search form before trying anything
	if(srchform) {

		var srchinput = document.getElementById('query');
		labelText = applesearch.getLabelText();

		// add applesearch css for non-safari, dom-capable browsers
		if ( navigator.userAgent.toLowerCase().indexOf('safari') < 0  && document.getElementById ) {
			this.clearBtn = false;

			// add style sheet if not safari
			$('head').append('<link rel="stylesheet" href="/stylesheets/applesearch.css" type="text/css" />');

			//------------------

			// create and attach the span
			var r_crnr = document.createElement('span');
			r_crnr.className = 'sbox_r'; // IE win doesn't like setAttribute in this case
			r_crnr.setAttribute('id','srch_clear');

			var fieldsets = srchform.getElementsByTagName('fieldset');
			if (fieldsets) {
				fieldsets[0].appendChild(r_crnr);
			}

			// Create and attach a clearing div, keeps Opera happy
			var d_clr = document.createElement('div');
			d_clr.setAttribute('class','clear');
			srchform.appendChild(d_clr);

			//------------------

			// set our text colors
			var labels = srchform.getElementsByTagName('label');

			if (labels) {
				if (labels[0].currentStyle) {
					// must be using IE
					labelColor = labels[0].currentStyle.color;
					inputColor = srchinput.currentStyle.color;
				} else if (document.defaultView.getComputedStyle) {
					labelColor = document.defaultView.getComputedStyle(labels[0], null).getPropertyValue('color');
					inputColor = document.defaultView.getComputedStyle(srchinput, null).getPropertyValue('color');
				}
			}

			//------------------

			// Paranoia again! Make sure the search field exist
			if(srchinput) {
				// set the placeholder text based off the label
				srchinput.value = labelText;
				srchinput.style.color = labelColor;

				// add some events to the input field
				srchinput.onkeyup = function () {
						applesearch.onChange('query','srch_clear');
					}
				srchinput.onfocus = function () {
						if (this.value == labelText) {
							this.value = '';
							this.style.color = inputColor;
						}
					}
				srchinput.onblur = function () {
						if (this.value == '') {
							this.value = labelText;
							this.style.color = labelColor;
						}
					}
			}

			// prevent the form being submitted if the input's value is the placeholder (label) text
			srchform.onsubmit = function()
			{
				if(srchinput && srchinput != labelText) {
					return true;
				} else {
					return false;
				}
			}
		} else {
			// Paranoia again! Make sure the search field exist
			if(srchinput) {
				// Using Safari so change some attributes to get the Apple Search field
				srchinput.type = 'search';
				srchinput.setAttribute('placeholder',labelText);
				srchinput.setAttribute('autosave','bsn_srch');
				srchinput.setAttribute('results','5');
			}
		}
	}
}

applesearch.getLabelText = function()
{
	var srchform = document.getElementById('searchform');
	if(srchform) {
		var labels = srchform.getElementsByTagName('label');

		if (labels) {
			var labelFor = labels[0].getAttribute('for');
			var labelText = labels[0].firstChild.nodeValue;
		} else {
			// just in case, set default text
			var labelText = 'Search';
		}
	} else {
		// just in case, set default text
		var labelText = 'Search';
	}
	return labelText;
}

applesearch.setLabelText = function(newLabel) {
  var srchinput = document.getElementById('query');
  labelText = newLabel;
  if ( navigator.userAgent.toLowerCase().indexOf('safari') < 0  && document.getElementById ) {
    srchinput.value = labelText;
  } else {
    srchinput.setAttribute('placeholder',labelText);
  }
}

// called when on user input - toggles clear fld btn
applesearch.onChange = function (fldID, btnID)
{
	// check whether to show delete button
	var fld = document.getElementById( fldID );
	var btn = document.getElementById( btnID );

	if (fld.value.length > 0 && fld.value != labelText && !this.clearBtn) {
		btn.className = 'sbox_r_f2';
		btn.fldID = fldID; // btn remembers it's field
		btn.onclick = this.clearBtnClick;
		this.clearBtn = true;
	}
}

applesearch.onBlur = function(fldID, btnID)
{
  if (fld.value.length == 0 && this.clearBtn) {
		btn.className = 'sbox_r';
		btn.onclick = null;
		this.clearBtn = false;
		// reset the field's placeholder text
		fld.value = labelText;
		fld.style.color = labelColor;
	}
}

applesearch.clearFld = function (fldID,btnID)
{
	var fld = document.getElementById( fldID );
	fld.value = '';
	this.onChange(fldID,btnID);
}

applesearch.clearBtnClick = function ()
{
	applesearch.clearFld(this.fldID, this.id);
}

// Actually run the init function once the page is loaded
$(function(){ applesearch.init(); });

$(function(){
  wesabe.ready('$.historyInit', function() {
    $.historyInit(function(hash) {
      $(window).trigger('hash-changed', hash);
    });
  });

  $.fn.include = $.fn.fn;

  // Keep the navbar buttons in hover while their menus are open
  $('#global-nav ul > li').hover(
    function() { $(this).children("a, ul").addClass("menu-on"); },
    function() { $(this).children("a, ul").removeClass("menu-on"); }
  );

  $.support.goodStackingModel = function() {
    // fuck you, IE7, and your stacking contexts too.
    if ($.browser.msie) {
      if ($.browser.version.slice(0,1) == "8") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  jQuery.fn.extend({
    showModal: function(callback) {
      var modal = $(this);

      if ($.support.goodStackingModel()) {
        $('body').append("<div id='modal-mask'></div>");
        var mask = $('#modal-mask');

        mask
          .css("height", $(document).height()+'px')
          .css("width", $(document).width()+'px')
          .show()
          .fadeTo("fast", 0.4);

        // Clicking on the mask removes it and hides the element
        mask.one("click", function(){ modal.hideModal(); });
      }

      if ($.isFunction(callback))
        modal.one('hideModal', callback);

       // Index the element on top of the mask and fade in
       modal
        .css("z-index", "1001")
        .fadeIn();

      return modal;
    },

    hideModal: function(callback) {
      var mask = $('#modal-mask');
      mask.fadeOut("fast", function(){ mask.remove(); });
      this
        .fadeOut(callback)
        .trigger('hideModal');
    }
  });

  // don't allow text on buttons to be selected
  $(".button, .toggle-button")
    .mousedown(function() {return false;})
    .each(function() {this.onselectstart = function() {return false;};}); // ie
});

/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var A=arguments,E=null,C,B,D;for(C=0;C<A.length;C=C+1){D=A[C].split(".");E=YAHOO;for(B=(D[0]=="YAHOO")?1:0;B<D.length;B=B+1){E[D[B]]=E[D[B]]||{};E=E[D[B]];}}return E;};YAHOO.log=function(D,A,C){var B=YAHOO.widget.Logger;if(B&&B.log){return B.log(D,A,C);}else{return false;}};YAHOO.register=function(A,E,D){var I=YAHOO.env.modules;if(!I[A]){I[A]={versions:[],builds:[]};}var B=I[A],H=D.version,G=D.build,F=YAHOO.env.listeners;B.name=A;B.version=H;B.build=G;B.versions.push(H);B.builds.push(G);B.mainClass=E;for(var C=0;C<F.length;C=C+1){F[C](B);}if(E){E.VERSION=H;E.BUILD=G;}else{YAHOO.log("mainClass is undefined for module "+A,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(A){return YAHOO.env.modules[A]||null;};YAHOO.env.ua=function(){var C={ie:0,opera:0,gecko:0,webkit:0,mobile:null,air:0};var B=navigator.userAgent,A;if((/KHTML/).test(B)){C.webkit=1;}A=B.match(/AppleWebKit\/([^\s]*)/);if(A&&A[1]){C.webkit=parseFloat(A[1]);if(/ Mobile\//.test(B)){C.mobile="Apple";}else{A=B.match(/NokiaN[^\/]*/);if(A){C.mobile=A[0];}}A=B.match(/AdobeAIR\/([^\s]*)/);if(A){C.air=A[0];}}if(!C.webkit){A=B.match(/Opera[\s\/]([^\s]*)/);if(A&&A[1]){C.opera=parseFloat(A[1]);A=B.match(/Opera Mini[^;]*/);if(A){C.mobile=A[0];}}else{A=B.match(/MSIE\s([^;]*)/);if(A&&A[1]){C.ie=parseFloat(A[1]);}else{A=B.match(/Gecko\/([^\s]*)/);if(A){C.gecko=1;A=B.match(/rv:([^\s\)]*)/);if(A&&A[1]){C.gecko=parseFloat(A[1]);}}}}}return C;}();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var B=YAHOO_config.listener,A=YAHOO.env.listeners,D=true,C;if(B){for(C=0;C<A.length;C=C+1){if(A[C]==B){D=false;break;}}if(D){A.push(B);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var A=YAHOO.lang,C=["toString","valueOf"],B={isArray:function(D){if(D){return A.isNumber(D.length)&&A.isFunction(D.splice);}return false;},isBoolean:function(D){return typeof D==="boolean";},isFunction:function(D){return typeof D==="function";},isNull:function(D){return D===null;},isNumber:function(D){return typeof D==="number"&&isFinite(D);},isObject:function(D){return(D&&(typeof D==="object"||A.isFunction(D)))||false;},isString:function(D){return typeof D==="string";},isUndefined:function(D){return typeof D==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(F,E){for(var D=0;D<C.length;D=D+1){var H=C[D],G=E[H];if(A.isFunction(G)&&G!=Object.prototype[H]){F[H]=G;}}}:function(){},extend:function(H,I,G){if(!I||!H){throw new Error("extend failed, please check that "+"all dependencies are included.");}var E=function(){};E.prototype=I.prototype;H.prototype=new E();H.prototype.constructor=H;H.superclass=I.prototype;if(I.prototype.constructor==Object.prototype.constructor){I.prototype.constructor=I;}if(G){for(var D in G){if(A.hasOwnProperty(G,D)){H.prototype[D]=G[D];}}A._IEEnumFix(H.prototype,G);}},augmentObject:function(H,G){if(!G||!H){throw new Error("Absorb failed, verify dependencies.");}var D=arguments,F,I,E=D[2];if(E&&E!==true){for(F=2;F<D.length;F=F+1){H[D[F]]=G[D[F]];}}else{for(I in G){if(E||!(I in H)){H[I]=G[I];}}A._IEEnumFix(H,G);}},augmentProto:function(G,F){if(!F||!G){throw new Error("Augment failed, verify dependencies.");}var D=[G.prototype,F.prototype];for(var E=2;E<arguments.length;E=E+1){D.push(arguments[E]);}A.augmentObject.apply(this,D);},dump:function(D,I){var F,H,K=[],L="{...}",E="f(){...}",J=", ",G=" => ";if(!A.isObject(D)){return D+"";}else{if(D instanceof Date||("nodeType" in D&&"tagName" in D)){return D;}else{if(A.isFunction(D)){return E;}}}I=(A.isNumber(I))?I:3;if(A.isArray(D)){K.push("[");for(F=0,H=D.length;F<H;F=F+1){if(A.isObject(D[F])){K.push((I>0)?A.dump(D[F],I-1):L);}else{K.push(D[F]);}K.push(J);}if(K.length>1){K.pop();}K.push("]");}else{K.push("{");for(F in D){if(A.hasOwnProperty(D,F)){K.push(F+G);if(A.isObject(D[F])){K.push((I>0)?A.dump(D[F],I-1):L);}else{K.push(D[F]);}K.push(J);}}if(K.length>1){K.pop();}K.push("}");}return K.join("");},substitute:function(S,E,L){var I,H,G,O,P,R,N=[],F,J="dump",M=" ",D="{",Q="}";for(;;){I=S.lastIndexOf(D);if(I<0){break;}H=S.indexOf(Q,I);if(I+1>=H){break;}F=S.substring(I+1,H);O=F;R=null;G=O.indexOf(M);if(G>-1){R=O.substring(G+1);O=O.substring(0,G);}P=E[O];if(L){P=L(O,P,R);}if(A.isObject(P)){if(A.isArray(P)){P=A.dump(P,parseInt(R,10));}else{R=R||"";var K=R.indexOf(J);if(K>-1){R=R.substring(4);}if(P.toString===Object.prototype.toString||K>-1){P=A.dump(P,parseInt(R,10));}else{P=P.toString();}}}else{if(!A.isString(P)&&!A.isNumber(P)){P="~-"+N.length+"-~";N[N.length]=F;}}S=S.substring(0,I)+P+S.substring(H+1);}for(I=N.length-1;I>=0;I=I-1){S=S.replace(new RegExp("~-"+I+"-~"),"{"+N[I]+"}","g");}return S;},trim:function(D){try{return D.replace(/^\s+|\s+$/g,"");}catch(E){return D;}},merge:function(){var G={},E=arguments;for(var F=0,D=E.length;F<D;F=F+1){A.augmentObject(G,E[F],true);}return G;},later:function(K,E,L,G,H){K=K||0;E=E||{};var F=L,J=G,I,D;if(A.isString(L)){F=E[L];}if(!F){throw new TypeError("method undefined");}if(!A.isArray(J)){J=[G];}I=function(){F.apply(E,J);};D=(H)?setInterval(I,K):setTimeout(I,K);return{interval:H,cancel:function(){if(this.interval){clearInterval(D);}else{clearTimeout(D);}}};},isValue:function(D){return(A.isObject(D)||A.isString(D)||A.isNumber(D)||A.isBoolean(D));}};A.hasOwnProperty=(Object.prototype.hasOwnProperty)?function(D,E){return D&&D.hasOwnProperty(E);}:function(D,E){return !A.isUndefined(D[E])&&D.constructor.prototype[E]!==D[E];};B.augmentObject(A,B,true);YAHOO.util.Lang=A;A.augment=A.augmentProto;YAHOO.augment=A.augmentProto;YAHOO.extend=A.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.6.0",build:"1321"});(function(){var B=YAHOO.util,F=YAHOO.lang,L,J,K={},G={},N=window.document;YAHOO.env._id_counter=YAHOO.env._id_counter||0;var C=YAHOO.env.ua.opera,M=YAHOO.env.ua.webkit,A=YAHOO.env.ua.gecko,H=YAHOO.env.ua.ie;var E={HYPHEN:/(-[a-z])/i,ROOT_TAG:/^body|html$/i,OP_SCROLL:/^(?:inline|table-row)$/i};var O=function(Q){if(!E.HYPHEN.test(Q)){return Q;}if(K[Q]){return K[Q];}var R=Q;while(E.HYPHEN.exec(R)){R=R.replace(RegExp.$1,RegExp.$1.substr(1).toUpperCase());}K[Q]=R;return R;};var P=function(R){var Q=G[R];if(!Q){Q=new RegExp("(?:^|\\s+)"+R+"(?:\\s+|$)");G[R]=Q;}return Q;};if(N.defaultView&&N.defaultView.getComputedStyle){L=function(Q,T){var S=null;if(T=="float"){T="cssFloat";}var R=Q.ownerDocument.defaultView.getComputedStyle(Q,"");if(R){S=R[O(T)];}return Q.style[T]||S;};}else{if(N.documentElement.currentStyle&&H){L=function(Q,S){switch(O(S)){case"opacity":var U=100;try{U=Q.filters["DXImageTransform.Microsoft.Alpha"].opacity;}catch(T){try{U=Q.filters("alpha").opacity;}catch(T){}}return U/100;case"float":S="styleFloat";default:var R=Q.currentStyle?Q.currentStyle[S]:null;return(Q.style[S]||R);}};}else{L=function(Q,R){return Q.style[R];};}}if(H){J=function(Q,R,S){switch(R){case"opacity":if(F.isString(Q.style.filter)){Q.style.filter="alpha(opacity="+S*100+")";if(!Q.currentStyle||!Q.currentStyle.hasLayout){Q.style.zoom=1;}}break;case"float":R="styleFloat";default:Q.style[R]=S;}};}else{J=function(Q,R,S){if(R=="float"){R="cssFloat";}Q.style[R]=S;};}var D=function(Q,R){return Q&&Q.nodeType==1&&(!R||R(Q));};YAHOO.util.Dom={get:function(S){if(S){if(S.nodeType||S.item){return S;}if(typeof S==="string"){return N.getElementById(S);}if("length" in S){var T=[];for(var R=0,Q=S.length;R<Q;++R){T[T.length]=B.Dom.get(S[R]);}return T;}return S;}return null;},getStyle:function(Q,S){S=O(S);var R=function(T){return L(T,S);};return B.Dom.batch(Q,R,B.Dom,true);},setStyle:function(Q,S,T){S=O(S);var R=function(U){J(U,S,T);};B.Dom.batch(Q,R,B.Dom,true);},getXY:function(Q){var R=function(S){if((S.parentNode===null||S.offsetParent===null||this.getStyle(S,"display")=="none")&&S!=S.ownerDocument.body){return false;}return I(S);};return B.Dom.batch(Q,R,B.Dom,true);},getX:function(Q){var R=function(S){return B.Dom.getXY(S)[0];};return B.Dom.batch(Q,R,B.Dom,true);},getY:function(Q){var R=function(S){return B.Dom.getXY(S)[1];};return B.Dom.batch(Q,R,B.Dom,true);},setXY:function(Q,T,S){var R=function(W){var V=this.getStyle(W,"position");if(V=="static"){this.setStyle(W,"position","relative");V="relative";}var Y=this.getXY(W);if(Y===false){return false;}var X=[parseInt(this.getStyle(W,"left"),10),parseInt(this.getStyle(W,"top"),10)];if(isNaN(X[0])){X[0]=(V=="relative")?0:W.offsetLeft;}if(isNaN(X[1])){X[1]=(V=="relative")?0:W.offsetTop;}if(T[0]!==null){W.style.left=T[0]-Y[0]+X[0]+"px";}if(T[1]!==null){W.style.top=T[1]-Y[1]+X[1]+"px";}if(!S){var U=this.getXY(W);if((T[0]!==null&&U[0]!=T[0])||(T[1]!==null&&U[1]!=T[1])){this.setXY(W,T,true);}}};B.Dom.batch(Q,R,B.Dom,true);},setX:function(R,Q){B.Dom.setXY(R,[Q,null]);},setY:function(Q,R){B.Dom.setXY(Q,[null,R]);},getRegion:function(Q){var R=function(S){if((S.parentNode===null||S.offsetParent===null||this.getStyle(S,"display")=="none")&&S!=S.ownerDocument.body){return false;}var T=B.Region.getRegion(S);return T;};return B.Dom.batch(Q,R,B.Dom,true);},getClientWidth:function(){return B.Dom.getViewportWidth();},getClientHeight:function(){return B.Dom.getViewportHeight();},getElementsByClassName:function(U,Y,V,W){U=F.trim(U);Y=Y||"*";V=(V)?B.Dom.get(V):null||N;if(!V){return[];}var R=[],Q=V.getElementsByTagName(Y),X=P(U);for(var S=0,T=Q.length;S<T;++S){if(X.test(Q[S].className)){R[R.length]=Q[S];if(W){W.call(Q[S],Q[S]);}}}return R;},hasClass:function(S,R){var Q=P(R);var T=function(U){return Q.test(U.className);};return B.Dom.batch(S,T,B.Dom,true);},addClass:function(R,Q){var S=function(T){if(this.hasClass(T,Q)){return false;}T.className=F.trim([T.className,Q].join(" "));return true;};return B.Dom.batch(R,S,B.Dom,true);},removeClass:function(S,R){var Q=P(R);var T=function(W){var V=false,X=W.className;if(R&&X&&this.hasClass(W,R)){W.className=X.replace(Q," ");if(this.hasClass(W,R)){this.removeClass(W,R);}W.className=F.trim(W.className);if(W.className===""){var U=(W.hasAttribute)?"class":"className";W.removeAttribute(U);}V=true;}return V;};return B.Dom.batch(S,T,B.Dom,true);},replaceClass:function(T,R,Q){if(!Q||R===Q){return false;}var S=P(R);var U=function(V){if(!this.hasClass(V,R)){this.addClass(V,Q);return true;}V.className=V.className.replace(S," "+Q+" ");if(this.hasClass(V,R)){this.removeClass(V,R);}V.className=F.trim(V.className);return true;};return B.Dom.batch(T,U,B.Dom,true);},generateId:function(Q,S){S=S||"yui-gen";var R=function(T){if(T&&T.id){return T.id;}var U=S+YAHOO.env._id_counter++;if(T){T.id=U;}return U;};return B.Dom.batch(Q,R,B.Dom,true)||R.apply(B.Dom,arguments);},isAncestor:function(R,S){R=B.Dom.get(R);S=B.Dom.get(S);var Q=false;if((R&&S)&&(R.nodeType&&S.nodeType)){if(R.contains&&R!==S){Q=R.contains(S);}else{if(R.compareDocumentPosition){Q=!!(R.compareDocumentPosition(S)&16);}}}else{}return Q;},inDocument:function(Q){return this.isAncestor(N.documentElement,Q);},getElementsBy:function(X,R,S,U){R=R||"*";S=(S)?B.Dom.get(S):null||N;if(!S){return[];}var T=[],W=S.getElementsByTagName(R);for(var V=0,Q=W.length;V<Q;++V){if(X(W[V])){T[T.length]=W[V];if(U){U(W[V]);}}}return T;},batch:function(U,X,W,S){U=(U&&(U.tagName||U.item))?U:B.Dom.get(U);if(!U||!X){return false;}var T=(S)?W:window;if(U.tagName||U.length===undefined){return X.call(T,U,W);}var V=[];for(var R=0,Q=U.length;R<Q;++R){V[V.length]=X.call(T,U[R],W);}return V;},getDocumentHeight:function(){var R=(N.compatMode!="CSS1Compat")?N.body.scrollHeight:N.documentElement.scrollHeight;var Q=Math.max(R,B.Dom.getViewportHeight());return Q;},getDocumentWidth:function(){var R=(N.compatMode!="CSS1Compat")?N.body.scrollWidth:N.documentElement.scrollWidth;var Q=Math.max(R,B.Dom.getViewportWidth());return Q;},getViewportHeight:function(){var Q=self.innerHeight;
var R=N.compatMode;if((R||H)&&!C){Q=(R=="CSS1Compat")?N.documentElement.clientHeight:N.body.clientHeight;}return Q;},getViewportWidth:function(){var Q=self.innerWidth;var R=N.compatMode;if(R||H){Q=(R=="CSS1Compat")?N.documentElement.clientWidth:N.body.clientWidth;}return Q;},getAncestorBy:function(Q,R){while((Q=Q.parentNode)){if(D(Q,R)){return Q;}}return null;},getAncestorByClassName:function(R,Q){R=B.Dom.get(R);if(!R){return null;}var S=function(T){return B.Dom.hasClass(T,Q);};return B.Dom.getAncestorBy(R,S);},getAncestorByTagName:function(R,Q){R=B.Dom.get(R);if(!R){return null;}var S=function(T){return T.tagName&&T.tagName.toUpperCase()==Q.toUpperCase();};return B.Dom.getAncestorBy(R,S);},getPreviousSiblingBy:function(Q,R){while(Q){Q=Q.previousSibling;if(D(Q,R)){return Q;}}return null;},getPreviousSibling:function(Q){Q=B.Dom.get(Q);if(!Q){return null;}return B.Dom.getPreviousSiblingBy(Q);},getNextSiblingBy:function(Q,R){while(Q){Q=Q.nextSibling;if(D(Q,R)){return Q;}}return null;},getNextSibling:function(Q){Q=B.Dom.get(Q);if(!Q){return null;}return B.Dom.getNextSiblingBy(Q);},getFirstChildBy:function(Q,S){var R=(D(Q.firstChild,S))?Q.firstChild:null;return R||B.Dom.getNextSiblingBy(Q.firstChild,S);},getFirstChild:function(Q,R){Q=B.Dom.get(Q);if(!Q){return null;}return B.Dom.getFirstChildBy(Q);},getLastChildBy:function(Q,S){if(!Q){return null;}var R=(D(Q.lastChild,S))?Q.lastChild:null;return R||B.Dom.getPreviousSiblingBy(Q.lastChild,S);},getLastChild:function(Q){Q=B.Dom.get(Q);return B.Dom.getLastChildBy(Q);},getChildrenBy:function(R,T){var S=B.Dom.getFirstChildBy(R,T);var Q=S?[S]:[];B.Dom.getNextSiblingBy(S,function(U){if(!T||T(U)){Q[Q.length]=U;}return false;});return Q;},getChildren:function(Q){Q=B.Dom.get(Q);if(!Q){}return B.Dom.getChildrenBy(Q);},getDocumentScrollLeft:function(Q){Q=Q||N;return Math.max(Q.documentElement.scrollLeft,Q.body.scrollLeft);},getDocumentScrollTop:function(Q){Q=Q||N;return Math.max(Q.documentElement.scrollTop,Q.body.scrollTop);},insertBefore:function(R,Q){R=B.Dom.get(R);Q=B.Dom.get(Q);if(!R||!Q||!Q.parentNode){return null;}return Q.parentNode.insertBefore(R,Q);},insertAfter:function(R,Q){R=B.Dom.get(R);Q=B.Dom.get(Q);if(!R||!Q||!Q.parentNode){return null;}if(Q.nextSibling){return Q.parentNode.insertBefore(R,Q.nextSibling);}else{return Q.parentNode.appendChild(R);}},getClientRegion:function(){var S=B.Dom.getDocumentScrollTop(),R=B.Dom.getDocumentScrollLeft(),T=B.Dom.getViewportWidth()+R,Q=B.Dom.getViewportHeight()+S;return new B.Region(S,T,Q,R);}};var I=function(){if(N.documentElement.getBoundingClientRect){return function(S){var T=S.getBoundingClientRect(),R=Math.round;var Q=S.ownerDocument;return[R(T.left+B.Dom.getDocumentScrollLeft(Q)),R(T.top+B.Dom.getDocumentScrollTop(Q))];};}else{return function(S){var T=[S.offsetLeft,S.offsetTop];var R=S.offsetParent;var Q=(M&&B.Dom.getStyle(S,"position")=="absolute"&&S.offsetParent==S.ownerDocument.body);if(R!=S){while(R){T[0]+=R.offsetLeft;T[1]+=R.offsetTop;if(!Q&&M&&B.Dom.getStyle(R,"position")=="absolute"){Q=true;}R=R.offsetParent;}}if(Q){T[0]-=S.ownerDocument.body.offsetLeft;T[1]-=S.ownerDocument.body.offsetTop;}R=S.parentNode;while(R.tagName&&!E.ROOT_TAG.test(R.tagName)){if(R.scrollTop||R.scrollLeft){T[0]-=R.scrollLeft;T[1]-=R.scrollTop;}R=R.parentNode;}return T;};}}();})();YAHOO.util.Region=function(C,D,A,B){this.top=C;this[1]=C;this.right=D;this.bottom=A;this.left=B;this[0]=B;};YAHOO.util.Region.prototype.contains=function(A){return(A.left>=this.left&&A.right<=this.right&&A.top>=this.top&&A.bottom<=this.bottom);};YAHOO.util.Region.prototype.getArea=function(){return((this.bottom-this.top)*(this.right-this.left));};YAHOO.util.Region.prototype.intersect=function(E){var C=Math.max(this.top,E.top);var D=Math.min(this.right,E.right);var A=Math.min(this.bottom,E.bottom);var B=Math.max(this.left,E.left);if(A>=C&&D>=B){return new YAHOO.util.Region(C,D,A,B);}else{return null;}};YAHOO.util.Region.prototype.union=function(E){var C=Math.min(this.top,E.top);var D=Math.max(this.right,E.right);var A=Math.max(this.bottom,E.bottom);var B=Math.min(this.left,E.left);return new YAHOO.util.Region(C,D,A,B);};YAHOO.util.Region.prototype.toString=function(){return("Region {"+"top: "+this.top+", right: "+this.right+", bottom: "+this.bottom+", left: "+this.left+"}");};YAHOO.util.Region.getRegion=function(D){var F=YAHOO.util.Dom.getXY(D);var C=F[1];var E=F[0]+D.offsetWidth;var A=F[1]+D.offsetHeight;var B=F[0];return new YAHOO.util.Region(C,E,A,B);};YAHOO.util.Point=function(A,B){if(YAHOO.lang.isArray(A)){B=A[1];A=A[0];}this.x=this.right=this.left=this[0]=A;this.y=this.top=this.bottom=this[1]=B;};YAHOO.util.Point.prototype=new YAHOO.util.Region();YAHOO.register("dom",YAHOO.util.Dom,{version:"2.6.0",build:"1321"});YAHOO.util.CustomEvent=function(D,B,C,A){this.type=D;this.scope=B||window;this.silent=C;this.signature=A||YAHOO.util.CustomEvent.LIST;this.subscribers=[];if(!this.silent){}var E="_YUICEOnSubscribe";if(D!==E){this.subscribeEvent=new YAHOO.util.CustomEvent(E,this,true);}this.lastError=null;};YAHOO.util.CustomEvent.LIST=0;YAHOO.util.CustomEvent.FLAT=1;YAHOO.util.CustomEvent.prototype={subscribe:function(B,C,A){if(!B){throw new Error("Invalid callback for subscriber to '"+this.type+"'");}if(this.subscribeEvent){this.subscribeEvent.fire(B,C,A);}this.subscribers.push(new YAHOO.util.Subscriber(B,C,A));},unsubscribe:function(D,F){if(!D){return this.unsubscribeAll();}var E=false;for(var B=0,A=this.subscribers.length;B<A;++B){var C=this.subscribers[B];if(C&&C.contains(D,F)){this._delete(B);E=true;}}return E;},fire:function(){this.lastError=null;var K=[],E=this.subscribers.length;if(!E&&this.silent){return true;}var I=[].slice.call(arguments,0),G=true,D,J=false;if(!this.silent){}var C=this.subscribers.slice(),A=YAHOO.util.Event.throwErrors;for(D=0;D<E;++D){var M=C[D];if(!M){J=true;}else{if(!this.silent){}var L=M.getScope(this.scope);if(this.signature==YAHOO.util.CustomEvent.FLAT){var B=null;if(I.length>0){B=I[0];}try{G=M.fn.call(L,B,M.obj);}catch(F){this.lastError=F;if(A){throw F;}}}else{try{G=M.fn.call(L,this.type,I,M.obj);}catch(H){this.lastError=H;if(A){throw H;}}}if(false===G){if(!this.silent){}break;}}}return(G!==false);},unsubscribeAll:function(){for(var A=this.subscribers.length-1;A>-1;A--){this._delete(A);}this.subscribers=[];return A;},_delete:function(A){var B=this.subscribers[A];if(B){delete B.fn;delete B.obj;}this.subscribers.splice(A,1);},toString:function(){return"CustomEvent: "+"'"+this.type+"', "+"scope: "+this.scope;}};YAHOO.util.Subscriber=function(B,C,A){this.fn=B;this.obj=YAHOO.lang.isUndefined(C)?null:C;this.override=A;};YAHOO.util.Subscriber.prototype.getScope=function(A){if(this.override){if(this.override===true){return this.obj;}else{return this.override;}}return A;};YAHOO.util.Subscriber.prototype.contains=function(A,B){if(B){return(this.fn==A&&this.obj==B);}else{return(this.fn==A);}};YAHOO.util.Subscriber.prototype.toString=function(){return"Subscriber { obj: "+this.obj+", override: "+(this.override||"no")+" }";};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var H=false;var I=[];var J=[];var G=[];var E=[];var C=0;var F=[];var B=[];var A=0;var D={63232:38,63233:40,63234:37,63235:39,63276:33,63277:34,25:9};var K=YAHOO.env.ua.ie?"focusin":"focus";var L=YAHOO.env.ua.ie?"focusout":"blur";return{POLL_RETRYS:2000,POLL_INTERVAL:20,EL:0,TYPE:1,FN:2,WFN:3,UNLOAD_OBJ:3,ADJ_SCOPE:4,OBJ:5,OVERRIDE:6,CAPTURE:7,lastError:null,isSafari:YAHOO.env.ua.webkit,webkit:YAHOO.env.ua.webkit,isIE:YAHOO.env.ua.ie,_interval:null,_dri:null,DOMReady:false,throwErrors:false,startInterval:function(){if(!this._interval){var M=this;var N=function(){M._tryPreloadAttach();};this._interval=setInterval(N,this.POLL_INTERVAL);}},onAvailable:function(R,O,S,Q,P){var M=(YAHOO.lang.isString(R))?[R]:R;for(var N=0;N<M.length;N=N+1){F.push({id:M[N],fn:O,obj:S,override:Q,checkReady:P});}C=this.POLL_RETRYS;this.startInterval();},onContentReady:function(O,M,P,N){this.onAvailable(O,M,P,N,true);},onDOMReady:function(M,O,N){if(this.DOMReady){setTimeout(function(){var P=window;if(N){if(N===true){P=O;}else{P=N;}}M.call(P,"DOMReady",[],O);},0);}else{this.DOMReadyEvent.subscribe(M,O,N);}},_addListener:function(O,M,X,S,N,a){if(!X||!X.call){return false;}if(this._isValidCollection(O)){var Y=true;for(var T=0,V=O.length;T<V;++T){Y=this._addListener(O[T],M,X,S,N,a)&&Y;}return Y;}else{if(YAHOO.lang.isString(O)){var R=this.getEl(O);if(R){O=R;}else{this.onAvailable(O,function(){YAHOO.util.Event._addListener(O,M,X,S,N,a);});return true;}}}if(!O){return false;}if("unload"==M&&S!==this){J[J.length]=[O,M,X,S,N,a];return true;}var b=O;if(N){if(N===true){b=S;}else{b=N;}}var P=function(c){return X.call(b,YAHOO.util.Event.getEvent(c,O),S);};var Z=[O,M,X,P,b,S,N,a];var U=I.length;I[U]=Z;if(this.useLegacyEvent(O,M)){var Q=this.getLegacyIndex(O,M);if(Q==-1||O!=G[Q][0]){Q=G.length;B[O.id+M]=Q;G[Q]=[O,M,O["on"+M]];E[Q]=[];O["on"+M]=function(c){YAHOO.util.Event.fireLegacyEvent(YAHOO.util.Event.getEvent(c),Q);};}E[Q].push(Z);}else{try{this._simpleAdd(O,M,P,a);}catch(W){this.lastError=W;this._removeListener(O,M,X,a);return false;}}return true;},addListener:function(O,Q,N,P,M){return this._addListener(O,Q,N,P,M,false);},addFocusListener:function(O,N,P,M){return this._addListener(O,K,N,P,M,true);},removeFocusListener:function(N,M){return this._removeListener(N,K,M,true);},addBlurListener:function(O,N,P,M){return this._addListener(O,L,N,P,M,true);},removeBlurListener:function(N,M){return this._removeListener(N,L,M,true);},fireLegacyEvent:function(Q,O){var S=true,M,U,T,V,R;U=E[O].slice();for(var N=0,P=U.length;N<P;++N){T=U[N];if(T&&T[this.WFN]){V=T[this.ADJ_SCOPE];R=T[this.WFN].call(V,Q);S=(S&&R);}}M=G[O];if(M&&M[2]){M[2](Q);}return S;},getLegacyIndex:function(N,O){var M=this.generateId(N)+O;if(typeof B[M]=="undefined"){return -1;}else{return B[M];}},useLegacyEvent:function(M,N){return(this.webkit&&this.webkit<419&&("click"==N||"dblclick"==N));},_removeListener:function(N,M,V,Y){var Q,T,X;if(typeof N=="string"){N=this.getEl(N);}else{if(this._isValidCollection(N)){var W=true;for(Q=N.length-1;Q>-1;Q--){W=(this._removeListener(N[Q],M,V,Y)&&W);}return W;}}if(!V||!V.call){return this.purgeElement(N,false,M);}if("unload"==M){for(Q=J.length-1;Q>-1;Q--){X=J[Q];if(X&&X[0]==N&&X[1]==M&&X[2]==V){J.splice(Q,1);return true;}}return false;}var R=null;var S=arguments[4];if("undefined"===typeof S){S=this._getCacheIndex(N,M,V);}if(S>=0){R=I[S];}if(!N||!R){return false;}if(this.useLegacyEvent(N,M)){var P=this.getLegacyIndex(N,M);var O=E[P];if(O){for(Q=0,T=O.length;Q<T;++Q){X=O[Q];if(X&&X[this.EL]==N&&X[this.TYPE]==M&&X[this.FN]==V){O.splice(Q,1);break;}}}}else{try{this._simpleRemove(N,M,R[this.WFN],Y);}catch(U){this.lastError=U;return false;}}delete I[S][this.WFN];delete I[S][this.FN];
I.splice(S,1);return true;},removeListener:function(N,O,M){return this._removeListener(N,O,M,false);},getTarget:function(O,N){var M=O.target||O.srcElement;return this.resolveTextNode(M);},resolveTextNode:function(N){try{if(N&&3==N.nodeType){return N.parentNode;}}catch(M){}return N;},getPageX:function(N){var M=N.pageX;if(!M&&0!==M){M=N.clientX||0;if(this.isIE){M+=this._getScrollLeft();}}return M;},getPageY:function(M){var N=M.pageY;if(!N&&0!==N){N=M.clientY||0;if(this.isIE){N+=this._getScrollTop();}}return N;},getXY:function(M){return[this.getPageX(M),this.getPageY(M)];},getRelatedTarget:function(N){var M=N.relatedTarget;if(!M){if(N.type=="mouseout"){M=N.toElement;}else{if(N.type=="mouseover"){M=N.fromElement;}}}return this.resolveTextNode(M);},getTime:function(O){if(!O.time){var N=new Date().getTime();try{O.time=N;}catch(M){this.lastError=M;return N;}}return O.time;},stopEvent:function(M){this.stopPropagation(M);this.preventDefault(M);},stopPropagation:function(M){if(M.stopPropagation){M.stopPropagation();}else{M.cancelBubble=true;}},preventDefault:function(M){if(M.preventDefault){M.preventDefault();}else{M.returnValue=false;}},getEvent:function(O,M){var N=O||window.event;if(!N){var P=this.getEvent.caller;while(P){N=P.arguments[0];if(N&&Event==N.constructor){break;}P=P.caller;}}return N;},getCharCode:function(N){var M=N.keyCode||N.charCode||0;if(YAHOO.env.ua.webkit&&(M in D)){M=D[M];}return M;},_getCacheIndex:function(Q,R,P){for(var O=0,N=I.length;O<N;O=O+1){var M=I[O];if(M&&M[this.FN]==P&&M[this.EL]==Q&&M[this.TYPE]==R){return O;}}return -1;},generateId:function(M){var N=M.id;if(!N){N="yuievtautoid-"+A;++A;M.id=N;}return N;},_isValidCollection:function(N){try{return(N&&typeof N!=="string"&&N.length&&!N.tagName&&!N.alert&&typeof N[0]!=="undefined");}catch(M){return false;}},elCache:{},getEl:function(M){return(typeof M==="string")?document.getElementById(M):M;},clearCache:function(){},DOMReadyEvent:new YAHOO.util.CustomEvent("DOMReady",this),_load:function(N){if(!H){H=true;var M=YAHOO.util.Event;M._ready();M._tryPreloadAttach();}},_ready:function(N){var M=YAHOO.util.Event;if(!M.DOMReady){M.DOMReady=true;M.DOMReadyEvent.fire();M._simpleRemove(document,"DOMContentLoaded",M._ready);}},_tryPreloadAttach:function(){if(F.length===0){C=0;clearInterval(this._interval);this._interval=null;return ;}if(this.locked){return ;}if(this.isIE){if(!this.DOMReady){this.startInterval();return ;}}this.locked=true;var S=!H;if(!S){S=(C>0&&F.length>0);}var R=[];var T=function(V,W){var U=V;if(W.override){if(W.override===true){U=W.obj;}else{U=W.override;}}W.fn.call(U,W.obj);};var N,M,Q,P,O=[];for(N=0,M=F.length;N<M;N=N+1){Q=F[N];if(Q){P=this.getEl(Q.id);if(P){if(Q.checkReady){if(H||P.nextSibling||!S){O.push(Q);F[N]=null;}}else{T(P,Q);F[N]=null;}}else{R.push(Q);}}}for(N=0,M=O.length;N<M;N=N+1){Q=O[N];T(this.getEl(Q.id),Q);}C--;if(S){for(N=F.length-1;N>-1;N--){Q=F[N];if(!Q||!Q.id){F.splice(N,1);}}this.startInterval();}else{clearInterval(this._interval);this._interval=null;}this.locked=false;},purgeElement:function(Q,R,T){var O=(YAHOO.lang.isString(Q))?this.getEl(Q):Q;var S=this.getListeners(O,T),P,M;if(S){for(P=S.length-1;P>-1;P--){var N=S[P];this._removeListener(O,N.type,N.fn,N.capture);}}if(R&&O&&O.childNodes){for(P=0,M=O.childNodes.length;P<M;++P){this.purgeElement(O.childNodes[P],R,T);}}},getListeners:function(O,M){var R=[],N;if(!M){N=[I,J];}else{if(M==="unload"){N=[J];}else{N=[I];}}var T=(YAHOO.lang.isString(O))?this.getEl(O):O;for(var Q=0;Q<N.length;Q=Q+1){var V=N[Q];if(V){for(var S=0,U=V.length;S<U;++S){var P=V[S];if(P&&P[this.EL]===T&&(!M||M===P[this.TYPE])){R.push({type:P[this.TYPE],fn:P[this.FN],obj:P[this.OBJ],adjust:P[this.OVERRIDE],scope:P[this.ADJ_SCOPE],capture:P[this.CAPTURE],index:S});}}}}return(R.length)?R:null;},_unload:function(S){var M=YAHOO.util.Event,P,O,N,R,Q,T=J.slice();for(P=0,R=J.length;P<R;++P){N=T[P];if(N){var U=window;if(N[M.ADJ_SCOPE]){if(N[M.ADJ_SCOPE]===true){U=N[M.UNLOAD_OBJ];}else{U=N[M.ADJ_SCOPE];}}N[M.FN].call(U,M.getEvent(S,N[M.EL]),N[M.UNLOAD_OBJ]);T[P]=null;N=null;U=null;}}J=null;if(I){for(O=I.length-1;O>-1;O--){N=I[O];if(N){M._removeListener(N[M.EL],N[M.TYPE],N[M.FN],N[M.CAPTURE],O);}}N=null;}G=null;M._simpleRemove(window,"unload",M._unload);},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var M=document.documentElement,N=document.body;if(M&&(M.scrollTop||M.scrollLeft)){return[M.scrollTop,M.scrollLeft];}else{if(N){return[N.scrollTop,N.scrollLeft];}else{return[0,0];}}},regCE:function(){},_simpleAdd:function(){if(window.addEventListener){return function(O,P,N,M){O.addEventListener(P,N,(M));};}else{if(window.attachEvent){return function(O,P,N,M){O.attachEvent("on"+P,N);};}else{return function(){};}}}(),_simpleRemove:function(){if(window.removeEventListener){return function(O,P,N,M){O.removeEventListener(P,N,(M));};}else{if(window.detachEvent){return function(N,O,M){N.detachEvent("on"+O,M);};}else{return function(){};}}}()};}();(function(){var EU=YAHOO.util.Event;EU.on=EU.addListener;EU.onFocus=EU.addFocusListener;EU.onBlur=EU.addBlurListener;
/* DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller */
if(EU.isIE){YAHOO.util.Event.onDOMReady(YAHOO.util.Event._tryPreloadAttach,YAHOO.util.Event,true);var n=document.createElement("p");EU._dri=setInterval(function(){try{n.doScroll("left");clearInterval(EU._dri);EU._dri=null;EU._ready();n=null;}catch(ex){}},EU.POLL_INTERVAL);}else{if(EU.webkit&&EU.webkit<525){EU._dri=setInterval(function(){var rs=document.readyState;if("loaded"==rs||"complete"==rs){clearInterval(EU._dri);EU._dri=null;EU._ready();}},EU.POLL_INTERVAL);}else{EU._simpleAdd(document,"DOMContentLoaded",EU._ready);}}EU._simpleAdd(window,"load",EU._load);EU._simpleAdd(window,"unload",EU._unload);EU._tryPreloadAttach();})();}YAHOO.util.EventProvider=function(){};YAHOO.util.EventProvider.prototype={__yui_events:null,__yui_subscribers:null,subscribe:function(A,C,F,E){this.__yui_events=this.__yui_events||{};
var D=this.__yui_events[A];if(D){D.subscribe(C,F,E);}else{this.__yui_subscribers=this.__yui_subscribers||{};var B=this.__yui_subscribers;if(!B[A]){B[A]=[];}B[A].push({fn:C,obj:F,override:E});}},unsubscribe:function(C,E,G){this.__yui_events=this.__yui_events||{};var A=this.__yui_events;if(C){var F=A[C];if(F){return F.unsubscribe(E,G);}}else{var B=true;for(var D in A){if(YAHOO.lang.hasOwnProperty(A,D)){B=B&&A[D].unsubscribe(E,G);}}return B;}return false;},unsubscribeAll:function(A){return this.unsubscribe(A);},createEvent:function(G,D){this.__yui_events=this.__yui_events||{};var A=D||{};var I=this.__yui_events;if(I[G]){}else{var H=A.scope||this;var E=(A.silent);var B=new YAHOO.util.CustomEvent(G,H,E,YAHOO.util.CustomEvent.FLAT);I[G]=B;if(A.onSubscribeCallback){B.subscribeEvent.subscribe(A.onSubscribeCallback);}this.__yui_subscribers=this.__yui_subscribers||{};var F=this.__yui_subscribers[G];if(F){for(var C=0;C<F.length;++C){B.subscribe(F[C].fn,F[C].obj,F[C].override);}}}return I[G];},fireEvent:function(E,D,A,C){this.__yui_events=this.__yui_events||{};var G=this.__yui_events[E];if(!G){return null;}var B=[];for(var F=1;F<arguments.length;++F){B.push(arguments[F]);}return G.fire.apply(G,B);},hasEvent:function(A){if(this.__yui_events){if(this.__yui_events[A]){return true;}}return false;}};YAHOO.util.KeyListener=function(A,F,B,C){if(!A){}else{if(!F){}else{if(!B){}}}if(!C){C=YAHOO.util.KeyListener.KEYDOWN;}var D=new YAHOO.util.CustomEvent("keyPressed");this.enabledEvent=new YAHOO.util.CustomEvent("enabled");this.disabledEvent=new YAHOO.util.CustomEvent("disabled");if(typeof A=="string"){A=document.getElementById(A);}if(typeof B=="function"){D.subscribe(B);}else{D.subscribe(B.fn,B.scope,B.correctScope);}function E(J,I){if(!F.shift){F.shift=false;}if(!F.alt){F.alt=false;}if(!F.ctrl){F.ctrl=false;}if(J.shiftKey==F.shift&&J.altKey==F.alt&&J.ctrlKey==F.ctrl){var G;if(F.keys instanceof Array){for(var H=0;H<F.keys.length;H++){G=F.keys[H];if(G==J.charCode){D.fire(J.charCode,J);break;}else{if(G==J.keyCode){D.fire(J.keyCode,J);break;}}}}else{G=F.keys;if(G==J.charCode){D.fire(J.charCode,J);}else{if(G==J.keyCode){D.fire(J.keyCode,J);}}}}}this.enable=function(){if(!this.enabled){YAHOO.util.Event.addListener(A,C,E);this.enabledEvent.fire(F);}this.enabled=true;};this.disable=function(){if(this.enabled){YAHOO.util.Event.removeListener(A,C,E);this.disabledEvent.fire(F);}this.enabled=false;};this.toString=function(){return"KeyListener ["+F.keys+"] "+A.tagName+(A.id?"["+A.id+"]":"");};};YAHOO.util.KeyListener.KEYDOWN="keydown";YAHOO.util.KeyListener.KEYUP="keyup";YAHOO.util.KeyListener.KEY={ALT:18,BACK_SPACE:8,CAPS_LOCK:20,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,META:224,NUM_LOCK:144,PAGE_DOWN:34,PAGE_UP:33,PAUSE:19,PRINTSCREEN:44,RIGHT:39,SCROLL_LOCK:145,SHIFT:16,SPACE:32,TAB:9,UP:38};YAHOO.register("event",YAHOO.util.Event,{version:"2.6.0",build:"1321"});YAHOO.register("yahoo-dom-event", YAHOO, {version: "2.6.0", build: "1321"});

/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
YAHOO.util.Connect={_msxml_progid:["Microsoft.XMLHTTP","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP"],_http_headers:{},_has_http_headers:false,_use_default_post_header:true,_default_post_header:"application/x-www-form-urlencoded; charset=UTF-8",_default_form_header:"application/x-www-form-urlencoded",_use_default_xhr_header:true,_default_xhr_header:"XMLHttpRequest",_has_default_headers:true,_default_headers:{},_isFormSubmit:false,_isFileUpload:false,_formNode:null,_sFormData:null,_poll:{},_timeOut:{},_polling_interval:50,_transaction_id:0,_submitElementValue:null,_hasSubmitListener:(function(){if(YAHOO.util.Event){YAHOO.util.Event.addListener(document,"click",function(B){var A=YAHOO.util.Event.getTarget(B);if(A.nodeName.toLowerCase()=="input"&&(A.type&&A.type.toLowerCase()=="submit")){YAHOO.util.Connect._submitElementValue=encodeURIComponent(A.name)+"="+encodeURIComponent(A.value);}});return true;}return false;})(),startEvent:new YAHOO.util.CustomEvent("start"),completeEvent:new YAHOO.util.CustomEvent("complete"),successEvent:new YAHOO.util.CustomEvent("success"),failureEvent:new YAHOO.util.CustomEvent("failure"),uploadEvent:new YAHOO.util.CustomEvent("upload"),abortEvent:new YAHOO.util.CustomEvent("abort"),_customEvents:{onStart:["startEvent","start"],onComplete:["completeEvent","complete"],onSuccess:["successEvent","success"],onFailure:["failureEvent","failure"],onUpload:["uploadEvent","upload"],onAbort:["abortEvent","abort"]},setProgId:function(A){this._msxml_progid.unshift(A);},setDefaultPostHeader:function(A){if(typeof A=="string"){this._default_post_header=A;}else{if(typeof A=="boolean"){this._use_default_post_header=A;}}},setDefaultXhrHeader:function(A){if(typeof A=="string"){this._default_xhr_header=A;}else{this._use_default_xhr_header=A;}},setPollingInterval:function(A){if(typeof A=="number"&&isFinite(A)){this._polling_interval=A;}},createXhrObject:function(F){var E,A;try{A=new XMLHttpRequest();E={conn:A,tId:F};}catch(D){for(var B=0;B<this._msxml_progid.length;++B){try{A=new ActiveXObject(this._msxml_progid[B]);E={conn:A,tId:F};break;}catch(C){}}}finally{return E;}},getConnectionObject:function(A){var C;var D=this._transaction_id;try{if(!A){C=this.createXhrObject(D);}else{C={};C.tId=D;C.isUpload=true;}if(C){this._transaction_id++;}}catch(B){}finally{return C;}},asyncRequest:function(F,C,E,A){var D=(this._isFileUpload)?this.getConnectionObject(true):this.getConnectionObject();var B=(E&&E.argument)?E.argument:null;if(!D){return null;}else{if(E&&E.customevents){this.initCustomEvents(D,E);}if(this._isFormSubmit){if(this._isFileUpload){this.uploadFile(D,E,C,A);return D;}if(F.toUpperCase()=="GET"){if(this._sFormData.length!==0){C+=((C.indexOf("?")==-1)?"?":"&")+this._sFormData;}}else{if(F.toUpperCase()=="POST"){A=A?this._sFormData+"&"+A:this._sFormData;}}}if(F.toUpperCase()=="GET"&&(E&&E.cache===false)){C+=((C.indexOf("?")==-1)?"?":"&")+"rnd="+new Date().valueOf().toString();}D.conn.open(F,C,true);if(this._use_default_xhr_header){if(!this._default_headers["X-Requested-With"]){this.initHeader("X-Requested-With",this._default_xhr_header,true);}}if((F.toUpperCase()==="POST"&&this._use_default_post_header)&&this._isFormSubmit===false){this.initHeader("Content-Type",this._default_post_header);}if(this._has_default_headers||this._has_http_headers){this.setHeader(D);}this.handleReadyState(D,E);D.conn.send(A||"");if(this._isFormSubmit===true){this.resetFormState();}this.startEvent.fire(D,B);if(D.startEvent){D.startEvent.fire(D,B);}return D;}},initCustomEvents:function(A,C){var B;for(B in C.customevents){if(this._customEvents[B][0]){A[this._customEvents[B][0]]=new YAHOO.util.CustomEvent(this._customEvents[B][1],(C.scope)?C.scope:null);A[this._customEvents[B][0]].subscribe(C.customevents[B]);}}},handleReadyState:function(C,D){var B=this;var A=(D&&D.argument)?D.argument:null;if(D&&D.timeout){this._timeOut[C.tId]=window.setTimeout(function(){B.abort(C,D,true);},D.timeout);}this._poll[C.tId]=window.setInterval(function(){if(C.conn&&C.conn.readyState===4){window.clearInterval(B._poll[C.tId]);delete B._poll[C.tId];if(D&&D.timeout){window.clearTimeout(B._timeOut[C.tId]);delete B._timeOut[C.tId];}B.completeEvent.fire(C,A);if(C.completeEvent){C.completeEvent.fire(C,A);}B.handleTransactionResponse(C,D);}},this._polling_interval);},handleTransactionResponse:function(F,G,A){var D,C;var B=(G&&G.argument)?G.argument:null;try{if(F.conn.status!==undefined&&F.conn.status!==0){D=F.conn.status;}else{D=13030;}}catch(E){D=13030;}if(D>=200&&D<300||D===1223){C=this.createResponseObject(F,B);if(G&&G.success){if(!G.scope){G.success(C);}else{G.success.apply(G.scope,[C]);}}this.successEvent.fire(C);if(F.successEvent){F.successEvent.fire(C);}}else{switch(D){case 12002:case 12029:case 12030:case 12031:case 12152:case 13030:C=this.createExceptionObject(F.tId,B,(A?A:false));if(G&&G.failure){if(!G.scope){G.failure(C);}else{G.failure.apply(G.scope,[C]);}}break;default:C=this.createResponseObject(F,B);if(G&&G.failure){if(!G.scope){G.failure(C);}else{G.failure.apply(G.scope,[C]);}}}this.failureEvent.fire(C);if(F.failureEvent){F.failureEvent.fire(C);}}this.releaseObject(F);C=null;},createResponseObject:function(A,G){var D={};var I={};try{var C=A.conn.getAllResponseHeaders();var F=C.split("\n");for(var E=0;E<F.length;E++){var B=F[E].indexOf(":");if(B!=-1){I[F[E].substring(0,B)]=F[E].substring(B+2);}}}catch(H){}D.tId=A.tId;D.status=(A.conn.status==1223)?204:A.conn.status;D.statusText=(A.conn.status==1223)?"No Content":A.conn.statusText;D.getResponseHeader=I;D.getAllResponseHeaders=C;D.responseText=A.conn.responseText;D.responseXML=A.conn.responseXML;if(G){D.argument=G;}return D;},createExceptionObject:function(H,D,A){var F=0;var G="communication failure";var C=-1;var B="transaction aborted";var E={};E.tId=H;if(A){E.status=C;E.statusText=B;}else{E.status=F;E.statusText=G;}if(D){E.argument=D;}return E;},initHeader:function(A,D,C){var B=(C)?this._default_headers:this._http_headers;B[A]=D;if(C){this._has_default_headers=true;}else{this._has_http_headers=true;
}},setHeader:function(A){var B;if(this._has_default_headers){for(B in this._default_headers){if(YAHOO.lang.hasOwnProperty(this._default_headers,B)){A.conn.setRequestHeader(B,this._default_headers[B]);}}}if(this._has_http_headers){for(B in this._http_headers){if(YAHOO.lang.hasOwnProperty(this._http_headers,B)){A.conn.setRequestHeader(B,this._http_headers[B]);}}delete this._http_headers;this._http_headers={};this._has_http_headers=false;}},resetDefaultHeaders:function(){delete this._default_headers;this._default_headers={};this._has_default_headers=false;},setForm:function(M,H,C){var L,B,K,I,P,J=false,F=[],O=0,E,G,D,N,A;this.resetFormState();if(typeof M=="string"){L=(document.getElementById(M)||document.forms[M]);}else{if(typeof M=="object"){L=M;}else{return ;}}if(H){this.createFrame(C?C:null);this._isFormSubmit=true;this._isFileUpload=true;this._formNode=L;return ;}for(E=0,G=L.elements.length;E<G;++E){B=L.elements[E];P=B.disabled;K=B.name;if(!P&&K){K=encodeURIComponent(K)+"=";I=encodeURIComponent(B.value);switch(B.type){case"select-one":if(B.selectedIndex>-1){A=B.options[B.selectedIndex];F[O++]=K+encodeURIComponent((A.attributes.value&&A.attributes.value.specified)?A.value:A.text);}break;case"select-multiple":if(B.selectedIndex>-1){for(D=B.selectedIndex,N=B.options.length;D<N;++D){A=B.options[D];if(A.selected){F[O++]=K+encodeURIComponent((A.attributes.value&&A.attributes.value.specified)?A.value:A.text);}}}break;case"radio":case"checkbox":if(B.checked){F[O++]=K+I;}break;case"file":case undefined:case"reset":case"button":break;case"submit":if(J===false){if(this._hasSubmitListener&&this._submitElementValue){F[O++]=this._submitElementValue;}else{F[O++]=K+I;}J=true;}break;default:F[O++]=K+I;}}}this._isFormSubmit=true;this._sFormData=F.join("&");this.initHeader("Content-Type",this._default_form_header);return this._sFormData;},resetFormState:function(){this._isFormSubmit=false;this._isFileUpload=false;this._formNode=null;this._sFormData="";},createFrame:function(A){var B="yuiIO"+this._transaction_id;var C;if(YAHOO.env.ua.ie){C=document.createElement('<iframe id="'+B+'" name="'+B+'" />');if(typeof A=="boolean"){C.src="javascript:false";}}else{C=document.createElement("iframe");C.id=B;C.name=B;}C.style.position="absolute";C.style.top="-1000px";C.style.left="-1000px";document.body.appendChild(C);},appendPostData:function(A){var D=[],B=A.split("&"),C,E;for(C=0;C<B.length;C++){E=B[C].indexOf("=");if(E!=-1){D[C]=document.createElement("input");D[C].type="hidden";D[C].name=decodeURIComponent(B[C].substring(0,E));D[C].value=decodeURIComponent(B[C].substring(E+1));this._formNode.appendChild(D[C]);}}return D;},uploadFile:function(D,N,E,C){var I="yuiIO"+D.tId,J="multipart/form-data",L=document.getElementById(I),O=this,K=(N&&N.argument)?N.argument:null,M,H,B,G;var A={action:this._formNode.getAttribute("action"),method:this._formNode.getAttribute("method"),target:this._formNode.getAttribute("target")};this._formNode.setAttribute("action",E);this._formNode.setAttribute("method","POST");this._formNode.setAttribute("target",I);if(YAHOO.env.ua.ie){this._formNode.setAttribute("encoding",J);}else{this._formNode.setAttribute("enctype",J);}if(C){M=this.appendPostData(C);}this._formNode.submit();this.startEvent.fire(D,K);if(D.startEvent){D.startEvent.fire(D,K);}if(N&&N.timeout){this._timeOut[D.tId]=window.setTimeout(function(){O.abort(D,N,true);},N.timeout);}if(M&&M.length>0){for(H=0;H<M.length;H++){this._formNode.removeChild(M[H]);}}for(B in A){if(YAHOO.lang.hasOwnProperty(A,B)){if(A[B]){this._formNode.setAttribute(B,A[B]);}else{this._formNode.removeAttribute(B);}}}this.resetFormState();var F=function(){if(N&&N.timeout){window.clearTimeout(O._timeOut[D.tId]);delete O._timeOut[D.tId];}O.completeEvent.fire(D,K);if(D.completeEvent){D.completeEvent.fire(D,K);}G={tId:D.tId,argument:N.argument};try{G.responseText=L.contentWindow.document.body?L.contentWindow.document.body.innerHTML:L.contentWindow.document.documentElement.textContent;G.responseXML=L.contentWindow.document.XMLDocument?L.contentWindow.document.XMLDocument:L.contentWindow.document;}catch(P){}if(N&&N.upload){if(!N.scope){N.upload(G);}else{N.upload.apply(N.scope,[G]);}}O.uploadEvent.fire(G);if(D.uploadEvent){D.uploadEvent.fire(G);}YAHOO.util.Event.removeListener(L,"load",F);setTimeout(function(){document.body.removeChild(L);O.releaseObject(D);},100);};YAHOO.util.Event.addListener(L,"load",F);},abort:function(E,G,A){var D;var B=(G&&G.argument)?G.argument:null;if(E&&E.conn){if(this.isCallInProgress(E)){E.conn.abort();window.clearInterval(this._poll[E.tId]);delete this._poll[E.tId];if(A){window.clearTimeout(this._timeOut[E.tId]);delete this._timeOut[E.tId];}D=true;}}else{if(E&&E.isUpload===true){var C="yuiIO"+E.tId;var F=document.getElementById(C);if(F){YAHOO.util.Event.removeListener(F,"load");document.body.removeChild(F);if(A){window.clearTimeout(this._timeOut[E.tId]);delete this._timeOut[E.tId];}D=true;}}else{D=false;}}if(D===true){this.abortEvent.fire(E,B);if(E.abortEvent){E.abortEvent.fire(E,B);}this.handleTransactionResponse(E,G,true);}return D;},isCallInProgress:function(B){if(B&&B.conn){return B.conn.readyState!==4&&B.conn.readyState!==0;}else{if(B&&B.isUpload===true){var A="yuiIO"+B.tId;return document.getElementById(A)?true:false;}else{return false;}}},releaseObject:function(A){if(A&&A.conn){A.conn=null;A=null;}}};YAHOO.register("connection",YAHOO.util.Connect,{version:"2.6.0",build:"1321"});
/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
(function(){var lang=YAHOO.lang,util=YAHOO.util,Ev=util.Event;util.DataSourceBase=function(oLiveData,oConfigs){if(oLiveData===null||oLiveData===undefined){return ;}this.liveData=oLiveData;this._oQueue={interval:null,conn:null,requests:[]};this.responseSchema={};if(oConfigs&&(oConfigs.constructor==Object)){for(var sConfig in oConfigs){if(sConfig){this[sConfig]=oConfigs[sConfig];}}}var maxCacheEntries=this.maxCacheEntries;if(!lang.isNumber(maxCacheEntries)||(maxCacheEntries<0)){maxCacheEntries=0;}this._aIntervals=[];this.createEvent("cacheRequestEvent");this.createEvent("cacheResponseEvent");this.createEvent("requestEvent");this.createEvent("responseEvent");this.createEvent("responseParseEvent");this.createEvent("responseCacheEvent");this.createEvent("dataErrorEvent");this.createEvent("cacheFlushEvent");var DS=util.DataSourceBase;this._sName="DataSource instance"+DS._nIndex;DS._nIndex++;};var DS=util.DataSourceBase;lang.augmentObject(DS,{TYPE_UNKNOWN:-1,TYPE_JSARRAY:0,TYPE_JSFUNCTION:1,TYPE_XHR:2,TYPE_JSON:3,TYPE_XML:4,TYPE_TEXT:5,TYPE_HTMLTABLE:6,TYPE_SCRIPTNODE:7,TYPE_LOCAL:8,ERROR_DATAINVALID:"Invalid data",ERROR_DATANULL:"Null data",_nIndex:0,_nTransactionId:0,issueCallback:function(callback,params,error,scope){if(lang.isFunction(callback)){callback.apply(scope,params);}else{if(lang.isObject(callback)){scope=callback.scope||scope||window;var callbackFunc=callback.success;if(error){callbackFunc=callback.failure;}if(callbackFunc){callbackFunc.apply(scope,params.concat([callback.argument]));}}}},parseString:function(oData){if(!lang.isValue(oData)){return null;}var string=oData+"";if(lang.isString(string)){return string;}else{return null;}},parseNumber:function(oData){var number=oData*1;if(lang.isNumber(number)){return number;}else{return null;}},convertNumber:function(oData){return DS.parseNumber(oData);},parseDate:function(oData){var date=null;if(!(oData instanceof Date)){date=new Date(oData);}else{return oData;}if(date instanceof Date){return date;}else{return null;}},convertDate:function(oData){return DS.parseDate(oData);}});DS.Parser={string:DS.parseString,number:DS.parseNumber,date:DS.parseDate};DS.prototype={_sName:null,_aCache:null,_oQueue:null,_aIntervals:null,maxCacheEntries:0,liveData:null,dataType:DS.TYPE_UNKNOWN,responseType:DS.TYPE_UNKNOWN,responseSchema:null,toString:function(){return this._sName;},getCachedResponse:function(oRequest,oCallback,oCaller){var aCache=this._aCache;if(this.maxCacheEntries>0){if(!aCache){this._aCache=[];}else{var nCacheLength=aCache.length;if(nCacheLength>0){var oResponse=null;this.fireEvent("cacheRequestEvent",{request:oRequest,callback:oCallback,caller:oCaller});for(var i=nCacheLength-1;i>=0;i--){var oCacheElem=aCache[i];if(this.isCacheHit(oRequest,oCacheElem.request)){oResponse=oCacheElem.response;this.fireEvent("cacheResponseEvent",{request:oRequest,response:oResponse,callback:oCallback,caller:oCaller});if(i<nCacheLength-1){aCache.splice(i,1);this.addToCache(oRequest,oResponse);}oResponse.cached=true;break;}}return oResponse;}}}else{if(aCache){this._aCache=null;}}return null;},isCacheHit:function(oRequest,oCachedRequest){return(oRequest===oCachedRequest);},addToCache:function(oRequest,oResponse){var aCache=this._aCache;if(!aCache){return ;}while(aCache.length>=this.maxCacheEntries){aCache.shift();}var oCacheElem={request:oRequest,response:oResponse};aCache[aCache.length]=oCacheElem;this.fireEvent("responseCacheEvent",{request:oRequest,response:oResponse});},flushCache:function(){if(this._aCache){this._aCache=[];this.fireEvent("cacheFlushEvent");}},setInterval:function(nMsec,oRequest,oCallback,oCaller){if(lang.isNumber(nMsec)&&(nMsec>=0)){var oSelf=this;var nId=setInterval(function(){oSelf.makeConnection(oRequest,oCallback,oCaller);},nMsec);this._aIntervals.push(nId);return nId;}else{}},clearInterval:function(nId){var tracker=this._aIntervals||[];for(var i=tracker.length-1;i>-1;i--){if(tracker[i]===nId){tracker.splice(i,1);clearInterval(nId);}}},clearAllIntervals:function(){var tracker=this._aIntervals||[];for(var i=tracker.length-1;i>-1;i--){clearInterval(tracker[i]);}tracker=[];},sendRequest:function(oRequest,oCallback,oCaller){var oCachedResponse=this.getCachedResponse(oRequest,oCallback,oCaller);if(oCachedResponse){DS.issueCallback(oCallback,[oRequest,oCachedResponse],false,oCaller);return null;}return this.makeConnection(oRequest,oCallback,oCaller);},makeConnection:function(oRequest,oCallback,oCaller){var tId=DS._nTransactionId++;this.fireEvent("requestEvent",{tId:tId,request:oRequest,callback:oCallback,caller:oCaller});var oRawResponse=this.liveData;this.handleResponse(oRequest,oRawResponse,oCallback,oCaller,tId);return tId;},handleResponse:function(oRequest,oRawResponse,oCallback,oCaller,tId){this.fireEvent("responseEvent",{tId:tId,request:oRequest,response:oRawResponse,callback:oCallback,caller:oCaller});var xhr=(this.dataType==DS.TYPE_XHR)?true:false;var oParsedResponse=null;var oFullResponse=oRawResponse;if(this.responseType===DS.TYPE_UNKNOWN){var ctype=(oRawResponse&&oRawResponse.getResponseHeader)?oRawResponse.getResponseHeader["Content-Type"]:null;if(ctype){if(ctype.indexOf("text/xml")>-1){this.responseType=DS.TYPE_XML;}else{if(ctype.indexOf("application/json")>-1){this.responseType=DS.TYPE_JSON;}else{if(ctype.indexOf("text/plain")>-1){this.responseType=DS.TYPE_TEXT;}}}}else{if(YAHOO.lang.isArray(oRawResponse)){this.responseType=DS.TYPE_JSARRAY;}else{if(oRawResponse&&oRawResponse.nodeType&&oRawResponse.nodeType==9){this.responseType=DS.TYPE_XML;}else{if(oRawResponse&&oRawResponse.nodeName&&(oRawResponse.nodeName.toLowerCase()=="table")){this.responseType=DS.TYPE_HTMLTABLE;}else{if(YAHOO.lang.isObject(oRawResponse)){this.responseType=DS.TYPE_JSON;}else{if(YAHOO.lang.isString(oRawResponse)){this.responseType=DS.TYPE_TEXT;}}}}}}}switch(this.responseType){case DS.TYPE_JSARRAY:if(xhr&&oRawResponse&&oRawResponse.responseText){oFullResponse=oRawResponse.responseText;}oFullResponse=this.doBeforeParseData(oRequest,oFullResponse,oCallback);oParsedResponse=this.parseArrayData(oRequest,oFullResponse);
break;case DS.TYPE_JSON:if(xhr&&oRawResponse&&oRawResponse.responseText){oFullResponse=oRawResponse.responseText;}try{if(lang.isString(oFullResponse)){if(lang.JSON){oFullResponse=lang.JSON.parse(oFullResponse);}else{if(window.JSON&&JSON.parse){oFullResponse=JSON.parse(oFullResponse);}else{if(oFullResponse.parseJSON){oFullResponse=oFullResponse.parseJSON();}else{while(oFullResponse.length>0&&(oFullResponse.charAt(0)!="{")&&(oFullResponse.charAt(0)!="[")){oFullResponse=oFullResponse.substring(1,oFullResponse.length);}if(oFullResponse.length>0){var objEnd=Math.max(oFullResponse.lastIndexOf("]"),oFullResponse.lastIndexOf("}"));oFullResponse=oFullResponse.substring(0,objEnd+1);oFullResponse=eval("("+oFullResponse+")");}}}}}}catch(e){}oFullResponse=this.doBeforeParseData(oRequest,oFullResponse,oCallback);oParsedResponse=this.parseJSONData(oRequest,oFullResponse);break;case DS.TYPE_HTMLTABLE:if(xhr&&oRawResponse.responseText){oFullResponse=oRawResponse.responseText;}oFullResponse=this.doBeforeParseData(oRequest,oFullResponse,oCallback);oParsedResponse=this.parseHTMLTableData(oRequest,oFullResponse);break;case DS.TYPE_XML:if(xhr&&oRawResponse.responseXML){oFullResponse=oRawResponse.responseXML;}oFullResponse=this.doBeforeParseData(oRequest,oFullResponse,oCallback);oParsedResponse=this.parseXMLData(oRequest,oFullResponse);break;case DS.TYPE_TEXT:if(xhr&&lang.isString(oRawResponse.responseText)){oFullResponse=oRawResponse.responseText;}oFullResponse=this.doBeforeParseData(oRequest,oFullResponse,oCallback);oParsedResponse=this.parseTextData(oRequest,oFullResponse);break;default:oFullResponse=this.doBeforeParseData(oRequest,oFullResponse,oCallback);oParsedResponse=this.parseData(oRequest,oFullResponse);break;}oParsedResponse=oParsedResponse||{};if(!oParsedResponse.results){oParsedResponse.results=[];}if(!oParsedResponse.meta){oParsedResponse.meta={};}if(oParsedResponse&&!oParsedResponse.error){oParsedResponse=this.doBeforeCallback(oRequest,oFullResponse,oParsedResponse,oCallback);this.fireEvent("responseParseEvent",{request:oRequest,response:oParsedResponse,callback:oCallback,caller:oCaller});this.addToCache(oRequest,oParsedResponse);}else{oParsedResponse.error=true;this.fireEvent("dataErrorEvent",{request:oRequest,response:oRawResponse,callback:oCallback,caller:oCaller,message:DS.ERROR_DATANULL});}oParsedResponse.tId=tId;DS.issueCallback(oCallback,[oRequest,oParsedResponse],oParsedResponse.error,oCaller);},doBeforeParseData:function(oRequest,oFullResponse,oCallback){return oFullResponse;},doBeforeCallback:function(oRequest,oFullResponse,oParsedResponse,oCallback){return oParsedResponse;},parseData:function(oRequest,oFullResponse){if(lang.isValue(oFullResponse)){var oParsedResponse={results:oFullResponse,meta:{}};return oParsedResponse;}return null;},parseArrayData:function(oRequest,oFullResponse){if(lang.isArray(oFullResponse)){var results=[],i,j,rec,field,data;if(lang.isArray(this.responseSchema.fields)){var fields=this.responseSchema.fields;for(i=fields.length-1;i>=0;--i){if(typeof fields[i]!=="object"){fields[i]={key:fields[i]};}}var parsers={},p;for(i=fields.length-1;i>=0;--i){p=(typeof fields[i].parser==="function"?fields[i].parser:DS.Parser[fields[i].parser+""])||fields[i].converter;if(p){parsers[fields[i].key]=p;}}var arrType=lang.isArray(oFullResponse[0]);for(i=oFullResponse.length-1;i>-1;i--){var oResult={};rec=oFullResponse[i];if(typeof rec==="object"){for(j=fields.length-1;j>-1;j--){field=fields[j];data=arrType?rec[j]:rec[field.key];if(parsers[field.key]){data=parsers[field.key].call(this,data);}if(data===undefined){data=null;}oResult[field.key]=data;}}else{if(lang.isString(rec)){for(j=fields.length-1;j>-1;j--){field=fields[j];data=rec;if(parsers[field.key]){data=parsers[field.key].call(this,data);}if(data===undefined){data=null;}oResult[field.key]=data;}}}results[i]=oResult;}}else{results=oFullResponse;}var oParsedResponse={results:results};return oParsedResponse;}return null;},parseTextData:function(oRequest,oFullResponse){if(lang.isString(oFullResponse)){if(lang.isString(this.responseSchema.recordDelim)&&lang.isString(this.responseSchema.fieldDelim)){var oParsedResponse={results:[]};var recDelim=this.responseSchema.recordDelim;var fieldDelim=this.responseSchema.fieldDelim;if(oFullResponse.length>0){var newLength=oFullResponse.length-recDelim.length;if(oFullResponse.substr(newLength)==recDelim){oFullResponse=oFullResponse.substr(0,newLength);}if(oFullResponse.length>0){var recordsarray=oFullResponse.split(recDelim);for(var i=0,len=recordsarray.length,recIdx=0;i<len;++i){var bError=false,sRecord=recordsarray[i];if(lang.isString(sRecord)&&(sRecord.length>0)){var fielddataarray=recordsarray[i].split(fieldDelim);var oResult={};if(lang.isArray(this.responseSchema.fields)){var fields=this.responseSchema.fields;for(var j=fields.length-1;j>-1;j--){try{var data=fielddataarray[j];if(lang.isString(data)){if(data.charAt(0)=='"'){data=data.substr(1);}if(data.charAt(data.length-1)=='"'){data=data.substr(0,data.length-1);}var field=fields[j];var key=(lang.isValue(field.key))?field.key:field;if(!field.parser&&field.converter){field.parser=field.converter;}var parser=(typeof field.parser==="function")?field.parser:DS.Parser[field.parser+""];if(parser){data=parser.call(this,data);}if(data===undefined){data=null;}oResult[key]=data;}else{bError=true;}}catch(e){bError=true;}}}else{oResult=fielddataarray;}if(!bError){oParsedResponse.results[recIdx++]=oResult;}}}}}return oParsedResponse;}}return null;},parseXMLResult:function(result){var oResult={},schema=this.responseSchema;try{for(var m=schema.fields.length-1;m>=0;m--){var field=schema.fields[m];var key=(lang.isValue(field.key))?field.key:field;var data=null;var xmlAttr=result.attributes.getNamedItem(key);if(xmlAttr){data=xmlAttr.value;}else{var xmlNode=result.getElementsByTagName(key);if(xmlNode&&xmlNode.item(0)&&xmlNode.item(0)){data=xmlNode.item(0).firstChild.nodeValue;var item=xmlNode.item(0);data=(item.text)?item.text:(item.textContent)?item.textContent:null;
if(!data){var datapieces=[];for(var j=0,len=item.childNodes.length;j<len;j++){if(item.childNodes[j].nodeValue){datapieces[datapieces.length]=item.childNodes[j].nodeValue;}}if(datapieces.length>0){data=datapieces.join("");}}}}if(data===null){data="";}if(!field.parser&&field.converter){field.parser=field.converter;}var parser=(typeof field.parser==="function")?field.parser:DS.Parser[field.parser+""];if(parser){data=parser.call(this,data);}if(data===undefined){data=null;}oResult[key]=data;}}catch(e){}return oResult;},parseXMLData:function(oRequest,oFullResponse){var bError=false,schema=this.responseSchema,oParsedResponse={meta:{}},xmlList=null,metaNode=schema.metaNode,metaLocators=schema.metaFields||{},i,k,loc,v;try{xmlList=(schema.resultNode)?oFullResponse.getElementsByTagName(schema.resultNode):null;metaNode=metaNode?oFullResponse.getElementsByTagName(metaNode)[0]:oFullResponse;if(metaNode){for(k in metaLocators){if(lang.hasOwnProperty(metaLocators,k)){loc=metaLocators[k];v=metaNode.getElementsByTagName(loc)[0];if(v){v=v.firstChild.nodeValue;}else{v=metaNode.attributes.getNamedItem(loc);if(v){v=v.value;}}if(lang.isValue(v)){oParsedResponse.meta[k]=v;}}}}}catch(e){}if(!xmlList||!lang.isArray(schema.fields)){bError=true;}else{oParsedResponse.results=[];for(i=xmlList.length-1;i>=0;--i){var oResult=this.parseXMLResult(xmlList.item(i));oParsedResponse.results[i]=oResult;}}if(bError){oParsedResponse.error=true;}else{}return oParsedResponse;},parseJSONData:function(oRequest,oFullResponse){var oParsedResponse={results:[],meta:{}};if(lang.isObject(oFullResponse)&&this.responseSchema.resultsList){var schema=this.responseSchema,fields=schema.fields,resultsList=oFullResponse,results=[],metaFields=schema.metaFields||{},fieldParsers=[],fieldPaths=[],simpleFields=[],bError=false,i,len,j,v,key,parser,path;var buildPath=function(needle){var path=null,keys=[],i=0;if(needle){needle=needle.replace(/\[(['"])(.*?)\1\]/g,function(x,$1,$2){keys[i]=$2;return".@"+(i++);}).replace(/\[(\d+)\]/g,function(x,$1){keys[i]=parseInt($1,10)|0;return".@"+(i++);}).replace(/^\./,"");if(!/[^\w\.\$@]/.test(needle)){path=needle.split(".");for(i=path.length-1;i>=0;--i){if(path[i].charAt(0)==="@"){path[i]=keys[parseInt(path[i].substr(1),10)];}}}else{}}return path;};var walkPath=function(path,origin){var v=origin,i=0,len=path.length;for(;i<len&&v;++i){v=v[path[i]];}return v;};path=buildPath(schema.resultsList);if(path){resultsList=walkPath(path,oFullResponse);if(resultsList===undefined){bError=true;}}else{bError=true;}if(!resultsList){resultsList=[];}if(!lang.isArray(resultsList)){resultsList=[resultsList];}if(!bError){if(schema.fields){var field;for(i=0,len=fields.length;i<len;i++){field=fields[i];key=field.key||field;parser=((typeof field.parser==="function")?field.parser:DS.Parser[field.parser+""])||field.converter;path=buildPath(key);if(parser){fieldParsers[fieldParsers.length]={key:key,parser:parser};}if(path){if(path.length>1){fieldPaths[fieldPaths.length]={key:key,path:path};}else{simpleFields[simpleFields.length]={key:key,path:path[0]};}}else{}}for(i=resultsList.length-1;i>=0;--i){var r=resultsList[i],rec={};for(j=simpleFields.length-1;j>=0;--j){rec[simpleFields[j].key]=(r[simpleFields[j].path]!==undefined)?r[simpleFields[j].path]:r[j];}for(j=fieldPaths.length-1;j>=0;--j){rec[fieldPaths[j].key]=walkPath(fieldPaths[j].path,r);}for(j=fieldParsers.length-1;j>=0;--j){var p=fieldParsers[j].key;rec[p]=fieldParsers[j].parser(rec[p]);if(rec[p]===undefined){rec[p]=null;}}results[i]=rec;}}else{results=resultsList;}for(key in metaFields){if(lang.hasOwnProperty(metaFields,key)){path=buildPath(metaFields[key]);if(path){v=walkPath(path,oFullResponse);oParsedResponse.meta[key]=v;}}}}else{oParsedResponse.error=true;}oParsedResponse.results=results;}else{oParsedResponse.error=true;}return oParsedResponse;},parseHTMLTableData:function(oRequest,oFullResponse){var bError=false;var elTable=oFullResponse;var fields=this.responseSchema.fields;var oParsedResponse={results:[]};for(var i=0;i<elTable.tBodies.length;i++){var elTbody=elTable.tBodies[i];for(var j=elTbody.rows.length-1;j>-1;j--){var elRow=elTbody.rows[j];var oResult={};for(var k=fields.length-1;k>-1;k--){var field=fields[k];var key=(lang.isValue(field.key))?field.key:field;var data=elRow.cells[k].innerHTML;if(!field.parser&&field.converter){field.parser=field.converter;}var parser=(typeof field.parser==="function")?field.parser:DS.Parser[field.parser+""];if(parser){data=parser.call(this,data);}if(data===undefined){data=null;}oResult[key]=data;}oParsedResponse.results[j]=oResult;}}if(bError){oParsedResponse.error=true;}else{}return oParsedResponse;}};lang.augmentProto(DS,util.EventProvider);util.LocalDataSource=function(oLiveData,oConfigs){this.dataType=DS.TYPE_LOCAL;if(oLiveData){if(YAHOO.lang.isArray(oLiveData)){this.responseType=DS.TYPE_JSARRAY;}else{if(oLiveData.nodeType&&oLiveData.nodeType==9){this.responseType=DS.TYPE_XML;}else{if(oLiveData.nodeName&&(oLiveData.nodeName.toLowerCase()=="table")){this.responseType=DS.TYPE_HTMLTABLE;oLiveData=oLiveData.cloneNode(true);}else{if(YAHOO.lang.isString(oLiveData)){this.responseType=DS.TYPE_TEXT;}else{if(YAHOO.lang.isObject(oLiveData)){this.responseType=DS.TYPE_JSON;}}}}}}else{oLiveData=[];this.responseType=DS.TYPE_JSARRAY;}this.constructor.superclass.constructor.call(this,oLiveData,oConfigs);};lang.extend(util.LocalDataSource,DS);lang.augmentObject(util.LocalDataSource,DS);util.FunctionDataSource=function(oLiveData,oConfigs){this.dataType=DS.TYPE_JSFUNCTION;oLiveData=oLiveData||function(){};this.constructor.superclass.constructor.call(this,oLiveData,oConfigs);};lang.extend(util.FunctionDataSource,DS,{makeConnection:function(oRequest,oCallback,oCaller){var tId=DS._nTransactionId++;this.fireEvent("requestEvent",{tId:tId,request:oRequest,callback:oCallback,caller:oCaller});var oRawResponse=this.liveData(oRequest);if(this.responseType===DS.TYPE_UNKNOWN){if(YAHOO.lang.isArray(oRawResponse)){this.responseType=DS.TYPE_JSARRAY;}else{if(oRawResponse&&oRawResponse.nodeType&&oRawResponse.nodeType==9){this.responseType=DS.TYPE_XML;
}else{if(oRawResponse&&oRawResponse.nodeName&&(oRawResponse.nodeName.toLowerCase()=="table")){this.responseType=DS.TYPE_HTMLTABLE;}else{if(YAHOO.lang.isObject(oRawResponse)){this.responseType=DS.TYPE_JSON;}else{if(YAHOO.lang.isString(oRawResponse)){this.responseType=DS.TYPE_TEXT;}}}}}}this.handleResponse(oRequest,oRawResponse,oCallback,oCaller,tId);return tId;}});lang.augmentObject(util.FunctionDataSource,DS);util.ScriptNodeDataSource=function(oLiveData,oConfigs){this.dataType=DS.TYPE_SCRIPTNODE;oLiveData=oLiveData||"";this.constructor.superclass.constructor.call(this,oLiveData,oConfigs);};lang.extend(util.ScriptNodeDataSource,DS,{getUtility:util.Get,asyncMode:"allowAll",scriptCallbackParam:"callback",generateRequestCallback:function(id){return"&"+this.scriptCallbackParam+"=YAHOO.util.ScriptNodeDataSource.callbacks["+id+"]";},makeConnection:function(oRequest,oCallback,oCaller){var tId=DS._nTransactionId++;this.fireEvent("requestEvent",{tId:tId,request:oRequest,callback:oCallback,caller:oCaller});if(util.ScriptNodeDataSource._nPending===0){util.ScriptNodeDataSource.callbacks=[];util.ScriptNodeDataSource._nId=0;}var id=util.ScriptNodeDataSource._nId;util.ScriptNodeDataSource._nId++;var oSelf=this;util.ScriptNodeDataSource.callbacks[id]=function(oRawResponse){if((oSelf.asyncMode!=="ignoreStaleResponses")||(id===util.ScriptNodeDataSource.callbacks.length-1)){if(oSelf.responseType===DS.TYPE_UNKNOWN){if(YAHOO.lang.isArray(oRawResponse)){oSelf.responseType=DS.TYPE_JSARRAY;}else{if(oRawResponse.nodeType&&oRawResponse.nodeType==9){oSelf.responseType=DS.TYPE_XML;}else{if(oRawResponse.nodeName&&(oRawResponse.nodeName.toLowerCase()=="table")){oSelf.responseType=DS.TYPE_HTMLTABLE;}else{if(YAHOO.lang.isObject(oRawResponse)){oSelf.responseType=DS.TYPE_JSON;}else{if(YAHOO.lang.isString(oRawResponse)){oSelf.responseType=DS.TYPE_TEXT;}}}}}}oSelf.handleResponse(oRequest,oRawResponse,oCallback,oCaller,tId);}else{}delete util.ScriptNodeDataSource.callbacks[id];};util.ScriptNodeDataSource._nPending++;var sUri=this.liveData+oRequest+this.generateRequestCallback(id);this.getUtility.script(sUri,{autopurge:true,onsuccess:util.ScriptNodeDataSource._bumpPendingDown,onfail:util.ScriptNodeDataSource._bumpPendingDown});return tId;}});lang.augmentObject(util.ScriptNodeDataSource,DS);lang.augmentObject(util.ScriptNodeDataSource,{_nId:0,_nPending:0,callbacks:[]});util.XHRDataSource=function(oLiveData,oConfigs){this.dataType=DS.TYPE_XHR;this.connMgr=this.connMgr||util.Connect;oLiveData=oLiveData||"";this.constructor.superclass.constructor.call(this,oLiveData,oConfigs);};lang.extend(util.XHRDataSource,DS,{connMgr:null,connXhrMode:"allowAll",connMethodPost:false,connTimeout:0,makeConnection:function(oRequest,oCallback,oCaller){var oRawResponse=null;var tId=DS._nTransactionId++;this.fireEvent("requestEvent",{tId:tId,request:oRequest,callback:oCallback,caller:oCaller});var oSelf=this;var oConnMgr=this.connMgr;var oQueue=this._oQueue;var _xhrSuccess=function(oResponse){if(oResponse&&(this.asyncMode=="ignoreStaleResponses")&&(oResponse.tId!=oQueue.conn.tId)){return null;}else{if(!oResponse){this.fireEvent("dataErrorEvent",{request:oRequest,callback:oCallback,caller:oCaller,message:DS.ERROR_DATANULL});DS.issueCallback(oCallback,[oRequest,{error:true}],true,oCaller);return null;}else{if(this.responseType===DS.TYPE_UNKNOWN){var ctype=(oResponse.getResponseHeader)?oResponse.getResponseHeader["Content-Type"]:null;if(ctype){if(ctype.indexOf("text/xml")>-1){this.responseType=DS.TYPE_XML;}else{if(ctype.indexOf("application/json")>-1){this.responseType=DS.TYPE_JSON;}else{if(ctype.indexOf("text/plain")>-1){this.responseType=DS.TYPE_TEXT;}}}}}this.handleResponse(oRequest,oResponse,oCallback,oCaller,tId);}}};var _xhrFailure=function(oResponse){this.fireEvent("dataErrorEvent",{request:oRequest,callback:oCallback,caller:oCaller,message:DS.ERROR_DATAINVALID});if(lang.isString(this.liveData)&&lang.isString(oRequest)&&(this.liveData.lastIndexOf("?")!==this.liveData.length-1)&&(oRequest.indexOf("?")!==0)){}oResponse=oResponse||{};oResponse.error=true;DS.issueCallback(oCallback,[oRequest,oResponse],true,oCaller);return null;};var _xhrCallback={success:_xhrSuccess,failure:_xhrFailure,scope:this};if(lang.isNumber(this.connTimeout)){_xhrCallback.timeout=this.connTimeout;}if(this.connXhrMode=="cancelStaleRequests"){if(oQueue.conn){if(oConnMgr.abort){oConnMgr.abort(oQueue.conn);oQueue.conn=null;}else{}}}if(oConnMgr&&oConnMgr.asyncRequest){var sLiveData=this.liveData;var isPost=this.connMethodPost;var sMethod=(isPost)?"POST":"GET";var sUri=(isPost||!lang.isValue(oRequest))?sLiveData:sLiveData+oRequest;var sRequest=(isPost)?oRequest:null;if(this.connXhrMode!="queueRequests"){oQueue.conn=oConnMgr.asyncRequest(sMethod,sUri,_xhrCallback,sRequest);}else{if(oQueue.conn){var allRequests=oQueue.requests;allRequests.push({request:oRequest,callback:_xhrCallback});if(!oQueue.interval){oQueue.interval=setInterval(function(){if(oConnMgr.isCallInProgress(oQueue.conn)){return ;}else{if(allRequests.length>0){sUri=(isPost||!lang.isValue(allRequests[0].request))?sLiveData:sLiveData+allRequests[0].request;sRequest=(isPost)?allRequests[0].request:null;oQueue.conn=oConnMgr.asyncRequest(sMethod,sUri,allRequests[0].callback,sRequest);allRequests.shift();}else{clearInterval(oQueue.interval);oQueue.interval=null;}}},50);}}else{oQueue.conn=oConnMgr.asyncRequest(sMethod,sUri,_xhrCallback,sRequest);}}}else{DS.issueCallback(oCallback,[oRequest,{error:true}],true,oCaller);}return tId;}});lang.augmentObject(util.XHRDataSource,DS);util.DataSource=function(oLiveData,oConfigs){oConfigs=oConfigs||{};var dataType=oConfigs.dataType;if(dataType){if(dataType==DS.TYPE_LOCAL){lang.augmentObject(util.DataSource,util.LocalDataSource);return new util.LocalDataSource(oLiveData,oConfigs);}else{if(dataType==DS.TYPE_XHR){lang.augmentObject(util.DataSource,util.XHRDataSource);return new util.XHRDataSource(oLiveData,oConfigs);}else{if(dataType==DS.TYPE_SCRIPTNODE){lang.augmentObject(util.DataSource,util.ScriptNodeDataSource);
return new util.ScriptNodeDataSource(oLiveData,oConfigs);}else{if(dataType==DS.TYPE_JSFUNCTION){lang.augmentObject(util.DataSource,util.FunctionDataSource);return new util.FunctionDataSource(oLiveData,oConfigs);}}}}}if(YAHOO.lang.isString(oLiveData)){lang.augmentObject(util.DataSource,util.XHRDataSource);return new util.XHRDataSource(oLiveData,oConfigs);}else{if(YAHOO.lang.isFunction(oLiveData)){lang.augmentObject(util.DataSource,util.FunctionDataSource);return new util.FunctionDataSource(oLiveData,oConfigs);}else{lang.augmentObject(util.DataSource,util.LocalDataSource);return new util.LocalDataSource(oLiveData,oConfigs);}}};lang.augmentObject(util.DataSource,DS);})();YAHOO.util.Number={format:function(B,F){F=F||{};if(!YAHOO.lang.isNumber(B)){B*=1;}if(YAHOO.lang.isNumber(B)){var D=(B<0);var J=B+"";var G=(F.decimalSeparator)?F.decimalSeparator:".";var H;if(YAHOO.lang.isNumber(F.decimalPlaces)){var I=F.decimalPlaces;var C=Math.pow(10,I);J=Math.round(B*C)/C+"";H=J.lastIndexOf(".");if(I>0){if(H<0){J+=G;H=J.length-1;}else{if(G!=="."){J=J.replace(".",G);}}while((J.length-1-H)<I){J+="0";}}}if(F.thousandsSeparator){var L=F.thousandsSeparator;H=J.lastIndexOf(G);H=(H>-1)?H:J.length;var K=J.substring(H);var A=-1;for(var E=H;E>0;E--){A++;if((A%3===0)&&(E!==H)&&(!D||(E>1))){K=L+K;}K=J.charAt(E-1)+K;}J=K;}J=(F.prefix)?F.prefix+J:J;J=(F.suffix)?J+F.suffix:J;return J;}else{return B;}}};(function(){var A=function(C,E,D){if(typeof D==="undefined"){D=10;}for(;parseInt(C,10)<D&&D>1;D/=10){C=E.toString()+C;}return C.toString();};var B={formats:{a:function(D,C){return C.a[D.getDay()];},A:function(D,C){return C.A[D.getDay()];},b:function(D,C){return C.b[D.getMonth()];},B:function(D,C){return C.B[D.getMonth()];},C:function(C){return A(parseInt(C.getFullYear()/100,10),0);},d:["getDate","0"],e:["getDate"," "],g:function(C){return A(parseInt(B.formats.G(C)%100,10),0);},G:function(E){var F=E.getFullYear();var D=parseInt(B.formats.V(E),10);var C=parseInt(B.formats.W(E),10);if(C>D){F++;}else{if(C===0&&D>=52){F--;}}return F;},H:["getHours","0"],I:function(D){var C=D.getHours()%12;return A(C===0?12:C,0);},j:function(G){var F=new Date(""+G.getFullYear()+"/1/1 GMT");var D=new Date(""+G.getFullYear()+"/"+(G.getMonth()+1)+"/"+G.getDate()+" GMT");var C=D-F;var E=parseInt(C/60000/60/24,10)+1;return A(E,0,100);},k:["getHours"," "],l:function(D){var C=D.getHours()%12;return A(C===0?12:C," ");},m:function(C){return A(C.getMonth()+1,0);},M:["getMinutes","0"],p:function(D,C){return C.p[D.getHours()>=12?1:0];},P:function(D,C){return C.P[D.getHours()>=12?1:0];},s:function(D,C){return parseInt(D.getTime()/1000,10);},S:["getSeconds","0"],u:function(C){var D=C.getDay();return D===0?7:D;},U:function(F){var C=parseInt(B.formats.j(F),10);var E=6-F.getDay();var D=parseInt((C+E)/7,10);return A(D,0);},V:function(F){var E=parseInt(B.formats.W(F),10);var C=(new Date(""+F.getFullYear()+"/1/1")).getDay();var D=E+(C>4||C<=1?0:1);if(D===53&&(new Date(""+F.getFullYear()+"/12/31")).getDay()<4){D=1;}else{if(D===0){D=B.formats.V(new Date(""+(F.getFullYear()-1)+"/12/31"));}}return A(D,0);},w:"getDay",W:function(F){var C=parseInt(B.formats.j(F),10);var E=7-B.formats.u(F);var D=parseInt((C+E)/7,10);return A(D,0,10);},y:function(C){return A(C.getFullYear()%100,0);},Y:"getFullYear",z:function(E){var D=E.getTimezoneOffset();var C=A(parseInt(Math.abs(D/60),10),0);var F=A(Math.abs(D%60),0);return(D>0?"-":"+")+C+F;},Z:function(C){var D=C.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/,"$2").replace(/[a-z ]/g,"");if(D.length>4){D=B.formats.z(C);}return D;},"%":function(C){return"%";}},aggregates:{c:"locale",D:"%m/%d/%y",F:"%Y-%m-%d",h:"%b",n:"\n",r:"locale",R:"%H:%M",t:"\t",T:"%H:%M:%S",x:"locale",X:"locale"},format:function(G,F,D){F=F||{};if(!(G instanceof Date)){return YAHOO.lang.isValue(G)?G:"";}var H=F.format||"%m/%d/%Y";if(H==="YYYY/MM/DD"){H="%Y/%m/%d";}else{if(H==="DD/MM/YYYY"){H="%d/%m/%Y";}else{if(H==="MM/DD/YYYY"){H="%m/%d/%Y";}}}D=D||"en";if(!(D in YAHOO.util.DateLocale)){if(D.replace(/-[a-zA-Z]+$/,"") in YAHOO.util.DateLocale){D=D.replace(/-[a-zA-Z]+$/,"");}else{D="en";}}var J=YAHOO.util.DateLocale[D];var C=function(L,K){var M=B.aggregates[K];return(M==="locale"?J[K]:M);};var E=function(L,K){var M=B.formats[K];if(typeof M==="string"){return G[M]();}else{if(typeof M==="function"){return M.call(G,G,J);}else{if(typeof M==="object"&&typeof M[0]==="string"){return A(G[M[0]](),M[1]);}else{return K;}}}};while(H.match(/%[cDFhnrRtTxX]/)){H=H.replace(/%([cDFhnrRtTxX])/g,C);}var I=H.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g,E);C=E=undefined;return I;}};YAHOO.namespace("YAHOO.util");YAHOO.util.Date=B;YAHOO.util.DateLocale={a:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],A:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],b:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],B:["January","February","March","April","May","June","July","August","September","October","November","December"],c:"%a %d %b %Y %T %Z",p:["AM","PM"],P:["am","pm"],r:"%I:%M:%S %p",x:"%d/%m/%y",X:"%T"};YAHOO.util.DateLocale["en"]=YAHOO.lang.merge(YAHOO.util.DateLocale,{});YAHOO.util.DateLocale["en-US"]=YAHOO.lang.merge(YAHOO.util.DateLocale["en"],{c:"%a %d %b %Y %I:%M:%S %p %Z",x:"%m/%d/%Y",X:"%I:%M:%S %p"});YAHOO.util.DateLocale["en-GB"]=YAHOO.lang.merge(YAHOO.util.DateLocale["en"],{r:"%l:%M:%S %P %Z"});YAHOO.util.DateLocale["en-AU"]=YAHOO.lang.merge(YAHOO.util.DateLocale["en"]);})();YAHOO.register("datasource",YAHOO.util.DataSource,{version:"2.6.0",build:"1321"});
/**
* YAHOO.widget.DateMath is used for simple date manipulation. The class is a static utility
* used for adding, subtracting, and comparing dates.
* @namespace YAHOO.widget
* @class DateMath
*/
YAHOO.widget.DateMath = {
	/**
	* Constant field representing Day
	* @property DAY
	* @static
	* @final
	* @type String
	*/
	DAY : "D",

	/**
	* Constant field representing Week
	* @property WEEK
	* @static
	* @final
	* @type String
	*/
	WEEK : "W",

	/**
	* Constant field representing Year
	* @property YEAR
	* @static
	* @final
	* @type String
	*/
	YEAR : "Y",

	/**
	* Constant field representing Month
	* @property MONTH
	* @static
	* @final
	* @type String
	*/
	MONTH : "M",

	/**
	* Constant field representing one day, in milliseconds
	* @property ONE_DAY_MS
	* @static
	* @final
	* @type Number
	*/
	ONE_DAY_MS : 1000*60*60*24,
	
	/**
	 * Constant field representing the date in first week of January
	 * which identifies the first week of the year.
	 * <p>
	 * In the U.S, Jan 1st is normally used based on a Sunday start of week.
	 * ISO 8601, used widely throughout Europe, uses Jan 4th, based on a Monday start of week.
	 * </p>
	 * @property WEEK_ONE_JAN_DATE
	 * @static
	 * @type Number
	 */
	WEEK_ONE_JAN_DATE : 1,

	/**
	* Adds the specified amount of time to the this instance.
	* @method add
	* @param {Date} date	The JavaScript Date object to perform addition on
	* @param {String} field	The field constant to be used for performing addition.
	* @param {Number} amount	The number of units (measured in the field constant) to add to the date.
	* @return {Date} The resulting Date object
	*/
	add : function(date, field, amount) {
		var d = new Date(date.getTime());
		switch (field) {
			case this.MONTH:
				var newMonth = date.getMonth() + amount;
				var years = 0;

				if (newMonth < 0) {
					while (newMonth < 0) {
						newMonth += 12;
						years -= 1;
					}
				} else if (newMonth > 11) {
					while (newMonth > 11) {
						newMonth -= 12;
						years += 1;
					}
				}

				d.setMonth(newMonth);
				d.setFullYear(date.getFullYear() + years);
				break;
			case this.DAY:
				this._addDays(d, amount);
				// d.setDate(date.getDate() + amount);
				break;
			case this.YEAR:
				d.setFullYear(date.getFullYear() + amount);
				break;
			case this.WEEK:
				this._addDays(d, (amount * 7));
				// d.setDate(date.getDate() + (amount * 7));
				break;
		}
		return d;
	},

	/**
	 * Private helper method to account for bug in Safari 2 (webkit < 420)
	 * when Date.setDate(n) is called with n less than -128 or greater than 127.
	 * <p>
	 * Fix approach and original findings are available here:
	 * http://brianary.blogspot.com/2006/03/safari-date-bug.html
	 * </p>
	 * @method _addDays
	 * @param {Date} d JavaScript date object
	 * @param {Number} nDays The number of days to add to the date object (can be negative)
	 * @private
	 */
	_addDays : function(d, nDays) {
		if (YAHOO.env.ua.webkit && YAHOO.env.ua.webkit < 420) {
			if (nDays < 0) {
				// Ensure we don't go below -128 (getDate() is always 1 to 31, so we won't go above 127)
				for(var min = -128; nDays < min; nDays -= min) {
					d.setDate(d.getDate() + min);
				}
			} else {
				// Ensure we don't go above 96 + 31 = 127
				for(var max = 96; nDays > max; nDays -= max) {
					d.setDate(d.getDate() + max);
				}
			}
			// nDays should be remainder between -128 and 96
		}
		d.setDate(d.getDate() + nDays);
	},

	/**
	* Subtracts the specified amount of time from the this instance.
	* @method subtract
	* @param {Date} date	The JavaScript Date object to perform subtraction on
	* @param {Number} field	The this field constant to be used for performing subtraction.
	* @param {Number} amount	The number of units (measured in the field constant) to subtract from the date.
	* @return {Date} The resulting Date object
	*/
	subtract : function(date, field, amount) {
		return this.add(date, field, (amount*-1));
	},

	/**
	* Determines whether a given date is before another date on the calendar.
	* @method before
	* @param {Date} date		The Date object to compare with the compare argument
	* @param {Date} compareTo	The Date object to use for the comparison
	* @return {Boolean} true if the date occurs before the compared date; false if not.
	*/
	before : function(date, compareTo) {
		var ms = compareTo.getTime();
		if (date.getTime() < ms) {
			return true;
		} else {
			return false;
		}
	},

	/**
	* Determines whether a given date is after another date on the calendar.
	* @method after
	* @param {Date} date		The Date object to compare with the compare argument
	* @param {Date} compareTo	The Date object to use for the comparison
	* @return {Boolean} true if the date occurs after the compared date; false if not.
	*/
	after : function(date, compareTo) {
		var ms = compareTo.getTime();
		if (date.getTime() > ms) {
			return true;
		} else {
			return false;
		}
	},

	/**
	* Determines whether a given date is between two other dates on the calendar.
	* @method between
	* @param {Date} date		The date to check for
	* @param {Date} dateBegin	The start of the range
	* @param {Date} dateEnd		The end of the range
	* @return {Boolean} true if the date occurs between the compared dates; false if not.
	*/
	between : function(date, dateBegin, dateEnd) {
		if (this.after(date, dateBegin) && this.before(date, dateEnd)) {
			return true;
		} else {
			return false;
		}
	},
	
	/**
	* Retrieves a JavaScript Date object representing January 1 of any given year.
	* @method getJan1
	* @param {Number} calendarYear		The calendar year for which to retrieve January 1
	* @return {Date}	January 1 of the calendar year specified.
	*/
	getJan1 : function(calendarYear) {
		return this.getDate(calendarYear,0,1);
	},

	/**
	* Calculates the number of days the specified date is from January 1 of the specified calendar year.
	* Passing January 1 to this function would return an offset value of zero.
	* @method getDayOffset
	* @param {Date}	date	The JavaScript date for which to find the offset
	* @param {Number} calendarYear	The calendar year to use for determining the offset
	* @return {Number}	The number of days since January 1 of the given year
	*/
	getDayOffset : function(date, calendarYear) {
		var beginYear = this.getJan1(calendarYear); // Find the start of the year. This will be in week 1.
		
		// Find the number of days the passed in date is away from the calendar year start
		var dayOffset = Math.ceil((date.getTime()-beginYear.getTime()) / this.ONE_DAY_MS);
		return dayOffset;
	},

	/**
	* Calculates the week number for the given date. Can currently support standard
	* U.S. week numbers, based on Jan 1st defining the 1st week of the year, and
	* ISO8601 week numbers, based on Jan 4th defining the 1st week of the year.
	*
	* @method getWeekNumber
	* @param {Date}	date The JavaScript date for which to find the week number
	* @param {Number} firstDayOfWeek The index of the first day of the week (0 = Sun, 1 = Mon ... 6 = Sat).
	* Defaults to 0
	* @param {Number} janDate The date in the first week of January which defines week one for the year
	* Defaults to the value of YAHOO.widget.DateMath.WEEK_ONE_JAN_DATE, which is 1 (Jan 1st).
	* For the U.S, this is normally Jan 1st. ISO8601 uses Jan 4th to define the first week of the year.
	*
	* @return {Number} The number of the week containing the given date.
	*/
	getWeekNumber : function(date, firstDayOfWeek, janDate) {

		// Setup Defaults
		firstDayOfWeek = firstDayOfWeek || 0;
		janDate = janDate || this.WEEK_ONE_JAN_DATE;

		var targetDate = this.clearTime(date),
			startOfWeek,
			endOfWeek;

		if (targetDate.getDay() === firstDayOfWeek) {
			startOfWeek = targetDate;
		} else {
			startOfWeek = this.getFirstDayOfWeek(targetDate, firstDayOfWeek);
		}

		var startYear = startOfWeek.getFullYear(),
			startTime = startOfWeek.getTime();

		// DST shouldn't be a problem here, math is quicker than setDate();
		endOfWeek = new Date(startOfWeek.getTime() + 6*this.ONE_DAY_MS);

		var weekNum;
		if (startYear !== endOfWeek.getFullYear() && endOfWeek.getDate() >= janDate) {
			// If years don't match, endOfWeek is in Jan. and if the
			// week has WEEK_ONE_JAN_DATE in it, it's week one by definition.
			weekNum = 1;
		} else {
			// Get the 1st day of the 1st week, and
			// find how many days away we are from it.
			var weekOne = this.clearTime(this.getDate(startYear, 0, janDate)),
				weekOneDayOne = this.getFirstDayOfWeek(weekOne, firstDayOfWeek);

			// Round days to smoothen out 1 hr DST diff
			var daysDiff  = Math.round((targetDate.getTime() - weekOneDayOne.getTime())/this.ONE_DAY_MS);

			// Calc. Full Weeks
			var rem = daysDiff % 7;
			var weeksDiff = (daysDiff - rem)/7;
			weekNum = weeksDiff + 1;
		}
		return weekNum;
	},

	/**
	 * Get the first day of the week, for the give date.
	 * @param {Date} dt The date in the week for which the first day is required.
	 * @param {Number} startOfWeek The index for the first day of the week, 0 = Sun, 1 = Mon ... 6 = Sat (defaults to 0)
	 * @return {Date} The first day of the week
	 */
	getFirstDayOfWeek : function (dt, startOfWeek) {
		startOfWeek = startOfWeek || 0;
		var dayOfWeekIndex = dt.getDay(),
			dayOfWeek = (dayOfWeekIndex - startOfWeek + 7) % 7;

		return this.subtract(dt, this.DAY, dayOfWeek);
	},

	/**
	* Determines if a given week overlaps two different years.
	* @method isYearOverlapWeek
	* @param {Date}	weekBeginDate	The JavaScript Date representing the first day of the week.
	* @return {Boolean}	true if the date overlaps two different years.
	*/
	isYearOverlapWeek : function(weekBeginDate) {
		var overlaps = false;
		var nextWeek = this.add(weekBeginDate, this.DAY, 6);
		if (nextWeek.getFullYear() != weekBeginDate.getFullYear()) {
			overlaps = true;
		}
		return overlaps;
	},

	/**
	* Determines if a given week overlaps two different months.
	* @method isMonthOverlapWeek
	* @param {Date}	weekBeginDate	The JavaScript Date representing the first day of the week.
	* @return {Boolean}	true if the date overlaps two different months.
	*/
	isMonthOverlapWeek : function(weekBeginDate) {
		var overlaps = false;
		var nextWeek = this.add(weekBeginDate, this.DAY, 6);
		if (nextWeek.getMonth() != weekBeginDate.getMonth()) {
			overlaps = true;
		}
		return overlaps;
	},

	/**
	* Gets the first day of a month containing a given date.
	* @method findMonthStart
	* @param {Date}	date	The JavaScript Date used to calculate the month start
	* @return {Date}		The JavaScript Date representing the first day of the month
	*/
	findMonthStart : function(date) {
		var start = this.getDate(date.getFullYear(), date.getMonth(), 1);
		return start;
	},

	/**
	* Gets the last day of a month containing a given date.
	* @method findMonthEnd
	* @param {Date}	date	The JavaScript Date used to calculate the month end
	* @return {Date}		The JavaScript Date representing the last day of the month
	*/
	findMonthEnd : function(date) {
		var start = this.findMonthStart(date);
		var nextMonth = this.add(start, this.MONTH, 1);
		var end = this.subtract(nextMonth, this.DAY, 1);
		return end;
	},

	/**
	* Clears the time fields from a given date, effectively setting the time to 12 noon.
	* @method clearTime
	* @param {Date}	date	The JavaScript Date for which the time fields will be cleared
	* @return {Date}		The JavaScript Date cleared of all time fields
	*/
	clearTime : function(date) {
		date.setHours(12,0,0,0);
		return date;
	},

	/**
	 * Returns a new JavaScript Date object, representing the given year, month and date. Time fields (hr, min, sec, ms) on the new Date object
	 * are set to 0. The method allows Date instances to be created with the a year less than 100. "new Date(year, month, date)" implementations
	 * set the year to 19xx if a year (xx) which is less than 100 is provided.
	 * <p>
	 * <em>NOTE:</em>Validation on argument values is not performed. It is the caller's responsibility to ensure
	 * arguments are valid as per the ECMAScript-262 Date object specification for the new Date(year, month[, date]) constructor.
	 * </p>
	 * @method getDate
	 * @param {Number} y Year.
	 * @param {Number} m Month index from 0 (Jan) to 11 (Dec).
	 * @param {Number} d (optional) Date from 1 to 31. If not provided, defaults to 1.
	 * @return {Date} The JavaScript date object with year, month, date set as provided.
	 */
	getDate : function(y, m, d) {
		var dt = null;
		if (YAHOO.lang.isUndefined(d)) {
			d = 1;
		}
		if (y >= 100) {
			dt = new Date(y, m, d);
		} else {
			dt = new Date();
			dt.setFullYear(y);
			dt.setMonth(m);
			dt.setDate(d);
			dt.setHours(0,0,0,0);
		}
		return dt;
	}
};

/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.6.0
*/
YAHOO.widget.DS_JSArray=YAHOO.util.LocalDataSource;YAHOO.widget.DS_JSFunction=YAHOO.util.FunctionDataSource;YAHOO.widget.DS_XHR=function(B,A,D){var C=new YAHOO.util.XHRDataSource(B,D);C._aDeprecatedSchema=A;return C;};YAHOO.widget.DS_ScriptNode=function(B,A,D){var C=new YAHOO.util.ScriptNodeDataSource(B,D);C._aDeprecatedSchema=A;return C;};YAHOO.widget.DS_XHR.TYPE_JSON=YAHOO.util.DataSourceBase.TYPE_JSON;YAHOO.widget.DS_XHR.TYPE_XML=YAHOO.util.DataSourceBase.TYPE_XML;YAHOO.widget.DS_XHR.TYPE_FLAT=YAHOO.util.DataSourceBase.TYPE_TEXT;YAHOO.widget.AutoComplete=function(G,B,J,C){if(G&&B&&J){if(J instanceof YAHOO.util.DataSourceBase){this.dataSource=J;}else{return ;}this.key=0;var D=J.responseSchema;if(J._aDeprecatedSchema){var K=J._aDeprecatedSchema;if(YAHOO.lang.isArray(K)){if((J.responseType===YAHOO.util.DataSourceBase.TYPE_JSON)||(J.responseType===YAHOO.util.DataSourceBase.TYPE_UNKNOWN)){D.resultsList=K[0];this.key=K[1];D.fields=(K.length<3)?null:K.slice(1);}else{if(J.responseType===YAHOO.util.DataSourceBase.TYPE_XML){D.resultNode=K[0];this.key=K[1];D.fields=K.slice(1);}else{if(J.responseType===YAHOO.util.DataSourceBase.TYPE_TEXT){D.recordDelim=K[0];D.fieldDelim=K[1];}}}J.responseSchema=D;}}if(YAHOO.util.Dom.inDocument(G)){if(YAHOO.lang.isString(G)){this._sName="instance"+YAHOO.widget.AutoComplete._nIndex+" "+G;this._elTextbox=document.getElementById(G);}else{this._sName=(G.id)?"instance"+YAHOO.widget.AutoComplete._nIndex+" "+G.id:"instance"+YAHOO.widget.AutoComplete._nIndex;this._elTextbox=G;}YAHOO.util.Dom.addClass(this._elTextbox,"yui-ac-input");}else{return ;}if(YAHOO.util.Dom.inDocument(B)){if(YAHOO.lang.isString(B)){this._elContainer=document.getElementById(B);}else{this._elContainer=B;}if(this._elContainer.style.display=="none"){}var E=this._elContainer.parentNode;var A=E.tagName.toLowerCase();if(A=="div"){YAHOO.util.Dom.addClass(E,"yui-ac");}else{}}else{return ;}if(this.dataSource.dataType===YAHOO.util.DataSourceBase.TYPE_LOCAL){this.applyLocalFilter=true;}if(C&&(C.constructor==Object)){for(var I in C){if(I){this[I]=C[I];}}}this._initContainerEl();this._initProps();this._initListEl();this._initContainerHelperEls();var H=this;var F=this._elTextbox;YAHOO.util.Event.addListener(F,"keyup",H._onTextboxKeyUp,H);YAHOO.util.Event.addListener(F,"keydown",H._onTextboxKeyDown,H);YAHOO.util.Event.addListener(F,"focus",H._onTextboxFocus,H);YAHOO.util.Event.addListener(F,"blur",H._onTextboxBlur,H);YAHOO.util.Event.addListener(B,"mouseover",H._onContainerMouseover,H);YAHOO.util.Event.addListener(B,"mouseout",H._onContainerMouseout,H);YAHOO.util.Event.addListener(B,"click",H._onContainerClick,H);YAHOO.util.Event.addListener(B,"scroll",H._onContainerScroll,H);YAHOO.util.Event.addListener(B,"resize",H._onContainerResize,H);YAHOO.util.Event.addListener(F,"keypress",H._onTextboxKeyPress,H);YAHOO.util.Event.addListener(window,"unload",H._onWindowUnload,H);this.textboxFocusEvent=new YAHOO.util.CustomEvent("textboxFocus",this);this.textboxKeyEvent=new YAHOO.util.CustomEvent("textboxKey",this);this.dataRequestEvent=new YAHOO.util.CustomEvent("dataRequest",this);this.dataReturnEvent=new YAHOO.util.CustomEvent("dataReturn",this);this.dataErrorEvent=new YAHOO.util.CustomEvent("dataError",this);this.containerPopulateEvent=new YAHOO.util.CustomEvent("containerPopulate",this);this.containerExpandEvent=new YAHOO.util.CustomEvent("containerExpand",this);this.typeAheadEvent=new YAHOO.util.CustomEvent("typeAhead",this);this.itemMouseOverEvent=new YAHOO.util.CustomEvent("itemMouseOver",this);this.itemMouseOutEvent=new YAHOO.util.CustomEvent("itemMouseOut",this);this.itemArrowToEvent=new YAHOO.util.CustomEvent("itemArrowTo",this);this.itemArrowFromEvent=new YAHOO.util.CustomEvent("itemArrowFrom",this);this.itemSelectEvent=new YAHOO.util.CustomEvent("itemSelect",this);this.unmatchedItemSelectEvent=new YAHOO.util.CustomEvent("unmatchedItemSelect",this);this.selectionEnforceEvent=new YAHOO.util.CustomEvent("selectionEnforce",this);this.containerCollapseEvent=new YAHOO.util.CustomEvent("containerCollapse",this);this.textboxBlurEvent=new YAHOO.util.CustomEvent("textboxBlur",this);this.textboxChangeEvent=new YAHOO.util.CustomEvent("textboxChange",this);F.setAttribute("autocomplete","off");YAHOO.widget.AutoComplete._nIndex++;}else{}};YAHOO.widget.AutoComplete.prototype.dataSource=null;YAHOO.widget.AutoComplete.prototype.applyLocalFilter=null;YAHOO.widget.AutoComplete.prototype.queryMatchCase=false;YAHOO.widget.AutoComplete.prototype.queryMatchContains=false;YAHOO.widget.AutoComplete.prototype.queryMatchSubset=false;YAHOO.widget.AutoComplete.prototype.minQueryLength=1;YAHOO.widget.AutoComplete.prototype.maxResultsDisplayed=10;YAHOO.widget.AutoComplete.prototype.queryDelay=0.2;YAHOO.widget.AutoComplete.prototype.typeAheadDelay=0.5;YAHOO.widget.AutoComplete.prototype.queryInterval=500;YAHOO.widget.AutoComplete.prototype.highlightClassName="yui-ac-highlight";YAHOO.widget.AutoComplete.prototype.prehighlightClassName=null;YAHOO.widget.AutoComplete.prototype.delimChar=null;YAHOO.widget.AutoComplete.prototype.autoHighlight=true;YAHOO.widget.AutoComplete.prototype.typeAhead=false;YAHOO.widget.AutoComplete.prototype.animHoriz=false;YAHOO.widget.AutoComplete.prototype.animVert=true;YAHOO.widget.AutoComplete.prototype.animSpeed=0.3;YAHOO.widget.AutoComplete.prototype.forceSelection=false;YAHOO.widget.AutoComplete.prototype.allowBrowserAutocomplete=true;YAHOO.widget.AutoComplete.prototype.alwaysShowContainer=false;YAHOO.widget.AutoComplete.prototype.useIFrame=false;YAHOO.widget.AutoComplete.prototype.useShadow=false;YAHOO.widget.AutoComplete.prototype.suppressInputUpdate=false;YAHOO.widget.AutoComplete.prototype.resultTypeList=true;YAHOO.widget.AutoComplete.prototype.queryQuestionMark=true;YAHOO.widget.AutoComplete.prototype.toString=function(){return"AutoComplete "+this._sName;};YAHOO.widget.AutoComplete.prototype.getInputEl=function(){return this._elTextbox;};YAHOO.widget.AutoComplete.prototype.getContainerEl=function(){return this._elContainer;
};YAHOO.widget.AutoComplete.prototype.isFocused=function(){return(this._bFocused===null)?false:this._bFocused;};YAHOO.widget.AutoComplete.prototype.isContainerOpen=function(){return this._bContainerOpen;};YAHOO.widget.AutoComplete.prototype.getListEl=function(){return this._elList;};YAHOO.widget.AutoComplete.prototype.getListItemMatch=function(A){if(A._sResultMatch){return A._sResultMatch;}else{return null;}};YAHOO.widget.AutoComplete.prototype.getListItemData=function(A){if(A._oResultData){return A._oResultData;}else{return null;}};YAHOO.widget.AutoComplete.prototype.getListItemIndex=function(A){if(YAHOO.lang.isNumber(A._nItemIndex)){return A._nItemIndex;}else{return null;}};YAHOO.widget.AutoComplete.prototype.setHeader=function(B){if(this._elHeader){var A=this._elHeader;if(B){A.innerHTML=B;A.style.display="block";}else{A.innerHTML="";A.style.display="none";}}};YAHOO.widget.AutoComplete.prototype.setFooter=function(B){if(this._elFooter){var A=this._elFooter;if(B){A.innerHTML=B;A.style.display="block";}else{A.innerHTML="";A.style.display="none";}}};YAHOO.widget.AutoComplete.prototype.setBody=function(A){if(this._elBody){var B=this._elBody;YAHOO.util.Event.purgeElement(B,true);if(A){B.innerHTML=A;B.style.display="block";}else{B.innerHTML="";B.style.display="none";}this._elList=null;}};YAHOO.widget.AutoComplete.prototype.generateRequest=function(B){var A=this.dataSource.dataType;if(A===YAHOO.util.DataSourceBase.TYPE_XHR){if(!this.dataSource.connMethodPost){B=(this.queryQuestionMark?"?":"")+(this.dataSource.scriptQueryParam||"query")+"="+B+(this.dataSource.scriptQueryAppend?("&"+this.dataSource.scriptQueryAppend):"");}else{B=(this.dataSource.scriptQueryParam||"query")+"="+B+(this.dataSource.scriptQueryAppend?("&"+this.dataSource.scriptQueryAppend):"");}}else{if(A===YAHOO.util.DataSourceBase.TYPE_SCRIPTNODE){B="&"+(this.dataSource.scriptQueryParam||"query")+"="+B+(this.dataSource.scriptQueryAppend?("&"+this.dataSource.scriptQueryAppend):"");}}return B;};YAHOO.widget.AutoComplete.prototype.sendQuery=function(B){var A=(this.delimChar)?this._elTextbox.value+B:B;this._sendQuery(A);};YAHOO.widget.AutoComplete.prototype.collapseContainer=function(){this._toggleContainer(false);};YAHOO.widget.AutoComplete.prototype.getSubsetMatches=function(E){var D,C,A;for(var B=E.length;B>=this.minQueryLength;B--){A=this.generateRequest(E.substr(0,B));this.dataRequestEvent.fire(this,D,A);C=this.dataSource.getCachedResponse(A);if(C){return this.filterResults.apply(this.dataSource,[E,C,C,{scope:this}]);}}return null;};YAHOO.widget.AutoComplete.prototype.preparseRawResponse=function(C,B,A){var D=((this.responseStripAfter!=="")&&(B.indexOf))?B.indexOf(this.responseStripAfter):-1;if(D!=-1){B=B.substring(0,D);}return B;};YAHOO.widget.AutoComplete.prototype.filterResults=function(J,L,P,K){if(J&&J!==""){P=YAHOO.widget.AutoComplete._cloneObject(P);var H=K.scope,O=this,B=P.results,M=[],D=false,I=(O.queryMatchCase||H.queryMatchCase),A=(O.queryMatchContains||H.queryMatchContains);for(var C=B.length-1;C>=0;C--){var F=B[C];var E=null;if(YAHOO.lang.isString(F)){E=F;}else{if(YAHOO.lang.isArray(F)){E=F[0];}else{if(this.responseSchema.fields){var N=this.responseSchema.fields[0].key||this.responseSchema.fields[0];E=F[N];}else{if(this.key){E=F[this.key];}}}}if(YAHOO.lang.isString(E)){var G=(I)?E.indexOf(decodeURIComponent(J)):E.toLowerCase().indexOf(decodeURIComponent(J).toLowerCase());if((!A&&(G===0))||(A&&(G>-1))){M.unshift(F);}}}P.results=M;}else{}return P;};YAHOO.widget.AutoComplete.prototype.handleResponse=function(C,A,B){if((this instanceof YAHOO.widget.AutoComplete)&&this._sName){this._populateList(C,A,B);}};YAHOO.widget.AutoComplete.prototype.doBeforeLoadData=function(C,A,B){return true;};YAHOO.widget.AutoComplete.prototype.formatResult=function(B,D,A){var C=(A)?A:"";return C;};YAHOO.widget.AutoComplete.prototype.doBeforeExpandContainer=function(D,A,C,B){return true;};YAHOO.widget.AutoComplete.prototype.destroy=function(){var B=this.toString();var A=this._elTextbox;var D=this._elContainer;this.textboxFocusEvent.unsubscribeAll();this.textboxKeyEvent.unsubscribeAll();this.dataRequestEvent.unsubscribeAll();this.dataReturnEvent.unsubscribeAll();this.dataErrorEvent.unsubscribeAll();this.containerPopulateEvent.unsubscribeAll();this.containerExpandEvent.unsubscribeAll();this.typeAheadEvent.unsubscribeAll();this.itemMouseOverEvent.unsubscribeAll();this.itemMouseOutEvent.unsubscribeAll();this.itemArrowToEvent.unsubscribeAll();this.itemArrowFromEvent.unsubscribeAll();this.itemSelectEvent.unsubscribeAll();this.unmatchedItemSelectEvent.unsubscribeAll();this.selectionEnforceEvent.unsubscribeAll();this.containerCollapseEvent.unsubscribeAll();this.textboxBlurEvent.unsubscribeAll();this.textboxChangeEvent.unsubscribeAll();YAHOO.util.Event.purgeElement(A,true);YAHOO.util.Event.purgeElement(D,true);D.innerHTML="";for(var C in this){if(YAHOO.lang.hasOwnProperty(this,C)){this[C]=null;}}};YAHOO.widget.AutoComplete.prototype.textboxFocusEvent=null;YAHOO.widget.AutoComplete.prototype.textboxKeyEvent=null;YAHOO.widget.AutoComplete.prototype.dataRequestEvent=null;YAHOO.widget.AutoComplete.prototype.dataReturnEvent=null;YAHOO.widget.AutoComplete.prototype.dataErrorEvent=null;YAHOO.widget.AutoComplete.prototype.containerPopulateEvent=null;YAHOO.widget.AutoComplete.prototype.containerExpandEvent=null;YAHOO.widget.AutoComplete.prototype.typeAheadEvent=null;YAHOO.widget.AutoComplete.prototype.itemMouseOverEvent=null;YAHOO.widget.AutoComplete.prototype.itemMouseOutEvent=null;YAHOO.widget.AutoComplete.prototype.itemArrowToEvent=null;YAHOO.widget.AutoComplete.prototype.itemArrowFromEvent=null;YAHOO.widget.AutoComplete.prototype.itemSelectEvent=null;YAHOO.widget.AutoComplete.prototype.unmatchedItemSelectEvent=null;YAHOO.widget.AutoComplete.prototype.selectionEnforceEvent=null;YAHOO.widget.AutoComplete.prototype.containerCollapseEvent=null;YAHOO.widget.AutoComplete.prototype.textboxBlurEvent=null;YAHOO.widget.AutoComplete.prototype.textboxChangeEvent=null;YAHOO.widget.AutoComplete._nIndex=0;
YAHOO.widget.AutoComplete.prototype._sName=null;YAHOO.widget.AutoComplete.prototype._elTextbox=null;YAHOO.widget.AutoComplete.prototype._elContainer=null;YAHOO.widget.AutoComplete.prototype._elContent=null;YAHOO.widget.AutoComplete.prototype._elHeader=null;YAHOO.widget.AutoComplete.prototype._elBody=null;YAHOO.widget.AutoComplete.prototype._elFooter=null;YAHOO.widget.AutoComplete.prototype._elShadow=null;YAHOO.widget.AutoComplete.prototype._elIFrame=null;YAHOO.widget.AutoComplete.prototype._bFocused=null;YAHOO.widget.AutoComplete.prototype._oAnim=null;YAHOO.widget.AutoComplete.prototype._bContainerOpen=false;YAHOO.widget.AutoComplete.prototype._bOverContainer=false;YAHOO.widget.AutoComplete.prototype._elList=null;YAHOO.widget.AutoComplete.prototype._nDisplayedItems=0;YAHOO.widget.AutoComplete.prototype._sCurQuery=null;YAHOO.widget.AutoComplete.prototype._sPastSelections="";YAHOO.widget.AutoComplete.prototype._sInitInputValue=null;YAHOO.widget.AutoComplete.prototype._elCurListItem=null;YAHOO.widget.AutoComplete.prototype._bItemSelected=false;YAHOO.widget.AutoComplete.prototype._nKeyCode=null;YAHOO.widget.AutoComplete.prototype._nDelayID=-1;YAHOO.widget.AutoComplete.prototype._nTypeAheadDelayID=-1;YAHOO.widget.AutoComplete.prototype._iFrameSrc="javascript:false;";YAHOO.widget.AutoComplete.prototype._queryInterval=null;YAHOO.widget.AutoComplete.prototype._sLastTextboxValue=null;YAHOO.widget.AutoComplete.prototype._initProps=function(){var B=this.minQueryLength;if(!YAHOO.lang.isNumber(B)){this.minQueryLength=1;}var E=this.maxResultsDisplayed;if(!YAHOO.lang.isNumber(E)||(E<1)){this.maxResultsDisplayed=10;}var F=this.queryDelay;if(!YAHOO.lang.isNumber(F)||(F<0)){this.queryDelay=0.2;}var C=this.typeAheadDelay;if(!YAHOO.lang.isNumber(C)||(C<0)){this.typeAheadDelay=0.2;}var A=this.delimChar;if(YAHOO.lang.isString(A)&&(A.length>0)){this.delimChar=[A];}else{if(!YAHOO.lang.isArray(A)){this.delimChar=null;}}var D=this.animSpeed;if((this.animHoriz||this.animVert)&&YAHOO.util.Anim){if(!YAHOO.lang.isNumber(D)||(D<0)){this.animSpeed=0.3;}if(!this._oAnim){this._oAnim=new YAHOO.util.Anim(this._elContent,{},this.animSpeed);}else{this._oAnim.duration=this.animSpeed;}}if(this.forceSelection&&A){}};YAHOO.widget.AutoComplete.prototype._initContainerHelperEls=function(){if(this.useShadow&&!this._elShadow){var A=document.createElement("div");A.className="yui-ac-shadow";A.style.width=0;A.style.height=0;this._elShadow=this._elContainer.appendChild(A);}if(this.useIFrame&&!this._elIFrame){var B=document.createElement("iframe");B.src=this._iFrameSrc;B.frameBorder=0;B.scrolling="no";B.style.position="absolute";B.style.width=0;B.style.height=0;B.tabIndex=-1;B.style.padding=0;this._elIFrame=this._elContainer.appendChild(B);}};YAHOO.widget.AutoComplete.prototype._initContainerEl=function(){YAHOO.util.Dom.addClass(this._elContainer,"yui-ac-container");if(!this._elContent){var C=document.createElement("div");C.className="yui-ac-content";C.style.display="none";this._elContent=this._elContainer.appendChild(C);var B=document.createElement("div");B.className="yui-ac-hd";B.style.display="none";this._elHeader=this._elContent.appendChild(B);var D=document.createElement("div");D.className="yui-ac-bd";this._elBody=this._elContent.appendChild(D);var A=document.createElement("div");A.className="yui-ac-ft";A.style.display="none";this._elFooter=this._elContent.appendChild(A);}else{}};YAHOO.widget.AutoComplete.prototype._initListEl=function(){var C=this.maxResultsDisplayed;var A=this._elList||document.createElement("ul");var B;while(A.childNodes.length<C){B=document.createElement("li");B.style.display="none";B._nItemIndex=A.childNodes.length;A.appendChild(B);}if(!this._elList){var D=this._elBody;YAHOO.util.Event.purgeElement(D,true);D.innerHTML="";this._elList=D.appendChild(A);}};YAHOO.widget.AutoComplete.prototype._enableIntervalDetection=function(){var A=this;if(!A._queryInterval&&A.queryInterval){A._queryInterval=setInterval(function(){A._onInterval();},A.queryInterval);}};YAHOO.widget.AutoComplete.prototype._onInterval=function(){var A=this._elTextbox.value;var B=this._sLastTextboxValue;if(A!=B){this._sLastTextboxValue=A;this._sendQuery(A);}};YAHOO.widget.AutoComplete.prototype._clearInterval=function(){if(this._queryInterval){clearInterval(this._queryInterval);this._queryInterval=null;}};YAHOO.widget.AutoComplete.prototype._isIgnoreKey=function(A){if((A==9)||(A==13)||(A==16)||(A==17)||(A>=18&&A<=20)||(A==27)||(A>=33&&A<=35)||(A>=36&&A<=40)||(A>=44&&A<=45)||(A==229)){return true;}return false;};YAHOO.widget.AutoComplete.prototype._sendQuery=function(G){if(this.minQueryLength<0){this._toggleContainer(false);return ;}var I=(this.delimChar)?this.delimChar:null;if(I){var B=-1;for(var F=I.length-1;F>=0;F--){var D=G.lastIndexOf(I[F]);if(D>B){B=D;}}if(I[F]==" "){for(var E=I.length-1;E>=0;E--){if(G[B-1]==I[E]){B--;break;}}}if(B>-1){var H=B+1;while(G.charAt(H)==" "){H+=1;}this._sPastSelections=G.substring(0,H);G=G.substr(H);}else{this._sPastSelections="";}}if((G&&(G.length<this.minQueryLength))||(!G&&this.minQueryLength>0)){if(this._nDelayID!=-1){clearTimeout(this._nDelayID);}this._toggleContainer(false);return ;}G=encodeURIComponent(G);this._nDelayID=-1;if(this.dataSource.queryMatchSubset||this.queryMatchSubset){var A=this.getSubsetMatches(G);if(A){this.handleResponse(G,A,{query:G});return ;}}if(this.responseStripAfter){this.dataSource.doBeforeParseData=this.preparseRawResponse;}if(this.applyLocalFilter){this.dataSource.doBeforeCallback=this.filterResults;}var C=this.generateRequest(G);this.dataRequestEvent.fire(this,G,C);this.dataSource.sendRequest(C,{success:this.handleResponse,failure:this.handleResponse,scope:this,argument:{query:G}});};YAHOO.widget.AutoComplete.prototype._populateList=function(K,F,C){if(this._nTypeAheadDelayID!=-1){clearTimeout(this._nTypeAheadDelayID);}K=(C&&C.query)?C.query:K;var H=this.doBeforeLoadData(K,F,C);if(H&&!F.error){this.dataReturnEvent.fire(this,K,F.results);if(this._bFocused||(this._bFocused===null)){var M=decodeURIComponent(K);
this._sCurQuery=M;this._bItemSelected=false;var R=F.results,A=Math.min(R.length,this.maxResultsDisplayed),J=(this.dataSource.responseSchema.fields)?(this.dataSource.responseSchema.fields[0].key||this.dataSource.responseSchema.fields[0]):0;if(A>0){if(!this._elList||(this._elList.childNodes.length<A)){this._initListEl();}this._initContainerHelperEls();var I=this._elList.childNodes;for(var Q=A-1;Q>=0;Q--){var P=I[Q],E=R[Q];if(this.resultTypeList){var B=[];B[0]=(YAHOO.lang.isString(E))?E:E[J]||E[this.key];var L=this.dataSource.responseSchema.fields;if(YAHOO.lang.isArray(L)&&(L.length>1)){for(var N=1,S=L.length;N<S;N++){B[B.length]=E[L[N].key||L[N]];}}else{if(YAHOO.lang.isArray(E)){B=E;}else{if(YAHOO.lang.isString(E)){B=[E];}else{B[1]=E;}}}E=B;}P._sResultMatch=(YAHOO.lang.isString(E))?E:(YAHOO.lang.isArray(E))?E[0]:(E[J]||"");P._oResultData=E;P.innerHTML=this.formatResult(E,M,P._sResultMatch);P.style.display="";}if(A<I.length){var G;for(var O=I.length-1;O>=A;O--){G=I[O];G.style.display="none";}}this._nDisplayedItems=A;this.containerPopulateEvent.fire(this,K,R);if(this.autoHighlight){var D=this._elList.firstChild;this._toggleHighlight(D,"to");this.itemArrowToEvent.fire(this,D);this._typeAhead(D,K);}else{this._toggleHighlight(this._elCurListItem,"from");}H=this.doBeforeExpandContainer(this._elTextbox,this._elContainer,K,R);this._toggleContainer(H);}else{this._toggleContainer(false);}return ;}}else{this.dataErrorEvent.fire(this,K);}};YAHOO.widget.AutoComplete.prototype._clearSelection=function(){var C=this._elTextbox.value;var B=(this.delimChar)?this.delimChar[0]:null;var A=(B)?C.lastIndexOf(B,C.length-2):-1;if(A>-1){this._elTextbox.value=C.substring(0,A);}else{this._elTextbox.value="";}this._sPastSelections=this._elTextbox.value;this.selectionEnforceEvent.fire(this);};YAHOO.widget.AutoComplete.prototype._textMatchesOption=function(){var A=null;for(var B=this._nDisplayedItems-1;B>=0;B--){var C=this._elList.childNodes[B];var D=(""+C._sResultMatch).toLowerCase();if(D==this._sCurQuery.toLowerCase()){A=C;break;}}return(A);};YAHOO.widget.AutoComplete.prototype._typeAhead=function(B,D){if(!this.typeAhead||(this._nKeyCode==8)){return ;}var A=this,C=this._elTextbox;if(C.setSelectionRange||C.createTextRange){this._nTypeAheadDelayID=setTimeout(function(){var F=C.value.length;A._updateValue(B);var G=C.value.length;A._selectText(C,F,G);var E=C.value.substr(F,G);A.typeAheadEvent.fire(A,D,E);},(this.typeAheadDelay*1000));}};YAHOO.widget.AutoComplete.prototype._selectText=function(D,A,B){if(D.setSelectionRange){D.setSelectionRange(A,B);}else{if(D.createTextRange){var C=D.createTextRange();C.moveStart("character",A);C.moveEnd("character",B-D.value.length);C.select();}else{D.select();}}};YAHOO.widget.AutoComplete.prototype._toggleContainerHelpers=function(D){var E=this._elContent.offsetWidth+"px";var B=this._elContent.offsetHeight+"px";if(this.useIFrame&&this._elIFrame){var C=this._elIFrame;if(D){C.style.width=E;C.style.height=B;C.style.padding="";}else{C.style.width=0;C.style.height=0;C.style.padding=0;}}if(this.useShadow&&this._elShadow){var A=this._elShadow;if(D){A.style.width=E;A.style.height=B;}else{A.style.width=0;A.style.height=0;}}};YAHOO.widget.AutoComplete.prototype._toggleContainer=function(I){var D=this._elContainer;if(this.alwaysShowContainer&&this._bContainerOpen){return ;}if(!I){this._toggleHighlight(this._elCurListItem,"from");this._nDisplayedItems=0;this._sCurQuery=null;if(!this._bContainerOpen){this._elContent.style.display="none";return ;}}var A=this._oAnim;if(A&&A.getEl()&&(this.animHoriz||this.animVert)){if(A.isAnimated()){A.stop(true);}var G=this._elContent.cloneNode(true);D.appendChild(G);G.style.top="-9000px";G.style.width="";G.style.height="";G.style.display="";var F=G.offsetWidth;var C=G.offsetHeight;var B=(this.animHoriz)?0:F;var E=(this.animVert)?0:C;A.attributes=(I)?{width:{to:F},height:{to:C}}:{width:{to:B},height:{to:E}};if(I&&!this._bContainerOpen){this._elContent.style.width=B+"px";this._elContent.style.height=E+"px";}else{this._elContent.style.width=F+"px";this._elContent.style.height=C+"px";}D.removeChild(G);G=null;var H=this;var J=function(){A.onComplete.unsubscribeAll();if(I){H._toggleContainerHelpers(true);H._bContainerOpen=I;H.containerExpandEvent.fire(H);}else{H._elContent.style.display="none";H._bContainerOpen=I;H.containerCollapseEvent.fire(H);}};this._toggleContainerHelpers(false);this._elContent.style.display="";A.onComplete.subscribe(J);A.animate();}else{if(I){this._elContent.style.display="";this._toggleContainerHelpers(true);this._bContainerOpen=I;this.containerExpandEvent.fire(this);}else{this._toggleContainerHelpers(false);this._elContent.style.display="none";this._bContainerOpen=I;this.containerCollapseEvent.fire(this);}}};YAHOO.widget.AutoComplete.prototype._toggleHighlight=function(A,C){if(A){var B=this.highlightClassName;if(this._elCurListItem){YAHOO.util.Dom.removeClass(this._elCurListItem,B);this._elCurListItem=null;}if((C=="to")&&B){YAHOO.util.Dom.addClass(A,B);this._elCurListItem=A;}}};YAHOO.widget.AutoComplete.prototype._togglePrehighlight=function(B,C){if(B==this._elCurListItem){return ;}var A=this.prehighlightClassName;if((C=="mouseover")&&A){YAHOO.util.Dom.addClass(B,A);}else{YAHOO.util.Dom.removeClass(B,A);}};YAHOO.widget.AutoComplete.prototype._updateValue=function(C){if(!this.suppressInputUpdate){var F=this._elTextbox;var E=(this.delimChar)?(this.delimChar[0]||this.delimChar):null;var B=C._sResultMatch;var D="";if(E){D=this._sPastSelections;D+=B+E;if(E!=" "){D+=" ";}}else{D=B;}F.value=D;if(F.type=="textarea"){F.scrollTop=F.scrollHeight;}var A=F.value.length;this._selectText(F,A,A);this._elCurListItem=C;}};YAHOO.widget.AutoComplete.prototype._selectItem=function(A){this._bItemSelected=true;this._updateValue(A);this._sPastSelections=this._elTextbox.value;this._clearInterval();this.itemSelectEvent.fire(this,A,A._oResultData);this._toggleContainer(false);};YAHOO.widget.AutoComplete.prototype._jumpSelection=function(){if(this._elCurListItem){this._selectItem(this._elCurListItem);
}else{this._toggleContainer(false);}};YAHOO.widget.AutoComplete.prototype._moveSelection=function(G){if(this._bContainerOpen){var F=this._elCurListItem;var E=-1;if(F){E=F._nItemIndex;}var C=(G==40)?(E+1):(E-1);if(C<-2||C>=this._nDisplayedItems){return ;}if(F){this._toggleHighlight(F,"from");this.itemArrowFromEvent.fire(this,F);}if(C==-1){if(this.delimChar){this._elTextbox.value=this._sPastSelections+this._sCurQuery;}else{this._elTextbox.value=this._sCurQuery;}return ;}if(C==-2){this._toggleContainer(false);return ;}var D=this._elList.childNodes[C];var A=this._elContent;var B=((YAHOO.util.Dom.getStyle(A,"overflow")=="auto")||(YAHOO.util.Dom.getStyle(A,"overflowY")=="auto"));if(B&&(C>-1)&&(C<this._nDisplayedItems)){if(G==40){if((D.offsetTop+D.offsetHeight)>(A.scrollTop+A.offsetHeight)){A.scrollTop=(D.offsetTop+D.offsetHeight)-A.offsetHeight;}else{if((D.offsetTop+D.offsetHeight)<A.scrollTop){A.scrollTop=D.offsetTop;}}}else{if(D.offsetTop<A.scrollTop){this._elContent.scrollTop=D.offsetTop;}else{if(D.offsetTop>(A.scrollTop+A.offsetHeight)){this._elContent.scrollTop=(D.offsetTop+D.offsetHeight)-A.offsetHeight;}}}}this._toggleHighlight(D,"to");this.itemArrowToEvent.fire(this,D);if(this.typeAhead){this._updateValue(D);}}};YAHOO.widget.AutoComplete.prototype._onContainerMouseover=function(A,C){var D=YAHOO.util.Event.getTarget(A);var B=D.nodeName.toLowerCase();while(D&&(B!="table")){switch(B){case"body":return ;case"li":if(C.prehighlightClassName){C._togglePrehighlight(D,"mouseover");}else{C._toggleHighlight(D,"to");}C.itemMouseOverEvent.fire(C,D);break;case"div":if(YAHOO.util.Dom.hasClass(D,"yui-ac-container")){C._bOverContainer=true;return ;}break;default:break;}D=D.parentNode;if(D){B=D.nodeName.toLowerCase();}}};YAHOO.widget.AutoComplete.prototype._onContainerMouseout=function(A,C){var D=YAHOO.util.Event.getTarget(A);var B=D.nodeName.toLowerCase();while(D&&(B!="table")){switch(B){case"body":return ;case"li":if(C.prehighlightClassName){C._togglePrehighlight(D,"mouseout");}else{C._toggleHighlight(D,"from");}C.itemMouseOutEvent.fire(C,D);break;case"ul":C._toggleHighlight(C._elCurListItem,"to");break;case"div":if(YAHOO.util.Dom.hasClass(D,"yui-ac-container")){C._bOverContainer=false;return ;}break;default:break;}D=D.parentNode;if(D){B=D.nodeName.toLowerCase();}}};YAHOO.widget.AutoComplete.prototype._onContainerClick=function(A,C){var D=YAHOO.util.Event.getTarget(A);var B=D.nodeName.toLowerCase();while(D&&(B!="table")){switch(B){case"body":return ;case"li":C._toggleHighlight(D,"to");C._selectItem(D);return ;default:break;}D=D.parentNode;if(D){B=D.nodeName.toLowerCase();}}};YAHOO.widget.AutoComplete.prototype._onContainerScroll=function(A,B){B._elTextbox.focus();};YAHOO.widget.AutoComplete.prototype._onContainerResize=function(A,B){B._toggleContainerHelpers(B._bContainerOpen);};YAHOO.widget.AutoComplete.prototype._onTextboxKeyDown=function(A,B){var C=A.keyCode;if(B._nTypeAheadDelayID!=-1){clearTimeout(B._nTypeAheadDelayID);}switch(C){case 9:if(!YAHOO.env.ua.opera&&(navigator.userAgent.toLowerCase().indexOf("mac")==-1)||(YAHOO.env.ua.webkit>420)){if(B._elCurListItem){if(B.delimChar&&(B._nKeyCode!=C)){if(B._bContainerOpen){YAHOO.util.Event.stopEvent(A);}}B._selectItem(B._elCurListItem);}else{B._toggleContainer(false);}}break;case 13:if(!YAHOO.env.ua.opera&&(navigator.userAgent.toLowerCase().indexOf("mac")==-1)||(YAHOO.env.ua.webkit>420)){if(B._elCurListItem){if(B._nKeyCode!=C){if(B._bContainerOpen){YAHOO.util.Event.stopEvent(A);}}B._selectItem(B._elCurListItem);}else{B._toggleContainer(false);}}break;case 27:B._toggleContainer(false);return ;case 39:B._jumpSelection();break;case 38:if(B._bContainerOpen){YAHOO.util.Event.stopEvent(A);B._moveSelection(C);}break;case 40:if(B._bContainerOpen){YAHOO.util.Event.stopEvent(A);B._moveSelection(C);}break;default:B._bItemSelected=false;B._toggleHighlight(B._elCurListItem,"from");B.textboxKeyEvent.fire(B,C);break;}if(C===18){B._enableIntervalDetection();}B._nKeyCode=C;};YAHOO.widget.AutoComplete.prototype._onTextboxKeyPress=function(A,B){var C=A.keyCode;if(YAHOO.env.ua.opera||(navigator.userAgent.toLowerCase().indexOf("mac")!=-1)&&(YAHOO.env.ua.webkit<420)){switch(C){case 9:if(B._bContainerOpen){if(B.delimChar){YAHOO.util.Event.stopEvent(A);}if(B._elCurListItem){B._selectItem(B._elCurListItem);}else{B._toggleContainer(false);}}break;case 13:if(B._bContainerOpen){YAHOO.util.Event.stopEvent(A);if(B._elCurListItem){B._selectItem(B._elCurListItem);}else{B._toggleContainer(false);}}break;default:break;}}else{if(C==229){B._enableIntervalDetection();}}};YAHOO.widget.AutoComplete.prototype._onTextboxKeyUp=function(A,C){var B=this.value;C._initProps();var D=A.keyCode;if(C._isIgnoreKey(D)){return ;}if(C._nDelayID!=-1){clearTimeout(C._nDelayID);}C._nDelayID=setTimeout(function(){C._sendQuery(B);},(C.queryDelay*1000));};YAHOO.widget.AutoComplete.prototype._onTextboxFocus=function(A,B){if(!B._bFocused){B._elTextbox.setAttribute("autocomplete","off");B._bFocused=true;B._sInitInputValue=B._elTextbox.value;B.textboxFocusEvent.fire(B);}};YAHOO.widget.AutoComplete.prototype._onTextboxBlur=function(A,C){if(!C._bOverContainer||(C._nKeyCode==9)){if(!C._bItemSelected){var B=C._textMatchesOption();if(!C._bContainerOpen||(C._bContainerOpen&&(B===null))){if(C.forceSelection){C._clearSelection();}else{C.unmatchedItemSelectEvent.fire(C,C._sCurQuery);}}else{if(C.forceSelection){C._selectItem(B);}}}if(C._bContainerOpen){C._toggleContainer(false);}C._clearInterval();C._bFocused=false;if(C._sInitInputValue!==C._elTextbox.value){C.textboxChangeEvent.fire(C);}C.textboxBlurEvent.fire(C);}};YAHOO.widget.AutoComplete.prototype._onWindowUnload=function(A,B){if(B&&B._elTextbox&&B.allowBrowserAutocomplete){B._elTextbox.setAttribute("autocomplete","on");}};YAHOO.widget.AutoComplete.prototype.doBeforeSendQuery=function(A){return this.generateRequest(A);};YAHOO.widget.AutoComplete.prototype.getListItems=function(){var C=[],B=this._elList.childNodes;for(var A=B.length-1;A>=0;A--){C[A]=B[A];}return C;};YAHOO.widget.AutoComplete._cloneObject=function(D){if(!YAHOO.lang.isValue(D)){return D;
}var F={};if(YAHOO.lang.isFunction(D)){F=D;}else{if(YAHOO.lang.isArray(D)){var E=[];for(var C=0,B=D.length;C<B;C++){E[C]=YAHOO.widget.AutoComplete._cloneObject(D[C]);}F=E;}else{if(YAHOO.lang.isObject(D)){for(var A in D){if(YAHOO.lang.hasOwnProperty(D,A)){if(YAHOO.lang.isValue(D[A])&&YAHOO.lang.isObject(D[A])||YAHOO.lang.isArray(D[A])){F[A]=YAHOO.widget.AutoComplete._cloneObject(D[A]);}else{F[A]=D[A];}}}}else{F=D;}}}return F;};YAHOO.register("autocomplete",YAHOO.widget.AutoComplete,{version:"2.6.0",build:"1321"});
YAHOO.widget.AutoComplete.prototype.doubleQuoteOverrides         = null;
YAHOO.widget.AutoComplete.prototype.doubleQuoteResultsWithSpaces = null;


YAHOO.widget.AutoComplete.prototype.formatResult = function(oResultItem, sQuery) {
  var sResult = oResultItem[0];
  if(sResult) {
      // I'm so pretty, oh so pretty -- Wrap the substring
      // match in a span so we can apply fancy styles, bold!
      var idx  = sResult.toLowerCase().indexOf(sQuery.toLowerCase());
      var head = sResult.substr(0,idx);
      var body = sResult.substr(idx,idx+sQuery.length)
      var tail = sResult.substr(idx+sQuery.length,sResult.length);
      return head + '<span>' + body + '</span>' + tail;
  }
  else {
      return "";
  }
}

YAHOO.widget.AutoComplete.prototype._sendQuery = function(sQuery) {
    // Widget has been effectively turned off
    if(this.minQueryLength < 0) {
        this._toggleContainer(false);
        return;
    }
    // Delimiter has been enabled
    var aDelimChar = (this.delimChar) ? this.delimChar : null;
    if(aDelimChar) {
        // Allow double-quotes to override all other delimiters,
        // this is useful if you want to allow spaces both as a delimiter and as
        // a compound charcter. E.G. 'power water "natual gas"' ...
        if (this.doubleQuoteOverrides &&
            /\"/g.test(sQuery) && sQuery.match(/\"/g).length % 2 != 0) {
          aDelimChar = [ '"' ];
        }

        // Loop through all possible delimiters and find the rightmost one in the query
        // A " " may be a false positive if they are defined as delimiters AND
        // are used to separate delimited queries
        var nDelimIndex = -1;
        for(var i = aDelimChar.length-1; i >= 0; i--) {
            var nNewIndex = sQuery.lastIndexOf(aDelimChar[i]);
            if(nNewIndex > nDelimIndex) {
                nDelimIndex = nNewIndex;
            }
        }
        // If we think the last delimiter is a space (" "), make sure it is NOT
        // a false positive by also checking the char directly before it
        if(aDelimChar[i] == " ") {
            for (var j = aDelimChar.length-1; j >= 0; j--) {
                if(sQuery[nDelimIndex - 1] == aDelimChar[j]) {
                    nDelimIndex--;
                    break;
                }
            }
        }
        // A delimiter has been found in the query so extract the latest query from past selections
        if(nDelimIndex > -1) {
            var nQueryStart = nDelimIndex + 1;
            // Trim any white space from the beginning...
            while(sQuery.charAt(nQueryStart) == " ") {
                nQueryStart += 1;
            }
            // ...and save the rest of the string for later
            this._sPastSelections = sQuery.substring(0,nQueryStart);
            // Here is the query itself
            sQuery = sQuery.substr(nQueryStart);
        }
        // No delimiter found in the query, so there are no selections from past queries
        else {
            this._sPastSelections = "";
        }
    }

    // Don't search queries that are too short
    if((sQuery && (sQuery.length < this.minQueryLength)) || (!sQuery && this.minQueryLength > 0)) {
        if(this._nDelayID != -1) {
            clearTimeout(this._nDelayID);
        }
        this._toggleContainer(false);
        return;
    }

    sQuery = encodeURIComponent(sQuery);
    this._nDelayID = -1;    // Reset timeout ID because request is being made

    // Subset matching
    if(this.dataSource.queryMatchSubset || this.queryMatchSubset) { // backward compat
        var oResponse = this.getSubsetMatches(sQuery);
        if(oResponse) {
            this.handleResponse(sQuery, oResponse, {query: sQuery});
            return;
        }
    }

    if(this.responseStripAfter) {
        this.dataSource.doBeforeParseData = this.preparseRawResponse;
    }
    if(this.applyLocalFilter) {
        this.dataSource.doBeforeCallback = this.filterResults;
    }

    var sRequest = this.generateRequest(sQuery);
    this.dataRequestEvent.fire(this, sQuery, sRequest);

    this.dataSource.sendRequest(sRequest, {
            success : this.handleResponse,
            failure : this.handleResponse,
            scope   : this,
            argument: {
                query: sQuery
            }
    });
};

YAHOO.widget.AutoComplete.prototype._updateValue = function(elListItem) {
    if(!this.suppressInputUpdate) {
        var elTextbox = this._elTextbox;
        var sDelimChar = (this.delimChar) ? (this.delimChar[0] || this.delimChar) : null;
        var sResultMatch = elListItem._sResultMatch;

        // andre: the click was not on an autocomplete option, probably the footer
        if (!sResultMatch) return;

        // if we're quoting results with spaces AND the result has a
        // space then, you guessed it, wrap the result string in double quotes!
        if (this.doubleQuoteResultsWithSpaces && sDelimChar == " " && sResultMatch.match(/\s/)) {
          sResultMatch = ['"', sResultMatch, '"'].join('');
        }

        // Calculate the new value
        var sNewValue = "";
        if(sDelimChar) {
            // Preserve selections from past queries
            sNewValue = this._sPastSelections;
            // if there are an odd number of double quotes, remove
            // the last double quote and any spaces. This is needed to ensure we do
            // not end up with extra leading quotes.
            if (this.doubleQuoteResultsWithSpaces &&
                /\"/.test(sNewValue) && sNewValue.match(/\"/g).length % 2 != 0) {
              sNewValue = sNewValue.replace(/\"\s*$/,'');
            }
            // Add new selection plus delimiter
            sNewValue += sResultMatch + sDelimChar;
            if(sDelimChar != " ") {
                sNewValue += " ";
            }
        }
        else {
            sNewValue = sResultMatch;
        }

        // Update input field
        elTextbox.value = sNewValue;

        // Scroll to bottom of textarea if necessary
        if(elTextbox.type == "textarea") {
            elTextbox.scrollTop = elTextbox.scrollHeight;
        }

        // Move cursor to end
        var end = elTextbox.value.length;
        this._selectText(elTextbox,end,end);

        this._elCurListItem = elListItem;
    }
};

// YUI shortcuts
var Dom = YAHOO.util.Dom;

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
          $('<li></li>')
            .append(linkTo(account))
            .appendTo(accountListColumn);
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

/**
 * Provides a base class for all widgets on the page.
 */
wesabe.$class('wesabe.views.widgets.BaseWidget', function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.number
  var number = wesabe.lang.number;

  $.extend($class.prototype, {
    element: null,
    _childWidgets: null,

    width: null,
    height: null,
    padding: null,

    needsRedraw: false,
    _redrawTimeout: null,

    init: function(element) {
      this.set('element', element);
      element = this.get('element');

      this.width = element.width();
      this.height = element.height();
      this.padding = {
        top: number.parse(element.css('padding-top')) || 0,
        right: number.parse(element.css('padding-right')) || 0,
        bottom: number.parse(element.css('padding-bottom')) || 0,
        left: number.parse(element.css('padding-left')) || 0
      };
    },

    /**
     * Returns the element to which content will be added.
     *
     * @returns {Element}
     */
    contentElement: function() {
      return this._contentElement || this.get('element');
    },

    /**
     * @private
     */
    _setContentElement: function(element) {
      this._contentElement = element;
    },

    id: function() {
      return this.get('element').attr('id');
    },

    setId: function(id) {
      this.get('element').attr('id', id);
    },

    visible: function() {
      return this.get('element').is(':visible');
    },

    setVisible: function(visible) {
      visible ? this.get('element').show() : this.get('element').hide();
    },

    setOpacity: function(opacity, animate) {
      var css = {opacity: opacity}, element = this.get('element').stop(true);
      animate ? element.animate(css) : element.css(css);
    },

    position: function() {
      return this.get('element').position();
    },

    /**
     * Aligns this widget with the given element or widget, with optional offset.
     *
     * @param {!Element|BaseWidget} elementOrWidget
     * @param {?number} leftDelta
     * @param {?number} topDelta
     */
    alignWith: function(elementOrWidget, leftDelta, topDelta) {
      var position = (elementOrWidget && elementOrWidget.getClass) ? elementOrWidget.get('position') :
                                                                     $(elementOrWidget).position();
      if (leftDelta) position.left += leftDelta;
      if (topDelta) position.top += topDelta;
      this.get('element').css(position);
    },

    /**
     * Redraws the widget. Override in subclasses to do something useful.
     */
    redraw: function() {
      this.get('element').css({
        width: this.get('contentWidth'),
        height: this.get('contentHeight'),
        'padding-top': this.padding.top+'px',
        'padding-right': this.padding.right+'px',
        'padding-bottom': this.padding.bottom+'px',
        'padding-left': this.padding.left+'px'
      });
    },

    /**
     * Notifies the widget that it needs to redraw itself, but it waits
     * for the currently executing javascript to return control first.
     *
     * @param {boolean} needsRedraw
     */
    setNeedsRedraw: function(needsRedraw) {
      if (this._redrawTimeout)
        clearTimeout(this._redrawTimeout);

      if (needsRedraw) {
        var self = this;
        this._redrawTimeout = setTimeout(function(){ self.redraw(); }, 0);
      }
    },

    /**
     * Left offset of the content rect.
     *
     * @return {number}
     */
    contentLeft: function() {
      return this.padding.left;
    },

    /**
     * Top of the content rect.
     *
     * @return {number}
     */
    contentTop: function() {
      return this.padding.top;
    },

    /**
     * Width of the content rect.
     *
     * @return {number}
     */
    contentWidth: function() {
      return this.width - this.padding.left - this.padding.right;
    },

    /**
     * Height of the content rect.
     *
     * @return {number}
     */
    contentHeight: function() {
      return this.height - this.padding.top - this.padding.bottom;
    },

    /**
     * Sets this widget's width.
     *
     * @param {number} width
     */
    setWidth: function(width) {
      this.width = width;
      this.setNeedsRedraw(true);
    },

    /**
     * Sets this widget's height.
     *
     * @param {number} height
     */
    setHeight: function(height) {
      this.height = height;
      this.setNeedsRedraw(true);
    },

    /**
     * Sets this widget's padding.
     *
     * @param {number} padding
     */
    setPadding: function(padding) {
      this.padding = padding;
      this.setNeedsRedraw(true);
    },

    /**
     * Registers a child widget that needs to be cleaned up when this widget
     * instance is removed.
     *
     * @param {!BaseWidget} child
     */
    registerChildWidget: function(child) {
      if (!this._childWidgets) this._childWidgets = [];
      this._childWidgets.push(child);
    },

    /**
     * Registers all children passed along for cleanup when this widget
     * instance is removed.
     *
     * @param {...BaseWidget} var_args
     */
    registerChildWidgets: function() {
      if (!this._childWidgets) this._childWidgets = [];
      this._childWidgets = this._childWidgets.concat($.makeArray(arguments));
    },

    /**
     * Unregisters a child widget that was previously registered.
     *
     * @param {!BaseWidget} child
     */
    unregisterChildWidget: function(child) {
      this._childWidgets = wesabe.lang.array.minus(this._childWidgets, [child]);
    },

    /**
     * Unregisters child widgets that were previously registered.
     *
     * @param {...BaseWidget} var_args
     */
    unregisterChildWidgets: function() {
      this._childWidgets = wesabe.lang.array.minus(this._childWidgets, arguments);
    },

    /**
     * Removes this widget and its children from the DOM.
     */
    remove: function() {
      if (this.element)
        this.element.remove();
      this.destroy();
    },

    /**
     * Destroys this widget by removing all ivars and cleaning up all children
     * registered using registerChildWidget(s).
     *
     * NOTE: When overriding this method be sure to call super _after_ you do
     * your own cleanup, otherwise your ivars will be gone.
     */
    destroy: function() {
      if (this._childWidgets) {
        for (var i = this._childWidgets.length; i--;)
          if ($.isFunction(this._childWidgets[i].destroy))
            this._childWidgets[i].destroy();
      }

      // remove all ivars
      for (var key in this) {
        var isOwnProperty = this.hasOwnProperty(key),
            isPrivate = key.substring(0,1) === '_',
            isIvar = isPrivate && !$.isFunction(this[key]);

        if (isOwnProperty && isIvar)
          this[key] = null;
      }
    },

    /**
     * Appends the widget to the given jQuery +element+.
     *
     * @param {!jQuery} element
     */
    appendTo: function(element) {
      if (element.get('element'))
        element = element.get('element');
      this._willMoveToParent(element);
      this.element.appendTo(element);
      this._didMoveToParent();
    },

    /**
     * Prepends the widget to the given jQuery +element+.
     *
     * @param {!jQuery} element
     */
    prependTo: function(element) {
      if (element.get('element'))
        element = element.get('element');
      this._willMoveToParent(element);
      this.element.prependTo(element);
      this._didMoveToParent();
    },

    /**
     * Inserts this widget before the given jQuery +element+.
     *
     * @param {!jQuery} element
     */
    insertAfter: function(element) {
      if (element.get('element'))
        element = element.get('element');
      this._willMoveToParent(element.parent());
      this.element.insertAfter(element);
      this._didMoveToParent();
    },

    /**
     * Inserts this widget before the given jQuery +element+.
     *
     * @param {!jQuery} element
     */
    insertBefore: function(element) {
      if (element.get('element'))
        element = element.get('element');
      this._willMoveToParent(element.parent());
      this.element.insertBefore(element);
      this._didMoveToParent();
    },

    /**
     * @private
     */
    _willMoveToParent: function(element) {
    },

    /**
     * @private
     */
    _didMoveToParent: function() {
    },

    /**
     * Adds +widget+ to the end of this widget's content.
     *
     * @param {!BaseWidget} widget
     */
    appendChildWidget: function(widget) {
      widget.appendTo(this.get('contentElement'));
      this.registerChildWidget(widget);
    },

    /**
     * Adds +widget+ to the beginning of this widget's content.
     *
     * @param {!BaseWidget} widget
     */
    prependChildWidget: function(widget) {
      widget.prependTo(this.get('contentElement'));
      this.registerChildWidget(widget);
    },

    /**
     * Adds +element+ to the end of this widget's content.
     *
     * @param {!Element} element
     */
    appendElement: function(element) {
      this.get('contentElement').append(element);
    },

    /**
     * Adds +element+ to the beginning of this widget's content.
     *
     * @param {!Element} element
     */
    prependElement: function(element) {
      this.get('contentElement').prepend(element);
    },

    /**
     * Determines whether this widget is attached to an HTML document.
     */
    isAttached: function() {
      return this.element &&
             this.element.length &&
             this.element.parent('html').length;
    },

    /**
     * Adds +className+ to this widget's element.
     */
    addClassName: function(className) {
      this.element.addClass(className);
    },

    /**
     * Removes +className+ from this widget's element.
     */
    removeClassName: function(className) {
      this.element.removeClass(className);
    }
  });
});

wesabe.$class('views.widgets.Container', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    topElement: null,
    bottomElement: null,

    init: function(elementOrStyle) {
      var element, style;

      if (typeof elementOrStyle == 'string')
        style = elementOrStyle;
      else
        element = elementOrStyle;

      if (!element)
        element = $('<div>'+
                      '<div class="top"><div class="right"></div></div>'+
                      '<div class="middle"><div class="right"></div></div>'+
                      '<div class="bottom"><div class="right"></div></div>'+
                    '</div>');

      $super.init.call(this, element);

      this.topElement = element.find('> .top > .right');
      this.set('contentElement', element.find('> .middle > .right'));
      this.bottomElement = element.find('> .bottom > .right');

      if (style)
        this.addClassName(style);
    },

    middleElement: function() {
      return this.get('contentElement');
    }
  });
});

wesabe.$class('views.widgets.Module', wesabe.views.widgets.Container, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    movable: false,

    _headerElement: null,
    _headerTitleLabel: null,
    _movableElements: null,

    init: function(elementOrStyle) {
      var element, style;

      if (typeof elementOrStyle == 'string')
        style = elementOrStyle;
      else
        element = elementOrStyle;

      var topContent, middleContent, bottomContent;

      if (!element) {
        topContent = $('<div class="grip"></div>');
        middleContent = $('<div class="content"><div class="module-header"><h4></h4></div></div>');
        bottomContent = null;
      }

      $super.init.call(this, element);
      element = this.get('element');

      if (topContent)
        topContent.appendTo(this.get('topElement'));
      if (middleContent)
        middleContent.appendTo(this.get('middleElement'));
      if (bottomContent)
        bottomContent.appendTo(this.get('bottomElement'));

      this.set('contentElement', element.find('.content'));
      this._headerElement = element.find('.module-header');
      this._headerTitleLabel = new wesabe.views.widgets.Label(this._headerElement.find(':header'));
      this.registerChildWidget(this._headerTitleLabel);

      this._movableElements = element.find('> .top > .right > .grip, > .top > .right');
      this.movable = this._movableElements.hasClass('movable');

      if (style)
        this.addClassName(style);
    },

    /**
     * Gets the title text for this module.
     *
     * @return {String}
     */
    title: function() {
      return this._headerTitleLabel.get('value');
    },

    /**
     * Sets the title text for this module.
     *
     * @param {String} title
     */
    setTitle: function(title) {
      this._headerTitleLabel.set('value', title);
    },

    headerElement: function() {
      return this._headerElement;
    },

    setMovable: function(movable) {
      movable = !!movable;
      if (movable === this.movable)
        return;

      this.movable = movable;
      if (movable) this._movableElements.addClass('movable');
      else         this._movableElements.removeClass('movable');
    }
  });
});

wesabe.$class('views.widgets.Form', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _enabled: true,

    _fields: null,

    init: function(element) {
      var me = this;

      if (!element)
        element = $('<form><fieldset><div class="two-col-centered"></div></fieldset></form>');

      $super.init.call(me, element);
      me.set('contentElement', element.find('> fieldset > div'));
      me._fields = [];
      element.bind('submit', function(event){ me.onSubmit(event) });
    },

    isEnabled: function() {
      return this._enabled;
    },

    setEnabled: function(enabled) {
      enabled = !!enabled;

      if (this._enabled === enabled)
        return;

      this._enabled = enabled;
      for (var i = 0, length = this._fields.length; i < length; i++) {
        var field = this._fields[i];
        field.setEnabled(enabled);
      }
    },

    onSubmit: function(event) {
      event.preventDefault();
      if (this._enabled)
        this.trigger('submit');
    },

    addField: function(field) {
      var lastField = this._fields[this._fields.length-1];
      this._fields.push(field);

      field.setEnabled(this._enabled);

      var wrapper = $('<div class="field"></div>');

      if (lastField)
        wrapper.insertAfter(lastField.get('element').parent());
      else
        this.prependElement(wrapper);

      field.appendTo(wrapper);
      this.registerChildWidget(field);
    },

    removeField: function(field) {
      this._fields = wesabe.lang.array.minus(this._fields, [field]);
      field.remove();
      this.unregisterChildWidget(field);
    },

    clearFields: function() {
      for (var field; field = this._fields.shift();)
        field.remove(), this.unregisterChildWidget(field);
    },

    getFieldValues: function() {
      var result = {};

      for (var i = 0, length = this._fields.length; i < length; i++) {
        var field = this._fields[i];
        result[field.get('name')] = field.get('value');
      }

      return result;
    },

    focus: function() {
      var firstField = this._fields[0];
      if (firstField) firstField.focus();
    }
  });
});

/**
 * Wraps a.button elements, providing a "click" event and other conveniences.
 */
wesabe.$class('wesabe.views.widgets.Button', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  /** @const */ $class.COLORS = ['red', 'green', 'orange', 'blue'];
  /** @const */ $class.DISABLED_COLOR = 'gry';
  /** @const */ $class.SELECTED_CLASS = 'on';

  $.extend($class.prototype, {
    /**
     * Value of the button. Used with {ButtonGroup}s to allow
     * referring to specific buttons by value rather than by reference.
     */
    value: null,

    /**
     * Text of the button.
     *
     * @type {string}
     */
    text: null,

    /**
     * true if this button responds to clicks, false otherwise.
     *
     * @type {boolean}
     */
    enabled: true,

    /**
     * The color of this button. It can be one of {wesabe.views.widgets.Button.COLORS}.
     *
     * @type {string}
     */
    color: null,

    _textElement: null,

    init: function(element, value) {
      var me = this;

      if (!wesabe.isJQuery(element))
        value = element, element = null;

      if (!element)
        element = $('<a class="button green"><span></span></a>');

      $super.init.call(me, element);

      // read the existing text
      me._textElement = element.children('span');
      me.text = me._textElement.text();

      // set the value
      me.value = value;

      // figure out what color it should be
      for (var i = $class.COLORS.length; i--;) {
        if (element.hasClass($class.COLORS[i])) {
          me.color = $class.COLORS[i];
          break;
        }
      }

      // watch for clicks
      element.click(function(event){ me.onClick(event) });
    },

    /**
     * Handles click DOM events on the wrapped button element.
     *
     * @param {!event} event
     * @private
     */
    onClick: function(event) {
      // prevent "#" from sneaking into the url
      event.preventDefault();

      // don't do anything if we're disabled
      if (!this.get('enabled'))
        return;

      // notify listeners of the click
      this.trigger('click');
    },

    /**
     * Sets whether or not this button responds to clicks, greying it out if
     * it is disabled.
     *
     * @param {!boolean} enabled
     */
    setEnabled: function(enabled) {
      if (this.enabled === enabled)
        return;

      this.enabled = enabled;
      if (this.color) {
        this.get('element')
          .addClass(enabled ? this.color : $class.DISABLED_COLOR)
          .removeClass(enabled ? $class.DISABLED_COLOR : this.color);
      }
    },

    setColor: function(color) {
      if (this.color === color)
        return;

      this.get('element')
        .removeClass(this.color)
        .addClass(color);
      this.color = color;
    },

    /**
     * Returns true if this button is selected.
     *
     * @return {boolean}
     */
    selected: function() {
      return this.get('element').hasClass($class.SELECTED_CLASS);
    },

    /**
     * Sets whether or not this button is selected.
     *
     * @param {!boolean} selected
     */
    setSelected: function(selected) {
      if (this.get('selected') !== selected)
        this.get('element').toggleClass($class.SELECTED_CLASS);
    },

    /**
     * Sets the text of this button.
     *
     * @param {!string} text
     */
    setText: function(text) {
      if (this.text === text)
        return;

      this.text = text;
      this._textElement.text(text);
    }
  });

  $.extend($class, {
    withText: function(text) {
      var button = new this();
      button.set('text', text);
      return button;
    }
  });
});

/**
 * Manages a group of toggle buttons where only one can be selected at a time.
 */
wesabe.$class('wesabe.views.widgets.ButtonGroup', function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _buttons: null,
    _selectedButton: null,
    _delegate: null,

    init: function(buttons, delegate) {
      var self = this;
      this._delegate = delegate;

      this._buttons = [];
      var elements = [];
      for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        elements.push(button.get('element'));
        button.bind('click', function(){ self.onButtonClick(this) });
        this._buttons.push(button);
        if (button.get('selected'))
          this._selectedButton = button;
      }
    },

    onButtonClick: function(button) {
      this.selectButton(button);

      if (this._delegate && this._delegate.onSelectionChange)
        this._delegate.onSelectionChange(this, button);
    },

    getButton: function(index) {
      return this._buttons[index];
    },

    selectButton: function(button) {
      if (button === this._selectedButton)
        return;

      this._selectedButton = button;
      for (var i = this._buttons.length; i--; ) {
        var b = this._buttons[i];
        b.set('selected', b === button);
      }
    },

    selectButtonByValue: function(value) {
      for (var i = this._buttons.length; i--; ) {
        if (this._buttons[i].get('value') === value) {
          this.selectButton(this._buttons[i]);
          break;
        }
      }
    }
  });
});

/**
 * Wraps an element containing optionally-formatted plain text.
 */
wesabe.$class('wesabe.views.widgets.Label', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    value: null,

    _formatter: null,
    _textElement: null,

    init: function(element, formatter) {
      if (!wesabe.isJQuery(element))
        formatter = element, element = null;

      if (!element)
        element = $('<label></label>');

      $super.init.call(this, element);
      this.value = element.text();
      this._formatter = formatter;
      this._textElement = element.find('.text-content');
      if (!this._textElement.length) this._textElement = element;

      this.addClassName('field-title');
    },

    setValue: function(value) {
      if (this.value === value)
        return;

      this.value = value;
      this._redraw();
    },

    getFormatter: function() {
      return this._formatter;
    },

    setFormatter: function(formatter) {
      this._formatter = formatter;
      this._redraw();
    },

    associateWithField: function(field) {
      if (!field.get('id'))
        field.set('id', wesabe.uniqueId());
      this.get('element').attr('for', field.get('id'));
    },

    _redraw: function() {
      var textValue = this._formatter ? this._formatter.format(this.value) : this.value,
          extraValue;

      if ($.isArray(textValue))
        extraValue = textValue[1], textValue = textValue[0];

      this._textElement.text(textValue);
      if (extraValue)
        this._textElement.append($('<span></span>').text(extraValue));
    }
  });
});

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

/**
 * Wraps a dialog and provides functionality common to all dialogs.
 */
wesabe.$class('wesabe.views.widgets.Dialog', wesabe.views.widgets.Container, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.array
  var array = wesabe.lang.array;

  $.extend($class, {
    _dialogStack: [],
    _keystrokesEnabled: true,
    _mouseDownFirstResponder: null,

    /**
     * Sets {dialog} as the one receiving global keyboard events.
     */
    makeFirstResponder: function(dialog) {
      $class._dialogStack = [dialog].concat(array.minus($class._dialogStack, [dialog]));
    },

    /**
     * Removes {dialog} from the list of possible responders.
     */
    removeFromResponders: function(dialog) {
      $class._dialogStack = array.minus($class._dialogStack, [dialog]);
    },

    /**
     * Gets the {Dialog} that should be receiving all global keyboard events.
     */
    firstReponder: function() {
      return $class._dialogStack[0];
    },

    /**
     * Hides all visible dialogs except {dialogToRemainVisible}.
     */
    hideExcept: function(dialogToRemainVisible) {
      var items = $class._dialogStack;

      for (var i = items.length; i--;)
        if (items[i] !== dialogToRemainVisible)
          items[i].hide();

      $class._dialogStack = [dialogToRemainVisible];
    },

    /**
     * Returns true if all dialogs should ignore keystrokes, false otherwise.
     *
     * @return {boolean}
     */
    keystrokesEnabled: function() {
      return this._keystrokesEnabled;
    },

    /**
     * Sets whether or not to watch keystrokes to trigger events. This is
     * useful for widgets which may want to consume all the keystrokes, such as
     * an autocompleter.
     *
     * @param {!boolean} keystrokesEnabled
     */
    setKeystrokesEnabled: function(keystrokesEnabled) {
      this._keystrokesEnabled = keystrokesEnabled;
    },

    /**
     * Handlers to delegate events as higher-level events to the first responder.
     */

    onKeyDown: function(event) {
      var me = $class,
          firstResponder = me.firstReponder();

      if (!me._keystrokesEnabled || !firstResponder)
        return;

      // call the first responder's keydown handler if it has one
      if ($.isFunction(firstResponder.onKeyDown)) {
        firstResponder.onKeyDown(event);
        if (event.isPropagationStopped())
          return;
      }

      switch (event.which) {
        case 27 /*esc*/:
          firstResponder.onCancel();
          event.preventDefault();
          event.stopPropagation();
          break;
        case 13 /*enter*/:
          firstResponder.onConfirmCheckingForDisabled();
          event.preventDefault();
          event.stopPropagation();
          break;
      }
    },

    onMouseDown: function(event) {
      $class._mouseDownFirstResponder = $class.firstReponder();
    },

    onMouseUp: function(event) {
      var me = $class, firstResponder = me._mouseDownFirstResponder;

      if (!firstResponder)
        return;

      me._mouseDownFirstResponder = null;
      var el = firstResponder.get('element')[0], target = event.target;

      while (target)
        if (target === el) return;
        else target = target.parentNode;

      firstResponder.onBlur(event);
    }
  });

  $.extend($class.prototype, {
    _modal: false,
    _confirmButton: null,
    _cancelButton: null,

    init: function(element) {
      $super.init.call(this, element);

      var me = this;

      element = this.get('element');
      me._confirmButton = new $package.Button(element.find('.button.confirm'));
      me._confirmButton.bind('click', function(event){ me.onConfirmCheckingForDisabled(event) });
      me._cancelButton = new $package.Button(element.find('.button.cancel'));
      me._cancelButton.bind('click', function(event){ me.onCancel(event) });

      element.click(function(event){ me.onClick(event) });
    },

    isModal: function() {
      return this._modal;
    },

    buttonsDisabled: function() {
      return !this._confirmButton.get('enabled');
    },

    setButtonsDisabled: function(buttonsDisabled) {
      if (this.get('buttonsDisabled') === buttonsDisabled)
        return;

      this._confirmButton.set('enabled', !buttonsDisabled);
      this._cancelButton.set('enabled', !buttonsDisabled);
    },

    onClick: function(event) {
      this.makeFirstResponder();
      event.stopPropagation();
    },

    onWillShow: function(callback) {
      // does nothing by default -- change this behavior in subclasses
    },

    onDidShow: function(callback) {
      if (callback)
        callback(this);
    },

    onBlur: function(event) {
      // does nothing by default -- change this behavior in subclasses
    },

    onCancel: function(event) {
      if (this.isModal())
        this.hideModal();
      else
        this.hide();
    },

    onConfirm: function(event) {
      // TODO: implement in subclasses
    },

    onConfirmCheckingForDisabled: function(event) {
      if (this.get('buttonsDisabled'))
        return;
      this.onConfirm(event);
    },

    makeFirstResponder: function() {
      $class.makeFirstResponder(this);
    },

    showWithOthers: function() {
      this._modal = false;
      this.get('element').fadeIn();
      this.makeFirstResponder();
    },

    show: function(callback) {
      var me = this;

      me._modal = false;
      $class.hideExcept(me);
      me.makeFirstResponder();
      me.onWillShow(callback);
      me.get('element').fadeIn('normal', function(){ me.onDidShow(callback) })
        .addClass('visible');
    },

    showModal: function(callback) {
      var me = this;

      me._modal = true;
      $class.hideExcept(me);
      me.makeFirstResponder();

      this.onWillShow(callback);
      if ($.support.goodStackingModel()) {
        var mask = $("<div id='modal-mask'></div>")
          .appendTo('body');

        mask
          .css("height", $(document).height()+'px')
          .css("width", $(document).width()+'px')
          .show()
          .fadeTo("fast", 0.4);

        // Clicking on the mask removes it and hides the element
        mask.one("click", function(){ me.hideModal(); });
      }

       // Index the element on top of the mask and fade in
       me.get('element')
        .css("z-index", "1001")
        .fadeIn('normal', function(){ me.onDidShow(callback) })
        .addClass('visible');
    },

    hide: function(callback) {
      $class.removeFromResponders(this);
      if (this.get('visible'))
        this.get('element').fadeOut(function(){ $(this).removeClass('visible'); if (callback) callback() });
      else if (callback)
        callback();
    },

    hideModal: function(callback) {
      $class.removeFromResponders(this);

      $('#modal-mask').fadeOut("fast", function() {
        $(this).remove();
      });
      if (this.get('visible'))
        this.get('element').fadeOut(function(){ $(this).removeClass('visible'); if (callback) callback() });
      else if (callback)
        callback();
    },

    toggle: function() {
      if (this.get('visible'))
        this.hide();
      else
        this.show();
    },

    remove: function() {
      var me = this, args = arguments;

      me.hide(function() {
        $super.remove.apply(me, args);
      });
    }
  });

  $(document)
    .bind('keydown',   $class.onKeyDown)
    .bind('mousedown', $class.onMouseDown)
    .bind('mouseup',   $class.onMouseUp);
});

/**
 * Manages a notification bubble.
 */
wesabe.$class('wesabe.views.widgets.Notification', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $class.STYLES = ['error', 'success', 'maintenance'];

  $.each($class.STYLES, function(i, style) {
    $class['with'+style.substring(0,1).toUpperCase()+style.substring(1)+'Style'] = function() {
      var notification = new this();
      notification.setStyle(style);
      return notification;
    };
  });

  $.extend($class.prototype, {
    _titleElement: null,
    _titleText: null,
    _messageElement: null,
    _messageText: null,
    _style: null,

    init: function(elementOrStyle) {
      var element, style;

      if (typeof elementOrStyle == 'string')
        style = elementOrStyle;
      else
        element = elementOrStyle;

      if (!element) {
        element = $('<div class="notification">'+
                      '<div class="top">'+
                        '<div class="right">'+
                          '<p class="title"></p>'+
                          '<p class="message small"></p>'+
                        '</div>'+
                      '</div>'+
                      '<div class="bottom"><div class="right"></div></div>'+
                    '</div>');
      }

      $super.init.call(this, element);

      this._titleElement = element.find('.title');
      this._titleText = this._titleElement.text();
      this._messageElement = element.find('.message');
      this._messageText = this._messageElement.text();

      for (var i = 0, length = $class.STYLES.length; i < length; i++) {
        if (element.hasClass($class.STYLES[i])) {
          this._style = $class.STYLES[i];
          break;
        }
      }

      if (style)
        this.setStyle(style);
    },

    getTitleText: function() {
      return this._titleText;
    },

    setTitleText: function(text) {
      if (text === this._titleText)
        return;

      this._titleElement.text(text);
   },

    getMessageText: function() {
      return this._messageText;
    },

    setMessageText: function(text) {
      if (text === this._messageText)
        return;

      this._messageElement.text(text);
    },

    getStyle: function() {
      return this._style;
    },

    setStyle: function(style) {
      if (this._style === style)
        return;

      for (var i = 0, length = $class.STYLES.length; i < length; i++)
        this.removeClassName($class.STYLES[i]);

      this._style = style;
      this.addClassName(style);
    },

    showWithTitleAndMessage: function(title, message) {
      this.setTitleText(title);
      this.setMessageText(message);
      this.setVisible(true);
    }
  });
});

/**
 * Provides a base class for anything wrapping a text input.
 */
wesabe.$class('wesabe.views.widgets.BaseField', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $class.DOM_EVENT_MAP = {
    keydown: 'onKeyDown', keypress: 'onKeyPress', keyup: 'onKeyUp',
    blur: 'onBlur', focus: 'onFocus',
    change: 'onChange', pollingchange: 'onPollingChange'};

  $.extend($class.prototype, {
    _value: null,
    _changeWatcher: null,

    init: function(element, delegate) {
      var me = this;

      if (!element)
        element = $('<input type="text">');

      $super.init.call(me, element);

      // bind the events that subclasses or delegates declare themselves interested in
      var delegates = [me];
      if (delegate) delegates.push(delegate);

      var domBindings = {};

      $.each($class.DOM_EVENT_MAP, function(key, method) {
        domBindings[method] = 0;
        $.each(delegates, function(i, d) {
          if (d[method]) {
            element.bind(key, function(event){ d[method].call(d, event, me) });
            domBindings[method]++;
          }
        });
      });

      if (domBindings.onPollingChange > 0)
        this._startWatchingForChanges();

      element.attr('autocomplete', 'off');
    },

    value: function() {
      return this.get('element').val();
    },

    setValue: function(value) {
      this.get('element').val(value);
    },

    name: function() {
      return this.get('element').attr('name');
    },

    setName: function(name) {
      this.get('element').attr('name', name);
    },

    isEnabled: function() {
      return !this.get('element').attr('disabled');
    },

    setEnabled: function(enabled) {
      this.get('element').attr('disabled', !enabled);
      if (!enabled)
        this.blur();
    },

    clear: function() {
      this.get('element').val('');
    },

    focus: function() {
      var element = this.get('element');
      if (element.length) element[0].focus();
    },

    blur: function() {
      this.get('element').blur();
    },

    clearAndBlur: function() {
      this.clear();
      this.blur();
    },

    isEmpty: function() {
      return !this.get('element').val();
    },

    selectAllAndFocus: function() {
      var element = this.get('element');
      element.caret(0, element.val().length);
      this.focus();
    },

    _startWatchingForChanges: function(msToWait) {
      var me = this;
      me._value = me.get('value');
      (function() {
        if (me._value !== me.get('value')) {
          me._value = me.get('value');
          me.get('element').trigger('pollingchange');
        }
        me._changeWatcher = setTimeout(arguments.callee, msToWait || 50);
      })();
    },

    _stopWatchingForChanges: function() {
      clearTimeout(this._changeWatcher);
    },

    destroy: function() {
      this._stopWatchingForChanges();
      $super.destroy.apply(this, arguments);
    }
  });
});

/**
 * Provides autocompleting functionality to fields via YUI's Autocompleter.
 */
wesabe.$class('wesabe.views.widgets.AutocompleterField', wesabe.views.widgets.BaseField, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.number
  var number = wesabe.lang.number;
  // import wesabe.lang.string
  var string = wesabe.lang.string;

  $.extend($class.prototype, {
    /**
     * The YUI autocompleter instance.
     *
     * @private
     */
    _autocompleter: null,

    _wasContainerOpen: false,
    _lastKeyPressKeyCode: null,
    _dataSource: null,
    _matchMultiple: true,

    init: function(element, completions, delegate) {
      var me = this;

      $super.init.call(me, element, delegate);

      // YUI wants a container for the autocomplete, so create one
      var container = $("<div></div>"),
          width = element.css('width');
      // explicitly set the container width to that of the element
      // assumes width and padding are in px
      if (width) {
        width = getPixels(width);
        if (width > 0) {
          width += getPixels(element.css('padding-left')) + getPixels(element.css('padding-right'));
          container.css("width", width + "px");
        }
      }

      element.wrap(me.get('wrapperElement'));
      element.after(container);

      me._dataSource = new YAHOO.util.LocalDataSource([]);
      var autocompleter = me._autocompleter = new YAHOO.widget.AutoComplete(element[0], container[0], me._dataSource, {
        queryDelay: 0,
        maxResultsDisplayed: 10,
        queryMatchContains: false,
        delimChar: me.get('delimChar'),
        doubleQuoteOverrides: true,
        doubleQuoteResultsWithSpaces: true,
        useIFrame: $.browser.msie && $.browser.version == "6.0"
      });

      autocompleter.containerExpandEvent.subscribe(me.onShowAutocompleter, me, true);
      autocompleter.containerCollapseEvent.subscribe(me.onHideAutocompleter, me, true);
      if (completions)
        me.setCompletions(completions);
      me.registerChildWidget(autocompleter);

      function getPixels(str) {
        return number.parse(str.replace('px',''));
      }
      // get references to whatever descendents of element you need
    },

    /**
     * Gets a wrapper element for the autocompleter.
     *
     * @return {jQuery}
     */
    wrapperElement: function() {
      return $('<div></div>');
    },

    /**
     * Returns the array of completions available to this autocompleter.
     *
     * @return {Array.<string>}
     */
    completions: function() {
      return this._dataSource && this._dataSource.liveData;
    },

    /**
     * Sets the completions to use in the autocompleter.
     *
     * @param {!Array.<string>} completions
     */
    setCompletions: function(completions) {
      if (this._dataSource)
        this._dataSource.liveData = completions;
    },

    /**
     * Returns true if this autocompleter will autocomplete more than one item,
     * false otherwise.
     *
     * @return {boolean}
     */
    doesMatchMultiple: function() {
      return this._matchMultiple;
    },

    /**
     * Sets whether or not to allow multiple matches.
     *
     * @param {!boolean} matchMultiple
     */
    setMatchMultiple: function(matchMultiple) {
      this._matchMultiple = matchMultiple;
      if (this._autocompleter)
        this._autocompleter.delimChar = this.get('delimChar');
    },

    /**
     * Gets the character(s) to use as delimiters, if any.
     *
     * @return {string|Array.<string>}
     * @private
     */
    _delimChar: function() {
      return this._matchMultiple ? [' ', ','] : null;
    },

    /**
     * Called when a keydown event is fired in the autocompleter textbox.
     *
     * @param {event} event
     * @protected
     */
    onKeyDown: function(event) {
      this._wasContainerOpen = this._autocompleter.isContainerOpen();
      if (!this._wasContainerOpen)
        wesabe.views.widgets.Dialog.setKeystrokesEnabled(true);
    },

    /**
     * Called when a keypress event is fired in the autocompleter textbox.
     *
     * @param {event} event
     * @protected
     */
    onKeyPress: function(event) {
      this._lastKeyPressKeyCode = event.which;
    },

    /**
     * Called when a keyup event is fired in the autocompleter textbox.
     *
     * @param {event} event
     * @protected
     */
    onKeyUp: function() {
      // if the autocompleter was hidden as part of the keypress event cycle
      // then call the onHideAutocompleter callback which was put off before
      if (this._wasContainerOpen && !this._autocompleter.isContainerOpen()) {
        this._wasContainerOpen = false;
        this.onHideAutocompleter();
      }
    },

    onBlur: function() {
      // if the user tabbed out of the field then the onKeyUp above won't be
      // called, so here we make sure that the onHideAutocompleter is called
      this._wasContainerOpen = false;
      this.onHideAutocompleter();
    },

    /**
     * Sets the footer to be a tip for the user. This will be a div with class
     * yui-ac-tip contained within yui-ac-ft.
     *
     * @param {!string} text
     */
    setTip: function(text) {
      this.set('footer',
        '<div class="yui-ac-tip">'+
          '<strong>Tip:</strong> '+
          string.escapeHTML(text)+
        '</div>');
    },

    /**
     * Sets the footer on the wrapped autocompleter to the given {html}.
     *
     * @param {?string} html
     */
    setFooter: function(html) {
      this._autocompleter.setFooter(html);
    },

    /**
     * Called when the autocompleter is shown.
     */
    onShowAutocompleter: function() {
      wesabe.views.widgets.Dialog.setKeystrokesEnabled(false);
    },

    /**
     * Called when the autocompleter is hidden, which in the case of pressing
     * ESC is during a keydown event. Our {#onKeyDown} callback should
     * happen first, so we record whether we were autocompleting by setting
     * {_wasContainerOpen}.
     */
    onHideAutocompleter: function() {
      // delay enabling keystrokes if the autocompleter was hidden as a result
      // of a keystroke (i.e. ESC) until keyup or blur
      if (this._wasContainerOpen)
        return;

      wesabe.views.widgets.Dialog.setKeystrokesEnabled(true);
    },

    /**
     * Gets the value of the wrapped input.
     *
     * @return {string}
     */
    value: function() {
      return this.get('element').val();
    },

    /**
     * Sets the value of the wrapped input.
     *
     * @param {!string} value
     */
    setValue: function(value) {
      this.get('element').val(value);
    }
  });
});

$.widget( "ui.combobox", {
  _create: function() {
    var self = this,
        select = this.element.hide(),
        select_el = select.get(0),
        selected = $(select_el.options[select_el.selectedIndex]),
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

  destroy: function() {
    this.input.remove();
    this.button.remove();
    this.element.show();
    $.Widget.prototype.destroy.call( this );
  }
});

/**
 * Wraps a drop-down <select> element.
 */
wesabe.$class('wesabe.views.widgets.DropDownField', wesabe.views.widgets.BaseField, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    /**
     * Text to use as a placeholder/call to action for the user.
     *
     * @type {string}
     */
    placeholderText: null,

    /**
     * @private
     */
    _placeholderOption: null,

    init: function(element, delegate) {
      var me = this;

      if (!delegate) {
        if (element && wesabe.isJQuery(element)) {
          // got an element, just pass it along
        } else {
          // got a delegate
          delegate = element;
          element = null;
        }
      }

      if (!element)
        element = $('<select></select>');

      $super.init.call(me, element, delegate);
    },

    addOption: function(key, value) {
      this.get('element').append(new Option(key, value));
    },

    clearOptions: function() {
      var options = this.get('element').children();

      if (this._placeholderOption)
        options = options.not(this._placeholderOption);

      options.empty();
    },

    setPlaceholderText: function(placeholderText) {
      if (placeholderText == this.placeholderText)
        return;

      this.placeholderText = placeholderText;

      if (this.placeholderText && !this._placeholderOption) {
        this._placeholderOption = $(new Option('', ''));
        this.get('element').prepend(this._placeholderOption);
      }

      if (!this.placeholderText && this._placeholderOption)
        this._placeholderOption.remove();
      else
        this._placeholderOption.text(this.placeholderText);
    }
  });
});

/**
 * Wraps a state drop-down <select> element.
 */
wesabe.$class('views.widgets.StateDropDownField', wesabe.views.widgets.DropDownField, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    init: function(element, delegate) {
      var me = this;

      $super.init.call(me, element, delegate);

      var states = wesabe.data.states.get(),
          length = states.length;

      for (var i = 0; i < length; i++) {
        var state = states[i];
        this.addOption(state[0], state[1]);
      }

      this.setPlaceholderText('-- select state --');
    }
  });
});

/**
 * Wraps an anchor to add a history entry using the jQuery history plugin.
 */
wesabe.$class('wesabe.views.widgets.HistoryLink', wesabe.views.widgets.Label, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    uri: null,
    text: null,

    init: function(element, uri, formatter) {
      $super.init.call(this, element, formatter);

      var me = this;

      element.click(function(event){ me.onClick(event) });
      if (uri) me.set('uri', uri);
      else me.uri = element.attr('href');
    },

    /**
     * Handles clicks on this link by adding an entry to the history.
     */
    onClick: function(event) {
      this.trigger('click', [event, this]);
      if (event.isPropagationStopped())
        return;

      // don't let clicks do anything when there's no URI
      if (!this.get('uri')) {
        event.preventDefault();
        return;
      }

      // if the ctrl or cmd key is down, just let the browser do its thing
      if (event.ctrlKey || event.metaKey)
        return;

      History.pushState(null, null, this.get('uri'));
      event.preventDefault();
    },

    /**
     * Sets the uri for the link.
     *
     * @param {string} uri The anchor.
     */
    setURI: function(uri) {
      if (this.uri === uri)
        return;

      this.uri = uri;
      this.get('element').attr('href', uri || '');
    },

    /**
     * Alias for {#value}
     *
     * @return {object}
     */
    text: function() {
      return this.get('value');
    },

    /**
     * Alias for {#setValue}.
     *
     * @param {!object} text
     */
    setText: function(text) {
      this.set('value', text);
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

/**
 * Manages a tag link with optional split.
 */
wesabe.$class('wesabe.views.widgets.transactions.TagLink', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.number
  var number = wesabe.lang.number;

  $.extend($class.prototype, {
    /**
     * The name of the tag being displayed.
     *
     * @type {string}
     */
    name: null,

    /**
     * The amount of the transaction that should count toward this tag.
     *
     * @type {object}
     */
    splitAmount: null,

    _nameLink: null,
    _splitElement: null,

    init: function(element) {
      $super.init.call(this, element);

      this._nameLink = new wesabe.views.widgets.HistoryLink(element.children('.tag-name'));
      this.registerChildWidget(this._nameLink);
      this._splitElement = element.children('.split-amount');
    },

    /**
     * Sets the name of the tag being displayed and redraws.
     *
     * @param {!string} name The name of the tag being displayed.
     */
    setName: function(name) {
      if (name === this.name)
        return;

      this.name = name;
      this._nameLink.setText(name);
      this._nameLink.set('uri', this.get('uri'));
    },

    /**
     * Gets the URI of the tag being displayed.
     *
     * @return {string}
     */
    uri: function() {
      return "/tags/" + encodeURIComponent(this.get('name'));
    },

    /**
     * Sets the split amount and redraws.
     */
    setSplitAmount: function(splitAmount) {
      if (splitAmount === this.splitAmount)
        return;

      this.splitAmount = splitAmount;

      var display = '';
      if (splitAmount && splitAmount.value)
        splitAmount = splitAmount.value;
      if (splitAmount)
        display = ':'+Math.abs(number.parse(splitAmount));
      this._splitElement.text(display);
    }
  });
});

/**
 * Manages a list of tags attached to a transaction.
 */
wesabe.$class('wesabe.views.widgets.transactions.TagLinkList', wesabe.views.widgets.BaseListWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _template: null,

    init: function(element) {
      $super.init.call(this, element);

      var template = element.children('.template');
      this._template = template.clone().removeClass('template');
      template.remove();
    },

    /**
     * Redraws the tag links based on the tag name/split data in {tags}.
     *
     * @param {Array.<object>} tags A list of objects with "name" and "amount".
     */
    setTags: function(tags) {
      var items = [];

      for (var i = tags.length; i--;) {
        var tag = tags[i], item = this.getItemByName(tag.name);

        if (!item)
          item = new $package.TagLink(this._template.clone());

        item.set('name', tag.name);
        item.set('splitAmount', tag.amount);
        items.unshift(item);
      }

      this.set('items', items);
    },

    /**
     * Gets a child tag link in the list by name.
     *
     * @param {!string} name The name of the tag whose link to get.
     * @return {TagLink}
     */
    getItemByName: function(name) {
      var items = this.get('items');

      for (var i = items.length; i--;)
        if (items[i].get('name') === name)
          return items[i];

      return null;
    }
  });
});

/**
 * Manages a set of currencies and includes a shared set for global use.
 */
wesabe.$class('data.currencies.CurrencySet', function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    /**
     * Currencies mapped by code.
     *
     * @type {object}
     */
    currencies: null,

    /**
     * Sorted array of currencies.
     *
     * @type {Array.<object>}
     */
    currencyList: function() {
      if (!this._currencyList) {
        var data = this._currencies, list = [];

        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            data[key].code = key;
            list.push(data[key]);
          }
        }

        this._currencyList = list.sort(function(a, b) {
          return (a.code < b.code) ? -1 :
                 (a.code > b.code) ?  1 :
                                      0;
        });
      }

      return this._currencyList;
    },

    /**
     * Sets the data behind this +CurrencySet+. It should be a map from symbol to
     * either an array of properties or an object literal.
     *
     * @param {!object} data
     */
    setCurrencies: function(data) {
      this.currencies = this._normalize(data);
      this.trigger('change', [this._currencies]);
    },

    /**
     * Normalizes the data format to be a map of currency symbol to an object description.
     *
     * @param {!object} data
     * @return {object} the given argument, +data+.
     */
    _normalize: function(data) {
      var row;
      for (var currency in data) {
        row = data[currency]
        if ($.isArray(row))
          data[currency] = {unit:row[0], separator:row[1], delimiter:row[2], precision:row[3], name:row[4]}
      }
      return data;
    }
  });

  $.extend($package, {
    sharedCurrencySet: new $class(),

    get: function() {
      return $package.sharedCurrencySet.get('currencies');
    },

    set: function(data) {
      $package.sharedCurrencySet.set('currencies', data);
    }
  });
});

// DO NOT EDIT THIS FILE
// This file is automatically generated by roll_assets.rake based on currency.rb.

wesabe.data.currencies.set({"XCD": ["$", ",", ".", 2, "East Caribbean dollar"], "USD": ["$", ".", ",", 2, "United States dollar"], "SAR": ["\ufdfc", ",", ".", 2, "Saudi riyal"], "RUB": ["\u0440\u0443\u0431", ",", ".", 2, "Russian ruble"], "NIO": ["C$", ",", ".", 2, "Nicaraguan c\u00f3rdoba"], "LAK": ["\u20ad", ",", ".", 2, "Lao kip"], "NOK": ["kr", ",", ".", 2, "Norwegian krone"], "OMR": ["\ufdfc", ",", ".", 3, "Omani rial"], "AMD": ["\u0564\u0580.", ",", ".", 2, "Armenian dram"], "CDF": ["F", ",", ".", 2, "Congolese franc"], "KPW": ["\u20a9", ".", ",", 2, "North Korean won"], "CNY": ["\u00a5", ",", ".", 2, "Chinese renminbi"], "KES": ["KSh", ",", ".", 2, "Kenyan shilling"], "ZWD": ["$", ",", ".", 2, "Zimbabwe dollar"], "PLN": ["z\u0142", ",", ".", 2, "Polish z\u0142oty"], "KHR": ["\u17db", ",", ".", 2, "Cambodian riel"], "MVR": ["Rf", ",", ".", 2, "Maldivian rufiyaa"], "GTQ": ["Q", ",", ".", 2, "Guatemalan quetzal"], "CLP": ["$", ",", ".", 0, "Chilean peso"], "INR": ["Rs", ".", ",", 2, "Indian rupee"], "BZD": ["BZ$", ",", ".", 2, "Belize dollar"], "MYR": ["RM", ".", ",", 2, "Malaysian ringgit"], "HKD": ["$", ".", ",", 2, "Hong Kong dollar"], "SEK": ["kr", ",", ".", 2, "Swedish krona"], "ROL": ["L", ",", ".", 2, "Romanian leu"], "COP": ["$", ",", ".", 2, "Colombian peso"], "DKK": ["kr", ",", ".", 2, "Danish krone"], "BYR": ["Br", ",", ".", 0, "Belarusian ruble"], "RON": ["L", ",", ".", 2, "Romanian new leu"], "MTL": ["\u20a4", ",", ".", 2, "Maltese lira"], "DZD": ["\u062f\u062c", ",", ".", 2, "Algerian dinar"], "BIF": ["FBu", ",", ".", 0, "Burundian franc"], "ARS": ["$", ",", ".", 2, "Argentine peso"], "GIP": ["\u00a3", ",", ".", 2, "Gibraltar pound"], "BOB": ["Bs.", ",", ".", 2, "Bolivian boliviano"], "XOF": ["CFA", ",", ".", 0, "West African CFA franc"], "STD": ["Db", ",", ".", 2, "S\u00e3o Tom\u00e9 and Pr\u00edncipe dobra"], "NGN": ["\u20a6", ".", ",", 2, "Nigerian naira"], "PGK": ["K", ",", ".", 2, "Papua New Guinean kina"], "AED": ["\u062f.\u0625", ",", ".", 2, "United Arab Emirates dirham"], "ERN": ["Nfk", ",", ".", 2, "Eritrean nakfa"], "MWK": ["MK", ",", ".", 2, "Malawian kwacha"], "CUP": ["$", ",", ".", 2, "Cuban peso"], "SKK": ["Sk", ",", ".", 2, "Slovak koruna"], "GMD": ["D", ",", ".", 2, "Gambian dalasi"], "TZS": ["TSh", ",", ".", 2, "Tanzanian shilling"], "CVE": ["Esc", ",", ".", 2, "Cape Verdean escudo"], "COU": ["$", ",", ".", 2, "Colombian Unidad de Valor Real"], "BTN": ["\u00a4", ",", ".", 2, "Bhutanese ngultrum"], "XAF": ["CFA", ",", ".", 0, "Central African CFA franc"], "UGX": ["USh", ",", ".", 2, "Ugandan shilling"], "SYP": ["S\u00a3", ",", ".", 2, "Syrian pound"], "MAD": ["\u062f.\u0645.", ",", ".", 2, "Moroccan dirham"], "MNT": ["\u20ae", ",", ".", 2, "Mongolian tugrug"], "LSL": ["M", ",", ".", 2, "Lesotho loti"], "TOP": ["T$", ",", ".", 2, "Tongan pa'anga"], "SHP": ["\u00a3", ",", ".", 2, "Saint Helena pound"], "RSD": ["\u0434\u0438\u043d.", ",", ".", 2, "Serbian dinar"], "HTG": ["G", ",", ".", 2, "Haitian gourde"], "MGA": ["\u00a4", ",", ".", 0, "Malagasy ariary"], "MZN": ["MTn", ",", ".", 2, "Mozambican metical"], "LVL": ["Ls", ",", ".", 2, "Latvian lats"], "FKP": ["\u00a3", ",", ".", 2, "Falkland Islands pound"], "BWP": ["P", ".", ",", 2, "Botswana pula"], "HNL": ["L", ",", ".", 2, "Honduran lempira"], "EUR": ["\u20ac", ",", " ", 2, "Euro"], "PYG": ["G", ",", ".", 0, "Paraguayan guaran\u00ed"], "EGP": ["\u00a3", ",", ".", 2, "Egyptian pound"], "CHF": ["CHF", ",", ".", 2, "Swiss franc"], "ILS": ["\u20aa", ".", ",", 2, "Israeli new sheqel"], "LBP": ["\u0644.\u0644", ",", ".", 2, "Lebanese lira"], "ANG": ["\u0192", ",", ".", 2, "Netherlands Antillian guilder"], "KZT": ["\u3012", ",", ".", 2, "Kazakhstani tenge"], "WST": ["WS$", ",", ".", 2, "Samoan tala"], "GYD": ["$", ",", ".", 2, "Guyanese dollar"], "THB": ["\u0e3f", ".", ",", 2, "Thai bhat"], "GHC": ["\u00a2", ",", ".", 2, "Ghanaian cedi"], "NPR": ["\u20a8", ",", ".", 2, "Nepalese rupee"], "KMF": ["\u00a4", ",", ".", 0, "Comorian franc"], "IRR": ["\ufdfc", ",", ".", 2, "Iranian rial"], "VEB": ["Bs", ",", ".", 2, "Venezuelan bol\u00edvar"], "UYU": ["$", ",", ".", 2, "Uruguayan peso"], "SRD": ["$", ",", ".", 2, "Surinamese dollar"], "JPY": ["\u00a5", ".", ",", 0, "Japanese yen"], "BRL": ["R$", ",", ".", 2, "Brazilian real"], "TMM": ["m", ",", ".", 2, "Turkmenistani manat"], "SZL": ["E", ",", ".", 2, "Swazi lilangeni"], "MOP": ["MOP$", ",", ".", 2, "Macanese pataca"], "BMD": ["BD$", ",", ".", 2, "Bermuda dollar"], "XPF": ["F", ",", ".", 0, "CFP franc"], "ETB": ["Br", ",", ".", 2, "Ethiopian birr"], "JOD": ["\u00a4", ",", ".", 3, "Jordanian dinar"], "IDR": ["Rp", ",", ".", 2, "Indonesian rupiah"], "EEK": ["KR", ",", " ", 2, "Estonian kroon"], "MDL": ["\u00a4", ",", ".", 2, "Moldovan leu"], "MRO": ["UM", ",", ".", 2, "Mauritanian ouguiya"], "YER": ["\ufdfc", ",", ".", 2, "Yemeni rial"], "SDD": ["\u00a3Sd", ",", ".", 2, "Sudanese dinar"], "BAM": ["KM", ",", ".", 2, "Bosnia and Herzegovina convertible marks"], "AWG": ["\u0192", ",", ".", 2, "Aruban guilder"], "NZD": ["$", ".", ",", 2, "New Zealand dollar"], "PEN": ["S/.", ",", ".", 2, "Peruvian nuevo sol"], "VEF": ["BsF", ",", ".", 2, "Venezuelan bol\u00edvar fuerte"], "TRY": ["YTL", ",", ".", 2, "Turkish new lira"], "SLL": ["Le", ",", ".", 2, "Sierra Leonean leone"], "CYP": ["\u00a3", ",", ".", 2, "Cypriot pound"], "KYD": ["$", ",", ".", 2, "Cayman Islands dollar"], "AOA": ["Kz", ",", ".", 2, "Angolan kwanza"], "TND": ["\u062f.\u062a", ",", ".", 3, "Tunisian dinar"], "TJS": ["\u00a4", ",", ".", 2, "Tajikistani somoni"], "SGD": ["S$", ".", ",", 2, "Singapore dollar"], "SCR": ["SR", ",", ".", 2, "Seychellois rupee"], "LKR": ["\u20a8", ".", ",", 2, "Sri Lankan rupee"], "MXN": ["$", ",", ".", 2, "Mexican peso"], "LTL": ["Lt", ",", ".", 2, "Lithuanian litas"], "HUF": ["Ft", ",", " ", 2, "Hungarian forint"], "DJF": ["Fdj", ",", ".", 0, "Djiboutian franc"], "BSD": ["BS$", ",", ".", 2, "Bahamian dollar"], "GNF": ["FG", ",", ".", 0, "Guinea franc"], "ISK": ["kr", ",", ".", 2, "Icelandic kr\u00f3na"], "VUV": ["Vt", ",", ".", 0, "Vanuatu vatu"], "SDG": ["\u00a4", ",", ".", 2, "Sudanese pound"], "GEL": ["\u00a4", ",", ".", 2, "Georgian lari"], "FJD": ["FJ$", ",", ".", 2, "Fijian dollar"], "DOP": ["RD$", ",", ".", 2, "Dominican peso"], "MUR": ["\u20a8", ",", ".", 2, "Mauritian rupee"], "PHP": ["\u20b1", ".", ",", 2, "Philippine peso"], "MMK": ["K", ",", ".", 2, "Myanma kyat"], "KRW": ["\u20a9", ".", ",", 0, "South Korean won"], "LRD": ["L$", ",", ".", 2, "Liberian dollar"], "BBD": ["Bds$", ",", ".", 2, "Barbados dollar"], "ZMK": ["ZK", ",", ".", 2, "Zambian kwacha"], "ZAR": ["R", ",", ".", 2, "South African rand"], "VND": ["\u20ab", ",", ".", 2, "Vietnamese \u0111\u1ed3ng"], "UAH": ["\u20b4", ",", ".", 2, "Ukrainian hryvnia"], "IQD": ["\u0639.\u062f", ",", ".", 3, "Iraqi dinar"], "BGN": ["\u043b\u0432", ",", ".", 2, "Bulgarian lev"], "GBP": ["\u00a3", ".", ",", 2, "UK Pound sterling"], "KGS": ["\u00a4", ",", ".", 2, "Kyrgyzstani som"], "TTD": ["$", ",", ".", 2, "Trinidad and Tobago dollar"], "HRK": ["kn", ",", ".", 2, "Croatian kuna"], "RWF": ["RF", ",", ".", 0, "Rwandan franc"], "BHD": ["BD", ",", ".", 3, "Bahraini dinar"], "UZS": ["\u00a4", ",", ".", 2, "Uzbekistani som"], "TWD": ["$", ".", ",", 2, "New Taiwan dollar"], "PKR": ["Rs.", ".", ",", 2, "Pakistani rupee"], "CRC": ["\u20a1", ",", ".", 2, "Costa Rican col\u00f3n"], "AUD": ["$", ".", ",", 2, "Australian dollar"], "MKD": ["\u00a4", ",", ".", 2, "Macedonian denar"], "LUF": ["LD", ",", ".", 3, "Libyan dinar"], "AFN": ["\u00a4", ",", ".", 2, "Afghanistan afghani"], "NAD": ["N$", ",", ".", 2, "Namibian dollar"], "BDT": ["\u09f3", ",", ".", 2, "Bangladeshi taka"], "AZN": ["m", ",", ".", 2, "Azerbaijanian manat"], "CZK": ["K\u010d", ",", ".", 2, "Czech koruna"], "SOS": ["So. Sh.", ",", ".", 2, "Somali shilling"], "QAR": ["\ufdfc", ",", ".", 2, "Qatari riyal"], "PAB": ["PAB", ",", ".", 2, "Panamanian balboa"], "MXV": ["$", ",", ".", 2, "Mexican Unidad de Inversion"], "SBD": ["SI$", ".", ",", 2, "Solomon Islands dollar"], "ALL": ["\u00a4", ",", ".", 2, "Albanian lek"], "BND": ["$", ".", ",", 2, "Brunei dollar"], "JMD": ["$", ",", ".", 2, "Jamaican dollar"], "CAD": ["$", ".", ",", 2, "Canadian dollar"], "KWD": ["\u062f.\u0643", ",", ".", 3, "Kuwaiti dinar"]});

/**
 * Manages a list of states.
 */
wesabe.$class('data.states.StateSet', function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _states: null,

    get: function() {
      return this._states;
    },

    set: function(data) {
      this._states = data;
      this.trigger('change', [this._states]);
    }
  });

  $.extend($package, {
    sharedStateSet: new $class(),

    get: function() {
      return $package.sharedStateSet.get();
    },

    set: function(data) {
      $package.sharedStateSet.set(data);
    }
  });
});

// DO NOT EDIT THIS FILE
// This file is automatically generated by roll_assets.rake based on lib/constants.rb.

wesabe.data.states.set([["Alabama","AL"],["Alaska","AK"],["Arizona","AZ"],["Arkansas","AR"],["California","CA"],["Colorado","CO"],["Connecticut","CT"],["Delaware","DE"],["District Of Columbia","DC"],["Florida","FL"],["Georgia","GA"],["Hawaii","HI"],["Idaho","ID"],["Illinois","IL"],["Indiana","IN"],["Iowa","IA"],["Kansas","KS"],["Kentucky","KY"],["Louisiana","LA"],["Maine","ME"],["Maryland","MD"],["Massachusetts","MA"],["Michigan","MI"],["Minnesota","MN"],["Mississippi","MS"],["Missouri","MO"],["Montana","MT"],["Nebraska","NE"],["Nevada","NV"],["New Hampshire","NH"],["New Jersey","NJ"],["New Mexico","NM"],["New York","NY"],["North Carolina","NC"],["North Dakota","ND"],["Ohio","OH"],["Oklahoma","OK"],["Oregon","OR"],["Pennsylvania","PA"],["Rhode Island","RI"],["South Carolina","SC"],["South Dakota","SD"],["Tennessee","TN"],["Texas","TX"],["Utah","UT"],["Vermont","VT"],["Virginia","VA"],["Washington","WA"],["West Virginia","WV"],["Wisconsin","WI"],["Wyoming","WY"]]);

wesabe.provide('data.preferences', {
  get: function(key) {
    var value = $(this).kvo(key);
    switch (value) {
      case 'true': return true;
      case 'false': return false;
      default: return value;
    }
  },

  set: function(key, value) {
    if (typeof key == 'string') {
      $(this).kvo(key, value);
    } else if (key) {
      var kvpairs = key;
      for (key in kvpairs)
        this.set(key, kvpairs[key]);
    }
  },

  update: function(key, value) {
    // skip it if the value wouldn't change
    if (this.get(key) === value) return;

    var prefs = {};
    prefs[key] = value;
    this.set(key, value);
    $.put('/preferences', prefs);
  },

  hasFeature: function(feature) {
    var features = this.get('features');
    return features && features[feature];
  },

  // Special Cases

  defaultCurrency: function() {
    var defaultCurrency = this.get('default_currency');
    return defaultCurrency ? defaultCurrency.name : 'USD';
  }
});

/**
 * Provides a base class with all the basic functionality of a data source.
 */
wesabe.$class('wesabe.data.BaseDataSource', function($class) {
  // import jQuery as $
  var $ = jQuery;

  /**
   * Build an anonymous subclass of {BaseDataSource} with endpoint {uri}.
   * If {uri} is a function it will be executed each time it is used.
   */
  $class.dataSourceWithURI = function(uri) {
    return $.extend(new $class(), {
      sourceURI: uri
    });
  };

  $.extend($class.prototype, {
    /**
     * URI indicating what XHR endpoint to use.
     *
     * @type {String}
     */
    sourceURI: null,

    /**
     * The jQuery data type this data source should ask for.
     *
     * @type {String}
     */
    dataType: 'json',

    /**
     * The data retrieved from the server.
     */
    data: null,

    /**
     * true if requests to the same URL (including query params) will
     * be stored and retrieved from a cache.
     *
     * @type {boolean}
     */
    cachingEnabled: false,

    _cache: {},
    _loading: false,
    _data: null,
    _pollers: [],

    init: function() {
      // TODO: implement this in subclasses
    },

    /**
     * Requests data if there is no data already available. The passed
     * {callback} will be called in either case.
     */
    requestDataUnlessHasData: function(callback) {
      if (this.hasData()) {
        callback && callback(this.get('data'));
      } else {
        this.requestData(callback);
      }
    },

    /**
     * Requests data if there is no data already available. The passed
     * {callback} will be called in either case and subscribed to future
     * changes in data.
     */
    requestDataAndSubscribe: function(callback, context) {
      context = context || this;
      // subscribe the callback
      this.subscribe(callback, context);

      if (!this.hasData()) {
        // no data yet, ask for data and let the subscription handle callback
        this.requestData();
      } else {
        // we've already got the data, run the callback ourselves
        if (callback && callback.change)
          callback.change.call(context, this.get('data'));
        else if (callback)
          callback.call(context, this.get('data'));
      }
    },

    /**
     * Requests the data again, calling {callback} if one was given when the
     * new data is fetched. If a request is already in progress another one
     * will not be issued, but the callback will be queued with the
     * already-existing request.
     *
     * Returns the {XMLHTTPRequest} instance used to send the request.
     */
    requestData: function(callback, context) {
      context = context || this;
      if ($.isFunction(callback))
        $(this).one('change', function(_, data){ callback.call(context, data) });

      if (this.isLoading())
        return;

      var cachedData = this.getCache(this.get('requestOptions'));
      if (cachedData) this.set('data', cachedData);
      else return this._doBeginLoading();
    },

    /**
     * Returns the cached data given the jQuery ajax options.
     */
    getCache: function(options) {
      return this._cache[this._cacheKey(options)];
    },

    /**
     * Sets the cache given the jQuery ajax options.
     */
    setCache: function(options, data) {
      this._cache[this._cacheKey(options)] = data;
    },

    /**
     * Clears the entire cache for this data source, but not the currently
     * loaded data (i.e. calling {#get('data')} will still return data).
     */
    clearCache: function() {
      this._cache = {};
    },

    /**
     * Generates a cache key given the jQuery ajax options.
     *
     * @return {string}
     * @private
     */
    _cacheKey: function(options) {
      var key = options.url;

      if (options.data) {
        var data = $.param(options.data);
        key += ((key.indexOf('?') == -1) ? '?' : '&') + data;
      }

      return key;
    },

    /**
     * Returns true if this data source is requesting data from the server,
     * false otherwise.
     */
    isLoading: function() {
      return this._loading;
    },

    /**
     * Gets the default set of options to pass to {jQuery.ajax}.
     */
    requestOptions: function() {
      return {
        url: this.get('sourceURI'),
        dataType: this.get('dataType')
      };
    },

    /**
     * Begins loading the data. Override this method to make non-XHR sources.
     *
     * @private
     */
    _doBeginLoading: function() {
      var me = this,
          options = $.extend({
            success: function(data){ me.onDataLoaded(data, options) },
            error: function(){ me.onDataError(options) },
            complete: function(){ me.onAfterLoad(options) }
          }, me.get('requestOptions'));

      me.onBeforeLoad();
      return $.ajax(options);
    },

    /**
     * Called immediately before the data source begins loading new data.
     */
    onBeforeLoad: function() {
      $(this).trigger('beforeLoad');
      this._loading = true;
    },

    /**
     * Called immediately after the data source begins loading new data.
     */
    onAfterLoad: function() {
      this._loading = false;
      $(this).trigger('afterLoad');
    },

    /**
     * Handles incoming data from the server.
     *
     * @private
     */
    onDataLoaded: function(data, options) {
      this.set('data', data);
      if (this.get('cachingEnabled'))
        this.setCache(options, data);
    },

    /**
     * Handles errors in retrieving data from the server.
     *
     * @private
     */
    onDataError: function() {
      $(this).trigger('error');
    },

    /**
     * Called when the data changes.
     *
     * @private
     */
    onDataChanged: function() {
      $(this).trigger('change', [this.get('data')]);
    },

    /**
     * Sets the data to {data}.
     */
    setData: function(data) {
      this.data = data;
      this.onDataChanged();
    },

    /**
     * Returns true if this data source has data, false otherwise.
     */
    hasData: function() {
      return this.get('data') != null;
    },

    /**
     * Requests data every {duration} ms and calls {callback} with the result.
     * You may also call this function with only a duration.
     *
     * Returns a polling interval id.
     */
    startPoller: function(duration, callback) {
      if (typeof duration != 'number')
        throw new Error("Expected duration to be a number, got " + duration);

      var me = this,
          poller = {
            id: setInterval(function(){ me._doPoll(poller) }, duration),
            xhr: null,
            callback: callback
          };
      this._pollers.push(poller);
      this._doPoll(poller);
      return poller;
    },

    /**
     * Execute the polling request for {poller} if one isn't already running.
     *
     * @private
     */
    _doPoll: function(poller) {
      poller.xhr = poller.xhr || this.requestData(function(data) {
        poller.xhr = null;
        if (poller.callback) poller.callback(data);
      });
    },

    /**
     * Stops a polling interval by id.
     */
    stopPoller: function(poller) {
      // stop the poller
      clearInterval(poller.id);

      // cancel any requests that might be running or about to run
      try { poller.xhr && poller.xhr.abort() }
      catch (e) {}
      poller.xhr = null;

      // remove the poller from the list
      var length = this._pollers.length;
      while (length--) {
        if (this._pollers[length] === poller) {
          this._pollers[length] = this._pollers.pop();
          break;
        }
      }
    },

    /**
     * Stops all pollers set on this {CredentialDataSource}, preventing
     * all previously-registered polling.
     */
    stopAllPollers: function() {
      while (this._pollers.length)
        this.stopPoller(this._pollers.shift());
    }
  });
});

/**
 * Provides access to user accounts.
 */
wesabe.$class('wesabe.data.accounts.AccountDataSource', wesabe.data.BaseDataSource, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.data.preferences as prefs
  var prefs = wesabe.data.preferences;

  $.extend($class.prototype, {
    /**
     * Gets the default set of options to pass to {jQuery.ajax}.
     */
    requestOptions: function() {
      return $.extend($super.requestOptions.apply(this, arguments), {
        url: '/data/accounts/all/' + prefs.defaultCurrency(),
        data: {include_archived: true},
        cache: false
      });
    },

    /**
     * Sets the data for this {AccountDataSource}.
     */
    setData: function(data) {
      if (data) {
        var accounts = data.accounts,
            groups = data['account-groups'],
            accountLookup = {};

        for (var i = accounts.length; i--;)
          accountLookup[accounts[i].uri] = accounts[i];

        for (var i = groups.length; i--;) {
          var group = groups[i],
              groupAccounts = groups[i].accounts;
          group.key = group.uri.replace(/^.*\//, '');
          for (var j = groupAccounts.length; j--;)
            groupAccounts[j] = accountLookup[groupAccounts[j].uri];
        }
      }

      $super.setData.call(this, data);
    },

    /**
     * Returns account data for the account with URI {uri}, or null if
     * no such account can be found.
     */
    getAccountDataByURI: function(uri) {
      if (!this.hasData())
        return null;

      var accounts = this.get('data').accounts,
          length = accounts.length;

      while (length--)
        if (accounts[length].uri === uri)
          return accounts[length];

      return null;
    }
  });
  $package.sharedDataSource = new $class();
});

/**
 * Provides access to tag data over specific time ranges.
 */
wesabe.$class('wesabe.data.tags.TagDataSource',
  wesabe.data.BaseDataSource.dataSourceWithURI(function(){ return '/data/analytics/summaries/tags/all/' + wesabe.data.preferences.defaultCurrency(); }),
  function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    _tagNames: null,

    /**
     * Called when the data changes.
     *
     * @private
     */
    onDataChanged: function() {
      $super.onDataChanged.call(this);
      //@Ben - Disabled removing cache on tagname change
      //this._tagNames = null;
    },

    /**
     * Returns a list of names of the tags in this data source.
     */
    tagNames: function() {
      // if it's cached, return a copy of the cache
      //if (this._tagNames)
      //  return this._tagNames.concat();

      if (!this.hasData())
        return [];

      var result = [],
          summaries = this.get('data').summaries,
          length = summaries.length;

      while (length--)
        result[length] = summaries[length].tag.name;

      // cache a copy
      this._tagNames = result.concat();
      return result;
    }
  });
  $package.sharedDataSource = new $class();
});

wesabe.$class('wesabe.data.TransactionDataSource', wesabe.data.BaseDataSource, function($class, $super) {
  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang as lang
  var lang = wesabe.lang;
  // import wesabe.data.preferences as prefs
  var prefs = wesabe.data.preferences;

  $.extend($class.prototype, {
    init: function(params) {
      if (params)
        this.set('params', params);
    },

    /**
     * Returns the URI to use to retrieve transactions.
     *
     * @return {string}
     * @override
     */
    sourceURI: function() {
      // REVIEW: I'm sure this is not the right way to do this, but it works
      var accountSelections = page.selection.getByClass(wesabe.views.widgets.accounts.Account);
      if (accountSelections[0] && accountSelections[0].isInvestment()) // main selection needs to be investment account
        return '/data/investment-transactions/'+this.get('currency');
      else
        return '/data/transactions/'+this.get('currency');
    },

    /**
     * Returns the XHR options to pass to {jQuery.ajax}.
     *
     * @return {jQuery.ajax.data}
     * @override
     */
    requestOptions: function() {
      return $.extend($super.requestOptions.call(this), {
        data: this.requestQueryParams()
      });
    },

    /**
     * Returns the currency to be used in a transaction request.
     *
     * @private
     */
    _currency: function() {
      return this._params && this._params.currency || prefs.defaultCurrency();
    },

    /**
     * Get the parameters to be used to make a request for transactions.
     *
     * @return {jQuery.ajax.data}
     */
    params: function() {
      return this._params && lang.params.copy(this._params);
    },

    /**
     * Sets the parameters to be used to make a request for transactions.
     *
     * @param {jQuery.ajax.data} params A jQuery-compatible data object.
     */
    setParams: function(params) {
      this._params = params;
    },

    /**
     * Gets a jQuery-compatible data object to use for requesting transactions.
     *
     * @return {jQuery.ajax.data}
     */
    requestQueryParams: function() {
      return this.get('params');
    },

    /**
     * Returns the page number derived from the offset/limit params.
     *
     * @private
     */
    _pageNumber: function() {
      return Math.floor(lang.params.get(this._params, 'offset') / lang.params.get(this._params, 'limit')) + 1;
    },

    /**
     * Determines whether the params in this data source would be a search.
     *
     * @return {boolean}
     */
    isSearch: function() {
      return this._params && lang.params.has(this._params, 'query');
    }
  });
});

(function() {
  // package wesabe.data

  // import jQuery as $
  var $ = jQuery;
  // import wesabe.lang.number
  var number = wesabe.lang.number;
  // import wesabe.lang.string
  var string = wesabe.lang.string;

  /**
   * Provides access to commonly-used tag functionality.
   *
   * module tags
   */
  $.extend(wesabe.provide('data.tags'), {
    parseTagString: function(tagString) {
      if (!tagString || string.blank(tagString))
        return [];

      var me = this,
          tags = [],
          match;

      // extract tags from tagString
      tagString.replace(/('([^']*)'|"([^"]*)"|[^:\s]+)(:\S+)?/g, function(tag) {
        if (string.blank(me.unquote(tag)))
          return;

        tags.push(
          (match = tag.match(/^(.+):(.+)$/)) ?
            {name: me.unquote(match[1]), amount: match[2]} :
            {name: me.unquote(tag)});
      });

      return tags;
    },

    joinTags: function(tags) {
      var strings = [],
          length = tags.length;

      while (length--) {
        var tag = tags[length];

        // fix quoting
        var string = this.quote(this.unquote(tag.name));

        // append splits
        if ('amount' in tag) {
          var amount = tag.amount;
          if (amount.value) amount = amount.value;
          string += ':'+Math.abs(number.parse(amount));
        }

        strings[length] = string;
      }

      return strings.join(' ');
    },

    unquote: function(tag) {
      if (/'([^']*)'|"([^"]*)"/.test(tag))
        return tag.substring(1, tag.length - 1);
      else
        return tag;
    },

    quote: function(tag) {
      if (/['\s]/.test(tag)) {
        return "\"" + tag + "\"";
      } else if (/"/.test(tag)) {
        return "'" + tag + "'";
      } else {
        return tag;
      }
    },

    listsEqual: function(list1, list2) {
      if (list1.length != list2.length) return false;

      var length = list1.length;

      for (var i = length; i--; ) {
        var found = false;

        for (var j = length; j--; ) {
          if ((list1[i].name === list2[j].name) && (list1[i].split === list2[j].split)) {
            found = true;
            break;
          }
        }

        if (!found) return false;
      }

      return true;
    }
  });
})();
