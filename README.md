# Vectorial - Plataforma de Ingeniería para Instaladores

Monorepo con aplicación de ingeniería y web promocional.

## 📦 Estructura

```
vectorial/
├── apps/
│   ├── vectorial-app/     # App de ingeniería (calculadoras, obras)
│   └── vectorial-web/     # Landing page promocional
└── package.json
```

## 🚀 Aplicaciones

### Vectorial App
**URL:** https://usevectorial.vercel.app

El producto completo (Core Engine), con cuenta y datos reales por empresa (Supabase + RLS multi-tenant):
- 🧮 GLP, Tuberías, ACS, Conversor
- ✅ Checklist OCA (RIGLO, RITE)
- 📊 Gestión de obras y presupuestos
- 📚 Biblia del Instalador (60+ referencias)

### Vectorial Web
**URL:** https://vectorial-web.vercel.app

Landing page promocional (Presentation Layer) con un Engineering Sandbox público en `/sandbox` — una demo limitada de las calculadoras para que cualquiera las pruebe sin registrarse, pensada como embudo hacia Vectorial App.

## 🛠️ Desarrollo

```bash
npm install
npm run dev:app    # App de ingeniería
npm run dev:web    # Web promocional
```

## 📱 Características

- Cálculos según normativa española (RITE, RIGLO, UNE, CTE)
- Modo oscuro/claro
- Datos guardados localmente
- Exportación PDF y WhatsApp
- Diseño responsive

## 📄 Licencia

Proyecto privado - Todos los derechos reservados