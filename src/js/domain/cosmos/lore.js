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
 /* Planetary days: traditional correspondences (Western magic, e.g. Agrippa, Golden Dawn). */
 const PLANETS={
  Sonne:{day:'Sonntag',color:'Gold, Gelb',metal:'Gold',themes:'Erfolg, Sichtbarkeit, Lebenskraft, Selbstausdruck',good:['Auftreten und sich zeigen','Ziele bekräftigen','Sonne und Licht tanken'],avoid:['sich klein machen']},
  Mond:{day:'Montag',color:'Silber, Weiß',metal:'Silber',themes:'Träume, Intuition, Gefühle, Zuhause',good:['Träume notieren','Divination','für das Zuhause sorgen'],avoid:['harte Entscheidungen erzwingen']},
  Mars:{day:'Dienstag',color:'Rot',metal:'Eisen',themes:'Mut, Kraft, Durchsetzung, Schutz',good:['Krafttraining','Grenzen setzen','Schutzzauber'],avoid:['Streit suchen']},
  Merkur:{day:'Mittwoch',color:'Orange, schillernd',metal:'Quecksilber',themes:'Sprache, Lernen, Schreiben, Planung, Handel',good:['lernen und recherchieren','Nachrichten beantworten','Briefe und Mails'],avoid:['vage Absprachen']},
  Jupiter:{day:'Donnerstag',color:'Blau, Purpur',metal:'Zinn',themes:'Wachstum, Fülle, Großzügigkeit, Weisheit',good:['groß planen','großzügig sein','Studium und Lehre'],avoid:['Maßlosigkeit']},
  Venus:{day:'Freitag',color:'Grün, Rosa',metal:'Kupfer',themes:'Liebe, Schönheit, Kunst, Musik, Genuss',good:['singen und musizieren','Schönes gestalten','Beziehungen pflegen'],avoid:['Konfrontation']},
  Saturn:{day:'Samstag',color:'Schwarz, Dunkelblau',metal:'Blei',themes:'Struktur, Grenzen, Abschluss, Bannen, Zeit',good:['aufräumen und abschließen','bannen','Routinen festigen'],avoid:['Neuanfänge aus einer Laune heraus']}
 };
 /* Moon sign by element: what the day favours. */
 const MOON_ELEMENTS={
  Feuer:{tone:'Antrieb und Mut',good:['Bewegung und Training','etwas Neues anstoßen','ekstatische Gnosis'],avoid:['langes Grübeln']},
  Erde:{tone:'Körper und Ordnung',good:['kochen und Vorrat anlegen','Handwerk, Haushalt','Geld- und Papierkram'],avoid:['zu viel auf einmal']},
  Luft:{tone:'Ideen und Austausch',good:['Gespräche','Schreiben und Songtexte','Pläne entwerfen'],avoid:['Rückzug ohne Grund']},
  Wasser:{tone:'Gefühl und Tiefe',good:['Rituale und Tarot','Traumarbeit','Musik hören und fühlen'],avoid:['harte Kritik, auch an dir selbst']}
 };
 const SIGN_TEXT={Widder:'impulsiv, mutig, schnell',Stier:'sinnlich, beständig, genießend',Zwillinge:'neugierig, gesprächig, beweglich',Krebs:'fürsorglich, gefühlvoll, häuslich',Löwe:'strahlend, großzügig, kreativ',Jungfrau:'genau, ordnend, heilsam',Waage:'ausgleichend, ästhetisch, gesellig',Skorpion:'tief, intensiv, verwandelnd',Schütze:'weit, optimistisch, suchend',Steinbock:'strukturiert, ausdauernd, ernst',Wassermann:'eigenwillig, frei, gemeinschaftlich',Fische:'träumerisch, durchlässig, mitfühlend'};
 /* Phase-based almanac advice (waxing builds, waning releases). */
 const PHASE_ADVICE=[
  {good:['Absichten formulieren','Sigillen bauen'],avoid:['Ergebnisse erwarten']},
  {good:['erste kleine Schritte'],avoid:['Pläne zerreden']},
  {good:['dranbleiben, handeln'],avoid:['beim ersten Widerstand aufgeben']},
  {good:['verfeinern und nähren'],avoid:['Projekte abbrechen']},
  {good:['feiern, sichtbar machen','Divination'],avoid:['wichtige Gespräche in Aufregung']},
  {good:['teilen und weitergeben','auswerten'],avoid:['Neues beginnen']},
  {good:['loslassen, ausmisten','bannen'],avoid:['neue Verpflichtungen']},
  {good:['ausruhen, Träume'],avoid:['große Anstrengungen']}
 ];
 function almanac({phase,element,planet}){
  const P=PLANETS[planet],E=MOON_ELEMENTS[element],A=PHASE_ADVICE[phase]||PHASE_ADVICE[0];
  const uniq=a=>[...new Set(a)];
  return {good:uniq([...A.good,...(E?E.good.slice(0,2):[]),...(P?P.good.slice(0,2):[])]).slice(0,6),avoid:uniq([...A.avoid,...(E?E.avoid:[]),...(P?P.avoid:[])]).slice(0,3)};
 }
 /* The 28 lunar mansions: Arabic name, meaning, use after Agrippa (simplified). */
 const MANSIONS=[
  ['Al-Sharatain','die zwei Zeichen','Aufbruch und Reisen; traditionell auch für Zwietracht'],['Al-Butain','der kleine Bauch','Finden und Festhalten'],['Al-Thurayya','die Plejaden','Gelingen, Handwerk, gute Geschäfte'],['Al-Dabaran','der Folgende','Trennung, Abgrenzung'],
  ['Al-Haqa','das Haarbüschel','Lernen, Gunst, gute Heimkehr'],['Al-Hana','das Mal','Liebe und Freundschaft'],['Al-Dhira','der Arm','Gewinn, Freundschaft'],['Al-Nathra','die Krippe','Bindung und Schutz'],
  ['Al-Tarf','der Blick','Vorsicht, Rückzug'],['Al-Jabha','die Stirn','Festigen und Stärken'],['Al-Zubra','die Mähne','Befreiung, Gewinn'],['Al-Sarfa','die Wende','Ernte, Arbeit'],
  ['Al-Awwa','der Bellende','Bündnisse, Gewinn'],['Al-Simak','der Unbewaffnete','Heilen und Verbinden'],['Al-Ghafr','die Bedeckung','Suchen, Graben, Verborgenes'],['Al-Zubana','die Scheren','Handel, Bewegung, Befreiung'],
  ['Al-Iklil','die Krone','Schutz und Treue'],['Al-Qalb','das Herz','Durchsetzen, Fundamente legen'],['Al-Shaula','der Stachel','Austreiben, Bannen'],['Al-Naaim','die Strauße','Zähmen, Bändigen'],
  ['Al-Balda','die Stadt','Abschluss, Trennung'],['Sad al-Dhabih','Glück des Schlachters','Entkommen, Heilen'],['Sad Bula','Glück des Schluckers','Heilen, Auflösen'],['Sad al-Suud','Glück der Glücke','Glück, Liebe, Gelingen'],
  ['Sad al-Akhbiya','Glück der Zelte','Botschaften, Abwehr'],['Al-Fargh al-Muqaddam','der vordere Ausguss','Gunst und Verbundenheit'],['Al-Fargh al-Muakhkhar','der hintere Ausguss','Wachstum, Heilung'],['Batn al-Hut','der Bauch des Fisches','Fülle, Vermehrung']
 ];
 const TREES={Birke:'Neubeginn, Reinigung',Eberesche:'Schutz, Vision',Esche:'Verbindung der Welten',Erle:'Standhaftigkeit, Mut',Weide:'Intuition, Mond, Fließen',Weißdorn:'Lebenslust, Schwelle',Eiche:'Kraft, Ausdauer',Stechpalme:'Schutz, Wehrhaftigkeit',Hasel:'Weisheit, Inspiration',Weinrebe:'Ernte, Freude',Efeu:'Verbundenheit, Beharrlichkeit',Schilfrohr:'Ahnen, Stimme, Tiefe',Holunder:'Ende und Wandlung','Tag ohne Baum':'der freie Tag zwischen den Jahren'};
 /* Rauhnächte: each night stands for a month of the coming year. */
 const RAUH=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'].map((m,i)=>({month:m,text:['Was will im neuen Jahr beginnen?','Was darf sich reinigen?','Wo will etwas wachsen?','Was öffnet sich?','Wofür brennst du?','Was ist in Fülle da?','Was trägt dich?','Was willst du ernten?','Was darf sich ordnen?','Was darfst du loslassen?','Was willst du ehren?','Wofür bist du dankbar?'][i]}));
 return {TERMS,PHASES,ANIMALS,ELEMENTS,PLANETS,MOON_ELEMENTS,SIGN_TEXT,PHASE_ADVICE,almanac,MANSIONS,TREES,RAUH};
});

