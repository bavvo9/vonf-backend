'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth.service'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. LLAMADA CORRECTA: Pasamos un objeto, no argumentos sueltos
      const data = await authService.login({ email, password })
      
      // 2. VERIFICACIÓN: El backend devuelve 'accessToken', no 'token'
      if (data && data.accessToken && data.user) {
        
        // 3. ACTUALIZACIÓN DEL CONTEXTO
        login(data.accessToken, data.user)
        
        // Redirección
        if (data.user.role === 'admin') router.push('/admin')
        else router.push('/profile')
      } else {
        setError('Respuesta inválida del servidor')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Credenciales inválidas')
    } finally {
      setIsLoading(false)
    }
  }

  // Estilos High-End
  const inputClass = "w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors font-light text-sm tracking-wide"
  const labelClass = "block text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2"

  return (
    <div className="min-h-screen flex bg-black font-sans">
      
      {/* IZQUIERDA: VISUAL */}
      <div className="hidden lg:flex w-1/2 relative bg-[#050505] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black"></div>
          <div className="relative z-10 text-center p-12 border border-white/5 backdrop-blur-sm">
              <h2 className="text-7xl font-thin text-white tracking-tighter mb-4">VONF</h2>
              <div className="h-px w-20 bg-white/50 mx-auto mb-4"></div>
              <p className="text-gray-400 uppercase tracking-[0.4em] text-xs">Light & Design</p>
          </div>
      </div>

      {/* DERECHA: FORMULARIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-20 lg:px-32 py-20 relative bg-black">
          
          <div className="mb-16">
              <h1 className="text-4xl font-thin text-white tracking-tighter mb-2">
                  BIENVENIDO <span className="text-gray-600">.</span>
              </h1>
              <p className="text-gray-500 text-xs uppercase tracking-widest">
                  Accede a tu cuenta para continuar
              </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 w-full max-w-md">
              <div className="group">
                  <label className={labelClass}>Email</label>
                  <input 
                    type="email" required className={inputClass}
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
              </div>

              <div className="group">
                  <label className={labelClass}>Contraseña</label>
                  <input 
                    type="password" required className={inputClass}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
              </div>

              {error && (
                  <div className="p-4 border border-red-900/30 bg-red-900/5 text-red-400 text-xs uppercase tracking-widest text-center animate-pulse">
                      {error}
                  </div>
              )}

              <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-white text-black py-5 text-xs font-bold uppercase tracking-[0.25em] hover:bg-gray-200 transition disabled:opacity-50 relative overflow-hidden"
              >
                  {isLoading ? 'ACCEDIENDO...' : 'INGRESAR'}
              </button>

              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                  <span className="text-gray-600 text-xs">¿Nuevo aquí?</span>
                  <Link href="/register" className="text-white text-xs uppercase tracking-widest border-b border-transparent hover:border-white transition pb-1">
                      Crear Cuenta
                  </Link>
              </div>
          </form>
      </div>
    </div>
  )
}