<?php print render($title_prefix); ?>

<div class="col-sm-12 module_cont module_feature_posts pb54">
	<?php if ($rows): ?>
		<?php print $rows; ?>
	<?php endif; ?>
	<div class="featured_items">
		<div class="items3 featured_posts">
			<?php if ($header): ?>
				<?php print $header; ?>
			<?php endif; ?>
		</div>
	</div>
</div>
