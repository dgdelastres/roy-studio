import React, { useState, useEffect } from 'react';
import { VesselStudio } from './components/vessel-calculator/VesselStudio';

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pilpis_theme');
      if (saved) return saved === 'dark';
    } catch {
      // ignore
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('pilpis_theme', 'dark');
      } catch {
        // ignore
      }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('pilpis_theme', 'light');
      } catch {
        // ignore
      }
    }
  }, [isDark]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <VesselStudio isDark={isDark} onToggleDark={() => setIsDark(prev => !prev)} />
    </div>
  );
};

export default App;
