<?php
/**
 * @file
 * Linkit views plugin.
 */
 
$plugin = array(
  'ui_title' => t('Ak linkit'),
  'ui_description' => t('Extend Linkit search biblio by author.'),
  'entity_type' => 'node',
  'handler' => array(
      'class' => 'AkLinkitPlugin',
      'file' => 'aklinkitplugin.class.php',
  ),
);