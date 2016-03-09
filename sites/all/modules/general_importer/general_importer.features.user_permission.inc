<?php
/**
 * @file
 * general_importer.features.user_permission.inc
 */

/**
 * Implements hook_user_default_permissions().
 */
function general_importer_user_default_permissions() {
  $permissions = array();

  // Exported permission: 'administer taxonomy'.
  $permissions['administer taxonomy'] = array(
    'name' => 'administer taxonomy',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'taxonomy',
  );

  // Exported permission: 'create general_importer_feed content'.
  $permissions['create general_importer_feed content'] = array(
    'name' => 'create general_importer_feed content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'create organizationprimary content'.
  $permissions['create organizationprimary content'] = array(
    'name' => 'create organizationprimary content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'create resource content'.
  $permissions['create resource content'] = array(
    'name' => 'create resource content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'delete any general_importer_feed content'.
  $permissions['delete any general_importer_feed content'] = array(
    'name' => 'delete any general_importer_feed content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'delete any organizationprimary content'.
  $permissions['delete any organizationprimary content'] = array(
    'name' => 'delete any organizationprimary content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'delete any resource content'.
  $permissions['delete any resource content'] = array(
    'name' => 'delete any resource content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'delete own general_importer_feed content'.
  $permissions['delete own general_importer_feed content'] = array(
    'name' => 'delete own general_importer_feed content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'delete own organizationprimary content'.
  $permissions['delete own organizationprimary content'] = array(
    'name' => 'delete own organizationprimary content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'delete own resource content'.
  $permissions['delete own resource content'] = array(
    'name' => 'delete own resource content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'delete terms in country'.
  $permissions['delete terms in country'] = array(
    'name' => 'delete terms in country',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in format'.
  $permissions['delete terms in format'] = array(
    'name' => 'delete terms in format',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in geographical_focus'.
  $permissions['delete terms in geographical_focus'] = array(
    'name' => 'delete terms in geographical_focus',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in keyword'.
  $permissions['delete terms in keyword'] = array(
    'name' => 'delete terms in keyword',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in language'.
  $permissions['delete terms in language'] = array(
    'name' => 'delete terms in language',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in licences'.
  $permissions['delete terms in licences'] = array(
    'name' => 'delete terms in licences',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in organization_types'.
  $permissions['delete terms in organization_types'] = array(
    'name' => 'delete terms in organization_types',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in related_topics'.
  $permissions['delete terms in related_topics'] = array(
    'name' => 'delete terms in related_topics',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in resource_type'.
  $permissions['delete terms in resource_type'] = array(
    'name' => 'delete terms in resource_type',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in subject'.
  $permissions['delete terms in subject'] = array(
    'name' => 'delete terms in subject',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'delete terms in tags'.
  $permissions['delete terms in tags'] = array(
    'name' => 'delete terms in tags',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit any general_importer_feed content'.
  $permissions['edit any general_importer_feed content'] = array(
    'name' => 'edit any general_importer_feed content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit any organizationprimary content'.
  $permissions['edit any organizationprimary content'] = array(
    'name' => 'edit any organizationprimary content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit any person content'.
  $permissions['edit any person content'] = array(
    'name' => 'edit any person content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit any resource content'.
  $permissions['edit any resource content'] = array(
    'name' => 'edit any resource content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit own general_importer_feed content'.
  $permissions['edit own general_importer_feed content'] = array(
    'name' => 'edit own general_importer_feed content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit own organizationprimary content'.
  $permissions['edit own organizationprimary content'] = array(
    'name' => 'edit own organizationprimary content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit own person content'.
  $permissions['edit own person content'] = array(
    'name' => 'edit own person content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit own resource content'.
  $permissions['edit own resource content'] = array(
    'name' => 'edit own resource content',
    'roles' => array(),
    'module' => 'node',
  );

  // Exported permission: 'edit terms in country'.
  $permissions['edit terms in country'] = array(
    'name' => 'edit terms in country',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in format'.
  $permissions['edit terms in format'] = array(
    'name' => 'edit terms in format',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in geographical_focus'.
  $permissions['edit terms in geographical_focus'] = array(
    'name' => 'edit terms in geographical_focus',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in keyword'.
  $permissions['edit terms in keyword'] = array(
    'name' => 'edit terms in keyword',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in language'.
  $permissions['edit terms in language'] = array(
    'name' => 'edit terms in language',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in licences'.
  $permissions['edit terms in licences'] = array(
    'name' => 'edit terms in licences',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in organization_types'.
  $permissions['edit terms in organization_types'] = array(
    'name' => 'edit terms in organization_types',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in related_topics'.
  $permissions['edit terms in related_topics'] = array(
    'name' => 'edit terms in related_topics',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in resource_type'.
  $permissions['edit terms in resource_type'] = array(
    'name' => 'edit terms in resource_type',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in subject'.
  $permissions['edit terms in subject'] = array(
    'name' => 'edit terms in subject',
    'roles' => array(),
    'module' => 'taxonomy',
  );

  // Exported permission: 'edit terms in tags'.
  $permissions['edit terms in tags'] = array(
    'name' => 'edit terms in tags',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'taxonomy',
  );

  // Exported permission: 'tamper generic_importer'.
  $permissions['tamper generic_importer'] = array(
    'name' => 'tamper generic_importer',
    'roles' => array(),
    'module' => 'feeds_tamper',
  );

  // Exported permission: 'view the administration theme'.
  $permissions['view the administration theme'] = array(
    'name' => 'view the administration theme',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'system',
  );

  return $permissions;
}
