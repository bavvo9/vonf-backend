const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SiteSetting {
  key: string;
  value: string;
  label?: string;
  description?: string;
}

export const settingsService = {
  // 🟢 PÚBLICO: Obtener todas las configuraciones
  getAll: async (): Promise<SiteSetting[]> => {
    try {
      const res = await fetch(`${API_URL}/settings`, { 
        next: { revalidate: 60 } // Cache por 60 segundos para no saturar
      });
      
      if (!res.ok) return []; // Si falla, devolvemos array vacío para no romper la app
      
      const response = await res.json();
      return response.data || [];
    } catch (error) {
      console.error("Error en settings service:", error);
      return [];
    }
  },

  // 🔴 ADMIN: Obtener una específica por clave
  getByKey: async (key: string): Promise<string | null> => {
    const settings = await settingsService.getAll();
    const found = settings.find(s => s.key === key);
    return found ? found.value : null;
  },

  // 🔴 ADMIN: Actualizar configuración (Soporta Texto e Imágenes)
  update: async (key: string, data: string | File, token: string) => {
    const formData = new FormData();

    if (data instanceof File) {
      formData.append('image', data); // Si es archivo, va como 'image'
    } else {
      formData.append('value', data); // Si es texto, va como 'value'
    }

    const res = await fetch(`${API_URL}/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // Nota: No poner Content-Type con FormData, el navegador lo pone solo
      },
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Error al actualizar');
    return result;
  }
};