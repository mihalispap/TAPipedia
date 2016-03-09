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

/**
 * @file: Popup dialog interfaces for the media project.
 *
 * Drupal.media.popups.mediaBrowser
 *   Launches the media browser which allows users to pick a piece of media.
 *
 * Drupal.media.popups.mediaStyleSelector
 *  Launches the style selection form where the user can choose
 *  what format / style they want their media in.
 *
 */

(function ($) {
namespace('Drupal.media.popups');

/**
 * Media browser popup. Creates a media browser dialog.
 *
 * @param {function}
 *          onSelect Callback for when dialog is closed, received (Array
 *          media, Object extra);
 * @param {Object}
 *          globalOptions Global options that will get passed upon initialization of the browser.
 *          @see Drupal.media.popups.mediaBrowser.getDefaults();
 *
 * @param {Object}
 *          pluginOptions Options for specific plugins. These are passed
 *          to the plugin upon initialization.  If a function is passed here as
 *          a callback, it is obviously not passed, but is accessible to the plugin
 *          in Drupal.settings.variables.
 *
 *          Example
 *          pluginOptions = {library: {url_include_patterns:'/foo/bar'}};
 *
 * @param {Object}
 *          widgetOptions Options controlling the appearance and behavior of the
 *          modal dialog.
 *          @see Drupal.media.popups.mediaBrowser.getDefaults();
 */
Drupal.media.popups.mediaBrowser = function (onSelect, globalOptions, pluginOptions, widgetOptions) {
  var options = Drupal.media.popups.mediaBrowser.getDefaults();
  options.global = $.extend({}, options.global, globalOptions);
  options.plugins = pluginOptions;
  options.widget = $.extend({}, options.widget, widgetOptions);

  // Create it as a modal window.
  var browserSrc = options.widget.src;
  if ($.isArray(browserSrc) && browserSrc.length) {
    browserSrc = browserSrc[browserSrc.length - 1];
  }
  // Params to send along to the iframe.  WIP.
  var params = {};
  $.extend(params, options.global);
  params.plugins = options.plugins;

  browserSrc += '&' + $.param(params);
  var mediaIframe = Drupal.media.popups.getPopupIframe(browserSrc, 'mediaBrowser');
  // Attach the onLoad event
  mediaIframe.bind('load', options, options.widget.onLoad);

  /**
   * Setting up the modal dialog
   */
  var ok = 'OK';
  var notSelected = 'You have not selected anything!';

  if (Drupal && Drupal.t) {
    ok = Drupal.t(ok);
    notSelected = Drupal.t(notSelected);
  }

  // @todo: let some options come through here. Currently can't be changed.
  var dialogOptions = options.dialog;

  dialogOptions.buttons[ok] = function () {
    var selected = this.contentWindow.Drupal.media.browser.selectedMedia;
    if (selected.length < 1) {
      alert(notSelected);
      return;
    }
    onSelect(selected);
    $(this).dialog("close");
  };

  var dialog = mediaIframe.dialog(dialogOptions);

  Drupal.media.popups.sizeDialog(dialog);
  Drupal.media.popups.resizeDialog(dialog);
  Drupal.media.popups.scrollDialog(dialog);
  Drupal.media.popups.overlayDisplace(dialog.parents(".ui-dialog"));

  return mediaIframe;
};

Drupal.media.popups.mediaBrowser.mediaBrowserOnLoad = function (e) {
  var options = e.data;
  if (this.contentWindow.Drupal.media == undefined) return;

  if (this.contentWindow.Drupal.media.browser.selectedMedia.length > 0) {
    var ok = (Drupal && Drupal.t) ? Drupal.t('OK') : 'OK';
    var ok_func = $(this).dialog('option', 'buttons')[ok];
    ok_func.call(this);
    return;
  }
};

Drupal.media.popups.mediaBrowser.getDefaults = function () {
  return {
    global: {
      types: [], // Types to allow, defaults to all.
      activePlugins: [] // If provided, a list of plugins which should be enabled.
    },
    widget: { // Settings for the actual iFrame which is launched.
      src: Drupal.settings.media.browserUrl, // Src of the media browser (if you want to totally override it)
      onLoad: Drupal.media.popups.mediaBrowser.mediaBrowserOnLoad // Onload function when iFrame loads.
    },
    dialog: Drupal.media.popups.getDialogOptions()
  };
};

Drupal.media.popups.mediaBrowser.finalizeSelection = function () {
  var selected = this.contentWindow.Drupal.media.browser.selectedMedia;
  if (selected.length < 1) {
    alert(notSelected);
    return;
  }
  onSelect(selected);
  $(this).dialog("close");
}

/**
 * Style chooser Popup. Creates a dialog for a user to choose a media style.
 *
 * @param mediaFile
 *          The mediaFile you are requesting this formatting form for.
 *          @todo: should this be fid?  That's actually all we need now.
 *
 * @param Function
 *          onSubmit Function to be called when the user chooses a media
 *          style. Takes one parameter (Object formattedMedia).
 *
 * @param Object
 *          options Options for the mediaStyleChooser dialog.
 */
Drupal.media.popups.mediaStyleSelector = function (mediaFile, onSelect, options) {
  var defaults = Drupal.media.popups.mediaStyleSelector.getDefaults();
  // @todo: remove this awful hack :(
  if (typeof defaults.src === 'string' ) {
    defaults.src = defaults.src.replace('-media_id-', mediaFile.fid) + '&fields=' + encodeURIComponent(JSON.stringify(mediaFile.fields));
  }
  else {
    var src = defaults.src.shift();
    defaults.src.unshift(src);
    defaults.src = src.replace('-media_id-', mediaFile.fid) + '&fields=' + encodeURIComponent(JSON.stringify(mediaFile.fields));
  }
  options = $.extend({}, defaults, options);
  // Create it as a modal window.
  var mediaIframe = Drupal.media.popups.getPopupIframe(options.src, 'mediaStyleSelector');
  // Attach the onLoad event
  mediaIframe.bind('load', options, options.onLoad);

  /**
   * Set up the button text
   */
  var ok = 'OK';
  var notSelected = 'Very sorry, there was an unknown error embedding media.';

  if (Drupal && Drupal.t) {
    ok = Drupal.t(ok);
    notSelected = Drupal.t(notSelected);
  }

  // @todo: let some options come through here. Currently can't be changed.
  var dialogOptions = Drupal.media.popups.getDialogOptions();

  dialogOptions.buttons[ok] = function () {

    var formattedMedia = this.contentWindow.Drupal.media.formatForm.getFormattedMedia();
    if (!formattedMedia) {
      alert(notSelected);
      return;
    }
    onSelect(formattedMedia);
    $(this).dialog("close");
  };

  var dialog = mediaIframe.dialog(dialogOptions);

  Drupal.media.popups.sizeDialog(dialog);
  Drupal.media.popups.resizeDialog(dialog);
  Drupal.media.popups.scrollDialog(dialog);
  Drupal.media.popups.overlayDisplace(dialog.parents(".ui-dialog"));

  return mediaIframe;
};

Drupal.media.popups.mediaStyleSelector.mediaBrowserOnLoad = function (e) {
};

Drupal.media.popups.mediaStyleSelector.getDefaults = function () {
  return {
    src: Drupal.settings.media.styleSelectorUrl,
    onLoad: Drupal.media.popups.mediaStyleSelector.mediaBrowserOnLoad
  };
};


/**
 * Style chooser Popup. Creates a dialog for a user to choose a media style.
 *
 * @param mediaFile
 *          The mediaFile you are requesting this formatting form for.
 *          @todo: should this be fid?  That's actually all we need now.
 *
 * @param Function
 *          onSubmit Function to be called when the user chooses a media
 *          style. Takes one parameter (Object formattedMedia).
 *
 * @param Object
 *          options Options for the mediaStyleChooser dialog.
 */
Drupal.media.popups.mediaFieldEditor = function (fid, onSelect, options) {
  var defaults = Drupal.media.popups.mediaFieldEditor.getDefaults();
  // @todo: remove this awful hack :(
  defaults.src = defaults.src.replace('-media_id-', fid);
  options = $.extend({}, defaults, options);
  // Create it as a modal window.
  var mediaIframe = Drupal.media.popups.getPopupIframe(options.src, 'mediaFieldEditor');
  // Attach the onLoad event
  // @TODO - This event is firing too early in IE on Windows 7,
  // - so the height being calculated is too short for the content.
  mediaIframe.bind('load', options, options.onLoad);

  /**
   * Set up the button text
   */
  var ok = 'OK';
  var notSelected = 'Very sorry, there was an unknown error embedding media.';

  if (Drupal && Drupal.t) {
    ok = Drupal.t(ok);
    notSelected = Drupal.t(notSelected);
  }

  // @todo: let some options come through here. Currently can't be changed.
  var dialogOptions = Drupal.media.popups.getDialogOptions();

  dialogOptions.buttons[ok] = function () {
    var formattedMedia = this.contentWindow.Drupal.media.formatForm.getFormattedMedia();
    if (!formattedMedia) {
      alert(notSelected);
      return;
    }
    onSelect(formattedMedia);
    $(this).dialog("close");
  };

  var dialog = mediaIframe.dialog(dialogOptions);

  Drupal.media.popups.sizeDialog(dialog);
  Drupal.media.popups.resizeDialog(dialog);
  Drupal.media.popups.scrollDialog(dialog);
  Drupal.media.popups.overlayDisplace(dialog);

  return mediaIframe;
};

Drupal.media.popups.mediaFieldEditor.mediaBrowserOnLoad = function (e) {

};

Drupal.media.popups.mediaFieldEditor.getDefaults = function () {
  return {
    // @todo: do this for real
    src: '/media/-media_id-/edit?render=media-popup',
    onLoad: Drupal.media.popups.mediaFieldEditor.mediaBrowserOnLoad
  };
};


/**
 * Generic functions to both the media-browser and style selector
 */

/**
 * Returns the commonly used options for the dialog.
 */
Drupal.media.popups.getDialogOptions = function () {
  if ('undefined' === typeof Drupal.settings.media.dialogOptions) {
      return {
        buttons: {},
        dialogClass: 'media-wrapper',
        modal: true,
        draggable: false,
       resizable: false,
        minWidth: 500,
        width: 670,
        height: 280,
        position: "center",
        overlay: {
          backgroundColor: "#000000",
          opacity: 0.4
        },
        zIndex: 10000,
        close: function(event, ui) {
          $(event.target).remove();
        }
      };
    } 
  else
  {
	  return {
    buttons: {},
    dialogClass: Drupal.settings.media.dialogOptions.dialogclass,
    modal: Drupal.settings.media.dialogOptions.modal,
    draggable: Drupal.settings.media.dialogOptions.draggable,
    resizable: Drupal.settings.media.dialogOptions.resizable,
    minWidth: Drupal.settings.media.dialogOptions.minwidth,
    width: Drupal.settings.media.dialogOptions.width,
    height: Drupal.settings.media.dialogOptions.height,
    position: Drupal.settings.media.dialogOptions.position,
    overlay: {
      backgroundColor: Drupal.settings.media.dialogOptions.overlay.backgroundcolor,
      opacity: Drupal.settings.media.dialogOptions.overlay.opacity
    },
    zIndex: Drupal.settings.media.dialogOptions.zindex,
    close: function (event, ui) {
      $(event.target).remove();
    }
  };
}
};

/**
 * Get an iframe to serve as the dialog's contents. Common to both plugins.
 */
Drupal.media.popups.getPopupIframe = function (src, id, options) {
  var defaults = {width: '100%', scrolling: 'auto'};
  var options = $.extend({}, defaults, options);

  return $('<iframe class="media-modal-frame"/>')
  .attr('src', src)
  .attr('width', options.width)
  .attr('id', id)
  .attr('scrolling', options.scrolling);
};

Drupal.media.popups.overlayDisplace = function (dialog) {
  if (parent.window.Drupal.overlay && jQuery.isFunction(parent.window.Drupal.overlay.getDisplacement)) {
    var overlayDisplace = parent.window.Drupal.overlay.getDisplacement('top');
    if (dialog.offset().top < overlayDisplace) {
      dialog.css('top', overlayDisplace);
    }
  }
}

/**
 * Size the dialog when it is first loaded and keep it centered when scrolling.
 *
 * @param jQuery dialogElement
 *  The element which has .dialog() attached to it.
 */
Drupal.media.popups.sizeDialog = function (dialogElement) {
  if (!dialogElement.is(':visible')) {
    return;
  }
  var windowWidth = $(window).width();
  var dialogWidth = windowWidth * 0.8;
  var windowHeight = $(window).height();
  var dialogHeight = windowHeight * 0.8;

  dialogElement.dialog("option", "width", dialogWidth);
  dialogElement.dialog("option", "height", dialogHeight);
  dialogElement.dialog("option", "position", 'center');

  $('.media-modal-frame').width('100%');
}

/**
 * Resize the dialog when the window changes.
 *
 * @param jQuery dialogElement
 *  The element which has .dialog() attached to it.
 */
Drupal.media.popups.resizeDialog = function (dialogElement) {
  $(window).resize(function() {
    Drupal.media.popups.sizeDialog(dialogElement);
  });
}

/**
 * Keeps the dialog centered when the window is scrolled.
 *
 * @param jQuery dialogElement
 *  The element which has .dialog() attached to it.
 */
Drupal.media.popups.scrollDialog = function (dialogElement) {
  // Keep the dialog window centered when scrolling.
  $(window).scroll(function() {
    if (!dialogElement.is(':visible')) {
      return;
    }
    dialogElement.dialog("option", "position", 'center');
  });
}

})(jQuery);
;
// Spectrum Colorpicker v1.3.4
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (window, $, undefined) {
    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        allowEmpty: false,
        showButtons: true,
        clickoutFiresChange: false,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,
        cancelText: "cancel",
        chooseText: "choose",
        clearText: "Clear Color Selection",
        preferredFormat: false,
        className: "", // Deprecated - use containerClassName and replacerClassName instead.
        containerClassName: "",
        replacerClassName: "",
        showAlpha: false,
        theme: "sp-light",
        palette: [["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]],
        selectionPalette: [],
        disabled: false
    },
    spectrums = [],
    IE = !!/msie/i.exec( window.navigator.userAgent ),
    rgbaSupport = (function() {
        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }

        var elem = document.createElement('div');
        var style = elem.style;
        style.cssText = 'background-color:rgba(0,0,0,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    })(),
    inputTypeColorSupport = (function() {
        var colorInput = $("<input type='color' value='!' />")[0];
        return colorInput.type === "color" && colorInput.value !== "!";
    })(),
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    markup = (function () {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className, tooltipFormat) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = tinycolor(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (tinycolor.equals(color, current)) ? " sp-thumb-active" : "";

                var formattedString = tiny.toString(tooltipFormat || "rgb");
                var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push('<span title="No Color Selected" data-color="" style="background-color:transparent;" class="' + cls + '"></span>');
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = [],
            paletteArray = [],
            paletteLookup = {},
            selectionPalette = opts.selectionPalette.slice(0),
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            alphaSliderInner = container.find(".sp-alpha-inner"),
            alphaSlider = container.find(".sp-alpha"),
            alphaSlideHelper = container.find(".sp-alpha-handle"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            cancelButton = container.find(".sp-cancel"),
            clearButton = container.find(".sp-clear"),
            chooseButton = container.find(".sp-choose"),
            isInput = boundElement.is("input"),
            isInputTypeColor = isInput && inputTypeColorSupport && boundElement.attr("type") === "color",
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview-inner"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            preferredFormat = opts.preferredFormat,
            currentPreferredFormat = preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
            isEmpty = !initialColor,
            allowEmpty = opts.allowEmpty && !isInputTypeColor;

        function applyOptions() {

            if (opts.showPaletteOnly) {
                opts.showPalette = true;
            }

            if (opts.palette) {
                palette = opts.palette.slice(0);
                paletteArray = $.isArray(palette[0]) ? palette : [palette];
                paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }
            }

            container.toggleClass("sp-flat", flat);
            container.toggleClass("sp-input-disabled", !opts.showInput);
            container.toggleClass("sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("sp-clear-enabled", allowEmpty);
            container.toggleClass("sp-buttons-disabled", !opts.showButtons);
            container.toggleClass("sp-palette-disabled", !opts.showPalette);
            container.toggleClass("sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className).addClass(opts.containerClassName);

            reflow();
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            applyOptions();

            if (shouldReplace) {
                boundElement.after(replacer).hide();
            }

            if (!allowEmpty) {
                clearButton.hide();
            }

            if (flat) {
                boundElement.after(container).hide();
            }
            else {

                var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(container);
            }

            updateSelectionPaletteFromStorage();

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if(boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                hide("cancel");
            });

            clearButton.attr("title", opts.clearText);
            clearButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                isEmpty = true;
                move();

                if(flat) {
                    //for the flat style, this is a change event
                    updateOriginalInput(true);
                }
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                isEmpty = false;
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            }, dragStart, dragStop);

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY, e) {

                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                }
                else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) {
                    currentSaturation = parseFloat(dragX / dragWidth);
                }
                if (setValue) {
                    currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                }

                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }

                move();

            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function palletElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(this).data("color"));
                    move();
                }
                else {
                    set($(this).data("color"));
                    move();
                    updateOriginalInput(true);
                    hide();
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, palletElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, { ignore: true }, palletElementClick);
        }

        function updateSelectionPaletteFromStorage() {

            if (localStorageKey && window.localStorage) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window.localStorage[localStorageKey].split(",#");
                    if (oldPalette.length > 1) {
                        delete window.localStorage[localStorageKey];
                        $.each(oldPalette, function(i, c) {
                             addColorToSelectionPalette(c);
                        });
                    }
                }
                catch(e) { }

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) { }
            }
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var rgb = tinycolor(color).toRgbString();
                if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {
                    selectionPalette.push(rgb);
                    while(selectionPalette.length > maxSelectionSize) {
                        selectionPalette.shift();
                    }
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            if (opts.showPalette) {
                for (i = 0; i < selectionPalette.length; i++) {
                    var rgb = tinycolor(selectionPalette[i]).toRgbString();

                    if (!paletteLookup[rgb]) {
                        unique.push(selectionPalette[i]);
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts.preferredFormat);
            });

            updateSelectionPaletteFromStorage();

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts.preferredFormat));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts.preferredFormat));
            }
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            boundElement.trigger('dragstart.spectrum', [ get() ]);
        }

        function dragStop() {
            container.removeClass(draggingClass);
            boundElement.trigger('dragstop.spectrum', [ get() ]);
        }

        function setFromTextInput() {

            var value = textInput.val();

            if ((value === null || value === "") && allowEmpty) {
                set(null);
                updateOriginalInput(true);
            }
            else {
                var tiny = tinycolor(value);
                if (tiny.ok) {
                    set(tiny);
                    updateOriginalInput(true);
                }
                else {
                    textInput.addClass("sp-validation-error");
                }
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            var event = $.Event('beforeShow.spectrum');

            if (visible) {
                reflow();
                return;
            }

            boundElement.trigger(event, [ get() ]);

            if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                return;
            }

            hideAll();
            visible = true;

            $(doc).bind("click.spectrum", hide);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("sp-active");
            container.removeClass("sp-hidden");

            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
            boundElement.trigger('show.spectrum', [ colorOnShow ]);
        }

        function hide(e) {

            // Return on right click
            if (e && e.type == "click" && e.button == 2) { return; }

            // Return if hiding is unnecessary
            if (!visible || flat) { return; }
            visible = false;

            $(doc).unbind("click.spectrum", hide);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("sp-active");
            container.addClass("sp-hidden");

            var colorHasChanged = !tinycolor.equals(get(), colorOnShow);

            if (colorHasChanged) {
                if (clickoutFiresChange && e !== "cancel") {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
            }

            callbacks.hide(get());
            boundElement.trigger('hide.spectrum', [ get() ]);
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                updateUI();
                return;
            }

            var newColor, newHsv;
            if (!color && allowEmpty) {
                isEmpty = true;
            } else {
                isEmpty = false;
                newColor = tinycolor(color);
                newHsv = newColor.toHsv();

                currentHue = (newHsv.h % 360) / 360;
                currentSaturation = newHsv.s;
                currentValue = newHsv.v;
                currentAlpha = newHsv.a;
            }
            updateUI();

            if (newColor && newColor.ok && !ignoreFormatChange) {
                currentPreferredFormat = preferredFormat || newColor.format;
            }
        }

        function get(opts) {
            opts = opts || { };

            if (allowEmpty && isEmpty) {
                return null;
            }

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            }, { format: opts.format || currentPreferredFormat });
        }

        function isValid() {
            return !textInput.hasClass("sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
            boundElement.trigger('move.spectrum', [ get() ]);
        }

        function updateUI() {

            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1 && !(currentAlpha === 0 && format === "name")) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get({ format: format }),
                displayColor = '';

             //reset background info for preview element
            previewElement.removeClass("sp-clear-display");
            previewElement.css('background-color', 'transparent');

            if (!realColor && allowEmpty) {
                // Update the replaced elements background with icon indicating no color selection
                previewElement.addClass("sp-clear-display");
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();

                // Update the replaced elements background color (with actual selected color)
                if (rgbaSupport || realColor.alpha === 1) {
                    previewElement.css("background-color", realRgb);
                }
                else {
                    previewElement.css("background-color", "transparent");
                    previewElement.css("filter", realColor.toFilter());
                }

                if (opts.showAlpha) {
                    var rgb = realColor.toRgb();
                    rgb.a = 0;
                    var realAlpha = tinycolor(rgb).toRgbString();
                    var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                    if (IE) {
                        alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                    }
                    else {
                        alphaSliderInner.css("background", "-webkit-" + gradient);
                        alphaSliderInner.css("background", "-moz-" + gradient);
                        alphaSliderInner.css("background", "-ms-" + gradient);
                        // Use current syntax gradient on unprefixed property.
                        alphaSliderInner.css("background",
                            "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                    }
                }

                displayColor = realColor.toString(format);
            }

            // Update the text entry input as it changes happen
            if (opts.showInput) {
                textInput.val(displayColor);
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            if(allowEmpty && isEmpty) {
                //if selected color is empty, hide the helpers
                alphaSlideHelper.hide();
                slideHelper.hide();
                dragHelper.hide();
            }
            else {
                //make sure helpers are visible
                alphaSlideHelper.show();
                slideHelper.show();
                dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = s * dragWidth;
                var dragY = dragHeight - (v * dragHeight);
                dragX = Math.max(
                    -dragHelperHeight,
                    Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                );
                dragY = Math.max(
                    -dragHelperHeight,
                    Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                );
                dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                var alphaX = currentAlpha * alphaWidth;
                alphaSlideHelper.css({
                    "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = (currentHue) * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }

        function updateOriginalInput(fireCallback) {
            var color = get(),
                displayColor = '',
                hasChanged = !tinycolor.equals(color, colorOnShow);

            if (color) {
                displayColor = color.toString(currentPreferredFormat);
                // Update the selection palette with the current color
                addColorToSelectionPalette(color);
            }

            if (isInput) {
                boundElement.val(displayColor);
            }

            colorOnShow = color;

            if (fireCallback && hasChanged) {
                callbacks.change(color);
                boundElement.trigger('change', [ color ]);
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.css("position", "absolute");
                container.offset(getOffset(container, offsetElement));
            }

            updateHelperLocations();

            if (opts.showPalette) {
                drawPalette();
            }

            boundElement.trigger('reflow.spectrum');
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("sp-disabled");
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
            Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

        return offset;
    }

    /**
    * noop - do nothing
    */
    function noop() {

    }

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) {
                    return stop();
                }

                var touches = e.originalEvent.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches = e.originalEvent.touches;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    if (!hasTouch) {
                        move(e);
                    }

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind("touchstart mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }

    function log(){/* jshint -W021 */if(window.console){if(Function.prototype.bind)log=Function.prototype.bind.call(console.log,console);else log=function(){Function.prototype.apply.call(console.log,console,arguments);};log.apply(this,arguments);}}

    /**
    * Define a jQuery plugin
    */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var options = $.extend({}, opts, $(this).data());
            var spect = spectrum(this, options);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.loadOpts = {};
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;

    $.spectrum = { };
    $.spectrum.localization = { };
    $.spectrum.palettes = { };

    $.fn.spectrum.processNativeColorInputs = function () {
        if (!inputTypeColorSupport) {
            $("input[type=color]").spectrum({
                preferredFormat: "hex6"
            });
        }
    };

    // TinyColor v0.9.17
    // https://github.com/bgrins/TinyColor
    // 2013-08-10, Brian Grinstead, MIT License

    (function() {

    var trimLeft = /^[\s,#]+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathRandom = math.random;

    function tinycolor (color, opts) {

        color = (color) ? color : '';
        opts = opts || { };

        // If input is already a tinycolor, return itself
        if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
           return color;
        }

        var rgb = inputToRGB(color);
        var r = rgb.r,
            g = rgb.g,
            b = rgb.b,
            a = rgb.a,
            roundA = mathRound(100*a) / 100,
            format = opts.format || rgb.format;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (r < 1) { r = mathRound(r); }
        if (g < 1) { g = mathRound(g); }
        if (b < 1) { b = mathRound(b); }

        return {
            ok: rgb.ok,
            format: format,
            _tc_id: tinyCounter++,
            alpha: a,
            getAlpha: function() {
                return a;
            },
            setAlpha: function(value) {
                a = boundAlpha(value);
                roundA = mathRound(100*a) / 100;
            },
            toHsv: function() {
                var hsv = rgbToHsv(r, g, b);
                return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: a };
            },
            toHsvString: function() {
                var hsv = rgbToHsv(r, g, b);
                var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                return (a == 1) ?
                  "hsv("  + h + ", " + s + "%, " + v + "%)" :
                  "hsva(" + h + ", " + s + "%, " + v + "%, "+ roundA + ")";
            },
            toHsl: function() {
                var hsl = rgbToHsl(r, g, b);
                return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: a };
            },
            toHslString: function() {
                var hsl = rgbToHsl(r, g, b);
                var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                return (a == 1) ?
                  "hsl("  + h + ", " + s + "%, " + l + "%)" :
                  "hsla(" + h + ", " + s + "%, " + l + "%, "+ roundA + ")";
            },
            toHex: function(allow3Char) {
                return rgbToHex(r, g, b, allow3Char);
            },
            toHexString: function(allow3Char) {
                return '#' + this.toHex(allow3Char);
            },
            toHex8: function() {
                return rgbaToHex(r, g, b, a);
            },
            toHex8String: function() {
                return '#' + this.toHex8();
            },
            toRgb: function() {
                return { r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a };
            },
            toRgbString: function() {
                return (a == 1) ?
                  "rgb("  + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" :
                  "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + roundA + ")";
            },
            toPercentageRgb: function() {
                return { r: mathRound(bound01(r, 255) * 100) + "%", g: mathRound(bound01(g, 255) * 100) + "%", b: mathRound(bound01(b, 255) * 100) + "%", a: a };
            },
            toPercentageRgbString: function() {
                return (a == 1) ?
                  "rgb("  + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%)" :
                  "rgba(" + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%, " + roundA + ")";
            },
            toName: function() {
                if (a === 0) {
                    return "transparent";
                }

                return hexNames[rgbToHex(r, g, b, true)] || false;
            },
            toFilter: function(secondColor) {
                var hex8String = '#' + rgbaToHex(r, g, b, a);
                var secondHex8String = hex8String;
                var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

                if (secondColor) {
                    var s = tinycolor(secondColor);
                    secondHex8String = s.toHex8String();
                }

                return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
            },
            toString: function(format) {
                var formatSet = !!format;
                format = format || this.format;

                var formattedString = false;
                var hasAlphaAndFormatNotSet = !formatSet && a < 1 && a > 0;
                var formatWithAlpha = hasAlphaAndFormatNotSet && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

                if (format === "rgb") {
                    formattedString = this.toRgbString();
                }
                if (format === "prgb") {
                    formattedString = this.toPercentageRgbString();
                }
                if (format === "hex" || format === "hex6") {
                    formattedString = this.toHexString();
                }
                if (format === "hex3") {
                    formattedString = this.toHexString(true);
                }
                if (format === "hex8") {
                    formattedString = this.toHex8String();
                }
                if (format === "name") {
                    formattedString = this.toName();
                }
                if (format === "hsl") {
                    formattedString = this.toHslString();
                }
                if (format === "hsv") {
                    formattedString = this.toHsvString();
                }

                if (formatWithAlpha) {
                    return this.toRgbString();
                }

                return formattedString || this.toHexString();
            }
        };
    }

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

    // Given a string or object, convert that input to RGB
    // Possible string inputs:
    //
    //     "red"
    //     "#f00" or "f00"
    //     "#ff0000" or "ff0000"
    //     "#ff000000" or "ff000000"
    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
    //
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


    // Conversion Functions
    // --------------------

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    // `hslToRgb`
    // Converts an HSL color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
     function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }
        // `rgbaToHex`
        // Converts an RGBA color plus alpha transparency to hex
        // Assumes r, g, b and a are contained in the set [0, 255]
        // Returns an 8 character hex
        function rgbaToHex(r, g, b, a) {

            var hex = [
                pad2(convertDecimalToHex(a)),
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            return hex.join("");
        }

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };
    tinycolor.random = function() {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };


    // Modification Functions
    // ----------------------
    // Thanks to less.js for some of the basics here
    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    tinycolor.desaturate = function (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    };
    tinycolor.saturate = function (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    };
    tinycolor.greyscale = function(color) {
        return tinycolor.desaturate(color, 100);
    };
    tinycolor.lighten = function(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    };
    tinycolor.darken = function (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    };
    tinycolor.complement = function(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    };


    // Combination Functions
    // ---------------------
    // Thanks to jQuery xColor for some of the ideas behind these
    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    tinycolor.triad = function(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    };
    tinycolor.tetrad = function(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    };
    tinycolor.splitcomplement = function(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    };
    tinycolor.analogous = function(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    };
    tinycolor.monochromatic = function(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    };


    // Readability Functions
    // ---------------------
    // <http://www.w3.org/TR/AERT#color-contrast>

    // `readability`
    // Analyze the 2 colors and returns an object with the following properties:
    //    `brightness`: difference in brightness between the two colors
    //    `color`: difference in color/hue between the two colors
    tinycolor.readability = function(color1, color2) {
        var a = tinycolor(color1).toRgb();
        var b = tinycolor(color2).toRgb();
        var brightnessA = (a.r * 299 + a.g * 587 + a.b * 114) / 1000;
        var brightnessB = (b.r * 299 + b.g * 587 + b.b * 114) / 1000;
        var colorDiff = (
            Math.max(a.r, b.r) - Math.min(a.r, b.r) +
            Math.max(a.g, b.g) - Math.min(a.g, b.g) +
            Math.max(a.b, b.b) - Math.min(a.b, b.b)
        );

        return {
            brightness: Math.abs(brightnessA - brightnessB),
            color: colorDiff
        };
    };

    // `readable`
    // http://www.w3.org/TR/AERT#color-contrast
    // Ensure that foreground and background color combinations provide sufficient contrast.
    // *Example*
    //    tinycolor.readable("#000", "#111") => false
    tinycolor.readable = function(color1, color2) {
        var readability = tinycolor.readability(color1, color2);
        return readability.brightness > 125 && readability.color > 500;
    };

    // `mostReadable`
    // Given a base color and a list of possible foreground or background
    // colors for that base, returns the most readable color.
    // *Example*
    //    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
    tinycolor.mostReadable = function(baseColor, colorList) {
        var bestColor = null;
        var bestScore = 0;
        var bestIsReadable = false;
        for (var i=0; i < colorList.length; i++) {

            // We normalize both around the "acceptable" breaking point,
            // but rank brightness constrast higher than hue.

            var readability = tinycolor.readability(baseColor, colorList[i]);
            var readable = readability.brightness > 125 && readability.color > 500;
            var score = 3 * (readability.brightness / 125) + (readability.color / 500);

            if ((readable && ! bestIsReadable) ||
                (readable && bestIsReadable && score > bestScore) ||
                ((! readable) && (! bestIsReadable) && score > bestScore)) {
                bestIsReadable = readable;
                bestScore = score;
                bestColor = tinycolor(colorList[i]);
            }
        }
        return bestColor;
    };


    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    // Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);


    // Utilities
    // ---------

    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    // Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    // Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    // Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    // Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    // Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    // Expose tinycolor to window, does not need to run in non-browser context.
    window.tinycolor = tinycolor;

    })();


    $(function () {
        if ($.fn.spectrum.load) {
            $.fn.spectrum.processNativeColorInputs();
        }
    });

})(window, jQuery);
;
/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms3d-csstransitions-touch-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:w(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&w("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,e.prefixed=function(a,b,c){return b?F(a,b,c):F(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};

jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,f,a,h,g){return jQuery.easing[jQuery.easing.def](e,f,a,h,g)},easeInQuad:function(e,f,a,h,g){return h*(f/=g)*f+a},easeOutQuad:function(e,f,a,h,g){return -h*(f/=g)*(f-2)+a},easeInOutQuad:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f+a}return -h/2*((--f)*(f-2)-1)+a},easeInCubic:function(e,f,a,h,g){return h*(f/=g)*f*f+a},easeOutCubic:function(e,f,a,h,g){return h*((f=f/g-1)*f*f+1)+a},easeInOutCubic:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f+a}return h/2*((f-=2)*f*f+2)+a},easeInQuart:function(e,f,a,h,g){return h*(f/=g)*f*f*f+a},easeOutQuart:function(e,f,a,h,g){return -h*((f=f/g-1)*f*f*f-1)+a},easeInOutQuart:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f+a}return -h/2*((f-=2)*f*f*f-2)+a},easeInQuint:function(e,f,a,h,g){return h*(f/=g)*f*f*f*f+a},easeOutQuint:function(e,f,a,h,g){return h*((f=f/g-1)*f*f*f*f+1)+a},easeInOutQuint:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f*f+a}return h/2*((f-=2)*f*f*f*f+2)+a},easeInSine:function(e,f,a,h,g){return -h*Math.cos(f/g*(Math.PI/2))+h+a},easeOutSine:function(e,f,a,h,g){return h*Math.sin(f/g*(Math.PI/2))+a},easeInOutSine:function(e,f,a,h,g){return -h/2*(Math.cos(Math.PI*f/g)-1)+a},easeInExpo:function(e,f,a,h,g){return(f==0)?a:h*Math.pow(2,10*(f/g-1))+a},easeOutExpo:function(e,f,a,h,g){return(f==g)?a+h:h*(-Math.pow(2,-10*f/g)+1)+a},easeInOutExpo:function(e,f,a,h,g){if(f==0){return a}if(f==g){return a+h}if((f/=g/2)<1){return h/2*Math.pow(2,10*(f-1))+a}return h/2*(-Math.pow(2,-10*--f)+2)+a},easeInCirc:function(e,f,a,h,g){return -h*(Math.sqrt(1-(f/=g)*f)-1)+a},easeOutCirc:function(e,f,a,h,g){return h*Math.sqrt(1-(f=f/g-1)*f)+a},easeInOutCirc:function(e,f,a,h,g){if((f/=g/2)<1){return -h/2*(Math.sqrt(1-f*f)-1)+a}return h/2*(Math.sqrt(1-(f-=2)*f)+1)+a},easeInElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return -(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e},easeOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return g*Math.pow(2,-10*h)*Math.sin((h*k-i)*(2*Math.PI)/j)+l+e},easeInOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k/2)==2){return e+l}if(!j){j=k*(0.3*1.5)}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}if(h<1){return -0.5*(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e}return g*Math.pow(2,-10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j)*0.5+l+e},easeInBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*(f/=h)*f*((g+1)*f-g)+a},easeOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*((f=f/h-1)*f*((g+1)*f+g)+1)+a},easeInOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}if((f/=h/2)<1){return i/2*(f*f*(((g*=(1.525))+1)*f-g))+a}return i/2*((f-=2)*f*(((g*=(1.525))+1)*f+g)+2)+a},easeInBounce:function(e,f,a,h,g){return h-jQuery.easing.easeOutBounce(e,g-f,0,h,g)+a},easeOutBounce:function(e,f,a,h,g){if((f/=g)<(1/2.75)){return h*(7.5625*f*f)+a}else{if(f<(2/2.75)){return h*(7.5625*(f-=(1.5/2.75))*f+0.75)+a}else{if(f<(2.5/2.75)){return h*(7.5625*(f-=(2.25/2.75))*f+0.9375)+a}else{return h*(7.5625*(f-=(2.625/2.75))*f+0.984375)+a}}}},easeInOutBounce:function(e,f,a,h,g){if(f<g/2){return jQuery.easing.easeInBounce(e,f*2,0,h,g)*0.5+a}return jQuery.easing.easeOutBounce(e,f*2-g,0,h,g)*0.5+h*0.5+a}});

/**
 * hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
 * <http://cherne.net/brian/resources/jquery.hoverIntent.html>
 *
 * @param  f  onMouseOver function || An object with configuration options
 * @param  g  onMouseOut function  || Nothing (use configuration options object)
 * @author    Brian Cherne brian(at)cherne(dot)net
 */
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery);
/*------------------------------------------------------------------------
 # MD Slider - March 18, 2013
 # ------------------------------------------------------------------------
 # Websites:  http://www.megadrupal.com -  Email: info@megadrupal.com
 --------------------------------------------------------------------------*/

(function ($) {
    $.fn.mdSlider = function(options) {
        var defaults = {
            className: 'md-slide-wrap',
            itemClassName: 'md-slide-item',
            transitions: 'strip-down-left', // name of transition effect (fade, scrollLeft, scrollRight, scrollHorz, scrollUp, scrollDown, scrollVert)
            transitionsSpeed: 800, // speed of the transition (millisecond)
            width: 990, // responsive = false: this appear as container width; responsive = true: use for scale ;fullwidth = true: this is effect zone width
            height: 420, // container height
            responsive: true,
            fullwidth: true,
            styleBorder: 0, // Border style, from 1 - 9, 0 to disable
            styleShadow: 0, // Dropshadow style, from 1 - 5, 0 to disable
            posBullet: 2, // Bullet position, from 1 to 6, default is 5
            posThumb: 1, // Thumbnail position, from 1 to 5, default is 1
            stripCols: 20,
            stripRows: 10,
            slideShowDelay: 6000, // stop time for each slide item (millisecond)
            slideShow: true,
            loop: false,
            pauseOnHover: false,
            showLoading: true, // Show/hide loading bar
            loadingPosition: 'bottom', // choose your loading bar position (top, bottom)
            showArrow: true, // show/hide next, previous arrows
            showBullet: true,
            showThumb: true, // Show thumbnail, if showBullet = true and showThumb = true, thumbnail will be shown when you hover bullet navigation
            enableDrag: true, // Enable mouse drag
            touchSensitive: 50,
            onEndTransition: function() {  },	//this callback is invoked when the transition effect ends
            onStartTransition: function() {  }	//this callback is invoked when the transition effect starts
        };
        options = $.extend({}, defaults, options);
        var self = $(this), slideItems = [], oIndex, activeIndex = -1, numItem = 0, slideWidth, slideHeight, lock = true,
            wrap,
            hoverDiv,
            hasTouch,
            arrowButton,
            buttons,
            loadingBar,
            timerGlow,
            slideThumb,
            minThumbsLeft = 0,
            touchstart,
            mouseleft,
            thumbsDrag = false,
            slideShowDelay = 0,
            play = false,
            pause = false,
            timer,
            step = 0;

        // init
        function init() {
            self.addClass("loading-image");
            self.wrap('<div class="md-slide-fullwidth"><div class="md-item-wrap"></div></div>');
            hoverDiv = self.parent();
            wrap = hoverDiv.parent();
            slideWidth = options.width;
            slideHeight = options.height;
            self.css({width: slideWidth, height: slideHeight});
            slideItems = [];
            self.find('.' + options.itemClassName).each(function (index) {
                numItem++;
                slideItems[index] = $(this);
                if(index > 0)
                    $(this).hide();
            });
        }
        var lock = false;
        function slide(index) {
            step = 0;
            slideShowDelay = slideItems[index].data("timeout") ? slideItems[index].data("timeout") : options.slideShowDelay;
            if (index != activeIndex) {
                oIndex = activeIndex;
                activeIndex = index;
                if (slideItems[oIndex]) {
                    var fx = self.data("transitions") || "";
                    //Generate random transition
                    if (fx.toLowerCase() == 'random') {
                        var transitions = new Array(
                            'slit-horizontal-left-top',
                            'slit-horizontal-top-right',
                            'slit-horizontal-bottom-up',
                            'slit-vertical-down',
                            'slit-vertical-up',
                            'strip-up-right',
                            'strip-up-left',
                            'strip-down-right',
                            'strip-down-left',
                            'strip-left-up',
                            'strip-left-down',
                            'strip-right-up',
                            'strip-right-down',
                            'strip-right-left-up',
                            'strip-right-left-down',
                            'strip-up-down-right',
                            'strip-up-down-left',
                            'left-curtain',
                            'right-curtain',
                            'top-curtain',
                            'bottom-curtain',
                            'slide-in-right',
                            'slide-in-left',
                            'slide-in-up',
                            'slide-in-down');
                        fx = transitions[Math.floor(Math.random() * (transitions.length + 1))];
                        if (fx == undefined) fx = 'fade';
                        fx = $.trim(fx.toLowerCase());
                    }

                    //Custom transition as defined by "data-transition" attribute
                    if (slideItems[activeIndex].data('transition')) {
                        var transitions = slideItems[activeIndex].data('transition').split(',');
                        fx = transitions[Math.floor(Math.random() * (transitions.length))];
                        fx = $.trim(fx.toLowerCase());
                    }
                    if(!(this.support = Modernizr.csstransitions && Modernizr.csstransforms3d) && (fx == 'slit-horizontal-left-top' || fx == 'slit-horizontal-top-right' || fx == 'slit-horizontal-bottom-up' || fx == 'slit-vertical-down' || fx == 'slit-vertical-up')) {
                        fx = 'fade';
                    }
                    lock = true;
                    runTransition(fx);
                } else {
                    slideItems[activeIndex].css({top:0, left:0}).show();
                    lock = false;
                }
            }
        }
        function setTransition(fx) {
            options.transitions = fx;
        }
        function setTimer() {
            slide(0);
            timer = setInterval(next, 40);
        }
        function next() {
            if(lock) return false;
            step += 40;
            if(step > slideShowDelay) {
                slideNext();
            }
        }

        function slideNext() {
            if(lock) return false;
            var index = activeIndex;
            index++;
            if(index >= numItem && options.loop) {
                index = 0;
                slide(index);
            } else if(index < numItem) {
                slide(index);
            }
        }
        function slidePrev() {
            if(lock) return false;
            var index = activeIndex;
            index--;
            if(index < 0 && options.loop) {
                index = numItem - 1;
                slide(index);
            } else if(index >= 0) {
                slide(index);
            }
        }

        //When Animation finishes
        function transitionEnd() {
            options.onEndTransition.call(self);
            $('.md-strips-container', self).remove();
            slideItems[oIndex].hide();
            slideItems[activeIndex].show();
            lock = false;
        }
        // Add strips
        function addStrips(vertical, opts) {
            var strip,
                opts = (opts) ? opts : options;;
            var stripsContainer = $('<div class="md-strips-container"></div>');
            var stripWidth = Math.round(slideWidth / opts.strips),
                stripHeight = Math.round(slideHeight / opts.strips),
                $image = $(".md-mainimg img", slideItems[activeIndex]);
            for (var i = 0; i < opts.strips; i++) {
                var top = ((vertical) ? (stripHeight * i) + 'px' : '0px'),
                    left = ((vertical) ? '0px' : (stripWidth * i) + 'px'),
                    width, height;

                if (i == opts.strips - 1) {
                    width = ((vertical) ? '0px' : (slideWidth - (stripWidth * i)) + 'px'),
                        height = ((vertical) ? (slideHeight - (stripHeight * i)) + 'px' : '0px');
                } else {
                    width = ((vertical) ? '0px' : stripWidth + 'px'),
                        height = ((vertical) ? stripHeight + 'px' : '0px');
                }

                strip = $('<div class="mdslider-strip"></div>').css({
                    width: width,
                    height: height,
                    top: top,
                    left: left,
                    opacity: 0
                }).append($image.clone().css({
                        marginLeft: vertical ? 0 : -(i * stripWidth) + "px",
                        marginTop: vertical ? -(i * stripHeight) + "px" : 0
                    }));
                stripsContainer.append(strip);
            }
            self.append(stripsContainer);
        }
        // Add strips
        function addTiles(x, y, index) {
            var tile;
            var stripsContainer = $('<div class="md-strips-container"></div>');
            var tileWidth = slideWidth / x,
                tileHeight = slideHeight / y,
                $image = $(".md-mainimg img", slideItems[index]);
            for(var i = 0; i < y; i++) {
                for(var j = 0; j < x; j++) {
                    var top = (tileHeight * i) + 'px',
                        left = (tileWidth * j) + 'px';
                    tile = $('<div class="mdslider-tile"/>').css({
                        width: tileWidth,
                        height: tileHeight,
                        top: top,
                        left: left
                    }).append($image.clone().css({
                            marginLeft: "-" + left,
                            marginTop: "-" + top
                        }));
                    stripsContainer.append(tile);
                }
            }
            self.append(stripsContainer);
        }
        // Add strips
        function addStrips2() {
            var strip,
                images = [$(".md-mainimg img", slideItems[oIndex]), $(".md-mainimg img", slideItems[activeIndex])];
            var stripsContainer = $('<div class="md-strips-container"></div>');
            for (var i = 0; i < 2; i++) {
                strip = $('<div class="mdslider-strip"></div>').css({
                    width: slideWidth,
                    height: slideHeight
                }).append(images[i].clone());
                stripsContainer.append(strip);
            }
            self.append(stripsContainer);
        }
        // Add strips
        function addSlits(fx) {
            var $stripsContainer = $('<div class="md-strips-container ' + fx + '"></div>'),
                $image = $(".md-mainimg img", slideItems[oIndex]),
                $div1 = $('<div class="mdslider-slit"/>').append($image.clone()),
                $div2 = $('<div class="mdslider-slit"/>').append($image.clone().css("top", "-75px"));
            if(fx == "slit-vertical-down" || fx == "slit-vertical-up")
                $div2 = $('<div class="mdslider-slit"/>').append($image.clone().css("left", "-145px"));

            $stripsContainer.append($div1).append($div2);
            self.append($stripsContainer);
        }
        function runTransition(fx) {
            switch (fx) {
                case 'slit-horizontal-left-top':
                case 'slit-horizontal-top-right':
                case 'slit-horizontal-bottom-up':
                case 'slit-vertical-down':
                case 'slit-vertical-up':
                    addSlits(fx);
                    $(".md-object", slideItems[activeIndex]).hide();
                    slideItems[oIndex].hide();
                    slideItems[activeIndex].show();
                    var slice1 = $('.mdslider-slit', self).first(),
                        slice2 = $('.mdslider-slit', self).last();
                    var transitionProp = {
                        'transition' : 'all ' + options.transitionsSpeed + 'ms ease-in-out',
                        '-webkit-transition' : 'all ' + options.transitionsSpeed + 'ms ease-in-out',
                        '-moz-transition' : 'all ' + options.transitionsSpeed + 'ms ease-in-out',
                        '-ms-transition' : 'all ' + options.transitionsSpeed + 'ms ease-in-out'
                    };
                    $('.mdslider-slit', self).css(transitionProp);
                    setTimeout( function() {
                        slice1.addClass("md-trans-elems-1");
                        slice2.addClass("md-trans-elems-2");
                    }, 50 );
                    setTimeout(function() {
                        options.onEndTransition.call(self);
                        $('.md-strips-container', self).remove();
                        lock = false;
                    }, options.transitionsSpeed);
                    break;
                case 'strip-up-right':
                case 'strip-up-left':
                    addTiles(options.stripCols, 1, activeIndex);
                    var strips = $('.mdslider-tile', self),
                        timeStep = options.transitionsSpeed / options.stripCols / 2,
                        speed = options.transitionsSpeed / 2;
                    if (fx == 'strip-up-right') strips = $('.mdslider-tile', self).reverse();
                    strips.css({
                        height: '1px',
                        bottom: '0px',
                        top: "auto"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                height: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == options.stripCols - 1) transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-down-right':
                case 'strip-down-left':
                    addTiles(options.stripCols, 1, activeIndex);
                    var strips = $('.mdslider-tile', self),
                        timeStep = options.transitionsSpeed / options.stripCols / 2,
                        speed = options.transitionsSpeed / 2;
                    if (fx == 'strip-down-right') strips = $('.mdslider-tile', self).reverse();
                    strips.css({
                        height: '1px',
                        top: '0px',
                        bottom: "auto"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                height: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == options.stripCols - 1) transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-left-up':
                case 'strip-left-down':
                    addTiles(1, options.stripRows, activeIndex);
                    var strips = $('.mdslider-tile', self),
                        timeStep = options.transitionsSpeed / options.stripRows / 2,
                        speed = options.transitionsSpeed / 2;
                    if (fx == 'strip-left-up') strips = $('.mdslider-tile', self).reverse();
                    strips.css({
                        width: '1px',
                        left: '0px',
                        right: "auto"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                width: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == options.stripRows - 1) transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-right-up':
                case 'strip-right-down':
                    addTiles(1, options.stripRows, activeIndex);
                    var strips = $('.mdslider-tile', self),
                        timeStep = options.transitionsSpeed / options.stripRows / 2,
                        speed = options.transitionsSpeed / 2;
                    if (fx == 'strip-left-right-up') strips = $('.mdslider-tile', self).reverse();
                    strips.css({
                        width: '1px',
                        left: 'auto',
                        right: "1px"
                    });
                    strips.each(function (i) {
                        var strip = $(this);
                        setTimeout(function () {
                            strip.animate({
                                width: '100%',
                                opacity: '1.0'
                            }, speed, 'easeInOutQuart', function () {
                                if (i == options.stripRows - 1) transitionEnd();
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-right-left-up':
                case 'strip-right-left-down':
                    addTiles(1, options.stripRows, oIndex);
                    slideItems[oIndex].hide();
                    slideItems[activeIndex].show();
                    var strips = $('.mdslider-tile', self),
                        timeStep = options.transitionsSpeed / options.stripRows,
                        speed = options.transitionsSpeed / 2;
                    if (fx == 'strip-right-left-up') strips = $('.mdslider-tile', self).reverse();
                    strips.filter(':odd').css({
                        width: '100%',
                        right: '0px',
                        left: "auto",
                        opacity: 1
                    }).end().filter(':even').css({
                            width: '100%',
                            right: 'auto',
                            left: "0px",
                            opacity: 1
                        });;
                    strips.each(function (i) {
                        var strip = $(this);
                        var css = (i%2 == 0) ? {left: '-50%',opacity: '0'} : {right: '-50%', opacity: '0'};
                        setTimeout(function () {
                            strip.animate(css, speed, 'easeOutQuint', function () {
                                if (i == options.stripRows - 1) {
                                    options.onEndTransition.call(self);
                                    $('.md-strips-container', self).remove();
                                    lock = false;
                                }
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'strip-up-down-right':
                case 'strip-up-down-left':
                    addTiles(options.stripCols, 1, oIndex);
                    slideItems[oIndex].hide();
                    slideItems[activeIndex].show();
                    var strips = $('.mdslider-tile', self),
                        timeStep = options.transitionsSpeed / options.stripCols / 2 ,
                        speed = options.transitionsSpeed / 2;
                    if (fx == 'strip-up-down-right') strips = $('.mdslider-tile', self).reverse();
                    strips.filter(':odd').css({
                        height: '100%',
                        bottom: '0px',
                        top: "auto",
                        opacity: 1
                    }).end().filter(':even').css({
                            height: '100%',
                            bottom: 'auto',
                            top: "0px",
                            opacity: 1
                        });;
                    strips.each(function (i) {
                        var strip = $(this);
                        var css = (i%2 == 0) ? {top: '-50%',opacity: 0} : {bottom: '-50%', opacity: 0};
                        setTimeout(function () {
                            strip.animate(css, speed, 'easeOutQuint', function () {
                                if (i == options.stripCols - 1) {
                                    options.onEndTransition.call(self);
                                    $('.md-strips-container', self).remove();
                                    lock = false;
                                }
                            });
                        }, i * timeStep);
                    });
                    break;
                case 'left-curtain':
                    addTiles(options.stripCols, 1, activeIndex);
                    var strips = $('.mdslider-tile', self),
                        width = slideWidth / options.stripCols,
                        timeStep = options.transitionsSpeed / options.stripCols / 2;
                    strips.each(function (i) {
                        var strip = $(this);
                        strip.css({left: width * i, width: 0, opacity: 0});
                        setTimeout(function () {
                            strip.animate({
                                width: width,
                                opacity: '1.0'
                            }, options.transitionsSpeed / 2, function () {
                                if (i == options.stripCols - 1) transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'right-curtain':
                    addTiles(options.stripCols, 1, activeIndex);
                    var strips = $('.mdslider-tile', self).reverse(),
                        width = slideWidth / options.stripCols,
                        timeStep = options.transitionsSpeed / options.stripCols / 2;
                    strips.each(function (i) {
                        var strip = $(this);
                        strip.css({right: width * i, left: "auto", width: 0, opacity: 0});
                        setTimeout(function () {
                            strip.animate({
                                width: width,
                                opacity: '1.0'
                            }, options.transitionsSpeed / 2, function () {
                                if (i == options.stripCols - 1) transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'top-curtain':
                    addTiles(1, options.stripRows, activeIndex);
                    var strips = $('.mdslider-tile', self),
                        height = slideHeight / options.stripRows,
                        timeStep = options.transitionsSpeed / options.stripRows / 2;
                    strips.each(function (i) {
                        var strip = $(this);
                        strip.css({top: height * i, height: 0, opacity: 0});
                        setTimeout(function () {
                            strip.animate({
                                height: height,
                                opacity: '1.0'
                            }, options.transitionsSpeed / 2, function () {
                                if (i == options.stripRows - 1) transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'bottom-curtain':
                    addTiles(1, options.stripRows, activeIndex);
                    var strips = $('.mdslider-tile', self).reverse(),
                        height = slideHeight / options.stripRows,
                        timeStep = options.transitionsSpeed / options.stripRows / 2;
                    strips.each(function (i) {
                        var strip = $(this);
                        strip.css({bottom: height * i, height: 0, opacity: 0});
                        setTimeout(function () {
                            strip.animate({
                                height: height,
                                opacity: '1.0'
                            }, options.transitionsSpeed / 2, function () {
                                if (i == options.stripRows - 1) transitionEnd();
                            });
                        }, timeStep * i);
                    });
                    break;
                case 'slide-in-right':
                    var i = 0;
                    addStrips2();
                    var strips = $('.mdslider-strip', self);
                    strips.each(function() {
                        strip = $(this);
                        var left = i * slideWidth;
                        strip.css({
                            left: left
                        });
                        strip.animate({
                            left: left - slideWidth
                        }, options.transitionsSpeed, function () {
                            transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'slide-in-left':
                    var i = 0;
                    addStrips2();
                    var strips = $('.mdslider-strip', self);
                    strips.each(function() {
                        strip = $(this);
                        var left = -i * slideWidth;
                        strip.css({
                            left: left
                        });
                        strip.animate({
                            left: slideWidth + left
                        }, (options.transitionsSpeed * 2), function () {
                            transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'slide-in-up':
                    var i = 0;
                    addStrips2();
                    var strips = $('.mdslider-strip', self);
                    strips.each(function() {
                        strip = $(this);
                        var top = i * slideHeight;
                        strip.css({
                            top: top
                        });
                        strip.animate({
                            top: top - slideHeight
                        }, options.transitionsSpeed, function () {
                            transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'slide-in-down':
                    var i = 0;
                    addStrips2();
                    var strips = $('.mdslider-strip', self);
                    strips.each(function() {
                        strip = $(this);
                        var top = -i * slideHeight;
                        strip.css({
                            top: top
                        });
                        strip.animate({
                            top: slideHeight + top
                        }, options.transitionsSpeed, function () {
                            transitionEnd();
                        });
                        i++;
                    });
                    break;
                case 'fade':
                default:
                    var opts = {
                        strips: 1
                    };
                    addStrips(false, opts);
                    var strip = $('.mdslider-strip:first', self);
                    strip.css({
                        'height': '100%',
                        'width': slideWidth
                    });
                    if (fx == 'slide-in-right') strip.css({
                        'height': '100%',
                        'width': slideWidth,
                        'left': slideWidth + 'px',
                        'right': ''
                    });
                    else if (fx == 'slide-in-left') strip.css({
                        'left': '-' + slideWidth + 'px'
                    });

                    strip.animate({
                        left: '0px',
                        opacity: 1
                    }, options.transitionsSpeed, function () {
                        transitionEnd();
                    });
                    break;
            }
        }
        function preloadImages() {
            var count = $(".md-slide-item .md-mainimg img", self).length;
            self.data('count', count);
            if(self.data('count') == 0)
                slideReady();
            $(".md-slide-item .md-mainimg img", self).each(function() {
                $(this).load(function() {
                    var $image = $(this);
                    if(!$image.data('defW')) {
                        var dimensions = getImgSize($image.attr("src"));
                        changeImagePosition($image, dimensions.width, dimensions.height);
                        $image.data({
                            'defW': dimensions.width,
                            'defH': dimensions.height
                        });
                    }
                    self.data('count', self.data('count') - 1);
                    if(self.data('count') == 0)
                        slideReady();
                });
                if(this.complete) $(this).load();
            });
        }
        function slideReady() {
            self.removeClass("loading-image");
            setTimer();
        }
        function changeImagePosition($background, width, height) {
            var panelWidth = $(".md-slide-item:visible", self).width(),
                panelHeight = $(".md-slide-item:visible", self).height();

            if(height > 0 && panelHeight > 0) {
                if (((width / height) > (panelWidth / panelHeight))) {
                    var left = panelWidth - (panelHeight / height) * width;
                    $background.css({width: "auto", height: panelHeight + "px"});
                    if(left < 0) {
                        $background.css({left: (left/2) + "px", top: 0 });
                    } else {
                        $background.css({left: 0, top: 0 });
                    }
                } else {
                    var top = panelHeight - (panelWidth / width) * height;
                    $background.css({width: panelWidth + "px", height: "auto"});
                    if(top < 0) {
                        $background.css({top: (top/2) + "px", left: 0 });
                    } else {
                        $background.css({left: 0, top: 0 });
                    }
                }
            }
        }
        function getImgSize(imgSrc) {
            var newImg = new Image();
            newImg.src = imgSrc;
            var dimensions = {height: newImg.height, width: newImg.width};
            return dimensions;
        }
        function slideReady() {
            self.removeClass("loading-image");
            setTimer();
        }

        init();
        preloadImages();
        return self;
    }
    $.fn.reverse = [].reverse;
})(jQuery);
;
/*------------------------------------------------------------------------
 # MD Slider - March 18, 2013
 # ------------------------------------------------------------------------
 --------------------------------------------------------------------------*/

(function(e){function t(e,n){return e.length<n?t("0"+e,n):e}e.fn.triggerItemEvent=function(){var t=e(this).data("slidepanel");if(t==null)return;var n=e(this);n.draggable({containment:"parent",stop:function(r,i){var s=Math.round(e(i.helper).position().left),o=Math.round(e(i.helper).position().top);n.data("left",s);n.data("top",o);t.mdSliderToolbar.changePositionValue(s,o)}});n.resizable({handles:"e, s, se",containment:"parent",resize:function(r,i){var s=Math.round(e(i.helper).width()),o=Math.round(e(i.helper).height());n.data("width",s);n.data("height",o);t.mdSliderToolbar.changeSizeValue(s,o)}});n.bind("mousedown",function(n){if(n.ctrlKey){e(this).addClass("ui-selected")}else{if(!e(this).hasClass("ui-selected")){e(this).siblings(".slider-item").removeClass("ui-selected");e(this).addClass("ui-selected")}else{e(this).siblings(".slider-item.ui-selected").removeClass("ui-selected")}}t.triggerChangeSelectItem()});return this};e.fn.getItemValues=function(){if(e(this).hasClass("slider-item")){var t={width:e(this).data("width"),height:e(this).data("height"),left:e(this).data("left"),top:e(this).data("top"),starttime:e(this).data("starttime")?Math.round(e(this).data("starttime")):0,stoptime:e(this).data("stoptime")?Math.round(e(this).data("stoptime")):0,startani:e(this).data("startani"),stopani:e(this).data("stopani"),opacity:e(this).data("opacity"),style:e(this).data("style"),zindex:e(this).css("z-index"),type:e(this).data("type"),title:e(this).data("title"),backgroundcolor:e(this).data("backgroundcolor")==undefined||e(this).data("backgroundcolor")===""?null:e(this).data("backgroundcolor")==0?"#000000":e.fixHex(e(this).data("backgroundcolor").toString()),backgroundtransparent:e(this).data("backgroundtransparent"),borderposition:e(this).data("borderposition"),borderwidth:e(this).data("borderwidth"),borderstyle:e(this).data("borderstyle"),bordercolor:e(this).data("bordercolor")==undefined||e(this).data("bordercolor")===""?null:e(this).data("bordercolor")==0?"#000000":e.fixHex(e(this).data("bordercolor").toString()),bordertopleftradius:e(this).data("bordertopleftradius"),bordertoprightradius:e(this).data("bordertoprightradius"),borderbottomrightradius:e(this).data("borderbottomrightradius"),borderbottomleftradius:e(this).data("borderbottomleftradius"),paddingtop:e(this).data("paddingtop"),paddingright:e(this).data("paddingright"),paddingbottom:e(this).data("paddingbottom"),paddingleft:e(this).data("paddingleft"),link:e(this).data("link")};if(e(this).data("type")=="text"){e.extend(t,{fontsize:e(this).data("fontsize"),fontfamily:e(this).data("fontfamily"),fontweight:e(this).data("fontweight"),fontstyle:e(this).data("fontstyle"),textdecoration:e(this).data("textdecoration"),texttransform:e(this).data("texttransform"),textalign:e(this).data("textalign"),color:e(this).data("color")==undefined||e(this).data("color")===""?null:e(this).data("color")==0?"#000000":e.fixHex(e(this).data("color").toString())})}else{e.extend(t,{fileid:e(this).data("fileid"),thumb:e(this).find("img").attr("src")})}return t}return null};e.fn.setItemValues=function(t){if(e(this).hasClass("slider-item")){for(var n in t){e(this).data(n,t[n])}return true}return null};e.fn.setItemStyle=function(t){if(e(this).hasClass("slider-item")){var n=[];if(t.style)e(this).addClass(t.style);if(t.width)n["width"]=t.width;if(t.height)n["height"]=t.height;if(t.top)n["top"]=t.top;if(t.left)n["left"]=t.left;if(t.opacity)n["opacity"]=t.opacity/100;if(t.backgroundcolor!=null){var r=t.backgroundcolor;var i=parseInt(t.backgroundtransparent);var s=e.HexToRGB(r);i=i?i:100;var o="rgba("+s.r+","+s.g+","+s.b+","+i/100+")";n["background-color"]=o}if(t.bordercolor)n["border-color"]=t.bordercolor;if(t.borderwidth)n["border-width"]=t.borderwidth+"px";var u="none";if(t.borderposition&&t.borderstyle){var a=t.borderposition,f=t.borderstyle;if(a&1){u=f}else{u="none"}if(a&2){u+=" "+f}else{u+=" none"}if(a&4){u+=" "+f}else{u+=" none"}if(a&8){u+=" "+f}else{u+=" none"}}n["border-style"]=u;if(t.bordertopleftradius)n["border-top-left-radius"]=t.bordertopleftradius+"px";if(t.bordertoprightradius)n["border-top-right-radius"]=t.bordertoprightradius+"px";if(t.borderbottomrightradius)n["border-bottom-right-radius"]=t.borderbottomrightradius+"px";if(t.borderbottomleftradius)n["border-bottom-left-radius"]=t.borderbottomleftradius+"px";if(t.paddingtop)n["padding-top"]=t.paddingtop+"px";if(t.paddingright)n["padding-right"]=t.paddingright+"px";if(t.paddingbottom)n["padding-bottom"]=t.paddingbottom+"px";if(t.paddingleft)n["padding-left"]=t.paddingleft+"px";if(t.type=="text"){if(t.fontsize)n["font-size"]=t.fontsize+"px";if(t.fontfamily)n["font-family"]=t.fontfamily;if(t.fontweight)n["font-weight"]=t.fontweight;if(t.fontstyle)n["font-style"]=t.fontstyle;if(t.textdecoration)n["text-decoration"]=t.textdecoration;if(t.texttransform)n["text-transform"]=t.texttransform;if(t.textalign)n["text-align"]=t.textalign;if(t.color)n["color"]=t.color}e(this).css(n)}return false};e.fn.setItemHtml=function(t){if(e(this).hasClass("slider-item")){if(t.type=="text"){e(this).find("p").html(t.title.replace(/\n/g,"<br />"))}else{e(this).find("img").attr("src",t.thumb)}}return false};e.HexToRGB=function(e){var e=parseInt(e.toString().indexOf("#")>-1?e.substring(1):e,16);return{r:e>>16,g:(e&65280)>>8,b:e&255}};e.removeMinusSign=function(e){return e.replace(/-/g,"")};e.objectToString=function(e){return JSON.stringify(e)};e.stringToObject=function(e){return jQuery.parseJSON(e)};e.fixHex=function(e){var t=6-e.length;if(t>0){var n=[];for(var r=0;r<t;r++){n.push("0")}n.push(e);e=n.join("")}return e}})(jQuery);
/*------------------------------------------------------------------------
# MD Slider - March 18, 2013
# ------------------------------------------------------------------------
--------------------------------------------------------------------------*/

(function(e){var t=function(t){var n=this;this.panel=t;this.selectedItem=null;this.init=function(){e("#md-toolbar a").click(function(){if(e(this).hasClass("mdt-text")){n.panel.addBoxItem("text")}else if(e(this).hasClass("mdt-image")){n.panel.addBoxItem("image")}else if(e(this).hasClass("mdt-video")){n.panel.addBoxItem("video")}else if(e(this).hasClass("mdt-align-left")){n.panel.alignLeftSelectedBox()}else if(e(this).hasClass("mdt-align-right")){n.panel.alignRightSelectedBox()}else if(e(this).hasClass("mdt-align-center")){n.panel.alignCenterSelectedBox()}else if(e(this).hasClass("mdt-align-top")){n.panel.alignTopSelectedBox()}else if(e(this).hasClass("mdt-align-bottom")){n.panel.alignBottomSelectedBox()}else if(e(this).hasClass("mdt-align-vcenter")){n.panel.alignMiddleSelectedBox(e("input.mdt-spacei","#md-toolbar").val())}else if(e(this).hasClass("mdt-spacev")){n.panel.spaceVertical(e("input.mdt-spacei","#md-toolbar").val())}else if(e(this).hasClass("mdt-spaceh")){n.panel.spaceHorizontal(e("input.mdt-spacei","#md-toolbar").val())}return false});e("input.mdt-width","#md-toolbar").keyup(function(){if(e("a.mdt-proportions","#md-toolbar").hasClass("mdt-proportions-yes")){var t=e("a.mdt-proportions","#md-toolbar").data("proportions");if(t>0){e("input.mdt-height","#md-toolbar").val(Math.round(e(this).val()/t))}}});e("input.mdt-height","#md-toolbar").keyup(function(){if(e("a.mdt-proportions","#md-toolbar").hasClass("mdt-proportions-yes")){var t=e("a.mdt-proportions","#md-toolbar").data("proportions");if(t>0){e("input.mdt-width","#md-toolbar").val(Math.round(e(this).val()*t))}}});e("input, select","#md-toolbar").keypress(function(t){var n=t.keyCode||t.which;if(n==13){e(this).trigger("change");t.preventDefault()}});e("input.mdt-input, select.mdt-input","#md-toolbar").change(function(){var t=e(this).attr("name");switch(t){case"background-transparent":case"background-color":n.panel.setItemBackground(t,e(this).val());return true;break;case"left":case"top":n.panel.setItemAttribute(t,e(this).val());break;case"width":case"height":n.panel.setItemSize(e("input.mdt-width","#md-toolbar").val(),e("input.mdt-height","#md-toolbar").val());break;case"font-size":n.panel.setItemFontSize(t,e(this).val());break;case"style":n.panel.setItemStyle(t,e(this).val());break;case"opacity":n.panel.setItemOpacity(t,e(this).val());break;case"color":n.panel.setItemColor(e(this).val());break;case"border-color":n.panel.setItemBorderColor(t,e(this).val());break;case"border-width":n.panel.setItemCssPx(t,e(this).val());break;case"border-style":n.panel.changeBorderStyle(e(this).val());break;default:n.panel.setItemCss(t,e(this).val())}return false});e("a.button-style","#md-toolbar").click(function(){if(e(this).hasClass("active")){n.panel.setItemCss(e(this).attr("name"),e(this).attr("normal"));e(this).removeClass("active")}else{n.panel.setItemCss(e(this).attr("name"),e(this).attr("active"));e(this).addClass("active")}return false});e("a.button-align","#md-toolbar").click(function(){if(e(this).hasClass("active")){if(e(this).hasClass("mdt-left-alignment"))return;n.panel.setItemCss("text-align","left");e("a.mdt-left-alignment","#md-toolbar").addClass("active");e(this).removeClass("active")}else{n.panel.setItemCss("text-align",e(this).attr("value"));e("a.button-align","#md-toolbar").removeClass("active");e(this).addClass("active")}return false});e("textarea","#md-toolbar").keyup(function(){n.panel.setItemTitle(e(this).val())});e("a.mdt-proportions","#md-toolbar").click(function(){if(!e("#md-toolbar").attr("disabled")||e("#md-toolbar").attr("disabled")=="false"){if(e(this).hasClass("mdt-proportions-yes")){e(this).removeClass("mdt-proportions-yes")}else{var t=e("input.mdt-width","#md-toolbar").val();var n=e("input.mdt-height","#md-toolbar").val();var r=1;if(t>0&&n>0)r=t/n;e(this).data("proportions",r);e(this).addClass("mdt-proportions-yes")}}});e("#dlg-video").dialog({resizable:false,autoOpen:false,draggable:false,modal:true,width:680,buttons:{OK:function(){n.updateVideo(e("#videoid").val(),e("#videoname").val(),e("#videothumb").attr("src"));e(this).dialog("close")}},open:function(){var t=n.getVideoValue();e("#videoid").val(t.id);e("#videoname").val(t.name);e("#videothumb").attr("src",t.thumbsrc)},close:function(){e(this).empty()}});e("input[name=background-color]","#md-toolbar").spectrum({showInput:true,allowEmpty:true,preferredFormat:"hex",showButtons:false,move:function(t){if(t)e("input[name=background-color]","#md-toolbar").val(t.toHexString()).trigger("change");else e("input[name=background-color]","#md-toolbar").val("").trigger("change")},hide:function(){var t=e("input[name=background-color]","#md-toolbar").val();if(t!=""){e("input[name=background-transparent]","#md-toolbar").removeAttr("disabled");e("input[name=background-color]","#md-toolbar").spectrum("set",t)}else{e("input[name=background-transparent]","#md-toolbar").attr("disabled","disabled");e("input[name=background-color]","#md-toolbar").spectrum("set","")}}});e("input.mdt-color","#md-toolbar").spectrum({showInput:true,allowEmpty:true,preferredFormat:"hex",showButtons:false,move:function(t){if(t)e("input.mdt-color","#md-toolbar").val(t.toHexString()).trigger("change");else e("input.mdt-color","#md-toolbar").val("").trigger("change")},hide:function(){var t=e("input.mdt-color","#md-toolbar").val();if(t!="")e("input.mdt-color","#md-toolbar").spectrum("set",t);else e("input.mdt-color","#md-toolbar").spectrum("set","")}});e(".panel-change-videothumb").live("click",function(){Drupal.media.popups.mediaBrowser(function(t){var n=t[0];e("#videothumb").attr("src",n.url)})});e("#btn-search").live("click",function(){var t=e("#txtvideoid").val();var n=Drupal.settings.basePath+"?q=admin/structure/md-slider/get-video-info";n=location.protocol+"//"+location.host+n;e.getJSON(n,{url:t},function(t){switch(t.type){case"youtube":if(t.data){var n=t.data.data;e("#videoid").val(n.id);e("#videoname").val(n.title);e("#videothumb").attr("src",n.thumbnail.sqDefault)}break;case"vimeo":if(t.data){var n=t.data;e("#videoid").val(n.id);e("#videoname").val(n.title);e("#videothumb").attr("src",n.thumbnail_small)}break;default:alert("Could not find video info for this link. Try again!");break}if(e("#videothumb").size()<=0){e("#videothumb").parent().append('<a class="panel-change-videothumb" href="#">[Change video thumb]</a>')}})});e("#change-video").click(function(){var t=n.getVideoValue();var r=t.id!=""?1:0;var i=Drupal.settings.basePath+"?q=admin/structure/md-slider/video-setting";i=location.protocol+"//"+location.host+i;e.post(i,{change:r},function(t){e("#dlg-video").append(t).dialog("open")});return false});e("#change-image").click(function(){Drupal.media.popups.mediaBrowser(function(t){var r=t[0];e("textarea.mdt-imgalt","#md-toolbar").val(r.filename);e("img.mdt-imgsrc","#md-toolbar").attr("src",r.url);e("input.mdt-fileid","#md-toolbar").val(r.fid);n.panel.setImageData(r.fid,r.filename,r.url)})});e("#md-toolbar select.mdt-font-family").change(function(){n.panel.changeFontFamily(e(this).val());n.changeFontWeightOption(e("option:selected",this).data("fontweight"))});e("#md-toolbar select.mdt-font-weight").change(function(){var t=e(this).val();e(this).data("value",t);n.panel.setItemFontWeight(t)});e("#border-position a").click(function(){if(e(this).hasClass("bp-all")){var t=e(this).siblings();if(t.filter(".active").size()<4){t.addClass("active")}else{t.removeClass("active")}}else{e(this).toggleClass("active")}n.changeBorderPosition()});e("#border-color","#md-toolbar").spectrum({showInput:true,preferredFormat:"hex",showButtons:false,move:function(t){if(t)e("#border-color","#md-toolbar").val(t.toHexString()).trigger("change");else e("#border-color","#md-toolbar").val("").trigger("change")},hide:function(t){var t=e("#border-color","#md-toolbar").val();e("#border-color","#md-toolbar").spectrum("set",t)}});e("#md-toolbar input.mdt-border-radius").change(function(){if(e(this).val()!=""&&!isNaN(e(this).val())){if(e(this).siblings("input.mdt-border-radius").filter("[value=]").size()==3){var t=parseInt(e(this).val());e(this).siblings("input.mdt-border-radius").each(function(){e(this).val(t);n.panel.setItemCssPx(e(this).attr("name"),t)})}}else{e(this).val(0)}n.panel.setItemCssPx(e(this).attr("name"),e(this).val())});e("#md-toolbar input.mdt-padding").change(function(){if(e(this).val()!=""&&!isNaN(e(this).val())){if(e(this).siblings("input.mdt-padding").filter("[value=]").size()==3){var t=parseInt(e(this).val());e(this).siblings("input.mdt-padding").each(function(){e(this).val(t);n.panel.setItemCssPx(e(this).attr("name"),t)})}}else{e(this).val(0)}n.panel.setItemCssPx(e(this).attr("name"),e(this).val())});e("#md-toolbar a.mdt-addlink").click(function(){var t=n.selectedItem.getItemValues();var i=e.extend({value:"",title:"",color:"",background:"",transparent:"",border:"",target:""},t.link);e("#mdt-linkexpand input.mdt-link-value").val(i.value);e("#mdt-linkexpand input.mdt-link-title").val(i.title);e("#mdt-linkexpand input.link-color").val(i.color);e("#mdt-linkexpand select.mdt-link-target").val(i.target);if(i.color)e("#mdt-linkexpand input.link-color").spectrum("set","#"+i.color);else e("#mdt-linkexpand input.link-color").spectrum("set","");e("#mdt-linkexpand input.link-background").val(i.background);if(i.background)e("#mdt-linkexpand input.link-background").spectrum("set","#"+i.background);else e("#mdt-linkexpand input.link-background").spectrum("set","");e("#mdt-linkexpand input.link-background-transparent").val(i.transparent);e("#mdt-linkexpand input.link-border").val(i.border);if(i.border)e("#mdt-linkexpand input.link-border").spectrum("set","#"+i.border);else e("#mdt-linkexpand input.link-border").spectrum("set","");e("#mdt-linkexpand").data("item",n.selectedItem).show();e(document).bind("click",r)});e("#mdt-linkexpand a.mdt-link-close").click(function(){e("#mdt-linkexpand").data("item",null);e("#mdt-linkexpand").hide()});e("#link-color, #link-background, #link-border").spectrum({allowEmpty:true,preferredFormat:"hex",showInput:true,showButtons:false,move:function(t){if(t)e(this).val(t.toHexString());else e(this).val("")},hide:function(){var t=e(this).val();e(this).spectrum("set",t)}});e("#mdt-linkexpand a.mdt-link-save").click(function(){n.saveLinkData();e("#mdt-linkexpand").hide();e(document).unbind("click",r)});e("#mdt-linkexpand a.mdt-link-remove").click(function(){var t=e("#mdt-linkexpand").data("item");if(t!=null){e(t).data("link",null)}e("#mdt-linkexpand").data("item",null);e("#mdt-linkexpand").hide()});n.disableToolbar()};this.saveLinkData=function(){var t=e("#mdt-linkexpand").data("item"),n={value:e("#mdt-linkexpand input.mdt-link-value").val(),title:e("#mdt-linkexpand input.mdt-link-title").val(),target:e("#mdt-linkexpand select.mdt-link-target").val(),color:e("#mdt-linkexpand input.link-color").val(),background:e("#mdt-linkexpand input.link-background").val(),transparent:e("#mdt-linkexpand input.link-background-transparent").val(),border:e("#mdt-linkexpand input.link-border").val()};console.log(n);e("#link-color, #link-background, #link-border").spectrum("hide");if(n.value!=""&&t!=null){e(t).data("link",n)}};this.changeBorderPosition=function(){var t=e("#border-position a.bp-top").hasClass("active")?1:0,r=e("#border-position a.bp-right").hasClass("active")?2:0,i=e("#border-position a.bp-bottom").hasClass("active")?4:0,s=e("#border-position a.bp-left").hasClass("active")?8:0;n.panel.changeBorderPosition(t+r+i+s)};this.weightArray={100:"Thin","100italic":"Thin Italic",200:"Extra Light","200italic":"Extra Light Italic",300:"Light","300italic":"Light Italic",400:"Normal","400italic":"Italic",500:"Medium","500italic":"Medium Italic",600:"Semi Bold","600italic":"Semi Bold Italic",700:"Bold","700italic":"Bold Italic",800:"Extra Bold","800italic":"Extra Bold Italic",900:"Heavy","900italic":"Heavy Italic"};this.changeFontWeightOption=function(t){var r='<option value=""></option>';var i=e("#md-toolbar select.mdt-font-weight").data("value");if(t){var s=t.split(",");var o=n.weightArray;for(var u=0;u<s.length;u++){var a=s[u];r+='<option value="'+a+'">'+o[a]+"</option>"}}e("#md-toolbar select.mdt-font-weight").html(r).val(i)};this.changeSelectItem=function(e){this.selectedItem=e;this.triggerChangeSelectItem()};this.triggerChangeSelectItem=function(){n.saveLinkData();e("#mdt-linkexpand").hide();if(this.selectedItem==null){this.disableToolbar()}else{this.changeToolbarValue();if(e("#md-toolbar").attr("disabled")){this.enableToolbar()}}};this.disableToolbar=function(){e("input, select, textarea","#md-toolbar").not("input.mdt-spacei").val("").attr("disabled",true);e("#md-toolbar div.mdt-item-type").hide();e("#md-toolbar").attr("disabled",true)};this.enableToolbar=function(){e("input, select, textarea","#md-toolbar").removeAttr("disabled");e("#md-toolbar").attr("disabled",false)};this.changeToolbarValue=function(){if(this.selectedItem!=null){var t=this.selectedItem.getItemValues();e("input.mdt-width","#md-toolbar").val(t.width);e("input.mdt-height","#md-toolbar").val(t.height);e("input.mdt-left","#md-toolbar").val(t.left);e("input.mdt-top","#md-toolbar").val(t.top);e("input.mdt-starttime","#md-toolbar").val(t.starttime);e("input.mdt-stoptime","#md-toolbar").val(t.stoptime);e("select.mdt-startani","#md-toolbar").val(t.startani);e("select.mdt-stopani","#md-toolbar").val(t.stopani);e("input.mdt-opacity","#md-toolbar").val(t.opacity);e("select.mdt-style","#md-toolbar").val(t.style);e("input.mdt-background","#md-toolbar").val(t.backgroundcolor);if(t.backgroundcolor)e("input[name=background-color]","#md-toolbar").spectrum("set","#"+t.backgroundcolor);else e("input[name=background-color]","#md-toolbar").spectrum("set","");e("input.mdt-background-transparent","#md-toolbar").val(t.backgroundtransparent);e("#border-position a").removeClass("active");var n=t.borderposition;if(n&1){e("#border-position a.bp-top").addClass("active")}if(n&2){e("#border-position a.bp-right").addClass("active")}if(n&4){e("#border-position a.bp-bottom").addClass("active")}if(n&8){e("#border-position a.bp-left").addClass("active")}e("input.mdt-border-width","#md-toolbar").val(t.borderwidth);e("select.mdt-border-style","#md-toolbar").val(t.borderstyle);if(t.bordercolor)e("#border-color","#md-toolbar").spectrum("set","#"+t.bordercolor);else e("#border-color","#md-toolbar").spectrum("set","");e("input.border-color","#md-toolbar").val(t.bordercolor);e("input.mdt-br-topleft","#md-toolbar").val(t.bordertopleftradius);e("input.mdt-br-topright","#md-toolbar").val(t.bordertoprightradius);e("input.mdt-br-bottomright","#md-toolbar").val(t.borderbottomrightradius);e("input.mdt-br-bottomleft","#md-toolbar").val(t.borderbottomleftradius);e("input.mdt-p-top","#md-toolbar").val(t.paddingtop);e("input.mdt-p-right","#md-toolbar").val(t.paddingright);e("input.mdt-p-bottom","#md-toolbar").val(t.paddingbottom);e("input.mdt-p-left","#md-toolbar").val(t.paddingleft);var r=1;if(t.width>0&&t.height>0)r=t.width/t.height;e("a.mdt-proportions","#md-toolbar").data("proportions",r);var i=e("#md-toolbar div.mdt-item-type").hide();if(t.type=="text"){e("textarea.mdt-textvalue","#md-toolbar").val(t.title);e(i).filter(".mdt-type-text").show();e("input.mdt-fontsize","#md-toolbar").val(t.fontsize);e("select.mdt-font-family","#md-toolbar").val(t.fontfamily).trigger("change");e("select.mdt-font-weight","#md-toolbar").val(t.fontweight);e("a.mdt-font-bold","#md-toolbar").toggleClass("active",t.fontweight=="bold");e("a.mdt-font-italic","#md-toolbar").toggleClass("active",t.fontstyle=="italic");e("a.mdt-font-underline","#md-toolbar").toggleClass("active",t.textdecoration=="underline");e("a.mdt-font-allcaps","#md-toolbar").toggleClass("active",t.texttransform=="uppercase");e("a.mdt-left-alignment","#md-toolbar").toggleClass("active",t.textalign=="left");e("a.mdt-center-alignment","#md-toolbar").toggleClass("active",t.textalign=="center");e("a.mdt-right-alignment","#md-toolbar").toggleClass("active",t.textalign=="right");e("a.mdt-justified-alignment","#md-toolbar").toggleClass("active",t.textalign=="justified");e("input.mdt-color","#md-toolbar").val(t.color);if(t.color)e("input.mdt-color","#md-toolbar").spectrum("set","#"+t.color);else e("input.mdt-color","#md-toolbar").spectrum("set","")}else if(t.type=="image"){e("textarea.mdt-imgalt","#md-toolbar").val(t.title);e("img.mdt-imgsrc","#md-toolbar").attr("src",t.thumb);e("input.mdt-fileid","#md-toolbar").val(t.fileid);e(i).filter(".mdt-type-image").show()}else if(t.type=="video"){e("textarea.mdt-videoname","#md-toolbar").val(t.title);e("input.mdt-video-fileid","#md-toolbar").val(t.fileid);e("img.mdt-videosrc","#md-toolbar").attr("src",t.thumb);e(i).filter(".mdt-type-video").show();e("#md-toolbar input.mdt-color").attr("disabled",true)}}};this.changePositionValue=function(t,n){e("input.mdt-left","#md-toolbar").val(Math.round(t));e("input.mdt-top","#md-toolbar").val(Math.round(n))};this.changeSizeValue=function(t,n){e("input.mdt-width","#md-toolbar").val(Math.round(t));e("input.mdt-height","#md-toolbar").val(Math.round(n))};this.getItemSetting=function(){return{starttime:e("input.mdt-starttime","#md-toolbar").val(),stoptime:e("input.mdt-stoptime","#md-toolbar").val(),startani:e("select.mdt-startani","#md-toolbar").val(),stopani:e("select.mdt-stopani","#md-toolbar").val(),opacity:e("input.mdt-opacity","#md-toolbar").val(),style:e("select.mdt-style","#md-toolbar").val()}};this.changeTimelineValue=function(){if(this.selectedItem!=null){e("input.mdt-starttime","#md-toolbar").val(Math.round(this.selectedItem.data("starttime")));e("input.mdt-stoptime","#md-toolbar").val(Math.round(this.selectedItem.data("stoptime")))}};this.updateVideo=function(t,r,i){e("textarea.mdt-videoname","#md-toolbar").val(r);e("input.mdt-video-fileid","#md-toolbar").val(t);e("img.mdt-videosrc","#md-toolbar").attr("src",i);n.panel.setVideoData(t,r,i)};this.getVideoValue=function(){return{name:e("textarea.mdt-videoname","#md-toolbar").val(),thumbsrc:e("img.mdt-videosrc","#md-toolbar").attr("src"),id:e("input.mdt-video-fileid","#md-toolbar").val()}};this.focusEdit=function(){if(this.selectedItem!=null){var t=this.selectedItem.data("type");if(t=="text"){e("textarea.mdt-textvalue","#md-toolbar").focus()}else if(t=="image"){e("#change-image").trigger("click")}else if(t=="video"){e("#change-video").trigger("click")}}};var r=function(t){if(!i(e("#mdt-linkexpand").get(0),t.target,e("#mdt-linkexpand").get(0))){n.saveLinkData();e("#mdt-linkexpand").data("item",null);e("#mdt-linkexpand").hide();e(document).unbind("click",r)}},i=function(e,t,n){if(e==t){return true}if(e.contains){return e.contains(t)}if(e.compareDocumentPosition){return!!(e.compareDocumentPosition(t)&16)}var r=t.parentNode;while(r&&r!=n){if(r==e)return true;r=r.parentNode}return false};this.init()};window.MdSliderToolbar=t})(jQuery)
;
/*------------------------------------------------------------------------
# MD Slider - March 18, 2013
# ------------------------------------------------------------------------
--------------------------------------------------------------------------*/

(function(e){var t=function(t){var n=this;this.panel=t;this.selectedItem=null;this.textItemTemplate='<div class="md-item clearfix">'+'<div class="mdi-view"><a href="#" class="btn-viewlayer"></a></div>'+'<div class="mdi-name">'+'<span class="mdit-text"></span>'+'<span class="title">&nbsp;</span>'+'<a href="#" class="btn-deletelayer"></a>'+'<a href="#" class="btn-clonelayer"></a>'+"</div>"+'<div class="mdtl-times">'+'<div class="mdi-frame"></div>'+"</div>"+"</div>";this.imageItemTemplate='<div class="md-item clearfix">'+'<div class="mdi-view"><a href="#" class="btn-viewlayer"></a></div>'+'<div class="mdi-name">'+'<span class="mdit-image"></span>'+'<span class="title">&nbsp;</span>'+'<a href="#" class="btn-deletelayer"></a>'+'<a href="#" class="btn-clonelayer"></a>'+"</div>"+'<div class="mdtl-times">'+'<div class="mdi-frame"></div>'+"</div>"+"</div>";this.videoItemTemplate='<div class="md-item clearfix">'+'<div class="mdi-view"><a href="#" class="btn-viewlayer"></a></div>'+'<div class="mdi-name">'+'<span class="mdit-video"></span>'+'<span class="title">&nbsp;</span>'+'<a href="#" class="btn-deletelayer"></a>'+'<a href="#" class="btn-clonelayer"></a>'+"</div>"+'<div class="mdtl-times">'+'<div class="mdi-frame"></div>'+"</div>"+"</div>";this.maxStart=0;this.rulewidth=7;this.init=function(){n.rulewidth=e(".mdtl-ruler").width()/200;e("#slideshow-time").css("left",100*n.rulewidth);e("#timeline-items").width(100*n.rulewidth+257);e("a.btn-viewlayer").live("click",function(){var t=e(this).parent().parent();var r=t.data("box");if(r!=null){if(e(this).hasClass("btn-blank")){r.show();r.attr("ishidden","false");t.removeClass("box-hide");e(this).removeClass("btn-blank")}else{r.hide();r.attr("ishidden","true");r.removeClass("ui-selected");t.addClass("box-hide");n.panel.triggerChangeSelectItem();e(this).addClass("btn-blank")}}return false});e("a.btn-deletelayer").live("click",function(){var t=e(this).parent().parent();var r=t.data("box");if(r!=null){t.remove();r.remove();n.panel.triggerChangeSelectItem()}return false});e("a.btn-clonelayer").live("click",function(){var t=e(this).parent().parent();var r=t.data("box");if(r!=null){n.panel.cloneBoxItem(r)}return false});e("#timeline-items").sortable({handle:".mdi-name",update:function(e,t){n.triggerChangeOrderItem()},placeholder:"md-item"});e("#slideshow-time").draggable({axis:"x",grid:[n.rulewidth,20],containment:"parent",drag:function(e,t){if(t.position.left<=n.maxStart+n.rulewidth)return false;return n.updateTimelineWidth()}})};this.updateTimelineWidth=function(){var t=e("#slideshow-time").position().left;n.panel.setTimelineWidth(Math.round(t/n.rulewidth));e("#timeline-items").width(257+t);e("#timeline-items .md-item").each(function(){var r=e(this).find(".mdi-frame");var i=e(this).data("box");if(i!=null&&r.position().left+r.width()>t){r.width(t-r.position().left);i.data("stoptime",t/n.rulewidth*100);n.panel.changeTimelineValue()}});return true};this.addTimelineItem=function(t,r){var i;if(t=="text"){i=e(this.textItemTemplate).clone()}else if(t=="image"){i=e(this.imageItemTemplate).clone()}else{i=e(this.videoItemTemplate).clone()}var s=r.data("title");i.find("span.title").html(s);var o=r.data("starttime")?r.data("starttime"):0;var u=r.data("stoptime")?r.data("stoptime"):Math.round((e("#timeline-items").width()-257)/n.rulewidth*100);if(u>o){i.find("div.mdi-frame").css({left:o*n.rulewidth/100,width:(u-o)*n.rulewidth/100});if(r.data("starttime")==null||r.data("stoptime")==null){r.data("starttime",o);r.data("stoptime",u);n.panel.changeTimelineValue()}}i.data("box",r);if(r.attr("ishidden")=="true"){i.addClass("box-hide");e("a.btn-viewlayer",i).addClass("btn-blank")}e("#timeline-items").prepend(i);e(i).find("div.mdi-frame").draggable({containment:"parent",grid:[n.rulewidth,20],stop:function(t,r){var i=e(this).parent().parent();var s=i.data("box");if(s!=null){var o=e(r.helper).position();s.data("starttime",o.left/n.rulewidth*100);s.data("stoptime",(o.left+e(r.helper).width())/n.rulewidth*100);if(s.hasClass("ui-selected")){n.panel.triggerChangeSettingItem()}}n.changeMaxStart()}});e(i.find("div.mdi-frame")).resizable({handles:"e, w",containment:"parent",minWidth:2*n.rulewidth,grid:[n.rulewidth,20],stop:function(t,r){var i=e(this).parent().parent();var s=i.data("box");if(s!=null){var o=e(r.helper).position();s.data("starttime",Math.round(o.left/n.rulewidth*100));s.data("stoptime",Math.round((o.left+e(r.helper).width())/n.rulewidth*100));if(s.hasClass("ui-selected")){n.panel.triggerChangeSettingItem()}}n.changeMaxStart()}});e(i).click(function(){if(!e(this).hasClass("active")&&!e(this).hasClass("box-hide")){var t=e(this).data("box");if(t!=null){n.panel.changeSelectItem(t)}}});r.data("timeline",i)};this.changeMaxStart=function(){var t=0;e("#timeline-items .mdtl-times").each(function(){var n=e(this).find("div.mdi-frame").position().left;if(n>t){t=n}});n.maxStart=t};this.changeSelectItem=function(e){this.selectedItem=e;n.triggerChangeSelectItem()};this.triggerChangeSelectItem=function(){e("#timeline-items > div.md-item.active").removeClass("active");if(this.selectedItem!=null){var t=this.selectedItem.data("timeline");if(t!=null){e(t).addClass("active")}}};this.triggerChangeOrderItem=function(){e("#timeline-items .md-item").each(function(t){var n=e(this).data("box");if(n!=null){n.css("z-index",1e3-t)}})};this.changeSelectedItemTitle=function(){if(this.selectedItem!=null){var t=this.selectedItem.data("timeline");if(t!=null){var n=this.selectedItem.data("title");e(t).find("span.title").html(n)}}};this.setTimelineWidth=function(t){if(t){e("#slideshow-time").css("left",t*n.rulewidth);n.updateTimelineWidth()}};this.changeActivePanel=function(){e("#timeline-items").html("");var t=n.panel.getTimelineWidth();if(t!=null){n.setTimelineWidth(t)}else n.panel.setTimelineWidth(e("#slideshow-time").position().left/n.rulewidth);var r=n.panel.getAllItemBox();r.sort(function(t,n){var r=parseInt(e(t).css("z-index"));var i=parseInt(e(n).css("z-index"));return r<i?-1:r>i?1:0});r.each(function(){n.addTimelineItem(e(this).data("type"),e(this))})};this.init()};window.MdSliderTimeline=t})(jQuery);
/*------------------------------------------------------------------------
 # MD Slider - March 18, 2013
 # ------------------------------------------------------------------------
 # Websites:  http://www.megadrupal.com -  Email: info@megadrupal.com
 --------------------------------------------------------------------------*/

(function(e){var t=function(){function n(e){var t=new Image;t.src=e;var n={height:t.height,width:t.width};return n}var t=this;this.tabs=null;this.activePanel=null;this.selectedItem=null;this.mdSliderToolbar=new MdSliderToolbar(t);this.mdSliderTimeline=new MdSliderTimeline(t);this.textBoxTemplate='<div class="slider-item ui-widget-content item-text" data-top="0" data-left="0" data-width="100" data-height="50" data-borderstyle="solid" data-type="text" data-title="Text" style="width: 100px; height: 50px;"><div>Text</div><span class="sl-tl"></span><span class="sl-tr"></span><span class="sl-bl"></span><span class="sl-br"></span><span class="sl-top"></span><span class="sl-right"></span><span class="sl-bottom"></span><span class="sl-left"></span> </div>';this.imageBoxTemplate='<div class="slider-item ui-widget-content item-image" data-top="0" data-left="0" data-width="100" data-height="50" data-borderstyle="solid" style="height: 80px;width: 80px;" data-type="image"><img width="100%" height="100%" src="http://files.megadrupal.com/other/image.jpg" /><span class="sl-tl"></span><span class="sl-tr"></span><span class="sl-bl"></span><span class="sl-br"></span><span class="sl-top"></span><span class="sl-right"></span><span class="sl-bottom"></span><span class="sl-left"></span></div>';this.videoBoxTemplate='<div class="slider-item ui-widget-content item-video" data-top="0" data-left="0" data-width="100" data-height="50" data-borderstyle="solid" style="height: 80px;width: 80px;" data-type="video"><img width="100%" height="100%" src="http://files.megadrupal.com/other/video.jpg" /><span class="sl-tl"></span><span class="sl-tr"></span><span class="sl-bl"></span><span class="sl-br"></span><span class="sl-top"></span><span class="sl-right"></span><span class="sl-bottom"></span><span class="sl-left"></span></div>';this.tab_counter=e("#md-tabs ul.md-tabs-head li.tab-item").size();this.init=function(){t.initTab();t.initPanel();t.initSliderItem();e(document).keyup(function(n){var r=n.keyCode||n.which;var i=e(n.target).is("input, textarea, select");if(!i&&r==46&&t.selectedItem!=null){var s=t.selectedItem.data("timeline");if(s!=null){s.remove();t.selectedItem.remove();t.triggerChangeSelectItem()}}});e(window).resize(function(){t.resizeWindow()})};this.initTab=function(){t.tabs=e("#md-tabs").tabs({tabTemplate:'<li class="tab-item first clearfix"><a class="tab-link" href="#{href}"><span class="tab-text">#{label}</span></a> <span class="ui-icon ui-icon-close">Remove Tab</span></li>',show:function(n,r){e(t.activePanel).find(".slider-item.ui-selected").removeClass("ui-selected");t.activePanel=e(r.panel);t.mdSliderTimeline.changeActivePanel();t.triggerChangeSelectItem();t.resizeBackgroundImage()}});e(".md-tabs-head li").live({mouseenter:function(){e(this).find(".ui-icon-close").show()},mouseleave:function(){e(this).find(".ui-icon-close").hide()}});e(".md-tabs-head span.ui-icon-close").live("click",function(){var n=e(this);var r=n.prev().attr("href");var i=JSON.parse(e(".settings input",e(r)).val());if(!confirm("Are you sure want to delete this slide? After accepting this slide will be removed completely.")){return}if(i.slide_id==-1){var s=e("li",t.tabs).index(e(this).parent());t.tabs.tabs("remove",s)}else{e.post(location.protocol+"//"+location.host+Drupal.settings.basePath+"?q=admin/structure/md-slider/slide/delete",{sid:i.slide_id},function(r){if(r=="OK"){var i=e("li",t.tabs).index(n.parent());t.tabs.tabs("remove",i)}})}});t.tabs.find(".ui-tabs-nav").sortable({axis:"x",stop:function(){t.tabs.tabs("refresh")}});e("#slide-setting-dlg").dialog({resizable:false,autoOpen:false,draggable:false,modal:true,width:960,open:function(){var n=e(this).data("tab");if(n){var r=e("input.panelsettings",n).val();r!=""&&(r=e.stringToObject(r));t.setSlideSettingValue(r)}},buttons:{Save:function(){var n=e(this).data("tab");if(n){var r=t.getSlideSettingValue(),i=e.stringToObject(e("input.panelsettings",n).val()),s=e("input[name=slider_id]").val();r=e.extend(i,r);e("input.panelsettings",n).val(e.objectToString(r));e.post(Drupal.settings.basePath+"?q=admin/structure/md-slider/get-background-image",{fid:r.background_image,slider_id:s},function(n){if(n){var i=e("<img alt=''>").attr("src",n);e(".md-slide-image img",t.activePanel).remove();e(".md-slide-image",t.activePanel).append(i)}else{e(".md-slide-image img",t.activePanel).remove();e(".md-slide-image",t.activePanel).css("background-color",r.background_color)}})}e(this).dialog("close")},Cancel:function(){e(this).dialog("close")}}});e(".panel-settings-link").live("click",function(){e("#slide-setting-dlg").data("tab",e(this).parent().parent()).dialog("open");return false});e(".random-transition").click(function(){e("#navbar-content-transitions input").removeAttr("checked");for(var t=0;t<3;t++){var n=Math.floor(Math.random()*26)+1;e("#navbar-content-transitions li:eq("+n+") input").attr("checked","checked")}return false});e(".slide-choose-image-link").live("click",function(){var t=e(this);Drupal.media.popups.mediaBrowser(function(n){var r=n[0];Drupal.settings.select_image=r;e("#slide-backgroundimage").val(r.fid);e("img",t.next()).attr("src",r.url);t.next().show()})});e(".slide-choose-thumbnail-link").live("click",function(){var t=e(this);Drupal.media.popups.mediaBrowser(function(n){var r=n[0];Drupal.settings.select_image=r;e("#slide-thumbnail").val(r.fid);e("img",t.next()).attr("src",r.url);t.next().show()})});e("#slide-setting-dlg a.delete-thumbnail, #slide-setting-dlg a.delete-background").click(function(t){e(this).parent().hide();if(e(this).parent().parent().hasClass("choose-thumbnail"))e("#slide-setting-dlg #slide-thumbnail").val("-1");else e("#slide-setting-dlg #slide-backgroundimage").val("-1");t.preventDefault()});e("#slide-background-color","#slide-setting-dlg").spectrum({allowEmpty:true,preferredFormat:"rgb",showAlpha:true,showInput:true});var n=e("#md-slider").mdSlider({transitions:"fade",height:150,width:290,fullwidth:false,showArrow:true,showLoading:false,slideShow:true,showBullet:true,showThumb:false,slideShowDelay:3e3,loop:true,strips:5,transitionsSpeed:1500});e("#navbar-content-transitions li").hoverIntent(function(){var t=e("input",this).attr("value");e("#md-slider").data("transitions",t);var n=e(this).position();e("#md-tooltip").css({left:n.left-200+e(this).width()/2,top:n.top-180}).show()},function(){e("#md-tooltip").hide()});e(".panel-clone").live("click",function(){t.cloneTab(e(this).parent().parent());return false})};this.resizeWindow=function(){t.resizeBackgroundImage()};this.resizeBackgroundImage=function(){if(e(".md-slidewrap",t.activePanel).hasClass("md-fullwidth")){var r=e(".md-slide-image",t.activePanel).width(),i=e(".md-slide-image",t.activePanel).height(),s=e(".md-slide-image img",t.activePanel),o=n(s.attr("src")),u=o.width,a=o.height;if(a>0&&i>0){if(u/a>r/i){var f=r-i/a*u;s.css({width:"auto",height:"100%"});if(f<0){s.css({left:f/2+"px",top:0})}else{s.css({left:0,top:0})}}else{var l=i-r/u*a;s.css({width:"100%",height:"auto"});if(l<0){s.css({top:l/2+"px",left:0})}else{s.css({left:0,top:0})}}}}};this.initSliderItem=function(){e("#md-tabs div.slider-item").each(function(){var t=e(this).getItemValues();e(this).setItemStyle(t)})};this.initPanel=function(){e("#add_tab").click(function(){t.addTab();return false});e("#md-tabs .slider-item").each(function(){e(this).data("slidepanel",t).triggerItemEvent()})};this.addTab=function(){t.tab_counter++;var n="Slide "+t.tab_counter,r;t.tabs.tabs("add","#tabs-"+t.tab_counter,n);r=e("#tabs-"+t.tab_counter);r.append(e("#dlg-slide-setting").html()).data("timelinewidth",e("input[name=default-timelinewidth]").val());t.tabs.append(r);t.tabs.tabs("refresh");t.tabs.tabs("select",e(".md-tabs-head li").length-1)};this.cloneTab=function(n){var r=e.stringToObject(e("input.panelsettings",n).val());t.addTab();t.activePanel=e("#tabs-"+t.tab_counter);e("#tabs-"+t.tab_counter).find(".md-slidewrap").html(n.find(".md-slidewrap").html());r.slide_id=-1;e("input.panelsettings",t.activePanel).val(e.objectToString(r));t.activePanel.data("timelinewidth",n.data("timelinewidth"));t.mdSliderTimeline.setTimelineWidth(n.data("timelinewidth"));e(".slider-item",n).each(function(){t.cloneBoxItem(e(this))})};this.cloneBoxItem=function(n){var r=e(n).getItemValues();if(r&&t.activePanel!=null){var i,s=r.type;if(s=="text"){i=e(t.textBoxTemplate).clone()}else if(s=="image"){i=e(t.imageBoxTemplate).clone()}else{i=e(t.videoBoxTemplate).clone()}i.data("slidepanel",t).appendTo(e(".md-objects",t.activePanel));i.setItemValues(r);i.setItemStyle(r);i.setItemHtml(r);i.triggerItemEvent();t.mdSliderTimeline.addTimelineItem(s,i);return true}};this.addBoxItem=function(n){if(this.activePanel!=null){var r;if(n=="text"){r=e(this.textBoxTemplate).clone()}else if(n=="image"){r=e(this.imageBoxTemplate).clone()}else{r=e(this.videoBoxTemplate).clone()}t.mdSliderTimeline.addTimelineItem(n,r);r.data("slidepanel",this).appendTo(e(".md-objects",this.activePanel)).triggerItemEvent();t.changeSelectItem(r);t.mdSliderTimeline.triggerChangeOrderItem();t.mdSliderToolbar.focusEdit();return true}return false};this.triggerChangeSelectItem=function(){if(this.activePanel==null)return;var t=e(this.activePanel).find(".slider-item.ui-selected");if(t.size()==1){this.selectedItem=t}else{this.selectedItem=null}this.mdSliderToolbar.changeSelectItem(this.selectedItem);this.mdSliderTimeline.changeSelectItem(this.selectedItem)};this.setItemAttribute=function(e,n){if(this.selectedItem!=null){switch(e){case"width":return t.setBoxWidth(this.selectedItem,n);break;case"height":return t.setBoxHeight(this.selectedItem,n);break;case"left":return t.setPositionBoxLeft(this.selectedItem,n);break;case"top":return t.setPositionBoxTop(this.selectedItem,n);break}}};this.setItemSize=function(e,n){t.setBoxWidth(this.selectedItem,e);t.setBoxHeight(this.selectedItem,n)};this.setItemBackground=function(t,n){if(this.selectedItem!=null){e(this.selectedItem).data(e.removeMinusSign(t),n);var r=e(this.selectedItem).data("backgroundcolor");if(r&&r!=""){var i=parseInt(e(this.selectedItem).data("backgroundtransparent"));var s=e.HexToRGB(r);i=i?i:100;var o="rgba("+s.r+","+s.g+","+s.b+","+i/100+")";this.selectedItem.css("background-color",o)}else{this.selectedItem.css("backgroundColor","transparent")}}return false};this.setItemFontSize=function(t,n){if(this.selectedItem!=null){e(this.selectedItem).data(e.removeMinusSign(t),n);this.selectedItem.css(t,n+"px")}};this.setItemColor=function(t){if(this.selectedItem!=null){e(this.selectedItem).data("color",t);if(t!=""){this.selectedItem.css("color",t)}else{this.selectedItem.css("color","")}}};this.setItemBorderColor=function(t,n){if(this.selectedItem!=null){e(this.selectedItem).data(e.removeMinusSign(t),n);this.selectedItem.css("border-color",n)}};this.setItemCssPx=function(t,n){if(this.selectedItem!=null){e(this.selectedItem).data(e.removeMinusSign(t),n);this.selectedItem.css(t,n+"px")}};this.setItemCss=function(t,n){if(this.selectedItem!=null){e(this.selectedItem).data(e.removeMinusSign(t),n);this.selectedItem.css(t,n)}};this.setItemStyle=function(t,n){if(this.selectedItem!=null){_tmpSelectedItem=this.selectedItem;e(_tmpSelectedItem).data(t,n);var r=e.map(e(".mdt-style option","#md-toolbar"),function(e){return e.value});e.each(r,function(e,t){_tmpSelectedItem.removeClass(t)});_tmpSelectedItem.addClass(n)}};this.setItemOpacity=function(t,n){if(this.selectedItem!=null){e(this.selectedItem).data(t,n);this.selectedItem.css(t,n/100)}};this.setItemTitle=function(t){if(this.selectedItem!=null){e(this.selectedItem).data("title",t);if(e(this.selectedItem).data("type")=="text")e(this.selectedItem).find("div").html(t.replace(/\n/g,"<br />"));this.mdSliderTimeline.changeSelectedItemTitle()}};this.setImageData=function(n,r,i){if(this.selectedItem!=null){e(this.selectedItem).data("title",r);e(this.selectedItem).data("fileid",n);e(this.selectedItem).find("img").attr("src",i).load(function(){var e=new Image;e.src=i;var n=e.width,r=e.height,s=t.activePanel.find(".md-objects").width(),o=t.activePanel.find(".md-objects").height();if(r>0&&o>0){if(n>s||r>o){if(n/r>s/o){t.setItemSize(s,r*s/n)}else{t.setItemSize(n*o/r,o)}}else{t.setItemSize(n,r)}t.mdSliderToolbar.changeSelectItem(t.selectedItem)}});t.mdSliderTimeline.changeSelectedItemTitle()}};this.setItemFontWeight=function(t){if(this.selectedItem!=null){e(this.selectedItem).data("fontweight",t);this.selectedItem.css("font-weight",parseInt(t));if(isNaN(t)){this.selectedItem.css("font-style","italic")}else{this.selectedItem.css("font-style","normal")}}};this.setVideoData=function(n,r,i){if(this.selectedItem!=null){e(this.selectedItem).data("title",r);e(this.selectedItem).data("fileid",n);e(this.selectedItem).find("img").attr("src",i).load(function(){var e=new Image;e.src=i;var n=e.width,r=e.height,s=t.activePanel.find(".md-objects").width(),o=t.activePanel.find(".md-objects").height();if(r>0&&o>0){if(n>s||r>o){if(n/r>s/o){t.setItemSize(s,r*s/n)}else{t.setItemSize(n*o/r,o)}}else{t.setItemSize(n,r)}t.mdSliderToolbar.changeSelectItem(t.selectedItem)}});t.mdSliderTimeline.changeSelectedItemTitle()}};this.setItemLinkData=function(t){if(this.selectedItem!=null){e(this.selectedItem).data("link",t)}};this.changeBorderPosition=function(n){if(this.selectedItem!=null){e(this.selectedItem).data("borderposition",n);var r=e(this.selectedItem).data("borderstyle");t.changeBorder(n,r)}};this.changeBorderStyle=function(n){if(this.selectedItem!=null){e(this.selectedItem).data("borderstyle",n);var r=e(this.selectedItem).data("borderposition");t.changeBorder(r,n)}};this.changeBorder=function(t,n){if(this.selectedItem!=null){var r="";if(t&1){r=n}else{r="none"}if(t&2){r+=" "+n}else{r+=" none"}if(t&4){r+=" "+n}else{r+=" none"}if(t&8){r+=" "+n}else{r+=" none"}e(this.selectedItem).css("border-style",r)}};this.changeFontFamily=function(t){if(this.selectedItem!=null){e(this.selectedItem).data("fontfamily",t);e(this.selectedItem).css("font-family",t)}};this.alignLeftSelectedBox=function(){var n=e(t.activePanel).find(".slider-item.ui-selected");if(n.size()>1){var r=1e4;n.each(function(){r=e(this).position().left<r?e(this).position().left:r});n.each(function(){t.setPositionBoxLeft(this,r)})}};this.alignRightSelectedBox=function(){var n=e(t.activePanel).find(".slider-item.ui-selected");if(n.size()>1){var r=0;n.each(function(){var t=e(this).position().left+e(this).outerWidth();r=t>r?t:r});n.each(function(){t.setPositionBoxLeft(this,r-e(this).outerWidth())})}};this.alignCenterSelectedBox=function(){var n=e(t.activePanel).find(".slider-item.ui-selected");if(n.size()>1){var r=n.first().position().left+n.first().outerWidth()/2;n.each(function(){t.setPositionBoxLeft(this,r-e(this).outerWidth()/2)})}};this.alignTopSelectedBox=function(){var n=e(t.activePanel).find(".slider-item.ui-selected");if(n.size()>1){var r=1e4;n.each(function(){r=e(this).position().top<r?e(this).position().top:r});n.each(function(){t.setPositionBoxTop(this,r)})}};this.alignBottomSelectedBox=function(){var n=e(t.activePanel).find(".slider-item.ui-selected");if(n.size()>1){var r=0;n.each(function(){thisBottom=e(this).position().top+e(this).outerHeight();r=thisBottom>r?thisBottom:r});n.each(function(){t.setPositionBoxTop(this,r-e(this).outerHeight())})}};this.alignMiddleSelectedBox=function(){var n=e(t.activePanel).find(".slider-item.ui-selected");if(n.size()>1){var r=n.first().position().top+n.first().outerHeight()/2;n.each(function(){t.setPositionBoxTop(this,r-e(this).outerHeight()/2)})}};this.spaceVertical=function(n){var r=e(t.activePanel).find(".slider-item.ui-selected");if(r.size()>1){n=parseInt(n);var i=r.size();for(var s=0;s<i-1;s++){for(var o=s+1;o<i;o++){if(e(r[s]).position().top>e(r[o]).position().top){var u=r[s];r[s]=r[o];r[o]=u}}}if(n>0){for(var s=1;s<i;s++){t.setPositionBoxTop(e(r[s]),e(r[s-1]).position().top+e(r[s-1]).outerHeight()+n)}}else if(i>2){var a=0;for(var s=0;s<i-1;s++){a+=e(r[s]).outerHeight()}n=(e(r[i-1]).position().top-e(r[0]).position().top-a)/(i-1);for(var s=1;s<i-1;s++){t.setPositionBoxTop(e(r[s]),e(r[s-1]).position().top+e(r[s-1]).outerHeight()+n)}}}};this.spaceHorizontal=function(n){var r=e(t.activePanel).find(".slider-item.ui-selected");if(r.size()>1){n=parseInt(n);var i=r.size();for(var s=0;s<i-1;s++){for(var o=s+1;o<i;o++){if(e(r[s]).position().left>e(r[o]).position().left){var u=r[s];r[s]=r[o];r[o]=u}}}if(n>0){for(var s=1;s<i;s++){t.setPositionBoxLeft(e(r[s]),e(r[s-1]).position().left+e(r[s-1]).outerWidth()+n)}}else if(i>2){var a=0;for(var s=0;s<i-1;s++){a+=e(r[s]).outerWidth()}n=(e(r[i-1]).position().left-e(r[0]).position().left-a)/(i-1);for(var s=1;s<i-1;s++){t.setPositionBoxLeft(e(r[s]),e(r[s-1]).position().left+e(r[s-1]).outerWidth()+n)}}}};this.setPositionBoxLeft=function(t,n){n=n>0?n:0;var r=e(t).parent().width()-e(t).outerWidth(true);if(n>r)n=r;e(t).css("left",n+"px");e(t).data("left",n);return n};this.setPositionBoxTop=function(t,n){n=n>0?n:0;var r=e(t).parent().height()-e(t).outerHeight();if(n>r)n=r;e(t).css("top",n+"px");e(t).data("top",n);return n};this.setBoxWidth=function(t,n){if(n>0){var r=e(t).parent().width()-e(t).position().left;if(n>r)n=r;e(t).width(n);e(t).data("width",n);return n}return e(t).width()};this.setBoxHeight=function(t,n){if(n>0){var r=e(t).parent().height()-e(t).position().top;if(n>r)n=r;e(t).height(n);e(t).data("height",n);return n}return e(t).height()};this.triggerChangeSettingItem=function(){t.mdSliderToolbar.changeToolbarValue()};this.changeSelectItem=function(n){e(t.activePanel).find(".slider-item.ui-selected").removeClass("ui-selected");e(n).addClass("ui-selected");this.triggerChangeSelectItem()};this.getAllItemBox=function(){return e("div.slider-item",t.activePanel)};this.changeTimelineValue=function(){t.mdSliderToolbar.changeTimelineValue()};this.setTimelineWidth=function(n){if(t.activePanel){e(t.activePanel).data("timelinewidth",n)}};this.getTimelineWidth=function(){if(t.activePanel){return e(t.activePanel).data("timelinewidth")}return null};this.getSliderData=function(){var t=[];var n=false;e("#md-tabs .ui-tabs-nav a.tab-link").each(function(){var r=e(e(this).attr("href"));if(r.size()){n=false;if(r.hasClass("ui-tabs-hide")){r.removeClass("ui-tabs-hide");n=true}var i=e.stringToObject(e("input.panelsettings",r).val());i.timelinewidth=r.data("timelinewidth");var s=[];e("div.slider-item",r).each(function(){s.push(e(this).getItemValues())});t.push({itemsetting:i,boxitems:s});if(n){r.addClass("ui-tabs-hide")}}});return t};this.getSlideSettingValue=function(){var t={background_image:e("#slide-backgroundimage").val(),custom_thumbnail:e("#slide-thumbnail").val(),background_color:e("#slide-background-color").val(),disabled:e("#disable-slide").is(":checked")?1:0};var n=[];e("#navbar-content-transitions input:checked").each(function(){n.push(e(this).val())});t.transitions=n;return t};this.setSlideSettingValue=function(t){if(typeof t!="object")t={};e.extend({background_image:"-1",background_color:"",custom_thumbnail:"-1",disabled:0,transitions:[]},t);e("#slide-backgroundimage").val(t.background_image);e("#slide-thumbnail").val(t.custom_thumbnail);if(t.disabled)e("#disable-slide").attr("checked",true);else e("#disable-slide").attr("checked",false);e("#navbar-content-transitions input").attr("checked",false);if(t&&t.transitions){e.each(t.transitions,function(t,n){e("#navbar-content-transitions input[value="+n+"]").attr("checked",true)})}e("#slide-background-color","#slide-setting-dlg").spectrum("set",t.background_color);e("#slide-thumbnail-preview").hide();if(t&&t.custom_thumbnail!=-1){var n=e("input[name=slider_id]").val();e.post(Drupal.settings.basePath+"?q=admin/structure/md-slider/get-background-image",{fid:t.custom_thumbnail,slider_id:n},function(t){e("#slide-thumbnail-preview img").remove();e("#slide-thumbnail-preview").append(e("<img width='100' height='100' alt=''>").attr("src",t));e("#slide-thumbnail-preview").show()})}e("#slide-background-preview").hide();if(t&&t.background_image!=-1){var n=e("input[name=slider_id]").val();e.post(Drupal.settings.basePath+"?q=admin/structure/md-slider/get-background-image",{fid:t.background_image,slider_id:n},function(t){e("#slide-background-preview img").remove();e("#slide-background-preview").append(e("<img width='100' height='100' alt=''>").attr("src",t));e("#slide-background-preview").show()})}}};window.MdSliderPanel=t})(jQuery);
/*------------------------------------------------------------------------
# MD Slider - March 18, 2013
# ------------------------------------------------------------------------
--------------------------------------------------------------------------*/

(function($) {
    $(document).ready(function() {
        var mdSliderPanel = new MdSliderPanel();
        mdSliderPanel.init();
        $('#md-slider-edit-form').submit(function() {
            $("#edit-slider-data-save").val($.objectToString(mdSliderPanel.getSliderData()));
        });
    });
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
