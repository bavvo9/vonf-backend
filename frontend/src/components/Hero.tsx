'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { settingsService } from '@/services/settings.service'

export default function Hero() {
  const [heroTitle, setHeroTitle] = useState('LUZ QUE DEFINE ESPACIOS')
  const [heroSubtitle, setHeroSubtitle] = useState('Diseño exclusivo. Acabados en acrílico. La fusión perfecta entre arte digital y artesanía tradicional.')

  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const settings = await settingsService.getAll()
        
        // Buscamos las claves en el array que devuelve el backend
        const titleSetting = settings.find((s: any) => s.key === 'hero_title')
        const subtitleSetting = settings.find((s: any) => s.key === 'hero_subtitle')

        if (titleSetting?.value) setHeroTitle(titleSetting.value)
        if (subtitleSetting?.value) setHeroSubtitle(subtitleSetting.value)
      } catch (error) {
        console.error('Error cargando los textos dinámicos del Hero:', error)
      }
    }
    fetchHeroSettings()
  }, [])

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">      
      {/* --- FONDO ANIMADO --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/5 z-10" />
        
        {/* BURBUJAS DE COLOR */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Rejilla Cyberpunk */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-size-[40px_40px]"></div>
        
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
        <div className="w-full h-full bg-linear-to-b from-gray-900 to-black animate-pulse opacity-20"></div>
      </div>

      {/* CONTENIDO */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto mt-20">
        
        {/* Badge superior */}
        <div className="inline-block mb-6 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-300">
                Premium Led Signs
            </span>
        </div>

        {/* Título Principal Dinámico (Soporta etiquetas <br/> si las pones en la DB) */}
        <h1 
          className="text-4xl md:text-7xl font-thin text-white tracking-tighter mb-6 drop-shadow-2xl uppercase leading-tight"
          dangerouslySetInnerHTML={{ __html: heroTitle }}
        />

        {/* Subtítulo Dinámico */}
        <p className="text-gray-400 text-sm md:text-lg tracking-wide max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          {heroSubtitle}
        </p>

        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link href="/products" className="group relative px-8 py-4 bg-white text-black min-w-50 transition-all hover:bg-gray-200 text-center">
            <span className="relative z-10 text-sm font-bold tracking-[0.2em]">VER COLECCIÓN</span>
          </Link>

          <a href="#form" className="group relative px-8 py-4 border border-white/30 text-white min-w-50 hover:bg-white/5 transition-all text-center">
             <span className="text-sm tracking-[0.2em] font-light group-hover:text-glow">PERSONALIZAR</span>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-px h-16 bg-linear-to-b from-transparent via-white to-transparent"></div>
      </div>
    </section>
  )
}