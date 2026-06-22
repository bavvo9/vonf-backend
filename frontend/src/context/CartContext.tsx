'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { cartService } from '@/services/cart.service'
import { CartItem } from '@/types' 

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  removeOneFromCart: (id: number) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth() 
  const authFetch = useAuthFetch()
  const [cart, setCart] = useState<CartItem[]>([])

  // Cargar carrito
  const refreshCart = async () => {
    // 1. Si NO hay usuario (Guest)
    if (!token) {
      const saved = localStorage.getItem('vonf_cart')
      if (saved) {
          try {
              setCart(JSON.parse(saved))
          } catch (e) {
              console.error("Error parsing cart", e)
              localStorage.removeItem('vonf_cart')
          }
      }
      return
    }

    // 2. Si HAY usuario
    // Primero revisamos si había algo en local para subirlo (sincronizar)
    const localCart = JSON.parse(localStorage.getItem('vonf_cart') || '[]')
    if (localCart.length > 0) {
      await cartService.sync(authFetch, localCart)
      localStorage.removeItem('vonf_cart')
    }
    
    // Obtenemos la verdad absoluta del backend (que ahora incluye STOCK)
    const items = await cartService.get(authFetch)

    setCart(items)
  }

  useEffect(() => {
    if (isLoading) return
    refreshCart()
  }, [token, isLoading, authFetch])

  const updateLocalState = (newCart: CartItem[]) => {
    setCart(newCart)
    if (!token) localStorage.setItem('vonf_cart', JSON.stringify(newCart))
  }

  // 👇 LA FUNCIÓN CORREGIDA
  const addToCart = async (product: any) => {
    const prevCart = [...cart]
    const existingItem = prevCart.find(i => i.id === product.id)
    
    // --- INICIO DE VALIDACIÓN DE STOCK ---
    const currentQty = existingItem ? existingItem.quantity : 0
    const nextQty = currentQty + 1
    
    const stockLimit = product.stock ?? existingItem?.stock;
    const isTracking = product.track_stock ?? existingItem?.track_stock ?? true; // Por defecto asumimos que sí trackea si hay duda

    // Si sabemos que hay límite y nos pasamos...
    if (isTracking && stockLimit !== undefined && nextQty > stockLimit) {
        alert(`¡Stock máximo alcanzado! Solo hay ${stockLimit} unidades disponibles.`);
        return; // 🛑 FRENO DE MANO
    }
    // --- FIN DE VALIDACIÓN ---

    const newItem: CartItem = { 
        id: product.id, 
        name: product.name, 
        price: Number(product.price), 
        image_url: product.image_url || '', 
        quantity: 1,
        // IMPORTANTE: Guardamos el stock en el item para que no se pierda al navegar
        stock: stockLimit,
        track_stock: isTracking
    }

    const newCart = existingItem 
      ? prevCart.map(i => i.id === product.id ? { 
          ...i, 
          quantity: i.quantity + 1,
          // 👇 FIX: Actualizamos la info de stock también en el item existente
          stock: stockLimit,       
          track_stock: isTracking
        } : i)
      : [...prevCart, newItem]

    updateLocalState(newCart)

    if (token) {
      try {
        await cartService.add(authFetch, product.id, 1)
      } catch (error) {
        console.error(error)
        // Rollback si el backend protesta
        alert("No se pudo agregar más unidades. Stock insuficiente en servidor.");
        setCart(prevCart)
      }
    }
  }

  const removeOneFromCart = async (id: number) => {
    const item = cart.find(i => i.id === id)
    if (!item) return
    const prevCart = [...cart]
    
    let newCart: CartItem[]
    if (item.quantity > 1) {
      newCart = prevCart.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
    } else {
      newCart = prevCart.filter(i => i.id !== id)
    }
    
    updateLocalState(newCart)

    if (token) {
      try {
        if (item.quantity > 1) {
          await cartService.updateQuantity(authFetch, id, item.quantity - 1)
        } else {
          await cartService.remove(authFetch, id)
        }
      } catch (error) {
        console.error(error)
        setCart(prevCart)
      }
    }
  }

  const removeFromCart = async (id: number) => {
    const prevCart = [...cart]
    const newCart = prevCart.filter(i => i.id !== id)
    updateLocalState(newCart)
    if (token) {
      try {
        await cartService.remove(authFetch, id)
      } catch (error) {
        console.error(error)
        setCart(prevCart)
      }
    }
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('vonf_cart')
    if (token) {
        cartService.clear(authFetch, token).catch(e => console.error(e));
    }
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, removeOneFromCart, clearCart, totalItems, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider")
  return context
}