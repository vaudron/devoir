<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
$devoir_ID=$_GET["devoirID"];
$classe=$_GET["classe"];
$nom="";
$prenom="";
$noteDevoir="";
$reponse="";
$modifiable=true;
$liste_classe= array();
$somme=0;
$nbDevoir=0;
try {
		include '../dbHost.php';
		$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		//existe-il déjà un enregistrement du devoir ?
		$result=$connexion->query("SELECT DISTINCT `userID`,`valeur` FROM `devoir` Where ((`element`='classe' AND `valeur`='".$classe."')OR `element`='nom') AND `devoirID`='".$devoir_ID."' ORDER BY UPPER(`valeur`) ASC");
		$reponse .= '<style type="text/css">.liste_devoir div{
  clear: both;
  cursor: pointer;
  height:19px;
}
.liste_devoir div:nth-child(odd){
	  background: #ccc;
}
.liste_devoir div:hover{
	  background: #000;
	  color: #fff;
	  
}
.liste_devoir{
}
.liste_devoir img{
	padding-left:10px;
}
.position_nom{
  float: left;
  width: 150px;
  
}
.position_prenom{
  float: left;
  width: 150px;
}
.position_note{
  float: right;
  padding-right:10px;
}
.liste_devoir div img{
	float: left;
	top: 2px;
	position: relative;
}
.liste_devoir img:hover{
  transform : scale(1.5);
}
</style><div class="liste_devoir">';
//echo $temp;//		
//print_r ($result);
		
		if($result->rowCount()!=0){
			foreach ($result as $element){
			if((preg_match( "/\d/" , $element["valeur"])==0) && (in_array($element["userID"],$liste_classe))){
//			echo "<br>";
// 			print_r($element);
				$result2=$connexion->query("SELECT `element`,`valeur` FROM `devoir` Where `userID`='".$element["userID"]."' AND (`element`='nom' OR `element`='prenom' OR `element`='noteDevoir') AND `devoirID`='".$devoir_ID."'");
				foreach ($result2 as $eleve){
					switch ($eleve["element"]){
						case "nom":
							$nom=htmlentities(utf8_encode($eleve["valeur"]), 0, "UTF-8");
							break;
						case "prenom":
							$prenom=htmlentities(utf8_encode($eleve["valeur"]), 0, "UTF-8");
							break;
						case "noteDevoir":
							$noteDevoir=$eleve["valeur"];
							$somme=$somme+($noteDevoir*1);
							$nbDevoir=$nbDevoir+1;
							break;
					}
				}
				$result3=$connexion->query('SELECT `valeur` FROM `proprietes` WHERE `devoirID`="'.$devoir_ID.'" AND `userID`="'.$element["userID"].'" AND `nom`="modifiable" AND `valeur`="oui"');
				if($result3->rowCount()==0){
					$modifiable=false;
				}else{
					$modifiable=true;
				}
				$result4=$connexion->query('SELECT `valeur` FROM `proprietes` WHERE `devoirID`="'.$devoir_ID.'" AND `userID`="'.$element["userID"].'" AND `nom`="correctionVisible"');
				$correctionVisible="non";
				
					//print_r($result4);
				foreach ($result4 as $a){
					//print_r($a);
					//echo "<br>";
					$correctionVisible=$a["valeur"];
				}
				$reponse.= '<div>
				<img src="https://coursdesciences.fr/devoir/API/delete16.png" alt="" height="16" width="16" onclick="supprime_devoir(\''.$element["userID"].'\')"> 
				<span id="'.$element["userID"].'" class="element_liste_devoir" onclick="setColorEleveSelectionne($(this).attr(\'id\')); revoirDs=true; searchDataDevoir(\''.$element["userID"].'\', \''.$devoir_ID.'\')"><span class="position_nom">'.$nom.'</span>
				<span class="position_prenom"> '.$prenom.' </span>
				<span class="position_note"> '.$noteDevoir.'</span></span>';
				if($correctionVisible=="oui"){
					$reponse.= '<img class="btnVu" src="https://coursdesciences.fr/devoir/API/vuOn.png" alt="" height="16" width="16" onclick="setPropertie(\''.$devoir_ID.'\',\''.$element["userID"].'\',\'correctionVisible\',\'non\');reload_prof_liste_classe();"">';
				}else{
					$reponse.= '<img class="btnVu" src="https://coursdesciences.fr/devoir/API/vuOff.png" alt="" height="16" width="16" onclick="setPropertie(\''.$devoir_ID.'\',\''.$element["userID"].'\',\'correctionVisible\',\'oui\');reload_prof_liste_classe();"">';
				}
				
				$reponse.= '<img class="corrige" src="https://coursdesciences.fr/devoir/API/corrige16.png" alt="" height="16" width="16" onclick="revoirDs=true; recorrection(\''.$element["userID"].'\', \''.$devoir_ID.'\');">';
				if ($modifiable){
					$reponse.= '<img class="btnModifiable" src="https://coursdesciences.fr/devoir/API/permissions_ouvert.png" alt="" height="16" width="16" onclick="setPropertie(\''.$devoir_ID.'\',\''.$element["userID"].'\',\'modifiable\',\'non\');reload_prof_liste_classe();">';
				}else{
					$reponse.= '<img class="btnModifiable" src="https://coursdesciences.fr/devoir/API/permissions_ferme.png" alt="" height="16" width="16" onclick="setPropertie(\''.$devoir_ID.'\',\''.$element["userID"].'\',\'modifiable\',\'oui\');reload_prof_liste_classe();">';
				}
				
				$reponse.='</div>';
//				print_r($eleve);
			}else{
				 array_push ( $liste_classe , $element["userID"]);
			}
		}
				
	}
	if($nbDevoir==0){
		$nbDevoir=1;
	}
	$moyenne=round($somme/$nbDevoir,1);
	$reponse.= '<input type="hidden" id="moyenne" value="'.$moyenne.'">';
	$reponse.= "</div>";
	$connexion=null;
	echo $reponse;
	} catch (PDOException $e) {
    return $e->getMessage();
	}

?>