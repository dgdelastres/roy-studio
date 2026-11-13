# Script de Empaquetado Silencioso (Zero-Token Overhead)
# Redirige logs verborreicos a archivo local y solo reporta el resultado final en 1 sola línea.

$ErrorActionPreference = "Stop"
$logPath = "dist-win\build-silent.log"

# Asegurar directorio de salida y cerrar instancias previas para liberar archivos
if (-not (Test-Path "dist-win")) {
    New-Item -ItemType Directory -Path "dist-win" -Force | Out-Null
}
Stop-Process -Name "ROY Studio" -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

try {
    # 1. Compilación de producción (Vite + TypeScript)
    $null = cmd.exe /c "npm run build > `"$logPath`" 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Falló 'npm run build'. Detalles en $logPath"
        Get-Content $logPath -Tail 15
        exit $LASTEXITCODE
    }

    # 2. Empaquetado portable con Electron Builder
    $null = cmd.exe /c "npx electron-builder --win portable >> `"$logPath`" 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Falló 'electron-builder'. Detalles en $logPath"
        Get-Content $logPath -Tail 15
        exit $LASTEXITCODE
    }

    # 3. Localizar binario generado
    $exe = Get-ChildItem -Path "dist-win" -Filter "*.exe" | Where-Object { $_.Name -like "*ROY Studio*portable*.exe" -or $_.Name -eq "ROY Studio 1.0.0.exe" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if ($exe) {
        $mb = [math]::Round($exe.Length / 1MB, 2)
        Write-Host "SUCCESS: $($exe.FullName) | $mb MB"
        exit 0
    } else {
        Write-Host "WARNING: Proceso terminado sin errores pero no se localizó el archivo .exe en dist-win."
        exit 1
    }
} catch {
    Write-Host "EXCEPTION: $_"
    exit 1
}
