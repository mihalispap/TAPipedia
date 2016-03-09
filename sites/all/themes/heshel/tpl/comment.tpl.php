<?php 
global $base_url;
?>
<li class="comment">
	<div class="stand_comment">
		<div class="thiscommentbody">
			<div class="commentava wrapped_img">
				<?php
					if(render($content['picture'])){
					  print render($content['picture']);
					}  else {
					  print "<img alt='Default avatar' src='http://dummyimage.com/50x50' srcset='http://dummyimage.com/50x50'/>";
					}
				 ?>
			</div>
			<div class="comment_info">
				<div class="comment_meta">
					<span class="comment_author_name">
						<?php print theme('username', array('account' => $content['comment_body']['#object'], 'attributes' => array('class' => 'url'))) ?>
					</span>
					<?php print format_date($node->created, 'custom', 'M j, Y'); ?>
					<?php print format_date($node->created, 'custom', 'h:i a'); ?>
				</div>
				<p><?php print render($content['comment_body']);?></p>
				<div class="comment-reply-link">
					<?php print render($content['links']);?>
				</div>
			</div>
		</div>
	</div>
</li>
