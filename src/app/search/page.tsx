'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchPosts } from '@/lib/data';
import { Input } from '@/components/ui/input';

function SearchContent() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults(await searchPosts(q.trim()));
    setLoading(false);
    setSearched(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex gap-3 mb-6">
        <Link href="/" className="text-[#3D7AD6] font-medium py-2">←</Link>
        <Input placeholder="搜索帖子、话题..." value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch(query)} className="flex-1" autoFocus />
        <button onClick={() => doSearch(query)} className="text-[#5B9CF5] font-semibold px-2">搜索</button>
      </div>
      {loading ? <p className="text-center text-gray-400 py-10">搜索中...</p> :
       searched ? <>
        <p className="text-sm text-gray-500 mb-4">找到 {results.length} 个结果</p>
        {results.length > 0 ? results.map((p: any) => (
          <Link key={p.id} href={`/post/${p.id}`} className="block bg-white  p-4 mb-3 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs">{p.board?.name_zh}</span>
              <span className="text-xs text-gray-400">{p.is_anonymous ? '匿名' : p.author?.anonymous_name}</span>
            </div>
            <h3 className="font-semibold text-gray-800">{p.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{p.content}</p>
          </Link>
        )) : <p className="text-center text-gray-400 py-10">没有找到相关帖子</p>}
      </> : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
