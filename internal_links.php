<?php

$db_host = 'localhost'; //'localhost';
$db_user = "tapipedi_tap";
$db_password = "faoaktap";
$db_name = "tapipedi_tap";

$link= mysql_connect ($db_host,$db_user,$db_password) or die(mysql_error());
$res = mysql_select_db($db_name,$link) or die(mysql_error());
mysql_query("SET NAMES 'utf8'"); 
date_default_timezone_set('Europe/Athens');


function db_get_array($sql)
{
	$data = mysql_query($sql) or die(mysql_error());
	$data_paper = array();
	$i=0;
	while ($line = mysql_fetch_assoc($data)){
		foreach($line as $k=>$v)
		{
			$data_paper[$i][$k]= $v;
		}
		$i++;
	}
	return $data_paper;
}

$sql="select 
		fdfru.entity_id nid, n.title
	from 
		field_data_field_resource_url fdfru 
			INNER JOIN node n on n.nid=fdfru.entity_id
	where field_resource_url_url like \"%/sites/default/files/mendeley/PDF/%\";";
	
	$result=db_get_array($sql);
	?>
	
	<table>
		<tr>
			<td>Id</td>
			<td>Title</td>
			<td>Edit Link</td>
		</tr>
		<?php
		for($i=0;$i<count($result);$i++)
		{
			?>
				<tr class="<?php if($i%2==0) echo 'even'; else echo 'odd';?>">
					<td><?php echo ($i+1);?></td>
					<td><?php echo $result[$i]['title'];?></td>
					<td>
						<a href="http://www.tapipedia.org/node/<?php echo $result[$i]['nid'];?>/edit" target="_blank">
							Edit
						</a>
					</td>
				</tr>
			<?php
		}
		?>
	</table>
	<style>
		tr, td{border:1px solid #000;}
		tr.even {background-color:#fff;}
		tr.odd {background-color: rgba(0,0,0,0.1);}
	</style>
	<?php
	
	mysql_close($link);

?>





















