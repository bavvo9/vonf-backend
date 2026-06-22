import { CartItem } from '@/types'

// Estas funciones reciben el 'authFetch' como dependencia.
// Así mantenemos la lógica de negocio separada de la UI.

export const cartService = {
  get: async (fetcher: Function) => {
    const res = await fetcher('/cart')
    if (!res || !res.ok) return []
    const data = await res.json()
    // Normalizamos aquí para que el Context reciba datos limpios
    return (data.items || data).map((item: any) => ({
      id: item.product_id || item.id,
      name: item.name || item.product?.name,
      price: Number(item.price || item.product?.price),
      image_url: item.image_url || item.product?.image_url,
      quantity: item.quantity,
      stock: item.stock,
      track_stock:item.track_stock
    }))
  },

  sync: async (fetcher: Function, localCart: CartItem[]) => {
    return await fetcher('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items: localCart })
    })
  },

  add: async (fetcher: Function, productId: number, quantity: number) => {
    return await fetcher('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    })
  },

  remove: async (fetcher: Function, productId: number) => {
    return await fetcher(`/cart/${productId}`, { method: 'DELETE' })
  },

  updateQuantity: async (fetcher: Function, productId: number, quantity: number) => {
    return await fetcher(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    })
  },

  clear: async (fetcher: Function, token: string) => {
    return await fetcher(`/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

}