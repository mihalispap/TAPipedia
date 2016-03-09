/**
 * @file
 * Linkit dialog functions.
 */

(function ($) {

// Create the Linkit namespaces.
Drupal.linkit = Drupal.linkit || {};
Drupal.linkit.currentInstance = Drupal.linkit.currentInstance || {};
Drupal.linkit.dialogHelper = Drupal.linkit.dialogHelper || {};
Drupal.linkit.insertPlugins = Drupal.linkit.insertPlugins || {};

/**
 * Create the modal dialog.
 */
Drupal.linkit.createModal = function() {
  // Create the modal dialog element.
  Drupal.linkit.createModalElement()
  // Create jQuery UI Dialog.
  .dialog(Drupal.linkit.modalOptions())
  // Remove the title bar from the modal.
  .siblings(".ui-dialog-titlebar").hide();

  // Make the modal seem "fixed".
  $(window).bind("scroll resize", function() {
    $('#linkit-modal').dialog('option', 'position', ['center', 50]);
  });

  // Get modal content.
  Drupal.linkit.getDashboard();
};

/**
 * Create and append the modal element.
 */
Drupal.linkit.createModalElement = function() {
  // Create a new div and give it an ID of linkit-modal.
  // This is the dashboard container.
  var linkitModal = $('<div id="linkit-modal"></div>');

  // Create a modal div in the <body>.
  $('body').append(linkitModal);

  return linkitModal;
};

/**
 * Default jQuery dialog options used when creating the Linkit modal.
 */
Drupal.linkit.modalOptions = function() {
  return {
    dialogClass: 'linkit-wrapper',
    modal: true,
    draggable: false,
    resizable: false,
    width: 520,
    position: ['center', 50],
    minHeight: 0,
    zIndex: 210000,
    close: Drupal.linkit.modalClose,
    open: function (event, ui) {
      // Change the overlay style.
      $('.ui-widget-overlay').css({
        opacity: 0.5,
        filter: 'Alpha(Opacity=50)',
        backgroundColor: '#FFFFFF'
      });
    },
    title: 'Add a reference'
  };
};

/**
 * Close the Linkit modal.
 */
Drupal.linkit.modalClose = function (e) {
  $('#linkit-modal').dialog('destroy').remove();
  // Make sure the current intstance settings are removed when the modal is
  // closed.
  Drupal.settings.linkit.currentInstance = {};

  // The event object does not have a preventDefault member in
  // Internet Explorer prior to version 9.
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  else {
    return false;
  }
};

/**
 *
 */
Drupal.linkit.getDashboard = function () {
  // Create the AJAX object.
  var ajax_settings = {};
  ajax_settings.event = 'LinkitDashboard';
  ajax_settings.url = Drupal.settings.linkit.dashboardPath +  Drupal.settings.linkit.currentInstance.profile;
  ajax_settings.progress = {
    type: 'throbber',
    message : Drupal.t('loading add reference tool...')
  };

  Drupal.ajax['linkit-modal'] = new Drupal.ajax('linkit-modal', $('#linkit-modal')[0], ajax_settings);

  // @TODO: Jquery 1.5 accept success setting to be an array of functions.
  // But we have to wait for jquery to get updated in Drupal core.
  // In the meantime we have to override it.
  Drupal.ajax['linkit-modal'].options.success = function (response, status) {
    if (typeof response == 'string') {
      response = $.parseJSON(response);
    }

    // Call the ajax success method.
    Drupal.ajax['linkit-modal'].success(response, status);
    // Run the afterInit function.
    var helper = Drupal.settings.linkit.currentInstance.helper;
    Drupal.linkit.getDialogHelper(helper).afterInit();

    // Set focus in the search field.
    $('#linkit-modal .linkit-search-element').focus();
  };

  // Update the autocomplete url.
  Drupal.settings.linkit.currentInstance.autocompletePathParsed =
    Drupal.settings.linkit.autocompletePath.replace('___profile___',  Drupal.settings.linkit.currentInstance.profile);
    
  //suppress change profile toggle
    Drupal.settings.linkit.currentInstance.suppressProfileChanger = true;

  // Trigger the ajax event.
  $('#linkit-modal').trigger('LinkitDashboard');
};

/**
 * Register new dialog helper.
 */
Drupal.linkit.registerDialogHelper = function(name, helper) {
  Drupal.linkit.dialogHelper[name] = helper;
};

/**
 * Get a dialog helper.
 */
Drupal.linkit.getDialogHelper = function(name) {
  return Drupal.linkit.dialogHelper[name];
};

/**
 * Register new insert plugins.
 */
Drupal.linkit.registerInsertPlugin = function(name, plugin) {
  Drupal.linkit.insertPlugins[name] = plugin;
};

/**
 * Get an insert plugin.
 */
Drupal.linkit.getInsertPlugin = function(name) {
  return Drupal.linkit.insertPlugins[name];
};

})(jQuery);
;
/*! Licensed under MIT, https://github.com/sofish/pen */
/**
 * Pen has been reworked and reduced for our purposes,
 * we encourage you to check out their fantastic work
 * on Github: https://github.com/sofish/pen
 */
(function(doc) {

    var EntityQuote, utils = {};

    // type detect
    utils.is = function(obj, type) {
        return Object.prototype.toString.call(obj).slice(8, -1) === type;
    };

    // copy props from a obj
    utils.copy = function(defaults, source) {
        for(var p in source) {
            if(source.hasOwnProperty(p)) {
                var val = source[p];
                defaults[p] = this.is(val, 'Object') ? this.copy({}, val) :
                    this.is(val, 'Array') ? this.copy([], val) : val;
            }
        }
        return defaults;
    };

    // log
    utils.log = function(message, force) {
        if(window._quote_debug_mode_on || force) console.log('%cQUOTE DEBUGGER: %c' + message, 'font-family:arial,sans-serif;color:#1abf89;line-height:2em;', 'font-family:cursor,monospace;color:#333;');
    };

    // shift a function
    utils.shift = function(key, fn, time) {
        time = time || 50;
        var queue = this['_shift_fn' + key], timeout = 'shift_timeout' + key, current;
        if ( queue ) {
            queue.concat([fn, time]);
        }
        else {
            queue = [[fn, time]];
        }
        current = queue.pop();
        clearTimeout(this[timeout]);
        this[timeout] = setTimeout(function() {
            current[0]();
        }, time);
    };

    // merge: make it easy to have a fallback
    utils.merge = function(config) {
        // default settings
        var defaults = {
            class: 'entity-quote',
            debug: false,
            link_text: 'Quote',
            selector: '.field-name-body p',
            context: '',
        };

        // user-friendly config
        if(config.nodeType === 1) {
            defaults.editor = config;
        } else if(config.match && config.match(/^#[\S]+$/)) {
            defaults.editor = document.getElementById(config.slice(1));
        } else {
            defaults = utils.copy(defaults, config);
        }

        return defaults;
    };

    EntityQuote = function(config) {
        if(!config) return utils.log('can\'t find config', true);

        // merge user config
        var defaults = utils.merge(config);
        if(defaults.editor.nodeType !== 1) return utils.log('can\'t find editor');
        if(defaults.debug) window._quote_debug_mode_on = true;

        var editor = defaults.editor;

        // set default class
        editor.classList.add(defaults.class);

        // assign config
        this.config = defaults;

        // save the selection obj
        this._sel = doc.getSelection();

        // enable toolbar
        this.toolbar();
    };

    EntityQuote.prototype.toolbar = function() {

        var that = this;

        var menu = doc.createElement('div');
        menu.setAttribute('class', this.config.class + '-menu');
        menu.innerHTML = '<a href="">' + this.config.link_text + '</a>';
        menu.style.display = 'none';

        doc.body.appendChild((this._menu = menu));

        var setpos = function() {
            if(menu.style.display === 'block') that.menu();
        };

        // change menu offset when window resize / scroll
        window.addEventListener('resize', setpos);
        window.addEventListener('scroll', setpos);

        var editor = this.config.editor;
        var toggle = function() {
            if(that._isDestroyed) return;

            utils.shift('toggle_menu', function() {
                var range = that._sel;
                if(!range.isCollapsed) {
                    //show menu
                    that._range = range.getRangeAt(0);
                    that.menu();
                } else {
                    //hide menu
                    that._menu.style.display = 'none';
                }
            }, 200);
        };

        var selector = this.config.selector;
        var context = this.config.context;

        // toggle toolbar on mouse select
        jQuery(selector, context).live('mouseup', toggle);
        //editor.addEventListener('mouseup', toggle);

        // toggle toolbar on key select
        //editor.addEventListener('keyup', toggle);

        return this;
    };

    // show menu
    EntityQuote.prototype.menu = function() {

        var offset = this._range.getBoundingClientRect()
            , top = offset.top - 10
            , left = offset.left + (offset.width / 2)
            , menu = this._menu;

        // display block to calculate it's width & height
        menu.style.display = 'block';
        menu.style.top = top - menu.clientHeight + 'px';
        menu.style.left = left - (menu.clientWidth/2) + 'px';

        return this;
    };

    EntityQuote.prototype.destroy = function(isAJoke) {
        var destroy = isAJoke ? false : true;

        if(!isAJoke) {
            this._sel.removeAllRanges();
            this._menu.style.display = 'none';
        }
        this._isDestroyed = destroy;

        return this;
    };

    EntityQuote.prototype.rebuild = function() {
        return this.destroy('it\'s a joke');
    };


    // make it accessible
    this.EntityQuote = doc.getSelection ? EntityQuote : '';

}(document));

/*(function ($) {
  Drupal.behaviors.entity_quote = {
    attach: function(context, settings) {
      var EntityQuoteInstance = new EntityQuote({
        editor: document.body,
        class: 'entity-quote',
        debug: false,
        link_text: 'Quote',
        selector: '.harmony-post p',
        context: context
      });
    }
  };
})(jQuery);*/
;
