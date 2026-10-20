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

// Chaos-Magie
add('sinn','knowledge','Chaos-Magie – die Grundidee','Glaube als Werkzeug','Chaos-Magie entstand Ende der 1970er in England (Peter J. Carroll, Ray Sherwin) und greift auf Austin Osman Spare zurück.\n\nDer Kern: Glaube ist kein Bekenntnis, sondern ein Werkzeug. Du wählst ein Symbolsystem, weil es für einen Zweck funktioniert – und legst es wieder ab, wenn es das nicht mehr tut. Tarot, Planeten, Popkultur, eigene Zeichen: alles ist erlaubt, solange du es ernst nimmst, während du damit arbeitest.\n\nDrei Säulen:\n1. Absicht – klar und knapp\n2. Gnosis – ein veränderter, fokussierter Bewusstseinszustand\n3. Vergessen – die Absicht loslassen, damit das bewusste Wollen nicht im Weg steht\n\nDazu kommt Ergebnisorientierung: Ein magisches Tagebuch zeigt, was wirkt.');
add('sinn','practice','Sigille nach Spare','Eine Absicht in ein Zeichen verwandeln','Die bekannteste Technik, nach Austin Osman Spare.\n\n1. Absicht als kurzen, positiven Satz schreiben, in der Gegenwart: „Ich schlafe tief und ruhig.“\n2. Doppelte Buchstaben streichen, oft auch alle Vokale: CHSLFTDR …\n3. Aus den übrigen Buchstaben ein Zeichen bauen: übereinanderlegen, drehen, vereinfachen, bis der Satz nicht mehr lesbar ist.\n4. Laden: in Gnosis auf das Zeichen schauen, bis der Kopf leer wird.\n5. Vergessen: das Zeichen verbrennen, wegpacken oder zwischen anderen verstecken. Nicht mehr bewusst daran denken.\n\nTipp: Mehrere Sigillen auf Vorrat bauen und später eine zufällig ziehen – dann weißt du beim Laden nicht mehr, welche Absicht dahintersteht.',[],{phase:0});
add('sinn','knowledge','Gnosis','Still oder ekstatisch','Gnosis heißt in der Chaos-Magie: ein Zustand, in dem der Kopf für einen Moment nur noch auf eine Sache gerichtet ist.\n\nStille Gnosis (hemmend):\n– Meditation, ein Punkt fixieren, bis alles andere wegfällt\n– langsames Atmen, Atem zählen\n– Starren auf die Sigille, bis sie zu flimmern scheint\n\nEkstatische Gnosis (erregend):\n– Tanzen bis zur Erschöpfung\n– Singen, Summen, Trommeln, ein Mantra immer schneller\n– laute Musik, Drehen, Bewegung\n\nIm Moment der größten Leere oder Erregung die Sigille ansehen. Danach sofort etwas ganz anderes tun.\n\nBleib bei geerdeten Methoden: keine Substanzen, kein Hungern, kein forciertes Hyperventilieren. Wenn sich etwas schlecht anfühlt, abbrechen, Wasser trinken, etwas essen, raus an die Luft.',[],{phase:1});
add('sinn','practice','Banishing durch Lachen','Ein Ritual schließen','Nach jeder magischen Arbeit wird „gebannt“: zurück in den Alltag, die Absicht losgelassen.\n\nDie einfachste Form, nach Peter Carroll: laut und lange lachen. Erst gespielt, bis es echt wird. Lachen bricht die Ernsthaftigkeit und setzt den Kopf zurück.\n\nAndere Formen:\n– in die Hände klatschen und laut „Fertig.“ sagen\n– Fenster auf, Licht an, Kerze aus\n– Hände waschen\n– eine eigene Geste, die du immer benutzt\n\nAuch gut nach einem Tag, an dem zu viel hängen geblieben ist.',[],{phase:6});
add('sinn','practice','Glaubenswechsel','Ein Experiment über einen Mondzyklus','Wähle eine Überzeugung, die du nicht hast – und lebe einen Mondzyklus lang so, als hättest du sie.\n\nBeispiele:\n– „Zufälle sind Botschaften.“\n– „Mein Körper weiß, was er braucht.“\n– „Jeder Ort hat einen Geist, den man grüßt.“\n– Eine Gottheit, eine Romanfigur oder eine Tarotkarte als Schutzpatron\n\nJeden Abend eine Zeile im Tagebuch: Was ist mir aufgefallen? Was hat sich anders angefühlt?\n\nZum nächsten Neumond bewusst beenden: bannen, auswerten, entscheiden, was du behältst.\n\nZiel ist nicht, recht zu haben, sondern zu erfahren, wie formbar Wahrnehmung ist.',[],{phase:3});
add('sinn','practice','Magisches Tagebuch','Ohne Tagebuch keine Ergebnisse','Jede Arbeit kurz festhalten. Am einfachsten direkt hier als Notiz mit #sinn.\n\nDatum und Mondphase\nAbsicht\nMethode (welche Sigille, welche Gnosis)\nWie es sich angefühlt hat\n\nSpäter ergänzen:\nWas ist passiert? Wann?\nWie hoch schätzt du den Zusammenhang ein: 0–10?\n\nEinmal im Mondzyklus zurücklesen. Muster werden erst nach Wochen sichtbar.',[],{phase:5});
add('sinn','practice','Servitor','Ein Helfer mit klarer Aufgabe und Ende','Ein Servitor ist eine bewusst erschaffene Gestalt mit einer einzigen Aufgabe – im Grunde eine sehr ausführliche Sigille mit Persönlichkeit.\n\n1. Aufgabe: eine, eng umrissen („erinnert mich ans Wassertrinken“).\n2. Name und Zeichen.\n3. Form: wie sieht er aus, wie klingt er?\n4. Regeln: was er darf, was nicht.\n5. Ende: ein festes Datum oder eine Bedingung, wann er aufgelöst wird. Ohne Ende kein Servitor.\n6. Laden wie eine Sigille, danach bannen.\n\nAuflösen: Zeichen verbrennen oder zerreißen, Namen ein letztes Mal sagen, bannen. Im Tagebuch notieren.\n\nWenn eine Gestalt sich nicht mehr wie ein Werkzeug anfühlt, sondern belastet: sofort auflösen und eine Pause machen.');
add('sinn','practice','Hypersigil','Eine Geschichte, ein Song, eine Serie','Ein Hypersigil ist ein langes Werk, das selbst als Sigille wirkt – Grant Morrison hat den Begriff geprägt und seine Comicreihe „The Invisibles“ so beschrieben.\n\nFür dich naheliegend: ein Song oder eine Songreihe.\n\n1. Absicht als Figur oder Bild verkleiden.\n2. Die Figur erlebt im Text, was du anziehen willst.\n3. Beim Schreiben, Proben und Singen lädst du es jedes Mal neu.\n4. Fertigstellen und veröffentlichen ist das Loslassen.\n\nAchte darauf, deiner Figur nichts zuzumuten, was du selbst nicht erleben willst.');
add('sinn','practice','Zufalls-Divination','Antworten aus dem, was gerade da ist','Chaos-Magie nutzt jedes System, das Zufall erzeugt.\n\nBibliomantie: Frage stellen, ein Buch zufällig aufschlagen, der erste Satz unter dem Finger ist die Antwort.\nShuffle-Orakel: Frage stellen, Musik auf Zufall, die erste Zeile des Songs.\nCut-up: einen Text zerschneiden, drei Schnipsel ziehen.\nStadt-Orakel: Frage stellen, rausgehen, die ersten drei Wörter, die du liest.\nTarot: eine Karte, ohne Buch deuten.\n\nNotiere Frage und Antwort und lies sie eine Woche später noch mal.',[],{phase:4});
add('sinn','practice','Ruhe und Traumarbeit','Für den abnehmenden Mond','In der dunklen Mondphase wird keine neue Arbeit begonnen.\n\nVor dem Schlafen: eine Frage auf einen Zettel schreiben und unters Kissen legen.\nNach dem Aufwachen: sofort, noch liegend, alles notieren – auch Bruchstücke, Farben, Gefühle.\n\nNach zwei Wochen zurücklesen: Welche Bilder kehren wieder?',[],{phase:7});
add('sinn','knowledge','Mondphasen in der Praxis','Was wann gut passt','Eine Zuordnung, wie viele Praktizierende sie nutzen. Kein Gesetz, eher ein Rhythmus.\n\nNeumond – Sigillen erschaffen, Absicht formulieren\nZunehmende Sichel – Sigillen laden\nErstes Viertel – in der Welt handeln\nZunehmender Mond – Glaubenswechsel vertiefen\nVollmond – ekstatische Gnosis, Divination\nAbnehmender Mond – auswerten, Tagebuch\nLetztes Viertel – bannen, abschließen\nAbnehmende Sichel – Ruhe, Träume\n\nDer Kalender in Pulse zeigt für jeden Tag die passende Praxis.');
add('sinn','read','Austin Osman Spare – The Book of Pleasure','Buch · 1913','Der Ursprung der Sigillen-Technik. Schwer zu lesen, eigenwillig, mit Spares eigenen Zeichnungen. Eher zum Blättern als zum Durchlesen.');
add('sinn','read','Peter J. Carroll – Liber Null & Psychonaut','Buch · 1978/1982','Das Gründungsbuch der Chaos-Magie: Gnosis, Banishing, Glaubenswechsel, magisches Tagebuch. Knapp und praktisch.');
add('sinn','read','Phil Hine – Condensed Chaos','Buch · 1995','Die zugänglichste Einführung. Viel Praxis, viel Humor, wenig Dogma. Guter Startpunkt.');
add('sinn','read','Grant Morrison – Pop Magic!','Essay · 2003','Kurzer, witziger Text über Sigillen, Hypersigillen und Popkultur als Magie. In der Anthologie „Book of Lies“ erschienen.');
add('sinn','read','Ronald Hutton – The Triumph of the Moon','Buch · 1999','Wie der moderne Jahreskreis und Wicca entstanden sind – historisch sauber und trotzdem respektvoll.');

// Jahreskreis
add('sinn','knowledge','Der Jahreskreis','Acht Feste, ein Rad','Der moderne Jahreskreis verbindet vier Sonnenfeste (Sonnenwenden, Tagundnachtgleichen) mit vier keltisch geprägten Festen dazwischen.\n\nSamhain (31.10.) – Ahnen, Ende und Anfang\nYule (Wintersonnenwende) – Rückkehr des Lichts\nImbolc (1.2.) – erstes Erwachen, Reinigung\nOstara (Frühlingsgleiche) – Gleichgewicht, Saat\nBeltane (1.5.) – Lebenslust, Fruchtbarkeit\nLitha (Sommersonnenwende) – Fülle, Licht\nLughnasadh (1.8.) – erste Ernte, Können\nMabon (Herbstgleiche) – Dank, Bilanz\n\nDie heutige Form ist im 20. Jahrhundert entstanden und greift ältere Bräuche auf.');
add('sinn','practice','Samhain','31. Oktober · Ahnen und Übergang','Der Schleier gilt als dünn: Zeit für die Toten, die Ahnen und das, was zu Ende geht.\n\n– Ein Foto oder Gegenstand von jemandem, der fehlt, und eine Kerze dazu\n– Einen Teller oder ein Glas für die Ahnen hinstellen\n– Aufschreiben, was in diesem Jahr gestorben ist (Pläne, Gewohnheiten, Rollen), und es verbrennen\n– Tarot: eine Karte für das, was geht, eine für das, was kommt');
add('sinn','practice','Yule','Wintersonnenwende · das Licht kehrt zurück','Die längste Nacht des Jahres.\n\n– Abends alle Lichter aus und eine einzige Kerze anzünden\n– In der Dunkelheit sitzen und an das denken, was im neuen Licht wachsen soll\n– Eine Sigille für das kommende Jahr bauen\n– Am Morgen danach bewusst den Sonnenaufgang anschauen');
add('sinn','practice','Imbolc','1. Februar · erstes Erwachen','Unter dem Schnee regt sich etwas.\n\n– Wohnung oder Altar reinigen, Fenster putzen\n– Eine weiße Kerze für das, was neu beginnen will\n– Pläne für das Frühjahr notieren, noch ohne Druck');
add('sinn','practice','Ostara','Frühlingsgleiche · Gleichgewicht','Tag und Nacht gleich lang.\n\n– Samen säen, ganz wörtlich: ein Kraut auf der Fensterbank\n– Zwei Spalten: Was ist im Gleichgewicht, was nicht?\n– Eier bemalen mit eigenen Zeichen oder Sigillen');
add('sinn','practice','Beltane','1. Mai · Lebenslust','Fest der Fruchtbarkeit, des Feuers und der Lust am Leben.\n\n– Tanzen, draußen sein, Blumen sammeln\n– Etwas tun, das sich nach Feuer anfühlt: singen, auftreten, laut sein\n– Gute Nacht für ekstatische Gnosis');
add('sinn','practice','Litha','Sommersonnenwende · Fülle','Der längste Tag.\n\n– Den Sonnenaufgang oder -untergang draußen erleben\n– Kräuter sammeln und trocknen\n– Dankbarkeitsliste: Was ist in diesem Jahr gewachsen?');
add('sinn','practice','Lughnasadh','1. August · erste Ernte','Fest des Brotes und des Könnens, benannt nach dem keltischen Gott Lugh.\n\n– Brot backen oder bewusst ein gutes kaufen und teilen\n– Eine eigene Fähigkeit feiern: einen Song fertig machen, etwas zeigen\n– Erste Ernte der Neumond-Absichten notieren');
add('sinn','practice','Mabon','Herbstgleiche · Dank und Bilanz','Tag und Nacht wieder gleich lang, die Ernte ist eingefahren.\n\n– Bilanz des Jahres: behalten, abgeben, verändern\n– Etwas spenden oder weitergeben\n– Ein Essen aus Herbstgemüse kochen und bewusst essen');

// Chinesischer Kalender
add('sinn','knowledge','Der chinesische Mondkalender','Wie Monate und Jahre gezählt werden','Der chinesische Kalender ist ein Lunisolarkalender.\n\nJeder Monat beginnt mit dem Neumond (Ortszeit Peking). Der 15. Tag ist ungefähr Vollmond.\n\nDas Jahr richtet sich nach der Sonne: Der 11. Monat enthält immer die Wintersonnenwende. Weil zwölf Mondmonate kürzer sind als ein Sonnenjahr, wird etwa alle drei Jahre ein Schaltmonat eingefügt.\n\nNeujahr fällt deshalb auf den zweiten Neumond nach der Wintersonnenwende, zwischen dem 21. Januar und dem 20. Februar.\n\nDie Jahre laufen in einem 60er-Zyklus: zehn Himmelsstämme (fünf Elemente, je Yang und Yin) und zwölf Erdzweige (die Tiere). 2026 ist Bing-Wu, das Jahr des Feuer-Pferds.');
add('sinn','knowledge','Die 24 Jahresabschnitte','Jieqi · der Sonnenkalender im Mondkalender','Neben den Mondmonaten teilt der chinesische Kalender das Jahr in 24 Abschnitte zu je 15 Grad Sonnenlauf, etwa alle 15 Tage einer.\n\nSie benennen Wetter und Landwirtschaft: „Weißer Tau“, „Erster Reif“, „Erwachen der Insekten“. Seit 2016 sind sie immaterielles Kulturerbe der UNESCO.\n\nVier davon sind die Sonnenwenden und Tagundnachtgleichen, vier weitere markieren den Beginn der Jahreszeiten (Lichun, Lixia, Liqiu, Lidong) – ungefähr dort, wo im Jahreskreis Imbolc, Beltane, Lughnasadh und Samhain liegen.\n\nDer Kalender in Pulse zeigt den aktuellen Abschnitt mit kurzer Erklärung und einer Praxis.');
add('sinn','knowledge','Die fünf Elemente','Wu Xing · Wandlungsphasen','Holz – Wachstum, Planung, Aufbruch · Frühling\nFeuer – Antrieb, Sichtbarkeit, Leidenschaft · Sommer\nErde – Stabilität, Fürsorge, Mitte · Übergänge\nMetall – Klarheit, Struktur, Loslassen · Herbst\nWasser – Tiefe, Intuition, Ruhe · Winter\n\nSie nähren sich im Kreis: Holz nährt Feuer, Feuer erzeugt Erde (Asche), Erde birgt Metall, Metall sammelt Wasser (Tau), Wasser nährt Holz.\n\nUnd sie kontrollieren sich über Kreuz: Holz durchdringt Erde, Erde staut Wasser, Wasser löscht Feuer, Feuer schmilzt Metall, Metall schneidet Holz.\n\nEher als Wandlungsphasen gemeint als als Stoffe.');
add('sinn','knowledge','Die zwölf Tiere','Erdzweige','Ratte – findig, wach, anpassungsfähig\nBüffel – ausdauernd, verlässlich, geduldig\nTiger – mutig, impulsiv, kraftvoll\nHase – feinfühlig, diplomatisch, vorsichtig\nDrache – charismatisch, ehrgeizig, groß denkend\nSchlange – klug, intuitiv, verschwiegen\nPferd – frei, schnell, begeisterungsfähig\nZiege – kreativ, sanft, gemeinschaftlich\nAffe – verspielt, erfinderisch, schlagfertig\nHahn – genau, ehrlich, selbstbewusst\nHund – treu, gerecht, wachsam\nSchwein – großzügig, genussfreudig, gutmütig\n\nDas Tierjahr beginnt mit dem chinesischen Neujahr, nicht am 1. Januar. Wer im Januar geboren ist, gehört oft noch zum Vorjahr.\n\nDie Tiere gelten auch für Monate und Doppelstunden: Die Ratte ist die Stunde um Mitternacht (23–1 Uhr).');
add('sinn','knowledge','Chinesische Feste','Nach dem Mondkalender','Neujahr (1.1.) – Familie, rote Umschläge, Feuerwerk gegen das Unglück\nLaternenfest (1.15.) – erster Vollmond, Laternen und Rätsel\nQingming (Jahresabschnitt im April) – Gräber fegen, Ahnen ehren\nDrachenbootfest (5.5.) – Bootsrennen, Zongzi, Schutz vor Krankheit\nQixi (7.7.) – Fest der Liebenden: Weberin und Kuhhirte treffen sich auf der Elsternbrücke\nGeisterfest (7.15.) – hungrige Geister werden versorgt, Wasserlaternen\nMondfest (8.15.) – Vollmond, Mondkuchen, Familie\nDoppelneun (9.9.) – auf Berge steigen, Chrysanthemen, Ältere ehren\nWintersonnenwende – Familienessen, Tangyuan\nLaba (12.8.) – Laba-Brei, Beginn der Neujahrsvorbereitung\n\nDie Zahl vor dem Punkt ist der Mondmonat, danach der Tag.');
add('sinn','practice','Neujahr nach dem Mondkalender','Ein zweiter Jahresanfang','Ein guter Anlass, Vorsätze nachzujustieren, die im Januar schon versandet sind.\n\n– Vorher: Wohnung putzen (am Neujahrstag selbst nicht fegen, sonst kehrst du das Glück hinaus)\n– Rote Farbe tragen\n– Mit Menschen essen\n– Eine Sigille für das neue Tierjahr bauen, passend zu seinen Qualitäten');
add('sinn','practice','Laternenfest','Erster Vollmond des Jahres','Am 15. Tag des ersten Mondmonats.\n\n– Eine Laterne oder Kerze ans Fenster stellen\n– Ein Rätsel aufschreiben und jemandem schicken\n– Vollmond-Rückblick auf die ersten zwei Wochen des Mondjahres');
add('sinn','practice','Mondfest','Mitte des Herbstes · der hellste Vollmond','Am 15. Tag des 8. Mondmonats. Der Mond gilt als besonders rund und hell.\n\n– Mit jemandem draußen den Mond anschauen\n– Mondkuchen oder etwas Rundes teilen\n– Die Legende von Chang\'e lesen, die mit dem Elixier auf den Mond floh\n– Dankbarkeit für die Menschen, die nicht da sein können');
add('sinn','practice','Geisterfest','15. Tag des 7. Mondmonats','Im Geistermonat gelten die Tore zur Unterwelt als offen. Am 15. werden die hungrigen Geister versorgt.\n\n– Eine kleine Gabe nach draußen stellen: Reis, Obst, Tee\n– Ein Licht auf Wasser setzen (eine Kerze in einer Schale reicht)\n– An Menschen denken, an die niemand mehr denkt\n– Danach bannen');

// Almanach: westliche Magie, Astrologie, europäische Bräuche
add('sinn','knowledge','Planetentage','Jeder Wochentag hat einen Planeten','Die Wochentage sind nach den sieben klassischen Planeten benannt. In der westlichen Magie gilt ein Tag als günstig für alles, was zu seinem Planeten passt.\n\nSonntag · Sonne ☉ – Erfolg, Sichtbarkeit, Lebenskraft · Gold\nMontag · Mond ☽ – Träume, Intuition, Zuhause · Silber\nDienstag · Mars ♂ – Mut, Kraft, Schutz · Rot\nMittwoch · Merkur ☿ – Sprache, Lernen, Schreiben · Orange\nDonnerstag · Jupiter ♃ – Wachstum, Fülle, Weisheit · Blau\nFreitag · Venus ♀ – Liebe, Kunst, Musik, Genuss · Grün\nSamstag · Saturn ♄ – Struktur, Abschluss, Bannen · Schwarz\n\nIm Deutschen sieht man es noch an „Sonntag“ und „Montag“, im Französischen an mardi (Mars), mercredi (Merkur), jeudi (Jupiter), vendredi (Venus).');
add('sinn','knowledge','Planetenstunden','Die Stunden des Tages gehören auch Planeten','Der Tag von Sonnenaufgang bis Sonnenuntergang wird in zwölf gleiche „Stunden“ geteilt, die Nacht bis zum nächsten Sonnenaufgang ebenso. Im Sommer sind die Tagesstunden länger als 60 Minuten, im Winter kürzer.\n\nDie erste Stunde nach Sonnenaufgang gehört dem Planeten des Tages. Danach folgen die Planeten in der chaldäischen Reihenfolge:\nSaturn → Jupiter → Mars → Sonne → Venus → Merkur → Mond → wieder Saturn …\n\nSo passt eine Venusstunde gut für Musik und Liebe, eine Saturnstunde zum Bannen und Aufräumen. Der Kalender in Pulse rechnet die Stunden für Wuppertal aus.');
add('sinn','knowledge','Der Mond in den Zeichen','Alle zwei bis drei Tage ein neues Zeichen','Der Mond wandert in etwa 27,3 Tagen einmal durch alle zwölf Tierkreiszeichen. In vielen Traditionen färbt das Zeichen die Stimmung des Tages.\n\nFeuer (Widder, Löwe, Schütze) – Antrieb, Mut, Bewegung\nErde (Stier, Jungfrau, Steinbock) – Körper, Ordnung, Handwerk\nLuft (Zwillinge, Waage, Wassermann) – Ideen, Gespräche, Schreiben\nWasser (Krebs, Skorpion, Fische) – Gefühl, Träume, Rituale\n\nPulse rechnet mit dem tropischen Tierkreis, wie in der westlichen Astrologie üblich. Der Kalender zeigt, wann der Mond das Zeichen wechselt.');
add('sinn','knowledge','Die 28 Mondstationen','Manazil al-Qamar · nach Agrippa','Der Mond braucht gut 27 Tage durch den Himmel. Arabische Astronomen teilten seinen Weg in 28 Stationen, eine für jede Nacht. In der Renaissance-Magie (Picatrix, Agrippa) bekam jede Station eine Wirkung.\n\nDie Stationen beginnen hier bei 0° Widder und sind je 12°51′ breit. Der Kalender zeigt die Station des Tages mit Namen, Bedeutung und traditionellem Thema.\n\nViele Themen sind alt und drastisch (Feindschaft, Gefangene, Belagerung). Pulse gibt sie vereinfacht wieder. Am besten als Anregung lesen, nicht als Vorschrift.');
add('sinn','knowledge','Tarot und Himmel','Zuordnungen des Golden Dawn','Der Hermetic Order of the Golden Dawn (um 1890) hat jede Tarotkarte einem Himmelsteil zugeordnet. Rider-Waite-Smith und Thoth folgen dem.\n\nZeichen → Große Arkana\nWidder Herrscher · Stier Hierophant · Zwillinge Liebende · Krebs Wagen · Löwe Kraft · Jungfrau Eremit · Waage Gerechtigkeit · Skorpion Tod · Schütze Mäßigkeit · Steinbock Teufel · Wassermann Stern · Fische Mond\n\nPlaneten → Große Arkana\nSonne Sonne · Mond Hohepriesterin · Merkur Magier · Venus Herrscherin · Mars Turm · Jupiter Rad · Saturn Welt\n\nDekane → Kleine Arkana\nJedes Zeichen hat drei Abschnitte zu 10°. Die Zahlenkarten 2 bis 10 verteilen sich darauf, beginnend mit der Zwei der Stäbe am Frühlingsanfang.\n\nDer Kalender zeigt dir jeden Tag die Karte der Sonne (Dekan), des Mondzeichens und des Planetentags.');
add('sinn','knowledge','Der keltische Baumkalender','Dreizehn Mondmonate · nach Robert Graves','Dreizehn Bäume für dreizehn Monate, vom Birkenmonat ab dem 24. Dezember bis zum Holundermonat, dazu der „Tag ohne Baum“ am 23. Dezember.\n\nEhrlich gesagt: Der Kalender stammt von Robert Graves („The White Goddess“, 1948) und ist keine überlieferte keltische Tradition. Er beruht auf dem Ogham-Alphabet und ist heute in vielen modernen Strömungen beliebt.\n\nBirke – Neubeginn · Eberesche – Schutz · Esche – Verbindung · Erle – Mut · Weide – Intuition · Weißdorn – Lebenslust · Eiche – Kraft · Stechpalme – Wehrhaftigkeit · Hasel – Weisheit · Weinrebe – Freude · Efeu – Beharrlichkeit · Schilfrohr – Ahnen · Holunder – Wandlung');
add('sinn','practice','Rauhnächte','Zwölf Nächte zwischen den Jahren','Die zwölf Nächte zwischen Heiligabend und Dreikönig gelten im deutschsprachigen Raum als Zeit außerhalb der Zeit. Jede Nacht steht für einen Monat des kommenden Jahres: die erste (24./25.12.) für Januar, die zwölfte (4./5.1.) für Dezember.\n\nBräuche:\n– Räuchern: Wohnung mit Beifuß, Salbei oder Weihrauch ausräuchern, Fenster danach öffnen\n– Träume notieren: Sie gelten als Hinweise auf den jeweiligen Monat\n– Keine Wäsche waschen, nichts Neues anfangen\n– Jeden Abend eine Frage an den kommenden Monat\n\nDer Kalender zeigt in den Rauhnächten, welcher Monat dran ist, und gibt eine Frage dazu.');
add('sinn','practice','Die 13 Wünsche','Ein Ritual für die Rauhnächte','Vor dem 24. Dezember:\nSchreib 13 Wünsche für das neue Jahr auf je einen eigenen Zettel. Positiv und in der Gegenwart formulieren. Falte sie, misch sie.\n\nIn jeder der zwölf Rauhnächte:\nZieh einen Zettel, ohne ihn zu lesen, und verbrenne ihn. Diesen Wunsch gibst du ab, er wird „vom Universum“ erledigt.\n\nAm 6. Januar:\nDer letzte Zettel bleibt übrig. Lies ihn. Um diesen Wunsch kümmerst du dich selbst.\n\nPasst gut zur Chaos-Magie: Das Verbrennen ohne Lesen ist eine Form des Vergessens, wie bei Sigillen.');
add('sinn','practice','Walpurgisnacht','30. April · Nacht der Hexen','In der Nacht auf den 1. Mai fliegen der Sage nach die Hexen auf den Brocken im Harz. Heute ein Fest der Freiheit, des Feuers und des Übergangs in den Sommer, eng verwandt mit Beltane.\n\n– Ein Feuer oder viele Kerzen\n– Tanzen, laut sein, Musik: ekstatische Gnosis\n– Etwas Altes symbolisch verbrennen\n– Blumen und Grün für den Mai holen');
add('sinn','practice','Johannisnacht','23. Juni · Feuer zur Sonnenwende','Die Nacht vor dem Johannistag, kurz nach der Sommersonnenwende. Johannisfeuer werden entzündet und übersprungen.\n\n– Johanniskraut sammeln, es blüht um diese Zeit\n– Kräuter für den Winter trocknen\n– Ein Wunsch ins Feuer\n– Die kürzeste Nacht wachbleiben und die Dämmerung erleben');
add('sinn','practice','Allerseelen und Día de los Muertos','1. und 2. November · die Toten besuchen','Allerseelen ist in Europa der Gedenktag für alle Verstorbenen. In Mexiko kommen am Día de los Muertos die Toten zu Besuch – nicht traurig, sondern als Fest.\n\n– Eine ofrenda (Altar): Fotos, Kerzen, Lieblingsessen und -getränke der Verstorbenen\n– Ringelblumen (Cempasúchil): Ihre Farbe und ihr Duft weisen den Weg\n– Geschichten über die Toten erzählen, ihre Musik hören\n– Auch Vorbilder und Künstlerinnen ehren, die dir etwas bedeutet haben\n\nSchließt gut an Samhain an.');
add('sinn','knowledge','Blauer Mond und Schwarzer Mond','Zweiter Vollmond, zweiter Neumond','Ein Blauer Mond ist im heutigen Sprachgebrauch der zweite Vollmond in einem Kalendermonat. Das passiert etwa alle zweieinhalb Jahre („once in a blue moon“).\n\nEin Schwarzer Mond ist entsprechend der zweite Neumond in einem Monat.\n\nIn modernen Praktiken gelten beide als Bonus-Termine: der Blaue Mond für besondere Wünsche oder seltene Rituale, der Schwarze Mond für tiefe Schattenarbeit und Neuanfänge, die niemand sehen soll. Der Kalender markiert beide.');

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
return {TYPES,TAROT,SUITS,MAJORS,MOON_PHASES,tarotCard,moon,ENTRIES:E,forRoom,get,search,searchTarot,daily,seasonal,season,hash};
});


