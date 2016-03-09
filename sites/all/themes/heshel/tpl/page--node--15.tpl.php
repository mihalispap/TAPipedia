<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>
<div class="clear"></div>
<?php  if($page['content']):?>
	<div class="gallery_ribbon_container">
		
			<?php print render($page['content']); ?>				
	</div>
<?php endif; ?>
<div class="wrapper">
	<div class="container">
		<div class="content_block row right-sidebar">
			<?php  if($page['section_content']):?>
			<div class="fl-container hasRS">
				<div class="posts-block">
					<div class="contentarea">
						<?php print render($page['section_content']); ?>
					</div>
				</div>
			</div>
			<?php endif; ?>
			<?php  if($page['sidebar']):?>
			<div class="right-sidebar-block">
				<?php print render($page['sidebar']); ?>
			</div>
			<?php endif; ?>
			<div class="clear"></div>		
		</div>
	</div>
</div>


<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>