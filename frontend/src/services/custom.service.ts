const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const customService = {
  create: async (data: any, token?: string) => {
    // 1. Creamos la instancia de FormData (la "caja")
    const formData = new FormData();
    
    // 2. Agregamos los campos de texto uno por uno
    formData.append('full_name', data.full_name);
    formData.append('contact_info', data.contact_info);
    formData.append('description', data.description || '');

    // 3. Agregamos la imagen SOLO si el usuario subió una
    // react-hook-form devuelve un array "FileList", el archivo real está en la posición 0
    if (data.file) {
      formData.append('image', data.file);
    }

    // 4. Preparamos los Headers (Encabezados)
    const headers: HeadersInit = {};
    
    // Si el usuario está logueado, le pegamos su token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // ⚠️ OJO: AQUÍ NO AGREGAMOS 'Content-Type': 'application/json'
    // Dejar que el navegador lo haga solo.

    // 5. Hacemos la petición
    const res = await fetch(`${API_URL}/form`, {
      method: 'POST',
      headers: headers,
      body: formData, // 👈 Enviamos el formData directo
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Error al enviar la solicitud');
    }

    return result;
  },
  //Obtener todos (Admin)
  getAll: async (token: string) => {
    const res = await fetch(`${API_URL}/form`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Error al cargar personalizados');
    return await res.json();
  }
};