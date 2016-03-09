(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').once().before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
/**
 * @file
 * Linkit ckeditor dialog helper.
 */
(function ($) {

// Abort if Drupal.linkit is not defined.
if (typeof Drupal.linkit === 'undefined') {
  return ;
}

Drupal.linkit.registerDialogHelper('ckeditor', {
  init : function() {},

  /**
   * Prepare the dialog after init.
   */
  afterInit : function () {
     var editor = Drupal.settings.linkit.currentInstance.editor;
     var element = CKEDITOR.plugins.link.getSelectedLink( editor );

    // If we have selected a link element, lets populate the fields in the
    // modal with the values from that link element.
    if (element) {
      link = {
        path: element.data('cke-saved-href') || element.getAttribute('href') || '',
        attributes: {}
      },
      // Get all attributes that have fields in the modal.
      additionalAttributes = Drupal.linkit.additionalAttributes();

      for (var i = 0; i < additionalAttributes.length; i++) {
        link.attributes[additionalAttributes[i]] = element.getAttribute(additionalAttributes[i]);
      }

      // Populate the fields.
      Drupal.linkit.populateFields(link);
    }
  },

  /**
   * Insert the link into the editor.
   *
   * @param {Object} link
   *   The link object.
   */
  insertLink : function(link) {
    var editor = Drupal.settings.linkit.currentInstance.editor;
    CKEDITOR.tools.callFunction(editor._.linkitFnNum, link, editor);
  }
});

})(jQuery);;
/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 * 
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */
(function ($) {
    $.fn.touchwipe = function (settings) {
        var config = {
            min_move_x: 20,
            min_move_y: 20,
            wipeLeft: function () {},
            wipeRight: function () {},
            wipeUp: function () {},
            wipeDown: function () {},
            preventDefaultEvents: true
        };
        if (settings) $.extend(config, settings);
        this.each(function () {
            var startX;
            var startY;
            var isMoving = false;

            function cancelTouch() {
                this.removeEventListener('touchmove', onTouchMove);
                startX = null;
                isMoving = false
            }
            function onTouchMove(e) {
                if (config.preventDefaultEvents) {
                    e.preventDefault()
                }
                if (isMoving) {
                    var x = e.touches[0].pageX;
                    var y = e.touches[0].pageY;
                    var dx = startX - x;
                    var dy = startY - y;
                    if (Math.abs(dx) >= config.min_move_x) {
                        cancelTouch();
                        if (dx > 0) {
                            config.wipeLeft()
                        } else {
                            config.wipeRight()
                        }
                    } else if (Math.abs(dy) >= config.min_move_y) {
                        cancelTouch();
                        if (dy > 0) {
                            config.wipeDown()
                        } else {
                            config.wipeUp()
                        }
                    }
                }
            }
            function onTouchStart(e) {
                if (e.touches.length == 1) {
                    startX = e.touches[0].pageX;
                    startY = e.touches[0].pageY;
                    isMoving = true;
                    this.addEventListener('touchmove', onTouchMove, false)
                }
            }
            if ('ontouchstart' in document.documentElement) {
                this.addEventListener('touchstart', onTouchStart, false)
            }
        });
        return this
    }
})(jQuery);;
/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms3d-csstransitions-touch-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:w(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&w("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,e.prefixed=function(a,b,c){return b?F(a,b,c):F(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};;
/*! jQuery Migrate v1.2.1 | (c) 2005, 2013 jQuery Foundation, Inc. and other contributors | jquery.org/license */
jQuery.migrateMute===void 0&&(jQuery.migrateMute=!0),function(e,t,n){function r(n){var r=t.console;i[n]||(i[n]=!0,e.migrateWarnings.push(n),r&&r.warn&&!e.migrateMute&&(r.warn("JQMIGRATE: "+n),e.migrateTrace&&r.trace&&r.trace()))}function a(t,a,i,o){if(Object.defineProperty)try{return Object.defineProperty(t,a,{configurable:!0,enumerable:!0,get:function(){return r(o),i},set:function(e){r(o),i=e}}),n}catch(s){}e._definePropertyBroken=!0,t[a]=i}var i={};e.migrateWarnings=[],!e.migrateMute&&t.console&&t.console.log&&t.console.log("JQMIGRATE: Logging is active"),e.migrateTrace===n&&(e.migrateTrace=!0),e.migrateReset=function(){i={},e.migrateWarnings.length=0},"BackCompat"===document.compatMode&&r("jQuery is not compatible with Quirks Mode");var o=e("<input/>",{size:1}).attr("size")&&e.attrFn,s=e.attr,u=e.attrHooks.value&&e.attrHooks.value.get||function(){return null},c=e.attrHooks.value&&e.attrHooks.value.set||function(){return n},l=/^(?:input|button)$/i,d=/^[238]$/,p=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,f=/^(?:checked|selected)$/i;a(e,"attrFn",o||{},"jQuery.attrFn is deprecated"),e.attr=function(t,a,i,u){var c=a.toLowerCase(),g=t&&t.nodeType;return u&&(4>s.length&&r("jQuery.fn.attr( props, pass ) is deprecated"),t&&!d.test(g)&&(o?a in o:e.isFunction(e.fn[a])))?e(t)[a](i):("type"===a&&i!==n&&l.test(t.nodeName)&&t.parentNode&&r("Can't change the 'type' of an input or button in IE 6/7/8"),!e.attrHooks[c]&&p.test(c)&&(e.attrHooks[c]={get:function(t,r){var a,i=e.prop(t,r);return i===!0||"boolean"!=typeof i&&(a=t.getAttributeNode(r))&&a.nodeValue!==!1?r.toLowerCase():n},set:function(t,n,r){var a;return n===!1?e.removeAttr(t,r):(a=e.propFix[r]||r,a in t&&(t[a]=!0),t.setAttribute(r,r.toLowerCase())),r}},f.test(c)&&r("jQuery.fn.attr('"+c+"') may use property instead of attribute")),s.call(e,t,a,i))},e.attrHooks.value={get:function(e,t){var n=(e.nodeName||"").toLowerCase();return"button"===n?u.apply(this,arguments):("input"!==n&&"option"!==n&&r("jQuery.fn.attr('value') no longer gets properties"),t in e?e.value:null)},set:function(e,t){var a=(e.nodeName||"").toLowerCase();return"button"===a?c.apply(this,arguments):("input"!==a&&"option"!==a&&r("jQuery.fn.attr('value', val) no longer sets properties"),e.value=t,n)}};var g,h,v=e.fn.init,m=e.parseJSON,y=/^([^<]*)(<[\w\W]+>)([^>]*)$/;e.fn.init=function(t,n,a){var i;return t&&"string"==typeof t&&!e.isPlainObject(n)&&(i=y.exec(e.trim(t)))&&i[0]&&("<"!==t.charAt(0)&&r("$(html) HTML strings must start with '<' character"),i[3]&&r("$(html) HTML text after last tag is ignored"),"#"===i[0].charAt(0)&&(r("HTML string cannot start with a '#' character"),e.error("JQMIGRATE: Invalid selector string (XSS)")),n&&n.context&&(n=n.context),e.parseHTML)?v.call(this,e.parseHTML(i[2],n,!0),n,a):v.apply(this,arguments)},e.fn.init.prototype=e.fn,e.parseJSON=function(e){return e||null===e?m.apply(this,arguments):(r("jQuery.parseJSON requires a valid JSON string"),null)},e.uaMatch=function(e){e=e.toLowerCase();var t=/(chrome)[ \/]([\w.]+)/.exec(e)||/(webkit)[ \/]([\w.]+)/.exec(e)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e)||/(msie) ([\w.]+)/.exec(e)||0>e.indexOf("compatible")&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e)||[];return{browser:t[1]||"",version:t[2]||"0"}},e.browser||(g=e.uaMatch(navigator.userAgent),h={},g.browser&&(h[g.browser]=!0,h.version=g.version),h.chrome?h.webkit=!0:h.webkit&&(h.safari=!0),e.browser=h),a(e,"browser",e.browser,"jQuery.browser is deprecated"),e.sub=function(){function t(e,n){return new t.fn.init(e,n)}e.extend(!0,t,this),t.superclass=this,t.fn=t.prototype=this(),t.fn.constructor=t,t.sub=this.sub,t.fn.init=function(r,a){return a&&a instanceof e&&!(a instanceof t)&&(a=t(a)),e.fn.init.call(this,r,a,n)},t.fn.init.prototype=t.fn;var n=t(document);return r("jQuery.sub() is deprecated"),t},e.ajaxSetup({converters:{"text json":e.parseJSON}});var b=e.fn.data;e.fn.data=function(t){var a,i,o=this[0];return!o||"events"!==t||1!==arguments.length||(a=e.data(o,t),i=e._data(o,t),a!==n&&a!==i||i===n)?b.apply(this,arguments):(r("Use of jQuery.fn.data('events') is deprecated"),i)};var j=/\/(java|ecma)script/i,w=e.fn.andSelf||e.fn.addBack;e.fn.andSelf=function(){return r("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()"),w.apply(this,arguments)},e.clean||(e.clean=function(t,a,i,o){a=a||document,a=!a.nodeType&&a[0]||a,a=a.ownerDocument||a,r("jQuery.clean() is deprecated");var s,u,c,l,d=[];if(e.merge(d,e.buildFragment(t,a).childNodes),i)for(c=function(e){return!e.type||j.test(e.type)?o?o.push(e.parentNode?e.parentNode.removeChild(e):e):i.appendChild(e):n},s=0;null!=(u=d[s]);s++)e.nodeName(u,"script")&&c(u)||(i.appendChild(u),u.getElementsByTagName!==n&&(l=e.grep(e.merge([],u.getElementsByTagName("script")),c),d.splice.apply(d,[s+1,0].concat(l)),s+=l.length));return d});var Q=e.event.add,x=e.event.remove,k=e.event.trigger,N=e.fn.toggle,T=e.fn.live,M=e.fn.die,S="ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",C=RegExp("\\b(?:"+S+")\\b"),H=/(?:^|\s)hover(\.\S+|)\b/,A=function(t){return"string"!=typeof t||e.event.special.hover?t:(H.test(t)&&r("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'"),t&&t.replace(H,"mouseenter$1 mouseleave$1"))};e.event.props&&"attrChange"!==e.event.props[0]&&e.event.props.unshift("attrChange","attrName","relatedNode","srcElement"),e.event.dispatch&&a(e.event,"handle",e.event.dispatch,"jQuery.event.handle is undocumented and deprecated"),e.event.add=function(e,t,n,a,i){e!==document&&C.test(t)&&r("AJAX events should be attached to document: "+t),Q.call(this,e,A(t||""),n,a,i)},e.event.remove=function(e,t,n,r,a){x.call(this,e,A(t)||"",n,r,a)},e.fn.error=function(){var e=Array.prototype.slice.call(arguments,0);return r("jQuery.fn.error() is deprecated"),e.splice(0,0,"error"),arguments.length?this.bind.apply(this,e):(this.triggerHandler.apply(this,e),this)},e.fn.toggle=function(t,n){if(!e.isFunction(t)||!e.isFunction(n))return N.apply(this,arguments);r("jQuery.fn.toggle(handler, handler...) is deprecated");var a=arguments,i=t.guid||e.guid++,o=0,s=function(n){var r=(e._data(this,"lastToggle"+t.guid)||0)%o;return e._data(this,"lastToggle"+t.guid,r+1),n.preventDefault(),a[r].apply(this,arguments)||!1};for(s.guid=i;a.length>o;)a[o++].guid=i;return this.click(s)},e.fn.live=function(t,n,a){return r("jQuery.fn.live() is deprecated"),T?T.apply(this,arguments):(e(this.context).on(t,this.selector,n,a),this)},e.fn.die=function(t,n){return r("jQuery.fn.die() is deprecated"),M?M.apply(this,arguments):(e(this.context).off(t,this.selector||"**",n),this)},e.event.trigger=function(e,t,n,a){return n||C.test(e)||r("Global events are undocumented and deprecated"),k.call(this,e,t,n||document,a)},e.each(S.split("|"),function(t,n){e.event.special[n]={setup:function(){var t=this;return t!==document&&(e.event.add(document,n+"."+e.guid,function(){e.event.trigger(n,null,t,!0)}),e._data(this,n,e.guid++)),!1},teardown:function(){return this!==document&&e.event.remove(document,n+"."+e._data(this,n)),!1}}})}(jQuery,window);;
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
$(document).ready(function() {
jQuery.easing["jswing"]=jQuery.easing["swing"];jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b+c;return-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b+c;return d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b+c;return-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b*b+c;return d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){if(b==0)return c;if(b==e)return c+d;if((b/=e/2)<1)return d/2*Math.pow(2,10*(b-1))+c;return d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){if((b/=e/2)<1)return-d/2*(Math.sqrt(1-b*b)-1)+c;return d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;if(!g)g=e*.3*1.5;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);if(b<1)return-.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c;return h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;if((b/=e/2)<1)return d/2*b*b*(((f*=1.525)+1)*b-f)+c;return d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){if((b/=e)<1/2.75){return d*7.5625*b*b+c}else if(b<2/2.75){return d*(7.5625*(b-=1.5/2.75)*b+.75)+c}else if(b<2.5/2.75){return d*(7.5625*(b-=2.25/2.75)*b+.9375)+c}else{return d*(7.5625*(b-=2.625/2.75)*b+.984375)+c}},easeInOutBounce:function(a,b,c,d,e){if(b<e/2)return jQuery.easing.easeInBounce(a,b*2,0,d,e)*.5+c;return jQuery.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}})
});
	/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */;
/*------------------------------------------------------------------------
 # MD Slider - March 18, 2013
 # ------------------------------------------------------------------------
 --------------------------------------------------------------------------*/

(function(e){effectsIn=["bounceIn","bounceInDown","bounceInUp","bounceInLeft","bounceInRight","fadeIn","fadeInUp","fadeInDown","fadeInLeft","fadeInRight","fadeInUpBig","fadeInDownBig","fadeInLeftBig","fadeInRightBig","flipInX","flipInY","foolishIn","lightSpeedIn","rollIn","rotateIn","rotateInDownLeft","rotateInDownRight","rotateInUpLeft","rotateInUpRight","twisterInDown","twisterInUp","swap","swashIn","tinRightIn","tinLeftIn","tinUpIn","tinDownIn"];effectsOut=["bombRightOut","bombLeftOut","bounceOut","bounceOutDown","bounceOutUp","bounceOutLeft","bounceOutRight","fadeOut","fadeOutUp","fadeOutDown","fadeOutLeft","fadeOutRight","fadeOutUpBig","fadeOutDownBig","fadeOutLeftBig","fadeOutRightBig","flipOutX","flipOutY","foolishOut","hinge","holeOut","lightSpeedOut","puffOut","rollOut","rotateOut","rotateOutDownLeft","rotateOutDownRight","rotateOutUpLeft","rotateOutUpRight","rotateDown","rotateUp","rotateLeft","rotateRight","swashOut","tinRightOut","tinLeftOut","tinUpOut","tinDownOut","vanishOut"];var t=effectsIn.length;var n=effectsOut.length;e.fn.mdSlider=function(r){function _(){s.addClass("loading-image");var t="";if(r.responsive)t+=" md-slide-responsive";if(r.fullwidth)t+=" md-slide-fullwidth";if(r.showBullet&&r.posBullet)t+=" md-slide-bullet-"+r.posBullet;if(!r.showBullet&&r.showThumb&&r.posThumb)t+=" md-slide-thumb-"+r.posThumb;s.wrap('<div class="'+r.className+t+'"><div class="md-item-wrap"></div></div>');d=s.parent();p=d.parent();l=r.responsive?s.width():r.width;c=r.height;o=[];v=et();if(v)p.addClass("md-touchdevice");s.find("."+r.itemClassName).each(function(t){f++;o[t]=e(this);e(this).find(".md-object").each(function(){var t=e(this).data("y")?e(this).data("y"):0,n=e(this).data("x")?e(this).data("x"):0,i=e(this).data("width")?e(this).data("width"):0,s=e(this).data("height")?e(this).data("height"):0;if(i>0){e(this).width(i/r.width*100+"%")}if(s>0){e(this).height(s/r.height*100+"%")}var o={top:t/r.height*100+"%",left:n/r.width*100+"%"};e(this).css(o)});if(t>0)e(this).hide()});D();P();if(r.slideShow){k=true}e(".md-object",s).hide();if(e(".md-video",p).size()>0){if(r.videoBox){e(".md-video",p).mdvideobox()}else{var n=e('<div class="md-video-control" style="display: none"></div>');p.append(n);e(".md-video",p).click(function(){var t=e("<iframe></iframe>");t.attr("allowFullScreen","").attr("frameborder","0").css({width:"100%",height:"100%",background:"black"});t.attr("src",e(this).attr("href"));var r=e('<a href="#" class="md-close-video" title="Close video"></a>');r.click(function(){n.html("").hide();k=true;return false});n.html("").append(t).append(r).show();k=false;return false})}}e(window).resize(function(){tt()}).trigger("resize");rt();var i=false;e(window).blur(function(){i=(new Date).getTime()});e(window).focus(function(){if(i){var e=(new Date).getTime()-i;if(e>C-O)O=C-200;else O+=e;i=false}})}function D(){if(r.slideShow&&r.showLoading){var t=e('<div class="loading-bar-hoz loading-bar-'+r.loadingPosition+'"><div class="br-timer-glow" style="left: -100px;"></div><div class="br-timer-bar" style="width:0px"></div></div>');p.append(t);y=e(".br-timer-bar",t);b=e(".br-timer-glow",t)}if(r.slideShow&&r.pauseOnHover){d.hover(function(){L=true},function(){L=false})}if(r.styleBorder!=0){var n='<div class="border-top border-style-'+r.styleBorder+'"></div>';n+='<div class="border-bottom border-style-'+r.styleBorder+'"></div>';if(!r.fullwidth){n+='<div class="border-left border-style-'+r.styleBorder+'"><div class="edge-top"></div><div class="edge-bottom"></div></div>';n+='<div class="border-right border-style-'+r.styleBorder+'"><div class="edge-top"></div><div class="edge-bottom"></div></div>'}p.append(n)}if(r.styleShadow!=0){var i='<div class="md-shadow md-shadow-style-'+r.styleShadow+'"></div>'}if(r.showArrow){m=e('<div class="md-arrow"><div class="md-arrow-left"><span></span></div><div class="md-arrow-right"><span></span></div></div>');d.append(m);e(".md-arrow-right",m).bind("click",function(){R()});e(".md-arrow-left",m).bind("click",function(){U()})}if(r.showBullet!=false){g=e('<div class="md-bullets"></div>');p.append(g);for(var u=0;u<f;u++){g.append('<div class="md-bullet"  rel="'+u+'"><a></a></div>')}if(r.showThumb){var a=parseInt(s.data("thumb-width")),l=parseInt(s.data("thumb-height"));for(var u=0;u<f;u++){var c=o[u].data("thumb"),h=o[u].data("thumb-type");if(c){var v;if(h=="image")v=e("<img />").attr("src",c).css({top:-(9+l)+"px",left:-(a/2-2)+"px",opacity:0});else v=e("<span></span>").attr("style",c).css({top:-(9+l)+"px",left:-(a/2-2)+"px",opacity:0});e("div.md-bullet:eq("+u+")",g).append(v).append('<div class="md-thumb-arrow" style="opacity: 0"></div>')}}e("div.md-bullet",g).hover(function(){e(this).addClass("md_hover");e("img, span",this).show().animate({opacity:1},200);e(".md-thumb-arrow",this).show().animate({opacity:1},200)},function(){e(this).removeClass("md_hover");e("img, span",this).animate({opacity:0},200,function(){e(this).hide()});e(".md-thumb-arrow",this).animate({opacity:0},200,function(){e(this).hide()})})}e("div.md-bullet",p).click(function(){if(e(this).hasClass("md-current")){return false}var t=e(this).attr("rel");F(t)})}else if(r.showThumb){var E=e('<div class="md-thumb"><div class="md-thumb-container"><div class="md-thumb-items"></div></div></div>').appendTo(p);w=e(".md-thumb-items",E);for(var u=0;u<f;u++){var c=o[u].data("thumb"),h=o[u].data("thumb-type");if(c){var S=e('<a class="md-thumb-item" />').attr("rel",u);if(h=="image")S.append(e("<img />").attr("src",c));else S.append(e("<span />").attr("style",c).css("display","inline-block"));w.append(S)}}e("a",w).click(function(){if(e(this).hasClass("md-current")||N){return false}var t=e(this).attr("rel");F(t)})}}function P(){if(v){s.bind("touchstart",function(e){if(S)return false;e=e.originalEvent.touches[0]||e.originalEvent.changedTouches[0];S=true;x=undefined;s.mouseY=e.pageY;s.mouseX=e.pageX});s.bind("touchmove",function(e){e=e.originalEvent.touches[0]||e.originalEvent.changedTouches[0];if(S){var t=e.pageX||e.clientX;var n=e.pageY||e.clientY;if(typeof x=="undefined"){x=!!(x||Math.abs(n-s.mouseY)>Math.abs(t-s.mouseX))}if(x){S=false;return}else{T=t-s.mouseX;return false}}return});s.bind("touchend",function(e){if(S){S=false;if(T>r.touchSensitive){U();T=0;return false}else if(T<-r.touchSensitive){R();T=0;return false}}})}else{d.hover(function(){if(m){m.stop(true,true).animate({opacity:1},200)}},function(){if(m){m.stop(true,true).animate({opacity:0},200)}});p.trigger("hover")}if(r.enableDrag){s.mousedown(function(e){if(!S){S=true;x=undefined;s.mouseY=e.pageY;s.mouseX=e.pageX}return false});s.mousemove(function(e){if(S){var t=e.pageX||e.clientX;var n=e.pageY||e.clientY;if(typeof x=="undefined"){x=!!(x||Math.abs(n-s.mouseY)>Math.abs(t-s.mouseX))}if(x){S=false;return}else{T=t-s.mouseX;return false}}return});s.mouseup(function(e){if(S){S=false;if(T>r.touchSensitive){U()}else if(T<-r.touchSensitive){R()}T=0;return false}});s.mouseleave(function(e){s.mouseup()})}}function H(){if(w){w.unbind("touchstart");w.unbind("touchmove");w.unbind("touchmove");w.css("left",0);var t=0,n=w.parent().parent();e("a.md-thumb-item",w).each(function(){if(e("img",e(this)).length>0){if(e("img",e(this)).css("borderLeftWidth"))t+=parseInt(e("img",e(this)).css("borderLeftWidth"),10);if(e("img",e(this)).css("borderRightWidth"))t+=parseInt(e("img",e(this)).css("borderRightWidth"),10);if(e("img",e(this)).css("marginLeft"))t+=parseInt(e("img",e(this)).css("marginLeft"),10);if(e("img",e(this)).css("marginRight"))t+=parseInt(e("img",e(this)).css("marginRight"),10)}else{if(e("span",e(this)).css("borderLeftWidth"))t+=parseInt(e("span",e(this)).css("borderLeftWidth"),10);if(e("span",e(this)).css("borderRightWidth"))t+=parseInt(e("span",e(this)).css("borderRightWidth"),10);if(e("span",e(this)).css("marginLeft"))t+=parseInt(e("span",e(this)).css("marginLeft"),10);if(e("span",e(this)).css("marginRight"))t+=parseInt(e("span",e(this)).css("marginRight"),10)}if(e(this).css("borderLeftWidth"))t+=parseInt(e(this).css("borderLeftWidth"),10);if(e(this).css("borderRightWidth"))t+=parseInt(e(this).css("borderRightWidth"),10);if(e(this).css("marginLeft"))t+=parseInt(e(this).css("marginLeft"),10);if(e(this).css("marginRight"))t+=parseInt(e(this).css("marginRight"),10);t+=parseInt(s.data("thumb-width"))});e(".md-thumb-next",n).remove();e(".md-thumb-prev",n).remove();if(t>e(".md-thumb-container",n).width()){E=e(".md-thumb-container",n).width()-t;w.width(t);n.append('<div class="md-thumb-prev"></div><div class="md-thumb-next"></div>');e(".md-thumb-prev",n).click(function(){B("right")});e(".md-thumb-next",n).click(function(){B("left")});j();if(v){N=true;var i,o;w.bind("touchstart",function(e){e=e.originalEvent.touches[0]||e.originalEvent.changedTouches[0];i=true;this.mouseX=e.pageX;o=w.position().left;return false});w.bind("touchmove",function(e){e.preventDefault();e=e.originalEvent.touches[0]||e.originalEvent.changedTouches[0];if(i){w.css("left",o+e.pageX-this.mouseX)}return false});w.bind("touchend",function(t){t.preventDefault();t=t.originalEvent.touches[0]||t.originalEvent.changedTouches[0];i=false;if(Math.abs(t.pageX-this.mouseX)<r.touchSensitive){var n=e(t.target).closest("a.md-thumb-item");if(n.length){F(n.attr("rel"))}w.stop(true,true).animate({left:o},400);return false}if(w.position().left<E){w.stop(true,true).animate({left:E},400,function(){j()})}else if(w.position().left>0){w.stop(true,true).animate({left:0},400,function(){j()})}o=0;return false})}}}}function B(t){if(w){if(t=="left"){var n=w.position().left;if(n>E){var r=e(".md-thumb-container",p).width();if(n-r>E){w.stop(true,true).animate({left:n-r},400,function(){j()})}else{w.stop(true,true).animate({left:E},400,function(){j()})}}}else if(t=="right"){var n=w.position().left;if(n<0){var r=e(".md-thumb-container",p).width();if(n+r<0){w.stop(true,true).animate({left:n+r},400,function(){j()})}else{w.stop(true,true).animate({left:0},400,function(){j()})}}}else{var i=e("a",w).index(e("a.md-current",w));if(i>=0){var n=w.position().left;var s=i*e("a",w).width();if(s+n<0){w.stop(true,true).animate({left:-s},400,function(){j()})}else{var o=s+e("a",w).width();var r=e(".md-thumb-container",p).width();if(o+n>r){w.stop(true,true).animate({left:r-o},400,function(){j()})}}}}}}function j(){var t=w.position().left;if(t>E){e(".md-thumb-next",p).show()}else{e(".md-thumb-next",p).hide()}if(t<0){e(".md-thumb-prev",p).show()}else{e(".md-thumb-prev",p).hide()}}function F(t){O=0;C=o[t].data("timeout")?o[t].data("timeout"):r.slideShowDelay;if(y){var n=O*l/C;y.width(n);b.css({left:n-100+"px"})}u=a;a=t;r.onStartTransition.call(s);if(o[u]){e("div.md-bullet:eq("+u+")",g).removeClass("md-current");e("a:eq("+u+")",w).removeClass("md-current");W(o[u]);var i=r.transitions;if(r.transitions.toLowerCase()=="random"){var f=new Array("slit-horizontal-left-top","slit-horizontal-top-right","slit-horizontal-bottom-up","slit-vertical-down","slit-vertical-up","strip-up-right","strip-up-left","strip-down-right","strip-down-left","strip-left-up","strip-left-down","strip-right-up","strip-right-down","strip-right-left-up","strip-right-left-down","strip-up-down-right","strip-up-down-left","left-curtain","right-curtain","top-curtain","bottom-curtain","slide-in-right","slide-in-left","slide-in-up","slide-in-down","fade");i=f[Math.floor(Math.random()*(f.length+1))];if(i==undefined)i="fade";i=e.trim(i.toLowerCase())}if(r.transitions.indexOf(",")!=-1){var f=r.transitions.split(",");i=f[Math.floor(Math.random()*f.length)];if(i==undefined)i="fade";i=e.trim(i.toLowerCase())}if(o[a].data("transition")){var f=o[a].data("transition").split(",");i=f[Math.floor(Math.random()*f.length)];i=e.trim(i.toLowerCase())}if(!(this.support=Modernizr.csstransitions&&Modernizr.csstransforms3d)&&(i=="slit-horizontal-left-top"||i=="slit-horizontal-top-right"||i=="slit-horizontal-bottom-up"||i=="slit-vertical-down"||i=="slit-vertical-up")){i="fade"}h=true;Y(i);if(g)e("div.md-bullet:eq("+a+")",g).addClass("md-current");if(w)e("a:eq("+a+")",w).addClass("md-current");B()}else{o[a].css({top:0,left:0}).show();X(o[t]);if(g)e("div.md-bullet:eq("+a+")",g).addClass("md-current");if(w)e("a:eq("+a+")",w).addClass("md-current");B();h=false}}function I(){F(0);A=setInterval(q,40)}function q(){if(h)return false;if(k&&!L){O+=40;if(O>C){R()}else if(y){var e=O*l/C;y.width(e);b.css({left:e-100+"px"})}}}function R(){if(h)return false;var e=a;e++;if(e>=f&&r.loop){e=0;F(e)}else if(e<f){F(e)}}function U(){if(h)return false;var e=a;e--;if(e<0&&r.loop){e=f-1;F(e)}else if(e>=0){F(e)}}function z(t){var r=t.data("easeout")?t.data("easeout"):"";clearTimeout(t.data("timer-start"));if(r!=""&&e.browser.msie&&parseInt(e.browser.version)<=9)t.fadeOut();else{t.removeClass(effectsIn.join(" "));if(r!=""){if(r=="random")r=effectsOut[Math.floor(Math.random()*n)];t.addClass(r)}else t.hide()}}function W(t){t.find(".md-object").each(function(){var t=e(this);t.stop(true,true).hide();clearTimeout(t.data("timer-start"));clearTimeout(t.data("timer-stop"))})}function X(n){e(".md-object",n).each(function(n){var r=e(this);if(r.data("easeout"))r.removeClass(effectsOut.join(" "));var i=r.data("easein")?r.data("easein"):"";if(i=="random")i=effectsIn[Math.floor(Math.random()*t)];r.removeClass(effectsIn.join(" "));r.hide();if(r.data("start")!=undefined){r.data("timer-start",setTimeout(function(){if(i!=""&&e.browser.msie&&parseInt(e.browser.version)<=9)r.fadeIn();else r.show().addClass(i)},r.data("start")))}else r.show().addClass(i);if(r.data("stop")!=undefined){r.data("timer-stop",setTimeout(function(){z(r)},r.data("stop")))}})}function V(){r.onEndTransition.call(s);e(".md-strips-container",s).remove();o[u].hide();o[a].show();h=false;X(o[a])}function J(t,n){var i,n=n?n:r,u=e('<div class="md-strips-container"></div>'),f=Math.round(l/n.strips),h=Math.round(c/n.strips),p=e(".md-mainimg img",o[a]);if(p.length==0)p=e(".md-mainimg",o[a]);for(var d=0;d<n.strips;d++){var v=t?h*d+"px":"0px",m=t?"0px":f*d+"px",g,y;if(d==n.strips-1){g=t?"0px":l-f*d+"px",y=t?c-h*d+"px":"0px"}else{g=t?"0px":f+"px",y=t?h+"px":"0px"}i=e('<div class="mdslider-strip"></div>').css({width:g,height:y,top:v,left:m,opacity:0}).append(p.clone().css({marginLeft:t?0:-(d*f)+"px",marginTop:t?-(d*h)+"px":0}));u.append(i)}s.append(u)}function K(t,n,r){var i;var u=e('<div class="md-strips-container"></div>');var a=l/t,f=c/n,h=e(".md-mainimg img",o[r]);if(h.length==0)h=e(".md-mainimg",o[r]);for(var p=0;p<n;p++){for(var d=0;d<t;d++){var v=f*p+"px",m=a*d+"px";i=e('<div class="mdslider-tile"/>').css({width:a,height:f,top:v,left:m}).append(h.clone().css({marginLeft:"-"+m,marginTop:"-"+v}));u.append(i)}}s.append(u)}function Q(){var t,n=[],r=e('<div class="md-strips-container"></div>');e(".md-mainimg img",o[u]),e(".md-mainimg img",o[a]);if(e(".md-mainimg img",o[u]).length>0)n.push(e(".md-mainimg img",o[u]));else n.push(e(".md-mainimg",o[u]));if(e(".md-mainimg img",o[a]).length>0)n.push(e(".md-mainimg img",o[a]));else n.push(e(".md-mainimg",o[a]));for(var i=0;i<2;i++){t=e('<div class="mdslider-strip"></div>').css({width:l,height:c}).append(n[i].clone());r.append(t)}s.append(r)}function G(t){var n=e('<div class="md-strips-container '+t+'"></div>'),r=e(".md-mainimg img",o[u]).length>0?e(".md-mainimg img",o[u]):e(".md-mainimg",o[u]),i=e('<div class="mdslider-slit"/>').append(r.clone()),a=e('<div class="mdslider-slit"/>'),f=r.position();a.append(r.clone().css("top",f.top-c/2+"px"));if(t=="slit-vertical-down"||t=="slit-vertical-up")a=e('<div class="mdslider-slit"/>').append(r.clone().css("left",f.left-l/2+"px"));n.append(i).append(a);s.append(n)}function Y(t){switch(t){case"slit-horizontal-left-top":case"slit-horizontal-top-right":case"slit-horizontal-bottom-up":case"slit-vertical-down":case"slit-vertical-up":G(t);e(".md-object",o[a]).hide();o[u].hide();o[a].show();var n=e(".mdslider-slit",s).first(),i=e(".mdslider-slit",s).last();var f={transition:"all "+r.transitionsSpeed+"ms ease-in-out","-webkit-transition":"all "+r.transitionsSpeed+"ms ease-in-out","-moz-transition":"all "+r.transitionsSpeed+"ms ease-in-out","-ms-transition":"all "+r.transitionsSpeed+"ms ease-in-out"};e(".mdslider-slit",s).css(f);setTimeout(function(){n.addClass("md-trans-elems-1");i.addClass("md-trans-elems-2")},50);setTimeout(function(){r.onEndTransition.call(s);e(".md-strips-container",s).remove();h=false;X(o[a])},r.transitionsSpeed);break;case"strip-up-right":case"strip-up-left":K(r.stripCols,1,a);var p=e(".mdslider-tile",s),d=r.transitionsSpeed/r.stripCols/2,v=r.transitionsSpeed/2;if(t=="strip-up-right")p=e(".mdslider-tile",s).reverse();p.css({height:"1px",bottom:"0px",top:"auto"});p.each(function(t){var n=e(this);setTimeout(function(){n.animate({height:"100%",opacity:"1.0"},v,"easeInOutQuart",function(){if(t==r.stripCols-1)V()})},t*d)});break;case"strip-down-right":case"strip-down-left":K(r.stripCols,1,a);var p=e(".mdslider-tile",s),d=r.transitionsSpeed/r.stripCols/2,v=r.transitionsSpeed/2;if(t=="strip-down-right")p=e(".mdslider-tile",s).reverse();p.css({height:"1px",top:"0px",bottom:"auto"});p.each(function(t){var n=e(this);setTimeout(function(){n.animate({height:"100%",opacity:"1.0"},v,"easeInOutQuart",function(){if(t==r.stripCols-1)V()})},t*d)});break;case"strip-left-up":case"strip-left-down":K(1,r.stripRows,a);var p=e(".mdslider-tile",s),d=r.transitionsSpeed/r.stripRows/2,v=r.transitionsSpeed/2;if(t=="strip-left-up")p=e(".mdslider-tile",s).reverse();p.css({width:"1px",left:"0px",right:"auto"});p.each(function(t){var n=e(this);setTimeout(function(){n.animate({width:"100%",opacity:"1.0"},v,"easeInOutQuart",function(){if(t==r.stripRows-1)V()})},t*d)});break;case"strip-right-up":case"strip-right-down":K(1,r.stripRows,a);var p=e(".mdslider-tile",s),d=r.transitionsSpeed/r.stripRows/2,v=r.transitionsSpeed/2;if(t=="strip-left-right-up")p=e(".mdslider-tile",s).reverse();p.css({width:"1px",left:"auto",right:"1px"});p.each(function(t){var n=e(this);setTimeout(function(){n.animate({width:"100%",opacity:"1.0"},v,"easeInOutQuart",function(){if(t==r.stripRows-1)V()})},t*d)});break;case"strip-right-left-up":case"strip-right-left-down":K(1,r.stripRows,u);o[u].hide();o[a].show();var p=e(".mdslider-tile",s),d=r.transitionsSpeed/r.stripRows,v=r.transitionsSpeed/2;if(t=="strip-right-left-up")p=e(".mdslider-tile",s).reverse();p.filter(":odd").css({width:"100%",right:"0px",left:"auto",opacity:1}).end().filter(":even").css({width:"100%",right:"auto",left:"0px",opacity:1});p.each(function(t){var n=e(this);var i=t%2==0?{left:"-50%",opacity:"0"}:{right:"-50%",opacity:"0"};setTimeout(function(){n.animate(i,v,"easeOutQuint",function(){if(t==r.stripRows-1){r.onEndTransition.call(s);e(".md-strips-container",s).remove();h=false;X(o[a])}})},t*d)});break;case"strip-up-down-right":case"strip-up-down-left":K(r.stripCols,1,u);o[u].hide();o[a].show();var p=e(".mdslider-tile",s),d=r.transitionsSpeed/r.stripCols/2,v=r.transitionsSpeed/2;if(t=="strip-up-down-right")p=e(".mdslider-tile",s).reverse();p.filter(":odd").css({height:"100%",bottom:"0px",top:"auto",opacity:1}).end().filter(":even").css({height:"100%",bottom:"auto",top:"0px",opacity:1});p.each(function(t){var n=e(this);var i=t%2==0?{top:"-50%",opacity:0}:{bottom:"-50%",opacity:0};setTimeout(function(){n.animate(i,v,"easeOutQuint",function(){if(t==r.stripCols-1){r.onEndTransition.call(s);e(".md-strips-container",s).remove();h=false;X(o[a])}})},t*d)});break;case"left-curtain":K(r.stripCols,1,a);var p=e(".mdslider-tile",s),m=l/r.stripCols,d=r.transitionsSpeed/r.stripCols/2;p.each(function(t){var n=e(this);n.css({left:m*t,width:0,opacity:0});setTimeout(function(){n.animate({width:m,opacity:"1.0"},r.transitionsSpeed/2,function(){if(t==r.stripCols-1)V()})},d*t)});break;case"right-curtain":K(r.stripCols,1,a);var p=e(".mdslider-tile",s).reverse(),m=l/r.stripCols,d=r.transitionsSpeed/r.stripCols/2;p.each(function(t){var n=e(this);n.css({right:m*t,left:"auto",width:0,opacity:0});setTimeout(function(){n.animate({width:m,opacity:"1.0"},r.transitionsSpeed/2,function(){if(t==r.stripCols-1)V()})},d*t)});break;case"top-curtain":K(1,r.stripRows,a);var p=e(".mdslider-tile",s),g=c/r.stripRows,d=r.transitionsSpeed/r.stripRows/2;p.each(function(t){var n=e(this);n.css({top:g*t,height:0,opacity:0});setTimeout(function(){n.animate({height:g,opacity:"1.0"},r.transitionsSpeed/2,function(){if(t==r.stripRows-1)V()})},d*t)});break;case"bottom-curtain":K(1,r.stripRows,a);var p=e(".mdslider-tile",s).reverse(),g=c/r.stripRows,d=r.transitionsSpeed/r.stripRows/2;p.each(function(t){var n=e(this);n.css({bottom:g*t,height:0,opacity:0});setTimeout(function(){n.animate({height:g,opacity:"1.0"},r.transitionsSpeed/2,function(){if(t==r.stripRows-1)V()})},d*t)});break;case"slide-in-right":var y=0;Q();var p=e(".mdslider-strip",s);p.each(function(){w=e(this);var t=y*l;w.css({left:t});w.animate({left:t-l},r.transitionsSpeed,function(){V()});y++});break;case"slide-in-left":var y=0;Q();var p=e(".mdslider-strip",s);p.each(function(){w=e(this);var t=-y*l;w.css({left:t});w.animate({left:l+t},r.transitionsSpeed*2,function(){V()});y++});break;case"slide-in-up":var y=0;Q();var p=e(".mdslider-strip",s);p.each(function(){w=e(this);var t=y*c;w.css({top:t});w.animate({top:t-c},r.transitionsSpeed,function(){V()});y++});break;case"slide-in-down":var y=0;Q();var p=e(".mdslider-strip",s);p.each(function(){w=e(this);var t=-y*c;w.css({top:t});w.animate({top:c+t},r.transitionsSpeed,function(){V()});y++});break;case"fade":default:var b={strips:1};J(false,b);var w=e(".mdslider-strip:first",s);w.css({height:"100%",width:l});if(t=="slide-in-right")w.css({height:"100%",width:l,left:l+"px",right:""});else if(t=="slide-in-left")w.css({left:"-"+l+"px"});w.animate({left:"0px",opacity:1},r.transitionsSpeed,function(){V()});break}}function Z(e){var t=e.slice();var n=t.length;var r=n;while(r--){var i=parseInt(Math.random()*n);var s=t[r];t[r]=t[i];t[i]=s}return t}function et(){return"ontouchstart"in window||"createTouch"in document}function tt(){p.width();l=r.responsive?p.width():r.width;if(r.responsive){if(r.fullwidth&&l>r.width)c=r.height;else c=Math.round(l/r.width*r.height)}if(!r.responsive&&!r.fullwidth)p.width(l);if(!r.responsive&&r.fullwidth)p.css({"min-width":l+"px"});if(r.fullwidth){e(".md-objects",s).width(r.width);var t=20;if((p.width()-r.width)/2>20)t=(p.width()-r.width)/2;p.find(".md-bullets").css({left:t,right:t});p.find(".md-thumb").css({left:t,right:t})}if(r.responsive&&r.fullwidth&&p.width()<r.width)e(".md-objects",s).width(l);p.height(c);e(".md-slide-item",s).height(c);nt();H();ot();ut();at()}function nt(){e(".md-slide-item",s).each(function(){var t=e(".md-mainimg img",this);if(t.data("defW")&&t.data("defH")){var n=t.data("defW"),r=t.data("defH");st(t,n,r)}})}function rt(){var t=e(".md-slide-item .md-mainimg img",s).length;s.data("count",t);if(s.data("count")==0)it();e(".md-slide-item .md-mainimg img",s).each(function(){e(this).load(function(){var t=e(this);if(!t.data("defW")){var n=ft(t.attr("src"));st(t,n.width,n.height);t.data({defW:n.width,defH:n.height})}s.data("count",s.data("count")-1);if(s.data("count")==0)it()});if(this.complete)e(this).load()})}function it(){s.removeClass("loading-image");I()}function st(t,n,r){var i=e(".md-slide-item:visible",s).width(),o=e(".md-slide-item:visible",s).height();if(r>0&&o>0){if(n/r>i/o){var u=i-o/r*n;t.css({width:"auto",height:o+"px"});if(u<0){t.css({left:u/2+"px",top:0})}else{t.css({left:0,top:0})}}else{var a=o-i/n*r;t.css({width:i+"px",height:"auto"});if(a<0){t.css({top:a/2+"px",left:0})}else{t.css({left:0,top:0})}}}}function ot(){var t=1;if(parseInt(e.browser.version,10)<9)t=6;if(p.width()<r.width){e(".md-objects",s).css({"font-size":p.width()/r.width*100-t+"%"})}else{e(".md-objects",s).css({"font-size":100-t+"%"})}}function ut(){if(p.width()<r.width&&r.responsive){e(".md-objects div.md-object",s).each(function(){var t=p.width()/r.width,n=e(this),i=[];if(n.data("padding-top"))i["padding-top"]=n.data("padding-top")*t;if(n.data("padding-right"))i["padding-right"]=n.data("padding-right")*t;if(n.data("padding-bottom"))i["padding-bottom"]=n.data("padding-bottom")*t;if(n.data("padding-left"))i["padding-left"]=n.data("padding-left")*t;if(n.find("a").length){n.find("a").css(i)}else{n.css(i)}})}else{e(".md-objects div.md-object",s).each(function(){var t=e(this),n=[];if(t.data("padding-top"))n["padding-top"]=t.data("padding-top");if(t.data("padding-right"))n["padding-right"]=t.data("padding-right");if(t.data("padding-bottom"))n["padding-bottom"]=t.data("padding-bottom");if(t.data("padding-left"))n["padding-left"]=t.data("padding-left");if(t.find("a").length){t.find("a").css(n)}else{t.css(n)}})}}function at(){if(r.showThumb&&!r.showBullet){thumbHeight=s.data("thumb-height");if(r.posThumb=="1"){thumbBottom=thumbHeight/2;p.find(".md-thumb").css({height:thumbHeight+10,bottom:-thumbBottom-10});p.css({"margin-bottom":thumbBottom+10})}else{p.find(".md-thumb").css({height:thumbHeight+10,bottom:-(thumbHeight+40)});p.css({"margin-bottom":thumbHeight+50})}}}function ft(e){var t=new Image;t.src=e;var n={height:t.height,width:t.width};return n}var i={className:"md-slide-wrap",itemClassName:"md-slide-item",transitions:"strip-down-left",transitionsSpeed:800,width:990,height:420,responsive:true,fullwidth:true,styleBorder:0,styleShadow:0,posBullet:2,posThumb:1,stripCols:20,stripRows:10,slideShowDelay:6e3,slideShow:true,loop:false,pauseOnHover:false,showLoading:true,loadingPosition:"bottom",showArrow:true,showBullet:true,videoBox:false,showThumb:true,enableDrag:true,touchSensitive:50,onEndTransition:function(){},onStartTransition:function(){}};r=e.extend({},i,r);var s=e(this),o=[],u,a=-1,f=0,l,c,h=true,p,d,v,m,g,y,b,w,E=0,S=false,x,T,N=false,C=0,k=false,L=false,A,O=0;var M={range:function(e,t,n){var r=(new Array(++t-e)).join(".").split(".").map(function(t,n){return e+n});return n?r.map(function(e){return[Math.random(),e]}).sort().map(function(e){return e[1]}):r}};e(document).ready(function(){_()})};e.fn.reverse=[].reverse;var r=function(e,t,n){this.m_pfnPercent=t;this.m_pfnFinished=n;this.m_nLoaded=0;this.m_nProcessed=0;this.m_aImages=new Array;this.m_nICount=e.length;for(var r=0;r<e.length;r++)this.Preload(e[r])};r.prototype={Preload:function(e){var t=new Image;this.m_aImages.push(t);t.onload=r.prototype.OnLoad;t.onerror=r.prototype.OnError;t.onabort=r.prototype.OnAbort;t.oImagePreload=this;t.bLoaded=false;t.source=e;t.src=e},OnComplete:function(){this.m_nProcessed++;if(this.m_nProcessed==this.m_nICount)this.m_pfnFinished();else this.m_pfnPercent(Math.round(this.m_nProcessed/this.m_nICount*10))},OnLoad:function(){this.bLoaded=true;this.oImagePreload.m_nLoaded++;this.oImagePreload.OnComplete()},OnError:function(){this.bError=true;this.oImagePreload.OnComplete()},OnAbort:function(){this.bAbort=true;this.oImagePreload.OnComplete()}};e.fn.mdvideobox=function(t){e(this).each(function(){function n(){if(e("#md-overlay").length==0){var t=e('<div id="md-overlay" class="md-overlay"></div>').hide().click(r);var n=e('<div id="md-videocontainer" class="md-videocontainer"><div id="md-video-embed"></div><div class="md-description clearfix"><div class="md-caption"></div><a id="md-closebtn" class="md-closebtn" href="#"></a></div></div>');n.css({width:o.initialWidth+"px",height:o.initialHeight+"px",display:"none"});e("#md-closebtn",n).click(r);e("body").append(t).append(n)}u=e("#md-overlay");a=e("#md-videocontainer");l=e("#md-video-embed",a);f=e(".md-caption",a);h.click(i)}function r(){u.fadeTo("fast",0,function(){e(this).css("display","none")});l.html("");a.hide();return false}function i(){o.click.call();u.css({height:e(window).height()+"px"});var t=e(window).height()/2-o.initialHeight/2;var n=e(window).width()/2-o.initialWidth/2;a.css({top:t,left:n}).show();l.css({background:"#fff url(css/loading.gif) no-repeat center",height:o.contentsHeight,width:o.contentsWidth});u.css("display","block").fadeTo("fast",o.defaultOverLayFade);f.html(d);l.fadeIn("slow",function(){s()});return false}function s(){l.css("background","#fff");c='<iframe src="'+p+'" width="'+o.contentsWidth+'" height="'+o.contentsHeight+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';l.html(c)}var o=e.extend({initialWidth:640,initialHeight:400,contentsWidth:640,contentsHeight:350,defaultOverLayFade:.8,click:function(){}},t);var u,a,f,l,c;var h=e(this);var p=h.attr("href");var d=h.attr("title");n()})}})(jQuery);
