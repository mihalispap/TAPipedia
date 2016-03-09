<?php print render($title_prefix); ?>
<?php if ($rows): ?>
<div class="col-sm-12 module_cont module_divider">
	<hr>
</div>
<div class="col-sm-12 module_cont module_feature_portfolio pb24">
	<div class="bg_title">
		<h5><?php print t('Portfolio Posts');?></h5>
	</div>
	<div class="featured_items">
		<div class="items4 featured_portfolio">
			<ul class="item_list">
				<?php print $rows; ?>
			</ul>
		</div>
	</div>
</div>
<?php endif; ?>
<?php if ($header): ?>
<div class="col-sm-12 module_cont module_feature_portfolio">
	<div class="featured_items round_type">
		<div class="items3 featured_portfolio">
			<ul class="item_list">
				<?php print $header; ?>
			</ul>
		</div>
	</div>
</div>
<?php endif; ?>
