'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { orderService } from '@/services/order.service'

export default function ProfilePage() {
  const { user, logout, token, isLoading } = useAuth()
  const router = useRouter()
  
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  
  // Estado para el Modal de Detalle
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Cargar órdenes del usuario
  useEffect(() => {
    if (token) {
      orderService.getAll(token) // Asumiendo que tu endpoint devuelve las ordenes del usuario
        .then(data => {
            // Manejo robusto de la respuesta (array o objeto paginado)
            const list = Array.isArray(data) ? data : (data.data || [])
            setOrders(list)
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false))
    }
  }, [token])

  // Abrir Modal con Detalle Completo
  const handleOpenDetail = async (orderUuid: string) => {
    if(!token) return;
    try {
        setSelectedOrder({ id: 'Cargando...', loading: true }) 
        // Reutilizamos el servicio que ya tienes
        const fullOrder = await orderService.getById(orderUuid, token)
        setSelectedOrder(fullOrder)
    } catch (error) {
        alert("No se pudo cargar el detalle")
        setSelectedOrder(null)
    }
  }

  if (isLoading || !user) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-light tracking-widest animate-pulse">CARGANDO PERFIL...</div>

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6">
      
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-end border-b border-white/10 pb-6">
        <div>
            <h1 className="text-3xl md:text-5xl font-thin text-white tracking-tighter">
                MI <span className="text-gray-600">CUENTA</span>
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mt-2">Bienvenido de nuevo, {user.first_name}</p>
        </div>
        <button 
            onClick={logout}
            className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-900/30 px-4 py-2 hover:bg-red-900/10 transition"
        >
            Cerrar Sesión
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* COLUMNA IZQUIERDA: DATOS USUARIO */}
        <div className="md:col-span-1 space-y-8">
            <div className="bg-white/5 border border-white/10 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                
                <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Datos Personales</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-gray-600 uppercase tracking-widest">Nombre</label>
                        <p className="text-white font-light">{user.first_name} {user.last_name}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-600 uppercase tracking-widest">Email</label>
                        <p className="text-white font-light">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-600 uppercase tracking-widest">Rol</label>
                        <p className="text-purple-400 text-xs uppercase tracking-wider border border-purple-500/20 inline-block px-2 py-0.5 rounded-sm mt-1">
                            {user.role}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL DE ÓRDENES */}
        <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                Historial de Compras <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">{orders.length}</span>
            </h3>

            {loadingOrders ? (
                <div className="space-y-4 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-sm" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10">
                    <p className="text-gray-500 font-light mb-4">Aún no has realizado ninguna compra.</p>
                    <button onClick={() => router.push('/products')} className="text-white text-xs uppercase tracking-widest border-b border-white hover:text-gray-300">
                        Ir a la tienda
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white/5 border border-white/5 hover:border-white/20 transition-all p-6 flex flex-col md:flex-row justify-between items-center gap-6 group">
                            
                            {/* Info Principal */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-mono text-purple-400 text-sm">#{order.uuid?.slice(0,8) || order.id}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border rounded-sm
                                        ${order.status === 'delivered' ? 'border-green-500/30 text-green-400' : 
                                          order.status === 'cancelled' ? 'border-red-500/30 text-red-400' : 
                                          'border-yellow-500/30 text-yellow-400'}`}>
                                        {order.status === 'pending' ? 'Pendiente' : 
                                         order.status === 'paid' ? 'Pagado' : 
                                         order.status === 'shipped' ? 'Enviado' : 
                                         order.status === 'delivered' ? 'Entregado' : order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="text-right">
                                <p className="text-white font-light text-lg">${Number(order.total).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total</p>
                            </div>

                            {/* Botón Ver Detalle */}
                            <button 
                                onClick={() => handleOpenDetail(order.uuid)}
                                className="px-6 py-2 border border-white/10 text-xs text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300"
                            >
                                Ver Detalle
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- MODAL DE DETALLE (Reutilizado del Admin pero Read-Only) --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-thin text-white tracking-tighter">
                            ORDEN <span className="text-gray-500">#{selectedOrder.uuid?.slice(0,8) || '...'}</span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                            {selectedOrder.loading ? 'Cargando...' : new Date(selectedOrder.created_at).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
                </div>

                {selectedOrder.loading ? (
                    <div className="p-20 text-center text-gray-500 animate-pulse uppercase tracking-widest text-xs">Obteniendo datos...</div>
                ) : (
                    <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                        
                        {/* Dirección de Envío */}
                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Enviado a</h3>
                            {selectedOrder.street ? (
                                <div className="bg-white/5 p-4 border border-white/5">
                                    <p className="text-white text-sm">{selectedOrder.street}</p>
                                    <p className="text-gray-400 text-xs">{selectedOrder.city}, {selectedOrder.state} ({selectedOrder.zip_code})</p>
                                    {selectedOrder.phone && <p className="text-gray-500 text-xs mt-1">Tel: {selectedOrder.phone}</p>}
                                </div>
                            ) : (
                                <p className="text-gray-600 italic text-xs">Dirección no disponible</p>
                            )}
                        </div>

                        {/* Productos */}
                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 pb-2 border-b border-white/10">Tu Selección</h3>
                            <div className="space-y-3">
                                {selectedOrder.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center">
                                            {item.image_url ? (
                                                <img src={item.image_url} className="w-full h-full object-contain" />
                                            ) : <span className="text-[8px]">N/A</span>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-light">{item.product_name}</p>
                                            <p className="text-gray-500 text-xs">{item.quantity} x ${item.price}</p>
                                        </div>
                                        <p className="text-white font-medium text-sm">${Number(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white/5 p-4 border border-white/10 flex justify-between items-center">
                            <div className="text-xs text-gray-500 uppercase tracking-widest">
                                {selectedOrder.payment_method === 'mercadopago' ? 'Mercado Pago' : 'Transferencia Bancaria'}
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 mr-3">Total Pagado</span>
                                <span className="text-xl text-white font-thin tracking-tighter">${Number(selectedOrder.total).toLocaleString()}</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  )
}