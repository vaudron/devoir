<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
$user_ID=$_GET["userID"];
try {
		include '../php/dbHost.php';
		$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		//existe-il déjà un enregistrement du devoir ?
		$result=$connexion->query("DELETE FROM `devoir` WHERE `userID`='".$user_ID."'");
		$connexion=null;
	} catch (PDOException $e) {
    return $e->getMessage();
	}
?>