import {TEAM,ABOUT} from '../lib/team'
const ini=n=>n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()

export default function About(){
 return <section id="nosotros"><div className="w">
  <h2>Sobre nosotros</h2>
  <p className="lead">Somos {ABOUT.team}, de {ABOUT.inst}. Construimos una red de sensores para medir el aire en el corredor industrial de Altamira, Tampico y Cd. Madero, una zona con pocos puntos de monitoreo. Queremos mostrar con datos propios qué hay en el aire, cómo puede afectar la salud y dónde falla el monitoreo.</p>
  <div className="ods"><span>ODS 11 Ciudades y comunidades sostenibles</span><span>ODS 13 Acción por el clima</span></div>
  <ul className="team">{TEAM.map((m,i)=><li key={i}>
   <div className="av" aria-hidden="true">{m.foto?<img src={import.meta.env.BASE_URL+m.foto} alt="" width="96" height="96" loading="lazy"/>:ini(m.n)}</div>
   <b>{m.n}</b><span className="sm">{m.r}</span><p className="sm">{m.b}</p></li>)}</ul>
  <p className="sm">Contacto: {ABOUT.contact}</p>
 </div></section>}