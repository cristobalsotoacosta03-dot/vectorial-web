# Estrategia de Monetización — GestiObra

**Fecha:** 2026-07-03
**Autor del plan:** Consultor de Negocio / Estrategia Financiera (asistido por Claude Code)
**Perfil del promotor:** Jefe de Obra (instalaciones de gas/climatización) + estudiante de ingeniería. Poco tiempo libre disponible → **cualquier vía elegida debe minimizar fricción operativa y no competir con tu empleo actual.**

> Este documento es un plan vivo. Actualízalo cada vez que cierres un cliente, cambies de prioridad o añadas una funcionalidad relevante para el negocio.

---

## 0. Resumen ejecutivo

GestiObra **no es una app de gestión de obra genérica**: su activo real son 4-5 calculadoras técnicas que encapsulan normativa española (RIGLO, RITE, CTE DB-HE4, UNE-EN 1057) que a un instalador o ingeniero le costaría horas reproducir en Excel, y un checklist de preinspección OCA que reduce el riesgo de rechazo en una inspección oficial. Eso es lo que tiene valor de mercado — no el CRM de obras/presupuestos, que es commodity.

Dado tu perfil (poco tiempo, sin equipo, sin ánimo de montar una empresa de software a corto plazo), la vía de **menor fricción y mayor velocidad de caja es el Modelo Consultoría/Servicio**: vender "informes de dimensionado" a otros instaladores o pequeñas empresas usando la herramienta que ya tienes, cobrando por entregable puntual en vez de mantener software para terceros. El SaaS y la Licencia son atractivos a medio plazo pero requieren construir cosas que hoy no existen (autenticación multiusuario, cobros, exportación de marca blanca) y por tanto deben ser **fase 2**, no el punto de partida.

**Recomendación de orden:** Consultoría/Servicio (mes 1) → Licencia de plantillas/checklists (mes 2-3) → SaaS (solo si el servicio valida demanda repetida, mes 4+).

---

## 1. Análisis de Oportunidad

### 1.1 Qué hay construido hoy (auditoría real del repo)

| Módulo | Qué hace | Valor de mercado |
|---|---|---|
| **CalcGLP** | Dimensionado de depósito GLP (volumen neto/geométrico → capacidad comercial) + distancias de seguridad RIGLO (RD 919/2006), aéreo y enterrado | **Alto** — tablas de distancias RIGLO completas, tema que genera errores caros en inspección OCA |
| **CalcTuberias** | Cálculo de tuberías por Darcy-Weisbach (cobre/acero/PPR, ACS/calefacción/agua fría/gas): régimen de flujo, factor de fricción, pérdida de carga, validación de velocidad (UNE-EN 1057) | **Alto** — pocas herramientas gratuitas hacen esto bien; ahorra horas de cálculo manual |
| **CalcACS** | Dimensionado de acumulador ACS según CTE DB-HE4 (tabla 4.1, 13 tipos de edificio), potencia de caldera, caudal punta | **Alto** — dato normativo (demanda por tipo de edificio) muy específico de España |
| **Inercia** | Dimensionado de depósito de inercia (RITE IT 1.2.4.6) | Medio-alto |
| **ChecklistOCA** | Checklist de preinspección GLP/RITE con referencias normativas exactas (ITC-ICG-04, UNE 60.250...) | **Alto** — reduce riesgo de rechazo en inspección, algo que preocupa mucho al instalador |
| **ConversorUnidades** | Conversión rápida de unidades | Bajo (commodity, ya existen apps gratis) |
| **SimuladorPrototipos** | BOM paramétrico para 4 instalaciones tipo (GLP, aerotermia, solar térmica, aire comprimido) → coste material + horas + precio | **Medio-alto** — útil para presupuestar rápido a un cliente final |
| **Catálogo Técnico** | 60+ materiales con precio de referencia y normativa asociada | Medio (valor si se mantiene actualizado; hoy es estático) |
| **Obras / Presupuestos / Materiales** | Gestión de proyectos, presupuestos con margen, exportación HTML→PDF | **Bajo/commodity** — ya existen decenas de apps de gestión de obra en el mercado |

**Conclusión clave:** el "motor de cálculo normativo" es el activo defendible; el "gestor de obras" es el envoltorio que lo hace usable pero no es lo que un tercero pagaría por sí solo.

### 1.2 A quién le sirve esto

- Instaladores autónomos de gas/climatización (sin departamento técnico propio).
- Pequeñas empresas instaladoras (2-10 personas) que subcontratan el cálculo técnico o lo hacen "a ojo".
- Ingenierías/oficinas técnicas pequeñas que necesitan memorias justificativas rápidas para proyectos menores.
- Compañeros de profesión (jefes de obra, oficiales) que preparan documentación para OCA y quieren evitar un rechazo.

### 1.3 Aviso legal/profesional (importante, léelo antes de vender nada)

Los cálculos de GLP, RITE y ACS alimentan **documentación que en instalaciones reales requiere firma de instalador autorizado o proyecto visado/certificado por técnico competente** para su presentación ante la OCA o el organismo correspondiente. Vender esto como "informe técnico oficial" sin la habilitación/certificación adecuada (o sin que lo firme quien la tenga) es un riesgo legal y reputacional.

**Cómo venderlo sin ese riesgo:** posiciona el servicio como **"pre-cálculo de apoyo / borrador técnico"** — el cliente (instalador o ingeniero) revisa y firma bajo su propia responsabilidad. Esto es exactamente el mismo modelo que usan hoy softwares de cálculo (CYPE, Presto, hojas de cálculo de fabricantes): la herramienta calcula, el técnico responsable firma. No prometas nunca "certificado válido para inspección" como si tú lo emitieras con validez legal, salvo que tengas la habilitación (instalador autorizado IGA/RITE, o seas ingeniero colegiado ejerciente).

---

## 2. Modelos de Negocio

### 2.1 Modelo SaaS (suscripción)

**Idea:** empaquetar Calculadoras + Catálogo + Checklist + Presupuestos como app multiusuario, con planes mensuales (ej. 15-30 €/mes por instalador o empresa).

**Lo que falta construir (hoy es mono-usuario/demo):**
- Autenticación real (Supabase Auth) y RLS por usuario/empresa (la infraestructura de tablas ya lo soporta, falta activar `auth.uid()` en las políticas).
- Aislamiento multi-tenant (cada empresa ve solo sus obras/presupuestos).
- Pasarela de pago y gestión de suscripción (Stripe Billing o similar).
- Exportación de PDF con marca blanca (logo/datos fiscales del cliente).
- Soporte/onboarding, aunque sea mínimo (documentación, vídeo corto).

**Pros:** ingreso recurrente, escala sin vender tu tiempo.
**Contras:** es la vía de **mayor fricción operativa** — necesitas soporte, mantenimiento, cobros recurrentes, gestión de bajas/altas. Con tu disponibilidad actual (obra + estudios) es difícil sostenerlo sin descuidar calidad.
**Veredicto:** aparcar hasta validar demanda con el modelo de servicio (sección 2.2). No construir nada de esto todavía.

### 2.2 Modelo Consultoría/Servicio ⭐ (recomendado para empezar)

**Idea:** usas GestiObra internamente como tu herramienta de trabajo y vendes el **entregable**, no el software: informes de dimensionado, presupuestos técnicos, checklist de preinspección, para instaladores/empresas que no tienen tiempo o conocimiento normativo.

**Ejemplos de entregables con precio orientativo:**

| Entregable | Contenido | Precio orientativo | Tiempo estimado tuyo |
|---|---|---|---|
| Dimensionado de depósito GLP + distancias de seguridad | Cálculo + memoria en PDF (borrador técnico) | 80-150 € | 1-2 h |
| Cálculo de red de tuberías (ACS/calefacción/gas) | Tabla de pérdidas de carga + validación velocidades | 100-200 € | 1-3 h |
| Dimensionado ACS + inercia | Volumen acumulador, potencia caldera, caudal punta | 80-150 € | 1 h |
| Checklist de preinspección OCA (GLP o RITE) | Revisión guiada + informe de puntos a corregir antes de la inspección | 60-120 € | 1 h |
| Pack completo instalación tipo (presupuesto + memoria técnica + BOM) | Usando SimuladorPrototipos + export | 250-450 € | 3-5 h |

**Pros:** cero fricción de infraestructura (no necesitas auth, cobros recurrentes ni soporte de producto), cobras por trabajo puntual, encaja con tu poco tiempo libre (lo haces por las tardes/fines de semana), y **valida qué le importa realmente al mercado** antes de invertir en construir un SaaS.
**Contras:** no escala solo (tu tiempo es el límite); ingreso no recurrente salvo que fidelices clientes con encargos repetidos.
**Veredicto:** es tu **vía de sobresueldo inmediato**. Ver plan de 30 días (sección 4).

### 2.3 Modelo Licencia (venta de módulos/plantillas)

**Idea intermedia:** en vez de suscripción SaaS completa, vendes acceso puntual (pago único o licencia anual) a módulos concretos ya empaquetados: p. ej. "Pack Calculadoras GLP+RITE+ACS en Excel/PDF interactivo" o "Checklist OCA editable" a 30-60 € por licencia/usuario, sin necesidad de cuenta ni backend multiusuario.

**Cómo evitar construir infraestructura:** puedes vender esto hoy mismo como PDF/hoja de cálculo descargable (Gumroad, Payhip, o incluso venta directa por transferencia/Bizum) sin tocar el código de GestiObra. Es el punto medio entre "cero fricción" (servicio) y "alta fricción" (SaaS).

**Pros:** ingreso semi-pasivo, fricción baja-media, no necesitas mantener sesiones de usuario.
**Contras:** el catálogo debe mantenerse actualizado (normativa cambia) o pierde valor; requiere una acción de marketing (aunque sea mínima) para vender sin trato 1:1.
**Veredicto:** fase 2, una vez tengas 2-3 clientes de servicio que puedan convertirse en compradores de las plantillas o servir de prueba social.

---

## 3. Estrategia de Go-to-Market

### 3.1 De herramienta personal a herramienta comercial — pasos mínimos

1. **Separar "uso interno" de "entregable al cliente":** hoy exportas HTML→PDF de presupuestos; asegúrate de que cada calculadora (CalcGLP, CalcTuberias, CalcACS) tenga también su propio export limpio con tu marca (nombre/marca personal, no "GestiObra Demo") — el componente `ExportCalculo.jsx` ya existe, solo hay que darle una plantilla presentable.
2. **Crear una identidad de servicio simple:** nombre comercial (puede ser tu nombre + "Ingeniería/Cálculos técnicos"), un logo simple, una plantilla de PDF consistente. No hace falta marca registrada ni sociedad para facturar como autónomo/servicio puntual — pero revisa si necesitas alta de autónomo o si puedes facturar como actividad ocasional según tu situación fiscal (factura sin IVA repercutido si aplica el régimen de trabajador que compagina, o pide a un gestor/asesor 15 min de consulta).
3. **Preparar 1-2 casos de ejemplo (portfolio):** usa un proyecto ficticio o uno de tu propia obra (anonimizado) para tener un PDF de muestra que enseñar a un cliente potencial antes de que pague.
4. **Definir el disclaimer legal** (ver sección 1.3) en cada informe: "Documento de apoyo técnico. Requiere revisión y firma del instalador/técnico responsable antes de su presentación oficial."

### 3.2 Qué añadir para que sea escalable (roadmap técnico, no urgente para el mes 1)

Prioridad si decides avanzar hacia Licencia/SaaS más adelante:

1. **Exportación PDF profesional con marca blanca** (logo/datos del cliente instalador) — impacto alto, esfuerzo bajo-medio.
2. **Multi-cliente/multi-empresa** (activar Supabase Auth + RLS por `auth.uid()`, ya hay base de datos preparada) — impacto alto, esfuerzo medio.
3. **Pasarela de pago** (Stripe Checkout para licencias puntuales o suscripción) — impacto alto, esfuerzo medio.
4. **Catálogo de precios actualizable** (hoy es estático; conectar a un feed de proveedor o al menos revisión trimestral) — impacto medio, esfuerzo bajo.
5. **Roles** (jefe de obra vs operario vs cliente lector) — impacto medio, esfuerzo medio. Solo si hay demanda de equipos, no de autónomos individuales.

No construir nada de esto en el mes 1: primero valida con clientes de servicio que el "borrador técnico" tiene demanda real y a qué precio.

---

## 4. Plan de Acción Inmediato — 30 días para tus primeros 2-3 clientes

**Objetivo:** cerrar 2-3 encargos remunerados (150-400 € cada uno) usando lo que ya está construido, sin escribir código nuevo salvo pulir el export en PDF.

### Semana 1 — Empaquetar y preparar (3-4 h de tu tiempo)
- Elegir 2-3 entregables de la tabla de la sección 2.2 como "producto mínimo vendible" (recomendado: Dimensionado GLP + Checklist OCA, porque son los de mayor valor percibido/menor tiempo tuyo).
- Pulir el export PDF de una calculadora (CalcGLP o CalcACS) con tu marca personal y el disclaimer legal.
- Generar 1 ejemplo de muestra (caso ficticio) para enseñar.
- Fijar precios cerrados (no "presupuesto a medida" — un precio fijo por entregable vende más rápido a desconocidos).

### Semana 2 — Prospección (2-3 h)
- Lista de 20-30 contactos: compañeros de la obra actual, contactos de la escuela de ingeniería que trabajen en instaladoras, grupos de Facebook/LinkedIn de gasistas/climatización, foros de instaladores, tu propio jefe/empresa (puede que la propia empresa donde trabajas necesite este apoyo puntual para otras obras).
- Mensaje corto y directo (no vendas "una app", vende el resultado): *"Hago cálculos de dimensionado de depósitos GLP y redes de tuberías con memoria justificativa lista para OCA, en 24-48h. ¿Te sirve para algún proyecto que tengas ahora?"*
- Ofrece el primer encargo con 30-50% de descuento o gratis a cambio de testimonio/referencia, a **máximo 1 persona**, para tener el primer PDF real de referencia.

### Semana 3 — Cerrar y entregar
- Cerrar 1-2 encargos de pago completo.
- Entregar en 24-48h usando GestiObra + export pulido. Cobro por transferencia/Bizum contra entrega.
- Pedir explícitamente una reseña/testimonio corto (aunque sea un WhatsApp que puedas capturar) y permiso para usarlo como referencia.

### Semana 4 — Consolidar y decidir siguiente paso
- Revisar qué entregable tuvo más demanda/mejor margen tiempo-dinero.
- Ajustar precio si el encargo tardó menos/más de lo estimado.
- Decisión: ¿sigues solo con Consultoría/Servicio (repetible cada mes) o hay señales de que 3+ clientes querrían "comprar la plantilla" en vez de encargarte el cálculo cada vez? Si es lo segundo, pasar a explorar el Modelo Licencia (sección 2.3).

**Meta del mes:** 2-3 clientes pagados, 300-800 € de sobresueldo, y validación de qué entregable repetir.

---

## 5. Regla de oro — por qué este orden y no otro

Con tu disponibilidad real (Jefe de Obra + estudiante), el coste de oportunidad de mantener un SaaS (soporte, bugs, cobros recurrentes, usuarios enfadados) es alto y compite directamente con tu tiempo libre limitado. Vender **entregables puntuales usando una herramienta que ya funciona** es la única vía que:

- No requiere construir nada nuevo para empezar a cobrar esta semana.
- No te ata a mantener infraestructura para terceros.
- Te permite parar o pausar sin penalización si un mes no tienes tiempo (a diferencia de una suscripción SaaS activa).
- Sirve como validación de mercado barata antes de invertir esfuerzo en Licencia o SaaS.

---

## Registro de progreso (actualizar aquí)

| Fecha | Evento | Nota |
|---|---|---|
| 2026-07-03 | Documento creado | Plan inicial definido |
