import {useId,useState} from 'react'
import {SITE} from '../lib/site'
const MSG={ok:'Listo. Te escribiremos cuando haya reporte.',err:'No pudimos enviarlo. Intenta de nuevo.',missing:'Marcador: falta conectar el servicio de correos (src/lib/site.js).'}
export default function Signup({label}){
 const id=useId(),[em,setEm]=useState(''),[s,setS]=useState('idle')
 const send=async e=>{e.preventDefault();if(!SITE.formUrl)return setS('missing');setS('sending')
  try{const r=await fetch(SITE.formUrl,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({email:em})});setS(r.ok?'ok':'err');if(r.ok)setEm('')}catch{setS('err')}}
 return <form className="su" onSubmit={send}>
  <label htmlFor={id} className="vh">Tu correo</label>
  <input id={id} type="email" required placeholder="tucorreo@ejemplo.com" value={em} onChange={e=>setEm(e.target.value)}/>
  <button className="btn" disabled={s==='sending'}>{label}</button>
  <p className="sm su-n" role="status">{MSG[s]||'Un correo al mes. Sin spam.'}</p></form>}
