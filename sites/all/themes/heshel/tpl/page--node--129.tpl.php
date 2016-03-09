<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>
<?php 
	if (!empty($tabs['#primary']) || !empty($tabs['#secondary'])):
		print render($tabs);
	endif;
	print $messages;
	unset($page['content']['system_main']['default_message']);
?>
<?php if ($breadcrumb): ?>

<div class="breadcrumbs type2">
	<div class="container"><?php print $breadcrumb; ?></div>
</div>
<?php endif; ?>
<div class="wrapper">
	<div class="container">
		<div class="content_block row right-sidebar">
			<?php  if($page['sitemap_content']):?>
			<div class="fl-container hasRS">
				<div class="posts-block">
					<div class="contentarea">
						<div class="row sitemap">
							<?php print render($page['sitemap_content']); ?>
						</div>
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
