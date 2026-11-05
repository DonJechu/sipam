import {useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter,Routes,Route,useLocation} from 'react-router-dom'
import './styles.css'
import Landing from './pages/Landing'
import Datos from './pages/Datos'

function ScrollManager(){const {pathname,hash}=useLocation()
 useEffect(()=>{if(hash){const t=setTimeout(()=>document.querySelector(hash)?.scrollIntoView(),60);return()=>clearTimeout(t)}window.scrollTo(0,0)},[pathname,hash]);return null}

createRoot(document.getElementById('root')).render(
 <BrowserRouter><ScrollManager/>
  <Routes><Route path="/" element={<Landing/>}/><Route path="/datos" element={<Datos/>}/><Route path="*" element={<Landing/>}/></Routes>
 </BrowserRouter>)
