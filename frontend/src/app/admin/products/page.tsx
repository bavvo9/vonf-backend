'use client'

import { useState, useEffect } from 'react'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import ProductForm from '@/components/ProductForm' // 👈 Asegúrate de importar el Form
import { Product } from '@/types' 

export default function AdminProductsPage() {
  const authFetch = useAuthFetch()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // ESTADOS DEL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Cargar productos
  const loadProducts = () => {
    setLoading(true)
    authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/products`)
      .then(res => res ? res.json() : [])
      .then(data => setProducts(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : [])))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [authFetch])

  // --- LÓGICA DE TOGGLES (Activar/Destacar) ---
  const handleToggle = async (id: number, field: 'is_active' | 'is_featured', currentValue: boolean) => {
    // 1. Optimismo en UI
    setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, [field]: !currentValue } : p
    ))

    try {
        // 2. Envío al Backend
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/products/${id}`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: !currentValue }) 
        })

        if (!res || !res.ok) throw new Error('Falló actualización')

    } catch (error) {
        console.error(error)
        alert("Error al actualizar. Revirtiendo...")
        // Rollback
        setProducts(prev => prev.map(p => 
            p.id === id ? { ...p, [field]: currentValue } : p
        ))
    }
  }

  // --- LÓGICA DEL MODAL ---
  const handleCreate = () => {
      setEditingProduct(null)
      setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
      setEditingProduct(product)
      setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
      if(!confirm("¿Eliminar producto?")) return;
      try {
          const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/products/${id}`, {
              method: 'DELETE'
          })
          if(!res || !res.ok) setProducts(prev => prev.filter(p => p.id !== id))
      } catch (error) { alert("Error al eliminar") }
  }

  if (loading && products.length === 0) return <div className="p-32 text-white animate-pulse">Cargando catálogo...</div>

  return (
    // 👇 FIX: pt-32 para que el Header no tape el contenido
    <div className="min-h-screen bg-black px-6 md:px-10 pb-20 pt-22">
      
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-thin text-white tracking-tighter">
            GESTIÓN DE <span className="text-gray-500">PRODUCTOS</span>
          </h1>
          <button 
            onClick={handleCreate}
            className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition"
          >
            + Nuevo Producto
          </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-black/50 text-gray-200 uppercase font-light text-[10px] tracking-widest border-b border-white/10">
                <tr>
                    <th className="p-4">Imagen</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Destacado</th>
                    <th className="p-4 text-center">Activo</th>
                    <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                <tr key={product.id} className={`transition ${!product.is_active ? 'opacity-50 grayscale' : 'hover:bg-white/5'}`}>
                    <td className="p-4">
                        <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center p-1">
                             {product.image_url ? (
                                 <img src={product.image_url} alt="" className="w-full h-full object-contain" />
                             ) : <span className="text-[8px]">N/A</span>}
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="text-white font-medium">{product.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase">ID: {product.id}</div>
                    </td>
                    <td className="p-4 font-mono text-white">${product.price}</td>
                    <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded border 
                             ${(product.stock || 0) > 0 ? 'border-gray-700 text-gray-300' : 'border-red-900 text-red-400'}`}>
                            {product.stock || 0}
                        </span>
                    </td>

                    {/* TOGGLE: FEATURED (is_featured) */}
                    <td className="p-4 text-center">
                        <button 
                            onClick={() => handleToggle(product.id, 'is_featured', !!product.is_featured)}
                            className={`w-8 h-4 rounded-full relative transition-colors duration-300 focus:outline-none
                                ${product.is_featured ? 'bg-purple-600' : 'bg-gray-800 border border-gray-600'}
                            `}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300
                                ${product.is_featured ? 'translate-x-4' : 'translate-x-0'}
                            `} />
                        </button>
                    </td>

                    {/* TOGGLE: ACTIVE (is_active) */}
                    <td className="p-4 text-center">
                        <button 
                            onClick={() => handleToggle(product.id, 'is_active', !!product.is_active)}
                            className={`w-8 h-4 rounded-full relative transition-colors duration-300 focus:outline-none
                                ${product.is_active ? 'bg-green-600' : 'bg-gray-800 border border-gray-600'}
                            `}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300
                                ${product.is_active ? 'translate-x-4' : 'translate-x-0'}
                            `} />
                        </button>
                    </td>

                    <td className="p-4 text-right space-x-4">
                        {/* BOTÓN EDITAR QUE ABRE MODAL */}
                        <button 
                            onClick={() => handleEdit(product)}
                            className="text-xs text-white hover:text-purple-400 uppercase tracking-wider font-bold"
                        >
                            Editar
                        </button>
                        
                        <button 
                            onClick={() => handleDelete(product.id)}
                            className="text-xs text-red-500 hover:text-red-400 uppercase tracking-wider"
                        >
                            ✕
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* --- EL MODAL FLOTANTE --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/20 shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <ProductForm 
                    productToEdit={editingProduct} 
                    onSuccess={() => {
                        setIsModalOpen(false)
                        loadProducts()
                    }} 
                    onCancel={() => setIsModalOpen(false)} 
                  />
              </div>
          </div>
      )}

    </div>
  )
}