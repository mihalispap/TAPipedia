<?php 
global $base_url;


$setting_header = theme_get_setting('built_in_header', 'heshel');
if(empty($setting_header)){
	$setting_header = 'type1';
}
?>

<div class="main_header <?php print $setting_header;?>">
	<div class="tagline">
		<div class="container">
			<div class="fright">
				<div class="tagline_items">
					<div class="log_in_out">
						<?php  if($page['header_user']){?>
							<?php print render($page['header_user']); ?>
						<?php } else { ?>
							
						<?php } ?>
					</div>
					<div class="cart_btn">
						<!--<a href="<?php print $base_url.'/cart'; ?>" class="view_cart_btn">
							<i class="icon-shopping-cart"></i>
						</a>-->
						<div class="cart_submenu">
							<div class="cart_wrap">
								<a href="javascript:void(0);" class="remove_products"><?php print t('Close');?></a>
								<?php  if($page['header_cart']):?>
									<?php print render($page['header_cart']); ?>
								<?php endif; ?>
							</div>
						</div>
					</div>
					<?php  if($page['header_social']):?>
						<div class="social_icons">
							<ul>
								<?php print render($page['header_social']); ?>
							</ul>
						</div>
					<?php endif; ?>
				</div>
			</div>
			<?php  if($page['header_info']):?>
				<div class="fleft">
					<?php print render($page['header_info']); ?>
				</div>
			<?php endif; ?>
			<div class="clear"></div>
		</div>
	</div>
	<div class="header_parent_wrap">
		<header>
			<div class="container">
				<div class="logo_sect">
					<a href="<?php print $base_url; ?>" class="logo">
						<img src="<?php print $logo; ?>" class="logo_def" alt="Logo"/>
					</a>
					<a href="javascript:void(0);" class="menu_collapse"></a>
				</div>
				<div class="fright">
					<nav>
						<?php  if($page['main_menu']):?>
							<?php print render($page['main_menu']); ?>
						<?php endif; ?>
					</nav>
					<div class="top_search">
						<?php  if($page['search_header']):?>
							<?php print render($page['search_header']); ?>
						<?php endif; ?>
						<span class="top-icon-search"></span>
					</div>
					<div class="clear"></div>
					<div class="head_search">
						<?php  if($page['search_2_header']):?>
							<?php print render($page['search_2_header']); ?>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</header>
	</div>
</div>
