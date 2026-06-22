import Image from 'next/image'

const features = [
  {
    title: "Cristal Acrylic",
    desc: "Base invisible de alta resistencia. El neón parece flotar en la pared.",
    icon: "/window.svg" // O un icono simple de línea
  },
  {
    title: "Eco Energy",
    desc: "Tecnología LED de 12V. Máximo brillo con el mínimo consumo.",
    icon: "/globe.svg"
  },
  {
    title: "Handcrafted",
    desc: "Cada curva es moldeada a mano en nuestro taller de Rosario.",
    icon: "/file.svg"
  }
]

export default function WhyUs() {
  return (
    <section className="py-32 relative bg-black">
      {/* Fondo de ruido sutil (ya en globals.css) */}
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
                <div key={idx} className="group p-8 border-l border-white/10 hover:border-white/50 transition-colors duration-500 relative">
                    {/* Efecto de luz al hover */}
                    <div className="absolute -left-[1px] top-0 h-0 w-[1px] bg-white transition-all duration-500 group-hover:h-full box-shadow-glow" />
                    
                    <div className="mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                         {/* Puedes usar tus iconos SVG aquí, pero hazlos blancos y pequeños */}
                         <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{idx + 1}</span>
                         </div>
                    </div>

                    <h3 className="text-xl text-white font-light tracking-widest mb-4 uppercase">
                        {feature.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-light group-hover:text-gray-300 transition-colors">
                        {feature.desc}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </section>
  )
}