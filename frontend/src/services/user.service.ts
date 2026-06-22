import { User } from '@/types'

export const userService = {
  // Obtener perfil del usuario actual
  getProfile: async (fetcher: Function): Promise<User | null> => {
    const res = await fetcher('/users/me') // Ruta relativa, el hook pone la base
    if (!res || !res.ok) return null
    return await res.json()
  },

  // Actualizar perfil
  /*updateProfile: async (fetcher: Function, data: Partial<User>) => {
    return await fetcher('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }*/
}