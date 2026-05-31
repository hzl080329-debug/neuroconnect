'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-provider';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function SavedPage() {
  const { t, lang, changeLang } = useI18n();
  const { profile } = useAuth();
  const [tab, setTab] = useState<'saved' | 'voted'>('saved');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    loadData();
  }, [profile, tab]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);
    if (tab === 'saved') {
      const { data } = await supabase.from('post_saves').select(
        'post:posts(*, author:profiles!posts_author_id_fkey(anonymous_name), board:boards(name_zh))'
      ).eq('user_id', profile.id).order('created_at', { ascending: false });
      setPosts((data || []).map((s: any) => s.post).filter(Boolean));
    } else {
      const { data } = await supabase.from('post_votes').select(
        'post:posts(*, author:profiles!posts_author_id_fkey(anonymous_name), board:boards(name_zh))'
      ).eq('user_id', profile.id).eq('value', 1).order('created_at', { ascending: false });
      setPosts((data || []).map((v: any) => v.post).filter(Boolean));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 font-bold mb-6 inline-block">{'← '}{t('common.back')}</Link>
      <h1 className="text-xl font-black text-[#111] mb-6">{t('profile.saved')} & {t('profile.liked')}</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: 'saved' as const, label: t('profile.saved') },
          { key: 'voted' as const, label: t('profile.liked') },
        ].map(tabItem => (
          <button key={tabItem.key} onClick={() => setTab(tabItem.key)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              tab === tabItem.key ? 'border-[#5B9CF5] text-[#5B9CF5]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            {tabItem.label}
          </button>
        ))}
      </div>

      {!profile ? (
        <p className="text-gray-400 text-center py-16 text-sm">请先登录</p>
      ) : loading ? (
        <p className="text-gray-400 text-center py-10 text-sm">{t('common.loading')}</p>
      ) : posts.length > 0 ? (
        posts.map((p: any) => (
          <Link key={p.id} href={`/post/${p.id}`} className="block border border-gray-100 p-4 mb-2 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-xs">
              <span className="font-bold text-[#5B9CF5]">{p.board?.name_zh}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">{p.is_anonymous ? '匿名' : p.author?.anonymous_name}</span>
              <span className="ml-auto text-gray-300">{new Date(p.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
            </div>
            <h3 className="text-sm font-bold text-[#111] mb-1">{p.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{p.content}</p>
            <div className="flex gap-4 mt-2 text-[10px] text-gray-300">
              <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg> {p.vote_count || 0}</span>
              <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> {p.comment_count || 0}</span>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-gray-300 text-center py-16 text-sm uppercase">
          {t('common.noData')}
        </p>
      )}
    </div>
  );
}
