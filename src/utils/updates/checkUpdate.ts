/**
 * Módulo de comprobación y notificación de actualizaciones oficiales desde GitHub Releases
 * Repositorio: https://github.com/dgdelastres/roy-studio
 */

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  releaseUrl: string;
  downloadUrl: string;
  installerUrl?: string;
  portableUrl?: string;
  zipUrl?: string;
  publishedAt: string;
  hasUpdate: boolean;
}

export const CURRENT_VERSION = '1.0.3';
export const GITHUB_REPO = 'dgdelastres/roy-studio';

/**
 * Compara dos cadenas semver (ej: "1.0.1" vs "v1.0.2")
 * Retorna:
 *  1 si v2 es más reciente que v1 (hay actualización)
 *  0 si son iguales
 * -1 si v1 es más reciente que v2
 */
export function compareVersions(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/i, '').trim();
  const parts1 = clean(v1).split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = clean(v2).split('.').map(p => parseInt(p, 10) || 0);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num2 > num1) return 1;
    if (num2 < num1) return -1;
  }
  return 0;
}

/**
 * Consulta la API pública de GitHub para obtener la última release publicada
 */
export async function checkForUpdates(currentVersion: string = CURRENT_VERSION): Promise<UpdateInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const latestTag = data.tag_name || data.name || '';
    if (!latestTag) return null;

    const hasUpdate = compareVersions(currentVersion, latestTag) > 0;

    // Buscar los assets oficiales de Windows (Instalador Setup, Portable y ZIP)
    const assets = Array.isArray(data.assets) ? data.assets : [];
    const installerAsset = assets.find((a: { name?: string; browser_download_url?: string }) => {
      const name = (a.name || '').toLowerCase();
      return name.endsWith('.exe') && name.includes('setup');
    });
    const portableAsset = assets.find((a: { name?: string; browser_download_url?: string }) => {
      const name = (a.name || '').toLowerCase();
      return name.endsWith('.exe') && (name.includes('portable') || !name.includes('setup'));
    });
    const zipAsset = assets.find((a: { name?: string; browser_download_url?: string }) => {
      const name = (a.name || '').toLowerCase();
      return name.endsWith('.zip');
    });

    const downloadUrl = installerAsset?.browser_download_url || portableAsset?.browser_download_url || data.html_url;

    return {
      currentVersion,
      latestVersion: latestTag.startsWith('v') ? latestTag : `v${latestTag}`,
      releaseName: data.name || latestTag,
      releaseNotes: data.body || 'Correcciones y mejoras generales de estabilidad.',
      releaseUrl: data.html_url,
      downloadUrl,
      installerUrl: installerAsset?.browser_download_url,
      portableUrl: portableAsset?.browser_download_url,
      zipUrl: zipAsset?.browser_download_url,
      publishedAt: data.published_at || '',
      hasUpdate,
    };
  } catch {
    // Si no hay conexión o falla la consulta, no interrumpir la experiencia de usuario
    return null;
  }
}

/**
 * Abre una URL externa en el navegador del sistema
 */
export function openExternalUrl(url: string): void {
  try {
    const win = window as unknown as { electronAPI?: { openExternal?: (url: string) => Promise<boolean> } };
    if (win.electronAPI?.openExternal) {
      win.electronAPI.openExternal(url);
      return;
    }
  } catch {
    // Fallback a window.open
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
