//------------------------------------------------------------------------------------
//
//				OUTIL CRAYON
//
//------------------------------------------------------------------------------------
function Tool_crayonOn(ev){
	$("#crayon").addClass("selectionne")
	.one("click",ev.data,Tool_crayonOff);
	$("#"+ev.data.canvas).css("z-index","1002");
	//$(".point").draggable("disable");
	$("#"+ev.data.contener).mousedown(ev.data,crayonDown)
			.mouseup(ev.data,crayonUp);
	$("#suppTrace").css("display","none");
}
function Tool_crayonOff(ev){
	$("#crayon").removeClass("selectionne")
	.one("click",ev.data,Tool_crayonOn);
	$("#"+ev.data.canvas).css("z-index","1000");
	//$(".point").draggable("enable");
	$("#suppTrace").css("display","block");
	$("#"+ev.data.contener).off("mousedown");
	$("#"+ev.data.contener).off("mouseup");
	$("#"+ev.data.contener).off("mousemove");
}
function crayonDown(ev){
	$("#"+ev.data.champ).val($("#"+ev.data.champ).val()+ev.offsetX+","+ev.offsetY+"?");
	$("#"+ev.data.contener).mousemove(ev.data,crayonMove);
}
function crayonUp(ev){
	var donnee=$("#"+ev.data.champ).val().split("?");
	$("#"+ev.data.champ).val(donnee[0]+";"+ev.offsetX+","+ev.offsetY+":");
	$("#"+ev.data.contener).off("mousemove");
	traceMultiSegment(ev.data.champ,ev.data.canvas);
	
}
function crayonMove(ev){
// reconstitution des données...
	var donnee=$("#"+ev.data.champ).val().split("?");
	$("#"+ev.data.champ).val(donnee[0]+"?"+ev.offsetX+","+ev.offsetY);
	traceMultiSegment(ev.data.champ,ev.data.canvas);
}
function traceMultiSegment(idChamp, idCanvas){
	var canvas = document.getElementById(idCanvas);
	if($("#"+idChamp)!=""){
		if (canvas.getContext)
		{    
			context = canvas.getContext('2d');
			context.strokeStyle='blue';
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.beginPath();
			var donnee=$("#"+idChamp).val().split(":");
			for(var t=0;t<donnee.length;t++){
				if(donnee[t]!=""){
					var critere=/[;?]/;
					var segment=donnee[t].split(critere);
					point1=segment[0].split(",");
					point2=segment[1].split(",");
					context.moveTo(point1[0],point1[1]);
					context.lineTo(point2[0],point2[1]);
				}
			}
			context.stroke();
		}
	}
}