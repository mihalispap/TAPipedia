<?php

/**
 * @file
 * Contains FeedsPatternCrawler.
 */

/**
 * Crawls pages using a URL pattern.
 */
class FeedsPatternCrawler extends FeedsCrawlerBase {

  /**
   * Implements parent::findNextLink().
   */
  protected function findNextLink(FeedsFetcherResult $result, array $source_config, FeedsState $state) {
    if (!isset($state->inc)) {
      $state->inc = $source_config['initial'];
    }
    else {
      $state->inc += $source_config['increment'];
    }
    return str_replace('$index', $state->inc, $source_config['url_pattern']);
  }

  /**
   * Overrides parent::configDefaults().
   */
  public function configDefaults() {
    $defaults = parent::configDefaults();
    $defaults['url_pattern'] = '';
    $defaults['initial'] = 0;
    $defaults['increment'] = 1;
    return $defaults;
  }

  /**
   * Overrides parent::sourceForm().
   */
  public function sourceForm($source_config) {
    $source_config += $this->config;
    $form = parent::sourceForm($source_config);

    $form['crawler']['url_pattern'] = array(
      '#type' => 'textfield',
      '#title' => t('URL pattern'),
      '#description' => t('A URL with the variable $index replaced with an increnting number. For example: http://example.com?page=$index.'),
      '#default_value' => $source_config['url_pattern'],
      '#maxlength' => NULL,
      '#required' => TRUE,
    );
    $form['crawler']['initial'] = array(
      '#type' => 'textfield',
      '#title' => t('Initial value of $index'),
      '#description' => t('The initial value of the $index variable.'),
      '#default_value' => $source_config['initial'],
      '#required' => TRUE,
    );
    $form['crawler']['increment'] = array(
      '#type' => 'textfield',
      '#title' => t('Increment $index by'),
      '#description' => t('The increment the value of $index variable.'),
      '#default_value' => $source_config['increment'],
      '#required' => TRUE,
    );

    return $form;
  }

  /**
   * Overrides parent::sourceFormValidate().
   */
  public function sourceFormValidate(&$values) {
    parent::sourceFormValidate($values);
    if (!empty($values['url_pattern']) && !feeds_valid_url($values['url_pattern'], TRUE)) {
      form_set_error('url_pattern', t('URL pattern must be a valid URL.'));
    }

    if (!empty($values['initial']) && !is_numeric($values['initial'])) {
      form_set_error('initial', t('Initial value of $index must be a number.'));
    }
    if (!empty($values['increment']) && !is_numeric($values['increment'])) {
      form_set_error('increment', t('Increment $index by must be a number.'));
    }
  }

}
