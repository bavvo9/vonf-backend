'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Link from 'next/link'

import { authService } from '@/services/auth.service' // Ajustá esta ruta si es necesario



export default function RegisterPage() {

  const router = useRouter()

  const [formData, setFormData] = useState({

    first_name: '',

    last_name: '',

    email: '',

    password: ''

  })

  const [error, setError] = useState('')

  const [isLoading, setIsLoading] = useState(false)



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setFormData({ ...formData, [e.target.name]: e.target.value })

  }



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    setError('')

    setIsLoading(true)



    try {

      // Llamamos a tu auth.service.ts, que a su vez llama al auth.controller.js

      await authService.register(formData)

     

      // Si todo sale bien, lo mandamos a la pantalla que movimos en el Paso 1

      router.push(`/check-email?email=${encodeURIComponent(formData.email)}`)

    } catch (err: any) {

      setError(err.message || 'Error al registrar el usuario')

    } finally {

      setIsLoading(false)

    }

  }



  return (

    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden group">

      {/* Efectos Glow tipo Neon para VONF */}

      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-900/20 blur-[120px] transition duration-1000"></div>

      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-900/20 blur-[120px] transition duration-1000"></div>



      <div className="w-full max-w-md p-10 border border-white/10 bg-[#050505] backdrop-blur-md relative z-10">

        <h1 className="text-3xl font-thin text-white tracking-tighter mb-2 text-center">

          CREAR <span className="text-gray-500">CUENTA</span>

        </h1>

        <p className="text-gray-500 text-xs text-center uppercase tracking-widest mb-8">Únete a VONF</p>



        {error && (

          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 mb-6 rounded text-center">

            {error}

          </div>

        )}



        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="flex gap-4">

            <input

              type="text"

              name="first_name"

              placeholder="NOMBRE"

              required

              onChange={handleChange}

              className="w-1/2 bg-transparent border-b border-white/20 text-white text-xs p-3 outline-none focus:border-white transition uppercase tracking-widest"

            />

            <input

              type="text"

              name="last_name"

              placeholder="APELLIDO"

              required

              onChange={handleChange}

              className="w-1/2 bg-transparent border-b border-white/20 text-white text-xs p-3 outline-none focus:border-white transition uppercase tracking-widest"

            />

          </div>



          <input

            type="email"

            name="email"

            placeholder="CORREO ELECTRÓNICO"

            required

            onChange={handleChange}

            className="w-full bg-transparent border-b border-white/20 text-white text-xs p-3 outline-none focus:border-white transition tracking-widest"

          />



          <input

            type="password"

            name="password"

            placeholder="CONTRASEÑA"

            required

            onChange={handleChange}

            className="w-full bg-transparent border-b border-white/20 text-white text-xs p-3 outline-none focus:border-white transition tracking-widest"

          />



          <button

            type="submit"

            disabled={isLoading}

            className="mt-6 w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-gray-200 transition disabled:opacity-50"

          >

            {isLoading ? 'Registrando...' : 'Registrarse'}

          </button>

        </form>



        <div className="mt-8 text-center">

          <Link href="/login" className="text-gray-500 text-[10px] uppercase tracking-widest hover:text-white transition">

            ¿Ya tenés cuenta? Iniciar Sesión

          </Link>

        </div>

      </div>

    </div>

  )

}