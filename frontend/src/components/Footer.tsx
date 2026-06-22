import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12 md:gap-24">
        
        {/* Columna 1: Marca */}
        <div className="flex-1">
            <h2 className="text-4xl font-thin tracking-tighter text-white mb-6">VONF</h2>
            <p className="text-gray-500 text-sm font-light max-w-xs mb-8">
                Iluminando espacios con diseño y tecnología desde Rosario, Argentina.
            </p>
            <p className="text-gray-600 text-xs">
                © 2024 VONF. All rights reserved.
            </p>
        </div>

        {/* Columna 2: Enlaces (Lista limpia) */}
        <div className="flex gap-16">
            <div>
                <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-6 opacity-50">Explorar</h3>
                <ul className="space-y-4">
                    <li><Link href="/products" className="text-gray-400 hover:text-white text-sm transition-colors">Colección</Link></li>
                    <li><Link href="/custom" className="text-gray-400 hover:text-white text-sm transition-colors">Personalizar</Link></li>
                    <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">Nosotros</Link></li>
                </ul>
            </div>
            
            <div>
                <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-6 opacity-50">Soporte</h3>
                <ul className="space-y-4">
                    <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contacto</Link></li>
                    <li><Link href="/shipping" className="text-gray-400 hover:text-white text-sm transition-colors">Envíos</Link></li>
                    <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Términos</Link></li>
                </ul>
            </div>
        </div>

        {/* Columna 3: Newsletter Minimalista */}
        <div className="flex-1 max-w-sm">
            <h3 className="text-white text-xs uppercase tracking-[0.2em] mb-6 opacity-50">Newsletter</h3>
            <div className="flex border-b border-white/30 pb-2 focus-within:border-white transition-colors">
                <input 
                    type="email" 
                    placeholder="Tu email" 
                    className="bg-transparent w-full text-white outline-none placeholder-gray-700 text-sm"
                />
                <button className="text-gray-400 hover:text-white uppercase text-xs tracking-widest transition-colors">
                    Unirse
                </button>
            </div>
        </div>
      </div>
      
      {/* Firma Sutil */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-700 uppercase tracking-widest">
        <span>Designed in Rosario</span>
        <span>VONF Inc.</span>
      </div>
    </footer>
  )
}