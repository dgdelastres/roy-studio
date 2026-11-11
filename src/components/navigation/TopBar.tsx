import React from 'react';
import {
  Network,
  Calendar,
  Table as TableIcon,
  Sun,
  Moon,
  Download,
  FolderOpen,
  Save,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  Columns,
  FileSpreadsheet,
  FileText,
  Image,
} from 'lucide-react';
import { LayoutDirection } from '../roy-canvas/layout';

export type ActiveTab = 'roy' | 'gantt' | 'table';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  viewMode: 'full' | 'compact';
  setViewMode: (mode: 'full' | 'compact') => void;
  direction: LayoutDirection;
  setDirection: (dir: LayoutDirection) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  totalDuration: number;
  criticalCount: number;
  onLoadPilpisTemplate: () => void;
  onClearProject: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onSaveJson: () => void;
  onLoadJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  direction,
  setDirection,
  isDark,
  setIsDark,
  totalDuration,
  criticalCount,
  onLoadPilpisTemplate,
  onClearProject,
  onExportPng,
  onExportSvg,
  onExportExcel,
  onExportPdf,
  onSaveJson,
  onLoadJson,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between gap-3 shrink-0 select-none z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-mono font-bold shadow-md shadow-blue-500/20 text-sm">
            ROY
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                ROY Studio
              </span>
              <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                MPM
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Proyectos de Ingeniería · PILPIS S.A.
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('roy')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'roy'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Red ROY
          </button>
          <button
            onClick={() => setActiveTab('gantt')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'gantt'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Gantt
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'table'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Tabla
          </button>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span>Duración Total:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
            {totalDuration} <span className="text-[11px] font-normal">meses</span>
          </span>
        </div>
        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span>Camino Crítico:</span>
          <span className="font-bold text-red-600 dark:text-red-400">
            {criticalCount} <span className="text-[11px] font-normal">tareas</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeTab === 'roy' && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode(viewMode === 'full' ? 'compact' : 'full')}
              className="px-2 py-1 rounded text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Alternar entre Vista Académica (8 cuadrantes) y Vista Compacta"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              {viewMode === 'full' ? '8 Campos' : 'Compacta'}
            </button>

            <button
              onClick={() => setDirection(direction === 'LR' ? 'TB' : 'LR')}
              className="px-2 py-1 rounded text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Cambiar orientación de auto-layout (Horizontal / Vertical)"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              {direction === 'LR' ? 'Horizontal' : 'Vertical'}
            </button>
          </div>
        )}

        <button
          onClick={onLoadPilpisTemplate}
          className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Cargar la plantilla oficial del Anteproyecto PILPIS (24 meses)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Caso PILPIS</span>
        </button>

        <div className="relative group">
          <button className="px-2.5 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 hidden group-hover:block divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-1">
              <button
                onClick={onExportSvg}
                className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Exportar SVG Vectorial (ROY)</span>
              </button>
              <button
                onClick={onExportPng}
                className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2"
              >
                <Image className="w-4 h-4 text-emerald-500" />
                <span>Exportar Imagen PNG HD (2x)</span>
              </button>
            </div>
            <div className="py-1">
              <button
                onClick={onExportExcel}
                className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span>Exportar a Excel (.xlsx)</span>
              </button>
              <button
                onClick={onExportPdf}
                className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>Informe Técnico PDF (Memoria)</span>
              </button>
            </div>
            <div className="py-1">
              <button
                onClick={onSaveJson}
                className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-blue-500" />
                <span>Guardar Proyecto (.json)</span>
              </button>
              <label className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>Cargar Proyecto (.json)</span>
                <input type="file" accept=".json" onChange={onLoadJson} className="hidden" />
              </label>
              <button
                onClick={onClearProject}
                className="w-full px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Nuevo Proyecto Vacío</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Cambiar a Tema Claro Técnico' : 'Cambiar a Tema Oscuro Moderno'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
