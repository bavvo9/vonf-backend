'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuthFetch() {
  const { token, logout } = useAuth()
  const router = useRouter()

  // Usamos useCallback para que la función sea estable
  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // 1. Construir URL completa
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

    // 2. Preparar Headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers, // Permite sobreescribir si es necesario
    }

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      })

      // 3. Interceptor Global de 401 (Logout)
      if (res.status === 401) {
        console.warn('⚠️ Sesión expirada. Redirigiendo...')
        logout()
        router.push('/login')
        return null // Retornamos null para cortar flujo
      }

      return res
    } catch (error) {
      console.error('Error de red en authFetch:', error)
      throw error
    }
  }, [token, logout, router])

  return authFetch
}