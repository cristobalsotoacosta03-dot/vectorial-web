@echo off
title GestiObra — Setup Completo
color 0A
echo.
echo  =====================================================
echo   GESTIOBRA — INSTALACION COMPLETA
echo  =====================================================
echo.

echo  [1/4] Instalando dependencias npm...
cd /d "%~dp0"
call npm install
echo  OK
echo.

echo  [2/4] Instalando Cline en VS Code...
call code --install-extension saoudrizwan.claude-dev
echo  OK
echo.

echo  [3/4] Instalando Vercel CLI globalmente...
call npm install -g vercel
echo  OK
echo.

echo  [4/4] Iniciando sesion en Vercel y desplegando...
echo  (Se abrira el navegador para autenticarte en Vercel)
echo.
call npx vercel --yes
echo.

echo  =====================================================
echo   TODO LISTO. Recarga VS Code para activar Cline.
echo  =====================================================
echo.
pause
