// The built single file must parse as a script and contain every module once.
import {readFileSync} from 'node:fs';import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
new vm.Script(js,{filename:'index.html'});
const m=JSON.parse(readFileSync(new URL('../src/manifest.json',import.meta.url),'utf8'));
for(const f of m.scripts){const n=js.split('// SOURCE: '+f+'\n').length-1;if(n!==1)throw Error(f+' appears '+n+'×')}
if(/claude-history-2026|food-2026-10-02/.test(html))throw Error('personal seed data found in bundle');
console.log('bundle ok:',m.scripts.length,'modules');
