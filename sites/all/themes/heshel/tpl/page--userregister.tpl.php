<?php require_once(drupal_get_path('theme','heshel').'/tpl/header.tpl.php'); 

global $base_url;
?>
<?php 
	if (!empty($tabs['#primary']) || !empty($tabs['#secondary'])):
		print render($tabs);
	endif;
	print $messages;
	unset($page['content']['system_main']['default_message']);
?>

<?php

	$alias = drupal_get_path_alias(str_replace('/edit','',$_GET['q']));
	$parts = explode('/', $alias);
		
		
		
		
	if($parts[2]=='step_2')
	{
		
		
		?>



			<div class="form-actions form-wrapper" id="edit-buttons2">
				<a href="/"><div id="finish-text">FINISHED</div></a>
			</div>
			<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>
			<style>
				.nodisplay {display:none;}
				.dodisplay {display:block;}
			</style>

		<script>
			$( document ).ready(function() {
				$('#step-step-step-2').append( $('#edit-buttons2') );
				$("#edit-buttons").addClass('nodisplay');
				$("#edit-buttons2").addClass('nodisplay');
			});
		
			$(function(){
			  $('#edit-profile-user-register-step-2-field-type-of-account-und-institutional-user').click(function(){
				if ($(this).is(':checked'))
				{
				  $("#edit-buttons").addClass('dodisplay');
				  $("#edit-buttons").removeClass('nodisplay');
				  $("#edit-buttons2").addClass('dodisplay');
				  $("#edit-buttons2").removeClass('nodisplay');
				  
				  $("#finish-text").html("Found your organization?");
				  $("#edit-next").val("Register your organization");
				}
				else
				{
					$("#edit-buttons").addClass('nodisplay');
					$("#edit-buttons").removeClass('dodisplay');
				}
			  });
			  $('#edit-profile-user-register-step-2-field-type-of-account-und-none').click(function(){
				if ($(this).is(':checked'))
				{
					$("#edit-buttons2").addClass('dodisplay');
				  $("#edit-buttons2").removeClass('nodisplay');
				  //$("#edit-buttons2").addClass('dodisplay');
				  //$("#edit-buttons2").removeClass('nodisplay');
				  
					$("#edit-buttons").addClass('nodisplay');
					$("#edit-buttons").removeClass('dodisplay');
				  $("#finish-text").html("Finish");
				}
			  });
			  $('#edit-profile-user-register-step-2-field-type-of-account-und-individual-user').click(function(){
				if ($(this).is(':checked'))
				{
					$("#edit-buttons2").addClass('dodisplay');
				  $("#edit-buttons2").removeClass('nodisplay');
				  //$("#edit-buttons2").addClass('dodisplay');
				  //$("#edit-buttons2").removeClass('nodisplay');
				  
					$("#edit-buttons").addClass('nodisplay');
					$("#edit-buttons").removeClass('dodisplay');
					$("#finish-text").html("Finish");
				}
			  });
			});
		
		</script>
		
		
	<?php
	}
	
?>

<div class="wrapper">


<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>
<style>
	.nodisplay {display:none;}
	.dodisplay {display:block;}	

	.current {font-weight:bold;}
	.fl-container.hasRS{    
		border: 1px solid #bfbfbf;
		margin-left: 10px;
		width: 73%;
	}
	
	.tabs.primary {display:none;}
	
	
ul.references-dialog-links li a.add-dialog.references-dialog-activate 
{
	background: url('/sites/all/modules/references_dialog/img/plus.png') 20px no-repeat;
	background-color: #13598F;
    display: block;
    clear: both;
    width: 50%;
    padding: 2%;
    margin-left: -40px;
    border-radius: 20px;
    text-align: center;
    color: #fff;
    font-weight: bold;
}
	
</style>

<script>

var step=1;
$( document ).ready(function() {
	$('#edit-field-personal-details-und-form-field-type-of-account').addClass('nodisplay');
	$('#edit-field-personal-details-und-form-field-activities').addClass('nodisplay');
	$('#edit-field-personal-details-und-form-field-cd-focus').addClass('nodisplay');
	$('#edit-field-personal-details-und-form-field-location').addClass('nodisplay');
	$('#edit-field-personal-details-und-form-field-geographical-focus').addClass('nodisplay');
	$('#edit-field-personal-details-und-form-field-person-title').addClass('nodisplay');
	$('#edit-field-personal-details-und-form-field-geo-focus').addClass('nodisplay');
	
	
	
		$('#edit-field-personal-details-und-form-field-type-of-account').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-activities').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-cd-focus').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-location').addClass('nodisplay');
		$('#field-personal-details-und-form-field-affiliation-add-more-wrapper').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-job-title').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-country').addClass('nodisplay');	
	$('#edit-actions').addClass('nodisplay');
	
	$('.add-dialog.references-dialog-activate').text('If you don\'t find your organization above, register it here!');
	
	
		$('#edit-field-personal-details-und-form-field-job-title').removeClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-country').removeClass('nodisplay');	
		$('#edit-field-personal-details-und-form-field-person-title').removeClass('nodisplay');

		$( "#user-register-form" ).submit(function( event ) {
	
			var org=document.querySelector('[name="field_personal_details[und][form][field_affiliation][und][0][target_id]"]').value;
	
			if(org.length==0)
				return true;
	
			var n = org.search(/\([0-9]+\)/i);
			if(n>0)
				return true;
			
				
			alert('Please choose an existing organization or register a new one!');
			event.preventDefault();
			return true;
		});
		  

});

function clickednext()
{
	$('#step1').removeClass('current');
	$('#step2').removeClass('current');
	$('#step3').removeClass('current');
	
	step++;
	
	if(step>=3)
		step=2;
	
	$('#step'+step).addClass('current');
	
	update_form();
}

function clickedprevious()
{
	$('#step1').removeClass('current');
	$('#step2').removeClass('current');
	$('#step3').removeClass('current');
	
	step--;
	
	if(step<=0)
		step=1;
	
	$('#step'+step).addClass('current');
	$('#step'+step).removeClass('nodisplay');
	
	update_form();
}



function update_form()
{
	if(step==1)
	{
		$('#edit-field-personal-details-und-form-field-type-of-account').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-activities').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-cd-focus').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-location').addClass('nodisplay');
		$('#field-personal-details-und-form-field-affiliation-add-more-wrapper').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-job-title').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-country').addClass('nodisplay');	
		$('#edit-field-personal-details-und-form-field-geo-focus').addClass('nodisplay');
				
		$('#edit-field-personal-details-und-form-field-job-title').removeClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-country').removeClass('nodisplay');	
		
		$('#field-personal-details-und-form-field-first-name-add-more-wrapper').removeClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-last-name').removeClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-person-title').removeClass('nodisplay');
		$('#edit-account').removeClass('nodisplay');	
		
		$('#edit-actions').addClass('nodisplay');
		$('#previous').addClass('nodisplay');
		$('#next').removeClass('nodisplay');
	}
	if(step==2)
	{
		$('#edit-field-personal-details-und-form-field-type-of-account').removeClass('nodisplay');
		$('#field-personal-details-und-form-field-affiliation-add-more-wrapper').removeClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-activities').removeClass('nodisplay');
		//$('#edit-field-personal-details-und-form-field-job-title').removeClass('nodisplay');
		//$('#edit-field-personal-details-und-form-field-country').removeClass('nodisplay');	
		$('#edit-field-personal-details-und-form-field-cd-focus').removeClass('nodisplay');
		//$('#edit-field-personal-details-und-form-field-geographical-focus').removeClass('nodisplay');
		
		$('#edit-field-personal-details-und-form-field-person-title').addClass('nodisplay');
		$('#edit-account').addClass('nodisplay');
		$('#field-personal-details-und-form-field-first-name-add-more-wrapper').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-last-name').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-job-title').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-country').addClass('nodisplay');	
		
		//$('#edit-field-personal-details-und-form-field-geographical-focus').removeClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-geo-focus').removeClass('nodisplay');
		
		$('#edit-actions').removeClass('nodisplay');	
		$('#previous').removeClass('nodisplay');	
		$('#next').addClass('nodisplay');
	}
	if(step==3)
	{
		$('#edit-field-personal-details-und-form-field-type-of-account').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-activities').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-cd-focus').addClass('nodisplay');
		$('#edit-field-personal-details-und-form-field-location').addClass('nodisplay');
		$('#edit-actions').removeClass('nodisplay');
	}
	
	$("html, body").animate({ scrollTop: 0 }, "slow");
}

</script>


	<div id="steps">
		<div id="step1" onclick="clickedprevious()" class="current">Step1</div>
		<div id="step2" onclick="clickednext()">Step2</div>
		<div id="step3" class="nodisplay">Step3</div>
	</div>
	
	<div class="clear"></div>



	<div class="container">
		<div class="content_block row">
			<div class="fl-container">
				<div class="posts-block">
					<div class="contentarea">
						<?php  if($page['top_content']):?>
							<?php print render($page['top_content']); ?>
						<?php endif; ?>
						<?php  if($page['content']):?>
                                <?php print render($page['content']); ?>
                         <?php endif; ?>
						 
	<div id="buttons">
		<a id="previous" class="nodisplay" onclick="clickedprevious()"><i class="icon-arrow-circle-left"></i> PREVIOUS</a>
		<a id="next" onclick="clickednext()">NEXT <i class="icon-arrow-circle-right"></i></a>
	</div>					 
						 
						 
						 
						<?php  if($page['section_content']):?>
							<?php print render($page['section_content']); ?>
						<?php endif; ?>
						<?php  if($page['bot_content']):?>
							<?php print render($page['bot_content']); ?>
						<?php endif; ?>

						<?php print drupal_render($form); ?>
						<?php print render($results); ?>

					</div>
				</div>
			</div>
			<div class="right-sidebar-block">
				<?php print render($page['sidebar']); ?>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</div>

<?php require_once(drupal_get_path('theme','heshel').'/tpl/footer.tpl.php'); ?>

