<?php

/**
 * @file
 * Reduces an array to a single element.
 */

$plugin = array(
  'form' => 'feeds_tamper_reduce_to_single_element_form',
  'callback' => 'feeds_tamper_reduce_to_single_element_callback',
  'name' => 'Reduce to single element',
  'multi' => 'direct',
  'category' => 'List',
);

function feeds_tamper_reduce_to_single_element_form($importer, $element_key, $settings) {
  $form['reduce_method'] = array(
    '#type' => 'radios',
    '#title' => t('Method to use when reducing the array to a single element'),
    '#options' => array(
      'first' => t('Use the first array element'),
      'last' => t('Use the last array element'),
      'array' => t('Create a single-valued array with the input array inside it'),
    ),
    '#required' => TRUE,
    '#default_value' => isset($settings['reduce_method']) ? $settings['reduce_method'] : NULL,
  );
  return $form;
}

function feeds_tamper_reduce_to_single_element_callback($result, $item_key, $element_key, &$field, $settings, $source) {
  if (!is_array($field)) {
    $field = array($field);
  }
  switch ($settings['reduce_method']) {
    case 'first':
      $field = array_shift($field);
      break;
    case 'last':
      $field = array_pop($field);
      break;
    case 'array':
      $field = array($field);
      break;
  }
}
