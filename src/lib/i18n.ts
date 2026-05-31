import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from '@/messages/zh.json';
import en from '@/messages/en.json';

i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

export default i18n;
