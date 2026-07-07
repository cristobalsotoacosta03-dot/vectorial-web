export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">💳</span>
          <h1 className="text-2xl font-bold text-slate-800">Facturación / Suscripción</h1>
        </div>
        <p className="text-slate-500 text-sm">Plan actual, método de pago e historial de facturas.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
        Próximamente: gestión de plan y pagos.
      </div>
    </div>
  )
}
