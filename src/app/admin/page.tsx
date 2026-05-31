'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-provider';
import { useAuth } from '@/lib/auth-context';
import { getReports, handleReport, getBlockedWords, addBlockedWord, removeBlockedWord } from '@/lib/data';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.is_admin) {
      Promise.all([
        getReports(),
        supabase.from('premium_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        getBlockedWords()
      ]).then(([r, { data: p }, bw]) => {
        setReports(r);
        setPremReqs(p || []);
        setBlockedWords(bw);
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
    </div>
  );
}
