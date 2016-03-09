<?php
Global $base_url;
$flickr_id = $settings['widget_flickr_id'];
$flickr_photos_count = $settings['widget_flickr_photo_count'];
?>
<ul id="flickr-photos" class="flickr-photos clearfix">
</ul>
<script type="text/javascript" src="<?php print $base_url.'/'.drupal_get_path('module', 'widget');?>/js_flick/jflickrfeed.js"></script>
<script language="javascript">
jQuery(document).ready(function(){
	/*----------------------------------------------------*/
	/*	Flickr Feed
	/*----------------------------------------------------*/
	jQuery('#flickr-photos').jflickrfeed({
		limit: <?php print $flickr_photos_count; ?>,
		qstrings: {
			id: '<?php print $flickr_id; ?>'
		},
		itemTemplate: '<li><a data-gal="{{image}}" title="{{title}}" href="{{image}}"><img src="{{image_s}}" alt="{{title}}" width="75" height="75"></a></li>'
	});
});
</script>