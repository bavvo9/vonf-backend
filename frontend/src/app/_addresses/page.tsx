'use client'

import { useState, useEffect } from 'react'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { addressService } from '@/services/address.service'
import { Address } from '@/types' 

export default function AddressesPage() {
  const authFetch = useAuthFetch()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Estado para mostrar/ocultar formulario
  const [showForm, setShowForm] = useState(false)
  
  // 📝 AQUI DEFINIMOS FORMDATA (Esto es lo que faltaba)
  // Usamos zip_code para coincidir con la base de datos y el tipo Address
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip_code: '', 
    country: '',
    phone: ''
  })

  // 1. Cargar Direcciones a pantalla 
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await addressService.getAll(authFetch)
        setAddresses(data)
      } catch (err) {
        console.error(err)
        setError('No pudimos cargar tus direcciones.')
      } finally {
        setLoading(false)
      }
    }
    loadAddresses()
  }, [authFetch])

  // 2. Crear Dirección
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Llamamos al servicio pasando el authFetch y los datos
      const res = await addressService.create(authFetch, formData)

      // Verificamos si la respuesta es válida
      if (res && res.ok) {
        const newAddress = await res.json()
        
        // Actualizamos la lista visualmente
        setAddresses([newAddress, ...addresses])
        
        // Limpiamos el formulario y lo cerramos
        setFormData({ street: '', city: '', state: '', zip_code: '', country: '', phone: '' })
        setShowForm(false)
      } else {
         // Si el back devuelve error
         const errorData = res ? await res.json() : { message: 'Error desconocido' }
         throw new Error(errorData.message || 'Error al guardar la dirección')
      }

    } catch (err: any) {
      setError(err.message)
    }
  }

  // 3. Borrar Dirección
  const handleDelete = async (id: number) => {
    if(!confirm('¿Seguro que quieres borrar esta dirección?')) return

    try {
      const res = await addressService.delete(authFetch, id)
      if (res && res.ok) {
        setAddresses(addresses.filter(addr => addr.id !== id))
      }
    } catch (err) {
      alert('Error al borrar')
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-white p-10 text-center">Cargando direcciones...</div>

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold">Mis Direcciones</h1>
            <p className="text-gray-400 text-sm">Gestiona tus lugares de envío</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-purple-500 hover:text-white transition"
          >
            {showForm ? 'Cancelar' : '+ Nueva Dirección'}
          </button>
        </header>

        {error && (
          <div className="bg-red-900/30 text-red-400 p-3 rounded mb-4 border border-red-900">
            ⚠️ {error}
          </div>
        )}

        {/* FORMULARIO */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 animate-fade-in-down">
            <h3 className="text-lg font-bold mb-4 text-purple-400">Nueva Dirección de Envío</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calle y Altura</label>
                <input 
                  required type="text" 
                  className="w-full input-dark p-2 rounded"
                  value={formData.street}
                  onChange={e => setFormData({...formData, street: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ciudad</label>
                <input 
                  required type="text" 
                  className="w-full input-dark p-2 rounded"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Provincia / Estado</label>
                <input 
                  required type="text" 
                  className="w-full input-dark p-2 rounded"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Código Postal</label>
                <input 
                  required type="text" 
                  className="w-full input-dark p-2 rounded"
                  // OJO: Aquí usamos zip_code
                  value={formData.zip_code}
                  onChange={e => setFormData({...formData, zip_code: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">País</label>
                <input 
                  required type="text" 
                  className="w-full input-dark p-2 rounded"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
                <input 
                  required type="tel" 
                  className="w-full input-dark p-2 rounded"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition">
              Guardar Dirección
            </button>
          </form>
        )}

        {/* LISTA */}
        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-20 text-gray-500">
            <p>No tienes direcciones guardadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-gray-950 border border-gray-800 p-5 rounded-xl hover:border-gray-600 transition group relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white text-lg">{addr.street}</p>
                    <p className="text-gray-400">{addr.city}, {addr.state} ({addr.zip_code})</p>
                    <p className="text-gray-500 text-sm uppercase mt-1">{addr.country}</p>
                    <p className="text-purple-400 text-sm mt-2">📞 {addr.phone}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(addr.id)}
                    className="text-gray-600 hover:text-red-500 transition p-2"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}