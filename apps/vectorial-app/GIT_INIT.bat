@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║       GestiObra — Inicialización repositorio Git     ║
echo ╚══════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: Verificar que git está instalado
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Git no está instalado. Descárgalo en https://git-scm.com
  pause & exit /b 1
)

:: Inicializar repositorio
echo [1/4] Inicializando repositorio Git...
git init
git branch -M main

:: Configurar identidad (edita con tus datos reales)
echo [2/4] Configurando identidad Git...
git config user.email "cristobalsotoacosta03@gmail.com"
git config user.name "Cristóbal Soto"

:: Añadir todos los archivos
echo [3/4] Añadiendo todos los archivos al staging...
git add .

:: Commit inicial
echo [4/4] Creando commit inicial...
git commit -m "feat: GestiObra v0.1

- Dashboard premium con KPIs reales (obras activas, presupuestos, margen medio)
- Biblia del Instalador: 60 referencias técnicas (Gas, RITE, REBT, Fontanería, Obra Civil)
- Integración Supabase con fallback a datos demo
- Hooks useObras y usePresupuestos con lógica de datos
- Configuración Vercel (vercel.json) para despliegue SPA
- Scripts SQL listos para ejecutar en Supabase Dashboard"

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  ✅ Repositorio listo. Ahora sigue estos pasos:     ║
echo ║                                                      ║
echo ║  1. Ve a https://github.com/new                     ║
echo ║  2. Crea un repo llamado "gestiobra" (privado/pub)  ║
echo ║  3. Copia la URL del repo (ej: ...github.com/...)   ║
echo ║  4. Pega y ejecuta en esta carpeta:                 ║
echo ║                                                      ║
echo ║     git remote add origin TU_URL_DE_GITHUB          ║
echo ║     git push -u origin main                         ║
echo ║                                                      ║
echo ║  5. Luego ve a https://vercel.com para importarlo   ║
echo ╚══════════════════════════════════════════════════════╝
echo.
pause
