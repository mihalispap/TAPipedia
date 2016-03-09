<?php 

global $base_root, $base_url;

if($page) { ?>

<div class="prev_next_links">
	<div class="fleft"><a class=" shortcode_button btn_small btn_type5 share_btn" href="javascript:void(0);"><i class="icon-mail-forward"></i>Share</a>
		<div class="post_social_icons">
			<div class="social_icons">
				<ul>
					<li><a onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=640');return false;" class="post-share facebook-share" class="soc_fb" href="http://www.facebook.com/sharer/sharer.php?u=<?php print $node_url; ?>"><i class="icon-facebook"></i></a></li>
					<li><a onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=640');return false;" class="post-share twitter-share" class="soc_tweet" href="https://twitter.com/share?url=<?php print $node_url; ?>&text=<?php print $title; ?>"><i class="icon-twitter"></i></a></li>
					<li><a onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=640');return false;" class="post-share google-share" class="soc_google" href="https://plus.google.com/share?url=<?php print $node_url; ?>"><i class="icon-google-plus"></i></a></li>
				</ul>
			</div>
		</div>
	</div>
	<div class="fright"><a class=" shortcode_button btn_small btn_type4" href="<?php print url("node/".heshel_prev_next($node->nid, 'blog', 'p'));?>">previous post</a><a class=" shortcode_button btn_small btn_type4" href="<?php print url("node/".heshel_prev_next($node->nid, 'blog', 'n'));?>">Next post</a></div>
	<div class="clear"></div>
</div>

<div class="row">
	<div class="col-sm-12 module_cont module_feature_posts pb28">
		<div class="bg_title">
			<h5><?php print t('Related Posts');?></h5>
		</div>
		<div class="featured_items">
			<div class="items4 featured_posts"><?php print getRelatedPosts('blog',$nid); ?></div>
		</div>
	</div>
</div>

<div id="comments">
	<?php print render($content['comments']);?>
</div>
<?php } else {  ?>
<?php } ?>
