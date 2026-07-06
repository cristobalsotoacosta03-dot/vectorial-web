import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Introduce tus datos',
    description: 'Ingresa los parámetros de tu proyecto: caudales, dimensiones, materiales.',
  },
  {
    number: '02',
    title: 'Calcula automáticamente',
    description: 'Nuestro motor de cálculo procesa las fórmulas técnicas al instante.',
  },
  {
    number: '03',
    title: 'Exporta resultados',
    description: 'Descarga informes profesionales listos para presentar a tus clientes.',
  },
]

function HowItWorks() {
  return (
    <section className="py-24 bg-navy-900/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Tres pasos simples para transformar tu forma de trabajar
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative text-center"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-2xl font-bold text-orange-500">
                {step.number}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white tracking-wide">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks