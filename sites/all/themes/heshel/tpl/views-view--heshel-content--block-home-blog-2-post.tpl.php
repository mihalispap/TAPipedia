<?php print render($title_prefix); ?>

<div class="row">
	<div class="col-md-8 proj_preview">
		<?php if ($rows): ?>
			<?php print $rows; ?>
		<?php endif; ?>
	</div>
	<div class="col-md-4 proj_list">
		<?php if ($header): ?>
			<?php print $header; ?>
		<?php endif; ?>
	</div>
</div>

