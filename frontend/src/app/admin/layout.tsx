'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login') // Echar a los intrusos
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !isAuthorized) return <div className="bg-black h-screen text-white flex items-center justify-center">Verificando acceso...</div>

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 fixed h-full p-6">
        <h2 className="text-2xl font-bold text-purple-500 mb-10 tracking-tighter">VONF ADMIN</h2>
        
        <nav className="space-y-2">
          <NavLink href="/admin">📊 Dashboard</NavLink>
          <NavLink href="/admin/products">📦 Productos</NavLink>
          <NavLink href="/admin/orders">🛒 Pedidos</NavLink>
          <NavLink href="/admin/custom">⚡ Personalizados</NavLink>
          <NavLink href="/admin/settings"> Configuraciones </NavLink>
          <div className="pt-8 border-t border-gray-800 mt-8">
            <Link href="/" className="text-gray-500 hover:text-white flex items-center gap-2">
              ⬅ Volver a la Tienda
            </Link>
          </div>
        </nav>
      </aside>

      {/* ─── CONTENIDO PRINCIPAL ─── */}
      <main className="ml-64 flex-1 p-8 bg-black">
        {children}
      </main>
    </div>
  )
}

// Componente auxiliar para links activos
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-4 py-3 rounded-xl text-gray-400 hover:bg-purple-900/20 hover:text-purple-400 transition font-medium">
      {children}
    </Link>
  )
}