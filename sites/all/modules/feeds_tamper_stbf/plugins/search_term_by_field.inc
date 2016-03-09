<?php

/**
 * @file
 * Search term by field.
 */

$plugin = array(
  'form' => 'feeds_tamper_search_term_by_field_form',
  'callback' => 'feeds_tamper_search_term_by_field_callback',
  //'validate' => 'feeds_tamper_search_term_by_field_validate',
  'name' => 'Search term by field',
  'multi' => 'loop',
  'category' => 'Text',
);

function feeds_tamper_search_term_by_field_form($importer, $element_key, $settings) {
  $form = array();
  
  $vocabularies = taxonomy_get_vocabularies();
  $options = array();
  foreach ($vocabularies as $vocabulary) {
    $options[$vocabulary->machine_name] = $vocabulary->name;
  }
  $form['vocabulary'] = array(
    '#type' => 'select',
    '#title' => t('Vocabulary'),
    '#default_value' => isset($settings['vocabulary']) ? $settings['vocabulary'] : '',
    '#options' => $options,
    '#required' => TRUE,
    '#description' => t('The vocabulary which this field attached to.'),
  );
  
  $form['field_name'] = array(
    '#type' => 'textfield',
    '#title' => t('field internal name'),
    '#default_value' => isset($settings['field_name']) ? $settings['field_name'] : '',
	'#required' => TRUE,
  );

  $form['auto_create'] = array(
    '#type' => 'checkbox',
    '#title' => t('Auto create'),
    '#default_value' => isset($settings['auto_create']) ? $settings['auto_create'] : FALSE,
    '#description' => t('If checked, auto creating a term base on field value.')
  );

  return $form;
}


function feeds_tamper_search_term_by_field_callback($result, $item_key, $element_key, &$field, $settings) {
   //drupal_set_message(var_export($field, TRUE));
  // drupal_set_message(var_export($result, TRUE));
   //drupal_set_message(var_export($item_key, TRUE));
  // drupal_set_message(var_export($element_key, TRUE));
   //drupal_set_message(var_export($settings, TRUE));
  $query = new EntityFieldQuery();

  $query->entityCondition('entity_type', 'taxonomy_term');
  $query->entityCondition('bundle', $settings['vocabulary']);
  $col = 'value'; //hardcoded at here.
  $query->fieldCondition($settings['field_name'], $col, $field);
  $result = $query->execute();

  $count = $query
    ->count()
    ->execute();
  if ($count) {
    $term_tids = array_keys($result['taxonomy_term']);
	$field = reset($term_tids);
  }
  elseif(!empty($settings['auto_create'])){
    $vocabulary = taxonomy_vocabulary_machine_name_load($settings['vocabulary']);
    $term = new stdClass();
    $term->name = $field;
    $term->vid = $vocabulary->vid;
    $term->{$settings['field_name']}['und'][0]['value'] = $field;
    taxonomy_term_save($term);
	$field = $term->tid;
  }

}
