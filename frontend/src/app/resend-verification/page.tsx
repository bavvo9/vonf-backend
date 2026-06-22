// src/app/resend-verification/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      // Nota: Verifica que esta sea la ruta correcta en tu backend (auth.routes.js)
      const res = await fetch('http://localhost:3000/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al enviar correo')

      setStatus('success')
      setMessage('Correo enviado. Revisa tu bandeja de entrada (y spam).')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Ocurrió un error.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full bg-gray-950 rounded-3xl shadow-2xl p-8 border border-gray-800 z-10 relative">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Reenviar Verificación</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">
          ¿No te llegó el correo? Ingresa tu email y te lo enviamos de nuevo.
        </p>

        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-900/30 text-green-400 p-4 rounded-xl mb-4 border border-green-900">
              ✅ {message}
            </div>
            <Link href="/login" className="block w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition">
              Ir al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-lg text-sm border border-red-900">
                ⚠️ {message}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tu Email</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-purple-500 hover:text-white transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando...' : 'ENVIAR CORREO'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-gray-500 text-sm hover:text-white transition">
            ← Volver al Login
          </Link>
        </div>
      </div>
    </main>
  )
}