import {handleApi} from './search.mjs';
import {assets} from './assets.mjs';
export default {async fetch(request,env,ctx){const path=new URL(request.url).pathname;if(path.startsWith('/api/'))return handleApi(request,env);const item=assets[path];if(!item)return new Response('Not found',{status:404});if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:item.content,{headers:{'Content-Type':item.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});}};
