const empty=()=>({width:null,depth:null,height:null});
const axisNames={width:'width',depth:'depth',height:'height',w:'width',d:'depth',h:'height'};
export function toCm(value,unit){
  const text=String(value).trim().replace(/[″”]/g,'"');
  const fraction=text.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  const n=fraction?Number(fraction[1]||0)+Number(fraction[2])/Number(fraction[3]):Number(text);
  const u=String(unit||'').trim().toLowerCase();
  const factor=/^(cm|cmt|centimet(er|re)s?)$/.test(u)?1:/^(mm|mmt|millimet(er|re)s?)$/.test(u)?.1:/^(m|mtr|met(er|re)s?)$/.test(u)?100:/^(in|inch|inches|inh|"|″|”)$/.test(u)?2.54:/^(ft|foot|feet|fot|')$/.test(u)?30.48:null;
  return factor!==null&&Number.isFinite(n)&&n>0&&n*factor<20000?Math.round(n*factor*10)/10:null;
}
function decode(s){return String(s).replace(/&quot;|&#34;/g,'"').replace(/&amp;/g,'&').replace(/&nbsp;|&#160;/g,' ').replace(/&times;|&#215;/g,'×').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');}
export function htmlText(html){return decode(html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<\/(?:p|div|li|tr|h[1-6])\s*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/[\t\r ]+/g,' '));}
export function extractTextDimensions(text){
  const dimensions=empty(),evidence=[],all={width:[],depth:[],height:[]};
  const number='(\\d+(?:\\.\\d+)?(?:\\s+\\d+\\/\\d+)?|\\d+\\/\\d+)';
  const unit='(centimeters?|centimetres?|millimeters?|millimetres?|inches|inch|cm|mm|in|ft|feet|meters?|metres?|m|["″”])';
  // Only explicitly labelled axes. Never guess ordering from "140 x 70 x 75".
  const patterns=[new RegExp('\\b(width|depth|height)\\s*(?:\\([^)\\n]{0,18}\\))?\\s*[:=–-]?\\s*'+number+'\\s*'+unit,'gi'),new RegExp(number+'\\s*'+unit+'\\s*(width|depth|height|[WDH])\\b','gi')];
  patterns.forEach((re,index)=>{for(const m of text.matchAll(re)){
    const before=text.slice(Math.max(0,m.index-55),m.index);
    if(/(?:seat|seating|package|packaging|shipping|carton|armrest|backrest|drawer|shelf|interior|inside|clearance|leg|door)\s*(?:\w+\s+){0,3}$/i.test(before))continue;
    const axis=axisNames[(index===0?m[1]:m[3]).toLowerCase()],value=toCm(index===0?m[2]:m[1],index===0?m[3]:m[2]);
    if(value!==null)all[axis].push({value,text:m[0]});
  }});
  for(const axis of Object.keys(all)){const observations=all[axis];if(!observations.length)continue;const first=observations[0].value;
    // Unit rounding can differ slightly; contradictory variants stay blank.
    if(observations.every(o=>Math.abs(o.value-first)<=.6)){dimensions[axis]=first;evidence.push(observations[0].text);}}
  return {dimensions,evidence:evidence.join(' · '),method:'labelled-text'};
}
export function extractDimensions(html){
  const products=[];const visit=node=>{if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(visit);return;}const types=[node['@type']].flat();if(types.includes('Product'))products.push(node);if(node['@graph'])visit(node['@graph']);if(node.mainEntity)visit(node.mainEntity);};
  for(const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{visit(JSON.parse(m[1]));}catch{}}
  if(products.length===1){const p=products[0],dimensions=empty(),evidence=[];for(const axis of Object.keys(dimensions)){const v=p[axis];if(v==null)continue;const cm=typeof v==='object'?toCm(v.value,v.unitCode||v.unitText):null;if(cm!==null){dimensions[axis]=cm;evidence.push(axis+': '+v.value+' '+(v.unitText||v.unitCode));}}
    if(Object.values(dimensions).some(v=>v!==null))return {dimensions,evidence:evidence.join(' · '),method:'product-structured-data',productName:p.name||null};}
  return extractTextDimensions(htmlText(html));
}
export function safeHttpUrl(value){try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return null;return u.href;}catch{return null;}}
export function selectMatches(data){const records=[...(data.visual_matches||[]),...(data.products||[])],seen=new Set();return records.filter(m=>{const url=safeHttpUrl(m.link);if(!url||seen.has(url)||!m.title)return false;seen.add(url);return true;}).slice(0,3).map((m,i)=>({title:String(m.title).slice(0,300),url:safeHttpUrl(m.link),source:String(m.source||new URL(m.link).hostname).slice(0,100),thumbnail:safeHttpUrl(m.thumbnail),rank:i+1,dimensions:empty(),evidence:'',dimensionUrl:null,dimensionStatus:'not_found'}));}
