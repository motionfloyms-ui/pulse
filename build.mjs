// Builds the single-file app (index.html) from src/. No dependencies.
import {readFileSync,writeFileSync} from 'node:fs';
const r=p=>readFileSync(new URL('./src/'+p,import.meta.url),'utf8');
const m=JSON.parse(r('manifest.json'));
const styles=m.styles.map(f=>r('styles/'+f).replace(/@font:([\w.-]+)/g,(_,file)=>readFileSync(new URL('./src/assets/'+file,import.meta.url)).toString('base64'))).join('');
const scripts=m.prefix+m.scripts.map(f=>r('js/'+f)).join('');
const html=r('index.html').replace('/*@styles*/',()=>styles).replace('/*@scripts*/',()=>scripts);
writeFileSync(new URL('./index.html',import.meta.url),html);
console.log('index.html',(html.length/1024).toFixed(0)+' KB,',m.scripts.length,'modules');
