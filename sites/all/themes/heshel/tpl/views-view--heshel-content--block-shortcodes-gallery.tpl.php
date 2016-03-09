<?php print render($title_prefix); ?>
<?php if ($rows): ?>

<div class="col-sm-12 module_cont">
	<div class="list-of-images items4 photo_gallery">
		<?php print $rows; ?>
	</div>
</div>
<?php endif; ?>
