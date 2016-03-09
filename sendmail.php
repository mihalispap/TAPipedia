<?php

// Report all PHP errors (see changelog)
error_reporting(E_ALL);

// Report all PHP errors
error_reporting(-1);

// Same as error_reporting(E_ALL);
ini_set('error_reporting', E_ALL);


// the message
$msg = "First line of text\nSecond line of text";

// use wordwrap() if lines are longer than 70 characters
$msg = wordwrap($msg,70);

// send email
$v=mail("somemail@somemail.com","My subject",$msg);
print_r(error_get_last());
if($v===true)
	echo "sent?!";
else
	echo $v.'|error?';
	
print_r(error_get_last());



?>
