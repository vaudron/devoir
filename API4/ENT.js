var nom="";
var prenom="";
var devoirID=document.getElementById("devoirID").value;
var userID=0;
var site="https://coursdesciences.fr";

function setIdentite(){
	var dv=GetCookie ("dv");
	var dv_split=dv.split(";");
	document.getElementById("nom").value = dv_split[0];
	document.getElementById("prenom").value = dv_split[1];
	document.getElementById("userID").value = dv_split[2];
	return true;
}
function getCookieVal(offset) {
	var endstr=document.cookie.indexOf (";", offset);
	if (endstr==-1)
		endstr=document.cookie.length;
	return unescape(document.cookie.substring(offset, endstr));
}
function GetCookie (name) {
	var arg=name+"=";
	var alen=arg.length;
	var clen=document.cookie.length;
	var i=0;
	while (i<clen) {
		var j=i+alen;
		if (document.cookie.substring(i, j)==arg)
			return getCookieVal (j);
		i=document.cookie.indexOf(" ",i)+1;
		if (i==0) break;}
		return null;
}
function setVariables(){
	var dv=GetCookie ("dv");
	var dv_split=dv.split(";");
	statu = dv_split[3];
	//var data_response="";
	nom=dv_split[0];
	prenom=dv_split[1];
	userID=dv_split[2];
	setIdentite();
	//var dv_data="devoirID="+devoirID+"&userID="+dv_split[2];
}
function dv_data(){
	return "devoirID="+devoirID+"&userID="+userID;
}