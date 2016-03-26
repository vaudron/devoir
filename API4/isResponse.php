<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
function supAccents($str, $encoding='ISO-8859-15'){
	// transformer les caractères accentués en entités HTML
	//echo "la chaine à traiter : ".$str."<br>";
	$str = htmlentities($str, ENT_NOQUOTES, $encoding);
	//echo "la chaine après traitement : ".$str."<br>"; 
	// remplacer les entités HTML pour avoir juste le premier caractères non accentués
	// Exemple : "&ecute;" => "e", "&Ecute;" => "E", "Ã " => "a" ...
	$str = preg_replace('#&([A-za-z])(?:acute|grave|cedil|circ|orn|ring|slash|th|tilde|uml);#', '\1', $str); 
	// Remplacer les ligatures tel que : Œ, Æ ...
	// Exemple "Å“" => "oe"
	$str = preg_replace('#&([A-za-z]{2})(?:lig);#', '\1', $str);
	// Supprimer tout le reste
	$str = preg_replace('#&[^;]+;#', '', $str); 
	return $str;
}
$userID = $_POST["userID"];
$devoirID = $_POST["devoirID"];
$donnee="";
//print_r($_POST);
try {
	include 'dbHost.php';
	$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	//existe-il déjà un enregistrement du devoir ?
	$connexion->exec("SET NAMES 'utf8'");
	$result=$connexion->query("SELECT `element`,`valeur` FROM `devoir` WHERE `devoirID`='".$devoirID."' AND `userID`='".$userID."' ORDER BY `ID`");
	if($result->rowCount()==0){
		echo "false";
	}else{
	$info=$result->fetchAll(PDO::FETCH_ASSOC);
	//print_r($info);
		 for($i=0;$i<count($info);$i++){
			$donnee=$donnee."&".$info[$i]["element"]."=".rawurlencode($info[$i]["valeur"]);
		 }
		echo substr($donnee,1);
	}
}catch(Exception $e){
	echo "false";
}
/*
//print_r($_POST);
$nom = $_POST["nom"];
$prenom = $_POST["prenom"];
$fichier = $_POST["fichier"];
$filename = "/htdocs/TXT/";
$nom_fichier=$filename.supAccents($nom)."_".supAccents($prenom)."_".$fichier."_".$_POST["UserID"].".txt";
if (file_exists($nom_fichier)) {
	$log = fopen($nom_fichier,"r");
	$data=fread($log, filesize($nom_fichier));
	fclose($log);
	echo $data;
}else{
	echo "false";
//	echo $nom_fichier;
//	print_r($_POST);
}
*/
//print_r($_POST);
?>