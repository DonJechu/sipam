import {useRef,useState} from 'react'
import {parseWB,buildModel} from '../lib/data'

export default function Method({onData,onReset}){
 const [msg,setMsg]=useState(null),[over,setOver]=useState(false),inp=useRef()
 const read=file=>{if(!file)return
  const r=new FileReader()
  r.onload=async e=>{try{
    const XLSX=await import('xlsx'),res=parseWB(XLSX,XLSX.read(e.target.result,{type:'array'}))
    if(res.error)return setMsg({ok:false,t:res.error})
    onData(buildModel(res.rows,res.stations,file.name));setMsg({ok:true,t:res.msg})
   }catch{setMsg({ok:false,t:'El archivo no es un .xlsx o .csv válido.'})}}
  r.readAsArrayBuffer(file)}
 const drag=e=>{e.preventDefault();setOver(e.type==='dragover');if(e.type==='drop')read(e.dataTransfer.files[0])}
 return <section id="metodologia"><div className="w">
  <h2>Metodología y carga de datos</h2>
  <div className="g">
   <div>
    <h3>Prueba con tu Excel</h3>
    <p className="sm">Vista previa local: lo que cargues solo lo ves tú. Para publicarlo, el archivo mensual se sube al repositorio y otra persona lo aprueba.</p>
    <label className={'drop'+(over?' over':'')} onDragOver={drag} onDragLeave={drag} onDrop={drag}>
     <input ref={inp} type="file" accept=".xlsx,.csv" hidden onChange={e=>{read(e.target.files[0]);e.target.value=''}}/>Arrastra aquí tu archivo .xlsx o .csv, o elígelo</label>
    <div className="sm" role="status" aria-live="polite">{msg&&<>{!msg.ok&&<b className="warn">No se cargó. </b>}{msg.t}</>}</div>
    <p className="sm"><button className="s" onClick={()=>{onReset();setMsg({ok:true,t:'Datos de demostración restaurados.'})}}>Volver a los datos de demostración</button></p>
    <p className="sm">Hoja <b>Lecturas</b>: fecha_hora (AAAA-MM-DD HH:MM), estacion_id, pm25_ugm3, pm10_ugm3, o3_ppm, no2_ppm, so2_ppm, co_ppm, co2_ppm. Hoja opcional <b>Estaciones</b>: estacion_id, nombre. Los vacíos cuentan como sin dato, nunca como cero.</p>
   </div>
   <div className="sm">
    <h3>Cómo se calcula</h3>
    <p>Cada día se clasifica con la peor banda entre los contaminantes con datos suficientes: partículas con el promedio de 24 h (mínimo 18 horas válidas), O₃, NO₂ y SO₂ con su máximo horario, y CO con el máximo del promedio móvil de 8 h. Un día sin datos suficientes aparece en blanco.</p>
    <p>Si una lectura cae exactamente en el límite inferior de una banda, se asigna a la peor, porque la norma no lo define. El CO₂ no tiene bandas en la norma y solo se muestra con su valor.</p>
    <p><b>No es el índice oficial.</b> Es una clasificación con las bandas de la NOM-172 usando sensores propios, sin validar contra una estación de referencia.</p>
   </div>
  </div></div></section>}
