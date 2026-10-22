// SOURCE: domain/content/daily.js
/* Pictures and texts of the day from open sources, as cards for the stack: NASA's Astronomy Picture of
   the Day, Wikipedia's picture and article of the day (German Wikipedia), and a public-domain artwork
   from the Art Institute of Chicago. Only the address of the day is requested; nothing personal is sent.
   Pure functions: URLs and parsing; fetching happens in the UI. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseDaily=api})(globalThis,function(){
 'use strict';
 const SOURCES={
  apod:{name:'NASA · Astronomiebild des Tages',short:'NASA',topic:'kosmos',lang:'en'},
  potd:{name:'Wikipedia · Bild des Tages',short:'Wikipedia',topic:'',lang:'de'},
  tfa:{name:'Wikipedia · Artikel des Tages',short:'Wikipedia',topic:'',lang:'de'},
  art:{name:'Art Institute of Chicago · gemeinfrei',short:'Kunstmuseum',topic:'kunst',lang:'en'}
 };
 const KEYS=Object.keys(SOURCES);
 function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 const ymd=day=>day.replace(/-/g,'/');
 const clean=s=>String(s==null?'':s).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0?39;/g,'’').replace(/\s+/g,' ').trim();
 const https=u=>typeof u==='string'&&/^https:\/\/\S+$/.test(u)?u:(typeof u==='string'&&/^\/\//.test(u)?'https:'+u:'');
 /* Feed of German Wikipedia (picture and article of the day come in one answer). */
 function url(src,day){
  if(src==='apod')return 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true';
  if(src==='potd'||src==='tfa')return 'https://de.wikipedia.org/api/rest_v1/feed/featured/'+ymd(day);
  if(src==='art')return 'https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&fields=id,title,artist_display,date_display,medium_display,place_of_origin,image_id,short_description,thumbnail&limit=10&from='+(hash('art:'+day)%9000);
  return '';
 }
 /* The answer → {title, img, big, text, credit, link, lang} or null. */
 function parse(src,j,day){
  if(!j||typeof j!=='object')return null;
  if(src==='apod'){
   const img=j.media_type==='image'?https(j.url):https(j.thumbnail_url);if(!j.title||!img)return null;
   const d=String(j.date||day).slice(2,10).replace(/-/g,'');
   return {title:clean(j.title),img,big:https(j.hdurl)||img,text:clean(j.explanation),credit:j.copyright?'© '+clean(j.copyright):'NASA',link:/^\d{6}$/.test(d)?'https://apod.nasa.gov/apod/ap'+d+'.html':'https://apod.nasa.gov/',lang:'en',video:j.media_type==='video'};
  }
  if(src==='potd'){
   const p=j.image;if(!p)return null;const img=https(p.thumbnail&&p.thumbnail.source)||https(p.image&&p.image.source);if(!img)return null;
   const title=clean(p.title).replace(/^(File|Datei):/i,'').replace(/\.[a-z0-9]{2,5}$/i,'').replace(/_/g,' ');
   return {title,img,big:https(p.image&&p.image.source)||img,text:clean(p.description&&p.description.text),credit:[clean(p.artist&&p.artist.text),clean(p.license&&p.license.type)].filter(Boolean).join(' · ')||'Wikimedia Commons',link:https(p.file_page)||'https://commons.wikimedia.org/',lang:(p.description&&p.description.lang)||'de'};
  }
  if(src==='tfa'){
   const a=j.tfa;if(!a||!a.extract)return null;
   return {title:clean(a.titles&&a.titles.normalized||a.normalizedtitle||a.title).replace(/_/g,' '),img:https(a.thumbnail&&a.thumbnail.source),big:https(a.originalimage&&a.originalimage.source),text:clean(a.extract),credit:'Wikipedia · CC BY-SA',link:https(a.content_urls&&a.content_urls.mobile&&a.content_urls.mobile.page)||https(a.content_urls&&a.content_urls.desktop&&a.content_urls.desktop.page)||'https://de.wikipedia.org/',lang:'de',sub:clean(a.description)};
  }
  if(src==='art'){
   const a=(Array.isArray(j.data)?j.data:[]).find(x=>x&&x.image_id&&/^[a-f0-9-]{20,60}$/i.test(x.image_id));if(!a)return null;
   const base=https(j.config&&j.config.iiif_url)||'https://www.artic.edu/iiif/2';
   return {title:clean(a.title),img:base+'/'+a.image_id+'/full/843,/0/default.jpg',big:base+'/'+a.image_id+'/full/1686,/0/default.jpg',text:clean(a.short_description),sub:[clean(a.artist_display),clean(a.date_display),clean(a.medium_display)].filter(Boolean).join(' · '),credit:'Art Institute of Chicago · gemeinfrei (CC0)',link:'https://www.artic.edu/artworks/'+Number(a.id),lang:'en'};
  }
  return null;
 }
 /* Which sources a day shows: a fixed rotation, so every day looks a little different. */
 function pick(day,{topics=[],count=2}={}){
  const ok=KEYS.filter(k=>!SOURCES[k].topic||topics.includes(SOURCES[k].topic));
  const start=hash('daily:'+day)%Math.max(1,ok.length),out=[];
  for(let i=0;i<ok.length&&out.length<count;i++)out.push(ok[(start+i*(ok.length>3?3:1))%ok.length]);
  return [...new Set(out)].slice(0,count);
 }
 return {SOURCES,KEYS,url,parse,pick,clean};
});
