'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import zh from '@/messages/zh.json';
import en from '@/messages/en.json';

const translations: Record<string, any> = { zh, en };

interface I18nCtx {
  lang: string;
  t: (key: string, fallback?: any) => any;
  changeLang: (code: string) => void;
}

const I18nContext = createContext<I18nCtx>({
  lang: 'zh',
  t: (key: string, fallback?: any) => fallback || key,
  changeLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState('zh');

  const t = useCallback((key: string, fallback?: any): any => {
    const keys = key.split('.');
    let val: any = translations[lang];
    for (const k of keys) {
      if (!val || typeof val !== 'object') return fallback !== undefined ? fallback : key;
      val = val[k];
    }
    // If it's an array, return it directly (for departments etc)
    if (Array.isArray(val)) return val;
    // If it's a string with interpolation
    if (typeof val === 'string' && fallback && typeof fallback === 'object' && !Array.isArray(fallback)) {
      let result = val;
      for (const [k, v] of Object.entries(fallback)) {
        result = result.replace(`{${k}}`, String(v));
      }
      return result;
    }
    if (typeof val === 'string') return val;
    return fallback !== undefined ? fallback : key;
  }, [lang]);

  const changeLang = useCallback((code: string) => {
    setLang(code);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
