<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
function supAccents($str, $encoding='ISO-8859-15')
{
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

function createFDF($info){
	try{
		$nom = $info["nom"];
		$prenom = $info["prenom"];
		$fichier = $info["fichier"];
		//$file c le formulaire PDF,
		// $info c un tableau qui contient les données à ecrire sur le PDF
		$data="%FDF-1.2\n%âãÏÓ\n1 0 obj\n<< \n/FDF << /Fields [ ";
		foreach($info as $field => $val){
			if(is_array($val)){
				$data.='<</T('.$field.')/V[';
				foreach($val as $opt)
					$data.='('.trim($opt).')';
				$data.=']>>';
			}else{
				$data.='<</T('.$field.')/V('.trim($val).')>>';
			}
		}
		$data.="] \n/F (".$fichier.".pdf) /ID [ <".md5(time()).">\n] >>".
			" \n>> \nendobj\ntrailer\n".
			"<<\n/Root 1 0 R \n\n>>\n%%EOF\n";
		$dirname = $info["classe"];
		$filename = "/htdocs/fdf/" . $dirname . "/";

		if (!file_exists($filename)) {
				mkdir("/htdocs/fdf/" . $dirname, 0777);
		}
		$nom_fichier=$filename.supAccents($nom)."_".supAccents($prenom)."_".$fichier.".fdf";
		$log = fopen($nom_fichier,"w");
		fwrite($log, $data, strlen($data));
		fclose($log);
		return true;
	}
	catch(Exception $e){
		return false;
	}
}
function createTXT($info){
	try{
		$nom = $info["nom"];
		$prenom = $info["prenom"];
		$fichier = $info["fichier"];
		$userID = $info["userID"];
		$data="";
		foreach($info as $field => $val){
			$data.=$field.'='.trim($val).'&';
		}
		//$dirname = $info["classe"];
		$filename = "/htdocs/TXT/";
		$nom_fichier=$filename.supAccents($nom)."_".supAccents($prenom)."_".$fichier."_".$userID.".txt";
		$log = fopen($nom_fichier,"w");
		fwrite($log, $data, strlen($data)-1);
		fclose($log);
		return true;
	}
	catch(Exception $e){
		return false;
	}
}
// fonction pour mettre les données du devoir dans la base. retourne true si les données sont bien inscrites et fasle si ily a eu une erreur ou si les données y sont déjà
function inMysql($info){
	//connection à la base de données
	try {
		include 'dbHost.php';
		$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		//existe-il déjà un enregistrement du devoir ?
		$result=$connexion->query("SELECT * FROM `devoir` WHERE `devoirID`='".$info["devoirID"]."' AND `userID`='".$info["userID"]."'");
		if($result->rowCount()==0){
			$connexion->beginTransaction();
			$userID=$info["userID"];
			$connexion->exec("SET NAMES 'utf8'");
			$devID=utf8_encode ($info["devoirID"]);
			foreach ($info as $element => $valeur){
					$valeur = str_replace ( '"' , "'" , $valeur );
					$connexion->exec('insert into devoir (`userID`, `devoirID`, `element`, `valeur`) values ("'.$userID.'", "'.$devID.'", "'.$element.'", "'.$valeur.'")');
			}
			$connexion->commit();
			$connexion=null;
			return true;
		}else{
			$connexion->beginTransaction();
			$userID=$info["userID"];
			$connexion->exec("SET NAMES 'utf8'");
			$devID=utf8_encode ($info["devoirID"]);
			foreach ($info as $element => $valeur){
					$valeur = str_replace ( '"' , "'" , $valeur );
					$connexion->exec('UPDATE devoir SET `valeur`="'.$valeur.'" WHERE  `userID`="'.$userID.'" AND `devoirID`="'.$devID.'" AND `element`="'.$element.'"');
			}
			$connexion->commit();
			$connexion=null;
			return true;
			}
	} catch (PDOException $e) {
    echo $e->getMessage();
	}
}

if (inMysql($_POST)){
	echo '<span style="text-align: center; margin-top: 40px; width: 100%; display: inline-block;">'.$_POST["prenom"].' '.$_POST["nom"].', votre devoir est bien enregistré.</span>';
}else{
	echo '<span style="text-align: center; margin-top: 40px; width: 100%; display: inline-block;">ATTENTION ERREUR lors de l\'enregistrement de votre devoir.</span><span style="text-align: center; width: 100%; display: inline-block; margin-top: 10px; color: red; font-weight: bold; font-size: 12px;">PREVENEZ VOTRE PROFESSEUR AVANT DE POURSUIVRE !"</span>';
}

//print_r($_POST);

?>