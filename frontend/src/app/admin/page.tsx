'use client'

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Panel de Control</h1>
      
      {/* Tarjetas de Resumen (Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-gray-400 text-sm font-bold uppercase">Ingresos Mensuales</h3>
          <p className="text-3xl text-white mt-2 font-mono">$0.00</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-gray-400 text-sm font-bold uppercase">Pedidos Pendientes</h3>
          <p className="text-3xl text-purple-400 mt-2 font-mono">0</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-gray-400 text-sm font-bold uppercase">Solicitudes Custom</h3>
          <p className="text-3xl text-blue-400 mt-2 font-mono">0</p>
        </div>

      </div>

      {/* Aquí podrías poner una gráfica o los últimos pedidos */}
      <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center text-gray-500">
        Gráficos próximamente...
      </div>
    </div>
  )
}