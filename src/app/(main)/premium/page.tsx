'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AFDIAN_URL = 'https://ifdian.net/a/moebiushewanzuoyou';

export default function PremiumPage() {
  const { profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState<'wechat' | 'afdian'>('afdian');

  // WeChat
  const [wxTxnId, setWxTxnId] = useState('');
  const [wxSubmitting, setWxSubmitting] = useState(false);

  // Afdian
  const [afdianVerifying, setAfdianVerifying] = useState(false);
  const [afdianActivating, setAfdianActivating] = useState(false);

  // WeChat: self-activate with transaction ID
  const handleWechatActivate = async () => {
    if (!profile) return;
    if (!wxTxnId.trim() || wxTxnId.trim().length < 4) {
      toast.error('请填写微信转账单号（至少4位）');
      return;
    }
    setWxSubmitting(true);
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('profiles').update({
      is_premium: true,
      premium_until: expiry,
      premium_order_id: `wx_${wxTxnId.trim()}`,
    }).eq('user_id', profile.user_id);
    await supabase.from('premium_requests').insert({
      username: profile.anonymous_name,
      contact: `微信单号: ${wxTxnId.trim()}`,
      status: 'approved',
    });
    await refreshProfile();
    toast.success('Premium 已激活！');
    setWxSubmitting(false);
  };

  // Afdian: verify via API
  const handleAfdianVerify = async () => {
    if (!profile) return;
    setAfdianVerifying(true);
    try {
      const res = await fetch('/api/check-afdian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neuroconnectUsername: profile.anonymous_name }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`找到赞助：¥${data.order.total_amount}`);
      setAfdianActivating(true);
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('profiles').update({
        is_premium: true,
        premium_until: expiry,
        premium_order_id: data.order.out_trade_no,
      }).eq('user_id', profile.user_id);
      await supabase.from('premium_requests').insert({
        username: profile.anonymous_name,
        contact: `爱发电订单: ${data.order.out_trade_no}`,
        status: 'approved',
      });
      await refreshProfile();
      toast.success('🎉 Premium 已自动激活！');
    } catch {
      toast.error('验证失败，请重试');
    } finally {
      setAfdianVerifying(false);
      setAfdianActivating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 font-bold mb-6 inline-block">← 返回</Link>

      {profile?.is_premium && (
        <div className="border border-[#5B9CF5] bg-[#5B9CF5]/5 p-4 mb-8 text-center">
          <p className="text-[#5B9CF5] font-bold text-sm">♦ 你已是 Premium 会员</p>
          {profile.premium_until && (
            <p className="text-xs text-gray-400 mt-1">
              有效期至 {new Date(profile.premium_until).toLocaleDateString('zh-CN')}
            </p>
          )}
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

      {/* Payment method tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('afdian')}
          className={`flex-1 py-3 text-sm font-bold text-center ${tab === 'afdian' ? 'text-[#5B9CF5] border-b-2 border-[#5B9CF5]' : 'text-gray-400'}`}
        >
          ♥ 爱发电（自动验证）
        </button>
        <button
          onClick={() => setTab('wechat')}
          className={`flex-1 py-3 text-sm font-bold text-center ${tab === 'wechat' ? 'text-[#07C160] border-b-2 border-[#07C160]' : 'text-gray-400'}`}
        >
          微信扫码支付
        </button>
      </div>

      {/* 爱发电 */}
      {tab === 'afdian' && (
        <div className="border border-gray-200 p-6 mb-8">
          <h2 className="text-sm font-black text-[#111] mb-4">♦ 爱发电赞助 · 自动验证</h2>

          <div className="bg-blue-50 border border-blue-100 p-4 mb-4 text-xs text-gray-600 leading-relaxed">
            <p className="font-bold mb-1">⚠️ 重要：支付时请填写备注</p>
            <p>在爱发电支付页面的「备注」中填写你的 NeuroConnect 用户名：</p>
            <p className="text-[#5B9CF5] font-bold text-base mt-1">
              {profile?.anonymous_name || '（请先登录）'}
            </p>
            <p className="mt-1 text-gray-400">系统会根据备注自动匹配你的赞助</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <a
              href={AFDIAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF6B9D] text-white px-10 py-3 font-bold text-sm rounded-full hover:opacity-90 transition"
            >
              ♥ 去爱发电赞助（¥9.9起）
            </a>
            <button
              onClick={handleAfdianVerify}
              disabled={afdianVerifying || afdianActivating || !profile}
              className="w-full max-w-sm py-3 bg-[#5B9CF5] text-white text-sm font-bold hover:bg-[#4A8AE8] disabled:opacity-50"
            >
              {afdianActivating ? '激活中...' : afdianVerifying ? '验证中...' : '我已完成支付，验证激活'}
            </button>
          </div>
        </div>
      )}

      {/* 微信扫码 */}
      {tab === 'wechat' && (
        <div className="border border-gray-200 p-6 mb-8">
          <h2 className="text-sm font-black text-[#111] mb-4">♦ 微信扫码支付</h2>

          <div className="flex flex-col items-center mb-4">
            <div className="w-48 h-48 border border-gray-200 mb-3 flex items-center justify-center">
              <img
                src="/wx-qr.png"
                alt="微信收款码"
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <p className="text-xs text-gray-400">¥9.9/月 · ¥68/年</p>
            <p className="text-xs text-gray-400">扫码支付后填写下方信息自动激活</p>
          </div>

          <div className="space-y-3 max-w-sm mx-auto">
            <input
              placeholder="微信转账单号（微信→我→支付→钱包→账单→复制单号）"
              value={wxTxnId}
              onChange={e => setWxTxnId(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm text-center"
            />
            <button
              onClick={handleWechatActivate}
              disabled={wxSubmitting}
              className="w-full py-3 bg-[#07C160] text-white text-sm font-bold hover:bg-[#06AD56] disabled:opacity-50"
            >
              {wxSubmitting ? '激活中...' : '激活 Premium'}
            </button>
            <p className="text-xs text-gray-400 text-center">确认已支付后点击激活，即时开通</p>
          </div>
        </div>
      )}
    </div>
  );
}
