<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;

	if(!empty($_REQUEST["sidebar"])){
		$sidebar = $_REQUEST["sidebar"];
	} else {
		$sidebar = theme_get_setting('sidebar', 'heshel'); 
	}
	if(empty($sidebar)) $sidebar = 'fw';

?>
<?php 
	if (!empty($tabs['#primary']) || !empty($tabs['#secondary'])):
		print render($tabs);
	endif;
	print $messages;
	unset($page['content']['system_main']['default_message']);
?>
<?php if ($breadcrumb): ?>

<div class="breadcrumbs type2">
	<div class="container"><?php print $breadcrumb; ?></div>
</div>
<?php endif; ?>

<?php if(arg(0)=='node'){ ?>
<div class="wrapper">
	<div class="container">
		<?php if($sidebar == 'ls') { ?>
		<div class="content_block row left-sidebar single_post">
			<div class="fl-container">
				<div class="posts-block hasLS">
					<div class="contentarea">
						<?php print render($page['section_content']); ?>
						<?php print render($page['content']); ?>
						<?php print render($page['bot_2_content']); ?>
					</div>
				</div>
				<?php  if($page['sidebar']):?>
					<div class="left-sidebar-block">
						<?php print render($page['sidebar']); ?>
					</div>
				<?php endif; ?>
			</div>
		</div>
				
		<?php  } elseif($sidebar == 'rs') { ?>
		<div class="content_block row right-sidebar single_post">
			<div class="fl-container hasRS">
				<div class="posts-block">
					<div class="contentarea">
						<?php print render($page['section_content']); ?>
						<?php print render($page['content']); ?>
						<?php print render($page['bot_2_content']); ?>
					</div>
				</div>
			</div>
			<?php  if($page['sidebar']):?>
				<div class="right-sidebar-block">
					<?php print render($page['sidebar']); ?>
				</div>
				<div class="clear"></div>
			<?php endif; ?>
		</div>
		
		<?php  } else { ?>
		<div class="content_block row no-sidebar single_post fullwidth_post">
			<div class="fl-container">
				<div class="posts-block">
					<div class="contentarea">
						<?php print render($page['section_content']); ?>
						<?php print render($page['content']); ?>
						<?php print render($page['bot_2_content']); ?>
					</div>
				</div>
			</div>
		</div>
		<?php  } ?>
	</div>
</div>

<?php } else { ?>
<div class="wrapper">
	<div class="container">
		<div class="content_block row no-sidebar">
			<div class="page_title">
				<h1><?php  $gpap = drupal_get_title(); print htmlspecialchars_decode($gpap); ?></h1>
			</div>
			<div class="fl-container">
				<div class="posts-block">
					<div class="contentarea">
						<?php  if($page['section_content']):?>
							<?php print render($page['section_content']); ?>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<?php } ?>
<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>
