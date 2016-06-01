$("#boite24 .refresh").on("click", function(evt) { $("#boite24").trigger("refresh"); });
$("#boite24").on("click", ".firstAdd", function(evt) {
    evt.stopPropagation();
    var html = '<span class="dvMq new"  style="display: block; border: medium none;" latex=""></span><img class="supp" src="https://coursdesciences.fr/devoirTest/noENT/API4/img/smallSupp.png" title="Supprimer la ligne">';
    $("#dvMath24").prepend(html);
    $("#dvMath24 .new").trigger("newDvMq");
    $("#dvMath24 .new").find("textarea").trigger("focus");
    $("#dvMath24 .new").removeClass("new");
});
$("#science24").on("change", function(evt) { $("#boite24").trigger("change"); });
$("#boite24").on("save", function(evt) {
    var txt = encodeURI($("#dvMath24").html());
    $("#science24").val(txt);
});
$("#boite24").on("change", function(evt) {
    var etat = $(this).parent(".question").css("display");
    $(this).parent(".question").show();
    if ($("#boite24").attr("statu") == "modifiable") {
        $("#dvMath24").html(decodeURI($("#science24").val()));
        $("#boite24").trigger("refresh");
    }
    $(this).parent(".question").css("display", etat);
});
$("#boite24").on("refresh", function(evt) {
    $("#boite24 .supp,#boite24 .firstAdd,#boite24 .aide,#boite24 .refresh").hide();
    $("#dvMath24 .dvMq").each(function() {
        $(this).attr("class", "dvMq").text($(this).attr("latex"));
        if ((statu == "eleve" && !revoirDs && $("#boite24").attr("statu") == "modifiable") || (statu == "prof" && dv.modeEbauche && $("#boite24").attr("statu") != "modifiable")) { 
        	MQ.MathField(this) 
        } else { 
        	MQ.StaticMath(this) 
        }
    });
    if ((statu == "eleve" && !revoirDs && $("#boite24").attr("statu") == "modifiable") || (statu == "prof" && dv.modeEbauche && $("#boite24").attr("statu") != "modifiable")) {
        $("#boite24 .supp,#boite24 .firstAdd,#boite24 .aide,#boite24 .refresh").show();
        $("#dvMath24").off("newDvMq mousedown blur lostFocus focus click mouseenter mouseleave keydown");
        $("#dvMath24").on("newDvMq", ".dvMq", function(evt) { 
        	MQ.MathField(this) 
        });
        $("#dvMath24").on("mousedown click", ".dvMq", function(evt) { 
        	evt.stopPropagation(); 
        });
        $("#dvMath24").on("blur", ".dvMq textarea", function(evt) {
        	$(this).parent().parent().parent().trigger("lostFocus") 
        });
        $("#dvMath24").on("lostFocus", function(evt) {
            if ($("#dvMath24 .mq-focused").length == 0) { 
            	$("#dvMath24").addClass("dvFocused"); 
            } else {
                $("#dvMath24").removeClass("dvFocused");
                $("#dvMath24 .dvMq").each(function() { 
                	$(this).attr("latex", MQ.MathField(this).latex()) 
                });
            }
        });
        $("#dvMath24").on("focus", ".dvMq textarea", function(evt) { 
        	$(this).parent().parent().parent().trigger("hasFocus") 
        });
        $("#dvMath24").on("hasFocus", function(evt) { 
        	$("#boite24").addClass("dvFocused"); 
        });
        $("#dvMath24").on("click", ".supp", function(evt) {
            $(this).prev().remove();
            $(this).remove();
        });
        $("#dvMath24").on("mouseenter", ".supp", function(evt) { 
        	$(this).prev().css("background-color", "rgb(221, 142, 136)") 
        });
        $("#dvMath24").on("mouseleave", ".supp", function(evt) { 
        	$(this).prev().css("background-color", "") 
        });
        $("#dvMath24").on("keydown", ".dvMq", function(event) {
            event.stopPropagation();
            if (event.which == 13) {
                var html = '<span class="dvMq"  style="display: block; border: medium none;" latex=""></span><img class="supp" src="https://coursdesciences.fr/devoirTest/noENT/API4/img/smallSupp.png" title="Supprimer la ligne">';
                $(this).next().after(html);
                $(this).next().next().trigger("newDvMq");
                $(this).next().next().find("textarea").trigger("focus");
            }
        });
        $("#boite24 .aide").off("click");
        $("#boite24 .aide").on("click", function(evt) {
            $("#aide").load("https://coursdesciences.fr/devoir/outils/aide_mathQuill.html");
            $("#aide").dialog({ position: { my: "left center", at: "right top", of: this }, width: 410 });
            $("#aide").dialog("open");
        });
    }
    //$(".question").hide();
    //$("#page").parent().show();
});
