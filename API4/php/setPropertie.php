<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");

$devoirID=$_GET["devoirID"];
$userID=$_GET["userID"];
$nom=$_GET["nom"];
$valeur=$_GET["valeur"];
try {
	include 'dbHost.php';
	$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	//existe-il déjà un enregistrement du devoir ?
	$connexion->exec("SET NAMES 'utf8'");
	$result=$connexion->query('SELECT `valeur` FROM `proprietes` WHERE `devoirID`="'.$devoirID.'" AND `userID`="'.$userID.'" AND `nom`="'.$nom.'"');
	if($result->rowCount()==0){
		$connexion->exec('INSERT INTO `proprietes` (`userID`, `devoirID`, `nom`, `valeur`) values ("'.$userID.'", "'.$devoirID.'", "'.$nom.'", "'.$valeur.'")');
	}else{
		$connexion->exec('UPDATE  `proprietes` SET `valeur`="'.$valeur.'" WHERE `devoirID`="'.$devoirID.'" AND `userID`="'.$userID.'" AND `nom`="'.$nom.'"');
	}
}catch(Exception $e){
	echo "false";
}
?>