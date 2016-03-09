<?php
/**
 * @file
 * generalimporter.feeds_importer_default.inc
 */

/**
 * Implements hook_feeds_importer_default().
 */
function generalimporter_feeds_importer_default() {
  $export = array();

  $feeds_importer = new stdClass();
  $feeds_importer->disabled = FALSE; /* Edit this to true to make a default feeds_importer disabled initially */
  $feeds_importer->api_version = 1;
  $feeds_importer->id = 'generic_importer';
  $feeds_importer->config = array(
    'name' => 'generic importer',
    'description' => '',
    'fetcher' => array(
      'plugin_key' => 'FeedsHTTPFetcher',
      'config' => array(
        'auto_detect_feeds' => FALSE,
        'use_pubsubhubbub' => FALSE,
        'designated_hub' => '',
        'request_timeout' => NULL,
      ),
    ),
    'parser' => array(
      'plugin_key' => 'FeedsXPathParserXML',
      'config' => array(
        'sources' => array(
          'xpathparser:0' => 'arr[@name="fdr_title@en"]/str/text()',
          'xpathparser:1' => 'arr[@name="fdr_abstract@en"]/str/text()',
          'xpathparser:2' => 'arr[@name="fdr_author"]/str/text()',
          'xpathparser:3' => '/response/lst[@name=\'fdr-related\']/lst[@name=\'$field_doc_type\']/str[@name="label@en"]/text()',
          'xpathparser:4' => 'str[@name="fdr_default_file"]/text()',
          'xpathparser:5' => '',
          'xpathparser:6' => '/response/lst[@name=\'fdr-files\']/lst[@name=\'$field_doc_identifier\']/str[@name=\'file_url\']/text()',
          'xpathparser:7' => 'arr[@name="fdr_pages"]/text()',
          'xpathparser:8' => '',
          'xpathparser:9' => '/response/lst[@name=\'fdr-related\']/lst[@name=\'$field_doc_subject\']/str[@name="label@en"]/text()',
          'xpathparser:10' => '',
          'xpathparser:11' => '',
          'xpathparser:12' => '',
        ),
        'rawXML' => array(
          'xpathparser:0' => 0,
          'xpathparser:1' => 0,
          'xpathparser:2' => 0,
          'xpathparser:3' => 0,
          'xpathparser:4' => 0,
          'xpathparser:5' => 0,
          'xpathparser:6' => 0,
          'xpathparser:7' => 0,
          'xpathparser:8' => 0,
          'xpathparser:9' => 0,
          'xpathparser:10' => 0,
          'xpathparser:11' => 0,
          'xpathparser:12' => 0,
        ),
        'context' => '/response/result/doc',
        'exp' => array(
          'errors' => 0,
          'debug' => array(
            'context' => 0,
            'xpathparser:0' => 0,
            'xpathparser:1' => 0,
            'xpathparser:2' => 0,
            'xpathparser:3' => 0,
            'xpathparser:4' => 0,
            'xpathparser:5' => 0,
            'xpathparser:6' => 0,
            'xpathparser:7' => 0,
            'xpathparser:8' => 0,
            'xpathparser:9' => 0,
            'xpathparser:10' => 0,
            'xpathparser:11' => 0,
            'xpathparser:12' => 0,
          ),
        ),
        'allow_override' => 1,
      ),
    ),
    'processor' => array(
      'plugin_key' => 'FeedsNodeProcessor',
      'config' => array(
        'expire' => '-1',
        'author' => 0,
        'authorize' => 1,
        'mappings' => array(
          0 => array(
            'source' => 'xpathparser:0',
            'target' => 'title',
            'unique' => FALSE,
          ),
          1 => array(
            'source' => 'xpathparser:1',
            'target' => 'body',
            'unique' => FALSE,
          ),
          2 => array(
            'source' => 'xpathparser:2',
            'target' => 'field_creator:label',
            'unique' => FALSE,
          ),
          3 => array(
            'source' => 'xpathparser:3',
            'target' => 'field_resource_type',
            'unique' => FALSE,
          ),
          4 => array(
            'source' => 'xpathparser:4',
            'target' => 'field_identifier',
            'unique' => FALSE,
          ),
          5 => array(
            'source' => 'xpathparser:5',
            'target' => 'field_is_shown_at:url',
            'unique' => FALSE,
          ),
          6 => array(
            'source' => 'Blank source 1',
            'target' => 'field_is_shown_at:url',
            'unique' => FALSE,
          ),
          7 => array(
            'source' => 'xpathparser:6',
            'target' => 'field_is_shown_by:url',
            'unique' => FALSE,
          ),
          8 => array(
            'source' => 'Blank source 2',
            'target' => 'field_is_shown_by:title',
            'unique' => FALSE,
          ),
          9 => array(
            'source' => 'xpathparser:7',
            'target' => 'field_extent',
            'unique' => FALSE,
          ),
          10 => array(
            'source' => 'xpathparser:8',
            'target' => 'field_format',
            'unique' => FALSE,
          ),
          11 => array(
            'source' => 'xpathparser:9',
            'target' => 'field_subject',
            'unique' => FALSE,
          ),
          12 => array(
            'source' => 'xpathparser:10',
            'target' => 'field_keyword',
            'term_search' => '0',
            'autocreate' => 1,
          ),
          13 => array(
            'source' => 'xpathparser:11',
            'target' => 'field_edition',
            'unique' => FALSE,
          ),
          14 => array(
            'source' => 'xpathparser:12',
            'target' => 'field_publisher:label',
            'unique' => FALSE,
          ),
        ),
        'update_existing' => '2',
        'input_format' => 'plain_text',
        'skip_hash_check' => 0,
        'bundle' => 'resource',
      ),
    ),
    'content_type' => 'general_importer_feed',
    'update' => 0,
    'import_period' => '-1',
    'expire_period' => 3600,
    'import_on_create' => 0,
    'process_in_background' => 0,
  );
  $export['generic_importer'] = $feeds_importer;

  return $export;
}
