<?php

/**
 * @file
 * Contains FeedsAtomCrawler.
 */

/**
 * Crawls pages using Atom to find the next link.
 */
class FeedsAtomCrawler extends FeedsCrawlerBase {

  /**
   * Implements parent::findNextLink().
   */
  protected function findNextLink(FeedsFetcherResult $result, array $source_config, FeedsState $state) {
    $errors = $this->errorStart();

    $xml = new SimpleXMLElement($result->getRaw());
    feeds_include_library('common_syndication_parser.inc', 'common_syndication_parser');

    $format = _parser_common_syndication_feed_format_detect($xml);
    if ($format) {
      $xml->registerXpathNamespace('atom', 'http://www.w3.org/2005/Atom');
      $xpath = 'atom:link[@rel="next"]/@href';
    }
    else {
      $xpath = 'link[@rel="next"]/@href';
    }
    $href = $xml->xpath($xpath);
    unset($xml);

    $this->errorStop($errors, FALSE);

    return $this->parseHref($href, $source_config['source']);
  }

}
