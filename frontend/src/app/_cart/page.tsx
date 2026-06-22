'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { cart, removeFromCart, removeOneFromCart, addToCart, clearCart, total } = useCart()

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center px-4">
        <h1 className="text-4xl md:text-6xl font-thin text-white tracking-tighter mb-6">
          TU CARRO ESTÁ <span className="text-gray-600">VACÍO</span>
        </h1>
        <p className="text-gray-400 font-light mb-8">
          Parece que aún no has elegido tu luz.
        </p>
        <Link href="/products" className="px-8 py-4 border border-white/20 text-white hover:bg-white hover:text-black transition-all tracking-[0.2em] text-sm">
          EXPLORAR COLECCIÓN
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6"> {/* pt-32 para el header */}
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-4">
            <h1 className="text-3xl md:text-5xl font-light text-white tracking-tighter">
                SHOPPING <span className="text-gray-600">BAG</span>
            </h1>
            <button 
                onClick={clearCart} 
                className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors"
            >
                Vaciar Carrito
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* COLUMNA IZQUIERDA: LISTA DE PRODUCTOS */}
            <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                    <div key={item.id} className="glass p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-white/20 transition-all">
                        
                        {/* Imagen */}
                        <div className="w-24 h-24 bg-white/5 rounded-sm flex items-center justify-center p-2 shrink-0 overflow-hidden relative">
                            {item.image_url ? (
                                <img 
                                    src={item.image_url} 
                                    alt={item.name} 
                                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                                />
                            ) : (
                                /* Placeholder si no hay imagen (evita el error de src="") */
                                <span className="text-gray-700 text-xs text-center uppercase">Sin Foto</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-white text-lg font-light tracking-wide">{item.name}</h3>
                            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Neon LED Art</p>
                        </div>

                        {/* Controles de Cantidad */}
                        <div className="flex items-center gap-4 border border-white/10 rounded-full px-4 py-2">
                            <button 
                                onClick={() => removeOneFromCart(item.id)}
                                className="text-gray-400 hover:text-white transition w-4"
                            >
                                -
                            </button>
                            <span className="text-white font-mono text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                                onClick={() => addToCart(item)} // Ya tiene tu validación de stock
                                className="text-gray-400 hover:text-white transition w-4"
                            >
                                +
                            </button>
                        </div>

                        {/* Precio */}
                        <div className="w-24 text-right">
                             <p className="text-white font-light text-lg">${item.price * item.quantity}</p>
                             {item.quantity > 1 && (
                                 <p className="text-gray-600 text-xs">${item.price} c/u</p>
                             )}
                        </div>

                        {/* Eliminar (X sutil) */}
                        <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-600 hover:text-red-500 transition ml-2"
                            title="Eliminar producto"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* COLUMNA DERECHA: RESUMEN (Sticky) */}
            <div className="lg:col-span-1">
                <div className="glass p-8 sticky top-32">
                    <h3 className="text-white uppercase tracking-[0.2em] text-sm mb-8 border-b border-white/10 pb-4">
                        Resumen de Orden
                    </h3>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-gray-400 text-sm font-light">
                            <span>Subtotal ({cart.reduce((a,c) => a + c.quantity, 0)} items)</span>
                            <span>${total}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm font-light">
                            <span>Envío</span>
                            <span className="text-xs">Calculado en el checkout</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/10 pt-6 mb-8">
                        <span className="text-white text-lg font-normal">Total</span>
                        <span className="text-2xl text-white font-light tracking-tight">${total}</span>
                    </div>

                    <Link 
                        href="/checkout"
                        className="block w-full bg-white text-black text-center py-4 text-sm font-bold tracking-[0.2em] hover:bg-gray-200 transition-colors"
                    >
                        CONTINUAR COMPRA
                    </Link>
                    
                    <p className="text-center text-gray-600 text-[10px] mt-4 uppercase tracking-wider">
                        Pagos seguros encriptados
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}