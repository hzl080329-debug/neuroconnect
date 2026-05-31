'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function BottomNav() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex justify-center gap-6 mt-4 pb-8 text-sm text-gray-400 flex-wrap">
      <Link href="/profile" className="hover:text-gray-600">个人中心</Link>
      <Link href="/messages" className="hover:text-gray-600">私信</Link>
      <Link href="/resources" className="hover:text-gray-600">资源中心</Link>
      <Link href="/rules" className="hover:text-gray-600">社区规则</Link>
      <Link href="/settings" className="hover:text-gray-600">设置</Link>
      {user ? (
        <button onClick={() => signOut()} className="hover:text-rose-400">退出</button>
      ) : (
        <Link href="/auth/login" className="hover:text-[#5B9CF5]">登录</Link>
      )}
    </div>
  );
}
