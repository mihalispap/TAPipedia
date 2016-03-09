<?php print render($title_prefix); ?>

<div class="filter_navigation">
	<ul id="options" class="splitter">
		<li>
			<ul data-option-key="filter" class="optionset">
				<li class="selected"><a data-option-value="*" data-catname="all" href="#filter">All Works</a></li>
				<?php if ($rows): ?>
				<?php print $rows; ?>
				<?php endif; ?>
			</ul>
		</li>
	</ul>
</div>
