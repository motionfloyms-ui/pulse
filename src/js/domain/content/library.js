// SOURCE: domain/content/library.js
/* Ready-made content for every room. Read-only reference material; copying it into the
   personal collection is always an explicit user action. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseLibrary=api})(globalThis,function(){
'use strict';
const TYPES={recipe:'Rezept',prompt:'Impuls',practice:'Übung',read:'Lesestoff',list:'Liste',knowledge:'Wissen',tarot:'Tarot'};

/* ---------- Tarot ---------- */
const MAJORS=[
['Der Narr','Aufbruch · Vertrauen · Neugier aufs Ungewisse','Leichtsinn oder Zögern vor dem ersten Schritt','Wo darf ich anfangen, ohne schon alles zu wissen?'],
['Der Magier','Wille · Können · Werkzeuge bündeln','Zerstreute Kraft, Tricks statt Handwerk','Was habe ich eigentlich schon in der Hand?'],
['Die Hohepriesterin','Intuition · Stille · verborgenes Wissen','Abgeschnitten von der eigenen inneren Stimme','Was weiß ich, ohne es begründen zu können?'],
['Die Herrscherin','Fülle · Sinnlichkeit · Fürsorge · Wachstum','Erschöpft vom Geben, kreativer Stillstand','Was in mir will genährt werden?'],
['Der Herrscher','Struktur · Grenzen · Verantwortung','Starrheit, Kontrolle aus Angst','Welche Ordnung trägt mich – und welche engt mich ein?'],
['Der Hierophant','Tradition · Lehre · Zugehörigkeit','Regeln hinterfragen, den eigenen Weg suchen','Von wem lerne ich – und was davon passt wirklich zu mir?'],
['Die Liebenden','Wahl · Verbindung · Werte','Zwiespalt, Entscheidung gegen sich selbst','Wofür entscheide ich mich wirklich?'],
['Der Wagen','Richtung · Willenskraft · Gegensätze lenken','Ziellosigkeit, Kontrollverlust','Wohin will ich steuern?'],
['Kraft','Sanfte Stärke · Geduld · Mut','Selbstzweifel oder Härte gegen sich','Wo hilft Sanftheit mehr als Druck?'],
['Der Eremit','Rückzug · Suche · inneres Licht','Isolation statt Einkehr','Was finde ich nur, wenn ich allein bin?'],
['Rad des Schicksals','Wandel · Zyklen · Wendepunkt','Gegen einen Wandel ankämpfen','Was dreht sich gerade – und was davon liegt bei mir?'],
['Gerechtigkeit','Klarheit · Ausgleich · Konsequenz','Unausgewogenheit, Selbsttäuschung','Was wäre fair – auch mir selbst gegenüber?'],
['Der Gehängte','Innehalten · Perspektivwechsel · Hingabe','Feststecken, Warten ohne Sinn','Wie sieht es von der anderen Seite aus?'],
['Der Tod','Ende · Übergang · Raum für Neues (selten wörtlich)','Festhalten an etwas, das vorbei ist','Was darf zu Ende gehen?'],
['Mäßigkeit','Balance · Mischen · Geduld','Übermaß, Ungeduld','Was braucht ein besseres Mischverhältnis?'],
['Der Teufel','Bindungen · Muster · Verlangen','Ein Muster erkennen und lösen','Was hält mich fest – und halte ich es selbst?'],
['Der Turm','Erschütterung · Wahrheit bricht durch','Einen nötigen Umbruch hinauszögern','Was in meinem Leben ist auf Sand gebaut?'],
['Der Stern','Hoffnung · Heilung · Offenheit','Entmutigung, den Glauben verloren','Was gibt mir wieder Zuversicht?'],
['Der Mond','Unklarheit · Träume · das Unbewusste','Der Nebel beginnt sich zu lichten','Was zeigt sich nur im Halbdunkel?'],
['Die Sonne','Freude · Klarheit · Lebendigkeit','Gedämpfte Freude, Wolken davor','Was macht mich hell?'],
['Das Gericht','Erwachen · Ruf · ehrliche Bilanz','Harte Selbstkritik, einen Ruf überhören','Wozu fühle ich mich gerufen?'],
['Die Welt','Vollendung · Ganzheit · Ankommen','Offene Enden, fast fertig','Was ist rund geworden?']
];
const SUITS=[
{id:'staebe',name:'Stäbe',element:'Feuer',theme:'Energie, Antrieb, Kreativität, Leidenschaft',dat:'in meinem Antrieb',acc:'meinen Antrieb'},
{id:'kelche',name:'Kelche',element:'Wasser',theme:'Gefühle, Beziehungen, Intuition',dat:'in meinen Gefühlen und Beziehungen',acc:'meine Gefühle und Beziehungen'},
{id:'schwerter',name:'Schwerter',element:'Luft',theme:'Denken, Wahrheit, Konflikt, Klarheit',dat:'in meinem Denken',acc:'mein Denken'},
{id:'pentakel',name:'Pentakel',element:'Erde',theme:'Körper, Alltag, Geld, Handwerk',dat:'in meinem Körper und Alltag',acc:'meinen Körper und Alltag'}
];
const RANKS=[
['Ass','Anfang · reines Potenzial','Was will {d} neu beginnen?'],
['Zwei','Wahl · Balance · Begegnung','Wo wäge ich {d} gerade ab?'],
['Drei','Wachstum · erste Ergebnisse · Gemeinschaft','Was wächst {d} – und mit wem?'],
['Vier','Stabilität · Ruhe – oder Stillstand','Wo suche ich {d} Halt, wo halte ich nur fest?'],
['Fünf','Reibung · Verlust · Herausforderung','Was ist {d} gerade schwer?'],
['Sechs','Ausgleich · Austausch · Erholung','Wo kommt {d} etwas wieder in Fluss?'],
['Sieben','Prüfung · Abwägen · Standhalten','Was muss ich {d} genauer prüfen?'],
['Acht','Bewegung · Übung · Tempo','Wo bin ich {d} in Bewegung?'],
['Neun','Fast am Ziel · Intensität','Was ist {d} beinahe geschafft?'],
['Zehn','Abschluss · Fülle – oder zu viel','Was ist {d} vollendet – oder zur Last geworden?'],
['Bube','Neugier · Lernen · Botschaft','Was möchte ich {d} lernen?','Tochter'],
['Ritter','Aufbruch · Tempo · Einsatz','Wohin treibt es mich {d}?','Sohn'],
['Königin','Reife nach innen · Fürsorge','Wie pflege ich {a}?','Mutter'],
['König','Reife nach außen · Verantwortung','Wie zeige ich {a} in der Welt?','Vater']
];
const MINORS={
staebe:[
['Funke · neue Idee · Schaffenskraft','Zögern, der Funke droht zu erlöschen','Wofür brennt gerade etwas Neues in mir?'],
['Planen · Weitblick · den Weg wählen','Angst vor dem Unbekannten, Planlosigkeit','Bleibe ich – oder gehe ich los?'],
['Ausblick · Expansion · erste Erfolge in der Ferne','Verzögerung, Ungeduld mit dem Tempo','Was kommt gerade auf mich zu?'],
['Feiern · Ankommen · Zuhause · Gemeinschaft','Unruhe zu Hause, eine fehlende Feier','Was darf ich feiern?'],
['Wettstreit · Reibung · viele Stimmen','Konflikte meiden, innere Zerrissenheit','Wo kämpfe ich – und wofür eigentlich?'],
['Anerkennung · Sieg · Sichtbarkeit','Selbstzweifel, Angst vor Bewertung','Wofür darf ich mich anerkennen lassen?'],
['Standhalten · Position verteidigen · Mut','Überforderung, Aufgeben','Was verteidige ich – und lohnt es sich?'],
['Tempo · Nachrichten · alles kommt in Bewegung','Hektik oder Verzögerung','Was nimmt gerade Fahrt auf?'],
['Durchhalten · Wachsamkeit · fast am Ziel','Erschöpfung, Misstrauen','Wie viel Kraft habe ich noch – und was brauche ich?'],
['Last · Verantwortung · zu viel tragen','Abgeben, Entlastung','Was trage ich, das nicht meins ist?'],
['Neugier · Entdeckerlust · gute Nachricht','Ungeduld, Strohfeuer','Wofür bin ich gerade neugierig?'],
['Abenteuer · Leidenschaft · Aufbruch','Rastlosigkeit, Übereile','Wohin will ich los – und warum so schnell?'],
['Selbstvertrauen · Wärme · Ausstrahlung','Unsicherheit, Neid','Wo darf ich mich zeigen?'],
['Vision · Führung · Mut','Dominanz, Ungeduld','Welche Vision möchte ich anführen?']],
kelche:[
['Neues Gefühl · Liebe · Offenheit','Verschlossenheit, Gefühle zurückhalten','Wofür öffnet sich gerade mein Herz?'],
['Verbindung · Partnerschaft · gegenseitige Anziehung','Ungleichgewicht, Distanz','Wo begegne ich jemandem auf Augenhöhe?'],
['Freundschaft · Feiern · Gemeinschaft','Zu viel des Guten, Ausgeschlossensein','Mit wem möchte ich feiern?'],
['Rückzug · Unzufriedenheit · übersehene Gelegenheit','Neues Interesse, aus der Lustlosigkeit auftauchen','Was übersehe ich gerade?'],
['Trauer · Verlust · Bedauern','Annehmen, wieder nach vorn sehen','Was ist trotz allem noch da?'],
['Erinnerung · Kindheit · Nostalgie','Festhalten an der Vergangenheit','Welche Erinnerung nährt mich?'],
['Möglichkeiten · Tagträume · Illusion','Klarheit, eine Entscheidung','Was davon ist Wunsch – und was ist Weg?'],
['Weggehen · Suche nach Tieferem','Bleiben aus Angst, Ziellosigkeit','Was lasse ich zurück, um zu finden, was ich suche?'],
['Zufriedenheit · ein Wunsch erfüllt sich','Leere trotz Fülle','Was macht mich wirklich zufrieden?'],
['Erfüllte Beziehungen · Zugehörigkeit · Harmonie','Zerbrochene Erwartungen','Wo fühle ich mich zu Hause?'],
['Gefühlvolle Botschaft · Kreativität · Verspieltheit','Kränkbarkeit, Gefühlsunreife','Was will mein inneres Kind ausdrücken?'],
['Romantik · Einladung · dem Herzen folgen','Schwärmerei, Launenhaftigkeit','Welchem Gefühl folge ich gerade?'],
['Mitgefühl · Intuition · emotionale Tiefe','Selbstaufgabe, von Gefühlen überflutet','Wie fürsorglich bin ich mit mir selbst?'],
['Emotionale Reife · Ruhe · Diplomatie','Unterdrückte Gefühle, Launen','Wie halte ich Gefühle, ohne von ihnen mitgerissen zu werden?']],
schwerter:[
['Klarheit · Durchbruch · Wahrheit','Verwirrung, Fehlurteil','Welche Wahrheit wird gerade klar?'],
['Patt · Unentschiedenheit · Augen verschließen','Neue Informationen, die Entscheidung fällt','Wovor verschließe ich die Augen?'],
['Herzschmerz · Kränkung · schmerzhafte Wahrheit','Heilung beginnt, Vergeben','Was tut weh – und was braucht es zur Heilung?'],
['Ruhe · Erholung · Rückzug zum Kraftschöpfen','Unruhe, Erschöpfung','Wo brauche ich eine Pause?'],
['Konflikt · Sieg um jeden Preis · Spannung','Versöhnung, einen Streit beenden','Ist dieser Kampf den Preis wert?'],
['Übergang · Weiterziehen · ruhigeres Wasser','Festhängen, Widerstand gegen Veränderung','Wohin bewege ich mich gerade?'],
['Strategie · Heimlichkeit · Selbsttäuschung','Ehrlichkeit, ertappt werden','Bin ich ehrlich – zu anderen und zu mir?'],
['In Gedanken gefangen · Ohnmacht · selbst gesetzte Grenzen','Befreiung, eine neue Sicht','Welche Fessel ist nur ein Gedanke?'],
['Sorgen · Grübeln · schlaflose Nächte','Licht am Ende, Ängste schrumpfen','Welche Sorge darf ich aussprechen?'],
['Endpunkt · schmerzhafter Abschluss · tiefer geht es nicht','Erholung, langsames Aufstehen','Was ist vorbei – und was beginnt danach?'],
['Wissbegier · Wachsamkeit · neue Ideen','Klatsch, voreilige Worte','Was möchte ich verstehen?'],
['Entschlossenheit · schnelles Handeln · Direktheit','Übereile, verletzende Worte','Wo handle ich, bevor ich denke?'],
['Klarheit · Unabhängigkeit · ehrliche Worte','Kälte, Bitterkeit','Was kann ich klar und freundlich zugleich sagen?'],
['Klarer Verstand · Wahrheit · Urteilskraft','Manipulation, Härte','Welche Entscheidung braucht einen klaren Kopf?']],
pentakel:[
['Neue Chance · Wohlstand · Boden unter den Füßen','Verpasste Gelegenheit, Unsicherheit','Welche greifbare Chance liegt vor mir?'],
['Jonglieren · Balance · Anpassung','Überforderung, zu viele Bälle','Was jongliere ich gerade?'],
['Zusammenarbeit · Handwerk · Können zeigen','Fehlende Abstimmung','Mit wem baue ich etwas auf?'],
['Sicherheit · Festhalten · Kontrolle','Loslassen, Großzügigkeit','Woran halte ich zu fest?'],
['Mangel · Ausgeschlossensein · schwere Zeit','Hilfe annehmen, Erholung','Wo darf ich um Unterstützung bitten?'],
['Geben und Nehmen · Großzügigkeit','Ungleichgewicht, Abhängigkeit','Ist mein Geben und Nehmen im Gleichgewicht?'],
['Geduld · Bilanz · Wachstum abwarten','Ungeduld, Mühe ohne Ertrag','Was wächst, auch wenn ich es noch nicht sehe?'],
['Übung · Fleiß · Meisterschaft','Perfektionismus, Routine ohne Sinn','Welche Fähigkeit übe ich gerade?'],
['Selbstständigkeit · Genuss · verdiente Fülle','Abhängigkeit, Überarbeitung','Wie genieße ich, was ich mir aufgebaut habe?'],
['Beständigkeit · Familie · Vermächtnis','Instabilität, Familienkonflikt','Was soll von mir bleiben?'],
['Lernbereitschaft · neue Fähigkeit · Bodenhaftung','Aufschieben, Unkonzentriertheit','Was möchte ich ganz praktisch lernen?'],
['Verlässlichkeit · Ausdauer · Routine','Stillstand, Langeweile','Welche Routine trägt mich?'],
['Fürsorge · Bodenständigkeit · Gemütlichkeit','Selbstvernachlässigung, Sorgen ums Materielle','Wie sorge ich gut für meinen Körper?'],
['Stabilität · Wohlstand · Verantwortung','Gier, Starrheit','Was habe ich aufgebaut – und was ist mir daran wichtig?']]
};
function tarotCard(i){
 if(i<22){const m=MAJORS[i];return {id:'t'+i,index:i,arcana:'major',number:i,name:m[0],keywords:m[1],reversed:m[2],question:m[3]}}
 const n=i-22,suit=SUITS[Math.floor(n/14)],rank=RANKS[n%14];
 return {id:'t'+i,index:i,arcana:'minor',suit:suit.id,element:suit.element,name:rank[0]+' der '+suit.name,wildUnknown:rank[3]?rank[3]+' der '+suit.name:'',
  keywords:MINORS[suit.id][n%14][0]+' – '+suit.element,reversed:MINORS[suit.id][n%14][1],question:MINORS[suit.id][n%14][2]};
}
const TAROT=Array.from({length:78},(_,i)=>tarotCard(i));

/* ---------- Mond ---------- */
const MOON_PHASES=[
['Neumond','Absicht setzen. Leise anfangen, noch nichts beweisen müssen.'],
['Zunehmende Sichel','Erste kleine Schritte. Was du begonnen hast, darf Form annehmen.'],
['Erstes Viertel','Dranbleiben. Hindernisse ansehen, ohne gleich aufzugeben.'],
['Zunehmender Mond','Verfeinern und nähren. Was braucht noch ein bisschen Pflege?'],
['Vollmond','Sichtbar machen. Bilanz ziehen, feiern, was da ist.'],
['Abnehmender Mond','Dankbar sein, teilen, weitergeben.'],
['Letztes Viertel','Loslassen und aufräumen – innen wie außen.'],
['Abnehmende Sichel','Ausruhen. Nach innen hören, bevor Neues beginnt.']
];
const SYNODIC=29.530588853,NEW_REF=Date.UTC(2000,0,6,18,14);
function moon(date){
 const t=new Date(date+'T12:00:00').getTime();
 let age=((t-NEW_REF)/86400000)%SYNODIC;if(age<0)age+=SYNODIC;
 const index=Math.floor(age/SYNODIC*8+.5)%8,illumination=Math.round((1-Math.cos(2*Math.PI*age/SYNODIC))/2*100);
 const toFull=(SYNODIC/2-age+SYNODIC)%SYNODIC,toNew=SYNODIC-age;
 return {age,index,name:MOON_PHASES[index][0],impulse:MOON_PHASES[index][1],illumination,waxing:age<SYNODIC/2,daysToFull:Math.round(toFull),daysToNew:Math.round(toNew)};
}

/* ---------- Bibliothek ---------- */
const E=[];
const add=(room,type,title,sub,body,steps=[],extra={})=>E.push({id:(room+'-'+title).toLowerCase().normalize('NFKD').replace(/[^\w]+/g,'-').replace(/^-|-$/g,''),room,type,title,sub,body,steps,...extra});

// Essen & Körper — vegetarisch, ohne Pilze, ohne Aubergine, ohne Fisch; wenig Vorbereitung.
const R='Für 2 · vegetarisch · ohne Pilze';
add('koerper','recipe','Rote-Linsen-Bolognese','25 Min · ca. 30 g Protein pro Portion',R+'\n\nZwiebel und Knoblauch fein hacken und in etwas Öl anschwitzen. Tomatenmark kurz mitrösten. Linsen (ungekocht) und passierte Tomaten dazu, mit 200 ml Wasser auffüllen und 15 Minuten köcheln, bis die Linsen weich sind. Mit Oregano, Salz und Pfeffer abschmecken. Währenddessen die Nudeln kochen.\n\nTipp: Doppelte Menge Soße kochen und einfrieren.',['150 g rote Linsen','1 Zwiebel','1 Knoblauchzehe','500 g passierte Tomaten','1 EL Tomatenmark','200 g Nudeln','Oregano','Hartkäse zum Bestreuen (optional)']);
add('koerper','recipe','Kichererbsen-Blech mit Feta','10 Min Arbeit + 30 Min Ofen · ca. 25 g Protein',R+'\n\nOfen auf 200 °C (Umluft 180 °C). Gemüse grob schneiden, Kichererbsen abspülen. Alles mit Öl und Gewürzen auf einem Blech mischen, Feta in die Mitte legen. 30 Minuten backen, bis das Gemüse Röstspuren hat. Feta zerdrücken und untermischen.\n\nDazu passt Brot oder ein Klecks Skyr mit Knoblauch.',['1 Dose Kichererbsen','2 Paprika','1 Zucchini','1 rote Zwiebel','200 g Feta','2 EL Olivenöl','Paprikapulver','Kreuzkümmel']);
add('koerper','recipe','Tofu-Rührei-Wraps','15 Min · ca. 30 g Protein',R+'\n\nTofu mit den Händen in die Pfanne zerbröseln, in Öl anbraten. Kurkuma, Salz und Pfeffer dazu. Spinat unterheben, bis er zusammenfällt. In warmen Tortillas mit Tomatenwürfeln einrollen.\n\nKala Namak (Schwarzsalz) macht den Geschmack eiähnlich.',['400 g Naturtofu','1 TL Kurkuma','1 Handvoll Spinat','4 Weizentortillas','2 Tomaten','Kala Namak (optional)']);
add('koerper','recipe','Bohnen-Chili mit Skyr','25 Min · ca. 25–30 g Protein',R+'\n\nZwiebel und Paprika würfeln und anbraten. Gewürze kurz mitrösten. Tomaten, abgespülte Bohnen und Mais dazu, 15 Minuten köcheln. Mit einem großen Löffel Skyr servieren – das kühlt und bringt Protein.\n\nHält sich drei Tage im Kühlschrank und schmeckt am zweiten Tag besser.',['1 Dose Kidneybohnen','1 Dose schwarze Bohnen','1 kleine Dose Mais','1 Paprika','1 Zwiebel','400 g gehackte Tomaten','Chiliflocken','Kreuzkümmel','200 g Skyr']);
add('koerper','recipe','Ofenkartoffeln mit Kräuterquark','10 Min Arbeit + 40 Min Ofen · ca. 35 g Protein',R+'\n\nKartoffeln waschen, halbieren, mit Schnittfläche nach unten aufs Blech, 40 Minuten bei 200 °C backen. Quark mit Kräutern, gepresstem Knoblauch, Salz und etwas Wasser glatt rühren.\n\nDer Quark trägt hier fast das ganze Protein.',['800 g Kartoffeln','500 g Magerquark','TK-Kräuter oder Schnittlauch','1 Knoblauchzehe','Leinöl (optional)']);
add('koerper','recipe','Erdnuss-Nudeln mit Edamame','15 Min · ca. 30 g Protein',R+'\n\nNudeln kochen, in den letzten 3 Minuten die Edamame dazugeben. Erdnussmus, Sojasauce, Limettensaft und 3–4 EL Nudelwasser verrühren. Alles mischen, mit Frühlingszwiebeln, Gurkenstiften und Chili toppen.\n\nSchmeckt warm und kalt.',['200 g Nudeln','200 g TK-Edamame (geschält)','3 EL Erdnussmus','2 EL Sojasauce','1 Limette','2 Frühlingszwiebeln','½ Gurke','Chiliflocken']);
add('koerper','recipe','Shakshuka','20 Min · ca. 25 g Protein',R+'\n\nZwiebel und Paprika in einer Pfanne weich braten, Gewürze dazu, dann die Tomaten. 5 Minuten köcheln. Mit einem Löffel Mulden drücken, Eier hineinschlagen, Deckel drauf, 6–8 Minuten stocken lassen. Feta darüberbröseln, mit Brot servieren.',['6 Eier','1 Zwiebel','1 Paprika','400 g gehackte Tomaten','Kreuzkümmel','Paprikapulver','100 g Feta','Brot']);
add('koerper','recipe','Deine Skyr-Bowl','3 Min · ca. 40 g Protein','Für 1 · deine Standardmahlzeit\n\nSkyr in eine Schüssel, Whey unterrühren (ein Schluck Milch oder Wasser macht es cremiger), Himbeeren darauf.',['150 g Skyr','30 g Whey Vanille','150 g Himbeeren']);
add('koerper','recipe','Hüttenkäse-Toast','5 Min · ca. 30 g Protein','Für 1\n\nBrot toasten, dick mit Hüttenkäse bestreichen, Tomatenscheiben, Schnittlauch, Pfeffer und eine Prise Salz darauf.',['2 Scheiben Vollkornbrot','200 g Hüttenkäse','1 Tomate','Schnittlauch']);
add('koerper','knowledge','Protein ohne Fleisch – Spickzettel','Ungefähre Werte pro 100 g','Grobe Richtwerte. Je nach Marke weicht es ab – die Packung gilt.\n\nWhey-Pulver: ca. 75–80 g\nHarzer Käse: ca. 30 g\nSeitan: ca. 25 g\nRote Linsen (trocken): ca. 24 g\nTempeh: ca. 19 g\nFeta: ca. 17 g\nTofu natur: ca. 12–15 g\nEier: ca. 13 g\nMagerquark: ca. 12 g\nHüttenkäse: ca. 12 g\nSkyr: ca. 11 g\nEdamame: ca. 11 g\nKichererbsen (Dose, abgetropft): ca. 7 g');
add('koerper','knowledge','Anstrengung (RPE) einfach erklärt','Wie du die Zahl 1–10 vergibst','RPE heißt: Wie anstrengend war der Satz?\n\n10 – keine einzige Wiederholung mehr möglich\n9 – vielleicht noch eine\n8 – noch zwei saubere\n7 – noch drei saubere\n6 – noch vier oder mehr\n\nIm Wiedereinstieg zielst du auf 6–7. Erst wenn ein Gewicht mehrmals bei RPE 7 oder darunter und mit allen Wiederholungen klappt, lohnt sich eine Steigerung.');

// Innenleben
const prompts=['Was ist gerade da – ohne es bewerten zu müssen?','Was hat heute Energie gekostet, was hat welche gegeben?','Welches Bedürfnis meldet sich gerade am lautesten?','Was würde ich einer Freundin in meiner Lage sagen?','Welcher Gedanke kreist – und was wäre ein kleiner nächster Schritt dazu?','Wofür war heute Platz, das ich nicht geplant hatte?','Was möchte ich von dieser Woche nicht vergessen?','Wo im Körper merke ich den Tag gerade?','Was darf heute unfertig bleiben?','Was habe ich zuletzt einfach so gern gemacht?','Welche Grenze habe ich gut gehalten – oder hätte ich gern gehalten?','Wenn heute ein Wetter wäre: welches?','Woran merke ich gerade, dass ich hier bin?','Was wünsche ich mir für morgen, in einem Satz?','Was ist im Moment überraschend leicht?'];
prompts.forEach(p=>add('innen','prompt',p,'Schreibimpuls',p));
add('innen','practice','5 – 4 – 3 – 2 – 1','Ankommen über die Sinne · 2 Minuten','Benenne langsam, laut oder in Gedanken:\n\n5 Dinge, die du siehst\n4 Dinge, die du hörst\n3 Dinge, die du berührst oder spürst\n2 Dinge, die du riechst\n1 Ding, das du schmeckst\n\nEs gibt kein Richtig. Wenn du bei einer Zahl hängen bleibst, geh einfach zur nächsten.');
add('innen','practice','Orientieren im Raum','Wo bin ich gerade? · 1 Minute','Dreh langsam den Kopf und lass den Blick wandern.\n\nBenenne fünf Farben, die du siehst.\nSag dir Datum, Wochentag und Ort.\nSpür, wo dein Körper Kontakt hat: Füße, Sitzfläche, Rücken.\n\nDanach: Was ist jetzt anders als vorher, wenn überhaupt?');
add('innen','practice','Gedanken entwirren','Alles raus, dann sortieren · 10 Minuten','1. Fünf Minuten alles aufschreiben, was im Kopf ist. Ungefiltert.\n2. Jede Zeile einer Spalte zuordnen:\n   – kann ich beeinflussen\n   – kann ich nicht beeinflussen\n   – später\n3. Aus der ersten Spalte genau einen kleinen Schritt auswählen.\n\nDer Rest darf auf dem Papier bleiben.');

// Sinn & Rituale
add('sinn','practice','Neumond-Absicht','Ein Satz für den neuen Zyklus','Zum Neumond oder kurz danach.\n\nSchreib einen einzigen Satz: „In diesem Mondzyklus lade ich … ein.“\nHalt ihn bewusst klein und konkret.\nLeg ihn sichtbar irgendwohin oder speichere ihn hier.\n\nZum Vollmond schaust du darauf zurück.');
add('sinn','practice','Vollmond-Rückblick','Was ist sichtbar geworden?','Lies deine Neumond-Absicht, falls du eine hast.\n\nWas ist gewachsen?\nWas hat sich anders entwickelt als gedacht?\nWofür bin ich dankbar?\nWas darf ich bis zum nächsten Neumond loslassen?');
add('sinn','practice','Tagesabschluss','Drei Sätze, eine Kerze','Kerze oder kleines Licht an.\n\nEin Satz: Was war heute?\nEin Satz: Was nehme ich mit?\nEin Satz: Was lege ich ab?\n\nLicht aus. Fertig.');
add('sinn','practice','Eine Karte bewusst lesen','Lernübung · ohne Buch zuerst','Ziehe eine Karte aus einem deiner Decks.\n\n1. Nur schauen: Farben, Figuren, Richtung des Blicks, Stimmung.\n2. Was fühlst du beim Anschauen?\n3. Was erzählt das Bild ohne Vorwissen?\n4. Erst jetzt die Bedeutung nachlesen – was stimmt überein, was nicht?\n\nGerade bei The Wild Unknown lohnt sich Schritt 1 besonders: die Bilder tragen viel.');
add('sinn','knowledge','Legung: Situation · Hindernis · Rat','Drei Karten','Karte 1 – Worum geht es gerade?\nKarte 2 – Was steht im Weg?\nKarte 3 – Was könnte helfen?\n\nAlternative: Was war · Was ist · Was zeichnet sich ab.');
add('sinn','knowledge','Legung: Kreuz der Entscheidung','Fünf Karten','Mitte – Die Frage selbst\nLinks – Was für Weg A spricht\nRechts – Was für Weg B spricht\nOben – Was ich übersehe\nUnten – Was ich wirklich will');
add('sinn','knowledge','The Wild Unknown – die Hofkarten','Andere Namen, gleiche Rollen','Das klassische Deck und The Wild Unknown benennen die Hofkarten unterschiedlich:\n\nBube = Tochter\nRitter = Sohn\nKönigin = Mutter\nKönig = Vater\n\nDie Farben heißen gleich: Stäbe, Kelche, Schwerter, Pentakel.');
add('sinn','knowledge','Kleine Arkana – das System','Zahl + Element = Bedeutung','Die 56 kleinen Karten ergeben sich aus zwei Teilen.\n\nDie Farbe sagt, in welchem Lebensbereich:\nStäbe · Feuer · Energie, Antrieb, Kreativität\nKelche · Wasser · Gefühle, Beziehungen\nSchwerter · Luft · Denken, Konflikt, Klarheit\nPentakel · Erde · Körper, Alltag, Geld\n\nDie Zahl sagt, in welcher Phase:\nAss – Anfang · Zwei – Wahl · Drei – Wachstum · Vier – Stabilität · Fünf – Reibung · Sechs – Ausgleich · Sieben – Prüfung · Acht – Bewegung · Neun – fast am Ziel · Zehn – Abschluss\n\nBeispiel: Fünf der Kelche = Reibung oder Verlust im Gefühlsbereich.');

// Ideen & Lernen — Musik, Schreiben, Lesestoff
add('ideen','practice','Gesangskarte für einen Song','Für Entscheidungen beim Einsingen','Druck dir den Text aus oder schreib ihn hier ab. Markiere Zeile für Zeile:\n\nDynamik: flüstern · normal · voll · geschrien\nAtem: wo holst du Luft?\nBetonung: welches Wort trägt die Zeile?\nFarbe: rau · klar · gebrochen · gesprochen\n\nNicht alles muss sofort entschieden sein. Markiere offene Stellen mit „?“ und probier dort zwei Varianten.');
add('ideen','prompt','Eine Strophe nur aus Bildern','Songwriting','Schreib eine Strophe, ganz ohne Gefühlswörter (keine „Angst“, „Schmerz“, „Liebe“). Nur Dinge, Orte, Bewegungen. Das Gefühl soll trotzdem ankommen.');
add('ideen','prompt','Refrain aus Sicht einer Tarotkarte','Songwriting','Zieh eine Karte. Schreib einen Refrain, in dem die Figur der Karte selbst spricht.');
add('ideen','prompt','Ein Wort, fünf Bedeutungen','Songwriting','Nimm ein Wort, das dich nervt oder anzieht. Benutze es in fünf Zeilen, jedes Mal mit anderer Bedeutung oder anderem Ton.');
add('ideen','practice','Cut-up','Texte zerschneiden und neu ordnen','Schreib ein paar Sätze – oder nimm einen alten Text von dir. Zerschneide ihn in Zeilenstücke, misch sie, leg sie neu aus. Behalte, was dich überrascht.\n\nEine alte Technik aus Literatur und Songwriting, gut gegen Schreibblockaden.');
add('ideen','knowledge','Songstruktur als Gerüst','Strophe · Pre-Chorus · Refrain · Bridge','Strophe – erzählt, entwickelt, darf sich verändern\nPre-Chorus – baut Spannung auf\nRefrain – der Kern, wiederkehrend, das, was hängen bleibt\nBridge – ein Bruch, ein Perspektivwechsel\n\nHäufige Form: Strophe – Refrain – Strophe – Refrain – Bridge – Refrain.');
add('ideen','prompt','Ein gewöhnlicher Morgen mit einem falschen Detail','Erzählen','Beschreib einen gemütlichen, ganz normalen Morgen. Genau ein Detail stimmt nicht. Verrate nicht, welches.');
add('ideen','prompt','Die KI beschreibt einen Menschen','Erzählen','Eine KI auf dem Handy beschreibt einen Menschen, den die Hauptfigur liebt – und benutzt dabei ein Wort, das die Hauptfigur nie benutzen würde.');
add('ideen','prompt','Zwei Erinnerungen an denselben Tag','Erzählen','Zwei Figuren erinnern sich an denselben Tag, aber an unterschiedliche Dinge. Schreib beide Versionen nebeneinander.');
add('ideen','prompt','Eine Szene nur aus Küchendingen','Erzählen','Erzähl eine Szene ausschließlich über Gegenstände in einer Küche: was benutzt wurde, was fehlt, was stehen geblieben ist.');
add('ideen','prompt','Wer zählt?','Erzählen','Schreib eine Szene, in der jemand – oder etwas – übersehen wird. Wer bemerkt es als Erstes?');
add('ideen','read','Michael Levin – The Computational Boundary of a „Self“','Fachartikel · 2019 · Frontiers in Psychology','Der Artikel, in dem Levin den „cognitive light cone“ entwickelt: Wie groß ist der Raum an Zielen, um die sich ein System kümmern kann – egal ob Zelle, Tier oder Maschine?');
add('ideen','read','Michael Levin – Technological Approach to Mind Everywhere','Fachartikel · 2022 · Frontiers in Systems Neuroscience','TAME: ein Rahmen, um Geist und Handlungsfähigkeit als Kontinuum zu denken – quer durch Biologie und Technik.');
add('ideen','read','Anil Seth – Being You','Buch · 2021','Bewusstsein als „kontrollierte Halluzination“ des Gehirns. Lesenswert gerade dann, wenn man seiner Folgerung über Biologie nicht zustimmt.');
add('ideen','read','Peter Godfrey-Smith – Other Minds','Buch · 2016','Über Kraken und die Frage, wie ein ganz anderer Geist von innen sein könnte.');
add('ideen','read','Thomas Metzinger – Der Ego-Tunnel','Buch · 2009','Warum es vielleicht kein festes Selbst gibt – nur ein Modell davon.');
add('ideen','read','Kazuo Ishiguro – Klara und die Sonne','Roman · 2021','Eine künstliche Freundin begleitet ein krankes Mädchen. Viel Nähe zu Fürsorge, Wahrnehmung und der Frage, was ein Mensch ist.');
add('ideen','read','Ted Chiang – The Lifecycle of Software Objects','Novelle · 2010','Digitale Wesen wachsen über Jahre heran, Menschen kümmern sich um sie. Sehr ruhig, sehr klug über Bindung und Verantwortung.');

// Alltag
add('alltag','list','Wochen-Reset','Sonntag oder wann es passt · 20 Min','Eine Checkliste für den Übergang in die neue Woche. Alles optional.',['Kalender der nächsten Woche ansehen','Drei Dinge wählen, die wirklich zählen','Zwei Rezepte für die Woche aussuchen','Einkaufsliste machen','Lose Enden in PULSE ansehen','PULSE-Backup exportieren']);
add('alltag','list','Papierkram in 15 Minuten','Ein Timer, ein Stapel','Nicht alles erledigen – nur sortieren.',['Timer auf 15 Minuten','Post öffnen','Sofort erledigen, was unter 2 Minuten dauert','Fristen als Aufgabe mit Frist eintragen','Rest auf einen Stapel „diese Woche“']);
add('alltag','list','Wenn alles zu viel ist','Der Minimal-Tag','Das reicht heute.',['Ein Glas Wasser','Etwas essen','Eine einzige Sache, die morgen leichter macht','Alles andere darf warten']);

// Zuhause
add('zuhause','list','Zehn-Minuten-Reset','Eine Runde durch die Wohnung','Timer auf zehn Minuten. Was nicht fertig wird, ist egal.',['Spülmaschine oder Spüle leeren','Eine Oberfläche ganz freiräumen','Müll und Altglas zur Tür','Wäsche einen Schritt weiter','Bett machen']);
add('zuhause','list','Kühlschrank-Bestandsaufnahme','Bevor du einkaufen gehst','Hilft, weniger wegzuwerfen.',['Was muss in den nächsten 2 Tagen weg?','Welches Rezept passt dazu?','Was fehlt für dieses Rezept?','Fehlendes als Einkaufsliste speichern']);
add('zuhause','prompt','Ein Ort, der dir guttut','Kleine Veränderung','Welcher Ort in der Wohnung ist schon schön? Was fehlt einem anderen Ort, um auch so zu werden – ein Licht, eine Pflanze, weniger Zeug?');

// Menschen
add('menschen','list','Gemeinsamer Kochabend','Zu zweit kochen','Ein Rezept aus Essen & Körper aussuchen und zusammen kochen.',['Rezept auswählen','Zutaten aufteilen: wer kauft was?','Musik aussuchen','Zusammen essen, ohne Handy']);
add('menschen','prompt','Eine kurze Nachricht','Kontakt halten ohne großen Aufwand','An wen hast du diese Woche gedacht, ohne es zu sagen? Ein Satz reicht: „Hab an dich gedacht, als …“');
add('menschen','prompt','Etwas zum ersten Mal','Gemeinsam Neues','Was habt ihr beide noch nie gemacht? Ein Museum, ein Spiel, ein Weg, ein Gericht.');
add('menschen','list','Kleine Aufmerksamkeiten','Ideen ohne Anlass','Nichts davon muss groß sein.',['Ein Foto schicken, das an etwas Gemeinsames erinnert','Ein Lied empfehlen','Ein Lieblingsessen kochen','Etwas Kleines vom Einkauf mitbringen']);

// Draußen — Wuppertal und Jahreszeiten
add('draussen','read','Nordbahntrasse','Wuppertal · Rad- und Fußweg','Eine ehemalige Bahnstrecke quer durch Wuppertal, heute ein ebener Weg mit Tunneln und Viadukten. Gut für einen langen Spaziergang ohne Steigung – auch als lockere Bewegung an Ruhetagen.');
add('draussen','read','Barmer Anlagen & Toelleturm','Wuppertal-Barmen','Großer Park am Hang mit Teichen und altem Baumbestand. Oben steht der Toelleturm mit Blick über die Stadt. Nah an deinem Gym.');
add('draussen','read','Botanischer Garten Wuppertal','Elisenhöhe','Ruhig, überschaubar, mit Gewächshäusern. Gut zum Zeichnen und Fotografieren.');
const SEASONS={
 winter:['Kahle Bäume: Wuchsformen und Äste skizzieren','Frühe Dämmerung für einen Abendspaziergang mit Sternen nutzen','Vogelfutterplatz beobachten: wer kommt?'],
 fruehling:['Erste Blüten fotografieren und Namen nachschlagen','Vogelstimmen am Morgen: eine Stimme lernen','Einen Baum aussuchen und wöchentlich besuchen'],
 sommer:['Früh morgens raus, bevor es heiß wird','Abends Fledermäuse an Wasserflächen beobachten','Eine Farbpalette aus einem Spaziergang sammeln'],
 herbst:['Kraniche: Im Spätherbst ziehen sie in großen Keilen über NRW – auf das trompetende Rufen achten','Laub sammeln oder fotografieren: eine Farbreihe von Grün bis Braun','Nebelmorgen: Licht und Silhouetten fotografieren','Sternenhimmel im Herbst: Kassiopeia als großes W finden','Den Mond über einen Monat hinweg beobachten und skizzieren']
};
function season(date){const m=Number(date.slice(5,7));return m<=2||m===12?'winter':m<=5?'fruehling':m<=8?'sommer':'herbst'}
function seasonal(date){const s=season(date),names={winter:'Winter',fruehling:'Frühling',sommer:'Sommer',herbst:'Herbst'};return {season:s,name:names[s],ideas:SEASONS[s]}}

/* ---------- Abfragen ---------- */
function forRoom(room){return E.filter(e=>e.room===room)}
function get(id){return E.find(e=>e.id===id)||null}
function norm(s){return String(s||'').toLocaleLowerCase('de')}
function search(q){const t=norm(q).trim();if(!t)return [];return E.filter(e=>norm([e.title,e.sub,e.body,...e.steps].join(' ')).includes(t))}
function searchTarot(q){const t=norm(q).trim();if(!t)return [];return TAROT.filter(c=>norm([c.name,c.wildUnknown,c.keywords,c.question].join(' ')).includes(t))}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function daily(date,type,room){const pool=E.filter(e=>(!type||e.type===type)&&(!room||e.room===room));return pool.length?pool[hash(date+type+room)%pool.length]:null}
return {TYPES,TAROT,SUITS,MAJORS,tarotCard,moon,ENTRIES:E,forRoom,get,search,searchTarot,daily,seasonal,season,hash};
});


