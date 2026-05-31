'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getNotifications, markNotificationsRead } from '@/lib/data';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    getNotifications(profile.id).then(setNotifs);
    markNotificationsRead(profile.id);
    setLoading(false);
  }, [profile]);

  if (!profile) return <div className="text-center py-20 text-gray-400 text-sm">请先登录</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 font-bold mb-6 inline-block">← Back</Link>
      <h1 className="text-xl font-black text-[#111] mb-6">通知</h1>

      {loading ? <p className="text-gray-400 text-center py-10 text-sm">Loading...</p> :
       notifs.length > 0 ? notifs.map((n: any) => (
        <Link key={n.id} href={n.link || '#'}
          className={`block border p-4 mb-2 hover:border-gray-400 transition-colors ${n.read_at ? 'border-gray-100' : 'border-[#5B9CF5] bg-[#5B9CF5]/[0.02]'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#5B9CF5]">{n.title_zh}</span>
            {!n.read_at && <span className="w-2 h-2 bg-[#5B9CF5] rounded-full" />}
          </div>
          <p className="text-sm text-gray-600">{n.body_zh}</p>
          <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString('zh-CN')}</p>
        </Link>
      )) : (
        <p className="text-gray-300 text-center py-16 text-sm">暂无通知</p>
      )}
    </div>
  );
}
