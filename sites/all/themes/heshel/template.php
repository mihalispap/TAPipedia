<?php
global $base_url;


// Add css skin
$setting_skin = theme_get_setting('built_in_skins', 'heshel');
if(!empty($setting_skin)){
	$skin_color = '/css/colors/'.$setting_skin;
}else{
	$skin_color = '/css/colors/custom_green.css';
}
$css_skin = array(
		'#tag' => 'link', // The #tag is the html tag - <link />
		'#attributes' => array( // Set up an array of attributes inside the tag
		'href' => base_path().path_to_theme().$skin_color,
		'rel' => 'stylesheet',
		'type' => 'text/css',
		'media' => 'screen',
		'id' => 'theme_color',
		),
		'#weight' => 1,
		);
drupal_add_html_head($css_skin, 'theme_color');


function heshel_preprocess_html(&$variables) {
	
	drupal_add_css('http://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,700,900', array('type' => 'external','media' => 'all'));
	drupal_add_js(path_to_theme().'/js/jquery.min.js', array('type' => 'file', 'scope' => 'header'));
	drupal_add_js(path_to_theme().'/js/jquery-ui.min.js', array('type' => 'file', 'scope' => 'header'));
	if(!empty($_REQUEST["switcher"])){
		$switcher = $_REQUEST["switcher"];
	} else {
		$switcher = theme_get_setting('switcher', 'heshel'); 
	}
	if(empty($switcher)) $switcher = 'on';
	if($switcher == 'off'){
		drupal_add_js(path_to_theme().'/js/demo_panel.js', array('type' => 'file', 'scope' => 'footer'));
	}
	
}

// Remove superfish css files.
function heshel_css_alter(&$css) {
	
	unset($css[drupal_get_path('module', 'system') . '/system.menus.css']);
	unset($css[drupal_get_path('module', 'system') . '/system.theme.css']);
	
	//unset($css[drupal_get_path('module', 'system') . '/system.base.css']);
}


function heshel_form_alter(&$form, &$form_state, $form_id) {
	
	/*if ($form_id == 'search_block_form') {
		$form['search_block_form']['#title_display'] = 'invisible'; // Toggle label visibilty
		//$form['search_block_form']['#default_value'] = t('Search'); // Set a default value for the textfield
		$form['search_block_form']['#attributes']['id'] = array("mod-search-searchword");
		//disabled submit button
		//unset($form['actions']['submit']);
		unset($form['search_block_form']['#title']);
		$form['search_block_form']['#attributes']['placeholder'] = "Search...";	
	}*/
	if ($form_id=="search_api_page_search_form") {
	    $form['form']['keys_1']['#title'] = t('Search'); // Change the text on the label element
	    $form['form']['keys_1']['#title_display'] = 'invisible'; // Toggle label visibilty
	    $form['form']['keys_1']['#size'] = 40;  // define size of the textfield
	    $form['form']['keys_1']['#default_value'] = t('Type your search terms here...'); // Set a default value for the textfield
	    $form['form']['submit_1']['#value'] = t('Search'); // Change the text on the submit button
	    $form['form']['submit_1']['#prefix'] = '<a class="btn_type5">';
	    $form['form']['submit_1']['#suffix'] = '</a>';
	    $form['form']['submit_1']['#markup'] = '<i class="icon-search"></i> Search';    
/*$form['actions']['submit']['#prefix'] = '<button class="btn_small btn_type7" type="submit">';
    $form['actions']['submit']['#suffix'] = '</button>';
    $form['actions']['submit']['#markup'] = '<i class="icon-search"></i>';*/
	    // Add extra attributes to the text box
	    $form['form']['keys_1']['#attributes']['onblur'] = "if (this.value == '') {this.value = 'Type your search terms here...';}";
	    $form['form']['keys_1']['#attributes']['onfocus'] = "if (this.value == 'Type your search terms here...') {this.value = '';}";
	    // Prevent user from searching the default text
	    $form['#attributes']['onsubmit'] = "if(this.keys_1.value=='Type your search terms here...'){ alert('Please enter a term!'); return false; }";

	    // Alternative (HTML5) placeholder attribute instead of using the javascript
	    $form['form']['keys_1']['#attributes']['placeholder'] = t('Type your search terms here...');
		//krumo($form);
	}

	if ($form_id == 'search_block_form') {
		$form['search_block_form']['#title_display'] = 'invisible'; // Toggle label visibilty
		//$form['search_block_form']['#default_value'] = t('Search'); // Set a default value for the textfield
		$form['search_block_form']['#attributes']['id'] = array("mod-search-searchword");
		//disabled submit button
		//unset($form['actions']['submit']);
		unset($form['search_block_form']['#title']);
		$form['search_block_form']['#attributes']['placeholder'] = "Search...";	
	}
}

//echo 'asdasdsadsadsadsadsad';
function heshel_preprocess_page(&$vars){



	if (isset($vars['node'])) {
		$vars['theme_hook_suggestions'][] = 'page__'. $vars['node']->type;
	}

	if (isset($vars['node'])) {
		$vars['theme_hook_suggestions'][] = 'page__node__'. $vars['node']->nid;
	}
	
	//404 page
	$status = drupal_get_http_header("status");
	if($status == "404 Not Found") {
		$vars['theme_hook_suggestions'][] = 'page__404';
	}


	if (isset($vars['node'])) :
		//print $vars['node']->type;
        if($vars['node']->type == 'page'):
            $node = node_load($vars['node']->nid);
            $output = field_view_field('node', $node, 'field_show_page_title', array('label' => 'hidden'));
            $vars['field_show_page_title'] = $output;
			//sidebar
			$output = field_view_field('node', $node, 'field_sidebar', array('label' => 'hidden'));
            $vars['field_sidebar'] = $output;
        endif;
    endif;
	
	$alias = drupal_get_path_alias(str_replace('/edit','',$_GET['q']));
	$parts = explode('/', $alias);
	
	if ($parts[0]=='user' && $parts[1]=='register') {
		//print_r($vars);
		$vars['theme_hook_suggestions'][] = 'page__userregister';
		return;
	}
	if (isset($vars['node']))
	{
		if($vars['node']->type=='organizationprimary') 
		{
			//print_r($vars);
			$vars['theme_hook_suggestions'][] = 'page__organization';
		}
	}
	//print_r($vars);
//krumo(theme_get_suggestions(arg(), 'page'));
}

function heshel_breadcrumb($variables) {
	
	$crumbs ='';
	$breadcrumb = $variables['breadcrumb'];
	if (!empty($breadcrumb)) {
		$crumbs .= '';
		foreach($breadcrumb as $value) {

			$crumbs .= $value.'<i class="fa fa-angle-right"></i>';
		}
		//print_r($variables);
		//echo $base_url;
		$crumbs .= '<span>'.drupal_get_title().'</span>';
		return $crumbs;
	}else{
		return NULL;
	}
}


function heshel_prev_next($nid = null, $ntype = null, $op = 'p') {
	
  if ($op == 'p') {
    $sql_op = '<';
    $order = 'DESC';
  } else{
    $sql_op = '>';
    $order = 'ASC';
  }
  
  $id = db_query("SELECT n.nid FROM {node} n 
				   WHERE n.nid $sql_op :nid 
				   AND n.status = 1
				   AND n.type = :type
				   ORDER BY n.nid $order
				   LIMIT 1",array(':nid' => $nid, ':type' => $ntype))->fetchCol();
  if ($id == null){
  		return $nid;
  }else{
	  return $id[0];
  }
	
}

function getRelatedPosts($ntype,$nid){
	$nids = db_query("SELECT n.nid, title FROM {node} n WHERE n.status = 1 AND n.type = :type AND n.nid <> :nid ORDER BY RAND() LIMIT 0,4", array(':type' => $ntype, ':nid' => $nid))->fetchCol();
	$nodes = node_load_multiple($nids);
	$return_string = '';
	$return_string .= '<ul class="item_list">' ;
	if (!empty($nodes)):
		foreach ($nodes as $node) :
			$return_string .= '<li><div class="item"><div class="item_wrapper">';
			$return_string .= '<div class="img_block">';
			$return_string .= '<a href="'.file_create_url($node->field_images['und'][0]['uri']).'">';
			$return_string .= '<img src="'.file_create_url($node->field_images['und'][0]['uri']).'" alt="'.$node->title.'">';
			$return_string .= '</a>';
			$return_string .= '</div>';
			$return_string .= '<div class="featured_items_body">';
			$return_string .= '<div class="featured_items_title">';
			$return_string .= '<h5><a href="'.url("node/" . $node->nid).'">'.$node->title.'</a></h5>';
			$return_string .= '</div>';
			$return_string .= '<div class="featured_item_content">'.substr($node->body['und'][0]['safe_summary'],0,100).'</div>';
			$return_string .= '<div class="featured_meta">';
			$return_string .= format_date($node->created, 'custom', 'M j,Y').' / '.'<a href="'.url("node/" . $node->nid).'">'.$node->comment_count.t(' comments').'</a>';
			$return_string .= '</div>';
			$return_string .= '</div>';
			$return_string .= '</div></div></li>';
		endforeach;
	endif;
	$return_string .= '</ul>';
	return $return_string;
}

//custom main menu
function heshel_menu_tree__main_menu(array $variables) {
	
	return '<div class="sub-nav"><ul class="sub-menu">' . $variables['tree'] . '</ul></div>';
		
}

function startsWith($haystack, $needle) {
    // search backwards starting from haystack length characters from the end
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}

function formatBytes($size, $precision = 2)
{
    $base = log($size, 1024);
    $suffixes = array('', 'k', 'MB', 'G', 'T');   

    return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
}


