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
