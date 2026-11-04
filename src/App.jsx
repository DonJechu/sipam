import {useEffect,useMemo,useRef,useState} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {MES,KN,P,PM,fD,lastRead,buildModel,demo,DEMO_ST} from './lib/data'
import {DayChart,HourBars,Limits,Stations,fmt} from './components/Charts'
import Method from './components/Method'
import About from './components/About'
gsap.registerPlugin(ScrollTrigger)

const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches
const makeDemo=()=>buildModel(demo(),DEMO_ST,'demo')
const BANDS=[
 ['Buena','Riesgo mínimo o nulo. Disfruta las actividades al aire libre.'],
 ['Aceptable','Riesgo bajo. Las personas sensibles pueden notar irritación o tos y conviene que reduzcan el ejercicio intenso afuera.'],
 ['Mala','Más riesgo de síntomas respiratorios en personas sensibles: que eviten el ejercicio vigoroso y descansen más. La población general puede seguir con sus actividades.'],
 ['Muy mala','Puede haber daño a la salud. Las personas sensibles deben evitar la actividad física al aire libre y todos conviene que la reduzcan.'],
 ['Extremadamente mala','Cualquiera puede resultar afectado. Permanece en interiores, reprograma actividades y consulta a tu médico si hay síntomas.']]

function Count({n}){const r=useRef()
 useEffect(()=>{const el=r.current;el.textContent=n;if(reduced())return
  const o={v:0},t=gsap.to(o,{v:n,duration:1.2,ease:'power2.out',onUpdate:()=>{el.textContent=Math.round(o.v)}});return()=>t.kill()},[n])
 return <span ref={r}/>}

export default function App(){
 const [model,setModel]=useState(makeDemo),[si,setSi]=useState(0),[mi,setMi]=useState(null),[pid,setPid]=useState('pm25'),[dayS,setDay]=useState(null)
 const [hc,setHc]=useState(null),[hd,setHd]=useState(null),[ver,setVer]=useState(0),lenis=useRef(null)
 const mo=model.months[mi??model.months.length-1]
 const view=useMemo(()=>({...model,first:mo.first,dim:mo.dim,m:mo.m}),[model,mo])
 const st=view.st[si],dc=view.DC[st.id],p=PM[pid]

 const {cn,nd,w}=useMemo(()=>{const cn=[0,0,0,0,0];let nd=0,w=null
  for(let i=0;i<view.dim;i++){const d=view.first+i,r=dc.get(d);if(!r){nd++;continue}cn[r.c]++;if(!w||r.c>w.c)w={d,...r}}
  return{cn,nd,w}},[view,dc])
 const day=dayS??(w?w.d:view.first),bad=cn[2]+cn[3]+cn[4],tot=view.dim-nd
 const lr=lastRead(view,st.id),age=Math.floor((Date.now()-lr*36e5)/864e5),ld=new Date(lr*36e5)
 const off=(new Date(view.first*864e5).getUTCDay()+6)%7,m=view.H[st.id]&&view.H[st.id][p.id]
 const hr=hd!=null?dc.get(hd):null,hp=hr&&P.find(q=>q.n==hr.p)

 useEffect(()=>{if(reduced())return
  const ctx=gsap.context(()=>{
   gsap.from('#cal .d',{opacity:0,scale:.6,duration:.4,stagger:.02,ease:'power2.out',clearProps:'opacity,transform'})
   gsap.fromTo('.ln',{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1.4,ease:'power1.inOut',scrollTrigger:{trigger:'#dc',start:'top 85%',once:true}})})
  const l=new Lenis({lerp:.1});lenis.current=l
  l.on('scroll',ScrollTrigger.update)
  const tick=t=>l.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0)
  const trig=ScrollTrigger.create({trigger:'#datos',start:'top 70%',end:'bottom 20%',onToggle:s=>{l.options.smoothWheel=!s.isActive}})
  return()=>{trig.kill();gsap.ticker.remove(tick);l.destroy();lenis.current=null;ctx.revert()}},[])

 const go=(e,id)=>{if(lenis.current){e.preventDefault();lenis.current.scrollTo(id)}}
 const setData=mod=>{setModel(mod);setSi(0);setMi(null);setDay(null);setHc(null);setHd(null);setVer(v=>v+1);lenis.current?.scrollTo('#inicio')}
 const dimC=c=>hc!=null&&hc!==c

 return <>
  <div className="w">
   <nav><b>Aire en Altamira</b><div>
    {[['#inicio','Inicio'],['#datos','Datos'],['#aprende','Aprende'],['#metodologia','Metodología'],['#nosotros','Nosotros']].map(([h,t])=><a key={h} href={h} onClick={e=>go(e,h)}>{t}</a>)}</div></nav>
   <div className="hero" id="inicio">
    <div>
     <div className="pick">
      <label className="sm">Estación<select value={si} onChange={e=>{setSi(+e.target.value);setDay(null)}}>{view.st.map((s,i)=><option key={s.id} value={i}>{s.name}</option>)}</select></label>
      {model.months.length>1&&<label className="sm">Mes<select value={mi??model.months.length-1} onChange={e=>{setMi(+e.target.value);setDay(null)}}>{model.months.map((x,i)=><option key={i} value={i}>{MES[x.m]} {x.y}</option>)}</select></label>}
     </div>
     <div key={ver} className="fresh">
      <span className="tag">{model.src=='demo'?'Datos simulados (demo)':'Datos cargados: '+model.src}</span>
      <h1>{tot?<>En {MES[view.m]}, el aire de {st.name} fue malo o peor durante <Count n={bad}/> de {tot} días con datos.</>:`No hay datos suficientes de ${st.name} en ${MES[view.m]}.`}</h1>
      <div className="bar" role="img" aria-label="Días por categoría">{cn.map((n,i)=><i key={i} style={{width:`${n/view.dim*100}%`,background:`var(--c${i})`,opacity:dimC(i)?.25:1}}/>)}</div>
      <div className="lg">{[...cn.map((n,i)=>[i,KN[i]+' '+n,`var(--c${i})`]),['nd','Sin datos '+nd,'transparent']].map(([k,t,c])=>
       <span key={k} tabIndex={0} style={{'--cc':c}} className={hc===k?'hot':''} onMouseEnter={()=>setHc(k)} onMouseLeave={()=>setHc(null)} onFocus={()=>setHc(k)} onBlur={()=>setHc(null)}>{t}</span>)}</div>
      {w&&<p>Peor día: {fD(w.d)}, por {w.p} ({KN[w.c].toLowerCase()}).</p>}
      <p className="sm">Última lectura: {ld.getUTCDate()} de {MES[ld.getUTCMonth()]}, {String(ld.getUTCHours()).padStart(2,'0')}:00 (hace {age} días). {age>45&&<span className="warn">Datos desactualizados.</span>}</p>
      <p className="sm">Clasificación con las bandas de la NOM-172-SEMARNAT-2023 usando sensores propios; no es el índice oficial.</p>
     </div>
    </div>
    <div>
     <p className="sm">Cada cuadro es un día de {MES[view.m]}. Elige uno para ver sus lecturas.</p>
     <div className="cal" id="cal" onPointerLeave={()=>setHd(null)}>
      {['L','M','M','J','V','S','D'].map((x,i)=><span key={i} className="h">{x}</span>)}
      {Array.from({length:off},(_,i)=><span key={'o'+i}/>)}
      {Array.from({length:view.dim},(_,i)=>{const d=view.first+i,r=dc.get(d)
       return <button key={d} className={`d ${r?'k'+r.c:'nd'}${d==day?' on':''}${dimC(r?r.c:'nd')?' dim':''}`} onClick={()=>setDay(d)} onPointerEnter={()=>setHd(d)} onFocus={()=>setHd(d)} onBlur={()=>setHd(null)} aria-label={`${fD(d)}: ${r?KN[r.c]+', '+r.p:'sin datos'}`}>{i+1}</button>})}
     </div>
     <p className="sm rd">{hd==null?'Pasa el cursor por un día para ver el detalle.':hr?`${fD(hd)}: ${KN[hr.c].toLowerCase()}, por ${hr.p} (${fmt(hr.v)} ${hp?hp.u:''})`:`${fD(hd)}: sin datos suficientes`}</p>
    </div>
   </div>
  </div>

  <section id="datos"><div className="w">
   <h2>Datos por contaminante</h2>
   <div className="chips">{P.map(q=><button key={q.id} className="chip" aria-pressed={q.id==pid} onClick={()=>setPid(q.id)}>{q.n}</button>)}</div>
   <div className="g fresh" key={ver}>
    <div id="dc"><DayChart p={p} m={m} day={day}/></div>
    <div><h3>Hora de mayor concentración</h3><HourBars p={p} m={m} view={view}/></div>
    <div><h3>Comparado con los límites</h3><Limits p={p} view={view} id={st.id}/></div>
    <div><h3>Estaciones</h3><Stations view={view} si={si} onPick={i=>{setSi(i);setDay(null)}}/></div>
   </div>
  </div></section>

  <section id="aprende"><div className="w">
   <h2>Cómo leer los colores</h2>
   <p className="sm">Bandas de la NOM-172-SEMARNAT-2023. Los grupos sensibles son menores de 12 años, mayores de 60, personas gestantes y quienes tienen enfermedades cardiovasculares o respiratorias, como asma o EPOC.</p>
   <div className="bands">{BANDS.map(([n,t],i)=><div key={n} style={{'--cc':`var(--c${i})`}} onMouseEnter={()=>setHc(i)} onMouseLeave={()=>setHc(null)}><b>{n}</b><span>{t}</span></div>)}</div>
  </div></section>

  <Method onData={setData} onReset={()=>setData(makeDemo())}/>
  <About/>
  <footer><div className="w">Prototipo. Mientras no se carguen lecturas reales, todo lo que ves son datos simulados.</div></footer>
 </>}
