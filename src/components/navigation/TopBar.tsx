import React, { useState, useRef, useEffect } from 'react';
import {
  Network,
  Calendar,
  CalendarDays,
  Table as TableIcon,
  Sun,
  Moon,
  Download,
  Upload,
  Users,
  Save,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  Columns,
  FileSpreadsheet,
  FileText,
  Image,
  Plus,
} from 'lucide-react';
import { LayoutDirection } from '../roy-canvas/layout';
import { ProjectCalendar } from '../../core/roy-engine/types';
import { getTimeUnitLabel, getTimeUnitShort } from '../../core/roy-engine/calendar';

export type ActiveTab = 'roy' | 'gantt' | 'table' | 'calendar';

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
  calendar?: ProjectCalendar;
  onOpenCalendarModal?: () => void;
  onLoadPilpisTemplate: () => void;
  onClearProject: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onSaveJson: () => void;
  onOpenImportModal: () => void;
  onOpenDepartmentModal: () => void;
  onAddTask: () => void;
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
  calendar,
  onOpenCalendarModal,
  onLoadPilpisTemplate,
  onClearProject,
  onExportPng,
  onExportSvg,
  onExportExcel,
  onExportPdf,
  onSaveJson,
  onOpenImportModal,
  onOpenDepartmentModal,
  onAddTask,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportAction = (action: () => void) => {
    setIsExportOpen(false);
    action();
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-mono font-black text-sm shadow-md shadow-blue-500/20">
            R
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                ROY Studio
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Proyectos de Ingeniería · PILPIS S.A.
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Tab navigation */}
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'table'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Tabla
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendario
          </button>
        </div>
      </div>

      {/* KPI Project Summary */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span>Duración Total:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
            {totalDuration}{' '}
            <span className="text-[11px] font-normal">
              {calendar ? getTimeUnitLabel(calendar.timeUnit, totalDuration) : 'meses'}
            </span>
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

      {/* Actions */}
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

        {/* Acceso rápido a Nueva Tarea (Botón Principal) */}
        <button
          onClick={onAddTask}
          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
          title="Crear una nueva tarea en el proyecto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Tarea</span>
        </button>

        {/* Botón Gestión de Equipos y Departamentos (Punto 4) */}
        <button
          onClick={onOpenDepartmentModal}
          className="px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-900/80 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          title="Gestionar equipos técnicos, cambiar nombres y paletas de color"
        >
          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">Equipos</span>
        </button>

        {/* Botón Calendario y Escala Temporal */}
        {onOpenCalendarModal && (
          <button
            onClick={onOpenCalendarModal}
            className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/80 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Configurar calendario de proyecto: fecha de inicio, festivos y unidad temporal (días, semanas, meses)"
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Calendario</span>
            {calendar && (
              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {getTimeUnitShort(calendar.timeUnit)}
              </span>
            )}
          </button>
        )}

        {/* Botón Importar dedicado */}
        <button
          onClick={onOpenImportModal}
          className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          title="Importar tareas desde Excel (.xlsx) o archivo JSON de compañeros"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Importar</span>
        </button>

        {/* Menú Desplegable Exportar */}
        <div
          className="relative"
          ref={exportRef}
          onMouseEnter={() => setIsExportOpen(true)}
          onMouseLeave={() => setIsExportOpen(false)}
        >
          <button
            onClick={() => setIsExportOpen(prev => !prev)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          {isExportOpen && (
            <div className="absolute right-0 top-full pt-1.5 w-56 z-50 animate-in fade-in duration-100">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-1">
                  <button
                    onClick={() => handleExportAction(onExportSvg)}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Exportar SVG Vectorial (ROY)</span>
                  </button>
                  <button
                    onClick={() => handleExportAction(onExportPng)}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Image className="w-4 h-4 text-emerald-500" />
                    <span>Exportar Imagen PNG HD (2x)</span>
                  </button>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleExportAction(onExportExcel)}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>Exportar a Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => handleExportAction(onExportPdf)}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>Informe Técnico PDF (Memoria)</span>
                  </button>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleExportAction(onSaveJson)}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4 text-blue-500" />
                    <span>Guardar Proyecto (.json)</span>
                  </button>
                  <button
                    onClick={() => handleExportAction(onLoadPilpisTemplate)}
                    className="w-full px-3 py-1.5 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Cargar Caso PILPIS (24 meses)</span>
                  </button>
                  <button
                    onClick={() => handleExportAction(onClearProject)}
                    className="w-full px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Nuevo Proyecto Vacío</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
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
