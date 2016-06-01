//------------------------------------------------------------------------------------
//
//				OUTIL CRAYON
//
//------------------------------------------------------------------------------------
function Tool_crayonOn(ev) {
    $("#crayon").addClass("selectionne")
        .one("click", ev.data, Tool_crayonOff);
    $("#" + ev.data.canvas).css("z-index", "1002");
    //$(".point").draggable("disable");
    $("#" + ev.data.contener).mousedown(ev.data, crayonDown)
        .mouseup(ev.data, crayonUp);
    $("#suppTrace").css("display", "none");
}

function Tool_crayonOff(ev) {
    $("#crayon").removeClass("selectionne")
        .one("click", ev.data, Tool_crayonOn);
    $("#" + ev.data.canvas).css("z-index", "1000");
    //$(".point").draggable("enable");
    $("#suppTrace").css("display", "block");
    $("#" + ev.data.contener).off("mousedown");
    $("#" + ev.data.contener).off("mouseup");
    $("#" + ev.data.contener).off("mousemove");
}

function crayonDown(ev) {
    $("#" + ev.data.champ).val($("#" + ev.data.champ).val() + ev.offsetX + "," + ev.offsetY + "?");
    $("#" + ev.data.contener).mousemove(ev.data, crayonMove);
}

function crayonUp(ev) {
    var donnee = $("#" + ev.data.champ).val().split("?");
    $("#" + ev.data.champ).val(donnee[0] + ";" + ev.offsetX + "," + ev.offsetY + ":");
    $("#" + ev.data.contener).off("mousemove");
    traceMultiSegment(ev.data.champ, ev.data.canvas);

}

function crayonMove(ev) {
    // reconstitution des données...
    var donnee = $("#" + ev.data.champ).val().split("?");
    $("#" + ev.data.champ).val(donnee[0] + "?" + ev.offsetX + "," + ev.offsetY);
    traceMultiSegment(ev.data.champ, ev.data.canvas);
}

function traceMultiSegment(idChamp, idCanvas) {
    var canvas = document.getElementById(idCanvas);
    if ($("#" + idChamp) != "") {
        if (canvas.getContext) {
            context = canvas.getContext('2d');
            context.strokeStyle = 'blue';
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            var donnee = $("#" + idChamp).val().split(":");
            for (var t = 0; t < donnee.length; t++) {
                if (donnee[t] != "") {
                    var critere = /[;?]/;
                    var segment = donnee[t].split(critere);
                    point1 = segment[0].split(",");
                    point2 = segment[1].split(",");
                    context.moveTo(point1[0], point1[1]);
                    context.lineTo(point2[0], point2[1]);
                }
            }
            context.stroke();
        }
    }
}
//------------------------------------------------------------------------------------
//
//				interactivité des boites de type addMathAnswer
//
//------------------------------------------------------------------------------------
function interActAddMathAnswer(id) {
    $("#boite" + id).find(".refresh").on("click", function(evt) {
        $(this).parents("[id*=boite]").trigger("refresh");
        evt.stopPropagation();
    });
    $("#boite" + id).find(".firstAdd").on("click", function(evt) {
        var id = $(this).parents("[id*=boite]").attr("id").substring(5);
        evt.stopPropagation();
        var html = '<span class="dvMq new"  style="display: block; border: medium none;" latex=""></span><img class="supp" src="' + site + API + '/img/smallSupp.png" title="Supprimer la ligne">';
        $("#dvMath" + id).prepend(html);
        $("#dvMath" + id).find(".new").trigger("newDvMq");
        $("#dvMath" + id).find(".new").find("textarea").trigger("focus");
        $("#dvMath" + id).find(".new").removeClass("new");
    });
    $("#science" + id).on("change", function(evt) {
        var id = this.id.substring(7);
        $("#boite" + id).trigger("change");
    });
    $("#boite" + id)
        .on("save", function(evt) {
            var id = this.id.substring(5);
            $(this).find(".dvMq").each(function(){
            	$(this).html("");
            });
            var txt = encodeURI($("#dvMath" + id).html());
            $("#science" + id).val(txt);
            $(this).trigger("refresh");
        })
        .on("change", function(evt) {
            var id = this.id.substring(5);
            var etat = $(this).parent(".question").css("display");
            $(this).parent(".question").show();
            if ($("#boite" + id).attr("statu") == "modifiable") {
                $("#dvMath" + id).html(decodeURI($("#science" + id).val()));
            }
            mathAnswerRefresh(id);
            //$("#boite"+id).trigger("refresh");
            $(this).parent(".question").css("display", etat);
        })
        .on("refresh", function(evt) {
            var id = this.id.substring(5);
            mathAnswerRefresh(id);
            //$(".question").hide();
            //$("#page").parent().show();
        })
        .trigger('refresh');
}

function mathAnswerRefresh(id) {
    $("#boite" + id).find(".supp").hide();
    $("#boite" + id).find(".firstAdd").hide();
    $("#boite" + id).find(".aide").hide();
    $("#boite" + id).find(".refresh").hide();
    $("#dvMath" + id).find(".dvMq").each(function() {
    	$(this).off();
        $(this).attr("class", "dvMq").text($(this).attr("latex"));
        if ((statu == "eleve" && !revoirDs && $("#boite" + id).attr("statu") == "modifiable") || (statu == "prof" && dv.modeEbauche && $("#boite" + id).attr("statu") != "modifiable") || (statu == "prof" && !dv.modeEbauche && !dv.correctionOn && $("#boite" + id).attr("statu") == "modifiable")) {
            MQ.MathField(this)
        } else {
            MQ.StaticMath(this)
        }
    });
    if($("#boite" + id).attr("statu") == "modifiable"){
    	$("#boite" + id).addClass('dvOmbre');
    }
    if ((statu == "eleve" && !revoirDs && $("#boite" + id).attr("statu") == "modifiable") || (statu == "prof" && dv.modeEbauche && $("#boite" + id).attr("statu") != "modifiable") || (statu == "prof" && !dv.modeEbauche && !dv.correctionOn && $("#boite" + id).attr("statu") == "modifiable")) {
        //$("#boite"+id).find(".supp").show();
        //$("#boite"+id).find(".firstAdd").show();
        //$("#boite"+id).find(".aide").show();
        //$("#boite"+id).find(".refresh").show();
        $("#boite" + id).off("blur lostFocus focus");
        $("#dvMath" + id).off("newDvMq mousedown click mouseenter mouseleave keydown");
        $("#dvMath" + id).on("newDvMq", ".dvMq", function(evt) {
            MQ.MathField(this)
        });
        $("#dvMath" + id).on("mousedown click", ".dvMq", function(evt) {
            evt.stopPropagation();
        });
        $("#dvMath"+id).on("click",function(evt){
        	evt.stopPropagation();
    		$(this).parents("[id*=boite]").trigger("hasFocus");
    	});
        //$("#boite"+id).on("blur", ".dvMq textarea", function(evt) {
        //$(this).parents("[id*=boite]").trigger("lostFocus");
        //});
        $("#boite" + id).on("lostFocus", function(evt) {
            //if ($("#dvMath"+id).find(".mq-focused").length == 0) {
            //    $("#dvMath"+id).addClass("dvFocused");
            //} else {
            //    $("#dvMath"+id).removeClass("dvFocused");
            $("#dvMath" + id).find(".dvMq").each(function() {
                $(this).attr("latex", MQ.MathField(this).latex())
            });
            //$("#boite" + id).removeClass('dvFocused');
            $("#boite" + id).find(".supp").hide();
            $("#boite" + id).find(".firstAdd").hide();
            $("#boite" + id).find(".aide").hide();
            $("#boite" + id).find(".refresh").hide();
            $("#boite" + id).trigger("save");
            //}
        });
        //$("#dvMath"+id).on("focus", ".dvMq textarea", function(evt) {
        //    $(this).parent().parent().parent().trigger("hasFocus")
        //});
        $("#boite" + id).on("focus", ".dvMq textarea", function(evt) {
            $(this).parents("[id*=boite]").trigger("hasFocus")
        });
        $("#boite" + id)
            .on("hasFocus", function(evt) {
                //$("#boite" + id).addClass("dvFocused");
                $("#boite" + id).find(".supp").show();
                $("#boite" + id).find(".firstAdd").show();
                $("#boite" + id).find(".aide").show();
                $("#boite" + id).find(".refresh").show();
            })
            .on("mouseenter", ".dvMq", function(evt) {
                $(this).css("background-color", "rgb(136, 187, 221)");
            })
            .on("mouseleave", ".dvMq", function(evt) {
                $(this).css("background-color", "");
            });
        $("#dvMath" + id).on("click", ".supp", function(evt) {
            $(this).prev().remove();
            $(this).remove();
        });
        $("#dvMath" + id).on("mouseenter", ".supp", function(evt) {
            $(this).prev().css("background-color", "rgb(221, 142, 136)")
        });
        $("#dvMath" + id).on("mouseleave", ".supp", function(evt) {
            $(this).prev().css("background-color", "")
        });
        $("#dvMath" + id).on("keydown", ".dvMq", function(event) {
            event.stopPropagation();
            if (event.which == 13) {
                var html = '<span class="dvMq"  style="display: block; border: medium none;" latex=""></span><img class="supp" src="' + site + API + '/img/smallSupp.png" title="Supprimer la ligne">';
                $(this).next().after(html);
                $(this).next().next().trigger("newDvMq");
                $(this).next().next().find("textarea").trigger("focus");
            }
        });
        $("#boite" + id).find(".aide").off("click");
        $("#boite" + id).find(".aide").on("click", function(evt) {
            $("#aide").load(site + API + "/outils/aide_mathQuill.html");
            $("#aide").dialog({
                position: {
                    my: "left center",
                    at: "right top",
                    of: this
                },
                width: 500
            });
            $("#aide").dialog("open");
        });
    }
    if ($("#boite" + id).find(".dvMq").length < 1) {
        $("#boite" + id).find(".firstAdd").click();
    }
    $("#boite" + id).on("click", function(evt) {
        evt.stopPropagation();
    });
}
