// version4 API4
var note_globale = 0.0; // note du note_devoir
var note_intermediaire = 0.0; //pour totaliser les notes obtenues à un sous ensemble de question 
var note_max = 0; // note maxi
var debut_test = false; //
var xhr = null;
var timerOn = false;
var finTimer = false;
var dateFin = new Date();
var revoirDs = false; // true si affichage de la correction du DS
var devoirModifiable = false;
var statu = "eleve";
var pages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20];
var pageActuelle = 0;
var question_cloze = [];
var nbQuestion = 0;
var dvQuestions //contenu html des questions

if (typeof orderQuestions == "undefined") {
    var orderQuestions = false;
}

function finDS() {
    if(modeEbauche && !dv.modeEbauche){
        correction();
    }else{
        if(!modeEbauche){
            if (confirm("Avez-vous vraiment terminé votre devoir ?")) {
                sendDS();
            }
        }
    }
}

function sendDS() {
    try {
        window.clearInterval(runTimer);
    } catch (e) {}
    if (typeof renew == "function") {
        renew();
    }
    if (typeof beforeSave == "function") {
        beforeSave();
    }
    var svgItem = document.getElementById("minute");
    $("#resteMinute").val(svgItem.textContent);
    svgItem = document.getElementById("seconde");
    $("#resteSeconde").val(svgItem.textContent);
    document.getElementById("correction").setAttribute("style", "display:none;");
    //bloquer tous les champs
    $("input").attr("disabled", "disabled");
    $("#classe").removeAttr("disabled");
    $("textarea").attr("disabled", "disabled");
    revoirDs = true;
    $.ajax({
        async: false,
        url: site + API + "/php/isPropertie.php",
        data: "devoirID=" + $("#devoirID").val() + "&userID=" + userID + "&nom=correctionVisible&valeur=oui",
        dataType: "html",
        success: function (data) {
            if (data == "oui") {
                correction();
            }
        }
    });

    document.getElementById("noteDevoir").value = "" + Math.round((note_globale / note_max * 20) * 10) / 10;
    var xhr = null;
    if (xhr && xhr.readyState != 0) {
        xhr.abort(); // On annule la requête en cours !
    }
    var dv_data = searchDataInDS();
    xhr = getXMLHttpRequest();
    xhr.open("POST", site + API + "/php/saveDS.php", false);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //		xhr.setRequestHeader("Content-length", dv_data.length);
    xhr.onload = function () {
        // traitement à réaliser
        // à réception de la réponse
        alert(xhr.responseText);
    }

    //		xhr.send(JSON.stringify(dv_data));
    xhr.send(dv_data);
}

function searchDataInDS() {
    var data = "";
    var f = document.getElementById("ds");
    //	for (var i in f.elements) {
    for (var i = 0; i < f.elements.length; i++) {
        var obj = f.elements[i];
        switch (obj.tagName) {
        case "INPUT":
            switch (obj.type) {
            case "hidden":
            case "text":
                data += obj.id + "=" + encodeURIComponent(obj.value) + "&";
                break;
            case "radio":
            case "checkbox":
                data += obj.id + "=" + encodeURIComponent(obj.checked) + "&";
                break;
            }
            break;
        case "SELECT":
            data += obj.id + "=" + encodeURIComponent(obj.value) + "&";
            break;
        case "TEXTAREA":
            data += obj.id + "=" + encodeURIComponent(obj.value) + "&";
            break;
        }
    }
    return data;
}

function getXMLHttpRequest() {
    var xhr = null;
    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest();
        }
    } else {
        alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
        return null;
    }
    return xhr;
}




function initTimer(heure, minute, seconde) {
    if (!timerOn) {
        dateFin = new Date();
        dateFin.setHours(dateFin.getHours() + heure);
        dateFin.setMinutes(dateFin.getMinutes() + minute);
        dateFin.setSeconds(dateFin.getSeconds() + seconde);
        /*		idObjSVG = "entete_devoir2";
        		// Get the Object by ID
        		var a = document.getElementById(idObjSVG);
        		// Get the SVG document inside the Object tag
        		var svgDoc = a.contentDocument;
        		// Get one of the SVG items by ID;
        */
        var svgItem = document.getElementById("minute");
        if (minute < 10) {
            svgItem.textContent = "0" + minute;
        } else {
            svgItem.textContent = "" + minute;
        }
        svgItem = document.getElementById("seconde");
        if (seconde < 10) {
            svgItem.textContent = "0" + seconde;
        } else {
            svgItem.textContent = "" + seconde;
        }
        runTimer = window.setInterval("timer()", 1000);
        timerOn = true;
    }

}

function timer() {
    now = new Date();
    reste = new Date(dateFin - now);
    if (now < dateFin) {
        /*		idObjSVG = "entete_devoir2";
        		// Get the Object by ID
        		var a = document.getElementById(idObjSVG);
        		// Get the SVG document inside the Object tag
        		var svgDoc = a.contentDocument;
        		// Get one of the SVG items by ID;
        */
        var svgItem = document.getElementById("minute");
        if (reste.getMinutes() < 10) {
            svgItem.textContent = "0" + reste.getMinutes();
        } else {
            svgItem.textContent = reste.getMinutes();
        }
        svgItem = document.getElementById("seconde");
        if (reste.getSeconds() < 10) {
            svgItem.textContent = "0" + reste.getSeconds();
        } else {
            svgItem.textContent = reste.getSeconds();
        }
    } else {
        finTimer = true;
        sendDS();
    }
}

function debutDeTest() {
    if (!modeEbauche) {
        if (debut_test) {
            return true
        } else {
            if ((document.getElementById("nom").value != "") && (document.getElementById("prenom").value != "") && (document.getElementById("classe").value != "...")) {
                debut_test = true;
                return true;
            } else {
                return false;
            }
        }
    } else {
        var toto = Math.round(Math.random() * 1000);
        $("#nom").val("prof" + toto);
        $("#prenom").val("prof");
        $("#classe").val("3A");
        setUserID();
        statu = "prof";

        return true;
    }
}

function afficheCommentaire(idElement) {
    //idObjSVG = "Q"+idElement.charAt(11);
    // Get the Object by ID
    //var a = document.getElementById(idObjSVG);
    // Get the SVG document inside the Object tag
    //var svgDoc = a.contentDocument;
    // Get one of the SVG items by ID;
    var svgItem = document.getElementById(idElement);
    // Set the colour to something else
    if ($(svgItem).prop("className") == "SVGAnimatedString") {
        svgItem.setAttribute("style", "display:inline");
    } else {
        $(svgItem).show();
    }
}

function afficheNote(idElement, note) {
    idObjSVG = "Q" + idElement.charAt(1);
    // Get the Object by ID
    /*	var a = document.getElementById(idObjSVG);
    	// Get the SVG document inside the Object tag
    	var svgDoc = a.contentDocument;
    	// Get one of the SVG items by ID;
    */
    var svgItem = document.getElementById(idElement);
    // Set the colour to something else
    if ($(svgItem).prop("className") == "SVGAnimatedString") {
        stringText = parseFloat(svgItem.textContent);
        valeur_note = Math.round((stringText + note) * 10) / 10;
        svgItem.textContent = valeur_note + "";
    } else {
        stringText = parseFloat($(svgItem).text());
        valeur_note = Math.round((stringText + note) * 10) / 10;
        $(svgItem).text(valeur_note + "");
    }
    //	afficheQuestion(0);

    //	svgItem.setAttribute('width',svgItem.getBBox().width+10);
    //	svgItem.setAttribute('height',svgItem.getBBox().height+6);
}

function afficheNoteDevoir(idSVG, idElement, note) {
    // Get the Object by ID
    /*	var a = document.getElementById(idSVG);
    	// Get the SVG document inside the Object tag
    	var svgDoc = a.contentDocument;
    	// Get one of the SVG items by ID;
    	var svgItem = svgDoc.getElementById(idElement);
    	valeur_note = Math.round((note)*10)/10;
    	svgItem.textContent=valeur_note+"";
    	svgItem.setAttribute("style", "display:inline");
    */
    valeur_note = Math.round((note) * 10) / 10;
    document.getElementById(idElement).setAttribute("style", "display:inline");
    document.getElementById(idElement).textContent = valeur_note + "";
    //	svgItem.setAttribute('width',svgItem.getBBox().width+10);
    //	svgItem.setAttribute('height',svgItem.getBBox().height+6);
}

function afficheDate() {
    d = new Date();
    document.getElementById("date").value = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

}

function setColorEleveSelectionne(element) {
    $("#prof").data("encourt", "" + element);
    $(".element_liste_devoir").removeAttr('style');
    $("#" + element).css("color", "red");
}

function setPropertie(devoirID, userID, param, valeur) {
    $.ajax({
        async: false,
        url: site + API + "/php/setPropertie.php",
        data: "devoirID=" + devoirID + "&userID=" + userID + "&nom=" + param + "&valeur=" + valeur,
        dataType: "html",
        success: function (data) {}
    });
}
//
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//							Script d'évaluation
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//
function evaluateElementInText() {
    /*
     * pour évaluer le positionnement d'élément déplaçable au sein d'un texte
     * 
     */
}

function evaluateOrdreObjet(reponse, attendu, marge, bareme, point, zoneResult, commentaire) {
    /* évaluation de type horizontal. Les éléments à déplacer sont à positioner dans
     * des champs placés les uns à la suite des autre horizontalement
     * ce qui compte c'est le positionnement horizontal de l'élément.
     */
    note_max = note_max + bareme;
    afficheNote(zoneResult + "max", bareme);
    var tab_obj = [];
    var tab_obj_attendu = [];
    var tab_attenduX = [];
    var tab_reponseX = [];
    var tab_attenduY = [];
    var tab_reponseY = [];
    var score = 0;
    var temp = $("#" + reponse).val().split(";");
    if (temp != "") {
        for (var t = 0; t < temp.length; t++) {
            var dd = temp[t].split(":");
            tab_obj[t] = dd[0];
            dd = dd[1].split(",");
            tempdd = dd[0].split("px");
            tab_reponseX[t] = parseInt(tempdd[0]);
            tempdd = dd[1].split("px");
            tab_reponseY[t] = parseInt(tempdd[0]);
        }
        var temp = attendu.split(";");
        for (t = 0; t < temp.length; t++) {
            var dd = temp[t].split(":");
            tab_obj_attendu[t] = dd[0];
            dd = dd[1].split(",");
            tempdd = dd[0].split("px");
            tab_attenduX[t] = parseInt(tempdd[0]);
            tempdd = dd[1].split("px");
            tab_attenduY[t] = parseInt(tempdd[0]);
        }
        for (var t = 0; t < tab_reponseX.length; t++) {
            var nonTrouve = true;
            for (var u = 0; u < tab_attenduX.length; u++) {
                if ((tab_reponseX[t] > (tab_attenduX[u] - marge)) & (tab_reponseX[t] < (tab_attenduX[u] + marge))) {
                    if ((tab_reponseY[t] > (tab_attenduY[u] - marge)) & (tab_reponseY[t] < (tab_attenduY[u] + marge))) {
                        if (tab_obj_attendu[u] == tab_obj[t]) {
                            score = score + (point / tab_attenduX.length);
                            $("#" + tab_obj[t]).removeClass("incorrect")
                                .addClass("correct");
                            nonTrouve = false;
                            $("#" + tab_obj[t]).attr("title", point / tab_attenduX.length + " point");
                            break;
                        }
                    }
                }
            }
            if (nonTrouve) {
                $("#" + tab_obj[t]).addClass("incorrect")
                    .removeClass("correct");
                if (typeof commentaire !== 'undefined' && commentaire !== "") {
                    afficheCommentaire(commentaire);
                }
                $("#" + tab_obj[t]).attr("title", "0 point");
            }
        }
    }
    afficheNote(zoneResult, score);
    note_globale = note_globale + score;
}

function evaluatePositionObjet(reponse, attendu, marge, bareme, point, zoneResult, commentaire) {
    /*
     * fonction pour évaluer le placement de point sur un graphique. ce qui compte 
     * c'est que lobjet soit compris dans un inteval(marge en pixel) aussi bien horizontalement 
     * que verticalement
     */
    note_max = note_max + bareme;
    afficheNote(zoneResult + "max", bareme);
    var tab_obj = [];
    var tab_attenduX = [];
    var tab_reponseX = [];
    var tab_attenduY = [];
    var tab_reponseY = [];
    var score = 0;
    var temp = $("#" + reponse).val().split(";");
    if (temp != "") {
        for (var t = 0; t < temp.length; t++) {
            var dd = temp[t].split(":");
            tab_obj[t] = dd[0];
            dd = dd[1].split(",");
            tempdd = dd[0].split("px");
            tab_reponseX[t] = parseInt(tempdd[0]);
            tempdd = dd[1].split("px");
            tab_reponseY[t] = parseInt(tempdd[0]);
        }
        var temp = attendu.split(";");
        for (var t = 0; t < temp.length; t++) {
            var dd = temp[t].split(":");
            dd = dd[1].split(",");
            tempdd = dd[0].split("px");
            tab_attenduX[t] = parseInt(tempdd[0]);
            tempdd = dd[1].split("px");
            tab_attenduY[t] = parseInt(tempdd[0]);
        }
        for (var t = 0; t < tab_reponseX.length; t++) {
            var nonTrouve = true;
            for (u = 0; u < tab_attenduX.length; u++) {
                if ((tab_reponseX[t] > (tab_attenduX[u] - marge)) & (tab_reponseX[t] < (tab_attenduX[u] + marge))) {
                    if ((tab_reponseY[t] > (tab_attenduY[u] - marge)) & (tab_reponseY[t] < (tab_attenduY[u] + marge))) {
                        score = score + (point / tab_attenduX.length);
                        $("#" + tab_obj[t]).removeClass("incorrect")
                            .addClass("correct");
                        nonTrouve = false;
                        break;
                    }
                }
            }
            if (nonTrouve) {
                $("#" + tab_obj[t]).addClass("incorrect")
                    .removeClass("correct");
                if (typeof commentaire !== 'undefined' && commentaire !== "") {
                    afficheCommentaire(commentaire);
                }
            }
        }
    }
    afficheNote(zoneResult, score);
    note_globale = note_globale + score;
}

function isChecked(nom_objet, nomSVG) {
    // Get the Object by ID
    /*	var a = document.getElementById(nomSVG);
    	// Get the SVG document inside the Object tag
    	var svgDoc = a.contentDocument;
    	// Get one of the SVG items by ID;
    */
    var svgItem = document.getElementById(nom_objet);
    if (svgItem.getAttribute("checked") != null && svgItem.getAttribute("checked") == "true") {
        return true
    } else {
        return false
    }
}

function reinitialise() {
    note_globale = 0.0; // note du note_devoir
    note_max = 0; // note maxi
    $("[id*=noteq]").find("[id*=q]").text("0");

    /*
    for (var i = 0; i < 100; i++) {
        idObjSVG = "Q" + i;
        var a = document.getElementById(idObjSVG);
        // Get the SVG document inside the Object tag
        if (a != null) {
            /*		var svgDoc = a.contentDocument;
            		// Get one of the SVG items by ID;
            		var svgItem = svgDoc.getElementById("noteq"+i);
            		// Set the colour to something else
            */
    /*
            var svgItem = document.getElementById("noteq" + i);
            if (svgItem != null) {
                svgItem.setAttribute("style", "display:inline");
                if (document.getElementById("q" + i) !== null) {
                    document.getElementById("q" + i).textContent = "0";
                }
                if (document.getElementById("q" + i + "max") !== null) {
                    document.getElementById("q" + i + "max").textContent = "0";
                }
            }
        }
    }
    */
}

function evaluateDrop(boiteDrop, dragAttendu, bareme, zoneResult, commentaire) {
    note_max = note_max + bareme;
    var retour = 0;
    var tabDrags = dragAttendu.split(",");
    var note = Math.round(bareme / tabDrags.length * 100) / 100;
    afficheNote(zoneResult + "max", bareme);
    for (var t = 0; t < tabDrags.length; t++) {
        var expR = new RegExp(tabDrags[t], "i");
        if (expR.test($("#" + boiteDrop).attr("depot"))) {
            $("#" + tabDrags[t]).addClass("correct");
            afficheNote(zoneResult, note);
            note_globale = note_globale + note;
            retour = true;
            $("#" + tabDrags[t]).attr("title", note + "/" + note);
            retour += 1;
        } else {
            $("#" + tabDrags[t]).addClass("incorrect");
            if (typeof commentaire !== 'undefined' && commentaire !== "") {
                afficheCommentaire(commentaire);
            }
            $("#" + tabDrags[t]).attr("title", "0/" + note);
        }
    }
    if (retour == tabDrags.length) {
        return true;
    } else {
        return false
    }
}

// fonction evaluateTagByExpReg() pour noter les questions de type 'balise html' La balise doit contenir un attribut appelé depot qui contient l'ID des objets déposés par l'élève
// paramètre :
//		tag : sélecteur servant à jquery pour cibler la balise contenant les données à noter sans le #
//		expR: expression régulière servant à la correction
//		bareme : nb de points a ajouter à la note_max
//		note : nombre de points attibués à la question (1 point par défaut)
//		zoneResult : nom du champ dans lequel écrire le résultat
//		commentaire : nom de la zone texte (contenant le commentaire) qui doit être affiché si la réponse n'est pas juste.
//-------------------------------------------------------------------------
function evaluateTagByExpReg(tag, expR, bareme, note, zoneResult, commentaire) {
    note_max = note_max + bareme;
    var retour = false;
    afficheNote(zoneResult + "max", bareme);
    if (expR.test($("#" + tag).attr("depot"))) { //expression.test(document.getElementById(nomForm).value)) {
        $("#" + tag).addClass("correct");
        afficheNote(zoneResult, note);
        note_globale = note_globale + note;
        retour = true;
        $("#" + tag).attr("title", note + "/" + bareme);
    } else {
        $("#" + tag).addClass("incorrect");
        if (typeof commentaire !== 'undefined' && commentaire !== "") {
            afficheCommentaire(commentaire);
        }
        $("#" + tag).attr("title", "0/" + bareme);
    }
    $("#" + tag).prop("disabled", true);
    return retour;
}

// fonction evaluateExpReg() pour noter les questions de type 'ouvert' (correction automatique)
// paramètre :
//		nomForm : nom du formulaire de type Text
//		expression : expression régulière à appliquer sur la réponse de l'élève//
//		bareme : nb de points a ajouter à la note_max
//		note : nombre de points attibués à la question (1 point par défaut)
//		zoneResult : nom du champ dans lequel écrire le résultat
//		commentaire : nom de la zone texte (contenant le commentaire) qui doit être affiché si la réponse n'est pas juste.
//-------------------------------------------------------------------------

function evaluateExpReg(nomForm, expression, bareme, note, zoneResult, commentaire) {
    note_max = note_max + bareme;
    var retour = false;
    afficheNote(zoneResult + "max", bareme);
    if (expression.test(document.getElementById(nomForm).value)) {
        var oldBareme = $("#" + nomForm).parent().attr("title").split("/");
        if (note == oldBareme[1]) {
            bareme = oldBareme[1];
        }
        if (bareme == 0) {

            $("#" + nomForm).removeClass("correct incorrect").addClass("partiel");
            if (commentaire != "") {
                var html = '<img style="position: relative; top: -10px; left: 5px;float:right;" class="" src="https://coursdesciences.fr/devoir/API4/corrige16.png" alt="" titre="' + commentaire + '" height="16" width="16">';
                $("#" + nomForm).parent().prepend(html);
            }

            $("#" + nomForm).parent().attr("title", "résultat obtenu à la réponse " + note + "/" + oldBareme[1]);
        } else {
            $("#" + nomForm).removeClass("incorrect partiel").addClass("correct");
            $("#" + nomForm).parent().attr("title", "résultat obtenu à la réponse " + note + "/" + bareme);
        }
        afficheNote(zoneResult, note);
        note_globale = note_globale + note;
        retour = true;

    } else {
        $("#" + nomForm).removeClass("correct partiel").addClass("incorrect");
        if (typeof commentaire !== 'undefined' && commentaire !== "") {
            afficheCommentaire(commentaire);
        }
        $("#" + nomForm).parent().attr("title", "résultat obtenu à la réponse 0/" + bareme);
    }
    document.getElementById(nomForm).disabled = true;
    console.log(nomForm + "----------------------------------expReg");
    console.log("note_max : " + note_max);
    console.log("note_globale : " + note_globale);
    console.log("----");
    return retour;
}

// fonction evaluateCheckBox() pour noter une question du type 'case à cocher'
// parametre :
//		nom : 	name de la checkbox
//      groupe: groupe auquel appartient la checkbox pour l'application d'une pénalité
//		etat :	'c' si la case doit être cochée
//			'nc' si la case ne doit pas être cochée
//		bareme : nombre de points si c'est juste (par défaut 1 point)
//      penalité : pénalité a appliquer si la checkbox ne correspond pas à l'état
//      zoneResult : nom du champ dans lequel écrire le résultat
//		commentaire : nom de la zone texte (contenant le commentaire) qui doit être affiché si la réponse n'est pas juste.
//-------------------------------------------------------------------------

function evaluateCheckBox(nom, groupe, etat, bareme, penalite, zoneResult, commentaire) {
    var retour = false;
    bareme = (typeof bareme !== 'undefined') ? bareme : 1;
    //recherche des points obtenus dans le groupe
    //recherche des pénalités dans le groupe
    var penaliteGroupe = 0;
    var pointGroupe = 0;
    $("[groupe=" + groupe + "]").each(function () {
        pointGroupe += parseFloat($(this).attr("note"));
        penaliteGroupe += parseFloat($(this).attr("penalite"));
    });
    var numID = nom.substring(4);
    if (document.getElementById(nom).checked) {
        //la case a été coché
        if (etat == "nc") {
            //mais elle n'aurait pas dû l'être donc appliquer la pénalité
            note_max = note_max + bareme;
            afficheNote(zoneResult + "max", bareme);
            $("#" + nom).next().addClass("incorrect");
            $("#boite" + numID).attr("note", 0).attr("penalite", penalite);
            var ajout = 0;
            //il fat appliquer une penalité
            if (pointGroupe - penaliteGroupe < 0) {} else {
                if (pointGroupe - penaliteGroupe - penalite > 0) {
                    //malgré la pénalité il reste des points à l'exercice alors appliquer la pénalité
                    ajout = 0 - penalite;
                } else {
                    //il faut retirer le relicat et donc le score au groupe sera null
                    ajout = penaliteGroupe - pointGroupe;
                }
            }
            note_globale = note_globale + ajout;
            afficheNote(zoneResult, ajout);
            if (typeof commentaire !== 'undefined' && commentaire !== "") {
                afficheCommentaire(commentaire);
            }
            $("#" + nom + " ~ label").attr("title", "-" + penalite);
        }
        if (etat == "c") {
            //c'est la réponse attendue donc atribuer les points
            note_max = note_max + bareme;
            afficheNote(zoneResult + "max", bareme);
            $("#" + nom).next().addClass("correct");
            $("#boite" + numID).attr("note", bareme).attr("penalite", "0");
            var ajout = 0;
            if (pointGroupe - penaliteGroupe > 0) {
                ajout += bareme;
            } else {
                if (bareme + pointGroupe - penaliteGroupe > 0) {
                    ajout += bareme + pointGroupe - penaliteGroupe;
                }
            }
            note_globale = note_globale + ajout;
            afficheNote(zoneResult, ajout);
            $("#" + nom + " ~ label").attr("title", bareme + "/" + bareme);
            retour = true;
        }
    } else {
        //La case n'a pas été coché
        if (etat == "c") {
            //mais elle aurait dû l'être donc appliquer la pénalité
            $("#" + nom).next().addClass("attendu");
            note_max = note_max + bareme;
            afficheNote(zoneResult + "max", bareme);
            note_max = note_max + bareme;
            afficheNote(zoneResult + "max", bareme);
            $("#" + nom).next().addClass("incorrect");
            $("#boite" + numID).attr("note", 0).attr("penalite", penalite);
            var ajout = 0;
            //il fat appliquer une penalité
            if (pointGroupe - penaliteGroupe < 0) {} else {
                if (pointGroupe - penaliteGroupe - penalite > 0) {
                    //malgré la pénalité il reste des points à l'exercice alors appliquer la pénalité
                    ajout = 0 - penalite;
                } else {
                    //il faut retirer le relicat et donc le score au groupe sera null
                    ajout = penaliteGroupe - pointGroupe;
                }
            }
            note_globale = note_globale + ajout;
            afficheNote(zoneResult, ajout);
            if (typeof commentaire !== 'undefined' && commentaire !== "") {
                afficheCommentaire(commentaire);
            }
            $("#" + nom + " ~ label").attr("title", "-" + penalite);
        }
        if (etat == "nc") {
            //c'est juste donc appliquer les points
            note_max = note_max + bareme;
            afficheNote(zoneResult + "max", bareme);
            $("#" + nom).next().addClass("correct");
            $("#boite" + numID).attr("note", bareme).attr("penalite", "0");
            var ajout = 0;
            if (pointGroupe - penaliteGroupe > 0) {
                ajout += bareme;
            } else {
                if (bareme + pointGroupe - penaliteGroupe > 0) {
                    ajout += bareme + pointGroupe - penaliteGroupe;
                }
            }
            note_globale = note_globale + ajout;
            afficheNote(zoneResult, ajout);
            $("#" + nom + " ~ label").attr("title", bareme + "/" + bareme);
            retour = true;
        }
    }
    document.getElementById(nom).disabled = true;
    /* console.log(nom + "----------------------------------checkBox");
     console.log("note_max : " + note_max);
     console.log("note_globale : " + note_globale);
     console.log("----");
     */
    return retour;

}

// fonction evaluateExpNum() pour noter les questions où on attend une valeur numérique (correction automatique)
// paramètre :
//		nomForm : nom du formulaire de type Text
//		resultat : valeur attendue
//		interval : ecart autorisé en valeur absolue avec la valeur attendue
//		bareme : nombre de points attibués à la question (1 point par défaut)
//		zoneResult : nom du champ dans lequel rajouter le score obtenu
//		commentaire : nom de la zone texte (contenant le commentaire) qui doit être affiché si la réponse n'est pas juste.
//-------------------------------------------------------------------------

function evaluateExpNum(nomForm, solution, interval, bareme, zoneResult, commentaire) {
    retour = false;
    note_max = note_max + bareme;
    afficheNote(zoneResult + "max", bareme);
    reponseEleve = parseFloat(document.getElementById(nomForm).value);
    resultatMax = solution + interval;
    resultatMin = solution - interval;
    if ((reponseEleve >= resultatMin) && (reponseEleve <= resultatMax)) {
        $("#" + nomForm).addClass("correct");
        afficheNote(zoneResult, bareme);
        note_globale = note_globale + bareme;
        retour = true;
        $("#" + nomForm).attr("title", bareme + "/" + bareme);
        //    if (typeof commentaire !== 'undefined'){
        //      this.getField(commentaire).display = display.hidden;
        //   }
    } else {
        $("#" + nomForm).addClass("incorrect");
        if (typeof commentaire !== 'undefined' && commentaire !== "") {
            afficheCommentaire(commentaire);
        }
        $("#" + nomForm).attr("title", "0/" + bareme);
    }
    document.getElementById(nomForm).disabled = true;
    return retour;
}

// fonction evaluateRatioButton() pour noter les questions de type RatioButton
//paramètre :

//		bareme : nombre de points à donner si la réponse est juste
//		zoneResult : nom du champ dans lequel écrire les points obtenus
//		commentaire : nom de la zone texte (contenant le commentaire) qui doit être affiché si la réponse n'est pas juste.
//-------------------------------------------------------------------------

function evaluateRatioButton(nom, etat, bareme, note, zoneResult, commentaire) {
    bareme = (typeof bareme !== 'undefined') ? bareme : 1;
    if (document.getElementById(nom).checked) {
        if (etat == "nc") {
            note_max = note_max + bareme;
            note_globale = note_globale + note;
            afficheNote(zoneResult + "max", bareme);
            afficheNote(zoneResult, note);
            var ob = document.getElementById(nom).nextSibling;
            ob.setAttribute("class", "incorrect");
            if (typeof commentaire !== 'undefined' && commentaire !== "") {
                afficheCommentaire(commentaire);
            }
            $("#" + nom + " ~ label").attr("title", note + "/" + bareme);
        }
        if (etat == "c") {
            note_max = note_max + bareme;
            note_globale = note_globale + note;
            var ob = document.getElementById(nom).nextSibling;
            ob.setAttribute("class", "correct");
            afficheNote(zoneResult + "max", bareme);
            afficheNote(zoneResult, note);
            $("#" + nom + " ~ label").attr("title", note + "/" + bareme);
            /*if (typeof commentaire !== 'undefined'){
				 *		      document.getElementById(commentaire).display = display.hidden;
			}*/
        }
    } else {
        if (etat == "c") {
            document.getElementById(nom).fill = "green";
            note_max = note_max + bareme;
            var ob = document.getElementById(nom).nextSibling;
            ob.setAttribute("class", "attendu");
            afficheNote(zoneResult + "max", bareme);
            if (typeof commentaire !== 'undefined' && commentaire !== "") {
                afficheCommentaire(commentaire);
            }
            $("#" + nom + " ~ label").attr("title", "0/" + bareme);
        }
    }
    document.getElementById(nom).disabled = true;
    /*console.log(nom + "----------------------Bouton radio");
    console.log("note_max : " + note_max);
    console.log("note_globale : " + note_globale);
    console.log("----");
*/

}

function eventEvaluateManuel(ev) {
    if (statu == "prof") {
        var etat = (ev.target.checked) ? "true" : "false";
        var id = ev.target.id;
        $.ajax({
            async: false,
            url: site + API + "/prof/evaluateManuel.php",
            data: "devoirID=" + $("#devoirID").val() + "&userID=" + $("#userID").val() + "&element=" + id + "&valeur=" + etat,
            dataType: "html",
            success: function (data) {
                //			correction();
                recorrection($("#userID").val(), $("#devoirID").val());
            }
        });
    }
}

function evaluateManuel(idReponse, groupe, bareme, zoneResult, commentaire) {
    var objTaux = $('[id*=' + groupe + ']:checked');
    if (objTaux.length != 0) {
        var id = objTaux[0].id;
        var lettre = "e".charCodeAt(0);
        var taux = ("e".charCodeAt(0) - id.charCodeAt(id.length - 1)) * 25;
        note_max = note_max + bareme;
        note_globale = note_globale + bareme * taux / 100;
        afficheNote(zoneResult + "max", bareme);
        afficheNote(zoneResult, bareme * taux / 100);
        if (taux < 100) {
            $("#" + idReponse).addClass("incorrect");
            if (typeof commentaire !== 'undefined' && commentaire !== "") {
                afficheCommentaire(commentaire);
            }
        } else {
            $("#" + idReponse).addClass("correct");
        }
        $("#" + idReponse).attr("title", bareme * taux / 100 + "/" + bareme);
    }
}

function evaluateManuelUnique(idReponse, idCase, bareme, zoneResult, commentaire) {
    var isChecked = ($('#' + idCase + ':checked').length > 0) ? true : false;
    note_max = note_max + bareme;
    afficheNote(zoneResult + "max", bareme);
    if (isChecked) {
        note_globale = note_globale + bareme;
        afficheNote(zoneResult, bareme);
        $("#" + idReponse).attr("class", "correct").attr("title", bareme + "/" + bareme);
    } else {
        $("#" + idReponse).attr("class", "incorrect").attr("title", "0/" + bareme);
        if (typeof commentaire !== 'undefined' && commentaire !== "") {
            afficheCommentaire(commentaire);
        }
    }
}

function evaluateTexteTrous(cible, bareme, zoneResult) {
    var max = 0;
    var note = 0;
    $("" + cible).each(function (index) {
        max = index;
        if ($(this).attr("attendu") == $(this).attr("depot")) {
            note += 1;
            $(this).addClass("correct");
        } else {
            $(this).addClass("incorrect");
        }
    });
    note_globale += (bareme * note) / max;
    note_max += bareme;
    afficheNote(zoneResult, (bareme * note) / max);
    afficheNote(zoneResult + "max", bareme);
}

function evaluateCloze(cible, zoneResult) {
    var max = 0;
    var note = 0;
    var result = cible.correction();
    result = result.split("/");
    note_globale += parseFloat(result[0]);
    note_max += parseFloat(result[1]);
    afficheNote(zoneResult, result[0]);
    afficheNote(zoneResult + "max", result[1]);
    /*console.log("----------------------------------cloze");
    console.log("note : " + result[0]);
    console.log("sur note max : " + result[1]);
    console.log("note_max : " + note_max);
    console.log("note_globale : " + note_globale);
    console.log("----");
    */
}
//
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//							Script init
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//


function alreadyResponse(dv_data, continuer) {
    var xhr = null;
    if (xhr && xhr.readyState != 0) {
        xhr.abort(); // On annule la requête en cours !
    }
    xhr = getXMLHttpRequest();
    xhr.open("POST", site + API + "/php/isResponse.php", continuer);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //	xhr.setRequestHeader("Content-length", dv_data.length);
    xhr.onload = function () {
            // traitement à réaliser
            // à réception de la réponse
            //		alert(xhr.responseText);
            initDevoir(xhr.responseText);
        }
        //		xhr.send(JSON.stringify(dv_data));
    xhr.send(dv_data);
}

function ajax_load_svg() {

    //ajax_loader("entete_devoir2.svg", "entete2");
    //ajax_loader("entete_devoir.svg", "entete_devoir");
    //rechercher les classe .loadSVG pour y mettre le svg
    $(".loadSVG").each(function (index) {
        var fichier = $(this).attr("nomFichier");
        var element = $(this).parent().attr("id");
        $.ajax({
            async: false,
            url: site+API+"/php/loadSVG.php",
            data: "fichier=" + fichier,
            dataType: "xml",
            success: function (data) {
                if (data != "") {
                    $("#" + element).html(document.adoptNode($("svg", data)[0]));
                }
            }
        });
    });
}

function ajax_loader(fichier, element) {
    $.ajax({
        async: false,
        url: site+API+"/php/loadSVG.php",
        data: "fichier=" + fichier,
        dataType: "xml",
        success: function (data) {
            if (data != "") {
                $("#" + element).html(document.adoptNode($("svg", data)[0]));
            }
        }
    });
}

function ajax_loader_question() {
    $.ajax({
        async: false,
        url: site+API+"/php/loadQuestion.php",
        data: "fichier=" + chemin + "questions.html",
        dataType: "html",
        success: function (data) {
            if (data != "") {
                dvQuestions = data;
                $("#questions").html(data);
            }
        }
    });

}

function init() {
    //$.getScript("https://coursdesciences.fr/devoir/API4/outils/cloze.js");
    $(document).tooltip({
        items: "[titre],[title]",
        content: function (event) {
            if ($(this).is("[titre]")) {
                return $(this).attr("titre");
            } else {
                return $(this).attr("title");
            }
        }
    });
    nbQuestion = $(".question").length - 1;
    for (var t = 0; t < nbQuestion + 1; t++) {
        pages[t] = t;
    }
    setVariables();

    init_nav_bar(nbQuestion);
    $(".question").on("click", function (evt) {
        $(this).find(".dvFocused").removeClass("dvFocused")
    });
    $(".question").on("click", ".dvScience", function (evt) {
        evt.stopPropagation()
    });
    switch (statu) {
    case "eleve":
        $('[id*="manuel"]').attr('disabled', 'disabled');
        if (debutDeTest()) {
            alreadyResponse(dv_data(), false);
        }
        break;
    case "prof":
        initDevoir("false");
        $('[id*="manuel"]').removeAttr('disabled');
        break;
    }
}

function initOrderQuestions(pages) {
    var temp;
    for (var i = 1; i < nbQuestion + 1; i++) {
        n = (parseInt(Math.random() * (nbQuestion - i))) + 1;
        temp = pages[n];
        pages[n] = pages[nbQuestion + 1 - i];
        pages[nbQuestion + 1 - i] = temp;
    }
    return pages;
}

function init_nav_bar(nbQ) {
    var txt_html = "";
    for (var i = 1; i < nbQ + 1; i++) {
        txt_html = '<span class="bouton" id="bouton' + i + '" onclick="afficheQuestion(' + i + ')"> </span>';
        $(txt_html).appendTo($('#menu'));
        $("#questions [id*=question]").hide();
        $("#question0").show();
    }

}

function afficheQuestion(num) {
    if (!debutDeTest() && !dv.modeEbauche) {
        window.alert('Vous devez indiquer votre NOM, PRENOM et votre CLASSE !');
    } else {
        if ((!timerOn) && (!revoirDs) && !dv.modeEbauche) {
            if (!modeEbauche) {
                initTimer(0, minute, seconde);
            }
            $.ajax({
                async: false,
                url: site + API + "/php/setPropertie.php",
                data: "devoirID=" + $("devoirID").val() + "&userID=" + $("userID").val() + "&nom=modifiable&valeur=oui",
                dataType: "html",
                success: function (data) {}
            });
        }
        pageActuelle = num;
        var nbQuestion = $(".question").length;
        for (var t = 0; t < nbQuestion; t++) {
            if (t == num) {
                document.getElementById("bouton" + t).style.backgroundPosition = "-60px 0px";
                document.getElementById("question" + pages[t]).style.display = "block";

                if (dv.modeEbauche) {
                    $("#page [id*=boite][class*=construction]").off("click dblclick mousedown");
                    $("#page [id*=boite][class*=resizable]").filter(".ui-resizable").resizable("destroy");
                    $("#page [id*=boite][class*=resizable]").removeClass("ui-resizable-autohide");
                    $("#page [id*=boite][class*=draggable]").draggable("destroy");
                    $("#page [id*=boite][class*=droppable]").droppable("destroy");
                    $("#page [id*=boite][class*=construction]").removeClass("construction");
                    $("#page [id*=drag]").each(function () {
                        $.proxy(maPage.delInteractivite("#" + this.id), maPage);
                    });
                }
                $("#page").removeAttr("id");
                $("#question" + pages[num] + " .page").attr("id", "page");
                if (dv.modeEbauche) {
                    maPage.firstParent = "question" + num;
                    $("#page")
                        .droppable({
                            hoverClass: "hoverDroppable",
                            tolerance: "fit",
                            greedy: true,
                            addClass: false,
                            drop: $.proxy(function (event, ui) {
                                event.stopPropagation();
                                this.selection.addObjet(ui.draggable[0]);
                                for (var t = 0; t < this.selection.objets.length; t++) {
                                    var $element = $(this.selection.objets[t]);
                                    var $boite = $(event.target);

                                    var obj1 = $boite.offset();
                                    var obj2 = $element.offset();
                                    var obj3 = {};
                                    for (var attrname in obj1) {
                                        obj3[attrname] = obj2[attrname] - obj1[attrname];
                                    }
                                    $element.css(obj3);
                                    $boite.append($element[0]);
                                    //$element.draggable("destroy");
                                    //$element.draggable(draggableOptions);

                                }
                            }, maPage)
                        })
                        .on("mousedown", $.proxy(function (event) {
                            if (!event.ctrlKey) {
                                $(".ghost-select")
                                    .addClass("ghost-active")
                                    .css({
                                        'left': event.pageX - 40,
                                        'top': event.pageY
                                    });

                                this.selecteur.initialW = event.pageX - 40;
                                this.selecteur.initialH = event.pageY;

                                $("body").on("mouseup", null, {
                                    objCreatePage: this
                                }, $.proxy(this.selecteur.selectElements, this.selecteur));
                                $("body").on("mousemove", $.proxy(this.selecteur.openSelector, this.selecteur));
                            } else {
                                this.selection.objets = [];
                                $("#deselected").click();
                            }
                        }, maPage))
                        .on("click", function (evt) {
                            $("#deselected").click();
                        });
                    $.proxy(maPage.setInteractivite("#page [id*=boite]"), maPage);
                    $("#page [id*=boite]").addClass("construction");
                    $("#page [id*=drag]").each(function () {
                        $.proxy(maPage.setInteractivite("#" + this.id), maPage);
                    });
                }
            } else {
                $("#bouton" + t).removeAttr("style");
                //document.getElementById("bouton" + t).style.backgroundPosition = "0px 0px";
                document.getElementById("question" + pages[t]).style.display = "none";
            }
            if (num == 0) {
                document.getElementById("entete").style.display = "block";
                document.getElementById("entete2").style.display = "none";
            } else {
                document.getElementById("entete2").style.display = "block";
                document.getElementById("entete").style.display = "none";
            }
        }
        //TODO vider la sélection
        if (dv.modeEbauche) {
            maPage.selection.removeAll();
        }
    }
}

function setDragDrop(param, nonModifiable) {
    var text = "";
    text = param.split(";");
    if (text[0] != "") {
        for (var i = 0; i < text.length; i++) {
            var element = text[i].split(":");
            var point = element[1].split(",");
            var styles = {
                top: point[1],
                left: point[0]
            };
            $("#" + element[0]).css(styles);
            if (nonModifiable) {
                //$("#"+element[0]).draggable( "option", "disabled", true );
            }
        }
    }
}

function dragStop(event, ui, obj) {
    var element = ui.helper[0].id;
    //	var toto=element+":"+parseInt(ui.helper[0].offsetLeft)+","+parseInt(ui.helper[0].offsetTop);
    var toto = element + ":" + $(ui.helper[0]).css("left") + "," + $(ui.helper[0]).css("top");
    var text = $("#" + obj).val().split(";");
    var temp = "";
    var replace = false;
    for (var i = 0; i < text.length; i++) {
        if (text[0] == "") {
            temp = toto;
            replace = true;
        }
        var donne = text[i].split(":");
        if (donne[0] == element) {
            replace = true;
            if (i != 0) {
                temp = temp + ";";
            }
            temp = temp + toto;
        } else {
            if (i != 0) {
                temp = temp + ";";
            }
            temp = temp + text[i];
        }
    }
    if (!replace) {
        temp = temp + ";" + toto;
    }
    //trier par ordre croissant les positions "left"
    var tab = temp.split(";");
    var left = [];
    for (var i = 0; i < tab.length; i++) {
        var dd;
        dd = tab[i].split(":");
        dd = dd[1].split(",");
        dd = dd[0];
        dd = dd.split("px");
        left[i] = parseInt(dd[0]);
    }
    for (var t = 1; t < tab.length; t++) {
        var min = t;
        for (var u = t + 1; u < tab.length; u++) {
            if (left[u] < left[min]) {
                min = u;
            }
        }
        if (left[min] < left[t - 1]) {
            var dd = left[t - 1];
            left[t - 1] = left[min];
            left[min] = dd;
            dd = tab[t - 1];
            tab[t - 1] = tab[min];
            tab[min] = dd;
        }
    }
    //	reconstitution de temp
    temp = tab[0];
    for (var t = 1; t < tab.length; t++) {
        temp = temp + ";" + tab[t];
    }
    $("#" + obj).val(temp);
}

function initDevoir(responseData) {

    if (responseData != "false") {
        $('input:radio').prop('checked', false);
        $('input:checkbox').prop('checked', false);
        $('[id*="commentaire"]').css("display", "none");
        //setResponse(responseData);
        document.getElementById("nom").disabled = true;
        document.getElementById("prenom").disabled = true;
        document.getElementById("classe").disabled = true;
        document.getElementById("date").disabled = true;
        $.ajax({
            async: false,
            url: site + API + "/php/isPropertie.php",
            data: "devoirID=" + $("#devoirID").val() + "&userID=" + userID + "&nom=modifiable&valeur=oui",
            dataType: "html",
            success: function (data) {
                if (data == "oui") {
                    devoirModifiable = true;
                } else {
                    devoirModifiable = false;
                }
                if (data == "non" || statu == "prof") {
                    //l'élève ne peut plus modifier son devoir
                    document.getElementById("correction").setAttribute("style", "display:none;");
                    setResponse(responseData);
                    if (typeof (extra) == "function") {
                        extra();
                    }

                    var svgItem = document.getElementById("minute");
                    svgItem.textContent = $("#resteMinute").val();
                    svgItem = document.getElementById("seconde");
                    svgItem.textContent = $("#resteSeconde").val();
                    //positionnement des éléments déplaçable
                    var move = $('[id*="move"]');
                    for (var i = 0; i < move.length; i++) {
                        setDragDrop(move[i].value, true);
                    }

                    // modifier ici pour que la correction ne s'affiche que si correctionVisible est à oui 
                    $.ajax({
                        async: false,
                        url: site + API + "/php/isPropertie.php",
                        data: "devoirID=" + $("#devoirID").val() + "&userID=" + userID + "&nom=correctionVisible&valeur=oui",
                        dataType: "html",
                        success: function (data) {
                            //l'élève voit la correction
                            if (data == "oui" || statu == "prof") {
                                revoirDs = true;
                                $("[class*='correct']").removeClass("correct");
                                $("[class*='incorrect']").removeClass("incorrect");
                                if (statu == "prof") {
                                    $('[id*="evalProf"]').css("display", "block");
                                } else {
                                    $('[id*="evalProf"]').css("display", "none");
                                    $('[id*="manuel"]').attr('disabled', "disabled");
                                }
                                correction();
                            } else {
                                // cas où l'élève revoit son DS alors que la correction ne lui est pas correctionVisible
                                //il faut doncbloquer les champs
                                $("input").attr("disabled", "disabled");
                                $("textarea").attr("disabled", "disabled");
                                $('[id*="evalProf"]').css("display", "none");
                                //positionnement et blocage des éléments déplaçables
                                var move = $('[id*="move"]');
                                for (var i = 0; i < move.length; i++) {
                                    setDragDrop(move[i].value, false);
                                }
                            }
                        }
                    });
                    //	document.getElementById("loader").style="display:none";

                    revoirDs = true;
                } else {
                    //l'élève peut modifier son devoir
                    revoirDs = false;
                    setResponse(responseData);
                    if (typeof (extra) == "function") {
                        extra();
                    }
                    //positionnement des éléments déplaçable
                    var move = $('[id*="move"]');
                    for (var i = 0; i < move.length; i++) {
                        setDragDrop(move[i].value, false);
                    }
                    $(".commentaire").css("display", "none");
                    $('[id*="evalProf"]').css("display", "none");
                    initTimer(0, $("#resteMinute").val() * 1, $("#resteSeconde").val() * 1);

                }
                if (statu == "prof") {
                    $('[id*="manuel"]').removeAttr('disabled');
                }
            }
        });
    } else {
        //élève n'a encore jamais répondu au test. mise en place du test
        afficheDate();
        revoirDs = false;
        $(".commentaire").css("display", "none");
        if (orderQuestions) {
            pages = initOrderQuestions(pages);
        }
        var isENT = setIdentite();
        if (isENT) {
            document.getElementById("nom").disabled = true;
            document.getElementById("prenom").disabled = true;
        } else {
            $("#nom").removeAttr("disabled");
            $("#prenom").removeAttr("disabled");
        }
        $.ajax({
            async: false,
            url: site + API + "/php/setPropertie.php",
            data: "devoirID=" + $("#devoirID").val() + "&userID=" + $("#userID").val() + "&nom=modifiable&valeur=" + ((devoirModifiable) ? "oui" : "non"),
            dataType: "html",
            success: function (data) {}
        });
        $.ajax({
            async: false,
            url: site + API + "/php/setPropertie.php",
            data: "devoirID=" + $("#devoirID").val() + "&userID=" + $("#userID").val() + "&nom=correctionVisible&valeur=" + ((premiereEssaiCorrectionVisible) ? "oui" : "non"),
            dataType: "html",
            success: function (data) {}
        });
        $('[id*="evalProf"]').css('display', 'none');

        //document.getElementById("loader").style="display:none";
        if (statu == "prof") {
            if (typeof (premiereEssai) == "function") {
                premiereEssai();
            }
            setUIProf();
            $("#nom").removeAttr("disabled");
            $("#prenom").removeAttr("disabled");
        } else {
            var etat = "non";
            if (premiereEssaiCorrectionVisible) {
                etat = "oui";
            }
            $.ajax({
                async: false,
                url: site + API + "/php/setPropertie.php",
                data: "devoirID=" + $("#devoirID").val() + "&userID=" + $("#userID").val() + "&nom=correctionVisible&valeur=" + etat,
                dataType: "html",
                success: function (data) {}
            });
            if (typeof (premiereEssai) == "function") {
                premiereEssai();
            }
        }
    }
    $('#loader').css('display', 'none');
    $(".dvScience").trigger("change");
}

function setUIProf() {
    $.ajax({
        async: false,
        url: site+API+"/prof/outilsProf.html",
        dataType: "html",
        success: function (data) {
            $("#outilsProf").html(data);
        }
    });
    //$("#outilsProf").load("https://coursdesciences.fr/devoir/API4/prof/outilsProf.html");
    $.ajax({
        async: false,
        url: site + API + "/php/loadQuestion.php",
        data: "fichier=../prof/UIprof.html",
        dataType: "html",
        success: function (data) {
            var toto = /\<body\>([\s\S]*?)\<\/body\>/i;
            toto.exec(data);
            var titi = RegExp.$1;
            //			$("#"+element).html(document.adoptNode($("div", data)[0]));
            $("" + titi).appendTo($("#prof"));
        }
    });
    maPage.init('question0');
    $.ajax({
        async: false,
        url: site + API + "/php/loadQuestion.php",
        data: "fichier=../prof/parametre.html",
        dataType: "html",
        success: function (data) {
            var toto = /\<body.*\>([\s\S]*?)\<\/body\>/i;
            toto.exec(data);
            var titi = RegExp.$1;
            //			$("#"+element).html(document.adoptNode($("div", data)[0]));
            $("" + titi).appendTo($("#menuParametre"));
        }
    });
        $("#menuProf").tabs({
        activate: function (event, ui) {
            var newMenu = ui.newPanel.attr("id");
            var oldMenu = ui.oldPanel.attr("id");
            if ((newMenu == "menuEbauche" || newMenu == "menuCorrection" || newMenu == "menuParametre") && (!dv.modeEbauche)) {
                /*
                //retirer toutes traces d'activités
                $(".correct").removeClass("correct");
                $(".incorrect").removeClass("incorrect");
                $(".partiel").removeClass("partiel");
                $(".attendu").removeClass("attendu");
                $("#page  :checked").prop("checked", false);
                $("#questions input, #questions textarea").val("");
                $("[id*=drag]").css("left", "0px").css("top", "0px");
                //fin
                */
                //recharger les questions
                $("#questions").html(dvQuestions);
                //ajax_loader_question();
                $("#outils").show("slide", {
                    direction: "up"
                }, 700);
                $("#outilsLeft").show("slide", {
                    direction: "right"
                }, 700);
                $("#devoir").css("height", "700px");
                $("#menuProf").css("height", "670px");
                $("#question" + pageActuelle + " .page").attr("id", "page");
                $("#page")
                    .droppable({
                        hoverClass: "hoverDroppable",
                        tolerance: "fit",
                        greedy: true,
                        addClass: false,
                        drop: $.proxy(function (event, ui) {
                            event.stopPropagation();
                            this.selection.addObjet(ui.draggable[0]);
                            for (var t = 0; t < this.selection.objets.length; t++) {
                                var $element = $(this.selection.objets[t]);
                                var $boite = $(event.target);

                                var obj1 = $boite.offset();
                                var obj2 = $element.offset();
                                var obj3 = {};
                                for (var attrname in obj1) {
                                    obj3[attrname] = obj2[attrname] - obj1[attrname];
                                }
                                $element.css(obj3);
                                $boite.append($element[0]);
                                //$element.draggable("destroy");
                                //$element.draggable(draggableOptions);

                            }
                        }, maPage)
                    })
                    .on("mousedown", $.proxy(function (event) {
                        if (!event.ctrlKey) {
                            $(".ghost-select")
                                .addClass("ghost-active")
                                .css({
                                    'left': event.pageX - 40,
                                    'top': event.pageY
                                });

                            this.selecteur.initialW = event.pageX - 40;
                            this.selecteur.initialH = event.pageY;

                            $("body").on("mouseup", null, {
                                objCreatePage: this
                            }, $.proxy(this.selecteur.selectElements, this.selecteur));
                            $("body").on("mousemove", $.proxy(this.selecteur.openSelector, this.selecteur));
                        } else {
                            this.selection.objets = [];
                            $("#deselected").click();
                        }
                    }, maPage));
                //desactiver les boites de dialogue dans les .question
                $("[aria-describedby*=boite]").each(function () {
                    //var clone = $("#" + $(this).attr("aria-describedby")).clone();
                    $(this).remove();
                    //$(clone).attr("class", "unselectable");
                    //$(clone).appendTo($(clone).attr("origine"));
                });
                //désactive les interactivités du devoir
                $("script.ebauche").each(function (i) {
                    eval($(this).text());
                });
                $.proxy(maPage.setInteractivite("#page [id*=boite]"), maPage);
                $("#page [id*=drag][class*=draggable]").draggable("destroy");
                $("#page [id*=drag]").each(function (index) {
                    var id = this.id;
                    //remettre les objets déplaçable ("drag") à leur position d'origine
                    $("#" + id).css("left", "0px").css("top", "0px");
                    //vider les zone de dépot
                    $("[depot]").attr("depot", "");
                    $.proxy(maPage.setInteractivite("#" + id), maPage);
                });
                $("#page [id*=boite]").addClass("construction");
                $(".noteExercice,[id*=evalProf],.commentaire").show();
                $("input, textarea").removeAttr("disabled");
                dv.modeEbauche = true;
                afficheQuestion(pageActuelle);
                //$("#bouton0").click();
            }
            if ((oldMenu == "menuEbauche" || oldMenu == "menuCorrection" || oldMenu == "menuParametre") && (newMenu == "menuSuivi")) {
                //save questions before
                dv.modeEbauche = false;
                //maPage.saveAllQuestions();
                    $("#page [id*=boite][class*=construction]").off("click dblclick mousedown");
                    $("#page [id*=boite][class*=resizable]").filter(".ui-resizable").resizable("destroy");
                    $("#page [id*=boite][class*=resizable]").removeClass("ui-resizable-autohide");
                    $("#page [id*=boite][class*=draggable]").draggable("destroy");
                    $("#page [id*=boite][class*=droppable]").droppable("destroy");
                    $("#page [id*=boite][class*=construction]").removeClass("construction");
                    $("#page [id*=drag]").each(function() {
                        $.proxy(maPage.delInteractivite(this.id), maPage);
                        $(this).removeClass("construction");
                    });
                    $("#page").removeClass("hoverDroppable");
                    $("#page").removeAttr("id");
                    maPage.selection.removeAll();
                    $(".commentaire").hide();
                    $(".question").hide();
                    $("#question0").show();
                    $("parametre").text(paramText);
                    dvQuestions = $("#questions").html();
                    $("#questions").html(dvQuestions);
                //ajax_loader_question();
                $("#outils").hide("slide", {
                    direction: "up"
                }, 700);
                $("#outilsLeft").hide("slide", {
                    direction: "right"
                }, 700);
                $("#menuProf").css("height", "640px");
                $("#devoir").css("height", "670px");
                /*
                $("#page [id*=boite][class*=construction]").off("click dblclick mousedown");
                $("#page [id*=boite][class*=resizable]").resizable("destroy");
                $("#page [id*=boite][class*=draggable]").draggable("destroy");
                $("#page [id*=boite][class*=droppable]").droppable("destroy");
                $("#page [id*=boite][class*=construction]").removeClass("construction");
                $("#page [id*=drag]").each(function () {
                    $.proxy(maPage.delInteractivite("#" + this.id), maPage);
                });
                $("#page").droppable("destroy");
                $("#page").off("mousedown");
                $("#page").removeAttr("id");
                $(".commentaire").hide();
                */
                //reactiver les boites de dialogues
                $(".dvDialog").each(function () {
                    eval($(this).text())
                });
                //réactiver les scripts liés aux interactivité du devoir
                $("script.interactivite").each(function () {
                    eval($(this).text())
                });
                //$("#bouton0").click();
                //dv.modeEbauche = false;
                afficheQuestion(pageActuelle);

            }
            $(".dvScience").trigger("change");
        }
    });
    var devoirID = document.getElementById("devoirID").value;
    $.ajax({
        async: false,
        url: site + API + "/prof/find_classes.php",
        data: "devoirID=" + devoirID,
        method: "GET",
        dataType: "html",
        success: function (data) {
            $("" + data).appendTo($("#profClasse"));
        }
    });
    $('#prof').show();
    $.ajax({
        async: false,
        url: site + API + "/prof/find_devoirs.php",
        data: "devoirID=" + devoirID + "&classe=" + $("#profClasse option:selected").val(),
        method: "GET",
        dataType: "html",
        success: function (data) {
            $("" + data).appendTo($("#prof_liste_classe"));
            $("#moyenneClasse").text($("#moyenne").val());
        }
    });
    $(".btn4AllCorrige").click(function () {
        $(".corrige").click();
    });
    $(".btn4AllModifableOui").click(function () {
        setPropertieForAll("btnModifiable", "modifiable", "oui");
    });
    $(".btn4AllModifableNon").click(function () {
        setPropertieForAll("btnModifiable", "modifiable", "non");
    });
    $(".btn4AllVuOn").click(function () {
        setPropertieForAll("btnVu", "correctionVisible", "oui");
    });
    $(".btn4AllVuOff").click(function () {
        setPropertieForAll("btnVu", "correctionVisible", "non");
    });
    //maPage.init('question0');
    $("question0 .page").attr("id", "page");
    dv.modeEbauche = false;
    $('#loader').hide();
}

function setResponse(responseData) {
    var param = responseData.split("&");
    //	alert(param);
    $("[id*=drag]").css("left", "0px").css("top", "0px");
    for (var i = 0; i < param.length; i++) {
        var donnee = []; //new storage
        str = param[i].split("="); //split by spaces
        donnee.push(str.shift()); //add the number
        donnee.push(str.join('=')); //and the rest of the string
        //donnee=param[i].split("=");
        if ((donnee[1] != "true") && (!donnee[1] != "false")) {
            document.getElementById(donnee[0]).value = decodeURIComponent(donnee[1]);

            //if (donnee[0].substring(0, 4) == "drop") {
            $("#questions #" + donnee[0]).not("[id*=manuel]").trigger("change");
            //

        } else {
            if (donnee[1] == "true") {
                document.getElementById(donnee[0]).checked = true;
            } else {
                document.getElementById(donnee[0]).checked = false;
            }
        }
    }
    //positionnement des éléments qui ont été dropper
    var oldRevoirDs = revoirDs;
    revoirDs = true;
    $("[id*=drop]").trigger("change");
    revoirDs = oldRevoirDs;
    //chaque input doit émettre l'événement "change"
    //$("input, textarea").triggerHandler("change");
    /*
     *	idObjSVG = "entete_devoir2";
     *	// Get the Object by ID
     *	var a = document.getElementById(idObjSVG);
     *	// Get the SVG document inside the Object tag
     *	var svgDoc = a.contentDocument;
     *	// Get one of the SVG items by ID;
     *	var svgItem = svgDoc.getElementById("correction");
     */
}

// fonction exécuté dans intDevoir avant correction eventuelle
function extra() {
    $(".commentaire").css("display", "none");
}

function rotation(ev) {
    var ob = ev.target.id;
    var angle = parseInt($("#" + ob).data("angle"));
    angle += 90;
    angle = angle % 360;
    $("#" + ob).data("angle", "" + angle)
        .css("transform", "rotate(" + angle + "deg)");
}



// fonction exécutée lors de l'affichage du test lorsqu'il est affiché pour la première fois
function premiereEssai() {}

function renew() {}

function textSelected(event) {
    $(event.target).parent().find(".textSelected").removeClass("textSelected");
    $(event.target).addClass("textSelected");
    $("#Text" + ($(event.target).parent().parent().attr("id")).substring(5)).val($(event.target).text());
}

function beforeSave() {
    $(".savable").trigger("save");
}

function correction() {

    reinitialise();
    //partie1
    $("code").each(function () {
        eval($(this).text())
    });
    //  this.getField("note_devoir").value = note_globale / note_max *20;
    afficheNoteDevoir("entete_devoir", "note_devoir", note_globale / note_max * 20);

}

function setClasseHtml() {
    var typeClassHtml = '<option selected="selected" value="...">...</option><option value="' + typeClasse + 'A" >' + typeClasse + 'A</option><option value="' + typeClasse + 'B">' + typeClasse + 'B</option><option value="' + typeClasse + 'C">' + typeClasse + 'C</option><option value="' + typeClasse + 'D">' + typeClasse + 'D</option><option value="' + typeClasse + 'E">' + typeClasse + 'E</option><option value="' + typeClasse + 'F">' + typeClasse + 'F</option>';
    $("#classe").html(typeClassHtml);
}
$(function () {
    ajax_loader_question();
    ajax_load_svg();
    setClasseHtml();
    $(".commentaire").css("display", "none");
    init();
});