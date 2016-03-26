/***************************************************
* JavaScript-Framework für interaktive Lernaufgaben
****************************************************
*
* V 2.5 (2012/03/18)
*
* Dieses Script wandelt Teile einer Website
* in interaktive Quiz-Aufgaben um. Dazu orientiert
* es sich an CSS-Klassen einzelner HTML-Elemente.
* Dadurch können interaktive Aufgaben auf Websiten
* in einem einfachen WYSIWYG-Editor erstellt
* werden. Die Interaktion geschieht dann mittels
* dieses nachgeladenen Javascripts.
*
* SOFTWARE LICENSE: LGPL
* (C) 2007 Felix Riesterer
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either
* version 2.1 of the License, or (at your option) any later version.
* 
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
* Lesser General Public License for more details.
* 
* You should have received a copy of the GNU Lesser General Public
* License along with this library; if not, write to the Free Software
* Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*
* Felix Riesterer (Felix.Riesterer@gmx.net)
*/


var Quiz = {

	triggerClass : "-quiz",	/* Variable, in der das Suffix der CSS-Klasse steht,
		auf die das Script reagiert, um eine Übung als solche zu erkennen und umzuwandeln.
		Es gibt derzeit folgende Übungen, deren Klassennamen wie folgt lauten:
		* Zuordnungsspiel
			-> class="zuordnungs-quiz"
		* Lückentext-Aufgabe
			-> class="lueckentext-quiz"
		* Memo
			-> class="memo-quiz"
		* Multiple Choice - Quiz
			-> class="multiplechoice-quiz"
		* Schüttelrätsel
			-> class="schuettel-quiz"
		* Kreuzworträtsel
			-> class="kreuzwort-quiz"
		*/

	poolClass : "daten-pool", // CSS-Klasse für das Element, in welchem die zu ziehenden Felder liegen
	feldClass : "feld", // CSS-Klasse für Datenfelder
	fertigClass : "geloest", // CSS-Klasse für gelöstes Quiz
	bewertungsClass : "quiz-bewertung", // CSS-Klasse für den Textabsatz mit den Bewertungsergebnissen
	highlightClass : "anvisiert", // CSS-Klasse für das Ziel-Highlighting
	highlightElm : null, // hier steht später eine Referenz auf das HTML-Element, welches gerade als potenzielles Ziel anvisiert wird
	baseURL : "https://coursdesciences.fr/devoir/API/quiz/", // false enthält später den Pfad zum Ordner dieses Scripts
	codeTabelle : false, // wird später durch ein nachgeladenes Script mit einem Objekt befüllt
	draggableClass : "quiz-beweglich", // CSS-Klasse, die ein Element für Drag&Drop freigibt, damit es beweglich wird.
	draggedClass : "quiz-gezogen", // CSS-Klasse, wenn ein Element gerade bewegt wird.
	dragMode : false, // entscheidet, ob ein Element bei onmousedown gezogen werden soll, oder nicht
	dragElm : null, // hier steht später eine Referenz auf das HTML-Element in dem der mousedown stattfand
	dragElmOldVisibility : "", // hier steht später der originale Wert des gezogenen Elements (wird für's Highlighten verändert)

	mouseLastCoords : {
		// wird später mit den Mauskoordinaten überschrieben werden
		left : 0,
		top : 0
	},

	// Anzahl mouseover-Events, nach denen das Drag-Element unsichtbar geschaltet wird (reduziert das Flimmern beim Draggen)
	visibilityCountDefault : 5,

	// Hier findet später der Countdown statt, um das Drag-Element nicht bei jedem mouseover-Event unsichtbar zu schalten
	visibilityCount : 0,

	// Platzhalter für Eventhandler
	oldWinOnLoad : "leer",
	oldDocOnMouseMove : "leer",
	oldDocOnMouseOver : "leer",
	oldDocOnMouseUp : "leer",
	oldDocOnKeyUp : "leer",

	// Alle Quizze auf einer Seite werden hier beim Initialisieren abgespeichert
	alleQuizze : new Object(),

	// Das gerade benutze Quiz
	aktivesQuiz : null,

	domCreate : function (params) {
		var el, p;
		/* "params" ist ein Objekt mit folgender Struktur:
			{ 	tagName : "p", // z.B. für <p>
				text : "einfach ein Text" // als Kind-Textknoten des Elements
				... // weitere (native) Eigenschaften (wie id, className etc.)
			} */
		if (params.tagName && params.tagName.match(/[a-z]/)) {
			el = document.createElement(params.tagName);

			for (p in params) {
				if (p.match(/^text/i)) {
					el.appendChild(document.createTextNode(params[p]));
				} else {
					if (!p.match(/^tagname$/i)) {
						el[p] = params[p];
					}
				}
			}
		}

		return el;
	},
	dd_domCreate : function (params) {
		var el, p;
		/* "params" ist ein Objekt mit folgender Struktur:
		 * { 	tagName : "p", // z.B. für <p>
		 *	text : "einfach ein Text" // als Kind-Textknoten des Elements
		 *	... // weitere (native) Eigenschaften (wie id, className etc.)
	} */
		if (params.tagName && params.tagName.match(/[a-z]/)) {
			el = document.createElement(params.tagName);
			
			for (p in params) {
				if (p.match(/^text/i)) {
					//dv_modif
					var dd=document.createElement("span");
					dd.innerHTML=params[p];
					//el.appendChild(document.createTextNode(params[p]));
					el.appendChild(dd);
				} else {
					if (!p.match(/^tagname$/i)) {
						el[p] = params[p];
					}
				}
			}
		}
		
		return el;
	},

	domSelect : null, // Hier steht später eine Referenz auf die Sizzle-Engine

	each : function(o, cb, s) {
		// Die each-Methode wurde aus dem TinyMCE-Projekt (von Moxiecode.com) entnommen.
		var n, l;

		if (!o)
			return 0;

		s = s || o;

		if (o.length !== undefined) {
			// Indexed arrays, needed for Safari
			for (n=0, l = o.length; n < l; n++) {
				if (cb.call(s, o[n], n, o) === false)
					return 0;
			}
		} else {
			// Hashtables
			for (n in o) {
				if (o.hasOwnProperty(n)) {
					if (cb.call(s, o[n], n, o) === false)
						return 0;
				}
			}
		}

		return 1;
	},

	init : function () {
		// baseURL herausfinden
		var q = this;

		q.each(document.getElementsByTagName("script"), function (s) {
			if (s.src && s.src.match(/\/quiz.js$/)) {
				q.baseURL = s.src.substr(0, s.src.lastIndexOf("/") + 1);
			}
		});

		// Sizzle-Engine einbinden
		document.getElementsByTagName("head")[0].appendChild(
			q.domCreate({
				tagName : "script",
				type : "text/javascript",
				src : Quiz.baseURL + "sizzle.js"
			})
		);

		// Mehrsprachigkeit einbinden
		document.getElementsByTagName("head")[0].appendChild(
			q.domCreate({
				tagName : "script",
				type : "text/javascript",
				src : Quiz.baseURL + "multilingual.js"
			})
		);

		// UTF-8-Normalizer einbinden
		document.getElementsByTagName("head")[0].appendChild(
			q.domCreate({
				tagName : "script",
				type : "text/javascript",
				src : Quiz.baseURL + "utf8-normalizer.js"
			})
		);

		/* Die Initialisierung könnte mehrfach benötigt werden, die folgenden Umleitungen
			dürfen aber nur einmal gemacht werden! */
		if (q.oldDocOnMouseMove == "leer") {
			q.oldDocOnMouseMove = document.onmousemove;

			document.onmousemove = function (e) {
				if (typeof(q.oldDocOnMouseMove) == "function") {
					q.oldDocOnMouseMove(e);
				}

				q.whileDrag(e);
			}
		}

		// OnMouseOver-Handler nur einmal eintragen
		if (q.oldDocOnMouseOver == "leer") {
			q.oldDocOnMouseOver = document.onmouseover;

			document.onmouseover = function (e) {
				if (typeof(q.oldDocOnMouseOver) == "function") {
					q.oldDocOnMouseOver(e);
				}

				q.einBlender(e);
			}
		}

		// Ajouter gestionnaire onload qu'une seule fois
		if (q.oldWinOnLoad == "leer") {
			q.oldWinOnLoad = window.onload;

			window.onload = function () {
				if (typeof(q.oldWinOnLoad) == "function") {
					q.oldWinOnLoad();
				}

				q.initQuizze();
//				dv_init_grille();
			}
		}

		// OnMouseUp-Handler nur einmal eintragen
		if (q.oldDocOnMouseUp == "leer") {
			q.oldDocOnMouseUp = document.onmouseup;

			document.onmouseup = function (e) {
				if (typeof(q.oldDocOnMouseUp) == "function") {
					q.oldDocOnMouseUp(e);
				}

				q.each(q.alleQuizze, function (a) {
					if (a.element.onmouseup) {
						a.element.onmouseup(e);
					}
				});
			}
		}

		// OnKeyUp-Handler nur einmal eintragen
		if (q.oldDocOnKeyUp == "leer") {
			q.oldDocOnKeyUp = document.onkeyup;

			document.onkeyup = function (e) {
				if (typeof(q.oldDocOnKeyUp) == "function") {
					q.oldDocOnKeyUp(e);
				}

				q.each(q.alleQuizze, function (a) {
					if (a.element.onkeyup) {
						a.element.onkeyup(e);
					}
				});
			}
		}

		// Erweiterung für das native String-Objekt in JavaScript: trim()-Methode (wie in PHP verfügbar)
		if (typeof(new String().quizTrim) != "function") {
			String.prototype.quizTrim = function () {
				var l = new RegExp(
					"^[" + String.fromCharCode(32) + String.fromCharCode(160) + "\t\r\n]+",
					"g"
				);
				var r = new RegExp(
					"[" + String.fromCharCode(32) + String.fromCharCode(160) + "\t\r\n]+$",
					"g"
				);

				return this.replace(l, "").replace(r, "");
			};
		}

		// Erweiterung für das native Array-Objekt: contains()-Methode
		if (![].contains) {
			Array.prototype.contains = function (el, strict) {
				var i;

				for (i = 0; i < this.length; i++) {
					if (this[i] === el) {
						return true;
					}
				}

				return false;
			};
		}

		// Erweiterung für das native Array-Objekt: shuffle()-Methode
		if (typeof(new Array().shuffle) != "function") {
			Array.prototype.shuffle = function () {
				var ar = [], zufall, i;

				while (this.length > 0) {
					zufall = Math.floor(Math.random() * this.length);

					ar.push(this[zufall]);

					this.splice(zufall, 1); // Element entfernen
				}

				for (i = 0; i < ar.length; i++) {
					this[i] = ar[i];
				}

				return this;
			};
		}
	},

/*Quiz - Funktionen
=================
 Quiz - Funktionen
=================
 */


	/* Diese Funktion erzeugt ein Zuordnungs-Quiz. Dazu braucht sie eine Tabelle innerhalb eines
	Elternelements mit dem CSS-Klassen-Präfix "matching", z.B. "matching-quiz", wenn "-quiz"
	das Suffix der Quiz.triggerClass ist.
	Die Tabelle mit den Daten enthält Spalten (ohne <th>!), in denen die Werte stehen. */

	zuordnungsQuiz : function (div) {
		var q = this,
			i, tabelle;

		var quiz = {
			// Objekt-Gestalt eines Zuordnungs-Quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "Zuordnungs-Quiz",
			spielModus : "paarweise", // entweder paarweise oder gruppenweise Zuordnungen
			loesungsClass : "loesungs-paar",
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			daten : new Array(), // Hier stehen später Wertegruppen (in Arrays).
			felder : new Array(), // Hier stehen später Referenzen auf SPAN-Elemente
			pool : q.domCreate({
				tagName : "p",
				className : q.poolClass
			}),
			auswertungsButton : null, // Hier steht später das HTML-Element des Auswertungs-Buttons.
			versuche : 0, // Speichert die Anzahl Versuche, die für die Lösung gebraucht wurden.
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung

			// Funktion zum Auswerten der Drag&Drop-Aktionen des Benutzers
			dragNDropAuswerten : function (element, ziel) {
				var t = this,
					vorgaenger, test;

				// Element einpflanzen
				element.parentNode.removeChild(element);
				ziel.appendChild(element);
				test = q.domSelect("."+q.draggableClass, ziel);

				// bei paarweise: War bereits ein Element hier eingefügt? -> Zurück in den Pool damit!
				if (t.spielModus == "paarweise" && test.length > 1) {
					vorgaenger = ziel.removeChild(test[0]);
					t.pool.appendChild(vorgaenger);
				}

				// Auswertungsbutton entfernen, falls vorhanden
				if (t.auswertungsButton.parentNode) {
					t.auswertungsButton.parentNode.removeChild(t.auswertungsButton);
				}

				// letztes Element verwendet -> Auswertungs-Button anbieten
				if (q.domSelect("."+q.draggableClass, t.pool).length < 1) {
					t.pool.appendChild(t.auswertungsButton);
				}
			},

			// Funktion zum Auswerten der Zuordnungen
			auswerten : function () {
				var t = this,
					loesungen = q.domSelect("."+t.loesungsClass, t.element),
					test;

				// Anzahl Lösungsversuche um eins erhöhen
				t.versuche++;

				// Zuordnungen einzeln überprüfen
				q.each(loesungen, function (l) {
					var gruppe = l.getElementsByTagName("span"),
						test = new RegExp(
							"^" + gruppe[0].id.substring(0, gruppe[0].id.lastIndexOf("_"))
						);

					// Stimmen die IDs bis auf ihre letzte Zahl überein?
					q.each(gruppe, function (g) {
						if (g && !g.id.match(test)) {
							// Nein! Element zurück in den Pool!
							t.pool.appendChild(g);
						}
					});
				});

				// Auswertungsbutton entfernen, falls vorhanden
				if (t.auswertungsButton.parentNode) {
					t.auswertungsButton.parentNode.removeChild(t.auswertungsButton);
				}

				// Sind keine Felder mehr im Pool? -> Quiz erfolgreich gelöst!
				if (q.domSelect("span", t.pool).length < 1) {
					// Eventhandler entfernen
					t.element.onmousedown = null;
					t.element.onmousemove = null;
					t.element.onmouseup = null;
					t.solved = true;
					t.element.className += " "+q.fertigClass;
					t.pool.parentNode.removeChild(t.pool);

					// Bewegungscursor entfernen
					loesungen = q.domSelect("."+q.draggableClass, t.element);
					test = new RegExp(" ?" + q.draggableClass);

					q.each(loesungen, function (l) {
						l.className = l.className.replace(test, "");
						l.style.cursor = "";
					});

					// Erfolgsmeldung ausgeben
					t.element.appendChild(q.domCreate({
						tagName : "p",
						className : q.bewertungsClass,
						text : q.meldungen[t.sprache]["lob" + (t.versuche > 2 ? 3 : t.versuche)]
							+ " "
							+ q.meldungen[t.sprache][
								"ergebnis" + (t.versuche > 2 ? 3 : t.versuche)
							].replace(/%n/i, t.versuche)
					}));
				}
			},

			// Funktion zum Mischen und Austeilen der Wörter
			init : function () {
				var t = this,
					loesung, feld, i, j, gruppe, benutzte, zufall, gemischte;

				// Spracheinstellungen auf deutsch zurück korrigieren, falls entsprechende Sprachdaten fehlen
				if (!q.meldungen[t.sprache]) {
					t.sprache = "de";
				}

				/* Jeder Wert aus den Werten der Daten wird zu einem SPAN-Element ("Feld") und erhält eine ID.
				Die ID eines solchen Feldes enthält den Namen des Quizes, die laufende Nummer der Wertegruppe, der er entstammt
				und anschließend die laufende Nummer innerhalb der Wertegruppe. Dadurch kann später die Zuordnung ausgewertet werden,
				da die ID bis auf die letzte Nummer übereinstimmen muss, wenn die Zuordnung stimmen soll. */

				t.element.appendChild(t.pool); // ins Dokument einfügen

				// Wertegruppen durchgehen, Felder erzeugen
				for (i = 0; i < t.daten.length; i++) {
					// Jedes Datum besteht aus einem Array, das mindestens zwei Felder besitzt.
					if (t.daten[i].length > 2) {
						t.spielModus = "gruppenweise";
					}

					for (j = 0; j < t.daten[i].length; j++) {
						t.felder.push(q.domCreate({
							tagName : "span",
							id : t.name + "_" + i + "_" + j,
							className : q.feldClass,
							innerHTML : t.daten[i][j],
						}));
					}
				}

				// Felder mischen und verteilen!
				benutzte = new Array(); // Hier werden bereits benutzte Gruppen markiert
				gemischte = new Array(); // Felder einer Gruppe die in den Pool sollen, hier eintragen

				for (j = 0; j < t.daten.length; j++) {
					// Lösungs-Absatz erzeugen
					loesung = q.domCreate({
						tagName: "p",
						className : t.loesungsClass
					});

					// Gruppe auswählen
					gruppe = true; // Wertegruppe schon verwendet?
					while (gruppe) {
						zufall = Math.floor(Math.random() * t.daten.length);
						gruppe = benutzte[zufall]; // prüfen auf "bereits verwendet"
					}

					benutzte[zufall] = true; // Gruppe jetzt als verwendet eintragen.

					/*
						Je nach Spiel-Modus ("paarweise" oder "gruppenweise") darf die inhaltliche Vorbelegung des
						Lösungsabsatzes nicht zufällig belegt werden. Bei paarweisen Zuordnungen ist immer "logisch",
						welches Feld aus dem Pool dem bereits im Lösungsabsatz stehenden zugeordnet werden muss. Bei
						gruppenweisen Zuordnungen muss dort aber eine Art Oberbegriff stehen, der dann der ersten
						Tabellenzelle der Vorgaben entspricht!
					*/

					feld = 0; // erstes Feld einer Gruppe
					if (t.spielModus == "paarweise") {
						// Feld im Lösungsabsatz zufällig auswählen.
						feld = Math.floor(Math.random() * 2);
					}

					/* Feld aus der Liste der erstellten Felder ermitteln und in Lösungsabsatz schreiben.
						Restliche Felder der Gruppe in den Pool schreiben. */
					for (i = 0; i < t.felder.length; i++) {
						if (t.felder[i].id.match(new RegExp(t.name + "_" + zufall + "_"))) {
							// Feld aus dieser Gruppe ermittelt!
							if (t.felder[i].id.match(new RegExp(t.name + "_" + zufall + "_" + feld))) {
								// Feld in den Lösungsabsatz eintragen
								t.felder[i].style.cursor = "";
								loesung.appendChild(t.felder[i]);
								t.pool.parentNode.insertBefore(loesung, t.pool);

							} else {
								// Feld zu den gemischten einordnen
								gemischte.push(t.felder[i]);
							}
						}
					}
				}

				// zuzuordnende Felder vermischt ausgeben
				gemischte.shuffle();
				q.each(gemischte, function (f) {
					t.pool.appendChild(f);
					f.className += " "+q.draggableClass;
					f.style.cursor = "move";
				});

				// ID für das umgebende DIV-Element vergeben
				t.element.id = t.name;

				// Eventhandler für bewegliche Felder einrichten
				t.element.onmousedown = q.startDrag;
				t.element.onmouseover = q.highlight;
				t.element.onmouseup = q.stopDrag;

				// Auswertungs-Button erzeugen
				t.auswertungsButton = q.domCreate({
					tagName : "span",
					className : "auswertungs-button",
					text : q.meldungen[t.sprache].pruefen,
					onclick : function (e) {
						t.auswerten();
					}
				});
			}
		};

		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function() {
			i++;
		});
		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		tabelle = q.domSelect("table", div);

		if (tabelle.length < 1) {
			return false;
		}

		// Daten sind also vorhanden? -> Auswerten
		q.each(tabelle[0].getElementsByTagName("tr"), function (tr) {
			var gefunden = new Array(); // Eine Wertegruppe anlegen

			// Tabellenzeilen nach Daten durchforsten
			q.each(tr.getElementsByTagName("td"), function (td) {
				// Tabellenzellen nach Daten durchforsten
				var k = false; // normalisierter Zelleninhalt

				if (td.innerHTML && td.innerHTML != "") {
					k = td.innerHTML.replace(/&nbsp;/, " ").quizTrim();
				}

				if (k && k != "") {
					gefunden.push(k);
				}
			});

			// Falls Wertegruppe mindestens ein Wertepaar enthält, dieses den Daten hinzufügen.
			if (gefunden.length > 1) {
				quiz.daten.push(gefunden);
			}
		});

		// Keine brauchbare Daten? -> Verwerfen!
		if (quiz.daten.length < 1) {
			return false;
		}

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		tabelle[0].parentNode.removeChild(tabelle[0]);
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},


	/* Diese Funktion erzeugt ein Lückentext-Quiz. Dazu braucht sie ein Elternelement mit dem
	CSS-Klassen-Präfix "lueckentext", z.B. "lueckentext-quiz", wenn "-quiz" das Suffix der Quiz.triggerClass ist.
	Die mit <strong>, <em>, <b> oder <i> ausgezeichneten Textstellen werden durch Drag&Drop-Felder ersetzt. Sollten
	Lösungshinweise in Klammern stehen, so werden die Textstellen durch Eingabefelder ersetzt. */

	lueckentextQuiz : function (div) {
		var q = this,
			ids = 0,
			i, daten;

		var quiz = {
			// Objekt-Gestalt eines Lückentext-Quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "Lückentext-Quiz",
			loesungsClass : "luecke", // Für die manuellen Texteingaben kommt noch "_i" hinzu!
			lueckenPlatzhalter : new Array(11).join(String.fromCharCode(160)+" "), // Leerzeichen als Platzhalter für Lücken
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			felder : new Array(), // Hier stehen später Referenzen auf SPAN-Elemente
			pool : q.domCreate({
				tagName : "p",
				className: q.poolClass
			}),
			inputs : new Array(), // Hier stehen später Referenzen auf die Text-Eingabefelder und ihre Lösungen
			auswertungsButton : null, // Hier steht später das HTML-Element des Auswertungs-Buttons.
			versuche : 0, // Speichert die Anzahl Versuche, die für die Lösung gebraucht wurden.
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung

			// Funktion zum Auswerten der Drag&Drop-Aktionen des Benutzers
			dragNDropAuswerten : function (element, ziel) {
				var t = this,
					vorgaenger, test, ok, i;

				if (element && ziel) {
					// Element bewegen
					test = new RegExp(t.loesungsClass, "");

					// Zuerst überflüssige Leerzeichen im Ziel-Element entfernen?
					if (ziel.className.match(test)
						&& q.domSelect("."+q.draggableClass, ziel).length < 1
					) {
						ziel.innerHTML = ""; // Leerzeichen in einer Lücke zuvor entfernen
					}

					// Bewegliches Element einpflanzen
					vorgaenger = element.parentNode;
					ziel.appendChild(element);

					// Entleertes Element mit Leerzeichen auffüllen?
					if (vorgaenger.className.match(test)
						&& q.domSelect("."+q.draggableClass, vorgaenger).length < 1
					) {
						// Leerzeichen in einer Lücke als Platzhalter einfügen
						vorgaenger.innerHTML = t.lueckenPlatzhalter;
					}

					// War bereits ein Element hier eingefügt? -> Zurück in den Pool damit!
					test = q.domSelect("."+q.draggableClass, ziel);

					if (test.length > 1) {
						t.pool.appendChild(test[0]);
					}
				}

				// Auswertungsbutton entfernen, falls vorhanden
				if (t.auswertungsButton.parentNode) {
					t.auswertungsButton.parentNode.removeChild(t.auswertungsButton);
				}

				// Auswertungs-Button anbieten?
				if (q.domSelect("."+q.draggableClass, t.pool).length < 1) {
					// letztes Element verwendet -> Alle Eingabefelder ausgefüllt?
					ok = true; // Wir gehen jetzt einmal davon aus...

					q.each(t.element.getElementsByTagName("input"), function (i) {
						if (i.value == "") {
							ok = false; // Aha, ein Eingabefeld war leer!
						}
					});

					if (ok) {
						t.pool.appendChild(t.auswertungsButton);
					}
				}
			},

			// Funktion zum Auswerten der Lösungen
			auswerten : function () {
				var t = this,
					loesungen = new Array(),
					ok;

				// Anzahl Lösungsversuche um eins erhöhen
				t.versuche++;

				// Drag&Drop-Felder überprüfen
				loesungen = q.domSelect("."+t.loesungsClass, t.element);

				if (loesungen.length > 0) {
					// Es gibt Drag&Drop-Felder zu überprüfen...
					q.each(loesungen, function (l) {
						var test = new RegExp("^" + l.id.replace(/^([^_]+_\d+)\w+.*$/, "$1"), ""),
							element = q.domSelect("."+q.draggableClass, l)[0];

						if (!element.id.match(test)) {
							// Falsche Zuordnung! Zurück in den Pool damit!
							t.pool.appendChild(element);
							l.innerHTML = t.lueckenPlatzhalter;
						}
					});
				}

				// Eingabefelder überprüfen
				loesungen = q.domSelect("."+t.loesungsClass + "_i", t.element);
				ok = true; // Wir gehen einmal davon aus, dass alles richtig ist...

				q.each(loesungen, function (l) {
					q.each(t.inputs, function (i) {
						var element = q.domSelect("#"+l.id + "i")[0],
							richtig, test;

						if (element.id == q.domSelect("input", i.element)[0].id) {
							// Inhalt prüfen
							test = i.loesung.split("|");
							element.value = element.value.quizTrim();

							q.each(test, function (t) {
								if (element.value == t.quizTrim()) {
									richtig = true;
								}
							});

							if (!richtig) {
								ok = false; // Falsche Eingabe!
								element.value = "";
							}
						}
					});
				});

				// Auswertungsbutton entfernen
				t.auswertungsButton.parentNode.removeChild(t.auswertungsButton);

				// Sind alle Eingaben richtig und keine Felder mehr im Pool? -> Quiz erfolgreich gelöst!
				if (ok && q.domSelect("span", t.pool).length < 1) {
					// Eventhandler entfernen
					t.element.onmousedown = null;
					t.element.onmousemove = null;
					t.element.onmouseup = null;
					t.solved = true;
					t.element.className += " "+q.fertigClass;
					t.pool.parentNode.removeChild(t.pool);

					// Elementen die Beweglichkeit nehmen
					loesungen = q.domSelect("."+q.draggableClass, t.element);
					test = new RegExp(" ?" + q.draggableClass, "");

					q.each(loesungen, function (l) {
						l.className = l.className.replace(test);
						l.style.cursor = "";
					});

					// Eingabefelder durch gelöste Felder ersetzen
					loesungen = q.domSelect("."+t.loesungsClass + "_i", t.element);

					q.each(loesungen, function (l) {
						l.parentNode.insertBefore(q.domCreate({
							tagName : "span",
							className : t.loesungsClass,
							text : q.domSelect("#"+l.id+"i")[0].value
						}), l);
						l.parentNode.removeChild(l);
					});

					// Erfolgsmeldung ausgeben
					t.element.appendChild(q.domCreate({
						tagName : "p",
						className : q.bewertungsClass,
						text : q.meldungen[t.sprache]["lob" + (t.versuche > 2 ? 3 : t.versuche)]
							+ " "
							+ q.meldungen[t.sprache][
								"ergebnis" + (t.versuche > 2 ? 3 : t.versuche)
							].replace(/%n/i, t.versuche)
					}));
				}
			},

			// Funktion zum Erstellen der Lücken, Mischen und Austeilen der beweglichen Wörter, bzw Umwandeln der Wörter zu Engabefeldern
			init : function () {
				var t = this,
					input, felder, benutzte, zufall, luecke, test, i;

				// Spracheinstellungen auf deutsch zurück korrigieren, falls entsprechende Sprachdaten fehlen
				if (!q.meldungen[t.sprache]) {
					t.sprache = "de";
				}

				/* Jeder markierte Textabschnitt (zum Markieren dienen die Elemente <i>, <b>, <em> und <strong>) wird zu entweder
				einem beweglichen SPAN-Element ("Feld"), oder (wenn eine öffnende Klammer für Hilfsangaben enthalten sind)
				einem Input-Feld. Das markierende Element (also das <i>, <b> etc.) wird ersetzt durch ein <span>-Element mit der
				CSS_Klasse, die in quiz.loesungsClass definiert wurde.

				Beispiel1: <p>Eine Henne legt ein <i>Ei</i>.</p>
				wird zu 
				<p>Eine Henne legt ein <span class="luecke" id="......"> nbsp; nbsp; nbsp; </span>.</p>
				->"Ei" wird zu <span id="quiz0_xb" class="beweglich">Ei</span> und landet im Pool.

				Beispiel2: <p>Eine Henne <b>legt (legen)</b> ein Ei.</p>
				wird zu 
				<p>Eine Henne <span class="luecke"><input type="text" id="......" /></span> (legen) ein Ei.</p>

				Die ID eines solchen Feldes enthält den Namen des Quizes, die laufende Nummer des Wertepaares, dem er entstammt
				und entweder ein "a" oder ein "b". Dadurch kann später die Zuordnung ausgewertet werden, da die ID bis auf den
				letzten Buchstaben übereinstimmen muss, wenn die Zuordnung stimmen soll. */

				// Wenn es Drag&Drop-Felder gibt, dann wird ein Pool benötigt
				if (t.felder.length > 0 || t.inputs.length >0) {
					// Behälter für die beweglichen Teile ins Dokument einfügen
					t.element.appendChild(t.pool);

					// Felder vermischt im Pool ablegen und Lücken erzeugen
					t.felder.shuffle();

					q.each(t.felder, function (f) {
						t.pool.appendChild(f.element);

						luecke = q.domCreate({
							tagName: "span",
							text : t.lueckenPlatzhalter,
							id : f.element.id + "_" + t.loesungsClass,
							className : t.loesungsClass
						});

						// Lücke ins Dokument schreiben
						f.original.parentNode.insertBefore(luecke, f.original);
						f.original.parentNode.removeChild(f.original);
					});

					// Eventhandler für bewegliche Felder einrichten
					t.element.onmousedown = q.startDrag;
					t.element.onmouseover = q.highlight;
					t.element.onmouseup = q.stopDrag;

					q.each(q.domSelect("."+q.feldClass, t.pool), function (f) {
						f.className += " " + q.draggableClass;
						f.style.cursor = "move";
					});
				}

				// falls Eingabefelder vorhanden -> einbinden
				if (t.inputs.length > 0) {
					q.each(t.inputs, function (i) {
						if (typeof i != "function") {
							i.original.parentNode.insertBefore(i.element, i.original);
							i.original.parentNode.removeChild(i.original);
						}
					})
				}

				// ID für das umgebende DIV-Element vergeben
				t.element.id = t.name;

				// Auswertungs-Button erzeugen
				t.auswertungsButton = q.domCreate({
					tagName : "span",
					className : "auswertungs-button",
					text : q.meldungen[t.sprache].pruefen,
					onclick : function (e) {
						t.auswerten();
					}
				});
			}
		};

		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function () {
			i++;
		});

		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		daten = {
			bolds : q.domSelect("b", div),
			italics : q.domSelect("i", div),
			strongs : q.domSelect("strong", div),
			ems : q.domSelect("em", div)
		}

		// keine potentiellen Daten gefunden? -> abbrechen!
		if (daten.bolds.length < 1
			&& daten.italics.length < 1
			&& daten.strongs.length < 1
			&& daten.ems.length < 1
		) {
			return false;
		}

		// Daten sind also vorhanden? -> Auswerten
		q.each(daten, function (tagType) {
			q.each(tagType, function (d) {
				var test = d.innerHTML.replace(/<\/a>/i, "").replace(/<a[^>]*>/i, "");

				if (test.match(/\(/)) {
					// Eingabefeld!
					test = q.domCreate({
						tagName : "span",
						className : quiz.loesungsClass + "_i",
						id : quiz.name + "_" + ids
					});

					test.innerHTML += d.innerHTML.replace(/^[^(]*(\(.*) *$/, "$1").replace(/ ?\(\)$/, "");

					test.insertBefore(q.domCreate({
						tagName : "input",
						type : "text",
						id : test.id + "i",
						onkeyup : function (e) { quiz.dragNDropAuswerten(); }
					}), test.firstChild);

					quiz.inputs.push({
						element : test,
						original : d,
						// Lösungsinhalt "säubern"
						loesung : d.innerHTML.replace(
								/[\t\r\n]/g, " "
							).replace(
								/^([^(]+).*$/, "$1"
							).replace(
								/(&nbsp; | &nbsp;)/, " "
							).replace(
								/ +/, " "
							).quizTrim()
					});

					ids++; // verwendete ID eintragen, damit keine doppelten IDs entstehen

				} else {
					// Drag&Drop-Feld!
					if (d.innerHTML != "") {
						// Feld ist nicht leer
						test = q.domCreate({
							tagName : "span",
							className : q.feldClass
						});

						test.innerHTML = d.innerHTML.replace(/^ *([^ ](.*[^ ])?) *$/, "$1");


						/* Gibt es bereits Felder mit identischem Inhalt?
							Deren IDs müssen bis auf die Buchstaben am Ende übereinstimmen! */
						q.each(quiz.felder, function (f) {
							if (typeof(f.element) != "undefined"
								&& f.element.innerHTML == test.innerHTML
							) {
								// ID übernehmen!
								test.id = f.element.id;
							}
						});

						if (test.id == "") {
							test.id = quiz.name + "_" + ids + "a";
							ids++;

						} else {
							// übernommene ID eines bereits existierenden Feldes ändern
							test.id = test.id.substr(0, test.id.length - 1)
								+ String.fromCharCode(test.id.charCodeAt(test.id.length - 1));
						}

						quiz.felder.push({
							element : test,
							original : d
						});
					}
				}
			});
		});

		// Keine brauchbare Daten? -> Verwerfen!
		i = 0;
		q.each(quiz.felder, function () {
			i++;
		});

		q.each(quiz.inputs, function () {
			i++;
		});

		if (i < 1) {
			return false;
		}

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},


	/* Diese Funktion erzeugt ein memo-quiz. Dazu braucht sie eine Tabelle innerhalb eines Elternelementes
	mit dem CSS-Klassen-Präfix "memo", z.B. "memo-quiz", wenn "-quiz" das Suffix der Quiz.triggerClass ist.
	In der Tabelle stehen die Set-Daten: Die Anzahl an Spalten steht für die Anzahl der Felder pro Set, die Anzahl
	der Zeilen ist die Anzahl der Sets. */

	memoQuiz : function (div) {
		var q = this,
			i, j, test, daten, tabelle;

		var quiz = {
			// Objekt-Gestalt eines memo-quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "memo-quiz",
			inhaltsClass : "feld-inhalt", // CSS-Klasse für den Inhalt eines Feldes
			aktivClass : "aktiv", // CSS-Klasse für ein aktiviertes Feld
			fertigClass : "fertig", // CSS-Klasse für ein Feld, das aussortiert wurde
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			angeklickt : null, // Referenz auf das angeklickte Element innerhalb des DIVs
			felder : new Array(), // Hier stehen später Referenzen auf SPAN-Elemente.
			pool : q.domCreate({
				tagName : "p",
				className : q.poolClass
			}),
			setGroesse : 2, // Anzahl der zu einem Set gehörenden Felder
			versuche : 0, // Speichert die Anzahl Versuche, die für die Lösung gebraucht wurden.
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung

			// Funktion zum Aufdecken eines Feldes (kommt über Eventhandler onclick)
			aufdecken : function (e) {
				var t = this;

				e = e || window.event;
				t.angeklickt = e.target || e.srcElement; // W3C DOM <-> IE

				// Nur bei Klick auf ein Feld (oder eines seiner Nachfahren-Elemente) reagieren!
				test = t.angeklickt;

				while (!test.className
					|| !test.className.match(new RegExp("(^|\\s)" + q.feldClass + "(\\s|$)"))
				) {
					test = test.parentNode;

					if (test == document.body) {
						return false;
					}
				}

				q.aktivesQuiz = t;
				t.angeklickt = test; // das angeklickte Feld abspeichern

				// Feld wurde angeklickt -> aufdecken?
				test = q.domSelect("."+t.aktivClass, t.element);

				if (test.length >= t.setGroesse) {
					// Nein, denn es sind schon alle Felder für ein Set aufgedeckt!
					return false;

				} else {
					// Das aktuelle Set ist noch nicht vollständig aufgedeckt...
					if (!t.angeklickt.className.match(new RegExp(
						"(^|\\s)" + t.aktivClass + "(\\s|$)", ""
					))) {
						// OK, Feld wurde noch nicht aufgedeckt. -> aufdecken
						t.angeklickt.className += " " + t.aktivClass;

						// eventuelle Markierungen aufheben (stört bei Bildern)
						try { window.getSelection().collapse(t.angeklickt, 0); }
						catch (e) { };

						try { document.selection.clear(); }
						catch (e) { };

						if (q.domSelect("."+t.aktivClass, t.element).length >= t.setGroesse) {
							// Alle Felder für ein Feld wurden aufgedeckt! -> auswerten
							window.setTimeout(function () { t.auswerten(); }, 1500);
						}
					}
				}
			},

			// Funktion zum Auswerten eines aufgedeckten Sets
			auswerten : function () {
				var t = this,
					i, ok, muster;

				// Anzahl Lösungsversuche um eins erhöhen
				t.versuche++;

				// aufgedeckte Felder ermitteln
				test = q.domSelect("."+t.aktivClass, t.element);

				// IDs der Felder vergleichen
				muster = new RegExp(test[0].id.replace(/^([^_]+_\d+).*$/, "$1"), ""); // ID des ersten Feldes ohne letzten Buchstaben
				ok = true; // Wir gehen von einer Übereinstimmung aus...
				q.each(test, function (i) {
					if (!i.id.match(muster)) {
						ok = false;
					}
				});

				// IDs haben übereingestimmt?
				muster = new RegExp(" ?" + t.aktivClass, "");
				q.each(test, function (i) {
					if (ok) {
						// Ja. -> aufgedekte Felder "entfernen"
						i.className = t.fertigClass;
					} else {
						// Nein! -> Felder wieder umdrehen!
						i.className = i.className.replace(muster, "");
					}
				});

				// Alle Felder abgeräumt?
				test = q.domSelect("."+Quiz.feldClass, this.element);
				if (test.length < 1) {

					// Gratulieren und nachfragen
					var nachfrage = q.meldungen[t.sprache]["lob" + (t.versuche > 2 ? 3 : t.versuche)]
						+ " "
						+ q.meldungen[t.sprache].alleGefunden
						+ "\n"
						+ q.meldungen[t.sprache]["ergebnis" + (t.versuche > 2 ? 3 : t.versuche)].replace(/%n/i, t.versuche)
						+ "\n"
						+ q.meldungen[t.sprache].erneut;

					if (confirm(
							q.meldungen[t.sprache]["lob" + (t.versuche > 2 ? 3 : t.versuche)]
							+ " "
							+ q.meldungen[t.sprache].alleGefunden
							+ "\n"
							+ q.meldungen[t.sprache][
								"ergebnis" + (t.versuche > 2 ? 3 : t.versuche)
							].replace(/%n/i, t.versuche)
							+ "\n"
							+ q.meldungen[t.sprache].erneut
					)) {
						test = q.domSelect("."+Quiz.poolClass, this.element);

						if (test.length > 0)
							test[0].parentNode.removeChild(test[0]);

						t.init(); // Quiz erneut starten

					} else {
						t.element.onmousedown = null;
						t.element.onmousemove = null;
						t.element.onmouseup = null;
						t.solved = true;
						t.element.className += " "+q.fertigClass;
					}
				}
			},

			// Funktion zum Mischen und Austeilen der Wörter
			init : function () {
				var t = this,
					sets = new Array(),
					i, zufall;

				// Spracheinstellungen auf deutsch zurück korrigieren, falls entsprechende Sprachdaten fehlen
				if (!q.meldungen[t.sprache]) {
					t.sprache = "de";
				}

				/* Jeder Wert aus den Set-Daten wird zu einem SPAN-Element ("Feld") und erhält eine ID.
				Die ID eines solchen Feldes enthält den Namen des Quizes, die laufende Nummer des Sets, dem das Feld entstammt
				und einen "laufenden Buchstaben". Dadurch kann später die Zuordnung ausgewertet werden, da die ID bis auf den
				letzten Buchstaben übereinstimmen muss, wenn die Zuordnung stimmen soll. */

				t.element.appendChild(t.pool); // ins Dokument einfügen

				// Felder vermischt in den Pool schreiben
				t.felder.shuffle();

				q.each(t.felder, function (f) {
					t.pool.appendChild(f.cloneNode(true));
				});

				// Elternelement vorbereiten
				t.element.onclick = function (e) { t.aufdecken(e); }; // Eventhandler vergeben
				t.element.id = t.name; // ID vergeben
				t.versuche = 0; // Anzahl Versuche zurücksetzen
			}
		}


		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function () {
			i++;
		});
		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		tabelle = q.domSelect("table", div);

		if (tabelle.length < 1) {
			// Keine Tabelle für Quiz-Daten gefunden! -> abbrechen
			return false;
		}

		// Daten sind also vorhanden? -> Auswerten
		test = q.domSelect("tr", tabelle[0]);

		// Tabellenzeilen nach Daten durchforsten
		for (i = 0; i < test.length; i++) {
			daten = q.domSelect("td", test[i]);

			if (daten.length > 1) {
				quiz.setGroesse = daten.length;

				for (j = 0; j < daten.length; j++) {
					// Feld abspeichern
					quiz.felder.push(q.domCreate({
						tagName : "span",
						className : q.feldClass,
						id : quiz.name + "_" + i + String.fromCharCode(j + 97)
					}));

					quiz.felder[quiz.felder.length -1].appendChild(q.domCreate({
						tagName : "span",
						className : quiz.inhaltsClass
					}));

					quiz.felder[quiz.felder.length -1].lastChild.innerHTML = daten[j].innerHTML;
				}
			}
		}

		// Keine brauchbare Daten? -> Verwerfen!
		i = 0;
		q.each(quiz.felder, function() {
			i++;
		});

		if (i < 1) {
			return false;
		}

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		tabelle[0].parentNode.removeChild(tabelle[0]);
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},


	/* Diese Funktion erzeugt ein Multiple Choice - Quiz. Dazu braucht sie Textabsätze innerhalb eines Elternelementes
	mit dem CSS-Klassen-Präfix "multiplechoice", z.B. "multiplechoice-quiz", wenn "-quiz" das Suffix der Quiz.triggerClass ist.
	In den Textabsätzen stehen die jeweiligen Quiz-Fragen, die Antworten stehen am Ende der Absätze in runden Klammern. Falsche
	Antworten haben innerhalb der Klammer gleich als erstes Zeichen ein Ausrufezeichen, richtige Antworten nicht.
	Textabsätze ohne Klammernpaar am Ende werden nicht als Quiz-Fragen interpretiert. */

	multiplechoiceQuiz : function (div) {
		var q = this,
			fragen, i;

		var quiz = {
			// Objekt-Gestalt eines Multiple Choice - Quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "Multiple Choice - Quiz",
			loesungsClass : "quiz-antworten", // CSS-Klasse für das Elternelement mit den Antworten
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			fragen : new Array(), // Hier stehen später die Fragen zusammen mit ihren Antworten
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung

			// Funktion zum Auswerten eines aufgedeckten Sets
			auswerten : function () {
				var t = this,
					anzahl, test, richtigkeit;

				// Antwort-Blöcke ermitteln
				richtigkeit = 0; // Anzahl der gezählten Treffer
				anzahl = 0; // Anzahl der möglichen richtigen Antworten

				q.each(q.domSelect("."+t.loesungsClass, t.element), function(a) {
					// Jeden Antwortblock einzeln durchgehen
					var ok = 0; // Anzahl Treffer abzüglich falscher Treffer

					q.each(q.domSelect("input", a), function(i) {
						// <li>-Element ermitteln, um es später einzufärben
						var li = i.parentNode;

						while (!li.tagName || !li.tagName.match(/^li$/i)) {
							li = li.parentNode;
						}

						// Checkbox unveränderlich machen
						i.disabled = "disabled";

						if (i.id.match(/_f$/)) {
							// Aha, eine Falschantwort...
							if (i.checked) {
								// ... wurde fälschlicherweise angewählt!
								li.className = "falsch";
								ok--;
							}

						} else {
							// Aha, eine richtige Antwort...
							li.className = "richtig";
							anzahl++; // Anzahl der möglichen richtigen Antworten erhöhen

							if (i.checked) {
								// ...wurde korrekt angewählt
								ok++;
							}
						}
					});

					// keine negative Wertung für eine Antwort
					ok = ok < 0 ? 0 : ok;

					richtigkeit += ok; // richtige Treffer merken
				});

				richtigkeit = (anzahl > 0) ?
					Math.floor(richtigkeit / anzahl * 1000) / 10 // auf eine Zehntelstelle genau
					: 0;

				// Auswertung ins Dokument schreiben
				t.element.appendChild(q.domCreate({
					tagName : "p",
					className : q.bewertungsClass,
					text : q.meldungen[t.sprache].ergebnisProzent.replace(/%n/i, richtigkeit)
				}));

				t.solved = true;
				t.element.className += " " + q.fertigClass;

				// Auswertungs-Button entfernen
				test = q.domSelect(".auswertungs-button", t.element);

				if (test.length > 0) {
					t.element.removeChild(test[0]);
				}
			},

			// Funktion zum Anzeigen der Fragen und der vermischten möglichen Antworten
			init : function () {
				var t = this,
					frage, antworten, i, j, html, ID;

				// Spracheinstellungen auf deutsch zurück korrigieren, falls entsprechende Sprachdaten fehlen
				if (!q.meldungen[t.sprache]) {
					t.sprache = "de";
				}

				/* Jede Antwort wird zu einem Listen-Element innerhalb einer geordneten Liste.
					Die Liste erhält die CSS-Klasse quiz.loesungsClass.
					Die Listenelemente erhalten eine ID, die sich nur am letzten Buchstaben unterscheidet.
					Die ID einer Falschantwort erhält zusätzlich ein "_f". */

				for (i = 0; i < t.fragen.length; i++) {
					// Frage in das Dokument schreiben
					frage = q.domCreate({
						tagName: "p"
					});

					frage.innerHTML = t.fragen[i].frage;
					t.element.insertBefore(frage, t.fragen[i].original);

					// Antworten zusammenstellen und vermischt ausgeben
					antworten = q.domCreate({
						tagName : "ol",
						className : t.loesungsClass
					});

					html = "";
					t.fragen[i].antworten.shuffle();

					for (j = 0; j < this.fragen[i].antworten.length; j++) {
						ID = this.name + "_" + i + String.fromCharCode(j + 97);

						if (this.fragen[i].antworten[j].match(/^\!/))
							ID += "_f"; // Falschantwort markieren

						html += '<li><input type="checkbox" id="' + ID + '">'
							+ '<label for="' + ID + '"> '
							+ t.fragen[i].antworten[j].replace(/^\!/, "")
							+ "</label></li>";
					}

					antworten.innerHTML += html;

					t.element.insertBefore(frage, t.fragen[i].original);
					t.element.insertBefore(antworten, t.fragen[i].original);
					t.element.removeChild(t.fragen[i].original);
				}

				// Auswertungsbutton anzeigen
				t.element.appendChild(q.domCreate({
					tagName : "p",
					className : "auswertungs-button",
					text : q.meldungen[t.sprache].pruefen,
					onclick : function () { t.auswerten(); }
				}));

				// ID für das umgebende DIV-Element vergeben
				t.element.id = t.name;
			}
		}


		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function() {
			i++;
		});
		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		fragen = q.domSelect("p", div);

		if (fragen.length < 1) {
			// Keine Textabsätze für Quiz-Daten gefunden! -> abbrechen
			return false;
		}

		// Daten sind also vorhanden? -> Auswerten
		q.each(fragen, function (f) {
			// Textabsatz durchforsten
			var test = f.innerHTML.replace(/[\t\r\n]/g, " "),
				daten = {
					frage : "",
					antworten : new Array(),
					original : null // Referenz auf den originalen Textabsatz, um ihn später zu entfernen
				};

			// Zeilenumbrüche und überflüssige Leerzeichen entfernen
			test = test.replace(/(<br>|<br\/>|<br \/>|&bnsp;| )*$/ig, "");

			while (test.match(/\)$/)) {
				daten.antworten.push(test.replace(/^.*\(([^\(\)]*)\)$/, "$1"));

				// extrahierte Antwort aus dem String entfernen
				test = test.replace(/^(.*)\([^\(\)]*\)$/, "$1");
				test = test.quizTrim();
			}

			// Passende Fragen im aktuellen Textabsatz gefunden?
			if (daten.antworten.length > 0) {
				// Ja! Frage mit dazu ...
				daten.frage = test;
				daten.original = f; // Referenz zum ursprünglichen Textabsatz

				// ... und Daten ins Quiz übertragen
				quiz.fragen.push(daten);
			}
		});

		// Keine brauchbare Daten? -> Verwerfen!
		i = 0;
		q.each(quiz.fragen, function() {
			i++;
		});

		if (i < 1) {
			return false;
		}

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},


	/* Diese Funktion erzeugt ein Schüttel-Quiz. Dazu braucht sie ein Elternelement mit dem
	CSS-Klassen-Präfix "schuettel", z.B. "schuettel-quiz", wenn "-quiz" das Suffix der Quiz.triggerClass ist.
	Die mit <strong>, <em>, <b> oder <i> ausgezeichneten Textstellen werden durch Drag&Drop-Felder ersetzt. Sollten
	Lösungshinweise in Klammern stehen, so werden die Textstellen durch Eingabefelder ersetzt. */

	schuettelQuiz : function (div) {
		var q = this,
			i, j, test, inhalt, daten;

		var quiz = {
			// Objekt-Gestalt eines Schüttel-Quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "Schüttel-Quiz",
			loesungsClass : "luecke",
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			felder : new Array(), // Hier stehen später Referenzen auf die Text-Eingabefelder und ihre Lösungen
			auswertungsButton : null, // Hier steht später das HTML-Element des Auswertungs-Buttons.
			versuche : 0, // Speichert die Anzahl Versuche, die für die Lösung gebraucht wurden.
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung

			// Funktion zum Auswerten der Lösungen
			auswerten : function (klick) {
				var t = this,
					loesungen, ok;

				if (klick) {
					// Auswertungs-Button wurde geklickt! Auswerten!
					ok = true; // Mal davon ausgehen, dass alles richtig ist...

					// Anzahl Lösungsversuche um eins erhöhen
					t.versuche++;

					q.each(q.domSelect("."+t.loesungsClass, t.element), function(f) {
						var eingabe = q.domSelect("input", f),
							nummer;

						// bereits als richtig ausgewertete Felder enthalten kein Input-Element mehr!
						if (eingabe.length > 0) {
							nummer = eingabe[0].id.replace(/^.*_(\d+)$/, "$1");

							if (eingabe[0].value.toLowerCase() == t.felder[nummer].loesung.toLowerCase()) {
								// Eingabefeld wurde richtig ausgefüllt!
								f.innerHTML = t.felder[nummer].loesung;

							} else {
								// Eingabefeld wurde falsch ausgefüllt! -> leeren
								eingabe[0].value = "";
								ok = false;
							}
						}
					});

					if (ok) {
						// Quiz wurde korrekt gelöst! -> Erfolgsmeldung ausgeben
						t.element.appendChild(q.domCreate({
							tagName : "p",
							className : q.bewertungsClass,
							text : q.meldungen[t.sprache]["lob" + (t.versuche > 2 ? 3 : t.versuche)]
								+ " "
								+ q.meldungen[t.sprache][
									"ergebnis" + (t.versuche > 2 ? 3 : t.versuche)
								].replace(/%n/i, t.versuche)
						}));

						t.solved = true;
						t.element.className += " " + q.fertigClass;
					}
				}

				// Auswertungsbutton entfernen, falls vorhanden
				if (t.auswertungsButton.parentNode) {
					t.auswertungsButton.parentNode.removeChild(t.auswertungsButton);
				}

				// Eingabefelder überprüfen
				loesungen = q.domSelect("input", t.element);
				ok = loesungen.length > 0; // Mal davon ausgehen, dass alle ausgefüllt sind... wenn es welche gibt!

				q.each(loesungen, function(l) {
					if (l.value == "") {
						ok = false; // Feld war leer!
					}
				});

				// Sind alle Eingabefelder ausgefüllt?
				if (ok) {
					// Ja. -> Button ins Dokument schreiben
					t.element.appendChild(t.auswertungsButton);
				}
			},

			// Funktion zum Umwandeln der Wörter zu Engabefeldern
			init : function () {
				var t = this,
					luecke;

				// Spracheinstellungen auf deutsch zurück korrigieren, falls entsprechende Sprachdaten fehlen
				if (!q.meldungen[t.sprache]) {
					t.sprache = "de";
				}

				/* Jeder markierte Textabschnitt (zum Markieren dienen die Elemente <i>, <b>, <em> und <strong>) wird durch ein
				SPAN-Element, in welchem sich ein Input-Element mit einer Lösucngsvorgabe in Klammern befindet, ersetzt.
				Es erhält die CSS_Klasse, die in quiz.loesungsClass definiert wurde.

				Beispiel: <p>Eine <i>Henne</i> legt ein.</p>
				wird zu
				<p>Eine <span class="luecke"><input id="......" /> (eeHnn)</span> legt ein Ei.</p>

				Die ID eines solchen Input-Elements korrespondiert mit der laufenden Nummer des Daten-Eintrages in
				"quiz.felder". */

				for (i = 0; i < t.felder.length; i++) {
					// Lücke mit Eingabe-Element vorbereiten
					luecke = q.domCreate({
						tagName : "span",
						className : t.loesungsClass,
						text : " ("
							+ t.felder[i].loesung.toLowerCase().split("").shuffle().join("")
							+ ")"
					});

					luecke.insertBefore(
						q.domCreate({
							tagName : "input",
							type : "text",
							name : t.name + "_" + i,
							id : t.name + "_" + i,
							onkeyup : function () { t.auswerten(); }
						}),
						luecke.firstChild
					);

					t.felder[i].element = luecke;
				}

				// Alle im Dokument markierten Wörter in Eingabefelder umwandeln
				q.each(t.felder, function (f) {
					f.original.parentNode.insertBefore(f.element, f.original);
					f.original.parentNode.removeChild(f.original);
				});

				// ID für das umgebende DIV-Element vergeben
				t.element.id = t.name;

				// Auswertungs-Button erzeugen
				t.auswertungsButton = q.domCreate({
					tagName : "p",
					className : "auswertungs-button",
					text : q.meldungen[t.sprache].pruefen,
					onclick : function () { t.auswerten(1); }
				});
			}
		};

		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function () {
			i++;
		});

		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		daten = {
			bolds : q.domSelect("b", div),
			italics : q.domSelect("i", div),
			strongs : q.domSelect("strong", div),
			ems : q.domSelect("em", div)
		}

		// keine potentiellen Daten gefunden? -> abbrechen!
		if (daten.bolds.length < 1
			&& daten.italics.length < 1
			&& daten.strongs.length < 1
			&& daten.ems.length < 1
		) {
			return false;
		}

		// Daten sind also vorhanden? -> Auswerten
		q.each(daten, function (d) {
			q.each(d, function (f) {
				// Lösungsinhalt "säubern"
				quiz.felder.push({
					element : null,
					original : f,
					loesung : f.innerHTML.replace(
							/[\t\r\n]/g, " "
						).replace(
							/^<\/?[^>]+>$/, ""
						).replace(
							/(nbsp; | &nbsp;)/, " "
						).replace(
							/ +/, " "
						).quizTrim()
				});
			});
		});

		// Brauchbare Daten?
		i = 0;
		q.each(quiz.felder, function () {
			i++;
		});

		if (i < 1) {
			return false;
		}

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},


	/* Diese Funktion erzeugt ein Kreuzwort-Quiz. Dazu braucht sie ein Elternelement mit dem
	CSS-Klassen-Präfix "kreuzwort", z.B. "kreuzwort-quiz", wenn "-quiz" das Suffix der Quiz.triggerClass ist.
	Die Daten für das Quiz müssen in einer zweispaltigen Tabelle stehen:
	1. Zelle enthält das Lösungswort,
	2. Zelle enthält eine Lösungshilfe
	*/

	kreuzwortQuiz : function (div) {
		var q = this,
			i, tabelle;

		var quiz = {
			// Objekt-Gestalt eines Kreuzwort-Quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "Kreuzwort-Quiz",
			loesungsClass : "feld",
			loesungsClass2 : "eingabe-feld",
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			eingabe : q.domCreate({ tagName : "div" }), // Eingabebereich
			tabelle : null, // Referenz auf das HTML-Element, in dem das Kreuzworträtsel angezeigt wird
			daten : new Array(), // Hier stehen später Objekte, die die Quiz-Daten enthalten.
			auswertungsButton : null, // Hier steht später das HTML-Element des Auswertungs-Buttons.
			versuche : 0, // Speichert die Anzahl Versuche, die für die Lösung gebraucht wurden.
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung
			
			// Fonction pour évaluer les solutions
			auswerten : function (werte) {
				/* "werte" hat folgende Struktur: {
					wort: <String>,
					quizItem: {
						wort: <String>,
						x: <Number>,
						y: <Number>,
						hilfe: <String>,
						richtung: "waagrecht|senkrecht",
						name: <String>
					},
					form: <HTMLFormObject>
				} */
				if(werte.dvTest){}else{
				dd_write_donnee(werte);}
				var t = this,
					test = true,
					i, p, button, zelle, alleZellen, forms;
// si le mot est vide alors faire une chaine d'espace
				if(!werte.wort){
					for(x=0;x<werte.quizItem.wort.length;x++){
						werte.wort=werte.wort+" ";
					}
				}
				if (werte.wort && werte.quizItem) {
					// Es wurde ein Button geklickt... Eintragen!
					p = {
						wort : werte.quizItem.wort,
						x : werte.quizItem.x,
						y : werte.quizItem.y,
						richtung : werte.quizItem.richtung
					};

					alleZellen = t.findeZellen(p);
					// test pour savoir si la réponse donnée correspond à la solution
					var ok=false;
					if (werte.wort==werte.quizItem.wort){
						ok=true;
					}
					for (i = 0; i < alleZellen.length; i ++) {
						if (werte.wort.length > i) {
							// Ajouter une lettre dans la cellule
							zelle = q.domSelect("."+t.loesungsClass2, alleZellen[i]); // span-Element für Buchstaben finden

							if (zelle.length > 0) {
								var toto=typeof revoirDs;
								if(typeof(revoirDs)!=="undefined"){
									if(ok && revoirDs){
										zelle[0].style.color="green";
									}
									if(!ok && revoirDs){
										zelle[0].style.color="red";
									}
								}
								zelle[0].firstChild.nodeValue = werte.wort.substr(
									i, 1
								).replace(
									/ /, String.fromCharCode(160)
								);
								
							}
						}
					}
				if (werte.form){
					// Eingabeformular(e) entfernen/aktualisieren
					werte.form.parentNode.removeChild(werte.form);

					forms = q.domSelect("form", t.eingabe);
					if (forms.length > 0) {
						// weitere Eingabe(n) möglich -> Formular(e) neu aufbauen
						p = new Array();

						q.each(forms, function (f) {
							p.push({
								wort : f.quizDaten.wort,
								x : f.quizDaten.x,
								y : f.quizDaten.y,
								hilfe : f.quizDaten.hilfe,
								richtung : f.quizDaten.richtung
							});
						});

						// Formulare neu erstellen lassen
						return t.eintragen(p);

					} else {
						// keine weiteren Eingaben mehr zu tätigen -> weg damit oder Auswertungsbutton anzeigen?
						q.each(q.domSelect("."+t.loesungsClass2, t.tabelle), function (a) {
							if (!a.lastChild.nodeValue
								|| a.lastChild.nodeValue == ""
								|| a.lastChild.nodeValue == String.fromCharCode(160)
							) {
								test = false;
							}
						});
						test=false;
						if (test) {
							// Alles ausgefüllt! -> Auswertungs-Button anzeigen!
							q.each(q.domSelect("p", t.eingabe), function (a) {
								a.style.display = "none";
							});

							t.eingabe.insertBefore(t.auswertungsButton, t.eingabe.lastChild);

						} else {
							// weg damit!
							t.eingabe.style.display = "none";
						}
					}
				}
					return false;
				}

				// Auswertungsbutton geklickt?
				/*
				if (werte == "auswertungs-button") {
					// Auswerten!
					t.versuche++;
					test = true;

					q.each(q.domSelect("."+t.loesungsClass2, t.tabelle), function (a) {
						if (a.firstChild.nodeValue != a.parentNode.id.replace(
							/^.*(\w)$/, "$1"
						).replace(
							/_/g, " "
						)) {
							// Falsche Eingabe! -> Löschen
							a.firstChild.nodeValue = String.fromCharCode(160);
							test = false;
						}
					});

					if (test) {
						// Alles richtig!
						t.eingabe.parentNode.insertBefore(
							q.domCreate({
								tagName : "p",
								className : q.bewertungsClass,
								text: q.meldungen[t.sprache]["lob" + (t.versuche > 2 ? 3 : t.versuche)]
									+ " "
									+ q.meldungen[t.sprache][
										"ergebnis" + (t.versuche > 2 ? 3 : t.versuche)
									].replace(/%n/i, t.versuche)
							}),
							t.eingabe
						);

						// Auswertungs-Button und alle Eventhandler entfernen
						t.eingabe.parentNode.removeChild(t.eingabe);
						t.element.onmousedown = null;
						t.element.onmouseup = null;
						t.solved = true;
						t.element.className += " " + q.fertigClass;

					} else {
						// zurück zum Ausfüllen
						q.each(q.domSelect("p", t.eingabe), function (a) {
							a.style.display = "";
						});

						t.eingabe.style.display = "none";
					}
				}
				*/
				return false;
			},

			// Funktion zum Eintragen von Kreuzwort-Wörtern
			eintragen : function (werte) {
				/* "werte" hat folgende Struktur: Array[
					{
						wort: <String>,
						x: <Number>,
						y: <Number>,
						hilfe: <String>,
						richtung: "waagrecht|senkrecht"
					}  // eventuell ein weiteres Objekt:
					,{
						wort: <String>,
						x: <Number>,
						y: <Number>,
						hilfe: <String>,
						richtung: "waagrecht|senkrecht"
					} 
				] */
				var t = this,
					i, p, w, test, text, eingabefeld, zellen;

				// Auswertungsbutton entfernen falls vorhanden
				if (t.auswertungsButton.parentNode == t.eingabe) {
					t.eingabe.removeChild(t.auswertungsButton);
				}

				while (q.domSelect("form", t.eingabe).length > 0) {
					t.eingabe.removeChild(q.domSelect("form", t.eingabe)[0]);
				}

				// Formular erstellen - für jeden Suchbegriff eines
				q.each(werte, function (wert) {
					wert.name = t.name;

					eingabefeld = q.domCreate({
						tagName : "form",
						quizDaten : wert,
						onsubmit : function () {
							var werte = {
									wort : "",
									quizItem : this.quizDaten,
									form: this
								};

							q.each(
								q.domSelect("span", q.domSelect(".eingabezeile", this)[0]),
								function (s) {
									werte.wort += s.innerHTML.replace(/&nbsp;/g, " ").quizTrim();
								}
							);

							return t.auswerten(werte);
						}
					});
					t.eingabe.appendChild(eingabefeld);

					// Textabsatz mit Lösungshinweis erstellen
					p = q.dd_domCreate({
						tagName: "p",
						// die eigentliche Lösungshilfe
						text : wert.hilfe.replace(/^\d+ */, "")
					});

					// Die Richtung (mehrsprachig!) in einem extra <span>-Element
					p.insertBefore(
						q.domCreate({
							tagName : "span",
							className : "richtung",
							text: q.meldungen[t.sprache][wert.richtung] + ":"
						}),
						p.firstChild
					);

					// Nummer auch in einem extra <span>-Element
					dvTemp= /^(\d+).*/.exec(wert.hilfe);
					p.insertBefore(
						q.domCreate({
							tagName : "span",
							className : "nummer",
							text: RegExp.$1
							//text: wert.hilfe.replace(/^(\d+).*$/, "$1")
						}),
						p.firstChild
					);

					eingabefeld.appendChild(p);

					// korrespondierende Zellen ermitteln, um bereits Eingetragenes mit anzubieten
					zellen = t.findeZellen({
						wort : wert.wort,
						x : wert.x,
						y : wert.y,
						richtung : wert.richtung
					});

					// Textabsatz als Eingabezeile erstellen, in welchem die Eingaben in <span>-Elementen stehen
					p = q.domCreate({
						tagName : "p",
						className : "eingabezeile"
					});
					eingabefeld.appendChild(p);

					// <span>-Elemente erstellen
					for (w = 0; w < wert.wort.length; w++) {
						// bereits vorhandenen Zelleninhalt vorbereiten
						test = zellen[w].innerHTML.replace(
							// HTML-Tags entfernen
							/<\/?[^>]+>/g, ""
						).replace(
							// Leerzeichen
							/&nbsp;/g, " "
						).replace(
							// nur letztes Zeichen nehmen (es könnte ja auch eine Eingabeziffer darin stehen)
							/.*(.)$/, "$1"
						).quizTrim();

						// Zelleninhalt voreintragen
						p.appendChild(q.domCreate({
							tagName : "span",
							text : (test.length > 0 ? test : String.fromCharCode(160)),
							// dem versteckten Textinput den Focus geben
							onmouseup : function () {
								q.each(q.domSelect("span", this.parentNode), function (s) {
									s.className = "";
								});

								this.className = "aktiv";
								q.domSelect(".texteingabefeld", this.parentNode)[0].focus();
							}
						}));
					}

					// Submit-Button braucht keinen Eventhandler, da das Formular onsubmit geprüft wird.
					p.appendChild(q.domCreate({
						tagName : "input",
						type : "submit",
						value : q.meldungen[t.sprache].eintragen
					}));

					// Das versteckte Textinputfeld, das nach jedem Tastendruck ausgelesen wird.
					p.appendChild(q.domCreate({
						tagName : "input",
						type : "text",
						className : "texteingabefeld",
						// Eventhandler für jeden Tastenanschlag
						onkeyup : function (e) {
							return t.tasteAuswerten({
								obj: this,
								e: e
							});
						},
						// Eventhandler für das Verlieren des Focus
						onblur : function () {
							q.each(q.domSelect("span", this.parentNode), function(s) {
								s.className = "";	
							});
						}
					}));

					// Erstes Eingabefeld aktiv setzen und den Fokus auf das versteckte Eingabefeld legen:
					window.setTimeout(function () {
						t.eingabefeldAktivieren({
							eingabezeile: q.domSelect(".eingabezeile", t.eingabe)[0],
							feldnummer: 0, // null für erstes Feld
						});
					}, 300);
				});

				t.eingabe.style.display = "block";

				return false;
			},

			// Eingabefeld aktivieren
			eingabefeldAktivieren : function (werte) {
				/* "werte " hat folgende Struktur:  {
					eingabezeile: <HTMLParagraphElement>,
					feldnummer: <Number> (Wert beginnend bei 0!)
				} */
				var spans = q.domSelect("span", werte.eingabezeile);

				q.each(spans, function (s) {
					s.className = "";
				});

				if (werte.feldnummer < spans.length) {
					spans[werte.feldnummer].className = "aktiv";
				}

				q.domSelect(".texteingabefeld", werte.eingabezeile)[0].focus();
			},

			tasteAuswerten : function (werte) {
				// "werte" hat folgende Struktur; { obj: <input>-Element, e: event}
				var t = this,
					spans = q.domSelect("span", werte.obj.parentNode),
					gefunden = false,
					i, j, z;

				werte.e = werte.e || window.event;

				// aktuelles aktives Eingabefeld ermitteln
				for (i = 0; i < spans.length; i++) {
					if (spans[i].className == "aktiv") {
						gefunden = i;
					}
				}


				switch (werte.e.keyCode) {
					case 35: // End (Ende)
						// letztes Feld!
						t.eingabefeldAktivieren({
							eingabezeile: werte.obj.parentNode,
							feldnummer: spans.length -1
						});
					break;
					case 36: // Home (Pos1)
						// erstes Feld!
						t.eingabefeldAktivieren({
							eingabezeile: werte.obj.parentNode,
							feldnummer: 0
						});
					break;
					case 37: // Cursor left
					case 8: // Backspace
						// ein Feld zurück!
						if (gefunden !== false) {
							gefunden = gefunden > 0 ? gefunden -1 : 0;

						} else {
							// letztes Feld anwählen, da gerade keines aktiv war
							gefunden = spans.length -1;
							/* eventuell eingegebene Zeichen im <input>-Element entfernen,
								da diese sonst jetzt automatisch eingetragen werden! */
							werte.obj.value = "";
						}

						// bei Backspace Feld leeren!
						if (werte.e.keyCode == 8) {
							spans[gefunden].innerHTML = String.fromCharCode(160);
						}

						t.eingabefeldAktivieren({
							eingabezeile: werte.obj.parentNode,
							feldnummer: gefunden
						});
					break;
					case 39: // Cursor right
						// ein Feld vor!
						if (gefunden !== false) {
							gefunden = gefunden < spans.length -2 ? gefunden +1 : spans.length -1;

							t.eingabefeldAktivieren({
								eingabezeile: werte.obj.parentNode,
								feldnummer: gefunden
							});
						}
					break;
				}

				if (werte.obj.value.length > 0) {
					z = q.wandleZeichen(werte.obj.value.substr(0, 1));
					// bisherige Eingaben wieder löschen, da immer nur erster Buchstabe genommen wird
					werte.obj.value = "";

					if (z.length > 0) {
						j = false;
						for (i = 0; i < spans.length; i++) {
							if (spans[i].className && spans[i].className == "aktiv") {
								j = i;
							}
						}

						// eventuell sollen mehrere Zeichen eingetragen werden (z.B. bei Ligaturen oder Umlauten)
						for (i = 0; i < z.length; i++) {
							if (spans[j + i]) {
								spans[j + i].innerHTML = z.substr(i, 1);
							}
						}

						t.eingabefeldAktivieren({
							eingabezeile : spans[0].parentNode,
							feldnummer : j + i
						});
					}
				}
			},

			/* Funktion zum Ermitteln aller HTML-Elemente (td), in die ein Lösungswort
				geschrieben werden muss */
			findeZellen : function (werte) {
				/* "werte" hat folgende Struktur: {
					wort: <String>,
					x: <Number>,
					y: <Number>,
					richtung: "waagrecht|senkrecht"
				} */
				var t = this,
					zellen = new Array(),
					zelle, x, y, i;

				for (i = 0; i < werte.wort.length; i++) {
					zelle = werte.richtung == "waagrecht" ?
						q.domSelect("tr", t.tabelle)[werte.y] :
						q.domSelect("tr", t.tabelle)[werte.y + i];

					if (zelle) {
						zelle = werte.richtung == "waagrecht" ?
							q.domSelect("td", zelle)[werte.x + i] :
							q.domSelect("td", zelle)[werte.x];
					}

					if (zelle) {
						zellen.push(zelle);
					}
				}

				return zellen;
			},

			// Funktion zum Errichten der Tabelle des Kreuzwort-Quiz und zum Einrichten der Eventhandler
			// Fonction pour établir la table des mots croisés jeu-questionnaire et de mettre en place le gestionnaire d'événement
			init : function () {
				var t = this,
					kreuzwortGitter, tr, td, a, x, y;

				// Spracheinstellungen auf deutsch zurück korrigieren, falls entsprechende Sprachdaten fehlen
				if (!q.meldungen[t.sprache]) {
					t.sprache = "de";
				}

				/* Wörtergitter erzeugen, sodass nach Möglichkeit keine alleinstehenden Wörter
					im Gitter enthalten sind */
				kreuzwortGitter = q.erstelleWoerterGitter(
					t.daten,
					true, // true für "alle verbunden"
					false // false für "keine diagonalen Wörter"
				);

				// Daten und Gitter abspeichern
				t.daten = kreuzwortGitter.woerter;
				t.grid = kreuzwortGitter.gitter;

				// Tabelle befüllen
				for (y = 0; y < t.grid.length; y++) {
					tr = t.tabelle.insertRow(
						t.tabelle.rows.length <= 0 ? 0 : t.tabelle.rows.length
					);

					for (x = 0; x < this.grid[0].length; x++) {
						td = q.domCreate({
							tagName : "td",
							id : t.name + "_" + x + "_" + y
						});

						if (t.grid[y][x]) {
							td.id += "_" + t.grid[y][x];
							td.className = t.loesungsClass;
						}

						// Le contenu des cellules
						if (t.grid[y][x]) {
							td.appendChild(q.domCreate({
								tagName : "span",
								className : t.loesungsClass2,
								text : String.fromCharCode(160)
							}));

						} else {
							td.innerHTML = String.fromCharCode(160);
						}

						// Accrochez cellule de la ligne
						tr.appendChild(td);
					}
				}

				// Réglage des points de repère et des gestionnaires d'événements
				a = 1;
				q.each(t.daten, function (d) {
					var nummer = a, // Nummer der aktuellen Einfügemarke merken
						marke;

					x = d.x;
					y = d.y;

					if (td = t.tabelle.rows[y] && t.tabelle.rows[y].cells[x]) {
						// bereits eine Einfügemarke vorhanden?
						td.style.cursor = "pointer";

						if (!td.nummer) {
							// Nein! -> Einfügemarke erstellen
							marke = q.domCreate({
								tagName : "span",
								className : "einfuegemarke",
								text : nummer
							});

							td.insertBefore(marke, td.firstChild);
							td.nummer = nummer;
							a++; // Ziffer der Einfügemarke erhöhen

						} else {
							// Nummer der vorhandenen Einfügemarke merken
							nummer = td.nummer;
						}

						// Lösungshilfe mit Nummer der Einfügemarke versehen
						d.hilfe = nummer + " " + d.hilfe;

						// Eventhandler einrichten / erweitern
						td.daten = td.daten || new Array();
						td.daten.push(d); // auszuwertende Daten für Eingabedialog hinzufügen

						if (typeof(td.onclick) != "function") {
							td.onclick = function () {
								t.eintragen(this.daten);
							};
						}
						//dv_modif
						$("#"+d.dvName).click(function() {
							var dvWerte={};
							dvWerte.quizItem=d;
							dvWerte.wort=$("#"+d.dvName).val();
							dvWerte.dvTest=true;
							t.auswerten(dvWerte);
						});
					}
				});

				// Créer Panneau de saisie
				t.eingabe.className = "eingabe " + q.draggableClass;

				// Header des Eingabebereichs
				t.eingabe.appendChild(q.domCreate({
					tagName : "div",
					className : "eingabe-header"
				}));

				// "schließen"-Schaltfläche
				t.eingabe.lastChild.appendChild(q.domCreate({
					tagName : "span",
					className : "schliessen-button",
					onclick : function () {
						this.parentNode.parentNode.style.display = "";
					}
				}));

				t.eingabe.lastChild.lastChild.style.cursor = "pointer";

				// Textabsatz für einen Eingabehinweis erstellen, der ein verdecktes <span>-Element enthält
				t.eingabe.appendChild(q.domCreate({
					tagName : "p",
					className : "eingabehinweis",
					// Anzeigen des verdeckten <span>-Elementes bei Hover (für IE notwendig)
					onmouseover : function () {
						this.childNodes[0].style.display = "block";
					},
					// Verbergen des verdeckten <span>-Elementes beim Verlassen
					onmouseout : function () {
						this.childNodes[0].style.display = "";
					}
				}));

				// entrée Remarque
				t.eingabe.lastChild.appendChild(q.domCreate({
					tagName : "span",
					text : q.meldungen[t.sprache].eingabehinweis
				}));

				t.tabelle.parentNode.insertBefore(t.eingabe, t.tabelle.nextSibling);

				// Faire la boîte par des gestionnaires d'événements pour les boîtes mobiles dans une fenêtre faux
				t.element.onmousedown = q.startDrag;
				t.element.onmouseup = q.stopDrag;

				// Auswertungsbutton erstellen
				t.auswertungsButton = q.domCreate({
					tagName : "p",
					className : "auswertungs-button",
					text : q.meldungen[t.sprache].pruefen,
					onclick : function () { t.auswerten("auswertungs-button"); }
				});

				// ID für das umgebende DIV-Element vergeben
				t.element.id = t.name;

				// Afficher une liste des aides de solutions pour l'impression
				t.element.appendChild(q.domCreate({
					tagName : "div",
					className : "uebersicht"
				}));

				// listes de sortie
				q.each(["senkrecht", "waagrecht"], function (r) {
					// Liste erzeugen
					var dl = q.domCreate({ tagName : "dl" });

					dl.appendChild(q.domCreate({
						tagName : "dt",
						text : q.meldungen[t.sprache][r]
					}));

					// passende Lösungshilfen ausfiltern
					q.each(t.daten, function (d) {
						if (d.richtung == r) {
							dl.appendChild(q.domCreate({
								tagName : "dd",
								text : d.hilfe.replace(/^\d+(.*)/, "$1")
							}));

							dl.lastChild.appendChild(q.domCreate({
								tagName : "span",
								text : d.hilfe.replace(/^(\d+).*/, "$1")
							}));
						}
					});

					t.element.lastChild.appendChild(dl);
				});
				dv_init_grille();
			},
		};

		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function () {
			i++;
		});
		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		tabelle = q.domSelect("table", div);

		if (tabelle.length < 1) {
			return false;
		}

		// Daten sind also vorhanden? -> Tabellenzeilen nach Daten durchforsten
		q.each(tabelle[0].rows, function (tr) {
			var gefunden = new Array();

			if (tr.cells.length > 1) {
				// "Müll" entfernen
				gefunden[0] = tr.cells[0].innerHTML.replace(
					/<\/?[^>]+>/g, ""
				).replace(
					/&amp;/g, "&"
				).replace(
					/&nbsp;/g, " "
				).replace(/ /g, "_");

				gefunden[1] = tr.cells[1].innerHTML;
				/*dv_modif
				 * .replace(
					/<\/?[^>]+>/g, ""
				).replace(
					/&amp;/g, "&"
				).replace(/&nbsp;/g, " ");
				*/
				// Lösungswort in reine Großbuchstaben umwandeln
				gefunden[0] = q.wandleZeichen(gefunden[0]).toUpperCase();
				if(tr.cells[2]){
					gefunden[2] = tr.cells[2].innerHTML;
				}else{
					gefunden[2] ="";
				}
				if (gefunden[0] != "" && gefunden[1] != "") {
					quiz.daten.push({
						wort : gefunden[0].quizTrim(),
						x : -1,
						y : -1,
						hilfe : gefunden[1].quizTrim(),
						dvName : gefunden[2].quizTrim()
					});
				}
			}
		});

		// Keine brauchbare Daten? -> Verwerfen!
		if (quiz.daten.length < 1) {
			return false;
		}

		// originale Tabelle durch leere Tabelle ersetzen
		quiz.tabelle = document.createElement("table");
		quiz.tabelle.className = "gitter";
		tabelle[0].parentNode.insertBefore(quiz.tabelle, tabelle[0].nextSibling);
		tabelle[0].parentNode.removeChild(tabelle[0]);

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},

	erstelleWoerterGitter : function (woerter, alleVerbunden, diagonaleWoerter, keineFreienZwischenRaeume) {
		/* übergebene Parameter
			@woerter:
				Ein Array mit Wort-Objekten. Ein Wort-Objekt hat mindestens diese Struktur:
				wort = {
					wort : (String),
					hilfe : (String), // nur bei Aufruf aus dem Kreuzworträtsel-Quiz heraus
					wortOriginal : (String) // nur bei Aufruf aus dem Suchsel-Quiz heraus
				}
				Nach dieser Funktion kann ein Wort-Objekt dann auch so aussehen
				wort = {
					wort : (String),
					x : (Integer),
					y : (Integer),
					richtung : (String), "waagrecht|senkrecht"
					hilfe : (String), // nur bei Aufruf aus dem Kreuzworträtsel-Quiz heraus
					wortOriginal : (String) // nur bei Aufruf aus dem Suchsel-Quiz heraus
				}
			@alleVerbunden (true|false):
				Wenn true, werden bis zu 10 Versuche unternommen, ein Gitter zu erstellen,
				bei dem alle Begriffe miteinander verbunden sind.
			@diagonaleWoerter (true|false):
				Wenn true, werden Wörter auch diagonal eingepasst. Dabei ist die
				Leserichtung immer von links nach rechts, egal ob das Wort von links
				oben nach rechts unten, oder von links unten nach rechts oben verläuft.
		*/
		var q = this;
		var fertige = new Array(); // Array mit fertigen Gittern
		var makel = 1, maxVersuche = alleVerbunden ? 10 : 1;
		var richtungen = diagonaleWoerter ?
			["waagrecht", "senkrecht", "diagonal-loru", "diagonal-luro"]
			:
			["waagrecht", "senkrecht"];
		var grid, abgelegte, erfolglose, test, zufall, i, wort, a,
			eingepasst, x, y, nummer, p, button, input, buchstaben, b, d, moeglicheRichtungen, r;

		// Gitter erzeugen, falls das nicht ohne Makel gelingt, bis zu 10x
		while (makel > 0 && fertige.length < maxVersuche) {
			makel = 0; // zuerst davon ausgehen, dass ein perfektes Gitter entstehen wird
			abgelegte = new Array(); // es wurde noch nichts abgelegt
			erfolglose = new Array(); // es gibt noch keine erfolglos eingepassten Wörter

			// Grid aufbauen
			test = 0;
			q.each(woerter, function (w) {
				test += w.wort.length; // Anzahl Buchstaben insgesamt
			});

			grid = new Array(test);
			for (i = 0; i < test; i++) {
				grid[i] = new Array(test);
			}

			// Wörter in zufälliger Reihenfolge ins Gitter einpassen - wenn es gelingt
			while (abgelegte.length < woerter.length) {

				test = true; // neue Zufallszahl erzwingen
				while (test) {
					zufall = Math.floor(Math.random() * woerter.length);
					test = false; // annehmen, dass die Zufallszahl noch nicht benutzt wurde

					// Wort bereits abgelegt?
					q.each(abgelegte, function (a) {
						if (a.wort == woerter[zufall].wort) {
							test = true;
						}
					});

					if (erfolglose.length > 0) {
						// bereits erfolglos probierte Wörter ausschließen
						q.each(erfolglose, function (e) {
							if (woerter[zufall] == e) {
								test = true;
							}
						});
					}
				}

				// Jetzt haben wir ein Wort zum Einpassen in das Gitter
				wort = woerter[zufall];
				wort.x = -1;
				wort.y = -1;

				// geeignete Stelle finden, um es einzupassen
				if (abgelegte.length > 0) {

					// weiteres Wort einfügen -> bereits eingesetzte Wörter der Reihe nach durchgehen
					for (a = 0; a < abgelegte.length; a++) {

						// schon eine passende Stelle zum Einpassen ermittelt?
						if (wort.x >= 0 && wort.y >= 0)
							break; // Ja! -> abbrechen!

						// zufälligen Buchstaben des Wortes nehmen und nach Übereinstimmungen mit eingepasstem Wort suchen
						buchstaben = new Array(); // benutzte Buchstaben leeren
						for (b = 0; b < wort.wort.length; b++) {

							// schon eine passende Stelle zum Einpassen ermittelt?
							if (wort.x >= 0 && wort.y >= 0)
								break; // Ja! -> abbrechen!

							test = true; // neue Zufallszahl erzwingen
							while (test) {
								zufall = Math.floor(Math.random() * wort.wort.length);
								test = buchstaben[zufall];
							}

							buchstaben[zufall] = true; // Buchstaben als benutzt markieren

							// Buchstabe in beiden Wörtern vorhanden?
							if (abgelegte[a].wort.indexOf(wort.wort.substr(zufall, 1)) >= 0) {

								// Ja! -> jeden Buchstaben des bereits eingepassten Wortes durchgehen
								for (eingepasst = 0; eingepasst < abgelegte[a].wort.length; eingepasst++) {

									// Wort bereits erfolgreich eingepasst?
									if (wort.x >= 0 && wort.y >= 0)
										break; // Ja! -> abbrechen

									if (abgelegte[a].wort.substr(eingepasst, 1) == wort.wort.substr(zufall, 1)) {
										// übereinstimmender Buchstabe ermittelt! -> Wort testweise ins Gitter einpassen
										test = true; // davon ausgehen, dass das Wort passt...

										// Position des Buchstabens im Gitter ermitteln
										if (abgelegte[a].richtung == "waagrecht") {
											x = abgelegte[a].x + eingepasst;
											y = abgelegte[a].y;
										}
										if (abgelegte[a].richtung == "senkrecht") {
											x = abgelegte[a].x;
											y = abgelegte[a].y + eingepasst;
										}
										if (abgelegte[a].richtung == "diagonal-loru") {
											x = abgelegte[a].x + eingepasst;
											y = abgelegte[a].y + eingepasst;
										}
										if (abgelegte[a].richtung == "diagonal-luro") {
											x = abgelegte[a].x + eingepasst;
											y = abgelegte[a].y - eingepasst;
										}

										// mögliche Richtungen für neu einzupassendes Wort ermitteln
										moeglicheRichtungen = [];
										for (i = 0; i < richtungen.length; i++) {
											if (richtungen[i] != abgelegte[a].richtung) {
												moeglicheRichtungen.push(richtungen[i]);
											}
										}
										moeglicheRichtungen.shuffle();

										while (moeglicheRichtungen.length) {
											// Richtung des einzupassenden Wortes festlegen
											wort.richtung = moeglicheRichtungen.pop();

											// im Gitter die Startposition des einzupassenden Wortes ermitteln
											if (wort.richtung == "senkrecht") {
												y = y - zufall; // "zufall" ist der Abstand des entsprechenden Buchstabens zum Wortbeginn
											}
											if (wort.richtung == "waagrecht") {
												x = x - zufall;
											}
											if (wort.richtung == "diagonal-loru") {
												x = x - zufall;
												y = y - zufall;
											}
											if (wort.richtung == "diagonal-luro") {
												x = x - zufall;
												y = y + zufall;
											}

											// zu belegende Felder im Gitter prüfen
											for (i = 0; i < wort.wort.length; i++) {

												if (wort.richtung == "waagrecht") {
													if (grid[y][x + i] && grid[y][x + i] != wort.wort.substr(i, 1)) {
														test = false;
													}

													// nebenan frei? (Kosmetik)
													if (!keineFreienZwischenRaeume) {
														/* alle bereits abgelegten Wörter daraufhin prüfen, ob sie im
														Bereich des Wortes parallel in einer Nachbarzeile verlaufen */
														q.each(abgelegte, function (a) {
															if (a.richtung == "waagrecht"
																&& (a.y + 1 == y
																|| a.y -1 == y)
															) {
																if (// Nachbarwort länger?
																	(a.x <= x &&
																	a.wort.x + a.wort.length >= x + wort.wort.length)
																	||
																	// Nachbarwort überlappt Anfang
																	(a.x <= x
																	&& a.x + a.wort.length >= x)
																	||
																	// Nachbarwort beginnt mitten im Wort
																	(a.x > x
																	&& a.x <= x + wort.wort.length)
																) {
																	test = false; // ja -> verwerfen
																}
															}
															// beginnt ein senkrechtes Wort direkt unterhalb?
															if (a.richtung == "senkrecht" && a.y - 1 == y) {
																if (a.x >= x && a.x <= x + wort.wort.length) {
																	test = false; // ja -> verwerfen
																}
															}
														});
													}
												}
												if (wort.richtung == "senkrecht") {
													if (grid[y + i][x] && grid[y + i][x] != wort.wort.substr(i, 1)) {
														test = false;
													}

													// nebenan frei? (Kosmetik)
													if (!keineFreienZwischenRaeume) {
														/* alle bereits abgelegten Wörter daraufhin prüfen, ob sie im
														Bereich des Wortes parallel in einer Nachbarspalte verlaufen */
														q.each(abgelegte, function (a) {
															if (a.richtung == "senkrecht"
																&& (a.x == x + 1
																|| a.x == x - 1)
															) {
																if (// Nachbarwort länger?
																	(a.y <= y &&
																	a.wort.y + a.wort.length >= y + wort.wort.length)
																	||
																	// Nachbarwort überlappt Anfang
																	(a.y <= y
																	&& a.y + a.wort.length >= y)
																	||
																	// Nachbarwort beginnt mitten im Wort
																	(a.y > y
																	&& a.y <= y + wort.wort.length)
																) {
																	test = false; // leider nein
																}
															}
															// verläuft ein waagrechtes Wort direkt nebenan?
															if (a.richtung == "waagrecht" &&
																(a.x == x + 1 || a.x == x - wort.wort.length - 1)
															) {
																if (a.y >= y && a.y <= y + wort.wort.length) {
																	test = false; // ja -> verwerfen
																}
															}
														});
													}
												}
												if (wort.richtung == "diagonal-loru") {
													if (grid[y + i][x + i] && grid[y + i][x + i] != wort.wort.substr(i, 1)) {
														test = false;
													}
												}
												if (wort.richtung == "diagonal-luro") {
													if (grid[y - i][x + i] && grid[y - i][x + i] != wort.wort.substr(i, 1)) {
														test = false;
													}
												}
											}

											// Ist vor und nach dem Wort noch Platz? (Kosmetik)
											if (wort.richtung == "waagrecht") {
												if (grid[y][x - 1] || grid[y][x + wort.wort.length])
													test = false;
											}
											if (wort.richtung == "senkrecht") {
												if (grid[y - 1][x] || grid[y + wort.wort.length][x])
													test = false;
											}
											if (wort.richtung == "diagonal-loru") {
												if (grid[y - 1][x - 1] || grid[y + wort.wort.length][x + wort.wort.length])
													test = false;
											}
											if (wort.richtung == "diagonal-luro") {
												if (grid[y + 1][x - 1] || grid[y - wort.wort.length][x + wort.wort.length])
													test = false;
											}

											if (test) {
												// hat gepasst! -> Wort übernehmen lassen!
												wort.x = x;
												wort.y = y;
												erfolglose = new Array(); // erfolglos eingepasste Wörter wieder versuchen
												break; // weitere Tests abbrechen
											}
										}

										if (test)
											break; // weitere Tests abbrechen
									}
								}
							}
						}
					}

					if (wort.x < 0 && wort.y < 0) {
						// hat nicht gepasst! -> merken
						erfolglose.push(wort);

						if (erfolglose.length == (woerter.length - abgelegte.length)) {
							// anscheinend gibt es für die restlichen Wörter überhaupt keine geeignete Stelle... -> ein freies Plätzchen für aktuelles Wort finden! -> oben (0), links(1), unten(2) oder rechts(3)
							makel ++;

							zufall = Math.floor(Math.random() * 4);

							if (zufall & 1 == 1) {
								// links / rechts
								y = Math.floor(grid.length / 2) - Math.floor(wort.wort.length / 2);
								x = (zufall & 2) == 2 ? 0 : grid[0].length; // Wert muss unter- bzw. überboten werden, daher ist er zu klein/groß

							} else {
								// oben / unten
								x = Math.floor(grid[0].length / 2);
								y = (zufall & 2) == 2 ? 0 : grid.length;
							}

							wort.richtung = (zufall & 1) == 0 ? "waagrecht" : "senkrecht";

							// Koordinaten der abgelegten Wörter durchgehen, um freie Stelle zu ermitteln
							q.each(abgelegte, function (a) {
								if ((zufall & 1) == 1) {
									// links / rechts einschränken
									if ((zufall & 2) == 0 && a.x < x)
										x = a.x;

									if ((zufall & 2) == 2) {
										test = a.x;
										if (a.richtung == "waagrecht")
											test += a.wort.length;

										if (test > x)
											x = test;
									}

								} else {
									// oben / unten einschränken
									if ((zufall & 2) == 0 && a.y < y)
										y = a.y;

									if ((zufall & 2) == 2) {
										test = a.y;
										if (a.richtung == "senkrecht")
											test += a.wort.length;

										if (test > y)
											y = test;
									}
								}
							});

							// geeignete Position zum Einpassen gefunden!
							wort.x = (zufall & 2) == 0 ? x - 2 : x + 2;
							wort.y = (zufall & 2) == 0 ? y - 2 : y + 2;

							erfolglose = [];
						}
					}

				} else {
					// es ist das erste Wort -> direkt (senkrecht) einpassen
					wort.x = Math.floor(grid[0].length / 2);
					wort.y = Math.floor(grid.length / 2) - Math.floor(wort.wort.length / 2);
					wort.richtung = "senkrecht";
				}

				// abspeichern wenn Wort erfolgreich eingepasst werden konnte
				if (wort && wort.x >= 0 && wort.y >= 0) {
					abgelegte.push(wort);

					// Buchstaben in das Gitter eintragen
					for (i = 0; i < wort.wort.length; i++) {
						if (wort.richtung == "waagrecht") {
							grid[wort.y][wort.x + i] = wort.wort.substr(i, 1);
						}
						if (wort.richtung == "senkrecht") {
							grid[wort.y + i][wort.x] = wort.wort.substr(i, 1);
						}
						if (wort.richtung == "diagonal-loru") {
							grid[wort.y + i][wort.x + i] = wort.wort.substr(i, 1);
						}
						if (wort.richtung == "diagonal-luro") {
							grid[wort.y - i][wort.x + i] = wort.wort.substr(i, 1);
						}
					}
				}
			}

			// fertig erstelltes und bestücktes Gitter abspeichern
			fertige.push({
				gitter : grid,
				daten : abgelegte,
				makel : makel
			});
		}

		// eventuell wurden nun mehrere Gitter erstellt
		if (makel > 0) {

			// anscheinend wurde kein perfektes Gitter erstellt -> das beste aus den maximal zehn erstellten aussuchen
			test = false;
			q.each(fertige, function (f) {
				if (!test || f.makel < test.makel)
					test = f;
			});

			// bester Versuch wurde ermittelt -> nehmen
			grid = test.gitter;
			abgelegte = test.daten;

		}

		// ausgewähltes Gitter beschneiden
		a = {
			x : {
				min : grid[0].length,
				max : 0
			},

			y : {
				min : grid.length,
				max : 0
			}
		};

		for (y = 0; y < grid.length; y++) {
			for (x = 0; x < grid[0].length; x++) {
				// Zelle befüllt? -> Koordinaten benutzen!
				if (grid[y][x]) {

					// min-Werte bei Bedarf verkleinern!
					a.x.min = (a.x.min > x) ? x : a.x.min;
					a.y.min = (a.y.min > y) ? y : a.y.min;

					// max-Werte  bei Bedarf erhöhen
					a.x.max = (a.x.max < x) ? x : a.x.max;
					a.y.max = (a.y.max < y) ? y : a.y.max;
				}
			}
		}

		// min/max-Maße ermittelt -> Gitterinhalt in beschnittenes Gitter übertragen
		test = new Array(a.y.max - a.y.min + 1);

		for (y = 0; y < (a.y.max - a.y.min + 1); y++) { // zeilenweise
			test[y] = new Array(a.x.max - a.x.min + 1);
			for (x = 0; x < (a.x.max - a.x.min + 1); x++) { // spaltenweise
				if (grid[y + a.y.min][x + a.x.min])
					test[y][x] = grid[y + a.y.min][x + a.x.min]; // Inhalt übertragen
			}
		}

		grid = test; // altes Gitter durch neues ersetzen

		// eingetragene Koordinaten der Wörter korrigieren
		for (i = 0; i < abgelegte.length; i++) {
			abgelegte[i].x = abgelegte[i].x - a.x.min;
			abgelegte[i].y = abgelegte[i].y - a.y.min;
		}

		return { gitter : grid, woerter : abgelegte };
	},


	/* Diese Funktion erzeugt ein Suchsel-Quiz. Dazu braucht sie ein Elternelement mit dem
	CSS-Klassen-Präfix "suchsel", z.B. "suchsel-quiz", wenn "-quiz" das Suffix der Quiz.triggerClass ist.
	Die Daten für das Quiz müssen in einer einspaltigen Tabelle stehen.
	*/

	suchselQuiz : function (div) {
		var q = this,
			i, tabelle;

		var quiz = {
			// Objekt-Gestalt eines Suchsel-Quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "Suchsel-Quiz",
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			tabelle : null, // Referenz auf das HTML-Element, in dem das Suchsel angezeigt wird
			daten : new Array(), // Hier stehen später Objekte, die die Quiz-Daten enthalten.
			versuche : 0, // Speichert die Anzahl Versuche, die für die Lösung gebraucht wurden.
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung
			loesungsliste : null, // Referenz auf ein <ol>-Objekt, in dem bereits gefundene Wörter angezeigt werden
			markierungStart : null, // Referenz auf das erste markierte <td>-Element
			markierungEnde : null, // Referenz auf das letzte markierte <td>-Element

			// Funktion zum Auswerten der Lösungen
			auswerten : function () {
				var t = this,
					el = q.domSelect(".markiert", t.tabelle),
					betroffene = [],
					felder = [];

				if (el.length > 1) {
					t.versuche++;

					// Koordinaten der markierten Felder ermitteln
					q.each(el, function (f) {
						felder.push({
							buchstabe : f.innerHTML,
							x : f.id.replace(/^quiz\d+_(\d+)_.*/i, "$1"),
							y : f.id.replace(/.*_(\d+)$/i, "$1")
						});
					});

					// Jedes Lösungswort prüfen, ob sein Anfangsbuchstabe markiert wurde
					q.each(t.daten, function (d) {
						q.each(felder, function (f) {
							if (d.x == f.x && d.y == f.y) {
								// Lösungswort merken
								betroffene.push(d);
							}
						});
					});

					// Jedes betroffene Lösungswort prüfen, ob es vollständig markiert wurde
					q.each(betroffene, function (b) {
						var erfolg;

						// stimmt die Anzahl markierter Felder exakt?
						if (b.wort.length == felder.length) {
							// prüfen, ob alle markierten Felder auch die richtigen Felder sind
							erfolg = b; // mal davon ausgehen, dass alles passt

							q.each(felder, function (f) {
								if (b.richtung == "senkrecht") {
									// x-Werte immer identisch!
									if (f.x != b.x || f.y < b.y
										|| f.y > b.y + b.wort.length -1
									) {
										erfolg = false;
									}
								}

								if (b.richtung == "waagrecht") {
									// y-Werte immer identisch
									if (f.y != b.y || f.x < b.x
										|| f.x > b.x + b.wort.length -1
									) {
										erfolg = false;
									}
								}

								if (b.richtung == "diagonal-loru") {
									if (f.x - f.y != b.x - b.y
										|| f.x < b.x
										|| f.x > b.x + b.wort.length -1
										|| f.y < b.y
										|| f.y > b.y + b.wort.length -1
									) {
										erfolg = false;
									}
								}

								if (b.richtung == "diagonal-luro") {
									if (Math.abs(f.x) + Math.abs(f.y) != b.x + b.y
										|| f.x < b.x
										|| f.x > b.x + b.wort.length -1
										|| f.y > b.y
										|| f.y < b.y - b.wort.length -1
									) {
										erfolg = false;
									}
								}
							});

							if (erfolg) {
								// "erfolg" enthält das Datenobjekt der Lösung
								q.each(el, function(f) {
									// Markierungen dauerhaft machen
									f.className = f.className.replace(/ markiert/, "") + " aufgedeckt";
								});

								// Fund in die Liste eintragen
								erfolg.eingetragen = false;
								el = q.domSelect("li", t.loesungsliste);

								q.each(el, function (li) {
									// Wort bereits gefunden worden?
									if (li.innerHTML == erfolg.wortOriginal) {
										erfolg.eingetragen = true;
									}

									if (!erfolg.eingetragen &&
										(!li.className || li.className != "ausgefuellt")
									) {
										li.innerHTML = erfolg.wortOriginal;
										li.className = "ausgefuellt";

										erfolg.eingetragen = true;

										if (q.domSelect(
												".ausgefuellt", t.loesungsliste
											).length == el.length
										) {
											// letztes Wort wurde gefunden!
											t.beenden();
										}
									}
								});
							}
						}
					});
				}

				return false;
			},

			// entferne alle Markierungen
			alleMarkierungenEntfernen : function (mitHover) {
				var t = this;

				q.each(q.domSelect(".markiert", t.tabelle), function (f) {
					f.className = f.className.replace(/(^| )markiert/, "");
				});

				if (mitHover) {
					q.each(q.domSelect(".hover", t.tabelle), function (f) {
						f.className = f.className.replace(/(^| )hover/, "");
					});
				}
			},

			// Felder markieren, die die gegenwärtige Auswahl darstellen
			auswahlMarkieren : function () {
				var t = this,
					richtung = "",
					el, ende, start, steigung, x, y;

				/* In welche Richtung geht die Markierung denn?
					-> Zeilenweise die Tabelle durchlaufen,
					um X- und Y-Koordinaten der Markierungsenden zu ermitteln */
				for (y = 0; y < t.tabelle.rows.length; y++) {
					for (x = 0; x < t.tabelle.rows[y].cells.length; x++) {
						if (t.tabelle.rows[y].cells[x] == t.markierungStart) {
							start = { x : x, y : y };
						}

						if (t.tabelle.rows[y].cells[x] == t.markierungEnde) {
							ende = { x : x, y : y };
						}
					}
				}

				// Fehler passiert? -> beenden
				if (!start || !ende) {
					return false;
				}

				// Steigung bestimmen, in der die Markierung erfolgen soll
				if ((ende.y - start.y) === 0) {
					// Division by Zero!
					steigung = 2; // hier genügt ein Wert > 1.5
				} else {
					// Quotient ist "legal"
					steigung = (ende.x - start.x) / (ende.y - start.y);
				}

				// Richtung aus der Steigung und der Koordinaten bestimmen
				if (Math.abs(steigung) >= 0.5 && Math.abs(steigung) <= 1.5) {
					// diagonal
					richtung = steigung > 0 ? "nw-so" : "no-sw";
				} else {
					// waagrecht/senkrecht
					richtung = Math.abs(steigung) > 1 ? "w-o" : "n-s";
				}

				// alle zu markierenden Felder ermitteln und markieren
				x = start.x;
				y = start.y;
				el = t.tabelle.rows[y].cells[x];

				while (el) {
					el.className = el.className.replace(/(^| )markiert/, "") + " markiert";
					// "richtung" enthält nun einen String (n-s|w-o|nw-so|no-sw)
					switch (richtung) {
						case "n-s":
							// nur y-Wert weiterzählen
							if (start.y > ende.y && y > ende.y) {
								y--;
							}

							if (start.y < ende.y && y < ende.y) {
								y++;
							}
						break;

						case "w-o":
							// nur x-Wert weiterzählen
							if (start.x > ende.x && x > ende.x) {
								x--;
							}

							if (start.x < ende.x && x < ende.x) {
								x++;
							}
						break;

						case "nw-so":
							if (start.x > ende.x && x > ende.x
								&&
								start.y > ende.y && y > ende.y
							) {
								x--;
								y--;
							}

							if (start.x < ende.x && x < ende.x
								&&
								start.y < ende.y && y < ende.y
							) {
								x++;
								y++;
							}
						break;

						case "no-sw":
							if (start.x > ende.x && x > ende.x
								&&
								start.y < ende.y && y < ende.y
							) {
								x--;
								y++;
							}

							if (start.x < ende.x && x < ende.x
								&&
								start.y > ende.y && y > ende.y
							) {
								x++;
								y--;
							}
						break;
					}

					// aufhören, wenn kein neues Feld zu markieren ist
					el = (el != t.tabelle.rows[y].cells[x]) ?
						t.tabelle.rows[y].cells[x] : false;
				}
			},

			// Quiz wurde erfolgreich gelöst -> Meldung ausgeben
			beenden : function () {
				var t = this;

				t.element.appendChild(q.domCreate({
					tagName : "p",
					className : q.bewertungsClass,
					text : q.meldungen[t.sprache]["lob" + (t.versuche > 2 ? 3 : t.versuche)]
						+ " "
						+ q.meldungen[t.sprache][
							"ergebnis" + (t.versuche > 2 ? 3 : t.versuche)
						].replace(/%n/i, t.versuche)
				}));

				// Auswertungs-Button und alle Eventhandler entfernen
				t.tabelle.onmousedown = null;
				t.tabelle.onmousemove = null;
				t.tabelle.onmouseover = null;
				t.tabelle.onmouseup = null;
				t.solved = true;
				t.element.className += " "+q.fertigClass;
			},

			// Funktion zum Errichten der Tabelle des Suchsel-Quiz und zum Einrichten der Eventhandler
			init : function () {
				var t = this,
					kreuzwortGitter, platzhalter, tr, x, y;

				// Spracheinstellungen auf deutsch zurück korrigieren, falls entsprechende Sprachdaten fehlen
				if (!q.meldungen[t.sprache]) {
					t.sprache = "de";
				}

				// Gitter erzeugen
				kreuzwortGitter = q.erstelleWoerterGitter(
					t.daten,
					true, // true für "alle Wörter verbunden"
					true  // true für "diagonale Wörter möglich"
				);

				// Daten und Gitter abspeichern
				t.daten = kreuzwortGitter.woerter;
				t.grid = kreuzwortGitter.gitter;

				// Lösungsliste befüllen
				platzhalter = 0;
				q.each(t.daten, function (d) {
					if (platzhalter < d.wortOriginal.length) {
						platzhalter = d.wortOriginal.length;
					}
				});

				platzhalter = new Array(platzhalter +3).join("_");

				q.each(t.daten, function (d) {
					t.loesungsliste.appendChild(q.domCreate({
						tagName : "li",
						text : platzhalter
					}));
				});

				// Tabelle befüllen
				for (y = 0; y < t.grid.length; y++) {
					tr = t.tabelle.insertRow(
						t.tabelle.rows.length <= 0 ? 0 : t.tabelle.rows.length
					);

					for (x = 0; x < t.grid[0].length; x++) {
						// Zelleninhalt vorbereiten
						tr.appendChild(q.domCreate({
							tagName : "td",
							id : t.name + "_" + x + "_" + y,
							text : t.grid[y][x] ?
								t.grid[y][x] : String.fromCharCode(
									65 + Math.floor(Math.random() * 26)
								).toUpperCase()
						}));
					}
				}

				// ID für das umgebende DIV-Element vergeben
				t.element.id = t.name;

				// Markierungsmechanismus einrichten
				t.tabelle.onmousedown = function (e) {
					var el = q.eventElement(e);

					if (el.tagName && el.tagName.match(/^td$/i)) {
						el.className = el.className.replace(/(^| )hover/, "") + " markiert";

						// Beginn der Markierung merken
						t.markierungStart = el;

						// Markiermodus einschalten
						t.markiermodus = true;

						// Markierungseffekt im IE unterbinden
						q.antiMarkierungsModusFuerIE(true);

						// Markierungseffekt in W3C-konformen Browsern unterbinden
						if (window.getSelection) {
							window.getSelection().removeAllRanges();
						}
					}

					return true;
				};

				t.tabelle.onmouseover = function (e) {
					var el = q.eventElement(e);

					if (el.tagName && el.tagName.match(/^td$/i) && t.markiermodus) {
						t.markierungEnde = el;

						// bestehende Markierungen entfernen
						t.alleMarkierungenEntfernen();

						// neue Markierungen setzen
						t.auswahlMarkieren();
					}

					return true;
				};

				t.tabelle.onmousemove = function (e) {
					var el = q.eventElement(e);

					if (!t.markiermodus) {
						t.alleMarkierungenEntfernen(true); // mit Hover

						// setze hover-Markierung für aktuelles Element
						if (el.tagName && el.tagName.match(/^td$/i)) {
							el.className += " hover";
						}

					} else {
						// Markierungseffekt in W3C-konformen Browsern unterbinden
						if (window.getSelection) {
							window.getSelection().removeAllRanges();
						}
					}

					return true;
				};

				t.element.onmouseup = function (e) {
					// markierte Felder auswerten
					t.auswerten();

					// alle Markierungen entfernen
					t.alleMarkierungenEntfernen();

					// Beende Markiermodus
					t.markiermodus = false;

					// Markierungseffekt im IE wieder erlauben
					q.antiMarkierungsModusFuerIE();

					return true;
				};

				t.tabelle.onmouseout = function (e) {
					if (!t.markiermodus) {
						// entferne alle Markierungen (samt hover)
						t.alleMarkierungenEntfernen(true);
					}
				};
			}
		};

		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function() {
			i++;
		});
		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		tabelle = q.domSelect("table", div);

		if (tabelle.length < 1) {
			return false;
		}

		// Daten sind also vorhanden? -> Auswerten
		q.each(tabelle[0].rows, function (tr) {
			var gefunden;

			if (tr.cells.length > 0) {
				// "Müll" entfernen
				gefunden = tr.cells[0].innerHTML.replace(
					/<\/?[^>]+>/g, ""
				).replace(
					/&amp;/g, "&"
				).replace(
					/&nbsp;/g, " "
				).replace(
					/ /g, "_"
				).quizTrim();

				if (gefunden != "") {
					quiz.daten.push({
						// Lösungswort in reine Großbuchstaben umwandeln
						wort : q.wandleZeichen(gefunden).toUpperCase(),
						wortOriginal : gefunden,
						x : -1,
						y : -1
					});
				}
			}
		});

		// Keine brauchbare Daten? -> Verwerfen!
		if (quiz.daten.length < 1) {
			return false;
		}

		// originale Tabelle durch leere Tabelle ersetzen
		quiz.tabelle = q.domCreate({
			tagName : "table",
			className : "gitter"
		});
		tabelle[0].parentNode.insertBefore(quiz.tabelle, tabelle[0].nextSibling);
		tabelle[0].parentNode.removeChild(tabelle[0]);

		// Liste mit gefundenen Lösungen erstellen
		quiz.loesungsliste = q.domCreate({
			tagName : "ol",
			className : "liste"
		});
		div.appendChild(quiz.loesungsliste);

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},


	/* Diese Funktion erzeugt ein Quiz, das man auch als Hangman-Quiz kennt. Es müssen die Buchstaben
	eines Wortes geraten werden, um zu einer Lösung zu geraten. Zu viele Fehlversuche führen zum Verlieren
	des Spiels. */

	buchstabenratenQuiz : function (div) {
		var q = this,
			i, tabelle, test, daten, gefunden;

		var quiz = {
			// Objekt-Gestalt eines Suchsel-Quizzes
			name : "Quiz-x", // Platzhalter - hier steht später etwas anderes.
			typ : "Buchstabenraten-Quiz",
			element : div, // Referenz auf das DIV-Element, in welchem sich das Quiz befindet
			feld : null, // Referenz auf das HTML-Element, in dem das eigentliche Spiel angezeigt wird
			daten : new Array(), // Hier stehen später Objekte, die die Quiz-Daten enthalten.
			versuche : 0, // Speichert die Anzahl Versuche, die für die Lösung gebraucht wurden.
			sprache : (div.lang && div.lang != "") ? div.lang : "de", // deutsche Meldungen als Voreinstellung
			erkannteWoerter : new Array(), // speichert die bereits erratenen Wörter
			gestartet : false, // Steuert, ob Tastatureingaben überhaupt ausgewertet werden
			bilder : new Array(
				/* Hier stehen die Bilddateien für die verschiedenen Stadien der Grafik, die das drohende
				Spielende darstellt. Dabei gilt die erste Grafik als Spielende und die letzte Grafik als Spielstart. */
				"blume00.gif",
				"blume01.gif",
				"blume02.gif",
				"blume03.gif",
				"blume04.gif",
				"blume05.gif",
				"blume06.gif",
				"blume07.gif",
				"blume08.gif",
				"blume09.gif",
				"blume10.gif"
			),

			// Funktion zum Auswerten der Lösungen
			auswerten : function (keyCode) {
				var t = this,
					c = q.wandleZeichen(String.fromCharCode(keyCode)),
					schonGeraten, treffer, ul, li;

				if (c) {
					ul = q.domSelect(".geratene-buchstaben ul", t.element)[0]; // Element muss vorhanden sein

					// testen, ob dieser Buchstabe bereits geraten worden war
					q.each(ul.childNodes, function (li) {
						if (li.firstChild.data == c) {
							schonGeraten = true;
						}
					});

					// noch nicht geraten worden? -> auf Treffer testen
					if (!schonGeraten) {
						li = q.domCreate({
							tagName : "li",
							text : c
						});

						ul.appendChild(li);

						// Ist der Buchstabe im Lösungswort enthalten?
						ul = q.domSelect(".ratewort ", t.element)[0]; // Element ist garantiert vorhanden

						q.each(ul.childNodes, function (l) {
							if (l.buchstabe == c) {
								treffer = true;
								l.className = "erraten";
								l.firstChild.data = l.buchstabe;
								li.className = "treffer";
							}
						});
					}

					// Ergebnis?
					if (!treffer) {
						t.versuche++;

						// Statusbild aktualisieren
						q.domSelect(".statusbild img", t.feld)[0].src = q.baseURL
							+ "/images/"
							+ t.bilder[t.bilder.length - 1 - t.versuche];

						// Spiel zu Ende?
						if (t.versuche == t.bilder.length - 1) {
							t.beenden();
						}

					} else {
						// Wort komplett erkannt?
						q.each(ul.childNodes, function (li) {
							// ul ist #ratewort! Prüfen ob alle Felder einen Buchstaben enthalten
							if (li.firstChild.data == String.fromCharCode(160)) {
								treffer = false; // nicht alle Buchstaben sind schon erkannt
							}
						})

						if (treffer) {
							// nächstes Wort erraten lassen
							t.erkannteWoerter.push(t.daten[t.erkannteWoerter.length]);

							if (t.versuche > 0) {
								t.versuche--;
							}

							window.setTimeout(
								function () {
									t.wortAbfragen();
								},
								2000
							);
						}
					}
				}
			},

			// Funktion zum starten des Quiz-Vorgangs
			wortAbfragen : function () {
				var t = this,
					platzhalter, i;

				// "Spielfeld" aufbauen
				while (t.feld.firstChild) {
					t.feld.removeChild(t.feld.firstChild);
				}

				if (t.erkannteWoerter.length < t.daten.length) {
					// Statusbild einfügen
					t.feld.appendChild(q.domCreate({
						tagName : "p",
						className : "statusbild"
					}));

					t.feld.lastChild.appendChild(q.domCreate({
						tagName : "img",
						src : q.baseURL + "images/" + t.bilder[t.bilder.length - 1 - t.versuche]
					}));

					// Eingabehinweis
					t.feld.appendChild(q.domCreate({
						tagName : "p",
						className : "eingabehinweis",
						// Anzeigen des verdeckten <span>-Elementes bei Hover (für IE notwendig)
						onmouseover : function () {
							this.childNodes[0].style.display = "block";
						},
						// Verbergen des verdeckten <span>-Elementes beim Verlassen
						onmouseout : function () {
							this.childNodes[0].style.display = "";
						}
					}));

					t.feld.lastChild.appendChild(q.domCreate({
						tagName : "span",
						text : q.meldungen[t.sprache].eingabehinweis_buchstabenraten
					}));

					// Leerfelder für das zu erratende Wort aufbauen
					t.feld.appendChild(q.domCreate({
						tagName : "ul",
						className : "ratewort",
						wort : t.daten[t.erkannteWoerter.length].wort
					}));

					q.each(t.daten[t.erkannteWoerter.length].wort.split(""), function (c) {
						t.feld.lastChild.appendChild(q.domCreate({
							tagName : "li",
							text: String.fromCharCode(160),
							buchstabe : q.wandleZeichen(c)
						}));
					});
				}

				// Liste bereits gefundener Wörter erstellen
				platzhalter = 0;
				q.each(t.daten, function (d) {
					if (platzhalter < d.wort.length) {
						platzhalter = d.wort.length;
					}
				});

				platzhalter = new Array(platzhalter +3).join("_");

				t.feld.appendChild(q.domCreate({
					tagName : "div",
					className : "erkannte-woerter"
				}));

				t.feld.lastChild.appendChild(q.domCreate({
					tagName : "p",
					text: q.meldungen[t.sprache].erkannteWoerter
				}));

				t.feld.lastChild.appendChild(q.domCreate({
					tagName : "ol"
				}));

				for (i = 0; i < t.daten.length; i++) {
					t.feld.lastChild.lastChild.appendChild(q.domCreate({
						tagName : "li",
						className : t.erkannteWoerter[i] ? "erkannt" : "",
						text : t.erkannteWoerter[i] ?
							t.erkannteWoerter[i].wortOriginal : platzhalter
					}));
				}

				if (t.erkannteWoerter.length < t.daten.length) {
					// Liste bereits geratener Buchstaben erstellen
					t.feld.appendChild(q.domCreate({
						tagName : "div",
						className : "geratene-buchstaben"
					}));

					t.feld.lastChild.appendChild(q.domCreate({
						tagName : "p",
						text: q.meldungen[t.sprache].gerateneBuchstaben
					}));

					t.feld.lastChild.appendChild(q.domCreate({
						tagName : "ul"
					}));

					// Tastatureingabe einschalten
					t.gestartet = true;

				} else {
					// Quiz schon zu ende gespielt?
					t.beenden();
				}
			},

			// Meldung zu Spielende ausgeben + Neustart-Button
			beenden : function () {
				var t = this;

				// erneutes Spiel anbieten
				t.feld.appendChild(t.startLink);
				t.startLink.firstChild.data = q.meldungen[t.sprache].erneut;

				t.solved = true;
				t.element.className += " "+q.fertigClass;
			},

			// Quiz initialisieren
			init : function () {
				var t = this;

				// ID für das umgebende DIV-Element vergeben
				t.element.id = t.name;

				// Start-Link erzeugen
				t.startLink = q.domCreate({
					tagName : "p",
					className : "start-link",
					text : q.meldungen[t.sprache].quizStarten,
					onclick : function () {
						t.solved = false;
						t.element.className = t.element.className.replace(
							new RegExp(" ?" + q.fertigClass), ""
						);
						t.daten.shuffle();
						t.versuche = 0;
						t.erkannteWoerter = new Array();
						t.wortAbfragen();
					}
				});

				t.feld.appendChild(t.startLink);

				// Tastaturabfrage einrichten
				t.element.onkeyup = function (e) {
					e = e || window.event;

					if (q.aktivesQuiz === t && !t.solved && t.gestartet) {
						t.auswerten(e.keyCode);
					}

					return true;
				};
			}
		};

		// Laufende Nummer ermitteln -> Quiz-Name wird "quiz" + laufende Nummer
		i = 0;
		q.each(q.alleQuizze, function () {
			i++;
		});
		quiz.name = "quiz" + i;

		// Gibt es Quiz-Daten?
		tabelle = q.domSelect("table", div);

		if (tabelle.length < 1) {
			return false;
		}

		// Daten sind also vorhanden? -> Auswerten
		q.each(tabelle[0].rows, function (tr) {
			var gefunden;

			if (tr.cells.length > 0) {
				// "Müll" entfernen
				gefunden = tr.cells[0].innerHTML.replace(
					/<\/?[^>]+>/g, ""
				).replace(
					/&amp;/g, "&"
				).replace(
					/&nbsp;/g, " "
				).replace(
					/ /g, "_"
				).quizTrim();

				if (gefunden != "") {
					quiz.daten.push({
						// Lösungswort in reine Großbuchstaben umwandeln
						wort : q.wandleZeichen(gefunden).toUpperCase(),
						wortOriginal : gefunden,
						x : -1,
						y : -1
					});
				}
			}
		});

		// Keine brauchbare Daten? -> Verwerfen!
		if (quiz.daten.length < 1) {
			return false;
		}

		// originale Tabelle entfernen
		tabelle[0].parentNode.removeChild(tabelle[0]);

		// "Spielfeld" erstellen und ins Dokument schreiben
		quiz.feld = q.domCreate({ tagName : "div" });
		quiz.element.appendChild(quiz.feld);

		// Quiz in die Liste aufnehmen und initialisieren
		q.alleQuizze[quiz.name] = quiz;
		quiz.element.quiz = quiz;
		quiz.init();

		return true;
	},

	// Voreinstellungen für Mehrsprachigkeit
	meldungen : {
		de : {
			pruefen : 'prüfen!',
			lob1 : 'Ausgezeichnet!',
			lob2 : 'Gut gemacht!',
			lob3 : 'Das war nicht schlecht!',
			ergebnis1 : 'Die Aufgabe wurde gleich beim ersten Versuch erfolgreich gelöst!',
			ergebnis2 : 'Die Aufgabe wurde nach nur zwei Versuchen erfolgreich gelöst!',
			ergebnis3 : 'Die Aufgabe wurde nach %n Versuchen erfolgreich gelöst!',
			alleGefunden : 'Alle Sets gefunden!', // memo-quiz - Es können auch Triplets, Quartette und mehr gefunden werden müssen
			erneut : 'Wie wär\'s mit einer neuen Runde?',
			ergebnisProzent : 'Die Antworten sind zu %n% richtig.', // Multiple-Choice-Quiz
			senkrecht : 'Senkrecht', // Kreuzworträtsel
			waagrecht : 'Waagrecht',
			eingabehinweis : 'Klicken Sie auf ein gr\u00fcnes Feld, um einen Buchstaben einzugeben!',
			eingabehinweis_buchstabenraten : 'Benutzen Sie die Tastatur zur Eingabe! Eventuell m\u00fcssen Sie erst in das Quiz klicken, um es zu aktivieren.'
		}
	},

 /*weitere Funktionen
==================
 weitere Funktionen
==================
 */
	// Zeichen in eintragbare Buchstaben umwandeln: "s" ist ein String
	wandleZeichen : function (s) {
		var q = this,
			r = "",
			z, i, j;

		for (i = 0; i < s.length; i++) {
			if (s[i] == String.fromCharCode(160) || s[i] == String.fromCharCode(32)) {
				r += String.fromCharCode(160);

			} else {
				for (z in q.codeTabelle) {
					if (z.match(/^[A-Z][A-Z]?$/)) {
						for (j = 0; j < q.codeTabelle[z].length; j++) {
							if (s.substr(i, 1) == q.codeTabelle[z][j]) {
								r += z;
							}
						}
					}
				}
			}
		}

		return r;
	},

	initQuizze : function () {
		var q = this;

		// prüfen, ob Code-Tabelle für UTF-8-Normalisierung und Mehrsprachenunterstützung geladen wurden
		if (!q.codeTabelle || !q.meldungen.en || !q.domSelect) {
			window.setTimeout(q.initQuizze, 100);
			return false;
		}

		// Initialisierung der Quizze
		var quizBereiche = new Array(),
			muster = new RegExp(q.triggerClass),
			i, j, a, gefunden, typ, ok, css;

		// Alle DIVs daraufhin überprüfen, ob sie eine CSS-Klasse haben, die auf ein Quiz schließen lässt
		q.each(q.domSelect("div"), function (d) {
			if (d.className && d.className.match(muster)) {
				quizBereiche.push(d);
			}
		});

		// Alle Quiz-Bereiche gefunden -> Initialisieren
		if (quizBereiche.length > 0) {
			q.each(quizBereiche, function (d) {
				var typ = d.className.replace(/([^ ,]+)-quiz/, "$1"),
					gefunden, ok; // Initialisierung ok?

				if (typeof(q[typ + "Quiz"]) == "function") {
					ok = q[typ + "Quiz"](d); // entsprechende Quiz-Funktion zum Erstellen aufrufen
				}

				// Initialisierung OK? -> Warnungen entfernen
				if (ok) {
					q.each(q.domSelect(".js-hinweis", d), function (j) {
						j.parentNode.removeChild(j);
					});
				}
			});
		}

		// Wenn mindestens ein Quiz initialisiert wurde, dann Seite "bestücken".
		if (q.alleQuizze.quiz0) {
			// CSS für Quizbereiche einbinden
			q.domSelect("head")[0].appendChild(
				q.domCreate({
					tagName : "link",
					rel : "stylesheet",
					type : "text/css",
					media : "screen, projection",
					href : q.baseURL + "css/quiz.css"
				})
			);

			// Print-CSS für Quizbereiche einbinden
			q.domSelect("head")[0].appendChild(
				q.domCreate({
					tagName : "link",
					rel : "stylesheet",
					type : "text/css",
					media : "print",
					href : q.baseURL + "css/quiz-print.css"
				})
			);

			// IE-spezifische Stylesheets einbinden
			/*@cc_on
				@if (@_jscript_version == 5.6)
					// zusätzliches Stylesheet für IE6 einbinden
					q.domSelect("head")[0].appendChild(
						q.domCreate({
							tagName : "link",
							rel : "stylesheet",
							type : "text/css",
							media : "screen, projection",
							href : q.baseURL + "css/quiz-ie6.css"
						})
					);
				@end

				@if (@_jscript_version == 5.7)
					// zusätzliches Stylesheet für IE7 einbinden
					q.domSelect("head")[0].appendChild(
						q.domCreate({
							tagName : "link",
							rel : "stylesheet",
							type : "text/css",
							media : "screen, projection",
							href : q.baseURL + "css/quiz-ie7.css"
						})
					);
				@end
			@*/

			// Links innerhalb eines Quizzes solange deaktivieren, bis es gelöst ist:
			q.each(q.alleQuizze, function (a) {
				if (a.felder) {
					q.each(a.felder, function (f) {
						gefunden = [];

						if (f.getElementsByTagName) {
							gefunden = f.getElementsByTagName("a");
						}

						if (f.element && f.element.getElementsByTagName) {
							gefunden = f.element.getElementsByTagName("a");
						}

						q.each(gefunden, function (g) {
							g.quiz = a;
							g.oldOnClick = g.onclick;
							g.onclick = q.linkOnClick; // neue onclick-Funktion, die Klicks blocken kann
						});
					});
				}

				// onclick-EventHandler für jedes <div> eines Quizzes setzen
				if (typeof a.element.onclick == "function") {
					a.element.oldOnClick = a.element.onclick;
				}

				a.element.onclick = function (e) {
					q.aktivesQuiz = this.quiz;
					if (typeof this.oldOnClick == "function") {
						this.oldOnClick(e);
					}
					return true;
				};
			});
		}
	},

	// neue onclick-Funktion für Links
	linkOnClick : function (e) {
		if (this.quiz.typ == "Multiple Choice - Quiz"
			|| this.quiz.typ == "Buchstabenraten-Quiz"
			|| this.quiz.solved
		) {
			if (typeof this.oldOnClick == "function") {
				this.oldOnClick(e);
			}

			return true;
		}

		return false;
	},

	/* Funktionen für Drag&Drop-Mechanismus */
	eventElement : function (e) {
		// ermittle aktuelles Element unter dem Mauszeiger
		e = e || window.event;

		return e.target || e.srcElement; // W3C DOM <-> IE
	},

	auswahl : function (element, ziel) {
		if (!Quiz.baseURL)
			Quiz.init();

		if (ziel) {
			// Drag&Drop hat stattgefunden!
			Quiz.aktivesQuiz.dragNDropAuswerten(element, ziel);
		}

		// User-Eingabe war "nur ein Klick"...
		return false;
	},

	startDrag : function (e) {
		var q = Quiz,
			muster = new RegExp("(^|\\s)" + q.draggableClass + "(\\s|$)"),
			test;

		q.dragElm = q.eventElement(e);

		test = q.dragElm;

		/* Nur bei Klick auf ein entsprechend ausgezeichnetes Element
			(oder eines seiner Nachfahren-Elemente) Drag&Drop-Verhalten zeigen! */
		while (test != document.body
			&& (!test.className
				|| !test.className.match(muster)
		)) {
			test = test.parentNode;
		}

		if (test != document.body && test.className.match(muster)) {
			q.dragElm = test;
			q.dragMode = true;

			// aktives Quiz eintragen
			q.aktivesQuiz = q.alleQuizze[q.dragElm.id.replace(/^([^_]+).+/, "$1")];
console.debug("aktives Quiz: "+q.aktivesQuiz.name+"quiz.loesungsClass: "+q.aktivesQuiz.loesungsClass);
		}

		return !q.dragMode;
	},

	whileDrag : function (e) {
		var q = Quiz,
			muster = new RegExp("(^|\\s)" + q.feldClass + "(\\s|$)"),
			top, left, dx, dy, offsetX, offsetY, element;

		e = e || window.event;

		left = e.clientX,
		top = e.clientY

		q.IE = (document.compatMode && document.compatMode == "CSS1Compat") ?
			document.documentElement : document.body || null;

		if (q.IE && typeof (q.IE.scrollLeft) == "number") {
			left += q.IE.scrollLeft;
			top +=  q.IE.scrollTop;
		}

		// Abstand zu den letzten Mauskoordinaten berechnen
		dx = q.mouseLastCoords.left - left;
		dy = q.mouseLastCoords.top - top;

		// Mauskoordinaten speichern
		q.mouseLastCoords.left = left;
		q.mouseLastCoords.top = top;

		// falls gerade kein Element gezogen wird, hier beenden
		if (!q.dragElm || !q.dragMode) {
			return true;
		}

		// falls das zu ziehende Element noch nicht "losgelöst" wurde, dieses beweglich machen
		if (!q.dragged) {
			q.dragElmOldVisibility = q.dragElm.style.visibility;

			// Nur Felder neu positionieren
			if (q.dragElm.className.match(muster)
				|| q.dragElm.style.left == ""
			) {
				q.dragElm.style.top = "0px";
				q.dragElm.style.left = "0px";
			}

			// Markierungseffekt im IE unterbinden
			q.antiMarkierungsModusFuerIE(true);

			q.dragElm.className += " " + q.draggedClass;
		}

		if (q.visibilityCount < 1) {
			// Durchscheinen, damit ein mouseover-Event des unterhalb liegenden Elementes möglich wird
			q.dragElm.style.visibility = "hidden";
		}

		// zu ziehendes Element bewegen
		left = parseInt(q.dragElm.style.left);
		top = parseInt(q.dragElm.style.top);
		q.dragElm.style.left = left - dx + "px";
		q.dragElm.style.top = top - dy + "px";
		q.dragged = true;

		// Zähler zurücksetzen
		q.visibilityCount = q.visibilityCount < 1 ?
			Math.ceil(q.visibilityCountDefault) : q.visibilityCount -1;

		return true;
	},

	stopDrag : function (e) {
		var q = Quiz,
			returnVal;

		if (!q.dragElm || !q.dragElm.className) {
			return false;
		}

		// Anti-Markier-Effekt in IE beenden
		q.antiMarkierungsModusFuerIE();

		if (q.dragged) {
			// eventuelle aktive Eingabefelder deaktivieren - aber nur wenn Drag&Drop stattgefunden hat!
			q.each(q.domSelect("input"), function (i) {
				try { i.blur(); }
				catch (e) { }

				try { i.onblur(); }
				catch (e) { }
			});
		}

		// bewegtes Element wieder eingliedern
		q.dragElm.className = q.dragElm.className.replace(
			new RegExp(" ?" + q.draggedClass), ""
		);

		// Sichtbarkeit wurde nur verändert, wenn das Element wirklich gezogen wurde...
		if (q.dragged) {
			q.dragElm.style.visibility = q.dragElmOldVisibility;
			q.dragElmOldVisibility = "";
		}

		// Position (nur!) bei Feldern wieder zurückstellen
		if (q.dragElm.className.match(new RegExp("(^|\\s)" + q.feldClass + "(\\s|$)"))
			&& q.dragged
		) {
			q.dragElm.style.top = "";
			q.dragElm.style.left = "";
		}

		// Rückgabewert bereitstellen
		returnVal = q.dragged ?
			// für Drag&Drop
			q.auswahl(q.dragElm, q.highlightElm) :
			// für einen simplen Klick (zweiter Parameter false!)
			q.auswahl(q.dragElm, false);

		// Variablen wieder löschen
		q.dragElm = null;
		q.dragged = false;
		q.dragMode = false;

		// gehighlightetes Element wieder abstellen
		if (q.highlightElm) {
			q.highlightElm.className = q.highlightElm.className.replace(
				new RegExp(" ?" + q.highlightClass), ""
			);
			q.highlightElm = null;
		}

		return returnVal;
	},

	highlight : function (e) {
		var q = Quiz,
			old = q.highlightElm,
			test, original, muster;

		if (!q.dragMode) {
			// Kein Drag&Drop-Vorgang!
			return true;
		}

		if (!q.dragElm.style.visibility || q.dragElm.style.visibility != "hidden") {
			// Das zu ziehende Element ist gerade nicht auf unsichtbar geschaltet! Kein Highlighting möglich!
			return true;
		}

		// befinden wir uns innerhalb des richtigen Quizzes?
		original = q.eventElement(e);
		test = original;

		while (!test.tagName || (
			!test.tagName.match(/^div$/i)
			&& test != document.body
		)) {
			test = test.parentNode;
		}

		if (!q.aktivesQuiz
			|| test == document.body
			|| (
				test.tagName.match(/^div$/i)
				&& test.id != q.aktivesQuiz.name
			)
		) {
			// Falsches Quiz! Beenden!
			return true;
		}

		// anvisiertes Lösungs-Element highlighten
		muster = new RegExp(
			"(^|\\s)("
			+ q.aktivesQuiz.loesungsClass
			+ "|"
			+ q.poolClass
			+ ")(\\s|$)");

		/* wenn aktuelles Element nicht die benötigte CSS-Klasse hat
			-> Element im DOM-Baum aufwärts suchen gehen... */
		test = original;

		while (!test.className.match(muster)
			&& test != q.aktivesQuiz.element
			&& test != document.body
		) {
			test = test.parentNode;
		}

		// passendes Element gefunden?
		if (!test.className.match(muster)) {
			// Nein! -> beenden
			return true;
		}

		q.highlightElm = test;

		// Highlighten!
		if (old) {
			// altes Highlight entfernen, falls vorhanden
			muster = new RegExp(" ?" + q.highlightClass, "");
			old.className = old.className.replace(muster, "");
		}

		// neues Element highlighten
		q.highlightElm.className += " " + q.highlightClass;

		return true;
	},

	einBlender : function (e) {
		var q = Quiz;

		if (q.dragElm) {
			q.dragElm.style.visibility = q.dragElmOldVisibility;
		}

		return true;
	},

	antiMarkierungsModusFuerIE : function (schalter) {
		var q = this;

		if (schalter) {
			// Anti-Markierungs-Effekt für IE einschalten
			q.oldDocOnSelectStart = document.onselectstart;
			q.oldDocOnDragStart = document.ondragstart;
			document.onselectstart = function () { return false;};
			document.ondragstart = function () { return false;};

		} else {
			// Anti-Markier-Effekt für IE beenden
			if (q.oldDocOnSelectStart
				|| typeof(document.onselectstart) == "function"
			) {
				document.onselectstart = q.oldDocOnSelectStart;
			}

			if (q.oldDocOnDragStart
				|| typeof(document.ondragstart) == "function"
			) {
				document.ondragstart = q.oldDocOnDragStart;
			}
		}
	}

};
//dv_modif initialisation
function dd_write_donnee(werte){
	/* "werte" hat folgende Struktur: {
	w or*t: <String>,
	quizItem: {
	wort: <String>,
	x: <Number>,
	y: <Number>,
	hilfe: <String>,
	richtung: "waagrecht|senkrecht",
	name: <String>
	},
	form: <HTMLFormObject>
		} */
	var nom_champ=werte.quizItem.dvName;
	$("#"+nom_champ).val(werte.wort);
}

function dv_init_grille(){
	var dvElement = $("td[class*='feld'][style]");
	for(t=0;t<dvElement.length;t++){
		var obj=dvElement[t].daten[0];
//		Quiz.kreuzwortQuiz.quiz.auswerten(obj);
		
	}
	//var dvElement = $("table");
	var toto=1;
}

// initialisieren
Quiz.init();
