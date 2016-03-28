 // evaluateExpReg(nomForm, expression, bareme, note, zoneResult, commentaire);
 // evaluateCheckBox(nom, etat, bareme, note, zoneResult, commentaire);
 // evaluateExpNum(nomForm, solution, interval, bareme, zoneResult, commentaire);
 // afficheNote(zoneResult,bareme);
 // evaluateManuel(idReponse,groupe,bareme,zoneResult, commentaire);
 // evaluateTagByExpReg(tag, expR, bareme, note, zoneResult, commentaire);
 
 function correction() {
	 
	 reinitialise();
	 //partie1
	 evaluateExpReg("Text5", /troposph[éeè]re/i, 1, 1, "q4", "boite58");
	 evaluateExpReg("Text7", /diminu|baisse|chute|descen/i, 1, 1, "q4", "boite59");
	 evaluateExpReg("Text34", /barom[eéè]tre/i, 1, 1, "q4", "boite60");
	 evaluateExpReg("Text36", /compressible/i, 1, 1, "q4", "boite61");
	 evaluateExpReg("Text38", /exp[ea]nsible/i, 1, 1, "q4", "boite62");
	 //partie2
	 evaluateCheckBox("case13", "nc", 1, 1, "q63", "boite56");
	 evaluateCheckBox("case15", "c", 1, 1, "q63", "boite56");
	 evaluateCheckBox("case14", "nc", 1, 1, "q63", "boite56");
	 evaluateCheckBox("case27", "c", 1, 1, "q63", "boite57");
	 evaluateCheckBox("case28", "c", 1, 1, "q63", "boite57");
	 evaluateCheckBox("case29", "nc", 1, 1, "q63", "boite57");
	 evaluateCheckBox("case30", "c", 1, 1, "q63", "boite57");
	 evaluateCheckBox("case31", "nc", 1, 1, "q63", "boite57");
	 evaluateExpReg("Text21", /286|285[.,]7/i, 1, 1, "q63", "boite23");
	 //partie3
	 evaluateExpReg("Text43", /solide.*air/i, 1, 1, "q40", "boite54");
	 evaluateExpReg("Text45", /(?:1.*5|20).*oxyg[éeè]ne/i, 1, 1, "q40", "boite55");
	 evaluateExpReg("Text45", /(?:4.*5|80).*azote/i, 1, 1, "q40", "boite55");
	 evaluateCheckBox("case48", "nc", 1, 1, "q40", "");
	 evaluateCheckBox("case49", "c", 1, 1, "q40", "");
	 evaluateCheckBox("case50", "nc", 1, 1, "q40", "");
	 evaluateCheckBox("case51", "c", 1, 1, "q40", "");
	 evaluateCheckBox("case52", "c", 1, 1, "q40", "");
	 evaluateCheckBox("case53", "nc", 1, 1, "q40", "");
	 //partie4
	 evaluateExpReg("Text88", /pression/i, 1, 1, "q67", "boite89");
	 evaluateExpReg("Text72", /100 *000/i, 1, 1, "q67", "boite74");
	 evaluateExpReg("Text66", /1[.,]015/i, 1, 1, "q67", "boite90");
	 //partie5
	 evaluateExpReg("Text78", /m[eéèê]me.*pression|pression.*m[eéèê]me/i, 1, 1, "q77", "boite79");
	 evaluateExpReg("Text81", /d[eéè]pression/i, 1, 1, "q77", "boite82");
	 evaluateExpReg("Text84", /anti *c[iy]clone/i, 1, 1, "q77", "boite85");
	 
	 //  this.getField("note_devoir").value = note_globale / note_max *20;
	 afficheNoteDevoir("entete_devoir", "note_devoir", note_globale / note_max * 20);
	 
 }