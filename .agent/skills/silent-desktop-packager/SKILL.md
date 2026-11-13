---
name: silent-desktop-packager
description: >-
  Empaqueta la aplicación Electron de ROY Studio en ejecutable Windows portable (.exe) con salida limpia y silenciosa,
  suprimiendo al 100% los logs verborreicos de terminal para evitar el gasto innecesario de tokens y contexto.
---

# Silent Desktop Packager (Empaquetado Silencioso de ROY Studio)

Esta skill permite compilar y empaquetar el ejecutable portable de Windows (`.exe`) sin saturar la ventana de contexto del LLM con cientos de líneas de logs innecesarios de Electron Builder, Vite o 7-Zip.

## ¿Cuándo Usar Esta Skill?
- Siempre que el usuario solicite: "empaqueta la app", "genera el .exe", "compila el ejecutable", "actualiza el portable" o similar.

## Principio de Eficiencia de Tokens (Zero-Token Overhead)
1. **Salida Suprimida al 100%**:
   - Queda terminantemente prohibido ejecutar `npx electron-builder` o `npm run electron:build` directamente en la terminal interactiva sin redirección, ya que arroja decenas de líneas de advertencias de certificados, dependencias y estados de descompresión al contexto.
2. **Uso Exclusivo del Runner Silencioso**:
   - Ejecutar únicamente:
     ```powershell
     powershell -ExecutionPolicy Bypass -File scripts/build-portable-silent.ps1
     ```
     o bien:
     ```bash
     npm run pack:silent
     ```
3. **Respuesta Concisa**:
   - El script emitirá una única línea limpia de éxito: `SUCCESS: <ruta> | <peso> MB` o las últimas líneas de error si falla.
   - La respuesta al usuario debe ser directa y compacta (1 o 2 líneas), proporcionando el enlace clicable al archivo `.exe` generado sin preámbulos ceremoniales.

## Alternativa Local de Cero Tokens para el Usuario
Si el usuario desea empaquetar fuera de la conversación sin consumir tokens de IA, puede ejecutar directamente con doble clic en Windows:
- `empaquetar.bat` (ubicado en la raíz del proyecto).
