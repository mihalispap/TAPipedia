<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>

<div class="wrapper">
	<div class="container">
		<div class="content_block row right-sidebar">
			<div class="page_title">
				<h1><?php $gpap = drupal_get_title(); print htmlspecialchars_decode($gpap); ?></h1>
			</div>
			<div class="fl-container hasRS">
				<div class="posts-block">
					<div class="contentarea shop_list">
						<?php print render($page['section_content']); ?>
					</div>
				</div>
			</div>
			<div class="right-sidebar-block">
				<?php print render($page['sidebar_shop']); ?>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</div>

<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>
