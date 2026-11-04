import {useState} from 'react'
import {MES,KN,fD,cat,daily} from '../lib/data'
const None=()=><p className="sm">Sin lecturas suficientes.</p>
export const fmt=n=>n>=10?n.toFixed(0):n>=1?n.toFixed(1):n.toFixed(3)

function HourLine({v,p,hv,setHv}){
 const vs=v.filter(x=>x!=null),top=Math.max(...vs,p.cuts?p.cuts[0]:0)*1.15||1,W=640,H=220,L=46,R=8,T=8,B=24
 const x=i=>L+i*(W-L-R)/23,y=a=>T+(1-a/top)*(H-T-B),e=p.cuts?[0,...p.cuts,top]:[]
 let d='',pen=false;v.forEach((a,i)=>{if(a==null){pen=false;return}d+=(pen?'L':'M')+x(i).toFixed(1)+' '+y(a).toFixed(1);pen=true})
 const mv=ev=>{const r=ev.currentTarget.getBoundingClientRect(),px=(ev.clientX-r.left)/r.width*W;setHv(Math.max(0,Math.min(23,Math.round((px-L)/((W-L-R)/23)))))}
 return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Lecturas por hora de ${p.n}`} onPointerMove={mv} onPointerLeave={()=>setHv(null)} style={{touchAction:'pan-y'}}>
  {p.cuts&&[0,1,2,3,4].map(i=>{const a=e[i],b=Math.min(e[i+1],top);return a<top&&<rect key={i} x={L} y={y(b)} width={W-L-R} height={y(a)-y(b)} style={{fill:`var(--c${i})`}} opacity=".3"/>})}
  {[0,.5,1].map(t=><text key={t} className="t" x={L-6} y={y(top*t)+4} textAnchor="end">{fmt(top*t)}</text>)}
  {[0,6,12,18,23].map(h=><text key={h} className="t" x={x(h)} y={H-6} textAnchor="middle">{h} h</text>)}
  <path className="ln" pathLength="1" d={d}/>
  {hv!=null&&<g pointerEvents="none"><line x1={x(hv)} x2={x(hv)} y1={T} y2={H-B} stroke="var(--mut)" strokeDasharray="3 3"/>{v[hv]!=null&&<circle cx={x(hv)} cy={y(v[hv])} r="5" fill="var(--fg)" stroke="var(--bg)" strokeWidth="2"/>}</g>}
 </svg>}

export function DayChart({p,m,day}){
 const [hv,setHv]=useState(null),v=Array.from({length:24},(_,i)=>m?m.get(day*24+i)??null:null),val=hv!=null?v[hv]:null
 return <>
  <h3>{p.n} hora por hora, {fD(day)}</h3>
  <p className="sm">{p.cuts?'Los colores de fondo son las bandas de la NOM-172.':'Este contaminante no tiene bandas en la norma.'} Unidad: {p.u}.</p>
  {v.some(x=>x!=null)?<>
   <p className="sm rd">{hv==null?'Pasa el cursor por la gráfica para ver cada hora.':val==null?`${hv} h: sin dato`:`${hv} h: ${fmt(val)} ${p.u}${p.cuts?', '+KN[cat(val,p.cuts)].toLowerCase():''}`}</p>
   <HourLine v={v} p={p} hv={hv} setHv={setHv}/></>:<None/>}</>}

export function HourBars({p,m,view}){
 const [hb,setHb]=useState(null)
 const a=Array.from({length:24},(_,i)=>{let s=0,n=0;for(let d=0;d<view.dim;d++){const x=m&&m.get((view.first+d)*24+i);if(x!=null){s+=x;n++}}return n?s/n:null})
 const vs=a.filter(x=>x!=null);if(!vs.length)return <None/>
 const top=Math.max(...vs)*1.15,W=420,H=190,B=22,bw=W/24,pk=a.indexOf(Math.max(...vs)),hot=hb??pk
 return <><p className="sm">Promedio de {MES[view.m]}: la concentración suele ser más alta hacia las {pk} h.</p>
  <p className="sm rd">{hb==null?'Pasa el cursor por una barra para ver su valor.':a[hb]==null?`${hb} h: sin dato`:`A las ${hb} h: ${fmt(a[hb])} ${p.u} en promedio`}</p>
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Promedio por hora de ${p.n}`} onPointerLeave={()=>setHb(null)}>
   {a.map((x,i)=>x==null?null:<rect key={i} className="bb" x={i*bw+1} y={H-B-x/top*(H-B-6)} width={bw-2} height={x/top*(H-B-6)} rx="2" style={{fill:i==hot?'var(--fg)':'var(--acc)'}}/>)}
   {a.map((_,i)=><rect key={'h'+i} x={i*bw} y="0" width={bw} height={H-B} fill="transparent" onPointerEnter={()=>setHb(i)}/>)}
   {[0,6,12,18,23].map(h=><text key={h} className="t" x={h*bw+bw/2} y={H-6} textAnchor="middle">{h} h</text>)}</svg></>}

export function Limits({p,view,id}){
 if(!p.oms)return <p className="sm">Este comparativo aplica a PM2.5 y PM10.</p>
 const dl=daily(view,id,p),vals=[];for(let i=0;i<view.dim;i++){const x=dl.get(view.first+i);if(x!=null)vals.push(x)}
 if(!vals.length)return <None/>
 const mean=vals.reduce((s,x)=>s+x,0)/vals.length,mx=Math.max(mean,p.nom,p.oms)
 const rows=[['Promedio de '+MES[view.m],mean],['Tope de “aceptable” (NOM-172)',p.nom],['Guía OMS 2021, 24 h',p.oms]]
 return <><p className="sm">Promedio de los promedios diarios, en {p.u}.</p>
  <div>{rows.map(r=><div className="br" key={r[0]}><span>{r[0]}</span><i style={{width:`${r[1]/mx*100}%`}}/><b>{r[1].toFixed(0)}</b></div>)}</div></>}

export function Stations({view,si,onPick}){
 return <ul className="l">{view.st.map((s,k)=>{let w=-1,n=0
  for(let i=0;i<view.dim;i++){const r=view.DC[s.id].get(view.first+i);if(r){n++;w=Math.max(w,r.c)}}
  return <li key={s.id} className={k==si?'cur':''}><button className="row" onClick={()=>onPick(k)} aria-pressed={k==si}><span>{s.name}</span><span className={`pill ${w<0?'nd':'k'+w}`}>{w<0?'Sin datos':'Peor día: '+KN[w].toLowerCase()}</span><span className="sm">{n} de {view.dim} días con datos</span></button></li>})}</ul>}
