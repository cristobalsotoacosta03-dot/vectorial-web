import { Component } from 'react'

/**
 * Error Boundary de React (patrón de clase, requerido por la API: no existe
 * equivalente en hooks). Aísla el fallo de una calculadora para que no
 * tumbe el resto de la aplicación.
 *
 * @component
 */
class ToolErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[VECTORIAL] Error en calculadora:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-500/40 bg-red-500/10 p-6 text-left">
          <p className="text-sm font-semibold text-red-400">
            Error de convergencia en el algoritmo de cálculo
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Verifique los datos introducidos (rugosidad, diámetro, material) y
            vuelva a calcular. Si el error persiste, los valores de entrada
            están fuera del rango que el modelo puede resolver.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors duration-100"
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ToolErrorBoundary
