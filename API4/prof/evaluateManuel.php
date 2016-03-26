<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
$devoirID=$_GET["devoirID"];
$userID=$_GET["userID"];
$valeur=$_GET["valeur"];
$element=$_GET["element"];
try {
	include '../dbHost.php';
	$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	//existe-il déjà un enregistrement du devoir ?
	$connexion->exec("SET NAMES 'utf8'");
	$result=$connexion->query('SELECT `element` FROM `devoir` WHERE `userID`="'.$userID.'" AND `devoirID`="'.$devoirID.'" AND `valeur`="true" AND `element` LIKE "'.substr($element,0, strlen($element)-1).'%"');
	if($result->rowCount()!=0){
		foreach ($result as $obj){
//			print_r($element);
			$result2=$connexion->query('UPDATE `devoir` SET `valeur` = "false" WHERE `userID` = "'.$userID.'" AND `devoirID`= "'.$devoirID.'" AND `element` = "'.$obj[0].'"');
		}
		$result3=$connexion->query('UPDATE `devoir` SET `valeur` = "'.$valeur.'" WHERE `userID` = "'.$userID.'" AND `devoirID`= "'.$devoirID.'" AND `element` = "'.$element.'"');
	}else{
		$toto='INSERT INTO `devoir` (`userID`, `devoirID`, `element`, `valeur`) values ("'.$userID.'", "'.$devoirID.'", "'.$element.'", "'.$valeur.'")';
//		echo $toto;
		$result3=$connexion->query('INSERT INTO `devoir` (`userID`, `devoirID`, `element`, `valeur`) values ("'.$userID.'", "'.$devoirID.'", "'.$element.'", "'.$valeur.'")');	
	}
//	print_r($result);
	
//	echo 'UPDATE `devoir` SET `valeur` = "'.$valeur.'" WHERE `userID` = '.$userID.' AND `devoirID`= "'.$devoirID.'" AND `element` = "'.$element.'"';

}catch(Exception $e){
	echo $e;
}
?>