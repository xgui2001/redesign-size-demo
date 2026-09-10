import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const assets={};for(const [file,type]of [['index.html','text/html; charset=utf-8'],['app.js','text/javascript; charset=utf-8'],['style.css','text/css; charset=utf-8']])assets[file==='index.html'?'/':'/'+file]={content:await readFile('src/'+file,'utf8'),type};
await writeFile('dist/server/assets.mjs','export const assets = '+JSON.stringify(assets)+';\n');
await copyFile('server/worker.mjs','dist/server/index.js');await copyFile('server/search.mjs','dist/server/search.mjs');await copyFile('server/dimensions.mjs','dist/server/dimensions.mjs');await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built dimension lookup demo. No runtime dependencies.');
