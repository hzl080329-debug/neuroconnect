'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PremiumPage() {
  const { profile } = useAuth();
  const [username, setUsername] = useState('');
  const [txnId, setTxnId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleActivate = async () => {
    if (!username.trim()) { toast.error('请填写用户名'); return; }
    setSubmitting(true);
    const { data: prof } = await supabase.from('profiles').select('id').eq('anonymous_name', username.trim()).single();
    if (!prof) { toast.error('用户名不存在，请先注册'); setSubmitting(false); return; }
    await supabase.from('profiles').update({ is_premium: true, premium_until: new Date(Date.now() + 30*24*60*60*1000).toISOString() }).eq('anonymous_name', username.trim());
    await supabase.from('premium_requests').insert({ username: username.trim(), contact: txnId.trim() || '微信支付', status: 'approved' });
    toast.success('Premium 已激活！刷新后生效');
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 font-bold mb-6 inline-block">← 返回</Link>

      {profile?.is_premium && (
        <div className="border border-[#5B9CF5] bg-[#5B9CF5]/5 p-4 mb-8 text-center">
          <p className="text-[#5B9CF5] font-bold text-sm">♦ 你已是 Premium 会员</p>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[#111] mb-2">PREMIUM</h1>
        <p className="text-sm text-gray-500">支持社区，解锁更多功能</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-gray-200 p-6">
          <div className="text-center mb-4">
            <h3 className="font-black text-lg text-[#111]">免费</h3>
            <p className="text-3xl font-black text-gray-300 mt-2">¥0</p>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>浏览板块</li><li>发帖 / 评论</li><li>点赞 / 收藏</li><li>就诊地图</li><li>基础私信</li>
          </ul>
        </div>
        <div className="border-2 border-[#5B9CF5] p-6 relative">
          <div className="absolute -top-3 right-4 bg-[#5B9CF5] text-white text-xs px-3 py-0.5 font-bold">推荐</div>
          <div className="text-center mb-4">
            <h3 className="font-black text-lg text-[#5B9CF5]">Premium</h3>
            <div className="flex items-center justify-center gap-1 mt-2">
              <p className="text-3xl font-black text-[#5B9CF5]">¥9.9</p><p className="text-xs text-gray-400">/月</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">¥68/年</p>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="font-bold text-[#5B9CF5]">全部免费功能</li>
            <li>自定义头像上传</li><li>无限制私信</li><li>Premium 徽章</li><li>更多主题色</li>
          </ul>
        </div>
      </div>

      {/* Payment */}
      <div className="border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-black text-[#111] mb-4">微信扫码支付</h2>
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 border border-gray-200 mb-3 flex items-center justify-center">
            <img
              src="/wx-qr.png"
              alt="微信收款码"
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">¥9.9/月 · ¥68/年</p>
          <p className="text-xs text-gray-400">扫码支付后填写下方表单激活</p>
        </div>
      </div>

      {/* Activation */}
      <div className="border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-black text-[#111] mb-4">支付后激活</h2>
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-[#5B9CF5] font-bold text-lg">♦</p>
            <p className="text-[#5B9CF5] font-bold text-sm mt-2">Premium 已激活</p>
            <p className="text-xs text-gray-400 mt-1">刷新页面后生效，有效期 30 天</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-sm mx-auto">
            <input
              placeholder="你的 NeuroConnect 用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm text-center"
            />
            <input
              placeholder="微信转账单号（可选，方便核对）"
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              className="w-full border border-gray-300 p-3 text-xs text-center text-gray-400"
            />
            <button
              onClick={handleActivate}
              disabled={submitting}
              className="w-full py-3 bg-[#5B9CF5] text-white text-sm font-bold hover:bg-[#4A8AE8] disabled:opacity-50"
            >
              {submitting ? '激活中...' : '激活 Premium'}
            </button>
            <p className="text-xs text-gray-400 text-center">确认已支付后点击激活，即时开通</p>
          </div>
        )}
      </div>
    </div>
  );
}
