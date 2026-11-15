---
name: roy-release-manager
description: Orquesta y ejecuta el ciclo integral de verificación de calidad, versionado semántico, empaquetado dual ultrarrápido (pack:fast en 5 segundos) y publicación automática de Releases oficiales en GitHub con el binario .exe adjunto para ROY Studio. Usar siempre que el usuario pida "lanzar nueva versión", "publicar release", "hacer release", "subir versión a GitHub", "crear v1.X.X", "preparar release" o cuando se finalice un bloque de mejoras y se deba empaquetar y versionar formalmente el proyecto.
---

# ROY Release Manager — Protocolo de Versionado y Publicación

Esta skill automatiza y estandariza el flujo completo de lanzamiento de nuevas versiones de **ROY Studio**, garantizando cero errores en producción mediante puertas de calidad estrictas, empaquetado local instantáneo para pruebas y publicación automatizada en la nube vía GitHub Actions.

---

## 1. Filosofía y Estrategia Híbrida

1. **Prueba Inmediata en Local (Cero Esperas)**:
   - Emplea el comando `npm run pack:fast` (`electron-builder --dir`), que genera la aplicación en **menos de 5 segundos** en `dist-win/win-unpacked/ROY Studio.exe`.
   - Evita la pesada compresión 7-Zip en local, permitiendo al usuario validar inmediatamente los cambios sin consumir CPU de su equipo ni esperar 2 minutos.

2. **Compilación Oficial en la Nube (GitHub Actions)**:
   - Al hacer `git push origin --tags`, el workflow `.github/workflows/release.yml` se dispara automáticamente en servidores de GitHub.
   - Compila el instalador y el ejecutable portable único `.exe` en la nube y crea la Release oficial de GitHub con el binario adjunto para descarga pública.

---

## 2. Flujo de Ejecución Paso a Paso

### Fase 1: Puerta de Calidad Obligatoria (Quality Gates)
Antes de modificar cualquier archivo de versión o etiqueta Git, ejecutar en terminal:
```bash
npm run typecheck    # tsc --noEmit (0 errores permitidos)
npm run test         # vitest run (100% de pruebas pasando)
npm run build        # vite build (compilación web sin fallos de assets)
```
> [!IMPORTANT]
> Si cualquiera de estas tres comprobaciones falla, **abortar de inmediato**. Reportar el error concreto al usuario y no avanzar al versionado.

---

### Fase 2: Interrogación Explícita de Versión
Consultar la versión actual en `package.json` y formular una pregunta interactiva con `ask_question`:
1. **Versión Siguiente**: Proponer el siguiente parche por defecto (ej: si es `1.0.1`, sugerir `(Recommended) v1.0.2 - Parche de correcciones y mejoras`).
2. **Titular del Release**: Solicitar el título o resumen ejecutivo del lanzamiento.

---

### Fase 3: Bump de Versión y Actualización de Changelog
1. **`package.json`**:
   - Actualizar quirúrgicamente `"version": "X.Y.Z"`.
2. **`docs/UPDATES.md`**:
   - Consolidar las novedades pendientes bajo la cabecera oficial:
     ```markdown
     ## [vX.Y.Z] — YYYY-MM-DD (Release Oficial)
     ### 🚀 Novedades y Mejoras Consolidadas
     ...
     ```

---

### Fase 4: Empaquetado Local Ultrarrápido (`pack:fast`)
Generar el binario local desempaquetado para que el usuario pueda abrirlo de inmediato:
```bash
npm run pack:fast
```
- Ubicación resultante: `dist-win/win-unpacked/ROY Studio.exe` (compilación en ~5 segundos).

---

### Fase 5: Commit Semántico, Tag y Disparo en GitHub
1. **Commit de Release**:
   ```bash
   git add package.json docs/UPDATES.md
   git commit -m "chore(release): bump version to vX.Y.Z"
   ```
2. **Etiqueta Git Anotada**:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z - <Titular>"
   ```
3. **Push a GitHub (Rama y Tags)**:
   ```bash
   git push origin main
   git push origin --tags
   ```

---

### Fase 6: Confirmación al Usuario
Proporcionar un resumen claro con:
- Enlace al ejecutable local listo para abrir: `[dist-win/win-unpacked/ROY Studio.exe](file:///...)`.
- Enlace a la sección de Releases de GitHub: `https://github.com/dgdelastres/roy-studio/releases/tag/vX.Y.Z`.
- Enlace al flujo de compilación en GitHub Actions: `https://github.com/dgdelastres/roy-studio/actions`.
