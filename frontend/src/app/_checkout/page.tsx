'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useAuthFetch } from '@/hooks/useAuthFetch'

// Interfaz exacta de tu código original
interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
}

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart()
  const router = useRouter()
  const { isLoading } = useAuth()
  const authFetch = useAuthFetch()

  // --- LÓGICA ORIGINAL RESTAURADA ---
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'mercadopago'>('transfer')
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)

  // Estado idéntico al tuyo (con phone y street)
  const [newAddress, setNewAddress] = useState({ 
      street: '', 
      city: '', 
      state: '', 
      zipCode: '', 
      phone: '' 
  })

  // 1. Cargar Direcciones (Tu lógica)
  useEffect(() => {
    const fetchAddresses = async () => {
      if (isLoading) return
      try {
        const res = await authFetch('http://localhost:3000/addresses')
        if (res && res.ok) {
          const data = await res.json()
          setAddresses(data)
          if (data.length > 0) setSelectedAddressId(data[0].id)
        }
      } catch (error) {
        console.error("Error cargando direcciones", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAddresses()
  }, [isLoading, authFetch])

  // 2. Guardar Nueva Dirección (Tu lógica exacta)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    try {
      const res = await authFetch('http://localhost:3000/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      })

      if (res && res.ok) {
        const savedAddr = await res.json()
        setAddresses([savedAddr, ...addresses])
        setSelectedAddressId(savedAddr.id)
        setIsAddingAddress(false)
        setNewAddress({ street: '', city: '', state: '', zipCode: '', phone: '' })
      } else {
        alert('Error al guardar dirección')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    } finally {
      setProcessing(false)
    }
  }

  // 3. Procesar Compra (Tu lógica exacta)
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return alert('Selecciona una dirección')
    setProcessing(true)

    try {
      const res = await authFetch('http://localhost:3000/orders', {
        method: 'POST',
        body: JSON.stringify({
          address_id: selectedAddressId,
          payment_method: paymentMethod
        })
      })

      if (res && res.ok) {
        const data = await res.json()
        clearCart()
        alert(data.message || 'Orden creada exitosamente')
        router.push('/profile')
      } else if (res) {
        const errorData = await res.json()
        alert(errorData.message || 'Error al procesar')
      }
    } catch (err) {
      alert('Error de conexión')
    } finally {
      setProcessing(false)
    }
  }

  // --- ESTILOS "HIGH-END" ---
  const inputClass = "w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors font-light text-sm"
  const labelClass = "block text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-1"

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-light tracking-widest animate-pulse">
      CARGANDO...
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* COLUMNA IZQUIERDA: DATOS */}
        <div className="space-y-12 animate-in slide-in-from-left duration-700">
          
          {/* SECCIÓN 1: ENVÍO */}
          <div>
            <h2 className="text-2xl font-thin text-white tracking-tighter mb-8 border-b border-white/10 pb-4">
               1. DATOS DE <span className="text-gray-600">ENVÍO</span>
            </h2>

            {/* LISTA DE DIRECCIONES */}
            {!isAddingAddress && addresses.length > 0 && (
                <div className="space-y-4 mb-8">
                    {addresses.map(addr => (
                        <label 
                            key={addr.id} 
                            className={`block p-6 border cursor-pointer transition-all duration-300 relative group
                                ${selectedAddressId === addr.id 
                                    ? 'border-white bg-white/10' 
                                    : 'border-white/10 hover:border-white/30'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <input 
                                    type="radio" 
                                    name="address" 
                                    checked={selectedAddressId === addr.id}
                                    onChange={() => setSelectedAddressId(addr.id)}
                                    className="accent-white w-4 h-4"
                                />
                                <div>
                                    <p className="text-white font-light text-sm">{addr.street}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {addr.city}, {addr.state} (CP: {addr.zip_code}) - {addr.phone}
                                    </p>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            )}

            {/* BOTÓN NUEVA DIRECCIÓN */}
            {!isAddingAddress && (
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="text-xs uppercase tracking-widest text-white hover:text-gray-300 transition-colors flex items-center gap-2 mb-6"
                >
                  <span className="text-xl leading-none">+</span> Agregar Nueva Dirección
                </button>
            )}

            {/* FORMULARIO NUEVA DIRECCIÓN (Diseño Nuevo, Campos Viejos) */}
            {isAddingAddress && (
              <form onSubmit={handleSaveAddress} className="glass p-8 mb-8 animate-in fade-in slide-in-from-top-4">
                 <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-6">Nueva Dirección</h3>
                 
                 <div className="space-y-6">
                    {/* CALLE (Street) */}
                    <div>
                        <label className={labelClass}>Calle y Número</label>
                        <input 
                          type="text" required placeholder="Ej: Av. Libertador 1234"
                          className={inputClass}
                          value={newAddress.street} 
                          onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* CIUDAD */}
                        <div>
                            <label className={labelClass}>Ciudad</label>
                            <input 
                              type="text" required placeholder="Ciudad"
                              className={inputClass}
                              value={newAddress.city} 
                              onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                            />
                        </div>
                        {/* PROVINCIA */}
                        <div>
                            <label className={labelClass}>Provincia</label>
                            <input 
                              type="text" required placeholder="Provincia"
                              className={inputClass}
                              value={newAddress.state} 
                              onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* ZIP CODE */}
                        <div>
                            <label className={labelClass}>Código Postal</label>
                            <input 
                              type="text" required placeholder="CP"
                              className={inputClass}
                              value={newAddress.zipCode} 
                              onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})}
                            />
                        </div>
                        {/* TELÉFONO (Agregado que faltaba) */}
                        <div>
                            <label className={labelClass}>Teléfono</label>
                            <input 
                              type="text" required placeholder="+54 9..."
                              className={inputClass}
                              value={newAddress.phone} 
                              onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-6">
                        <button 
                          type="button" 
                          onClick={() => setIsAddingAddress(false)} 
                          className="text-xs text-gray-500 hover:text-white uppercase tracking-widest"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          disabled={processing}
                          className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
                        >
                          {processing ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                 </div>
              </form>
            )}
          </div>

          {/* SECCIÓN 2: PAGO */}
          <div>
            <h2 className="text-2xl font-thin text-white tracking-tighter mb-8 border-b border-white/10 pb-4">
                2. MÉTODO DE <span className="text-gray-600">PAGO</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transferencia */}
                <label className={`cursor-pointer border p-6 flex flex-col items-center gap-3 transition-all duration-300
                    ${paymentMethod === 'transfer' ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30'}
                `}>
                    <input type="radio" name="payment" className="hidden" 
                        checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} 
                    />
                    <span className="text-2xl">🏦</span>
                    <span className="font-bold text-sm tracking-widest uppercase text-white">Transferencia</span>
                    <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded uppercase tracking-wider">10% OFF</span>
                </label>
                
                {/* MercadoPago (Deshabilitado visualmente si quieres, o activo) */}
                <label className="cursor-not-allowed opacity-50 border border-white/10 p-6 flex flex-col items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <span className="font-bold text-sm tracking-widest uppercase text-gray-400">Mercado Pago</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Próximamente</span>
                </label>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: RESUMEN (Sticky) */}
        <div className="lg:h-fit lg:sticky lg:top-32 animate-in slide-in-from-right duration-700 delay-100">
            <div className="bg-white text-black p-8 relative overflow-hidden shadow-2xl shadow-white/5">
                
                <h3 className="text-black text-sm uppercase tracking-[0.25em] font-bold mb-8 pb-4 border-b border-black/10">
                    Resumen
                </h3>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar-black mb-8">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-black text-sm font-bold">{item.quantity}x {item.name}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Neon Art</span>
                            </div>
                            <span className="text-black text-sm font-bold">${(Number(item.price) * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-black/10 pt-6 mb-8">
                    <div className="flex justify-between items-end">
                        <span className="text-gray-500 text-sm uppercase tracking-widest">Total</span>
                        <span className="text-4xl text-black font-thin tracking-tighter">${total.toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={handlePlaceOrder}
                    disabled={processing || !selectedAddressId || isAddingAddress}
                    className="w-full bg-black text-white py-5 text-sm font-bold tracking-[0.25em] hover:bg-gray-800 transition-all disabled:opacity-50 relative overflow-hidden group"
                >
                    <span className="relative z-10">{processing ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}</span>
                    <div className="absolute inset-0 bg-purple-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
                </button>

                <p className="text-center text-gray-400 text-[10px] mt-6 uppercase tracking-widest">
                    Transacción Segura Encriptada
                </p>
            </div>
        </div>

      </div>
    </main>
  )
}