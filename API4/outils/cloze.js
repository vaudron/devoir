/*
var Classe = function(parametre0) {
	var methode = function(*) {
		}
 
	this.methodePublique = function() {
		}
 
	var attr0, attr1, attr2;
	var autre_attribut;
	var attribut_avec_une_valeur_par_defaut = 'toto';
	var utilisons_le_parametre = parametre0;
}
 
 var objet = new Classe('bleu');
 objet.methodePublique();
 
*/


var cloze = function (selectorDonnees, selectorRendu) {
    'use strict';
    var tabMots = [],
        maxWidth = 0,
		selecteurDuContener = selectorDonnees,
		selecteurResultat = selectorRendu; //là où le travail de l'élève est enregistré
    this.note = 0;
    this.max = 0;
    //type de texte à tous:
    // MD : mots à déplacer dans les espaces
    // TC : Trous à compléter
    //this.type = typeCloze;

    this.init = function () {
        if ($("" + selecteurResultat).html() === "") {
            var txtHtml = $("" + selecteurDuContener).html();
            
				txtHtml = txtHtml.replace(/\{\{/g, "<input type=\"text\" class=\"clozeInput text_eleve\" attendu=\"");
				txtHtml = txtHtml.replace(/\}\}/g, "\" depot=\"\"/>");
                txtHtml = txtHtml.replace(/\{\*/g, "<span class=\"clozeCible clozeCibles distract\">");
                txtHtml = txtHtml.replace(/\{/g, "<span class=\"clozeCible clozeCibles\">");
                txtHtml = txtHtml.replace(/\}/g, "</span>");
                $("" + selecteurResultat).html(txtHtml);
                // on retire les mots et les place dans un tableau
                $("" + selecteurResultat + " span[class*=clozeCible]").each(function (index) {
                    tabMots[index] = $(this).text().replace(/'/g, "&apos;");
                    var toto = $(this).width();
                    if ($(this).width() > maxWidth) {
                        maxWidth = $(this).width();
                    }
                    if ($(this).hasClass("distract")) {
                        $(this).remove();
                    } else {
                        $(this).text("").attr("attendu", tabMots[index]).attr("depot", "");
                    }
                });
                $("" + selecteurResultat + " span[class*=clozeCibles]").css("width", maxWidth);
                // puis on trie aléatoirement le contenu du tableau
                var temp;
                for (var i = 0; i < tabMots.length; i += 1) {
                    var n = parseInt(Math.random() * (tabMots.length - i - 1));
                    temp = tabMots[n];
                    tabMots[n] = tabMots[tabMots.length - i - 1];
                    tabMots[tabMots.length - i - 1] = temp;
                }
                txtHtml = "<div class=\"clozeListeMots\" depot=\"\"></div>";
                $("" + selecteurResultat).prepend(txtHtml);
                for (var t = 0; t < tabMots.length; t++) {
					$("" + selecteurResultat + " .clozeListeMots").append("<span class=\"clozeObj clozeObjs\">" + tabMots[t] + "</span>");
                }
                //$(".clozeListeMots").append("<input id=\"resultat3\" type=\"hidden\" \>");
                $("" + selecteurResultat + " span[class*=clozeCibles]").attr("depot", "");
                //définition des interactivités
                this.setInteractivite();
            
            /*
            if (this.type == "TC") {
                txtHtml = txtHtml.replace(/\{/g, "<input type=\"text\" class=\"clozeCible clozeCibles\" attendu=\"");
                txtHtml = txtHtml.replace(/\}/g, "\" />");
                $("" + selecteurDuContener).html(txtHtml);
                // on retire les mots et les place dans un tableau
                $("" + selecteurDuContener + " input[class*=clozeCibles]")
                    .each(function (index) {
                        tabMots[index] = $(this).attr("attendu");
                    })
                    .css("width", "100 px")
                    .change(function () {
                        $("" + selecteurResultat).val($(selecteurDuContener).html());
                    });
            }
*/

        } else {
			this.setInteractivite();
        }
    }

    this.setInteractivite = function () {

            $("" + selecteurResultat + " span[class*=clozeObj]").draggable({
                cursor: "pointer",
                revert: function (element) {
                    if (element === false) {
                        return true;
                    } else {
                        if (element.attr("depot") != "" || !(element.hasClass("clozeListeMots") || element.hasClass("clozeCibles"))) {
                            return true;
                        } else {
                            //$(element).attr("depot",$(this).text());
                            //$(""+selecteurResultat).val($(selecteurDuContener).html());
                            var fil = $(this).text();
                            fil = fil.replace(/'/g, "&apos;");
                            $("" + selecteurResultat + " span[class*=clozeCibles]").each(function (index) {
                                if ($(this).attr("depot") == fil) {
                                    $(this).attr("depot", "");
                                }
                            });
                            if (!(element.hasClass("clozeListeMots"))) {
                                $(element).attr("depot", fil);
                            }
                            return false;
                        }
                    }
                },
                containment: selecteurResultat
            });
            $("" + selecteurResultat + " span[class*=clozeCibles]").droppable({
                accept: "" + selecteurResultat + " .clozeObj"
                    /*out: function(event, ui){
                    		if(ui.draggable.text()==$(this).attr("depot")){
                    			$(this).attr("depot","");
                    		}
                    	}
                    */
            });
            $("" + selecteurResultat + " .clozeListeMots").droppable({
                accept: "" + selecteurResultat + " .clozeObj"
            });
       
         //   $("" + selecteurResultat + " input[class*=clozeCibles]")
         //       .change(function () {
         //          $("" + selecteurResultat).val($(selecteurDuContener).html());
         //       });
        
    }
    this.correction = function () {
        this.max = 0;
        this.note = 0;
        var note = 0;
        var max = 0;
        
			//$("" + selecteurResultat + " .clozeListeMots").hide();
            $("" + selecteurResultat + " span[class*=clozeCible]").each(function (index) {
                max += 1;
                $(this).text($(this).attr("depot").replace(/&apos;/g, "'"));
                if ($(this).attr("attendu") == $(this).attr("depot")) {
                    note += 1;
                    $(this).removeClass("clozeCibles");
                    $(this).addClass("clozeCorrect");
                } else {
                    $(this).removeClass("clozeCibles");
                    $(this).addClass("clozeIncorrect");
                }
                $("" + selecteurResultat + " .clozeObj:contains("+$(this).attr("depot").replace(/&apos;/g, "'")+")").remove();
            });

            $("" + selecteurResultat + " .clozeInput").each(
                function (index) {
                    max += 1;
                    var tata = $(this).attr("attendu");
                    var txt_regvar = new RegExp($(this).attr("attendu"), "i");
                    var toto = $(this).val();
                    var test = txt_regvar.test($(this).val());
                    if (txt_regvar.test($(this).val())) {
                        note += 1;
                        $(this).addClass("clozeCorrect");
                    } else {
                        $(this).addClass("clozeIncorrect");
                    }
                });
        
        
        this.note = note;
        this.max = max;
        var zoneResult=$(selecteurResultat).parents(".page").find("[id*=noteq]").attr("id");
        zoneResult=zoneResult.substring(4);
        note_globale += parseFloat(note);
        note_max += parseFloat(max);
        afficheNote(zoneResult, note);
        afficheNote(zoneResult + "max", max);
        return this.note + "/" + this.max;
    }
	}