import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: 'GestiObra me ha ahorrado horas de cálculos en cada obra. Ahora puedo atender a más clientes.',
    author: 'Carlos M.',
    role: 'Instalador industrial autónomo',
  },
  {
    quote: 'Por fin una herramienta hecha por y para instaladores. No es un software genérico que no entiende nuestro trabajo.',
    author: 'Ana R.',
    role: 'Jefa de obra',
  },
  {
    quote: 'La legalización de instalaciones nunca fue tan rápida. Genero todos los documentos en minutos.',
    author: 'Miguel S.',
    role: 'Ingeniero de proyectos',
  },
]

function Testimonials() {
  return (
    <section className="py-24 bg-navy-900/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Profesionales que ya han transformado su forma de trabajar
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6"
            >
              <div className="mb-4 text-orange-500">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                </svg>
              </div>
              <p className="mb-4 text-sm text-slate-300 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                <p className="text-xs text-slate-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials