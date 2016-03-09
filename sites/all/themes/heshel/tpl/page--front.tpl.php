<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>

<div class="wrapper">
	<div class="container">
		<div class="content_block row no-sidebar">
			<div class="fl-container">
				<div class="posts-block">
					<div class="contentarea">
						<?php  if($page['top_content']):?>
							<?php print render($page['top_content']); ?>
						<?php endif; ?>
						<?php  if($page['section_content']):?>
							<?php print render($page['section_content']); ?>
						<?php endif; ?>
						<?php  if($page['bot_content']):?>
							<?php print render($page['bot_content']); ?>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>
