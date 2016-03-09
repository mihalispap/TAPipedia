<?php print render($title_prefix); ?>

<div class="row">
	<?php if ($footer): ?>
	<?php print $footer; ?>
	<?php endif; ?>
	<div class="col-sm-12 module_cont pb80 module_partners with_border">
		<?php if ($header): ?>
		<?php print $header; ?>
		<?php endif; ?>
		<?php if ($rows): ?>
		<?php print $rows; ?>
		<?php endif; ?>
	</div>
</div>