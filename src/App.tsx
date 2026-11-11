import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Task, DependencyType } from './core/roy-engine/types';
import { calculateRoy } from './core/roy-engine/calculator';
import { PILPIS_PROJECT_TASKS } from './templates/pilpisProject';
import { TopBar, ActiveTab } from './components/navigation/TopBar';
import { RoyCanvas } from './components/roy-canvas/RoyCanvas';
import { GanttView } from './components/gantt/GanttView';
import { TaskTable } from './components/task-table/TaskTable';
import { TaskModal } from './components/task-dialog/TaskModal';
import { LayoutDirection } from './components/roy-canvas/layout';
import { exportTasksToExcel } from './utils/export/exportExcel';
import { exportProjectReportPdf } from './utils/export/exportPdf';
import { exportCanvasToPng, exportCanvasToSvg } from './utils/export/exportImage';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(PILPIS_PROJECT_TASKS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('roy');
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [direction, setDirection] = useState<LayoutDirection>('LR');
  const [isDark, setIsDark] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

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
        return [...prev, savedTask];
      }
    });
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
    lag = 0
  ) => {
    if (targetId === predecessorId) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === targetId) {
          const alreadyExists = t.dependencies.some(d => d.predecessorId === predecessorId);
          if (alreadyExists) return t;
          return {
            ...t,
            dependencies: [...t.dependencies, { predecessorId, type, lag }],
          };
        }
        return t;
      })
    );
  };

  const handleLoadPilpisTemplate = () => {
    if (confirm('¿Cargar la plantilla completa del Anteproyecto PILPIS - QUIMISUR (24 meses)? Se reemplazarán los datos actuales.')) {
      setTasks(PILPIS_PROJECT_TASKS);
      triggerCelebration();
    }
  };

  const handleClearProject = () => {
    if (confirm('¿Deseas vaciar el proyecto para empezar uno nuevo de cero?')) {
      setTasks([
        {
          id: 'T01',
          name: 'Primera Actividad del Proyecto',
          duration: 2,
          departmentId: 'D1',
          dependencies: [],
        },
      ]);
    }
  };

  const handleSaveJson = () => {
    const data = {
      version: '1.0',
      projectName: 'Anteproyecto PILPIS - QUIMISUR',
      exportDate: new Date().toISOString(),
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

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
          triggerCelebration();
        } else if (Array.isArray(parsed)) {
          setTasks(parsed);
          triggerCelebration();
        } else {
          alert('El archivo JSON no tiene un formato válido de tareas ROY.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
        onLoadJson={handleLoadJson}
      />

      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'roy' && (
          <RoyCanvas
            tasks={calculation.tasks}
            criticalTasks={calculation.criticalTasks}
            criticalEdges={calculation.criticalEdges}
            viewMode={viewMode}
            direction={direction}
            onEditTask={task => {
              setTaskToEdit(task);
              setIsModalOpen(true);
            }}
            onAddDependency={handleAddDependency}
            hasCycle={calculation.hasCycle}
            cyclePath={calculation.cyclePath}
          />
        )}

        {activeTab === 'gantt' && (
          <GanttView
            tasks={calculation.tasks}
            totalDuration={calculation.totalProjectDuration}
            onEditTask={task => {
              setTaskToEdit(task);
              setIsModalOpen(true);
            }}
          />
        )}

        {activeTab === 'table' && (
          <TaskTable
            tasks={calculation.tasks}
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
        )}
      </main>

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
      />
    </div>
  );
};

export default App;
