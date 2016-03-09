<?php
	if ($content['#node']->comment and !($content['#node']->comment == 1 and $content['#node']->comment_count)) { ?>
	
<ol class="commentlist">
	<?php print render($content['comments']); ?>
</ol>
<div id="respond">
	<div class="bg_title">
		<h5><?php print t('Add A Review');?></h5>
	</div>
	<?php print render($content['comment_form'])?>
</div>

<?php
	}
?>
