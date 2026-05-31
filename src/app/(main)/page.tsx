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
    <div className="max-w-4xl mx-auto px-6 py-10 pb-24">
      {/* Hero — bold, oversized, striking */}
      <div className="relative mb-20">
        {/* Shadow text behind */}
        <div className="absolute -top-6 left-0 text-[140px] font-black leading-none text-gray-100 select-none pointer-events-none tracking-[-0.04em] hidden lg:block"
          style={{ textShadow: '0 0 0 #f0f0f0' }}>
          N
        </div>

        <div className="relative z-10 pt-12 lg:pt-20">
          <h1 className="text-7xl lg:text-9xl font-black tracking-[-0.04em] text-[#111] leading-[0.85]">
            NEURO
          </h1>
          <h1 className="text-7xl lg:text-9xl font-black tracking-[-0.04em] leading-[0.85] mb-8"
            style={{ color: '#5B9CF5', textShadow: '4px 4px 0 rgba(91,156,245,0.15)' }}>
            CONNECT
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] bg-[#5B9CF5]" />
            <p className="text-sm tracking-[0.3em] text-gray-400 uppercase font-bold">Moebius 河湾左右</p>
          </div>
          <p className="text-sm text-gray-300 mt-4 max-w-sm leading-relaxed">
            ADHD · ASD · Anxiety · Depression<br />
            匿名互助 · 就诊地图 · 经验分享
          </p>
        </div>
      </div>

      {/* Search — clean bar */}
      <Link href="/search"
        className="flex items-center gap-3 border-b-2 border-gray-100 pb-4 mb-20 text-gray-400 hover:border-[#5B9CF5] transition-colors group">
        <span className="text-2xl group-hover:text-[#5B9CF5] transition-colors">⌕</span>
        <span className="text-sm tracking-wider">{t('home.search')}</span>
      </Link>

      {/* Boards — iconic grid */}
      <section className="mb-20">
        <div className="flex items-baseline gap-3 mb-10">
          <span className="text-[10px] tracking-[0.3em] text-gray-300 uppercase font-bold">Boards</span>
          <span className="flex-1 h-[1px] bg-gray-100 translate-y-[-4px]" />
          <span className="text-[10px] text-gray-300">{official.length}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-0.5">
          {official.map((b: any) => (
            <Link key={b.id} href={b.slug === 'experience' ? '/experience' : `/b/${b.slug}`}
              className="group flex flex-col items-center justify-center py-8 px-4 bg-gray-50 hover:bg-[#5B9CF5] transition-colors">
              <div className="text-3xl mb-3 transition-transform group-hover:scale-125 group-hover:text-white">
                {b.icon || '●'}
              </div>
              <div className="text-xs font-bold text-gray-600 group-hover:text-white tracking-wider uppercase">
                {lang === 'en' ? (b.name_en || b.name_zh) : b.name_zh}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Posts — numbered, dramatic */}
      <section className="mb-20">
        <div className="flex items-baseline gap-3 mb-10">
          <span className="text-[10px] tracking-[0.3em] text-gray-300 uppercase font-bold">{t('home.hot')}</span>
          <span className="flex-1 h-[1px] bg-gray-100 translate-y-[-4px]" />
        </div>
        {hotPosts.length > 0 ? (
          <div>
            {hotPosts.map((p: any, i: number) => (
              <Link key={p.id} href={`/post/${p.id}`}
                className="group flex items-start gap-6 py-6 border-b border-gray-50 hover:border-[#5B9CF5]/30 transition-colors">
                {/* Number */}
                <div className="text-5xl lg:text-7xl font-black text-gray-100 leading-none tabular-nums shrink-0 group-hover:text-[#5B9CF5]/20 transition-colors"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1 text-[10px] tracking-wider text-gray-400">
                    <span className="font-bold text-[#5B9CF5] uppercase">
                      {p.board?.name_zh}
                    </span>
                    <span>/</span>
                    <span>{p.is_anonymous ? 'Anon' : p.author?.anonymous_name}</span>
                  </div>
                  <h3 className="font-bold text-[#111] mb-2 leading-snug group-hover:text-[#5B9CF5] transition-colors text-base lg:text-lg">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{p.content}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-sm py-12 text-center">{t('home.emptyHot')}</p>
        )}
      </section>

      {/* Latest — compact list */}
      <section className="mb-20">
        <div className="flex items-baseline gap-3 mb-10">
          <span className="text-[10px] tracking-[0.3em] text-gray-300 uppercase font-bold">{t('home.latest')}</span>
          <span className="flex-1 h-[1px] bg-gray-100 translate-y-[-4px]" />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {latestPosts.map((p: any) => (
            <Link key={p.id} href={`/post/${p.id}`}
              className="group border border-gray-100 hover:border-[#5B9CF5] p-5 transition-all hover:shadow-sm">
              <div className="text-[10px] tracking-wider text-[#5B9CF5] font-bold uppercase mb-2">
                {p.board?.name_zh}
              </div>
              <h3 className="font-bold text-[#111] mb-2 group-hover:text-[#5B9CF5] transition-colors">
                {p.title}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2">{p.content}</p>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-300">
                <span>{p.is_anonymous ? 'Anon' : p.author?.anonymous_name}</span>
                <span>{new Date(p.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#111] pt-12">
        <div className="mb-12">
          <p className="text-3xl font-black tracking-[-0.03em] text-[#111]">
            NEURO<span className="text-[#5B9CF5]">CONNECT</span>
          </p>
          <p className="text-xs tracking-[0.3em] text-gray-400 mt-2 uppercase">Moebius 河湾左右</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-12">
          {[
            ['WeChat', 'moebius318'],
            ['小红书', 'moebiushewan'],
            ['Email', 'moebius318@163.com'],
            ['Instagram', 'moebius_hewanzuoyou'],
          ].map(([label, value]) => (
            <div key={label} className="border border-gray-100 p-4 hover:border-[#5B9CF5] transition-colors">
              <div className="text-[10px] tracking-[0.2em] text-gray-300 uppercase mb-1">{label}</div>
              <div className="font-bold text-gray-600">{value}</div>
            </div>
          ))}
        </div>
        <Link href="/rules"
          className="text-[10px] tracking-[0.3em] text-gray-400 hover:text-[#5B9CF5] uppercase font-bold transition-colors">
          Community Rules →
        </Link>
      </footer>

      {/* FAB */}
      <Link href="/submit"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#111] hover:bg-[#5B9CF5] text-white flex items-center justify-center text-2xl transition-all shadow-2xl z-50 hover:scale-110">
        +
      </Link>
    </div>
  );
}
