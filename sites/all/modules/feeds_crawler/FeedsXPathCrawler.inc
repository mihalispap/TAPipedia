<?php

/**
 * @file
 * Contains FeedsXPathCrawler.
 */

/**
 * Crawls pages using XPath to find the next link.
 */
class FeedsXPathCrawler extends FeedsCrawlerBase {

  /**
   * Implements parent::findNextLink().
   */
  protected function findNextLink(FeedsFetcherResult $result, array $source_config, FeedsState $state) {
    $errors = $this->errorStart();

    $dom = new DOMDocument();
    $dom->loadHTML($result->getRaw());
    $xml = simplexml_import_dom($dom);
    unset($dom);
    $href = $xml->xpath($source_config['xpath']);
    unset($xml);

    $this->errorStop($errors, FALSE);
    return $this->parseHref($href, $source_config['source']);
  }

  /**
   * Overrides parent::configDefaults().
   */
  public function configDefaults() {
    $defaults = parent::configDefaults();
    $defaults['xpath'] = '';
    return $defaults;
  }

  /**
   * Overrides parent::sourceForm().
   */
  public function sourceForm($source_config) {
    $source_config += $this->config;
    $form = parent::sourceForm($source_config);

    $form['crawler']['xpath'] = array(
      '#type' => 'textfield',
      '#title' => t('XPath selector for next link'),
      '#description' => t('The XPath selector for the next link.'),
      '#default_value' => $source_config['xpath'],
      '#maxlength' => NULL,
      '#required' => TRUE,
    );

    return $form;
  }

  /**
   * Overrides parent::sourceFormValidate().
   */
  public function sourceFormValidate(&$values) {
    parent::sourceFormValidate($values);

    if (!empty($values['xpath'])) {
      $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?>' . "\n<items></items>");
      $use_errors = libxml_use_internal_errors(TRUE);
      $result = $xml->xpath($values['xpath']);
      $error = libxml_get_last_error();
      libxml_clear_errors();
      libxml_use_internal_errors($use_errors);

      if ($error) {
        form_set_error('crawler][xpath', t('There was an error with the XPath selector: ') . $error->message);
      }
    }
  }

}
