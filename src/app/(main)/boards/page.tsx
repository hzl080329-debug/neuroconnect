import Link from 'next/link';
import { getBoards } from '@/lib/data';

const COLORS: Record<string, string> = {
  adhd: '#5B9CF5', audhd: '#E040FB', autism: '#7AB8F5', anxiety: '#4ADE80',
  experience: '#F59E0B', life: '#EC4899', work: '#5B9CF5', support: '#F97316',
};

export default async function BoardsListPage() {
  const allBoards = await getBoards();
  const official = allBoards.filter((b: any) => b.sort_order < 90);
  const userBoards = allBoards.filter((b: any) => b.sort_order >= 90);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="text-[#3D7AD6] text-sm mb-6 inline-block">← 返回</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">社区板块</h1>

      {/* Official boards */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">官方板块</h2>
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
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-8">用户板块</h2>
          {userBoards.map((b: any) => (
            <Link key={b.id} href={`/b/${b.slug}`}
              className="flex items-center gap-4 bg-white  p-4 mb-2 border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                {b.icon || '🌱'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{b.name_zh}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.description_zh || '用户创建的板块'}</p>
              </div>
              <span className="text-gray-300">⟶</span>
            </Link>
          ))}
        </>
      )}

      <Link href="/boards/create"
        className="flex items-center justify-center gap-2 mt-6 border-2 border-dashed border-gray-200  p-4 text-gray-400 hover:border-[#5B9CF5] hover:text-[#5B9CF5] transition-colors">
        ➕ 创建新板块
      </Link>
    </div>
  );
}
