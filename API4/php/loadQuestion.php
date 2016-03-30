<?php
//ini_set("display_errors",0);error_reporting(0);
header("Access-Control-Allow-Origin: *");
header ("Content-Type: text/html; charset=utf-8");
$nom_fichier=$_GET["fichier"];
try{
$log = fopen($nom_fichier,"r");
	$data=fread($log, filesize($nom_fichier));
	fclose($log);
	echo $data;
	}catch(Exception $e){
	echo "false";
	}
?>