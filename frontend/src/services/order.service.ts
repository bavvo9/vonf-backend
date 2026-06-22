const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const orderService = {
  // 1. Obtener mis órdenes (Cliente)
  // Al no existir 'my-orders', usamos la raíz '/' y confiamos en que el backend filtre por el ID del token
  getMyOrders: async (token: string) => {
    const res = await fetch(`${API_URL}/orders`, { // 👈 Cambiado de /orders/my-orders a /orders
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Error al obtener mis órdenes');
    return await res.json();
  },

  // 2. Obtener todas las órdenes (Admin)
  // Usa la misma ruta, pero como el token será de admin, el backend debería devolver todo
  getAll: async (token: string) => {
    // 👇 CAMBIO: Llama a '/orders/all' -> devuelve todas con detalles
    const res = await fetch(`${API_URL}/orders/all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Error al cargar historial admin');
    return await res.json();
  },

  // 3. Crear orden
  create: async (orderData: any, token: string) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) throw new Error('Error al crear la orden');
    return await res.json();
  },

  // 4. Obtener detalle de una orden
  getById: async (id: number | string, token: string) => {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Orden no encontrada');
    return await res.json();
  },

  // 5. Actualizar estado (Admin)
  updateStatus: async (id: number | string, status: string, token: string) => {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error('Error actualizando estado');
    return await res.json();
  }
};