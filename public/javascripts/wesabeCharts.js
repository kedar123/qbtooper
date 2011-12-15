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
