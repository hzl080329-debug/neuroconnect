'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-provider';
import { useAuth } from '@/lib/auth-context';
import { getReports, handleReport, getBlockedWords, addBlockedWord, removeBlockedWord, getResources, createResource, deleteResource } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminPage() {
  const { t, lang, changeLang } = useI18n();
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [premReqs, setPremReqs] = useState<any[]>([]);
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [resForm, setResForm] = useState({ category: 'knowledge', titleZh: '', titleEn: '', contentZh: '', contentEn: '', url: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.is_admin) {
      Promise.all([
        getReports(),
        supabase.from('premium_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        getBlockedWords(),
        getResources(),
      ]).then(([r, { data: p }, bw, res]) => {
        setReports(r);
        setPremReqs(p || []);
        setBlockedWords(bw);
        setResources(res);
        setLoading(false);
      });
    } else setLoading(false);
  }, [profile]);

  const handleAction = async (reportId: string, status: string) => {
    if (!profile) return;
    await handleReport(reportId, profile.id, status);
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const handlePremiumAction = async (reqId: string, username: string, action: 'approved' | 'rejected') => {
    if (!profile) return;
    if (action === 'approved') {
      await supabase.from('profiles').update({ is_premium: true, premium_until: new Date(Date.now() + 30*24*60*60*1000).toISOString() }).eq('anonymous_name', username);
      toast.success(`${username} Premium activated`);
    }
    await supabase.from('premium_requests').update({ status: action, reviewed_by: profile.id, reviewed_at: new Date().toISOString() }).eq('id', reqId);
    setPremReqs(prev => prev.filter(r => r.id !== reqId));
  };

  if (!profile?.is_admin) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{t('admin.title')}</h1>
        <p className="text-gray-500">{t('admin.noAccess')}</p>
        <Link href="/" className="text-[#5B9CF5] mt-4 inline-block">{t('admin.back')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 font-bold mb-6 inline-block">← {t('admin.back')}</Link>
      <h1 className="text-xl font-black text-[#111] mb-8">{t('admin.title')}</h1>

      {/* Premium requests */}
      <section className="mb-10">
        <h2 className="text-sm font-black text-[#111] mb-4">♦ {t('admin.premiumRequests')}</h2>
        {premReqs.length > 0 ? premReqs.map((r: any) => (
          <div key={r.id} className="border border-gray-200 p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">{r.username}</span>
              <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
            </div>
            {r.contact && <p className="text-xs text-gray-500 mb-3">Contact: {r.contact}</p>}
            <div className="flex gap-2">
              <button onClick={() => handlePremiumAction(r.id, r.username, 'approved')}
                className="px-4 py-1.5 text-xs font-bold bg-[#5B9CF5] text-white hover:bg-[#4A8AE8]">{t('admin.approve')}</button>
              <button onClick={() => handlePremiumAction(r.id, r.username, 'rejected')}
                className="px-4 py-1.5 text-xs font-bold border border-gray-300 text-gray-500 hover:text-red-500">{t('admin.reject')}</button>
            </div>
          </div>
        )) : (
          <p className="text-xs text-gray-400 py-4">{t('admin.noRequests')}</p>
        )}
      </section>

      {/* Reports */}
      <section className="mb-10">
        <h2 className="text-sm font-black text-[#111] mb-4">⚑ {t('admin.reports')}</h2>
        {reports.length > 0 ? reports.map((r: any) => (
          <div key={r.id} className="border border-gray-200 p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 font-bold">{r.target_type === 'post' ? 'Post' : 'Comment'}</span>
              <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Reason: {r.reason}</p>
            <div className="flex gap-2">
              <button onClick={() => handleAction(r.id, 'resolved')} className="px-4 py-1.5 text-xs font-bold bg-green-500 text-white">{t('admin.ignore')}</button>
              <button onClick={() => handleAction(r.id, 'reviewed')} className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white">{t('admin.delete')}</button>
            </div>
          </div>
        )) : (
          <p className="text-xs text-gray-400 py-4">{t('admin.noReports')}</p>
        )}
      </section>

      {/* Blocked Words */}
      <section className="mb-10">
        <h2 className="text-sm font-black text-[#111] mb-4">🚫 屏蔽词管理</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            placeholder="添加屏蔽词..."
            className="flex-1 border border-gray-300 p-2 text-sm"
            onKeyDown={async e => {
              if (e.key === 'Enter' && newWord.trim()) {
                await addBlockedWord(newWord.trim());
                setBlockedWords(prev => [...prev, newWord.trim()]);
                setNewWord('');
              }
            }}
          />
          <button
            onClick={async () => {
              if (!newWord.trim()) return;
              await addBlockedWord(newWord.trim());
              setBlockedWords(prev => [...prev, newWord.trim()]);
              setNewWord('');
            }}
            className="px-4 py-2 bg-[#5B9CF5] text-white text-sm font-bold"
          >
            + 添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {blockedWords.map(w => (
            <span key={w} className="inline-flex items-center gap-1 bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full border border-red-100">
              {w}
              <button
                onClick={async () => {
                  await removeBlockedWord(w);
                  setBlockedWords(prev => prev.filter(x => x !== w));
                }}
                className="text-red-400 hover:text-red-600 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {blockedWords.length === 0 && (
          <p className="text-xs text-gray-400 py-4">暂无屏蔽词</p>
        )}
      </section>

      {/* Resource Manager */}
      <section className="mb-10">
        <h2 className="text-sm font-black text-[#111] mb-4">📚 资源中心管理</h2>

        {/* Add resource form */}
        <div className="border border-gray-200 p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={resForm.category} onChange={e => setResForm({ ...resForm, category: e.target.value })}
              className="border border-gray-300 p-2 text-sm">
              <option value="knowledge">科普文章</option>
              <option value="guide">就诊指南</option>
              <option value="hotline">求助热线</option>
              <option value="support">支持资源</option>
            </select>
            <input placeholder="外部链接 URL" value={resForm.url} onChange={e => setResForm({ ...resForm, url: e.target.value })}
              className="border border-gray-300 p-2 text-sm" />
          </div>
          <input placeholder="标题（中文）" value={resForm.titleZh} onChange={e => setResForm({ ...resForm, titleZh: e.target.value })}
            className="w-full border border-gray-300 p-2 text-sm" />
          <input placeholder="标题（英文）" value={resForm.titleEn} onChange={e => setResForm({ ...resForm, titleEn: e.target.value })}
            className="w-full border border-gray-300 p-2 text-sm" />
          <textarea placeholder="内容（中文）" value={resForm.contentZh} onChange={e => setResForm({ ...resForm, contentZh: e.target.value })}
            className="w-full border border-gray-300 p-2 text-sm" rows={2} />
          <textarea placeholder="内容（英文）" value={resForm.contentEn} onChange={e => setResForm({ ...resForm, contentEn: e.target.value })}
            className="w-full border border-gray-300 p-2 text-sm" rows={2} />
          <button
            onClick={async () => {
              if (!resForm.titleZh.trim()) return;
              const r = await createResource({
                category: resForm.category,
                titleZh: resForm.titleZh.trim(),
                titleEn: resForm.titleEn.trim() || resForm.titleZh.trim(),
                contentZh: resForm.contentZh.trim(),
                contentEn: resForm.contentEn.trim() || resForm.contentZh.trim(),
                url: resForm.url.trim() || undefined,
              });
              if (r) {
                setResources(prev => [r, ...prev]);
                setResForm({ category: 'knowledge', titleZh: '', titleEn: '', contentZh: '', contentEn: '', url: '' });
              }
            }}
            className="w-full py-2 bg-[#5B9CF5] text-white text-sm font-bold"
          >
            + 发布资源
          </button>
        </div>

        {/* Existing resources */}
        {resources.length > 0 ? (
          <div className="space-y-2">
            {resources.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between border border-gray-200 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 rounded px-2 py-0.5 text-[10px] font-bold text-gray-500">{r.category}</span>
                    <span className="text-sm font-bold text-gray-800 truncate">{r.title_zh}</span>
                  </div>
                  {r.content_zh && <p className="text-xs text-gray-400 truncate">{r.content_zh}</p>}
                </div>
                <button
                  onClick={async () => {
                    if (!confirm('删除？')) return;
                    await deleteResource(r.id);
                    setResources(prev => prev.filter(x => x.id !== r.id));
                  }}
                  className="text-xs text-red-400 hover:text-red-600 ml-3 shrink-0"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-4">暂无资源</p>
        )}
      </section>
    </div>
  );
}
