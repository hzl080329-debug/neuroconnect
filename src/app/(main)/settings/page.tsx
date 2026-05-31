'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme-context';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

const LANGUAGES = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export default function SettingsPage() {
  const { bg, setBg, bgOptions } = useTheme();
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'zh');
  const currentBg = bgOptions.find(o => o.bg === bg)?.key || 'warm';

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    setLang(code);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="text-[#3D7AD6] font-medium text-sm mb-6 inline-block">← {t('common.back')}</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('settings.title')}</h1>

      {/* Language */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">🌐 {t('settings.language')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => switchLang(l.code)}
              className={`p-4 border-2 text-center transition-all ${
                lang === l.code
                  ? 'border-[#5B9CF5] bg-[#5B9CF5]/5'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{l.flag}</span>
              <span className={`font-medium ${lang === l.code ? 'text-[#3D7AD6]' : 'text-gray-600'}`}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Background Color */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">🎨 {t('settings.bgColor')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {bgOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setBg(opt.key)}
              className={`p-4 border-2 text-center transition-all ${
                currentBg === opt.key
                  ? 'border-[#5B9CF5] shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: opt.bg }}
            >
              <div className={`text-sm font-medium ${currentBg === opt.key ? 'text-[#3D7AD6]' : 'text-gray-600'}`}>
                {lang === 'en' ? opt.labelEn : opt.label}
              </div>
              <div className="text-xs text-gray-400 mt-1">{opt.bg}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
