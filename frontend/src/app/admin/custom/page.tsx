'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { customService } from '@/services/custom.service'

// Interfaz flexible (soporta tus campos viejos y los nuevos)
interface CustomRequest {
  id: number;
  // Campos antiguos vs nuevos
  name?: string;
  full_name?: string;
  
  email?: string;
  phone?: string;
  contact_info?: string;
  
  description: string;
  
  image_url?: string;
  file_url?: string;
  
  created_at: string;
}

export default function AdminCustomPage() {
  const { token } = useAuth()
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado para el Modal
  const [selectedReq, setSelectedReq] = useState<CustomRequest | null>(null)

  // 1. Cargar Datos (TU LÓGICA EXACTA)
  useEffect(() => {
    if (token) {
      customService.getAll(token)
        .then(data => {
            // Aseguramos que sea un array
            const list = Array.isArray(data) ? data : (data.data || [])
            setRequests(list)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [token])

  // Helper para normalizar datos (detecta si es 'name' o 'full_name', etc.)
  const getReqData = (req: CustomRequest) => ({
      name: req.name || req.full_name || 'Sin Nombre',
      contact: req.contact_info || `${req.email || ''} ${req.phone || ''}`,
      file: req.image_url || req.file_url,
      date: new Date(req.created_at).toLocaleDateString()
  })

  // Helper para saber si es imagen
  const isImage = (url?: string) => url?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;

  if (loading) return <div className="min-h-screen bg-black pt-44 flex justify-center text-white animate-pulse">Cargando solicitudes...</div>

  return (
    <div className="min-h-screen bg-black px-6 md:px-10 pb-20 pt-20">
      
      <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-thin text-white tracking-tighter">
                SOLICITUDES <span className="text-gray-500">PERSONALIZADAS</span>
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-2">
                {requests.length} Proyectos Pendientes
            </p>
          </div>
      </div>

      {/* --- TABLA HIGH-END --- */}
      <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-black/50 text-gray-200 uppercase font-light text-[10px] tracking-widest border-b border-white/10">
                <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Resumen Idea</th>
                    <th className="p-4 text-center">Adjunto</th>
                    <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {requests.map((req) => {
                    const data = getReqData(req)
                    return (
                        <tr key={req.id} className="hover:bg-white/5 transition group">
                            <td className="p-4 text-xs font-mono text-purple-400">
                                {data.date}
                            </td>
                            <td className="p-4 text-white font-medium">
                                {data.name}
                            </td>
                            <td className="p-4 text-xs max-w-xs truncate" title={data.contact}>
                                {data.contact}
                            </td>
                            <td className="p-4 text-xs text-gray-500 italic max-w-xs truncate">
                                "{req.description}"
                            </td>
                            <td className="p-4 text-center">
                                {data.file ? (
                                    <span className={`text-[9px] uppercase tracking-widest px-2 py-1 border rounded
                                        ${isImage(data.file) ? 'border-blue-500/30 text-blue-400' : 'border-white/20 text-gray-400'}
                                    `}>
                                        {isImage(data.file) ? 'IMAGEN' : 'ARCHIVO'}
                                    </span>
                                ) : (
                                    <span className="text-gray-700 text-xl">-</span>
                                )}
                            </td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => setSelectedReq(req)}
                                    className="border border-white/20 hover:bg-white hover:text-black text-[10px] uppercase tracking-widest px-4 py-2 transition"
                                >
                                    Ver Detalle
                                </button>
                            </td>
                        </tr>
                    )
                })}
                
                {requests.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-600 text-xs uppercase tracking-widest">
                            No hay solicitudes recibidas aún.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL DE DETALLE Y VISTA PREVIA --- */}
      {selectedReq && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
              <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/20 shadow-2xl rounded-sm flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
                  
                  {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
                  <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
                      <div className="p-6 border-b border-white/10">
                          <h2 className="text-xl font-thin text-white tracking-tighter mb-1">
                              PROYECTO <span className="text-purple-500">#{selectedReq.id}</span>
                          </h2>
                          <p className="text-xs text-gray-500 uppercase tracking-widest">
                              {getReqData(selectedReq).date}
                          </p>
                      </div>
                      
                      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                          <div>
                              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Cliente</label>
                              <p className="text-white text-lg font-light">{getReqData(selectedReq).name}</p>
                          </div>
                          
                          <div>
                              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Contacto</label>
                              <div className="bg-white/5 p-4 border border-white/10">
                                  <p className="text-purple-300 font-mono text-xs break-all">
                                      {getReqData(selectedReq).contact}
                                  </p>
                              </div>
                          </div>

                          <div>
                              <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Descripción</label>
                              <p className="text-gray-400 text-sm font-light leading-relaxed whitespace-pre-wrap">
                                  {selectedReq.description}
                              </p>
                          </div>
                      </div>

                      <div className="p-6 border-t border-white/10 bg-white/5">
                          <a 
                              href={`mailto:${selectedReq.email || ''}?subject=Presupuesto VONF&body=Hola ${getReqData(selectedReq).name},`}
                              className="block w-full text-center bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                          >
                              Responder Email
                          </a>
                      </div>
                  </div>

                  {/* COLUMNA DERECHA: VISTA PREVIA ARCHIVO */}
                  <div className="md:w-2/3 bg-black/50 relative flex flex-col">
                      <div className="absolute top-4 right-4 z-10">
                          <button 
                              onClick={() => setSelectedReq(null)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-white hover:text-black border border-white/20 text-white transition"
                          >
                              ✕
                          </button>
                      </div>

                      <div className="flex-1 flex items-center justify-center p-8 bg-[url('/noise.svg')]">
                          {getReqData(selectedReq).file ? (
                              isImage(getReqData(selectedReq).file) ? (
                                  <div className="relative group max-w-full max-h-full">
                                      <img 
                                          src={getReqData(selectedReq).file} 
                                          alt="Referencia" 
                                          className="max-w-full max-h-[70vh] object-contain drop-shadow-2xl border border-white/10" 
                                      />
                                      <a 
                                          href={getReqData(selectedReq).file} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 text-xs uppercase tracking-widest border border-white/20 opacity-0 group-hover:opacity-100 transition hover:bg-white hover:text-black"
                                      >
                                          Ver Original HD
                                      </a>
                                  </div>
                              ) : (
                                  <div className="text-center">
                                      <span className="text-6xl mb-4 block">📄</span>
                                      <p className="text-white text-sm mb-4 uppercase tracking-widest">Documento Adjunto</p>
                                      <a 
                                          href={getReqData(selectedReq).file} 
                                          target="_blank" 
                                          rel="noreferrer" 
                                          className="inline-block border border-white text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition"
                                      >
                                          Descargar Archivo
                                      </a>
                                  </div>
                              )
                          ) : (
                              <div className="text-center opacity-30">
                                  <span className="text-6xl mb-4 block">∅</span>
                                  <p className="text-sm uppercase tracking-widest">Sin archivo de referencia</p>
                              </div>
                          )}
                      </div>
                  </div>

              </div>
          </div>
      )}

    </div>
  )
}