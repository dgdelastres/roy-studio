import html2canvas from 'html2canvas';

export async function exportCanvasToPng(elementSelector = '.react-flow', filename = 'Diagrama_ROY_PILPIS.png') {
  const element = document.querySelector(elementSelector) as HTMLElement;
  if (!element) {
    alert('No se pudo encontrar el canvas para exportar.');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8fafc',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error al exportar PNG:', err);
    alert('Ocurrió un error al generar la imagen PNG.');
  }
}

export function exportCanvasToSvg(elementSelector = '.react-flow__viewport', filename = 'Diagrama_ROY_PILPIS.svg') {
  const element = document.querySelector(elementSelector) as HTMLElement;
  if (!element) {
    alert('No se pudo encontrar el elemento gráfico para exportar.');
    return;
  }

  try {
    const bbox = element.getBoundingClientRect();
    const width = Math.max(800, bbox.width);
    const height = Math.max(600, bbox.height);

    const serializer = new XMLSerializer();
    const content = serializer.serializeToString(element);

    const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
    text { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      ${content}
    </div>
  </foreignObject>
</svg>`;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error al exportar SVG:', err);
    alert('Ocurrió un error al generar el archivo SVG vectorial.');
  }
}
