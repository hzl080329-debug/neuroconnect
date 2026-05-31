'use client';
import { ReactNode, useState, useCallback } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useI18n() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [langKey, setLangKey] = useState(i18nInstance.language || 'zh');

  const changeLang = useCallback((code: string) => {
    i18nInstance.changeLanguage(code).then(() => {
      setLangKey(code);
    });
  }, [i18nInstance]);

  return { t, lang: langKey, changeLang };
}
