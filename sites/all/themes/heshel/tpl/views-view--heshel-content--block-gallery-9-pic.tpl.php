<?php print render($title_prefix); ?>

<div class="col-sm-12 module_cont pb55">
	<div class="list-of-images items3 photo_gallery">
		<?php if ($rows): ?>
		<?php print $rows; ?>
		<?php endif; ?>
	</div>
</div>