import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '29',
    period: 'mes',
    description: 'Para instaladores autónomos que empiezan a profesionalizarse.',
    features: [
      'Hasta 50 cálculos/mes',
      '3 herramientas básicas',
      'Exportación PDF',
      'Soporte por email',
    ],
    cta: 'Comenzar prueba gratuita',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '79',
    period: 'mes',
    description: 'Para equipos que necesitan potencia y flexibilidad.',
    features: [
      'Cálculos ilimitados',
      'Todas las herramientas',
      'API de integración',
      'Soporte prioritario 24/7',
      'Multi-usuario',
    ],
    cta: 'Comenzar prueba gratuita',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Soluciones a medida para grandes instaladoras.',
    features: [
      'Todo lo de Professional',
      'Despliegue on-premise',
      'SLA garantizado',
      'Formación personalizada',
      'Soporte dedicado',
    ],
    cta: 'Contactar con ventas',
    highlighted: false,
  },
]

function Pricing() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            Planes simples y transparentes
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Sin letra pequeña. Cancela cuando quieras.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl border p-8 ${
                plan.highlighted
                  ? 'glass-panel border-orange-500/30 bg-navy-800/40 shadow-2xl shadow-orange-500/10'
                  : 'glass-panel border-white/5 bg-navy-900/40'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-semibold text-white">
                  Más popular
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-semibold text-white tracking-wide">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === 'Custom' ? '' : `€${plan.price}`}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-slate-400">/{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/sandbox"
                className={`mt-8 block w-full rounded-2xl px-6 py-3 text-center text-sm font-semibold transition-all duration-300 ease-in-out ${
                  plan.highlighted
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:scale-105 hover:bg-orange-400'
                    : 'glass-panel border border-white/5 bg-white/5 text-white hover:bg-white/10 hover:border-white/15'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing