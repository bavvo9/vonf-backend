// src/app/page.tsx
'use client'


import Link from 'next/link'
import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts' 
import Form from '@/components/CustomForm' 
import WhyUs from '@/components/WhyUs' 


export default function Home() {
  
  return (
    <main className="min-h-screen bg-black text-white">

      {/*El Hero Section (Solo en la home) */}
      <Hero />

      {/*Razones para elegirnos*/}
      <WhyUs />
      
      {/*Productos destacados*/}
      <FeaturedProducts />

      
      {/*Pedidos Personalizados */}
      <section className="border-t border-gray-900 bg-gray-950">
          <Form />
      </section>

      {/*CTA al Catálogo Completo*/}
      <section className="py-20 border-t border-gray-900 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">¿Buscas algo más?</h2>
        <Link 
                href="/products" 
                className="inline-block px-6 py-3 border border-white/20 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all mt-4 md:mt-8"
            >
                Ver catálogo completo
        </Link>
      </section>
    </main>
  )
}