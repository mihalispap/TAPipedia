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
		//print render($node);
		print render($content);
		print render($content['comments']);
		print render($page['content']);
		print render($page['section_content']);
		
	?>
	
	
<?php } ?>

<?php

	if($view_mode!='search_token_provider')
	{
?>

	<style>
		ul.links.inline {display:none;}
	</style>
<?php 
	$url=$node->field_resource_url['und'][0]['url'];
	$istapmember=$node->field_tap_member['und'][0]['value'];
	//$dataprovider=$node->field_tap_member['und'][0]['value'];
	//print_r($content);
	//hide($content['comments']);
	//hide($content['field_resource_url']);
	//hide($content['statistics']);
	//print render($content);
	?>
	<?php
	//print render($content['statistics']);
?>

<div id="rginfo">

	<div id="rinfo">
		<?php if(isset($istapmember) && $istapmember!=0){?><div id="ritem" class="tappartner">TAP partner</div><div class="clear" style="margin: 10px;padding: 5px;border-bottom: 1px solid #bfbfbf;"></div><?php }?>
		
		<?php if(isset($content['field_acronym'])){?><div id="ritem"><?php print render($content['field_acronym']);?></div><?php }?>
		<?php if(isset($content['field_type_of_institution'])){?><div id="ritem"><?php print render($content['field_type_of_institution']);?></div><?php }?>
		<?php if(isset($content['field_website'])){?><div id="ritem"><?php print render($content['field_website']);?></div><?php }?>
		<?php if(isset($content['field_geographical_focus'])){?><div id="ritem"><?php print render($content['field_geographical_focus']);?></div><?php }?>
		<?php if(isset($content['field_country'])){?><div id="ritem"><?php print render($content['field_country']);?></div><?php }?>
		<?php if(isset($content['field_address'])){?><div id="ritem"><?php print render($content['field_address']);?></div><?php }?>
		<?php if(isset($content['field_city'])){?><div id="ritem"><?php print render($content['field_city']);?></div><?php }?>
		<?php if(isset($content['field_orcid'])){?><div id="ritem"><?php print render($content['field_orcid']);?></div><?php }?>
		<?php if(isset($content['field_viaf'])){?><div id="ritem"><?php print render($content['field_viaf']);?></div><?php }?>
	</div>

	<div id="rident">
		<?php if(isset($content['field_doi'])){?><div id="ritem"><?php print render($content['field_doi']);?></div><?php }?>
		<?php if(isset($content['field_isbn'])){?><div id="ritem"><?php print render($content['field_isbn']);?></div><?php }?>
		<?php if(isset($content['field_issn'])){?><div id="ritem"><?php print render($content['field_issn']);?></div><?php }?>
	</div>

	<div id="rprovider">
		<?php if(isset($content['field_dataprovider'])){?><div id="ritem"><?php print render($content['field_dataprovider']);?></div><?php }?>
		<?php if(isset($content['field_ingestion_source'])){?><div id="ritem"><?php print render($content['field_ingestion_source']);?></div><?php }?>
		
	</div>
</div>

<div id="rsinfo">
	
	<div id="rsbimg">
		<?php if(isset($content['field_logo'])){?><div id="ritem" style="float:left;max-width:100px;border-bottom:0px;"><?php print render($content['field_logo']);?></div><?php }?>
		<?php if(isset($content['body'])){?><div id="ritem" style="border-bottom:0px;"><?php print render($content['body']);?></div><?php }?>
	</div>
	<div class="clear" style="margin: 10px;padding: 5px;border-bottom: 1px solid #bfbfbf;"></div>
	<?php if(isset($content['field_areas_of_activity'])){?><div id="ritem"><?php print render($content['field_areas_of_activity']);?></div><?php }?>
	<?php if(isset($content['field_cd_focus'])){?><div id="ritem"><?php print render($content['field_cd_focus']);?></div><?php }?>
	<?php if(isset($content['field_organisation_keywords'])){?><div id="ritem"><?php print render($content['field_organisation_keywords']);?></div><?php }?>
	<?php if(isset($content['field_location'])){?><div id="ritem"><?php print render($content['field_location']);?></div><?php }?>
	
</div>

<div class="clear"></div>

<div id="related">
	<?php echo views_embed_view('more_from_organization');?>
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

<?php
	}
?>
