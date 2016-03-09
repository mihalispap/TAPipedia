<?php
$twitter_username = $settings['widget_twitter_username'];
$tweets_count = $settings['widget_twitter_tweets_count'];
Global $base_url;
?>

<div class="tweet_module" data-username="rifk_i" data-count="2">
	<ul class="tweet_list" id="twitter">
		
	</ul>
</div>

		

<script type="text/javascript" src="<?php print $base_url.'/'.drupal_get_path('module', 'widget');?>/yeah_tweety/twitter.js"></script>
<script type="text/javascript" src="<?php print $base_url.'/'.drupal_get_path('module', 'widget');?>/yeah_tweety/get_tweet.php?url=statuses%2Fuser_timeline.json%3Fscreen_name%3D<?php print $twitter_username; ?>%26count%3D<?php print $tweets_count; ?>"></script>