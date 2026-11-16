import React, { useState } from 'react';
import { UpdateInfo, openExternalUrl } from '../../utils/updates/checkUpdate';
import {
  DownloadCloud,
  ExternalLink,
  Sparkles,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen || !updateInfo) return null;

  const handleDownload = () => {
    openExternalUrl(updateInfo.downloadUrl);
    if (dontShowAgain) {
      try {
        localStorage.setItem('roy_dismissed_update_version', updateInfo.latestVersion);
      } catch {}
    }
    onClose();
  };

  const handleOpenReleasePage = () => {
    openExternalUrl(updateInfo.releaseUrl);
  };

  const handleDismiss = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('roy_dismissed_update_version', updateInfo.latestVersion);
      } catch {}
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                Nueva Versión Disponible
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hay una actualización oficial de ROY Studio en GitHub
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido / Comparador de versiones y Changelog */}
        <div className="p-6 space-y-4 text-xs">
          {/* Tarjeta de Salto de Versión */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tu versión actual</span>
              <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                v{updateInfo.currentVersion}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="space-y-0.5 text-right">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3 h-3" /> Nueva versión
              </span>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {updateInfo.latestVersion}
              </div>
            </div>
          </div>

          {/* Notas de la Versión / Novedades */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
              <span>Novedades y mejoras incluidas:</span>
              <button
                type="button"
                onClick={handleOpenReleasePage}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-normal text-[11px] cursor-pointer"
              >
                <span>Ver en GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-44 overflow-y-auto p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 font-sans text-slate-700 dark:text-slate-300 text-xs leading-relaxed space-y-1 whitespace-pre-wrap select-text">
              {updateInfo.releaseNotes}
            </div>
          </div>

          {/* Opción para no volver a preguntar sobre esta versión específica */}
          <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>No volver a mostrar este aviso para la versión {updateInfo.latestVersion}</span>
          </label>
        </div>

        {/* Botones de Acción */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Recordármelo más tarde
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Descargar {updateInfo.latestVersion} (.exe)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
