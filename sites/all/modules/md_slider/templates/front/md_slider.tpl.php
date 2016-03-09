<div id="md-slider-<?php print $slider->slid;?>-<?php print $type;?>" class="md-slide-items" <?php print $data_properties;?>>
    <?php foreach ($slides as $index => $slide):?>
      <?php print theme('front_slide_render', array('index' => $index, 'slide' => $slide, 'slider_settings' => $slider->settings));?>
    <?php endforeach;?>
</div>

<?php

?>
