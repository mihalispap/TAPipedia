<?php print render($title_prefix); ?>
<div class="col-sm-6 module_cont iconbox_list pb55 pt74">
	<h2 class="mb47"><?php print t('Mobile Ready & Optimized');?></h2>
<?php if ($rows): ?>
		<?php print $rows; ?>
		<?php endif; ?>
</div>
<div class="col-sm-6 module_cont pb0">
<?php if ($header): ?>
		<?php print $header; ?>
		<?php endif; ?>
</div>

