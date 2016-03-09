<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>

<?php if(arg(0)=='node'){ ?>
<?php if ($breadcrumb): ?>

<div class="breadcrumbs type2">
	<div class="container"><?php print $breadcrumb; ?></div>
</div>
<?php endif; ?>
<div class="wrapper">
	<div class="container">
		<div class="content_block row right-sidebar single_product">
			<div class="fl-container hasRS">
				<div class="posts-block">
					<div class="contentarea">
						<?php print render($page['content']); ?>
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

<?php } else { ?>


<?php } ?>
<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>
<div class="fixed-menu"></div>