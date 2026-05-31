'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DarkModeCtx { dark: boolean; toggle: () => void; }
const DarkModeContext = createContext<DarkModeCtx>({ dark: false, toggle: () => {} });

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nc-dark');
    const isDark = saved !== null ? saved === 'true' : getSystemDark();
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    // Listen for system changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('nc-dark');
      if (saved === null) {
        setDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem('nc-dark', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
