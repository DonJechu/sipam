export const MES='enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre'.split(' ')
export const KN=['Buena','Aceptable','Mala','Muy mala','Extremadamente mala']
// agg: d = promedio 24 h, x = máximo horario, m = máximo del promedio móvil de 8 h
export const P=[
{id:'pm25',col:'pm25_ugm3',n:'PM2.5',u:'µg/m³',agg:'d',cuts:[15,25,79,130],max:1000,nom:25,oms:15},
{id:'pm10',col:'pm10_ugm3',n:'PM10',u:'µg/m³',agg:'d',cuts:[45,50,132,213],max:2000,nom:50,oms:45},
{id:'o3',col:'o3_ppm',n:'O₃',u:'ppm',agg:'x',cuts:[.058,.09,.135,.175],max:1},
{id:'no2',col:'no2_ppm',n:'NO₂',u:'ppm',agg:'x',cuts:[.053,.106,.16,.213],max:2},
{id:'so2',col:'so2_ppm',n:'SO₂',u:'ppm',agg:'x',cuts:[.035,.075,.185,.304],max:2},
{id:'co',col:'co_ppm',n:'CO',u:'ppm',agg:'m',cuts:[5,9,12,16],max:100},
{id:'co2',col:'co2_ppm',n:'CO₂',u:'ppm',agg:'x',cuts:null,max:10000}]
export const PM=Object.fromEntries(P.map(p=>[p.id,p]))
export const fD=d=>{const x=new Date(d*864e5);return x.getUTCDate()+' de '+MES[x.getUTCMonth()]}
// un valor exactamente en el límite inferior de una banda cae en la peor (la norma no lo define)
export const cat=(v,c)=>v<c[0]?0:v<=c[1]?1:v<=c[2]?2:v<=c[3]?3:4

function hourly(rows){const acc={},mx={}
 for(const r of rows)for(const p in r.v){const k=r.st+'|'+p,h=Math.floor(r.t/36e5);acc[k]=acc[k]||{};const a=acc[k][h]=acc[k][h]||[0,0];a[0]+=r.v[p];a[1]++;mx[k]=Math.max(mx[k]||0,a[1])}
 const O={};for(const k in acc){const[s,p]=k.split('|');O[s]=O[s]||{};O[s][p]=new Map();for(const h in acc[k]){const[a,n]=acc[k][h];if(n>=.75*mx[k])O[s][p].set(+h,a/n)}}return O}

export function daily(model,st,p){const key=st+p.id;if(model.CA[key])return model.CA[key]
 const m=model.H[st]&&model.H[st][p.id],out=new Map();model.CA[key]=out;if(!m)return out
 const days=new Set([...m.keys()].map(h=>Math.floor(h/24)))
 for(const d of days){const hs=[];for(let i=0;i<24;i++){const v=m.get(d*24+i);if(v!=null)hs.push(v)}
  if(hs.length<18)continue;let val
  if(p.agg=='d')val=hs.reduce((a,x)=>a+x,0)/hs.length
  else if(p.agg=='x')val=Math.max(...hs)
  else{let b=null;for(let i=0;i<24;i++){const w=[];for(let j=0;j<8;j++){const v=m.get(d*24+i-j);if(v!=null)w.push(v)}if(w.length>=6){const a=w.reduce((s,x)=>s+x,0)/w.length;if(b==null||a>b)b=a}}if(b==null)continue;val=b}
  out.set(d,val)}
 return out}

export function buildModel(rows,stations,src){
 const model={H:hourly(rows),CA:{},DC:{},st:stations,src},days=new Set()
 for(const s of stations){model.DC[s.id]=new Map()
  for(const p of P){const m=model.H[s.id]&&model.H[s.id][p.id];if(m)for(const h of m.keys())days.add(Math.floor(h/24))
   if(p.cuts)for(const[d,v]of daily(model,s.id,p)){const c=cat(v,p.cuts),r=model.DC[s.id].get(d);if(!r||c>r.c)model.DC[s.id].set(d,{c,p:p.n,v})}}}
 const ks=new Set();for(const d of days){const x=new Date(d*864e5);ks.add(x.getUTCFullYear()*12+x.getUTCMonth())}
 if(!ks.size){const x=new Date();ks.add(x.getUTCFullYear()*12+x.getUTCMonth())}
 model.months=[...ks].sort((a,b)=>a-b).map(k=>{const y=Math.floor(k/12),m=k%12;return{y,m,first:Date.UTC(y,m,1)/864e5,dim:new Date(Date.UTC(y,m+1,0)).getUTCDate()}})
 return model}

export function lastRead(model,id){let l=0;for(const p in model.H[id]||{})for(const h of model.H[id][p].keys())l=Math.max(l,h);return l}

export function demo(){let a=7;const r=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},rows=[],t0=Date.UTC(2026,8,1)
 for(let s=0;s<3;s++)for(let d=0;d<61;d++){const q=r(),f=q<.08?3:q<.22?1.6:1;if((s==1&&d>=19&&d<=21)||(s==2&&d%17==5))continue
  for(let h=0;h<24;h++){const di=.5+.5*Math.cos((h-7)*Math.PI/12),sn=Math.max(0,Math.sin((h-8)*Math.PI/12)),pm=[13,17,11][s]*(.6+.7*di)*f+r()*4
   rows.push({t:t0+(d*24+h)*36e5,st:'E'+(s+1),v:{pm25:+pm.toFixed(1),pm10:+(pm*1.9+r()*6).toFixed(1),o3:+(.012+.04*sn*(.6+.4*r())).toFixed(3),no2:+(.01+.03*di*(s+1)/2+r()*.006).toFixed(3),so2:+([.006,.012,.02][s]*(r()<.006?5:1)+r()*.004).toFixed(3),co:+(.5+1.5*di+r()*.3).toFixed(2),co2:Math.round(415+35*di+r()*15)}})}}
 return rows}
export const DEMO_ST=[{id:'E1',name:'Estación 1 (demo)'},{id:'E2',name:'Estación 2 (demo)'},{id:'E3',name:'Estación 3 (demo)'}]

// Devuelve {error} o {rows,stations,msg}
export function parseWB(XLSX,wb){
 const ws=wb.Sheets.Lecturas||wb.Sheets[wb.SheetNames[0]],js=XLSX.utils.sheet_to_json(ws,{raw:true,defval:null}),norm=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[String(k).trim().toLowerCase(),v]))
 if(!js.length||!('fecha_hora' in norm(js[0]))||!('estacion_id' in norm(js[0])))return{error:'Faltan las columnas fecha_hora y estacion_id en la hoja Lecturas.'}
 const rej={},bump=k=>rej[k]=(rej[k]||0)+1,rows=[]
 for(const o0 of js){const o=norm(o0);let t=o.fecha_hora
  if(typeof t=='number')t=Math.round((t-25569)*1440)*6e4;else{const m=/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(String(t||''));t=m?Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5]):NaN}
  if(isNaN(t)){bump('fecha_hora inválida');continue}
  const sid=String(o.estacion_id==null?'':o.estacion_id).trim();if(!sid){bump('estacion_id vacío');continue}
  const v={};for(const p of P){let x=o[p.col];if(x==null||x==='')continue;x=Number(String(x).replace(',','.'));if(isNaN(x)){bump(p.col+' no numérico');continue}if(x<0||x>p.max){bump(p.col+' fuera de rango');continue}v[p.id]=x}
  if(!Object.keys(v).length){bump('fila sin valores válidos');continue}
  rows.push({t,st:sid,v})}
 const list=Object.entries(rej).map(([k,n])=>`${k} (${n})`).join(', ')
 if(!rows.length)return{error:'Ninguna fila válida. '+list}
 const nm={};if(wb.Sheets.Estaciones)for(const o of XLSX.utils.sheet_to_json(wb.Sheets.Estaciones)){const q=norm(o);if(q.estacion_id)nm[String(q.estacion_id).trim()]=q.nombre}
 const ids=[...new Set(rows.map(r=>r.st))].sort()
 return{rows,stations:ids.map(i=>({id:i,name:nm[i]||'Estación '+i})),msg:`${rows.length} filas válidas de ${js.length}. ${list?'Rechazadas: '+list+'.':'Sin rechazos.'}`}}
