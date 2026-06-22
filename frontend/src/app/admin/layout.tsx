'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menuItems = [
    { name: '📍 Panel General', path: '/admin' },
    { name: '✨ Productos', path: '/admin/products' },
    { name: '🎨 Personalizados', path: '/admin/custom' },
    { name: '⚙️ Configuraciones', path: '/admin/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans">
      
      {/* --- SIDEBAR MINIMALISTA --- */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-6">
        <div>
          {/* Logo Corporativo */}
          <div className="mb-10 px-2">
            <h1 className="text-xl font-light tracking-[0.25em] text-white">
              VONF <span className="text-xs font-semibold text-purple-500 tracking-normal ml-1">ADMIN</span>
            </h1>
            <p className="text-[10px] text-gray-500 tracking-wider uppercase mt-1">Control de catálogo</p>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 border rounded-none ${
                    isActive
                      ? 'bg-gray-800 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="border-t border-gray-800 pt-4 text-center">
          <Link 
            href="/" 
            className="text-xs text-gray-500 hover:text-purple-400 transition-colors tracking-wide uppercase"
          >
            ← Volver a la web
          </Link>
        </div>
      </aside>

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <main className="flex-1 bg-gray-950 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}