<?php 

global $base_root, $base_url;
//print_r($node);
if($page) { ?>

<div style="display:none;" class="prev_next_links">
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



<?php } else {  ?>
	<?php 
		print render($node);
		print render($content);
		print render($content['comments']);
		print render($page['content']);
		print render($page['section_content']);
		
	?>
	
	
<?php } ?>

	<style>
		ul.links.inline {display:none;}
	</style>
<?php 
	$url=$node->field_resource_url['und'][0]['url'];
	if(startsWith($url,'/sites/default/files/mendeley/PDF/'))
	{
		$urlP=explode('/',$url);
		$url=$base_url.'/sites/default/files/mendeley/PDF/'.urlencode($urlP[count($urlP)-1]);
		$url=str_replace('+','%20',$url);
		//$url=$base_url.$node->field_resource_url['und'][0]['url'];
	}
	if(empty($url))
	{
		$url=file_create_url($node->field_attached_resource['und'][0]['uri']);
		
	}
	//print_r($content);
	//hide($content['comments']);
	//hide($content['field_resource_url']);
	//hide($content['statistics']);
	//print render($content);
	?>
	<?php
	//print render($content['statistics']);
?>
<div style="display:none;"><?php print_r($url);?></div>
<div id="rginfo">
<?php 
	//$provider=node_load($content['field_dataprovider']['#object']->field_dataprovider['und'][0]['target_id']);
	
	$providerIMG=$content['field_dataprovider']['#object']->field_dataprovider['und'][0]['entity']->field_logo['und'][0]['uri'];
	$publisherIMG=$content['field_publisher']['#object']->field_publisher['und'][0]['entity']->field_logo['und'][0]['uri'];
	//print_r($content['field_dataprovider']['#object']->field_dataprovider['und'][0]['entity']->field_logo['und'][0]['uri']);
	//print $content['field_dataprovider']['und'][0]['entity']['field_logo']['und'][0]['uri'];
	//print render($provider->field_logo);
	//echo $content['field_dataprovider']['und'][0]['target_id'];
	//$view = node_view($provider, 'teaser');
	//print render($view);
?>
	<div id="rinfo">
		<?php if(isset($content['field_topics'])){?><div id="ritem"><?php print render($content['field_topics']);?></div><?php }?>
		<?php if(isset($content['field_use'])){?><div id="ritem"><?php print render($content['field_use']);?></div><?php }?>
		<?php if(isset($content['field_actors'])){?><div id="ritem"><?php print render($content['field_actors']);?></div><?php }?>
		<?php if(isset($content['field_countries'])){?><div id="ritem"><?php print render($content['field_countries']);?></div><?php }?>
		<?php if(isset($content['field_areas'])){?><div id="ritem"><?php print render($content['field_areas']);?></div><?php }?>
	</div>

	<div id="rident">
		<?php if(isset($content['field_doi'])){?><div id="ritem"><?php print render($content['field_doi']);?></div><?php }?>
		<?php if(isset($content['field_isbn'])){?><div id="ritem"><?php print render($content['field_isbn']);?></div><?php }?>
		<?php if(isset($content['field_issn'])){?><div id="ritem"><?php print render($content['field_issn']);?></div><?php }?>
	</div>

	<div id="rprovider">
		<?php if(isset($content['field_dataprovider'])){?>
			<?php if(isset($providerIMG)){?>
				<img src="<?php print file_create_url($providerIMG); ?>" />
			<?php }?>
			<div id="ritem"><?php print render($content['field_dataprovider']);?></div>
		<?php }?>
		<?php if(isset($content['field_ingestion_source'])){?><div id="ritem"><?php print render($content['field_ingestion_source']);?></div><?php }?>
		
	</div>
</div>

<div id="rsinfo">
	<?php if(isset($content['field_type'])){?><div id="ritem"><?php print render($content['field_type']);?></div><?php }?>
	<?php if(isset($content['field_journal'])){?><div id="ritem"><?php print render($content['field_journal']);?></div><?php }?>
	<?php if(isset($content['field_journal_number'])){?><div id="ritem"><?php print render($content['field_journal_number']);?></div><?php }?>
	<?php if(isset($content['field_journal_pages'])){?><div id="ritem"><?php print render($content['field_journal_pages']);?></div><?php }?>
	<?php if(isset($content['field_journal_volume'])){?><div id="ritem"><?php print render($content['field_journal_volume']);?></div><?php }?>
	<?php if(isset($content['field_journal_year'])){?><div id="ritem"><?php print render($content['field_journal_year']);?></div><?php }?>
	<?php if(isset($content['field_book_source'])){?><div id="ritem"><?php print render($content['field_book_source']);?></div><?php }?>
	<?php if(isset($content['field_educational_level'])){?><div id="ritem"><?php print render($content['field_educational_level']);?></div><?php }?>
	<?php if(isset($content['field_authors'])){?><div id="ritem"><?php print render($content['field_authors']);?></div><?php }?>
	<?php if(isset($content['field_publisher'])){?>
		<?php if(isset($publisherIMG)){?>
			<img id="plogo" src="<?php print file_create_url($publisherIMG); ?>" />
		<?php }?>
		<div id="ritem"><?php print render($content['field_publisher']);?></div>
	<?php }?>
	<?php if(isset($content['body'])){?><div id="ritem"><?php print render($content['body']);?></div><?php }?>
	<?php if(isset($content['field_publication_date'])){?><div id="ritem"><?php print render($content['field_publication_date']);?></div><?php }?>
	<?php if(isset($content['field_resource_keywords'])){?><div id="ritem"><?php print render($content['field_resource_keywords']);?></div><?php }?>
	<?php if(isset($url)){?>
		<div id="rlresource">
			<a style="color:#fff;" href="<?php echo $url;?>" target="_blank">
				View Resource 
					<?php $formatB=formatBytes(strlen(file_get_contents($url)));
							if($formatB!='NAN')
								echo '('.formatBytes(strlen(file_get_contents($url))).')';
					?>
				<img src="/sites/default/files/resource/pdf-icon1.png"></a>
		</div>
	<?php }?>
	
</div>


<div class="clear"></div>

<div id="related">
	<?php echo views_embed_view('relevant_resources');?>
</div>

<div class="row">
	<div class="col-sm-12 module_cont module_feature_posts pb28">
		<div class="bg_title">
			<h5><?php //print t('Related Posts');?></h5>
		</div>
		<div class="featured_items">
			<div class="items4 featured_posts"><?php //print getRelatedPosts('blog',$nid); ?></div>
		</div>
	</div>
</div>
<div id="comments">
	<?php print render($content['comments']);?>
</div>