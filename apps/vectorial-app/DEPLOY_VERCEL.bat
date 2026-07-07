@echo off
title GestiObra — Deploy a Vercel
echo.
echo  ============================================
echo   GestiObra — Deploy automatico a Vercel
echo  ============================================
echo.
echo  Si es la primera vez, el navegador se abrira
echo  automaticamente para iniciar sesion en Vercel.
echo.
cd /d "%~dp0"
npx vercel --yes
echo.
echo  ============================================
echo   Deploy completado. Revisa la URL de arriba.
echo  ============================================
pause
