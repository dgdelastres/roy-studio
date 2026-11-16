import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Edge, Connection } from '@xyflow/react';
import { Task, Dependency, DependencyType, Department, ProjectCalendar } from './core/roy-engine/types';
import { calculateRoy } from './core/roy-engine/calculator';
import { DEFAULT_PROJECT_CALENDAR } from './core/roy-engine/calendar';
import { PILPIS_PROJECT_TASKS } from './templates/pilpisProject';
import { PILPIS_DEPARTMENTS } from './theme/departments';
import { TopBar, ActiveTab } from './components/navigation/TopBar';
import { RoyCanvas } from './components/roy-canvas/RoyCanvas';
import { GanttView } from './components/gantt/GanttView';
import { TaskTable } from './components/task-table/TaskTable';
import { TaskModal } from './components/task-dialog/TaskModal';
import { ImportModal } from './components/import-dialog/ImportModal';
import { EdgeModal, EdgeEditData } from './components/edge-dialog/EdgeModal';
import { DepartmentModal } from './components/department-dialog/DepartmentModal';
import { CalendarModal } from './components/calendar-dialog/CalendarModal';
import { LayoutDirection } from './components/roy-canvas/layout';
import { exportTasksToExcel } from './utils/export/exportExcel';
import { exportProjectReportPdf } from './utils/export/exportPdf';
import { exportCanvasToPng, exportCanvasToSvg } from './utils/export/exportImage';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>(PILPIS_DEPARTMENTS);
  const [calendar, setCalendar] = useState<ProjectCalendar>(DEFAULT_PROJECT_CALENDAR);
  const [activeTab, setActiveTab] = useState<ActiveTab>('roy');
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [direction, setDirection] = useState<LayoutDirection>('LR');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [edgeToEdit, setEdgeToEdit] = useState<EdgeEditData | null>(null);
  const [newTaskPosition, setNewTaskPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const calculation = useMemo(() => {
    return calculateRoy(tasks);
  }, [tasks]);

  const taskCountsByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      counts[t.departmentId] = (counts[t.departmentId] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.1, x: 0.5 },
      colors: ['#2563EB', '#7C3AED', '#0D9488', '#EA580C', '#16A34A'],
    });
  }, []);

  const handleSaveTask = (savedTask: Task) => {
    setTasks(prev => {
      const exists = prev.some(t => t.id === savedTask.id);
      if (exists) {
        return prev.map(t => (t.id === savedTask.id ? savedTask : t));
      } else {
        const taskWithPos: Task = {
          ...savedTask,
          position: savedTask.position || newTaskPosition || undefined,
        };
        return [...prev, taskWithPos];
      }
    });
    setNewTaskPosition(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev =>
      prev
        .filter(t => t.id !== taskId)
        .map(t => ({
          ...t,
          dependencies: t.dependencies.filter(d => d.predecessorId !== taskId),
        }))
    );
  };

  const handleDuplicateTask = (task: Task) => {
    const newId = `${task.id}_copy`;
    const newTask: Task = {
      ...task,
      id: newId,
      name: `${task.name} (Copia)`,
      dependencies: [...task.dependencies],
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleAddDependency = (
    targetId: string,
    predecessorId: string,
    type: DependencyType = 'FC',
    lag = 0,
    sourceHandle?: string,
    targetHandle?: string
  ) => {
    if (targetId === predecessorId) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === targetId) {
          const alreadyExists = t.dependencies.some(d => d.predecessorId === predecessorId);
          if (alreadyExists) return t;
          return {
            ...t,
            dependencies: [
              ...t.dependencies,
              { predecessorId, type, lag, sourceHandle, targetHandle },
            ],
          };
        }
        return t;
      })
    );
  };

  // Edición de ligadura con doble clic (Punto 2)
  const handleEditDependency = (
    targetId: string,
    predecessorId: string,
    type: DependencyType,
    lag: number,
    routingType?: 'default' | 'orthogonal' | 'free'
  ) => {
    const pred = tasks.find(t => t.id === predecessorId);
    const target = tasks.find(t => t.id === targetId);
    setEdgeToEdit({
      targetId,
      targetName: target?.name || targetId,
      predecessorId,
      predecessorName: pred?.name || predecessorId,
      type,
      lag,
      routingType,
    });
    setIsEdgeModalOpen(true);
  };

  const handleUpdateDependency = (
    targetId: string,
    predecessorId: string,
    type: DependencyType,
    lag: number,
    routingType?: 'default' | 'orthogonal' | 'free'
  ) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === targetId) {
          return {
            ...t,
            dependencies: t.dependencies.map(d =>
              d.predecessorId === predecessorId ? { ...d, type, lag, routingType } : d
            ),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteDependency = (targetId: string, predecessorId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === targetId) {
          return {
            ...t,
            dependencies: t.dependencies.filter(d => d.predecessorId !== predecessorId),
          };
        }
        return t;
      })
    );
  };

  // Desplazamiento y reconexión interactiva de extremos de ligaduras en el contorno (Punto 4)
  const handleReconnectDependency = (oldEdge: Edge, newConnection: Connection) => {
    const oldPredecessorId = oldEdge.source;
    const oldTargetId = oldEdge.target;
    const newPredecessorId = newConnection.source;
    const newTargetId = newConnection.target;
    if (!newPredecessorId || !newTargetId) return;

    const newSourceHandle = newConnection.sourceHandle || undefined;
    const newTargetHandle = newConnection.targetHandle || undefined;

    setTasks(prev => {
      let existingDep: Dependency | undefined;
      const oldTargetTask = prev.find(t => t.id === oldTargetId);
      if (oldTargetTask) {
        existingDep = oldTargetTask.dependencies.find(d => d.predecessorId === oldPredecessorId);
      }
      const depType: DependencyType = existingDep?.type || 'FC';
      const depLag: number = existingDep?.lag || 0;

      return prev.map(task => {
        if (task.id === oldTargetId && (oldTargetId !== newTargetId || oldPredecessorId !== newPredecessorId)) {
          return {
            ...task,
            dependencies: task.dependencies.filter(d => d.predecessorId !== oldPredecessorId),
          };
        }
        if (task.id === newTargetId) {
          const currentDeps = task.dependencies.filter(
            d => d.predecessorId !== (oldTargetId === newTargetId ? oldPredecessorId : '')
          );
          const filtered = currentDeps.filter(d => d.predecessorId !== newPredecessorId);
          filtered.push({
            predecessorId: newPredecessorId,
            type: depType,
            lag: depLag,
            sourceHandle: newSourceHandle,
            targetHandle: newTargetHandle,
          });
          return {
            ...task,
            dependencies: filtered,
          };
        }
        return task;
      });
    });
  };

  const handleLoadPilpisTemplate = () => {
    if (confirm('¿Cargar la plantilla completa del Anteproyecto PILPIS - QUIMISUR (24 meses)? Se reemplazarán los datos actuales.')) {
      setTasks(PILPIS_PROJECT_TASKS);
      setDepartments(PILPIS_DEPARTMENTS);
      setCalendar(prev => ({ ...prev, timeUnit: 'months' }));
      triggerCelebration();
    }
  };

  const handleClearProject = () => {
    if (confirm('¿Deseas vaciar el proyecto para empezar uno nuevo de cero?')) {
      setTasks([]);
    }
  };

  const handleSaveJson = () => {
    const data = {
      version: '1.0',
      projectName: 'Anteproyecto PILPIS - QUIMISUR',
      exportDate: new Date().toISOString(),
      departments,
      tasks: calculation.tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Proyecto_ROY_PILPIS.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTasks = (importedTasks: Task[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setTasks(importedTasks);
    } else {
      setTasks(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const merged = [...prev];
        importedTasks.forEach(item => {
          let uniqueId = item.id;
          if (existingIds.has(uniqueId)) {
            uniqueId = `${item.id}_new`;
          }
          existingIds.add(uniqueId);
          merged.push({ ...item, id: uniqueId });
        });
        return merged;
      });
    }
    triggerCelebration();
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        direction={direction}
        setDirection={setDirection}
        isDark={isDark}
        setIsDark={setIsDark}
        totalDuration={calculation.totalProjectDuration}
        criticalCount={calculation.criticalTasks.length}
        calendar={calendar}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        onLoadPilpisTemplate={handleLoadPilpisTemplate}
        onClearProject={handleClearProject}
        onExportPng={() => exportCanvasToPng('.react-flow', 'Diagrama_ROY_PILPIS.png')}
        onExportSvg={() => exportCanvasToSvg('.react-flow__viewport', 'Diagrama_ROY_PILPIS.svg')}
        onExportExcel={() => exportTasksToExcel(calculation.tasks, 'PILPIS - QUIMISUR')}
        onExportPdf={() =>
          exportProjectReportPdf(
            calculation.tasks,
            calculation.totalProjectDuration,
            calculation.criticalTasks,
            'ANTEPROYECTO PILPIS - QUIMISUR'
          )
        }
        onSaveJson={handleSaveJson}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenDepartmentModal={() => setIsDeptModalOpen(true)}
        onAddTask={() => {
          setTaskToEdit(null);
          setNewTaskPosition(null);
          setIsModalOpen(true);
        }}
      />

      {/* Contenedor principal con persistencia de vistas en DOM para evitar desajustes de cámara (Punto 3) */}
      <main className="flex-1 relative overflow-hidden">
        <div className={`w-full h-full ${activeTab === 'roy' ? 'block' : 'hidden'}`}>
          <RoyCanvas
            tasks={calculation.tasks}
            criticalTasks={calculation.criticalTasks}
            criticalEdges={calculation.criticalEdges}
            viewMode={viewMode}
            direction={direction}
            departments={departments}
            isActive={activeTab === 'roy'}
            timeUnit={calendar.timeUnit}
            onLoadPilpisTemplate={handleLoadPilpisTemplate}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onEditTask={task => {
              setTaskToEdit(task);
              setIsModalOpen(true);
            }}
            onAddTask={(initialPos) => {
              setTaskToEdit(null);
              setNewTaskPosition(initialPos || null);
              setIsModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onDeleteDependency={handleDeleteDependency}
            onReconnectDependency={handleReconnectDependency}
            onAddDependency={handleAddDependency}
            onEditDependency={handleEditDependency}
            hasCycle={calculation.hasCycle}
            cyclePath={calculation.cyclePath}
          />
        </div>

        <div className={`w-full h-full ${activeTab === 'gantt' ? 'block' : 'hidden'}`}>
          <GanttView
            tasks={calculation.tasks}
            totalDuration={calculation.totalProjectDuration}
            departments={departments}
            calendar={calendar}
            onEditTask={task => {
              setTaskToEdit(task);
              setIsModalOpen(true);
            }}
          />
        </div>

        <div className={`w-full h-full ${activeTab === 'table' ? 'block' : 'hidden'}`}>
          <TaskTable
            tasks={calculation.tasks}
            departments={departments}
            calendar={calendar}
            onEditTask={task => {
              setTaskToEdit(task);
              setIsModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onAddTask={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            onDuplicateTask={handleDuplicateTask}
          />
        </div>
      </main>

      {/* Modal de Tarea */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        taskToEdit={taskToEdit}
        allTasks={calculation.tasks}
        departments={departments}
        timeUnit={calendar.timeUnit}
      />

      {/* Modal de Importación */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportTasks={handleImportTasks}
      />

      {/* Modal de Edición de Ligadura (Punto 2) */}
      <EdgeModal
        isOpen={isEdgeModalOpen}
        onClose={() => {
          setIsEdgeModalOpen(false);
          setEdgeToEdit(null);
        }}
        edgeData={edgeToEdit}
        onUpdateDependency={handleUpdateDependency}
        onDeleteDependency={handleDeleteDependency}
      />

      {/* Modal de Gestión de Equipos (Punto 4) */}
      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        departments={departments}
        onSaveDepartments={setDepartments}
        taskCountsByDept={taskCountsByDept}
      />

      {/* Modal de Calendario del Proyecto y Días Festivos */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        calendar={calendar}
        onSaveCalendar={setCalendar}
      />
    </div>
  );
};

export default App;
