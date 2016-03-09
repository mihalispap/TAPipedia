<?php
/**
 * @file
 * Create create_mul_nodes.
 */

$plugin = array(
  'form' => 'feeds_tamper_create_mul_nodes_form',
  'callback' => 'feeds_tamper_create_mul_nodes_callback',
  'name' => 'Create multiple nodes',
  'multi' => 'direct',
  'category' => 'List',
);

function feeds_tamper_create_mul_nodes_form($importer, $element_key, $settings) {
  $form = array();

  $form['default_value'] = array(
    '#type' => 'textarea',
    '#title' => t('Create multiple nodes'),
    '#default_value' => isset($settings['default_value']) ? $settings['default_value'] : '',
    '#description' => t('This field will be set to the preferable content type machine name.'),
  );
  return $form;


}

function feeds_tamper_create_mul_nodes_callback($result, $item_key, $element_key, &$field, $settings, $source) {
    

   $c_type = $settings['default_value'];
      $type = $c_type;
      $flag = 0;
      $field_return = "";

if (!is_array($field)){
     if($flag == 0){
        $first_field_return =  trim($field);
        $flag = 1;
     }
 }else{
 foreach($field as $valuetitle){
    $valuetitle = trim($valuetitle);
    if($flag == 0){
      $first_field_return = $valuetitle;
      //$flag = 1;
    }

 $node_title_exists = 0;
 $query = db_select('node', 'n');
    $node_title_exists =  $query->fields('n', array('nid'))
      ->condition('n.type', $type, '=')
      ->condition('n.title', $valuetitle, '=')
      ->execute()
      ->fetchField();
    if (!($node_title_exists>0) && $flag == 1) {

       $values = array(
        'type' => $c_type,
        'status' => 1,
        'promote' => 0,
        );
        $entity = entity_create('node', $values);

                // The entity is now created, but we have not yet simplified use of it.
                // Now create an entity_metadata_wrapper around the new node entity
                // to make getting and setting values easier
        $ewrapper = entity_metadata_wrapper('node', $entity);

                // Using the wrapper, we do not have to worry about telling Drupal
                // what language we are using. The Entity API handles that for us.
        $valuetitle = trim($valuetitle);

        $ewrapper->title->set($valuetitle);
        $ewrapper->save();
   }//if of sql quey
  //end of the loop so we do flag=1 in order to know that it is not the first value
  $flag = 1;
 }//foreach


}

// The first value of each array
$field = $first_field_return;
//break;

}
  
 


