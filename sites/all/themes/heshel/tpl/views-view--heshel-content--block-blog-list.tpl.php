<?php print render($title_prefix); ?>

<?php if ($rows): ?>
	<div class="col-sm-12 module_cont pb55 module_blog">
		<?php print $rows; ?>
		<?php if ($pager): ?>
			<?php print $pager; ?>
		<?php endif; ?>
	</div>
<?php endif; ?>

