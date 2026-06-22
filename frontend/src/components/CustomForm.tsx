'use client'

import { useState, useEffect } from 'react'
import { customService } from '@/services/custom.service'
import { useAuth } from '@/context/AuthContext'
import { settingsService } from '@/services/settings.service'

export default function CustomForm(){
    const {token} = useAuth(); 

    // Estado para la imagen dinámica del costado
    const [sideImage, setSideImage] = useState('') 

    useEffect(() => {
        const loadSettings = async () => {
            const imageUrl = await settingsService.getByKey('custom_form_image');
            if (imageUrl) setSideImage(imageUrl);
        };
        loadSettings();
    }, []);

    // --- TU LÓGICA ORIGINAL INTACTA ---
    const [formData, setFormData] = useState({
        contact_info: '',
        description:'',
        full_name:'',
        file: null as File | null
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFormData(prev => ({ ...prev, file }))
    }

    const handleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();

        if (!formData.file && !formData.description) {
            setError('No hay información de referencia');
            setIsLoading(false);
            return
        }

        if (!formData.contact_info) {
            setError('No hay información de contacto');
            setIsLoading(false);
            return
        }

        if (!formData.full_name) {
            setError('Falta nombre completo');
            setIsLoading(false);
            return
        }

        try{
            setIsLoading(true); // (Agregué esto para que el estado loading se active visualmente)
            await customService.create(formData, token || undefined);
        
            setSuccess(true)
            
            setFormData({
                contact_info: '', 
                description: '', 
                full_name: '', 
                file: null
            })

            setTimeout(() => {
                setSuccess(false)
            }, 3000)

        }catch (err: any) {
            setError(err.message || 'Ocurrió un error al registrarse')
        }finally {
            setIsLoading(false)
        }
    }
    // ----------------------------------

    // Clases de estilo "High-End"
    const inputClass = "w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors font-light tracking-wide text-sm"
    const labelClass = "block text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2"

    return (
        <section id="custom-form" className="min-h-screen flex items-center justify-center bg-black px-4 py-20 relative">
            
            {/* Fondo de ruido/textura (Opcional) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'url(/noise.svg)'}}></div>

            <div className="w-full max-w-6xl glass rounded-sm overflow-hidden flex flex-col lg:flex-row relative z-10 shadow-2xl shadow-purple-900/10">
                
                {/* COLUMNA IZQUIERDA (Imagen Dinámica) */}
                <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full bg-gray-900">
                    {sideImage ? (
                        <>
                            <img 
                                src={sideImage} 
                                alt="Inspiración Neon" 
                                className="absolute inset-0 w-full h-full object-cover opacity-80" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    
                    <div className="absolute bottom-0 left-0 p-12">
                        <h2 className="text-4xl md:text-5xl font-thin text-white tracking-tighter mb-4">
                            CREA TU <br/><span className="text-gray-500">PROPIO NEÓN</span>
                        </h2>
                        <p className="text-gray-400 font-light text-sm max-w-sm border-l border-white/30 pl-4">
                            Cuéntanos tu idea. Nosotros la convertimos en luz.
                        </p>
                    </div>
                </div>
                
                {/* COLUMNA DERECHA (Formulario) */}
                <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 bg-black/40 backdrop-blur-sm">
                    
                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        {/* Inputs de Texto */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelClass}>Nombre Completo</label>
                                    <input
                                        type="text" 
                                        name="full_name" 
                                        required
                                        placeholder="Ej: Juan Perez"
                                        className={inputClass}
                                        value={formData.full_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Contacto</label>
                                    <input
                                        type="text" 
                                        name="contact_info" 
                                        required
                                        placeholder="+54 9 ..."
                                        className={inputClass}
                                        value={formData.contact_info}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className={labelClass}>Tu Idea / Descripción</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    placeholder="Describe colores, medidas o la frase que imaginas..."
                                    className={inputClass + " resize-none"}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        {/* Input de Archivo (Estilo Minimalista) */}
                        <div>
                            <label className={labelClass}>Referencia Visual (Opcional)</label>
                            
                            <div className="relative mt-4 group">
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    name="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                />
                                
                                <label 
                                    htmlFor="file-upload"
                                    className={`
                                        block w-full border border-dashed rounded-sm p-8 text-center cursor-pointer transition-all duration-500
                                        ${formData.file 
                                            ? 'border-white bg-white/5' 
                                            : 'border-white/20 hover:border-white/50 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {formData.file ? (
                                        <div className="flex items-center justify-center gap-3 animate-in fade-in">
                                            <span className="text-xl">📎</span>
                                            <div className="text-left">
                                                <p className="text-white text-sm font-light">{formData.file.name}</p>
                                                <p className="text-gray-500 text-[10px] uppercase tracking-widest">Listo para enviar</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <span className="text-gray-500 text-2xl group-hover:text-white transition-colors duration-500">+</span>
                                            <p className="text-gray-400 text-xs font-light uppercase tracking-widest group-hover:text-white transition-colors">
                                                Subir Archivo
                                            </p>
                                        </div>
                                    )}
                                </label>

                                {/* Botón X para borrar */}
                                {formData.file && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFormData(prev => ({ ...prev, file: null }));
                                        }}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Mensajes de Estado */}
                        {error && (
                            <div className="text-red-400 text-xs text-center tracking-widest uppercase border border-red-900/50 p-2 bg-red-900/10">
                                {error}
                            </div>
                        )}

                        {/* Botón Submit */}
                        <button 
                            type="submit" 
                            disabled={isLoading || success} 
                            className={`w-full py-4 text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500
                                ${success 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-white text-black hover:bg-gray-200 disabled:opacity-50'
                                }
                            `}
                        >
                            {isLoading ? 'ENVIANDO...' : success ? 'ENVIADO' : 'SOLICITAR PRESUPUESTO'}
                        </button>

                    </form>
                </div>
            </div>
        </section>
    )
}