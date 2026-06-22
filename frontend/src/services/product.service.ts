// Define la interfaz según tu backend
export interface ProductParams {
  page?: number;
  limit?: number;
  category_id?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const productService = {
  getAll: async (params: ProductParams = {}) => {
    const searchParams = new URLSearchParams();
    
    // Convertimos el objeto params a query string
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, String(value));
    });

    const res = await fetch(`${API_URL}/products?${searchParams.toString()}`, {
        cache: 'no-store' // Para que siempre traiga datos frescos
    });
    
    if (!res.ok) throw new Error('Error al cargar productos');
    return await res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    return await res.json();
  },

  create: async (formData: FormData, token: string) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }, // NO poner Content-Type
      body: formData
    })
    if (!res.ok) throw new Error('Error creando producto')
    return await res.json()
  },

  update: async (id: number, formData: FormData, token: string) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    if (!res.ok) throw new Error('Error actualizando producto')
    return await res.json()
  },
  
  // Método auxiliar para eliminar (si lo necesitas)
  delete: async (id: number, token: string) => {
      await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      })
  }
};