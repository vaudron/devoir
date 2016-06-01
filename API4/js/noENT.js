var nom = "";
var prenom = "";
var devoirID = document.getElementById("devoirID").value;
var userID = "";
var site = "https://coursdesciences.fr";

function setIdentite() {
    return false;
}

function setVariables() {
    var devoirID = document.getElementById("devoirID").value;
    setUserID();
    $('#loader').css('display', 'none');
    afficheDate();
    $("#nom").change(function () {
        nom = $("#nom").val();
        if (debutDeTest()) {
            setUserID();
            alreadyResponse(dv_data(), false);
        } else {
            if ($("#nom").val() == "prof") {
                dialog.dialog("open");
            }
        }
    });
    $("#prenom").change(function () {
        if (debutDeTest()) {
            setUserID();
            alreadyResponse(dv_data(), false);
        }
    });
    $("#classe").change(function () {
        if (debutDeTest()) {
            setUserID();
            alreadyResponse(dv_data(), false);
        }
    });
    var txt_html = '  <div id="login-form" title="identification"><input type="password" name="password" id="password" value="" autocomplete="off" style="margin-top:20px"></div><script type="text/javascript">	var dialog = $( "#login-form" ).dialog({		autoOpen: false,		width: 300,		modal: true,		buttons: {			"Ok": function() {				if($("#password").val()=="marot"){	$("#classe").off("change");$("#loader").show();setUIProf(); statu="prof"; modeEbauche=true;					$("#nom").removeAttr("disabled");					$("#prenom").removeAttr("disabled");	$(\'[id*="manuel"]\').removeAttr("disabled");			}				dialog.dialog( "close" );			}		},		close: function() {}	});	</script> 	<style type="text/css">	.ui-widget{		font-size:0.8em;	}	.ui-widget-header{		text-align:center;	}	.ui-dialog-titlebar{		margin:0px;	}	</style>';
    $(txt_html).appendTo("body");
    if ($("#nom").val() == "prof") {
        dialog.dialog("open");
    }
}

function dv_data() {
    return "devoirID=" + devoirID + "&userID=" + userID;
}

function no_accent(my_string) {
    var new_string = my_string.replace(/[èéêë]/g, "e").replace(/[ç]/g, "c").replace(/[àâä]/g, "a").replace(/[ïî]/g, "i").replace(/[ûùü]/g, "u").replace(/[ôöó]/g, "o");
    return new_string;
}

function setUserID() {
    var nom = no_accent(document.getElementById("nom").value.toLowerCase());
    var prenom = no_accent(document.getElementById("prenom").value.toLowerCase());
    var classe = document.getElementById("classe").value.toLowerCase();
    var code = nom + prenom + classe;
    userID = code;
    $("#userID").val(userID);
}