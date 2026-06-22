'use client'
import { useState, useEffect } from 'react'
import { productService } from '@/services/product.service'
import { useAuth } from '@/context/AuthContext'

export default function ProductForm({ productToEdit, onSuccess, onCancel }: any) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '', price: '', description: '', stock: '', category_id: '',
        file: null as File | null
    })

    // Cargar datos si estamos editando
    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                price: productToEdit.price,
                description: productToEdit.description || '',
                stock: productToEdit.stock,
                category_id: productToEdit.category_id || '',
                file: null
            })
        }
    }, [productToEdit])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = new FormData()
            data.append('name', formData.name)
            data.append('price', formData.price)
            data.append('description', formData.description)
            data.append('stock', formData.stock)
            data.append('category_id', formData.category_id)
            if (formData.file) data.append('image', formData.file)

            if (productToEdit) {
                await productService.update(productToEdit.id, data, token!)
            } else {
                await productService.create(data, token!)
            }
            onSuccess() // Avisar al padre que termine
        } catch (error) {
            alert('Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-white">
                    {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        placeholder="Nombre" required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white"
                    />
                    <div className="flex gap-4">
                        <input 
                            type="number" placeholder="Precio" required 
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
                        />
                        <input 
                            type="number" placeholder="Stock" required 
                            value={formData.stock}
                            onChange={e => setFormData({...formData, stock: e.target.value})}
                            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
                        />
                    </div>
                    <textarea 
                        placeholder="Descripción" rows={3}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white"
                    />
                    <input 
                        type="file" accept="image/*"
                        onChange={e => setFormData({...formData, file: e.target.files?.[0] || null})}
                        className="text-sm text-gray-400"
                    />
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-300 hover:text-white">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-purple-600 px-4 py-2 rounded text-white font-bold hover:bg-purple-500">
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}