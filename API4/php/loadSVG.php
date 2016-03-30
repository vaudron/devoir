<?php
header("Access-Control-Allow-Origin: *");
header ("Content-Type:text/xml");
$nom_fichier="../".$_GET["fichier"];
$data='<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg></svg>';
try{
	$log = @fopen($nom_fichier,"r");
	}catch (Exception $e) {
}
if($log!=false){
	$data=fread($log, filesize($nom_fichier));
	fclose($log);
	}else{
	$nom_fichier="../img/vide.svg";
	$log1 = @fopen($nom_fichier,"r");
	$data=fread($log1, filesize($nom_fichier));
	fclose($log1);
	}
	echo $data;
	
?>