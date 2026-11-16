# Script de Fast Desktop Unpack Build para Vessel Studio
# Cierra instancias previas para evitar bloqueos EBUSY y empaqueta en segundos
$ErrorActionPreference = "SilentlyContinue"
Stop-Process -Name "*Studio*" -Force
Start-Sleep -Milliseconds 400
Remove-Item -Recurse -Force "dist-win\win-unpacked"

$ErrorActionPreference = "Stop"
npm run build
npx electron-builder --dir
