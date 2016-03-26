function reload_prof_liste_classe(){
	var devoirID=$('#devoirID').val();
	var classe=$("#profClasse option:selected").val();
	$.ajax({
		async: false,
		url: site+"/devoir/API4/prof/find_devoirs.php",
		data: "devoirID="+devoirID+"&classe="+classe,
		method: "GET",
		dataType: "html",
		success: function(data){
					$("#prof_liste_classe").replaceWith('<div id="prof_liste_classe">'+data+'</div>');
					$("#"+$("#prof").data("encourt")).css("color","red");
					$("#moyenneClasse").text($("#moyenne").val());
				},
		error: function(e){
			$("#prof_liste_classe").replaceWith('<div id="prof_liste_classe">'+e+'</div>');
		}
	});
}

function supprime_devoir(userID){
	if(confirm("confirmez-vous la suppression de ce devoir ?")){
		$.ajax({
			async: false,
			url: site+"/devoir/API4/prof/supp_devoir.php",
			data: "userID="+userID,
			method: "GET",
			dataType: "html",
			success: function(data){
				reload_prof_liste_classe();
			}
		});
	}
//	
}

function recorrection(userID, devoirID){
	
	searchDataDevoir(userID, devoirID);
	correction();
	note=""+Math.round((note_globale / note_max *20)*10)/10;
	document.getElementById("noteDevoir").value=note;
	$("#prof").data("encourt",""+userID);
	var dv_data="userID="+userID+"&devoirID="+devoirID+"&note="+note;
	$.ajax({
		async: false,
		url: site+"/devoir/API4/prof/saveNote.php",
		data: dv_data,
		method: "GET",
		dataType: "text",
		success: function(data){
			reload_prof_liste_classe();
			
		}
	});
	
}

// fonction searchDataDevoir() renvoie les donnees du devoir de l'élève
function searchDataDevoir(userID, devoirID){
	$.ajax({
		async: false,
		url: site+"/devoir/API4/isResponse.php",		
		method: "POST",
		data: "userID="+userID+"&devoirID="+devoirID,
		dataType: "text",
		success: function(data){
			initDevoir(data);
		}
	});
}
function setPropertieForAll(classe,name,valeur){
	var elements=$("."+classe);
	var devoirID=$("#devoirID").val();
	for(t=0;t<elements.length;t++){
		var attribut=$(elements[t]).attr("onclick");
		var attribut=attribut.split(",");
		var utilisateurID=attribut[1];
		utilisateurID=utilisateurID.replace(/'/g,"");
		setPropertie(devoirID,utilisateurID,name,valeur);
	}
	reload_prof_liste_classe();
}
function modif(){
	$("#nom").removeAttr("disabled");
	$("#prenom").removeAttr("disabled");
	document.getElementById("correction").setAttribute("style", "display:block;");
}