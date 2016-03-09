<?php

/**
 * @file
 * Home of the FeedsCrawler.
 */

/**
 * Fetches data via HTTP.
 */
abstract class FeedsCrawlerBase extends FeedsHTTPFetcher {

  /**
   * Implements FeedsFetcher::fetch().
   */
  public function fetch(FeedsSource $source) {
    $source_config = $source->getConfigFor($this);

    if ($this->config['use_pubsubhubbub'] && ($raw = $this->subscriber($source->feed_nid)->receive())) {
      return new FeedsFetcherResult($raw);
    }

    $state = $source->state(FEEDS_FETCH);

    if (!isset($state->init)) {
      $state->init = TRUE;
      $state->total = ($source_config['num_pages'] == 0) ? 100000 : $source_config['num_pages'];
      $state->count = $state->total;
      $url = $source_config['source'];
    }
    else {
      $url = $state->next_url;
    }

    $result = new FeedsHTTPFetcherResult($url);

    if ($source_config['first_run'] && $source->config['FeedsCrawler']['crawled']) {
      $state->progress($state->total, $state->total);
      return $result;
    }

    sleep($source_config['delay']);

    if ($url = $this->findNextLink($result, $source_config, $state)) {

      $state->next_url = $url;
      $state->count--;
      $state->progress($state->total, $state->total - $state->count);

      if ($state->count <= 0) {
        $source->config['FeedsCrawler']['crawled'] = TRUE;
      }
    }
    else {
      $state->progress($state->total, $state->total);
    }

    return $result;
  }

  /**
   * Crawling plugins must implement this and return a url.
   *
   * @param FeedsFetcherResult $result
   *   The result object from the current page.
   * @param array $source_config
   *   The source configuration.
   * @param FeedsState $state
   *   The state object.
   *
   * @return string
   *   The URL to fetch next.
   */
  abstract protected function findNextLink(FeedsFetcherResult $result, array $source_config, FeedsState $state);

  /**
   * Builds a fully qualified URL from the source URL if necessary.
   */
  protected function parseHref($href, $source_url) {
    if ($href === FALSE || empty($href)) {
      return FALSE;
    }
    foreach ($href as $h) {
      $h = trim((string) $h);
      if (!empty($h)) {
        $href = $h;
        break;
      }
    }
    if (strpos($href, 'http://') !== 0 && strpos($href, 'https://') !== 0) {
      if (substr($href, 0, 1) == '/') {
        $href = ltrim($href, '/');
        $href = $this->baseUrl($source_url) . '/' . $href;
      }
      else {
        $href = $this->baseUrl($source_url, TRUE) . '/' . $href;
      }
    }
    return $href;
  }

  /**
   * Breaks a url up removing everything but the http://example.com.
   *
   * @param string $url
   *   The url string to return the base path for.
   * @param bool $relative
   *   (Optional) If TRUE, returns the base path as well fir relative urls.
   *   Defaults to FALSE.
   */
  protected function baseUrl($url, $relative = FALSE) {
    $p = parse_url($url);
    $output = '';
    $output .= isset($p['scheme']) ? $p['scheme'] : 'http';
    $output .= '://';
    $output .= isset($p['user']) ? $p['user'] : '';
    $output .= isset($p['pass']) ? ':' . $p['pass'] : '';
    $output .= isset($p['user']) ? '@' : '';
    $output .= $p['host'];
    $output .= isset($p['port']) ? ':' . $p['port'] : '';

    if ($relative) {
      $output .= isset($p['path']) ? substr($p['path'], 0, strrpos($p['path'], '/')) : '';
    }

    return $output;
  }

  /**
   * Overrides parent::sourceDefaults().
   */
  public function sourceDefaults() {
    return $this->config;
  }

  /**
   * Overrides parent::sourceForm().
   */
  public function sourceForm($source_config) {
    // Feeds sourceDefaults() doesn't seem to be working correctly.
    $source_config += $this->config;

    $form = parent::sourceForm($source_config);
    $form['crawler'] = array(
      '#type' => 'fieldset',
      '#title' => t('Feeds Crawler settings'),
      '#collapsed' => TRUE,
      '#collapsible' => TRUE,
      '#tree' => TRUE,
    );
    $form['crawler']['num_pages'] = array(
      '#type' => 'textfield',
      '#title' => t('Number of pages'),
      '#description' => t('The number of pages to fetch. 0 for unlimited'),
      '#default_value' => $source_config['num_pages'],
      '#maxlength' => 10,
    );
    $form['crawler']['delay'] = array(
      '#type' => 'textfield',
      '#title' => t('Delay'),
      '#description' => t('Number of seconds to delay in between fetches.'),
      '#default_value' => $source_config['delay'],
    );
    $form['crawler']['first_run'] = array(
      '#type' => 'checkbox',
      '#title' => t('Crawl on first run only'),
      '#description' => t('Only crawl on initial run. Use regular import afterword.'),
      '#default_value' => $source_config['first_run'],
    );
    $form['crawled'] = array(
      '#type' => 'hidden',
      '#value' => $source_config['crawled'],
    );
    return $form;
  }

  /**
   * Overrides parent::sourceFormValidate().
   */
  public function sourceFormValidate(&$values) {
    foreach ($values['crawler'] as $key => $value) {
      $values[$key] = trim($value);
    }
    unset($values['crawler']);

    if (empty($values['num_pages'])) {
      $values['num_pages'] = 0;
    }

    if (empty($values['delay'])) {
      $values['delay'] = 0;
    }

    if ((string) $values['num_pages'] !== (string) (int) $values['num_pages']) {
      form_set_error('num_pages', t('Number of pages must be an integer.'));
    }

    if (!is_numeric($values['delay'])) {
      form_set_error('delay', t('Delay must be a number.'));
    }
  }

  /**
   * Overrides parent::configDefaults().
   */
  public function configDefaults() {
    return parent::configDefaults() + array(
      'num_pages' => 10,
      'first_run' => TRUE,
      'delay' => 1,
      'auto' => FALSE,
      'allow_override' => FALSE,
      'crawled' => FALSE,
    );
  }

  /**
   * Overrides parent::configForm().
   */
  public function configForm(&$form_state) {
    $form = $this->sourceForm($this->config);
    unset($form['source']);
    unset($form['crawled']);
    $form['crawler']['#collapsed'] = FALSE;
    $form['crawler']['#title'] = t('Feeds Crawler default settings');

    $form['crawler']['allow_override'] = array(
      '#type' => 'checkbox',
      '#title' => t('Allow source config override'),
      '#default_value' => $this->config['allow_override'],
      '#description' => t('Allow these settings to be overridden per-source.'),
      '#weight' => -1,
    );

    $parent_form = parent::configForm($form_state);
    $parent_form['auto_detect_feeds']['#access'] = FALSE;
    return $parent_form + $form;
  }

  /**
   * Overrides parent::configFormValidate().
   */
  public function configFormValidate(&$values) {
    $this->sourceFormValidate($values);
  }

  /**
   * Starts custom error handling.
   *
   * @return bool
   *   The previous value of use_errors.
   */
  protected function errorStart() {
    return libxml_use_internal_errors(TRUE);
  }

  /**
   * Stops custom error handling.
   *
   * @param bool $use
   *   The previous value of use_errors.
   * @param bool $print
   *   (Optional) Whether to print errors to the screen. Defaults to TRUE.
   */
  protected function errorStop($use, $print = TRUE) {

    if ($print) {

      foreach (libxml_get_errors() as $error) {
        switch ($error->level) {
          case LIBXML_ERR_WARNING:
          case LIBXML_ERR_ERROR:
            $type = 'warning';
            break;

          case LIBXML_ERR_FATAL:
            $type = 'error';
            break;

        }

        $args = array(
          '%error' => trim($error->message),
          '%num' => $error->line,
          '%code' => $error->code,
        );
        $message = t('%error on line %num. Error code: %code', $args);
        drupal_set_message($message, $type, FALSE);
      }
    }

    libxml_clear_errors();
    libxml_use_internal_errors($use);
  }

}
