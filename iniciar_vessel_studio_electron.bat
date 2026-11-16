@echo off
title PILPIS Vessel Studio (Desktop App)
echo =====================================================================
echo   Iniciando PILPIS Vessel Studio en Ventana Nativa de Escritorio
echo =====================================================================
echo.
echo [1/2] Iniciando Backend Python (FastAPI en http://127.0.0.1:8000)...
start "VesselStudio-Backend" /B "%USERPROFILE%\.local\bin\uv.exe" run --with fastapi --with uvicorn --with openpyxl --with python-docx python diseno_recipientes\backend\api.py
timeout /t 2 /nobreak >nul
echo.
echo [2/2] Iniciando Aplicacion Electron Desktop...
npm run electron:dev
pause
