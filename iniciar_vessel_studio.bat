@echo off
title PILPIS Vessel Studio — Calculadora ASME VIII Div 1
echo =====================================================================
echo   Iniciando PILPIS Vessel Studio (Oficina Tecnica - DPTO 2)
echo   Calculadora ASME VIII Div 1 y Generador de Data Sheets y Memorias
echo =====================================================================
echo.
echo [1/2] Iniciando Backend Python (FastAPI en http://127.0.0.1:8000)...
start "VesselStudio-Backend" /B "%USERPROFILE%\.local\bin\uv.exe" run --with fastapi --with uvicorn --with openpyxl --with python-docx python diseno_recipientes\backend\api.py
timeout /t 2 /nobreak >nul
echo.
echo [2/2] Iniciando Interfaz Grafica en el navegador...
start http://localhost:5173
npm run dev
pause
