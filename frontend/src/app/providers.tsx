// src/app/providers.tsx
'use client' // 👈 Esto le dice a Next.js: "Ejecútame en el navegador"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'


export default function Providers({ children }: { children: ReactNode }) {
  // Creamos el cliente de React Query una vez
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}