import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  Layers,
} from 'lucide-react';
import { Task } from '../../core/roy-engine/types';
import {
  parseProjectJson,
  parseProjectExcel,
  downloadExcelTemplate,
  ImportResult,
} from '../../utils/import/importProject';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTasks: (tasks: Task[], mode: 'replace' | 'append') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportTasks,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'json') {
      const text = await file.text();
      const res = parseProjectJson(text);
      if (res.success) {
        setImportResult(res);
      } else {
        setErrorMessage(res.error || 'Error al analizar el archivo JSON.');
        setImportResult(null);
      }
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer();
      const res = parseProjectExcel(buffer);
      if (res.success) {
        setImportResult(res);
      } else {
        setErrorMessage(res.error || 'Error al procesar la hoja de cálculo Excel.');
        setImportResult(null);
      }
    } else {
      setErrorMessage('Formato no soportado. Por favor sube un archivo Excel (.xlsx, .xls) o JSON (.json).');
      setImportResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (importResult && importResult.tasks.length > 0) {
      onImportTasks(importResult.tasks, importMode);
      handleClose();
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setFileName('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Importar Proyecto a ROY Studio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Carga tareas y dependencias desde Excel (.xlsx) o JSON de compañeros
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Haz clic para examinar o arrastra aquí tu archivo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formatos soportados: <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">Excel (.xlsx, .xls)</span> o <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">JSON (.json)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¿No tienes el formato exacto? Descarga nuestra plantilla para rellenar:</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadExcelTemplate();
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Plantilla Excel
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <strong className="font-semibold">Error al importar:</strong> {errorMessage}
              </div>
            </div>
          )}

          {importResult && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {fileName}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {importResult.tasks.length} actividades detectadas
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold sticky top-0">
                    <tr>
                      <th className="px-2 py-1">ID</th>
                      <th className="px-2 py-1">Nombre</th>
                      <th className="px-2 py-1">Dpto</th>
                      <th className="px-2 py-1">Dur</th>
                      <th className="px-2 py-1">Predecesoras</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {importResult.tasks.slice(0, 5).map((t) => (
                      <tr key={t.id}>
                        <td className="px-2 py-1 font-bold text-blue-600 dark:text-blue-400">{t.id}</td>
                        <td className="px-2 py-1 font-sans truncate max-w-[160px]" title={t.name}>{t.name}</td>
                        <td className="px-2 py-1 text-slate-500">{t.departmentId}</td>
                        <td className="px-2 py-1 font-bold">{t.duration}m</td>
                        <td className="px-2 py-1 text-slate-500 truncate max-w-[120px]">
                          {t.dependencies.length > 0
                            ? t.dependencies.map(d => `${d.predecessorId}(${d.type}${d.lag ? (d.lag > 0 ? `+${d.lag}` : d.lag) : ''})`).join(', ')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importResult.tasks.length > 5 && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                  ... y {importResult.tasks.length - 5} tareas adicionales listas para importar.
                </p>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Modo:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Reemplazar proyecto actual</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Añadir a tareas actuales</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Excel
            </span>
            <span className="flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-indigo-500" /> JSON
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!importResult || importResult.tasks.length === 0}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                importResult && importResult.tasks.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Importar {importResult ? `${importResult.tasks.length} Tareas` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
