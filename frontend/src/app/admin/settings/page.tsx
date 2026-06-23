'use client'
import React, { useState, useEffect, useRef } from 'react'
import { settingsService, SiteSetting } from '@/services/settings.service'
import { useAuth } from '@/context/AuthContext'

export default function AdminSettingsPage() {
  const { token } = useAuth()
  const carouselFileInputRef = useRef<HTMLInputElement>(null)
  const formFileInputRef = useRef<HTMLInputElement>(null)
  
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [carouselImages, setCarouselImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const [uploadingCarousel, setUploadingCarousel] = useState(false)
  const [uploadingFormImg, setUploadingFormImg] = useState(false)

  // 1. Cargar todas las configuraciones de la base de datos
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsService.getAll()
        setSettings(data)

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
        console.error('Error al conectar con el backend de VONF:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  // 2. Manejar cambios en el estado local de inputs tradicionales
  const handleInputChange = (key: string, newValue: string) => {
    setSettings(prev =>
      prev.map(item => (item.key === key ? { ...item, value: newValue } : item))
    )
  }

  // 3. Guardar cambios pasando el valor como string directo
  const saveSetting = async (key: string, stringValue: string) => {
    setUpdatingKey(key)
    try {
      await settingsService.update(key, stringValue, token || '')
      alert(`✨ Configuración "${key}" guardada correctamente.`)
    } catch (err) {
      console.error(err)
      alert('Error al guardar los cambios.')
    } finally {
      setUpdatingKey(null)
    }
  }

  // 4. Gestión de subida directa para el Carrusel de Fondo
  const handleCarouselFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCarousel(true)
    try {
      const response = await settingsService.update('temp_carousel_upload', file, token || '')
      const uploadedUrl = (response as any).data?.value || (response as any).value

      if (uploadedUrl) {
        const updatedImages = [...carouselImages, uploadedUrl]
        setCarouselImages(updatedImages)
        
        const jsonString = JSON.stringify(updatedImages)
        setSettings(prev =>
          prev.map(item => (item.key === 'hero_carousel_images' ? { ...item, value: jsonString } : item))
        )
        
        await settingsService.update('hero_carousel_images', jsonString, token || '')
        alert('✨ Imagen añadida al carrusel con éxito.')
      } else {
        alert('No se pudo recuperar la URL de la imagen subida.')
      }
    } catch (err) {
      console.error(err)
      alert('Error al procesar o subir el archivo. Revisá las credenciales de Cloudinary en tu .env')
    } finally {
      setUploadingCarousel(false)
      if (carouselFileInputRef.current) carouselFileInputRef.current.value = ''
    }
  }

  // 5. Gestión de subida directa para la Imagen del Formulario
  const handleFormFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFormImg(true)
    try {
      // Como custom_form_image es una sola fila que guarda una URL directa,
      // le pasamos el archivo binario derecho para que Multer + Cloudinary lo pisen.
      const response = await settingsService.update('custom_form_image', file, token || '')
      const uploadedUrl = (response as any).data?.value || (response as any).value

      if (uploadedUrl) {
        setSettings(prev =>
          prev.map(item => (item.key === 'custom_form_image' ? { ...item, value: uploadedUrl } : item))
        )
        alert('✨ Imagen del formulario actualizada con éxito.')
      }
    } catch (err) {
      console.error(err)
      alert('Error al subir la imagen del formulario.')
    } finally {
      setUploadingFormImg(false)
      if (formFileInputRef.current) formFileInputRef.current.value = ''
    }
  }

  const removeCarouselImage = async (indexToRemove: number) => {
    const updatedImages = carouselImages.filter((_, index) => index !== indexToRemove)
    setCarouselImages(updatedImages)
    
    const jsonString = JSON.stringify(updatedImages)
    setSettings(prev =>
      prev.map(item => (item.key === 'hero_carousel_images' ? { ...item, value: jsonString } : item))
    )
    
    await saveSetting('hero_carousel_images', jsonString)
  }

  if (loading) {
    return <div className="text-center text-gray-500 py-20 animate-pulse uppercase tracking-widest text-xs">Cargando site_settings...</div>
  }

  // Excluimos las dos imágenes que ahora tienen gestor propio con botones de archivo
  const regularSettings = settings.filter(s => s.key !== 'hero_carousel_images' && s.key !== 'custom_form_image')
  const formImageSetting = settings.find(s => s.key === 'custom_form_image')

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-thin tracking-wider text-white uppercase">⚙️ Panel de site_settings</h2>
        <p className="text-xs text-gray-500 mt-1">Control completo del catálogo institucional y elementos de diseño de VONF.</p>
      </div>

      {/* --- SECCIÓN 1: GESTOR DEL CARRUSEL DE IMÁGENES --- */}
      <section className="bg-gray-900 border border-gray-800 p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase border-b border-gray-800 pb-2">Imágenes de Fondo del Hero</h3>
        
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Subir nueva imagen desde tu PC</label>
          <div className="flex gap-4">
            <input 
              type="file" 
              accept="image/*"
              ref={carouselFileInputRef}
              onChange={handleCarouselFileChange}
              className="hidden"
            />
            <button 
              type="button"
              onClick={() => carouselFileInputRef.current?.click()}
              disabled={uploadingCarousel}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-950 text-white text-xs font-bold tracking-widest uppercase transition-colors border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-sans"
            >
              {uploadingCarousel ? '⚡ Subiendo a Cloudinary...' : '📂 Seleccionar y Subir Imagen'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Imágenes activas en rotación ({carouselImages.length})</label>
          {carouselImages.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No hay imágenes en el carrusel de fondo.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carouselImages.map((url, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-950 p-3 border border-gray-800">
                  <div className="w-16 h-10 bg-cover bg-center bg-gray-900 border border-gray-800 shrink-0" style={{ backgroundImage: `url(${url})` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate tracking-tight">{url}</p>
                  </div>
                  <button type="button" onClick={() => removeCarouselImage(idx)} className="text-gray-500 hover:text-red-400 p-2 transition-colors text-sm font-bold">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- SECCIÓN 2: GESTOR DE LA IMAGEN DEL FORMULARIO DE PERSONALIZADOS --- */}
      {formImageSetting && (
        <section className="bg-gray-900 border border-gray-800 p-6 space-y-6">
          <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase border-b border-gray-800 pb-2">Imagen del Formulario</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {formImageSetting.value && (
                <div 
                  className="w-32 h-20 bg-cover bg-center bg-gray-950 border border-gray-800 shrink-0" 
                  style={{ backgroundImage: `url(${formImageSetting.value})` }}
                />
              )}
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{formImageSetting.label || 'Imagen actual del banner'}</p>
                <p className="text-[11px] text-gray-600 truncate font-mono">{formImageSetting.value}</p>
                
                <input 
                  type="file" 
                  accept="image/*"
                  ref={formFileInputRef}
                  onChange={handleFormFileChange}
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => formFileInputRef.current?.click()}
                  disabled={uploadingFormImg}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold tracking-wider uppercase border border-gray-700"
                >
                  {uploadingFormImg ? '⚡ Cargando...' : '🔄 Cambiar Imagen de Formulario'}
                </button>
              </div>
            </div>
            {formImageSetting.description && <p className="text-[11px] text-gray-500 italic">{formImageSetting.description}</p>}
          </div>
        </section>
      )}

      {/* --- SECCIÓN 3: CONFIGURACIONES GENERALES --- */}
      <section className="bg-gray-900 border border-gray-800 p-6 space-y-8">
        <h3 className="text-sm font-semibold tracking-widest text-purple-400 uppercase border-b border-gray-800 pb-2">Configuraciones del Sitio</h3>
        <div className="space-y-6">
          {regularSettings.map((item) => (
            <div key={item.key} className="space-y-2 border-b border-gray-800/50 pb-6 last:border-0 last:pb-0">
              <div className="flex justify-between items-baseline">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider">{item.label || item.key.replace(/_/g, ' ')}</label>
                <span className="text-[10px] font-mono text-gray-600 uppercase">{item.key}</span>
              </div>
              <div className="flex gap-4">
                {item.value.length > 100 ? (
                  <textarea rows={2} value={item.value} onChange={(e) => handleInputChange(item.key, e.target.value)} className="flex-1 bg-gray-950 border border-gray-800 p-3 text-sm text-white focus:outline-hidden focus:border-purple-500 transition-colors resize-none" />
                ) : (
                  <input type="text" value={item.value} onChange={(e) => handleInputChange(item.key, e.target.value)} className="flex-1 bg-gray-950 border border-gray-800 px-4 py-3 text-sm text-white focus:outline-hidden focus:border-purple-500 transition-colors" />
                )}
                <button type="button" onClick={() => saveSetting(item.key, item.value)} disabled={updatingKey === item.key} className="px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold tracking-widest uppercase transition-colors self-end h-11">
                  {updatingKey === item.key ? '...' : 'Guardar'}
                </button>
              </div>
              {item.description && <p className="text-[11px] text-gray-500 italic mt-1">{item.description}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}