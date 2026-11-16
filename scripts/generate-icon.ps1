# Script para generar icono oficial de ROY Studio (256x256 en PNG e ICO)
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path 'build')) {
    New-Item -ItemType Directory -Path 'build' -Force | Out-Null
}

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 56
$diameter = $radius * 2
$arc = New-Object System.Drawing.Rectangle(0, 0, $diameter, $diameter)

# Top-left arc
$path.AddArc($arc, 180, 90)
# Top-right arc
$arc.X = $size - $diameter
$path.AddArc($arc, 270, 90)
# Bottom-right arc
$arc.Y = $size - $diameter
$path.AddArc($arc, 0, 90)
# Bottom-left arc
$arc.X = 0
$path.AddArc($arc, 90, 90)
$path.CloseFigure()

# Background Gradient técnico
$color1 = [System.Drawing.ColorTranslator]::FromHtml('#2563EB')
$color2 = [System.Drawing.ColorTranslator]::FromHtml('#1D4ED8')
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45.0)
$g.FillPath($brush, $path)

# Dibujar monograma 'R'
$font = New-Object System.Drawing.Font('Arial Black', 115, [System.Drawing.FontStyle]::Bold)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

# Sombra suave
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 0, 0, 0))
$shadowRect = New-Object System.Drawing.RectangleF(0, 8, $size, $size)
$g.DrawString('R', $font, $shadowBrush, $shadowRect, $format)

# Texto blanco
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$textRect = New-Object System.Drawing.RectangleF(0, 4, $size, $size)
$g.DrawString('R', $font, $whiteBrush, $textRect, $format)

$g.Dispose()

# Guardar PNG
$pngPath = 'build/icon.png'
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Envolver en formato ICO para Windows
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$icoPath = 'build/icon.ico'
$fs = [System.IO.File]::OpenWrite($icoPath)
$bw = New-Object System.IO.BinaryWriter($fs)

# ICONDIR
$bw.Write([UInt16]0) # Reserved
$bw.Write([UInt16]1) # Type 1 = ICO
$bw.Write([UInt16]1) # Count = 1

# ICONDIRENTRY
$bw.Write([Byte]0)   # Width 0 = 256
$bw.Write([Byte]0)   # Height 0 = 256
$bw.Write([Byte]0)   # Color count
$bw.Write([Byte]0)   # Reserved
$bw.Write([UInt16]1) # Color planes
$bw.Write([UInt16]32)# BPP
$bw.Write([UInt32]$pngBytes.Length) # Image size
$bw.Write([UInt32]22) # Offset (6 header + 16 entry = 22)

# Image data
$bw.Write($pngBytes)
$bw.Flush()
$fs.Close()
$bmp.Dispose()

Write-Host "Icono generado con exito: $icoPath ($($pngBytes.Length) bytes)"
