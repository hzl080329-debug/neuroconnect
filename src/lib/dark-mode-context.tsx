'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DarkModeCtx { dark: boolean; toggle: () => void; }
const DarkModeContext = createContext<DarkModeCtx>({ dark: false, toggle: () => {} });

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nc-dark');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved !== null ? saved === 'true' : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    setReady(true);
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
