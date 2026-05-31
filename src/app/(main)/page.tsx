'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBoards, getPosts } from '@/lib/data';
import { useI18n } from '@/lib/i18n-provider';

export default function HomePage() {
  const { t, lang } = useI18n();
  const [boards, setBoards] = useState<any[]>([]);
  const [hotPosts, setHotPosts] = useState<any[]>([]);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getBoards(),
      getPosts({ sort: 'hot', limit: 6 }),
      getPosts({ sort: 'latest', limit: 6 }),
    ]).then(([b, h, l]) => {
      setBoards(b);
      setHotPosts(h);
      setLatestPosts(l);
    });
  }, []);

  const official = boards.filter((b: any) => b.sort_order < 90);

  return (
    <div className="max-w-3xl mx-auto px-8 py-12 pb-24">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-black tracking-[-0.03em] text-[#111] leading-[0.9] mb-3">
          NEURO
        </h1>
        <h1 className="text-6xl font-black tracking-[-0.03em] text-[#5B9CF5] leading-[0.9] mb-6">
          CONNECT
        </h1>
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-8 h-[1px] bg-gray-300" />
          <p className="text-xs tracking-[0.35em] text-gray-400 uppercase">Moebius 河湾左右</p>
          <span className="w-8 h-[1px] bg-gray-300" />
        </div>
        <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
          一个面向神经多样性人群的匿名互助社区<br />
          <span className="text-gray-300">ADHD · 自闭谱系 · 焦虑抑郁 · 更多</span>
        </p>
      </div>

      {/* Search */}
      <Link href="/search"
        className="flex items-center justify-center border border-gray-200 px-6 py-4 mb-16 text-sm text-gray-400 hover:border-[#5B9CF5] hover:text-[#5B9CF5] transition-colors max-w-lg mx-auto">
        <span className="mr-3 text-lg">⌕</span>
        {t('home.search')}
      </Link>

      {/* Boards */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-6 h-[1px] bg-gray-300" />
          <h2 className="text-xs tracking-[0.25em] text-gray-400 uppercase font-bold">{t('home.boards')}</h2>
          <span className="flex-1 h-[1px] bg-gray-100" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {official.map((b: any) => (
            <Link key={b.id} href={b.slug === 'experience' ? '/experience' : `/b/${b.slug}`}
              className="group border border-gray-100 px-5 py-4 text-center hover:border-[#5B9CF5] hover:bg-[#5B9CF5]/[0.03] transition-all">
              <div className="text-2xl mb-2 text-[#5B9CF5] group-hover:scale-110 transition-transform">
                {b.icon || '●'}
              </div>
              <div className="text-xs font-bold text-gray-700 group-hover:text-[#5B9CF5]">
                {lang === 'en' ? (b.name_en || b.name_zh) : b.name_zh}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Posts */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-6 h-[1px] bg-gray-300" />
          <h2 className="text-xs tracking-[0.25em] text-gray-400 uppercase font-bold">{t('home.hot')}</h2>
          <span className="flex-1 h-[1px] bg-gray-100" />
        </div>
        {hotPosts.length > 0 ? (
          <div className="space-y-3">
            {hotPosts.map((p: any, i: number) => (
              <PostCard key={p.id} post={p} lang={lang} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-300 py-12 text-sm">{t('home.emptyHot')}</p>
        )}
      </section>

      {/* Latest Posts */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-6 h-[1px] bg-gray-300" />
          <h2 className="text-xs tracking-[0.25em] text-gray-400 uppercase font-bold">{t('home.latest')}</h2>
          <span className="flex-1 h-[1px] bg-gray-100" />
        </div>
        {latestPosts.length > 0 ? (
          <div className="space-y-3">
            {latestPosts.map((p: any) => (
              <PostCard key={p.id} post={p} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-300 py-12 text-sm">{t('home.emptyLatest')}</p>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 pt-12">
        <div className="text-center mb-10">
          <p className="text-2xl font-black tracking-[-0.03em] text-[#111] mb-1">NEURO<span className="text-[#5B9CF5]">CONNECT</span></p>
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">Moebius 河湾左右</p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs">
          <div className="border border-gray-100 p-4">
            <span className="text-gray-400 text-[10px] tracking-wider uppercase block mb-1">{t('home.wx')}</span>
            <span className="font-bold text-gray-700">moebius318</span>
          </div>
          <div className="border border-gray-100 p-4">
            <span className="text-gray-400 text-[10px] tracking-wider uppercase block mb-1">小红书</span>
            <span className="font-bold text-gray-700">moebiushewan</span>
          </div>
          <div className="border border-gray-100 p-4">
            <span className="text-gray-400 text-[10px] tracking-wider uppercase block mb-1">{t('home.email')}</span>
            <span className="font-bold text-gray-700 text-[11px]">moebius318@163.com</span>
          </div>
          <div className="border border-gray-100 p-4">
            <span className="text-gray-400 text-[10px] tracking-wider uppercase block mb-1">Instagram</span>
            <span className="font-bold text-gray-700 text-[11px]">moebius_hewanzuoyou</span>
          </div>
        </div>
        <div className="text-center mt-10">
          <Link href="/rules" className="text-[10px] tracking-[0.2em] text-gray-400 hover:text-gray-600 uppercase font-bold">
            {t('home.rules')}
          </Link>
        </div>
      </footer>

      {/* FAB */}
      <Link href="/submit"
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#111] text-white flex items-center justify-center text-2xl hover:bg-[#5B9CF5] transition-colors shadow-lg z-50">
        +
      </Link>
    </div>
  );
}

function PostCard({ post, lang, index }: { post: any; lang: string; index?: number }) {
  return (
    <Link href={`/post/${post.id}`}
      className="group block border border-gray-100 hover:border-[#5B9CF5] transition-all px-6 py-5">
      <div className="flex items-start gap-4">
        {index !== undefined && index < 3 && (
          <span className="text-4xl font-black text-gray-100 leading-none -mt-1 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 text-[10px] tracking-wider text-gray-400 uppercase">
            <span className="font-bold text-[#5B9CF5]">
              {lang === 'en' ? (post.board?.name_en || post.board?.name_zh) : post.board?.name_zh}
            </span>
            <span className="text-gray-200">/</span>
            <span>{post.is_anonymous ? (lang === 'en' ? 'Anon' : '匿名') : post.author?.anonymous_name}</span>
            <span className="ml-auto">{new Date(post.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
          </div>
          <h3 className="font-bold text-[#111] mb-2 leading-snug group-hover:text-[#5B9CF5] transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{post.content}</p>
        </div>
      </div>
    </Link>
  );
}
