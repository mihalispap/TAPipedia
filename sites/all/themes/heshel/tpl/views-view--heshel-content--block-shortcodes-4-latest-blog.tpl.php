<?php print render($title_prefix); ?>
<?php if ($rows): ?>

<div class="col-sm-12 module_cont module_feature_posts"><?php print $header; ?>
	<div class="featured_items">
		<div class="items4 featured_posts"><?php print $rows; ?></div>
	</div>
</div>
<?php endif; ?>

