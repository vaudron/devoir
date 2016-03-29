var dv = {
    modeEbauche: false,
    enteteHtml: '<!DOCTYPE html>' + '<html>' + '<head>' + '<meta content="text/html; charset=utf-8" http-equiv="content-type">' + '<title>question de type cloze</title>' + '<script src="../../API2/jquery.min.js"></script>' + '<link rel="stylesheet" href="../../API2/jquery-ui.css">' + '<script src="../../API2/jquery-ui.min.js"></script>' + '<link href="../../API2/defaut.css" rel="stylesheet" type="text/css" />' + '<link href="temp.css" rel="stylesheet" type="text/css" />' + '<script src="TypeExo.js"></script>' + '<style type="text/css">' + 'div { padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;}' + '.page {position:absolute;}' + '</style>' + '</head>' + '<body>' + '<div id="Q1" style="float: right;padding: 20px;"></div><div class="page choices-border questionid">',
    piedHtml: '</div></body></html>'
};
//jQuery.getScript("https://coursdesciences.fr/devoir/createDevoir/DVinit.js");
var selected = function () {
    'use strict';
    this.objets = [];
    // méthode returnIds() retourne tous les id des éléments sélectionnés dans un format qui dépend du paramètre 'type' (string,...)
    this.returnIds = function (type) {
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
    this.isInObjets = function (obj) {
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
    this.addObjet = function (obj) {
            if (!this.isInObjets(obj)) {
                this.objets.push(obj);
                $(obj).addClass("selected");
            }
        }
        // méthode removeObjet(obj) supprime de this.objets l'objet passé en paramètre
    this.removeObjet = function (obj) {
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
        }
        // méthode pour tout désélectionner
    this.removeAll = function () {
            this.objets = [];
            $(".selected").removeClass("selected");
        }
        // méthode setOrinalPosition() place dans data de chaque élement le top el left de l'élément dans this.objets
    this.setOriginalPosition = function (taille) {
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
    this.setDimension = function (taille) {
            var longueur = this.objets.length;
            for (var t = 0; t < longueur; t++) {
                var $element = $(this.objets[t]);
                $("#" + $element.attr("id")).css("width", taille.width);
                $("#" + $element.attr("id")).css("height", taille.height);
            }
        }
        // méthode qui aligne les élénents de la lélection par rappot au premier sélectionné
    this.align = function (direction) {
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
    this.ajust = function (direction) {
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
                for (var t = 0; t < longueur; t++) {
                    largeurPris += parseInt($(this.objets[t]).css("width").replace(/px/, ""));
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
var selecteur = function () {
    this.initialW = 0;
    this.initialH = 0;
    this.openSelector = function (e) {
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
    this.doObjectsCollide = function (a, b) { // a and b are your objects
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
    this.selectElements = function (e) {
        var myCreatePage = e.data.objCreatePage;
        var mySelection = myCreatePage.selection;
        var mySelecteur = myCreatePage.selecteur;
        $("#score>span").text('0');
        $("body").off("mousemove", mySelecteur.openSelector);
        $("body").off("mouseup", mySelecteur.selectElements);
        $("[id*=boite]").each(function () {
            var aElem = $(".ghost-select");
            var bElem = $(this);
            var result = mySelecteur.doObjectsCollide(aElem, bElem);
            if (result == true) {
                mySelection.addObjet(this);
            }
        });
        $(".ghost-select").removeClass("ghost-active");
        $(".ghost-select").width(0).height(0);
    }
}
var CreatePage = function () {
    this.index = 1;
    this.firstParent = "";
    this.selection = new selected();
    this.copy = {}; //objet jQuery contenant la copie des sélections lors des ctrl+C , ctrl+X
    this.selecteur = new selecteur();
    var selectedObjs;
    var draggableOptions = {
        containment: "parent",
        zIndex: 1000,
        //grid: [10, 10],
        start: $.proxy(function (event, ui) {
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
        drag: function (event, ui) {
            var currentLoc = $(this).position();
            var orig = ui.originalPosition;

            var offsetLeft = currentLoc.left - orig.left;
            var offsetTop = currentLoc.top - orig.top;

            moveSelected(offsetLeft, offsetTop);
        },
        stop: $.proxy(function (event, ui) {
            this.selection.removeAll();
        }, this)
    };

    function moveSelected(ol, ot) {
        selectedObjs.each(function () {
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
    this.init = function (txt) {
        this.firstParent = txt;
        /*$("#" + this.firstParent).on("click", $.proxy(function (event) {
            if (event.which != 1) {
                this.selection.objets = [];
                $("#deselected").click();
            }
        }, this));*/
        $("body").on('keyup', $.proxy(function (event) {
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
                    break;
                case 88:
                    ctrlX = true;
                    this.copy = $(this.selection.objets).clone();
                    for (var t = 0; t < this.selection.objets.length; t++) {
                        $(this.selection.objets[t]).remove();
                    }
                    console.log("CTRL + X");
                    break;
                case 86:
                    ctrlV = true;
                    var selecteur = "page";
                    if ($(this.selection.objets).length != 0) {
                        selecteur = $(this.selection.objets[0]).attr("id");
                    } else {
                        selecteur = "page";
                    }
                    var cop = $(this.copy).clone();
                    for (var t = 0; t < this.copy.length; t++) {
                        $(cop[t]).attr("id", "boite" + this.index)
                            .appendTo("#" + selecteur);
                        $.proxy(this.setInteractivite("#boite" + this.index), this);
                        this.index++;
                    }
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
                }, this)
            })
            .on("mousedown", $.proxy(function (event) {
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
                    this.selection.objets = [];
                    $("#deselected").click();
                }
            }, this));
        $("#baliseDiv").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable  construction" style="position:absolute;left:0px;top:0px"><span>contenu a définir</span></div>'
        }, $.proxy(this.addDiv, this));
        $("#deselected").on("click", $.proxy(function (event) {
            $(".selected").removeClass("selected");
            this.selection.objets = [];
        }, this));
        $("#addChekbox").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable construction" style="position:absolute;left:0px;top:0px" title="caseindex"><div class="case"> <input id="caseindex" autocomplete="off" type="checkbox">' + '<label for="caseindex"> </label></div><span style="margin-left: 28px; display: inline-block;">contenu a définir</span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addRadio").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable construction" style="position:absolute;left:0px;top:0px" title="caseindex"><div class="case"> <input id="caseindex" name="groupe" autocomplete="off" type="radio">' + '<label for="caseindex"> </label></div><span style="margin-left: 28px; display: inline-block;">contenu a définir</span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addInputText").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable construction" style="position:absolute;left:0px;top:0px;width:150px;height:24px" title="Textindex"> <input id="Textindex" class="text_eleve" style="width: 85%; height: 70%;" autocomplete="off" type="text">' + '<span style="margin-left: 28px; display: inline-block;"></span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addTextarea").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable construction" style="position:absolute;left:0px;top:0px;width:150px;height:24px" title="Textindex"><textarea class="text_eleve" id="Textindex" autocomplete="off" style="width: 85%; height: 100%;"></textarea> ' + '<span style="margin-left: 28px; display: inline-block;"></span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addManuel").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable construction" style="position:absolute;left:0px;top:0px;width:24px;height:100px" title="evalProfindex"><div id="evalProfindex"><div class="manuel"> <input value="100" name="manuelindex" id="manuelindexa" autocomplete="off" type="radio"> <label for="manuelindexa"> </label></div><div class="manuel"> <input value="75" name="manuelindex" id="manuelindexb" autocomplete="off" type="radio"> <label for="manuelindexb"> </label></div><div class="manuel"> <input value="50" name="manuelindex" id="manuelindexc" autocomplete="off" type="radio"> <label for="manuelindexc"> </label></div><div class="manuel"> <input value="25" name="manuelindex" id="manuelindexd" autocomplete="off" type="radio"> <label for="manuelindexd"> </label></div><div class="manuel"> <input value="0" name="manuelindex" id="manuelindexe" autocomplete="off"  type="radio"> <label for="manuelindexe"> </label></div></div>' + '<span style="margin-left: 28px; display: inline-block;"></span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addZoneNote").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable construction" style="position:absolute;left:0px;top:0px;width: 75px;height: 61px;" title="qindex"><div id="noteqindex" class="noteExercice"><div class="noteExo"><span id="qindex">0</span></div><div class="noteExoMax"><span id="qindexmax">0</span></div><span class="noteExerciceBarre">/</span></div> ' + '<span style="margin-left: 28px; display: inline-block;"></span></div>'
        }, $.proxy(this.addDiv, this));
        $("#addImage").on("click", null, {
            element: "boite",
            codeHtml: '<div id="boiteindex" class="unselectable construction"  style="position: absolute; left: 0px; top: 0px; width: 152px; right: auto; bottom: auto;"><img src="dvData" width="100%" height="100%" id="imgindex"> </div>',
            dvData: "src"
        }, $.proxy(this.addDiv, this));
        $("#layerUp").on("click", $.proxy(function (event) {
            var element = this.selection.objets[0];
            $(element).insertAfter($(element).next());
            $(element).parent().children().each(function (index) {
                $(this).css("z-index", index);
            });
        }, this));
        $("#layerDown").on("click", $.proxy(function (event) {
            var element = this.selection.objets[0];
            $(element).insertBefore($(element).prev());
            $(element).parent().children().each(function (index) {
                $(this).css("z-index", index);
            });
        }, this));
        $("#leftAlign").on("click", null, {}, $.proxy(function (event) {
            this.selection.align("left");
        }, this));
        $("#topAlign").on("click", null, {}, $.proxy(function (event) {
            this.selection.align("top");
        }, this));
        $("#rightAlign").on("click", null, {}, $.proxy(function (event) {
            this.selection.align("right");
        }, this));
        $("#bottomAlign").on("click", null, {}, $.proxy(function (event) {
            this.selection.align("bottom");
        }, this));
        $("#verticalAjust").on("click", null, {}, $.proxy(function (event) {
            this.selection.ajust("vertical");
        }, this));
        $("#horizontalAjust").on("click", null, {}, $.proxy(function (event) {
            this.selection.ajust("horizontal");
        }, this));
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
        $("#save").on("click", $.proxy(this.createHtml, this));
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
        $(".ui-dialog-titlebar").hide();
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
            "toolbar": [["Font", "FontSize", ""], ["Bold", "Italic", "Underline", ""], ["Undo", "Redo", "-", "Cut", "Copy", "Paste", "PasteText", "PasteFromWord", ""], ["dynamicinsertmenu", ""], ["Link", ""], ["TextColor", "BGColor", "SpecialChar", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock", ""], ["Subscript", "Superscript", "-", "Outdent", "Indent", "-", "NumberedList", "BulletedList", "-", "Table", ""], ["Source", ""], ["ckeditor_wiris_formulaEditor", ""], ["Smiley", ""], ["Maximize", ""], ["collapsetoolbar"], ["image", "forms", ""]],
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
    this.addDiv = function (event) {
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
            var code = codeHtml.replace(/index/gi, this.index);
            if (event.data.dvData) {
                code = code.replace(/dvData/gi, $("#" + event.data.dvData).val());
            }
            $("#" + this.firstParent + " [id=" + $($element).attr("id") + "]").append(code);
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
            this.selection.objets = [];
            //$(".selected").removeClass("selected");
        }
    }
    this.createHtml = function (event) {
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
    this.openHtml = function (event) {
        var fichier = $("#fichier").val();
        $.get(fichier, $.proxy(function (code) {
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
                }, this)
            }); //$("[id*=boite]").length + 1;
        }, this), 'html'); // or 'text', 'xml', 'more'


    }
    this.returnMaxNumBoite = function () {
        var boites = $("[id*=boite]");
        var maxNum = 1;
        for (var t = 0; t < boites.length; t++) {
            var num = parseInt($(boites[t]).attr("id").replace(/boite/g, ""));
            if (num > maxNum) {
                maxNum = num
            }
        }
        return maxNum;
    }
    this.setInteractivite = function (selecteur) {
        $(selecteur)
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
                }, this),
                stop: $.proxy(function (event, ui) {
                    this.selection.removeAll();
                }, this)
            })
            .draggable(draggableOptions)
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
                        if (($boite.attr("id").substring(0, 5) == "boite") && ($element[0].tagName == "DIV")) {
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
            .on("click", {
                    obj: this.selection,
                    firstParent: this.firstParent
                },
                function (event) {
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
                            $(".selected").each(function (index, element) {
                                if (index == 0) {
                                    event.data.obj.objets = [];
                                }
                                event.data.obj.objets.push(this);

                            });
                        }
                    }
                })
            .on("mousedown", function (event) {
                event.stopPropagation()
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
    }
}

var maPage;
maPage = new CreatePage();
$(function () {

    $("#modEbauche").one("click", function (event) {

        maPage.init('question1');
        $(this).css("background-position", "0px 512px");
        $("#outils, #outilsLeft").css("visibility", "visible");
        dv.modeEbauche = true;
    });
});