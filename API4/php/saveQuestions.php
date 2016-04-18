<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=utf-8");
$base_dir  = __DIR__; // Absolute path to your installation, ex: /var/www/mywebsite
$doc_root  = preg_replace("!${_SERVER['SCRIPT_NAME']}$!", '', $_SERVER['SCRIPT_FILENAME']); # ex: /var/www
$base_url  = preg_replace("!^${doc_root}!", '', $base_dir); # ex: '' or '/mywebsite'
$protocol  = empty($_SERVER['HTTPS']) ? 'http' : 'https';
$port      = $_SERVER['SERVER_PORT'];
$disp_port = ($protocol == 'http' && $port == 80 || $protocol == 'https' && $port == 443) ? '' : ":$port";
$domain    = $_SERVER['SERVER_NAME'];
$full_url  = "${protocol}://${domain}${disp_port}${base_url}"; # Ex: 'http://example.com', 'https://example.com/mywebsite', etc.
$pathName = "\/ressources/".$_POST["path"];
$code=$_POST["code"];
$tab=split("/",$pathName);
$temp=$doc_root.'/';
for($t=1;$t<sizeof($tab);$t++){
$temp=$temp.$tab[$t].'/';
}
//echo $temp;
/** 
 * recursively create a long directory path
 */
function createPath($path) {
    if (is_dir($path)) return true;
    $prev_path = substr($path, 0, strrpos($path, '/', -2) + 1 );
    $return = createPath($prev_path);
    return ($return && is_writable($prev_path)) ? mkdir($path) : false;
}
createPath($temp);
$tableau=[];
$pointeur=opendir($temp);
while ($entree = readdir($pointeur)) {
 /* on n'affiche que les entrees voulues */
    if ($entree != "." && $entree != "..") {
		//echo $entree.'<br>';
		$toto=explode(".",$entree);
		//print_r($toto);
		if(sizeof($toto)>1){
			//$myRegExp=/question([0-9]*).html/i;
			preg_match('/questions([0-9]*)\.html/i',$entree,$dd);
			if($dd[0]){
				$tableau[]=$dd[0];
			}
		}
    }
}
 /* tri de $tableau */
sort($tableau);
closedir($pointeur);
//print_r($tableau);
//echo "<br>";
$prefix='';
$longueur=count($tableau)+1;
//echo $longueur;
//echo "<br>";
if($longueur<=99){
$prefix='0';
}
if($longueur<=9){
$prefix='00';
}
//echo $prefix;
//echo "<br>";
@rename("".$temp."questions.html","".$temp."questions".$prefix.$longueur.".html");
//echo "".$temp."questions".$prefix.$longueur.".html";
//echo "<br>";
$nom_fichier = "".$temp."questions.html";
$log = fopen("".$nom_fichier,"w");
fwrite($log, $code, strlen($code)-1);
fclose($log);
//echo "\n";
//echo strlen($code);
//echo $code;
?>