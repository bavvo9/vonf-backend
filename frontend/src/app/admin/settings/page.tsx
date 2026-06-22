'use client'
import { useState, useEffect } from 'react'
import { settingsService } from '@/services/settings.service'
import { useAuth } from '@/context/AuthContext'

const IMAGE_KEYS = ['site_logo', 'form_image', 'hero_background', 'footer_logo'];
const TEXTAREA_KEYS = ['site_description', 'hero_subtitle', 'custom_form_notice'];

const FRIENDLY_NAMES: Record<string, string> = {
  site_logo: 'Logo Principal del Sitio',
  footer_logo: 'Logo del Pie de Página',
  hero_background: 'Imagen de Fondo de Portada',
  hero_title: 'Título Principal (Hero)',
  hero_subtitle: 'Subtítulo Principal (Hero)',
  form_image: 'Imagen del Formulario de Neones',
  whatsapp_number: 'Teléfono de Consultas (Ej: 549341XXXXXXX)',
  whatsapp_message: 'Mensaje Inicial de WhatsApp',
  site_description: 'Descripción Institucional'
};

export default function AdminSettingsPage() {
  const { token, isLoading } = useAuth()
  const [settings, setSettings] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  
  // Estado para capturar los textos en caliente mientras escribís
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})

  const loadSettings = async () => {
    if(!token) return
    setPageLoading(true)
    try {
        const data = await settingsService.getAll()
        setSettings(data)
    } catch(e) { console.error(e) }
    finally { setPageLoading(false) }
  }

  useEffect(() => { if(token) loadSettings() }, [token])

  const handleSaveText = async (key: string) => {
    const newValue = editedValues[key]
    if (!token || newValue === undefined) return
    
    try {
        await settingsService.update(key, newValue, token)
        alert('Configuración guardada con éxito ✨')
        loadSettings()
    } catch (err) {
        alert('Error al guardar los cambios')
    }
  }

  const handleUploadImage = async (key: string, file: File) => {
    if(!token) return
    setUploadingKey(key)
    try {
        await settingsService.update(key, file, token)
        alert('Imagen actualizada correctamente ✨')
        loadSettings()
    } catch (error) {
        alert('Error al subir la imagen')
    } finally {
        setUploadingKey(null)
    }
  }

  if (isLoading || pageLoading) return <div className="text-white p-8">Cargando variables...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">⚙️ Panel de Configuración</h1>
      <p className="text-gray-400 text-sm mb-8">Controlá el contenido visual y canales de contacto de tu catálogo.</p>

      <div className="grid gap-6">
        {settings.map((item) => {
            const isImage = IMAGE_KEYS.includes(item.key) || (item.value?.startsWith('http') && item.value?.includes('cloudinary'));
            const isTextarea = TEXTAREA_KEYS.includes(item.key) || item.key.includes('description');
            const displayName = FRIENDLY_NAMES[item.key] || item.key.replace(/_/g, ' ');
            
            // Verifica si el usuario tipeó algo distinto al valor original de la DB
            const hasChanged = editedValues[item.key] !== undefined && editedValues[item.key] !== item.value;

            return (
                <div key={item.key} className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center">
                    
                    {/* INFO DE LA VARIABLE */}
                    <div className="w-full md:w-1/3">
                        <p className="text-purple-500 font-mono text-[10px] uppercase mb-1">{item.key}</p>
                        <p className="text-white font-bold text-base capitalize">{displayName}</p>
                    </div>

                    {/* EDITORES */}
                    <div className="flex-1 w-full">
                        {isImage ? (
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-black border border-gray-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {item.value ? <img src={item.value} className="w-full h-full object-contain" alt={displayName}/> : <span className="text-xs text-gray-600">Vacío</span>}
                                </div>
                                <div>
                                    <label className="bg-white text-black text-xs font-bold px-4 py-2 rounded cursor-pointer hover:bg-gray-200 transition inline-block">
                                        {uploadingKey === item.key ? 'Subiendo...' : 'Cambiar Archivo 📂'}
                                        <input 
                                            type="file" 
                                            hidden 
                                            accept="image/*"
                                            disabled={uploadingKey === item.key}
                                            onChange={(e) => e.target.files?.[0] && handleUploadImage(item.key, e.target.files[0])}
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 items-end">
                                {isTextarea ? (
                                    <textarea 
                                        defaultValue={item.value}
                                        rows={3}
                                        className="bg-black border border-gray-800 text-white px-4 py-2 rounded w-full focus:border-purple-500 outline-none text-sm font-light resize-none leading-relaxed"
                                        onChange={(e) => setEditedValues({ ...editedValues, [item.key]: e.target.value })}
                                    />
                                ) : (
                                    <input 
                                        type="text"
                                        defaultValue={item.value}
                                        className="bg-black border border-gray-800 text-white px-4 py-2 rounded w-full focus:border-purple-500 outline-none text-sm font-light"
                                        onChange={(e) => setEditedValues({ ...editedValues, [item.key]: e.target.value })}
                                    />
                                )}
                                
                                {/* Botón físico que solo se activa al modificar el texto */}
                                {hasChanged && (
                                    <button
                                        onClick={() => handleSaveText(item.key)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded transition shadow-md self-end"
                                    >
                                        Guardar Cambios
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  )
}