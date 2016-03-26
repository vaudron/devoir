<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
$devoir_ID=$_GET["devoirID"];
try {
		include '../dbHost.php';
		$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		//existe-il déjà un enregistrement du devoir ?
		$result=$connexion->query("SELECT DISTINCT `valeur` FROM `devoir` Where `element`='classe' AND `devoirID`='".$devoir_ID."'  ORDER BY `valeur` ASC");
//		echo $result;
		if($result->rowCount()!=0){
			foreach ($result as $element){
				echo "<option value=".$element["valeur"].">".$element["valeur"]."</option>\n";
			}
		$connexion=null;
		}
	} catch (PDOException $e) {
    return $e->getMessage();
	}
?>