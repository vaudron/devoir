var Correction = function (ebauche) {
    // setUI est une fonction qui définit l'interface de paramétrage de la correction qui sera affiché dans #menuCorrection
    this.ebauche = ebauche; //objet de type "createPage"
    this.setUI = function (event) {
        var type = $(event).attr("type");
        switch (type) {
        case "text":
            {
                var id = $(event).attr("id");
                var boite = "Text" + id.substring(5);
                $("#" + id).find("boite").text(boite);
                var iff = $("#" + id).find("if").text();
                var bareme = $("#" + id).find("bareme").text();
                var note = $("#" + id).find("note").text();
                var view = $("#page span[id*=q]").attr("id");
                $("#" + id).find("view").text(view);
                var comment = $("#" + id).find("comment").text();
                var code = $("#" + id).find("code").text();
                var manuel = $("#" + id).find("manuel").text();
                $.ajax({
                    async: false,
                    url: site+API+"/correction/type_text.html",
                    dataType: "html",
                    success: function (data) {
                        $("#menuCorrection").html(data);
                    }
                });
                //$("#menuCorrection").load("/devoir/API4/correction/type_text.html");
                if (manuel.length > 0) {
                    $("#menuCorrection #mcEm").click();
                }
                $("#menuCorrection #mcManuel").val(manuel.substring(6));
                var tabRegExp = iff.split(/#;#/g);
                var tabComment = comment.split(/#;#/g);
                var tabNote = note.split(/;/g);
                $("#menuCorrection #mcGroupe").val(manuel);
                var boucle = tabNote.length;
                $("#menuCorrection #mcBareme").val(bareme);
                $("#menuCorrection #mcComment").val(tabComment[0]);
                $("#" + tabComment[0]).addClass("incorrect");
                $("#menuCorrection #mcRegExp0").val(tabRegExp[0]);
                for (var t = 1; t < boucle; t++) {
                    var html = '<div class="etape"><img src="/devoir/API4/correction/img/algo.svg"><div id="testindice" class="test rouge">?</div><div id="mcRegindice" class="reg"><span>Expression régulière</span><textarea  id="mcRegExpindice" class="regExp">//i</textarea></div><div class="param"><span>note : </span><input class="note text_eleve" type="number" step="0.1" min="0"   id="mcNoteindice" style="width:50px;text-align:center;height:1.8em;"><p>commentaire :</p><p><textarea id="mcCommentaireindice" class="commentaire" style="width: 250px;height: 56px;"></textarea></p></div><div id="mcSupindice" class="sup"><img  src="https://coursdesciences.fr/devoir/API4/delete16.png"> </div> </div>';
                    html = html.replace(/indice/g, "" + t);
                    $("#menuCorrection #mcTriable").append(html);
                    $("#menuCorrection #mcRegExp" + t).val(tabRegExp[t]);
                    $("#menuCorrection #mcNote" + t).val(tabNote[t]);
                    $("#menuCorrection #mcCommentaire" + t).val(tabComment[t]);
                }
                //$("#menuCorrection .reg textarea").trigger("mouseleave");
                this.control("text");
                break;
            }
        case "case":
            {
                var id = $(event).attr("id");
                var boite = "case" + id.substring(5);
                $("#" + id).find("boite").text(boite);
                var iff = $("#" + id).find("if").text();
                var penalite = $("#" + id).find("penalite").text();
                var note = $("#" + id).find("note").text();
                var view = $("#page span[id*=q]").attr("id");
                $("#" + id).find("view").text(view);
                var comment = $("#" + id).find("comment").text();
                var code = $("#" + id).find("code").text();
                $.ajax({
                    async: false,
                    url: site+API+"/correction/type_case.html",
                    dataType: "html",
                    success: function (data) {
                        $("#menuCorrection").html(data);
                    }
                });
                $("#menuCorrection #mcComment").val(comment);
                $("#" + comment).addClass("incorrect");
                $("#menuCorrection #mcNote").val(note);
                $("#menuCorrection #mcPenalite").val(penalite);
                if (iff == "c") {
                    $("#menuCorrection #mcCoche").prop("checked", true);
                }
                break;
            }
        case "radio":
            {
                var id = $(event).attr("id");
                var boite = "case" + id.substring(5);
                $("#" + id).find("boite").text(boite);
                var iff = $("#" + id).find("if").text();
                var note = $("#" + id).find("note").text();
                var view = $("#page span[id*=q]").attr("id");
                $("#" + id).find("view").text(view);
                var comment = $("#" + id).find("comment").text();
                var code = $("#" + id).find("code").text();
                $.ajax({
                    async: false,
                    url: site+API+"/correction/type_radio.html",
                    dataType: "html",
                    success: function (data) {
                        $("#menuCorrection").html(data);
                    }
                });
                $("#menuCorrection #mcComment").val(comment);
                if (comment != "") {
                    $("#" + comment).addClass("incorrect");
                }
                $("#menuCorrection #mcNote").val(note);
                if (iff == "c") {
                    $("#menuCorrection #mcCoche").prop("checked", true);
                }
                break;
            }
        case "drop":
            {
                var id = $(event).attr("id");
                var boite = "boite" + id.substring(5);
                $("#" + id).find("boite").text(boite);
                var iff = $("#" + id).find("if").text();
                var note = $("#" + id).find("note").text();
                var view = $("#page span[id*=q]").attr("id");
                $("#" + id).find("view").text(view);
                var comment = $("#" + id).find("comment").text();
                var code = $("#" + id).find("code").text();
                $.ajax({
                    async: false,
                    url: site+API+"/correction/type_drop.html",
                    dataType: "html",
                    success: function (data) {
                        $("#menuCorrection").html(data);
                    }
                });
                $("#menuCorrection #mcComment").val(comment);
                $("#" + comment).addClass("incorrect");
                $("#menuCorrection #mcNote").val(note);
                var tab = iff.split(",");
                $("#mcDrags").val(tab).trigger("change");
                break;
            }

        case "text_selectable":
            {

                $.ajax({
                    async: false,
                    url: site+API+"/correction/type_txt_selectable.html",
                    dataType: "html",
                    success: function (data) {
                        $("#menuCorrection").html(data);
                    }
                });
                $("#mccorrige").on("change", function (evt) {
                    var id = $(maPage.selection.objets[0]).attr("id");
                    if ($("#" + id + " iff").html() == "") {
                        $("#mccorrige").html($("#meCorrige").html());
                    } else {
                        $("#mccorrige").html($("#" + id + " iff").html());
                        $("#mccorrige input").each(function () {
                            $(this).val($(this).attr("val"));
                        });
                    }
                    if ($("#" + id + ">span").attr("mode") != "modif") {
                        $("#mccorrige input").hide();
                    } else {
                        $("#mccorrige span").find("input").show();
                    }
                });
                $("#mccorrige").trigger("change");
                $(maPage.selection.objets[0]).find("iff").trigger($(maPage.selection.objets[0]).attr("id") + "corrige");
            }
        }
        return;
    }
    this.setCode = function (event) {
        //var type = $(event).attr("type");
        switch (event) {
        case "text":
            {
                var id = $(this.ebauche.selection.objets[0]).attr("id");
                var boite = "Text" + id.substring(5);
                var view = $("#page span[id*=q]").attr("id");
                var bareme = $("#menuCorrection #mcBareme").val();
                var txt = "";
                var tabRegExp = [];
                var tabComment = [];
                var tabNote = [];
                $("#" + id).find("manuel").text("");
                $("#menuCorrection .regExp").each(function (index) {
                    if (index != 0) {
                        txt += "#;#"
                    }
                    txt += $(this).val();
                    tabRegExp[index] = $(this).val();
                });
                $("#" + id).find("if").text(txt);
                $("#" + id).find("bareme").text(bareme);
                txt = "" + bareme;
                tabNote[0] = bareme;
                $("#menuCorrection .note").each(function (index) {
                    txt += ";";
                    txt += $(this).val();
                    tabNote[index + 1] = $(this).val();
                });
                $("#" + id).find("note").text(txt);
                txt = "";
                $("#menuCorrection .commentaire").each(function (index) {
                    if (index != 0) {
                        txt += "#;#"
                    }
                    txt += $(this).val();
                    tabComment[index] = $(this).val();
                });
                $("#" + id).find("comment").text(txt);
                if (event == "manuel") {
                    var groupe = "manuel" + $("#menuCorrection #mcManuel").val();
                    $("#" + id).find("manuel").text(groupe);
                    txt = 'evaluateManuel("' + boite + '","' + groupe + '",' + bareme + ',"' + view + '","' + tabComment[0] + '")';
                    $("#" + id).find("code").text(txt);
                } else {
                    if (this.control("text")) {
                        var boucle = tabNote.length;
                        var txt = "";
                        var txtFin = ""
                        for (var t = 0; t < boucle; t++) {
                            var baremm = (t == 0) ? bareme : 0;
                            txt += 'if(!evaluateExpReg("' + boite + '",' + tabRegExp[t] + ',' + baremm + ',' + tabNote[t] + ',"' + view + '","' + tabComment[t] + '")){';
                            txtFin += '}';
                            $("#" + id).find("code").text(txt + txtFin);
                        }
                    }
                }
                break;
            }
        case "manuel":
            {
                var id = $(this.ebauche.selection.objets[0]).attr("id");
                var boite = "Text" + id.substring(5);
                var view = $("#page span[id*=q]").attr("id");
                var bareme = $("#menuCorrection #mcBareme").val();
                var comment = $("#menuCorrection #mcComment").val();
                $("#" + id).find("bareme").text(bareme);
                $("#" + id).find("comment").text(comment);
                var groupe = "manuel" + $("#menuCorrection #mcManuel").val();
                $("#" + id).find("manuel").text(groupe);
                txt = 'evaluateManuel("' + boite + '","' + groupe + '",' + bareme + ',"' + view + '","' + comment + '")';
                $("#" + id).find("code").text(txt);

                break;
            }
        case "case":
            {
                var id = $(this.ebauche.selection.objets[0]).attr("id");
                var groupe = $("#" + id).attr("groupe");
                if (groupe == "") {
                    alert("Attention votre case à cocher appartient à aucun groupe. Veuillez d'abord en définir un dans l'onglet ébauche")
                }
                var boite = "case" + id.substring(5);
                var view = $("#page span[id*=q]").attr("id");
                var penalite = $("#menuCorrection #mcPenalite").val();
                var note = $("#menuCorrection #mcNote").val();
                var comment = $("#menuCorrection #mcComment").val();
                var etat = $("#" + id).find("if").text();
                var code = 'evaluateCheckBox("' + boite + '","' + groupe + '","' + etat + '",' + note + ',' + penalite + ',"' + view + '","' + comment + '");';
                var etat = $("#" + id).find("code").text(code);
                break;
            }
        case "radio":
            {
                var id = $(this.ebauche.selection.objets[0]).attr("id");
                var boite = "case" + id.substring(5);
                var view = $("#page span[id*=q]").attr("id");
                var note = $("#menuCorrection #mcNote").val();
                var comment = $("#menuCorrection #mcComment").val();
                var etat = $("#" + id).find("if").text();
                var code = 'evaluateRatioButton("' + boite + '","' + etat + '",' + note + ',' + note + ',"' + view + '","' + comment + '");';
                var etat = $("#" + id).find("code").text(code);
                break;
            }
        case "drop":
            {
                var id = $(this.ebauche.selection.objets[0]).attr("id");
                var boite = "boite" + id.substring(5);
                $("#" + id).find("boite").text(boite);
                var iff = $("#" + id).find("if").text();
                var note = $("#" + id).find("note").text();
                var view = $("#page span[id*=q]").attr("id");
                $("#" + id).find("view").text(view);
                var comment = $("#" + id).find("comment").text();
                var code = 'evaluateDrop("' + boite + '","' + iff + '",' + note + ',"' + view + '","' + comment + '");';
                $("#" + boite + " code").text(code);
                /*
                var tab = iff.split(",");
                for(var t=0;t<tab.length;t++){
                    var myExpReg=new RegExp(tab[t],"i");
                    if(evaluateDrop(boite, expR, bareme, note, zoneResult, commentaire))
                }
                evaluateTagByExpReg(tag, myExpReg, note/tab.length, note/tab.length, view, comment)
                */
                break;
            }
        }
    }
    this.removeUI = function () {
        $(".correct").removeClass("correct");
        $(".incorrect").removeClass("incorrect");
        return '<div style="font-size: 1.5em;text-align: center;">Gestion des paramètres liés à la correction</div><div style="position: relative;top: 50px;left: 50px;font-size: 1.2em;font-weight:bold;">Sélectionner un élément concerné par la correction...</div>';
    }
    this.control = function (type) {
        var retour = true;
        switch (type) {
        case "text":
            {
                $("#menuCorrection .reg").each(function (i) {
                    var note = parseFloat($(this).next().find("input").val());
                    var bareme = parseFloat($("#menuCorrection #mcBareme").val());
                    //console.log(note);
                    if (note > bareme) {
                        $(this).next().find("input").addClass("incorrect");
                        $(this).prev().removeClass("vert").addClass("rouge").text("?");
                        $(maPage.selection.objets[0]).find("code").text("");
                        retour = false;
                    } else {
                        $(this).next().find("input").removeClass("incorrect");


                        if ($(this).attr("id") == "mcReg0") {
                            if ($(this).find("textarea").val().length > 3) {
                                $(this).prev().removeClass("rouge").addClass("vert").text("OK");
                            } else {
                                $(this).prev().removeClass("vert").addClass("rouge").text("?");
                                $(maPage.selection.objets[0]).find("code").text("");
                                retour = false;
                            }
                        } else {
                            if ($(this).find("textarea").val().length > 3 && !isNaN(note)) {
                                $(this).prev().removeClass("rouge").addClass("vert").text("OK");
                            } else {
                                $(this).prev().removeClass("vert").addClass("rouge").text("?");
                                $(maPage.selection.objets[0]).find("code").text("");
                                retour = false;
                            }
                        }
                    }
                });
                break;
            }
        case "case":
            {
                $obj = maPage.selection.objets[0];

                break;
            }
        }
        return retour;
    }
}