'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { productService } from '@/services/product.service'
//import { useCart } from '@/context/CartContext'
import { Product } from '@/types'

export default function ProductDetailPage() {
  const { id } = useParams()
  //const { addToCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0) // Por si en el futuro tienes galería

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(String(id))
        setProduct(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-light tracking-widest animate-pulse">CARGANDO LUZ...</div>

  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Producto no encontrado</div>

  // Cálculo de stock para mostrar mensajes sutiles
  const isLowStock = product.stock && product.stock < 3 && product.stock > 0;

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden pt-20">
        
        {/* Fondo Ambiental (Glow del color del neón, opcional) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* COLUMNA IZQUIERDA: CARRUSEL VISUAL */}
            <div className="flex flex-col space-y-4 group">
                {/* Contenedor de la Imagen Principal Activa */}
                <div className="relative z-10 w-full aspect-square flex items-center justify-center p-8 glass rounded-sm border border-white/5 overflow-hidden">
                    {/* Efecto Glow ambiental de fondo */}
                    <div className="absolute inset-0 bg-white/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full" />
                    
                    <img 
                        src={
                            // Si en el futuro tenés un array product.images, usa el índice activo; si no, el image_url base
                            (product as any).images && (product as any).images.length > 0 
                                ? (product as any).images[activeImage] 
                                : product.image_url
                        } 
                        alt={product.name} 
                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-700 transform group-hover:scale-105"
                    />
                </div>

                {/* Selectores de Miniaturas (Carrusel) - Solo se muestran si hay más de una imagen */}
                {(product as any).images && (product as any).images.length > 1 && (
                    <div className="flex gap-3 justify-center">
                        {(product as any).images.map((img: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => setActiveImage(index)}
                                className={`w-16 h-16 p-2 glass border transition-all duration-300 rounded-sm flex items-center justify-center
                                    ${activeImage === index ? 'border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 hover:border-white/30'}
                                `}
                            >
                                <img src={img} alt={`${product.name} - ${index}`} className="max-w-full max-h-full object-contain" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* COLUMNA DERECHA: INFO Y COMPRA */}
            <div className="flex flex-col justify-center space-y-10">
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 border border-white/20 rounded-full text-[10px] uppercase tracking-[0.2em] text-gray-300">
                            Neon Led Series
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-thin text-white tracking-tighter">
                        {product.name}
                    </h1>

                    
                {/* Texto que invita a cotizar en lugar de mostrar precio */}
                    <p className="text-sm text-gray-400 font-light tracking-widest uppercase">
                        Diseño bajo pedido • <span className="text-white animate-pulse">Consultar cotización</span>
                    </p>
                </div>

                <div className="prose prose-invert space-y-4">
                    <p className="text-gray-300 font-light leading-relaxed text-sm md:text-base max-w-md">
                        {product.description || "Pieza lumínica de diseño exclusivo fabricada con tecnología Neon LED de alta eficiencia."}
                    </p>
                </div>

                {/* Detalles de Calidad y Personalización */}
                <div className="border-t border-white/10 pt-8 space-y-3 max-w-md">
                    <div className="flex items-start gap-3">
                        <span className="text-white/40 text-xs mt-0.5">✓</span>
                        <p className="text-xs text-gray-400 font-light">Presupuestos a medida según dimensiones, tipografía y complejidad del diseño.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-white/40 text-xs mt-0.5">✓</span>
                        <p className="text-xs text-gray-400 font-light">Base de acrílico de alta transparencia mecanizada con tecnología CNC.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-white/40 text-xs mt-0.5">✓</span>
                        <p className="text-xs text-gray-400 font-light">Brillo continuo regulable de alta eficiencia. Incluye transformador de 12V y kit completo de instalación.</p>
                    </div>
                </div>


                {/* ACCIONES */}
                <div className="pt-4">
                    <a 
                        href={`https://wa.me/5493412285494?text=Hola!%20Me%20interesa%20el%20modelo%20${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-block text-center bg-white text-black px-12 py-5 text-sm font-bold tracking-[0.25em] hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-95"
                    >
                        CONSULTAR POR WHATSAPP
                    </a>
                    
                    <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest">
                        Diseños a medida • Envío asegurado a todo el país • Garantía 6 meses
                    </p>
                </div>

            </div>
        </div>
    </div>
  )
}