<?php print render($title_prefix); ?>

<div class="sorting_block image-grid column1" id="list">
	<?php if ($rows): ?>
		<?php print $rows; ?>
	<?php endif; ?>
</div>
<div class="pb75 aligncenter">
	<?php if ($pager): ?>
		<?php print $pager; ?>
	<?php endif; ?>
</div>