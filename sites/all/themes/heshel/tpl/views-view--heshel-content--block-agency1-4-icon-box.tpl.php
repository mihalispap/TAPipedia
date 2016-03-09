<?php print render($title_prefix); ?>

<div class="col-sm-6 module_con pt5 pb80">
<?php if ($header): ?>
		<?php print $header; ?>
		<?php endif; ?>
</div>
<div class="col-sm-6 module_cont iconbox_list pb55">
<?php if ($rows): ?>
		<?php print $rows; ?>
		<?php endif; ?>
</div>
