<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>
<?php 
	if (!empty($tabs['#primary']) || !empty($tabs['#secondary'])):
		print render($tabs);
	endif;
	print $messages;
	unset($page['content']['system_main']['default_message']);
?>
<?php if(arg(0)=='node'){ ?>
<?php if ($breadcrumb): ?>

<div class="breadcrumbs type2">
	<div class="container">
		<?php 
		//print_r($_SERVER);
			if($node->type!='organizationprimary')
				print $breadcrumb;
			else 
				print str_replace('<i class="fa fa-angle-right"></i>',
				'<i class="fa fa-angle-right"></i><a href="/community" class="">TAPipedia Network</a>',$breadcrumb);
		?>
		<!-- <a href="/" class="">Home</a> -->
	</div>
</div>
<?php endif;
} ?>
<div class="wrapper">
	<div class="container">
		<div class="content_block row no-sidebar">
			<div class="page_title">
				<h1><?php  $gpap = drupal_get_title(); print htmlspecialchars_decode($gpap); ?></h1>
			</div>
			<div class="fl-container">
				<div class="posts-block">
					<div class="contentarea">
						<?php  if($page['content'] && $node->type!='resource'):?>
							<?php print render($page['content']); ?>
							
						<?php endif; ?>
						<?php  if($page['content'] && $node->type=='resource'):?>
							<?php 
								//TODO: with file inclusion at least!
								//hide($page['content']['comments']);
								//hide($page['content']['field_type']);
								//hide($page['content']['type']);
								//print_r($page['content']);
								print render($page['content']); 
							?>
						<?php endif; ?>
						<?php  if($page['section_content']):?>
							<?php print render($page['section_content']); ?>
						<?php endif; ?>
						
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>

