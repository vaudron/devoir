
function SetCookie (name, value) {
	var argv=SetCookie.arguments;
	var argc=SetCookie.arguments.length;
	var expires=(argc > 2) ? argv[2] : null;
	var path=(argc > 3) ? argv[3] : null;
	var domain=(argc > 4) ? argv[4] : null;
	var secure=(argc > 5) ? argv[5] : false;
	document.cookie=name+"="+escape(value)+
	((expires==null) ? "" : ("; expires="+expires.toGMTString()))+
	((path==null) ? "" : ("; path="+path))+
	((domain==null) ? "" : ("; domain="+domain))+
	((secure==true) ? "; secure" : "");
}

//document.getElementsByClassName("dimmed-element-header")[0].style = "display:none";
//document.getElementsByClassName("dashed-line-separator")[0].style = "display:none";
var date_exp = new Date();
var statu="eleve";
date_exp.setTime(date_exp.getTime()+(600*1000));
myRegEx = /Ouvrir le profil de (.*), (.*) dans une nouvelle/i;
toto = myRegEx.exec(window.parent.document.getElementById('personal-menu-dd').innerHTML); 
nom=(RegExp.$1); 
prenom=RegExp.$2;

myRegEx = /PersonId=(.*)&.*Customer=/i;
toto = myRegEx.exec(window.parent.document.getElementById('personal-menu-dd').innerHTML);
UserID=RegExp.$1;
//if(document.getElementById('DropDownMenuLink')){
if($("#ctl10_EssayEditor")){
	statu="prof";
}
var $dvCoursID=window.parent.$("#ctl00_ContentAreaIframe").attr("src").split("=")[1];
SetCookie("dv",nom+";"+prenom+";"+UserID+";"+statu+";"+$dvCoursID,date_exp,"/",".itslearning.com");
SetCookie("dv",nom+";"+prenom+";"+UserID+";"+statu+";"+$dvCoursID,date_exp,"/","coursdesciences.fr");