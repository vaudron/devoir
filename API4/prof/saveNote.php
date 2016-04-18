<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
$devoirID=$_GET["devoirID"];
$userID=$_GET["userID"];
$note=$_GET["note"];
try {
	include '../php/dbHost.php';
	$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	//existe-il déjà un enregistrement du devoir ?
	$connexion->exec("SET NAMES 'utf8'");
	$result=$connexion->query('UPDATE `devoir` SET `valeur` = '.$note.' WHERE `userID` = "'.$userID.'" AND `devoirID`= "'.$devoirID.'" AND `element` = "noteDevoir"');
	echo "ok";
}catch(Exception $e){
	echo $e;
}
?>