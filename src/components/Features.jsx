import { motion } from 'framer-motion'

const features = [
  {
    icon: '⚡',
    title: 'Cálculos instantáneos',
    description: 'Obtén resultados técnicos en segundos. Sin hojas de cálculo, sin errores manuales.',
  },
  {
    icon: '📋',
    title: 'Legalizaciones simplificadas',
    description: 'Genera documentación técnica lista para presentar en organismos oficiales.',
  },
  {
    icon: '🎯',
    title: 'Enfoque en instaladores',
    description: 'Diseñado específicamente para instaladores industriales, no es un software genérico.',
  },
  {
    icon: '💰',
    title: 'Ahorro de tiempo',
    description: 'Reduce hasta un 70% el tiempo de gestión administrativa por obra.',
  },
  {
    icon: '📊',
    title: 'Trazabilidad completa',
    description: 'Historial de todos tus cálculos y proyectos en un solo lugar.',
  },
  {
    icon: '🔒',
    title: 'Datos seguros',
    description: 'Tu información y la de tus clientes protegida con encriptación de nivel empresarial.',
  },
]

function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            Todo lo que necesitas en una sola plataforma
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Herramientas profesionales para instaladores que quieren profesionalizar su gestión.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white tracking-wide">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features