'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { orderService } from '@/services/order.service'

export default function AdminOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado para el Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // 1. Cargar lista inicial (Solo resumen)
  const loadOrders = () => {
    if (token) {
      setLoading(true)
      orderService.getAll(token)
        .then(data => setOrders(Array.isArray(data) ? data : (data.data || [])))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => { loadOrders() }, [token])

  // 2. Abrir Modal y Cargar Detalle Completo
  const handleOpenDetail = async (orderUuid: string) => {
    if(!token) return;
    try {
        setSelectedOrder({ id: 'Cargando...', loading: true }) 
        const fullOrder = await orderService.getById(orderUuid, token)
        setSelectedOrder(fullOrder)
    } catch (error) {
        alert("Error al cargar detalles")
        setSelectedOrder(null)
    }
  }

  // 3. Cambiar Estado
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder || !token) return
    setIsUpdating(true)
    try {
        await orderService.updateStatus(selectedOrder.id, newStatus, token)
        setSelectedOrder({ ...selectedOrder, status: newStatus })
        loadOrders()
        alert("Estado actualizado")
    } catch (error) {
        alert("Error al actualizar")
    } finally {
        setIsUpdating(false)
    }
  }

  if (loading && orders.length === 0) return <div className="p-8 text-white animate-pulse">Cargando órdenes...</div>

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-thin mb-8 text-white tracking-tighter">
        GESTIÓN DE <span className="text-gray-500">PEDIDOS</span>
      </h1>
      
      {/* --- TABLA LIMPIA (Solo info básica) --- */}
      <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-black/50 text-gray-200 uppercase font-light text-[10px] tracking-widest border-b border-white/10">
                <tr>
                    <th className="p-4">Orden</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Detalle</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition group">
                    <td className="p-4 font-mono text-xs text-purple-400">
                        #{order.uuid?.slice(0,8) || order.id}
                    </td>
                    <td className="p-4">
                        <p className="text-white font-normal">{order.first_name} {order.last_name}</p>
                        <p className="text-[10px] opacity-50">{order.email}</p>
                    </td>
                    <td className="p-4 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-white font-bold">${Number(order.total).toLocaleString()}</td>
                    <td className="p-4">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 border rounded
                            ${order.status === 'completed' || order.status === 'delivered' ? 'border-green-500/30 text-green-400' : 
                              order.status === 'cancelled' ? 'border-red-500/30 text-red-400' : 
                              'border-yellow-500/30 text-yellow-400'}`}>
                            {order.status}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                        <button 
                            onClick={() => handleOpenDetail(order.uuid)}
                            className="text-[10px] uppercase tracking-widest border border-white/20 hover:bg-white hover:text-black px-3 py-1 transition"
                        >
                            Ver Todo
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL DE DETALLE (Full Info) --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-3xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-thin text-white tracking-tighter">
                            ORDEN <span className="text-gray-500">#{selectedOrder.uuid?.slice(0,8) || '...'}</span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                            {selectedOrder.loading ? 'Cargando...' : new Date(selectedOrder.created_at || Date.now()).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
                </div>

                {selectedOrder.loading ? (
                    <div className="p-20 text-center text-gray-500 animate-pulse uppercase tracking-widest text-xs">Obteniendo datos...</div>
                ) : (
                    <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                        
                        {/* 1. Grid de Información */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Cliente */}
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Cliente</h3>
                                <p className="text-white text-sm">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                                <p className="text-gray-400 text-xs">{selectedOrder.email}</p>
                            </div>
                            
                            {/* Envío (¡Ahora sí se verá!) */}
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Dirección de Envío</h3>
                                {selectedOrder.street ? (
                                    <>
                                        <p className="text-white text-sm">{selectedOrder.street}</p>
                                        <p className="text-gray-400 text-xs">{selectedOrder.city}, {selectedOrder.state} ({selectedOrder.zip_code})</p>
                                        {selectedOrder.phone && <p className="text-purple-400 text-xs mt-1">📞 {selectedOrder.phone}</p>}
                                    </>
                                ) : (
                                    <p className="text-gray-600 italic text-xs">Sin dirección asociada</p>
                                )}
                            </div>
                        </div>

                        {/* 2. Items */}
                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 border-b border-white/10 pb-2">Productos ({selectedOrder.items?.length || 0})</h3>
                            <div className="space-y-3">
                                {selectedOrder.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5">
                                        <div className="w-12 h-12 bg-black flex items-center justify-center border border-white/10">
                                            {item.image_url ? (
                                                <img src={item.image_url} className="w-full h-full object-contain" />
                                            ) : <span className="text-[8px] text-gray-600">N/A</span>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-light">{item.product_name}</p>
                                            <p className="text-gray-500 text-xs">${item.price} x {item.quantity}</p>
                                        </div>
                                        <p className="text-white font-mono text-sm">${Number(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Footer de Totales y Acciones */}
                        <div className="bg-white/5 p-6 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Método de Pago</p>
                                <p className="text-white text-sm uppercase font-bold">
                                    {selectedOrder.payment_method === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Orden</p>
                                    <p className="text-2xl text-white font-thin tracking-tighter">${Number(selectedOrder.total).toLocaleString()}</p>
                                </div>

                                <select 
                                    value={selectedOrder.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={isUpdating}
                                    className="bg-black text-white border border-white/20 px-4 py-2 text-xs uppercase tracking-widest outline-none focus:border-purple-500 hover:border-white transition cursor-pointer"
                                >
                                    <option value="pending">🟡 Pendiente</option>
                                    <option value="paid">🟢 Pagado</option>
                                    <option value="shipped">🚚 Enviado</option>
                                    <option value="delivered">📬 Entregado</option>
                                    <option value="cancelled">❌ Cancelado</option>
                                </select>
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