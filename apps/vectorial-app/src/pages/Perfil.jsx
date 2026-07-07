export default function Perfil() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">👤</span>
          <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
        </div>
        <p className="text-slate-500 text-sm">Datos de la cuenta y preferencias personales.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
        Próximamente: edición de datos de perfil y empresa.
      </div>
    </div>
  )
}
