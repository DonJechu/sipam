import {useEffect,useRef,useState} from 'react'
import {Link} from 'react-router-dom'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import About from '../components/About'
import Signup from '../components/Signup'
import {ABOUT} from '../lib/team'
import {SITE,FACTS} from '../lib/site'
import {BANDS} from '../lib/bands'
gsap.registerPlugin(ScrollTrigger)
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches
const CINVESTAV='https://ayp.cinvestav.mx/estudio-y-modelacion-de-la-calidad-del-aire-en-la-zona-metropolitana-tampico-madero-altamira-en-el-sur-de-tamaulipas/'
const Mail=({children,subject})=>SITE.email
 ?<a className="btn" href={`mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`}>{children}</a>
 :<span className="btn alt" title="Falta el correo en src/lib/site.js">{children} (marcador: falta el correo)</span>

export default function Landing(){
 const lenis=useRef(null),[cp,setCp]=useState(false)
 useEffect(()=>{document.title='SIPAM · ¿Qué estás respirando en Altamira?'
  if(reduced())return
  const ctx=gsap.context(()=>{
   gsap.from('.emp .d',{opacity:0,scale:.7,duration:.4,stagger:.015,ease:'power2.out',clearProps:'opacity,transform'})
   gsap.utils.toArray('.rv').forEach(el=>gsap.from(el,{opacity:0,y:18,duration:.6,ease:'power2.out',clearProps:'opacity,transform',scrollTrigger:{trigger:el,start:'top 88%',once:true}}))})
  const l=new Lenis({lerp:.1});lenis.current=l;l.on('scroll',ScrollTrigger.update)
  const tick=t=>l.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0)
  return()=>{gsap.ticker.remove(tick);l.destroy();lenis.current=null;ctx.revert()}},[])
 const go=(e,id)=>{if(lenis.current){e.preventDefault();lenis.current.scrollTo(id)}}
 const share=async()=>{const u=location.origin;if(navigator.share){try{await navigator.share({title:'SIPAM',text:'¿Qué estás respirando en Altamira, Tampico y Madero?',url:u})}catch{}}
  else{try{await navigator.clipboard.writeText(u);setCp(true);setTimeout(()=>setCp(false),2500)}catch{}}}

 return <>
  <div className="w">
   <nav><Link to="/" className="brand"><img src={import.meta.env.BASE_URL+'favicon.png'} alt="" width="34" height="34"/><b>SIPAM</b></Link><div>
    {[['#como','Cómo lo medimos'],['#color','Qué hacer según el color'],['#equipo','Equipo']].map(([h,t])=><a key={h} href={h} onClick={e=>go(e,h)}>{t}</a>)}
    <Link to="/datos" className="nav-cta">Datos</Link></div></nav>
   <div className="hero" id="inicio">
    <div>
     <span className="tag">Antes del lanzamiento</span>
     <h1>¿Qué estás respirando en Altamira, Tampico y Madero?</h1>
     <p className="lead">Medimos el aire del corredor industrial con sensores propios y lo explicamos para que cualquiera lo entienda.</p>
     <p className="cta"><Link className="btn big" to="/datos">Ver los datos →</Link><span className="sm">Prototipo con datos de demostración, abierto para todos.</span></p>
     <p className="lk"><a href="#avisame" onClick={e=>go(e,'#avisame')}>Avísame cuando salga el primer reporte</a><a href="#como" onClick={e=>go(e,'#como')}>Cómo lo medimos</a></p>
    </div>
    <div>
     <div className="cal emp" aria-hidden="true">{Array.from({length:35},(_,i)=><span key={i} className="d nd"/>)}</div>
     <p className="sm">Todavía no hay un primer reporte, y no vamos a inventar uno. Así se verá cada mes: un cuadro por día, con el color de la calidad del aire.</p>
    </div>
   </div>
   <div className="trust">
    <span>Proyecto del {ABOUT.inst}</span><span>Bandas de la NOM-172-SEMARNAT-2023</span><span>Escuchamos a {SITE.heard} personas de la comunidad</span></div>
  </div>

  <section id="problema"><div className="w">
   <h2 className="rv">Quien vive cerca se acostumbra</h2>
   <p className="lead rv">Con la petroquímica, la termoeléctrica y el tráfico constante, el humo y el olor se vuelven parte del paisaje. Pero acostumbrarse no es lo mismo que estar a salvo, y casi nadie puede revisar qué hay en el aire que respira.</p>
   <div className="facts">{FACTS.map((f,i)=><div className="fact rv" key={i}><b>{f.big}</b><p>{f.t}</p><span className={f.src?'sm':'sm warn'}>{f.src?(f.url?<a href={f.url} target="_blank" rel="noreferrer">{f.src}</a>:f.src):'Fuente por confirmar'}</span></div>)}</div>
   <p className="sm rv">Una revisión del CINVESTAV concluye que la infraestructura de monitoreo en la zona es escasa y deficiente. <a href={CINVESTAV} target="_blank" rel="noreferrer">Lima-Castillo et al., 2021</a>.</p>
  </div></section>

  <section id="como"><div className="w">
   <h2 className="rv">Cómo lo medimos</h2>
   <div className="g2">
    <div className="steps">
     {[['Medimos','Sensores propios registran partículas (PM2.5 y PM10). Los gases se muestran como indicativos hasta contar con sensores adecuados.'],
       ['Clasificamos','Cada día cae en una de cinco categorías, con las bandas de la NOM-172-SEMARNAT-2023. No es el índice oficial.'],
       ['Explicamos','Cada mes publicamos el calendario del mes y qué hacer según el color.']].map(([t,d],i)=>
      <div className="step rv" key={t}><i>{i+1}</i><div><h3>{t}</h3><p className="sm">{d}</p></div></div>)}
     <p className="rv"><Link to="/datos">Ver el prototipo del sitio con datos de demostración →</Link></p>
    </div>
    <figure className="rv">
     {SITE.protoImg?<img src={import.meta.env.BASE_URL+SITE.protoImg} alt="Prototipo del sensor" loading="lazy"/>:<div className="ph">Foto del prototipo<br/>(marcador: src/lib/site.js)</div>}
     <figcaption className="sm">Prototipo del sensor, construido con menos de ${SITE.cost} MXN en materiales.</figcaption>
    </figure>
   </div>
  </div></section>

  <section id="color"><div className="w">
   <h2 className="rv">Qué hacer según el color</h2>
   <div className="bands rv">{BANDS.map(([n,t],i)=><div key={n} style={{'--cc':`var(--c${i})`}}><b>{n}</b><span>{t}</span></div>)}</div>
  </div></section>

  <section id="organizaciones"><div className="w">
   <h2 className="rv">¿Eres una escuela, empresa u organización?</h2>
   <p className="lead rv">Podemos preparar reportes a medida y compartir los datos. Cuéntanos qué necesitas.</p>
   <p className="rv"><Mail subject="Datos y reportes a medida">Escríbenos</Mail></p>
  </div></section>

  <About/>

  <section id="avisame"><div className="w">
   <h2 className="rv">Recibe el reporte mensual</h2>
   <div className="rv"><Signup label="Recibir el reporte mensual"/></div>
   <p className="rv"><button className="s" onClick={share}>{cp?'Enlace copiado':'Compartir este sitio'}</button></p>
   <p className="rv">¿Tienes un lugar para un sensor? <Mail subject="Tengo un lugar para un sensor">Escríbenos</Mail></p>
  </div></section>
  <footer><div className="w"><img className="flogo" src={import.meta.env.BASE_URL+'logo.png'} alt="SIPAM" height="64"/>SIPAM · {ABOUT.inst}. Prototipo: los datos del sitio de datos son simulados.</div></footer>
 </>}
