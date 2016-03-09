<?php
/**
 * @file
 * general_importer.features.menu_links.inc
 */

/**
 * Implements hook_menu_default_menu_links().
 */
function general_importer_menu_default_menu_links() {
  $menu_links = array();

  // Exported menu link: management_feeds-importers:admin/structure/feeds
  $menu_links['management_feeds-importers:admin/structure/feeds'] = array(
    'menu_name' => 'management',
    'link_path' => 'admin/structure/feeds',
    'router_path' => 'admin/structure/feeds',
    'link_title' => 'Feeds importers',
    'options' => array(
      'attributes' => array(
        'title' => 'Configure one or more Feeds importers to aggregate RSS and Atom feeds, import CSV files or more.',
      ),
      'identifier' => 'management_feeds-importers:admin/structure/feeds',
    ),
    'module' => 'system',
    'hidden' => 0,
    'external' => 0,
    'has_children' => 1,
    'expanded' => 0,
    'weight' => 0,
    'customized' => 0,
    'parent_identifier' => 'management_structure:admin/structure',
  );
  // Exported menu link: management_taxonomy:admin/structure/taxonomy
  $menu_links['management_taxonomy:admin/structure/taxonomy'] = array(
    'menu_name' => 'management',
    'link_path' => 'admin/structure/taxonomy',
    'router_path' => 'admin/structure/taxonomy',
    'link_title' => 'Taxonomy',
    'options' => array(
      'attributes' => array(
        'title' => 'Manage tagging, categorization, and classification of your content.',
      ),
      'identifier' => 'management_taxonomy:admin/structure/taxonomy',
    ),
    'module' => 'system',
    'hidden' => 0,
    'external' => 0,
    'has_children' => 1,
    'expanded' => 0,
    'weight' => 0,
    'customized' => 0,
    'parent_identifier' => 'management_structure:admin/structure',
  );
  // Exported menu link: navigation_general-importer-feed:node/add/general-importer-feed
  $menu_links['navigation_general-importer-feed:node/add/general-importer-feed'] = array(
    'menu_name' => 'navigation',
    'link_path' => 'node/add/general-importer-feed',
    'router_path' => 'node/add/general-importer-feed',
    'link_title' => 'general importer feed',
    'options' => array(
      'identifier' => 'navigation_general-importer-feed:node/add/general-importer-feed',
    ),
    'module' => 'system',
    'hidden' => 0,
    'external' => 0,
    'has_children' => 0,
    'expanded' => 0,
    'weight' => 0,
    'customized' => 0,
    'parent_identifier' => 'navigation_add-content:node/add',
  );
  // Exported menu link: navigation_import:import
  $menu_links['navigation_import:import'] = array(
    'menu_name' => 'navigation',
    'link_path' => 'import',
    'router_path' => 'import',
    'link_title' => 'Import',
    'options' => array(
      'identifier' => 'navigation_import:import',
    ),
    'module' => 'system',
    'hidden' => 0,
    'external' => 0,
    'has_children' => 1,
    'expanded' => 0,
    'weight' => 0,
    'customized' => 0,
  );
  // Exported menu link: navigation_organization:node/add/organizationprimary
  $menu_links['navigation_organization:node/add/organizationprimary'] = array(
    'menu_name' => 'navigation',
    'link_path' => 'node/add/organizationprimary',
    'router_path' => 'node/add/organizationprimary',
    'link_title' => 'Organization',
    'options' => array(
      'identifier' => 'navigation_organization:node/add/organizationprimary',
    ),
    'module' => 'system',
    'hidden' => 0,
    'external' => 0,
    'has_children' => 0,
    'expanded' => 0,
    'weight' => 0,
    'customized' => 0,
    'parent_identifier' => 'navigation_add-content:node/add',
  );
  // Exported menu link: navigation_person:node/add/person
  $menu_links['navigation_person:node/add/person'] = array(
    'menu_name' => 'navigation',
    'link_path' => 'node/add/person',
    'router_path' => 'node/add/person',
    'link_title' => 'Person',
    'options' => array(
      'identifier' => 'navigation_person:node/add/person',
    ),
    'module' => 'system',
    'hidden' => 0,
    'external' => 0,
    'has_children' => 0,
    'expanded' => 0,
    'weight' => 0,
    'customized' => 0,
    'parent_identifier' => 'navigation_add-content:node/add',
  );
  // Exported menu link: navigation_resource:node/add/resource
  $menu_links['navigation_resource:node/add/resource'] = array(
    'menu_name' => 'navigation',
    'link_path' => 'node/add/resource',
    'router_path' => 'node/add/resource',
    'link_title' => 'Resource',
    'options' => array(
      'identifier' => 'navigation_resource:node/add/resource',
    ),
    'module' => 'system',
    'hidden' => 0,
    'external' => 0,
    'has_children' => 0,
    'expanded' => 0,
    'weight' => 0,
    'customized' => 0,
    'parent_identifier' => 'navigation_add-content:node/add',
  );

  // Translatables
  // Included for use with string extractors like potx.
  t('Feeds importers');
  t('Import');
  t('Organization');
  t('Person');
  t('Resource');
  t('Taxonomy');
  t('general importer feed');

  return $menu_links;
}
