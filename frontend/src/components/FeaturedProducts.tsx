'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { productService } from '@/services/product.service'
import { Product } from '@/types'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getAll()
        
        // 👇 SOLUCIÓN: Verificamos qué llegó antes de usar .slice
        let list: Product[] = []
        
        if (Array.isArray(response)) {
            list = response
        } else if (response && Array.isArray(response.results)) {
            list = response.results
        }

        //FILTRO DOBLE: Que sea activo (is_active) Y tomamos los primeros 3
        const activeList = list.filter(p => p.is_active);
        setProducts(activeList.slice(0, 3));

        // Solo tomamos los primeros 3 si hay datos
      } catch (error) {
        console.error(error)
      }
    }
    loadProducts()
  }, [])

  return (
    <section className="py-32 px-6 relative">
        {/* Título de Sección Minimalista */}
        <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4">
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-tighter">
                Selected <span className="text-gray-600">Works</span>
            </h2>
            <Link 
                href="/products" 
                className="px-6 py-3 border border-white/20 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all mt-4 md:mt-0"
            >
                Ver catálogo completo
            </Link>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group">
                {/* TARJETA DE CRISTAL */}
                <div className="glass h-112.5 rounded-sm relative overflow-hidden group">

                  {/* Imagen */}
                  <div className="h-full pb-24 p-8 flex items-center justify-center">
                    <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-105">
                      
                      {/* Glow */}
                      <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Info abajo */}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-linear-to-t from-black/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-lg text-white font-light tracking-wide">{product.name}</h3>
                        <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Neon LED</p>
                      </div>
                    </div>
                  </div>

                </div>
            </Link>
            ))}
        </div>
    </section>
  )
}