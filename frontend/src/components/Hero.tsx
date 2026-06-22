'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { settingsService } from '@/services/settings.service'

// Imágenes por si la base de datos llega a fallar o no está lista
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1920&q=80'
]

export default function Hero() {
  const [heroTitle, setHeroTitle] = useState('LUZ QUE DEFINE ESPACIOS')
  const [heroSubtitle, setHeroSubtitle] = useState('Diseño exclusivo. Acabados en acrílico.')
  const [carouselImages, setCarouselImages] = useState<string[]>(FALLBACK_IMAGES)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Carga de configuraciones desde site_settings de Neon
  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const settings = await settingsService.getAll()
        
        const titleSetting = settings.find((s: any) => s.key === 'hero_title')
        const subtitleSetting = settings.find((s: any) => s.key === 'hero_subtitle')
        const imagesSetting = settings.find((s: any) => s.key === 'hero_carousel_images')

        if (titleSetting?.value) setHeroTitle(titleSetting.value)
        if (subtitleSetting?.value) setHeroSubtitle(subtitleSetting.value)
        
        // Parseamos el JSON guardado en el value del carrusel
        if (imagesSetting?.value) {
          try {
            const parsedImages = JSON.parse(imagesSetting.value)
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              setCarouselImages(parsedImages)
            }
          } catch (e) {
            console.error('Error parseando el JSON de imágenes del Hero:', e)
          }
        }
      } catch (error) {
        console.error('Error cargando los textos dinámicos del Hero:', error)
      }
    }
    fetchHeroSettings()
  }, [])

  // Rotación automática del carrusel (basado en la cantidad real N de imágenes de la DB)
  useEffect(() => {
    if (carouselImages.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [carouselImages])

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gray-950">      
      
      {/* --- CARRUSEL DINÁMICO DESDE DB --- */}
      <div className="absolute inset-0 z-0">
        {carouselImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-25' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {/* Burbujas Neón */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Rejilla Cyberpunk */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[40px_40px]"></div>
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-gray-950/50 to-gray-950 z-10"></div>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto mt-12">
        <div className="inline-block mb-6 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <span className="text-xs uppercase tracking-[0.3em] text-gray-300">Premium Led Signs</span>
        </div>

        <h1 
          className="text-4xl md:text-7xl font-thin text-white tracking-tighter mb-6 drop-shadow-2xl uppercase leading-tight"
          dangerouslySetInnerHTML={{ __html: heroTitle }}
        />

        <p className="text-gray-400 text-sm md:text-lg tracking-wide max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          {heroSubtitle}
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link href="/products" className="px-8 py-4 bg-white text-black min-w-50 transition-all hover:bg-gray-200 text-center text-sm font-bold tracking-[0.2em]">
            VER COLECCIÓN
          </Link>
          <a href="#form" className="px-8 py-4 border border-white/30 text-white min-w-50 hover:bg-white/5 transition-all text-center text-sm tracking-[0.2em] font-light">
            PERSONALIZAR
          </a>
        </div>
      </div>

      {/* Indicadores Dinámicos N */}
      {carouselImages.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentSlide ? 'bg-purple-500 w-4' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40 z-20">
        <div className="w-px h-12 bg-linear-to-b from-transparent via-white to-transparent"></div>
      </div>
    </section>
  )
}