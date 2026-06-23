'use client'
import React, { useState, useEffect } from 'react'
import { settingsService, SiteSetting } from '@/services/settings.service'
import { useAuth } from '@/context/AuthContext' // Importamos tu contexto de autenticación para sacar el token

export default function AdminSettingsPage() {
  const { token } = useAuth() // Obtenemos el token real del administrador logueado
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [carouselImages, setCarouselImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)

  // 1. Cargar las configuraciones desde el Backend
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsService.getAll()
        setSettings(data)

        // Buscamos la clave del carrusel mapeando con el tipo correcto
        const carouselData = data.find((s: SiteSetting) => s.key === 'hero_carousel_images')
        if (carouselData?.value) {
          try {
            const parsed = JSON.parse(carouselData.value)
            if (Array.isArray(parsed)) setCarouselImages(parsed)
          } catch (e) {
            console.error('Error parseando JSON inicial de imágenes:', e)
          }
        }
      } catch (err) {
        console.error('Error cargando configuraciones:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  // 2. Manejar cambios en inputs de texto tradicionales
  const handleTextChange = (key: string, newValue: string) => {
    setSettings(prev =>
      prev.map(item => (item.key === key ? { ...item, value: newValue } : item))
    )
  }

  // 3. Guardar una configuración individual en la DB usando la firma real (key, data, token)
  const saveSetting = async (key: string, finalValue: any) => {
    setUpdatingKey(key)
    try {
      // Si finalValue es un array (como el carrusel), lo pasamos a string JSON antes de mandarlo
      const payload = Array.isArray(finalValue) ? JSON.stringify(finalValue) : finalValue
      
      // Llamada exacta a tu servicio: key, data (string), token
      await settingsService.update(key, payload, token || '')
      
      alert(`✨ Configuración "${key}" actualizada con éxito.`)
    } catch (err) {
      alert('Error al guardar los cambios en el servidor.')
    } finally {
      setUpdatingKey(null)
    }
  }

  // 4. Funciones específicas para el gestor del Carrusel (Array N)
  const addCarouselImage = () => {
    if (!newImageUrl.trim()) return
    if (!newImageUrl.startsWith('http')) {
      alert('Por favor, ingresá una URL válida (que empiece con http o https)')
      return
    }
    const updatedImages = [...carouselImages, newImageUrl.trim()]
    setCarouselImages(updatedImages)
    setNewImageUrl('')
    saveSetting('hero_carousel_images', updatedImages)
  }

  const removeCarouselImage = (indexToRemove: number) => {
    const updatedImages = carouselImages.filter((_, index) => index !== indexToRemove)
    setCarouselImages(updatedImages)
    saveSetting('hero_carousel_images', updatedImages)
  }

  if (loading) {
    return <div className="text-center text-gray-500 py-20 animate-pulse uppercase tracking-widest text-xs">Cargando site_settings...</div>
  }

  const heroTitle = settings.find(s => s.key === 'hero_title')
  const heroSubtitle = settings.find(s => s.key === 'hero_subtitle')
  const whatsappNum = settings.find(s => s.key === 'whatsapp_number')
  const whatsappMsg = settings.find(s => s.key === 'whatsapp_message')

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-thin tracking-wider text-white uppercase">⚙️ Configuraciones Globales</h2>
        <p className="text-xs text-gray-500 mt-1">Controla los textos, imágenes de fondo y enlaces de contacto de tu catálogo institucional.</p>
      </div>

      {/* --- CONTENIDO DEL HERO --- */}
      <section className="bg-gray-900 border border-gray-800 p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase border-b border-gray-800 pb-2">Contenido Principal (Hero)</h3>
        
        {heroTitle && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">{heroTitle.label || 'Título del Hero'}</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={heroTitle.value} 
                onChange={(e) => handleTextChange('hero_title', e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 px-4 py-3 text-sm text-white focus:outline-hidden focus:border-purple-500 transition-colors"
              />
              <button 
                onClick={() => saveSetting('hero_title', heroTitle.value)}
                disabled={updatingKey === 'hero_title'}
                className="px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold tracking-widest uppercase transition-colors"
              >
                {updatingKey === 'hero_title' ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">{heroTitle.description}</p>
          </div>
        )}

        {heroSubtitle && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">{heroSubtitle.label || 'Subtítulo del Hero'}</label>
            <div className="flex gap-4">
              <textarea 
                rows={2}
                value={heroSubtitle.value} 
                onChange={(e) => handleTextChange('hero_subtitle', e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 p-4 text-sm text-white focus:outline-hidden focus:border-purple-500 transition-colors resize-none"
              />
              <button 
                onClick={() => saveSetting('hero_subtitle', heroSubtitle.value)}
                disabled={updatingKey === 'hero_subtitle'}
                className="px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold tracking-widest uppercase transition-colors h-12 self-end"
              >
                {updatingKey === 'hero_subtitle' ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* --- GESTOR DINÁMICO DEL CARRUSEL --- */}
      <section className="bg-gray-900 border border-gray-800 p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase border-b border-gray-800 pb-2">Imágenes del Carrusel de Fondo</h3>
        
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Agregar imagen al carrusel</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Pegá la URL de la imagen..."
              value={newImageUrl} 
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 bg-gray-950 border border-gray-800 px-4 py-3 text-sm text-white focus:outline-hidden focus:border-purple-500 transition-colors"
            />
            <button 
              onClick={addCarouselImage}
              className="px-6 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold tracking-widest uppercase transition-colors border border-gray-700"
            >
              + Añadir
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Imágenes activas ({carouselImages.length})</label>
          
          {carouselImages.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No hay imágenes en el carrusel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carouselImages.map((url, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-950 p-3 border border-gray-800 group relative">
                  <div 
                    className="w-16 h-10 bg-cover bg-center bg-gray-900 border border-gray-800 shrink-0"
                    style={{ backgroundImage: `url(${url})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate tracking-tight">{url}</p>
                    <p className="text-[10px] text-purple-500 uppercase mt-0.5 font-mono">Index: {idx}</p>
                  </div>
                  <button 
                    onClick={() => removeCarouselImage(idx)}
                    className="text-gray-500 hover:text-red-400 p-2 transition-colors text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- DATOS DE WHATSAPP --- */}
      <section className="bg-gray-900 border border-gray-800 p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase border-b border-gray-800 pb-2">Canal de Contacto (WhatsApp)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {whatsappNum && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">{whatsappNum.label || 'Número de WhatsApp'}</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={whatsappNum.value} 
                  onChange={(e) => handleTextChange('whatsapp_number', e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-purple-500 transition-colors font-mono"
                />
                <button 
                  onClick={() => saveSetting('whatsapp_number', whatsappNum.value)}
                  className="px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Ok
                </button>
              </div>
            </div>
          )}

          {whatsappMsg && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">{whatsappMsg.label || 'Mensaje Predeterminado'}</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={whatsappMsg.value} 
                  onChange={(e) => handleTextChange('whatsapp_message', e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-purple-500 transition-colors"
                />
                <button 
                  onClick={() => saveSetting('whatsapp_message', whatsappMsg.value)}
                  className="px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Ok
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}