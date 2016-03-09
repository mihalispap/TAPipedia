<?php 
global $base_url;

?>
<div class="footer">
	<div class="pre_footer">
		<div class="container">
			<div class="row">
				<?php  if($page['footer_widget']):?>
					<?php print render($page['footer_widget']); ?>
				<?php endif; ?>
			</div>
		</div>
	</div>
	<div class="footer_bottom">
		<div class="container">
			<div class="copyright">
				<?php $copy = theme_get_setting('footer_copyright_message','heshel'); ?>
				<?php if(!empty($copy ) && 1==0) { ?>
					<?php print $copy; ?>
				<?php } ?>	
			</div>
			<?php  if($page['header_social']):?>
				<div class="social_icons">
					<ul>
						<li><span><?php print t('Follow:');?></span></li>
						<?php print render($page['header_social']); ?>
					</ul>
				</div>
			<?php endif; ?>
			<?php  if($page['footer_bottom']):?>
					<?php print render($page['footer_bottom']); ?>
				<?php endif; ?>
			<div class="clear"></div>
		</div>
	</div>
</div>
<div class="modal fade login_popup" tabindex="-1" role="dialog" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<h5><?php print t('Log in');?></h5>
			<button type="button" class="close_popup" data-dismiss="modal"><?php print t('Close');?></button>			
			<?php  if($page['login_popup']):?>
				<?php print render($page['login_popup']); ?>
			<?php endif; ?>
			<div class="module_cont module_divider">
				<hr>
				<span><?php print t('or');?></span></div>
			<div class="fleft"><a class=" shortcode_button btn_small btn_type_fb" href="javascript:void(0);"><?php print t('Login via facebook');?></a></div>
			<div class="fright"><a class=" shortcode_button btn_small btn_type_tweet" href="javascript:void(0);"><?php print t('Login via twitter');?></a></div>
			<div class="clear"></div>
		</div>
	</div>
</div>