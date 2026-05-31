'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-provider';
import { getBoards } from '@/lib/data';

const COLORS: Record<string, string> = {
  adhd: '#5B9CF5', audhd: '#E040FB', autism: '#7AB8F5', anxiety: '#4ADE80',
  experience: '#F59E0B', life: '#EC4899', work: '#5B9CF5', support: '#F97316',
};

export default function BoardsListPage() {
  const { t } = useI18n();
  const [allBoards, setAllBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBoards().then((boards) => {
      setAllBoards(boards);
      setLoading(false);
    });
  }, []);

  const official = allBoards.filter((b: any) => b.sort_order < 90);
  const userBoards = allBoards.filter((b: any) => b.sort_order >= 90);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="text-[#3D7AD6] text-sm mb-6 inline-block">← {t('common.back')}</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('boards.title')}</h1>

      {loading ? (
        <p className="text-center text-gray-400 py-10">{t('common.loading')}</p>
      ) : (
        <>
          {/* Official boards */}
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('boards.official')}</h2>
          {official.map((b: any) => (
            <Link key={b.id} href={`/b/${b.slug}`}
              className="flex items-center gap-4 bg-white  p-4 mb-2 border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: (COLORS[b.slug] || '#5B9CF5') + '20' }}>
                {b.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{b.name_zh}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.description_zh}</p>
              </div>
              <span className="text-gray-300">⟶</span>
            </Link>
          ))}

          {/* User boards */}
          {userBoards.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-8">{t('boards.user')}</h2>
              {userBoards.map((b: any) => (
                <Link key={b.id} href={`/b/${b.slug}`}
                  className="flex items-center gap-4 bg-white  p-4 mb-2 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {b.icon || '🌱'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{b.name_zh}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{b.description_zh || t('common.noData')}</p>
                  </div>
                  <span className="text-gray-300">⟶</span>
                </Link>
              ))}
            </>
          )}

          <Link href="/boards/create"
            className="flex items-center justify-center gap-2 mt-6 border-2 border-dashed border-gray-200  p-4 text-gray-400 hover:border-[#5B9CF5] hover:text-[#5B9CF5] transition-colors">
            ➕ {t('boards.create')}
          </Link>
        </>
      )}
    </div>
  );
}
