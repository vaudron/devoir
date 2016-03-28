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
	$result=$connexion->query('SELECT `valeur` FROM `proprietes` WHERE `devoirID`="'.$devoirID.'" AND `userID`="'.$userID.'" AND `nom`="'.$nom.'" AND `valeur`="'.$valeur.'"');
	
//	echo 'SELECT `valeur` FROM `proprietes` WHERE `devoirID`="'.$devoirID.'" AND `userID`="'.$userID.'" AND `nom`="'.$nom.'" AND `valeur`="'.$valeur.'"';
	
	if($result->rowCount()==0){
		echo "non";
	}else{
		echo "oui";
	}
}catch(Exception $e){
	echo "false";
}
?>