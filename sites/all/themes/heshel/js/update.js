// JavaScript Document

jQuery(function(){
				
	jQuery('a.active').parent().addClass('current-menu-parent');
	jQuery('.cart_submenu .view-footer').addClass('subtotal');
	jQuery('.cart_submenu .view-footer .line-item-summary-view-cart a').addClass('shortcode_button btn_small btn_type5 mr15');
	jQuery('.cart_submenu .view-footer .line-item-summary-checkout a').addClass('shortcode_button btn_small btn_type4 mr0');
	
	jQuery('.widget_cart .view-footer').addClass('subtotal');
	jQuery('.widget_cart .view-footer .line-item-summary-view-cart a').addClass('shortcode_button btn_small btn_type5 mr15');
	jQuery('.widget_cart .view-footer .line-item-summary-checkout a').addClass('shortcode_button btn_small btn_type4 mr0');
	
	jQuery('.icon-shopping-cart').after(jQuery('.line-item-total-raw').html() + ' (' + jQuery('.line-item-quantity').html() + ') ');
	jQuery('.simplenews-subscribe input[type=submit]').wrap('<div class="subscribe_btn"></div>');
	jQuery('.simplenews-subscribe input[type=text]').attr('placeholder','Your Email Address');
	
	
	jQuery('.tweet_module .tweet_list').last().remove();
	jQuery('.login_popup form').each(function(){
		$val = jQuery(this).attr('action');	
		jQuery(this).attr('action',$val + 'user');
	});
	
	jQuery('.no-row').removeClass('row');
	/*jQuery('ul.pager').addClass('pagerblock').removeClass('pager');*/
	
	jQuery('.comment-form #edit-preview').remove();
	
	jQuery('.fw_block.wall_wrap > .row').removeClass('row');
	
	/*jQuery('.item-list ul.pager').addClass('pagerblock').removeClass('pager');*/

	jQuery('.page-search .pager-next a').html('>');
	jQuery('.page-search .pager-last a').html('>>');
	jQuery('.page-search .pager-previous a').html('<');
	jQuery('.page-search .pager-first a').html('<<');
	
	jQuery('.form-item-quantity').addClass('product_quantity');
	jQuery('.form-item-quantity .edit-quantity').remove();
	jQuery('.form-item-quantity #edit-quantity').addClass('input-text');
});


//footer widget
jQuery(document).ready(function($){
	var flick = document.getElementById('flickr-widget');
	var idflick = flick.getAttribute('data-idflick');
	var num = flick.getAttribute('data-number');
	$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?ids=" + idflick +"&lang=en-us&format=json&jsoncallback=?", function(data){
		$.each(data.items, function(index, item){
			if(index >= num){
				return false;	
			}
			$("<img alt='flickr' style='width: 60px; height: 60px;'/>").attr("src", item.media.m.replace('_m','_s')).appendTo("#flickr-widget").wrap("<div class='flickr_badge_image'><a class='flicker-popup-link cursor-zoom' target='_blank' href='" + item.media.m.replace('_m','_b') + "'></a></div>").after('<div class="flickr_fadder"></div>');

			$('.flicker-popup-link').magnificPopup({
				type: 'image',
				closeOnContentClick: true,
				closeBtnInside: false,
				fixedContentPos: true,
				mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
				image: {
					verticalFit: true
				},
				gallery: {
					enabled: true
				},
				zoom: {
					enabled: true,
					duration: 600, // duration of the effect, in milliseconds
					easing: 'ease', // CSS transition easing function
					opener: function(element) {
					return element.find('img');
					}
				}
			});
		});
	});
});
