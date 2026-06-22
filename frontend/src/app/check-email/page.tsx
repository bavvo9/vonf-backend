'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

// Componente interno para usar useSearchParams de forma segura
function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="w-full max-w-lg p-12 border border-white/10 bg-[#050505] backdrop-blur-sm text-center relative overflow-hidden group">
        
        {/* Efecto Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-900/20 blur-[100px] group-hover:bg-purple-900/30 transition duration-1000"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-900/20 blur-[100px] group-hover:bg-blue-900/30 transition duration-1000"></div>

        <div className="relative z-10">
            <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <span className="text-3xl">✉️</span>
            </div>

            <h1 className="text-3xl font-thin text-white tracking-tighter mb-4">
                VERIFICA TU <span className="text-gray-600">EMAIL</span>
            </h1>

            <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed mb-8">
                Hemos enviado un enlace de confirmación a:
                <br/>
                <span className="text-white font-bold mt-2 border-b border-white/20 pb-1 inline-block">
                    {email || 'tu correo electrónico'}
                </span>
            </p>

            <p className="text-[10px] text-gray-600 mb-10">
                Revisa tu bandeja de entrada (y spam) para activar tu cuenta.
            </p>

            <div className="flex flex-col gap-4">
                <Link 
                    href="/login" 
                    className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-gray-200 transition"
                >
                    Ir al Login
                </Link>
                
                <Link 
                    href={email ? `/resend-verification?email=${encodeURIComponent(email)}` : '/resend-verification'}
                    className="text-gray-500 text-[10px] uppercase tracking-widest hover:text-white transition"
                >
                    ¿No recibiste el email? Reenviar
                </Link>
            </div>
        </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
       <Suspense fallback={<div className="text-white">Cargando...</div>}>
          <VerifyContent />
       </Suspense>
    </div>
  )
}