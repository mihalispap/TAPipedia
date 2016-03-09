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
			<div class="page_title">
				<h1><?php print drupal_get_title(); ?></h1>
			</div>
			<div class="fl-container">
				<div class="posts-block">
					<div class="contentarea">
                                                <?php  if($page['content']):?>
                                                        <?php print render($page['content']); ?>
                                                <?php endif; ?>
						<?php print render($page['section_content']); ?>
					</div>
				</div>
			</div>
			<div class="right-sidebar-block">
				<?php print render($page['sidebar']); ?>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</div>


<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>
