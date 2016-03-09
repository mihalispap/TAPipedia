<?php
/**
 * @file
 * Default theme implementation to display a node.
 */
global $base_root, $base_url;

	if(isset($content['product:field_image'])){
		$img_uri = $content['product:field_image']['#items'][0]['uri'];
	} else {
		$img_uri = '';
	}
	$img_url = file_create_url($img_uri);
?>
<?php if($page) { ?>

<div class="row">
	<div class="col-sm-6 images">
		<div class="img_block"><img id="largeImage" src="<?php print $img_url; ?>" alt="<?php print $title; ?>"/><a id="zoom_product" href="<?php print $img_url; ?>" class="photozoom view_link"></a></div>
		<div class="product_thumbs">
			<ul>
				<?php
					foreach($content['product:field_image']['#items'] as $key => $value){
					$image_uri  = $content['product:field_image']['#items'][$key]['uri'];
					$image_url = file_create_url($image_uri);
						
						print '<li><a href="javascript:void(0)" title="'.$title.'"><img src="'.$image_url.'" alt="'.$title.'" /></a></li>';
					}
				?>
			</ul>
		</div>
	</div>
	<div class="col-sm-6 summary">
		<h2 class="product_title"><?php print $title; ?></h2>
		<div class="amount">
			<?php $onsale = render($content['product:field_commerce_saleprice_on_sale']);
			if (strip_tags($onsale) == '1') {?>
				<?php print strip_tags(render($content['product:field_commerce_saleprice'])); ?>
				<span><?php print strip_tags(render($content['product:commerce_price'])); ?></span>
			<?php  } else {?>
				<?php print strip_tags(render($content['product:commerce_price'])) ; ?>
			<?php  }?>
		</div>
		<p><?php print render($content['product:field_description']) ; ?></p>
		<div class="product_btns">
			<?php
			  $sku = render($content['product:sku']);
			  $product = commerce_product_load_by_sku($sku);
			  hide($content['links']);
			  hide($content['comments']);
			  hide($content['product:field_description']);
			  hide($content['product:field_information']);
			  hide($content['product:field_image']);
			  hide($content['product:commerce_price']);
			  hide($content['product:field_quantity']);
			  hide($content['product:field_commerce_saleprice_on_sale']);
			  hide($content['product:field_commerce_saleprice']);
			  hide($content['field_product_category']);
			  hide($content['body']);
			  print render($content);
			?>
		</div>
		<div class="product_meta"><span class="sku_wrapper"><?php print t('SKU: ');?><span class="sku">2429</span></span><span class="posted_in"><span><?php print t('Categories:');?></span><?php print strip_tags(render($content['field_product_category']),'<a>') ; ?></span><span class="tagged_as"><span><?php print t('Tags:');?></span><?php print strip_tags(render($content['field_tags']),'<a>') ; ?></span></div>
	</div>
</div>
<div class="row">
	<div class="col-sm-12 module_cont pb35 module_tabs">
		<div class="shortcode_tabs type1">
			<div class="all_head_sizer">
				<div class="all_heads_cont"></div>
				<div class="clear"></div>
			</div>
			<div class="all_body_sizer">
				<div class="all_body_cont"></div>
			</div>
			<div class="shortcode_tab_item_title expand_no"><?php print t('Description');?></div>
			<div class="shortcode_tab_item_body tab-content clearfix">
				<div class="ip">
					<div class="tab_content">
						<p><?php print render($content['product:field_description']) ; ?></p>
					</div>
				</div>
			</div>
			<div class="shortcode_tab_item_title expand_no"><?php print t('Additional Info');?></div>
			<div class="shortcode_tab_item_body tab-content clearfix">
				<div class="ip">
					<div class="tab_content">
						<div class="additional_info">
							<?php print render($content['product:field_information']) ; ?>
						</div>
					</div>
				</div>
			</div>
			<div class="shortcode_tab_item_title expand_yes"><?php print t('Reviews');?><span class="badge"><?php print $comment_count;?></span></div>
			<div class="shortcode_tab_item_body tab-content clearfix">
				<div class="ip">
					<div class="tab_content">
						<h5 class="mb25"><?php print $comment_count.t(' Reviews for ').$title;?></h5>
						<?php print render($content['comments'])?></div>
				</div>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</div>
<?php } else { ?>

<?php } ?>
