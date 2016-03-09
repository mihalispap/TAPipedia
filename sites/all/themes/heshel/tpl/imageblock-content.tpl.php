<?php

/**
 * @file
 * Default theme implementation to display image block content.
 *
 * Available variables:
 * - $image: Block image.
 * - $content: Block content.
 * - $block: Block object.
 *
 * @see template_preprocess()
 * @see template_preprocess_imageblock_content()
 */
?>
<li data-transition="fade" data-slotamount="5" data-masterspeed="700" class="covered_height">
<?php if ($image): ?>
    <?php print $image ?>
<?php endif; ?>
<?php if ($content): ?>
    <?php print $content ?>
<?php endif; ?>
</li>
