<?php if ($use_form): ?>
<?php print render($form); ?>
<?php elseif ($subscription_link): ?>

<p><?php print $subscription_link; ?></p>
<?php endif; ?>
<div class="cleared"></div>
<?php if ($message): ?>
<p><?php print $message; ?></p>
<?php endif; ?>
