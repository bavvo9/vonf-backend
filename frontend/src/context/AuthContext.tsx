'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types' // 👈 Importamos el tipo centralizado
import { authService } from '@/services/auth.service'

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (accessToken: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('vonf_token')
      const storedUser = localStorage.getItem('vonf_user')
      
      if (storedToken && storedToken !== "undefined" && storedUser) {
        try {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error("Sesión corrupta", error)
          localStorage.removeItem('vonf_token')
          localStorage.removeItem('vonf_user')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = (accessToken: string, userData: User) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('vonf_token', accessToken)
    localStorage.setItem('vonf_user', JSON.stringify(userData))
    
    if (userData.role === 'admin') {
      router.push('/admin') // 👈 Si es admin, al dashboard
    } else {
      router.push('/profile') // 👈 Si es mortal, al perfil
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('vonf_token')
    localStorage.removeItem('vonf_user')
    localStorage.removeItem('vonf_cart')
    router.push('/login')
  }

  

  // 👇 LA MAGIA: Efecto de Inicio (Check Session)
  useEffect(() => {
    const initAuth = async () => {
      // 1. Carga Rápida (Lo que haya en memoria)
      const storedToken = localStorage.getItem('vonf_token')
      const storedUser = localStorage.getItem('vonf_user')
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }

      // 2. Carga Fresca (Preguntar al backend por datos nuevos)
      // Solo si tenemos un token, intentamos refrescarlo/validarlo
      if (storedToken) {
        try {
          // Llamamos al refresh para obtener token nuevo y DATOS DE USUARIO actualizados
          const data = await authService.refreshToken() 
          
          if (data.user) {
            // Actualizamos el estado y el localStorage con lo nuevo
            setUser(data.user)
            localStorage.setItem('vonf_user', JSON.stringify(data.user))
            
            if (data.token) {
                setToken(data.token)
                localStorage.setItem('vonf_token', data.token)
            }
          }
        } catch (error) {
          console.error("Sesión caducada o inválida", error)
          // Si el refresh falla (ej: token expirado), hacemos logout silencioso
          logout()
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, []) // Se ejecuta solo al cargar la página (F5)

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider")
  return context
}