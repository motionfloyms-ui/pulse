// SOURCE: domain/cosmos/sunpos.js
/* Where sun and moon stand in the sky (altitude above the horizon, azimuth from north over east) for a
   place and a moment. Low-precision formulas of the Astronomical Almanac: about 0.01° for the sun and a
   few tenths of a degree for the moon, plenty for a sky that should look right. No DOM. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseSunPos=api})(globalThis,function(){
 'use strict';
 const RAD=Math.PI/180,DEG=180/Math.PI;
 const jd=ms=>ms/86400000+2440587.5;
 const norm=a=>((a%360)+360)%360;
 /* Equatorial coordinates (degrees) → horizontal ones for a place and a moment. */
 function horizontal(ra,dec,ms,lat,lon){
  const d=jd(ms)-2451545.0,lst=norm(280.46061837+360.98564736629*d+lon),H=norm(lst-ra)*RAD,phi=lat*RAD,dl=dec*RAD;
  const alt=Math.asin(Math.sin(phi)*Math.sin(dl)+Math.cos(phi)*Math.cos(dl)*Math.cos(H));
  const az=Math.atan2(-Math.sin(H)*Math.cos(dl),Math.cos(phi)*Math.sin(dl)-Math.sin(phi)*Math.cos(dl)*Math.cos(H));
  return {alt:alt*DEG,az:norm(az*DEG),lst};
 }
 function equatorial(lambda,beta,d){
  const e=(23.439-0.0000004*d)*RAD,l=lambda*RAD,b=beta*RAD;
  return {ra:norm(Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l))*DEG),dec:Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l))*DEG};
 }
 function sunEcliptic(ms){const n=jd(ms)-2451545.0,L=norm(280.460+0.9856474*n),g=norm(357.528+0.9856003*n)*RAD;return {lon:norm(L+1.915*Math.sin(g)+0.020*Math.sin(2*g)),lat:0,d:n}}
 function moonEcliptic(ms){
  const T=(jd(ms)-2451545.0)/36525,s=x=>Math.sin(norm(x)*RAD);
  const lon=norm(218.32+481267.881*T+6.29*s(135.0+477198.87*T)-1.27*s(259.3-413335.36*T)+0.66*s(235.7+890534.22*T)+0.21*s(269.9+954397.74*T)-0.19*s(357.5+35999.05*T)-0.11*s(186.5+966404.03*T));
  const lat=5.13*s(93.3+483202.02*T)+0.28*s(228.2+960400.89*T)-0.28*s(318.3+6003.15*T)-0.17*s(217.6-407332.21*T);
  return {lon,lat,d:T*36525};
 }
 function sun(ms,lat=51.2562,lon=7.1508){const e=sunEcliptic(ms),q=equatorial(e.lon,0,e.d);return {...horizontal(q.ra,q.dec,ms,lat,lon),ra:q.ra,dec:q.dec,lon:e.lon}}
 function moon(ms,lat=51.2562,lon=7.1508){const e=moonEcliptic(ms),q=equatorial(e.lon,e.lat,e.d);return {...horizontal(q.ra,q.dec,ms,lat,lon),ra:q.ra,dec:q.dec,lon:e.lon,lat:e.lat}}
 /* A direction in a scene where north is +x, east is +z and up is +y. */
 function vector(alt,az){const a=alt*RAD,z=az*RAD;return [Math.cos(a)*Math.cos(z),Math.sin(a),Math.cos(a)*Math.sin(z)]}
 return {sun,moon,horizontal,equatorial,vector,jd};
});
