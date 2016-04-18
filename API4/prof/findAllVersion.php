<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");
$base_dir  = __DIR__; // Absolute path to your installation, ex: /var/www/mywebsite
$doc_root  = preg_replace("!${_SERVER['SCRIPT_NAME']}$!", '', $_SERVER['SCRIPT_FILENAME']); # ex: /var/www
$base_url  = preg_replace("!^${doc_root}!", '', $base_dir); # ex: '' or '/mywebsite'
$protocol  = empty($_SERVER['HTTPS']) ? 'http' : 'https';
$port      = $_SERVER['SERVER_PORT'];
$disp_port = ($protocol == 'http' && $port == 80 || $protocol == 'https' && $port == 443) ? '' : ":$port";
$domain    = $_SERVER['SERVER_NAME'];
$full_url  = "${protocol}://${domain}${disp_port}${base_url}"; # Ex: 'http://example.com', 'https://example.com/mywebsite', etc.
$pathName = $_POST["path"];
$tab=split("/",$pathName);
$temp=$doc_root.'/';
for($t=1;$t<sizeof($tab)-1;$t++){
$temp=$temp.$tab[$t].'/';
}
/*
$nom_fichier = "".$temp."questions.html";
$log = fopen("".$nom_fichier,"w");
fwrite($log, $code, strlen($code)-1);
fclose($log);
echo "ok";
*/
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
echo json_encode($tableau);
closedir($pointeur);
?>