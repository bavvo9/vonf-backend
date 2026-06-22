// src/app/verify-email/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Componente interno para manejar la lógica de búsqueda
function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando tu cuenta...')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token no válido o expirado.')
      return
    }

    // Llamamos al Backend para verificar DE VERDAD
    // Nota: Aquí sí llamamos al puerto 3000 porque es la API
    fetch(`http://localhost:3000/auth/verify-email?token=${token}`, {
        method: 'GET', // O POST, según como lo tengas en tu backend (suele ser GET para links)
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Error al verificar')
        
        setStatus('success')
        setMessage('¡Correo verificado con éxito!')
        
        // Opcional: Redirigir automáticamente después de 3 segundos
        setTimeout(() => {
            router.push('/login')
        }, 3000)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'El enlace de verificación es inválido o ha expirado.')
      })
  }, [token, router])

  return (
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
      
      {status === 'loading' && (
        <>
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verificando...</h2>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta Activada!</h2>
          <p className="text-gray-600 mb-6">Ya puedes acceder a todos los servicios de VONF.</p>
          <Link href="/login" className="block w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition">
            Ir al Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hubo un problema</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/login" className="text-purple-600 font-bold hover:underline">
            Volver al inicio
          </Link>
        </>
      )}
    </div>
  )
}

// Página principal envuelta en Suspense (Obligatorio en Next.js para usar useSearchParams)
export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <VerifyContent />
      </Suspense>
    </main>
  )
}