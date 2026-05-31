'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { getConversations } from '@/lib/data';

export default function MessagesPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) { getConversations(profile.id).then(setConversations).finally(() => setLoading(false)); }
    else setLoading(false);
  }, [profile]);

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-6">⟶</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">{t('messages.title')}</h1>
        <p className="text-gray-500 mb-8">登录后查看和发送私信</p>
        <Link href="/auth/login" className="inline-block bg-[#5B9CF5] text-white  px-8 py-4 font-semibold">登录</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="text-[#3D7AD6] text-sm mb-4 inline-block">{'← '}{t('messages.back')}</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('messages.title')}</h1>
      {loading ? (
        <p className="text-center text-gray-400 py-10">{t('common.loading')}</p>
      ) : conversations.length > 0 ? (
        conversations.map((c: any) => (
          <Link key={c.userId} href={`/messages/${c.userId}`}
            className="flex items-center gap-4 bg-white  p-4 mb-3 border shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
              {c.avatar_url || '•'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{c.anonymous_name}</p>
              <p className="text-sm text-gray-400">点击查看对话</p>
            </div>
            <span className="text-gray-300">⟶</span>
          </Link>
        ))
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">◦</div>
          <p className="text-gray-500">{t('messages.noMessages')}</p>
          <p className="text-gray-400 text-sm mt-2">与其他社区成员交流后，私信会显示在这里</p>
        </div>
      )}
    </div>
  );
}
