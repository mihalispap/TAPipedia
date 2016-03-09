<?php print render($title_prefix); ?>

<div class="shop_list_item">
	<div class="items3">
		<?php if ($rows): ?>
		<?php print $rows; ?>
		<?php endif; ?>
	</div>
</div>
<?php if ($pager): ?>
	<?php print $pager; ?>
<?php endif; ?>