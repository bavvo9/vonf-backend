import { User } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include'
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
    return data // { accessToken, user, ... }
  },

  register: async (userData: Partial<User> & { password: string }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error en el registro')
    return data
  },

  refreshToken: async () => {
    // Importante: 'credentials: include' envía las cookies al backend
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' 
    });

    if (!res.ok) throw new Error('No se pudo refrescar sesión');

    const data = await res.json(); // data = { accessToken: '...', user: {...} }
    
    // Creo que el backend devuelve { token, user } igual que el login
    
    return {
        token: data.accessToken, // El context espera 'token'
        user: data.user          // El context espera 'user'
    };
  }
  
  // Puedo agregar verifyEmail, resendVerification
}