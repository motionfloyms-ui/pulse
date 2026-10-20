// SOURCE: domain/body/food-table.js
/* Everyday foods with typical values per 100 g (liquids: per 100 ml). Rounded reference values,
   marked as estimates in the app. Columns: name | aliases | kcal | protein | carbs | fat | fiber | portion g | piece g | liquid */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseFoodTable=api})(globalThis,function(){
 'use strict';
 const ROWS=`
Brötchen|brötchen,semmel,schrippe,weizenbrötchen|270|9|52|2|3|60|60
Vollkornbrötchen|vollkornbrötchen,körnerbrötchen|240|9|42|3|6|70|70
Laugenbrötchen|laugenbrötchen,laugenstange|280|9|53|3|2|70|70
Brezel|brezel,breze,brezeln,laugenbrezel|290|8|56|3|2|85|85
Croissant|croissant,croissants|410|8|46|21|2|60|60
Toastbrot|toast,toastbrot,toastscheibe|260|8|48|4|3|50|25
Mischbrot|brot,mischbrot,graubrot,brotscheibe|230|7|46|1.5|5|45|45
Vollkornbrot|vollkornbrot,schwarzbrot,roggenbrot|220|8|40|2|7|50|50
Knäckebrot|knäckebrot,knäcke|360|10|66|1.5|14|20|10
Haferflocken|haferflocken,porridge,haferbrei|370|13.5|59|7|10|50|
Müsli|müsli,granola,knuspermüsli|380|9|63|9|7|60|
Cornflakes|cornflakes|378|7|84|0.9|3|30|
Nudeln (roh)|nudeln,pasta,spaghetti,penne,fusilli,makkaroni|355|12.5|71|1.5|3|100|
Nudeln (gekocht)|nudeln gekocht,gekochte nudeln,pasta gekocht|155|5.5|30|0.9|1.8|250|
Reis (roh)|reis,basmatireis,jasminreis,vollkornreis|350|7|77|0.6|1.4|75|
Reis (gekocht)|reis gekocht,gekochter reis|130|2.7|28|0.3|0.4|200|
Couscous (roh)|couscous,bulgur|360|12|72|1.5|5|70|
Quinoa (roh)|quinoa|368|14|64|6|7|70|
Kartoffeln|kartoffel,kartoffeln,pellkartoffeln,salzkartoffeln|77|2|17|0.1|2.2|250|100
Süßkartoffel|süßkartoffel,süßkartoffeln|86|1.6|20|0.1|3|200|200
Pommes frites|pommes,pommes frites,fritten|290|3.4|36|15|3|150|
Bratkartoffeln|bratkartoffeln|150|2.5|20|7|2|250|
Weizentortilla|tortilla,tortillas,wrap,wraps|300|8|50|7|3|40|40
Pizza Margherita|pizza,pizza margherita|250|10|30|10|2|350|
Tiefkühlpizza|tiefkühlpizza,tk-pizza,tk pizza|240|9|28|10|2|350|
Lasagne|lasagne|150|8|12|8|1|350|
Döner|döner,döner kebab,doener,dürüm|215|12|20|10|2|350|
Burger|burger,hamburger,cheeseburger|250|13|25|11|1.5|220|220
Currywurst|currywurst|220|10|8|16|0.5|200|
Bratwurst|bratwurst,bratwürste|300|13|1|27|0|100|100
Falafel|falafel|330|13|32|17|5|120|20
Hummus|hummus,humus|240|7|14|17|6|50|
Gemüsesuppe|gemüsesuppe,suppe|40|1.5|6|1|1.5|300|
Linsensuppe|linsensuppe,linseneintopf|90|5|12|2|4|350|
Chili sin Carne|chili sin carne,chili|100|5|12|2.5|5|350|
Milch 1,5 %|milch,fettarme milch|47|3.4|4.8|1.5|0|200||1
Vollmilch|vollmilch|64|3.3|4.8|3.6|0|200||1
Haferdrink|haferdrink,hafermilch|46|1|7|1.5|0.8|200||1
Sojadrink|sojadrink,sojamilch|40|3.3|2.5|1.8|0.5|200||1
Naturjoghurt|joghurt,naturjoghurt,jogurt|66|3.5|4.5|3.5|0|150|
Griechischer Joghurt|griechischer joghurt,greek yogurt|120|4.5|4|10|0|150|
Speisequark 20 %|speisequark,sahnequark|110|12|3|5|0|125|
Gouda|gouda,käse,käsescheibe,scheibe käse|360|25|0|28|0|30|20
Cheddar|cheddar|400|25|1|33|0|30|20
Mozzarella|mozzarella|250|18|1|19|0|125|125
Feta|feta,schafskäse,hirtenkäse|260|17|1|21|0|50|
Parmesan|parmesan,hartkäse|390|33|0|29|0|10|
Halloumi|halloumi,grillkäse|320|22|2|25|0|100|
Frischkäse|frischkäse|240|6|3|23|0|30|
Butter|butter|740|0.7|0.6|82|0|10|
Schlagsahne|sahne,schlagsahne|300|2.4|3.4|31|0|30||1
Räuchertofu|räuchertofu|160|17|2|9|1|100|
Tempeh|tempeh|190|19|8|11|5|100|
Seitan|seitan|140|25|5|2|0.5|100|
Edamame|edamame|120|11|7|5|5|100|
Kidneybohnen|kidneybohnen,bohnen,schwarze bohnen|125|8.5|21|0.5|6.5|120|
Kichererbsen|kichererbsen|140|7.5|19|2.5|6.5|120|
Linsen (gekocht)|linsen,linsen gekocht|116|9|20|0.4|8|150|
Rote Linsen (roh)|rote linsen|345|24|49|1.5|11|60|
Erdnussmus|erdnussbutter,erdnussmus|600|25|13|50|8|15|
Nussmischung|nüsse,nussmischung|620|17|10|55|8|30|
Studentenfutter|studentenfutter|480|13|40|30|7|30|
Mandeln|mandeln|590|21|6|52|12|25|
Walnüsse|walnüsse|670|15|7|65|6|25|
Apfel|apfel,äpfel|52|0.3|12|0.2|2.4|150|150
Banane|banane,bananen|90|1.1|20|0.3|2.6|120|120
Birne|birne,birnen|57|0.4|13|0.1|3.1|160|160
Orange|orange,orangen,apfelsine|47|0.9|9|0.1|2.4|180|180
Mandarine|mandarine,mandarinen,clementine,clementinen|50|0.8|10|0.3|1.8|70|70
Weintrauben|trauben,weintrauben|69|0.7|16|0.2|0.9|125|
Erdbeeren|erdbeeren|32|0.7|5.5|0.3|2|150|
Heidelbeeren|heidelbeeren,blaubeeren|57|0.7|12|0.3|2.4|125|
Mango|mango|60|0.8|13|0.4|1.6|150|
Kiwi|kiwi,kiwis|61|1.1|10|0.5|3|75|75
Ananas|ananas|50|0.5|12|0.1|1.4|150|
Avocado|avocado,avocados|160|2|2|15|7|140|140
Datteln|datteln,dattel|280|2.5|66|0.4|8|40|8
Tomate|tomate,tomaten,cherrytomaten|18|0.9|3|0.2|1.2|100|100
Gurke|gurke,gurken|15|0.6|2.5|0.1|0.5|100|
Paprika|paprika|30|1|5|0.3|2|150|150
Karotte|karotte,karotten,möhre,möhren|41|0.9|8|0.2|2.8|80|80
Brokkoli|brokkoli,broccoli|34|2.8|4|0.4|2.6|200|
Spinat|spinat|23|2.9|1.4|0.4|2.2|150|
Blattsalat|salat,blattsalat,eisbergsalat,rucola|15|1.2|2|0.2|1.3|80|
Zucchini|zucchini|17|1.2|2.5|0.3|1|200|
Zwiebel|zwiebel,zwiebeln|40|1.1|8|0.1|1.7|80|80
Mais|mais|80|2.8|14|1.2|2.5|100|
Erbsen|erbsen|80|5|10|0.4|5|150|
Blumenkohl|blumenkohl|25|2|3|0.3|2|200|
Vollmilchschokolade|schokolade,vollmilchschokolade,schoki|535|7.5|57|30|2|25|
Zartbitterschokolade|zartbitterschokolade,zartbitter|580|8|34|43|11|25|
Gummibärchen|gummibärchen,haribo,fruchtgummi|340|6.5|77|0.1|0|25|
Kekse|keks,kekse,butterkeks,butterkekse|440|7|73|12|2.5|30|5
Kartoffelchips|chips,kartoffelchips|540|6|50|34|4|50|
Erdnussflips|erdnussflips,flips,sun flips|480|12|48|26|4|40|
Speiseeis|eis,eiscreme,speiseeis|200|3.5|24|10|0|100|
Rührkuchen|kuchen,rührkuchen,marmorkuchen|380|6|50|18|1|80|
Käsekuchen|käsekuchen|250|7|25|13|0.5|120|
Apfelkuchen|apfelkuchen|250|3|35|11|1.5|120|
Proteinriegel|proteinriegel|360|30|35|10|6|50|50
Müsliriegel|müsliriegel|400|6|65|13|4|25|25
Honig|honig|300|0.4|80|0|0|20|
Marmelade|marmelade,konfitüre|250|0.4|60|0.1|1|20|
Nuss-Nougat-Creme|nutella,nuss-nougat-creme|540|6|57|31|3.5|15|
Hähnchenbrust|hähnchen,hähnchenbrust,hühnchen,hühnerbrust|110|23|0|1.5|0|150|
Hackfleisch|hack,hackfleisch|250|18|0|20|0|125|
Rindersteak|steak,rindersteak|130|22|0|4.5|0|200|
Kochschinken|schinken,kochschinken|110|19|1|3.5|0|40|20
Salami|salami|380|20|1|33|0|30|10
Fleischwurst|fleischwurst|280|12|1|25|0|50|25
Wiener Würstchen|würstchen,wiener,wiener würstchen|260|13|1|23|0|100|50
Mayonnaise|mayo,mayonnaise|680|1|2|75|0|15|
Remoulade|remoulade|560|1|5|60|0|15|
Ketchup|ketchup|110|1.5|24|0.2|1|15|
Öl|öl,olivenöl,rapsöl|884|0|0|100|0|10||1
Pesto|pesto|450|5|5|45|2|30|
Tomatensoße|tomatensoße,tomatensauce,passata|50|1.5|8|1|1.5|150|
Orangensaft|orangensaft,o-saft|45|0.7|9|0.2|0.2|200||1
Apfelsaft|apfelsaft|46|0.1|11|0|0|200||1
Apfelschorle|apfelschorle,saftschorle,schorle|24|0|5.5|0|0|300||1
Cola|cola,coca-cola|42|0|10.6|0|0|330||1
Cola Zero|cola zero,cola light,coke zero|0.3|0|0|0|0|330||1
Bier|bier,pils,weizen|43|0.5|3.6|0|0|500||1
Wein|wein,rotwein,weißwein|80|0.1|2.6|0|0|200||1
Latte macchiato|latte,latte macchiato,milchkaffee|50|2.5|3.5|2.5|0|300||1
Cappuccino|cappuccino|40|2.5|3|2|0|200||1
Kaffee|kaffee,espresso|2|0.2|0|0|0|200||1
Tee|tee|1|0|0.2|0|0|250||1
Energy Drink|energy,energy drink,energydrink|46|0|11|0|0|250||1
Smoothie|smoothie|55|0.6|12|0.2|1.5|250||1`;
 const FOODS=ROWS.trim().split('\n').map(line=>{
  const [name,aliases,kcal,protein,carbs,fat,fiber,portion,piece,liquid]=line.split('|');
  const per={kcal:+kcal,protein:+protein,carbs:+carbs,fat:+fat,fiber:+fiber};
  const f={id:'tab-'+name.toLowerCase().normalize('NFKD').replace(/[^\w]+/g,'-').replace(/^-|-$/g,''),name,aliases:aliases.split(','),per100:per,confidence:'geschaetzt',source:'table'};
  if(portion)f.defaultG=+portion;if(piece)f.pieceG=+piece;if(liquid)f.per100Ml=per;
  return f;
 });
 return {FOODS};
});

