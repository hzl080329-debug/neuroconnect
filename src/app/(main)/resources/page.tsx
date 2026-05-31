'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { getResources } from '@/lib/data';

export default function ResourcesPage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResources().then((r) => {
      setResources(r);
      setLoading(false);
    });
  }, []);

  const byCategory: Record<string, any[]> = {};
  const labels: Record<string, { icon: string; title: string }> = {
    knowledge: { icon: '—', title: t('resources.knowledge') },
    guide: { icon: '▸', title: t('resources.guide') },
    hotline: { icon: '📞', title: t('resources.hotline') },
    support: { icon: '🤝', title: t('resources.support') },
  };

  for (const r of resources) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="text-[#3D7AD6] font-medium text-sm mb-4 inline-block">← {t('resources.back')}</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('resources.title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('common.loading')}</p>

      {loading ? (
        <p className="text-center text-gray-400 py-10">{t('common.loading')}</p>
      ) : (
        Object.entries(labels).map(([key, label]) => {
          const items = byCategory[key] || [];
          return (
            <div key={key} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{label.icon}</span>
                <h2 className="text-lg font-semibold text-gray-800">{label.title}</h2>
              </div>
              {items.length > 0 ? items.map((r: any) => (
                <div key={r.id} className="bg-white  p-4 mb-2 border shadow-sm">
                  <h3 className="font-semibold text-gray-800">{r.title_zh}</h3>
                  {r.content_zh && <p className="text-sm text-gray-500 mt-1">{r.content_zh}</p>}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="text-[#5B9CF5] text-sm mt-2 inline-block">{t('common.confirm')} ⟶</a>
                  )}
                </div>
              )) : (
                <div className="bg-white  p-4 mb-2 border text-center text-gray-400 text-sm">{t('common.noData')}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
