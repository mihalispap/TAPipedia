<?php

function heshel_form_system_theme_settings_alter(&$form, $form_state) {
	$theme_path = drupal_get_path('theme', 'heshel');
  	$form['settings'] = array(
      '#type' =>'vertical_tabs',
      '#title' => t('Theme settings'),
      '#weight' => 2,
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
	  '#attached' => array(
					'css' => array(drupal_get_path('theme', 'heshel') . '/css/drupalet_base/admin.css'),
					'js' => array(
						drupal_get_path('theme', 'heshel') . '/js/drupalet_admin/admin.js',
					),
			),
  	);
	
	// Tracking code & Css custom
	//==============================
	$form['settings']['general_setting'] = array(
		'#type' => 'fieldset',
		'#title' => t('General Settings'),
		'#collapsible' => TRUE,
		'#collapsed' => FALSE,
	);
	$form['settings']['general_setting']['general_setting_tracking_code'] = array(
		'#type' => 'textarea',
		'#title' => t('Tracking Code'),
		//'#default_value' => theme_get_setting('general_setting_tracking_code', 'heshel'),
	);
	$form['settings']['custom_css'] = array(
		'#type' => 'fieldset',
		'#title' => t('Custom CSS'),
		'#collapsible' => TRUE,
		'#collapsed' => FALSE,
	);
	$form['settings']['custom_css']['custom_css'] = array(
		'#type' => 'textarea',
		'#title' => t('Custom CSS'),
		//'#default_value' => theme_get_setting('custom_css', 'heshel'),
		'#description'  => t('<strong>Example:</strong><br/>h1 { font-family: \'Metrophobic\', Arial, serif; font-weight: 400; }')
	);
	//========= End ================
	
	
	// Footer Copyright message
	//==============================
	$form['settings']['footer'] = array(
      '#type' => 'fieldset',
      '#title' => t('Footer settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
  	);
	$form['settings']['footer']['footer_copyright_message'] = array(
      '#type' => 'textarea',
      '#title' => t('Copyright message'),
      '#default_value' => theme_get_setting('footer_copyright_message','heshel'),
  	);
	//========= End ================
	
	
	// Style
	//==============================
	$form['settings']['style'] = array(
      '#type' => 'fieldset',
      '#title' => t('Style'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
  	);
	$form['settings']['style']['sidebar'] = array(
      '#type' => 'select',
      '#title' => t('Sidebar'),
	  '#options' => array('ls' => t('Left Sidebar'), 'rs' => t('Right Sidebar'), 'fw' => t('No-Sidebar')),
	   '#default_value' => theme_get_setting('sidebar','heshel'),
  	);
	$form['settings']['style']['switcher'] = array(
      '#type' => 'select',
      '#title' => t('Switcher'),
	  '#options' => array('on' => t('On'), 'off' => t('Off')),
	  '#default_value' => theme_get_setting('switcher','heshel'),
  	);
	$form['settings']['style']['built_in_skins'] = array(
     '#type' => 'radios',
     '#title' => t('Built-in Skins'),
     '#options' => array(
        'custom_green.css' => t('Green'),
        'custom_yellow.css' => t('Yellow'),
        'custom_pink.css' => t('Pink'),
        'custom_orange.css' => t('Orange'),
        'custom_blue.css' => t('Blue'),
        'custom_sea.css' => t('Sea'),
        'custom_cyan.css' => t('Cyan'),
        'custom_gray.css' => t('Gray'),
     ),
     '#default_value' => theme_get_setting('built_in_skins','heshel')
    );
	
	$form['settings']['style']['built_in_header'] = array(
     '#type' => 'radios',
     '#title' => t('Header Style'),
     '#options' => array(
        'type1' => t('Header Type 1'),
        'type2' => t('Header Type 2'),
		'type3' => t('Header Type 3'),
		'type4' => t('Header Type 4'),
     ),
     '#default_value' => theme_get_setting('built_in_header','heshel')
    );
	
	//========= End ================
	
	
}