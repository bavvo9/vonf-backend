import { Address } from '@/types'

export const addressService = {
  getAll: async (fetcher: Function): Promise<Address[]> => {
    const res = await fetcher('/addresses')
    if (!res || !res.ok) return []
    return await res.json()
  },

  create: async (fetcher: Function, addressData: Omit<Address, 'id'>) => {
    // Convertimos camelCase a snake_case si el backend lo requiere, 
    // o enviamos directo si tu backend ya es flexible (como lo dejamos antes).
    return await fetcher('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    })
  },

  delete: async (fetcher: Function, id: number) => {
    return await fetcher(`/addresses/${id}`, {
      method: 'DELETE'
    })
  }
}