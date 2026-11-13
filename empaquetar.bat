@echo off
chcp 65001 >nul
title ROY Studio — Empaquetador Portable Windows (.exe)
color 0B
cls
echo ===============================================================================
echo                ROY STUDIO — EMPAQUETADOR PORTABLE WINDOWS (.EXE)
echo ===============================================================================
echo.
echo [1/2] Compilando bundles de produccion (TypeScript + Vite)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Falló la compilación de Vite / TypeScript. Revisa los errores anteriores.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Empaquetando binario portable con Electron Builder...
call npx electron-builder --win portable
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Falló la generación del ejecutable portable de Electron.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===============================================================================
echo  ✅ EMPAQUETADO COMPLETADO EXITOSAMENTE
echo  Ubicación: dist-win\ROY Studio 1.0.0.exe
echo ===============================================================================
echo.
echo Abriendo la carpeta en el Explorador de Windows...
explorer "dist-win"
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
