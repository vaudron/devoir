// version4 API4
var dv = {
    modeEbauche: false,
    enteteHtml: '<!DOCTYPE html>' + '<html>' + '<head>' + '<meta content="text/html; charset=utf-8" http-equiv="content-type">' + '<title>question de type cloze</title>' + '<script src="../../API4/jquery.min.js"></script>' + '<link rel="stylesheet" href="../../API4/jquery-ui.css">' + '<script src="../../API4/jquery-ui.min.js"></script>' + '<link href="../../API4/defaut.css" rel="stylesheet" type="text/css" />' + '<link href="temp.css" rel="stylesheet" type="text/css" />' + '<script src="TypeExo.js"></script>' + '<style type="text/css">' + 'div { padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;}' + '.page {position:absolute;}' + '</style>' + '</head>' + '<body>' + '<div id="Q1" style="float: right;padding: 20px;"></div><div class="page choices-border questionid">',
    piedHtml: '</div></body></html>'
};
//jQuery.getScript("https://coursdesciences.fr/devoir/createDevoir/DVinit.js");
var selected = function() {
    'use strict';
    this.objets = [];
    // méthode returnIds() retourne tous les id des éléments sélectionnés dans un format qui dépend du paramètre 'type' (string,...)
    this.returnIds = function(type) {
            if (type === "string") {
                var all = "";
                for (var obj in this.objets) {
                    all += " " + ($(obj).attr("id"));
                }
                return all;
            } else {
                return undefined;
            }
        }
        // méthode pour tester la présence d'un objet dans l'objet sélection 'objets'
    this.isInObjets = function(obj) {
            var longueur = this.objets.length;
            var id = $(obj).attr("id");
            for (var t = 0; t < longueur; t++) {
                if ($(this.objets[t]).attr("id") == id) {
                    return true
                }
            }
            return false;
        }
        // méthode pour ajouter un objet à la sélection   
    this.addObjet = function(obj) {
            if (!this.isInObjets(obj)) {
                this.objets.push(obj);
                $(obj).addClass("selected");
            }
        }
        // méthode removeObjet(obj) supprime de this.objets l'objet passé en paramètre
    this.removeObjet = function(obj) {
            var longueur = this.objets.length;
            var id = $(obj).attr("id");
            for (var t = 0; t < longueur; t++) {
                if ($(this.objets[longueur - 1]).attr("id") == id) {
                    this.objets.pop();
                    break;
                } else {
                    this.objets.unshift(this.objets[longueur - 1]);
                    this.objets.pop();
                }
            }
            if (this.objets.length == 0) {
                $("#menuEbauche").html(maPage.removeUIEbauche());
                $("#menuCorrection").html(corrige.removeUI());
            }
        }
        // méthode pour tout désélectionner
    this.removeAll = function() {
            this.objets = [];
            $(".selected").removeClass("selected");
            $("#menuEbauche").html(maPage.removeUIEbauche());
            $("#menuCorrection").html(corrige.removeUI());
        }
        // méthode setOrinalPosition() place dans data de chaque élement le top el left de l'élément dans this.objets
    this.setOriginalPosition = function(taille) {
            var longueur = this.objets.length;
            for (var t = 0; t < longueur; t++) {
                var $element = $(this.objets[t]);
                var temp = /(.*)px/.test($element.css("top"));
                var top = parseInt(RegExp.$1);
                temp = /(.*)px/.test($element.css("left"));
                var left = parseInt(RegExp.$1);
                $element.data("originalPosition", {
                    top: top,
                    left: left
                });
            }
        }
        // methode qui uniformise les dimentions des objets dans sélection
    this.setDimension = function(taille) {
            var longueur = this.objets.length;
            for (var t = 0; t < longueur; t++) {
                var $element = $(this.objets[t]);
                $("#" + $element.attr("id")).css("width", taille.width);
                $("#" + $element.attr("id")).css("height", taille.height);
            }
        }
        // méthode qui aligne les élénents de la lélection par rappot au premier sélectionné
    this.align = function(direction) {
        var parentId = $(this.objets[0]).parent().attr("id");
        for (var t = 0; t < this.objets.length; t++) {
            if ($(this.objets[t]).parent().attr("id") != parentId) {
                $(this.objets[t]).removeClass("selected");
                this.removeObjet(this.objets[t]);
            }
        }
        switch (direction) {
            case "left":
                var longueur = this.objets.length;
                var positionLeft = $(this.objets[0]).css("left");
                for (var t = 1; t < longueur; t++) {
                    $(this.objets[t]).css("left", positionLeft);
                }
                break;
            case "right":
                var longueur = this.objets.length;
                var positionRight = parseInt($(this.objets[0]).css("left").replace(/px/, "")) + parseInt($(this.objets[0]).css("width").replace(/px/, ""));
                for (var t = 1; t < longueur; t++) {
                    var left = parseInt($(this.objets[t]).css("left").replace(/px/, ""));
                    var width = parseInt($(this.objets[t]).css("width").replace(/px/, ""));
                    var decalage = (positionRight - (left + width));
                    $(this.objets[t]).css("left", (left + decalage) + "px");
                }
                break;
            case "bottom":
                var longueur = this.objets.length;
                var positionBottom = parseInt($(this.objets[0]).css("top").replace(/px/, "")) + parseInt($(this.objets[0]).css("height").replace(/px/, ""));
                for (var t = 1; t < longueur; t++) {
                    var top = parseInt($(this.objets[t]).css("top").replace(/px/, ""));
                    var height = parseInt($(this.objets[t]).css("height").replace(/px/, ""));
                    var decalage = (positionBottom - (top + height));
                    $(this.objets[t]).css("top", (top + decalage) + "px");
                }
                break;
            case "top":
                var longueur = this.objets.length;
                var positionTop = $(this.objets[0]).css("top");
                for (var t = 1; t < longueur; t++) {
                    $(this.objets[t]).css("top", positionTop);
                }
                break;
        }
    }
    this.ajust = function(direction) {
        var parentId = $(this.objets[0]).parent().attr("id");
        for (var t = 0; t < this.objets.length; t++) {
            if ($(this.objets[t]).parent().attr("id") != parentId) {
                $(this.objets[t]).removeClass("selected");
                this.removeObjet(this.objets[t]);
            }
        }
        var longueur = this.objets.length;
        if (longueur > 1) {
            switch (direction) {
                case "vertical":
                    var hauteurPris = 0;
                    var hauteurDispo = 0;
                    var espace = 0;
                    // tri par ordre croissant des objets en fonction de la position top
                    for (var t = 1; t < longueur; t++) {
                        if (parseInt($(this.objets[t]).css("top").replace(/px/, "")) < parseInt($(this.objets[t - 1]).css("top").replace(/px/, ""))) {
                            var ref = parseInt($(this.objets[t]).css("top").replace(/px/, ""));
                            for (var i = 0; i < t; i++) {
                                if (parseInt($(this.objets[i]).css("top").replace(/px/, "")) > ref) {
                                    //placement de l'objet
                                    if (i == 0) {
                                        this.objets.unshift(this.objets[t]);
                                        this.objets.splice(t + 1, 1);
                                    } else {
                                        var tabTemp = this.objets.slice(0, i);
                                        tabTemp.push(this.objets[t]);
                                        //this.objets.splice(t, 1)
                                        var tabTempFin = this.objets.slice(i, t);
                                        tabTemp = tabTemp.concat(tabTempFin);
                                        if (longueur - 1 - t > 0) {
                                            tabTempFin = this.objets.slice(t + 1, longueur);
                                            tabTemp = tabTemp.concat(tabTempFin);
                                        }
                                        this.objets = tabTemp;
                                    }
                                    break;
                                }

                            }
                        }
                    }
                    for (var t = 0; t < longueur; t++) {
                        hauteurPris += parseInt($(this.objets[t]).css("height").replace(/px/, ""));
                    }
                    hauteurDispo = (parseInt($(this.objets[longueur - 1]).css("height").replace(/px/, "")) + parseInt($(this.objets[longueur - 1]).css("top").replace(/px/, ""))) - parseInt($(this.objets[0]).css("top").replace(/px/, ""));
                    espace = Math.round((hauteurDispo - hauteurPris) / (longueur - 1));
                    var position = parseInt($(this.objets[0]).css("top").replace(/px/, "")) + parseInt($(this.objets[0]).css("height").replace(/px/, ""));
                    for (var t = 1; t < longueur - 1; t++) {
                        var newTop = position + espace;
                        $(this.objets[t]).css("top", newTop + "px");
                        position = newTop + parseInt($(this.objets[t]).css("height").replace(/px/, ""));
                    }
                    break;
                case "horizontal":
                    var largeurPris = 0;
                    var largeurDispo = 0;
                    var espace = 0;
                    // tri par ordre croissant des objets en fonction de la position left
                    for (var t = 1; t < longueur; t++) {
                        if (parseInt($(this.objets[t]).css("left").replace(/px/, "")) < parseInt($(this.objets[t - 1]).css("left").replace(/px/, ""))) {
                            var ref = parseInt($(this.objets[t]).css("left").replace(/px/, ""));
                            for (var i = 0; i < t; i++) {
                                if (parseInt($(this.objets[i]).css("left").replace(/px/, "")) > ref) {
                                    //placement de l'objet
                                    if (i == 0) {
                                        this.objets.unshift(this.objets[t]);
                                        this.objets.splice(t + 1, 1);
                                    } else {
                                        var tabTemp = this.objets.slice(0, i);
                                        tabTemp.push(this.objets[t]);
                                        //this.objets.splice(t, 1)
                                        var tabTempFin = this.objets.slice(i, t);
                                        tabTemp = tabTemp.concat(tabTempFin);
                                        if (longueur - 1 - t > 0) {
                                            tabTempFin = this.objets.slice(t + 1, longueur);
                                            tabTemp = tabTemp.concat(tabTempFin);
                                        }
                                        this.objets = tabTemp;
                                    }
                                    break;
                                }

                            }
                        }
                    }
                    for (var tt = 0; tt < longueur; tt++) {
                        largeurPris += parseInt($(this.objets[tt]).css("width").replace(/px/, ""));
                        // trouver l'objet le plus à gauche et celui le plus à droite
                    }

                    largeurDispo = (parseInt($(this.objets[longueur - 1]).css("width").replace(/px/, "")) + parseInt($(this.objets[longueur - 1]).css("left").replace(/px/, ""))) - parseInt($(this.objets[0]).css("left").replace(/px/, ""));
                    espace = Math.round((largeurDispo - largeurPris) / (longueur - 1));
                    var position = parseInt($(this.objets[0]).css("left").replace(/px/, "")) + parseInt($(this.objets[0]).css("width").replace(/px/, ""));
                    for (var t = 1; t < longueur - 1; t++) {
                        var newLeft = position + espace;
                        $(this.objets[t]).css("left", newLeft + "px");
                        position = newLeft + parseInt($(this.objets[t]).css("width").replace(/px/, ""));
                    }
                    break;
            }
        }
    }
}
var selecteur = function() {
    this.initialW = 0;
    this.initialH = 0;
    this.openSelector = function(e) {
        var w = Math.abs(this.initialW - e.pageX);
        var h = Math.abs(this.initialH - e.pageY);

        $(".ghost-select").css({
            'width': w,
            'height': h
        });
        if (e.pageX <= this.initialW && e.pageY >= this.initialH) {
            $(".ghost-select").css({
                'left': e.pageX
            });
        } else if (e.pageY <= this.initialH && e.pageX >= this.initialW) {
            $(".ghost-select").css({
                'top': e.pageY
            });
        } else if (e.pageY < this.initialH && e.pageX < this.initialW) {
            $(".ghost-select").css({
                'left': e.pageX,
                "top": e.pageY
            });
        }
    }
    this.doObjectsCollide = function(a, b) { // a and b are your objects
        //console.log(a.offset().top,a.position().top, b.position().top, a.width(),a.height(), b.width(),b.height());
        var aTop = a.offset().top;
        var aLeft = a.offset().left;
        var bTop = b.offset().top;
        var bLeft = b.offset().left;

        return !(
            ((aTop + a.height()) < (bTop)) ||
            (aTop > (bTop + b.height())) ||
            ((aLeft + a.width()) < bLeft) ||
            (aLeft > (bLeft + b.width()))
        );
    }
    this.selectElements = function(e) {
        var myCreatePage = e.data.objCreatePage;
        var mySelection = myCreatePage.selection;
        var mySelecteur = myCreatePage.selecteur;
        //$("#score>span").text('0');
        $("body").off("mousemove", mySelecteur.openSelector);
        $("body").off("mouseup", mySelecteur.selectElements);
        $("#page [id*=boite]").each(function() {
            var aElem = $(".ghost-select");
            var bElem = $(this);
            var result = mySelecteur.doObjectsCollide(aElem, bElem);
            if (result == true) {
                mySelection.addObjet(this);
            }
        });
        $(".ghost-select").removeClass("ghost-active");
        $(".ghost-select").width(0).height(0);
        if (mySelection.objets.length > 0) {
            maPage.setUIParameters(mySelection.objets[0]);
        }
    }
}
var CreatePage = function() {
    this.index = 1;
    this.firstParent = "";
    this.selection = new selected();
    this.copy = {}; //objet jQuery contenant la copie des sélections lors des ctrl+C , ctrl+X
    this.selecteur = new selecteur();
    var selectedObjs;
    var draggableOptions = {
        containment: "parent",
        snap: "#regleH,#regleV",
        snapMode: "outer",
        zIndex: 1000,
        //grid: [10, 10],
        start: $.proxy(function(event, ui) {
            //get all selected...
            //supprime les sections qui n'ont pas le même parent que event.target
            //et met à jour l'objet 'objets' de la variable selection
            var parentId = $(event.target).parent().attr("id");
            selectedObjs = $('.selected').filter('[id!=' + $(event.target).attr('id') + ']');
            for (var t = 0; t < selectedObjs.length; t++) {
                if ($(selectedObjs[t]).parent().attr("id") != parentId) {
                    $(selectedObjs[t]).removeClass("selected");
                    this.selection.removeObjet(selectedObjs[t]);

                }
            }
            selectedObjs = $('.selected').filter('[id!=' + $(event.target).attr('id') + ']');
            for (var t = 0; t < selectedObjs.length; t++) {
                $(selectedObjs[t]).data("originalPosition", $(selectedObjs[t]).position());
            }
            /*
            var coords = {
                clientX: event.clientX,
                clientY: event.clientY
            };
            $('.selected').filter('[id!=' + $(event.target).attr('id') + ']').simulate("drag", this);
            selectedObjs = [];
            */
        }, this),
        drag: function(event, ui) {
            var currentLoc = $(this).position();
            var orig = ui.originalPosition;

            var offsetLeft = currentLoc.left - orig.left;
            var offsetTop = currentLoc.top - orig.top;

            moveSelected(offsetLeft, offsetTop);
        },
        stop: $.proxy(function(event, ui) {
            this.selection.removeAll();
        }, this)
    };

    function moveSelected(ol, ot) {
        selectedObjs.each(function() {
            $this = $(this);
            //vérifier que l'élément ne sort pas du contener parent
            //dimension du contener
            var contentWidth = $this.parent().width();
            var contentHeight = $this.parent().height();
            var l = $this.data("originalPosition").left;
            var t = $this.data("originalPosition").top;
            var positionLeft = l + ol;
            var positionTop = t + ot;
            //espace libre sous $this et le bas du contener
            var freeDown = contentHeight - 2 - (positionTop + $this.height());
            //espace libre à droite de $this avec le contener
            var freeRight = contentWidth - 2 - (positionLeft + $this.width());
            positionLeft = (positionLeft < 0) ? 0 : positionLeft;
            positionLeft = (freeRight <= 0) ? contentWidth - 2 - $this.width() : positionLeft;
            positionTop = (positionTop < 0) ? 0 : positionTop;
            positionTop = (freeDown <= 0) ? contentHeight - 2 - $this.height() : positionTop;
            $this.css('left', positionLeft);
            $this.css('top', positionTop);
        })

    }
    this.init = function(txt) {
        this.firstParent = txt;
        this.index = this.returnMaxNumBoite();
        /*$("#" + this.firstParent).on("click", $.proxy(function (event) {
            if (event.which != 1) {
                this.selection.objets = [];
                $("#deselected").click();
            }
        }, this));*/
        $("#menu").sortable({
            axis: "x",
            helper: "clone",
            containment: "#menu",
            cursor: "eo-resize",
            revert: true,
            cancel: "#bouton0",
            stop: function(event, ui) {
                var ordre = $("#menu").sortable("toArray");
                if (ordre[0] == "bouton0") {
                    for (var t = 1; t < $("#questions [id*=question]").length; t++) {
                        if (ordre[t] != "bouton" + t) {
                            var positionDeplacer = ordre[t].substring(6);
                            $("#question" + (t - 1)).after($("#question" + positionDeplacer));
                            $("#bouton" + (positionDeplacer - 1)).after($("#bouton" + positionDeplacer));
                            $("#questions [id*=question]").each(function(index) {
                                $(this).attr("id", "question" + index);
                            })
                        }
                    }
                }
            }
        });
        $("body").on('keyup', $.proxy(function(event) {
            event.stopPropagation();
            var ctrlC = false;
            var ctrlV = false;
            var ctrlA = false;
            var ctrlX = false;
            if (event.ctrlKey) {
                switch (event.keyCode) {
                    case 67:
                        ctrlC = true;
                        this.copy = $(this.selection.objets).clone();
                        console.log("CTRL + C");
                        this.selection.removeAll();
                        break;
                    case 88:
                        ctrlX = true;
                        this.copy = $(this.selection.objets).clone();
                        for (var t = 0; t < this.selection.objets.length; t++) {
                            $(this.selection.objets[t]).remove();
                        }
                        this.selection.removeAll();
                        console.log("CTRL + X");
                        break;
                    case 86:
                        ctrlV = true;
                        var selecteur = "page";
                        var cop = $(this.copy).clone();
                        for (var t = 0; t < $(this.copy).length; t++) {
                            var indiceBoite = this.index;
                            var oldIndexBoite = $(cop[t]).attr("id").substring(5);
                            $(cop[t]).attr("id", "boite" + this.index);
                            this.index++;
                            var title = $(cop[t]).attr("title");
                            if (title != undefined) {
                                var html = $(cop[t]).html();
                                title = title.replace(oldIndexBoite, indiceBoite);
                                var myRegExp = new RegExp('' + oldIndexBoite, 'g');
                                html = html.replace(myRegExp, indiceBoite);
                                $(cop[t]).html(html).attr("title", title);
                            }
                            var obj = $(cop[t]).find("[id*=boite]");
                            for (var tt = 0; tt < obj.length; tt++) {
                                var indiceBoite1 = this.index;
                                var oldIndexBoite1 = $(obj[tt]).attr("id").substring(5);
                                $(obj[tt]).attr("id", "boite" + this.index);
                                this.index++;
                                var title = $(obj[tt]).attr("title");
                                if (title != undefined) {
                                    var html = $(obj[tt]).html();
                                    title = title.replace(oldIndexBoite1, indiceBoite1);
                                    var myRegExp = new RegExp('' + oldIndexBoite1, 'g');
                                    html = html.replace(myRegExp, indiceBoite1);
                                    $(obj[tt]).html(html).attr("title", title);
                                }
                            }
                            $(cop[t]).appendTo("#" + selecteur);
                            this.setInteractivite("#boite" + indiceBoite);
                            var obj2 = $("#boite" + indiceBoite + " [id*=boite]")
                            for (var ttt = 0; ttt < obj2.length; ttt++) {
                                this.setInteractivite("#" + $(obj2[ttt]).attr("id"));
                            }
                        }
                        this.selection.removeAll();
                        console.log("CTRL + V");
                        break;
                    case 65:
                        ctrlA = true;
                        console.log("CTRL + A");
                        break;
                }
            }
        }, this));
        $("#" + this.firstParent + " #page")
            .droppable({
                hoverClass: "hoverDroppable",
                tolerance: "fit",
                greedy: true,
                addClass: false,
                drop: $.proxy(function(event, ui) {
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
                }, this)
            })
            .on("mousedown", $.proxy(function(event) {
                if (!event.ctrlKey) {
                    $(".ghost-select")
                        .addClass("ghost-active")
                        .css({
                            'left': event.pageX,
                            'top': event.pageY
                        });

                    this.selecteur.initialW = event.pageX;
                    this.selecteur.initialH = event.pageY;

                    $("body").on("mouseup", null, {
                        objCreatePage: this
                    }, $.proxy(this.selecteur.selectElements, this.selecteur));
                    $("body").on("mousemove", $.proxy(this.selecteur.openSelector, this.selecteur));
                } else {
                    this.selection.removeAll();
                    $("#deselected").click();
                }
            }, this));
        $("#baliseDiv").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" class="unselectable  construction" style="position:absolute;left:0px;top:0px;width:150px;height:100px"><span></span></div>'
        }, $.proxy(this.addDiv, this));
        $("#deselected").on("click", $.proxy(function(event) {
            $(".selected").removeClass("selected");
            this.selection.removeAll();
        }, this));
        $("#addChekbox").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" type="case" groupe="" note="" penalite="" class="unselectable construction" style="position:absolute;left:0px;top:0px;width:150px"><div class="case"> <input id="caseindice" autocomplete="off" type="checkbox">' + '<label for="caseindice"> </label></div><span style="margin-left: 28px; display: inline-block;">contenu à définir</span><correction><boite></boite><if>nc</if><penalite>0.3</penalite><note>0</note><view></view><comment></comment><code></code></correction></div>'
        }, $.proxy(this.addDiv, this));
        $("#addRadio").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" type="radio" class="unselectable construction" type="radio" style="position:absolute;left:0px;top:0px;width:150px"><div class="case"> <input id="caseindice" name="groupe" autocomplete="off" type="radio">' + '<label for="caseindice"> </label></div><span style="margin-left: 28px; display: inline-block;">contenu à définir</span><correction><boite></boite><if>nc</if><bareme>0</bareme><note>0</note><view></view><comment></comment><manuel></manuel><code></code></correction></div>'
        }, $.proxy(this.addDiv, this));
        $("#addInputText").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" type="text" class="unselectable construction" style="position:absolute;left:0px;top:0px;width:150px;height:24px" title=""> <input id="Textindice" class="text_eleve" style="width: 85%;text-align:left; height: 70%;" autocomplete="off" type="text">' + '<span style="margin-left: 28px; display: inline-block;"></span><correction><boite></boite><if>//i</if><bareme>1</bareme><note></note><view></view><comment></comment><manuel></manuel><code></code></correction></div>'
        }, $.proxy(this.addDiv, this));
        $("#addTextarea").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" type="text" class="unselectable construction" style="position:absolute;left:0px;top:0px;width:150px;height:24px" title=""><textarea class="text_eleve" id="Textindice" autocomplete="off" style="width: 85%; height: 90%;"></textarea> ' + '<span style="margin-left: 28px; display: inline-block;"></span><correction><boite></boite><if>//i</if><bareme>1</bareme><note></note><view></view><comment></comment><manuel></manuel><code></code></correction></div>'
        }, $.proxy(this.addDiv, this));
        $("#addManuel").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" type="manuel" class="unselectable construction" style="position:absolute;left:0px;top:0px;width:24px;height:100px"><div id="evalProfindice"><div class="manuel"> <input value="100" name="manuelindice" id="manuelindicea" autocomplete="off" type="radio"> <label for="manuelindicea"> </label></div><div class="manuel"> <input value="75" name="manuelindice" id="manuelindiceb" autocomplete="off" type="radio"> <label for="manuelindiceb"> </label></div><div class="manuel"> <input value="50" name="manuelindice" id="manuelindicec" autocomplete="off" type="radio"> <label for="manuelindicec"> </label></div><div class="manuel"> <input value="25" name="manuelindice" id="manuelindiced" autocomplete="off" type="radio"> <label for="manuelindiced"> </label></div><div class="manuel"> <input value="0" name="manuelindice" id="manuelindicee" autocomplete="off"  type="radio"> <label for="manuelindicee"> </label></div></div>' + '<span style="margin-left: 28px; display: inline-block;"></span></div><scri' + 'pt>$("[id*=manuelindice]").change(eventEvaluateManuel);</scr' + 'ipt>'
        }, $.proxy(this.addDiv, this));
        $("#addZoneNote").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" class="unselectable construction" style="position:absolute;left:0px;top:0px;width: 75px;height: 61px;"><div id="noteqindice" class="noteExercice"><div class="noteExo"><span id="qindice">0</span></div><div class="noteExoMax"><span id="qindicemax">0</span></div><span class="noteExerciceBarre">/</span></div> ' + '<span style="margin-left: 28px; display: inline-block;"></span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addImage").on("click", null, {
            element: "boite",
            //codeHtml: '<div id="boiteindice" class="unselectable construction"  style="position: absolute; left: 0px; top: 0px; width: 152px; right: auto; bottom: auto;"><img src="dvData" width="100%" height="100%" id="imgindice"> </div>',
            //dvData: "src"
            codeHtml: '<div id="boiteindice" class=" dvimage unselectable  construction" style="position:absolute;left:0px;top:0px;width: 150px;height:150px; right: auto; bottom: auto;"><span></span><input id="clickImgindice" type="hidden" value="none"><script>$("#boiteindice").on("click",function(ev){$("#clickImgindice").val("ok");});$("#boiteindice").on("boiteImg",function(evt){$(this).find("img").removeAttr("style")});</script></div>'
        }, $.proxy(this.addDiv, this));
        $("#addCommentaire").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" class="commentaire unselectable  construction" style="position:absolute;left:0px;top:0px;width:150px;height:18px"><span>contenu à définir</span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addDrop").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindice" class="unselectable construction zoneDepot" type="drop" mode="unique" tentative="100" style="position:absolute;left:0px;top:0px;width:150px;height:150px;" depot=""><span></span><input style="display:none" id="dropindice" type="text"><correction><boite></boite><if></if><bareme>0</bareme><note>0</note><view></view><comment></comment><manuel></manuel><code></code></correction><script class="interactivite">$("#boiteindice").droppable({tolerance: "fit", drop: dropDrop ,out: dropOut});$("#dropindice").on("change",null,null,dropChange);</script></div>'
        }, $.proxy(this.addDiv, this));
        $("#addDrag").on("click", null, {
            element: "boite",
            type: "drag",
            codeHtml: '<div id="boiteindice" class="unselectable  construction"  style="position:absolute;left:0px;top:0px;width:150px;height:100px;"><div id="dragindice" class="unselectable dvDrag" style="position:absolute;left:0px;top:0px;width:100%;height:100%;cursor:pointer;z-index:10"><span></span></div><script class="interactivite">$("#dragindice").draggable({containment:"#page", cursor: "pointer",   revert: true, zIndex: 1000,stop:addDragStop,start:addDragStart});</script></div>'
        }, $.proxy(this.addDiv, this));
        $("#addTextSelectable").on("click", null, {
            element: "boite",
         }, $.proxy(this.addDiv, this));
        $("#addMathAnswer").on("click", null, {
            element: "boite",
            codeHtml: '<div statu="non-modifiable" class="unselectable dvScience savable dvFocused ui-droppable ui-draggable ui-draggable-handle ui-resizable construction" type="scientifique" id="boiteindice" style="width: 377px; height: 243px; z-index: 20; right: auto; bottom: auto; font-size: 14px; position: absolute; top: 91px; left: 76px;"><div style="position: absolute; width: 100%;"> <img style="display: block;" title="Liste des commandes" src="'+site+API+'/img/aide.png" class="aide"><img style="display: block;" title="initialiser ou réinitialiser l\'interactivité" src="'+site+API+'/img/refresh.png" class="refresh"><img title="ajouter une ligne au début" src="'+site+API+'/img/newLine.png" class="firstAdd" style="display: block;"></div><div id="dvMathindice" style="position: absolute; overflow: auto; width: 100%; max-height: 95%; margin-top: 10px;"><span style="font-size: 0px;"></span></div> <input id="scienceindice" style="display: none;" type="text"> <script class="scriptScience"> $("#boiteindice .refresh").on("click", function(evt) { $("#boiteindice").trigger("refresh"); }); $("#boiteindice").on("click", ".firstAdd", function(evt) { evt.stopPropagation(); var html = \'<span class="dvMq new"  style="display: block; border: medium none;" latex=""></span><img class="supp" src="'+site+API+'/img/smallSupp.png" title="Supprimer la ligne">\'; $("#dvMathindice").prepend(html); $("#dvMathindice .new").trigger("newDvMq"); $("#dvMathindice .new").find("textarea").trigger("focus"); $("#dvMathindice .new").removeClass("new"); }); $("#scienceindice").on("change", function(evt) { $("#boiteindice").trigger("change"); }); $("#boiteindice").on("save", function(evt) { var txt = encodeURI($("#dvMathindice").html()); $("#scienceindice").val(txt); }); $("#boiteindice").on("change", function(evt) { var etat=$(this).parent(".question").css("display");$(this).parent(".question").show(); if ($("#boiteindice").attr("statu") == "modifiable") { $("#dvMathindice").html(decodeURI($("#scienceindice").val())); $("#boiteindice").trigger("refresh"); }$(this).parent(".question").css("display",etat); }); $("#boiteindice").on("refresh", function(evt) { $("#boiteindice .supp,#boiteindice .firstAdd,#boiteindice .aide,#boiteindice .refresh").hide(); $("#dvMathindice .dvMq").each(function() { $(this).attr("class", "dvMq").text($(this).attr("latex")); if ((statu == "eleve" && !revoirDs && $("#boiteindice").attr("statu") == "modifiable") || (statu == "prof" && dv.modeEbauche && $("#boiteindice").attr("statu") != "modifiable")) { MQ.MathField(this) } else { MQ.StaticMath(this) } }); if ((statu == "eleve" && !revoirDs && $("#boiteindice").attr("statu") == "modifiable") || (statu == "prof" && dv.modeEbauche && $("#boiteindice").attr("statu") != "modifiable")) { $("#boiteindice .supp,#boiteindice .firstAdd,#boiteindice .aide,#boiteindice .refresh").show(); $("#dvMathindice").off("newDvMq mousedown blur lostFocus focus click mouseenter mouseleave keydown"); $("#dvMathindice").on("newDvMq", ".dvMq", function(evt) { MQ.MathField(this) }); $("#dvMathindice").on("mousedown click", ".dvMq", function(evt) { evt.stopPropagation(); }); $("#dvMathindice").on("blur", ".dvMq textarea", function(evt) { $(this).parent().parent().parent().trigger("lostFocus") }); $("#dvMathindice").on("lostFocus", function(evt) { if ($("#dvMathindice .mq-focused").length == 0) { $("#dvMathindice").addClass("dvFocused"); } else { $("#dvMathindice").removeClass("dvFocused"); $("#dvMathindice .dvMq").each(function() { $(this).attr("latex", MQ.MathField(this).latex()) }); } }); $("#dvMathindice").on("focus", ".dvMq textarea", function(evt) { $(this).parent().parent().parent().trigger("hasFocus") }); $("#dvMathindice").on("hasFocus", function(evt) { $("#boiteindice").addClass("dvFocused"); }); $("#dvMathindice").on("click", ".supp", function(evt) { $(this).prev().remove(); $(this).remove(); }); $("#dvMathindice").on("mouseenter", ".supp", function(evt) { $(this).prev().css("background-color", "rgb(221, 142, 136)") }); $("#dvMathindice").on("mouseleave", ".supp", function(evt) { $(this).prev().css("background-color", "") }); $("#dvMathindice").on("keydown", ".dvMq", function(event) { event.stopPropagation(); if (event.which == 13) { var html = \'<span class="dvMq"  style="display: block; border: medium none;" latex=""></span><img class="supp" src="'+site+API+'/img/smallSupp.png" title="Supprimer la ligne">\'; $(this).next().after(html); $(this).next().next().trigger("newDvMq"); $(this).next().next().find("textarea").trigger("focus"); } }); $("#boiteindice .aide").off("click"); $("#boiteindice .aide").on("click", function(evt) { $("#aide").load("https://coursdesciences.fr/devoir/outils/aide_mathQuill.html"); $("#aide").dialog({ position: { my: "left center", at: "right top", of: this }, width: 410 }); $("#aide").dialog("open"); }); } $(".question").hide(); $("#page").parent().show(); }); </script></div>'
        }, $.proxy(this.addDiv, this));
        $("#addDialog").on("click", null, {
            element: "boite",
            type: "dialog",
            codeHtml: '<div class="unselectable construction dvdialog" id="boiteindice" title="boiteindice" titre="titre" style="position: relative; left: 0px; top: 0px; width: 200px; z-indice: auto; right: auto; bottom: auto; height: 45px;overflow: hidden;" origine="#questionX .page"><span></span></div><script class="dvDialog"> $("#boiteindice").dialog({appendTo:"body",resizable:false,width:parseInt($("#boiteindice").prop("scrollWidth")),height:parseInt($("#boiteindice").prop("scrollHeight")+34),autoOpen: false,title:$("#boiteindice").attr("titre")});$("#boiteindice").css({top:"0px",left:"0px"}); $("#boiteindice script").each(function(){eval($(this).text())});</script>'
        }, $.proxy(this.addDiv, this));
        $("#addMath").on("click", null, {
            element: "boite",
            codeHtml: '<div class="unselectable construction" id="boiteindice" style="position: absolute; left: 0px; top: 0px; width: 200px; z-indice: auto; right: auto; bottom: auto; height: 45px;"><span style="display:none" class="math"></span><div id="renduMathindice"></div><script> $("#boiteindice .math").on("changeMath",function(event){katex.render($("#boiteindice .math").text(), $("#renduMathindice")[0]);});</script></div>'
        }, $.proxy(this.addDiv, this));
        $("#addTabConv").on("click", null, {
            element: "boite",
            codeHtml: '<div style="background-color: #ffffcc; margin: 0px; width: 670px; height: 200px;box-shadow: 3px 3px 3px 3px rgb(153, 153, 153);border-radius: 10px;" id="boiteindice" class="unselectable" title="Tableau de conversion"><style type="text/css">span.convEntete {padding-top: 10px;padding-left: 0px;padding-right: 0px;padding-bottom: 10px;background-color: rgb(204, 204, 204);margin: 0px;border: 1px dashed grey;width: 50px;height: 28px;display: inline-block;color: rgba(255, 0, 0, 1);position: relative;text-align: center;vertical-align: middle;font-size: 0.8em;}span.convEntete input {width: 46px;text-align: center;font-size: 0.8em;}.convEntete:hover {      cursor: pointer;} </style><div id="tabConvindice" style="font-size: xx-large;position:relative;top: 10px;"><img style="left: 50px; position: relative;" src="'+site+API+'/outils/img/tab_conv.png"> <span style="position: absolute; left: 50px; top: 150px;" class="move">0</span> <span style="position: absolute; left: 50px; top: 150px;" class="move">0</span> <span style="position: absolute; left: 50px; top: 150px;" class="move">0</span> <span style="position: absolute; left: 50px; top: 150px;" class="move">0</span> <span style="position: absolute; left: 50px; top: 150px;" class="move">0</span> <span style="position: absolute; left: 50px; top: 150px;" class="move">0</span> <span style="position: absolute; left: 50px; top: 150px;" class="move">0</span> <span style="position: absolute; top: 150px; left: 80px;" class="move">1</span> <span style="position: absolute; top: 150px; left: 80px;" class="move">1</span> <span style="position: absolute; top: 150px; left: 80px;" class="move">1</span> <span style="position: absolute; top: 150px; left: 80px;" class="move">1</span> <span style="position: absolute; top: 150px; left: 80px;" class="move">1</span> <span style="position: absolute; top: 150px; left: 80px;" class="move">1</span> <span style="position: absolute; top: 150px; left: 80px;" class="move">1</span> <span style="position: absolute; top: 150px; left: 110px;" class="move">2</span> <span style="position: absolute; top: 150px; left: 110px;" class="move">2</span> <span style="position: absolute; top: 150px; left: 110px;" class="move">2</span> <span style="position: absolute; top: 150px; left: 110px;" class="move">2</span> <span style="position: absolute; top: 150px; left: 110px;" class="move">2</span> <span style="position: absolute; top: 150px; left: 110px;" class="move">2</span> <span style="position: absolute; top: 150px; left: 110px;" class="move">2</span> <span style="position: absolute; top: 150px; left: 140px;" class="move">3</span> <span style="position: absolute; top: 150px; left: 140px;" class="move">3</span> <span style="position: absolute; top: 150px; left: 140px;" class="move">3</span> <span style="position: absolute; top: 150px; left: 140px;" class="move">3</span> <span style="position: absolute; top: 150px; left: 140px;" class="move">3</span> <span style="position: absolute; top: 150px; left: 140px;" class="move">3</span> <span style="position: absolute; top: 150px; left: 140px;" class="move">3</span> <span style="top: 150px; left: 170px; position: absolute;" class="move">4</span> <span style="position: absolute; top: 150px; left: 170px;" class="move">4</span> <span style="position: absolute; top: 150px; left: 170px;" class="move">4</span> <span style="position: absolute; top: 150px; left: 170px;" class="move">4</span> <span style="position: absolute; top: 150px; left: 170px;" class="move">4</span> <span style="position: absolute; top: 150px; left: 170px;" class="move">4</span> <span style="position: absolute; top: 150px; left: 170px;" class="move">4</span> <span style="position: absolute; top: 150px; left: 200px;" class="move">5</span> <span style="position: absolute; top: 150px; left: 200px;" class="move">5</span> <span style="position: absolute; top: 150px; left: 200px;" class="move">5</span> <span style="position: absolute; top: 150px; left: 200px;" class="move">5</span> <span style="position: absolute; top: 150px; left: 200px;" class="move">5</span> <span style="position: absolute; top: 150px; left: 200px;" class="move">5</span> <span style="position: absolute; top: 150px; left: 200px;" class="move">5</span> <span style="position: absolute; top: 150px; left: 230px;" class="move">6</span> <span style="position: absolute; top: 150px; left: 230px;" class="move">6</span> <span style="position: absolute; top: 150px; left: 230px;" class="move">6</span> <span style="position: absolute; top: 150px; left: 230px;" class="move">6</span> <span style="position: absolute; top: 150px; left: 230px;" class="move">6</span> <span style="position: absolute; top: 150px; left: 230px;" class="move">6</span> <span style="position: absolute; top: 150px; left: 230px;" class="move">6</span> <span style="position: absolute; top: 150px; left: 260px;" class="move">7</span> <span style="position: absolute; top: 150px; left: 260px;" class="move">7</span> <span style="position: absolute; top: 150px; left: 260px;" class="move">7</span> <span style="position: absolute; top: 150px; left: 260px;" class="move">7</span> <span style="position: absolute; top: 150px; left: 260px;" class="move">7</span> <span style="position: absolute; top: 150px; left: 260px;" class="move">7</span> <span style="position: absolute; top: 150px; left: 260px;" class="move">7</span> <span style="position: absolute; top: 150px; left: 290px;" class="move">8</span> <span style="position: absolute; top: 150px; left: 290px;" class="move">8</span> <span style="position: absolute; top: 150px; left: 290px;" class="move">8</span> <span style="position: absolute; top: 150px; left: 290px;" class="move">8</span> <span style="position: absolute; top: 150px; left: 290px;" class="move">8</span> <span style="position: absolute; top: 150px; left: 290px;" class="move">8</span> <span style="position: absolute; top: 150px; left: 290px;" class="move">8</span> <span style="position: absolute; top: 150px; left: 320px;" class="move">9</span> <span style="position: absolute; top: 150px; left: 320px;" class="move">9</span> <span style="position: absolute; top: 150px; left: 320px;" class="move">9</span> <span style="position: absolute; top: 150px; left: 320px;" class="move">9</span> <span style="position: absolute; top: 150px; left: 320px;" class="move">9</span> <span style="position: absolute; top: 150px; left: 320px;" class="move">9</span> <span style="position: absolute; top: 150px; left: 320px;" class="move">9</span> <span style="position: absolute; top: 150px; left: 350px;" class="move">,</span> <div style="float: right; margin-right: 10px;"><span class="convEntete"></span><span class="convEntete"></span><span class="convEntete"></span><span class="convEntete"></span></div></div><textarea id="inputHtmlindice" class="savable" style="display:none"></textarea><script class="boiteindice">$("#inputHtmlindice").on("change",function(event){var t=this.id.substring(9);$("#tabConv"+t).html($(this).val());var ddtemp=\'<input class="convEnteteInput" type="text"></input>\';eval(\'$("#tabConvindice .convEntete").draggable({containment: "#boiteindice",cursor: "pointer"});$("#tabConvindice [class*=move]").draggable({containment: "#boiteindice",        cursor:"pointer"}).hover(function () {$(this).css("cursor", "pointer")});$("#tabConvindice .convEntete").on("click", function (event) {var text = $(this).text();      $(this).html(ddtemp).children().on("click", function (event) {event.stopPropagation();}).on("focusout", function (event) {$(this).parent().html($(this).val());}).val(text).focus();});\')}).on("save",function(event){var t=this.id.substring(9);$(this).val($("#tabConv"+t).html());});$("#tabConvindice .convEntete").draggable({containment: "#boiteindice",cursor: "pointer"});$("#tabConvindice [class*=move]").draggable({containment: "#boiteindice",        cursor:"pointer"}).hover(function () {$(this).css("cursor", "pointer")});$("#tabConvindice .convEntete").on("click", function (event) {var text = $(this).text();      $(this).html(\'<input class="convEnteteInput" type="text"></input>\').children().on("click", function (event) {event.stopPropagation();}).on("focusout", function (event) {$(this).parent().html($(this).val());}).val(text).focus();});</script></div>'
        }, $.proxy(this.addDiv, this));
        $("#addVolet").on("click", null, {
            element: "boite",
            codeHtml: '<div class="unselectable construction" id="boiteindice" style="position: absolute; left: 0px; top: 0px; width: 200px; z-indice: auto; right: auto; bottom: auto; height: 85px;"><span></span><div id="voletindice" style="height:100%;width:100%;background-color:rgba(206,206,206,0.7)"></div> <textarea id="inputHtmlindice" class="savable" style="display:none"></textarea><script class="ebauche">$("#voletindice").css("height", "100%").css("width", "100%").css("left","0px").css("top","0px");</script>    <script class="boiteindice interactivite">        $("#voletindice").resizable({handles: "e"});</script><script>$("#inputHtmlindice").change(function (event) {$("#voletindice").attr("style",$("#inputHtmlindice").val()); eval($("script.boiteindice").text());}).on("save", function (event) { $("#inputHtmlindice").val($("#voletindice").attr("style"));});</script></div>'
        }, $.proxy(this.addDiv, this));
        $("#addCloze").on("click", null, {
            element: "boite",
            codeHtml: '<div class="unselectable construction" id="boiteindice" title="clozeindice" style="position: absolute; left: 0px; top: 0px; width: 400px;height:200px; z-indice: auto; right: auto; bottom: auto;"><span id="clozeindice" class="cloze" style="display:none;"></span> <div id="renduClozeindice"></div> <textarea id="inputHtmlindice" class="savable" style="display:none"></textarea><correction><code>question_cloze["clozeindice"].correction()</code></correction>  <script> question_cloze["clozeindice"] = new cloze("#clozeindice", "#renduClozeindice");  question_cloze["clozeindice"].init(); $("#clozeindice").on("changeCloze", function (event) { $("#renduClozeindice").html(""); question_cloze["clozeindice"].init();});$("#inputHtmlindice").change(function (event) {            $("#renduClozeindice").html($("#inputHtmlindice").val()); question_cloze["clozeindice"].setInteractivite();$("#renduClozeindice .clozeInput").each(function(ev){$(this).val($(this).attr("depot").replace(/&apos;/g, "\'"));});}).on("save", function (event) { $("#renduClozeindice .clozeInput").each(function(ev){ $(this).attr("depot",$(this).val().replace(/\'/g, "&apos;")); });$("#inputHtmlindice").val($("#renduClozeindice").html());});</script></div>'
        }, $.proxy(this.addDiv, this));

        $("#layerUp").on("click", $.proxy(function(event) {
            var element = this.selection.objets[0];
            $(element).insertAfter($(element).next());
            $(element).parent().children().each(function(index) {
                $(this).css("z-index", index);
            });
        }, this));
        $("#layerDown").on("click", $.proxy(function(event) {
            var element = this.selection.objets[0];
            $(element).insertBefore($(element).prev());
            $(element).parent().children().each(function(index) {
                $(this).css("z-index", index);
            });
        }, this));
        $("#leftAlign").on("click", null, {}, $.proxy(function(event) {
            this.selection.align("left");
        }, this));
        $("#topAlign").on("click", null, {}, $.proxy(function(event) {
            this.selection.align("top");
        }, this));
        $("#rightAlign").on("click", null, {}, $.proxy(function(event) {
            this.selection.align("right");
        }, this));
        $("#bottomAlign").on("click", null, {}, $.proxy(function(event) {
            this.selection.align("bottom");
        }, this));
        $("#verticalAjust").on("click", null, {}, $.proxy(function(event) {
            this.selection.ajust("vertical");
        }, this));
        $("#horizontalAjust").on("click", null, {}, $.proxy(function(event) {
            this.selection.ajust("horizontal");
        }, this));
        $("body").append('<div id="regleH" class="regle"></div><div id="regleV" class="regle"></div>');
        $("#regleV").css("height", $(window).height());
        $("#regleH").css("width", $(window).width());
        $("#regleH").draggable({
            axis: "y"
        }).droppable({
            tolerance: "touch"
        });
        $("#regleV").draggable({
            axis: "x"
        }).droppable({
            tolerance: "touch"
        });
        $("#repere").on("click", null, {}, function(event) {
            $("#regleH,#regleV").toggleClass("regle");
        });
        /*
        $("#modEbauche").on("click", $.proxy(function (event) {
            if (dv.modeEbauche) {
                dv.modeEbauche = false;
                $("#outils,#outilsLeft").css("visibility", "hidden");
                console.log("modeEbauche = false");
                $("#modEbauche").css("background-position", "32px 512px");
                $("[id*=boite]").resizable("destroy").draggable("destroy").off("click").removeClass("construction");
            } else {
                dv.modeEbauche = true;
                $("#outils,#outilsLeft").css("visibility", "visible");
                console.log("modeEbauche = true");
                $("#modEbauche").css("background-position", "0px 512px");
                $.proxy(this.setInteractivite("[id*=boite]"), this);
                $("[id*=boite]").addClass("construction");
            }
        }, this));
        */
        $("#addQuestion").on("click", $.proxy(this.createPartie, this));
        //$("#save").on("click", $.proxy(this.createHtml, this));
        $("#save").on("click", $.proxy(this.saveAllQuestions, this));
        $("#save2").on("click", $.proxy(this.saveAllQuestions, this));
        $("#open").on("click", $.proxy(this.openHtml, this));
        $("#textModif").dialog({
            appendTo: "body",
            autoOpen: false,
            closeOnEscape: true,
            draggable: false,
            height: "auto",
            hide: true,
            modal: true,
            resizable: true,
            show: true,
            width: "500px"
        });
        //$(".ui-dialog-titlebar").hide();
        CKEDITOR.replace('modifTextarea', {
            "enterMode": CKEDITOR.ENTER_BR,
            "entities": false,
            "entities_additional": "",
            "entities_greek": false,
            "extraPlugins": "dynamicinsertmenu,ckeditor_wiris,itslimageprop,previewmedia,longtouchcontextmenu,editextension,collapsetoolbar,fakemedia",
            "font_names": "Arial;Comic Sans MS;Courier New;Helvetica;Tahoma;Times New Roman;Verdana;Palatino Linotype",
            "fontSize_sizes": "smaller/smaller;larger/larger;xx-small/xx-small;x-small/x-small;small/small;medium/medium;large/large;x-large/x-large;xx-large/xx-large",
            "height": "300",
            "htmlEncodeOutput": true,
            "language": "fr-fr",
            "removePlugins": "",
            "smiley_columns": 14,
            "smiley_descriptions": ["smile", "sad", "wink", "big smile", "confused", "cheeky", "embaressed", "surprised", "speechless", "angry", "angel", "cool", "devil", "cry", "lightbulb", "thumbs down", "thumbs up", "broken heart", "kiss", "envelope", "airplane", "alarm", "apple", "banana", "basketball", "bookmark", "boxing gloves blue", "boxing gloves red", "bull", "candle", "certificate", "check", "chest", "clock", "cloud", "cloud dark", "cow", "delete", "die", "die gold", "dog", "error", "extinguisher", "eye", "fish", "flashlight", "flower blue", "flower red", "flower white", "flower yellow", "goblet bronze", "goblet gold", "goblet silver", "guitar", "hand red card", "hand yellow card", "hat green", "hat red", "heart", "icecream", "lemon", "lifebelt", "lightbulb", "magic-wand", "medal", "moon", "palm", "pig", "pin green", "pin red", "pineapple", "rubberstamp", "ship", "snowflake", "soccer ball", "spider", "spider", "star blue", "star green", "star red", "star yellow", "step", "stop", "stopwatch", "sun", "sun and cloud", "target", "target", "trafficlight green", "trafficlight red", "tree", "view", "violin"],
            "smiley_images": ["regular_smile.gif", "sad_smile.gif", "wink_smile.gif", "teeth_smile.gif", "confused_smile.gif", "tounge_smile.gif", "embaressed_smile.gif", "omg_smile.gif", "whatchutalkingabout_smile.gif", "angry_smile.gif", "angel_smile.gif", "shades_smile.gif", "devil_smile.gif", "cry_smile.gif", "lightbulb.gif", "thumbs_down.gif", "thumbs_up.gif", "broken_heart.gif", "kiss.gif", "envelope.gif", "airplane.png", "alarm.png", "apple.png", "banana.png", "basketball.png", "bookmark.png", "boxing_gloves_blue.png", "boxing_gloves_red.png", "bull.png", "candle.png", "certificate.png", "check2.png", "chest.png", "clock.png", "cloud.png", "cloud_dark.png", "cow.png", "delete2.png", "die.png", "die_gold.png", "dog.png", "error.png", "extinguisher.png", "eye.png", "fish.png", "flashlight.png", "flower_blue.png", "flower_red.png", "flower_white.png", "flower_yellow.png", "goblet_bronze.png", "goblet_gold.png", "goblet_silver.png", "guitar.png", "hand_red_card.png", "hand_yellow_card.png", "hat_green.png", "hat_red.png", "heart.png", "icecream.png", "lemon.png", "lifebelt.png", "lightbulb.png", "magic-wand.png", "medal.png", "moon.png", "palm.png", "pig.png", "pin_green.png", "pin_red.png", "pineapple.png", "rubberstamp.png", "ship2.png", "snowflake.png", "soccer_ball.png", "spider.png", "spider2.png", "star_blue.png", "star_green.png", "star_red.png", "star_yellow.png", "step.png", "stop.png", "stopwatch.png", "sun.png", "sun_and_cloud.png", "target2.png", "target3.png", "trafficlight_green.png", "trafficlight_red.png", "tree.png", "view.png", "violin.png"],
            "smiley_path": "/ui/controls/editor/FCK/editor/images/smiley/itslearning/",
            "toolbar": [
                ["Font", "FontSize", ""],
                ["Bold", "Italic", "Underline", ""],
                ["Undo", "Redo", "-", "Cut", "Copy", "Paste", "PasteText", "PasteFromWord", ""],
                ["dynamicinsertmenu", ""],
                ["Link", ""],
                ["TextColor", "BGColor", "SpecialChar", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock", ""],
                ["Subscript", "Superscript", "-", "Outdent", "Indent", "-", "NumberedList", "BulletedList", "-", "Table", ""],
                ["Source", ""],
                ["ckeditor_wiris_formulaEditor", ""],
                ["Smiley", ""],
                ["Maximize", ""],
                ["collapsetoolbar"],
                ["image", "forms", ""]
            ],
            "toolbarCanCollapse": false,
            "uiColor": "#ffffff",
            "allowedContent": true,
            "dynamicinsertmenu": {
                "Items": [{
                    "DialogSrc": "/FileExplorer/ViewFiles.aspx?Function=1",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 670,
                    "DialogWidth": 615,
                    "Text": "Image",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/image16.png",
                    "IframeCssClass": null,
                    "Id": "itslimage"
                }, {
                    "DialogSrc": "/Editor/InsertRecording.aspx?PageTab=0\u0026RecordingType=1",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 665,
                    "DialogWidth": 600,
                    "Text": "Enregistrement vidéo",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/videorecorder16.png",
                    "IframeCssClass": null,
                    "Id": "itslvideorecorder"
                }, {
                    "DialogSrc": "/Editor/InsertRecording.aspx?PageTab=0\u0026RecordingType=2",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 530,
                    "DialogWidth": 600,
                    "Text": "Enregistrement audio",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/audiorecorder16.png",
                    "IframeCssClass": null,
                    "Id": "itslaudiorecorder"
                }, {
                    "DialogSrc": "/Editor/treelink.aspx",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 320,
                    "DialogWidth": 600,
                    "Text": "Lien vers l\u0027arborescence",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/treelink16.png",
                    "IframeCssClass": null,
                    "Id": "treelink"
                }, {
                    "DialogSrc": "/FileExplorer/BrowseFiles.aspx?Type=2\u0026Function=2\u0026PopUp=1",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 570,
                    "DialogWidth": 750,
                    "Text": "Fichier du répertoire \u0027Vos fichiers Web\u0027",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/element_resource16.png",
                    "IframeCssClass": null,
                    "Id": "itslfile"
                }, {
                    "DialogSrc": "/Editor/Web2Content.aspx",
                    "Command": null,
                    "IsEditorDialogTransparent": false,
                    "DialogHeight": 660,
                    "DialogWidth": 760,
                    "Text": "Contenu Web 2.0",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/web2content16.png",
                    "IframeCssClass": null,
                    "Id": "web2cont"
                }, {
                    "DialogSrc": "/Editor/Extensions/BrowseExtensions.aspx?ItslExtensionPlacementArea=1\u0026DisableExpandInLibrary=False",
                    "Command": null,
                    "IsEditorDialogTransparent": true,
                    "DialogHeight": 595,
                    "DialogWidth": 892,
                    "Text": "Parcourir la bibliothèque d\u0027application",
                    "EditText": null,
                    "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/tools16.png",
                    "IframeCssClass": null,
                    "Id": "itslbrowseextensions"
                }],
                "LabelText": "Insérer",
                "TitleText": "Insérer du contenu",
                "Id": "dynamicinsertmenu"
            },
            "fakemedia": {
                "PluginSettings": {
                    "supportedVideoFormats": ["mp4", "m4v", "ogv", "webm", "webmv", "flv"],
                    "mediaContentAttribute": "mediacontent",
                    "mediaTypes": {
                        "auto": 0,
                        "forceAudio": 1,
                        "forceVideo": 2
                    },
                    "dataMemberNames": {
                        "mediaType": "mediaType",
                        "fileName": "fileName"
                    },
                    "cssClasses": {
                        "audio": "cke_fakemedia_audio",
                        "video": "cke_fakemedia_video"
                    }
                },
                "Id": "fakemedia"
            },
            "previewmedia": {
                "ExtraSettings": {
                    "mediaContentAttribute": "mediacontent",
                    "cssClasses": {
                        "fakeAudio": "cke_fakemedia_audio",
                        "fakeVideo": "cke_fakemedia_video"
                    }
                },
                "DialogSrc": "/FileExplorer/PreviewMediaFile.aspx?ViewOnly=True\u0026Type=2\u0026File={filePath}\u0026FileName={fileName}\u0026PlayerMediaType={playerMediaType}",
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 470,
                "DialogWidth": 550,
                "Text": "Prévisualisation",
                "EditText": "Prévisualisation",
                "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/url_preview16.png",
                "IframeCssClass": null,
                "Id": "previewmedia"
            },
            "collapsetoolbar": {
                "DialogSrc": null,
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 0,
                "DialogWidth": 0,
                "Text": null,
                "EditText": null,
                "IconSrc": null,
                "IframeCssClass": null,
                "Id": "collapsetoolbar"
            },
            "itslimageprop": {
                "DialogSrc": "/FileExplorer/InsertImageUrl.aspx?Function=1\u0026imageurl={src}\u0026alt={alt}\u0026border={border}\u0026align={align}\u0026className={class}\u0026width={width}\u0026height={height}",
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 355,
                "DialogWidth": 400,
                "Text": "Propriétés de l\u0027image",
                "EditText": "Propriétés de l\u0027image",
                "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/image16.png",
                "IframeCssClass": null,
                "Id": "itslimageprop"
            },
            "ckeditor_wiris": {
                "DialogSrc": "https://leducdenormandie.itslearning.com/Services/CommonService.asmx/MeasureKpi?measureSection=kpiMeasureSection\u0026measurement=kpiMeasurement\u0026measureContext=kpiMeasureContext",
                "Command": null,
                "IsEditorDialogTransparent": false,
                "DialogHeight": 0,
                "DialogWidth": 0,
                "Text": "Éditeur WIRIS",
                "EditText": "Modifier l\u0027équation",
                "IconSrc": null,
                "IframeCssClass": null,
                "Id": "ckeditor_wiris"
            },
            "editextension": {
                "DialogSrc": null,
                "Command": "window.open( \u0027https://leducdenormandie.itslearning.com/editor/PluginHandler.aspx?ExtensionId=-1\u0026EditorClientInstanceId={editorId}\u0027, \u0027__extensionPopup_-1\u0027, \u0027resizable=yes,scrollbars=yes,status=yes\u0027); ",
                "IsEditorDialogTransparent": false,
                "DialogHeight": 0,
                "DialogWidth": 0,
                "Text": "Remplacer un plug-in",
                "EditText": "Modifier un plug-in",
                "IconSrc": "https://cdn.itslearning.com/v3.52.0.20/icons/xp/tools16.png",
                "IframeCssClass": null,
                "Id": "editextension"
            },
            "title": false,
            "longtouchcontextmenu": {
                "Delay": 1000,
                "DistanceThreshold": 5,
                "Id": "longtouchcontextmenu"
            },
            "entities_processNumerical": false
        })
    }
    this.addDiv = function(event) {
        var eteVide = false; //la selection était vide
        var balise = event.data.element;
        var codeHtml = event.data.codeHtml;
        if (this.selection.objets.length == 0) {
            this.selection.objets.push($("#" + this.firstParent + " [id=page]").get(0));
            eteVide = true;
        }
        var longueur = this.selection.objets.length;
        for (var t = 0; t < longueur; t++) {
            var $element = $(this.selection.objets[t]);
            var code = codeHtml.replace(/indice/g, this.index);
            if (event.data.dvData) {
                code = code.replace(/dvData/g, $("#" + event.data.dvData).val());
            }
            if (event.data.type == "dialog") {
                code = code.replace(/questionX/g, "question" + pageActuelle);
            }
            $("#" + this.firstParent + " [id=" + $($element).attr("id") + "]").append(code);
            if (event.data.type == "dialog") {
                $("[aria-describedby=boite" + this.index + "]").remove();
            }
            if (event.data.type == "drag") {
                $('#drag' + this.index).draggable("destroy");
                this.setInteractivite("#drag" + this.index);
            }
            this.setInteractivite("#" + balise + this.index);
            /*
            $("#" + balise + this.index)
                .resizable({
                    //grid: (10, 10),
                    alsoResize: ".selected",
                    resize: $.proxy(function (event, ui) {
                        event.stopPropagation();
                        var elementMaitre = event.target;
                        //var width = $(elementMaitre).css("Width");
                        //var height = $(elementMaitre).css("Height");
                        var width = ui.size.width;
                        var height = ui.size.height;
                        this.selection.setDimension({
                            width: width,
                            height: height
                        });
                    }, this)

                })
                .draggable(draggableOptions)
                .on("click", {
                        obj: this.selection
                    },
                    function (event) {
                        if (dv.modeEbauche) {
                            event.stopPropagation();
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected");
                                event.data.obj.removeObjet(this);
                                if (event.ctrlKey) {
                                    $(this).remove();
                                }
                            } else {
                                $(this).addClass("selected");
                                event.data.obj.objets.push(this);
                            }
                        }
                    })
                .on('dblclick', function (event) {
                    event.stopPropagation();
                    dv.boiteID = this.id;
                    CKEDITOR.instances.modifTextarea.document.$.body.innerHTML = $(this).find("span")[0].innerHTML;
                    //CKEDITOR.instances.modifTextarea.document.$.body.innerHTML = $(this)[0].firstChild.innerHTML;
                    //$("#textModif textarea").val($(this)[0].firstChild.innerHTML);


                    //$("#textModif textarea").ckeditor();
                    $("#textModif")
                        .dialog("option", "position", {
                            my: "center center",
                            at: "center center",
                            of: document
                        });
                    $("#textModif")
                        .dialog("option", "buttons", [
                            {
                                text: "Ok",
                                click: function () {
                                    var toto = $("#" + dv.boiteID + " span");
                                    toto[0].innerHTML = CKEDITOR.instances.modifTextarea.document.$.body.innerHTML //$("#textModif textarea").val();

                                    toto = $("#" + dv.boiteID).css("height", "");
                                    var hauteur = toto[0].scrollHeight;
                                    toto.css("height", hauteur + "px");
                                    $(this).dialog("close");
                                }
                            }
                            ])
                        .dialog("open");
                });
            */
            this.index++;
        }
        if (eteVide) {
            this.selection.removeAll();
            //$(".selected").removeClass("selected");
        }
    }
    this.createPartie = function(event) {
        var numQuestion = $(".question").length;
        var html = '<div id="question' + numQuestion + '" class="question choices-border">' +
            '<div class="page questionid"></div></div>';
        $("#questions").append(html);
        var txt_html = '<span class="bouton" id="bouton' + numQuestion + '" onclick="afficheQuestion(' + numQuestion + ')"> </span>';
        $("#menu").append(txt_html);
        $("#bouton" + numQuestion).click();
        $("#addZoneNote").click();

    }
    this.createHtml = function(event) {
        this.selection.removeAll();
        $("[id*=boite]").resizable("destroy").draggable("destroy").off("click").removeClass("construction");
        var fichier = dv.enteteHtml + $("#page").html() + dv.piedHtml;
        var a = document.createElement('a');
        a.href = 'data:attachment/html,' + encodeURIComponent(fichier);

        a.target = '_blank';
        a.download = 'question.html';
        document.body.appendChild(a);
        a.click();
        $.proxy(this.setInteractivite("[id*=boite]"), this);
        $("[id*=boite]").addClass("construction");
    }
    this.openHtml = function(event) {
        $.ajax({
            url: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + "/devoir/API4/prof/findAllVersion.php",
            type: "POST",
            dataType: "json",
            data: "&path=" + window.location.pathname,
            success: $.proxy(function(data) {
                var allFichier = data;
            }, this)
        });
    }
    this.openHtmlOld = function(event) {
        var fichier = $("#fichier").val();
        $.get(fichier, $.proxy(function(code) {
            // code contains whatever that request returned
            //var toto = $(code).find("[class*=question]").html();
            var $parsed_data = $('<div/>').append(code);
            var found = $parsed_data.find("[class*=question]");
            $("[id*=question]").html(found);
            $("[class*=question]").attr("id", "page");
            $.proxy(this.setInteractivite("[id*=boite]"), this);
            $("[id*=boite]").addClass("construction");
            this.index = this.returnMaxNumBoite() + 1;
            $("#" + this.firstParent + " #page").droppable({
                hoverClass: "hoverDroppable",
                tolerance: "fit",
                greedy: true,
                addClass: false,
                drop: $.proxy(function(event, ui) {
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
                }, this)
            }); //$("[id*=boite]").length + 1;
        }, this), 'html'); // or 'text', 'xml', 'more'


    }
    this.returnMaxNumBoite = function() {
        var boites = $("[id*=boite]");
        var maxNum = 1;
        for (var t = 0; t < boites.length; t++) {
            var num = parseInt($(boites[t]).attr("id").replace(/boite/g, ""));
            if (num > maxNum) {
                maxNum = num
            }
        }
        return maxNum + 1;
    }
    this.setInteractivite = function(selecteur) {
        $(selecteur)
            .droppable({
                hoverClass: "hoverDroppable",
                tolerance: "fit",
                greedy: true,
                addClass: false,
                drop: $.proxy(function(event, ui) {
                    event.stopPropagation();
                    this.selection.addObjet(ui.draggable[0]);
                    for (var t = 0; t < this.selection.objets.length; t++) {
                        var $element = $(this.selection.objets[t]);
                        var $boite = $(event.target);
                        if ((($boite.attr("id").substring(0, 5) == "boite") || ($boite.attr("id").substring(0, 4) == "drag")) && ($element[0].tagName == "DIV")) {
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
                    }
                }, this)
            })
            .on('dblclick', function(event) {
                event.stopPropagation();
                dv.boiteID = this.id;
                var txt = $(this).find("span")[0].innerHTML;
                if(txt=="contenu à définir"){
                    CKEDITOR.instances.modifTextarea.document.$.body.innerHTML ="";
                }else{
                    CKEDITOR.instances.modifTextarea.document.$.body.innerHTML = txt;
                //CKEDITOR.instances.modifTextarea.document.$.body.innerHTML = $(this).find("span")[0].innerHTML;
                }
                //CKEDITOR.instances.modifTextarea.document.$.body.innerHTML = $(this)[0].firstChild.innerHTML;
                //$("#textModif textarea").val($(this)[0].firstChild.innerHTML);


                //$("#textModif textarea").ckeditor();
                $("#textModif")
                    .dialog("option", "position", {
                        my: "center center",
                        at: "center center",
                        of: document
                    });
                $("#textModif")
                    .dialog("option", "buttons", [{
                        text: "Ok",
                        click: function() {
                            var toto = $("#" + dv.boiteID + " span");
                            toto[0].innerHTML = CKEDITOR.instances.modifTextarea.document.$.body.innerHTML //$("#textModif textarea").val();

                            toto = $("#" + dv.boiteID).css("height", "");
                            var hauteur = toto[0].scrollHeight;
                            toto.css("height", hauteur + "px");
                            $("#" + dv.boiteID + " span.math").trigger("changeMath");
                            $("#" + dv.boiteID + " span.cloze").trigger("changeCloze");
                            $("#" + dv.boiteID + " span.text_selectable").trigger("changeText_selectable");
                            $("#" + dv.boiteID).trigger("boiteImg");
                            $(this).dialog("close");
                        }
                    }])
                    .dialog("open");
            });
        var typeZone = selecteur;
        typeZone = typeZone.substring(1, 5);
        if (typeZone != "drag") {
            $(selecteur)
                .draggable(draggableOptions)
                .resizable({
                    //grid: (10, 10),
                    alsoResize: ".selected",
                    handles : "all",
                    autoHide: true,
                    resize: $.proxy(function(event, ui) {
                        event.stopPropagation();
                        var elementMaitre = event.target;
                        //var width = $(elementMaitre).css("Width");
                        //var height = $(elementMaitre).css("Height");
                        var width = ui.size.width;
                        var height = ui.size.height;
                        this.selection.setDimension({
                            width: width,
                            height: height
                        });
                    }, this),
                    stop: $.proxy(function(event, ui) {
                        this.selection.removeAll();
                    }, this)
                })
                .on("click", {
                        obj: this.selection,
                        firstParent: this.firstParent
                    },
                    function(event) {
                        event.stopPropagation();
                        if (dv.modeEbauche) {
                            event.stopPropagation();
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected");
                                event.data.obj.removeObjet(this);
                                if (event.ctrlKey) {
                                    $(this).remove();
                                }
                            } else {
                                //TODO virer les elements qui ne sont pas frère de la sélection

                                $(".selected").not($(this).siblings(".selected")).removeClass("selected");
                                $(this).addClass("selected");
                                $(".selected").each(function(index, element) {
                                    if (index == 0) {
                                        event.data.obj.removeAll();
                                    }
                                    //event.data.obj.objets.push(this);
                                    event.data.obj.addObjet(this);

                                });
                            }
                            maPage.setUIParameters(event.data.obj.objets[0]);
                        }
                    })
                .on("mousedown", function(event) {
                    event.stopPropagation()
                });
        }

    }
    this.setUIParameters = function(event) {
        var type = $(event).attr("type");
        switch (type) {
            case "radio":
                {
                    var html = '<h1>Le bouton de type Radio</h1><input id="param1" class="text_eleve" type="text" value="' + $(event).find("input").attr("name") + '" style="float: right;margin-top: 10px;"><div>Définir le nom du groupe des boutons radio sélectionnés:</div><script>$("#param1").on("change",function(a){var n=[$(this).val()];$(maPage.selection.objets).each(function(){$(this).find("input").attr("name",n[0])},n)});</script>';

                    $("#menuEbauche").html(html);
                    corrige.setUI(event);
                    break;
                }
            case "text":
                {
                    // gestion de l'alignement du texte dans le input
                    var positionnement = $(event).find("input").attr("style");
                    var myRegExp = new RegExp(".*text-align *: *(\\w+).*", "i");
                    myRegExp.exec(positionnement);
                    var result = RegExp.$1;
                    var html = '<h1>La zone type Texte</h1><select id="param1" style="float:right;background: rgb(255, 255, 255) none repeat scroll 0% 0%; width: 120px;"><option value="left">à gauche</option><option value="center">au centre</option><option value="right">à droite</option></select><div>Définir le positionnement du text dans la saisie:</div><script>$("#param1").on("change",function(a){var t=[$(this).val()];$(maPage.selection.objets).each(function(){var a=$(this).find("input").attr("style"),e=new RegExp("^(.*)text-align *: *(\\\\w+)\\\\s*(;.*)$","i");e.exec(a);var n=RegExp.$1,i=RegExp.$3,r=n+"text-align:"+t[0]+i;$(this).find("input").attr("style",r)},t)});</script>';
                    $("#menuEbauche").html(html);
                    $("#param1").val(result);
                    //gestion des paramètres de correction

                    var html2 = corrige.setUI(event);
                    break;
                }
            case "case":
                {
                    var html = '<h1>La case à cocher</h1><div>Groupe auquel appartient la checkbox : <input class="text_eleve" id="paramGroupe" type="text" style="width: 160px;"></input><script>$("#paramGroupe").val("' + $(event).attr("groupe") + '");$("#paramGroupe").on("change", function (evt) {var $selection = maPage.selection.objets;for (var t = 0; t < $selection.length; t++) {var obj = $selection[t]; if ($(obj).is("[groupe]")) {$(obj).attr("groupe", $(this).val());            }}});</script>';
                    $("#menuEbauche").html(html);
                    var html2 = corrige.setUI(event);
                    break;
                }
            case "text_selectable":
                var html = '<h1>Activité "texte sélectionnable"</h1><div class="" style="margin-bottom:10px;">nombre maxi de zones sélectionnables <input id="maxSelected" value="0" type="number" class="text_eleve" style="width:3em;text-align:center;"> ( 0 : aucune limite)</div><div class="case"> <input id="caseEMode1" name="grEbauche1" autocomplete="off" type="radio"><label for="caseEMode1"></label></div><span style="margin-left: 28px; display: inline-block;">Texte sélectionable uniquement </span><div class="case" style="margin-top: 5px;"> <input id="caseEMode2" name="grEbauche1" autocomplete="off" type="radio"><label for="caseEMode2"></label></div><span style="margin-left: 28px; display: inline-block;">Texte sélectionable avec zone de text pour modification </span><div style="border: 1px solid rgb(153, 153, 153); border-radius: 10px; padding: 10px; position: relative;top:2em;"><div style="background-color: white; position: absolute; top: -16px; left: 20px; padding: 5px;">Définition des zones interactives : </div><div id="meCorrige" class="" style="min-height:50px;-moz-user-select:none;-webkit-user-select:none;user-select:none"></div></div>';
                $("#menuEbauche").html(html);
                if ($(event).children("span").attr("mode") == "modif") {
                    $("#caseEMode2").click();
                } else {
                    $("#caseEMode1").click();
                }
                $("#maxSelected").val($(maPage.selection.objets[0]).find("div.dv").attr("maxSelect"));
                $("#maxSelected").change(function(evt){
                    $(maPage.selection.objets[0]).find("div.dv").attr("maxSelect",$(this).val());
                });
                $("#caseEMode2,#caseEMode1").on("click", function() {

                    if ($(this).attr("id") == "caseEMode2") {
                        $(maPage.selection.objets[0]).children("span").attr("mode", "modif");
                    } else {
                        $(maPage.selection.objets[0]).children("span").attr("mode", "basic");
                    }
                    $("#mccorrige").trigger("change");
                    $(maPage.selection.objets[0]).find("iff").trigger($(maPage.selection.objets[0]).attr("id") + "corrige");
                });
                $("#meCorrige").html($(maPage.selection.objets[0]).children("span").find("div.dv").html());
                $("#meCorrige").on("click", function(evt) {
                    $(this).find(".textSelected").removeClass("textSelected");
                });
                $("#meCorrige").on("click", "span", function(evt) {
                    if (!evt.altKey && !evt.ctrlKey && !evt.shiftKey) {
                        evt.stopPropagation();
                        $(this).toggleClass("textSelected");
                    }
                    if (evt.shiftKey) {
                        evt.stopPropagation();
                        if ($(this).hasClass("noTxtSelectable")) {
                                        $(this).attr("class", "txtSelectable");
                                    }else{
                                        $(this).attr("class", "noTxtSelectable");
                                    }
                        $(maPage.selection.objets[0]).children("span").trigger("changeContenu");
                    }
                    if (evt.ctrlKey) {
                        evt.stopPropagation();
                        if ($(this).parent().find(".textSelected").length > 1) {
                            //grouper
                            var txt = "";
                            var $span = [];
                            var min = -1;
                            var max = 0;
                            var dvclass = "";
                            $(this).parent().find("span").each(function(i) {
                                if ($(this).is(".textSelected") && min == -1) {
                                    min = i;
                                    if ($(this).hasClass("noTxtSelectable")) {
                                        dvclass = "noTxtSelectable";
                                    }else{
                                        dvclass = "txtSelectable";
                                    }
                                }
                            });
                            $(this).parent().find("span").each(function(i) {
                                if ($(this).is(".textSelected")) {
                                    max = i;
                                }
                            });
                            $(this).parent().find("span").each(function(i) {
                                if (i > min - 1 && i < max + 1) {
                                    $span.push(this)
                                }
                            });
                            $($span).wrapAll("<span></span>");
                            $(this).parent().find("span").each(function(i) {
                                txt += $(this).text() + " ";
                            });
                            //txt = txt.substring(0, txt.length);
                            txt = txt.replace(/ *$/, "");
                            $(this).parent().append(txt);
                            $(this).parent().addClass(dvclass);
                            $(this).parent().find("span").remove();
                        } else {
                            //dégrouper
                            var dvclass="";
                            if ($(this).hasClass("noTxtSelectable")) {
                                        dvclass = "noTxtSelectable";
                                    }else{
                                        dvclass = "txtSelectable";
                                    }
                            var tab = ($(this).text() + "").split(" ");
                            var txt = "";
                            $(this).empty();
                            for (var t = 0; t < tab.length; t++) {
                                if (tab[t] != "") {
                                    txt += "<span>" + tab[t] + "</span> ";
                                }
                            }
                            txt = txt.replace(/ *$/, "");
                            $(this).append(txt);
                            $(this).find("span").addClass(dvclass).unwrap();
                        }
                        $(maPage.selection.objets[0]).children("span").trigger("changeContenu");
                    }
                });
                $("#meCorrige").on('dblclick', function(event) {
                    event.stopPropagation();
                    CKEDITOR.instances.modifTextarea.document.$.body.innerHTML = this.innerHTML;
                    $("#textModif")
                        .dialog("option", "position", {
                            my: "center center",
                            at: "center center",
                            of: document
                        });
                    $("#textModif")
                        .dialog("option", "buttons", [{
                            text: "Ok",
                            click: function() {
                                var html = CKEDITOR.instances.modifTextarea.document.$.body.innerHTML + "";
                                html = html.replace(/^([^<]+)/g, '<span class="txtSelectable">$1</span> ')
                                html = html.replace(/<\/span>([,;\.\?\!\:])/g, "$1</span>");
                                html = html.replace(/ *<\/span>(\S)/g, "</span> $1");
                                html = html.replace(/ *<\/span> +([^<]+)/g, '</span> <span class="txtSelectable">$1</span> ');
                                //html.replace(/ *<\/span>([ ,;\.\?\!\:])? +([^<].*[^>])? +<span> */g, '</span> <span>$1 $2</span> <span>');
                                $("#meCorrige").html(html);
                                $(this).trigger("meCorrigeChange");
                                $(this).dialog("close");
                            }
                        }])
                        .dialog("open");
                });
                var html2 = corrige.setUI(event);
                break;
            case "drop":
                {
                    var html = '<h1>La zone de dépôt</h1><div>Nombre maxi d\'éléments déposables dans la zone de dépôt : <div class="case" style="margin: 10px;"> <input value="" id="ebaucheParamUnique" name="ebaucheParam1" autocomplete="off" type="radio"><label for="ebaucheParamUnique"> </label></div><span style="margin-left: 28px; display: inline-block;">Un seul dépôt possible</span><div class="case" style="margin: 10px;"> <input value="" id="ebaucheParamMultiple" name="ebaucheParam1" autocomplete="off" type="radio"><label for="ebaucheParamMultiple"> </label></div><span style="margin-left: 28px; display: inline-block;">Plusieurs dépôts possible</span><div style="margin-top:20px;">nombre de tentative de dépôt autorisé avant de figer la zone de dépôt et de ce qu\'elle contient<div style="margin-left: 209px;"><input id="ebaucheTentative" class="text_eleve"  type="number" style="text-align:center;width:5em;height:2em;"></div></div><script></script>';
                    $("#menuEbauche").html(html);
                    setdropUIParameter(event);
                    var html2 = corrige.setUI(event);
                    break;
                }
        }
    }
    this.saveAllQuestions = function() {
        //désactivation des événements sur la page en cours
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
        $("#loaser").show();
        $("#question0").show();
        $("parametre").text(paramText);
        dvQuestions = $("#questions").html();
        var contenuHtml = encodeURIComponent($("#questions").html());
        var toto = contenuHtml.length;
        //réactivation des vénements


        //envoie du document
        $.ajax({
            url: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + API+ "/php/saveQuestions.php",
            type: "POST",
            dataType: "html",
            data: "code=" + contenuHtml + "&path=" + window.location.pathname,
            success: $.proxy(function(data) {
                $("#loaser").hide();
                afficheQuestion(pageActuelle);
                $("#ui-id-2").trigger("click");
                $("#page .commentaire").show();
                /*
                $("#question" + pageActuelle + " .page").attr("id", "page");
                $.proxy(this.setInteractivite("#page [id*=boite]"), this);
                $(".commentaire").show();
                $("#page [id*=boite]").addClass("construction").parent().show();
                */
            }, this)
        });

    }
    this.delInteractivite = function(selecteur) {

        $(selecteur).off("click dblclick mousedown");
        $(selecteur + " [class*=resizable]").filter(".ui-resizable").resizable("destroy");
        $(selecteur + " [class*=resizable]").removeClass("ui-resizable-autohide");
        $(selecteur + " [class*=draggable]").draggable("destroy");
        $(selecteur + " [class*=droppable]").droppable("destroy");
        $(selecteur).removeClass("construction");
    }
    this.removeUIEbauche = function() {
        return '<div style="font-size: 1.5em;text-align: center;">Gestion des paramètres liés aux élements</div><div style="position: relative;top: 50px;left: 50px;font-size: 1.2em;font-weight:bold;">Sélectionner un élément...</div>';;
    }
}

function setdropUIParameter(event) {
    if ($(event).attr("mode") == "unique") {
        $("#ebaucheParamUnique").click();
    } else {
        $("#ebaucheParamMultiple").click();
    }
    $("#ebaucheTentative").val($(event).attr("tentative"));
    $("#ebaucheParamUnique").on("change", function(evt) {
        if ($(this).is(":checked")) {
            $(maPage.selection.objets).filter("[mode]").attr("mode", "unique")
        }
    });
    $("#ebaucheParamMultiple").on("change", function(evt) {
        if ($(this).is(":checked")) {
            $(maPage.selection.objets).filter("[mode]").attr("mode", "Multiple")
        }
    });
    $("#ebaucheTentative").on("change", function(evt) {
        var donnee = $(this).val();
        $(maPage.selection.objets).each(function(i) {
            $(this).attr("tentative", donnee).attr("titre", "plus que " + donnee + " dépôt(s) possible(s)");
        });
    });
}

function dropDrop(event, ui){
    var type = $("#" + event.target.id).attr("mode");
    $(ui.draggable[0]).draggable("option", "revert", true);
    if (type == "Multiple") {
        //TODO il faut regarder si l'élément déposé y était déjà et dans ce cas ne pas décrémenter nbTentative
        var depotDejaPresent = false;
        //test la présence draggable dans le dépot
        var drag = $(ui.draggable[0]).attr("id");
        var myReg = new RegExp(drag, 'i');
        var depot = $("#" + event.target.id).attr("depot");
        var txt = $("#drop" + event.target.id.substring(5)).val();
        if (myReg.test(depot)) {
            depotDejaPresent = true;
            var tab = depot.split(";");
            var text = tab;
            for (var t = 0; t < tab.length; t++) {
                var obj = tab[t].split(":");
                if (obj[0] == drag) {
                    text.splice(t, 1);
                    break;
                }
            }
            txt = text.join(";");
        }
        //$("#" + event.target.id).attr("depot", $(ui.draggable[0]).attr("id"));
        //var txt = $("#drop" + event.target.id.substring(5)).val();
        if (txt != "") {
            txt += ";";
        }
        txt += $(ui.draggable[0]).attr("id") + ":" + $(ui.draggable[0]).css("left") + ":" + $(ui.draggable[0]).css("top");
        $("#drop" + event.target.id.substring(5)).val(txt);
        $("#" + event.target.id).attr("depot", txt);
        $(ui.draggable[0]).draggable("option", "revert", false);
        var nbTentative = parseInt($("#" + event.target.id).attr("tentative"));
        if (nbTentative != 0 && !depotDejaPresent) {
            nbTentative -= 1;
            $("#" + event.target.id).attr("tentative", nbTentative);
            $("#" + event.target.id).attr("titre", "plus que " + $("#" + event.target.id).attr("tentative") + " dépôt(s) possible(s)");
            $("#" + event.target.id).trigger("mouseover");
            setTimeout(function() {
                $("#" + event.target.id).trigger("mouseleave")
            }, 1000);
        }

        if (nbTentative == 0) {
            $("#" + event.target.id).droppable("disable");
            $(ui.draggable[0]).draggable("disable");
        }
    } else {
        if ($("#" + event.target.id).attr("depot") == "") {
            $("#" + event.target.id).attr("depot", $(ui.draggable[0]).attr("id"));
            $(ui.draggable[0]).draggable("option", "revert", false);
            var txt = $(ui.draggable[0]).attr("id") + ":" + $(ui.draggable[0]).css("left") + ":" + $(ui.draggable[0]).css("top");
            $("#drop" + event.target.id.substring(5)).val(txt);
            var nbTentative = parseInt($("#" + event.target.id).attr("tentative"));
            if (nbTentative != 0) {
                nbTentative -= 1;
                $("#" + event.target.id).attr("tentative", nbTentative);
                $("#" + event.target.id).attr("titre", "plus que " + $("#" + event.target.id).attr("tentative") + " dépôt(s) possible(s)");
                $("#" + event.target.id).trigger("mouseover");
                setTimeout(function() {
                    $("#" + event.target.id).trigger("mouseleave")
                }, 1000);
            }

            if (nbTentative == 0) {
                $("#" + event.target.id).droppable("disable");
                $(ui.draggable[0]).draggable("disable");
            }
        } else {
            if ($("#" + event.target.id).attr("depot") == $(ui.draggable[0]).attr("id")) {
                $(ui.draggable[0]).draggable("option", "revert", false);
            }
        }
    }
}


function dropOut(event, ui) {
    /*
    $("#" + event.target.id).attr("depot", "");
    $("#drop" + event.target.id.substring(5)).val("");
    $(ui.draggable[0]).draggable("option", "revert", false);
    */
    //test la présence draggable dans le dépot
    var drag = $(ui.draggable[0]).attr("id");
    var myReg = new RegExp(drag, 'i');
    var depot = $("#" + event.target.id).attr("depot");
    if (myReg.test(depot)) {
        //if ($("#" + event.target.id).attr("depot") == $(ui.draggable[0]).attr("id")) {
        var tab = depot.split(";");
        var txt = tab;
        for (var t = 0; t < tab.length; t++) {
            var obj = tab[t].split(":");
            if (obj[0] == drag) {
                txt.splice(t, 1);
                break;
            }
        }
        var newTxt = txt.join(";");
        $("#" + event.target.id).attr("depot", newTxt);
        $("#drop" + event.target.id.substring(5)).val(newTxt);
        $(ui.draggable[0]).css("left", "0px").css("top", "0px");
        $(ui.draggable[0]).draggable("option", "revert", true);
        $(ui.draggable[0]).trigger("dragstop");
    }

}

function dropChange(event) {
    if (revoirDs || statu == "prof") {
        var contenu = $("#" + event.target.id).val();
        if (contenu.substring(0, 1) == ";") {
            contenu = contenu.substring(1);
        }
        $("#" + $(event.target).parent().attr("id")).attr("depot", contenu);
        var tab = contenu.split(";");
        for (var t = 0; t < tab.length; t++) {
            var obj = tab[t].split(":");
            $("#" + obj[0]).css("left", obj[1]).css("top", obj[2]);
        }
        return true;
    } else {
        return false;
    }
}

function addDragStart(event){
    $(event.target).addClass('partiel');
}

function addDragStop(event) {

    var revert = $(event.target).draggable("option");
    $(event.target).draggable("option", {
        revert: false
    });
    if (revert.revert) {
        $(event.target).css("left", "0px").css("top", "0px");
    }
    $(event.target).draggable("option", {
        revert: true
    });
    $(event.target).css("width", "100%").css("height", "100%");
    $(event.target).removeClass('partiel');
}


var maPage;
maPage = new CreatePage();

var corrige = new Correction(maPage);