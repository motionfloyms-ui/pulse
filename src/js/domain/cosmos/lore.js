// SOURCE: domain/cosmos/lore.js
/* Texts for the calendar: the 24 solar terms, practice per moon phase (chaos-magic oriented),
   the twelve animals and five elements. Own wording; traditions differ, these are short orientations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseLore=api})(globalThis,function(){
 'use strict';
 const TERMS={
  Lichun:['Das Jahr der Sonne beginnt. In China der eigentliche Frühlingsbeginn, auch wenn es noch kalt ist.','Eine Absicht für die nächsten Monate formulieren und als Sigille festhalten.'],
  Yushui:['Schnee wird zu Regen, die Erde wird weich.','Altes aufweichen lassen: Was ist starr geworden?'],
  Jingzhe:['Der erste Donner weckt die Tiere aus dem Winterschlaf.','Etwas lange Liegengebliebenes anstoßen.'],
  Chunfen:['Tag und Nacht sind gleich lang. Ostara im Jahreskreis.','Gleichgewicht prüfen: Wo kippt es gerade?'],
  Qingming:['Klares, helles Licht. Zeit des Gräberfegens und der Ahnen.','Ahnen oder Vorbilder ehren, einen Ort aufräumen.'],
  Guyu:['Regen für das Saatgut. Letzter Abschnitt des Frühlings.','Was du gesät hast, jetzt gießen: dranbleiben.'],
  Lixia:['Der Sommer beginnt, das Wachstum beschleunigt sich.','Energie nach außen bringen: zeigen, teilen, auftreten.'],
  Xiaoman:['Das Korn füllt sich, ist aber noch nicht reif.','Zwischenstand ansehen, ohne schon zu ernten.'],
  Mangzhong:['Zeit für Aussaat und Ernte zugleich, viel Arbeit auf den Feldern.','Ein konkretes Projekt in Bewegung bringen.'],
  Xiazhi:['Längster Tag des Jahres. Litha im Jahreskreis; ab jetzt nimmt das Yin wieder zu.','Feuer- oder Sonnenritual, Dankbarkeit für das Erreichte.'],
  Xiaoshu:['Die Hitze steigt.','Kraft einteilen, nicht verbrennen.'],
  Dashu:['Heißeste Zeit des Jahres.','Kühle Praxis: Wasser, Stille, Rückzug in der Mittagshitze.'],
  Liqiu:['Der Herbst beginnt, die ersten Abende werden kühler.','Erste Ernte notieren: Was ist geworden?'],
  Chushu:['Die Hitze endet.','Abschluss eines Sommerprojekts feiern.'],
  Bailu:['Morgens liegt weißer Tau auf dem Gras.','Früh draußen sein, Sinne schärfen, Synchronizitäten notieren.'],
  Qiufen:['Tag und Nacht wieder gleich lang. Mabon im Jahreskreis.','Bilanz: Was behalten, was abgeben?'],
  Hanlu:['Der Tau wird kalt.','Vorräte anlegen, auch innere: Was nährt dich im Winter?'],
  Shuangjiang:['Der erste Reif fällt. Letzter Abschnitt des Herbstes.','Banishing: Ballast verabschieden, bevor der Winter kommt.'],
  Lidong:['Der Winter beginnt, die Natur zieht sich zurück.','Rückzug planen, Tagebuch und Träume ernster nehmen.'],
  Xiaoxue:['Erster leichter Schnee.','Stille Gnosis: tägliche Meditation, auch kurz.'],
  Daxue:['Starker Schnee, tiefe Ruhe.','Arbeit an Sigillen und Symbolen, nach innen gerichtet.'],
  Dongzhi:['Längste Nacht. Yule im Jahreskreis; das Licht kehrt zurück. In China ein Familienfest.','Kerze in der längsten Nacht, Absicht für das neue Licht.'],
  Xiaohan:['Die Kälte nimmt zu.','Durchhalten mit kleinen Ritualen.'],
  Dahan:['Kälteste Zeit, kurz vor dem Frühlingsanfang.','Aufräumen und reinigen vor dem neuen Zyklus.']
 };
 const PHASES=[
  {title:'Sigille erschaffen',text:'Absicht als positiven Satz formulieren und daraus eine Sigille bauen. Noch nicht laden.',lib:'sinn-sigille-nach-spare'},
  {title:'Sigille laden',text:'In stiller Gnosis auf die Sigille schauen, bis der Kopf leer ist. Danach bewusst vergessen.',lib:'sinn-gnosis'},
  {title:'In der Welt handeln',text:'Magie braucht einen Kanal: einen konkreten Schritt tun, der die Absicht wahrscheinlicher macht.',lib:'sinn-magisches-tagebuch'},
  {title:'Glauben vertiefen',text:'Ein laufendes Glaubenswechsel-Experiment bewusst ernst nehmen und Beobachtungen notieren.',lib:'sinn-glaubenswechsel'},
  {title:'Ekstase und Divination',text:'Ekstatische Gnosis (Tanz, Gesang) oder eine Tarot-Legung. Energie ist hoch.',lib:'sinn-gnosis'},
  {title:'Auswerten',text:'Tagebuch lesen: Was hat gewirkt, was nicht? Ergebnisse ehrlich eintragen.',lib:'sinn-magisches-tagebuch'},
  {title:'Banishing',text:'Altes verabschieden, Rituale schließen, Servitoren ruhen lassen. Lachen ist ein gutes Banishing.',lib:'sinn-banishing-durch-lachen'},
  {title:'Ruhe und Träume',text:'Keine neue Arbeit beginnen. Träume notieren, Kräfte sammeln.',lib:'sinn-ruhe-und-traumarbeit'}
 ];
 const ANIMALS={Ratte:'findig, wach, anpassungsfähig',Büffel:'ausdauernd, verlässlich, geduldig',Tiger:'mutig, impulsiv, kraftvoll',Hase:'feinfühlig, diplomatisch, vorsichtig',Drache:'charismatisch, ehrgeizig, groß denkend',Schlange:'klug, intuitiv, verschwiegen',Pferd:'frei, schnell, begeisterungsfähig',Ziege:'kreativ, sanft, gemeinschaftlich',Affe:'verspielt, erfinderisch, schlagfertig',Hahn:'genau, ehrlich, selbstbewusst',Hund:'treu, gerecht, wachsam',Schwein:'großzügig, genussfreudig, gutmütig'};
 const ELEMENTS={Holz:'Wachstum, Planung, Aufbruch',Feuer:'Antrieb, Sichtbarkeit, Leidenschaft',Erde:'Stabilität, Fürsorge, Mitte',Metall:'Klarheit, Struktur, Loslassen',Wasser:'Tiefe, Intuition, Ruhe'};
 return {TERMS,PHASES,ANIMALS,ELEMENTS};
});

