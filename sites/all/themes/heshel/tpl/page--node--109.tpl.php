<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>

<div class="wrapper_404">
	<div class="container">
		<div class="row">
			<div class="col-sm-12 text-center">
				<?php print render($page['content']); ?>
			</div>
		</div>
	</div>
</div>

<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>