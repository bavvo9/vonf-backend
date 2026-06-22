'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { settingsService } from '@/services/settings.service'

export default function Header() {
  const { user } = useAuth()
  //const { totalItems } = useCart()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    settingsService.getAll().then(settings => {
      const logo = settings.find(s => s.key === 'site_logo')
      if (logo?.value) setLogoUrl(logo.value)
    }).catch(console.error)
  }, [])

  return (
    <header 
      className={`fixed w-full z-50 top-0 transition-all duration-500 border-b border-transparent
      ${scrolled ? 'glass py-3' : 'bg-transparent py-6 border-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="group relative z-10 flex items-center">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="VONF"
              className={` w-auto object-contain transition-all duration-500 group-hover:scale-105
                ${scrolled ? 'h-12 md:h-14' : 'h-16 md:h-20'}
              `}
            />
          ) : (
            <span className="text-3xl font-light tracking-[0.2em] text-white group-hover:text-glow transition-all">
              VONF
            </span>
          )}
        </Link>

        {/* NAVEGACIÓN */}
        <nav className="flex items-center gap-8">
            <Link href="/products" className="hidden md:block text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                Colección
            </Link>

            <div className="flex items-center gap-6">
                
                {/* 2. Carrito */}
                {/*                
                <Link href="/cart" className="relative group">
                    <span className="text-gray-400 group-hover:text-white transition-colors text-sm uppercase tracking-widest">
                        Cart ({totalItems})
                    </span>
                </Link>
                 */} 

                {/* 3. Perfil (SIEMPRE visible si hay usuario) */}
                {user ? (
                    <Link href="/profile" 
                          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs text-white hover:bg-white/10 transition"
                          title="Mi Perfil"
                    >
                        {user.first_name?.charAt(0) || 'U'}
                    </Link>
                ) : (
                    <Link href="/login" className="text-sm uppercase tracking-widest text-white border border-white/20 px-5 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                        Login
                    </Link>
                )}

                {/* 1. Botón ADMIN (Solo visible si es admin) */}
                {user?.role === 'admin' && (
                    <Link href="/admin" className="text-[10px] uppercase tracking-widest text-gray-400 border border-gray-400 px-3 py-1 rounded  hover:text-white transition-colors">
                        Panel Admin
                    </Link>
                )}

            </div>
        </nav>
      </div>
    </header>
  )
}