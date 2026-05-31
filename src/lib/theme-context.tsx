'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const BG_OPTIONS = [
  { key: 'cool', label: '冷白', labelEn: 'Cool White', bg: '#FAFAFA' },
  { key: 'light', label: '浅灰', labelEn: 'Light Gray', bg: '#F5F5FA' },
  { key: 'blue', label: '深蓝', labelEn: 'Deep Blue', bg: '#F0F2FF' },
  { key: 'lavender', label: '淡紫', labelEn: 'Lavender', bg: '#F6F4FF' },
  { key: 'dark', label: '暗黑', labelEn: 'Dark Mode', bg: '#1E1B2E' },
];

type ThemeCtx = {
  bg: string;
  setBg: (key: string) => void;
  bgOptions: typeof BG_OPTIONS;
};

const ThemeContext = createContext<ThemeCtx>({
  bg: '#FAFAFA',
  setBg: () => {},
  bgOptions: BG_OPTIONS,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [bg, setBgState] = useState('#FAFAFA');

  useEffect(() => {
    const saved = localStorage.getItem('nc-bg');
    if (saved) {
      const opt = BG_OPTIONS.find(o => o.key === saved);
      if (opt) setBgState(opt.bg);
    }
  }, []);

  const setBg = (key: string) => {
    const opt = BG_OPTIONS.find(o => o.key === key);
    if (opt) {
      setBgState(opt.bg);
      localStorage.setItem('nc-bg', key);
    }
  };

  return (
    <ThemeContext.Provider value={{ bg, setBg, bgOptions: BG_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
