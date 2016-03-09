<!DOCTYPE html>
<html lang="<?php print $language->language; ?>">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<?php global $base_url; ?>

<link rel="apple-touch-icon" sizes="57x57" href="/favicon/apple-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="/favicon/apple-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="/favicon/apple-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="/favicon/apple-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="/favicon/apple-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="/favicon/apple-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/favicon/apple-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/favicon/apple-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-icon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192"  href="/favicon/android-icon-192x192.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
<link rel="manifest" href="/favicon/manifest.json">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="msapplication-TileImage" content="/favicon/ms-icon-144x144.png">
<meta name="theme-color" content="#ffffff">

<!--<link rel="shortcut icon" href="<?php print $base_url.'/sites/all/themes/heshel/'?>img/favicon.ico" type="image/x-icon">
<link rel="apple-touch-icon" href="<?php print $base_url.'/sites/all/themes/heshel/'?>img/apple_icons_57x57.png">
<link rel="apple-touch-icon" sizes="72x72" href="<?php print $base_url.'/sites/all/themes/heshel/'?>img/apple_icons_72x72.png">
<link rel="apple-touch-icon" sizes="114x114" href="<?php print $base_url.'/sites/all/themes/heshel/'?>img/apple_icons_114x114.png">-->
<link rel="stylesheet" href="<?php print $base_url.'/sites/all/themes/heshel/'?>css/site.css" type="text/css"/>
<title><?php print $head_title; ?></title>
<?php print $styles; ?><?php print $head; ?>
<?php
	//Tracking code
	$tracking_code = theme_get_setting('general_setting_tracking_code', 'heshel');
	print $tracking_code;
	//Custom css
	$custom_css = theme_get_setting('custom_css', 'heshel');
	if(!empty($custom_css)):
?>
<style type="text/css" media="all">
<?php print $custom_css;?>
</style>
<?php
	endif;
?>
</head>

<body class="<?php print $classes;?>" <?php print $attributes;?>>
	<?php print $page_top; ?><?php print $page; ?><?php print $page_bottom; ?>
	<div class="fixed-menu"></div>
	<?php print $scripts; ?>
</body>
</html>

