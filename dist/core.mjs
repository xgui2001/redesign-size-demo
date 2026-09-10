export const axes = ['width', 'depth', 'height'];
export const sourceLabels = {example:'Example value',manual:'Manually entered · unverified',tape:'Tape-measured · user confirmed',photo:'Photo ratio · approximate',roomplan:'RoomPlan estimate',listing:'Listing · variant checked by user'};
export const validSize = value => Number.isFinite(Number(value)) && Number(value)>0 && Number(value)<=100000;
export const round = value => Math.round(value*10)/10;
export function measureRatio(referencePoints, measurePoints, referenceCm) {
  const distance = ([a,b]) => Math.hypot(a.x-b.x,a.y-b.y);
  if(referencePoints.length!==2 || measurePoints.length!==2 || !validSize(referenceCm)) throw new Error('Set two reference points and enter a positive reference length.');
  const ref=distance(referencePoints), span=distance(measurePoints);
  if(ref<5 || span<5) throw new Error('Place the points farther apart for a useful measurement.');
  const result=span/ref*Number(referenceCm);
  if(!validSize(result)) throw new Error('That measurement is out of range. Check the reference length.');
  return round(result);
}
export function fitFurniture(dimensions, space, clearance=5, rotated=false) {
  if(!validSize(dimensions.width)||!validSize(dimensions.depth)||!validSize(space.width)||!validSize(space.depth)||!Number.isFinite(clearance)||clearance<0) return {status:'missing'};
  const width=Number(rotated?dimensions.depth:dimensions.width),depth=Number(rotated?dimensions.width:dimensions.depth);
  const spareWidth=round(Number(space.width)-width),spareDepth=round(Number(space.depth)-depth);
  const status=spareWidth<0||spareDepth<0?'too-large':spareWidth<clearance||spareDepth<clearance?'tight':'fits';
  return {status,width,depth,spareWidth,spareDepth};
}
function cleanSource(source) { return Object.hasOwn(sourceLabels,source)?source:'manual'; }
export function parseFurnitureJSON(data) {
  const demo=data?.format==='redesign-furniture-v1';
  const raw=demo?data.furniture:(data?.objects??data?.capturedRoom?.objects??data?.room?.objects);
  if(!Array.isArray(raw)||!raw.length) throw new Error('No furniture found. Import a RoomPlan CapturedRoom JSON containing objects, or this demo’s export.');
  if(raw.length>200) throw new Error('This lightweight demo supports up to 200 furniture objects per import.');
  return raw.map((o,i)=>{
    let dimensions, name, sources;
    if(demo) {
      dimensions=Object.fromEntries(axes.map(a=>[a,o.dimensions?.[a]===null||o.dimensions?.[a]===''?null:Number(o.dimensions?.[a])]));
      name=String(o.name??'Furniture'); sources=Object.fromEntries(axes.map(a=>[a,cleanSource(o.sources?.[a])]));
    } else {
      const d=o.dimensions;
      dimensions={width:round(Number(d?.[0]??d?.x)*100),depth:round(Number(d?.[2]??d?.z)*100),height:round(Number(d?.[1]??d?.y)*100)};
      const c=typeof o.category==='string'?o.category:Object.keys(o.category??{})[0];
      name=(c||'Furniture').replace(/([a-z])([A-Z])/g,'$1 $2'); name=name.charAt(0).toUpperCase()+name.slice(1)+' '+(i+1);
      sources=Object.fromEntries(axes.map(a=>[a,'roomplan']));
    }
    if(axes.some(a=>dimensions[a]!==null&&!validSize(dimensions[a]))) throw new Error('Object '+(i+1)+' has invalid dimensions. RoomPlan input must use meters; demo exports use centimeters.');
    if(!demo&&axes.some(a=>dimensions[a]===null)) throw new Error('RoomPlan dimensions are missing.');
    let listing=''; try { const u=new URL(o.listing??''); if(['http:','https:'].includes(u.protocol)) listing=u.href; }catch{}
    return {id:crypto.randomUUID(),name:name.slice(0,100),dimensions,sources,listing,listingConfirmed:demo&&!!o.listingConfirmed,originalId:String(o.identifier??o.originalId??''),transform:o.transform??null};
  });
}
