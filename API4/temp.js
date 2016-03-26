$(".question").show();
$("#dvMath46 .dvMq").each(function () {
    var txt = $(this).attr("latex").replace(/\\/g, "\\");
    $(this).text(txt);
    MQ.MathField(this)
});
$("#dvMath46").on("newDvMq", ".dvMq", function (evt) {
    MQ.MathField(this)
});
$("#dvMath46").on("blur", ".dvMq textarea", function (evt) {
    $(this).parent().parent().parent().trigger("lostFocus")
});
$("#dvMath46").on("lostFocus", function (evt) {
    console.log($("#boite46 .mq-focused").length);
    if ($("#dvMath46 .mq-focused").length == 0) {
        $("#dvMath46").addClass("dvFocused");
    } else {
        $("#dvMath46").removeClass("dvFocused");
        $("#dvMath46 .dvMq").each(function () {
            $(this).attr("latex", MQ.MathField(this).latex())
        });
    }
});
$("#dvMath46").on("focus", ".dvMq textarea", function (evt) {
    $(this).parent().parent().parent().trigger("hasFocus")
});
$("#dvMath46").on("hasFocus", function (evt) {
    $("#boite46").addClass("dvFocused");
});
$("#dvMath46").on("click", ".firstAdd", function (evt) {
    evt.stopPropagation();
    var html = '<span class="dvMq"  style="display: block; border: medium none;" latex=""></span><img class="add" src="https://coursdesciences.fr/devoir/API4/img/smallAdd.png"><img class="supp" src="https://coursdesciences.fr/devoir/API4/img/smallSupp.png">';
    $(this).next().after(html);
    $(this).next().next().trigger("newDvMq");
    $(this).next().next().find("textarea").trigger("focus");
});
$("#dvMath46").on("click", ".supp", function (evt) {
    $(this).prev().prev().remove();
    $(this).prev().remove();
    $(this).remove();
});
$("#dvMath46").on("mouseenter", ".supp", function (evt) {
    $(this).prev().prev().css("background-color", "rgb(221, 142, 136)")
});
$("#dvMath46").on("mouseleave", ".supp", function (evt) {
    $(this).prev().prev().css("background-color", "")
});
$("#dvMath46").on("keydown", ".dvMq", function (event) {
    event.stopPropagation();
    if (event.which == 13) {
        //$(this).next().click();
        var html = '<span class="dvMq"  style="display: block; border: medium none;" latex=""></span><img class="add" src="https://coursdesciences.fr/devoir/API4/img/smallAdd.png"><img class="supp" src="https://coursdesciences.fr/devoir/API4/img/smallSupp.png">';
        $(this).next().next().after(html);
        $(this).next().next().next().trigger("newDvMq");
        $(this).next().next().next().find("textarea").trigger("focus");
    }
});
$(".question").hide();