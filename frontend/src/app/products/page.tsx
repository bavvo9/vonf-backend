'use client'

import { useEffect, useState } from 'react'
import { productService } from '@/services/product.service'
//import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { Product } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  //const { addToCart } = useCart()

  useEffect(() => {
    productService.getAll()
      .then(data => {
        // 👇 FIX: Verificamos qué nos llegó
        if (data.results && Array.isArray(data.results)) {
            //FILTRO: Solo mostramos los que tienen is_active = true
            const activeProducts = data.results.filter((p: any) => p.is_active);
            setProducts(activeProducts);
        } else {
            // Caso D: Error o formato desconocido
            console.error("Formato de productos desconocido:", data);
            setProducts([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Componente de Carga (Skeleton Minimalista)
  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-96 bg-white/5 animate-pulse rounded-sm border border-white/10" />
           ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 relative">
      
      {/* Título de Sección */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6">
        <div>
            <h1 className="text-4xl md:text-6xl font-thin text-white tracking-tighter">
              COLECCIÓN <span className="text-gray-600">2026</span>
            </h1>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mt-4 md:mt-0">
          {products.length} Piezas Únicas
        </p>
      </div>

      {/* Grilla de Productos */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group relative bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500 overflow-hidden flex flex-col"
          >
            {/* Efecto Glow en Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Link a Detalle (Imagen) */}
            <Link href={`/products/${product.id}`} className="relative p-4">
              
              <div className="relative w-full aspect-[4/3] flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="max-w-full max-h-full object-contain
                              drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]
                              group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <span className="text-gray-700 text-xs uppercase">Sin Imagen</span>
                )}

                {/* Badge de Stock Bajo */}
                {product.stock > 0 && product.stock < 3 && (
                  <span className="absolute top-3 right-3 text-[10px] text-red-400 uppercase tracking-widest border border-red-900/30 px-2 py-1 bg-black/50 backdrop-blur-md">
                    Últimas {product.stock}
                  </span>
                )}

                {/* Badge de Agotado */}
                {(!product.stock || product.stock === 0) && (
                  <span className="absolute top-3 right-3 text-[10px] text-gray-500 uppercase tracking-widest border border-gray-800 px-2 py-1 bg-black/80">
                    Agotado
                  </span>
                )}
              </div>

            </Link>

            {/* Panel de Info (Inferior) */}
            <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Link href={`/products/${product.id}`}>
                            <h3 className="text-white text-base font-light tracking-wide hover:text-gray-300 transition">
                                {product.name}
                            </h3>
                        </Link>
                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-1">Neon Art</p>
                    </div>
                    <span className="text-white font-light text-lg tracking-tight">
                        ${product.price}
                    </span>
                </div>

                {/* Botón de Ver Detalles */}
              <Link
                  href={`/products/${product.id}`}
                  className="w-full inline-block text-center py-2.5 border border-white/20 text-white text-[11px] font-bold tracking-[0.2em] hover:bg-white hover:text-black hover:border-white transition-all"
              >
                  VER MODELO →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}