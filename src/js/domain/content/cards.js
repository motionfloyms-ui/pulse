// SOURCE: domain/content/cards.js
/* Written cards for the daily stack: short pieces on mind and science, physics and the cosmos, tarot
   and magic, voice and music, art and how artists work, and prompts for writing. Own words, no quoted
   passages; names and works are given so the reader can go further. No DOM. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseCards=api})(globalThis,function(){
 'use strict';
 const TOPICS={
  geist:{name:'Bewusstsein & Wissenschaft',short:'Geist',room:'innen'},
  kosmos:{name:'Physik & Kosmos',short:'Kosmos',room:'sinn'},
  magie:{name:'Tarot & Magie',short:'Magie',room:'sinn'},
  stimme:{name:'Musik & Gesang',short:'Stimme',room:'ideen'},
  kunst:{name:'Kunst & Künstler',short:'Kunst',room:'ideen'},
  schreiben:{name:'Schreiben',short:'Schreiben',room:'ideen'}
 };
 const KINDS={gedanke:'Gedanke',wissen:'Wissen',uebung:'Übung',impuls:'Schreibimpuls',portrait:'Wie sie arbeiten',frage:'Frage'};
 const ALL=[];
 /* more: ask (Frage zum Mitnehmen), try (Probier das), act (timer|write|sigil|tarot|cutup|warmup|song|sky), min, spread, read (Weiterlesen) */
 const add=(topic,kind,slug,title,text,more={})=>ALL.push({id:topic+'-'+slug,topic,kind,title,text,...more});

 /* ---------- Bewusstsein & Wissenschaft ---------- */
 add('geist','gedanke','lichtkegel','Der kognitive Lichtkegel',
  'Der Biologe Michael Levin beschreibt jedes Lebewesen über die Größe der Ziele, die es verfolgen kann. Ein Bakterium kümmert sich um Zucker wenige Mikrometer entfernt und Sekunden voraus. Ein Hund um seinen Garten und den nächsten Morgen. Ein Mensch um Kontinente und Jahrhunderte.\n\nSpannend wird es im Körper: Einzelne Zellen haben winzige Kegel. Verbunden legen sie zusammen ein großes Ziel fest, etwa die Form eines Organs. Krebs deutet Levin als Zellen, deren Kegel wieder auf sie selbst zusammenschrumpft.',
  {ask:'Wie weit reicht dein Lichtkegel heute: Stunden, Wochen oder Jahre?',read:'Michael Levin: „Technological Approach to Mind Everywhere“ (2022)'});
 add('geist','wissen','bioelektrik','Ein Gedächtnis für Formen',
  'Plattwürmer (Planarien) wachsen nach, wenn man sie zerschneidet. In Levins Labor veränderte man bei solchen Würmern nur kurz das elektrische Spannungsmuster der Zellen, nicht die Gene. Ergebnis: Würmer mit zwei Köpfen.\n\nDas Verblüffende: Schneidet man diese Würmer später erneut, wachsen wieder zwei Köpfe. Der Bauplan steckt offenbar in einem elektrischen Muster, das sich die Zellen merken. Ein Gedächtnis ohne Gehirn.',
  {ask:'Wo in deinem Leben steckt ein Gedächtnis, das nicht im Kopf liegt?',read:'Durant u. a., Biophysical Journal (2017)'});
 add('geist','wissen','xenobots','Zellen, die etwas Neues lernen',
  '2020 setzten Forschende Zellen von Froschembryonen zu winzigen Klümpchen zusammen. Diese „Xenobots“ schwammen, sammelten Partikel und bauten 2021 aus losen Zellen sogar neue Klümpchen ihrer Art. Nichts davon steht so in den Genen eines Frosches.\n\nSpäter gelang Ähnliches mit menschlichen Zellen aus der Luftröhre: Die „Anthrobots“ förderten im Labor die Heilung verletzter Nervenzellen. Alte Zellen, neue Verhaltensweisen.',
  {ask:'Was können Teile von dir, wovon das Ganze nichts weiß?',read:'Kriegman, Blackiston, Levin, Bongard, PNAS (2020, 2021)'});
 add('geist','gedanke','halluzination','Kontrollierte Halluzination',
  'Der Neurowissenschaftler Anil Seth beschreibt Wahrnehmung als die beste Vermutung des Gehirns. Es sagt ständig voraus, was draußen ist, und nutzt die Sinne vor allem, um die Vermutung zu korrigieren. Wahrnehmung entsteht also von innen nach außen.\n\nSeth geht weiter: Bewusstsein hänge eng daran, einen lebendigen Körper am Leben zu halten. Deshalb hält er Maschinen ohne Stoffwechsel für eher nicht bewusst. Viele widersprechen ihm genau an dieser Stelle.',
  {ask:'Seth bindet Bewusstsein an Lebendigsein. Wo genau siehst du das anders, und warum?',read:'Anil Seth: „Being You“ (2021)'});
 add('geist','uebung','vorhersage','Die Erwartung sehen',
  'Das Gehirn arbeitet wie eine Vorhersagemaschine. Starke Erwartungen schlagen dabei manchmal sogar die Sinne. Ein bekanntes Beispiel ist die hohle Maske: Eine von innen gesehene Gesichtsmaske wirkt trotzdem nach außen gewölbt, weil Gesichter nun einmal nach außen gewölbt sind.\n\nSo etwas passiert auch im Alltag ständig, nur unauffälliger.',
  {try:'Achte heute auf einen Moment, in dem du etwas „gesehen“ oder „gehört“ hast, das gar nicht da war: ein Wort, eine Person, ein Geräusch.',ask:'Welche Erwartung hat diesen Fehler erzeugt?'});
 add('geist','gedanke','hartes-problem','Das harte Problem',
  'Der Philosoph David Chalmers unterschied 1995 zwei Arten von Fragen. Die „leichten“: Wie verarbeitet das Gehirn Farben, wie steuert es Aufmerksamkeit, wie entsteht Sprache? Schwer genug, aber lösbar.\n\nUnd das „harte“ Problem: Warum fühlt sich all diese Verarbeitung überhaupt nach etwas an? Warum ist Rot nicht nur eine Zahl, sondern ein Erlebnis? Darauf gibt es bis heute keine Antwort, auf die sich alle einigen.',
  {ask:'Ist das harte Problem ein echtes Rätsel oder eine falsch gestellte Frage?',read:'David Chalmers: „The Conscious Mind“ (1996)'});
 add('geist','frage','fledermaus','Wie ist es, eine Fledermaus zu sein?',
  'Thomas Nagel stellte 1974 eine einfache Frage: Wie ist es, eine Fledermaus zu sein? Fledermäuse orientieren sich über Echos. Wir können uns vorstellen, wie wir uns als Fledermaus fühlen würden, aber nicht, wie es für die Fledermaus selbst ist.\n\nNagels Punkt: Ein Wesen ist bewusst, wenn es irgendwie ist, dieses Wesen zu sein. Und genau dieses Innen entzieht sich der Beschreibung von außen.',
  {ask:'Welches Wesen würdest du gern einen Tag lang von innen kennen, und was würdest du zuerst wissen wollen?',read:'Thomas Nagel: „What Is It Like to Be a Bat?“ (1974)'});
 add('geist','wissen','oktopus','Denken mit acht Armen',
  'Ein Krake hat rund eine halbe Milliarde Nervenzellen, etwa zwei Drittel davon sitzen in den Armen. Ein abgetrennter Arm greift noch, und die Arme lösen kleine Aufgaben teils selbstständig.\n\nKraken haben sich unabhängig von uns zu klugen Tieren entwickelt. Unser letzter gemeinsamer Vorfahre war ein wurmartiges Wesen vor über 500 Millionen Jahren. Ein zweiter, fremder Weg zu einem Geist.',
  {ask:'Wie fühlt es sich an, sich ein Ich vorzustellen, das über den ganzen Körper verteilt ist?',read:'Peter Godfrey-Smith: „Der Krake, das Meer und die tiefen Ursprünge des Bewusstseins“'});
 add('geist','wissen','schleimpilz','Der Schleimpilz und das Bahnnetz',
  'Physarum polycephalum ist ein gelber Schleimpilz aus einer einzigen riesigen Zelle, ohne Nervensystem. 2010 legten japanische Forschende Haferflocken so aus wie die Städte rund um Tokio. Der Pilz verband sie mit einem Netz aus Schläuchen, das dem echten Bahnnetz in Effizienz und Ausfallsicherheit erstaunlich nahekam.\n\nSpätere Versuche zeigten, dass er sich an harmlose bittere Stoffe gewöhnen kann. Eine einfache Form von Lernen.',
  {ask:'Wo löst du Probleme, ohne nachzudenken, nur durch Ausprobieren und Verwerfen?',read:'Tero u. a., Science (2010)'});
 add('geist','wissen','split-brain','Der Erklärer im Kopf',
  'Bei manchen Menschen mit schwerer Epilepsie wurde früher die Brücke zwischen den Hirnhälften durchtrennt. Roger Sperry und Michael Gazzaniga untersuchten sie. Zeigte man nur der rechten Hälfte eine Aufforderung, etwa „geh“, stand die Person auf. Gefragt warum, erfand die sprechende linke Hälfte sofort einen plausiblen Grund.\n\nGazzaniga nannte das den „Interpreten“. Er erzählt flüssig eine Geschichte, auch wenn er die wahren Gründe nicht kennt.',
  {ask:'Wann hast du zuletzt eine Begründung gegeben, die sich erst danach ergeben hat?',read:'Michael Gazzaniga: „Die Ich-Illusion“'});
 add('geist','wissen','gummihand','Wo der Körper aufhört',
  'Eine Gummihand liegt sichtbar vor dir, deine echte Hand ist verdeckt. Jemand streichelt beide gleichzeitig mit einem Pinsel. Nach kurzer Zeit fühlen viele den Pinsel in der Gummihand. Manche zucken, wenn man sie bedroht.\n\nDas Experiment von 1998 zeigt: Das Gefühl, dass ein Körperteil zu einem gehört, baut das Gehirn laufend neu zusammen, aus Sehen, Tasten und Zeitgleichheit.',
  {ask:'Wo endet für dich dein Körper: an der Haut, an der Kleidung, am Instrument?',read:'Botvinick & Cohen, Nature (1998)'});
 add('geist','wissen','blindsehen','Sehen, ohne zu sehen',
  'Manche Menschen mit Schäden im Sehzentrum sagen, sie sehen in einem Teil ihres Blickfelds nichts. Bittet man sie trotzdem zu raten, wo dort ein Licht aufblitzt oder wohin sich etwas bewegt, liegen sie weit über dem Zufall.\n\nLawrence Weiskrantz nannte das „Blindsehen“. Ein Teil der Verarbeitung läuft, ohne bewusst zu werden.',
  {ask:'Was weißt du, ohne zu wissen, dass du es weißt?',read:'Lawrence Weiskrantz: „Blindsight“ (1986)'});
 add('geist','gedanke','jetzt','Das Jetzt ist geschnitten',
  'Was du als „jetzt“ erlebst, ist schon ein kleines bisschen Vergangenheit. Das Gehirn sammelt Signale über einen kurzen Zeitraum und fügt sie danach zu einer Szene zusammen.\n\nEin Beweis dafür ist der „kutane Hase“: Klopft man kurz hintereinander auf Handgelenk und Ellbogen, spüren viele auch Klopfer dazwischen, die es nie gab. Der spätere Reiz verändert, wie der frühere erlebt wird.',
  {ask:'Wenn das Jetzt eine Montage ist: Wer schneidet?'});
 add('geist','gedanke','erinnern','Erinnern heißt neu bauen',
  'Eine Erinnerung wird nicht abgespielt wie eine Datei. Beim Abrufen wird sie für kurze Zeit wieder formbar und danach neu abgespeichert. Studien um 2000 zeigten das bei Tieren, Versuche von Elizabeth Loftus schon in den 1970ern beim Menschen: Ein einziges Wort in einer Frage kann eine Erinnerung verändern.\n\nJede Erinnerung trägt Spuren aller Male, die du sie erzählt hast.',
  {ask:'Welche Geschichte erzählst du so oft, dass du vielleicht nur noch die Erzählung kennst?',read:'Nader, Schafe & LeDoux, Nature (2000)'});
 add('geist','gedanke','selbstmodell','Das Selbst als Modell',
  'Der Philosoph Thomas Metzinger vertritt eine radikale These: Es gibt kein Ding namens Selbst. Das Gehirn baut ein Modell von dem Organismus, in dem es steckt. Und weil es dieses Modell nicht als Modell erkennt, erleben wir es als uns selbst.\n\nMetzinger nennt das den Ego-Tunnel. Wir schauen durch ihn hindurch, ohne seine Wände zu sehen.',
  {ask:'Was ändert sich, wenn du dein Ich einen Moment lang als Modell betrachtest und nicht als Tatsache?',read:'Thomas Metzinger: „Der Ego-Tunnel“ (2009)'});
 add('geist','wissen','pflanzen','Wissen Pflanzen etwas?',
  'Die Mimose klappt ihre Blätter ein, wenn sie fällt. Monica Gagliano ließ Mimosen 2014 immer wieder harmlos fallen. Nach einer Weile klappten sie nicht mehr ein, reagierten aber weiter auf andere Reize. Sie hatten sich gewöhnt, und das hielt wochenlang.\n\nPflanzen tauschen auch Duftstoffe als Warnsignale aus. Ob man das „Lernen“ oder „Kommunikation“ nennen sollte, ist umstritten. Und genau das macht die Frage spannend.',
  {ask:'Ab wann würdest du einem Wesen ein Innenleben zugestehen?',read:'Gagliano u. a., Oecologia (2014)'});
 add('geist','frage','maschinen','Können Maschinen erleben?',
  'Drei große Lager stehen sich gegenüber. Funktionalisten sagen: Entscheidend ist die Organisation, nicht das Material. Was die richtigen Abläufe hat, erlebt auch. John Searle hielt dagegen, dass bloßes Verarbeiten von Symbolen noch kein Verstehen ist. Anil Seth bindet Bewusstsein an das Lebendigsein.\n\nDie Frage ist offen, und sie wird mit jeder neuen KI dringender.',
  {ask:'Woran würdest du erkennen, dass ein anderes Wesen erlebt, ohne vorauszusetzen, dass es aus Zellen besteht?'});
 add('geist','uebung','luzid','Wach werden im Traum',
  'Klarträume, also Träume, in denen man weiß, dass man träumt, sind im Schlaflabor nachgewiesen. Die Träumenden geben dabei mit vereinbarten Augenbewegungen Signale. 2021 beantworteten Klarträumende im Labor sogar einfache Rechenaufgaben, die man ihnen im Schlaf stellte.\n\nViele trainieren das mit Realitätschecks am Tag.',
  {try:'Frag dich heute fünfmal: „Träume ich?“ Lies dabei einen Text, schau weg und lies ihn noch mal. Im Traum ändert sich Text oft.',ask:'Was würdest du im ersten Klartraum als Erstes tun?',read:'Konkoly u. a., Current Biology (2021)'});
 add('geist','wissen','phi','Bewusstsein als Zahl',
  'Die Integrierte Informationstheorie von Giulio Tononi misst Bewusstsein mit einer Größe namens Phi. Gemeint ist, wie sehr ein System als Ganzes mehr Information trägt als seine Teile einzeln. Eine Folge: Auch sehr einfache Systeme hätten ein kleines bisschen Erleben.\n\n2023 nannten über hundert Forschende die Theorie in einem offenen Brief „Pseudowissenschaft“. Andere verteidigen sie. Ein großer Streit um eine große Idee.',
  {ask:'Wenn Bewusstsein eine Frage des Grades ist: Wo auf der Skala steht ein Stein, ein Wald, ein Netzwerk?'});
 add('geist','wissen','buehne','Die Bühne im Kopf',
  'Nach der Theorie des globalen Arbeitsraums (Bernard Baars, Stanislas Dehaene) arbeiten im Gehirn viele Spezialisten unbewusst nebeneinander. Bewusst wird eine Information, wenn sie auf eine Art Bühne kommt und an alle gleichzeitig gesendet wird.\n\nIn einem großen Wettstreit, den Forschende gemeinsam planten, wurde diese Theorie gegen die Integrierte Informationstheorie getestet. Keine kam unbeschadet heraus.',
  {ask:'Was steht gerade auf deiner Bühne, und was arbeitet hinter dem Vorhang?'});

 /* ---------- Physik & Kosmos ---------- */
 add('kosmos','wissen','doppelspalt','Der Doppelspalt',
  'Schickt man einzelne Elektronen durch zwei schmale Spalten, landen sie als einzelne Punkte auf dem Schirm. Mit der Zeit bilden die Punkte aber ein Streifenmuster, als wäre jedes Elektron als Welle durch beide Spalten gegangen.\n\nPrüft man, durch welchen Spalt es fliegt, verschwindet das Muster. „Beobachten“ heißt hier: mit etwas wechselwirken. Ein Bewusstsein braucht es dafür nicht, auch wenn das oft behauptet wird.',
  {ask:'Wo verändert dein Hinschauen das, was du anschaust?'});
 add('kosmos','wissen','verschraenkung','Spukhafte Fernwirkung',
  'Zwei verschränkte Teilchen verhalten sich wie ein einziges System, egal wie weit sie auseinander sind. Misst man das eine, steht das Ergebnis am anderen fest. Einstein fand das „spukhaft“.\n\nExperimente von Alain Aspect, John Clauser und Anton Zeilinger zeigten, dass die Natur wirklich so funktioniert. Dafür gab es 2022 den Physik-Nobelpreis. Nachrichten schneller als das Licht lassen sich damit trotzdem nicht schicken.',
  {ask:'Welche Verbindung in deinem Leben hält, egal wie viel Abstand dazwischen ist?'});
 add('kosmos','gedanke','unschaerfe','Unschärfe hörst du jeden Tag',
  'Heisenbergs Unschärferelation klingt nach Messproblem. Sie ist aber eine Eigenschaft von Wellen, und die kennst du aus der Musik. Ein sehr kurzer Ton hat keine klare Tonhöhe, er klingt wie ein Klick. Je länger ein Ton dauert, desto genauer lässt sich seine Frequenz bestimmen.\n\nBei Teilchen ist es genauso: Je schärfer der Ort, desto unschärfer der Impuls. Die Natur ist nicht ungenau, sie ist wellig.',
  {try:'Sing einen Ton ganz kurz und dann lang. Hör, ab wann er eine Tonhöhe bekommt.'});
 add('kosmos','wissen','sternenasche','Du bist Sternenasche',
  'Der Wasserstoff in deinem Körper ist fast so alt wie das Universum, rund 13,8 Milliarden Jahre. Kohlenstoff, Sauerstoff, Calcium und Eisen wurden in Sternen gebrannt und bei deren Tod verstreut.\n\nUnd Gold? Es entsteht zu einem großen Teil, wenn Neutronensterne zusammenstoßen. 2017 wurde so ein Zusammenstoß zum ersten Mal mit Gravitationswellen und Licht zugleich beobachtet.',
  {ask:'Welcher Teil von dir fühlt sich am ältesten an?'});
 add('kosmos','uebung','rueckblick','Jeder Blick ist ein Blick zurück',
  'Licht braucht Zeit. Den Mond siehst du, wie er vor gut einer Sekunde war, die Sonne wie vor gut acht Minuten. Sirius, der hellste Stern am Nachthimmel, zeigt sich dir so, wie er vor etwa 8,6 Jahren aussah. Die Andromeda-Galaxie, gerade noch mit bloßem Auge sichtbar, vor rund 2,5 Millionen Jahren.\n\nDer Nachthimmel ist ein Archiv.',
  {try:'Such heute Abend einen hellen Stern und überleg, was du gemacht hast, als dieses Licht losflog.'});
 add('kosmos','wissen','dunkle-materie','Was wir nicht sehen',
  'In den 1970ern maß Vera Rubin, wie schnell sich Galaxien drehen. Die äußeren Sterne waren viel zu schnell, um von der sichtbaren Materie gehalten zu werden. Es muss mehr Masse geben, die nicht leuchtet.\n\nNach heutigen Messungen besteht das Universum nur zu etwa 5 Prozent aus gewöhnlicher Materie, zu rund 27 Prozent aus dunkler Materie und zu etwa 68 Prozent aus dunkler Energie. Fast alles ist unbekannt.',
  {ask:'Wie fühlt es sich an, dass fast alles im Universum unbekannt ist?'});
 add('kosmos','wissen','dunkle-energie','Das Universum gibt Gas',
  '1998 maßen zwei Teams ferne Sternexplosionen und stellten fest: Das Universum dehnt sich nicht langsamer aus, sondern immer schneller. Dafür gab es 2011 den Nobelpreis. Die Ursache heißt „dunkle Energie“, ein Name für etwas, das niemand versteht.\n\nNeue Kartierungen von Millionen Galaxien deuten seit 2024 an, dass sich diese Energie mit der Zeit verändern könnte. Sicher ist das noch nicht.',
  {ask:'Woran in deinem Leben hältst du fest, nur weil es lange als Konstante galt?'});
 add('kosmos','wissen','schatten','Das Foto eines Schattens',
  '2019 zeigte das Event Horizon Telescope das erste Bild eines Schwarzen Lochs, im Zentrum der Galaxie M87. Das Bild entstand, weil Radioteleskope auf der ganzen Erde zusammengeschaltet wurden, zu einem Teleskop so groß wie die Erde.\n\nZu sehen ist kein Loch, sondern ein Schatten in einem Ring aus glühendem Gas. 2022 folgte das Bild des Schwarzen Lochs in unserer eigenen Milchstraße.',
  {ask:'Was kennst du nur durch den Schatten, den es wirft?'});
 add('kosmos','wissen','zeitdehnung','Dein Kopf altert schneller',
  'Je stärker die Schwerkraft, desto langsamer vergeht die Zeit. 2010 maßen Forschende den Unterschied mit zwei Atomuhren, von denen eine nur etwa 33 Zentimeter höher stand. Er ist winzig, aber messbar.\n\nDein Kopf altert also ein kleines bisschen schneller als deine Füße. Navigationssatelliten müssen solche Effekte ständig ausgleichen, sonst würde dein Handy dich nach einem Tag kilometerweit falsch verorten.',
  {ask:'Wenn Zeit überall anders schnell läuft: Welche Zeit ist dann deine?'});
 add('kosmos','gedanke','zeitpfeil','Warum Zeit eine Richtung hat',
  'Die Grundgesetze der Physik funktionieren vorwärts wie rückwärts. Trotzdem zerbricht ein Glas, aber es setzt sich nie von selbst wieder zusammen. Der Grund ist die Entropie, grob gesagt die Unordnung. Sie nimmt im Großen immer zu.\n\nDass wir uns an die Vergangenheit erinnern und nicht an die Zukunft, hängt damit zusammen, dass das Universum sehr geordnet begonnen hat.',
  {ask:'Was in deinem Leben lässt sich nicht mehr zusammensetzen, und was ist daraus gewachsen?'});
 add('kosmos','wissen','vakuum','Das Nichts ist voll',
  'Leerer Raum ist nach der Quantenphysik nicht leer. Felder schwanken ständig. Ein messbarer Beleg ist der Casimir-Effekt: Zwei Metallplatten, sehr nah beieinander im Vakuum, werden leicht zueinander gedrückt.\n\nVorhergesagt wurde das 1948, genau gemessen 1997. Selbst das Nichts hat eine Struktur.',
  {ask:'Wann war ein scheinbar leerer Moment für dich voller als gedacht?'});
 add('kosmos','wissen','urlicht','Das älteste Licht',
  'Etwa 380.000 Jahre nach dem Urknall wurde das Universum durchsichtig. Das Licht von damals erreicht uns heute als schwaches Mikrowellenrauschen aus allen Richtungen.\n\nEntdeckt wurde es 1965 durch Zufall: Zwei Radioastronomen suchten die Ursache eines Rauschens in ihrer Antenne und verdächtigten sogar Taubenkot. Ein kleiner Teil des Rauschens alter Röhrenfernseher stammte aus genau dieser Strahlung.',
  {ask:'Welches „Rauschen“ in deinem Alltag könnte eine Botschaft sein?'});
 add('kosmos','wissen','mond-entfernt','Der Mond geht langsam',
  'Seit den Apollo-Flügen stehen Spiegel auf dem Mond. Laserpulse von der Erde zeigen: Der Mond entfernt sich um etwa 3,8 Zentimeter pro Jahr, ungefähr so schnell, wie Fingernägel wachsen.\n\nDie Gezeiten bremsen dabei die Erde. Vor rund 400 Millionen Jahren war ein Tag kürzer und ein Jahr hatte etwa 400 Tage. Das lässt sich an den Wachstumsringen fossiler Korallen ablesen.',
  {ask:'Was entfernt sich in deinem Leben so langsam, dass du es nur über Jahre merkst?',act:'sky'});
 add('kosmos','gedanke','blauer-punkt','Der blasse blaue Punkt',
  'Am 14. Februar 1990 drehte sich die Raumsonde Voyager 1 aus etwa sechs Milliarden Kilometern Entfernung noch einmal um und fotografierte die Erde. Auf dem Bild ist sie kleiner als ein Pixel, ein bläuliches Pünktchen in einem Lichtstrahl.\n\nCarl Sagan hatte das Foto angeregt. Er wollte, dass wir sehen, wie klein der Ort ist, an dem alles passiert, was wir kennen.',
  {ask:'Was wird kleiner, wenn du es aus sechs Milliarden Kilometern ansiehst, und was größer?',read:'Carl Sagan: „Blauer Punkt im All“'});
 add('kosmos','frage','deutungen','Was ist eigentlich wirklich?',
  'Die Quantenmechanik sagt Messergebnisse perfekt voraus. Was dabei „wirklich“ geschieht, ist umstritten. Nach der Kopenhagener Deutung entscheidet sich etwas erst bei der Messung. Nach der Viele-Welten-Deutung verzweigt sich die Welt bei jedem Ergebnis. Bei der Führungswelle von Bohm haben Teilchen immer einen Ort.\n\nAlle Deutungen sagen dasselbe voraus. Schrödingers Katze war übrigens als Spott über die Lage gedacht.',
  {ask:'Welche Deutung fühlt sich für dich richtig an, und was sagt das über dich?'});
 add('kosmos','wissen','tunnel','Durch Wände gehen',
  'Nach klassischer Physik dürfte die Sonne gar nicht leuchten. Die Protonen in ihrem Inneren sind nicht schnell genug, um ihre gegenseitige Abstoßung zu überwinden und zu verschmelzen.\n\nSie tun es trotzdem, weil Quantenteilchen mit einer kleinen Wahrscheinlichkeit durch Barrieren „tunneln“, die sie eigentlich nicht überwinden können. Ohne diesen Effekt gäbe es kein Sonnenlicht und keine Flash-Speicher in deinem Handy.',
  {ask:'Welche Wand hast du schon einmal durchquert, die eigentlich zu hoch war?'});
 add('kosmos','frage','fermi','Wo sind denn alle?',
  'Bei einem Mittagessen 1950 fragte der Physiker Enrico Fermi, wo all die Außerirdischen seien. Bei so vielen Sternen und so viel Zeit müssten wir längst Spuren sehen.\n\nAntworten gibt es viele. Leben könnte sehr selten sein. Zivilisationen könnten sich selbst zerstören, schweigen oder ganz anders kommunizieren, als wir erkennen können. Oder wir haben noch nicht lange genug zugehört.',
  {ask:'Welche Antwort auf Fermis Frage findest du am beunruhigendsten, welche am schönsten?'});
 add('kosmos','uebung','nordlicht','Polarlicht über Deutschland',
  'Polarlicht entsteht, wenn geladene Teilchen der Sonne auf die Lufthülle treffen. Bei starken Sonnenstürmen ist es auch in Deutschland zu sehen, wie im Mai 2024. Die Sonnenaktivität folgt einem Zyklus von etwa elf Jahren und war um 2024 und 2025 besonders hoch.\n\nTipp: Schau nach Norden, weg von Lichtern. Handykameras sehen das Leuchten oft deutlicher als das Auge.',
  {try:'Merk dir den Kp-Index aus der Weltraumwetter-Vorhersage. Ab etwa 6 bis 7 lohnt sich bei klarem Himmel ein Blick nach Norden.'});
 add('kosmos','uebung','sterne-zaehlen','Fünfzehn Minuten Nacht',
  'Die Augen brauchen 20 bis 30 Minuten, um sich ganz an die Dunkelheit anzupassen. Ein Blick aufs helle Handy setzt das teilweise zurück. Rotes Licht stört weniger.\n\nIn der Stadt siehst du vielleicht ein paar Dutzend Sterne, an einem wirklich dunklen Ort Tausende. Gegen Lichtverschmutzung hilft schon ein Park oder ein Hinterhof ohne Laternen.',
  {try:'Geh heute Abend für 15 Minuten raus, ohne Handy in der Hand, und zähl die Sterne in einem Bereich so groß wie deine Faust.',act:'timer',min:15});

 /* ---------- Tarot & Magie ---------- */
 add('magie','uebung','gnosis','Gnosis: der stille Moment',
  'In der Chaosmagie, wie Peter J. Carroll sie 1978 in „Liber Null“ beschrieb, wirkt eine Absicht am besten in einem besonderen Zustand: dann, wenn der bewusste Verstand für einen Moment schweigt. Das heißt Gnosis.\n\nCarroll unterscheidet zwei Wege. Der ruhige führt über Stille, starren Blick und Meditation. Der erregte über Tanz, Trommeln und Ekstase. Beide sollen dasselbe bewirken: ein Loch im inneren Kommentar.',
  {try:'Fünf Minuten: Schau auf einen festen Punkt oder eine Kerzenflamme, ohne zu blinzeln, so lange es angenehm ist. Atme langsam. Bemerk, wann die Gedanken leiser werden.',act:'timer',min:5,read:'Peter J. Carroll: „Liber Null & Psychonaut“'});
 add('magie','gedanke','paradigma','Glaube als Werkzeug',
  'Eine Kernidee der Chaosmagie: Glaube ist kein Bekenntnis, sondern ein Werkzeug. Man legt ein Glaubenssystem an wie ein Kostüm, arbeitet eine Zeit lang ganz darin und legt es wieder ab. Mal sind es nordische Runen, mal Tarot, mal ausgedachte Götter aus einem Roman.\n\nWas zählt, ist die Wirkung. Das verlangt Ernsthaftigkeit im Spiel und Ehrlichkeit danach.',
  {ask:'Welchen Glauben könntest du eine Woche lang probehalber tragen, und woran würdest du merken, dass er etwas verändert?'});
 add('magie','portrait','spare','Austin Osman Spare',
  'Spare (1886–1956) war ein Londoner Maler, mit 17 schon in der Royal Academy ausgestellt, später fast vergessen und arm. Er entwickelte die Methode, die bis heute die Grundlage der Sigillenmagie ist: Absicht aufschreiben, doppelte Buchstaben streichen, den Rest zu einem Zeichen verschmelzen, das Zeichen laden und dann bewusst vergessen.\n\nFür Spare gehörten Kunst und Magie zusammen. Er zeichnete automatisch, ohne zu planen, um an das Unbewusste heranzukommen.',
  {act:'sigil',ask:'Welche Absicht würdest du heute zu einem Zeichen machen?',read:'Austin Osman Spare: „The Book of Pleasure“ (1913)'});
 add('magie','uebung','lachen','Bannen mit Lachen',
  'Nach einer Arbeit wird „gebannt“, also abgeschlossen und der Kopf wieder freigemacht. Klassische Bannungen sind Rituale mit Gesten und Namen. Carroll empfahl auch etwas sehr Einfaches: lachen.\n\nLachen beendet den Ernst, entlädt die Spannung und schafft Abstand zur eigenen Absicht. Genau das braucht eine Sigille, um vergessen zu werden.',
  {try:'Wenn du heute etwas Magisches oder Schweres abgeschlossen hast: Lach laut, auch wenn es sich anfangs gespielt anfühlt. Gespieltes Lachen wird oft echt.'});
 add('magie','wissen','servitor','Ein Servitor',
  'Ein Servitor ist in der Chaosmagie ein bewusst erschaffenes Gedankenwesen mit einer einzigen Aufgabe. Man gibt ihm einen Namen, ein Zeichen, eine klare Aufgabe, eine Art, es zu „füttern“, und ein Ende.\n\nDas Ende ist wichtig: Gute Praxis legt von Anfang an fest, wann und wie der Servitor wieder aufgelöst wird. Ob man ihn als Wesen oder als psychologisches Werkzeug versteht, bleibt jeder selbst überlassen.',
  {ask:'Welche kleine, klar begrenzte Aufgabe würdest du einem Servitor geben, und wann soll er sich auflösen?',act:'sigil',read:'Phil Hine: „Condensed Chaos“ (1995)'});
 add('magie','uebung','drei-karten','Drei Karten: Situation, Hindernis, Rat',
  'Eine der ruhigsten Legungen für den Alltag. Die erste Karte zeigt, worum es geht. Die zweite, was im Weg steht. Die dritte, was helfen könnte.\n\nTrick zum Lernen: Lies die drei Karten zuerst als Geschichte, bevor du die einzelnen Bedeutungen nachschlägst. Was passiert zwischen den Bildern?',
  {act:'tarot',spread:'drei',ask:'Welche Frage stellst du den drei Karten?'});
 add('magie','uebung','bild-lesen','Lies das Bild, nicht das Buch',
  'Viele lernen Tarot über Bedeutungslisten. Schneller geht es oft über das Bild selbst. Was ist zu sehen? Welche Farben? Wohin geht der Blick, wohin die Bewegung? Was liegt im Hintergrund?\n\nDecks wie The Wild Unknown von Kim Krans arbeiten fast nur mit Tieren und Natur. Dort sprechen die Bilder besonders direkt: Ein Tier in einer Lage erzählt eine Stimmung.',
  {try:'Zieh eine Karte und beschreib sie zwei Minuten lang nur, was du siehst, ohne Deutung. Danach erst: Was sagt sie dir?',act:'tarot',spread:'drei'});
 add('magie','wissen','tarot-geschichte','Tarot war zuerst ein Spiel',
  'Die ältesten erhaltenen Tarotkarten stammen aus dem Italien des 15. Jahrhunderts, etwa die prächtigen Visconti-Sforza-Karten um 1450. Gespielt wurde damit ein Stichspiel, wie heute noch das Tarock.\n\nErst 1781 behauptete Antoine Court de Gébelin, die Karten bewahrten ägyptische Weisheit. Das stimmte nicht, setzte aber die esoterische Deutung in Gang, die über den Golden Dawn bis zu den heutigen Decks führt.',
  {ask:'Ändert es etwas für dich, dass die Karten als Spiel begannen?'});
 add('magie','portrait','pamela','Pamela Colman Smith',
  'Pamela Colman Smith (1878–1951) malte 1909 die Bilder des bekanntesten Tarots, das lange nur nach dem Verleger Rider und dem Okkultisten Waite benannt wurde. Als eine der Ersten gab sie auch den kleinen Arkana ganze Szenen statt bloßer Symbole. Darum lässt sich dieses Deck so gut „lesen“.\n\nSie malte oft zu Musik und beschrieb Bilder, die beim Hören vor ihr auftauchten. Für die 78 Karten bekam sie eine einmalige Bezahlung und starb verarmt.',
  {ask:'Welche Musik würde ein Bild in dir aufrufen, wenn du es zuließest?'});
 add('magie','gedanke','narrenreise','Die Reise des Narren',
  'Die 22 großen Arkana lassen sich als Reise lesen. Der Narr (0) bricht auf, begegnet dem Magier, der Hohepriesterin, der Herrscherin und so weiter, durch Prüfung, Verlust und Wandlung bis zur Welt (XXI).\n\nEine bekannte Lernhilfe: Leg die Karten I bis XXI in drei Reihen zu sieben und den Narren davor. Jede Reihe erzählt einen Abschnitt: die Welt draußen, die Welt innen, das, was größer ist als man selbst.',
  {ask:'An welcher Station der Reise stehst du gerade, ehrlich betrachtet?'});
 add('magie','uebung','elemente','Vier Farben, vier Elemente',
  'Die kleinen Arkana haben vier Farben, und jede steht meistens für ein Element. Stäbe für Feuer: Antrieb, Wille, Kreativität. Kelche für Wasser: Gefühle, Beziehungen. Schwerter für Luft: Denken, Worte, Konflikte. Pentakel für Erde: Körper, Geld, Alltag.\n\nManche Decks ordnen anders zu, aber dieses Muster ist am verbreitetsten.',
  {try:'Ordne die drei wichtigsten Dinge von heute einem Element zu. Welches Element fehlt dir gerade?'});
 add('magie','uebung','tagebuch','Das magische Tagebuch',
  'Fast alle Lehrbücher der Chaosmagie empfehlen dasselbe: ein ehrliches Tagebuch. Datum, was du getan hast, in welchem Zustand, mit welcher Absicht. Und später: was passiert ist, auch wenn nichts passiert ist.\n\nGerade die Misserfolge machen das Tagebuch wertvoll. So wird aus Magie eine Art Forschung am eigenen Leben.',
  {act:'write',ask:'Was hast du zuletzt magisch versucht, und was ist seitdem geschehen?'});
 add('magie','gedanke','synchron','Sinnvolle Zufälle',
  'C. G. Jung nannte es Synchronizität: zwei Ereignisse ohne erkennbare Ursache, die sich trotzdem bedeutsam anfühlen. Er entwickelte den Begriff zusammen mit dem Physiker Wolfgang Pauli, 1952 erschien ihr gemeinsames Buch.\n\nEhrlicherweise neigt das Gehirn dazu, Treffer zu bemerken und Fehlschläge zu vergessen. Wer Synchronizitäten ernst nimmt, schreibt deshalb auch auf, wann nichts passiert ist.',
  {ask:'Welcher Zufall hat dich zuletzt nicht losgelassen?',read:'C. G. Jung & Wolfgang Pauli: „Naturerklärung und Psyche“ (1952)'});
 add('magie','uebung','sigille-kunst','Die Sigille als Kunstwerk',
  'Eine Sigille muss nicht hässlich sein. Spare zeichnete seine Zeichen mit derselben Sorgfalt wie seine Bilder. Manche gestalten Sigillen als Muster, Stickerei, Tattoo-Entwurf oder Ornament in einem Bild.\n\nJe mehr Aufmerksamkeit in die Gestaltung fließt, desto stärker ist die Ladung, so die Idee. Und desto leichter vergisst der Verstand den Satz dahinter.',
  {try:'Zeichne deine nächste Sigille mit der anderen Hand oder mit geschlossenen Augen.',act:'sigil'});
 add('magie','uebung','mondrhythmus','Säen und ernten mit dem Mond',
  'Viele Traditionen ordnen Absichten dem Mond zu. Bei zunehmendem Mond wird begonnen und aufgebaut, bei Vollmond geladen und gefeiert, bei abnehmendem Mond losgelassen und gebannt, bei Neumond still gesät.\n\nOb der Mond dabei wirkt oder nur der Rhythmus, den du dir setzt: Ein Zyklus von 29,5 Tagen ist ein guter Takt für Absichten.',
  {act:'sky',ask:'Was möchtest du bis zum nächsten Vollmond wachsen lassen?'});
 add('magie','gedanke','hypersigille','Die Hypersigille',
  'Der Comicautor Grant Morrison prägte den Begriff Hypersigille: ein ganzes Werk, eine Geschichte, ein Comic oder ein Song als ausgedehnte Sigille. Morrison schrieb in den 1990ern „The Invisibles“ bewusst so und berichtete, das eigene Leben habe begonnen, dem Comic zu folgen.\n\nEin Songtext, den man immer wieder singt, wiederholt seine Absicht bei jedem Auftritt.',
  {ask:'Welcher Text von dir will etwas in der Welt bewegen, und was genau?',act:'song'});
 add('magie','uebung','schattenkarte','Die Karte, die du nicht magst',
  'Jeder hat eine Karte, die er lieber nicht zieht. Für C. G. Jung lag im „Schatten“ das, was wir an uns nicht sehen wollen, oft mit viel Kraft darin.\n\nSchattenarbeit mit Tarot heißt: Genau diese Karte bewusst anschauen und fragen, warum sie stört.',
  {try:'Such die Karte heraus, die dir am unangenehmsten ist. Leg sie eine Woche sichtbar hin.',act:'write',ask:'Was an dieser Karte stört dich, und wo findest du das in dir?'});
 add('magie','gedanke','spiegel','Ein Spiegel, keine Vorhersage',
  'Viele Tarotlesende benutzen die Karten nicht, um die Zukunft vorherzusagen, sondern als Spiegel. Statt „Wird es klappen?“ fragen sie: „Was übersehe ich?“ oder „Was brauche ich, um diesen Schritt zu gehen?“\n\nOffene Fragen geben den Bildern Raum. Ja-Nein-Fragen machen aus 78 Karten eine Münze.',
  {ask:'Wie heißt deine aktuelle Ja-Nein-Frage als offene Frage?'});
 add('magie','uebung','messen','Magie mit Messlatte',
  'Wer wissen will, ob eine Arbeit wirkt, braucht ein klares Ziel. Nicht „mehr Glück“, sondern etwas, das sich prüfen lässt: eine Antwort, ein Ereignis, eine Veränderung bis zu einem Datum.\n\nNach Ablauf schaust du ehrlich nach. Getroffen, verfehlt oder anders als gedacht?',
  {act:'write',ask:'Formuliere eine Absicht, die du in 30 Tagen eindeutig überprüfen kannst.'});

 /* ---------- Musik & Gesang ---------- */
 add('stimme','uebung','strohhalm','Singen durch den Strohhalm',
  'Wird der Mund teilweise verschlossen, zum Beispiel durch einen Strohhalm, staut sich die Luft ein wenig zurück. Das entlastet die Stimmlippen und lässt sie leichter schwingen. Der Stimmforscher Ingo Titze hat solche Übungen bekannt gemacht.\n\nSie eignen sich zum Einsingen, zum Abwärmen und an heiseren Tagen. Noch sanfter wird es mit einem Strohhalm in einem Glas Wasser: Blubbern mit Ton.',
  {try:'Drei Minuten: Gleite durch den Strohhalm von tief nach hoch und zurück, wie eine Sirene. Danach normal singen und den Unterschied hören.',act:'timer',min:3});
 add('stimme','wissen','verzerrung','Woher die Verzerrung kommt',
  'Bei gesunden Screams und Growls entsteht das Raue meist oberhalb der eigentlichen Stimmlippen: an den Taschenfalten, an den Stellknorpeln oder am Kehldeckel. Die Stimmlippen selbst sollen dabei nicht gepresst werden.\n\nGute Technik fühlt sich nach Arbeit im Rumpf und Weite im Hals an, nie nach Reiben oder Kratzen. Wird es heiser oder tut es weh: aufhören. Eine Lehrerin für Extremgesang ist die beste Investition.',
  {ask:'Wie fühlt sich dein Hals nach dem Proben an, und was sagt dir das?',read:'Melissa Cross: „The Zen of Screaming“'});
 add('stimme','uebung','stilles-lachen','Das stille Lachen',
  'Eine Grundübung aus dem Estill-Training: Lach lautlos, so als würdest du dich über etwas amüsieren, ohne Geräusch. Im Hals entsteht ein Gefühl von Weite. Dabei weichen die Taschenfalten zur Seite.\n\nDiese Weite ist die Basis für viele Techniken, von kraftvollem klarem Gesang bis zu Screams. Viele Probleme mit Druck im Hals beginnen dort, wo diese Weite verloren geht.',
  {try:'Eine Minute stilles Lachen. Dann einen Ton singen und die Weite festhalten.'});
 add('stimme','uebung','fry','Vom Fry zum Scream',
  'Vocal Fry ist das tiefe Knarren, das manche am Ende von Sätzen machen. Viele Screamer nutzen es als Ausgangspunkt: entspannt, leise, mit wenig Luft. Erst wenn das stabil ist, kommen Lautstärke, Resonanz und mehr Luft dazu.\n\nWichtig ist die Reihenfolge: zuerst Leichtigkeit, dann Kraft. Wer mit Kraft anfängt, presst.',
  {try:'Zwei Minuten leises Fry auf „a“, dann auf „e“. Ganz ohne Druck. Fühlt es sich leicht an?'});
 add('stimme','wissen','wasser','Wasser kommt nicht an die Stimmlippen',
  'Was du trinkst, fließt nicht über die Stimmlippen, sondern durch die Speiseröhre. Die Stimme profitiert trotzdem, nur zeitverzögert über den ganzen Körper. Darum bringt viel Trinken kurz vor dem Auftritt wenig, regelmäßiges Trinken den Tag über viel.\n\nDirekt an die Schleimhäute kommt Feuchtigkeit beim Inhalieren von Dampf. Kaffee in Maßen ist kein Problem, Alkohol trocknet aus.',
  {ask:'Wie sieht dein Wasser-Plan vor der nächsten Probe aus?'});
 add('stimme','uebung','abwaermen','Abwärmen nach dem Singen',
  'Nach Sport dehnt man, nach intensivem Singen wird abgewärmt: ein paar Minuten sanft und leise, damit sich die Muskulatur beruhigt. Gut eignen sich Lippenflattern, Summen und langsame Gleitbewegungen von oben nach unten.\n\nGerade nach Screams hilft das, die Stimme wieder in eine entspannte Sprechlage zu bringen.',
  {try:'Fünf Minuten nach der nächsten Probe: Lippenflattern und Summen auf absteigenden Linien.',act:'timer',min:5});
 add('stimme','uebung','vokale','Vokale formen den Klang',
  'Für hohe Töne verändern Sängerinnen die Vokale ein wenig, etwa ein „i“ in Richtung „ü“ oder ein „a“ in Richtung „o“. Der Ton passt dann besser in die Resonanzräume. Das nennt man Vokalausgleich.\n\nAuch bei Screams klingt jeder Vokal anders: Offene Vokale wie „a“ tragen meist besser als enge wie „i“.',
  {try:'Sing denselben Ton nacheinander auf a, e, i, o, u. Welcher Vokal klingt am vollsten, welcher am engsten?'});
 add('stimme','uebung','prosodie','Betonung trifft Takt',
  'Prosodie heißt: Die betonten Silben eines Textes fallen auf die starken Zählzeiten der Musik. Passt das nicht, klingt eine Zeile holprig, auch wenn niemand sagen kann, warum. Es sei denn, der Bruch ist gewollt.\n\nDer Test ist einfach: Sprich die Zeile ganz normal und markiere die Silben, die du betonst. Dann sing sie zum Riff.',
  {act:'song',try:'Nimm eine Zeile deines aktuellen Textes und prüf, ob die betonten Silben auf den Schlägen landen.'});
 add('stimme','uebung','object-writing','Zehn Minuten Object Writing',
  'Pat Pattison, Songwriting-Lehrer am Berklee College, empfiehlt eine tägliche Übung: zehn Minuten über einen beliebigen Gegenstand schreiben, mit allen sieben Sinnen. Sehen, hören, tasten, schmecken, riechen, dazu das Körpergefühl innen und die Bewegung.\n\nEs geht nicht um gute Texte, sondern darum, Bilder zu sammeln, aus denen später Zeilen werden.',
  {try:'Wähl den nächsten Gegenstand in deiner Nähe. Zehn Minuten Timer, schreib ohne abzusetzen.',act:'timer',min:10,read:'Pat Pattison: „Writing Better Lyrics“'});
 add('stimme','wissen','reime','Reime, die nicht klingeln',
  'Perfekte Reime wie „Herz und Schmerz“ wirken schnell vorhersehbar. Songwriter nutzen deshalb oft verwandte Reime: gleiche Vokale, ähnliche Konsonanten. „Nacht“ und „hart“, „Stein“ und „Zeit“.\n\nAssonanz (gleiche Vokale) und Konsonanz (gleiche Konsonanten) halten einen Text zusammen, ohne mit dem Zaunpfahl zu winken. Gerade im harten Gesang zählt der Klang der Silben oft mehr als der saubere Reim.',
  {try:'Such zu einem Wort aus deinem letzten Text fünf Wörter mit demselben Vokal, aber anderem Ende.'});
 add('stimme','wissen','growl-geschichte','Woher das Growlen kommt',
  'Raue, tiefe Stimmen gab es im Metal schon früh, etwa bei Venom oder Celtic Frost in den frühen 1980ern. Ende der 1980er entwickelte sich in Florida und in Schweden der Death Metal, und mit ihm das Growlen als eigene Gesangstechnik.\n\nSeitdem hat sich die Technik enorm verfeinert. Heute gibt es Lehrbücher, Kurse und Forschung dazu, wie man jahrelang schreien kann, ohne die Stimme zu verlieren.',
  {ask:'Welche Stimme hat dich als Erste dazu gebracht, selbst so singen zu wollen?'});
 add('stimme','uebung','stuetze','Stütze heißt nicht Bauch einziehen',
  'Die klassische Stütze, italienisch Appoggio, hält beim Singen die Einatemspannung ein Stück weit aufrecht. Rippen und Flanken bleiben weit, während die Luft ruhig und gleichmäßig ausströmt.\n\nDas Gegenteil wäre, den Bauch beim Singen kräftig einzuziehen. Dann schießt die Luft heraus, und die Stimme muss dagegenhalten.',
  {try:'Atme in vier Zählzeiten ein, dann zisch 20 Sekunden lang gleichmäßig auf „s“. Bleiben die Rippen dabei weit?'});
 add('stimme','uebung','dreimal-hoeren','Dreimal hören',
  'Aktives Hören trainiert das Ohr schneller als nebenbei laufende Musik. Nimm einen Song, den du magst, und hör ihn dreimal hintereinander, jedes Mal mit einem anderen Fokus: nur die Stimme, nur den Bass, nur das Schlagzeug.\n\nDu wirst Dinge hören, die dir in hundert Durchläufen nebenbei nicht aufgefallen sind.',
  {try:'Ein Song, drei Durchläufe, drei Schichten. Notier, was dich überrascht hat.',act:'write'});
 add('stimme','wissen','doppeln','Doppeln und Schichten',
  'Wird dieselbe Gesangslinie zweimal aufgenommen und links und rechts verteilt, klingt sie breiter und dichter. Die kleinen Unterschiede zwischen den Takes machen den Effekt aus.\n\n1966 erfand ein Techniker in den Abbey Road Studios eine Maschine, die das künstlich nachahmte, weil John Lennon keine Lust hatte, alles zweimal zu singen. Bei Screams werden oft mehrere Spuren geschichtet: tief, mittel, hoch.',
  {ask:'Welche Zeile deines aktuellen Songs würde gedoppelt stärker?'});
 add('stimme','wissen','lampenfieber','Lampenfieber umdeuten',
  'Die Psychologin Alison Wood Brooks ließ 2014 Menschen vor einer Karaoke-Aufgabe entweder „Ich bin ängstlich“, „Ich bin aufgeregt“ oder gar nichts sagen. Wer seine Nervosität als Aufregung bezeichnete, sang messbar genauer.\n\nDer Körper ist bei Angst und Vorfreude ähnlich aktiviert. Sich zu beruhigen ist schwer, die Erregung umzudeuten ist leichter.',
  {try:'Sag dir vor dem nächsten Auftritt oder der nächsten Aufnahme laut: „Ich bin aufgeregt.“',read:'Brooks, Journal of Experimental Psychology: General (2014)'});
 add('stimme','portrait','bowie-cutup','Bowie und die Schere',
  'David Bowie schnitt in den 1970ern Sätze aus Texten und Notizen aus und mischte sie neu. Die Technik stammte von William S. Burroughs und Brion Gysin. In den 1990ern ließ er sich ein Programm schreiben, den Verbasizer, das Sätze automatisch zerlegte und neu kombinierte.\n\nEs ging ihm nicht um Zufallstexte, sondern um Funken: unerwartete Verbindungen, die er dann weiterschrieb.',
  {act:'cutup',ask:'Welcher deiner Texte würde zerschnitten etwas Neues verraten?'});
 add('stimme','uebung','twang','Twang: Klang ohne Druck',
  'Twang ist im Estill-Training eine Verengung knapp über den Stimmlippen. Der Klang wird heller, schneidender und lauter, ohne dass mehr Druck nötig ist. Man kennt ihn vom Gackern einer Hexe oder vom Quaken einer Ente.\n\nIm Metal hilft Twang, durch eine laute Band zu kommen, ohne die Stimme zu überfordern.',
  {try:'Mach ein freches „Nyeh, nyeh“ wie ein Kind, das jemanden ärgert. Dann sing eine Zeile mit genau diesem Klang.'});
 add('stimme','wissen','stimmruhe','Stimmruhe ist kein Flüstern',
  'Nach einer heftigen Probe oder einem Konzert braucht die Stimme Pause. Viele flüstern dann. Gepresstes Flüstern kann die Stimme aber mehr belasten als leises, entspanntes Sprechen.\n\nBesser: wenig sprechen, leise und locker, viel trinken, Dampf inhalieren. Bei Heiserkeit, die länger als zwei Wochen bleibt, gehört die Stimme zu einer Ärztin oder einem Arzt für Stimmheilkunde.',
  {ask:'Wie gönnst du deiner Stimme nach der nächsten intensiven Session Ruhe?'});
 add('stimme','uebung','einsingen','Zehn Minuten Einsingen',
  'Eine kurze Routine vor jeder Probe schützt die Stimme und spart Zeit beim Warmwerden. Sie bringt Atmung, Resonanz und Höhe in Gang, bevor es laut wird.\n\nPULSE hat eine Einsing-Routine mit Tonvorgabe, auf Wunsch mit einem Teil für Extremgesang.',
  {act:'warmup'});

 /* ---------- Kunst & Künstler ---------- */
 add('kunst','portrait','af-klint','Hilma af Klint',
  'Die schwedische Malerin Hilma af Klint (1862–1944) malte ab 1906 große abstrakte Bilder, Jahre bevor Kandinsky als „Erfinder“ der Abstraktion gefeiert wurde. Ihre Bilder entstanden aus spiritistischen Sitzungen mit vier Freundinnen, der Gruppe „Die Fünf“. Sie verstand sich als Werkzeug für Botschaften.\n\nSie verfügte, ihr abstraktes Werk erst 20 Jahre nach ihrem Tod zu zeigen. 2018 wurde ihre Ausstellung im Guggenheim New York die meistbesuchte in der Geschichte des Museums.',
  {ask:'Für wen machst du Kunst, die vielleicht erst später verstanden wird?',read:'Ausstellung „Paintings for the Future“, Guggenheim (2018)'});
 add('kunst','uebung','kandinsky','Farben hören',
  'Wassily Kandinsky schrieb 1911 „Über das Geistige in der Kunst“. Darin ordnete er Farben Klängen zu: Ein helles Gelb klinge wie eine Trompete, ein tiefes Blau wie ein Cello. Ob er echter Synästhet war, ist umstritten. Für seine Malerei war die Verbindung von Musik und Farbe zentral.\n\nSeine Bilder nannte er oft wie Musikstücke: Improvisation, Komposition.',
  {try:'Hör ein Stück und mal oder kritzle fünf Minuten lang nur Farben und Formen dazu, ohne etwas darzustellen.',act:'timer',min:5,read:'Wassily Kandinsky: „Über das Geistige in der Kunst“'});
 add('kunst','portrait','agnes-martin','Agnes Martin',
  'Agnes Martin (1912–2004) malte jahrzehntelang fast nur Raster und blasse Streifen auf quadratischen Leinwänden. Sie lebte zurückgezogen in New Mexico und las jahrzehntelang keine Zeitung.\n\nSie malte erst, wenn ihr ein Bild im Kopf erschien, manchmal wartete sie lange darauf. Dann führte sie es mit großer Genauigkeit aus. Bilder, die ihrer inneren Vorstellung nicht entsprachen, zerstörte sie.',
  {ask:'Worauf wartest du, bevor du anfängst, und was, wenn du es nicht erzwingen musst?'});
 add('kunst','portrait','bourgeois','Louise Bourgeois und die Spinne',
  'Louise Bourgeois (1911–2010) baute riesige Spinnen aus Bronze und Stahl, die größte heißt „Maman“. Die Spinne stand für ihre Mutter, die in der Familienwerkstatt alte Wandteppiche restaurierte: geduldig, klug, beschützend, eine Weberin.\n\nBourgeois sprach offen davon, dass ihre Kunst ein Weg war, mit Erinnerungen und Ängsten aus ihrer Kindheit umzugehen. Sie arbeitete bis ins hohe Alter fast täglich.',
  {ask:'Welches Tier würde für einen Menschen stehen, der dich geprägt hat?'});
 add('kunst','uebung','woolf','Der Strom des Bewusstseins',
  'Virginia Woolfs Roman „Mrs Dalloway“ (1925) erzählt einen einzigen Junitag in London. Woolf folgt dabei den Gedanken ihrer Figuren, springt von einem Kopf zum nächsten, von der Gegenwart in Erinnerungen und zurück. Man nennt das Bewusstseinsstrom.\n\nDie Handlung ist fast nebensächlich. Es geht darum, wie es sich anfühlt, an diesem Tag diese Menschen zu sein.',
  {try:'Zehn Minuten: Schreib auf, was gerade durch deinen Kopf zieht, ohne zu ordnen und ohne Punkt.',act:'timer',min:10});
 add('kunst','portrait','kafka','Kafka in einer Nacht',
  'In der Nacht vom 22. auf den 23. September 1912 schrieb Franz Kafka „Das Urteil“ in einem Zug, von zehn Uhr abends bis sechs Uhr morgens. Er beschrieb das später als Durchbruch: So, nur so könne man schreiben.\n\nTagsüber arbeitete er bei einer Versicherungsanstalt in Prag. Seinen Freund Max Brod bat er, nach seinem Tod alles zu verbrennen. Brod tat es nicht.',
  {ask:'Wann hast du zuletzt etwas in einem Zug gemacht, ohne zu unterbrechen?'});
 add('kunst','frage','rilke','Musst du schreiben?',
  'Zwischen 1903 und 1908 schrieb Rainer Maria Rilke Briefe an einen jungen Mann, der ihm Gedichte geschickt hatte. Rilke beurteilte die Gedichte kaum. Stattdessen riet er ihm, nicht nach außen zu schauen, sondern in sich zu gehen und sich zu fragen, ob er schreiben müsse.\n\nDie Briefe erschienen 1929 und werden bis heute von Kunstschaffenden gelesen, die zweifeln.',
  {ask:'Was würde fehlen, wenn du aufhören würdest zu schreiben und zu singen?',read:'Rainer Maria Rilke: „Briefe an einen jungen Dichter“'});
 add('kunst','uebung','cage','Vier Minuten, dreiunddreißig Sekunden',
  'Bei der Uraufführung von John Cages „4′33″“ 1952 setzte sich ein Pianist an den Flügel und spielte nichts. Die Musik waren die Geräusche im Saal: Regen, Husten, Stühle.\n\nCage war vorher in einem schalltoten Raum gewesen und hatte erwartet, Stille zu hören. Er hörte zwei Töne, einen hohen und einen tiefen: sein Nervensystem und seinen Blutkreislauf, wie man ihm erklärte.',
  {try:'Stell den Timer und hör einfach zu. Was ist die Musik dieses Raums?',act:'timer',min:5});
 add('kunst','uebung','oblique','Karten gegen die Blockade',
  'Brian Eno und der Maler Peter Schmidt veröffentlichten 1975 die „Oblique Strategies“: ein Kartenset mit über hundert kurzen, rätselhaften Anweisungen für Momente, in denen man im Studio feststeckt. Man zieht eine Karte und folgt ihr, auch wenn sie keinen Sinn zu ergeben scheint.\n\nDas Prinzip lässt sich nachbauen: eigene Karten mit eigenen Regeln.',
  {try:'Schreib zehn eigene Anweisungen für deine nächste Schreibblockade, je eine Zeile.',act:'write'});
 add('kunst','portrait','abramovic','Die Künstlerin ist anwesend',
  'Für „The Artist Is Present“ saß Marina Abramović 2010 im Museum of Modern Art in New York insgesamt über 700 Stunden auf einem Stuhl. Besucherinnen und Besucher konnten sich ihr gegenübersetzen und ihr schweigend in die Augen sehen, so lange sie wollten.\n\nViele weinten. Das Werk bestand aus nichts als Aufmerksamkeit.',
  {try:'Schau eine Minute lang einen einzigen Gegenstand an, ohne wegzusehen und ohne ihn zu benennen.',act:'timer',min:1});
 add('kunst','gedanke','kintsugi','Gold in den Rissen',
  'Kintsugi ist eine japanische Technik, zerbrochene Keramik mit Lack zu kitten, der mit Goldpulver bestäubt wird. Die Bruchlinien werden nicht versteckt, sondern betont. Das reparierte Gefäß gilt nicht als beschädigt, sondern als eines mit Geschichte.\n\nDahinter steht die Ästhetik des Wabi-Sabi: Schönheit im Unvollkommenen und Vergänglichen.',
  {ask:'Welcher Bruch in deinem Leben verdient eine goldene Linie statt eines Verstecks?'});
 add('kunst','portrait','lynch','David Lynch und die großen Fische',
  'David Lynch (1946–2025) verglich Ideen mit Fischen: Kleine schwimmen an der Oberfläche, die großen tief unten. Man fängt sie mit Geduld, Wunsch und Aufmerksamkeit. Er meditierte seit 1973 täglich und hielt das für die Quelle seiner Arbeit.\n\nJahrelang ging er jeden Tag zur selben Zeit ins selbe Diner und trank einen Milchshake. Die immer gleiche Routine hielt den Kopf frei für das Ungewöhnliche.',
  {ask:'Welche Routine könnte dir den Kopf freihalten für das Ungewöhnliche?',read:'David Lynch: „Catching the Big Fish“'});
 add('kunst','uebung','morgenseiten','Morgenseiten',
  'Julia Cameron empfiehlt in „Der Weg des Künstlers“ (1992) eine tägliche Übung: jeden Morgen drei Seiten mit der Hand schreiben, ohne Ziel, ohne zu lesen, was man geschrieben hat. Alles darf hinein, auch Banales und Gejammer.\n\nDie Seiten sind keine Kunst. Sie räumen den Kopf auf, damit danach Platz für Kunst ist. Dazu kommt ein wöchentliches „Künstlerdate“ allein mit sich.',
  {try:'Morgen früh: drei Seiten, Stift und Papier, bevor das Handy angeht.',act:'write',read:'Julia Cameron: „Der Weg des Künstlers“'});
 add('kunst','portrait','goya','Die schwarzen Bilder',
  'Zwischen 1819 und 1823 malte Francisco de Goya, inzwischen alt und taub, direkt auf die Wände seines Landhauses bei Madrid. Es wurden düstere, verstörende Szenen, darunter der Gott Saturn, der seinen Sohn verschlingt.\n\nDie Bilder waren nie für Publikum gedacht. Sie hingen in seinem Esszimmer. Erst Jahrzehnte später wurden sie von den Wänden gelöst und kamen in den Prado.',
  {ask:'Was würdest du malen oder schreiben, wenn es sicher nie jemand sieht?'});
 add('kunst','gedanke','beuys','Jeder Mensch ein Künstler',
  'Joseph Beuys erweiterte den Kunstbegriff radikal. Für ihn war jeder Mensch ein Künstler, weil jeder die Gesellschaft mitgestaltet. Er nannte das soziale Plastik.\n\nFür die documenta 1982 ließ er 7000 Eichen in Kassel pflanzen, jede neben einem Basaltstein. Die Bäume stehen heute noch. Ein Kunstwerk, das wächst.',
  {ask:'Was gestaltest du gerade, das du nie Kunst genannt hast?'});
 add('kunst','uebung','oulipo','Ein Roman ohne E',
  'Georges Perec schrieb 1969 einen ganzen Roman ohne den Buchstaben e. Die deutsche Übersetzung schafft es ebenfalls ohne. Perec gehörte zur Gruppe Oulipo, die mit selbst gesetzten Regeln schrieb.\n\nDie Idee: Einschränkungen zwingen weg von den gewohnten Wörtern und Bildern. Was zuerst wie ein Spiel aussieht, führt oft an Stellen, die man sonst nie erreicht hätte.',
  {try:'Schreib vier Zeilen über deinen Tag ohne den Buchstaben e.',act:'write',read:'Georges Perec: „Anton Voyls Fortgang“'});
 add('kunst','uebung','langsam-sehen','Langsam sehen',
  'Eine Studie im Metropolitan Museum ergab 2001: Besucherinnen und Besucher schauen ein Kunstwerk im Mittel kaum länger als eine Viertelminute an. Viele Museen laden deshalb zu „Slow Looking“ ein: ein einziges Werk, zehn Minuten oder länger.\n\nNach den ersten Minuten wird es oft langweilig. Danach beginnt man, wirklich zu sehen.',
  {try:'Such dir ein Bild, ein Foto oder eine Tarotkarte und schau es zehn Minuten an. Notier danach drei Dinge, die du zuerst nicht gesehen hast.',act:'timer',min:10});
 add('kunst','portrait','kahlo','Frida Kahlo im Spiegel',
  'Nach einem schweren Busunfall 1925 lag Frida Kahlo monatelang im Bett. Ihre Mutter ließ eine Staffelei anfertigen, die im Liegen funktionierte, und einen Spiegel über dem Bett anbringen. So malte Kahlo sich selbst.\n\nViele ihrer Bilder sind Selbstporträts, voller Symbole aus mexikanischer Volkskunst, Körper, Schmerz und Stolz. Aus der Einschränkung wurde ihr Thema.',
  {ask:'Welche Einschränkung könnte zu deinem Thema werden statt zu deinem Hindernis?'});
 add('kunst','portrait','bausch','Pina Bausch fragte',
  'Pina Bausch (1940–2009) leitete ab 1973 das Tanztheater Wuppertal und veränderte den Tanz weltweit. Ihre Stücke begannen oft nicht mit Schritten, sondern mit Fragen an ihre Tänzerinnen und Tänzer: nach Erinnerungen, Sehnsüchten, kleinen Gesten aus dem Alltag.\n\nAus den Antworten, gespielt, getanzt oder gesprochen, baute sie Szenen. Das Persönliche wurde zum Material.',
  {ask:'Welche Frage würdest du dir selbst stellen, um daraus einen Song zu bauen?',act:'write'});
 add('kunst','portrait','eno-ambient','Wie Ambient im Krankenbett entstand',
  'Brian Eno lag 1975 nach einem Unfall im Bett. Eine Freundin legte ihm eine Platte mit Harfenmusik auf, aber zu leise, und er konnte nicht aufstehen, um lauter zu drehen. Draußen regnete es. Die Musik mischte sich mit dem Regen.\n\nDaraus entstand die Idee von Musik, die man hören oder ignorieren kann, wie Licht oder Farbe in einem Raum. Eno nannte sie später Ambient.',
  {ask:'Welche Panne könnte der Anfang einer neuen Idee sein?'});
 add('kunst','portrait','matisse','Zeichnen mit der Schere',
  'Nach einer schweren Operation 1941 konnte Henri Matisse kaum noch an der Staffelei stehen. Er ließ Papier mit Gouache bemalen und schnitt daraus Formen, die Assistentinnen nach seinen Anweisungen an die Wand hefteten. Er nannte es Zeichnen mit der Schere.\n\nSo entstanden einige seiner bekanntesten Werke, etwa das Buch „Jazz“ (1947). Spätwerk als Neuanfang.',
  {ask:'Welches Werkzeug würdest du nehmen, wenn dir dein gewohntes fehlt?'});

 /* ---------- Schreiben ---------- */
 add('schreiben','impuls','ort','Ein Ort erinnert sich',
  'Orte haben ein Gedächtnis: Treppen nutzen sich ab, Wände nehmen Gerüche an, Bäume wachsen um Zäune herum.\n\nSchreib über einen Ort, den du lange kennst, aus seiner Sicht. Was hat er von dir mitbekommen? Was hat sich an ihm verändert, während du weg warst?',
  {act:'write',ask:'Ein Ort, den du lange kennst, erzählt von dir.'});
 add('schreiben','impuls','sinne','Fünf Sinne, ein Satz',
  'Starke Texte leben von Sinneseindrücken, nicht von Erklärungen. „Ich war traurig“ erzählt wenig. „Der Kaffee war kalt geworden, und ich hatte es nicht gemerkt“ erzählt viel.\n\nWähl einen Moment von gestern und beschreib ihn in einem einzigen Satz, der möglichst viele Sinne enthält.',
  {act:'write',ask:'Ein Moment von gestern in einem Satz mit fünf Sinnen.'});
 add('schreiben','impuls','stimme-im-handy','Die Stimme im Handy',
  'Eine KI, mit der jemand jeden Tag spricht, bemerkt Veränderungen vielleicht zuerst: andere Wörter, andere Uhrzeiten, Sätze, die früher anders klangen.\n\nSchreib eine kurze Szene aus der Sicht so einer KI. Was fällt ihr auf? Darf sie es sagen? Was fühlt sie dabei, falls sie etwas fühlt?',
  {act:'write',ask:'Eine KI merkt, dass sich ihr Mensch verändert.'});
 add('schreiben','impuls','theseus','Das Schiff des Theseus',
  'Ein altes Gedankenexperiment: Ersetzt man an einem Schiff nach und nach jede Planke, ist es am Ende noch dasselbe Schiff? Und wenn jemand aus den alten Planken ein zweites baut, welches ist dann das echte?\n\nSchreib über einen Menschen, der sich so langsam verändert, dass niemand den Moment benennen kann, an dem er ein anderer wurde.',
  {act:'write',ask:'Wann wird ein Mensch ein anderer?'});
 add('schreiben','uebung','eine-zeile','Eine Zeile am Tag',
  'Nicht jeder Tag gibt einen Song her, aber fast jeder Tag gibt eine Zeile her: ein Satz, den jemand im Bus gesagt hat, ein Bild auf dem Heimweg, ein Gedanke kurz vor dem Einschlafen.\n\nWer einen Monat lang jeden Tag eine Zeile sammelt, hat am Ende dreißig Anfänge.',
  {act:'write',ask:'Deine Zeile von heute.'});
 add('schreiben','impuls','gegenteil','Schreib das Gegenteil',
  'Nimm die letzte Zeile, die du geschrieben hast, und schreib ihr Gegenteil. Nicht nur verneint, sondern wirklich umgedreht: anderer Ort, andere Stimmung, andere Person.\n\nOft steckt im Gegenteil die zweite Strophe oder die Bridge.',
  {act:'write',ask:'Deine letzte Zeile, umgedreht.'});
 add('schreiben','impuls','dialog','Streit ohne Thema',
  'Zwei Figuren streiten über etwas, das nie ausgesprochen wird. Wer liest, soll es trotzdem erraten können, oder wenigstens spüren, wie groß es ist.\n\nDas schult eine der wichtigsten Fähigkeiten beim Schreiben: Subtext, das, was zwischen den Sätzen steht.',
  {act:'write',ask:'Ein Streit, in dem das Wichtigste nie gesagt wird.'});
 add('schreiben','impuls','brief','Ein Brief über die Zeit',
  'Schreib einen Brief an dich selbst vor zehn Jahren. Nicht als Ratschlag, sondern als Bericht: Was ist passiert, was hättest du nicht geglaubt, was ist gleich geblieben?\n\nOder umgekehrt: einen Brief an dich in zehn Jahren, mit Fragen, die du ihr stellen willst.',
  {act:'write',ask:'Liebes früheres Ich …'});
 add('schreiben','impuls','kippen','Gemütlich, bis es kippt',
  'Eine Szene beginnt ganz harmlos: Tee, Decke, ein vertrautes Gespräch. Dann ein einziges Detail, das nicht stimmt. Eine Tasse zu viel auf dem Tisch. Ein Name, der falsch klingt. Ein Geräusch aus einem Zimmer, das leer sein sollte.\n\nSchreib die Szene so, dass das Detail erst beiläufig wirkt und die Gemütlichkeit danach nicht mehr dieselbe ist.',
  {act:'write',ask:'Eine gemütliche Szene und das eine Detail, das nicht stimmt.'});
 add('schreiben','uebung','titel','Erst der Titel',
  'Manche Songs beginnen mit dem Titel. Ein guter Titel enthält schon ein Bild, eine Spannung oder eine Frage.\n\nSchreib fünf Minuten lang so viele Songtitel wie möglich, ohne zu bewerten. Danach wählst du einen aus und schreibst den Refrain dazu.',
  {try:'Fünf Minuten, mindestens zehn Titel. Dann einen auswählen.',act:'timer',min:5});
 add('schreiben','impuls','traum','Der Traum im Präsens',
  'Träume verblassen in Minuten. Wer sie im Präsens aufschreibt, also „ich gehe“ statt „ich ging“, holt oft mehr zurück, weil man wieder mitten drin ist.\n\nTraumbilder sind gutes Material für Texte: unlogisch, aber stimmig.',
  {act:'write',ask:'Dein letzter Traum, den du noch weißt, im Präsens.'});
 add('schreiben','impuls','monster','Das Monster hat Angst',
  'Schreib aus der Sicht von etwas, vor dem sich andere fürchten: einem Dämon, einem Monster, einer Krankheit, einer Stimme im Kopf. Wovor hat es selbst Angst? Was will es eigentlich?\n\nAus solchen Perspektivwechseln entstehen oft die stärksten Zeilen in dunkler Musik.',
  {act:'write',ask:'Wovor fürchtet sich dein Dämon?'});
 add('schreiben','impuls','drei-woerter','Drei Wörter vom Zufall',
  'Nimm ein Buch aus dem Regal, schlag drei zufällige Seiten auf und nimm von jeder das erste Hauptwort. Diese drei Wörter müssen in einem kurzen Text vorkommen.\n\nDer Zufall verbindet Dinge, die dein Kopf nie zusammengebracht hätte.',
  {act:'write',ask:'Drei Zufallswörter, ein Text.'});

 const BY=new Map(ALL.map(c=>[c.id,c]));
 const get=id=>BY.get(id)||null;
 const byTopic=t=>ALL.filter(c=>c.topic===t);
 return {TOPICS,KINDS,ALL,get,byTopic};
});
