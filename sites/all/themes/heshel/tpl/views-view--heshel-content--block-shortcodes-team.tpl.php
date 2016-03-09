<?php print render($title_prefix); ?>
<?php if ($rows): ?>

<div class="col-sm-12 module_cont module_team">
	<div class="bg_title">
		<h5><?php print t('Team');?></h5>
	</div>
	<div class="team_slider">
		<div class="carouselslider teamslider items4">
			<?php print $rows; ?>
		</div>
	</div>
</div>
<?php endif; ?>
