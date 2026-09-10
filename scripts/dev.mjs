import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {handleApi} from '../server/search.mjs';
const origin='http://127.0.0.1:8766';
const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};
createServer(async(req,res)=>{try{const url=new URL(req.url,origin);if(url.pathname.startsWith('/api/')){const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});const response=await handleApi(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}else{const asset=files[url.pathname];if(!asset){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':asset[1]+'; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?'':await readFile(new URL('../src/'+asset[0],import.meta.url)));}}catch{res.writeHead(500);res.end('Demo server error');}}).listen(8766,'127.0.0.1',()=>console.log('Furniture dimensions demo: '+origin));
