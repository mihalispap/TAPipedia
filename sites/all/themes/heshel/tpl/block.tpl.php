<?php 
global $base_url;
$out = '';

if($block->region == 'header_user' || $block->region == 'search_header' || $block->region == 'search_2_header' || $block->region == 'content' || $block->region == 'header_social'){
	$out .= $content;
	
} elseif($block->region == 'footer_widget'){
	$out .= '<div class="col-sm-3">';
	$out .= '<div class="'.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	if ($block->subject):
		$out .= '<h4 class="title">'.$block->subject.'</h4>';
	endif;
	$out .= $content;
	$out .= '</div>';
	$out .= '</div>';
	
} elseif($block->region == 'top_content'){
	$out .= '<div class="'.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	$out .= '<div class="fw_block bg_start wall_wrap">';
	$out .= $content;
	$out .= '</div>';
	$out .= '</div>';
	
} elseif($block->region == 'section_content'){
	$out .= '<div class="'.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	$out .= '<div class="row">';
	if ($block->subject):
		$out .= '<div class="col-sm-12 module_cont text-center pb36"><div class="bg_title"><h2>'.htmlspecialchars_decode($block->subject).'</h2></div></div>';
	endif;
	$out .= $content;
	$out .= '</div>';	
	$out .= '</div>';	

} elseif($block->region == 'bot_content'){
	$out .= '<div class="'.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	$out .= '<div class="row"><div class="col-sm-12 module-cont pb0"><div class="shortcode_subscribe">';
	if ($block->subject):
		$out .= '<h1>'.$block->subject.'</h1>';
	endif;
	$out .= $content;
	$out .= '</div></div></div>';
	$out .= '</div>';
	
} elseif($block->region == 'bot_2_content'){
	$out .= '<div class="contextual-links-region">';
	$out .= render($title_suffix);
	$out .= '<div class="row"><div class="col-sm-12 module-cont '.$block->css_class.'">';
	if ($block->subject):
		$out .= '<div class="bg_title"><h5>'.$block->subject.'</h5></div>';
	endif;
	$out .= $content;
	$out .= '</div></div>';
	$out .= '</div>';
	
} elseif($block->region == 'sidebar'){
	$out .= '<div class="sidepanel '.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	if ($block->subject):
		$out .= '<h4 class="title">'.$block->subject.'</h4>';
	endif;
	$out .= $content;
	$out .= '</div>';
	
} elseif($block->region == 'sidebar_shop'){
	$out .= '<div class="sidepanel '.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	if ($block->subject):
		$out .= '<h4 class="title">'.$block->subject.'</h4>';
	endif;
	$out .= $content;
	$out .= '</div>';
	
} elseif($block->region == 'sidebar_contact'){
	$out .= '<div class="sidepanel '.$block->css_class.'">';
	if ($block->subject):
		$out .= '<h4 class="title">'.$block->subject.'</h4>';
	endif;
	$out .= $content;
	$out .= '</div>';
	
} elseif($block->region == 'sitemap_content'){
	$out .= '<div class="'.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	$out .= '<div class="col-sm-4 module_cont"><div class="module_content">';
	if ($block->subject):
		$out .= '<div class="bg_title"><h5>'.$block->subject.'</h5></div>';
	endif;
	$out .= $content;
	$out .= '</div></div>';	
	$out .= '</div>';
	
} else {
	
	$out .= '<div class="'.$block->css_class.' contextual-links-region">';
	$out .= render($title_suffix);
	$out .= $content;
	$out .= '</div>';	
	
}

print $out;

?>

